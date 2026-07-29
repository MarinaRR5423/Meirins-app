/**
 * adherenceStats.js — calcula métricas de adherencia desde activityLog
 *
 * activityLog estructura:
 * {
 * '2026-06-04': {
 * recipes: { breakfast: 'done', lunch: 'skipped', dinner: 'done' },
 * workout: 'done'
 * },
 * ...
 * }
 */

/**
 * Devuelve los últimos N días en formato YYYY-MM-DD.
 */
function lastNDays(n) {
 return Array.from({ length: n }, (_, i) => {
 const d = new Date();
 d.setDate(d.getDate() - i);
 return d.toISOString().split('T')[0];
 });
}

/**
 * Cuenta cuántas entradas "done" hay vs total registradas.
 *
 * @param {Object} activityLog
 * @param {number} days cuántos días atrás (default 7)
 * @returns {Object} { recipesPct, workoutsPct, totalDays, recipesDone, recipesTotal, workoutsDone, workoutsTotal, streak }
 */
export function calcAdherence(activityLog = {}, days = 7) {
 const range = lastNDays(days);

 let recipesDone = 0, recipesTotal = 0;
 let workoutsDone = 0, workoutsTotal = 0;

 range.forEach(date => {
 const day = activityLog[date];
 if (!day || typeof day !== 'object') return;
 // Recetas
 Object.values(day.recipes || {}).forEach(status => {
 if (status !== 'done' && status !== 'skipped') return;
 recipesTotal++;
 if (status === 'done') recipesDone++;
 });
 // Workout
 if (day.workout) {
 workoutsTotal++;
 if (day.workout === 'done') workoutsDone++;
 }
 });

 // Streak: días consecutivos desde hoy con al menos 1 actividad "done"
 let streak = 0;
 for (const date of range) {
 const day = activityLog[date];
 if (!day) break;
 const hasAnyDone =
 day.workout === 'done' ||
 Object.values(day.recipes || {}).some(s => s === 'done');
 if (hasAnyDone) streak++;
 else break;
 }

 return {
 recipesPct: recipesTotal > 0 ? Math.round((recipesDone / recipesTotal) * 100) : null,
 workoutsPct: workoutsTotal > 0 ? Math.round((workoutsDone / workoutsTotal) * 100) : null,
 recipesDone, recipesTotal,
 workoutsDone, workoutsTotal,
 streak,
 days,
 };
}
