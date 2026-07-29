/**
 * inspect-supabase.js
 * Ejecutar con: node inspect-supabase.js [tabla] [--limit N] [--filter campo=valor]
 *
 * Ejemplos:
 *   node inspect-supabase.js                        → lista todas las tablas con conteos
 *   node inspect-supabase.js recipes                → muestra los primeros 10 registros
 *   node inspect-supabase.js recipes --limit 50     → primeros 50
 *   node inspect-supabase.js recipes --filter meal_type=breakfast
 *   node inspect-supabase.js recipes --cols id,title,meal_type,phases
 *   node inspect-supabase.js recipes --count        → solo el conteo
 */

const SUPA_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

const TABLES = [
  'recipes',
  'workouts',
  'diets',
  'articles',
  'symptom_insights',
  'phase_meta',
  'program_content',
  'profiles',
  'trainer_clients',
  'trainers',
  '2.recipes',
  '3.recipe_ingredients',
  'recipe_steps',
  '4.workout_sessions',
  '6.session_exercises',
];

const HEADERS = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchTable(table, { select = '*', limit = 10, filters = {}, countOnly = false } = {}) {
  const base = `${SUPA_URL}/rest/v1/${encodeURIComponent(table)}`;
  const params = new URLSearchParams();
  params.set('select', select);
  if (!countOnly) params.set('limit', String(limit));
  else params.set('limit', '0');
  for (const [k, v] of Object.entries(filters)) {
    params.set(k, `eq.${v}`);
  }

  const headers = { ...HEADERS };
  if (countOnly) headers['Prefer'] = 'count=exact';

  const res = await fetch(`${base}?${params}`, { headers });

  if (countOnly) {
    const range = res.headers.get('content-range');
    const total = range ? range.split('/')[1] : '?';
    return { count: total };
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: err.message || res.statusText };
  }

  return await res.json();
}

async function listAllTables() {
  console.log('\n📋 TABLAS EN SUPABASE\n');
  const results = await Promise.all(
    TABLES.map(async (t) => {
      const r = await fetchTable(t, { countOnly: true });
      return { table: t, count: r.count ?? r.error ?? '?' };
    })
  );
  const maxLen = Math.max(...results.map(r => r.table.length));
  for (const { table, count } of results) {
    const pad = table.padEnd(maxLen + 2);
    const isError = isNaN(Number(count));
    console.log(`  ${pad} ${isError ? '❌ ' + count : count + ' filas'}`);
  }
  console.log('');
}

async function inspectTable(table, args) {
  const limit = args['--limit'] ? Number(args['--limit']) : 10;
  const cols = args['--cols'] || '*';
  const countOnly = '--count' in args;
  const filters = {};
  if (args['--filter']) {
    const [k, v] = args['--filter'].split('=');
    filters[k] = v;
  }

  console.log(`\n📊 TABLA: ${table}${countOnly ? ' (conteo)' : ` — primeros ${limit}`}\n`);

  const data = await fetchTable(table, { select: cols, limit, filters, countOnly });

  if (countOnly) {
    console.log(`  Total: ${data.count} filas\n`);
    return;
  }

  if (data.error) {
    console.log(`  ❌ Error: ${data.error}\n`);
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.log('  (sin datos o tabla vacía)\n');
    return;
  }

  // Muestra columnas disponibles
  console.log(`  Columnas: ${Object.keys(data[0]).join(', ')}\n`);
  console.log(`  ${data.length} registros:\n`);

  for (const row of data) {
    const preview = JSON.stringify(row, null, 2)
      .split('\n')
      .map(l => '  ' + l)
      .join('\n');
    console.log(preview);
    console.log('  ---');
  }
}

// ── main ───────────────────────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const table = rawArgs.find(a => !a.startsWith('--'));
const args = {};
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i].startsWith('--')) {
    args[rawArgs[i]] = rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--') ? rawArgs[i + 1] : true;
  }
}

if (!table) {
  listAllTables();
} else {
  inspectTable(table, args);
}
