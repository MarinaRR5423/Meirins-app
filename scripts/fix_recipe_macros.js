/**
 * fix_recipe_macros.js
 * Recalcula protein_g, carbs_g, fat_g de cada receta para cumplir las reglas
 * de macros por grupo de dieta, manteniendo las kcal originales.
 *
 * Ejecuta: node scripts/fix_recipe_macros.js
 * Genera:  scripts/fix_recipe_macros.sql
 */

const fs   = require('fs');
const path = require('path');

const CSV = 'C:\\Users\\marin\\Desktop\\Info Meirins\\recetas_meirins.csv';
const OUT = path.join(__dirname, 'fix_recipe_macros.sql');

// ── Reglas por grupo (% de kcal totales de la receta) ──────────────────────
const GROUPS = {
  keto:       { hc: 0.05, prt: 0.20, fat: 0.75 },
  low_carb:   { hc: 0.30, prt: 0.25, fat: 0.45 },
  paleo:      { hc: 0.30, prt: 0.25, fat: 0.45 },
  high_protein:{ hc: 0.40, prt: 0.30, fat: 0.30 },
  // Grupo 1 — resto de dietas
  standard:   { hc: 0.50, prt: 0.20, fat: 0.30 },
};

// Prioridad: si una receta tiene varias dietas, usamos la primera que coincida
const PRIORITY = ['keto','low_carb','paleo','high_protein','standard'];

function getGroup(diets) {
  for (const d of PRIORITY) {
    if (diets.includes(d)) return d;
  }
  return 'standard'; // grupo 1 por defecto
}

function parseCSV(line) {
  const vals = []; let cur = '', inQ = false;
  for (const c of line) {
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { vals.push(cur); cur = ''; }
    else { cur += c; }
  }
  vals.push(cur);
  return vals;
}

function escape(s) { return (s||'').replace(/'/g, "''"); }

const TOL = 0.10; // ±10pp

console.log('Leyendo CSV...');
const lines   = fs.readFileSync(CSV, 'utf-8').replace(/^﻿/, '').split('\n').filter(l => l.trim());
const headers = parseCSV(lines[0]);
const idx     = k => headers.indexOf(k);

const updates   = [];
let needsFix = 0, alreadyOk = 0, noKcal = 0;

const stats = {};

for (let i = 1; i < lines.length; i++) {
  const v      = parseCSV(lines[i]);
  const id     = v[idx('id')]; if (!id) continue;
  const diets  = (v[idx('dietas')] || '').split('|').map(d => d.trim().toLowerCase().replace(/ /g,'_'));
  const kcal   = parseFloat(v[idx('kcal')]);
  const prot   = parseFloat(v[idx('proteinas_g')]);
  const carbs  = parseFloat(v[idx('carbos_g')]);
  const fat    = parseFloat(v[idx('grasa_g')]);
  const fiber  = parseFloat(v[idx('fibra_g')]) || 0;

  if (!kcal || kcal < 50) { noKcal++; continue; }

  const group  = getGroup(diets);
  const rule   = GROUPS[group];

  // % actuales
  const pctHC  = (carbs * 4) / kcal;
  const pctPRT = (prot  * 4) / kcal;
  const pctFAT = (fat   * 9) / kcal;

  const okHC  = Math.abs(pctHC  - rule.hc)  <= TOL;
  const okPRT = Math.abs(pctPRT - rule.prt) <= TOL;
  const okFAT = Math.abs(pctFAT - rule.fat) <= TOL;

  if (okHC && okPRT && okFAT) { alreadyOk++; continue; }

  needsFix++;
  if (!stats[group]) stats[group] = 0;
  stats[group]++;

  // Macros corregidos manteniendo kcal
  const newCarbs = parseFloat(((kcal * rule.hc)  / 4).toFixed(1));
  const newProt  = parseFloat(((kcal * rule.prt) / 4).toFixed(1));
  const newFat   = parseFloat(((kcal * rule.fat) / 9).toFixed(1));

  updates.push(
    `UPDATE recipes SET\n` +
    `  carbs_g = ${newCarbs}, protein_g = ${newProt}, fat_g = ${newFat}\n` +
    `  WHERE id = '${escape(id)}';  -- grupo:${group} | antes: HC${Math.round(pctHC*100)}%/PRT${Math.round(pctPRT*100)}%/FAT${Math.round(pctFAT*100)}% → HC${Math.round(rule.hc*100)}%/PRT${Math.round(rule.prt*100)}%/FAT${Math.round(rule.fat*100)}%`
  );
}

console.log(`\nResultado:`);
console.log(`  Ya correctas: ${alreadyOk}`);
console.log(`  Necesitan corrección: ${needsFix}`);
console.log(`  Sin kcal (omitidas): ${noKcal}`);
console.log(`\nPor grupo:`);
for (const [g,n] of Object.entries(stats)) console.log(`  ${g}: ${n} recetas`);

// Dividir en bloques de 50 (una sentencia = un comando)
const sql =
  `-- Corrección de macros en recipes\n` +
  `-- ${needsFix} recetas actualizadas — generado ${new Date().toISOString().split('T')[0]}\n` +
  `-- Mantiene kcal original, recalcula carbs_g / protein_g / fat_g según reglas de dieta\n\n` +
  updates.join('\n') + '\n';

fs.writeFileSync(OUT, sql, 'utf-8');
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n✅ ${OUT} — ${kb} KB — ${updates.length} UPDATE statements`);
