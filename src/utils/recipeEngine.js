/**
 * recipeEngine.js — filtra y puntúa recetas según el perfil de la usuaria.
 *
 * Pipeline:
 *   1. FILTRADO DURO   → descarta recetas incompatibles (alergias, dieta)
 *   2. PUNTUACIÓN      → score 0-100 según fase, condiciones, objetivos
 *   3. SELECCIÓN       → elige la mejor por meal_type
 */

import { normalizeDietId } from '../hooks/useDiets';

// IDs internos de meal_type en Supabase vs ID usado en la app
const MEAL_TYPE_MAP = {
  desayuno:     'breakfast',
  snack_manana: 'morning_snack',
  almuerzo:     'lunch',
  snack_tarde:  'afternoon_snack',
  cena:         'dinner',
};

/**
 * Devuelve el meal_type de Supabase para un meal_id de la app.
 */
export function appMealToDbMealType(appMealId) {
  return MEAL_TYPE_MAP[appMealId] || appMealId;
}

// ── 1. FILTRADO DURO ────────────────────────────────────────────────────────
// Una receta SOLO es válida si:
//   - No contiene ningún alérgeno del usuario
//   - Es compatible con la dieta (o si la dieta tiene tag específico)
//   - No está marcada como "avoid_for" para alguna condición/etapa

// Mapeo de ID de modificador → campo booleano en la receta (Supabase)
const MODIFIER_FIELD = {
  gluten_free:       'gluten_free',
  lactose_free:      'dairy_free',
  low_fodmap:        'low_fodmap',
  anti_inflammatory: 'anti_inflammatory',
};

function isHardCompatible(recipe, profile) {
  const allergies    = profile.allergies || [];
  const diet         = normalizeDietId(profile.diet || '');
  const conditions   = profile.conditions || [];
  const lifeStage    = profile.lifeStage || null;
  const modifiers    = profile.dietModifiers || [];

  // 0. Skipped hoy — duro
  if (profile.skippedRecipeIds?.includes(recipe.id)) return false;

  // 1. Alergias — duro
  if (allergies.length > 0 && recipe.contains_allergens?.some(a => allergies.includes(a))) {
    return false;
  }

  // 2. Dieta — duro (excepto 'standard' / 'intuitive_eating' que aceptan todo)
  const universalDiets = ['standard', 'intuitive_eating', null, ''];
  if (!universalDiets.includes(diet) && recipe.diets?.length > 0) {
    if (!recipe.diets.includes(diet)) return false;
  }

  // 3. Modificadores — duro: la receta debe cumplir TODOS los seleccionados
  for (const mod of modifiers) {
    const field = MODIFIER_FIELD[mod];
    if (field && recipe[field] === false) return false;
  }

  // 4. Avoid_for — duro
  if (recipe.avoid_for?.length > 0) {
    if (lifeStage && recipe.avoid_for.includes(lifeStage)) return false;
    if (conditions.some(c => recipe.avoid_for.includes(c))) return false;
  }

  return true;
}

// ── 2. PUNTUACIÓN ─────────────────────────────────────────────────────────────
// Score 0-100. Más alto = mejor match para el perfil.

function scoreRecipe(recipe, profile, phase) {
  let score = 50; // base

  // ── Favoritos (+25, los hace muy probables) ──
  if (profile.favoriteRecipes?.includes(recipe.id)) score += 25;

  // ── Fase del ciclo (+15 si está en la lista, 0 si no) ──
  if (phase && recipe.phases?.includes(phase)) {
    score += 15;
  }

  // ── Objetivo (+10 si el goal está en goals) ──
  if (profile.goal && recipe.goals?.includes(profile.goal)) {
    score += 10;
  }

  // ── Condiciones beneficiosas (+8 por cada match) ──
  const conditions = profile.conditions || [];
  conditions.forEach(c => {
    if (recipe.good_for?.includes(c)) score += 8;
  });

  // ── Tiempo de cocina compatible (+5) ──
  const cookingPref = profile.cookingTime;
  if (cookingPref && recipe.cooking_bucket) {
    // 'under20' app ←→ 'under_20' db
    const normalizedPref = cookingPref.replace(/(\d+)to(\d+)/, '$1_to_$2').replace('under', 'under_').replace('over', 'over_');
    if (normalizedPref === recipe.cooking_bucket) score += 5;
  }

  // ── Presupuesto compatible (+3) ──
  if (profile.weeklyBudget && profile.weeklyBudget === recipe.budget) {
    score += 3;
  }

  // ── Penalizaciones suaves ──
  // Foods que no le gustan: si está en ingredientes restamos 5
  const dislikes = profile.foodDislikes || [];
  if (dislikes.length > 0 && recipe.description) {
    const desc = JSON.stringify(recipe.description).toLowerCase();
    if (dislikes.some(d => desc.includes(d.toLowerCase()))) score -= 5;
  }

  return score;
}

