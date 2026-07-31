import { supabase } from '../lib/supabase';

// ── RECETAS ────────────────────────────────────────────────────────────────────

const MEAL_ORDER = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'snack'];
const DB_TO_SLOT_ID = {
 breakfast: 'desayuno',
 morning_snack: 'snack_manana',
 lunch: 'almuerzo',
 afternoon_snack: 'snack_tarde',
 dinner: 'cena',
 snack: 'snack_tarde',
};
const MEAL_LABELS = {
 es: { breakfast: 'Desayuno', morning_snack: 'Snack mañana', lunch: 'Almuerzo', afternoon_snack: 'Snack tarde', dinner: 'Cena', snack: 'Snack' },
 en: { breakfast: 'Breakfast', morning_snack: 'Morning snack', lunch: 'Lunch', afternoon_snack: 'Afternoon snack', dinner: 'Dinner', snack: 'Snack' },
 fr: { breakfast: 'Petit-déjeuner', morning_snack: 'Collation matin', lunch: 'Déjeuner', afternoon_snack: 'Goûter', dinner: 'Dîner', snack: 'En-cas' },
 it: { breakfast: 'Colazione', morning_snack: 'Spuntino mattina', lunch: 'Pranzo', afternoon_snack: 'Merenda', dinner: 'Cena', snack: 'Spuntino' },
};

export async function fetchRecipesByPhase(phase, lang = 'es') {
 try {
 const { data, error } = await supabase
 .from('recipes')
 .select('id,meal_type,emoji,title,ingredients,steps,kcal,protein_g,carbs_g,fat_g,fiber_g,diets,phases,goals,contains_allergens,difficulty,display_order')
 .contains('phases', [phase])
 .order('display_order');

 if (error || !data?.length) return null;

 return data.map(r => ({
 id: r.id,
 phase,
 meal_type: r.meal_type,
 title: r.title?.[lang] || r.title?.es || '',
 emoji: '',
 kcal: r.kcal,
 protein_g: r.protein_g,
 carbs_g: r.carbs_g,
 fat_g: r.fat_g,
 fiber_g: r.fiber_g,
 diets: r.diets || [],
 phases: r.phases || [],
 goals: r.goals || [],
 contains_allergens: r.contains_allergens || [],
 difficulty: r.difficulty,
 ingredients: r.ingredients?.[lang] || r.ingredients?.es || [],
 steps: r.steps?.[lang] || r.steps?.es || [],
 }));
 } catch (e) {
 console.error('fetchRecipesByPhase error:', e);
 return null;
 }
}

// Convierte recetas de Supabase al formato que usa la app (meals array)
export function mapRecipesToMeals(recipes, lang = 'es') {
 if (!recipes?.length) return null;

 const labels = MEAL_LABELS[lang] || MEAL_LABELS.es;
 const sorted = [...recipes].sort(
 (a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type)
 );

 return sorted.map(r => ({
 id: DB_TO_SLOT_ID[r.meal_type] || r.meal_type,
 t: labels[r.meal_type] || r.meal_type,
 ico: '',
 title: r.title,
 items: r.ingredients.slice(0, 3),
 macros: r.kcal ? { kcal: r.kcal, protein: r.protein_g, carbs: r.carbs_g, fat: r.fat_g } : null,
 recipe: {
 ingredients: r.ingredients,
 steps: r.steps,
 },
 }));
}

// ── EJERCICIOS ─────────────────────────────────────────────────────────────────

export async function fetchWorkoutSessionsByPhase(phase, lang = 'es') {
 try {
 const { data, error } = await supabase
 .from('workouts')
 .select('id,workout_type,emoji,name,description,duration_min,intensity,est_calories,phases,exercises,tips,goals,good_for,equipment,display_order')
 .contains('phases', [phase])
 .order('display_order');

 if (error || !data?.length) return null;

 return data.map(w => ({
 id: w.id,
 phase,
 workout_type: w.workout_type,
 name: w.name?.[lang] || w.name?.es || '',
 description: w.description?.[lang] || w.description?.es || '',
 emoji: w.emoji,
 duration: w.duration_min,
 intensity: w.intensity,
 est_calories: w.est_calories,
 goals: w.goals || [],
 good_for: w.good_for || [],
 equipment: w.equipment || [],
 exercises: w.exercises?.[lang] || w.exercises?.es || [],
 tips: w.tips?.[lang] || w.tips?.es || [],
 }));
 } catch (e) {
 console.error('fetchWorkoutSessionsByPhase error:', e);
 return null;
 }
}

