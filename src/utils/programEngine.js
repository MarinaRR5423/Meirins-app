/**
 * programEngine.js — motor de personalización de Meirins
 *
 * Genera un programa semanal adaptado a:
 * · Fase del ciclo → tipo e intensidad de entrenos + foco nutricional
 * · Días de entreno → cuándo y en qué orden se asignan los workouts
 * · Nivel de fitness → ajuste de intensidad y notas de adaptación
 * · Acceso al gimnasio → equipment disponible
 * · Condiciones de salud → modificaciones específicas
 * · Tipo de dieta → contexto nutricional del día
 */
import { PHASES } from '../data/phases';

// ── Configuración de intensidad por fase ──────────────────────────────────────
export const PHASE_CONFIG = {
 menstrual: { intensityPct: 20, level: 'low', color: '#EF4444' },
 follicular: { intensityPct: 80, level: 'high', color: '#3B82F6' },
 ovulation: { intensityPct: 90, level: 'peak', color: '#F59E0B' },
 luteal: { intensityPct: 55, level: 'medium', color: '#7C3AED' },
};

// ── Notas de adaptación por nivel de fitness ─────────────────────────────────
const FITNESS_NOTES = {
 sedentary: {
 low: '',
 high: { es: 'Adapta al 50% de tu capacidad. Descansa si lo necesitas.', en: 'Adapt to 50% of your capacity. Rest if needed.', fr: 'Adapte à 50% de ta capacité. Repose-toi si besoin.', it: 'Adatta al 50% della tua capacità.' },
 peak: { es: 'Mantén la intensidad baja. Prioriza la técnica.', en: 'Keep intensity low. Focus on technique.', fr: 'Garde l\'intensité basse. Priorise la technique.', it: 'Mantieni l\'intensità bassa.' },
 medium: { es: 'Muévete suavemente, para si sientes molestia.', en: 'Move gently, stop if discomfort.', fr: 'Bouge doucement, arrête si inconfort.', it: 'Muoviti delicatamente.' },
 },
 occasional: {
 low: '',
 high: { es: 'Trabaja al 65-70% de tu máximo. Aumenta el peso/ritmo gradualmente.', en: 'Work at 65-70% of your max. Increase gradually.', fr: 'Travaille à 65-70% de ton max. Augmente graduellement.', it: 'Lavora al 65-70% del tuo massimo.' },
 peak: { es: 'Tu mejor semana. Prueba un poco más de intensidad.', en: 'Your best week. Try a bit more intensity.', fr: 'Ta meilleure semaine. Essaie un peu plus d\'intensité.', it: 'La tua settimana migliore.' },
 medium: '',
 },
 regular: {
 low: '',
 high: '',
 peak: { es: 'Semana ideal para aumentar carga. ¡Bate tus marcas!', en: 'Ideal week to increase load. Beat your records!', fr: 'Semaine idéale pour augmenter la charge. Bats tes records!', it: 'Settimana ideale per aumentare il carico.' },
 medium: '',
 },
 athlete: {
 low: { es: 'Semana de recuperación activa. Mantén el movimiento, baja la intensidad.', en: 'Active recovery week. Keep moving, lower intensity.', fr: 'Semaine de récupération active. Garde le mouvement.', it: 'Settimana di recupero attivo.' },
 high: { es: 'Aumenta series o peso. Semana de ganancias.', en: 'Add sets or weight. Gains week.', fr: 'Ajoute des séries ou du poids. Semaine de gains.', it: 'Aggiungi serie o peso.' },
 peak: { es: 'Pico de rendimiento. Competiciones y PRs.', en: 'Performance peak. Competitions and PRs.', fr: 'Pic de performance. Compétitions et PRs.', it: 'Picco di prestazione. Competizioni e PR.' },
 medium: { es: 'Reduce el volumen pero mantén la intensidad.', en: 'Reduce volume but keep intensity.', fr: 'Réduis le volume mais maintiens l\'intensité.', it: 'Riduci il volume ma mantieni l\'intensità.' },
 },
};

