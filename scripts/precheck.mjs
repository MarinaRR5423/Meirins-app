/**
 * Blumm pre-build checker
 * 1. Sintaxis real via @babel/parser (JSX + TS)
 * 2. Duplicados de declaración en mismo scope
 * 3. Patrones no-brand (colores, fontWeight)
 * Uso: node scripts/precheck.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const babelParser = require('@babel/parser');

const ROOT = process.cwd();
const SRC_DIRS = ['src'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Variables que son válidas repetidas (callbacks de map, loops, etc.)
const IGNORE_NAMES = new Set([
  'i','j','k','n','x','y','e','err','key','val','item','entry','el','node',
  'child','r','g','b','a','o','p','q','v','w','s','t','m','d','f','c','_',
  'prev','next','acc','cur','res','req','ctx','ref','cb','fn','id','idx',
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (EXTENSIONS.some(e => full.endsWith(e))) files.push(full);
  }
  return files;
}

// ── 1. Sintaxis real con Babel ────────────────────────────────────────────────
function checkSyntax(file, src) {
  const ext = extname(file);
  const isTS = ext === '.ts' || ext === '.tsx';
  try {
    babelParser.parse(src, {
      sourceType: 'module',
      plugins: ['jsx', isTS ? 'typescript' : 'flow', 'decorators-legacy'],
      errorRecovery: false,
    });
    return [];
  } catch (e) {
    return [`  ❌ SyntaxError line ${e.loc?.line ?? '?'}: ${e.reasonCode ?? e.message.split('\n')[0]}`];
  }
}

// ── 2. Duplicate declarations en mismo scope ──────────────────────────────────
// Usa un stack de scopes. Cada { abre scope, cada } lo cierra.
// Solo marca error si el mismo nombre aparece dos veces en el MISMO scope nivel.
function checkDuplicates(src) {
  const errors = [];
  const lines = src.split('\n');
  const DECL_RE = /^\s*(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/;

  // Stack: cada elemento es un Map<name, lineNum>
  const stack = [new Map()];
  let depth = 0;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const lineNum = li + 1;

    // Detectar declaración ANTES de contar llaves (pertenece al scope actual)
    const m = DECL_RE.exec(line);
    if (m) {
      const name = m[2];
      if (!IGNORE_NAMES.has(name)) {
        const scope = stack[stack.length - 1];
        if (scope.has(name)) {
          errors.push(`  ❌ Line ${lineNum}: '${name}' ya declarado en este scope (1ª vez línea ${scope.get(name)})`);
        } else {
          scope.set(name, lineNum);
        }
      }
    }

    // Contar llaves netas en la línea (ignorando strings y comentarios)
    let delta = 0;
    let inStr = false, strCh = '', inLC = false, inBC = false, inTpl = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i], nx = line[i + 1];
      if (inLC) break;
      if (inBC) { if (c === '*' && nx === '/') { inBC = false; i++; } continue; }
      if (inStr) {
        if (c === '\\') { i++; continue; }
        if (c === strCh) inStr = false;
        continue;
      }
      if (c === '/' && nx === '/') { inLC = true; break; }
      if (c === '/' && nx === '*') { inBC = true; continue; }
      if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
      // Template literals: rastreamos profundidad para ignorar ${...}
      if (c === '`') { inTpl++; continue; }
      if (inTpl > 0) {
        if (c === '$' && nx === '{') { i++; continue; } // skip ${
        if (c === '`') { inTpl--; continue; }
        continue;
      }
      if (c === '{') delta++;
      if (c === '}') delta--;
    }

    if (delta > 0) {
      for (let i = 0; i < delta; i++) stack.push(new Map());
      depth += delta;
    } else if (delta < 0) {
      for (let i = 0; i < Math.abs(delta); i++) {
        if (stack.length > 1) stack.pop();
      }
      depth = Math.max(0, depth + delta);
    }
  }

  return errors;
}

// ── 2. Patrones no-brand ──────────────────────────────────────────────────────
function checkPatterns(src) {
  const warnings = [];
  src.split('\n').forEach((line, i) => {
    const n = i + 1;
    // fontWeight mezclado con fontFamily custom (inválido en RN)
    if (/fontWeight/.test(line) && /fontFamily/.test(line)) {
      warnings.push(`  ⚠️  Line ${n}: fontWeight + fontFamily (fontWeight ignorado con fuentes custom)`);
    }
    // Colores Tailwind slate no-brand
    if (/#94A3B8|#475569|#334155|#64748B|#1E293B/.test(line)) {
      warnings.push(`  ⚠️  Line ${n}: color Tailwind slate → reemplazar con #737373 o #0A0A0A`);
    }
    // Azul no-brand
    if (/#1A56DB/.test(line)) {
      warnings.push(`  ⚠️  Line ${n}: color no-brand #1A56DB → usar color de marca`);
    }
  });
  return warnings;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const files = SRC_DIRS.flatMap(d => walk(join(ROOT, d)));
let totalErrors = 0, totalWarnings = 0;

console.log(`\n🔍 Blumm pre-build check — ${files.length} archivos\n`);

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf8');

  const syntaxErrors = checkSyntax(file, src);
  const errors = [...syntaxErrors, ...checkDuplicates(src)];
  const warnings = checkPatterns(src);

  if (errors.length || warnings.length) {
    console.log(`📄 ${rel}`);
    errors.forEach(e => { console.log(e); totalErrors++; });
    warnings.forEach(w => { console.log(w); totalWarnings++; });
    console.log();
  }
}

console.log(`─────────────────────────────────────────`);
if (totalErrors === 0) {
  console.log(`✅ Sin errores — listo para build`);
  if (totalWarnings > 0) console.log(`   (${totalWarnings} avisos de color/font pendientes)`);
} else {
  console.log(`❌ ${totalErrors} error(s) — CORRIGE ANTES DEL BUILD`);
  if (totalWarnings > 0) console.log(`⚠️  ${totalWarnings} aviso(s) de estilo`);
}
console.log();
process.exit(totalErrors > 0 ? 1 : 0);
