/**
 * upload-keto-recipes.js
 * Sube las recetas keto scrapeadas a Supabase.
 * Usa UPSERT para poder re-ejecutar sin duplicar.
 *
 * Uso: node scripts/upload-keto-recipes.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1NzE1NywiZXhwIjoyMDkyMTMzMTU3fQ.2llJ2cqp9pDScpUBNBPTa6OK7mPzHJYp3d0R6A5GvYY';
const DATA_FILE = path.join(__dirname, 'keto-recipes-raw.json');
const BATCH_SIZE = 50; // upsert en lotes de 50

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseTime(str) {
  if (!str) return null;
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*min/i);
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || null;
}

function mapRecipe(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    ingredients: r.ingredients,
    steps: r.steps,
    prep_time_min: parseTime(r.prep_time),
    cook_time_min: parseTime(r.cook_time),
    servings: r.servings ? parseInt(r.servings) || null : null,
    meal_type: 'lunch',
    display_order: 9000 + Math.floor(Math.random() * 999),
    diets: ['keto'],
    difficulty: 'medium',
    phases: [],
    goals: [],
    good_for: [],
    avoid_for: [],
    contains_allergens: [],
    low_fodmap: false,
    anti_inflammatory: false,
    emoji: '🥑',
  };
}

async function upsertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${res.status}: ${err}`);
  }
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`📦  ${raw.length} recetas a subir en lotes de ${BATCH_SIZE}...\n`);

  const rows = raw.map(mapRecipe);
  let done = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      await upsertBatch(batch);
      done += batch.length;
      process.stdout.write(`\r  ${done}/${rows.length} subidas...`);
      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`\n❌  Error en lote ${i}-${i+BATCH_SIZE}: ${err.message.slice(0,200)}`);
      await sleep(1000);
    }
  }

  console.log(`\n\n🎉  Listo. ${done}/${rows.length} recetas subidas. Errores: ${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
