import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Modal, TextInput } from 'react-native';
import { F } from '../theme/fonts';
import { Check, X, ChevronRight, ChevronLeft, RefreshCcw, Heart } from 'lucide-react-native';
import SwipeableTabs from '../components/SwipeableTabs';
import T, { getMealLabel, getPhaseDisplay } from '../i18n/translations';
import { PHASES } from '../data/phases';
import { INGREDIENTS, formatQty, locName, locCat } from '../data/ingredients';
import { usePhaseData } from '../hooks/usePhaseData';
import { TIPS_NUTRI, resolveTips } from '../data/marinaProgram';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import { NutriSetupCard } from '../components/TabSetupCard';
import { calcCalories } from '../utils/calories';
import { useDiets, normalizeDietId } from '../hooks/useDiets';
import { getDayNutritionContext } from '../utils/programEngine';
import { filterMealsByFasting } from '../utils/fastingMeals';
import { useRecipes } from '../hooks/useRecipes';
import { getRecipesForMeal, appMealToDbMealType, recipeToMealCard, getDailyRecipe } from '../utils/recipeEngine';
import { buildShoppingList, formatQuantity, countItems } from '../utils/shoppingList';
import { trackScreen } from '../lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WaterCard from '../components/WaterCard';
// nutritionRules ya no se usa para override de display — las reglas actúan en recipeEngine

const NUTRI_ARTICLE_IDS = ['nutrition-menstrual', 'endometriosis-nutrition', 'pcos-hormones', 'pregnancy-nutrition'];
const nutriArticles = ARTICLES.filter(a => NUTRI_ARTICLE_IDS.includes(a.id));

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

// Batch cooking: tipos de día (estructura sin comidas — contenido viene de Supabase)
function getDayType(jsDay) {
  if (jsDay === 0) return 'free';
  if ([1, 3, 5].includes(jsDay)) return 'A';
  return 'B';
}
const DAY_TYPES = {
  A:    { key: 'A',    color: '#DBEAFE', textColor: '#1D4ED8' },
  B:    { key: 'B',    color: '#DCFCE7', textColor: '#15803D' },
  free: { key: 'free', color: '#FEF3C7', textColor: '#92400E' },
};
function getDayTypeLabels(lang) {
  return {
    A:    { label: lang === 'en' ? 'Day A' : lang === 'fr' ? 'Jour A' : lang === 'it' ? 'Giorno A' : 'Día A',    tag: lang === 'en' ? 'Mon · Wed · Fri' : lang === 'fr' ? 'Lun · Mer · Ven' : lang === 'it' ? 'Lun · Mer · Ven' : 'Lun · Mié · Vie' },
    B:    { label: lang === 'en' ? 'Day B' : lang === 'fr' ? 'Jour B' : lang === 'it' ? 'Giorno B' : 'Día B',    tag: lang === 'en' ? 'Tue · Thu · Sat' : lang === 'fr' ? 'Mar · Jeu · Sam' : lang === 'it' ? 'Mar · Gio · Sab' : 'Mar · Jue · Sáb' },
    free: { label: lang === 'en' ? 'Free day' : lang === 'fr' ? 'Journée libre' : lang === 'it' ? 'Giorno libero' : 'Día libre', tag: lang === 'en' ? 'Sunday' : lang === 'fr' ? 'Dimanche' : lang === 'it' ? 'Domenica' : 'Domingo' },
  };
}

function buildShopping(weekDays, adults, children, lang = 'es') {
  const portions = adults + children * 0.6;
  const pDays = {};
  weekDays.forEach(d => { pDays[d.phase] = (pDays[d.phase] || 0) + 1; });
  const merged = {};
  Object.entries(pDays).forEach(([phase, days]) => {
    INGREDIENTS[phase].forEach(cat => {
      const catLabel = locCat(cat.cat, lang);
      cat.items.forEach(item => {
        // Use ES name as stable key (language-independent), display resolved name
        const esName = typeof item.name === 'string' ? item.name : item.name.es;
        const key = esName + '_' + item.unit;
        const displayName = locName(item.name, lang);
        if (!merged[key]) merged[key] = { name: displayName, unit: item.unit, totalQty: 0, cat: catLabel };
        merged[key].totalQty += item.qty * days * portions;
      });
    });
  });
  const byCat = {};
  Object.values(merged).forEach(item => {
    if (!byCat[item.cat]) byCat[item.cat] = [];
    byCat[item.cat].push(item);
  });
  return byCat;
}

