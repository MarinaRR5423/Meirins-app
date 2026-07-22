/**
 * Reglas de distribución energética y de macronutrientes por comida.
 *
 * Dieta estándar: 50% HC · 20% Proteína · 30% Grasas
 *
 * Distribución energética (% del total diario):
 *   Desayuno      20%
 *   Media Mañana  10%
 *   Comida/Almuerzo 35%
 *   Merienda      10%
 *   Cena          25%
 *
 * Distribución de macros por comida (% del total diario de kcal):
 *   Desayuno:     HC 10% · PRT 4% · Grasas 6%
 *   Media Mañana: HC 5%  · PRT 2% · Grasas 3%
 *   Comida:       HC 17.5% · PRT 7% · Grasas 10.5%
 *   Merienda:     HC 5%  · PRT 2% · Grasas 3%
 *   Cena:         HC 12.5% · PRT 5% · Grasas 7.5%
 */

export const MEAL_ENERGY_PCT = {
  desayuno:     0.20,
  snack_manana: 0.10,
  almuerzo:     0.35,
  snack_tarde:  0.10,
  cena:         0.25,
};

// Porcentaje de macros de cada comida sobre el TOTAL DIARIO de kcal
export const MEAL_MACRO_PCT = {
  desayuno:     { carbs: 0.10,   protein: 0.04, fat: 0.06  },
  snack_manana: { carbs: 0.05,   protein: 0.02, fat: 0.03  },
  almuerzo:     { carbs: 0.175,  protein: 0.07, fat: 0.105 },
  snack_tarde:  { carbs: 0.05,   protein: 0.02, fat: 0.03  },
  cena:         { carbs: 0.125,  protein: 0.05, fat: 0.075 },
};

/**
 * Calcula los macros de una comida a partir del total diario de kcal.
 * Devuelve null si el mealId no está en las reglas o si no hay totalKcal.
 *
 * @param {string} mealId        id de la comida (desayuno, almuerzo, etc.)
 * @param {number} totalDailyKcal total diario de kcal de la usuaria
 * @returns {{ kcal, carbs, protein, fat } | null}
 */
export function calcMealMacros(mealId, totalDailyKcal) {
  const energyPct = MEAL_ENERGY_PCT[mealId];
  const macroPct  = MEAL_MACRO_PCT[mealId];
  if (!energyPct || !macroPct || !totalDailyKcal) return null;
  return {
    kcal:    Math.round(totalDailyKcal * energyPct),
    carbs:   Math.round((totalDailyKcal * macroPct.carbs)   / 4),  // 4 kcal/g
    protein: Math.round((totalDailyKcal * macroPct.protein) / 4),  // 4 kcal/g
    fat:     Math.round((totalDailyKcal * macroPct.fat)     / 9),  // 9 kcal/g
  };
}
