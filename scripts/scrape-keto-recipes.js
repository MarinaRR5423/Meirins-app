/**
 * scrape-keto-recipes.js
 * Extrae recetas de dietaketogratis.com (solo español)
 * y las guarda en scripts/keto-recipes-raw.json
 *
 * Uso: node scripts/scrape-keto-recipes.js
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SITEMAPS = [
  'https://dietaketogratis.com/post-sitemap.xml',
  'https://dietaketogratis.com/post-sitemap2.xml',
];
const OUT_FILE = path.join(__dirname, 'keto-recipes-raw.json');
const DELAY_MS = 600; // pausa entre páginas

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Fetch con retry ───────────────────────────────────────────────────────────
async function fetchHtml(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; recipe-scraper/1.0)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(2000 * (i + 1));
    }
  }
}

// ── Extraer URLs del sitemap XML ──────────────────────────────────────────────
async function getUrlsFromSitemap(sitemapUrl) {
  const html = await fetchHtml(sitemapUrl);
  const $ = cheerio.load(html, { xmlMode: true });
  const urls = [];
  $('loc').each((_, el) => {
    const u = $(el).text().trim();
    if (u.includes('/recetas-keto/') || u.includes('/baja-en-carbohidratos/')) {
      urls.push(u);
    }
  });
  return urls;
}

// ── Parsear una página de receta ──────────────────────────────────────────────
function parseRecipe(html, url) {
  const $ = cheerio.load(html);

  // Título
  const title = $('h1').first().text().trim()
    || $('title').text().replace('| Dieta Keto Gratis', '').trim();

  // Descripción — primer párrafo de la entrada (antes de los ingredientes)
  let description = '';
  const articleParagraphs = $('article p, .entry-content p');
  articleParagraphs.each((_, el) => {
    const txt = $(el).text().trim();
    if (txt.length > 80 && !description) description = txt;
  });

  // Tiempos y porciones
  let prepTime = '', cookTime = '', totalTime = '', servings = '';
  const bodyText = $('body').text();

  const prepMatch = bodyText.match(/Tiempo de preparaci[oó]n[\s\S]{0,20}?(\d+\s*(?:min|hora|h))/i);
  if (prepMatch) prepTime = prepMatch[1].trim();

  const cookMatch = bodyText.match(/Tiempo de cocci[oó]n[\s\S]{0,20}?(\d+\s*(?:min|hora|h))/i);
  if (cookMatch) cookTime = cookMatch[1].trim();

  const totalMatch = bodyText.match(/Tiempo Total[\s\S]{0,20}?(\d+\s*(?:min|hora|h))/i);
  if (totalMatch) totalTime = totalMatch[1].trim();

  const servMatch = bodyText.match(/Porciones[\s\S]{0,10}?(\d+)/i);
  if (servMatch) servings = servMatch[1].trim();

  // Imagen principal
  let image = '';
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) image = ogImage;

  // ── Ingredientes ──────────────────────────────────────────────────────────
  // Buscar sección de ingredientes
  const ingredients = [];
  let inIngredients = false;
  let inSteps = false;

  // Estrategia: recorrer todos los elementos y detectar secciones por headings
  $('article *').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().trim();

    if (!text) return;

    // Detectar inicio de sección ingredientes
    if ((tag === 'h2' || tag === 'h3' || tag === 'strong') &&
        /ingredientes/i.test(text)) {
      inIngredients = true;
      inSteps = false;
      return;
    }

    // Detectar inicio de sección pasos
    if ((tag === 'h2' || tag === 'h3' || tag === 'strong') &&
        /c[oó]mo preparar|preparaci[oó]n|instrucciones|elaboraci[oó]n/i.test(text)) {
      inIngredients = false;
      inSteps = true;
      return;
    }

    // Subsecciones dentro de ingredientes (ej: "Base de brócoli", "Toppings")
    if (inIngredients && (tag === 'h3' || tag === 'h4' || tag === 'strong') &&
        !/(ingredientes|porciones|tiempo)/i.test(text) && text.length < 60) {
      // es un sub-título de grupo, lo añadimos como separador
      if (text !== title) ingredients.push(`[${text}]`);
      return;
    }

    // Recoger items de lista en sección ingredientes
    if (inIngredients && (tag === 'li')) {
      if (text && text.length < 200 && !/(imprimir|print|ver m[aá]s)/i.test(text)) {
        ingredients.push(text);
      }
    }
  });

  // ── Pasos ─────────────────────────────────────────────────────────────────
  const steps = [];
  let stepInProgress = false;

  $('article *').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().trim();

    if (!text) return;

    if ((tag === 'h2' || tag === 'h3') &&
        /c[oó]mo preparar|preparaci[oó]n|instrucciones|elaboraci[oó]n/i.test(text)) {
      stepInProgress = true;
      return;
    }

    // Parar si llegamos a otra sección
    if (stepInProgress && (tag === 'h2' || tag === 'h3') &&
        !/c[oó]mo preparar|paso|step/i.test(text)) {
      stepInProgress = false;
      return;
    }

    if (stepInProgress && tag === 'p') {
      const cleaned = text.replace(/^\d+\s*\.?\s*/, '').trim();
      if (cleaned.length > 20 && !/(imprimir|print|ver m[aá]s)/i.test(cleaned)) {
        steps.push(cleaned);
      }
    }
  });

  // Fallback: si no encontramos ingredientes con el método anterior, buscar listas
  if (ingredients.length === 0) {
    $('ul li').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt && txt.length < 200) ingredients.push(txt);
    });
  }

  // Fallback pasos: buscar ol li
  if (steps.length === 0) {
    $('ol li').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt && txt.length > 20) steps.push(txt);
    });
  }

  // Generar ID desde URL
  const id = url
    .replace(/https?:\/\/dietaketogratis\.com\/(recetas-keto\/|baja-en-carbohidratos\/)/, '')
    .replace(/\/$/, '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/^receta_/, '')
    .slice(0, 60);

  return {
    id,
    source_url: url,
    title: { es: title },
    description: { es: description },
    ingredients: { es: ingredients },
    steps: { es: steps },
    prep_time: prepTime,
    cook_time: cookTime,
    total_time: totalTime,
    servings,
    image,
    diet_type: 'keto',
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📋  Obteniendo URLs de sitemaps…');

  let allUrls = [];
  for (const sm of SITEMAPS) {
    const urls = await getUrlsFromSitemap(sm);
    console.log(`   ${sm.split('/').pop()}: ${urls.length} URLs`);
    allUrls = allUrls.concat(urls);
  }

  // Quitar duplicados
  allUrls = [...new Set(allUrls)];
  console.log(`✅  Total URLs: ${allUrls.length}\n`);

  // Cargar progreso anterior si existe
  let results = [];
  let processedUrls = new Set();
  if (fs.existsSync(OUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    processedUrls = new Set(results.map(r => r.source_url));
    console.log(`🔄  Retomando — ya procesadas: ${results.length}\n`);
  }

  const pending = allUrls.filter(u => !processedUrls.has(u));
  console.log(`⏳  Pendientes: ${pending.length}\n`);

  let errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const url = pending[i];
    try {
      const html = await fetchHtml(url);
      const recipe = parseRecipe(html, url);
      results.push(recipe);

      // Guardar cada 20 recetas
      if ((i + 1) % 20 === 0 || i === pending.length - 1) {
        fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
      }

      process.stdout.write(`\r  ${i + 1}/${pending.length} — ${recipe.title.es.slice(0, 50)}`);
      await sleep(DELAY_MS);

    } catch (err) {
      errors++;
      console.error(`\n❌  ${url}: ${err.message}`);
      await sleep(2000);
    }
  }

  // Guardar resultado final
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

  console.log(`\n\n🎉  Listo. ${results.length} recetas extraídas. Errores: ${errors}`);
  console.log(`📁  Guardado en: ${OUT_FILE}`);

  // Stats
  const withIngs = results.filter(r => r.ingredients.es.length > 0).length;
  const withSteps = results.filter(r => r.steps.es.length > 0).length;
  console.log(`   Con ingredientes: ${withIngs}/${results.length}`);
  console.log(`   Con pasos: ${withSteps}/${results.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
