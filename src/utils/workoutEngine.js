/**
 * workoutEngine.js — selecciona workouts según el perfil y la fase.
 *
 * Pipeline:
 * 1. FILTRADO DURO → fitness_level + equipment + avoid_for
 * 2. PUNTUACIÓN → score por fase, condiciones, objetivos
 * 3. ASIGNACIÓN → distribuye workouts a los trainDays de la usuaria
 */

// ── 1. FILTRADO DURO ────────────────────────────────────────────────────────

function isHardCompatible(workout, profile) {
 const fitnessLevel = profile.fitnessLevel || 'regular';
 // gymAccess puede ser string (perfiles antiguos) o array (selección múltiple)
 const rawGym = profile.gymAccess || 'home';
 const gymAccess = Array.isArray(rawGym) ? (rawGym.length > 0 ? rawGym : ['home']) : [rawGym];
 const conditions = profile.conditions || [];
 const lifeStage = profile.lifeStage || null;

 // 0. Skipped hoy — duro
 if (profile.skippedWorkoutIds?.includes(workout.id)) return false;

 // Si el workout es de un deporte que la usuaria ya practica (elegido en el
 // cuestionario), no se le veta por nivel ni por lugar: ya lo hace.
 const isHerSport = workoutMatchesChosenSport(workout, profile.sportProfile);

 // 1. Nivel de fitness
 if (!isHerSport && workout.fitness_levels?.length > 0 && !workout.fitness_levels.includes(fitnessLevel)) {
 return false;
 }

 // 2. Equipment / lugar — el workout es válido si alguno de los lugares
 // de la usuaria coincide con el equipment que requiere
 if (!isHerSport && workout.equipment?.length > 0 && !gymAccess.some(g => workout.equipment.includes(g))) {
 return false;
 }

 // 3. Avoid_for — duro SIEMPRE (ej: pregnant, postpartum), también en sus deportes
 if (workout.avoid_for?.length > 0) {
 if (lifeStage && workout.avoid_for.includes(lifeStage)) return false;
 if (conditions.some(c => workout.avoid_for.includes(c))) return false;
 }

 return true;
}

// ── Deportes elegidos → tipos de workout afines ──────────────────────────────
// Ids de SPORTS_LIST y COMP_SPORTS (cuestionario deporte) → workout_type de la BD
const SPORT_TO_WORKOUT_TYPES = {
 // ¿Qué deporte realizas?
 running: ['cardio'],
 gym: ['strength'],
 yoga: ['yoga', 'mobility'],
 pilates: ['pilates'],
 swimming: ['cardio'],
 cycling: ['cardio'],
 padel: ['cardio', 'hiit'],
 football: ['cardio', 'hiit'],
 basketball: ['cardio', 'hiit'],
 crossfit: ['hiit', 'strength'],
 dance: ['cardio'],
 hiking: ['cardio', 'mobility'],
 martial: ['hiit'],
 climbing: ['strength', 'mobility'],
 // Deportes de competición
 triathlon: ['cardio'],
 marathon: ['cardio'],
 half_marathon: ['cardio'],
 race_10k: ['cardio'],
 trail: ['cardio'],
 duathlon: ['cardio'],
 hyrox: ['hiit', 'strength'],
};

// Palabras clave en el id del workout para afinar dentro del mismo tipo
// (ej: running prefiere 'carrera' antes que 'natacion', ambos cardio)
const SPORT_TO_KEYWORDS = {
 running: ['carrera'],
 swimming: ['natacion'],
 hiking: ['caminata', 'paseo'],
 martial: ['boxeo'],
 crossfit: ['crossfit', 'hiit'],
 gym: ['fuerza'],
 yoga: ['yoga'],
 pilates: ['pilates'],
 marathon: ['carrera'],
 half_marathon: ['carrera'],
 race_10k: ['carrera'],
 trail: ['carrera', 'caminata'],
 triathlon: ['carrera', 'natacion'],
 duathlon: ['carrera'],
 hyrox: ['crossfit', 'hiit'],
};

function sportIdsFromProfile(sp = {}) {
 return [
 ...(Array.isArray(sp.currentSports) ? sp.currentSports : []),
 sp.competitionSport,
 ].filter(Boolean);
}

/** ¿El workout es específicamente de un deporte que la usuaria eligió? */
function workoutMatchesChosenSport(workout, sp = {}) {
 return sportIdsFromProfile(sp).some(id =>
 (SPORT_TO_KEYWORDS[id] || []).some(k => workout.id?.includes(k))
 );
}

/** Tipos de workout preferidos según el sportProfile de la usuaria */
export function preferredTypesFromSportProfile(sp = {}) {
 const types = new Set();
 sportIdsFromProfile(sp).forEach(id => (SPORT_TO_WORKOUT_TYPES[id] || []).forEach(t => types.add(t)));
 return [...types];
}

// ── Matriz fase × nivel de actividad → tipos recomendados ────────────────────
// workout_type values: 'yoga' | 'pilates' | 'mobility' | 'strength' | 'cardio' | 'hiit'
const PHASE_ACTIVITY_MATRIX = {
 sedentary: {
 menstrual:  ['yoga', 'pilates'],
 follicular: ['strength'],
 ovulatory:  ['cardio', 'hiit'],
 luteal:     ['mobility'],
 },
 occasional: {
 menstrual:  ['cardio', 'mobility', 'yoga', 'pilates'],
 follicular: ['strength', 'cardio'],
 ovulatory:  ['strength', 'cardio', 'hiit'],
 luteal:     ['cardio', 'mobility', 'pilates'],
 },
 regular: {
 menstrual:  ['mobility', 'strength', 'cardio'],
 follicular: ['strength', 'cardio', 'hiit'],
 ovulatory:  ['hiit', 'strength', 'cardio'],
 luteal:     ['cardio', 'strength', 'mobility', 'yoga'],
 },
 // athlete: pendiente de definir — usa regular como fallback
};

