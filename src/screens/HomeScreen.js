import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { F } from '../theme/fonts';
import { useNavigation } from '@react-navigation/native';
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
import { useFoodLog } from '../hooks/useFoodLog';

const BLUE = { primary: '#429FE7', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

const PHASE_IMAGES = {
 menstrual:  require('../../assets/HeroHomescreen/Menstrual.png'),
 follicular: require('../../assets/HeroHomescreen/Folicular.png'),
 ovulation:  require('../../assets/HeroHomescreen/Ovulacion.png'),
 luteal:     require('../../assets/HeroHomescreen/Lutea.png'),
};

const HERO_COPY = {
 menstrual: { es: 'estás entrando en la fase menstrual', en: 'you\'re entering your menstrual phase', fr: 'tu entres dans ta phase menstruelle', it: 'stai entrando nella fase mestruale' },
 follicular: { es: 'estás en plena fase folicular', en: 'you\'re in full follicular phase', fr: 'tu es en pleine phase folliculaire', it: 'sei in piena fase follicolare' },
 ovulation: { es: 'estás en la fase de ovulación', en: 'you\'re in your ovulation phase', fr: 'tu es dans ta phase d\'ovulation', it: 'sei nella fase di ovulazione' },
};

// Mensaje lútea dinámico según posición dentro de la fase (daysLeft)
const LUTEAL_COPY = {
 start: { es: 'estás empezando tu fase lútea', en: 'you\'re starting your luteal phase', fr: 'tu commences ta phase lutéale', it: 'stai iniziando la tua fase luteale' },
 mid:   { es: 'estás en plena fase lútea', en: 'you\'re in full luteal phase', fr: 'tu es en pleine phase lutéale', it: 'sei in piena fase luteale' },
 end:   { es: 'estás acabando tu fase lútea', en: 'you\'re finishing your luteal phase', fr: 'tu termines ta phase lutéale', it: 'stai finendo la tua fase luteale' },
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
 xBadge: { position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderWidth: 2, borderColor: 'white' },
 xBadgeTxt: { fontSize: 10, color: 'white', fontFamily: F.bodyB, lineHeight: 12 },
});
const FAST_KEY = 'blumm_fast_start';
const RING_R = 58;
const RING_CIRC = 2 * Math.PI * RING_R;

