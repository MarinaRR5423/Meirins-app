/**
 * health-check.js — Meirins daily backend health check
 *
 * Checks:
 *   1. Supabase connectivity
 *   2. recipes table has rows
 *   3. Edge Function translate-program is reachable
 *
 * Exit 0 = all OK
 * Exit 1 = one or more failures → GitHub Actions marks the run as failed
 *          → GitHub sends an email notification to the repo owner
 */

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  process.exit(1);
}

// ── REST helpers ──────────────────────────────────────────────────────────────

async function restGet(path, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${path}${params ? '?' + params : ''}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
  // Count is in Content-Range header: "0-N/TOTAL"
  const range = res.headers.get('content-range');
  const total = range ? parseInt(range.split('/')[1], 10) : body.length;
  return { rows: body, total };
}

// ── Individual checks ─────────────────────────────────────────────────────────

const checks = [];
let errorCount = 0;

function pass(name, detail) {
  checks.push({ status: '✅', name, detail });
}

function fail(name, detail) {
  checks.push({ status: '❌', name, detail });
  errorCount++;
}

async function checkRecipes() {
  const { total } = await restGet('recipes', 'select=id&limit=1');
  if (total === 0) throw new Error('No recipes found in table');
  pass('recipes', `${total} recipes in DB`);
}

async function checkProfiles() {
  // Just verifying the table is accessible (auth is working)
  await restGet('profiles', 'select=id&limit=1');
  pass('profiles table', 'Accessible (auth/RLS OK)');
}

async function checkEdgeFunction() {
  const fnUrl = `${SUPABASE_URL}/functions/v1/translate-program`;
  const res = await fetch(fnUrl, {
    method: 'OPTIONS',
    headers: { apikey: SUPABASE_KEY },
  });
  // OPTIONS should return 200 or 204
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`OPTIONS returned HTTP ${res.status}`);
  }
  pass('translate-program function', `Reachable (OPTIONS ${res.status})`);
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function run(name, fn) {
  try {
    await fn();
  } catch (e) {
    fail(name, e.message);
  }
}

async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🔍 Meirins Health Check — ${date}`);
  console.log('='.repeat(50));

  await run('recipes',         checkRecipes);
  await run('profiles table',  checkProfiles);
  await run('Edge Function',   checkEdgeFunction);

  console.log('\nResults:');
  checks.forEach(c => console.log(`  ${c.status}  ${c.name}: ${c.detail}`));

  if (errorCount > 0) {
    console.error(`\n🚨 ${errorCount} check(s) FAILED — see above for details.`);
    console.error('   Fix: check Supabase dashboard and Edge Function logs.');
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed. Meirins backend is healthy.');
  }
}

main().catch(e => {
  console.error('Fatal error during health check:', e.message);
  process.exit(1);
});
