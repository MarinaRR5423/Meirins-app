/**
 * fastingMeals.js — determina qué comidas se hacen según el protocolo de ayuno
 *
 * Cada protocolo define una ventana alimentaria por defecto. La usuaria puede
 * sobrescribirla manualmente desde el perfil (mealsActive).
 */

// IDs de comidas que usa marinaProgram.js
export const ALL_MEALS = ['desayuno', 'snack_manana', 'almuerzo', 'snack_tarde', 'cena'];

// Comidas activas por protocolo (default — ventana mañana-tarde tipo OMAD)
const FASTING_DEFAULT_MEALS = {
 fasting_16_8: ['almuerzo', 'snack_tarde', 'cena'],
 fasting_18_6: ['almuerzo', 'cena'],
 fasting_5_2: ALL_MEALS, // días normales — la 5:2 es semanal
 omad: ['cena'], // 1 sola comida
};

/**
 * Devuelve los IDs de comidas activas según el perfil.
 *
 * @param {string|null} fastingProtocol 'fasting_16_8' | 'fasting_18_6' | 'fasting_5_2' | 'omad' | null
 * @param {string[]|null} mealsActiveOverride IDs de comidas que la usuaria quiere ver (sobrescribe default)
 * @returns {string[]}
 */
export function getActiveMeals(fastingProtocol, mealsActiveOverride) {
 // Si la usuaria ha personalizado sus comidas, usar eso siempre
 if (Array.isArray(mealsActiveOverride) && mealsActiveOverride.length > 0) {
 return mealsActiveOverride;
 }
 // Default del protocolo o todas las comidas
 return FASTING_DEFAULT_MEALS[fastingProtocol] || ALL_MEALS;
}

/**
 * Filtra el array de comidas de un menú según el perfil de ayuno.
 *
 * @param {Object[]} meals array original de comidas con .id
 * @param {string|null} fastingProtocol protocolo activo
 * @param {string[]|null} mealsActiveOverride override del usuario
 * @returns {Object[]} array filtrado
 */
export function filterMealsByFasting(meals, fastingProtocol, mealsActiveOverride) {
 if (!fastingProtocol && (!mealsActiveOverride || mealsActiveOverride.length === 0)) {
 return meals; // sin ayuno y sin override → todas
 }
 const active = getActiveMeals(fastingProtocol, mealsActiveOverride);
 const filtered = meals.filter(m => active.includes(m.id));
 // Si el filtro elimina todas las comidas (IDs inválidos o config errónea), devolver todo
 return filtered.length > 0 ? filtered : meals;
}

// Labels multilingüe de cada comida (para selector en perfil)
export const MEAL_LABELS = {
 desayuno: { es: 'Desayuno', en: 'Breakfast', fr: 'Petit-déjeuner', it: 'Colazione' },
 snack_manana: { es: 'Snack de la mañana', en: 'Morning snack', fr: 'Collation matin', it: 'Spuntino mattino' },
 almuerzo: { es: 'Almuerzo', en: 'Lunch', fr: 'Déjeuner', it: 'Pranzo' },
 snack_tarde: { es: 'Snack de la tarde', en: 'Afternoon snack', fr: 'Collation après-midi', it: 'Spuntino pomeriggio' },
 cena: { es: 'Cena', en: 'Dinner', fr: 'Dîner', it: 'Cena' },
};
