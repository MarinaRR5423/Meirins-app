import { useMemo } from 'react';
import { useRecipes } from './useRecipes';
import { useDiets, normalizeDietId } from './useDiets';
import { appMealToDbMealType, recipeToMealCard, getDailyRecipe } from '../utils/recipeEngine';
import { filterMealsByFasting } from '../utils/fastingMeals';
import { calcCalories } from '../utils/calories';

const MEAL_SLOTS = [
  { id: 'desayuno',     ico: '🌅', label: 'breakfast' },
  { id: 'snack_manana', ico: '🍎', label: 'morning_snack' },
  { id: 'almuerzo',    ico: '☀️', label: 'lunch' },
  { id: 'snack_tarde', ico: '🌿', label: 'afternoon_snack' },
  { id: 'cena',        ico: '🌙', label: 'dinner' },
];

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Hook compartido entre HomeScreen y NutriScreen.
 * Una sola llamada a useRecipes → una sola query a Supabase.
 */
export function useTodayMenu({ phase, lang = 'es', profileExtended, goal, activityLevel, weight, height, age, trainDays }) {
  const { recipes: allRecipes, loading: recipesLoading } = useRecipes();
  const { getDiet } = useDiets(lang);

  const currentDietId = normalizeDietId(profileExtended?.diet || '');
  const cals = calcCalories({ weight, height, age, activityLevel, goal, trainDays }, phase);

  const fastingProtocol = profileExtended?.fastingProtocol || null;
  const mealsActive = profileExtended?.mealsActive || null;
  const activeSlots = useMemo(
    () => filterMealsByFasting(MEAL_SLOTS, fastingProtocol, mealsActive),
    [fastingProtocol, mealsActive],
  );

  const skippedToday = profileExtended?.skippedToday || {};
  const skippedRecipeIds = useMemo(() => {
    if (skippedToday.date !== TODAY) return [];
    return Object.keys(skippedToday)
      .filter(k => k !== 'date')
      .flatMap(k => skippedToday[k] || []);
  }, [skippedToday]);

  const userProfile = useMemo(() => ({
    diet: currentDietId,
    goal,
    allergies: profileExtended?.allergies || [],
    foodDislikes: profileExtended?.foodDislikes || [],
    conditions: profileExtended?.conditions || [],
    lifeStage: profileExtended?.lifeStage || null,
    cookingTime: profileExtended?.cookingTime || null,
    weeklyBudget: profileExtended?.weeklyBudget || null,
    favoriteRecipes: profileExtended?.favoriteRecipes || [],
    skippedRecipeIds,
    totalDailyKcal: cals?.total || null,
  }), [currentDietId, goal, profileExtended, skippedRecipeIds, cals?.total]);

  const todayMenu = useMemo(() => {
    const meals = allRecipes?.length
      ? activeSlots.map(slot => {
          const dbMealType = appMealToDbMealType(slot.id);
          const recipe = getDailyRecipe(allRecipes, userProfile, phase, dbMealType, TODAY);
          if (!recipe) return { ...slot, title: null, items: [], _personalized: false };
          const card = recipeToMealCard(recipe, lang);
          if (!card) return { ...slot, title: null, items: [], _personalized: false };
          return {
            ...slot,
            ico: card.ico,
            title: card.title,
            items: card.items,
            recipe: card.recipe,
            macros: card.macros,
            _personalized: true,
            _recipeId: recipe.id,
          };
        })
      : activeSlots.map(s => ({ ...s, title: null, items: [], _personalized: false }));

    return { meals };
  }, [allRecipes, recipesLoading, userProfile, phase, lang, activeSlots]);

  return { todayMenu, activeSlots, allRecipes, userProfile, recipesLoading };
}
