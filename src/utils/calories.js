/**
 * calcCalories — cálculo de calorías diarias personalizadas
 *
 * Fórmula: Mifflin-St Jeor (versión femenina)
 * BMR = 10×peso + 6.25×altura − 5×edad − 161
 *
 * TDEE = BMR × factor de actividad
 * El factor combina el nivel declarado por la usuaria con los días
 * de entrenamiento reales para afinar el resultado.
 *
 * Ajuste de objetivo:
 * lose_weight → −300 kcal
 * maintain → 0 kcal
 * gain_muscle → +300 kcal
 *
 * Ajuste de fase del ciclo (basado en variación real del metabolismo basal):
 * menstrual → 0 kcal (BMR normal-bajo, cuerpo en recuperación)
 * follicular → −150 kcal (máxima sensibilidad a la insulina, fase óptima para déficit)
 * ovulation → 0 kcal (pico corto, sin ajuste significativo)
 * luteal → +150 kcal (progesterona sube el BMR ~150–300 kcal reales)
 *
 * Mínimo absoluto: 1 200 kcal
 */

// Multiplicador de actividad por nivel declarado
const ACT_LEVEL_MAP = {
 sedentary: 1.2,
 light: 1.375,
 moderate: 1.55,
 active: 1.725,
 very_active: 1.9,
};

// Multiplicador por días de entrenamiento semanales reales
function actFromDays(days) {
 if (!days || days === 0) return 1.2;
 if (days <= 2) return 1.375;
 if (days <= 4) return 1.55;
 if (days <= 5) return 1.725;
 return 1.9;
}

// Ajuste calórico por fase del ciclo (kcal/día vs TDEE base)
const PHASE_ADJ = {
 menstrual: 0,
 follicular: -150,
 ovulation: 0,
 luteal: +150,
};

// Ajuste calórico por objetivo
const GOAL_ADJ = {
 lose_weight: -300,
 maintain: 0,
 gain_muscle: +300,
};

/**
 * @param {object} profile { weight, height, age, activityLevel, goal, trainDays, primaryGoals }
 * @param {string} phase fase actual del ciclo ('menstrual'|'follicular'|'ovulation'|'luteal')
 * @returns {{ bmr, tdee, total, phaseAdj, goalAdj, fertilityMode } | null}
 */
export function calcCalories(profile, phase) {
 const { weight, height, age, activityLevel, goal, trainDays, primaryGoals } = profile || {};
 if (!weight || !height || !age) return null;

 // Modo fertilidad: no aplicar déficit calórico nunca
 // (déficit interfiere con la ovulación y la implantación)
 const hasFertilityGoal = Array.isArray(primaryGoals)
   ? primaryGoals.includes('fertility')
   : primaryGoals?.fertility === true || primaryGoals?.fertility === 1;
 const isPregnant = goal === 'pregnant' || goal === 'postpartum';
 const fertilityMode = hasFertilityGoal || isPregnant;

 // 1. BMR — Mifflin-St Jeor (mujer)
 const bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);

 // 2. Factor de actividad: media ponderada entre nivel declarado y días reales
 const levelAct = ACT_LEVEL_MAP[activityLevel] || 1.375;
 const daysAct = actFromDays(trainDays?.length ?? 0);
 const act = trainDays && trainDays.length > 0
 ? (levelAct + daysAct) / 2
 : levelAct;

 // 3. TDEE
 const tdee = Math.round(bmr * act);

 // 4. Ajuste de objetivo — en modo fertilidad/embarazo nunca se aplica déficit
 const rawGoalAdj = GOAL_ADJ[goal] ?? 0;
 const goalAdj = fertilityMode ? Math.max(0, rawGoalAdj) : rawGoalAdj;
 const phaseAdj = PHASE_ADJ[phase] ?? 0;

 // 5. Total con suelo mínimo
 const total = Math.max(1200, tdee + goalAdj + phaseAdj);

 return { bmr, tdee, total, goalAdj, phaseAdj, fertilityMode };
}
