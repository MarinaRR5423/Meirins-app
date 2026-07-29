/**
 * supabase-repl.js — REPL interactivo para Supabase
 * Ejecutar: node supabase-repl.js
 *
 * Comandos disponibles en el prompt:
 *   tables                          → lista todas las tablas con conteos
 *   from <tabla>                    → SELECT * LIMIT 10
 *   from <tabla> limit <n>          → SELECT * LIMIT n
 *   from <tabla> cols <c1,c2>       → SELECT c1,c2 LIMIT 10
 *   from <tabla> where <col>=<val>  → filtro exacto
 *   from <tabla> search <texto>     → busca texto en columna 'title' o 'name' o 'id'
 *   count <tabla>                   → total de filas
 *   sql <consulta PostgREST>        → query directa en formato PostgREST
 *   exit / quit                     → salir
 */

const readline = require('readline');

const SUPA_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

const KNOWN_TABLES = [
  'recipes', 'workouts', 'diets', 'articles', 'symptom_insights',
  'phase_meta', 'program_content', 'profiles', 'trainer_clients', 'trainers',
  '2.recipes', '3.recipe_ingredients', 'recipe_steps',
  '4.workout_sessions', '6.session_exercises',
];

const H = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
};

async function req(table, params = {}, countOnly = false) {
  const url = new URL(`${SUPA_URL}/rest/v1/${encodeURIComponent(table)}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers = { ...H };
  if (countOnly) { headers['Prefer'] = 'count=exact'; url.searchParams.set('limit', '0'); }
  const res = await fetch(url.toString(), { headers });
  if (countOnly) {
    const cr = res.headers.get('content-range');
    return cr ? cr.split('/')[1] : '?';
  }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || res.statusText); }
  return res.json();
}

function print(data) {
  if (typeof data === 'string') { console.log('  ' + data); return; }
  if (!Array.isArray(data) || data.length === 0) { console.log('  (sin resultados)'); return; }
  console.log(`\n  ${data.length} fila(s):\n`);
  for (const row of data) {
    console.log(JSON.stringify(row, null, 2).split('\n').map(l => '  ' + l).join('\n'));
    console.log('  ─────');
  }
}

async function handle(input) {
  const line = input.trim();
  if (!line) return;

  const parts = line.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // tables
  if (cmd === 'tables') {
    console.log('\n  Tabla                    Filas');
    console.log('  ─────────────────────────────');
    const counts = await Promise.all(KNOWN_TABLES.map(async t => {
      try { return { t, n: await req(t, {}, true) }; }
      catch { return { t, n: '❌' }; }
    }));
    for (const { t, n } of counts) console.log(`  ${t.padEnd(25)}${n}`);
    console.log('');
    return;
  }

  // count <tabla>
  if (cmd === 'count' && parts[1]) {
    const n = await req(parts[1], {}, true);
    console.log(`\n  ${parts[1]}: ${n} filas\n`);
    return;
  }

  // from <tabla> [limit n] [cols c1,c2] [where col=val] [search texto]
  if (cmd === 'from' && parts[1]) {
    const table = parts[1];
    const rest = parts.slice(2);
    const params = { select: '*', limit: '10' };

    for (let i = 0; i < rest.length; i++) {
      const tok = rest[i].toLowerCase();
      if (tok === 'limit' && rest[i+1]) { params.limit = rest[i+1]; i++; }
      else if (tok === 'cols' && rest[i+1]) { params.select = rest[i+1]; i++; }
      else if (tok === 'where' && rest[i+1]) {
        const [col, val] = rest[i+1].split('=');
        params[col] = `eq.${val}`; i++;
      }
      else if (tok === 'search' && rest[i+1]) {
        // busca en columnas de texto comunes
        params['or'] = `(title_es.ilike.*${rest[i+1]}*,title.ilike.*${rest[i+1]}*,name.ilike.*${rest[i+1]}*,id.ilike.*${rest[i+1]}*)`;
        i++;
      }
      else if (tok === 'order' && rest[i+1]) { params['order'] = rest[i+1]; i++; }
    }

    const data = await req(table, params);
    print(data);
    return;
  }

  // sql <postgrest raw params> — e.g.: sql recipes?select=id,title&meal_type=eq.breakfast
  if (cmd === 'sql' && parts[1]) {
    const raw = parts.slice(1).join(' ');
    const [table, qs] = raw.split('?');
    const params = {};
    if (qs) for (const p of qs.split('&')) {
      const [k, v] = p.split('=');
      params[k] = v;
    }
    const data = await req(table.trim(), params);
    print(data);
    return;
  }

  // help
  if (cmd === 'help') {
    console.log(`
  Comandos:
    tables                           lista todas las tablas
    count <tabla>                    total de filas
    from <tabla>                     primeros 10 registros
    from <tabla> limit <n>           primeros n registros
    from <tabla> cols <c1,c2,...>    solo esas columnas
    from <tabla> where <col>=<val>   filtro exacto
    from <tabla> search <texto>      búsqueda de texto libre
    from <tabla> order <col>         ordenar por columna
    sql <tabla>?<params PostgREST>   query directa
    exit / quit                      salir
  `);
    return;
  }

  console.log(`  Comando no reconocido. Escribe "help" para ver los comandos.`);
}

// ── REPL ───────────────────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\n🟢 Supabase REPL — escribe "help" para ver comandos, "tables" para empezar\n');

function prompt() {
  rl.question('supa> ', async (input) => {
    if (['exit', 'quit'].includes(input.trim().toLowerCase())) {
      console.log('  Bye!\n'); rl.close(); return;
    }
    try { await handle(input); }
    catch (e) { console.log(`  ❌ Error: ${e.message}`); }
    prompt();
  });
}

prompt();
