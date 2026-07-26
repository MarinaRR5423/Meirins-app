/**
 * run_sql_file.js — ejecuta un archivo SQL con múltiples sentencias en Supabase
 * Uso: node scripts/run_sql_file.js <archivo.sql>
 */
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const DB_URL   = 'postgresql://postgres:Runsiflor1.@db.lpcvkzmfemxziuhdmzpx.supabase.co:5432/postgres';
const sqlFile  = process.argv[2];
if (!sqlFile) { console.error('Uso: node scripts/run_sql_file.js <archivo.sql>'); process.exit(1); }

const content  = fs.readFileSync(sqlFile, 'utf-8');

// Dividir por sentencias (terminan en ;)
const statements = content
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 10 && !s.startsWith('--'));

console.log(`${statements.length} sentencias en ${path.basename(sqlFile)}\n`);

let ok = 0, errors = 0;
for (let i = 0; i < statements.length; i++) {
  const tmpFile = path.join(os.tmpdir(), `stmt_${i}.sql`);
  fs.writeFileSync(tmpFile, statements[i] + ';', 'utf-8');
  try {
    execSync(`npx supabase db query --file "${tmpFile}" --db-url "${DB_URL}"`, { stdio: 'pipe' });
    ok++;
    if (i % 20 === 0) process.stdout.write(`  ${i+1}/${statements.length}...\r`);
  } catch (e) {
    errors++;
    console.error(`\n❌ Sentencia ${i+1}:`, e.stderr?.toString().slice(0,150));
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

console.log(`\n✅ Finalizado: ${ok} OK, ${errors} errores`);