function FastingRingCard({ lang, fastingProtocol }) {
  const [fastStart, setFastStart] = useState(null);
  const [now, setNow] = useState(Date.now());
  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

  // Parse goal hours from protocol like "16-8" → 16
  const goalHours = (() => {
    const n = parseInt((fastingProtocol || '16-8').split('-')[0], 10);
    return isNaN(n) ? 16 : n;
  })();

  useEffect(() => {
    AsyncStorage.getItem(FAST_KEY).then(v => { if (v) setFastStart(parseInt(v, 10)); });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = fastStart ? now - fastStart : 0;
  const elapsedH = elapsedMs / 3600000;
  const progress = Math.min(elapsedH / goalHours, 1);
  const dashOffset = RING_CIRC * (1 - progress);

  const fmtHHMM = ms => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const endTime = fastStart ? new Date(fastStart + goalHours * 3600000) : null;
  const endStr = endTime ? `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}` : '--:--';
  const remainMs = fastStart ? Math.max(0, fastStart + goalHours * 3600000 - now) : 0;
  const remainH = Math.floor(remainMs / 3600000);
  const remainM = Math.floor((remainMs % 3600000) / 60000);

  const isActive = !!fastStart && elapsedH < goalHours;
  const isDone = !!fastStart && elapsedH >= goalHours;

  const handleToggle = async () => {
    if (fastStart) {
      await AsyncStorage.removeItem(FAST_KEY);
      setFastStart(null);
    } else {
      const t = Date.now();
      await AsyncStorage.setItem(FAST_KEY, String(t));
      setFastStart(t);
    }
  };

  const statusColor = isDone ? '#49CF38' : isActive ? '#429FE7' : '#B0B8C1';
  const statusLabel = isDone
    ? tr('¡Completado!', 'Complete!', 'Complété !', 'Completato!')
    : isActive
    ? tr('activo', 'active', 'actif', 'attivo')
    : tr('inactivo', 'inactive', 'inactif', 'inattivo');

  return (
    <View style={fastStyles.card}>
      {/* Header */}
      <View style={fastStyles.header}>
        <View style={fastStyles.headerLeft}>
          <BText style={fastStyles.headerLabel}>
            {tr('Ayuno', 'Fasting', 'Jeûne', 'Digiuno')}
            {' · '}{fastingProtocol || '16:8'}
          </BText>
          <View style={[fastStyles.dot, { backgroundColor: statusColor }]} />
          <BText style={[fastStyles.statusTxt, { color: statusColor }]}>{statusLabel}</BText>
        </View>
      </View>

      {/* Ring */}
      <View style={fastStyles.ringWrap}>
        <Svg width={144} height={144} viewBox="0 0 144 144">
          {/* Track */}
          <Circle cx={72} cy={72} r={RING_R} stroke="#E8EEF4" strokeWidth={10} fill="none" />
          {/* Progress */}
          <Circle
            cx={72} cy={72} r={RING_R}
            stroke={statusColor}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRC}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 72 72)"
          />
        </Svg>
        <View style={fastStyles.ringCenter}>
          <BText style={fastStyles.timerDigits}>{fastStart ? fmtHHMM(elapsedMs) : `${String(goalHours).padStart(2,'0')}:00:00`}</BText>
          <BText style={fastStyles.timerLabel}>
            {tr('de', 'of', 'sur', 'di')} {goalHours}h
          </BText>
        </View>
      </View>

      {/* Sub-info */}
      {isActive && (
        <BText style={fastStyles.subInfo}>
          {tr('Fin a las', 'Ends at', 'Fin à', 'Fine alle')} {endStr}
          {remainH > 0 || remainM > 0
            ? `  ·  ${remainH > 0 ? `${remainH}h ` : ''}${remainM}min ${tr('restantes', 'left', 'restantes', 'rimanenti')}`
            : ''}
        </BText>
      )}
      {isDone && (
        <BText style={[fastStyles.subInfo, { color: '#49CF38' }]}>
          {tr('Ayuno completado 🎉', 'Fasting complete 🎉', 'Jeûne complété 🎉', 'Digiuno completato 🎉')}
        </BText>
      )}
      {!fastStart && (
        <BText style={fastStyles.subInfo}>
          {tr('Pulsa para iniciar tu ayuno', 'Tap to start your fast', 'Appuie pour commencer', 'Tocca per iniziare')}
        </BText>
      )}

      {/* Button */}
      <TouchableOpacity
        style={[fastStyles.btn, isActive && fastStyles.btnStop]}
        onPress={handleToggle}
        activeOpacity={0.85}
      >
        <BText style={fastStyles.btnTxt}>
          {isActive
            ? tr('Terminar ayuno', 'End fast', 'Terminer le jeûne', 'Termina digiuno')
            : isDone
            ? tr('Nuevo ayuno', 'New fast', 'Nouveau jeûne', 'Nuovo digiuno')
            : tr('Iniciar ayuno', 'Start fast', 'Commencer le jeûne', 'Inizia digiuno')}
        </BText>
      </TouchableOpacity>
    </View>
  );
}