// ── Notas por condiciones de salud ────────────────────────────────────────────
const CONDITION_NOTES = {
 endometriosis: {
 menstrual: { es: 'Prioriza movimiento suave. El descanso también es entrenamiento.', en: 'Prioritise gentle movement. Rest is also training.', fr: 'Priorise le mouvement doux. Le repos c\'est aussi de l\'entraînement.', it: 'Priorità al movimento dolce.' },
 luteal: { es: 'Escucha señales de inflamación. Reduce si hay dolor pélvico.', en: 'Listen for inflammation signals. Reduce if pelvic pain.', fr: 'Écoute les signaux d\'inflammation.', it: 'Ascolta i segnali di infiammazione.' },
 },
 pcos: {
 follicular: { es: 'El ejercicio de fuerza mejora la sensibilidad a la insulina. Ideal esta semana.', en: 'Strength training improves insulin sensitivity. Ideal this week.', fr: 'La musculation améliore la sensibilité à l\'insuline.', it: 'L\'allenamento di forza migliora la sensibilità all\'insulina.' },
 luteal: { es: 'Evita el HIIT excesivo que eleva el cortisol. Fuerza moderada o yoga.', en: 'Avoid excessive HIIT that raises cortisol. Moderate strength or yoga.', fr: 'Évite le HIIT excessif qui augmente le cortisol.', it: 'Evita l\'HIIT eccessivo che eleva il cortisolo.' },
 },
 hypothyroid: {
 menstrual: { es: 'Intensidad baja. Tu metabolismo necesita más tiempo de recuperación.', en: 'Low intensity. Your metabolism needs more recovery time.', fr: 'Intensité basse. Ton métabolisme a besoin de plus de récupération.', it: 'Intensità bassa.' },
 luteal: { es: 'Evita el ejercicio de alta intensidad — puede empeorar la fatiga.', en: 'Avoid high intensity — it may worsen fatigue.', fr: 'Évite la haute intensité — peut aggraver la fatigue.', it: 'Evita l\'alta intensità.' },
 },
};

