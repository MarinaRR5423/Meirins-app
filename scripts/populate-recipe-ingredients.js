/**
 * populate-recipe-ingredients.js
 *
 * Parsea los ingredientes JSON de la tabla `recipes`, busca cada uno en `foods`
 * por similitud de texto, y genera:
 *   - scripts/ri_matches.json   → todos los matches para revisión
 *   - scripts/ri_insert.sql     → INSERT listo para ejecutar en Supabase
 *   - scripts/ri_unmatched.txt  → ingredientes sin match para curación manual
 *
 * Uso: node scripts/populate-recipe-ingredients.js
 */

const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
};

async function supa(table, params = {}) {
  const url = new URL(`${SUPA_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: H });
  if (!res.ok) throw new Error(`${table}: ${await res.text()}`);
  return res.json();
}

// ── Parsear línea de ingrediente ──────────────────────────────────────────────
// Ejemplos:
//   "80g copos de avena"       → {qty:80,  unit:'g',  name:'copos de avena'}
//   "200ml leche de avena"     → {qty:200, unit:'ml', name:'leche de avena'}
//   "1 plátano maduro"         → {qty:1,   unit:'u',  name:'plátano maduro'}
//   "1 cdta semillas de chía"  → {qty:1,   unit:'tsp',name:'semillas de chía'}
//   "½ cdta canela"            → {qty:0.5, unit:'tsp',name:'canela'}
//   "2 huevos"                 → {qty:2,   unit:'u',  name:'huevos'}

const UNIT_MAP = {
  g: 'g', gr: 'g', gramos: 'g',
  kg: 'kg',
  ml: 'ml', cc: 'ml',
  l: 'l', lt: 'l', litro: 'l', litros: 'l',
  cdta: 'tsp', cdtas: 'tsp', cucharadita: 'tsp',
  cda: 'tbsp', cdas: 'tbsp', cucharada: 'tbsp',
  taza: 'cup', tazas: 'cup',
  u: 'u', ud: 'u', unidad: 'u',
};

// Aproximación a gramos para cálculo nutricional
const TO_GRAMS = {
  g: 1, kg: 1000, ml: 1, l: 1000,
  tsp: 5, tbsp: 15, cup: 240, u: 100, // u=100g por defecto
};

function parseFraction(s) {
  if (s === '½' || s === '1/2') return 0.5;
  if (s === '¼' || s === '1/4') return 0.25;
  if (s === '¾' || s === '3/4') return 0.75;
  if (s === '⅓' || s === '1/3') return 0.333;
  if (s === '⅔' || s === '2/3') return 0.667;
  const m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return parseInt(m[1]) / parseInt(m[2]);
  return parseFloat(s) || null;
}

function parseIngredient(line) {
  line = line.trim();

  // Patrón: número+unidad+nombre  ej "80g copos de avena" o "80 g copos de avena"
  let m = line.match(/^([\d½¼¾⅓⅔\/\.]+)\s*([a-zA-ZáéíóúüÁÉÍÓÚÜ]+)?\s+(.+)$/);
  if (m) {
    const qty = parseFraction(m[1]);
    const rawUnit = (m[2] || '').toLowerCase();
    const unit = UNIT_MAP[rawUnit] || (rawUnit ? rawUnit : 'u');
    const name = m[3].trim();
    const qty_g = qty * (TO_GRAMS[unit] || 100);
    return { qty, unit, name, qty_g };
  }

  // Sin cantidad: solo nombre
  return { qty: 1, unit: 'u', name: line, qty_g: 100 };
}

// ── Normalizar nombre para búsqueda en USDA ───────────────────────────────────
// USDA está en inglés; mapa básico de ES→EN para los más comunes
const ES_EN = {
  // Cereales y harinas
  'copos de avena': 'oats rolled', 'avena': 'oats', 'leche de avena': 'oat milk',
  'harina de avena': 'oat flour', 'harina': 'flour wheat', 'harina integral': 'whole wheat flour',
  'arroz integral': 'brown rice', 'arroz': 'rice white', 'quinoa': 'quinoa',
  'pan': 'bread whole wheat', 'pasta': 'pasta', 'couscous': 'couscous',
  'pan de centeno': 'rye bread', 'tortilla de maíz': 'tortilla corn',
  // Frutas
  'plátano': 'banana raw', 'manzana': 'apple raw', 'naranja': 'orange raw',
  'limón': 'lemon raw', 'fresas': 'strawberries raw', 'fresa': 'strawberries raw',
  'arándanos': 'blueberries raw', 'frambuesas': 'raspberries raw',
  'frutos rojos': 'mixed berries', 'mango': 'mango raw', 'piña': 'pineapple raw',
  'pera': 'pear raw', 'uvas': 'grapes raw', 'melón': 'cantaloupe raw',
  'aguacate': 'avocado raw', 'dátil': 'dates', 'dátiles': 'dates',
  'higos': 'figs raw', 'ciruela': 'plum raw', 'kiwi': 'kiwi raw',
  // Verduras
  'espinacas': 'spinach raw', 'espinacas baby': 'spinach raw',
  'brócoli': 'broccoli raw', 'zanahoria': 'carrots raw',
  'tomate': 'tomatoes raw', 'cebolla': 'onions raw', 'ajo': 'garlic raw',
  'pimiento': 'sweet pepper raw', 'pimiento rojo': 'red pepper raw',
  'pepino': 'cucumber raw', 'lechuga': 'lettuce raw', 'rúcula': 'arugula raw',
  'col': 'cabbage raw', 'col kale': 'kale raw', 'kale': 'kale raw',
  'boniato': 'sweet potato raw', 'batata': 'sweet potato raw',
  'patata': 'potato raw', 'calabacín': 'zucchini raw', 'berenjena': 'eggplant raw',
  'apio': 'celery raw', 'remolacha': 'beet raw', 'coliflor': 'cauliflower raw',
  'champiñones': 'mushrooms raw', 'espárragos': 'asparagus raw',
  'judías verdes': 'green beans raw', 'guisantes': 'peas raw',
  'maíz': 'corn sweet raw', 'alcachofa': 'artichoke raw',
  // Proteínas animales
  'pechuga de pollo': 'chicken breast raw', 'pollo': 'chicken breast raw',
  'muslo de pollo': 'chicken thigh raw', 'pavo': 'turkey breast raw',
  'salmón': 'salmon raw', 'atún': 'tuna canned water',
  'sardinas': 'sardines canned', 'bacalao': 'cod raw', 'gambas': 'shrimp raw',
  'merluza': 'hake raw', 'dorada': 'sea bream raw',
  'ternera': 'beef ground raw', 'carne picada': 'beef ground raw',
  'huevo': 'egg whole raw', 'huevos': 'egg whole raw', 'clara de huevo': 'egg white raw',
  // Lácteos
  'leche': 'milk whole', 'leche desnatada': 'milk nonfat',
  'yogur griego': 'yogurt greek plain', 'yogur': 'yogurt plain',
  'queso cottage': 'cottage cheese', 'queso': 'cheese cheddar',
  'queso fresco': 'cheese fresh', 'mantequilla': 'butter',
  'kéfir': 'kefir', 'nata': 'cream heavy',
  // Legumbres
  'lentejas': 'lentils cooked', 'garbanzos': 'chickpeas cooked',
  'alubias': 'beans black cooked', 'judías': 'beans cooked',
  'edamame': 'edamame cooked', 'tofu': 'tofu firm', 'tempeh': 'tempeh',
  // Frutos secos y semillas
  'nueces': 'walnuts', 'almendras': 'almonds', 'cacahuetes': 'peanuts',
  'anacardos': 'cashews', 'pistachos': 'pistachios',
  'semillas de chía': 'chia seeds', 'chía': 'chia seeds',
  'semillas de lino': 'flaxseed', 'semillas de girasol': 'sunflower seeds',
  'semillas de calabaza': 'pumpkin seeds', 'tahini': 'tahini',
  'mantequilla de cacahuete': 'peanut butter', 'coco rallado': 'coconut shredded',
  // Aceites y grasas
  'aceite de oliva': 'olive oil', 'aceite de coco': 'coconut oil', 'aceite': 'vegetable oil',
  // Endulzantes
  'miel': 'honey', 'sirope de arce': 'maple syrup', 'sirope arce': 'maple syrup',
  'azúcar': 'sugar white', 'azúcar moreno': 'sugar brown', 'stevia': 'stevia',
  'sirope de agave': 'agave syrup',
  // Lácteos vegetales
  'leche de coco': 'coconut milk', 'leche de almendra': 'almond milk',
  'leche de soja': 'soy milk',
  // Proteínas en polvo
  'proteína de suero': 'whey protein', 'proteína': 'protein powder whey',
  // Especias y condimentos
  'canela': 'cinnamon ground', 'cúrcuma': 'turmeric ground', 'jengibre': 'ginger ground',
  'pimienta': 'black pepper ground', 'comino': 'cumin ground',
  'pimentón': 'paprika', 'pimentón ahumado': 'smoked paprika',
  'orégano': 'oregano dried', 'romero': 'rosemary dried',
  'sal': 'salt table', 'vinagre': 'vinegar apple cider',
  'vinagre blanco': 'vinegar white', 'mostaza': 'mustard',
  'salsa de soja': 'soy sauce', 'levadura nutricional': 'nutritional yeast',
  'levadura': 'yeast baking', 'levadura química': 'baking powder',
  'bicarbonato': 'baking soda',
  // Cacao y chocolate
  'cacao': 'cocoa powder', 'chocolate negro': 'chocolate dark',
  'cacao puro': 'cocoa powder unsweetened',
  // Otros
  'caldo de pollo': 'chicken broth', 'caldo vegetal': 'vegetable broth',
};

function translateName(name) {
  const lower = name.toLowerCase()
    .replace(/^(el |la |los |las |un |una |unos |unas )/, '')
    .replace(/\bmaduro\b|\bfrescos?\b|\bcocido\b|\bcrudo\b|\bnatural\b|\blight\b/g, '')
    .replace(/\s+/g, ' ').trim();

  // Busca coincidencia exacta primero
  if (ES_EN[lower]) return ES_EN[lower];

  // Busca coincidencia parcial (primer token)
  for (const [es, en] of Object.entries(ES_EN)) {
    if (lower.includes(es)) return en;
  }

  // Devuelve el nombre original (puede ser inglés ya)
  return lower;
}

// ── Buscar en foods por texto ─────────────────────────────────────────────────
// Prioriza foundation_food > sr_legacy_food, excluye branded
async function searchFoods(query, limit = 5) {
  if (!query || query.length < 2) return [];
  try {
    // Buscar primero en foundation + sr_legacy (los más fiables)
    const url = new URL(`${SUPA_URL}/rest/v1/foods`);
    url.searchParams.set('select', 'fdc_id,description,data_type,category,kcal,protein_g,carbs_g,fat_g');
    url.searchParams.set('description', `ilike.*${query}*`);
    url.searchParams.set('data_type', 'in.(foundation_food,sr_legacy_food)');
    url.searchParams.set('limit', String(limit * 3)); // traer más para luego ordenar
    const res = await fetch(url.toString(), { headers: H });
    if (!res.ok) return [];
    const data = await res.json();
    // Ordenar: foundation primero, luego sr_legacy; preferir descripciones más cortas (menos procesadas)
    return data
      .sort((a, b) => {
        if (a.data_type === 'foundation_food' && b.data_type !== 'foundation_food') return -1;
        if (b.data_type === 'foundation_food' && a.data_type !== 'foundation_food') return 1;
        return a.description.length - b.description.length;
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ── Mapa de correcciones manuales: en_search → fdc_id correcto ───────────────
// Para los casos donde el auto-match falla sistemáticamente
const MANUAL_OVERRIDES = {
  // en_search_keyword → fdc_id correcto
  'egg':        171287, // Egg, whole, raw, fresh
  'eggplant':   null,   // bloquear eggplant como match de egg
  'chicken':    171047, // Chicken, broilers or fryers, meat and skin, raw
  'butter':     173410, // Butter, salted
  'salmon':     173686, // Fish, salmon, Atlantic, wild, raw
  'milk':       null,   // dejar sin match (búsqueda "milk" da patatas)
  'oats':       168878, // usaremos quinoa cooked como proxy... no, mejor buscar oats
  'cinnamon':   171320, // Spices, cinnamon, ground
  'sugar':      169655, // Sugars, granulated
  'flour':      168893, // Wheat flour, whole-grain
  'shrimp':     171972, // Crustaceans, shrimp, canned (100kcal, closest to raw)
  'quinoa':     168917, // Quinoa, cooked
  'beef':       168652, // Beef, ground, 70% lean, raw
  'tofu':       172448, // Tofu, firm
  'turkey':     172876, // Turkey, breast, raw
  'cream':      null,   // dejar sin match (foundation_food no tiene kcal)
  'coconut':    171412, // Oil, coconut (para aceite de coco)
  'vegetable':  172370, // Oil, vegetable, soybean
  'rice':       168877, // Rice, white, long-grain, raw
  'corn':       168398, // Corn, sweet, yellow, frozen
  'blueberries':171711, // Blueberries, raw
  'mixed':      171711, // mixed berries → blueberries como proxy
  'pumpkin':    2515380,// Seeds, pumpkin seeds, raw
  'lemon':      167747, // Lemon juice, raw
  'salt':       null,   // sal no tiene entrada directa en SR Legacy, omitir
  'tomatoes':   null,   // "Tomato, raw" no existe en SR Legacy con ese nombre, omitir
  'smoked':     null,   // smoked paprika → omitir (fish,cisco,smoked es incorrecto)
  'snacks':     null,   // bloquear cualquier match que empiece con Snacks
};

// Blocklist: descripciones USDA que nunca deben ser match
const USDA_BLOCKLIST = [
  'Eggplant',        // egg → eggplant
  'Buttermilk',      // butter → buttermilk biscuits
  'BUTTERFINGER',    // butter → candy
  'salmonberries',   // salmon → salmonberries
  'Babyfood',        // mixed berries → babyfood
  'Potatoes, mashed',// milk → mashed potatoes
  'Candies',         // milk/yogurt → candies
  'Margarine',       // butter/oil → margarine
  'fast food',       // turkey → fast food sub
  'SUBWAY',
  'APPLEBEE',
  'DENNY',
  'CRACKER BARREL',
  'Oscar Mayer',
  'Shake, fast',     // hake → shake
  'Frijoles',        // rojo → refried beans (keep only if explicitly searching beans)
  'Snacks, shrimp cracker',
  'Snacks, tortilla',
  'Fish, cisco, smoked', // smoked paprika → cisco
  'Bologna',         // beef → bologna
  'Chicken, meatless', // chicken → meatless fake chicken
  'Tostada shells',  // corn → tostada
  'Cereals ready-to-eat', // oats → breakfast cereals
  'Breakfast bars',
  'Ice creams',
  'Tofu yogurt',     // tofu → tofu yogurt
  'Flour, quinoa',   // quinoa → flour
  'Buckwheat',       // oats → buckwheat
  'Potato flour',    // flour → potato flour
  'Applesauce',
  'Sweet Potatoes, french fried',
  'Pretzels',
];

function isBlocklisted(description) {
  if (!description) return true;
  const d = description.toLowerCase();
  return USDA_BLOCKLIST.some(b => d.includes(b.toLowerCase()));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Populate recipe_ingredients ===\n');

  // 1. Cargar todas las recetas con ingredientes
  console.log('1/4 Cargando recetas...');
  const recipes = await supa('recipes', {
    select: 'id,title,ingredients',
    limit: '1000',
    order: 'display_order',
  });
  console.log(`   ${recipes.length} recetas`);

  // 2. Parsear ingredientes
  console.log('2/4 Parseando ingredientes...');
  const parsed = [];
  for (const recipe of recipes) {
    const ingredients = recipe.ingredients?.es || [];
    ingredients.forEach((line, i) => {
      const p = parseIngredient(line);
      parsed.push({
        recipe_id: recipe.id,
        recipe_title: recipe.title?.es || recipe.id,
        sort_order: i,
        raw: line,
        ...p,
      });
    });
  }
  console.log(`   ${parsed.length} ingredientes parseados`);

  // 3. Buscar cada ingrediente en foods (con caché para evitar repeticiones)
  console.log('3/4 Buscando en USDA foods...');
  const cache = {};
  const results = [];
  const unmatched = [];
  let matched = 0;
  let total = parsed.length;

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (i % 50 === 0) process.stdout.write(`   ${i}/${total}...\r`);

    const enName = translateName(p.name);
    const searchTerm = enName.split(' ')[0];
    const cacheKey = searchTerm;

    if (!cache[cacheKey]) {
      // Comprobar override manual primero
      if (searchTerm in MANUAL_OVERRIDES) {
        const fdc = MANUAL_OVERRIDES[searchTerm];
        if (fdc) {
          // Buscar el fdc_id concreto
          try {
            const url = new URL(`${SUPA_URL}/rest/v1/foods`);
            url.searchParams.set('select', 'fdc_id,description,data_type,category,kcal,protein_g,carbs_g,fat_g');
            url.searchParams.set('fdc_id', `eq.${fdc}`);
            const res = await fetch(url.toString(), { headers: H });
            cache[cacheKey] = await res.json();
          } catch { cache[cacheKey] = []; }
        } else {
          cache[cacheKey] = []; // null override = bloquear
        }
      } else {
        const hits = await searchFoods(searchTerm, 8);
        // Filtrar blocklist
        const filtered = hits.filter(h => !isBlocklisted(h.description));
        const hits2 = filtered.length === 0 ? await searchFoods(p.name.split(' ')[0], 5) : [];
        const filtered2 = hits2.filter(h => !isBlocklisted(h.description));
        cache[cacheKey] = filtered.length > 0 ? filtered : filtered2;
      }
    }

    const hits = cache[cacheKey];
    const best = hits[0] || null;

    results.push({
      recipe_id: p.recipe_id,
      recipe_title: p.recipe_title,
      sort_order: p.sort_order,
      raw: p.raw,
      parsed_name: p.name,
      en_search: enName,
      qty_g: p.qty_g,
      match: best ? {
        fdc_id: best.fdc_id,
        description: best.description,
        category: best.category,
        kcal_per100: best.kcal,
        kcal_total: best.kcal ? Math.round(p.qty_g / 100 * best.kcal) : null,
      } : null,
      alternatives: hits.slice(1).map(h => ({ fdc_id: h.fdc_id, description: h.description })),
      confidence: best ? scoreMatch(enName, best.description) : 0,
    });

    if (best) matched++;
    else unmatched.push(`[${p.recipe_title}] ${p.raw}  →  buscado: "${enName}"`);
  }

  console.log(`\n   ${matched}/${total} ingredientes con match (${Math.round(matched/total*100)}%)`);

  // 4. Escribir outputs
  console.log('4/4 Escribiendo archivos...');

  // JSON completo para revisión
  fs.writeFileSync(
    path.join(__dirname, 'ri_matches.json'),
    JSON.stringify(results, null, 2)
  );

  // SQL de INSERT para los matches con confianza alta (> 0.3)
  const HIGH_CONF = results.filter(r => r.match && r.confidence >= 0.3);
  const LOW_CONF  = results.filter(r => r.match && r.confidence < 0.3);

  const inserts = HIGH_CONF.map(r =>
    `  ('${r.recipe_id}', ${r.match.fdc_id}, '${esc(r.raw)}', ${r.qty_g}, ${r.sort_order})`
  ).join(',\n');

  const sql = `-- Auto-generado por populate-recipe-ingredients.js
-- ${HIGH_CONF.length} ingredientes con confianza alta (≥0.3)
-- ${LOW_CONF.length} ingredientes con confianza baja → revisar ri_matches.json
-- ${unmatched.length} ingredientes sin match → revisar ri_unmatched.txt

INSERT INTO recipe_ingredients (recipe_id, fdc_id, display_name, quantity_g, sort_order)
VALUES
${inserts}
ON CONFLICT DO NOTHING;
`;

  fs.writeFileSync(path.join(__dirname, 'ri_insert.sql'), sql);

  // TXT de no-matches para curación
  fs.writeFileSync(
    path.join(__dirname, 'ri_unmatched.txt'),
    `INGREDIENTES SIN MATCH (${unmatched.length})\n${'─'.repeat(60)}\n` +
    unmatched.join('\n')
  );

  console.log(`
✅ Listo!
   ri_matches.json  → ${results.length} ingredientes con matches para revisar
   ri_insert.sql    → ${HIGH_CONF.length} INSERTs listos (confianza alta)
   ri_unmatched.txt → ${unmatched.length} ingredientes sin match

Próximos pasos:
   1. Revisar ri_matches.json para los ${LOW_CONF.length} matches de baja confianza
   2. Ejecutar ri_insert.sql en Supabase SQL Editor
   3. Curar manualmente ri_unmatched.txt
`);
}

function scoreMatch(query, description) {
  if (!description) return 0;
  const q = query.toLowerCase().split(' ');
  const d = description.toLowerCase();
  const hits = q.filter(w => w.length > 2 && d.includes(w));
  return hits.length / q.length;
}

function esc(s) {
  return (s || '').replace(/'/g, "''");
}

main().catch(console.error);
