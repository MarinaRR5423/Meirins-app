/**
 * nutritionRules.js
 * Reglas de distribución de macronutrientes por grupo de dieta y comida.
 *
 * Grupos:
 * Grupo 1 — Estándar, Mediterránea, Vegetariana, Vegana, Pescateriana,
 * Sin gluten, Sin lactosa, Antiinflamatoria, DASH, FODMAP
 * → 50% HC / 20% PRT / 30% FAT
 *
 * Grupo 2 — Cetogénica (keto)
 * → 5% HC / 20% PRT / 75% FAT
 *
 * Grupo 3 — Low Carb, Paleo
 * → 30% HC / 25% PRT / 45% FAT
 *
 * Grupo 4 — Alta proteína (high_protein)
 * → 40% HC / 30% PRT / 30% FAT
 *
 * Tolerancia aplicada en recipeEngine: ±10 puntos porcentuales.
 * Todos los % son sobre el TOTAL DIARIO de kcal de la usuaria.
 */

// ── Distribución energética por comida (igual para todos los grupos) ─────────
export const MEAL_ENERGY_PCT = {
 desayuno: 0.20,
 snack_manana: 0.10,
 almuerzo: 0.35,
 snack_tarde: 0.10,
 cena: 0.25,
};

// ── Macros por comida sobre el total diario, por grupo ───────────────────────
// % de kcal totales diarias que debe aportar cada macro en cada comida.
const MACRO_RULES = {
 // Grupo 1: 50% HC / 20% PRT / 30% FAT
 group1: {
 desayuno: { carbs: 0.100, protein: 0.040, fat: 0.060 },
 snack_manana: { carbs: 0.050, protein: 0.020, fat: 0.030 },
 almuerzo: { carbs: 0.175, protein: 0.070, fat: 0.105 },
 snack_tarde: { carbs: 0.050, protein: 0.020, fat: 0.030 },
 cena: { carbs: 0.125, protein: 0.050, fat: 0.075 },
 },
 // Grupo 2: 5% HC / 20% PRT / 75% FAT
 group2: {
 desayuno: { carbs: 0.010, protein: 0.040, fat: 0.150 },
 snack_manana: { carbs: 0.005, protein: 0.020, fat: 0.075 },
 almuerzo: { carbs: 0.0175,protein: 0.070, fat: 0.2625},
 snack_tarde: { carbs: 0.005, protein: 0.020, fat: 0.075 },
 cena: { carbs: 0.0125,protein: 0.050, fat: 0.1875},
 },
 // Grupo 3: 30% HC / 25% PRT / 45% FAT
 group3: {
 desayuno: { carbs: 0.060, protein: 0.050, fat: 0.090 },
 snack_manana: { carbs: 0.030, protein: 0.025, fat: 0.045 },
 almuerzo: { carbs: 0.105, protein: 0.0875,fat: 0.1575},
 snack_tarde: { carbs: 0.030, protein: 0.025, fat: 0.045 },
 cena: { carbs: 0.075, protein: 0.0625,fat: 0.1125},
 },
 // Grupo 4: 40% HC / 30% PRT / 30% FAT
 group4: {
 desayuno: { carbs: 0.080, protein: 0.060, fat: 0.060 },
 snack_manana: { carbs: 0.040, protein: 0.030, fat: 0.030 },
 almuerzo: { carbs: 0.140, protein: 0.105, fat: 0.105 },
 snack_tarde: { carbs: 0.040, protein: 0.030, fat: 0.030 },
 cena: { carbs: 0.100, protein: 0.075, fat: 0.075 },
 },
};

// ── Mapa dieta → grupo ───────────────────────────────────────────────────────
const DIET_TO_GROUP = {
 // Grupo 1
 standard: 'group1',
 mediterranean: 'group1',
 vegetarian: 'group1',
 vegan: 'group1',
 pescatarian: 'group1',
 gluten_free: 'group1',
 lactose_free: 'group1',
 anti_inflammatory: 'group1',
 dash: 'group1',
 fodmap: 'group1',
 intuitive_eating: 'group1',
 // Grupo 2
 keto: 'group2',
 ketogenic: 'group2',
 // Grupo 3
 low_carb: 'group3',
 paleo: 'group3',
 // Grupo 4
 high_protein: 'group4',
};

// Prioridad cuando una receta tiene varias dietas
const GROUP_PRIORITY = ['group2', 'group3', 'group4', 'group1'];

/**
 * Devuelve el grupo de macros que corresponde a una dieta.
 * Si la dieta no está mapeada, usa group1 (estándar).
 */
export function getDietGroup(diet) {
 if (!diet) return 'group1';
 const normalized = diet.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
 return DIET_TO_GROUP[normalized] || 'group1';
}

/**
 * Devuelve las reglas de macros para una dieta y comida concretas.
 */
export function getMealMacroRules(diet, mealAppId) {
 const group = getDietGroup(diet);
 return MACRO_RULES[group]?.[mealAppId] || null;
}

// Mapa de meal_type de Supabase → id de comida de la app
const DB_MEAL_TO_APP_ID = {
 breakfast: 'desayuno',
 morning_snack: 'snack_manana',
 lunch: 'almuerzo',
 afternoon_snack: 'snack_tarde',
 dinner: 'cena',
};

export function dbMealToAppId(dbMealType) {
 return DB_MEAL_TO_APP_ID[dbMealType] || null;
}

/**
 * Calcula los macros normativos de una comida según dieta y kcal diarias.
 * Devuelve { kcal, carbs, protein, fat } o null.
 */
export function calcMealMacros(mealId, totalDailyKcal, diet) {
 const energyPct = MEAL_ENERGY_PCT[mealId];
 const macroPct = getMealMacroRules(diet, mealId);
 if (!energyPct || !macroPct || !totalDailyKcal) return null;
 return {
 kcal: Math.round(totalDailyKcal * energyPct),
 carbs: Math.round((totalDailyKcal * macroPct.carbs) / 4),
 protein: Math.round((totalDailyKcal * macroPct.protein) / 4),
 fat: Math.round((totalDailyKcal * macroPct.fat) / 9),
 };
}

export function calcMealMacrosByDbType(dbMealType, totalDailyKcal, diet) {
 const appId = dbMealToAppId(dbMealType);
 return calcMealMacros(appId, totalDailyKcal, diet);
}

// Exportar reglas crudas por si se necesitan en otros módulos
export { MACRO_RULES, DIET_TO_GROUP };
