/**
 * import-usda-foods.js
 * Extrae alimentos SR Legacy + Foundation + Survey FNDDS de USDA FoodData Central
 * y genera un CSV listo para importar a Supabase.
 *
 * Uso: node scripts/import-usda-foods.js
 * Output: scripts/usda_foods.csv
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE = 'C:\\Users\\marin\\Desktop\\Info Meirins\\FoodData_Central_csv_2024-10-31\\FoodData_Central_csv_2024-10-31';

const FOOD_CSV      = path.join(BASE, 'food.csv');
const NUTRIENT_CSV  = path.join(BASE, 'food_nutrient.csv');
const CATEGORY_CSV  = path.join(BASE, 'food_category.csv');
const OUTPUT_CSV    = path.join(__dirname, 'usda_foods.csv');

// Data types a incluir (excluye branded_food y sub_sample_food)
const KEEP_TYPES = new Set(['sr_legacy_food', 'foundation_food', 'survey_fndds_food']);

// Nutrientes que queremos (nutrient_id → campo en nuestra tabla)
const NUTRIENT_MAP = {
  '1008': 'kcal',           // Energy (KCAL)
  '1003': 'protein_g',      // Protein
  '1005': 'carbs_g',        // Carbohydrate
  '1004': 'fat_g',          // Total fat
  '1079': 'fiber_g',        // Fiber
  '2000': 'sugar_g',        // Sugars
  '1093': 'sodium_mg',      // Sodium
  '1087': 'calcium_mg',     // Calcium
  '1089': 'iron_mg',        // Iron
  '1090': 'magnesium_mg',   // Magnesium
  '1092': 'potassium_mg',   // Potassium
  '1095': 'zinc_mg',        // Zinc
  '1162': 'vitamin_c_mg',   // Vitamin C
  '1175': 'vitamin_b6_mg',  // Vitamin B6
  '1178': 'vitamin_b12_mcg',// Vitamin B12
  '1177': 'folate_mcg',     // Folate
  '1114': 'vitamin_d_mcg',  // Vitamin D
  '1106': 'vitamin_a_mcg',  // Vitamin A
};

const TARGET_NUTRIENTS = new Set(Object.keys(NUTRIENT_MAP));

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  fields.push(current);
  return fields;
}

function csvEscape(val) {
  if (val === null || val === undefined || val === '') return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function readLines(filePath, onLine) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    onLine(line);
  }
}

async function main() {
  console.log('=== USDA Food Import ===\n');

  // 1. Leer categorías
  console.log('1/4 Leyendo categorías...');
  const categories = {}; // id → description
  await readLines(CATEGORY_CSV, (line) => {
    const f = parseCSVLine(line);
    if (f[0] === 'id') return;
    categories[f[0]] = f[2];
  });
  console.log(`   ${Object.keys(categories).length} categorías`);

  // 2. Leer food.csv → filtrar tipos relevantes
  console.log('2/4 Leyendo alimentos (food.csv)...');
  const foods = {}; // fdc_id → {description, data_type, category}
  let skipped = 0;
  await readLines(FOOD_CSV, (line) => {
    const f = parseCSVLine(line);
    if (f[0] === 'fdc_id') return;
    const [fdc_id, data_type, description, food_category_id] = f;
    if (!KEEP_TYPES.has(data_type)) { skipped++; return; }
    foods[fdc_id] = {
      fdc_id,
      description,
      data_type,
      category: categories[food_category_id] || food_category_id || '',
    };
  });
  const foodCount = Object.keys(foods).length;
  console.log(`   ${foodCount} alimentos seleccionados, ${skipped} descartados (branded/etc)`);

  // 3. Leer food_nutrient.csv → extraer solo nutrientes clave para nuestros alimentos
  console.log('3/4 Leyendo nutrientes (food_nutrient.csv, ~1.7GB, puede tardar 2-3 min)...');
  const nutrients = {}; // fdc_id → {kcal, protein_g, ...}
  let rowCount = 0;
  let matchCount = 0;
  await readLines(NUTRIENT_CSV, (line) => {
    rowCount++;
    if (rowCount % 1000000 === 0) process.stdout.write(`   ${(rowCount/1e6).toFixed(1)}M filas...\r`);
    const f = parseCSVLine(line);
    if (f[0] === 'id') return;
    const fdc_id = f[1];
    const nutrient_id = f[2];
    const amount = f[3];
    if (!foods[fdc_id] || !TARGET_NUTRIENTS.has(nutrient_id)) return;
    if (!nutrients[fdc_id]) nutrients[fdc_id] = {};
    const field = NUTRIENT_MAP[nutrient_id];
    nutrients[fdc_id][field] = parseFloat(amount) || 0;
    matchCount++;
  });
  console.log(`\n   ${rowCount.toLocaleString()} filas procesadas, ${matchCount.toLocaleString()} nutrientes extraídos`);

  // 4. Generar CSV
  console.log('4/4 Generando CSV...');
  const FIELDS = [
    'fdc_id', 'description', 'data_type', 'category',
    'kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
    'sugar_g', 'sodium_mg', 'calcium_mg', 'iron_mg',
    'magnesium_mg', 'potassium_mg', 'zinc_mg',
    'vitamin_c_mg', 'vitamin_b6_mg', 'vitamin_b12_mcg',
    'folate_mcg', 'vitamin_d_mcg', 'vitamin_a_mcg',
  ];

  const out = fs.createWriteStream(OUTPUT_CSV, { encoding: 'utf8' });
  out.write(FIELDS.join(',') + '\n');

  let exported = 0;
  for (const [fdc_id, food] of Object.entries(foods)) {
    const n = nutrients[fdc_id] || {};
    const row = FIELDS.map(f => {
      if (f === 'fdc_id') return food.fdc_id;
      if (f === 'description') return csvEscape(food.description);
      if (f === 'data_type') return food.data_type;
      if (f === 'category') return csvEscape(food.category);
      const val = n[f];
      return val !== undefined ? val : '';
    });
    out.write(row.join(',') + '\n');
    exported++;
  }
  out.end();

  console.log(`\n✅ Listo! ${exported} alimentos exportados`);
  console.log(`   Archivo: ${OUTPUT_CSV}`);
  console.log(`\nSQL para crear la tabla en Supabase:\n`);
  console.log(`CREATE TABLE foods (
  fdc_id         integer PRIMARY KEY,
  description    text NOT NULL,
  data_type      text,
  category       text,
  kcal           numeric,
  protein_g      numeric,
  carbs_g        numeric,
  fat_g          numeric,
  fiber_g        numeric,
  sugar_g        numeric,
  sodium_mg      numeric,
  calcium_mg     numeric,
  iron_mg        numeric,
  magnesium_mg   numeric,
  potassium_mg   numeric,
  zinc_mg        numeric,
  vitamin_c_mg   numeric,
  vitamin_b6_mg  numeric,
  vitamin_b12_mcg numeric,
  folate_mcg     numeric,
  vitamin_d_mcg  numeric,
  vitamin_a_mcg  numeric
);

-- Índice para búsqueda de texto
CREATE INDEX idx_foods_description ON foods USING gin(to_tsvector('english', description));`);
}

main().catch(console.error);