// ── Foco nutricional por fase y dieta ─────────────────────────────────────────
const PHASE_NUTRITION_FOCUS = {
 menstrual: {
 nutrients: { es: ['Hierro', 'Magnesio', 'Omega-3', 'Antiinflamatorios'], en: ['Iron', 'Magnesium', 'Omega-3', 'Anti-inflammatories'], fr: ['Fer', 'Magnésium', 'Oméga-3', 'Anti-inflammatoires'], it: ['Ferro', 'Magnesio', 'Omega-3', 'Antinfiammatori'] },
 tip: { es: 'Combina hierro con vitamina C (lentejas + zumo de naranja). Chocolate negro 85% para el magnesio.', en: 'Pair iron with vitamin C (lentils + orange juice). 85% dark chocolate for magnesium.', fr: 'Associe le fer à la vitamine C. Chocolat noir 85% pour le magnésium.', it: 'Abbina ferro e vitamina C. Cioccolato fondente 85% per il magnesio.' },
 avoidNote: { es: 'Reduce sal, alcohol y azúcar refinado — aumentan la inflamación y retención de líquidos.', en: 'Reduce salt, alcohol and refined sugar — they increase inflammation and water retention.', fr: 'Réduis sel, alcool et sucre raffiné.', it: 'Riduci sale, alcol e zucchero raffinato.' },
 },
 follicular: {
 nutrients: { es: ['Proteína magra', 'Carbohidratos complejos', 'Probióticos', 'Zinc'], en: ['Lean protein', 'Complex carbs', 'Probiotics', 'Zinc'], fr: ['Protéines maigres', 'Glucides complexes', 'Probiotiques', 'Zinc'], it: ['Proteine magre', 'Carboidrati complessi', 'Probiotici', 'Zinco'] },
 tip: { es: 'Tu metabolismo es más eficiente ahora. Buena semana para un pequeño déficit si tu objetivo es perder peso.', en: 'Your metabolism is more efficient now. Good week for a small deficit if weight loss is your goal.', fr: 'Ton métabolisme est plus efficace. Bonne semaine pour un léger déficit.', it: 'Il tuo metabolismo è più efficiente. Buona settimana per un piccolo deficit.' },
 avoidNote: '',
 },
 ovulation: {
 nutrients: { es: ['Zinc', 'Antioxidantes', 'Fibra', 'Comidas ligeras'], en: ['Zinc', 'Antioxidants', 'Fibre', 'Light meals'], fr: ['Zinc', 'Antioxydants', 'Fibres', 'Repas légers'], it: ['Zinco', 'Antiossidanti', 'Fibre', 'Pasti leggeri'] },
 tip: { es: 'Pico de energía: aprovecha para entrenar y prioriza alimentos naturales no procesados.', en: 'Energy peak: great time to train and prioritise natural whole foods.', fr: 'Pic d\'énergie: entraîne-toi et privilégie les aliments naturels.', it: 'Picco di energia: allenati e privilegia alimenti naturali.' },
 avoidNote: '',
 },
 luteal: {
 nutrients: { es: ['Carbohidratos complejos', 'Triptófano', 'Magnesio', 'Grasas saludables'], en: ['Complex carbs', 'Tryptophan', 'Magnesium', 'Healthy fats'], fr: ['Glucides complexes', 'Tryptophane', 'Magnésium', 'Graisses saines'], it: ['Carboidrati complessi', 'Triptofano', 'Magnesio', 'Grassi sani'] },
 tip: { es: 'Los antojos de carbohidratos son normales — elige avena, boniato o arroz integral. El magnesio reduce la retención de líquidos.', en: 'Carb cravings are normal — choose oats, sweet potato or brown rice. Magnesium reduces water retention.', fr: 'Les envies de glucides sont normales — choisis avoine, patate douce ou riz complet.', it: 'I desideri di carboidrati sono normali — scegli avena, patata dolce o riso integrale.' },
 avoidNote: { es: 'Reduce la cafeína y el alcohol — empeoran los síntomas del SPM.', en: 'Reduce caffeine and alcohol — they worsen PMS symptoms.', fr: 'Réduis caféine et alcool — ils aggravent les symptômes du SPM.', it: 'Riduci caffeina e alcol — peggiorano i sintomi del SPM.' },
 },
};

