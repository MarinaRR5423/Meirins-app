import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Switch, Animated, ImageBackground, Image } from 'react-native';
import { F } from '../theme/fonts';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, Salad, SportShoe, Flame, CalendarDays, Info, Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { FlowerIcon } from '../components/TabIcons';
import { usePhaseData } from '../hooks/usePhaseData';
import T, { getPhaseDisplay, getMealLabel } from '../i18n/translations';
import { calcCalories } from '../utils/calories';
import { getTodayWorkout } from '../utils/programEngine';
import { useWorkouts } from '../hooks/useWorkouts';
import { buildPersonalizedWeekPlan } from '../utils/workoutEngine';
import { getActiveProgramState, getProgramDays, programSessionToCard } from '../data/trainingPrograms';
import EmptyState from '../components/EmptyState';
import { calcAdherence } from '../utils/adherenceStats';
import { trackScreen } from '../lib/analytics';
import WaterCard from '../components/WaterCard';
import CycleTrackingModal from '../components/CycleTrackingModal';
import BText from '../components/BText';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

const PHASE_IMAGES = {
 menstrual: require('../../assets/phases/menstrual.png'),
 follicular: require('../../assets/phases/follicular.png'),
 ovulation: require('../../assets/phases/ovulation.png'),
 luteal: require('../../assets/phases/luteal.png'),
};

const HERO_COPY = {
 menstrual: { es: 'estás entrando en la fase menstrual', en: 'you\'re entering your menstrual phase', fr: 'tu entres dans ta phase menstruelle', it: 'stai entrando nella fase mestruale' },
 follicular: { es: 'estás en plena fase folicular', en: 'you\'re in full follicular phase', fr: 'tu es en pleine phase folliculaire', it: 'sei in piena fase follicolare' },
 ovulation: { es: 'estás en la fase de ovulación', en: 'you\'re in your ovulation phase', fr: 'tu es dans ta phase d\'ovulation', it: 'sei nella fase di ovulazione' },
 luteal: { es: 'estás acabando tu fase lútea', en: 'you\'re finishing your luteal phase', fr: 'tu termines ta phase lutéale', it: 'stai finendo la tua fase luteale' },
};

function WidgetWrap({ id, widgets, editMode, onLongPress, onRemove, wiggleRotate, children }) {
 if (!widgets[id]) return null;
 return (
 <TouchableOpacity activeOpacity={1} onLongPress={onLongPress} delayLongPress={400}>
 <Animated.View style={editMode ? { transform: [{ rotate: wiggleRotate }] } : undefined}>
 {children}
 {editMode && (
 <TouchableOpacity style={wwStyles.xBadge} onPress={() => onRemove(id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
 <BText style={wwStyles.xBadgeTxt}></BText>
 </TouchableOpacity>
 )}
 </Animated.View>
 </TouchableOpacity>
 );
}
const wwStyles = StyleSheet.create({
 xBadge: { position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderWidth: 2, borderColor: 'white' },
 xBadgeTxt: { fontSize: 10, color: 'white', fontFamily: F.bodyB, lineHeight: 12 },
});
const HORMONAL_CONTRA = ['pill', 'hormonal_iud', 'ring', 'patch', 'implant'];
const WIDGETS_KEY = 'home_widgets_v1';

const WIDGET_DEFS = [
 { id: 'streak', emoji: '', label: { es: 'Racha', en: 'Streak', fr: 'Série', it: 'Serie' } },
 { id: 'hydration', emoji: '', label: { es: 'Hidratación + Ciclo', en: 'Hydration + Cycle', fr: 'Hydratation + Cycle', it: 'Idratazione + Ciclo' } },
 { id: 'nutrition', emoji: '', label: { es: 'Nutrición de hoy', en: "Today's nutrition", fr: "Nutrition d'aujourd'hui", it: 'Nutrizione di oggi' } },
 { id: 'tip', emoji: '', label: { es: 'Consejo del día', en: 'Tip of the day', fr: 'Conseil du jour', it: 'Consiglio del giorno' } },
];

const DEFAULT_WIDGETS = Object.fromEntries(WIDGET_DEFS.map(w => [w.id, true]));

function useHomeWidgets() {
 const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
 const [loaded, setLoaded] = useState(false);

 useEffect(() => {
 AsyncStorage.getItem(WIDGETS_KEY).then(v => {
 if (v) {
 try { setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(v) }); } catch {}
 }
 setLoaded(true);
 });
 }, []);

 const toggle = useCallback((id) => {
 setWidgets(prev => {
 const next = { ...prev, [id]: !prev[id] };
 AsyncStorage.setItem(WIDGETS_KEY, JSON.stringify(next));
 return next;
 });
 }, []);

 return { widgets, toggle, loaded };
}

