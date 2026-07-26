/**
 * import_recipe_ingredients.js
 * Parsea ingredientes del CSV de recetas y los matchea contra el CSV de foods de USDA.
 * Todo en local — sin consultas a Supabase.
 *
 * Ejecuta: node scripts/import_recipe_ingredients.js
 * Genera:  scripts/recipe_ingredients_insert.sql
 */

const fs   = require('fs');
const path = require('path');

const RECIPES_CSV = 'C:\\Users\\marin\\Desktop\\Info Meirins\\recetas_meirins.csv';
const FOODS_SQL   = path.join(__dirname, 'usda_foods_insert.sql');
const OUT         = path.join(__dirname, 'recipe_ingredients_insert.sql');

// ── Conversiones a gramos/ml ──────────────────────────────────────────────────
const UNIT_TO_G = {
  g: 1, ml: 1, kg: 1000, l: 1000,
  cdta: 5, cda: 15, tsp: 5, tbsp: 15, cup: 240,
  ud: 120, uds: 120, unidad: 120, unidades: 120,
};

function parseIngredient(raw) {
  const s = raw.trim()
    .replace('½','0.5').replace('¼','0.25').replace('¾','0.75')
    .replace('⅓','0.33').replace('⅔','0.67');

  const m1 = s.match(/^(\d+\.?\d*)\s*(g|ml|kg|l|cdta|cda|tsp|tbsp|cup|ud|uds)\s+(.+)$/i);
  if (m1) return { qty: parseFloat(m1[1]), unit: m1[2].toLowerCase(), name: m1[3].trim() };

  const m2 = s.match(/^(\d+\.?\d*)(g|ml|kg|l)\s*(.+)$/i);
  if (m2) return { qty: parseFloat(m2[1]), unit: m2[2].toLowerCase(), name: m2[3].trim() };

  const m3 = s.match(/^(\d+\.?\d*)\s+(.+)$/);
  if (m3) return { qty: parseFloat(m3[1]), unit: 'ud', name: m3[2].trim() };

  return { qty: null, unit: null, name: s };
}

function cleanForSearch(name) {
  return name.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\d+%/g, '')
    .replace(/fresh|frozen|raw|cooked|dried|whole|sliced|chopped|diced|minced|ground|plain|natural|organic|extra|virgin/gi, '')
    .replace(/\s+/g, ' ').trim();
}

// ── Cargar foods desde el SQL generado (más rápido que consultar Supabase) ────
// Extraemos (name_en, uuid_placeholder) del SQL de inserción
// Como no tenemos los UUIDs reales aún, usamos name_en como referencia
// y en Supabase hacemos el join por nombre
console.log('Cargando foods desde usda_foods_insert.sql...');
const sqlContent = fs.readFileSync(FOODS_SQL, 'utf-8');
const foodNames = [];
const insertLines = sqlContent.match(/\('([^']+)','([^']+)'/g) || [];
insertLines.forEach(line => {
  const m = line.match(/\('([^']+)','([^']+)'/);
  if (m) foodNames.push(m[2]); // name_en es el segundo campo
});
console.log(`  ${foodNames.length} alimentos cargados`);

// Índice invertido: palabra → lista de nombres
const wordIndex = {};
foodNames.forEach(name => {
  const words = cleanForSearch(name).split(' ').filter(w => w.length > 3);
  words.forEach(w => {
    if (!wordIndex[w]) wordIndex[w] = [];
    wordIndex[w].push(name);
  });
});

function findBestFood(ingredientName) {
  const clean = cleanForSearch(ingredientName);
  const words = clean.split(' ').filter(w => w.length > 3);
  if (!words.length) return null;

  const scores = {};
  words.forEach(w => {
    (wordIndex[w] || []).forEach(food => {
      scores[food] = (scores[food] || 0) + 1;
    });
  });

  let best = null, bestScore = 0;
  for (const [food, score] of Object.entries(scores)) {
    if (score > bestScore) { best = food; bestScore = score; }
  }
  return bestScore >= 1 ? best : null;
}

// ── Parsear CSV ───────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const vals = []; let cur = '', inQ = false;
  for (const c of line) {
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { vals.push(cur); cur = ''; }
    else { cur += c; }
  }
  vals.push(cur);
  return vals;
}

function escape(s) { return (s || '').replace(/'/g, "''"); }

console.log('Leyendo recetas_meirins.csv...');
const lines   = fs.readFileSync(RECIPES_CSV, 'utf-8').replace(/^﻿/, '').split('\n').filter(l => l.trim());
const headers = parseCSVLine(lines[0]);
const idIdx   = headers.indexOf('id');
const ingIdxEs = headers.indexOf('ingredientes_es');
const ingIdxEn = headers.indexOf('ingredientes_en');

const rows = [];
let totalIng = 0, matched = 0;

for (let i = 1; i < lines.length; i++) {
  const vals     = parseCSVLine(lines[i]);
  const recipeId = vals[idIdx];
  if (!recipeId) continue;

  // Usar ingredientes en inglés para matchear con USDA (en inglés)
  const ingsEn = (vals[ingIdxEn] || '').split('|').map(s => s.trim()).filter(Boolean);
  const ingsEs = (vals[ingIdxEs] || '').split('|').map(s => s.trim()).filter(Boolean);

  ingsEn.forEach((rawEn, idx) => {
    totalIng++;
    const rawEs  = ingsEs[idx] || rawEn;
    const parsed = parseIngredient(rawEn);
    const match  = findBestFood(parsed.name);
    const factor = UNIT_TO_G[parsed.unit] || null;
    const qty_g  = (parsed.qty != null && factor != null)
      ? (parsed.qty * factor).toFixed(2)
      : 'NULL';

    if (match) matched++;

    // food_id se resolverá con subquery en el INSERT
    const foodSubquery = match
      ? `(SELECT id FROM foods WHERE name_en = '${escape(match)}' LIMIT 1)`
      : 'NULL';

    rows.push(
      `('${escape(recipeId)}',${foodSubquery},'${escape(rawEs)}',${qty_g},'${escape(String(parsed.qty ?? ''))}','${escape(parsed.unit ?? '')}')`
    );
  });
}

console.log(`  ${totalIng} ingredientes — ${matched} matcheados (${Math.round(matched/totalIng*100)}%)`);

// Dividir en bloques de 200 filas
const CHUNK = 200;
let sql = `-- recipe_ingredients — ${rows.length} filas\n-- Generado ${new Date().toISOString().split('T')[0]}\n\n`;
for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK);
  sql += `INSERT INTO recipe_ingredients (recipe_id, food_id, food_name_raw, quantity_g, quantity_raw, unit_raw) VALUES\n`;
  sql += chunk.join(',\n');
  sql += `\nON CONFLICT DO NOTHING;\n\n`;
}

fs.writeFileSync(OUT, sql, 'utf-8');
const sizeMB = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n✅ ${OUT} — ${sizeMB} KB — ${Math.ceil(rows.length/CHUNK)} bloques`);