const fastStyles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 20, backgroundColor: '#0A0A0A', padding: 20, alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLabel: { fontSize: 13, color: '#9CA8B4', fontFamily: F.body, letterSpacing: 0.2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 12, fontFamily: F.bodyB },
  ringWrap: { width: 144, height: 144, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  timerDigits: { fontSize: 26, color: 'white', fontFamily: F.bodyB, letterSpacing: 1, fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 12, color: '#9CA8B4', fontFamily: F.body, marginTop: 2 },
  subInfo: { fontSize: 12, color: '#9CA8B4', fontFamily: F.body, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  btn: { width: '100%', backgroundColor: '#429FE7', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  btnStop: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#429FE7' },
  btnTxt: { fontSize: 14, color: 'white', fontFamily: F.bodyB },
});

const HORMONAL_CONTRA = ['pill', 'hormonal_iud', 'ring', 'patch', 'implant'];

export default function HomeScreen({ pi, profile, lang = 'es', healthData, logCycleDay, logRecipeDone, todayMenu, widgets, toggleWidget, cycleDailyLogs = {} }) {
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
 const { logRecipe: logFoodRecipe } = useFoodLog(todayKeyH);
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

 const toggle = toggleWidget;
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

 const doneTxt = { es: 'Hecho', en: 'Done', fr: 'Terminé', it: 'Fatto' };

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
 const hasCycleLogToday = !!(cycleDailyLogs[todayCycleKey]);

 // Estado de "comido" de la siguiente comida sugerida — usa el mismo menú que NutriScreen
 const todayActivity = ext.activityLog?.[todayKeyH];
 const menuMeals = todayMenu?.meals || [];
 const nextMeal = menuMeals.find(meal => meal.title && todayActivity?.recipes?.[meal.id] !== 'done') ?? menuMeals.find(m => m.title) ?? null;
 const nextMealType = nextMeal?.id;
 const nextMealDone = !!(nextMealType && todayActivity?.recipes?.[nextMealType] === 'done');

 const seenSlots = new Set();
 const consumedKcal = d?.meals?.reduce((sum, meal) => {
   if (seenSlots.has(meal.id)) return sum;
   seenSlots.add(meal.id);
   return todayActivity?.recipes?.[meal.id] === 'done' ? sum + (meal.macros?.kcal || 0) : sum;
 }, 0) || 0;
 const kcalTarget = cals?.total || 0;
 const kcalRemaining = Math.max(0, kcalTarget - consumedKcal);
 const kcalPct = kcalTarget ? Math.min(1, consumedKcal / kcalTarget) : 0;

 const heroDayLabel = `${tr('día', 'day', 'jour', 'giorno')} ${pi?.day}/${pi?.cycleLen}`;
 // Mensaje lútea dinámico: daysLeft >= 9 → empezando | 4–8 → en plena | < 4 → acabando
 const lutealKey = (pi?.daysLeft ?? 0) >= 9 ? 'start' : (pi?.daysLeft ?? 0) >= 4 ? 'mid' : 'end';
 const phaseCopyObj = pi?.phase === 'luteal' ? LUTEAL_COPY[lutealKey] : HERO_COPY[pi?.phase];
 const heroHeadline = isHormonalContra
 ? `${tr('Día', 'Day', 'Jour', 'Giorno')} ${pi?.day}, ${tr('ciclo con anticoncepción hormonal', 'cycle on hormonal contraception', 'cycle sous contraception hormonale', 'ciclo con contraccezione ormonale')}`
 : `${tr('Día', 'Day', 'Jour', 'Giorno')} ${pi?.day}, ${(phaseCopyObj && (phaseCopyObj[lang] || phaseCopyObj.es)) || ''}`;

 return (
 <View style={styles.container}>
 <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingTop: 58, paddingBottom: 120 }}>

 {/* ── TOP BAR ── */}
 <View style={styles.topRow}>
 <TouchableOpacity style={[styles.greetingChipWrap, { flex: 1 }]} onPress={() => navigation.navigate('Perfil')} activeOpacity={0.85}>
  <BlurView intensity={25} tint="light" style={styles.greetingChip}>
   {avatarUri
    ? <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
    : <View style={[styles.avatarCircle, { backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }]}>
       <BText style={styles.avatarInitialTxt}>{avatarInitial}</BText>
      </View>}
   <View style={{ flex: 1 }}>
    <BText style={styles.greetingHi}>{greetingTxt}</BText>
    <BText style={styles.greetingName} numberOfLines={1}>{userName || 'Blumm'}</BText>
   </View>
  </BlurView>
 </TouchableOpacity>
 {editMode && (
  <TouchableOpacity onPress={() => setEditMode(false)} style={styles.doneBadge}>
   <BText style={styles.doneBadgeTxt}>{doneTxt[lang] || 'Hecho'}</BText>
  </TouchableOpacity>
 )}
 </View>

 {/* ── HERO DE FASE ── */}
 <TouchableOpacity onPress={() => navigation.navigate('Ciclo')} activeOpacity={0.92}>
  <ImageBackground
   source={PHASE_IMAGES[pi?.phase] || PHASE_IMAGES.menstrual}
   style={styles.heroCard}
   imageStyle={styles.heroCardImg}
  >
   <BText style={styles.heroHeadline}>{heroHeadline}</BText>
   <View style={styles.heroTags}>
    <View style={styles.heroTag}><BText style={styles.heroTagTxt}>{heroDayLabel}</BText></View>
    {!isHormonalContra && d?.intensity ? (
     <View style={styles.heroTag}><BText style={styles.heroTagTxt}>{d.intensity}</BText></View>
    ) : null}
   </View>
  </ImageBackground>
 </TouchableOpacity>

 {/* ── KCAL + ENTRENO ── */}
 <View style={styles.row2col}>
 {cals ? (
 <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Nutrición')} activeOpacity={0.85}>
  <View style={styles.miniHeader}>
   <View style={styles.miniHeaderLabel}>
    <Salad size={16} color="#FE6004" />
    <BText style={styles.miniHeaderTxt}>{tr('Kcal.consumidas', 'Kcal.consumed', 'Kcal.consommées', 'Kcal.consumate')}</BText>
   </View>
   <ChevronRight size={16} color="#0A0A0A" />
  </View>
  <View style={{ gap: 16 }}>
   <View>
    <BText style={[styles.miniBigNum, { color: '#FE6004', fontSize: 48, lineHeight: 52.8 }]}>{consumedKcal}</BText>
    <BText style={styles.miniSub}>{kcalRemaining} {tr('restantes', 'remaining', 'restants', 'rimanenti')}</BText>
   </View>
   <View style={{ paddingBottom: 4, gap: 4 }}>
    <View style={styles.kcalTrack}>
     <View style={[styles.kcalFill, { width: `${Math.min(100, kcalPct * 100)}%` }]} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
     <BText style={styles.kcalBarLabel}>0</BText>
     <BText style={styles.kcalBarLabel}>{consumedKcal}</BText>
    </View>
   </View>
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
  {todaySession ? (() => {
   const wName = todaySession.name;
   const wFs = wName.length > 14 ? 24 : wName.length > 6 ? 32 : 48;
   return <BText style={[styles.miniBigNum, { fontSize: wFs, color: '#429FE7', lineHeight: wFs * 1.1 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{wName}</BText>;
  })() : (
   <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}>
    <BText style={[styles.miniBigNum, { fontSize: 32, color: '#429FE7', lineHeight: 38, textAlign: 'center' }]}>
     {lang === 'en' ? 'Rest' : lang === 'fr' ? 'Repos' : lang === 'it' ? 'Riposo' : 'Descanso'}
    </BText>
   </View>
  )}
  {todaySession?.dur ? <BText style={styles.miniSub}>{todaySession.dur}</BText> : null}
  {todaySession?.intensity ? (
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <BText style={styles.miniSub}>{tr('Intensidad', 'Intensity', 'Intensité', 'Intensità')}</BText>
    <View style={styles.intensityTag}>
     <BText style={styles.intensityTagTxt}>{todaySession.intensity}</BText>
    </View>
   </View>
  ) : null}
  {todaySession?.isProgram && todaySession?.tips?.[0] ? (
   <View style={styles.programNoteBubble}>
    <BText style={styles.programNoteTxt} numberOfLines={3}>{todaySession.tips[0]}</BText>
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
  <TouchableOpacity
   activeOpacity={0.75}
   disabled={!nextMeal?.recipe}
   onPress={() => {
    if (!nextMeal?.recipe) return;
    navigation.navigate('Nutrición', {
     openRecipe: {
      ...nextMeal.recipe,
      mealLabel: getMealLabel(lang, nextMeal.t),
      title: nextMeal.title,
      emoji: nextMeal.ico,
      macros: nextMeal.macros,
      _recipeId: nextMeal._recipeId,
     },
    });
   }}
  >
   <BText style={styles.mealSlot}>{getMealLabel(lang, nextMeal?.t)}</BText>
   <BText style={styles.mealTitle}>{nextMeal?.title}</BText>
  </TouchableOpacity>
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
  onPress={() => { if (!nextMealDone) { logRecipeDone(nextMealType, 'done'); logFoodRecipe(nextMeal); } }}
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

 {/* ── AYUNO ── */}
 <WidgetWrap {...ww} id="fasting">
  <FastingRingCard
   lang={lang}
   fastingProtocol={profile?.profileExtended?.editFasting || '16-8'}
  />
 </WidgetWrap>

 {/* ── CONSEJO DE LA FASE ── */}
 <WidgetWrap {...ww} id="tip">
 {(() => {
  const tipFull = d?.tip || '';
  const dotIdx = tipFull.search(/[.!?]/);
  const tipHead = dotIdx !== -1 ? tipFull.slice(0, dotIdx + 1) : tipFull;
  const tipRest = dotIdx !== -1 ? tipFull.slice(dotIdx + 1).trim() : '';
  const tipFontSize = tipHead.length > 50 ? 22 : tipHead.length > 30 ? 26 : 32;
  const tipLineHeight = tipFontSize * 1.15;
  return (
   <TouchableOpacity
    activeOpacity={0.92}
    onPress={() => navigation.navigate('Ciclo', { openPhase: pi?.phase })}
   >
    <ImageBackground
     source={PHASE_IMAGES[pi?.phase] || PHASE_IMAGES.menstrual}
     style={styles.tipCard}
     imageStyle={styles.heroCardImg}
    >
     <View style={styles.miniHeader}>
      <View style={styles.miniHeaderLabel}>
       <Info size={14} color="white" />
       <BText style={styles.tipHeaderTxt}>{h.phaseTip}</BText>
      </View>
      <ChevronRight size={14} color="white" />
     </View>
     <View style={styles.tipBody}>
      <BText style={[styles.tipTitle, { fontSize: tipFontSize, lineHeight: tipLineHeight }]}>{tipHead}</BText>
      {!!tipRest && <BText style={styles.tipSub}>{tipRest}</BText>}
     </View>
    </ImageBackground>
   </TouchableOpacity>
  );
 })()}
 </WidgetWrap>
 </ScrollView>

 <CycleTrackingModal
 visible={trackingOpen}
 onClose={() => setTrackingOpen(false)}
 lang={lang}
 cycleLog={cycleDailyLogs}
 onSave={(date, data) => logCycleDay?.(date, data)}
 currentPhase={pi?.phase || null}
 />

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
 greetingChipWrap: { borderRadius: 24, overflow: 'hidden', flex: 1 },
 greetingChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
 avatarCircle: { width: 40, height: 40, borderRadius: 16 },
 avatarInitialTxt: { color: 'white', fontFamily: F.headingX, fontSize: 16 },
 greetingHi: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body, letterSpacing: -0.28, lineHeight: 20 },
 greetingName: { fontSize: 18, color: '#0A0A0A', fontFamily: F.heading, lineHeight: 24 },
 customizeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
 doneBadge: { backgroundColor: '#171717', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, marginLeft: 10 },
 doneBadgeTxt: { color: 'white', fontSize: 13, fontFamily: F.bodyB },

 // Hero
 heroCard: { height: 200, borderRadius: 24, padding: 16, justifyContent: 'space-between', marginTop: 0, marginBottom: 2, overflow: 'hidden' },
 heroCardImg: { borderRadius: 24 },
 heroHeadline: { fontSize: 28, color: '#0A0A0A', lineHeight: 32.2, fontFamily: F.heading },
 heroTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 heroTag: { backgroundColor: 'rgba(255,255,255,0.85)', height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center' },
 heroTagTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },

 // 2-col mini cards
 row2col: { flexDirection: 'row', gap: 2, marginTop: 2, marginBottom: 2 },
 miniCard: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24 },
 miniHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 miniHeaderLabel: { flexDirection: 'row', alignItems: 'center', gap: 2 },
 miniHeaderTxt: { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
 miniBigNum: { fontSize: 32, lineHeight: 36, fontFamily: F.headingX },
 miniSub: { fontSize: 14, color: '#0A0A0A', lineHeight: 19.6, fontFamily: F.body },
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
 tipHeaderTxt: { fontSize: 12, color: 'white', fontFamily: F.body, lineHeight: 15.6 },
 tipBody: { gap: 16 },
 tipTitle: { fontSize: 32, color: 'white', lineHeight: 35.2, fontFamily: F.headingX },
 tipSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: F.body, lineHeight: 20 },
 tipSubtitle: { fontSize: 14, color: 'white', fontFamily: F.body, lineHeight: 19.6 },

 // Kcal labels
 kcalBarLabel: { fontSize: 12, color: '#FE6004', fontFamily: F.body, textTransform: 'uppercase', lineHeight: 15.6 },
 kcalTrack: { height: 6, borderRadius: 3, backgroundColor: '#E5E5E5', flexDirection: 'row', overflow: 'hidden' },
 kcalFill: { backgroundColor: '#FE6004', borderRadius: 3, height: 6 },

 // Entreno intensity tag
 intensityTag: { backgroundColor: '#429FE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
 intensityTagTxt: { color: 'white', fontSize: 10, fontFamily: F.bodyB },
 // Burbuja de nota de fase del programa
 programNoteBubble: { backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, borderLeftWidth: 3, borderLeftColor: '#429FE7' },
 programNoteTxt: { fontSize: 11, color: '#1E40AF', lineHeight: 15.4, fontFamily: F.body },

});