// ── Adaptaciones nutricionales por dieta ──────────────────────────────────────
const DIET_PHASE_NOTES = {
 vegetarian: {
 menstrual: { es: 'Hierro no hemo: espinacas, lentejas, tofu + vitamina C para mejorar absorción.', en: 'Non-haem iron: spinach, lentils, tofu + vitamin C to improve absorption.', fr: 'Fer non héminique: épinards, lentilles, tofu + vitamine C.', it: 'Ferro non eme: spinaci, lenticchie, tofu + vitamina C.' },
 follicular: { es: 'Proteína completa: combina legumbres + cereales (arroz + lentejas, hummus + pan).', en: 'Complete protein: combine legumes + grains (rice + lentils, hummus + bread).', fr: 'Protéine complète: combine légumineuses + céréales.', it: 'Proteina completa: combina legumi + cereali.' },
 },
 vegan: {
 menstrual: { es: 'Hierro: lentejas, garbanzos, espinacas, tofu, semillas de calabaza. Vitamina C en cada comida.', en: 'Iron: lentils, chickpeas, spinach, tofu, pumpkin seeds. Vitamin C with every meal.', fr: 'Fer: lentilles, pois chiches, épinards, tofu, graines de courge.', it: 'Ferro: lenticchie, ceci, spinaci, tofu, semi di zucca.' },
 follicular: { es: 'Asegura B12, omega-3 (semillas de lino/chía) y zinc (semillas de cáñamo, legumbres).', en: 'Ensure B12, omega-3 (flax/chia seeds) and zinc (hemp seeds, legumes).', fr: 'Assure B12, oméga-3 (graines de lin/chia) et zinc.', it: 'Assicura B12, omega-3 (semi di lino/chia) e zinco.' },
 luteal: { es: 'Cacao puro y plátano para el triptófano (serotonina). Nueces y aguacate para el magnesio.', en: 'Pure cacao and banana for tryptophan (serotonin). Walnuts and avocado for magnesium.', fr: 'Cacao pur et banane pour le tryptophane. Noix et avocat pour le magnésium.', it: 'Cacao puro e banana per il triptofano. Noci e avocado per il magnesio.' },
 },
 keto: {
 menstrual: { es: 'En keto menstrual: prioriza grasas antiinflamatorias — salmón, aguacate, aceite de oliva.', en: 'Keto during menstrual: prioritise anti-inflammatory fats — salmon, avocado, olive oil.', fr: 'Keto pendant les règles: priorise les graisses anti-inflammatoires.', it: 'Keto durante le mestruazioni: priorità ai grassi antinfiammatori.' },
 luteal: { es: 'Los antojos de carbohidratos son más intensos en keto+fase lútea. Frutos rojos son tus aliados.', en: 'Carb cravings are stronger in keto+luteal. Berries are your ally.', fr: 'Les envies de glucides sont plus fortes en keto+phase lutéale. Les baies sont tes alliées.', it: 'I desideri di carboidrati sono più forti in keto+fase lutea.' },
 },
 anti_inflammatory: {
 menstrual: { es: 'Fase ideal para tu dieta: cúrcuma, jengibre, omega-3 potencian el efecto antiinflamatorio.', en: 'Ideal phase for your diet: turmeric, ginger, omega-3 enhance the anti-inflammatory effect.', fr: 'Phase idéale pour ton régime: curcuma, gingembre, oméga-3.', it: 'Fase ideale per la tua dieta: curcuma, zenzero, omega-3.' },
 },
 low_carb: {
 luteal: { es: 'En la fase lútea con low carb: añade boniato o avena los días de entreno para gestionar los antojos.', en: 'Luteal phase with low carb: add sweet potato or oats on training days to manage cravings.', fr: 'Phase lutéale avec low carb: ajoute patate douce ou avoine les jours d\'entraînement.', it: 'Fase lutea con low carb: aggiungi patata dolce o avena nei giorni di allenamento.' },
 },
 mediterranean: {
 menstrual: { es: 'Dieta mediterránea + menstrual: aceite de oliva, sardinas, nueces y frutos rojos son perfectos esta semana.', en: 'Mediterranean + menstrual: olive oil, sardines, walnuts and berries are perfect this week.', fr: 'Méditerranée + menstruel: huile d\'olive, sardines, noix et baies sont parfaits.', it: 'Mediterranea + mestruale: olio d\'oliva, sardine, noci e frutti di bosco sono perfetti.' },
 },
};

// ── Condiciones nutricionales ─────────────────────────────────────────────────
const CONDITION_NUTRITION = {
 pcos: {
 menstrual: { es: 'SOP: evita picos de insulina — elige carbohidratos de bajo IG y come cada 3-4h.', en: 'PCOS: avoid insulin spikes — choose low-GI carbs and eat every 3-4h.', fr: 'SMOP: évite les pics d\'insuline — choisis des glucides à faible IG.', it: 'PCOS: evita picchi di insulina — scegli carboidrati a basso IG.' },
 luteal: { es: 'SOP + fase lútea: el inositol y el magnesio pueden reducir los antojos y la resistencia insulínica.', en: 'PCOS + luteal: inositol and magnesium may reduce cravings and insulin resistance.', fr: 'SMOP + lutéale: inositol et magnésium peuvent réduire les envies.', it: 'PCOS + lutea: inositolo e magnesio possono ridurre i desideri.' },
 },
 endometriosis: {
 menstrual: { es: 'Endometriosis: prioriza alimentos antiinflamatorios. Evita gluten y lácteos si te generan síntomas.', en: 'Endometriosis: prioritise anti-inflammatory foods. Avoid gluten and dairy if they cause symptoms.', fr: 'Endométriose: priorise les aliments anti-inflammatoires.', it: 'Endometriosi: privilegia gli alimenti antinfiammatori.' },
 },
 type2_diabetes: {
 all: { es: 'Diabetes tipo 2: controla las porciones de carbohidratos. Los alimentos de bajo IG son clave.', en: 'Type 2 diabetes: control carbohydrate portions. Low-GI foods are key.', fr: 'Diabète type 2: contrôle les portions de glucides.', it: 'Diabete tipo 2: controlla le porzioni di carboidrati.' },
 },
};

