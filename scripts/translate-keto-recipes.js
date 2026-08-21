/**
 * translate-keto-recipes.js
 * Traduce títulos (4 idiomas) + descripciones (hasta agotar ~160K restantes)
 * en keto-recipes-raw.json usando DeepL Free API.
 *
 * Uso: node scripts/translate-keto-recipes.js
 */

const fs = require('fs');
const path = require('path');

const DEEPL_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';
const DATA_FILE = path.join(__dirname, 'keto-recipes-raw.json');
const DELAY_MS  = 1500;

// Presupuesto: 289K total — 129K títulos = ~160K para descripciones
const DESC_BUDGET_CHARS = 155000;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function translateBatch(texts, targetLang) {
  if (!texts.length) return [];
  const params = new URLSearchParams();
  params.append('source_lang', 'ES');
  params.append('target_lang', targetLang);
  for (const t of texts) params.append('text', t || '');
  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}` },
    body: params,
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  return (await res.json()).translations.map(t => t.text);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`📦  ${data.length} recetas cargadas.\n`);

  let charCount = 0;
  let titlesOk = 0;
  let descsOk = 0;
  let descBudgetUsed = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const srcTitle = r.title.es || '';
    const srcDesc  = r.description.es || '';

    const needsTitleEN = !r.title.en;
    const needsTitleFR = !r.title.fr;
    const needsTitleIT = !r.title.it;
    const needsDesc    = !r.description.fr && descBudgetUsed < DESC_BUDGET_CHARS;

    if (!needsTitleEN && !needsTitleFR && !needsTitleIT && !needsDesc) {
      process.stdout.write(`\r  ${i+1}/${data.length} — ya traducida, skip`);
      continue;
    }

    try {
      // ── Títulos: 1 llamada por idioma que falte ────────────────────────
      if (needsTitleEN && srcTitle) {
        const [t] = await translateBatch([srcTitle], 'EN');
        r.title.en = t;
        charCount += srcTitle.length;
      }
      if (needsTitleFR && srcTitle) {
        const [t] = await translateBatch([srcTitle], 'FR');
        r.title.fr = t;
        charCount += srcTitle.length;
      }
      if (needsTitleIT && srcTitle) {
        const [t] = await translateBatch([srcTitle], 'IT');
        r.title.it = t;
        charCount += srcTitle.length;
      }
      if (needsTitleEN || needsTitleFR || needsTitleIT) titlesOk++;

      // ── Descripción FR (hasta agotar presupuesto) ─────────────────────
      if (needsDesc && srcDesc) {
        const [t] = await translateBatch([srcDesc], 'FR');
        r.description.fr = t;
        charCount += srcDesc.length;
        descBudgetUsed += srcDesc.length;
        descsOk++;
      }

      // Guardar cada 20 recetas
      if ((i + 1) % 20 === 0) fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

      process.stdout.write(
        `\r  ${i+1}/${data.length} — ~${Math.round(charCount/1000)}K chars | títulos: ${titlesOk} | descs FR: ${descsOk}/${data.length} (presup: ${Math.round(descBudgetUsed/1000)}K/${Math.round(DESC_BUDGET_CHARS/1000)}K)`
      );

      await sleep(DELAY_MS);

    } catch (err) {
      errors++;
      console.error(`\n❌  [${r.id}] ${err.message}`);
      await sleep(4000);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log(`\n\n🎉  Listo.`);
  console.log(`   Títulos traducidos: ${titlesOk}`);
  console.log(`   Descripciones FR:  ${descsOk}/${data.length}`);
  console.log(`   Total chars usados: ~${Math.round(charCount/1000)}K`);
  console.log(`   Errores: ${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
