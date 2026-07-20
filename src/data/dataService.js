import { supabase } from '../lib/supabase';

// ── RECETAS ────────────────────────────────────────────────────────────────────

export async function fetchRecipesByPhase(phase) {
  try {
    const { data: recipes, error } = await supabase
      .from('2.recipes')
      .select('*')
      .eq('phase_key', phase)
      .order('meal_type');

    if (error || !recipes?.length) return null;

    // Para cada receta, cargamos ingredientes y pasos
    const enriched = await Promise.all(
      recipes.map(async (recipe) => {
        const [{ data: ingredients }, { data: steps }] = await Promise.all([
          supabase
            .from('3.recipe_ingredients')
            .select('ingredient, sort_order')
            .eq('recipe_id', recipe.id)
            .order('sort_order'),
          supabase
            .from('recipe_steps')
            .select('step_number, description')
            .eq('recipe_id', recipe.id)
            .order('step_number'),
        ]);

        return {
          id: recipe.id,
          phase: recipe.phase_key,
          meal_type: recipe.meal_type,
          title: recipe.title,
          emoji: recipe.emoji,
          dairy_free: recipe.dairy_free,
          gluten_free: recipe.gluten_free,
          vegan: recipe.vegan,
          ingredients: ingredients?.map(i => i.ingredient) || [],
          steps: steps?.map(s => s.description) || [],
        };
      })
    );

    return enriched;
  } catch (e) {
    console.error('fetchRecipesByPhase error:', e);
    return null;
  }
}

// Convierte recetas de Supabase al formato que usa la app (meals array)
export function mapRecipesToMeals(recipes) {
  if (!recipes?.length) return null;

  const MEAL_ORDER = ['desayuno', 'almuerzo', 'cena', 'snack'];
  const MEAL_LABELS = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snacks' };

  const sorted = [...recipes].sort(
    (a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type)
  );

  return sorted.map(r => ({
    t: MEAL_LABELS[r.meal_type] || r.meal_type,
    ico: r.emoji,
    title: r.title,
    items: r.ingredients.slice(0, 3),
    recipe: {
      ingredients: r.ingredients,
      steps: r.steps,
    },
  }));
}

// ── EJERCICIOS ─────────────────────────────────────────────────────────────────

export async function fetchWorkoutSessionsByPhase(phase) {
  try {
    const { data: sessions, error } = await supabase
      .from('4.workout_sessions')
      .select('*')
      .eq('phase_key', phase)
      .eq('is_rest_day', false)
      .order('sort_order');

    if (error || !sessions?.length) return null;

    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const { data: sessionExercises } = await supabase
          .from('6.session_exercises')
          .select(`
            sets,
            reps,
            duration,
            sort_order,
            exercise_catalog_id,
            5.exercise_catalog (name, category, muscle_groups, equipment, description)
          `)
          .eq('workout_session_id', session.id)
          .order('sort_order');

        const exercises = sessionExercises?.map(se => ({
          name: se['5.exercise_catalog']?.name || '',
          sets: se.sets || null,
          reps: se.reps || null,
          dur: se.duration || null,
        })) || [];

        return {
          id: session.id,
          phase: session.phase_key,
          day_index: session.day_index,
          name: session.name,
          emoji: session.emoji,
          duration: session.duration,
          is_rest_day: session.is_rest_day,
          exercises,
        };
      })
    );

    return enriched;
  } catch (e) {
    console.error('fetchWorkoutSessionsByPhase error:', e);
    return null;
  }
}

// Convierte sesiones de Supabase al formato week[] que usa la app
export function mapSessionsToWeek(sessions) {
  if (!sessions?.length) return null;

  const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return sessions.map(s => ({
    d: DAY_SHORT[s.day_index] || '?',
    name: s.name,
    dur: s.duration || '',
    ico: s.emoji || '💪',
    on: !s.is_rest_day,
    exercises: s.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      dur: ex.dur,
    })),
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
      title:   { es: a.title_es,   en: a.title_en,   fr: a.title_fr   },
      summary: { es: a.summary_es, en: a.summary_en, fr: a.summary_fr },
      body:    { es: a.body_es,    en: a.body_en,    fr: a.body_fr    },
    }));
  } catch (e) {
    console.error('fetchArticles error:', e);
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
      emoji:        data.emoji,
      color:        data.color,
      light:        data.color_light,
      mid:          data.color_mid,
      tagline:      { es: data.tagline_es, en: data.tagline_en, fr: data.tagline_fr },
      desc:         { es: data.desc_es,    en: data.desc_en,    fr: data.desc_fr    },
      focus:        data.focus,
      kcal:         { es: data.kcal_es,    en: data.kcal_en,    fr: data.kcal_fr    },
      intensity:    data.intensity,
      intensityPct: data.intensity_pct,
      tip:          { es: data.tip_es,     en: data.tip_en,     fr: data.tip_fr     },
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
    fetchRecipesByPhase(phase),
    fetchWorkoutSessionsByPhase(phase),
    fetchPhaseMeta(phase),
  ]);

  const meals = mapRecipesToMeals(recipes);
  const week = mapSessionsToWeek(sessions);

  // Apply multilingual meta if available
  const metaOverrides = meta ? {
    tagline:      meta.tagline?.[lang] || meta.tagline?.es || staticPhaseData.tagline,
    desc:         meta.desc?.[lang]    || meta.desc?.es    || staticPhaseData.desc,
    kcal:         meta.kcal?.[lang]    || meta.kcal?.es    || staticPhaseData.kcal,
    tip:          meta.tip?.[lang]     || meta.tip?.es     || staticPhaseData.tip,
    focus:        meta.focus           || staticPhaseData.focus,
    intensity:    meta.intensity       || staticPhaseData.intensity,
    intensityPct: meta.intensityPct    ?? staticPhaseData.intensityPct,
  } : {};

  return {
    ...staticPhaseData,
    ...metaOverrides,
    meals: meals || staticPhaseData.meals,
    week: week || staticPhaseData.week,
  };
}