function MealCard({ meal, expanded, onToggle, onRecipe, seeRecipeLabel, mealLabelFn,
                   isFavorite, onToggleFavorite, onSwap, onLogStatus, logStatus }) {
  const displayTitle = meal.title || meal.items?.[0] || '';
  const m = meal.macros;
  return (
    <View style={mc.card}>
      <TouchableOpacity style={mc.header} onPress={onToggle} activeOpacity={0.85}>
        <View style={{ flex: 1 }}>
          <Text style={mc.slot}>{meal.ico} {mealLabelFn ? mealLabelFn(meal.label) : meal.label}</Text>
          <Text style={mc.title}>{displayTitle}</Text>
        </View>
        <Text style={mc.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {m?.kcal != null && (
        <View style={mc.tagsRow}>
          <View style={mc.tag}><Text style={mc.tagTxt}>{m.kcal} kcal</Text></View>
          <View style={mc.tag}><Text style={mc.tagTxt}>P: {m.protein}g</Text></View>
          <View style={mc.tag}><Text style={mc.tagTxt}>H: {m.carbs}g</Text></View>
          <View style={mc.tag}><Text style={mc.tagTxt}>G: {m.fat}g</Text></View>
        </View>
      )}

      {expanded && (
        <View style={mc.detail}>
          {(meal.items || []).map((it, i) => (
            <View key={i} style={mc.listRow}>
              <View style={mc.dot} />
              <Text style={mc.listText}>{it}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={mc.actionsBlock}>
        {meal.recipe && (
          <TouchableOpacity onPress={() => onRecipe(meal.recipe, meal.label)}>
            <Text style={mc.recipeLink}>{seeRecipeLabel || 'Ver receta'}</Text>
          </TouchableOpacity>
        )}
        {meal._personalized && (
          <View style={mc.actionRow}>
            {onSwap && (
              <TouchableOpacity onPress={onSwap} style={mc.actionBtn}>
                <RefreshCcw size={16} color="#260E01" />
              </TouchableOpacity>
            )}
            {onToggleFavorite && meal._recipeId && (
              <TouchableOpacity onPress={onToggleFavorite} style={mc.actionBtn}>
                <Heart size={16} color="#260E01" fill={isFavorite ? '#260E01' : 'none'} />
              </TouchableOpacity>
            )}
            {onLogStatus && (
              <TouchableOpacity onPress={() => onLogStatus(logStatus === 'done' ? null : 'done')} style={mc.actionBtn}>
                <Check size={16} color="#260E01" strokeWidth={logStatus === 'done' ? 3 : 2} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const mc = StyleSheet.create({
  card: { backgroundColor: '#FE6004', borderRadius: 24, padding: 16, marginBottom: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  slot: { fontSize: 14, color: '#260E01' },
  title: { fontSize: 20, fontWeight: '800', color: '#260E01', marginTop: 2, fontFamily: F.headingX },
  chevron: { color: '#260E01', fontSize: 14, flexShrink: 0 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
  tag: { height: 24, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'white', justifyContent: 'center' },
  tagTxt: { fontSize: 10, fontWeight: '600', color: '#260E01', textTransform: 'uppercase', letterSpacing: 0.3 },
  detail: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, padding: 12, marginBottom: 12, gap: 6 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#260E01' },
  listText: { fontSize: 14, color: '#260E01', flex: 1 },
  actionsBlock: { gap: 12 },
  recipeLink: { fontSize: 14, color: '#260E01', textDecorationLine: 'underline' },
  actionRow: { flexDirection: 'row', gap: 2 },
  actionBtn: { flex: 1, height: 32, borderRadius: 8, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
});

export default function NutriScreen({ pi, program, lang = 'es', goal, activityLevel, dietary, profileExtended, saveAll, saveProfileExtended, age, weight, height, trainDays, toggleFavoriteRecipe, skipRecipe, logRecipeDone }) {
  useEffect(() => { trackScreen('Nutrición', { phase: pi?.phase, goal }); }, []);
  const [sub, setSub] = useState('plan');
  const [weekOffset, setWeekOffset] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});

  // Cargar checks guardados al cambiar de semana
  useEffect(() => {
    const key = `shopChecks_${weekOffset}`;
    AsyncStorage.getItem(key).then(val => {
      setCheckedItems(val ? JSON.parse(val) : {});
    });
  }, [weekOffset]);

  // Guardar checks cuando cambian
  useEffect(() => {
    const key = `shopChecks_${weekOffset}`;
    AsyncStorage.setItem(key, JSON.stringify(checkedItems));
  }, [checkedItems, weekOffset]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [openM, setOpenM] = useState(null);
  const [openD, setOpenD] = useState(null);
  const [openPlan, setOpenPlan] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [altMeal, setAltMeal] = useState({});
  // Extras de calorías
  const todayExtrasKey = `extra_foods_${new Date().toISOString().split('T')[0]}`;
  const [extras, setExtras] = useState([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraKcalStr, setExtraKcalStr] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(todayExtrasKey).then(v => { if (v) try { setExtras(JSON.parse(v)); } catch {} });
  }, [todayExtrasKey]);

  const saveExtras = (newExtras) => {
    setExtras(newExtras);
    AsyncStorage.setItem(todayExtrasKey, JSON.stringify(newExtras));
  };

  const addExtra = () => {
    const kcal = parseInt(extraKcalStr, 10);
    if (!extraName.trim() || !kcal) return;
    saveExtras([...extras, { name: extraName.trim(), kcal }]);
    setExtraName(''); setExtraKcalStr(''); setShowAddExtra(false);
  };

  const removeExtra = (i) => saveExtras(extras.filter((_, idx) => idx !== i));
  const { phaseData } = usePhaseData(pi?.phase);
  const d = phaseData;
  const totalPeople = adults + children;
  const n = (T[lang] || T.es).nutri;
  const cm = (T[lang] || T.es).common;

  // ── Calorías personalizadas ─────────────────────────────────────────────────
  const cals = calcCalories({ weight, height, age, activityLevel, goal, trainDays }, pi?.phase);
  // Calculado tarde (después de todayMenu) — se usa sólo en el render, no aquí

  // ── Dieta desde Supabase ─────────────────────────────────────────────────────
  const { getDiet } = useDiets(lang);
  const currentDietId = normalizeDietId(profileExtended?.diet || '');
  const dietData      = currentDietId ? getDiet(currentDietId) : null;
  const [dietOpen, setDietOpen] = useState(false);

  // ── Contexto nutricional del día (fase + dieta + condiciones) ────────────────
  const nutritionCtx = getDayNutritionContext(
    pi?.phase,
    currentDietId || null,
    profileExtended?.conditions || [],
    lang,
  );

  const tipsNutri = resolveTips(program?.tipsNutri ?? TIPS_NUTRI, lang);

  // Slots de comida — estructura fija, contenido 100% desde Supabase
  const MEAL_SLOTS = [
    { id: 'desayuno',     ico: '🌅', label: 'breakfast' },
    { id: 'snack_manana', ico: '🍎', label: 'morning_snack' },
    { id: 'almuerzo',     ico: '☀️', label: 'lunch' },
    { id: 'snack_tarde',  ico: '🍊', label: 'afternoon_snack' },
    { id: 'cena',         ico: '🌙', label: 'dinner' },
  ];

  // Filtrar comidas según protocolo de ayuno
  const fastingProtocol  = profileExtended?.fastingProtocol || null;
  const mealsActive      = profileExtended?.mealsActive     || null;
  const activeSlots = filterMealsByFasting(MEAL_SLOTS, fastingProtocol, mealsActive);

  // ── Recetas personalizadas desde Supabase ────────────────────────────────────
  const { recipes: allRecipes, loading: recipesLoading } = useRecipes();

  // Skipped de hoy (se resetea automáticamente cuando cambia el día)
  const todayStrForSkip   = new Date().toISOString().split('T')[0];
  const skippedToday      = profileExtended?.skippedToday || {};
  const skippedRecipeIds  = useMemo(() => {
    if (skippedToday.date !== todayStrForSkip) return [];
    return Object.keys(skippedToday)
      .filter(k => k !== 'date')
      .flatMap(k => skippedToday[k] || []);
  }, [skippedToday, todayStrForSkip]);

  const userProfile = useMemo(() => ({
    diet:             currentDietId,
    goal,
    allergies:        profileExtended?.allergies        || [],
    foodDislikes:     profileExtended?.foodDislikes     || [],
    conditions:       profileExtended?.conditions       || [],
    lifeStage:        profileExtended?.lifeStage        || null,
    cookingTime:      profileExtended?.cookingTime      || null,
    weeklyBudget:     profileExtended?.weeklyBudget     || null,
    favoriteRecipes:  profileExtended?.favoriteRecipes  || [],
    skippedRecipeIds,
    totalDailyKcal:   cals?.total || null,
  }), [currentDietId, goal, profileExtended, skippedRecipeIds, cals?.total]);

  // Activity log de hoy para mostrar check/cross
  const todayActivityRecipes = profileExtended?.activityLog?.[todayStrForSkip]?.recipes || {};

  // Hoy en formato YYYY-MM-DD para rotación diaria
  const todayStr = new Date().toISOString().split('T')[0];

  // Construye las comidas del día desde Supabase puro
  const buildPersonalizedMeals = (slots, dateStr) => {
    return (slots || []).map(slot => {
      const dbMealType = appMealToDbMealType(slot.id);
      const recipe     = getDailyRecipe(allRecipes, userProfile, pi?.phase, dbMealType, dateStr);
      if (!recipe) return { ...slot, title: null, items: [], _personalized: false };
      const card = recipeToMealCard(recipe, lang);
      if (!card) return { ...slot, title: null, items: [], _personalized: false };
      return {
        ...slot,
        ico:    card.ico,
        title:  card.title,
        items:  card.items,
        recipe: card.recipe,
        macros: card.macros,
        _personalized: true,
        _recipeId: recipe.id,
      };
    });
  };

  const todayMenu = useMemo(() => {
    const meals = allRecipes?.length
      ? buildPersonalizedMeals(activeSlots, todayStr)
      : activeSlots.map(s => ({ ...s, title: null, items: [], _personalized: false }));
    if (!meals.length) {
      console.warn('[NutriScreen] empty_menu_detected', { phase: pi?.phase, fastingProtocol, lang });
    }
    return { meals };
  }, [allRecipes, recipesLoading, userProfile, pi?.phase, lang, activeSlots]);

  const weekMenuDays = useMemo(() => {
    const names = lang === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : lang === 'en'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : lang === 'it'
      ? ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    // Semana Lun→Dom: buscar el lunes de la semana con offset
    const today = new Date();
    const todayDow = today.getDay(); // 0=Dom, 1=Lun…
    const daysToMonday = todayDow === 0 ? -6 : 1 - todayDow;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const date    = new Date(monday); date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dow     = date.getDay();
      const isToday = dateStr === today.toISOString().split('T')[0];
      const filteredSlots = filterMealsByFasting(MEAL_SLOTS, fastingProtocol, mealsActive);
      const meals = allRecipes?.length
        ? buildPersonalizedMeals(filteredSlots, dateStr)
        : filteredSlots.map(s => ({ ...s, title: null, items: [], _personalized: false }));
      const menu = { meals };
      const dayType = DAY_TYPES[getDayType(dow)];
      return {
        label: isToday ? cm.today : names[dow],
        dayNum: date.getDate(),
        menu,
        dateStr,
        isToday,
        dayType,
      };
    });
  }, [fastingProtocol, mealsActive, allRecipes, userProfile, pi?.phase, lang, weekOffset]);

  const weekDays = useMemo(() => {
    if (!pi) return [];
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i);
      const cd = ((pi.day - 1 + i) % pi.cycleLen) + 1;
      const phase = cd <= 5 ? 'menstrual' : cd <= 13 ? 'follicular' : cd <= 16 ? 'ovulation' : 'luteal';
      return { date, dayLabel: i === 0 ? cm.today : i === 1 ? cm.tomorrow : names[date.getDay()], dayNum: date.getDate(), phase, pd: PHASES[phase] };
    });
  }, [pi]);

  const shopData = useMemo(() => buildShopping(weekDays, adults, children, lang), [weekDays, adults, children, lang]);

  // ── Lista de la compra dinámica generada desde recetas reales ────────────────
  const shoppingListFromRecipes = useMemo(() => {
    if (!allRecipes?.length) return null;
    // Junta TODAS las comidas de los 7 días de la semana
    const allMeals = weekMenuDays.flatMap(d => d.menu?.meals || []);
    const servings = adults + (children * 0.5);
    return buildShoppingList(allMeals, servings);
  }, [weekMenuDays, allRecipes, adults, children]);

  // Si hay recetas reales, usamos la lista nueva. Si no, la antigua de Marina
  const finalShopData = shoppingListFromRecipes || shopData;
  const shopItemsCount = countItems(finalShopData);

  if (recipe) {
    const m   = recipe.macros;
    const isFav = recipe._recipeId && profileExtended?.favoriteRecipes?.includes(recipe._recipeId);
    // Total para % de macros (proteína×4 + carbs×4 + fat×9 = ~kcal)
    const total = m ? (m.protein * 4) + (m.carbs * 4) + (m.fat * 9) : 0;
    const proteinPct = m && total ? Math.round((m.protein * 4 / total) * 100) : 0;
    const carbsPct   = m && total ? Math.round((m.carbs   * 4 / total) * 100) : 0;
    const fatPct     = m && total ? Math.round((m.fat     * 9 / total) * 100) : 0;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setRecipe(null)}>
          <Text style={styles.back}>{n.backToMenu}</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={[styles.card, { backgroundColor: BLUE.light, alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>{recipe.emoji || '🍽️'}</Text>
          <Text style={styles.recipeTag}>{recipe.mealLabel}</Text>
          <Text style={[styles.recipeTitle, { textAlign: 'center' }]}>{recipe.title}</Text>
        </View>

        {/* Macros con barras — tarjeta naranja Figma */}
        {m?.kcal != null && (
          <View style={{ backgroundColor: '#FE6004', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 }}>{m.kcal} kcal</Text>
            {[
              { label: lang === 'en' ? 'Protein' : 'Proteínas', value: m.protein, pct: proteinPct },
              { label: lang === 'en' ? 'Carbs'   : 'Carbohidratos', value: m.carbs, pct: carbsPct },
              { label: lang === 'en' ? 'Fats'    : 'Grasas', value: m.fat, pct: fatPct },
              ...(m.fiber != null ? [{ label: lang === 'en' ? 'Fibre' : 'Fibra', value: m.fiber, pct: Math.round((m.fiber / 30) * 100) }] : []),
            ].map(macro => (
              <View key={macro.label} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>{macro.label}</Text>
                  <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '700' }}>{macro.value}g</Text>
                </View>
                <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(macro.pct, 100)}%`, height: 6, backgroundColor: '#FFFFFF', borderRadius: 3 }} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Acciones */}
        {recipe._recipeId && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            {toggleFavoriteRecipe && (
              <TouchableOpacity
                onPress={() => toggleFavoriteRecipe(recipe._recipeId)}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: isFav ? '#EF4444' : '#E2E8F0', backgroundColor: isFav ? '#FEF2F2' : 'white', alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
                <Text style={{ fontSize: 11, color: isFav ? '#EF4444' : '#64748B', marginTop: 4, fontWeight: '600' }}>
                  {isFav ? (lang === 'en' ? 'Favourite' : 'Favorito') : (lang === 'en' ? 'Add to favourites' : 'Añadir')}
                </Text>
              </TouchableOpacity>
            )}
            {logRecipeDone && (
              <TouchableOpacity
                onPress={() => logRecipeDone(recipe.mealId || recipe.mealLabel, 'done')}
                style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#16A34A', alignItems: 'center' }}>
                <Check size={22} color="white" />
                <Text style={{ fontSize: 11, color: 'white', marginTop: 4, fontWeight: '600' }}>
                  {lang === 'en' ? 'Mark as eaten' : lang === 'fr' ? 'Marquer comme mangé' : 'Comido'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ingredientes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛒 {n.ingredients}</Text>
          {(recipe.ingredients || []).map((ing, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.dot} />
              <Text style={styles.listText}>{ing}</Text>
            </View>
          ))}
        </View>

        {/* Pasos numerados */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👩‍🍳 {n.preparation}</Text>
          {(recipe.steps || []).map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <SwipeableTabs tabs={['plan', 'lista', 'favoritos']} current={sub} onChange={setSub}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <NutriSetupCard lang={lang} profileExtended={profileExtended} goal={goal}
        activityLevel={activityLevel} dietary={dietary}
        saveAll={saveAll || (() => {})} saveProfileExtended={saveProfileExtended || (() => {})} />

      {/* ── CONTEXTO NUTRICIONAL DEL DÍA ── */}
      {nutritionCtx && (
        <View style={styles.ctxCard}>
          <Text style={styles.ctxTitle}>
            🎯 {lang === 'en' ? 'Today\'s focus' : lang === 'fr' ? 'Focus du jour' : lang === 'it' ? 'Focus di oggi' : 'Foco de hoy'}
          </Text>
          <View style={styles.ctxNutrients}>
            {(Array.isArray(nutritionCtx.nutrients) ? nutritionCtx.nutrients : [nutritionCtx.nutrients]).map((n, i) => (
              <View key={i} style={styles.ctxPill}>
                <Text style={styles.ctxPillTxt}>{n}</Text>
              </View>
            ))}
          </View>
          {!!nutritionCtx.tip && (
            <Text style={styles.ctxTip}>{nutritionCtx.tip}</Text>
          )}
          {!!nutritionCtx.dietNote && (
            <Text style={styles.ctxDietNote}>🥗 {nutritionCtx.dietNote}</Text>
          )}
          {nutritionCtx.conditionNotes?.map((note, i) => (
            <Text key={i} style={styles.ctxCondNote}>{note}</Text>
          ))}
          {!!nutritionCtx.avoidNote && (
            <Text style={styles.ctxAvoid}>⚠️ {nutritionCtx.avoidNote}</Text>
          )}
        </View>
      )}

      <View style={styles.tabRow}>
        {[
          { id: 'plan',      l: n.myPlan },
          { id: 'lista',     l: n.list },
          { id: 'favoritos', l: { es: '❤️ Favs', en: '❤️ Favs', fr: '❤️ Favs', it: '❤️ Fav' }[lang] || '❤️ Favs' },
        ].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
            style={[styles.tab, sub === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── MI PLAN (fusiona plan + semana) ── */}
      {sub === 'plan' && <>
        {/* Semana en pequeño */}
        <View style={styles.weekStripCard}>
          {(() => {
            const first = weekMenuDays[0];
            const last  = weekMenuDays[6];
            const fmt = d => `${d.dayNum} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][new Date(d.dateStr).getMonth()]}`;
            const label = weekOffset === 0
              ? (lang === 'en' ? 'This week' : lang === 'fr' ? 'Cette semaine' : lang === 'it' ? 'Questa settimana' : 'Esta semana')
              : weekOffset === -1
                ? (lang === 'en' ? 'Last week' : lang === 'fr' ? 'Semaine dernière' : lang === 'it' ? 'Settimana scorsa' : 'Semana pasada')
                : weekOffset === 1
                  ? (lang === 'en' ? 'Next week' : lang === 'fr' ? 'Semaine prochaine' : lang === 'it' ? 'Settimana prossima' : 'Semana siguiente')
                  : (first && last ? `${fmt(first)} – ${fmt(last)}` : '');
            return (
              <View style={styles.weekNavAzote}>
                <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); setSelectedDayIdx(null); }} style={{ padding: 4 }}>
                  <ChevronLeft size={16} color="#0A0A0A" />
                </TouchableOpacity>
                <Text style={styles.weekNavLabelAzote}>{label}</Text>
                <TouchableOpacity onPress={() => { setWeekOffset(o => o + 1); setSelectedDayIdx(null); }} style={{ padding: 4 }}>
                  <ChevronRight size={16} color="#0A0A0A" />
                </TouchableOpacity>
              </View>
            );
          })()}
          <View style={styles.weekStripRow}>
            {weekMenuDays.map((day, i) => {
              const activeIdx = selectedDayIdx ?? weekMenuDays.findIndex(d => d.isToday);
              const isSel = activeIdx === i;
              return (
                <TouchableOpacity key={i} onPress={() => setSelectedDayIdx(i)}
                  style={[styles.weekStripCell, day.isToday && styles.weekStripCellToday, isSel && !day.isToday && styles.weekStripCellExpanded]}>
                  <Text style={[styles.weekStripDay, day.isToday && styles.weekStripDayToday]}>{day.dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {(() => {
          const activeIdx = selectedDayIdx ?? weekMenuDays.findIndex(d => d.isToday);
          const activeDay = weekMenuDays[activeIdx] ?? weekMenuDays[0];
          const isToday = !!activeDay?.isToday;
          const meals = isToday ? todayMenu.meals : (activeDay?.menu?.meals || []);

          return (
            <>
              <View style={styles.planHeaderCard}>
                <Text style={styles.planHeaderTag}>{isToday ? cm.today.toUpperCase() : activeDay?.label}</Text>
                <Text style={styles.planHeaderTitle}>
                  {lang === 'en' ? 'Your menu' : lang === 'fr' ? 'Ton menu' : lang === 'it' ? 'Il tuo menù' : 'Tu menú'}
                  {isToday && cals ? ` · ${cals.total} kcal` : ''}
                </Text>
              </View>

              {/* ── TRACKER CALORÍAS (solo hoy) ── */}
              {isToday && cals && (() => {
                const consumedFromMeals = todayMenu.meals
                  .filter(m => todayActivityRecipes[m.id] === 'done' && m.macros?.kcal)
                  .reduce((s, m) => s + m.macros.kcal, 0);
                const consumedFromExtras = extras.reduce((s, e) => s + (e.kcal || 0), 0);
                const consumed = consumedFromMeals + consumedFromExtras;
                const remaining = Math.max(0, cals.total - consumed);
                const pct = Math.min(1, consumed / cals.total);
                const over = consumed > cals.total;
                const barColor = over ? '#DC2626' : pct > 0.85 ? '#FE6004' : '#49CF38';
                const lbl = { es: ['Calorías de hoy', 'Consumidas', 'Restantes', 'Superado en'],
                              en: ['Today\'s calories', 'Consumed', 'Remaining', 'Over by'],
                              fr: ['Calories du jour', 'Consommées', 'Restantes', 'Dépassé de'],
                              it: ['Calorie di oggi', 'Consumate', 'Rimanenti', 'Superato di'] }[lang] || [];
                return (
                  <View style={styles.calCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <Text style={styles.calTitle}>🔥 {lbl[0]}</Text>
                      <Text style={{ fontSize: 11, color: '#737373' }}>{cals.total} kcal objetivo</Text>
                    </View>
                    <View style={styles.calBarBg}>
                      <View style={[styles.calBarFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <View style={styles.calStat}>
                        <Text style={[styles.calStatNum, { color: barColor }]}>{consumed}</Text>
                        <Text style={styles.calStatLbl}>{lbl[1]}</Text>
                      </View>
                      <View style={[styles.calDivider]} />
                      <View style={styles.calStat}>
                        <Text style={[styles.calStatNum, { color: over ? '#DC2626' : '#0A0A0A' }]}>
                          {over ? `+${consumed - cals.total}` : remaining}
                        </Text>
                        <Text style={styles.calStatLbl}>{over ? lbl[3] : lbl[2]}</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* Comidas del día seleccionado */}
              {meals.map((meal, i) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  expanded={openPlan === i}
                  onToggle={() => setOpenPlan(openPlan === i ? null : i)}
                  onRecipe={(r, lbl) => setRecipe({ ...r, mealLabel: lbl, title: meal.title || meal.items?.[0], emoji: meal.ico, macros: meal.macros, _recipeId: meal._recipeId })}
                  seeRecipeLabel={n.seeRecipe}
                  mealLabelFn={(lbl) => getMealLabel(lang, lbl)}
                  isFavorite={profileExtended?.favoriteRecipes?.includes(meal._recipeId || meal.id)}
                  onToggleFavorite={isToday && meal._personalized && toggleFavoriteRecipe ? () => toggleFavoriteRecipe(meal._recipeId || meal.id) : null}
                  onSwap={isToday && meal._personalized && skipRecipe ? () => skipRecipe(meal.id, meal._recipeId || meal.id) : null}
                  onLogStatus={isToday && logRecipeDone ? (status) => logRecipeDone(meal.id, status) : null}
                  logStatus={isToday ? todayActivityRecipes[meal.id] : undefined}
                />
              ))}

              {/* ── EXTRAS (solo hoy) ── */}
              {isToday && (
                <View style={styles.extrasCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: extras.length ? 10 : 0 }}>
                    <Text style={styles.calTitle}>
                      {{ es: '➕ Otras comidas', en: '➕ Other foods', fr: '➕ Autres aliments', it: '➕ Altro cibo' }[lang] || '➕ Otras comidas'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowAddExtra(true)} style={styles.addExtraBtn}>
                      <Text style={styles.addExtraBtnTxt}>
                        {{ es: '+ Añadir', en: '+ Add', fr: '+ Ajouter', it: '+ Aggiungi' }[lang] || '+ Añadir'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {extras.map((e, i) => (
                    <View key={i} style={styles.extraRow}>
                      <Text style={styles.extraName}>{e.name}</Text>
                      <Text style={styles.extraKcal}>🔥 {e.kcal} kcal</Text>
                      <TouchableOpacity onPress={() => removeExtra(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={{ fontSize: 16, color: '#A3A3A3' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          );
        })()}

        {/* Tu plan nutricional — solo visible con batch cooking activo */}
        {profileExtended?.batchCooking && (() => {
          const dtl = getDayTypeLabels(lang);
          return (
            <View style={styles.nutriPlanCard}>
              <Text style={styles.sectionTitle}>{n.dayTypes}</Text>
              {['A', 'B', 'free'].map(key => (
                <View key={key} style={styles.nutriPlanRow}>
                  <View style={styles.nutriPlanAvatar}><Text style={styles.nutriPlanAvatarTxt}>{key === 'free' ? '🌿' : key}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nutriPlanLabel}>{dtl[key].label}</Text>
                    <Text style={styles.nutriPlanTag}>{dtl[key].tag}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })()}

        <TipsCard articles={nutriArticles} lang={lang} variant="azote" />
      </>}

      {/* ── LISTE DE COURSES ── */}
      {sub === 'lista' && <>
        {/* Navegación semanas */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} style={{ padding: 8 }}>
            <ChevronLeft size={20} color={BLUE.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>
            {weekOffset === 0
              ? (lang === 'en' ? 'This week' : lang === 'fr' ? 'Cette semaine' : lang === 'it' ? 'Questa settimana' : 'Esta semana')
              : weekOffset === -1
              ? (lang === 'en' ? 'Last week' : lang === 'fr' ? 'Semaine passée' : lang === 'it' ? 'Settimana scorsa' : 'Semana pasada')
              : weekOffset === 1
              ? (lang === 'en' ? 'Next week' : lang === 'fr' ? 'Semaine prochaine' : lang === 'it' ? 'Settimana prossima' : 'Semana siguiente')
              : (weekOffset > 0 ? `+${weekOffset}` : weekOffset) + (lang === 'en' ? ' weeks' : ' semanas')}
          </Text>
          <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} style={{ padding: 8 }}>
            <ChevronRight size={20} color={BLUE.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>{n.weekList}</Text>
            <TouchableOpacity
              onPress={() => {
                const lines = Object.entries(finalShopData).map(([cat, items]) => {
                  const rows = items.map(item => {
                    const qty = item.qty ?? item.totalQty;
                    const label = shoppingListFromRecipes ? formatQuantity(qty, item.unit) : formatQty(qty, item.unit, lang);
                    return `• ${item.name}${label ? ' — ' + label : ''}`;
                  }).join('\n');
                  return `${cat}\n${rows}`;
                }).join('\n\n');
                const shareLabel = lang === 'en' ? 'Shopping list' : lang === 'fr' ? 'Liste de courses' : lang === 'it' ? 'Lista della spesa' : 'Lista de la compra';
                Share.share({ message: `🛒 ${shareLabel}\n\n${lines}` });
              }}
              style={{ backgroundColor: BLUE.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
                {lang === 'en' ? '📤 Share' : lang === 'fr' ? '📤 Partager' : lang === 'it' ? '📤 Condividi' : '📤 Compartir'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.listSub}>{n.weekListSub} · {adults} {adults > 1 ? n.adults2 : n.adult}</Text>
            <View style={{ backgroundColor: BLUE.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
                {shopItemsCount} {lang === 'en' ? 'items' : lang === 'fr' ? 'articles' : 'productos'}
              </Text>
            </View>
          </View>
          <View style={styles.personsRow}>
            {[
              { label: n.adults,   val: adults,   set: setAdults,   min: 1, max: 8, color: BLUE.primary },
              { label: n.children, val: children, set: setChildren, min: 0, max: 6, color: '#64748B' },
            ].map(p => (
              <View key={p.label} style={styles.personBox}>
                <Text style={styles.personLabel}>{p.label}</Text>
                <View style={styles.counter}>
                  <TouchableOpacity onPress={() => p.set(v => Math.max(p.min, v - 1))}
                    style={[styles.counterBtn, { borderColor: p.color }]}>
                    <Text style={[styles.counterBtnText, { color: p.color }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.counterVal, { color: p.color }]}>{p.val}</Text>
                  <TouchableOpacity onPress={() => p.set(v => Math.min(p.max, v + 1))}
                    style={[styles.counterBtnFill, { backgroundColor: p.color }]}>
                    <Text style={styles.counterBtnFillText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {Object.entries(finalShopData).map(([cat, items]) => (
          <View key={cat} style={styles.card}>
            <Text style={styles.sectionTitle}>{cat}</Text>
            {items.map(item => {
              // Soporta tanto el formato antiguo (totalQty + unit) como el nuevo (qty + unit)
              const qty  = item.qty ?? item.totalQty;
              const unit = item.unit;
              const qtyLabel = shoppingListFromRecipes ? formatQuantity(qty, unit) : formatQty(qty, unit, lang);
              const itemKey = item.key || item.name;
              const checked = !!checkedItems[itemKey];
              return (
                <TouchableOpacity key={itemKey} style={styles.shopRow} onPress={() => setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))} activeOpacity={0.7}>
                  <View style={styles.shopLeft}>
                    <View style={[styles.checkbox, checked && { backgroundColor: '#1A56DB', borderColor: '#1A56DB' }]}>
                      {checked && <Check size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.shopName, checked && { textDecorationLine: 'line-through', color: '#94A3B8' }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.shopQty, checked && { color: '#94A3B8' }]}>{qtyLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </>}

      {/* ── TARJETA DE DIETA ACTIVA (info de la dieta, antes de los consejos) ── */}
      {dietData && (
        <View style={styles.dietCard}>
          <TouchableOpacity style={styles.dietHeader} onPress={() => setDietOpen(v => !v)} activeOpacity={0.8}>
            <Text style={styles.dietIcon}>{dietData.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dietName}>{dietData.name[lang] || dietData.name.es}</Text>
              {dietData.macros && (
                <Text style={styles.dietMacros}>
                  🌾 {dietData.macros.carbs_pct}% · 🥩 {dietData.macros.protein_pct}% · 🫒 {dietData.macros.fat_pct}%
                </Text>
              )}
            </View>
            <Text style={styles.dietArrow}>{dietOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dietOpen && (() => {
            const allowed   = dietData.allowed_foods?.[lang]   || dietData.allowed_foods?.es   || [];
            const forbidden = dietData.forbidden_foods?.[lang] || dietData.forbidden_foods?.es || [];
            const benefits  = dietData.benefits?.[lang]        || dietData.benefits?.es        || [];
            const warnings  = dietData.warnings?.[lang]        || dietData.warnings?.es        || [];
            return (
              <View style={styles.dietBody}>
                {allowed.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={styles.dietSectionLabel}>
                      ✅ {lang === 'en' ? 'EAT FREELY' : lang === 'fr' ? 'À MANGER LIBREMENT' : 'COMER LIBREMENTE'}
                    </Text>
                    {allowed.slice(0, 6).map((f, i) => <Text key={i} style={styles.dietItem}>· {f}</Text>)}
                  </View>
                )}
                {forbidden.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={[styles.dietSectionLabel, { color: '#EF4444' }]}>
                      ❌ {lang === 'en' ? 'AVOID' : lang === 'fr' ? 'ÉVITER' : 'EVITAR'}
                    </Text>
                    {forbidden.slice(0, 4).map((f, i) => <Text key={i} style={[styles.dietItem, { color: '#EF4444' }]}>· {f}</Text>)}
                  </View>
                )}
                {benefits.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={[styles.dietSectionLabel, { color: '#059669' }]}>
                      💡 {lang === 'en' ? 'KEY BENEFITS' : lang === 'fr' ? 'BÉNÉFICES CLÉS' : 'BENEFICIOS CLAVE'}
                    </Text>
                    {benefits.slice(0, 3).map((b, i) => <Text key={i} style={[styles.dietItem, { color: '#065F46' }]}>· {b}</Text>)}
                  </View>
                )}
                {warnings.length > 0 && (
                  <View style={[styles.dietSection, { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 8 }]}>
                    <Text style={[styles.dietSectionLabel, { color: '#92400E' }]}>
                      ⚠️ {lang === 'en' ? 'KEEP IN MIND' : lang === 'fr' ? 'À GARDER EN TÊTE' : 'TEN EN CUENTA'}
                    </Text>
                    {warnings.slice(0, 2).map((w, i) => <Text key={i} style={[styles.dietItem, { color: '#92400E' }]}>· {w}</Text>)}
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* ── FAVORITOS ── */}
      {sub === 'favoritos' && (() => {
        const favIds = profileExtended?.favoriteRecipes || [];
        const favRecipes = (allRecipes || []).filter(r => favIds.includes(r.id));
        const emptyTxt = { es: 'Aún no tienes favoritos', en: 'No favourites yet', fr: 'Pas encore de favoris', it: 'Ancora nessun preferito' };
        const hintTxt  = { es: 'Pulsa ❤️ en cualquier receta para guardarla aquí.', en: 'Tap ❤️ on any recipe to save it here.', fr: 'Appuie sur ❤️ sur une recette pour la sauvegarder ici.', it: 'Tocca ❤️ su una ricetta per salvarla qui.' };
        if (!favRecipes.length) return (
          <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🤍</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>{emptyTxt[lang] || emptyTxt.es}</Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 }}>{hintTxt[lang] || hintTxt.es}</Text>
          </View>
        );
        return favRecipes.map(r => {
          const card = recipeToMealCard(r, lang);
          if (!card) return null;
          return (
            <View key={r.id} style={styles.card}>
              <TouchableOpacity style={styles.mealRow}
                onPress={() => setRecipe({ ...card.recipe, mealLabel: card.label, title: card.title, emoji: card.ico, macros: card.macros, _recipeId: r.id })}>
                <Text style={styles.mealIco}>{card.ico}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealTitle}>{card.title}</Text>
                  {card.macros?.kcal != null && (
                    <Text style={styles.mealMacros}>🔥 {card.macros.kcal} kcal · 🥩 {card.macros.protein}g · 🌾 {card.macros.carbs}g · 🫒 {card.macros.fat}g</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => toggleFavoriteRecipe && toggleFavoriteRecipe(r.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 20 }}>❤️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          );
        });
      })()}


    </ScrollView>

    {/* ── MODAL AÑADIR EXTRA ── */}
    <Modal visible={showAddExtra} animationType="slide" transparent onRequestClose={() => setShowAddExtra(false)}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} activeOpacity={1} onPress={() => setShowAddExtra(false)} />
      <View style={styles.extraModal}>
        <View style={styles.extraModalHandle} />
        <Text style={styles.extraModalTitle}>
          {{ es: 'Añadir comida', en: 'Add food', fr: 'Ajouter un aliment', it: 'Aggiungi cibo' }[lang] || 'Añadir comida'}
        </Text>
        <TextInput
          style={styles.extraInput}
          placeholder={{ es: 'Nombre (ej. Croissant)', en: 'Name (e.g. Croissant)', fr: 'Nom (ex. Croissant)', it: 'Nome (es. Croissant)' }[lang] || 'Nombre'}
          placeholderTextColor="#94A3B8"
          value={extraName}
          onChangeText={setExtraName}
        />
        <TextInput
          style={styles.extraInput}
          placeholder="kcal"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={extraKcalStr}
          onChangeText={setExtraKcalStr}
        />
        <TouchableOpacity
          onPress={addExtra}
          style={[styles.addExtraBtn, { marginTop: 4, paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: (extraName.trim() && extraKcalStr) ? 1 : 0.4 }]}>
          <Text style={[styles.addExtraBtnTxt, { fontSize: 15 }]}>
            {{ es: 'Guardar', en: 'Save', fr: 'Enregistrer', it: 'Salva' }[lang] || 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>

    </SwipeableTabs>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },

  // Nutrition context card
  ctxCard:      { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  ctxTitle:     { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  ctxNutrients: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  ctxPill:      { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ctxPillTxt:   { fontSize: 12, color: '#1A56DB', fontWeight: '600' },
  ctxTip:       { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 6 },
  ctxDietNote:  { fontSize: 12, color: '#059669', backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8, marginBottom: 6, lineHeight: 18 },
  ctxCondNote:  { fontSize: 12, color: '#7C3AED', backgroundColor: '#F5F3FF', borderRadius: 8, padding: 8, marginBottom: 6, lineHeight: 18 },
  ctxAvoid:     { fontSize: 12, color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, lineHeight: 18 },

  // Diet info card
  dietCard:         { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  dietHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  dietIcon:         { fontSize: 26 },
  dietName:         { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dietMacros:       { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  dietArrow:        { fontSize: 11, color: '#94A3B8' },
  dietBody:         { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dietSection:      { marginTop: 10 },
  dietSectionLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 5 },
  dietItem:         { fontSize: 13, color: '#475569', lineHeight: 20 },
  card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
  back: { fontSize: 14, color: '#0A0A0A', fontWeight: '600', marginBottom: 16 },
  recipeTag: { fontSize: 11, color: '#0A0A0A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  recipeTitle: { fontSize: 18, fontWeight: '700', color: '#0A0A0A', marginBottom: 4, fontFamily: F.heading },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 10, fontFamily: F.heading },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0A0A0A', marginTop: 5, marginRight: 10, flexShrink: 0 },
  listText: { fontSize: 13, color: '#334155', flex: 1, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#171717', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { color: 'white', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 13, color: '#334155', lineHeight: 20, flex: 1, paddingTop: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#171717' },
  tabText: { fontSize: 12, color: '#525252' },
  tabTextActive: { color: 'white', fontWeight: '700' },

  // Semana en pequeño (calendario compacto de "Mi plan")
  weekStripCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2 },
  weekNavAzote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  weekNavLabelAzote: { fontSize: 14, color: '#0A0A0A' },
  weekStripRow: { flexDirection: 'row', gap: 4 },
  weekStripCell: { flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  weekStripCellToday: { backgroundColor: '#171717' },
  weekStripCellExpanded: { borderWidth: 2, borderColor: '#171717' },
  weekStripDay: { fontSize: 12, color: '#0A0A0A' },
  weekStripDayToday: { color: 'white', fontWeight: '700' },

  planHeaderCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
  planHeaderTag: { fontSize: 12, fontWeight: '600', color: '#525252', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  planHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#0A0A0A', fontFamily: F.headingX },
  planSub: { fontSize: 12, lineHeight: 18, opacity: 0.85 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealIco: { fontSize: 26, flexShrink: 0 },
  mealTag:    { fontSize: 10, color: '#0A0A0A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  mealTitle:  { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  mealMacros: { fontSize: 11, color: '#737373', marginTop: 4 },

  // Action buttons (favorite, swap, done, skip)
  actionRow:     { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn:     { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  actionBtnDone: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  actionBtnSkip: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  actionTxt:     { fontSize: 16 },
  chevron: { color: '#CBD5E1', fontSize: 14, flexShrink: 0 },
  mealDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  recipeBtn: { marginTop: 12, padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#1A56DB', backgroundColor: '#EFF6FF', alignItems: 'center' },
  recipeBtnText: { color: '#1A56DB', fontWeight: '600', fontSize: 13 },

  // Tu plan nutricional — variante "marrón claro" (Figma)
  nutriPlanCard: { backgroundColor: '#E8D5B9', borderRadius: 24, padding: 16, marginBottom: 2 },
  nutriPlanRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5EBDA', borderRadius: 16, padding: 8, marginBottom: 2 },
  nutriPlanAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#D6C1A8', alignItems: 'center', justifyContent: 'center' },
  nutriPlanAvatarTxt: { fontSize: 20, fontWeight: '800', color: '#3D2B1F' },
  nutriPlanLabel: { fontSize: 16, fontWeight: '700', color: '#3D2B1F' },
  nutriPlanTag: { fontSize: 13, color: '#6B4F3A', marginTop: 1 },
  dayTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 6 },
  dayTypeLabel: { fontSize: 13, fontWeight: '700' },
  dayTypeTag: { fontSize: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayDate: { width: 50, alignItems: 'center', flexShrink: 0 },
  dayLabel: { fontSize: 11, color: '#94A3B8' },
  dayNum: { fontSize: 20, fontWeight: '700', color: '#1E293B', lineHeight: 24 },
  dayTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexShrink: 0 },
  dayTypeBadgeText: { fontSize: 10, fontWeight: '700' },
  dayMeals: { fontSize: 12, color: '#64748B' },
  personsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  personBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 10, alignItems: 'center' },
  personLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { fontSize: 16, fontWeight: '700' },
  counterVal: { fontSize: 20, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  counterBtnFill: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  counterBtnFillText: { color: 'white', fontSize: 16, fontWeight: '700' },
  listSub: { fontSize: 12, color: '#475569', marginBottom: 4 },
  shopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  shopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#1A56DB', flexShrink: 0 },
  shopName: { fontSize: 13, color: '#334155' },
  shopQty: { fontSize: 13, fontWeight: '600', color: '#1A56DB', flexShrink: 0, marginLeft: 8 },
  // Calorie tracker
  calCard:     { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  calTitle:    { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  calBarBg:    { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  calBarFill:  { height: '100%', borderRadius: 5 },
  calStat:     { flex: 1, alignItems: 'center' },
  calStatNum:  { fontSize: 24, fontWeight: '800' },
  calStatLbl:  { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  calDivider:  { width: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  // Extras
  extrasCard:    { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  addExtraBtn:   { backgroundColor: '#1A56DB', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addExtraBtnTxt:{ color: 'white', fontSize: 13, fontWeight: '700' },
  extraRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
  extraName:     { flex: 1, fontSize: 13, color: '#334155' },
  extraKcal:     { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  // Modal extras
  extraModal:      { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 12 },
  extraModalHandle:{ width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  extraModalTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  extraInput:      { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
});
