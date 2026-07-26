/**
 * run_food_import.js
 * Ejecuta usda_foods_insert.sql bloque a bloque contra Supabase.
 * Uso: node scripts/run_food_import.js
 */
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const DB_URL  = 'postgresql://postgres:Runsiflor1.@db.lpcvkzmfemxziuhdmzpx.supabase.co:5432/postgres';
const SQL_FILE = path.join(__dirname, 'recipe_ingredients_insert.sql');

const content = fs.readFileSync(SQL_FILE, 'utf-8');

// Dividir por bloques (cada INSERT ... ON CONFLICT DO NOTHING;)
const blocks = content
  .split(/\n(?=INSERT INTO)/)
  .map(b => b.trim())
  .filter(b => b.startsWith('INSERT INTO'));

console.log(`${blocks.length} bloques a ejecutar...\n`);

let ok = 0, errors = 0;
for (let i = 0; i < blocks.length; i++) {
  const tmpFile = path.join(os.tmpdir(), `foods_block_${i}.sql`);
  fs.writeFileSync(tmpFile, blocks[i], 'utf-8');
  try {
    execSync(
      `npx supabase db query --file "${tmpFile}" --db-url "${DB_URL}"`,
      { stdio: 'pipe' }
    );
    ok++;
    process.stdout.write(`✅ Bloque ${i + 1}/${blocks.length}\r`);
  } catch (e) {
    errors++;
    console.error(`\n❌ Bloque ${i + 1} falló:`, e.stderr?.toString().slice(0, 200));
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

console.log(`\n\nFinalizado: ${ok} bloques OK, ${errors} errores`);
