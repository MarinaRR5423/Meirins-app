/**
 * translate-recipes.mjs
 * Traduce ingredients y steps de recetas al francés e italiano usando DeepL.
 * Sólo actualiza recetas que carezcan de traducción en FR o IT.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DEEPL_API_KEY=... node scripts/translate-recipes.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPL_KEY = process.env.DEEPL_API_KEY;

if (!SUPABASE_KEY || !DEEPL_KEY) {
  console.error('Faltan SUPABASE_SERVICE_ROLE_KEY o DEEPL_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LANGS = ['fr', 'it'];
const DEEPL_LANG_MAP = { fr: 'FR', it: 'IT' };

async function deepl(texts, targetLang) {
  if (!texts || texts.length === 0) return [];

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      source_lang: 'ES',
      target_lang: DEEPL_LANG_MAP[targetLang],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DeepL error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.translations.map(t => t.text);
}

async function translateRecipe(recipe, lang) {
  const ingES = recipe.ingredients?.es ?? [];
  const stepsES = recipe.steps?.es ?? [];

  if (ingES.length === 0 && stepsES.length === 0) return null; // nada que traducir

  const combined = [...ingES, ...stepsES];
  const translated = await deepl(combined, lang);

  const ingT = translated.slice(0, ingES.length);
  const stepsT = translated.slice(ingES.length);

  return { ingT, stepsT };
}

async function main() {
  console.log('Cargando recetas...');
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, ingredients, steps');

  if (error) { console.error(error); process.exit(1); }
  console.log(`Total recetas: ${recipes.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const recipe of recipes) {
    for (const lang of LANGS) {
      const hasIng = recipe.ingredients?.[lang]?.length > 0;
      const hasSteps = recipe.steps?.[lang]?.length > 0;
      if (hasIng && hasSteps) { skipped++; continue; }

      try {
        const result = await translateRecipe(recipe, lang);
        if (!result) { skipped++; continue; }

        const newIngredients = { ...(recipe.ingredients || {}), [lang]: result.ingT };
        const newSteps = { ...(recipe.steps || {}), [lang]: result.stepsT };

        const { error: updateErr } = await supabase
          .from('recipes')
          .update({ ingredients: newIngredients, steps: newSteps })
          .eq('id', recipe.id);

        if (updateErr) throw updateErr;

        const titleStr = typeof recipe.title === 'string' ? recipe.title : (recipe.title?.es || recipe.id);
        console.log(`✓ ${titleStr} [${lang}]`);
        updated++;

        // Pequeña pausa para no saturar DeepL
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        const titleStr = typeof recipe.title === 'string' ? recipe.title : (recipe.title?.es || recipe.id);
        console.error(`✗ ${titleStr} [${lang}]: ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`\nListo: ${updated} traducidas, ${skipped} omitidas, ${failed} errores.`);
}

main();