export default function HomeScreen({ pi, profile, lang = 'es', healthData, logCycleDay, logRecipeDone }) {
 useEffect(() => { trackScreen('Home', { phase: pi?.phase }); }, []);
 const { phaseData } = usePhaseData(pi?.phase, lang);
 const baseD = phaseData;
 const d = baseD ? getPhaseDisplay(lang, pi?.phase, baseD) : null;

 const isHormonalContra = HORMONAL_CONTRA.includes(profile?.profileExtended?.contraception);
 const navigation = useNavigation();
 const cals = calcCalories(profile, pi?.phase);

 const { workouts: dbWorkouts } = useWorkouts();
 const ext = profile?.profileExtended || {};
 const jsDay = new Date().getDay();

 const todayKeyH = new Date().toISOString().split('T')[0];
 const skippedBlkH = ext.skippedTodayWorkout || {};
 const skippedIdsH = skippedBlkH.date === todayKeyH ? (skippedBlkH.ids || []) : [];

 const planFromDb = dbWorkouts?.length && pi?.phase && profile?.trainDays?.length
 ? buildPersonalizedWeekPlan(
 dbWorkouts,
 {
 fitnessLevel: ext.fitnessLevel || 'regular',
 conditions: ext.conditions || [],
 gymAccess: ext.gymAccess || 'home',
 lifeStage: ext.lifeStage || null,
 primaryGoals: ext.primaryGoals || [],
 sportProfile: ext.sportProfile || {},
 goal: profile?.goal,
 favoriteWorkouts: ext.favoriteWorkouts || [],
 skippedWorkoutIds: skippedIdsH,
 },
 pi?.phase,
 profile?.trainDays,
 lang,
 )
 : null;

 const progState = getActiveProgramState(ext);
 const progDays = progState ? getProgramDays(progState.program, profile?.trainDays || []) : [];
 const todayIsProgramDay = !!progState && (progDays.includes(jsDay) || !(profile?.trainDays || []).length);

 const todaySession = todayIsProgramDay
 ? programSessionToCard(progState, lang)
 : planFromDb?.[jsDay] || getTodayWorkout(
 pi?.phase,
 profile?.trainDays || [],
 ext.fitnessLevel || 'regular',
 ext.conditions || [],
 );
 const h = (T[lang] || T.es).home;
 const c = (T[lang] || T.es).common;

 const hour = new Date().getHours();
 const greetingTxt = (() => {
 const slot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
 const map = {
 morning: { es: 'Buenos días', en: 'Good morning', fr: 'Bonjour', it: 'Buongiorno' },
 afternoon: { es: 'Buenas tardes', en: 'Good afternoon', fr: 'Bon après-midi', it: 'Buon pomeriggio' },
 evening: { es: 'Buenas noches', en: 'Good evening', fr: 'Bonsoir', it: 'Buonasera' },
 night: { es: 'Hola', en: 'Hi', fr: 'Salut', it: 'Ciao' },
 };
 return map[slot][lang] || map[slot].es;
 })();
 const userName = profile?.profileExtended?.name?.trim() || '';
 const avatarInitial = (userName[0] || 'B').toUpperCase();
 const avatarUri = profile?.profileExtended?.avatarUri || null;

 const { widgets, toggle } = useHomeWidgets();
 const [showCustomize, setShowCustomize] = useState(false);
 const [editMode, setEditMode] = useState(false);
 const [trackingOpen, setTrackingOpen] = useState(false);

 const wiggleAnim = useRef(new Animated.Value(0)).current;
 useEffect(() => {
 if (editMode) {
 Animated.loop(
 Animated.sequence([
 Animated.timing(wiggleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
 Animated.timing(wiggleAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
 Animated.timing(wiggleAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
 ])
 ).start();
 } else {
 wiggleAnim.stopAnimation();
 wiggleAnim.setValue(0);
 }
 }, [editMode]);

 const wiggleRotate = wiggleAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-2.5deg', '2.5deg'] });
 const enterEdit = useCallback(() => setEditMode(true), []);
 const ww = { widgets, editMode, onLongPress: enterEdit, onRemove: toggle, wiggleRotate };

 const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

 const customizeTxt = {
 title: { es: 'Personalizar inicio', en: 'Customize home', fr: 'Personnaliser', it: 'Personalizza' },
 done: { es: 'Hecho', en: 'Done', fr: 'Terminé', it: 'Fatto' },
 desc: { es: 'Elige qué mostrar en tu pantalla de inicio.', en: 'Choose what to show on your home screen.', fr: 'Choisis ce qui apparaît sur ton écran d\'accueil.', it: 'Scegli cosa mostrare nella schermata iniziale.' },
 };

 // Empty state
 if (!pi) {
 const emptyTxt = {
 title: { es: 'Registra tu primer ciclo', en: 'Log your first cycle', fr: 'Enregistre ton premier cycle', it: 'Registra il tuo primo ciclo' },
 subtitle: { es: 'Ve a la pestaña Ciclo para introducir la fecha de tu último periodo y desbloquear todo tu programa personalizado', en: 'Go to the Cycle tab to enter your last period date and unlock your personalised programme.', fr: 'Va dans l\'onglet Cycle pour saisir ta dernière date de règles et débloquer ton programme.', it: 'Vai alla scheda Ciclo per inserire la data dell\'ultimo periodo e sbloccare il tuo programma.' },
 cta: { es: 'Registrar', en: 'Register', fr: 'Enregistrer', it: 'Registra' },
 };
 return (
 <ImageBackground source={require('../../assets/Apartados/Blumm_cover_01.png')} style={styles.container}>
 <View style={styles.topBar}>
 <View style={styles.greetingChip}>
  {avatarUri
   ? <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
   : <View style={[styles.avatarCircle, { backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }]}>
      <BText style={styles.avatarInitialTxt}>{avatarInitial}</BText>
     </View>}
  <View style={{ flex: 1 }}>
   <BText style={styles.greetingHi}>{greetingTxt}</BText>
   <BText style={styles.greetingName} numberOfLines={1}>{userName || 'Blumm'}</BText>
  </View>
 </View>
 </View>
 <View style={styles.emptyCardWrap}>
  <BlurView intensity={40} tint="light" style={styles.emptyCard}>
   <View style={styles.emptyIconWrap}>
    <FlowerIcon color="#0B1F08" size={32} />
   </View>
   <View style={{ alignSelf: 'stretch', gap: 8 }}>
    <BText style={styles.emptyTitle}>{emptyTxt.title[lang] || emptyTxt.title.es}</BText>
    <BText style={styles.emptySubtitle}>{emptyTxt.subtitle[lang] || emptyTxt.subtitle.es}</BText>
   </View>
   <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Ciclo')} activeOpacity={0.85}>
    <BText style={styles.emptyBtnTxt}>{emptyTxt.cta[lang] || emptyTxt.cta.es}</BText>
   </TouchableOpacity>
  </BlurView>
 </View>
 </ImageBackground>
 );
 }

 // Últimos 11 días para el punteado de hábito
 const habitDots = Array.from({ length: 11 }, (_, i) => {
 const offset = i - 7;
 const dt = new Date(); dt.setDate(dt.getDate() + offset);
 const key = dt.toISOString().split('T')[0];
 const isToday = offset === 0;
 const isFuture = offset > 0;
 const day = ext.activityLog?.[key];
 const done = !!(day && (Object.keys(day.recipes || {}).length > 0 || day.workout === 'done'));
 return { done, isToday, isFuture };
 });
 const adhStreak = calcAdherence(ext.activityLog || {}, 30);

 const todayCycleKey = new Date().toISOString().split('T')[0];
 const hasCycleLogToday = !!ext.cycleLog?.[todayCycleKey];

 // Estado de "comido" de la siguiente comida sugerida — avanza a la primera no comida
 const todayActivity = ext.activityLog?.[todayKeyH];
 const nextMeal = d?.meals?.find(meal => todayActivity?.recipes?.[meal.t] !== 'done') ?? d?.meals?.[0];
 const nextMealType = nextMeal?.t;
 const nextMealDone = !!(nextMealType && todayActivity?.recipes?.[nextMealType] === 'done');

 const consumedKcal = d?.meals?.reduce((sum, meal) => {
   return todayActivity?.recipes?.[meal.t] === 'done' ? sum + (meal.macros?.kcal || 0) : sum;
 }, 0) || 0;
 const kcalTarget = cals?.total || 0;
 const kcalRemaining = Math.max(0, kcalTarget - consumedKcal);
 const kcalPct = kcalTarget ? Math.min(1, consumedKcal / kcalTarget) : 0;

 const heroDayLabel = `${tr('día', 'day', 'jour', 'giorno')} ${pi?.day}/${pi?.cycleLen}`;
 const heroHeadline = isHormonalContra
 ? `${tr('Día', 'Day', 'Jour', 'Giorno')} ${pi?.day}, ${tr('ciclo con anticoncepción hormonal', 'cycle on hormonal contraception', 'cycle sous contraception hormonale', 'ciclo con contraccezione ormonale')}`
 : `${tr('Día', 'Day', 'Jour', 'Giorno')} ${pi?.day}, ${(HERO_COPY[pi?.phase] && (HERO_COPY[pi.phase][lang] || HERO_COPY[pi.phase].es)) || ''}`;

 return (
 <View style={styles.container}>
 <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingTop: 58, paddingBottom: 120 }}>

 {/* ── TOP BAR ── */}
 <View style={styles.topRow}>
 <TouchableOpacity style={[styles.greetingChip, { flex: 1 }]} onPress={() => navigation.navigate('Perfil')} activeOpacity={0.85}>
  {avatarUri
   ? <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
   : <View style={[styles.avatarCircle, { backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }]}>
      <BText style={styles.avatarInitialTxt}>{avatarInitial}</BText>
     </View>}
  <View style={{ flex: 1 }}>
   <BText style={styles.greetingHi}>{greetingTxt}</BText>
   <BText style={styles.greetingName} numberOfLines={1}>{userName || 'Blumm'}</BText>
  </View>
 </TouchableOpacity>
 {editMode && (
  <TouchableOpacity onPress={() => setEditMode(false)} style={styles.doneBadge}>
   <BText style={styles.doneBadgeTxt}>{customizeTxt.done[lang] || 'Hecho'}</BText>
  </TouchableOpacity>
 )}
 </View>

 {/* ── HERO DE FASE ── */}
 <ImageBackground
 source={PHASE_IMAGES[pi?.phase] || PHASE_IMAGES.menstrual}
 style={styles.heroCard}
 imageStyle={[styles.heroCardImg, pi?.phase === 'follicular' && { top: 10 }]}
 >
 <BText style={styles.heroHeadline}>{heroHeadline}</BText>
 <View style={styles.heroTags}>
 <View style={styles.heroTag}><BText style={styles.heroTagTxt}>{heroDayLabel}</BText></View>
 {!isHormonalContra && d?.intensity ? (
 <View style={styles.heroTag}><BText style={styles.heroTagTxt}>{d.intensity}</BText></View>
 ) : null}
 </View>
 </ImageBackground>

 {/* ── KCAL + ENTRENO ── */}
 <View style={styles.row2col}>
 {cals ? (
 <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Nutrición')} activeOpacity={0.85}>
  <View style={styles.miniHeader}>
   <View style={styles.miniHeaderLabel}>
    <Salad size={14} color="#FE6004" />
    <BText style={styles.miniHeaderTxt}>{tr('Kcal. consumidas', 'Kcal. consumed', 'Kcal. consommées', 'Kcal. consumate')}</BText>
   </View>
   <ChevronRight size={14} color="#0A0A0A" />
  </View>
  <View>
   <BText style={[styles.miniBigNum, { color: '#FE6004', fontSize: 48, lineHeight: 52 }]}>{consumedKcal}</BText>
   <BText style={styles.miniSub}>{kcalRemaining} {tr('restantes', 'remaining', 'restants', 'rimanenti')}</BText>
  </View>
  <View style={styles.kcalTrack}>
   <View style={[styles.kcalFill, { width: `${Math.min(100, kcalPct)}%` }]} />
  </View>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
   <BText style={styles.kcalBarLabel}>0</BText>
   <BText style={styles.kcalBarLabel}>{kcalTarget}</BText>
  </View>
 </TouchableOpacity>
 ) : null}
 <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Gimnasio')} activeOpacity={0.85}>
  <View style={styles.miniHeader}>
   <View style={styles.miniHeaderLabel}>
    <SportShoe size={14} color="#429FE7" />
    <BText style={styles.miniHeaderTxt}>{tr('Entreno', 'Workout', 'Entraînement', 'Allenamento')}</BText>
   </View>
   <ChevronRight size={14} color="#0A0A0A" />
  </View>
  {(() => {
   const wName = todaySession?.name ?? (lang === 'en' ? 'Rest' : lang === 'fr' ? 'Repos' : 'Descanso');
   const wFs = wName.length > 14 ? 24 : wName.length > 9 ? 32 : 48;
   return <BText style={[styles.miniBigNum, { fontSize: wFs, color: '#429FE7', lineHeight: wFs * 1.1 }]} numberOfLines={2}>{wName}</BText>;
  })()}
  {todaySession?.dur ? <BText style={styles.miniSub}>{todaySession.dur}</BText> : null}
  {todaySession?.intensity ? (
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <BText style={styles.miniSub}>{tr('Intensidad', 'Intensity', 'Intensité', 'Intensità')}</BText>
    <View style={styles.intensityTag}>
     <BText style={styles.intensityTagTxt}>{todaySession.intensity}</BText>
    </View>
   </View>
  ) : null}
 </TouchableOpacity>
 </View>

 {/* ── SIGUIENTE COMIDA ── */}
 <WidgetWrap {...ww} id="nutrition">
 <View style={styles.mealCard}>
 <View style={styles.mealHeader}>
 <View style={styles.miniHeaderLabel}>
 <Salad size={14} color="#0A0A0A" />
 <BText style={styles.mealHeaderTxt}>{tr('Siguiente comida', 'Next meal', 'Prochain repas', 'Prossimo pasto')}</BText>
 </View>
 <TouchableOpacity onPress={() => !editMode && navigation.navigate('Nutrición')}>
 <ChevronRight size={16} color="#0A0A0A" />
 </TouchableOpacity>
 </View>
 <View style={{ gap: 16 }}>
  <View>
   <BText style={styles.mealSlot}>{getMealLabel(lang, nextMeal?.t)}</BText>
   <BText style={styles.mealTitle}>{nextMeal?.title}</BText>
  </View>
  <View style={{ gap: 2 }}>
   {nextMeal?.items?.slice(0, 3).map((it, i) => (
   <View key={i} style={styles.mealItemRow}>
   <View style={styles.mealDot} />
   <BText style={styles.mealItemTxt}>{it}</BText>
   </View>
   ))}
  </View>
  <View style={styles.mealTags}>
  {d?.focus?.slice(0, 4).map(f => (
  <View key={f} style={styles.mealTag}><BText style={styles.mealTagTxt}>{f}</BText></View>
  ))}
  </View>
  {logRecipeDone && nextMealType ? (
  <TouchableOpacity
  style={[styles.mealBtn, nextMealDone && styles.mealBtnDone]}
  onPress={() => !nextMealDone && logRecipeDone(nextMealType, 'done')}
  activeOpacity={0.85}
  disabled={nextMealDone}
  >
  {nextMealDone && <Check size={18} color="#49CF38" />}
  <BText style={[styles.mealBtnTxt, nextMealDone && styles.mealBtnTxtDone]}>
  {nextMealDone
  ? tr('Ya lo has comido', 'Already eaten', 'Déjà mangé', 'Già mangiato')
  : tr('Ya lo he comido', 'Mark as eaten', 'Marquer comme mangé', 'Segna come mangiato')}
  </BText>
  </TouchableOpacity>
  ) : (
  <TouchableOpacity style={styles.mealBtn} onPress={() => navigation.navigate('Nutrición')} activeOpacity={0.85}>
  <BText style={styles.mealBtnTxt}>{tr('Ver en Nutrición', 'View in Nutrition', 'Voir dans Nutrition', 'Vedi in Nutrizione')}</BText>
  </TouchableOpacity>
  )}
 </View>
 </View>
 </WidgetWrap>

 {/* ── HÁBITO / RACHA ── */}
 {widgets.streak && (() => {
 const streakMsg = {
 m1: { es: 'Vas genial, sigue así', en: "You're doing great, keep going", fr: 'Tu es sur la bonne voie', it: 'Stai andando alla grande' },
 m7: { es: '¡Una semana entera! Tu cuerpo ya lo nota.', en: 'A full week! Your body can already feel it.', fr: 'Une semaine entière ! Ton corps le ressent déjà.', it: 'Una settimana intera! Il tuo corpo lo sente già.' },
 m14: { es: 'Dos semanas. Esto ya es un estilo de vida.', en: 'Two weeks. This is already a lifestyle.', fr: 'Deux semaines. C\'est déjà un mode de vie.', it: 'Due settimane. È già uno stile di vita.' },
 };
 const msg = adhStreak.streak >= 14 ? streakMsg.m14 : adhStreak.streak >= 7 ? streakMsg.m7 : streakMsg.m1;
 return (
 <TouchableOpacity activeOpacity={1} onLongPress={() => setEditMode(true)} delayLongPress={400}>
 <Animated.View style={[styles.habitCard, editMode ? { transform: [{ rotate: wiggleRotate }] } : undefined]}>
 {editMode && <TouchableOpacity style={wwStyles.xBadge} onPress={() => toggle('streak')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}><BText style={wwStyles.xBadgeTxt}></BText></TouchableOpacity>}
 <View style={styles.miniHeader}>
 <View style={styles.miniHeaderLabel}>
 <CalendarDays size={14} color="#A157C9" />
 <BText style={styles.miniHeaderTxt}>{tr('Hábito', 'Habit', 'Habitude', 'Abitudine')}</BText>
 </View>
 <ChevronRight size={14} color="#0A0A0A" />
 </View>
 <View>
  <BText style={styles.habitBigTxt}>
  {adhStreak.streak} {adhStreak.streak === 1 ? c.day : c.days} {tr('seguidos', 'in a row', 'de suite', 'di fila')}
  </BText>
  <BText style={styles.habitSub}>{msg[lang] || msg.es}</BText>
 </View>
 <View style={styles.habitDotsRow}>
 {habitDots.map((dot, i) => (
 <View key={i} style={[styles.habitDot, dot.isFuture ? styles.habitDotFuture : dot.isToday ? styles.habitDotToday : dot.done ? styles.habitDotOn : styles.habitDotOff]} />
 ))}
 </View>
 </Animated.View>
 </TouchableOpacity>
 );
 })()}

 {/* ── HIDRATACIÓN + CICLO ── */}
 <WidgetWrap {...ww} id="hydration">
 <View style={styles.row2col}>
 <WaterCard lang={lang} />
 <View style={styles.miniCard}>
 <View style={styles.miniHeader}>
 <View style={styles.miniHeaderLabel}>
 <Flame size={14} color="#49CF38" />
 <BText style={styles.miniHeaderTxt}>{h.yourCycle || tr('Ciclo', 'Cycle', 'Cycle', 'Ciclo')}</BText>
 </View>
 <ChevronRight size={14} color="#0A0A0A" />
 </View>
 <View style={{ flex: 1, justifyContent: 'space-between' }}>
 <BText style={[styles.miniBigNum, { fontSize: 32, lineHeight: 35, color: '#49CF38' }]}>
 {hasCycleLogToday ? tr('Registrado', 'Logged', 'Enregistré', 'Registrato') : tr('Sin registro', 'Not logged', 'Non enregistré', 'Non registrato')}
 </BText>
 <TouchableOpacity style={styles.smallBtn} onPress={() => setTrackingOpen(true)} activeOpacity={0.85}>
 <BText style={styles.smallBtnTxt}>{tr('Registrar', 'Log it', 'Enregistrer', 'Registra')}</BText>
 </TouchableOpacity>
 </View>
 </View>
 </View>
 </WidgetWrap>

 {/* ── CONSEJO DE LA FASE ── */}
 <WidgetWrap {...ww} id="tip">
 <ImageBackground
 source={PHASE_IMAGES[pi?.phase] || PHASE_IMAGES.menstrual}
 style={styles.tipCard}
 imageStyle={[styles.heroCardImg, { opacity: 0.55 }]}
 >
 <View style={styles.tipOverlay} />
 <View style={styles.miniHeader}>
 <View style={styles.miniHeaderLabel}>
 <Info size={14} color="white" />
 <BText style={[styles.miniHeaderTxt, { color: 'white' }]}>{h.phaseTip}</BText>
 </View>
 <ChevronRight size={14} color="white" />
 </View>
 <BText style={styles.tipTitle}>{d?.tip}</BText>
 </ImageBackground>
 </WidgetWrap>
 </ScrollView>

 <CycleTrackingModal
 visible={trackingOpen}
 onClose={() => setTrackingOpen(false)}
 lang={lang}
 cycleLog={ext.cycleLog || {}}
 onSave={(date, data) => logCycleDay?.(date, data)}
 currentPhase={pi?.phase || null}
 />

 {/* ── MODAL PERSONALIZAR ── */}
 <Modal visible={showCustomize} animationType="slide" transparent onRequestClose={() => setShowCustomize(false)}>
 <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCustomize(false)} />
 <View style={styles.modalSheet}>
 <View style={styles.modalHandle} />
 <View style={styles.modalHeader}>
 <BText style={styles.modalTitle}>{customizeTxt.title[lang] || customizeTxt.title.es}</BText>
 <TouchableOpacity onPress={() => setShowCustomize(false)} style={styles.modalDoneBtn}>
 <BText style={styles.modalDoneTxt}>{customizeTxt.done[lang] || customizeTxt.done.es}</BText>
 </TouchableOpacity>
 </View>
 <BText style={styles.modalDesc}>{customizeTxt.desc[lang] || customizeTxt.desc.es}</BText>
 <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
 {WIDGET_DEFS.map((wd, i) => (
 <View key={wd.id} style={[styles.widgetRow, i < WIDGET_DEFS.length - 1 && styles.widgetRowBorder]}>
 <BText style={styles.widgetEmoji}>{wd.emoji}</BText>
 <BText style={styles.widgetLabel}>{wd.label[lang] || wd.label.es}</BText>
 <Switch
 value={widgets[wd.id]}
 onValueChange={() => toggle(wd.id)}
 trackColor={{ false: '#E2E8F0', true: '#171717' }}
 thumbColor="white"
 />
 </View>
 ))}
 </ScrollView>
 </View>
 </Modal>
 </View>
 );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: 'white' },
 scroll: { flex: 1 },

 // Empty state
 emptyCardWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
 emptyCard: { borderRadius: 24, padding: 16, gap: 32, overflow: 'hidden', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.20)' },
 emptyIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#49CF38', alignItems: 'center', justifyContent: 'center' },
 emptyTitle: { fontSize: 24, fontFamily: F.headingX, color: 'white', textAlign: 'center', lineHeight: 29 },
 emptySubtitle: { fontSize: 16, fontFamily: F.body, color: 'white', textAlign: 'center', lineHeight: 21 },
 emptyBtn: { alignSelf: 'stretch', height: 48, backgroundColor: '#171717', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
 emptyBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },

 // Top bar
 topBar: { paddingHorizontal: 16, paddingTop: 58 },
 topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
 greetingChip: {
  flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
  backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, padding: 8,
 },
 avatarCircle: { width: 40, height: 40, borderRadius: 16 },
 avatarInitialTxt: { color: 'white', fontFamily: F.headingX, fontSize: 16 },
 greetingHi: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body, letterSpacing: -0.28, lineHeight: 20 },
 greetingName: { fontSize: 18, color: '#0A0A0A', fontFamily: F.heading, lineHeight: 24 },
 customizeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
 doneBadge: { backgroundColor: '#171717', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, marginLeft: 10 },
 doneBadgeTxt: { color: 'white', fontSize: 13, fontFamily: F.bodyB },

 // Hero
 heroCard: { height: 200, borderRadius: 24, padding: 16, justifyContent: 'space-between', marginTop: 12, marginBottom: 2, overflow: 'hidden' },
 heroCardImg: { borderRadius: 24 },
 heroHeadline: { fontSize: 28, color: '#0A0A0A', lineHeight: 32.2, fontFamily: F.heading },
 heroTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 heroTag: { backgroundColor: '#F5F5F5', height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center' },
 heroTagTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },

 // 2-col mini cards
 row2col: { flexDirection: 'row', gap: 2, marginTop: 2, marginBottom: 2 },
 miniCard: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24 },
 miniHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 miniHeaderLabel: { flexDirection: 'row', alignItems: 'center', gap: 2 },
 miniHeaderTxt: { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
 miniBigNum: { fontSize: 32, lineHeight: 36, fontFamily: F.headingX },
 miniSub: { fontSize: 14, color: '#0A0A0A', marginTop: 2, fontFamily: F.body },
 smallBtn: { backgroundColor: '#0A0A0A', height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
 smallBtnTxt: { color: 'white', fontFamily: F.bodyB, fontSize: 14 },

 // Meal card
 mealCard: { backgroundColor: '#FE6004', borderRadius: 24, padding: 16, marginTop: 2, marginBottom: 2, gap: 24 },
 mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 mealHeaderTxt: { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
 mealSlot: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 mealTitle: { fontSize: 32, color: '#260E01', lineHeight: 35, fontFamily: F.headingX },
 mealItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 mealDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#260E01' },
 mealItemTxt: { fontSize: 14, color: '#0A0A0A', flex: 1, fontFamily: F.body },
 mealTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 mealTag: { backgroundColor: '#FFBF9B', height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center' },
 mealTagTxt: { fontSize: 10, fontFamily: F.body, color: '#260E01', textTransform: 'uppercase', letterSpacing: 0.3 },
 mealBtn: { backgroundColor: '#0A0A0A', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
 mealBtnTxt: { color: '#FAFAFA', fontFamily: F.body, fontSize: 18 },
 mealBtnDone: { backgroundColor: '#0A0A0A22' },
 mealBtnTxtDone: { color: '#49CF38' },

 // Habit / streak
 habitCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginTop: 2, marginBottom: 2, gap: 24 },
 habitBigTxt: { fontSize: 32, color: '#A157C9', fontFamily: F.heading, lineHeight: 35.2 },
 habitSub: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body, lineHeight: 19.6 },
 habitDotsRow: { flexDirection: 'row', justifyContent: 'space-between' },
 habitDot: { width: 26, height: 26, borderRadius: 13 },
 habitDotOn: { backgroundColor: '#A157C9' },
 habitDotOff: { backgroundColor: '#E5E5E5' },
 habitDotToday: { backgroundColor: '#ECDDF4', borderWidth: 1, borderColor: '#A157C9' },
 habitDotFuture: { borderWidth: 1, borderColor: '#E5E5E5' },

 // Tip
 tipCard: { borderRadius: 24, padding: 16, marginTop: 2, marginBottom: 2, overflow: 'hidden', gap: 48 },
 tipOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.35)', borderRadius: 24 },
 tipTitle: { fontSize: 32, color: 'white', lineHeight: 35, fontFamily: F.headingX },

 // Kcal labels
 kcalBarLabel: { fontSize: 12, color: '#FE6004', fontFamily: F.body, textTransform: 'uppercase', lineHeight: 15.6 },
 kcalTrack: { height: 6, borderRadius: 3, backgroundColor: '#E5E5E5', flexDirection: 'row', overflow: 'hidden' },
 kcalFill: { backgroundColor: '#FE6004', borderRadius: 3 },

 // Entreno intensity tag
 intensityTag: { backgroundColor: '#429FE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
 intensityTagTxt: { color: 'white', fontSize: 10, fontFamily: F.bodyB },

 // Modal personalizar
 modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
 modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '75%' },
 modalHandle: { width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
 modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
 modalTitle: { fontSize: 17, color: '#0A0A0A', fontFamily: F.heading },
 modalDoneBtn: { backgroundColor: '#171717', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
 modalDoneTxt: { color: 'white', fontSize: 13, fontFamily: F.bodyB },
 modalDesc: { fontSize: 13, color: '#64748B', marginBottom: 16, fontFamily: F.body },
 widgetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
 widgetRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 widgetEmoji: { fontSize: 20, width: 28, fontFamily: F.body },
 widgetLabel: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500', fontFamily: F.body },
});