// ── 2. PUNTUACIÓN ─────────────────────────────────────────────────────────────

function scoreWorkout(workout, profile, phase) {
 let score = 50;

 // ── Deportes elegidos (+12 si el tipo encaja, +10 extra si el workout
 // es específicamente de ese deporte, ej: running → carrera) ──
 const prefTypes = preferredTypesFromSportProfile(profile.sportProfile);
 if (prefTypes.length && prefTypes.includes(workout.workout_type)) score += 12;
 if (workoutMatchesChosenSport(workout, profile.sportProfile)) score += 10;

 // ── Favoritos (+25) ──
 if (profile.favoriteWorkouts?.includes(workout.id)) score += 25;

 // ── Fase × nivel de actividad (+15 si el tipo encaja con la matriz) ──
 if (phase && workout.workout_type) {
 const level = profile.fitnessLevel || 'regular';
 const matrixLevel = PHASE_ACTIVITY_MATRIX[level] || PHASE_ACTIVITY_MATRIX.regular;
 const recommended = matrixLevel[phase] || [];
 if (recommended.includes(workout.workout_type)) score += 15;
 }

 // ── Fase del ciclo (+20 — la receta está tageada para esta fase) ──
 if (phase && workout.phases?.includes(phase)) {
 score += 20;
 }

 // Objetivo
 if (profile.goal && workout.goals?.includes(profile.goal)) {
 score += 10;
 }

 // Objetivos secundarios (primaryGoals[])
 const primaryGoals = profile.primaryGoals || [];
 primaryGoals.forEach(g => {
 if (workout.goals?.includes(g)) score += 5;
 });

 // Condiciones beneficiosas (+8 por cada match)
 const conditions = profile.conditions || [];
 conditions.forEach(c => {
 if (workout.good_for?.includes(c)) score += 8;
 });

 return score;
}

// ── 3. API pública ────────────────────────────────────────────────────────────

/**
 * Devuelve los workouts válidos puntuados para el perfil/fase.
 */
export function getWorkoutsForProfile(workouts, profile, phase) {
 if (!workouts?.length) return [];

 let pool = workouts.filter(w => isHardCompatible(w, profile));

 // Si la usuaria eligió deportes, restringe el pool a los tipos afines
 // (con fallback al pool completo si quedan muy pocos)
 const prefTypes = preferredTypesFromSportProfile(profile.sportProfile);
 if (prefTypes.length) {
 const preferred = pool.filter(w => prefTypes.includes(w.workout_type));
 if (preferred.length >= 3) pool = preferred;
 }

 return pool
 .map(w => ({ ...w, _score: scoreWorkout(w, profile, phase) }))
 .sort((a, b) => b._score - a._score);
}

function hashString(str) {
 let h = 5381;
 for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
 return Math.abs(h);
}

/**
 * Distribuye workouts a los trainDays con rotación SEMANAL.
 *
 * Cada semana del año la usuaria ve combinaciones distintas dentro de las top N
 * sin que se repita la misma sesión en dos días seguidos.
 *
 * @param {Array} workouts workouts ya filtrados y puntuados
 * @param {number[]} trainDays días JS [0-6]
 * @param {string} weekSeed string para hacer la rotación determinista (ej: "2026-W23")
 */
export function distributeWorkoutsToDays(workouts, trainDays = [], weekSeed = '') {
 if (!workouts?.length || !trainDays?.length) return {};
 const sortedDays = [...trainDays].sort((a, b) => a - b);
 const pool = workouts.slice(0, Math.min(8, workouts.length)); // top 8 más altos
 const seed = hashString(weekSeed || new Date().toISOString().slice(0, 7));

 const plan = {};
 sortedDays.forEach((jsDay, i) => {
 const idx = (seed + i * 7) % pool.length;
 plan[jsDay] = pool[idx];
 });
 return plan;
}

/** Devuelve la semana ISO actual (ej: "2026-W23") */
function getISOWeek(date = new Date()) {
 const d = new Date(date);
 d.setUTCHours(0, 0, 0, 0);
 d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
 const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
 const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
 return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Convierte un workout de BD al formato que espera la UI.
 */
export function workoutToCardFormat(workout, lang = 'es') {
 if (!workout) return null;

 const name = workout.name?.[lang] || workout.name?.es || '';
 const description = workout.description?.[lang] || workout.description?.es || '';
 const exercises = workout.exercises?.[lang] || workout.exercises?.es || [];
 const tips = workout.tips?.[lang] || workout.tips?.es || [];

 return {
 id: workout.id,
 name,
 description,
 ico: workout.emoji || '',
 dur: workout.duration_min ? `${workout.duration_min}'` : '',
 duration: workout.duration_min,
 intensity: workout.intensity,
 est_calories: workout.est_calories,
 workout_type: workout.workout_type,
 exercises,
 tips,
 on: true,
 _score: workout._score,
 };
}

/**
 * API principal: devuelve el plan semanal personalizado completo.
 * Rota la asignación cada semana ISO.
 *
 * @returns {Object} { [jsDay]: workoutCard }
 */
export function buildPersonalizedWeekPlan(workouts, profile, phase, trainDays = [], lang = 'es') {
 const filtered = getWorkoutsForProfile(workouts, profile, phase);
 const weekSeed = getISOWeek();
 const distributed = distributeWorkoutsToDays(filtered, trainDays, weekSeed);

 const plan = {};
 Object.entries(distributed).forEach(([day, workout]) => {
 plan[day] = workoutToCardFormat(workout, lang);
 });
 return plan;
}
