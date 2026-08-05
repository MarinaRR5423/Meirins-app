#!/usr/bin/env node
/**
 * translate-recipes.js
 *
 * Fetches all recipes from Supabase and translates `ingredients` and `steps`
 * from Spanish to French (fr) and Italian (it) using DeepL API (free tier).
 *
 * Usage:
 *   node scripts/translate-recipes.js
 *
 * Output:
 *   scripts/recipes_translations.sql   ← paste in Supabase SQL editor
 *   scripts/translate-progress.json    ← auto-saved; resumable on interruption
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────────

const SUPA_URL   = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

// La key de DeepL nunca debe estar en el código — pásala como variable de
// entorno: DEEPL_API_KEY=xxx node scripts/translate-recipes.js
const DEEPL_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_KEY) {
  console.error('❌ Falta la variable de entorno DEEPL_API_KEY');
  process.exit(1);
}
// Free-tier endpoint (keys ending in :fx use api-free.deepl.com)
const DEEPL_URL  = 'https://api-free.deepl.com/v2/translate';

const PROGRESS_FILE = path.join(__dirname, 'translate-progress.json');
const OUTPUT_SQL    = path.join(__dirname, 'recipes_translations.sql');

const DELAY_MS = 200; // DeepL free is generous; 200ms is plenty

// ── DeepL translation ─────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Translates an array of strings in ONE DeepL request (texts[] param).
 * DeepL preserves order and returns one translation per input text.
 */
async function translateArray(arr, targetLang) {
  if (!arr || arr.length === 0) return arr;

  const body = new URLSearchParams();
  body.append('source_lang', 'ES');
  body.append('target_lang', targetLang);
  arr.forEach(item => body.append('text', String(item)));

  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.status);
    throw new Error(`DeepL HTTP ${res.status}: ${msg}`);
  }

  const json = await res.json();
  return json.translations.map(t => t.text);
}

// ── Supabase fetch ────────────────────────────────────────────────────────────

async function fetchRecipes() {
  const url = `${SUPA_URL}/rest/v1/recipes?select=id,ingredients,steps&order=display_order`;
  const res = await fetch(url, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── SQL generation ────────────────────────────────────────────────────────────

function escapeSql(value) {
  return JSON.stringify(value).replace(/'/g, "''");
}

function buildUpdateStatement(id, ingredientsFr, ingredientsIt, stepsFr, stepsIt) {
  return (
    `UPDATE recipes SET\n` +
    `  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '${escapeSql(ingredientsFr)}'::jsonb), '{it}', '${escapeSql(ingredientsIt)}'::jsonb),\n` +
    `  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '${escapeSql(stepsFr)}'::jsonb),       '{it}', '${escapeSql(stepsIt)}'::jsonb)\n` +
    `WHERE id = '${id}';\n`
  );
}

// ── Progress ──────────────────────────────────────────────────────────────────

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  return { done: [] };
}

function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching recipes from Supabase…');
  const allRecipes = await fetchRecipes();
  console.log(`Found ${allRecipes.length} recipes.\n`);

  const progress = loadProgress();
  const doneSet  = new Set(progress.done);
  const pending  = allRecipes.filter(r => !doneSet.has(r.id));
  console.log(`Already translated: ${doneSet.size}  |  Pending: ${pending.length}\n`);

  const sqlFd = fs.openSync(OUTPUT_SQL, doneSet.size === 0 ? 'w' : 'a');
  if (doneSet.size === 0) {
    fs.writeSync(sqlFd, `-- recipes_translations.sql\n-- ${new Date().toISOString()}\n\nBEGIN;\n\n`);
  }

  for (let i = 0; i < pending.length; i++) {
    const recipe = pending[i];
    const pct    = (((doneSet.size + i + 1) / allRecipes.length) * 100).toFixed(1);
    process.stdout.write(`\r[${doneSet.size + i + 1}/${allRecipes.length}] ${pct}%  ${recipe.id.padEnd(45)}`);

    const esIngredients = recipe.ingredients?.es ?? [];
    const esSteps       = recipe.steps?.es ?? [];

    try {
      const ingredientsFr = await translateArray(esIngredients, 'FR');
      await sleep(DELAY_MS);
      const ingredientsIt = await translateArray(esIngredients, 'IT');
      await sleep(DELAY_MS);
      const stepsFr = await translateArray(esSteps, 'FR');
      await sleep(DELAY_MS);
      const stepsIt = await translateArray(esSteps, 'IT');
      await sleep(DELAY_MS);

      fs.writeSync(sqlFd, buildUpdateStatement(recipe.id, ingredientsFr, ingredientsIt, stepsFr, stepsIt) + '\n');
      progress.done.push(recipe.id);
      saveProgress(progress);
    } catch (err) {
      process.stdout.write(`\n  ✗ ${recipe.id}: ${err.message}\n`);
    }
  }

  if (pending.length > 0) fs.writeSync(sqlFd, '\nCOMMIT;\n');
  fs.closeSync(sqlFd);

  console.log(`\n\nDone! → ${OUTPUT_SQL}`);
}

main().catch(err => { console.error(err); process.exit(1); });