// Convierte workouts de Supabase al formato week[] que usa la app
export function mapSessionsToWeek(sessions) {
 if (!sessions?.length) return null;

 return sessions.map(s => ({
 name: s.name,
 dur: s.duration ? `${s.duration}'` : '',
 ico: s.emoji || '',
 on: true,
 intensity: s.intensity,
 workout_type: s.workout_type,
 exercises: s.exercises,
 tips: s.tips,
 }));
}

// ── ARTÍCULOS ──────────────────────────────────────────────────────────────────

// Carga los artículos de Supabase. Devuelve array en el mismo formato que ARTICLES local.
export async function fetchArticles() {
 try {
 const { data, error } = await supabase
 .from('articles')
 .select('*')
 .eq('active', true)
 .order('sort_order');

 if (error || !data?.length) return null;

 return data.map(a => ({
 id: a.id,
 category: a.category,
 icon: a.icon,
 readTime: a.read_time,
 title: { es: a.title_es, en: a.title_en, fr: a.title_fr },
 summary: { es: a.summary_es, en: a.summary_en, fr: a.summary_fr },
 body: { es: a.body_es, en: a.body_en, fr: a.body_fr },
 }));
 } catch (e) {
 console.error('fetchArticles error:', e);
 return null;
 }
}

// ── SYMPTOM INSIGHTS ──────────────────────────────────────────────────────────

// Carga un insight de síntoma de Supabase. Devuelve { why, helps } o null.
export async function fetchSymptomInsight(category, symptom, phase, lang = 'es') {
 try {
 const { data, error } = await supabase
 .from('symptom_insights')
 .select('why_es,why_en,why_fr,why_it,helps_es,helps_en,helps_fr,helps_it')
 .eq('category', category)
 .eq('symptom', symptom)
 .eq('phase', phase)
 .maybeSingle();

 if (error || !data) {
 // Fallback: try 'default' phase
 if (phase !== 'default') return fetchSymptomInsight(category, symptom, 'default', lang);
 return null;
 }

 const l = ['es', 'en', 'fr', 'it'].includes(lang) ? lang : 'es';
 return {
 why: data[`why_${l}`] || data.why_es || '',
 helps: data[`helps_${l}`] || data.helps_es || '',
 };
 } catch (e) {
 console.error('fetchSymptomInsight error:', e);
 return null;
 }
}

// ── METADATOS DE FASE ──────────────────────────────────────────────────────────

// Carga metadatos de fase de Supabase (tagline, desc, tip, kcal en los 3 idiomas).
export async function fetchPhaseMeta(phase) {
 try {
 const { data, error } = await supabase
 .from('phase_meta')
 .select('*')
 .eq('id', phase)
 .single();

 if (error || !data) return null;

 return {
 emoji: data.emoji,
 color: data.color,
 light: data.color_light,
 mid: data.color_mid,
 tagline: { es: data.tagline_es, en: data.tagline_en, fr: data.tagline_fr },
 desc: { es: data.desc_es, en: data.desc_en, fr: data.desc_fr },
 focus: data.focus,
 kcal: { es: data.kcal_es, en: data.kcal_en, fr: data.kcal_fr },
 intensity: data.intensity,
 intensityPct: data.intensity_pct,
 tip: { es: data.tip_es, en: data.tip_en, fr: data.tip_fr },
 };
 } catch (e) {
 console.error('fetchPhaseMeta error:', e);
 return null;
 }
}

// ── HOOK COMBINADO ─────────────────────────────────────────────────────────────

// Carga recetas, sesiones y metadatos para una fase, con fallback a datos estáticos
export async function fetchPhaseData(phase, staticPhaseData, lang = 'es') {
 const [recipes, sessions, meta] = await Promise.all([
 fetchRecipesByPhase(phase, lang),
 fetchWorkoutSessionsByPhase(phase, lang),
 fetchPhaseMeta(phase),
 ]);

 const meals = mapRecipesToMeals(recipes, lang);
 const week = mapSessionsToWeek(sessions);

 // Apply multilingual meta if available
 const metaOverrides = meta ? {
 tagline: meta.tagline?.[lang] || meta.tagline?.es || staticPhaseData.tagline,
 desc: meta.desc?.[lang] || meta.desc?.es || staticPhaseData.desc,
 kcal: meta.kcal?.[lang] || meta.kcal?.es || staticPhaseData.kcal,
 tip: meta.tip?.[lang] || meta.tip?.es || staticPhaseData.tip,
 focus: meta.focus || staticPhaseData.focus,
 intensity: meta.intensity || staticPhaseData.intensity,
 intensityPct: meta.intensityPct ?? staticPhaseData.intensityPct,
 } : {};

 return {
 ...staticPhaseData,
 ...metaOverrides,
 meals: meals || staticPhaseData.meals,
 week: week || staticPhaseData.week,
 };
}