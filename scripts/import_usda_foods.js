/**
 * import_usda_foods.js
 * Lee USDA FoodData Central CSV (SR Legacy + Foundation Foods) en streaming
 * y genera SQL para importar en Supabase (tabla foods).
 *
 * Ejecuta: node scripts/import_usda_foods.js
 * Genera:  scripts/usda_foods_insert.sql
 */

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const DIR     = path.join(__dirname, 'FoodData_Central_csv_2024-10-31');
const OUT     = path.join(__dirname, 'usda_foods_insert.sql');

// Nutriente IDs que queremos
const NID = {
  kcal:      '1008',
  protein_g: '1003',
  carbs_g:   '1005',
  fat_g:     '1004',
  fiber_g:   '1079',
};
const WANTED_NIDS = new Set(Object.values(NID));

function guessCategory(name) {
  const n = name.toLowerCase();
  if (/chicken|beef|pork|turkey|lamb|fish|salmon|tuna|shrimp|prawn|egg|tofu|cod|hake|sardine|anchovy|trout|sea bass|crab|mussel|clam|veal|duck|rabbit|squid|octopus/.test(n)) return 'proteins';
  if (/rice|oat|wheat|bread|pasta|noodle|quinoa|lentil|bean|chickpea|corn|barley|rye|spelt|couscous|flour|cereal|granola|sweet potato|potato|tortilla|cracker/.test(n)) return 'grains_legumes';
  if (/spinach|broccoli|carrot|tomato|lettuce|cucumber|pepper|onion|garlic|celery|zucchini|eggplant|asparagus|kale|arugula|cabbage|cauliflower|leek|mushroom|artichoke|pea |green bean|chard|beet|turnip|radish|fennel/.test(n)) return 'vegetables';
  if (/apple|banana|orange|lemon|strawberr|blueberr|mango|pineapple|grape|peach|pear|cherry|watermelon|melon|avocado|date|fig|plum|apricot|kiwi|raspberry|blackberr|pomegranate|coconut/.test(n)) return 'fruits';
  if (/walnut|almond|cashew|pistachio|hazelnut|peanut|pecan|seed|chia|sesame|sunflower|pumpkin|flax|hemp|pine nut/.test(n)) return 'nuts_seeds';
  return 'pantry';
}

function escape(str) {
  return (str || '').replace(/'/g, "''");
}

async function readCSVStream(filePath, onRow) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    let headers = null;
    rl.on('line', line => {
      if (!line.trim()) return;
      // Split respetando comillas
      const vals = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQ = !inQ; }
        else if (c === ',' && !inQ) { vals.push(cur); cur = ''; }
        else { cur += c; }
      }
      vals.push(cur);

      if (!headers) { headers = vals; return; }
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      onRow(obj);
    });
    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

async function main() {
  // 1. Leer food.csv → mapa fdc_id → descripción (solo SR Legacy + Foundation)
  console.log('1/3 Leyendo food.csv...');
  const foodMap = {};
  await readCSVStream(path.join(DIR, 'food.csv'), row => {
    if (row.data_type === 'sr_legacy_food' || row.data_type === 'foundation_food') {
      foodMap[row.fdc_id] = row.description;
    }
  });
  console.log(`    ${Object.keys(foodMap).length} alimentos`);

  // 2. Leer food_nutrient.csv en streaming → mapa fdc_id → { kcal, protein, ... }
  console.log('2/3 Leyendo food_nutrient.csv (archivo grande, puede tardar ~30s)...');
  const macroMap = {};
  let lineCount = 0;
  await readCSVStream(path.join(DIR, 'food_nutrient.csv'), row => {
    lineCount++;
    if (lineCount % 500000 === 0) process.stdout.write(`    ${(lineCount/1e6).toFixed(1)}M filas...\r`);
    if (!WANTED_NIDS.has(row.nutrient_id)) return;
    if (!foodMap[row.fdc_id]) return;
    if (!macroMap[row.fdc_id]) macroMap[row.fdc_id] = {};
    macroMap[row.fdc_id][row.nutrient_id] = parseFloat(row.amount) || 0;
  });
  console.log(`\n    ${lineCount.toLocaleString()} filas procesadas`);

  // 3. Generar SQL
  console.log('3/3 Generando SQL...');
  const rows = [];
  for (const [fdcId, name] of Object.entries(foodMap)) {
    const m   = macroMap[fdcId] || {};
    const kcal    = m[NID.kcal]      != null ? m[NID.kcal].toFixed(1)      : 'NULL';
    const protein = m[NID.protein_g] != null ? m[NID.protein_g].toFixed(2)  : 'NULL';
    const carbs   = m[NID.carbs_g]   != null ? m[NID.carbs_g].toFixed(2)    : 'NULL';
    const fat     = m[NID.fat_g]     != null ? m[NID.fat_g].toFixed(2)      : 'NULL';
    const fiber   = m[NID.fiber_g]   != null ? m[NID.fiber_g].toFixed(2)    : 'NULL';
    if (kcal === 'NULL' && protein === 'NULL') continue;
    const cat  = guessCategory(name);
    const n    = escape(name);
    rows.push(`('${n}','${n}','${n}','${n}','${cat}',${kcal},${protein},${carbs},${fat},${fiber},'g')`);
  }

  // Dividir en bloques de 500 filas para no superar límites de Supabase
  const CHUNK = 500;
  let sql = `-- USDA FoodData Central SR Legacy + Foundation Foods\n-- ${rows.length} alimentos | generado ${new Date().toISOString().split('T')[0]}\n-- name_es/fr/it = inglés como placeholder (traducir los más usados después)\n\n`;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    sql += `INSERT INTO foods (name_es, name_en, name_fr, name_it, category, kcal, protein_g, carbs_g, fat_g, fiber_g, unit) VALUES\n`;
    sql += chunk.join(',\n');
    sql += `\nON CONFLICT DO NOTHING;\n\n`;
  }

  fs.writeFileSync(OUT, sql, 'utf-8');
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Generado: ${OUT}`);
  console.log(`   ${rows.length} alimentos — ${sizeMB} MB`);
  console.log(`   ${Math.ceil(rows.length / CHUNK)} bloques de ${CHUNK} filas cada uno`);
  console.log('\nPega el SQL en Supabase SQL Editor y ejecuta (puede tardar unos segundos).');
}

main().catch(console.error);
