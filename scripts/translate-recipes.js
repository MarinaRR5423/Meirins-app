#!/usr/bin/env node
/**
 * translate-recipes.js
 *
 * Fetches all recipes from Supabase and translates `ingredients` and `steps`
 * from Spanish to French (fr) and Italian (it) using Google Translate (free, no API key).
 *
 * Usage:
 *   node scripts/translate-recipes.js
 *
 * Output:
 *   scripts/recipes_translations.sql   ← paste in Supabase SQL editor
 *   scripts/translate-progress.json    ← auto-saved; delete to restart from scratch
 */

import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────────

const SUPA_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

const PROGRESS_FILE = path.join(__dirname, 'translate-progress.json');
const OUTPUT_SQL    = path.join(__dirname, 'recipes_translations.sql');

// Delay between requests to avoid rate-limiting by Google
// Separator that is unlikely to appear in culinary text and that Google Translate preserves
const SEP = ' ||| ';

// Delay between each language-translation call (ms)
const DELAY_MS = 1200;

// Max retries on rate limit
const MAX_RETRIES = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Translates an array in ONE request by joining items with SEP.
 * Much less likely to trigger rate limits than one call per item.
 */
async function translateArray(arr, to) {
  if (!arr || arr.length === 0) return arr;
  const joined = arr.map(String).join(SEP);

  let attempt = 0;
  while (true) {
    try {
      const { text: result } = await translate(joined, { from: 'es', to });
      // Split back and trim whitespace artifacts from Google
      const parts = result.split('|||').map(s => s.trim());
      // Guard: if Google changed the number of segments, return the raw array
      if (parts.length !== arr.length) {
        console.warn(`\n    ⚠ Segment count mismatch (${parts.length} vs ${arr.length}) for lang=${to} — using raw split`);
      }
      return parts;
    } catch (err) {
      attempt++;
      if (err.message?.includes('429') || err.message?.includes('Too Many')) {
        const wait = Math.min(5000 * attempt, 30000);
        process.stdout.write(`\n    Rate limited — waiting ${wait / 1000}s (attempt ${attempt})…`);
        await sleep(wait);
        if (attempt >= MAX_RETRIES) throw err;
      } else {
        throw err;
      }
    }
  }
}

// ── Supabase fetch ───────────────────────────────────────────────────────────

async function fetchRecipes() {
  const url = `${SUPA_URL}/rest/v1/recipes?select=id,ingredients,steps&order=display_order`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── SQL generation ───────────────────────────────────────────────────────────

function escapeSql(value) {
  return JSON.stringify(value).replace(/'/g, "''");
}

function buildUpdateStatement(id, ingredientsFr, ingredientsIt, stepsFr, stepsIt) {
  const iFr = escapeSql(ingredientsFr);
  const iIt = escapeSql(ingredientsIt);
  const sFr = escapeSql(stepsFr);
  const sIt = escapeSql(stepsIt);
  return (
    `UPDATE recipes SET\n` +
    `  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '${iFr}'::jsonb), '{it}', '${iIt}'::jsonb),\n` +
    `  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '${sFr}'::jsonb), '{it}', '${sIt}'::jsonb)\n` +
    `WHERE id = '${id}';\n`
  );
}

// ── Progress helpers ─────────────────────────────────────────────────────────

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { done: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Main ─────────────────────────────────────────────────────────────────────

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
    fs.writeSync(
      sqlFd,
      `-- recipes_translations.sql\n-- Generated ${new Date().toISOString()}\n-- Paste into the Supabase SQL editor\n\nBEGIN;\n\n`
    );
  }

  for (let i = 0; i < pending.length; i++) {
    const recipe = pending[i];
    const pct    = (((doneSet.size + i + 1) / allRecipes.length) * 100).toFixed(1);
    process.stdout.write(`[${doneSet.size + i + 1}/${allRecipes.length}] ${pct}%  ${recipe.id}\r`);

    const esIngredients = recipe.ingredients?.es ?? [];
    const esSteps       = recipe.steps?.es ?? [];

    try {
      const ingredientsFr = await translateArray(esIngredients, 'fr');
      await sleep(DELAY_MS);
      const ingredientsIt = await translateArray(esIngredients, 'it');
      await sleep(DELAY_MS);
      const stepsFr = await translateArray(esSteps, 'fr');
      await sleep(DELAY_MS);
      const stepsIt = await translateArray(esSteps, 'it');
      await sleep(DELAY_MS);

      const sql = buildUpdateStatement(recipe.id, ingredientsFr, ingredientsIt, stepsFr, stepsIt);
      fs.writeSync(sqlFd, sql + '\n');

      progress.done.push(recipe.id);
      saveProgress(progress);
    } catch (err) {
      console.error(`\n  Error on ${recipe.id}: ${err.message} — skipping`);
    }
  }

  if (pending.length > 0) {
    fs.writeSync(sqlFd, '\nCOMMIT;\n');
  }
  fs.closeSync(sqlFd);

  console.log(`\n\nDone! SQL written to:\n  ${OUTPUT_SQL}`);
  console.log('\nPega el contenido de recipes_translations.sql en el SQL editor de Supabase.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