// ── 3. FILTRO + SELECCIÓN ─────────────────────────────────────────────────────

/**
 * Devuelve las recetas válidas y puntuadas para un meal_type.
 *
 * @param {Array}  recipes    todas las recetas (de Supabase)
 * @param {Object} profile    profileExtended + datos del usuario
 * @param {string} phase      fase actual del ciclo
 * @param {string} mealType   db meal_type ('breakfast', 'lunch', ...)
 * @returns {Array}           recetas ordenadas por score (mejor primero)
 */
export function getRecipesForMeal(recipes, profile, phase, mealType) {
  if (!recipes?.length) return [];

  return recipes
    .filter(r => r.meal_type === mealType)
    .filter(r => isHardCompatible(r, profile))
    .map(r => ({ ...r, _score: scoreRecipe(r, profile, phase) }))
    .sort((a, b) => b._score - a._score);
}

/**
 * Hash determinista simple para una cadena.
 * Devuelve un entero positivo.
 */
function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return Math.abs(h);
}

/**
 * Elige una receta de los top N candidatos de forma determinista pero variada.
 *
 * Si hoy es martes 4 jun, la elección será siempre la misma → la usuaria abre
 * la app varias veces el mismo día y ve la misma receta. Pero MAÑANA verá otra.
 *
 * @param {Array}  candidates   recetas ordenadas por score (mejor primero)
 * @param {string} dateStr      'YYYY-MM-DD' del día
 * @param {string} mealType     tipo de comida (para que cada comida tenga su rotación)
 * @param {number} topN         cuántos candidatos top considerar (default 5)
 */
function pickWithDailySeed(candidates, dateStr, mealType, topN = 5) {
  if (!candidates?.length) return null;
  const pool = candidates.slice(0, Math.min(topN, candidates.length));
  const seed = hashString(`${dateStr}_${mealType}`);
  return pool[seed % pool.length];
}

/**
 * Devuelve la mejor receta para cada meal_type del día con variedad rotativa.
 *
 * @param {Array}    recipes    todas las recetas
 * @param {Object}   profile    perfil del usuario
 * @param {string}   phase      fase actual
 * @param {string[]} mealTypes  ['breakfast', 'lunch', ...]
 * @param {string}   dateStr    'YYYY-MM-DD' del día — define la rotación
 * @returns {Object}            { breakfast: recipe, lunch: recipe, ... }
 */
export function buildDayMenu(recipes, profile, phase, mealTypes, dateStr) {
  const menu = {};
  mealTypes.forEach(mt => {
    const candidates = getRecipesForMeal(recipes, profile, phase, mt);
    menu[mt] = pickWithDailySeed(candidates, dateStr || new Date().toISOString().split('T')[0], mt);
  });
  return menu;
}

/**
 * Devuelve la receta del día para un meal type específico (con rotación).
 */
export function getDailyRecipe(recipes, profile, phase, mealType, dateStr) {
  const candidates = getRecipesForMeal(recipes, profile, phase, mealType);
  return pickWithDailySeed(candidates, dateStr || new Date().toISOString().split('T')[0], mealType);
}

/**
 * Convierte una receta de la BD al formato que espera NutriScreen.meals[]
 */
export function recipeToMealCard(recipe, lang = 'es') {
  if (!recipe) return null;

  const title = recipe.title?.[lang] || recipe.title?.es || '';
  const ingredients = recipe.ingredients?.[lang] || recipe.ingredients?.es || [];
  const steps = recipe.steps?.[lang] || recipe.steps?.es || [];

  return {
    id:    recipe.id,
    ico:   recipe.emoji || '🍽️',
    title,
    items: ingredients.slice(0, 4),  // primeros 4 ingredientes como preview
    recipe: {
      ingredients,
      steps,
    },
    macros: {
      kcal:    recipe.kcal,
      protein: recipe.protein_g,
      carbs:   recipe.carbs_g,
      fat:     recipe.fat_g,
      fiber:   recipe.fiber_g,
    },
    _score: recipe._score,
  };
}
