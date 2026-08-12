/**
 * translate-recipes.js
 * Traduce los campos faltantes (description FR/IT, ingredients FR, steps FR)
 * usando DeepL Free API y actualiza Supabase directamente.
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/translate-recipes.js
 */

const SUPABASE_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPL_KEY    = 'd651b864-b407-4b94-805a-157693d05411:fx';
const DEEPL_URL    = 'https://api-free.deepl.com/v2/translate';

// Pausa entre recetas (ms) — 2 s para no saturar el plan Free
const DELAY_MS = 2000;

if (!SUPABASE_KEY) {
  console.error('❌  Falta SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// ── DeepL ─────────────────────────────────────────────────────────────────────
// Traduce un array de textos en una sola llamada HTTP
async function translateBatch(texts, targetLang) {
  if (!texts || texts.length === 0) return [];
  const params = new URLSearchParams();
  params.append('source_lang', 'ES');
  params.append('target_lang', targetLang === 'fr' ? 'FR' : 'IT');
  for (const t of texts) params.append('text', t || '');

  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}` },
    body: params,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.translations.map(t => t.text);
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${res.status}: ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function getAllRecipes() {
  return supabaseFetch(
    'recipes?select=id,description,ingredients,steps&limit=500',
    { headers: { 'Prefer': 'count=none' } }
  );
}

async function updateRecipe(id, patch) {
  await supabaseFetch(`recipes?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// ── Lógica principal ──────────────────────────────────────────────────────────
function needsTranslation(recipe) {
  const missingDescFr = !recipe.description?.fr;
  const missingDescIt = !recipe.description?.it;
  const missingIngFr  = !recipe.ingredients?.fr || JSON.stringify(recipe.ingredients.fr) === '[]';
  const missingStepsFr= !recipe.steps?.fr       || JSON.stringify(recipe.steps.fr)       === '[]';
  return missingDescFr || missingDescIt || missingIngFr || missingStepsFr;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('📥  Cargando recetas desde Supabase…');
  const recipes = await getAllRecipes();
  const toProcess = recipes.filter(needsTranslation);
  console.log(`✅  ${recipes.length} recetas totales. ${toProcess.length} necesitan traducción.\n`);

  let done = 0;
  let charCount = 0;

  for (const recipe of toProcess) {
    const patch = {
      description: { ...recipe.description },
      ingredients: { ...recipe.ingredients },
      steps: { ...recipe.steps },
    };
    const srcDesc  = recipe.description?.es || '';
    const srcIngs  = recipe.ingredients?.es || [];
    const srcSteps = recipe.steps?.es       || [];

    const missingDescFr  = !recipe.description?.fr;
    const missingDescIt  = !recipe.description?.it;
    const missingIngFr   = !recipe.ingredients?.fr || JSON.stringify(recipe.ingredients.fr) === '[]';
    const missingStepsFr = !recipe.steps?.fr || JSON.stringify(recipe.steps.fr) === '[]';

    try {
      // ── FR: batch desc + ingredients + steps en una sola llamada ──────────
      if (missingDescFr || missingIngFr || missingStepsFr) {
        const frTexts = [];
        const frMap = { descIdx: -1, ingsStart: -1, stepsStart: -1 };

        if (missingDescFr && srcDesc) {
          frMap.descIdx = frTexts.length;
          frTexts.push(srcDesc);
        }
        if (missingIngFr && srcIngs.length > 0) {
          frMap.ingsStart = frTexts.length;
          frMap.ingsCount = srcIngs.length;
          frTexts.push(...srcIngs);
        }
        if (missingStepsFr && srcSteps.length > 0) {
          frMap.stepsStart = frTexts.length;
          frMap.stepsCount = srcSteps.length;
          frTexts.push(...srcSteps);
        }

        if (frTexts.length > 0) {
          const frResults = await translateBatch(frTexts, 'fr');
          charCount += frTexts.join(' ').length;

          if (frMap.descIdx >= 0) patch.description.fr = frResults[frMap.descIdx];
          if (frMap.ingsStart >= 0) patch.ingredients.fr = frResults.slice(frMap.ingsStart, frMap.ingsStart + frMap.ingsCount);
          if (frMap.stepsStart >= 0) patch.steps.fr = frResults.slice(frMap.stepsStart, frMap.stepsStart + frMap.stepsCount);
        }
      }

      // ── IT: solo description ───────────────────────────────────────────────
      if (missingDescIt && srcDesc) {
        const [itDesc] = await translateBatch([srcDesc], 'it');
        patch.description.it = itDesc;
        charCount += srcDesc.length;
      }

      await updateRecipe(recipe.id, patch);
      done++;
      process.stdout.write(`\r  ${done}/${toProcess.length} — ~${Math.round(charCount / 1000)}K chars usados`);

      // Pausa para no saturar DeepL Free
      await sleep(DELAY_MS);

    } catch (err) {
      console.error(`\n❌  Error en receta ${recipe.id}: ${err.message}`);
      // Pausa extra tras error
      await sleep(DELAY_MS * 3);
    }
  }

  console.log(`\n\n🎉  Listo. ${done}/${toProcess.length} recetas actualizadas. ~${Math.round(charCount / 1000)}K caracteres consumidos.`);
}

main().catch(err => { console.error(err); process.exit(1); });
