import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Share, Modal, TextInput, ImageBackground, Image, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
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
import { useTodayMenu } from '../hooks/useTodayMenu';
import { useFoodLog } from '../hooks/useFoodLog';
import { getRecipesForMeal, appMealToDbMealType, recipeToMealCard, getDailyRecipe } from '../utils/recipeEngine';
import { buildShoppingList, formatQuantity, countItems } from '../utils/shoppingList';
import { trackScreen } from '../lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WaterCard from '../components/WaterCard';
import BText from '../components/BText';
// nutritionRules ya no se usa para override de display — las reglas actúan en recipeEngine

const PHASE_IMAGES = {
 menstrual: require('../../assets/phases/menstrual.png'),
 follicular: require('../../assets/phases/follicular.png'),
 ovulation: require('../../assets/phases/ovulation.png'),
 luteal: require('../../assets/phases/luteal.png'),
};

const NUTRI_ARTICLE_IDS = ['nutrition-menstrual', 'endometriosis-nutrition', 'pcos-hormones', 'pregnancy-nutrition'];
const nutriArticles = ARTICLES.filter(a => NUTRI_ARTICLE_IDS.includes(a.id));

const BLUE = { primary: '#429FE7', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

// Batch cooking: tipos de día (estructura sin comidas — contenido viene de Supabase)
function getDayType(jsDay) {
 if (jsDay === 0) return 'free';
 if ([1, 3, 5].includes(jsDay)) return 'A';
 return 'B';
}
const DAY_TYPES = {
 A: { key: 'A', color: '#DBEAFE', textColor: '#1D4ED8' },
 B: { key: 'B', color: '#DCFCE7', textColor: '#15803D' },
 free: { key: 'free', color: '#FEF3C7', textColor: '#92400E' },
};
function getDayTypeLabels(lang) {
 return {
 A: { label: lang === 'en' ? 'Day A' : lang === 'fr' ? 'Jour A' : lang === 'it' ? 'Giorno A' : 'Día A', tag: lang === 'en' ? 'Mon · Wed · Fri' : lang === 'fr' ? 'Lun · Mer · Ven' : lang === 'it' ? 'Lun · Mer · Ven' : 'Lun · Mié · Vie' },
 B: { label: lang === 'en' ? 'Day B' : lang === 'fr' ? 'Jour B' : lang === 'it' ? 'Giorno B' : 'Día B', tag: lang === 'en' ? 'Tue · Thu · Sat' : lang === 'fr' ? 'Mar · Jeu · Sam' : lang === 'it' ? 'Mar · Gio · Sab' : 'Mar · Jue · Sáb' },
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

// Hora límite (hasta la que esa comida es "la siguiente")
const MEAL_CUTOFF = {
 desayuno: 11,
 snack_manana: 13,
 almuerzo: 16,
 snack_tarde: 19,
 cena: 24,
};

function getNextMealId(slots) {
 const h = new Date().getHours();
 return slots.find(s => h < (MEAL_CUTOFF[s.id] ?? 24))?.id ?? null;
}

function MealCard({ meal, expanded, onToggle, onRecipe, seeRecipeLabel, mealLabelFn,
 isFavorite, onToggleFavorite, onSwap, onLogStatus, logStatus, isNext }) {
 const displayTitle = meal.title || meal.items?.[0] || '';
 const m = meal.macros;
 const fg = isNext ? '#260E01' : '#0A0A0A';
 const fgMuted = isNext ? 'rgba(38,14,1,0.6)' : '#737373';
 return (
 <View style={[mc.card, isNext ? mc.cardNext : mc.cardNeutral]}>
 <TouchableOpacity style={mc.header} onPress={onToggle} activeOpacity={0.85}>
 <View style={{ flex: 1 }}>
 <BText style={[mc.slot, { color: fgMuted }]}>{mealLabelFn ? mealLabelFn(meal.label) : meal.label}</BText>
 <BText style={[mc.title, { color: fg }]}>{displayTitle}</BText>
 </View>
 <BText style={[mc.chevron, { color: fgMuted }]}>{expanded ? '' : ''}</BText>
 </TouchableOpacity>

 {m?.kcal != null && (
 <View style={mc.tagsRow}>
 {[`${m.kcal} kcal`, `P: ${m.protein}g`, `H: ${m.carbs}g`, `G: ${m.fat}g`].map(t => (
 <View key={t} style={[mc.tag, isNext ? mc.tagNext : mc.tagNeutral]}>
 <BText style={[mc.tagTxt, { color: fg }]}>{t}</BText>
 </View>
 ))}
 </View>
 )}

 {expanded && (
 <View style={[mc.detail, isNext ? mc.detailNext : mc.detailNeutral]}>
 {(meal.items || []).map((it, i) => (
 <View key={i} style={mc.listRow}>
 <View style={[mc.dot, { backgroundColor: fg }]} />
 <BText style={[mc.listText, { color: fg }]}>{it}</BText>
 </View>
 ))}
 </View>
 )}

 <View style={mc.actionsBlock}>
 {meal.recipe && (
 <TouchableOpacity onPress={() => onRecipe(meal.recipe, meal.label)}>
 <BText style={[mc.recipeLink, { color: fg }]}>{seeRecipeLabel || 'Ver receta'}</BText>
 </TouchableOpacity>
 )}
 {meal._personalized && (
 <View style={mc.actionRow}>
 {onSwap && (
 <TouchableOpacity onPress={onSwap} style={[mc.actionBtn, isNext ? mc.actionBtnNext : mc.actionBtnNeutral]}>
 <RefreshCcw size={16} color={fg} />
 </TouchableOpacity>
 )}
 {onToggleFavorite && meal._recipeId && (
 <TouchableOpacity onPress={onToggleFavorite} style={[mc.actionBtn, isNext ? mc.actionBtnNext : mc.actionBtnNeutral]}>
 <Heart size={16} color={fg} fill={isFavorite ? fg : 'none'} />
 </TouchableOpacity>
 )}
 {onLogStatus && (
 <TouchableOpacity onPress={() => onLogStatus(logStatus === 'done' ? null : 'done')} style={[mc.actionBtn, isNext ? mc.actionBtnNext : mc.actionBtnNeutral, logStatus === 'done' && mc.actionBtnDone]}>
 <Check size={16} color={logStatus === 'done' ? 'white' : fg} strokeWidth={logStatus === 'done' ? 3 : 2} />
 </TouchableOpacity>
 )}
 </View>
 )}
 </View>
 </View>
 );
}

const mc = StyleSheet.create({
 card: { borderRadius: 24, padding: 16, marginBottom: 2 },
 cardNext: { backgroundColor: '#FE6004' },
 cardNeutral: { backgroundColor: 'white' },
 header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
 slot: { fontSize: 14, fontFamily: F.body },
 title: { fontSize: 20, marginTop: 2, fontFamily: F.headingX },
 chevron: { fontSize: 14, flexShrink: 0, fontFamily: F.body },
 tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
 tag: { height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center' },
 tagNext: { backgroundColor: 'white' },
 tagNeutral: { backgroundColor: '#F5F5F5' },
 tagTxt: { fontSize: 10, fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.3 },
 detail: { borderRadius: 16, padding: 12, marginBottom: 12, gap: 6 },
 detailNext: { backgroundColor: 'rgba(255,255,255,0.25)' },
 detailNeutral: { backgroundColor: 'rgba(0,0,0,0.05)' },
 listRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 dot: { width: 4, height: 4, borderRadius: 2 },
 listText: { fontSize: 14, flex: 1, fontFamily: F.body },
 actionsBlock: { gap: 12 },
 recipeLink: { fontSize: 14, textDecorationLine: 'underline', fontFamily: F.body },
 actionRow: { flexDirection: 'row', gap: 2 },
 actionBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
 actionBtnNext: { backgroundColor: 'white' },
 actionBtnNeutral: { backgroundColor: 'white' },
 actionBtnDone: { backgroundColor: '#262626' },
});

export default function NutriScreen({ pi, program, lang = 'es', goal, activityLevel, dietary, profileExtended, saveAll, saveProfileExtended, age, weight, height, trainDays, toggleFavoriteRecipe, skipRecipe, logRecipeDone }) {
 useEffect(() => { trackScreen('Nutrición', { phase: pi?.phase, goal }); }, []);
 const navigation = useNavigation();
 const nutriOpenRef = useRef(null);
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
 const dietData = currentDietId ? getDiet(currentDietId) : null;

 // ── Contexto nutricional del día (fase + dieta + condiciones) ────────────────
 const nutritionCtx = getDayNutritionContext(
 pi?.phase,
 currentDietId || null,
 profileExtended?.conditions || [],
 lang,
 );

 const tipsNutri = resolveTips(program?.tipsNutri ?? TIPS_NUTRI, lang);

 // ── Menú de hoy — compartido con HomeScreen via useTodayMenu ─────────────────
 const { todayMenu, activeSlots, allRecipes, userProfile, recipesLoading } = useTodayMenu({
 phase: pi?.phase, lang, profileExtended, goal, activityLevel, weight, height, age, trainDays,
 });

 // Activity log de hoy para mostrar check/cross
 const todayStrForSkip = new Date().toISOString().split('T')[0];
 const todayActivityRecipes = profileExtended?.activityLog?.[todayStrForSkip]?.recipes || {};

 // Hoy en formato YYYY-MM-DD para rotación diaria
 const todayStr = new Date().toISOString().split('T')[0];

 const { consumed: foodConsumed, logRecipe, unlogRecipe } = useFoodLog(todayStr);

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
 const date = new Date(monday); date.setDate(monday.getDate() + i);
 const dateStr = date.toISOString().split('T')[0];
 const dow = date.getDay();
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

 if (!pi) {
  const emptyTxt = {
   title: { es: 'Plan de nutrici\u00f3n', en: 'Nutrition plan', fr: 'Plan de nutrition', it: 'Piano nutrizionale' },
   sub: { es: 'Configura tus preferencias para que nos podamos adaptar a tus necesidades y gustos', en: 'Set your preferences so we can tailor your plan to your needs and tastes.', fr: 'Configure tes pr\u00e9f\u00e9rences pour que nous puissions adapter ton plan.', it: 'Configura le tue preferenze per personalizzare il tuo piano.' },
   cta: { es: 'Configurar plan', en: 'Set up plan', fr: 'Configurer le plan', it: 'Configura il piano' },
  };
  return (
   <ImageBackground source={require('../../assets/Apartados/Blumm_nutricion_fondo.png')} style={{ flex: 1 }}>
    <View style={ne.wrap}>
     <BlurView intensity={25} tint='light' style={ne.card}>
      <View style={ne.iconWrap}><View style={ne.iconInner} /></View>
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
       <BText style={ne.title}>{emptyTxt.title[lang] || emptyTxt.title.es}</BText>
       <BText style={ne.sub}>{emptyTxt.sub[lang] || emptyTxt.sub.es}</BText>
      </View>
      <TouchableOpacity style={ne.btn} onPress={() => nutriOpenRef.current?.()} activeOpacity={0.85}>
       <BText style={ne.btnTxt}>{emptyTxt.cta[lang] || emptyTxt.cta.es}</BText>
      </TouchableOpacity>
     </BlurView>
    </View>
    <NutriSetupCard lang={lang} profileExtended={profileExtended} goal={goal}
     activityLevel={activityLevel} dietary={dietary}
     saveAll={saveAll || (() => {})} saveProfileExtended={saveProfileExtended || (() => {})}
     openModalRef={nutriOpenRef} />
   </ImageBackground>
  );
 }

 return (
 <SwipeableTabs tabs={['plan', 'lista', 'favoritos']} current={sub} onChange={setSub}>
 <ScrollView style={styles.container} contentContainerStyle={styles.content}>

 <View style={{ height: 0, overflow: 'hidden' }}>
  <NutriSetupCard lang={lang} profileExtended={profileExtended} goal={goal}
  activityLevel={activityLevel} dietary={dietary}
  saveAll={saveAll || (() => {})} saveProfileExtended={saveProfileExtended || (() => {})}
  openModalRef={nutriOpenRef} />
 </View>

 <View style={styles.tabRow}>
 {[
 { id: 'plan', l: n.myPlan },
 { id: 'lista', l: n.list },
 { id: 'favoritos', l: 'Favs.' },
 ].map(t => (
 <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
 style={[styles.tab, sub === t.id && styles.tabActive]}>
 <BText style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</BText>
 </TouchableOpacity>
 ))}
 </View>

 {/* ── MI PLAN (fusiona plan + semana) ── */}
 {sub === 'plan' && <>
 {/* Semana — calendario Figma */}
 <View style={styles.weekStripCard}>
 {(() => {
  const activeIdx = selectedDayIdx ?? weekMenuDays.findIndex(d => d.isToday);
  const activeDay = weekMenuDays[activeIdx] ?? weekMenuDays[0];
  const selDate = new Date((activeDay?.dateStr || new Date().toISOString().split('T')[0]) + 'T12:00:00');
  const locale = lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES';
  const dateLabel = selDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const WEEK_DAY_LABELS = {
   en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
   es: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
   fr: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
   it: ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],
  };
  const dayLabels = WEEK_DAY_LABELS[lang] || WEEK_DAY_LABELS.es;
  const PHASE_COLORS_WEEK = { menstrual:'#92E288', follicular:'#C79ADF', ovulation:'#FEDF68', luteal:'#FEA068' };
  return (
   <View style={{ gap: 4 }}>
    <View style={styles.weekNavAzote}>
     <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); setSelectedDayIdx(null); }} style={{ padding: 4 }}>
      <ChevronLeft size={16} color="#0A0A0A" />
     </TouchableOpacity>
     <BText style={styles.weekNavLabelAzote}>{dateLabel}</BText>
     <TouchableOpacity onPress={() => { setWeekOffset(o => o + 1); setSelectedDayIdx(null); }} style={{ padding: 4 }}>
      <ChevronRight size={16} color="#0A0A0A" />
     </TouchableOpacity>
    </View>
    <View style={styles.weekDayLabelsRow}>
     {dayLabels.map((lbl, i) => (
      <View key={i} style={styles.weekDayLabelCell}>
       <BText style={styles.weekDayLabel}>{lbl}</BText>
      </View>
     ))}
    </View>
    <View style={styles.weekStripRow}>
     {weekMenuDays.map((day, i) => {
      const isSel = activeIdx === i;
      const phaseColor = day.isToday && pi?.phase ? PHASE_COLORS_WEEK[pi.phase] : null;
      return (
       <TouchableOpacity key={i} onPress={() => setSelectedDayIdx(i)}
        style={[styles.weekCell, day.isToday && styles.weekCellToday, isSel && styles.weekCellActive]}>
        {phaseColor && <View style={[styles.weekCellGlow, { backgroundColor: phaseColor }]} />}
        <BText style={styles.weekCellNum}>{day.dayNum}</BText>
       </TouchableOpacity>
      );
     })}
    </View>
   </View>
  );
 })()}
 </View>

 {(() => {
 const activeIdx = selectedDayIdx ?? weekMenuDays.findIndex(d => d.isToday);
 const activeDay = weekMenuDays[activeIdx] ?? weekMenuDays[0];
 const isToday = !!activeDay?.isToday;
 const meals = isToday ? todayMenu.meals : (activeDay?.menu?.meals || []);

 return (
 <>
 <ImageBackground
 source={require('../../assets/Apartados/Blumm_nutricion_fondo.png')}
 style={styles.planHeaderCard}
 imageStyle={{ borderRadius: 24 }}
 >
 <BlurView intensity={25} tint="light" style={styles.planHeaderBlur}>
 <BText style={styles.planHeaderTag}>
 {isToday ? cm.today : activeDay?.label}
 </BText>
 {cals && <BText style={styles.planHeaderTitle}>{cals.total} kcal</BText>}
 </BlurView>
 </ImageBackground>

 {/* ── TRACKER CALORÍAS (barra de progreso + macros, solo hoy) ── */}
 {isToday && cals && (() => {
 const consumedExtras = extras.reduce((s, e) => s + (e.kcal || 0), 0);
 const consumedKcal = Math.round(foodConsumed.kcal + consumedExtras);
 const remaining = Math.max(0, cals.total - consumedKcal);
 const pct = Math.min(1, consumedKcal / cals.total);
 const over = consumedKcal > cals.total;
 const barColor = over ? '#DC2626' : pct > 0.85 ? '#FE6004' : '#49CF38';
 const lbl = { es: ['Consumidas', 'Restantes', 'Superado en'],
 en: ['Consumed', 'Remaining', 'Over by'],
 fr: ['Consommées', 'Restantes', 'Dépassé de'],
 it: ['Consumate', 'Rimanenti', 'Superato di'] }[lang] || [];
 const hasMacros = foodConsumed.protein_g > 0 || foodConsumed.carbs_g > 0 || foodConsumed.fat_g > 0;
 return (
 <View style={styles.calCard}>
 <View style={styles.calBarBg}>
 <View style={[styles.calBarFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
 </View>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
 <View style={styles.calStat}>
 <BText style={[styles.calStatNum, { color: barColor }]}>{consumedKcal}</BText>
 <BText style={styles.calStatLbl}>{lbl[0]}</BText>
 </View>
 <View style={styles.calDivider} />
 <View style={styles.calStat}>
 <BText style={[styles.calStatNum, { color: over ? '#DC2626' : '#0A0A0A' }]}>
 {over ? `+${consumedKcal - cals.total}` : remaining}
 </BText>
 <BText style={styles.calStatLbl}>{over ? lbl[2] : lbl[1]}</BText>
 </View>
 </View>
 {hasMacros && (
 <View style={styles.macroRow}>
 <View style={styles.macroPill}>
 <BText style={styles.macroPillLbl}>P</BText>
 <BText style={styles.macroPillVal}>{Math.round(foodConsumed.protein_g)}g</BText>
 </View>
 <View style={styles.macroPill}>
 <BText style={styles.macroPillLbl}>HC</BText>
 <BText style={styles.macroPillVal}>{Math.round(foodConsumed.carbs_g)}g</BText>
 </View>
 <View style={styles.macroPill}>
 <BText style={styles.macroPillLbl}>G</BText>
 <BText style={styles.macroPillVal}>{Math.round(foodConsumed.fat_g)}g</BText>
 </View>
 </View>
 )}
 </View>
 );
 })()}

 {/* ── FOCO DE HOY ── */}
 {(cals || nutritionCtx) && (
 <View style={styles.orangeHeroCard}>
 <BText style={styles.orangeHeroLabel}>
 {lang === 'en' ? 'Today\'s focus' : lang === 'fr' ? "Focus du jour" : 'Foco de hoy'}
 </BText>
 {nutritionCtx && (
 <>
 {(Array.isArray(nutritionCtx.nutrients) ? nutritionCtx.nutrients : [nutritionCtx.nutrients]).length > 0 && (
  <View style={styles.orangeHeroPills}>
  {(Array.isArray(nutritionCtx.nutrients) ? nutritionCtx.nutrients : [nutritionCtx.nutrients]).map((nu, i) => (
   <View key={i} style={styles.orangeHeroPill}>
   <BText style={styles.orangeHeroPillTxt}>{nu}</BText>
   </View>
  ))}
  </View>
 )}
 {!!(nutritionCtx.tip || nutritionCtx.dietNote) && (
  <View style={styles.orangeHeroWarn}>
  <BText style={styles.orangeHeroTip}>{nutritionCtx.tip || nutritionCtx.dietNote}</BText>
  </View>
 )}
 {!!nutritionCtx.avoidNote && (
  <View style={styles.orangeHeroWarn}>
  <BText style={styles.orangeHeroTip}>{nutritionCtx.avoidNote}</BText>
  </View>
 )}
 </>
 )}
 {cals && !nutritionCtx && <BText style={styles.orangeHeroKcal}>{cals.total} kcal</BText>}
 </View>
 )}

 {/* Comidas del día seleccionado */}
 <View style={styles.mealsWrapper}>
 <BText style={styles.mealsWrapperTitle}>
 {lang === 'en' ? 'Today\'s meals' : lang === 'fr' ? 'Tes repas du jour' : 'Tus comidas de hoy'}
 </BText>
 {(() => {
 const nextMealId = isToday ? getNextMealId(activeSlots) : null;
 return meals.map((meal, i) => (
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
 onLogStatus={isToday && logRecipeDone ? (status) => {
               logRecipeDone(meal.id, status);
               if (status === 'done') logRecipe(meal);
               else unlogRecipe(meal.id);
             } : null}
 logStatus={isToday ? todayActivityRecipes[meal.id] : undefined}
 isNext={isToday && meal.id === nextMealId}
 />
 ));
 })()}
 </View>

 {/* ── EXTRAS (solo hoy) ── */}
 {isToday && (
 <View style={styles.extrasCard}>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: extras.length ? 10 : 0 }}>
 <BText style={styles.calTitle}>
 {{ es: 'Otras comidas', en: 'Other foods', fr: 'Autres aliments', it: 'Altro cibo' }[lang] || 'Otras comidas'}
 </BText>
 <TouchableOpacity onPress={() => setShowAddExtra(true)} style={styles.addExtraBtn}>
 <BText style={styles.addExtraBtnTxt}>
 {{ es: '+ Añadir', en: '+ Add', fr: '+ Ajouter', it: '+ Aggiungi' }[lang] || '+ Añadir'}
 </BText>
 </TouchableOpacity>
 </View>
 {extras.map((e, i) => (
 <View key={i} style={styles.extraRow}>
 <BText style={styles.extraName}>{e.name}</BText>
 <BText style={styles.extraKcal}>{e.kcal} kcal</BText>
 <TouchableOpacity onPress={() => removeExtra(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
 <X size={14} color="#A3A3A3" />
 </TouchableOpacity>
 </View>
 ))}
 </View>
 )}
 </>
 );
 })()}

 <WaterCard lang={lang} />

 {/* ── TU PLAN NUTRICIONAL — Figma ── */}
 {(() => {
 const dtl = getDayTypeLabels(lang);
 const planTitle = lang === 'en' ? 'Your nutrition plan' : lang === 'fr' ? 'Ton plan nutritionnel' : 'Tu plan nutricional';
 const editLabel = lang === 'en' ? 'Edit plan' : lang === 'fr' ? 'Modifier le plan' : 'Editar plan';
 const PHASE_PILLS = [
 { label: lang === 'en' ? 'MENSTRUAL' : 'MENSTRUAL', bg: '#86EFAC', color: '#14532D' },
 { label: lang === 'en' ? 'FOLLICULAR' : 'FOLICULAR', bg: '#C4B5FD', color: '#4C1D95' },
 { label: lang === 'en' ? 'OVULATION' : 'OVULACIÓN', bg: '#FDE68A', color: '#78350F' },
 { label: lang === 'en' ? 'LUTEAL' : 'LÚTEA', bg: '#FDC7A0', color: '#7C2D12' },
 ];
 return (
 <View style={styles.planNutriCard}>
 <View style={styles.planNutriHeader}>
 <BText style={styles.planNutriHeaderTxt}>{planTitle}</BText>
 <ChevronRight size={16} color="#260E01" />
 </View>

 {dietData ? (
 <>
 <BText style={styles.planNutriTitle}>{dietData.name[lang] || dietData.name.es}</BText>
 {dietData.macros && (
 <View style={styles.planNutriMacros}>
 {[
 { k: lang === 'en' ? 'PROTEIN' : 'PROTEÍNAS', v: dietData.macros.protein_pct },
 { k: lang === 'en' ? 'CARBS' : 'CARBOS', v: dietData.macros.carbs_pct },
 { k: lang === 'en' ? 'FAT' : 'GRASAS', v: dietData.macros.fat_pct },
 ].map(m => (
 <View key={m.k} style={styles.planNutriMacroPill}>
 <BText style={styles.planNutriMacroPillTxt}>{m.k} {m.v}%</BText>
 </View>
 ))}
 </View>
 )}
 </>
 ) : (
 <BText style={styles.planNutriTitle}>
 {lang === 'en' ? 'Configure your plan' : lang === 'fr' ? 'Configure ton plan' : 'Configura tu plan'}
 </BText>
 )}

 <View style={styles.planNutriPills}>
 {PHASE_PILLS.map(p => (
 <View key={p.label} style={[styles.planNutriPill, { backgroundColor: p.bg }]}>
 <BText style={[styles.planNutriPillTxt, { color: p.color }]}>{p.label}</BText>
 </View>
 ))}
 </View>

 <View style={styles.planNutriDays}>
 {['A', 'B', 'free'].map(key => (
 <View key={key} style={styles.planNutriDayRow}>
 <View style={styles.planNutriAvatar}>
 <BText style={styles.planNutriAvatarTxt}>{key === 'free' ? 'C' : key}</BText>
 </View>
 <View style={{ flex: 1 }}>
 <BText style={styles.planNutriDayLabel}>{dtl[key].label}</BText>
 <BText style={styles.planNutriDayTag}>{dtl[key].tag}</BText>
 </View>
 </View>
 ))}
 </View>

 <TouchableOpacity style={styles.planNutriEditBtn} onPress={() => nutriOpenRef.current?.()}>
 <BText style={styles.planNutriEditTxt}>{editLabel}</BText>
 </TouchableOpacity>
 </View>
 );
 })()}

 <TipsCard articles={nutriArticles} lang={lang} variant="azote" />
 </>}

 {/* ── LISTA DE LA COMPRA ── */}
 {sub === 'lista' && <>
 {/* Nav semana */}
 <View style={styles.listNavRow}>
 <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} style={styles.listNavBtn}>
 <ChevronLeft size={16} color="#0A0A0A" />
 </TouchableOpacity>
 <BText style={styles.listNavLabel}>
 {weekOffset === 0
 ? (lang === 'en' ? 'This week' : lang === 'fr' ? 'Cette semaine' : 'Esta semana')
 : weekOffset === -1
 ? (lang === 'en' ? 'Last week' : lang === 'fr' ? 'Semaine passée' : 'Semana pasada')
 : weekOffset === 1
 ? (lang === 'en' ? 'Next week' : lang === 'fr' ? 'Semaine prochaine' : 'Semana siguiente')
 : `${weekOffset > 0 ? '+' : ''}${weekOffset}w`}
 </BText>
 <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} style={styles.listNavBtn}>
 <ChevronRight size={16} color="#0A0A0A" />
 </TouchableOpacity>
 </View>

 {/* Tarjeta principal: personas + compartir */}
 <View style={styles.listMainCard}>
 {/* Header */}
 <View style={styles.listMainHeader}>
 <BText style={styles.listMainHeaderTxt}>
 {lang === 'en' ? 'Week list' : lang === 'fr' ? 'Liste de la semaine' : 'Lista de la semana'}
 </BText>
 </View>

 {/* Contador productos */}
 <BText style={styles.listItemCount}>
 {shopItemsCount} {lang === 'en' ? 'products added' : lang === 'fr' ? 'produits ajoutés' : lang === 'it' ? 'prodotti aggiunti' : 'productos añadidos'}
 </BText>

 {/* Personas */}
 <View style={styles.listPersonsWrap}>
 {[
 { label: n.adults, sub: lang === 'en' ? 'Over 16 years' : lang === 'fr' ? 'Plus de 16 ans' : lang === 'it' ? 'Oltre 16 anni' : 'Mayores de 16 años', val: adults, set: setAdults, min: 1, max: 8 },
 { label: n.children, sub: lang === 'en' ? 'Under 16 years' : lang === 'fr' ? 'Moins de 16 ans' : lang === 'it' ? 'Meno di 16 anni' : 'Menores de 16 años', val: children, set: setChildren, min: 0, max: 6 },
 ].map((p) => (
 <View key={p.label} style={styles.listPersonRow}>
 <View style={{ flex: 1 }}>
 <BText style={styles.listPersonLabel}>{p.label}</BText>
 <BText style={styles.listPersonSub}>{p.sub}</BText>
 </View>
 <View style={styles.listCounter}>
 <TouchableOpacity onPress={() => p.set(v => Math.max(p.min, v - 1))} style={styles.listCounterBtn}>
 <BText style={styles.listCounterTxt}>−</BText>
 </TouchableOpacity>
 <View style={styles.listCounterValBox}>
 <BText style={[styles.listCounterVal, p.val === 0 && { color: '#737373' }]}>{p.val}</BText>
 </View>
 <TouchableOpacity onPress={() => p.set(v => Math.min(p.max, v + 1))} style={styles.listCounterBtn}>
 <BText style={styles.listCounterTxt}>+</BText>
 </TouchableOpacity>
 </View>
 </View>
 ))}
 </View>

 {/* Compartir */}
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
 const shareLabel = lang === 'en' ? 'Shopping list' : 'Lista de la compra';
 Share.share({ message: `${shareLabel}\n\n${lines}` });
 }}
 style={styles.listShareLink}>
 <BText style={styles.listShareLinkTxt}>
 {lang === 'en' ? 'Share' : lang === 'fr' ? 'Partager' : lang === 'it' ? 'Condividi' : 'Compartir'}
 </BText>
 </TouchableOpacity>
 </View>

 {/* Categorías de ingredientes */}
 {Object.entries(finalShopData).map(([cat, items]) => (
 <View key={cat} style={styles.listCatCard}>
 <BText style={styles.listCatTitle}>{cat}</BText>
 <View>
 {items.map((item, idx) => {
 const qty = item.qty ?? item.totalQty;
 const unit = item.unit;
 const qtyLabel = shoppingListFromRecipes ? formatQuantity(qty, unit) : formatQty(qty, unit, lang);
 const itemKey = item.key || item.name;
 const checked = !!checkedItems[itemKey];
 return (
 <TouchableOpacity key={itemKey}
 style={[styles.shopRow, idx < items.length - 1 && styles.shopRowBorder]}
 onPress={() => setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
 activeOpacity={0.7}>
 <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
 {checked && <Check size={12} color="#fff" />}
 </View>
 <BText style={[styles.shopName, checked && styles.shopNameChecked]}>{item.name}</BText>
 <BText style={[styles.shopQty, checked && styles.shopQtyChecked]}>{qtyLabel}</BText>
 </TouchableOpacity>
 );
 })}
 </View>
 </View>
 ))}
 </>}


 {/* ── FAVORITOS ── */}
 {sub === 'favoritos' && (() => {
 const favIds = profileExtended?.favoriteRecipes || [];
 const favRecipes = (allRecipes || []).filter(r => favIds.includes(r.id));
 const emptyTxt = { es: 'Aún no tienes favoritos', en: 'No favourites yet', fr: 'Pas encore de favoris', it: 'Ancora nessun preferito' };
 const hintTxt = { es: 'Pulsa el corazon en cualquier receta para guardarla aqui.', en: 'Tap the heart on any recipe to save it here.', fr: 'Appuie sur le coeur sur une recette pour la sauvegarder ici.', it: 'Tocca il cuore su una ricetta per salvarla qui.' };
 if (!favRecipes.length) return (
 <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
 <Heart size={40} color="#E5E5E5" style={{ marginBottom: 12 }} />
 <BText style={{ fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 8, textAlign: 'center' }}>{emptyTxt[lang] || emptyTxt.es}</BText>
 <BText style={{ fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 20 }}>{hintTxt[lang] || hintTxt.es}</BText>
 </View>
 );
 return favRecipes.map(r => {
 const card = recipeToMealCard(r, lang);
 if (!card) return null;
 const m = card.macros;
 return (
 <View key={r.id} style={styles.favCard}>
 <View style={styles.favCardContent}>
 <View style={styles.favCardTop}>
 <BText style={styles.favCardTitle}>{card.title}</BText>
 {m?.kcal != null && (
 <View style={styles.favTagsRow}>
 {[`${m.kcal} kcal`, `P: ${m.protein}g`, `H: ${m.carbs}g`, `G: ${m.fat}g`].map(t => (
 <View key={t} style={styles.favTag}><BText style={styles.favTagTxt}>{t}</BText></View>
 ))}
 </View>
 )}
 </View>
 <View style={styles.favActions}>
 <TouchableOpacity style={styles.favRecipeBtn}
 onPress={() => setRecipe({ ...card.recipe, mealLabel: card.label, title: card.title, emoji: card.ico, macros: m, _recipeId: r.id })}>
 <BText style={styles.favRecipeBtnTxt}>{n.seeRecipeShort || 'Ver receta'}</BText>
 </TouchableOpacity>
 <TouchableOpacity style={styles.favHeartBtn}
 onPress={() => toggleFavoriteRecipe && toggleFavoriteRecipe(r.id)}>
 <Heart size={16} color="white" fill="white" />
 </TouchableOpacity>
 </View>
 </View>
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
 <BText style={styles.extraModalTitle}>
 {{ es: 'Añadir comida', en: 'Add food', fr: 'Ajouter un aliment', it: 'Aggiungi cibo' }[lang] || 'Añadir comida'}
 </BText>
 <TextInput
 style={styles.extraInput}
 placeholder={{ es: 'Nombre (ej. Croissant)', en: 'Name (e.g. Croissant)', fr: 'Nom (ex. Croissant)', it: 'Nome (es. Croissant)' }[lang] || 'Nombre'}
 placeholderTextColor="#737373"
 value={extraName}
 onChangeText={setExtraName}
 />
 <TextInput
 style={styles.extraInput}
 placeholder="kcal"
 placeholderTextColor="#737373"
 keyboardType="numeric"
 value={extraKcalStr}
 onChangeText={setExtraKcalStr}
 />
 <TouchableOpacity
 onPress={addExtra}
 style={[styles.addExtraBtn, { marginTop: 4, paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: (extraName.trim() && extraKcalStr) ? 1 : 0.4 }]}>
 <BText style={[styles.addExtraBtnTxt, { fontSize: 15 }]}>
 {{ es: 'Guardar', en: 'Save', fr: 'Enregistrer', it: 'Salva' }[lang] || 'Guardar'}
 </BText>
 </TouchableOpacity>
 </View>
 </Modal>

 {/* ── RECIPE MODAL ── */}
 {recipe && (() => {
  const m = recipe.macros;
  const total = m ? (m.protein * 4) + (m.carbs * 4) + (m.fat * 9) : 0;
  const proteinPct = m && total ? Math.round((m.protein * 4 / total) * 100) : 0;
  const carbsPct = m && total ? Math.round((m.carbs * 4 / total) * 100) : 0;
  const fatPct = m && total ? Math.round((m.fat * 9 / total) * 100) : 0;
  const fiberPct = m?.fiber != null ? Math.round((m.fiber / 30) * 100) : null;
  const isFav = recipe._recipeId && profileExtended?.favoriteRecipes?.includes(recipe._recipeId);
  const macroRows = [
   { label: lang === 'en' ? 'Protein' : 'Proteína', amt: `${m?.protein ?? 0}g`, pct: `${proteinPct}%` },
   { label: lang === 'en' ? 'Carbs' : 'Carbohidratos', amt: `${m?.carbs ?? 0}g`, pct: `${carbsPct}%` },
   { label: lang === 'en' ? 'Fats' : 'Grasas', amt: `${m?.fat ?? 0}g`, pct: `${fatPct}%` },
   ...(m?.fiber != null ? [{ label: lang === 'en' ? 'Fibre' : 'Fibra', amt: `${m.fiber}g`, pct: `${fiberPct}%` }] : []),
  ];
  return (
   <Modal key="recipe-modal" visible animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => setRecipe(null)}>
    <View style={styles.recipeModalOverlay}>
     <SafeAreaView style={styles.recipeModalSheet}>
      <View style={styles.recipeModalHeader}>
       <BText style={styles.recipeModalTitle}>{lang === 'en' ? 'Recipe' : lang === 'fr' ? 'Recette' : 'Receta'}</BText>
       <TouchableOpacity style={styles.recipeModalClose} onPress={() => setRecipe(null)}>
        <BText style={{ fontSize: 18, color: '#0A0A0A', fontFamily: F.body, lineHeight: 22 }}>✕</BText>
       </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.recipeModalContent}>
       <View style={{ gap: 16 }}>
        {recipe.image && (
         <Image source={{ uri: recipe.image }} style={{ width: '100%', aspectRatio: 1, borderRadius: 24 }} resizeMode="cover" />
        )}
        <BText style={styles.recipeHeroTitle}>{recipe.title}</BText>
        {m?.kcal != null && (
         <View style={styles.recipeMacroTags}>
          {[`${m.kcal} kcal`, `P: ${m.protein}g`, `H: ${m.carbs}g`, `G: ${m.fat}g`].map(t => (
           <View key={t} style={styles.recipeMacroTag}>
            <BText style={styles.recipeMacroTagTxt}>{t}</BText>
           </View>
          ))}
         </View>
        )}
       </View>
       {m?.kcal != null && (
        <View style={styles.recipeOrangeCard}>
         <BText style={styles.recipeOrangeKcal}>{m.kcal} kcal</BText>
         <View style={{ gap: 16 }}>
          {macroRows.map(row => (
           <View key={row.label} style={{ gap: 8 }}>
            <BText style={styles.recipeOrangeMacroLabel}>{row.label}</BText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
             <BText style={styles.recipeOrangeMacroAmt}>{row.amt}</BText>
             <BText style={styles.recipeOrangeMacroPct}>{row.pct}</BText>
            </View>
           </View>
          ))}
         </View>
        </View>
       )}
       {(recipe.ingredients || []).length > 0 && (
        <View style={{ gap: 16 }}>
         <BText style={styles.recipeSectionTitle}>{lang === 'en' ? 'Ingredients' : lang === 'fr' ? 'Ingrédients' : 'Ingredientes'}</BText>
         <View style={{ gap: 2 }}>
          {(recipe.ingredients || []).map((ing, i) => (
           <View key={i} style={styles.recipeListItem}>
            <View style={styles.recipeListDot} />
            <BText style={styles.recipeListText}>{ing}</BText>
           </View>
          ))}
         </View>
        </View>
       )}
       {(recipe.steps || []).length > 0 && (
        <View style={{ gap: 16 }}>
         <BText style={styles.recipeSectionTitle}>{lang === 'en' ? 'Preparation' : lang === 'fr' ? 'Préparation' : 'Preparación'}</BText>
         <View style={{ gap: 2 }}>
          {(recipe.steps || []).map((step, i) => (
           <View key={i} style={styles.recipeListItem}>
            <View style={styles.recipeListDot} />
            <BText style={styles.recipeListText}>{step}</BText>
           </View>
          ))}
         </View>
        </View>
       )}
       <View style={{ gap: 8 }}>
        {toggleFavoriteRecipe && recipe._recipeId && (
         <TouchableOpacity style={styles.recipeOutlineBtn} onPress={() => toggleFavoriteRecipe(recipe._recipeId)}>
          <BText style={styles.recipeOutlineBtnTxt}>{isFav ? (lang === 'en' ? 'Saved' : 'En favoritos') : (lang === 'en' ? 'Add to favourites' : 'Añadir a favorito')}</BText>
          <Heart size={24} color="#171717" fill={isFav ? '#171717' : 'none'} />
         </TouchableOpacity>
        )}
        {logRecipeDone && recipe._recipeId && (
         <TouchableOpacity style={styles.recipeOutlineBtn} onPress={() => { logRecipeDone(recipe.mealId || recipe.mealLabel, 'done'); setRecipe(null); }}>
          <BText style={styles.recipeOutlineBtnTxt}>{lang === 'en' ? "I've eaten it" : lang === 'fr' ? "Je l'ai mangé" : 'Lo he comido'}</BText>
          <Check size={24} color="#171717" />
         </TouchableOpacity>
        )}
       </View>
      </ScrollView>
     </SafeAreaView>
    </View>
   </Modal>
  );
 })()}

 </SwipeableTabs>
 );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: 'white' },
 content: { padding: 14, paddingTop: 60, paddingBottom: 100 },

 // Foco de hoy
 orangeHeroCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 12, marginBottom: 2 },
 orangeHeroLabel: { fontSize: 12, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 },
 orangeHeroKcal: { fontSize: 32, color: '#0A0A0A', fontFamily: F.headingX },
 orangeHeroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
 orangeHeroPill: { height: 24, paddingHorizontal: 8, backgroundColor: '#FE6004', borderRadius: 8, justifyContent: 'center' },
 orangeHeroPillTxt: { fontSize: 10, fontFamily: F.bodyB, color: 'white', textTransform: 'uppercase', letterSpacing: 0.3 },
 orangeHeroWarn: { backgroundColor: '#FFDFCD', borderRadius: 8, padding: 8 },
 orangeHeroTip: { fontSize: 14, color: '#0A0A0A', lineHeight: 20, fontFamily: F.body },

 // Lista de la compra
 listNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
 listNavBtn: { padding: 6 },
 listNavLabel: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', textAlign: 'center' },
 listMainCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24, marginBottom: 2 },
 listMainHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
 listMainHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A' },
 listItemCount: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 listPersonsWrap: { gap: 2 },
 listPersonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', borderRadius: 24, padding: 16 },
 listPersonLabel: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, marginBottom: 2 },
 listPersonSub: { fontSize: 12, color: '#525252', fontFamily: F.body },
 listCounter: { flexDirection: 'row', alignItems: 'center', gap: 2 },
 listCounterBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 listCounterTxt: { fontSize: 20, color: 'white', fontFamily: F.body },
 listCounterValBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
 listCounterVal: { fontSize: 16, fontFamily: F.body, color: '#171717', textAlign: 'center' },
 listShareLink: { alignItems: 'center', justifyContent: 'center', height: 32 },
 listShareLinkTxt: { fontSize: 14, fontFamily: F.body, color: '#171717', textDecorationLine: 'underline' },
 listCatCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24, marginBottom: 2 },
 listCatTitle: { fontSize: 18, fontFamily: F.headingX, color: '#0A0A0A' },
 checkboxChecked: { backgroundColor: '#262626', borderColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 shopNameChecked: { textDecorationLine: 'line-through', color: '#737373' },
 shopRowBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
 shopQtyChecked: { color: '#737373' },

 card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
 back: { fontSize: 14, color: '#0A0A0A', fontFamily: F.bodyB, marginBottom: 16 },
 recipeTag: { fontSize: 11, color: '#0A0A0A', fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
 recipeTitle: { fontSize: 18, color: '#0A0A0A', marginBottom: 4, fontFamily: F.heading },
 sectionTitle: { fontSize: 14, color: '#0A0A0A', marginBottom: 10, fontFamily: F.heading },
 listRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
 dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0A0A0A', marginTop: 5, marginRight: 10, flexShrink: 0 },
 listText: { fontSize: 13, color: '#0A0A0A', flex: 1, lineHeight: 20, fontFamily: F.body },
 stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#171717', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 stepNumText: { color: 'white', fontSize: 12, fontFamily: F.bodyB },
 stepText: { fontSize: 13, color: '#0A0A0A', lineHeight: 20, flex: 1, paddingTop: 4, fontFamily: F.body },
 tabRow: { flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 20, padding: 4, marginBottom: 14 },
 tab: { flex: 1, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
 tabActive: { backgroundColor: 'white' },
 tabText: { fontSize: 16, color: 'white', fontFamily: F.body },
 tabTextActive: { color: '#0A0A0A', fontFamily: F.body },

 // Semana — calendario Figma
 weekStripCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2, gap: 24 },
 weekNavAzote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 weekNavLabelAzote: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, lineHeight: 20.8 },
 weekDayLabelsRow: { flexDirection: 'row' },
 weekDayLabelCell: { width: 43, alignItems: 'center', padding: 4 },
 weekDayLabel: { fontSize: 10, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', lineHeight: 13, textAlign: 'center' },
 weekStripRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
 weekCell: { width: 43, height: 43, backgroundColor: 'white', borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
 weekCellToday: { borderWidth: 1, borderColor: '#0A0A0A' },
 weekCellActive: { borderWidth: 1, borderColor: '#0A0A0A' },
 weekCellGlow: { position: 'absolute', width: 44, height: 44, left: -1, top: 21, borderRadius: 22, opacity: 0.7 },
 weekCellNum: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },

 planHeaderCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 2, padding: 8 },
 planHeaderBlur: { flex: 1, padding: 8, borderRadius: 16, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.30)' },
 planHeaderTag: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 planHeaderTitle: { fontSize: 18, color: '#0A0A0A', fontFamily: F.heading, lineHeight: 23.4 },
 planSub: { fontSize: 12, lineHeight: 18, opacity: 0.85, fontFamily: F.body },
 mealsWrapper: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 16, marginBottom: 2 },
 mealsWrapperTitle: { fontSize: 12, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 },
 mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
 mealIco: { fontSize: 26, flexShrink: 0, fontFamily: F.body },
 mealTag: { fontSize: 10, color: '#0A0A0A', fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
 mealTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 mealMacros: { fontSize: 11, color: '#737373', marginTop: 4, fontFamily: F.body },

 // Action buttons (favorite, swap, done, skip)
 actionRow: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
 actionBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
 actionBtnDone: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
 actionBtnSkip: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
 actionTxt: { fontSize: 16, fontFamily: F.body },
 chevron: { color: '#E5E5E5', fontSize: 14, flexShrink: 0, fontFamily: F.body },
 mealDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
 recipeBtn: { marginTop: 12, padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#429FE7', backgroundColor: '#EFF6FF', alignItems: 'center' },
 recipeBtnText: { color: '#429FE7', fontFamily: F.bodyB, fontSize: 13 },

 // Tu plan nutricional — Figma
 planNutriCard: { backgroundColor: '#FEA068', borderRadius: 24, padding: 20, marginBottom: 2 },
 planNutriHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
 planNutriHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#260E01', letterSpacing: 0.5 },
 planNutriTitle: { fontSize: 20, fontFamily: F.headingX, color: '#260E01', marginBottom: 10, lineHeight: 24 },
 planNutriMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
 planNutriMacroPill: { backgroundColor: '#FFBF9B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
 planNutriMacroPillTxt: { fontSize: 10, fontFamily: F.bodyB, color: '#260E01', textTransform: 'uppercase', letterSpacing: 0.3 },
 planNutriPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
 planNutriPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
 planNutriPillTxt: { fontSize: 10, fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.3 },
 planNutriDays: { gap: 2, marginBottom: 16 },
 planNutriDayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFBF9B', borderRadius: 16, padding: 12 },
 planNutriAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FEA068', alignItems: 'center', justifyContent: 'center' },
 planNutriAvatarTxt: { fontSize: 24, fontFamily: F.headingX, color: '#260E01' },
 planNutriDayLabel: { fontSize: 18, fontFamily: F.headingX, color: '#260E01' },
 planNutriDayTag: { fontSize: 14, color: '#9E3C02', marginTop: 1, fontFamily: F.body },
 planNutriEditBtn: { backgroundColor: 'white', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 planNutriEditTxt: { fontSize: 18, fontFamily: F.body, color: '#0A0A0A' },
 dayTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 6 },
 dayTypeLabel: { fontSize: 13, fontFamily: F.bodyB },
 dayTypeTag: { fontSize: 12, fontFamily: F.body },
 dayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 dayDate: { width: 50, alignItems: 'center', flexShrink: 0 },
 dayLabel: { fontSize: 11, color: '#737373', fontFamily: F.body },
 dayNum: { fontSize: 20, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 24 },
 dayTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexShrink: 0 },
 dayTypeBadgeText: { fontSize: 10, fontFamily: F.bodyB },
 dayMeals: { fontSize: 12, color: '#737373', fontFamily: F.body },
 personsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
 personBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 10, alignItems: 'center' },
 personLabel: { fontSize: 11, color: '#737373', marginBottom: 6, fontFamily: F.body },
 counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 counterBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
 counterBtnText: { fontSize: 16, fontFamily: F.bodyB },
 counterVal: { fontSize: 20, fontFamily: F.bodyB, minWidth: 16, textAlign: 'center' },
 counterBtnFill: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
 counterBtnFillText: { color: 'white', fontSize: 16, fontFamily: F.bodyB },
 listSub: { fontSize: 12, color: '#737373', marginBottom: 4, fontFamily: F.body },
 shopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
 shopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
 checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: '#737373', backgroundColor: 'white', flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
 shopName: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, flex: 1 },
 shopQty: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', flexShrink: 0 },
 // Calorie tracker
 calCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
 calTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 calBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
 calBarFill: { height: '100%', borderRadius: 5 },
 calStat: { flex: 1, alignItems: 'center' },
 calStatNum: { fontSize: 24, fontFamily: F.headingX },
 calStatLbl: { fontSize: 11, color: '#737373', marginTop: 2, fontFamily: F.body },
 calDivider: { width: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
 macroRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
 macroPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 10, paddingVertical: 6 },
 macroPillLbl: { fontSize: 10, fontFamily: F.bodyB, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 },
 macroPillVal: { fontSize: 13, fontFamily: F.headingX, color: '#0A0A0A' },
 // Extras
 extrasCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
 addExtraBtn: { backgroundColor: '#429FE7', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
 addExtraBtnTxt:{ color: 'white', fontSize: 13, fontFamily: F.bodyB },
 extraRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
 extraName: { flex: 1, fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 extraKcal: { fontSize: 12, color: '#F59E0B', fontFamily: F.bodyB },
 // Favoritos cards (Figma)
 favCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
 favCardContent: { gap: 8 },
 favCardTop: { gap: 16 },
 favCardTitle: { fontSize: 20, fontFamily: F.headingX, color: '#0A0A0A', lineHeight: 26 },
 favTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 favTag: { height: 24, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
 favTagTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },
 favActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
 favRecipeBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 8 },
 favRecipeBtnTxt: { fontSize: 14, fontFamily: F.body, color: '#171717', textDecorationLine: 'underline' },
 favHeartBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 // Recipe bottom sheet modal
 recipeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 recipeModalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1, maxHeight: '90%' },
 recipeModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 48 },
 recipeModalTitle: { flex: 1, fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },
 recipeModalClose: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
 recipeModalContent: { padding: 16, paddingBottom: 48, gap: 48 },
 recipeHeroTitle: { fontSize: 28, fontFamily: F.heading, color: '#171717' },
 recipeMacroTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 recipeMacroTag: { height: 24, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
 recipeMacroTagTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },
 recipeOrangeCard: { backgroundColor: '#FE6004', borderRadius: 24, padding: 16, gap: 24, alignItems: 'flex-start' },
 recipeOrangeKcal: { fontSize: 18, fontFamily: F.heading, color: '#260E01', lineHeight: 23.4, alignSelf: 'stretch' },
 recipeOrangeMacroLabel: { fontSize: 14, fontFamily: F.body, color: '#260E01', lineHeight: 19.6, alignSelf: 'stretch' },
 recipeOrangeMacroAmt: { fontSize: 12, fontFamily: F.body, color: '#260E01', textTransform: 'uppercase', lineHeight: 15.6 },
 recipeOrangeMacroPct: { fontSize: 12, fontFamily: F.body, color: '#260E01', textTransform: 'uppercase', lineHeight: 15.6 },
 recipeSectionTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#171717', lineHeight: 20.8 },
 recipeListItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 recipeListDot: { width: 4.76, height: 4.76, borderRadius: 9999, backgroundColor: '#0A0A0A', flexShrink: 0 },
 recipeListText: { flex: 1, fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 },
 recipeOutlineBtn: { height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#171717', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
 recipeOutlineBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#171717', lineHeight: 24 },

 // Modal extras
 extraModal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 12 },
 extraModalHandle:{ width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
 extraModalTitle: { fontSize: 17, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 4 },
 extraInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0A0A0A', fontFamily: F.body },
});
const ne = StyleSheet.create({
 wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
 card: { borderRadius: 24, padding: 16, gap: 32, overflow: 'hidden', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.20)' },
 iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FE6004', alignItems: 'center', justifyContent: 'center' },
 iconInner: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#260E01' },
 title: { fontSize: 24, fontFamily: F.heading, color: 'white', textAlign: 'center', lineHeight: 28.8 },
 sub: { fontSize: 16, fontFamily: F.body, color: 'white', textAlign: 'center', lineHeight: 20.8 },
 btn: { alignSelf: 'stretch', height: 48, backgroundColor: '#171717', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
 btnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA', lineHeight: 24 },
});