// ─────────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera el plan de entrenos de la semana personalizado.
 *
 * @param {string} phase fase actual del ciclo
 * @param {number[]} trainDays días JS [0-6] en que entrena la usuaria
 * @param {string} fitnessLevel sedentary|occasional|regular|athlete
 * @param {string[]} conditions condiciones de salud
 * @returns {Object} { [jsDay: number]: workout } — solo días de entreno
 */
export function buildWeekPlan(phase, trainDays = [], fitnessLevel = 'regular', conditions = []) {
 if (!phase || !trainDays.length) return {};

 const phaseData = PHASES[phase];
 if (!phaseData?.week) return {};

 // Extraer workouts activos de la fase (los días de descanso los ignoramos)
 const activeWorkouts = phaseData.week.filter(w => w.on && w.name);

 if (!activeWorkouts.length) return {};

 const sorted = [...trainDays].sort((a, b) => a - b);
 const config = PHASE_CONFIG[phase] || PHASE_CONFIG.follicular;

 const plan = {};
 sorted.forEach((jsDay, i) => {
 const base = activeWorkouts[i % activeWorkouts.length];
 plan[jsDay] = {
 ...base,
 fitnessNote: getFitnessNote(fitnessLevel, config.level),
 conditionNote: getConditionWorkoutNote(conditions, phase),
 phaseColor: phaseData.color,
 phaseIntensity: config.intensityPct,
 };
 });

 return plan;
}

/**
 * Devuelve el entreno de HOY para la usuaria.
 * Si hoy no es día de entreno devuelve null.
 */
export function getTodayWorkout(phase, trainDays = [], fitnessLevel = 'regular', conditions = []) {
 const jsDay = new Date().getDay();
 const plan = buildWeekPlan(phase, trainDays, fitnessLevel, conditions);
 return plan[jsDay] || null;
}

/**
 * Devuelve el contexto nutricional del día: foco de la fase + adaptación dieta + condiciones.
 */
export function getDayNutritionContext(phase, diet, conditions = [], lang = 'es') {
 const focus = PHASE_NUTRITION_FOCUS[phase];
 if (!focus) return null;

 const L = (obj) => (typeof obj === 'object' ? (obj[lang] || obj.es || '') : (obj || ''));

 const nutrients = L(focus.nutrients); // array → join
 const tip = L(focus.tip);
 const avoidNote = L(focus.avoidNote);

 // Nota específica para la dieta + fase
 const dietNote = diet
 ? L(DIET_PHASE_NOTES[diet]?.[phase] || DIET_PHASE_NOTES[diet]?.all || '')
 : '';

 // Nota específica para condiciones
 const condNotes = conditions
 .map(c => L(CONDITION_NUTRITION[c]?.[phase] || CONDITION_NUTRITION[c]?.all || ''))
 .filter(Boolean);

 return {
 nutrients: Array.isArray(nutrients) ? nutrients : [nutrients],
 tip,
 avoidNote,
 dietNote,
 conditionNotes: condNotes,
 };
}

// ── Helpers privados ──────────────────────────────────────────────────────────

function getFitnessNote(fitnessLevel, intensityLevel) {
 const map = FITNESS_NOTES[fitnessLevel] || FITNESS_NOTES.regular;
 const note = map[intensityLevel];
 if (!note) return '';
 return typeof note === 'object' ? note : '';
}

function getConditionWorkoutNote(conditions = [], phase) {
 if (!conditions.length) return null;
 for (const cond of conditions) {
 const note = CONDITION_NOTES[cond]?.[phase];
 if (note) return note;
 }
 return null;
}
