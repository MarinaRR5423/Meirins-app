import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFoodLog(dateStr) {
  const [logs, setLogs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else setLoading(false);
    });
  }, []);

  const load = useCallback(async () => {
    if (!userId || !dateStr) return;
    const { data } = await supabase
      .from('food_logs')
      .select('meal_type, recipe_id, kcal, protein_g, carbs_g, fat_g, fiber_g')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('created_at');
    setLogs(data || []);
    setLoading(false);
  }, [userId, dateStr]);

  useEffect(() => {
    if (userId) load();
  }, [load, userId]);

  const consumed = logs.reduce(
    (acc, l) => ({
      kcal: acc.kcal + (l.kcal || 0),
      protein_g: acc.protein_g + (l.protein_g || 0),
      carbs_g: acc.carbs_g + (l.carbs_g || 0),
      fat_g: acc.fat_g + (l.fat_g || 0),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  // Slugs de meal_type con log guardado hoy
  const loggedSlots = new Set(logs.map(l => l.meal_type));

  const logRecipe = useCallback(
    async (meal) => {
      if (!userId || !meal?._recipeId || !meal?.macros) return;
      // Upsert: borrar el anterior del mismo slot y reinsertar
      await supabase
        .from('food_logs')
        .delete()
        .eq('user_id', userId)
        .eq('date', dateStr)
        .eq('meal_type', meal.id);
      const m = meal.macros;
      await supabase.from('food_logs').insert({
        user_id: userId,
        date: dateStr,
        meal_type: meal.id,
        recipe_id: meal._recipeId,
        display_name: meal.title,
        kcal: m.kcal ?? null,
        protein_g: m.protein ?? null,
        carbs_g: m.carbs ?? null,
        fat_g: m.fat ?? null,
        source: 'recipe',
      });
      load();
    },
    [userId, dateStr, load]
  );

  const unlogRecipe = useCallback(
    async (mealType) => {
      if (!userId) return;
      await supabase
        .from('food_logs')
        .delete()
        .eq('user_id', userId)
        .eq('date', dateStr)
        .eq('meal_type', mealType);
      load();
    },
    [userId, dateStr, load]
  );

  return { logs, consumed, loggedSlots, loading, logRecipe, unlogRecipe };
}
