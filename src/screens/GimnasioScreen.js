import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, ImageBackground, Modal, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { F } from '../theme/fonts';
import { Check, X, ChevronRight, ChevronLeft, SportShoe, Pencil, RefreshCcw, Plus, Heart, BookOpen, BedDouble } from 'lucide-react-native';
import { TouchableOpacity as GHTouchable } from 'react-native-gesture-handler';
import T, { getDayLabels } from '../i18n/translations';
import { GymSetupCard, SPORTS_LIST } from '../components/TabSetupCard';
import ProgramsCard from '../components/ProgramsCard';
import { getActiveProgramState, getProgramDays, programSessionToCard, getSession, sessionMinutes, LEVEL_LABEL } from '../data/trainingPrograms';
import { DAY_SHORT, DAY_LABELS, jsToIdx } from '../data/phases';
import {
 getSessionType,
 SESSION_RUNNING as SESSION_RUNNING_STATIC,
 SESSION_RENFO as SESSION_RENFO_STATIC,
 WEEK_SCHEDULE,
 resolveSession,
} from '../data/marinaProgram';
import { buildWeekPlan, PHASE_CONFIG } from '../utils/programEngine';
import SleepCard from '../components/SleepCard';
import WeightCard from '../components/WeightCard';
import { useWorkouts } from '../hooks/useWorkouts';
import { buildPersonalizedWeekPlan } from '../utils/workoutEngine';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import SwipeableTabs from '../components/SwipeableTabs';
import WorkoutHistoryTab from '../components/WorkoutHistoryTab';
import { trackScreen, trackEvent, Events } from '../lib/analytics';
import BText from '../components/BText';
import PhaseGlow from '../../assets/Calendar icons/PhaseGlow';

const GYM_ARTICLE_IDS = ['cycle-training', 'pcos-hormones'];
const gymArticles = ARTICLES.filter(a => GYM_ARTICLE_IDS.includes(a.id));

const PHASE_IMAGES = {
 menstrual:  require('../../assets/phases/menstrual.png'),
 follicular: require('../../assets/phases/follicular.png'),
 ovulation:  require('../../assets/phases/ovulation.png'),
 luteal:     require('../../assets/phases/luteal.png'),
};

const BLUE = { primary: '#429FE7', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
const GREEN = { bg: '#F0FDF4', border: '#86EFAC', text: '#16A34A' };
const RED = { bg: '#FEF2F2', text: '#DC2626' };

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(isoString, lang = 'es') {
 if (!isoString) return '';
 const d = new Date(isoString);
 return d.toLocaleDateString(
 lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-GB' : 'es-ES',
 { day: 'numeric', month: 'short' },
 );
}
function fmtTime(isoString) {
 if (!isoString) return '';
 return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtNum(n) {
 if (n == null) return '—';
 return n.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Drum-roll picker estilo iOS Timer ───────────────────────────────────────
const DRUM_ITEM_H = 50;
const DRUM_VISIBLE = 5; // items visibles; el central es el seleccionado

function DrumColumn({ values, selectedIndex, onSelect, label }) {
 const ref = useRef(null);
 const isTouching = useRef(false);

 useEffect(() => {
  // Scroll inicial al valor seleccionado sin animación
  ref.current?.scrollTo({ y: selectedIndex * DRUM_ITEM_H, animated: false });
 }, []);

 const commitScroll = (y) => {
  const idx = Math.max(0, Math.min(values.length - 1, Math.round(y / DRUM_ITEM_H)));
  onSelect(idx);
 };

 return (
  <View style={drum.colWrap}>
   {/* líneas de selección */}
   <View style={drum.selectionTop} pointerEvents="none" />
   <View style={drum.selectionBottom} pointerEvents="none" />
   {/* fade superior */}
   <View style={drum.fadeTop} pointerEvents="none" />
   {/* fade inferior */}
   <View style={drum.fadeBottom} pointerEvents="none" />

   <ScrollView
    ref={ref}
    showsVerticalScrollIndicator={false}
    snapToInterval={DRUM_ITEM_H}
    decelerationRate="fast"
    contentContainerStyle={{ paddingVertical: DRUM_ITEM_H * Math.floor(DRUM_VISIBLE / 2) }}
    onScrollBeginDrag={() => { isTouching.current = true; }}
    onMomentumScrollEnd={e => { commitScroll(e.nativeEvent.contentOffset.y); isTouching.current = false; }}
    onScrollEndDrag={e => {
     if (!isTouching.current) return;
     isTouching.current = false;
     // por si no hay momentum (dedo suelto lento)
     setTimeout(() => commitScroll(e.nativeEvent.contentOffset.y), 50);
    }}
   >
    {values.map((val, i) => (
     <View key={i} style={drum.item}>
      <BText style={drum.itemTxt}>{String(val).padStart(2, '0')}</BText>
     </View>
    ))}
   </ScrollView>

   {/* etiqueta unidad */}
   {label ? <BText style={drum.unitLabel}>{label}</BText> : null}
  </View>
 );
}

const drum = StyleSheet.create({
 colWrap: {
  width: 90, height: DRUM_ITEM_H * DRUM_VISIBLE, overflow: 'hidden', position: 'relative',
 },
 item: { height: DRUM_ITEM_H, alignItems: 'center', justifyContent: 'center' },
 itemTxt: { fontSize: 38, fontFamily: F.body, color: '#0A0A0A', lineHeight: 46 },
 selectionTop: {
  position: 'absolute', top: DRUM_ITEM_H * Math.floor(DRUM_VISIBLE / 2),
  left: 6, right: 6, height: 1, backgroundColor: '#D1D5DB', zIndex: 2,
 },
 selectionBottom: {
  position: 'absolute', top: DRUM_ITEM_H * (Math.floor(DRUM_VISIBLE / 2) + 1) - 1,
  left: 6, right: 6, height: 1, backgroundColor: '#D1D5DB', zIndex: 2,
 },
 fadeTop: {
  position: 'absolute', top: 0, left: 0, right: 0,
  height: DRUM_ITEM_H * Math.floor(DRUM_VISIBLE / 2),
  backgroundColor: 'rgba(255,255,255,0.55)', zIndex: 1,
 },
 fadeBottom: {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  height: DRUM_ITEM_H * Math.floor(DRUM_VISIBLE / 2),
  backgroundColor: 'rgba(255,255,255,0.55)', zIndex: 1,
 },
 unitLabel: {
  position: 'absolute',
  top: DRUM_ITEM_H * Math.floor(DRUM_VISIBLE / 2),
  right: 4, height: DRUM_ITEM_H, lineHeight: DRUM_ITEM_H,
  fontSize: 16, fontFamily: F.bodyB, color: '#525252', zIndex: 3,
 },
});

// ─── Panel "Añadir actividad" — diseño Figma ────────────────
const DRUM_HOURS = Array.from({ length: 9 }, (_, i) => i);       // 0–8 h
const DRUM_MINS  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]; // 0–55 min

function ExtraSportPicker({ lang, g, onPick, onClose }) {
 const [other, setOther] = useState(false);
 const [txt, setTxt] = useState('');
 const [sport, setSport] = useState(null);
 const [hourIdx, setHourIdx] = useState(0);   // índice en DRUM_HOURS (default 0h)
 const [minIdx,  setMinIdx]  = useState(6);   // índice en DRUM_MINS  (default 30min)
 const [intensity, setIntensity] = useState('media');

 const durationMin = DRUM_HOURS[hourIdx] * 60 + DRUM_MINS[minIdx];
 const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

 const INTENSITIES = [
 { id: 'baja', label: tr('Baja', 'Low', 'Faible', 'Bassa') },
 { id: 'media', label: tr('Media', 'Medium', 'Moyenne', 'Media') },
 { id: 'alta', label: tr('Alta', 'High', 'Haute', 'Alta') },
 ];

 const handleAdd = () => {
 if (!sport) return;
 onPick(sport, durationMin, intensity);
 };

 const handleClose = () => {
 setSport(null); setOther(false); setTxt('');
 if (onClose) onClose();
 };

 return (
 <Modal visible animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={handleClose}>
 <View style={sp.overlay}>
 <SafeAreaView style={sp.sheet}>

 <View style={sp.header}>
 <BText style={sp.headerTitle}>{tr('Añadir actividad', 'Add activity', 'Ajouter activité', 'Aggiungi attività')}</BText>
 <TouchableOpacity style={sp.closeBtn} onPress={handleClose}>
 <BText style={sp.closeTxt}>✕</BText>
 </TouchableOpacity>
 </View>

 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sp.content}>

 {/* Deportes */}
 <View style={{ gap: 12 }}>
 <BText style={sp.sectionLabel}>{tr('Deporte', 'Sport', 'Sport', 'Sport')}</BText>
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
 {SPORTS_LIST.filter(o => o.id !== 'other').map(o => {
 const label = o.label[lang] || o.label.es;
 const sel = sport === label;
 return (
 <TouchableOpacity key={o.id} onPress={() => setSport(sel ? null : label)}
 style={[sp.chip, sel && sp.chipSelected]}>
 <BText style={[sp.chipTxt, sel && sp.chipTxtSelected]}>
 {o.emoji} {label}
 </BText>
 </TouchableOpacity>
 );
 })}
 <TouchableOpacity onPress={() => setOther(v => !v)}
 style={[sp.chip, other && sp.chipSelected]}>
 <BText style={[sp.chipTxt, other && sp.chipTxtSelected]}>
 {tr('Otro', 'Other', 'Autre', 'Altro')}
 </BText>
 </TouchableOpacity>
 </View>
 {other && (
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={txt} onChangeText={setTxt}
 placeholder={g.extraPlaceholder} autoFocus />
 <TouchableOpacity style={[styles.addBtn, { marginBottom: 0 }]} onPress={() => txt.trim() && setSport(txt.trim())}>
 <BText style={styles.addBtnText}>{g.add}</BText>
 </TouchableOpacity>
 </View>
 )}
 </View>

 {/* Tiempo — drum roll estilo iOS Timer */}
 <View style={{ gap: 12 }}>
 <BText style={sp.sectionLabel}>{tr('Tiempo', 'Time', 'Temps', 'Tempo')}</BText>
 <View style={sp.drumRow}>
  <DrumColumn values={DRUM_HOURS} selectedIndex={hourIdx} onSelect={setHourIdx} label="h" />
  <BText style={sp.drumSep}>:</BText>
  <DrumColumn values={DRUM_MINS} selectedIndex={minIdx} onSelect={setMinIdx} label="min" />
 </View>
 </View>

 {/* Intensidad */}
 <View style={{ gap: 12 }}>
 <BText style={sp.intensityLabel}>{tr('Intensidad', 'Intensity', 'Intensité', 'Intensità')}</BText>
 <View style={{ gap: 8 }}>
 {INTENSITIES.map(item => {
 const sel = intensity === item.id;
 return (
 <TouchableOpacity key={item.id} onPress={() => setIntensity(item.id)}
 style={[sp.optRow, sel && sp.optRowSelected]}>
 <BText style={[sp.optLabel, sel && sp.optLabelSelected]}>{item.label}</BText>
 <View style={[sp.radio, sel && sp.radioSelected]}>
 {sel && <View style={sp.radioDot} />}
 </View>
 </TouchableOpacity>
 );
 })}
 </View>
 </View>

 {/* Botón Añadir */}
 <TouchableOpacity onPress={handleAdd} style={[sp.addBtn, !sport && { opacity: 0.4 }]} disabled={!sport}>
 <BText style={sp.addBtnTxt}>{tr('Añadir', 'Add', 'Ajouter', 'Aggiungi')}</BText>
 </TouchableOpacity>

 </ScrollView>
 </SafeAreaView>
 </View>
 </Modal>
 );
}

const sp = StyleSheet.create({
 overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 sheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1, maxHeight: '90%' },
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 48 },
 headerTitle: { flex: 1, fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },
 closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
 closeTxt: { fontSize: 18, color: '#0A0A0A', fontFamily: F.body, lineHeight: 22 },
 content: { padding: 16, paddingBottom: 48, gap: 32 },
 sectionLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 intensityLabel: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A' },
 chip: { height: 40, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
 chipSelected: { backgroundColor: '#0A0A0A' },
 chipTxt: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A' },
 chipTxtSelected: { color: 'white' },
 drumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
 drumSep: { fontSize: 38, fontFamily: F.body, color: '#0A0A0A', paddingBottom: 4, marginHorizontal: 2 },
 optRow: { minHeight: 56, borderRadius: 24, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between' },
 optRowSelected: { backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#262626' },
 optLabel: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A' },
 optLabelSelected: { fontFamily: F.bodyB },
 radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
 radioSelected: { borderColor: '#0A0A0A' },
 radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0A0A0A' },
 addBtn: { height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
 addBtnTxt: { fontSize: 18, fontFamily: F.body, color: 'white' },
});



export default function GimnasioScreen({
 pi, trainDays, setTrainDays, program, lang = 'es', goal,
 healthData, profileExtended, saveProfileExtended,
 toggleFavoriteWorkout, skipWorkout, logWorkoutDone,
 sleepLog = [], logSleep,
 weight, height, logWeight,
}) {
 useEffect(() => { trackScreen('Gimnasio', { phase: pi?.phase }); }, []);
 const [sub, setSub] = useState('hoy');
 const [addingSport, setAddingSport] = useState(false);
 const [workoutLog, setWorkoutLog] = useState({});
 const [completedExercises, setCompletedExercises] = useState({});
 const [showVariations, setShowVariations] = useState(false);
 const [weekAction, setWeekAction] = useState(null); // { dateKey, step:'main'|'sport' }
 const [weekOffset, setWeekOffset] = useState(0); // 0 = semana actual, -1 = semana anterior, etc.
 const gymOpenRef = useRef(null);

 const saveActivityDay = async (dateKey, data) => {
 const existing = profileExtended?.activityLog || {};
 await saveProfileExtended?.({
 activityLog: { ...existing, [dateKey]: { ...(existing[dateKey] || {}), ...data } },
 });
 };
 const clearActivityDay = async (dateKey) => {
 const copy = { ...(profileExtended?.activityLog || {}) };
 delete copy[dateKey];
 await saveProfileExtended?.({ activityLog: copy });
 };

 const sessionRunning = resolveSession(program?.sessionRunning, lang, SESSION_RUNNING_STATIC);
 const sessionRenfo = resolveSession(program?.sessionRenfo, lang, SESSION_RENFO_STATIC);

 const g = (T[lang] || T.es).gym;
 const cm = (T[lang] || T.es).common;
 const hl = g.health;

 const DAY_LABELS_I18N = getDayLabels(lang);
 const todayJS = new Date();
 const todayKey = todayJS.toISOString().split('T')[0];
 const todayDow = todayJS.getDay();

 // ── Plan personalizado (fase + trainDays + fitness + condiciones) ────────────
 const fitnessLevel = profileExtended?.fitnessLevel || 'regular';
 const conditions = profileExtended?.conditions || [];
 const gymAccess = profileExtended?.gymAccess || 'home';
 const lifeStage = profileExtended?.lifeStage || null;
 const primaryGoals = profileExtended?.primaryGoals || [];

 // Carga workouts de Supabase
 const { workouts: dbWorkouts } = useWorkouts();

 // Skipped workouts de hoy
 const todayStrW = todayKey;
 const skippedWBlk = profileExtended?.skippedTodayWorkout || {};
 const skippedWorkoutIds = skippedWBlk.date === todayStrW ? (skippedWBlk.ids || []) : [];

 // Plan desde Supabase si está cargado, sino fallback al motor estático
 const planFromDb = dbWorkouts?.length
 ? buildPersonalizedWeekPlan(
 dbWorkouts,
 {
 fitnessLevel, conditions, gymAccess, lifeStage, primaryGoals,
 sportProfile: profileExtended?.sportProfile || {},
 goal: goal ?? profileExtended?.goal,
 favoriteWorkouts: profileExtended?.favoriteWorkouts || [],
 skippedWorkoutIds,
 },
 pi?.phase,
 trainDays,
 lang,
 )
 : null;

 const personalPlan = planFromDb && Object.keys(planFromDb).length > 0
 ? planFromDb
 : buildWeekPlan(pi?.phase, trainDays, fitnessLevel, conditions);

 // ── Programa activo: sus sesiones SON el plan en los primeros N días de
 // entreno (N = sesiones/semana del programa); el motor rellena el resto ──
 const currentPhase = pi?.phase || 'follicular';
 const progState = getActiveProgramState(profileExtended, currentPhase);
 const progDays = progState ? getProgramDays(progState.program, trainDays) : [];
 const todayIsProgramDay = !!progState && (progDays.includes(todayDow) || (trainDays?.length ?? 0) === 0);

 const todaySession = todayIsProgramDay
 ? programSessionToCard(progState, lang)
 : (personalPlan[todayDow] ?? null); // null = día de descanso
 const todayLog = workoutLog[todayKey];
 const phaseConfig = PHASE_CONFIG[pi?.phase] || PHASE_CONFIG.follicular;

 // Marcar "hecha" la sesión de hoy avanza también el programa
 const advanceProgram = async () => {
 if (!progState) return;
 const { program, active, total, done } = progState;
 const next = done + 1;
 // Para programas phaseRotation: actualizar también el pp (phase progress)
 const nextActive = program.phaseRotation
  ? (() => {
   const pp = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0, ...(active.pp || {}) };
   pp[currentPhase] = (pp[currentPhase] || 0) + 1;
   return { ...active, done: next, pp };
  })()
  : { ...active, done: next };
 if (next >= total) {
 const completed = profileExtended?.completedPrograms || [];
 await saveProfileExtended?.({
 activeProgram: null,
 completedPrograms: [...completed.filter(id => id !== program.id), program.id],
 });
 } else {
 await saveProfileExtended?.({ activeProgram: nextActive });
 }
 };

 const saveLog = (update) => {
 setWorkoutLog(prev => ({ ...prev, [todayKey]: update }));
 if (update?.status === 'done' && todayIsProgramDay) advanceProgram();
 };

 const toggleExercise = (idx) =>
 setCompletedExercises(prev => ({ ...prev, [idx]: !prev[idx] }));

 const completedCount = Object.values(completedExercises).filter(Boolean).length;
 const totalExercises = sessionRenfo?.exercises?.length || 0;

 let progOffset = 0; // numera las sesiones del programa a lo largo de la semana
 const weekDays = Array.from({ length: 7 }, (_, i) => {
 const date = new Date(); date.setDate(date.getDate() + i);
 const dow = date.getDay();
 const dateKey = date.toISOString().split('T')[0];
 let session = personalPlan[dow] ?? null;
 if (progState && progDays.includes(dow)) {
 // Para phaseRotation: siempre la misma sesión actual (la fase manda, no el offset)
 const n = progState.isPhaseProgram ? null : progState.done + progOffset;
 const card = programSessionToCard(progState, lang, n);
 if (card) { session = card; if (!progState.isPhaseProgram) progOffset += 1; }
 }
 const sType = session ? 'workout' : 'rest';
 return {
 date, dow, sessionType: sType, session,
 log: workoutLog[dateKey], dateKey,
 dayNum: date.getDate(),
 dayLabel: i === 0 ? cm.today : i === 1 ? cm.tomorrow : DAY_LABELS_I18N[dow],
 };
 });

 // Semana desplazada para la pestaña "semana" (weekOffset <= 0)
 const activityLog = profileExtended?.activityLog || {};
 // Lunes de la semana con weekOffset (0 = semana actual, -1 = anterior…)
 const thisMonday = (() => {
 const t = new Date();
 const d = t.getDay();
 t.setDate(t.getDate() + (d === 0 ? -6 : 1 - d) + weekOffset * 7);
 return t;
 })();
 const offsetDays = Array.from({ length: 7 }, (_, i) => {
 const date = new Date(thisMonday);
 date.setDate(thisMonday.getDate() + i);
 const dow = date.getDay();
 const dateKey = date.toISOString().split('T')[0];
 const isPast = dateKey < todayKey;
 const isToday = dateKey === todayKey;
 // Sesión planificada para ese día de la semana
 let session = personalPlan[dow] ?? null;
 if (progState && progDays.includes(dow)) {
 const card = programSessionToCard(progState, lang, progState.done);
 if (card) session = card;
 }
 // Estado del entrenamiento: primero log en memoria (hoy), luego activityLog histórico
 const memLog = isToday ? workoutLog[dateKey] : null;
 const savedStatus = activityLog[dateKey]?.workout;
 const status = memLog?.status ?? savedStatus ?? null;
 // Código de color
 let dotColor = null;
 if (session) {
 if (status === 'done') dotColor = '#22C55E'; // verde
 else if (status === 'skipped') dotColor = '#EAB308'; // amarillo
 else if (isPast) dotColor = '#EF4444'; // rojo — día de entreno pasado sin marcar
 // futuro: sin punto
 } else {
 dotColor = '#E5E5E5'; // gris — día de descanso
 }
 return {
 date, dow, session,
 dateKey, dayNum: date.getDate(),
 dayLabel: isToday ? cm.today : DAY_LABELS_I18N[dow],
 status, dotColor, isPast, isToday,
 extraSport: activityLog[dateKey]?.extraSport ?? memLog?.extraSport ?? null,
 };
 });

 // ── health shortcuts ────────────────────────────────────────────────────────
 const hd = healthData ?? {};
 const connected = hd.isConnected;
 const available = hd.isAvailable;

 // ── workout type label + emoji ──────────────────────────────────────────────
 const wLabel = (type) => hl?.workoutTypes?.[type] ?? type ?? '—';
 const wEmoji = (type) => hl?.workoutEmoji?.[type] ?? '';

 const hasGymData = !!profileExtended?.gymSetupDone;

 if (!hasGymData) {
  const emptyTxt = {
   title: { es: 'Plan de entrenamiento', en: 'Training plan', fr: "Plan d'entra\u00eenement", it: 'Piano di allenamento' },
   sub: { es: 'Configura tus preferencias para que nos podamos adaptar a tus necesidades y gustos', en: 'Set your preferences so we can adapt to your needs and tastes.', fr: 'Configure tes pr\u00e9f\u00e9rences pour que nous puissions adapter ton plan.', it: 'Configura le tue preferenze per personalizzare il piano.' },
   cta: { es: 'Configurar entrenamiento', en: 'Set up training', fr: "Configurer l'entra\u00eenement", it: 'Configura allenamento' },
  };
  return (
   <ImageBackground source={require('../../assets/Apartados/Blumm_ejercicio_fondo.png')} style={{ flex: 1 }}>
    <View style={ge.wrap}>
     <BlurView intensity={25} tint="light" style={ge.card}>
      <View style={ge.iconWrap}><View style={ge.iconInner} /></View>
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
       <BText style={ge.title}>{emptyTxt.title[lang] || emptyTxt.title.es}</BText>
       <BText style={ge.sub}>{emptyTxt.sub[lang] || emptyTxt.sub.es}</BText>
      </View>
      <TouchableOpacity style={ge.btn} onPress={() => gymOpenRef.current?.()} activeOpacity={0.85}>
       <BText style={ge.btnTxt}>{emptyTxt.cta[lang] || emptyTxt.cta.es}</BText>
      </TouchableOpacity>
     </BlurView>
    </View>
    <GymSetupCard lang={lang} trainDays={trainDays} setTrainDays={setTrainDays}
     profileExtended={profileExtended} saveProfileExtended={saveProfileExtended || (() => {})}
     openModalRef={gymOpenRef} />
   </ImageBackground>
  );
 }

 return (
 <SwipeableTabs tabs={['hoy', 'salud', 'favoritos', 'registro']} current={sub} onChange={setSub}>
 <ScrollView style={styles.container} contentContainerStyle={styles.content}>

 <View style={{ height: 0, overflow: 'hidden' }}>
  <GymSetupCard lang={lang} trainDays={trainDays} setTrainDays={setTrainDays}
   profileExtended={profileExtended} saveProfileExtended={saveProfileExtended || (() => {})}
   openModalRef={gymOpenRef} />
 </View>

 {/* ── Tab bar ── */}
 <View style={styles.tabRow}>
 {[
 { id: 'hoy', l: g.today },
 { id: 'salud', l: g.salud },
 { id: 'favoritos', l: { es: 'Favs.', en: 'Favs.', fr: 'Favoris', it: 'Preferiti' }[lang] || 'Favs.' },
 { id: 'registro', l: { es: 'Registro', en: 'Log', fr: 'Journal', it: 'Registro' }[lang] || 'Registro' },
 ].map(t => (
 <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
 style={[styles.tab, sub === t.id && styles.tabActive]}>
 <BText style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</BText>
 </TouchableOpacity>
 ))}
 </View>

 {/* ════════ Calendario + mini programa (hoy y salud) ════════ */}
 {sub !== 'registro' && <View style={styles.calCard}>
 {(() => {
  const refDate = offsetDays.length ? new Date(offsetDays[0].dateKey + 'T12:00:00') : new Date();
  const MONTHS = { es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'], en: ['January','February','March','April','May','June','July','August','September','October','November','December'], fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'], it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'] };
  const months = MONTHS[lang] || MONTHS.es;
  const monthStr = `${months[refDate.getMonth()]} ${refDate.getFullYear()}`;
  return (
   <>
   <View style={styles.calMonthRow}>
    <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); setWeekAction(null); }} style={{ padding: 4 }}>
     <ChevronLeft size={16} color="#0A0A0A" />
    </TouchableOpacity>
    <BText style={styles.calMonthLabel}>{monthStr}</BText>
    <TouchableOpacity onPress={() => { setWeekOffset(o => o + 1); setWeekAction(null); }} style={{ padding: 4 }}>
     <ChevronRight size={16} color="#0A0A0A" />
    </TouchableOpacity>
   </View>
   <View style={styles.calHeaderRow}>
    {offsetDays.map((d, i) => {
     const abbr = new Date(d.dateKey + 'T12:00:00').toLocaleDateString('default', { weekday: 'short' }).slice(0, 3);
     return <View key={i} style={styles.calHeaderCell}><BText style={styles.calHeaderTxt}>{abbr}</BText></View>;
    })}
   </View>
   <View style={styles.calDaysRow}>
    {(() => {
     const PHASE_COLORS_WEEK = { menstrual:'#92E288', follicular:'#C79ADF', ovulation:'#FEDF68', luteal:'#FEA068' };
     return offsetDays.map((day, i) => {
      const isExpanded = weekAction?.dateKey === day.dateKey;
      return (
       <TouchableOpacity key={i}
        onPress={() => setWeekAction(isExpanded ? null : { dateKey: day.dateKey, step: 'main' })}
        style={[styles.calDayCell, isExpanded && styles.calDayCellSelected]}>
        {day.isToday && (
         <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end', alignItems: 'center' }]}>
          <PhaseGlow phase="ovulation" />
         </View>
        )}
        {day.dotColor && <View style={[styles.calDayDot, { backgroundColor: day.dotColor }]} />}
        <BText style={styles.calDayNum}>{day.dayNum}</BText>
       </TouchableOpacity>
      );
     });
    })()}
   </View>
   </>
  );
 })()}
 {weekAction && (() => {
 const day = offsetDays.find(d => d.dateKey === weekAction.dateKey);
 if (!day) return null;
 const s = day.session;
 const logEntry = (profileExtended?.activityLog || {})[day.dateKey] || {};
 const logged = logEntry.workout;
 return (
 <View style={styles.weekDetailAzote}>
 {weekAction.step === 'main' && (
 <View>
 <BText style={styles.weekDetailWorkout}>{s ? s.name : g.rest}</BText>
 {logged && (
 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
 <BText style={styles.weekDetailStatus}>
 {(logged === 'done' || logged === 'extra')
 ? ` ${({ es: 'Registrado', en: 'Logged', fr: 'Enregistré', it: 'Registrato' }[lang] || 'Registrado')}${logEntry.extraSport ? ` · ${logEntry.extraSport}` : ''}`
 : `${({ es: 'Descanso', en: 'Rest', fr: 'Repos', it: 'Riposo' }[lang] || 'Descanso')}`}
 </BText>
 <GHTouchable onPress={async () => { await clearActivityDay(day.dateKey); setWeekAction(null); }}>
 <BText style={{ fontSize: 12, color: '#737373' }}>{({ es: 'Borrar', en: 'Clear', fr: 'Effacer', it: 'Cancella' }[lang] || 'Borrar')}</BText>
 </GHTouchable>
 </View>
 )}
 <View style={{ gap: 2 }}>
 {s && (
 <GHTouchable
 onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'done' }); setWeekAction(null); }}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{({ es: 'Lo hice', en: 'I did it', fr: 'Je l\'ai fait', it: 'L\'ho fatto' }[lang] || 'Lo hice')}</BText>
 </GHTouchable>
 )}
 <GHTouchable
 onPress={() => setWeekAction(prev => ({ ...prev, step: 'sport' }))}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{({ es: 'Añadir deporte', en: 'Add sport', fr: 'Ajouter un sport', it: 'Aggiungi sport' }[lang] || 'Añadir deporte')}</BText>
 </GHTouchable>
 <GHTouchable
 onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'skipped' }); setWeekAction(null); }}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{({ es: 'Descansé', en: 'Rest day', fr: 'Journée de repos', it: 'Giorno di riposo' }[lang] || 'Descansé')}</BText>
 </GHTouchable>
 </View>
 </View>
 )}
 {weekAction.step === 'sport' && (
 <View>
 <GHTouchable onPress={() => setWeekAction(prev => ({ ...prev, step: 'main' }))} style={{ marginBottom: 8 }}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
 <ChevronLeft size={14} color="#737373" />
 <BText style={{ fontSize: 12, color: '#737373' }}>{({ es: 'Volver', en: 'Back', fr: 'Retour', it: 'Indietro' }[lang] || 'Volver')}</BText>
 </View>
 </GHTouchable>
 <ExtraSportPicker
 lang={lang}
 g={g}
 onPick={async (sport, minutes) => {
 const status = s ? 'done' : 'extra';
 await saveActivityDay(day.dateKey, { workout: status, extraSport: sport, extraMinutes: minutes || null });
 setWeekAction(null);
 }}
 onClose={() => setWeekAction(null)}
 />
 </View>
 )}
 </View>
 );
 })()}
 </View>}

 {sub !== 'registro' && progState && (
 <ImageBackground source={require('../../assets/Apartados/Blumm_ejercicio_fondo.png')}
  style={styles.progMiniCard} imageStyle={{ borderRadius: 24 }}>
  <BlurView intensity={25} tint="light" style={styles.progMiniBlur}>
   <BText style={styles.progMiniLabel}>{g.myProgram || 'Programa'}</BText>
   <BText style={styles.progMiniName}>{progState.program?.name?.[lang] || progState.program?.name?.es || ''}</BText>
  </BlurView>
 </ImageBackground>
 )}

 {/* ════════════════════════ HOY ════════════════════════ */}
 {sub === 'hoy' && <>
 {/* Mini health banner (last workout from HealthKit, if today) */}
 {connected && hd.lastWorkout && hd.lastWorkout.date === todayKey && (
 <View style={styles.healthBanner}>
 <BText style={styles.healthBannerIco}>{wEmoji(hd.lastWorkout.type)}</BText>
 <View style={{ flex: 1 }}>
 <BText style={styles.healthBannerTitle}>
 {wLabel(hd.lastWorkout.type)} · {fmtTime(hd.lastWorkout.startTime)}
 </BText>
 <BText style={styles.healthBannerSub}>
 {hd.lastWorkout.duration} {hl?.min}
 {hd.lastWorkout.avgHR ? ` · ${hd.lastWorkout.avgHR} ${hl?.bpm}` : ''}
 {hd.lastWorkout.calories ? ` · ${hd.lastWorkout.calories} kcal` : ''}
 </BText>
 </View>
 <Check size={16} color={GREEN.text} />
 </View>
 )}

 {todaySession ? <>
 {/* Sesión de hoy — Figma gray card + blue title */}
 {(() => {
 const durLabel = todaySession.dur || todaySession.duration || '';
 const isFav = profileExtended?.favoriteWorkouts?.includes(todaySession.id);
 const totalEx = todaySession.exercises?.length || 0;
 return (
  <>
  <View style={styles.card}>
   {/* Title row */}
   <View style={styles.sessionTitleRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
     <SportShoe size={16} color="#0A0A0A" />
     <BText style={styles.sectionLabel}>{g.todaySession || 'Sesión de hoy'}</BText>
    </View>
    <ChevronRight size={16} color="#737373" />
   </View>

   {/* Session name + duration */}
   <View style={{ gap: 4 }}>
    <BText style={styles.sessionNameBlue}>{todaySession.name}</BText>
    {!!durLabel && <BText style={styles.sessionDurSmall}>{durLabel}</BText>}
   </View>

   {/* Realizados progress */}
   {totalEx > 0 && (
    <View style={{ gap: 8 }}>
     <BText style={styles.realizadosLbl}>{g.completedLabel || 'Realizados'}</BText>
     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <BText style={styles.realizadosCount}>{completedCount}</BText>
      <BText style={styles.realizadosCount}>{totalEx}</BText>
     </View>
    </View>
   )}

   {/* Todo exercise list */}
   {totalEx > 0 && (
    <View>
     {todaySession.exercises.map((ex, i) => {
      const done = !!completedExercises[i];
      const detail = ex.sets ? `${ex.sets}×${ex.reps || ex.dur || ''}` : ex.dur || '';
      return (
       <TouchableOpacity key={i} onPress={() => toggleExercise(i)}
        style={[styles.todoRow, i < totalEx - 1 && { borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }]}>
        <View style={done ? styles.todoDoneBox : styles.todoPendingBox}>
         {done && <Check size={12} color="white" />}
        </View>
        <BText style={[styles.todoItemName, done && styles.todoItemDoneText]}>{ex.name}</BText>
        {!!detail && <BText style={[styles.todoItemReps, done && styles.todoItemDoneText]}>{detail}</BText>}
       </TouchableOpacity>
      );
     })}
    </View>
   )}

   {/* Status badge when logged */}
   {todayLog && (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
     <BText style={{ fontSize: 14, fontFamily: F.bodyB, color: todayLog.status === 'done' ? '#49CF38' : '#737373' }}>
      {todayLog.status === 'done' ? (g.done || 'Hecho') : (g.skipped || 'Saltado')}
     </BText>
     <TouchableOpacity onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
      <BText style={{ fontSize: 12, color: '#737373', fontFamily: F.body }}>{g.undo || 'Deshacer'}</BText>
     </TouchableOpacity>
    </View>
   )}
  </View>

  {/* 3 icon action row */}
  <View style={styles.sessionActions}>
   <TouchableOpacity style={styles.sessionActionBtn} onPress={() => skipWorkout?.(todaySession.id)}>
    <RefreshCcw size={24} color="#0A0A0A" />
   </TouchableOpacity>
   <TouchableOpacity style={styles.sessionActionBtn} onPress={() => toggleFavoriteWorkout?.(todaySession.id)}>
    <Heart size={24} color="#0A0A0A" fill={isFav ? '#0A0A0A' : 'none'} />
   </TouchableOpacity>
   <TouchableOpacity style={styles.sessionActionBtn}
    onPress={() => { if (!todayLog) { saveLog({ status: 'done', extraSport: '' }); logWorkoutDone?.('done'); } }}>
    <Check size={24} color={todayLog?.status === 'done' ? '#49CF38' : '#0A0A0A'} />
   </TouchableOpacity>
  </View>
  </>
 );
 })()}

 {/* Actividad extra — tarjeta azul Figma */}
 <View style={styles.addExtraCard}>
 <View style={styles.addExtraTitleRow}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
   <Plus size={16} color="#0A1823" />
   <BText style={styles.addExtraLabel}>{g.logLabel || 'Registro'}</BText>
  </View>
  <ChevronRight size={16} color="#0A1823" />
 </View>
 <View style={{ gap: 16 }}>
 <BText style={styles.addExtraTitle}>{g.addExtra}</BText>
 {todayLog?.extraSport ? (
 <View style={styles.extraRow}>
 <BText style={styles.extraText}>{todayLog.extraSport}{todayLog.extraMinutes ? ` · ${todayLog.extraMinutes} min` : ''}</BText>
 <TouchableOpacity onPress={() => saveLog({ ...todayLog, extraSport: '' })}>
 <BText style={styles.extraRemove}>×</BText>
 </TouchableOpacity>
 </View>
 ) : addingSport ? (
 <ExtraSportPicker lang={lang} g={g}
 onPick={(label, minutes, intensity) => {
 saveLog({ ...(todayLog || { status: 'done' }), extraSport: label, extraMinutes: minutes || null, extraIntensity: intensity || null });
 setAddingSport(false);
 }} onClose={() => setAddingSport(false)} />
 ) : (
 <TouchableOpacity style={styles.addExtraBtn} onPress={() => setAddingSport(true)}>
 <BText style={styles.addExtraBtnTxt}>{g.addActivity}</BText>
 </TouchableOpacity>
 )}
 </View>
 </View>

 </> : <>
 {/* Día de descanso */}
 <View style={[styles.card, { alignItems: 'center', padding: 28 }]}>
 <BText style={{ fontSize: 48, marginBottom: 12 }}></BText>
 <BText style={styles.restTitle}>{g.restDay}</BText>
 <BText style={styles.restSub}>{g.restDesc}</BText>
 </View>
 <View style={styles.extraSportCard}>
  <View style={styles.extraSportHeader}>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <BookOpen size={16} color="#0A1823" />
    <BText style={styles.extraSportHeaderTxt}>{lang === 'en' ? 'Log' : lang === 'fr' ? 'Journal' : lang === 'it' ? 'Registro' : 'Registro'}</BText>
   </View>
   <ChevronRight size={16} color="#0A1823" />
  </View>
  {addingSport ? (
   <ExtraSportPicker lang={lang} g={g}
    onPick={(label, minutes) => {
     saveLog({ status: 'extra', extraSport: label, extraMinutes: minutes || null });
     setAddingSport(false);
    }} onClose={() => setAddingSport(false)} />
  ) : (
   <View style={{ gap: 16 }}>
    <View style={{ gap: 4 }}>
     <BText style={styles.extraSportTitle}>{g.addExtra}</BText>
     {todayLog?.extraSport ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
       <BText style={styles.extraSportSub}>{todayLog.extraSport}{todayLog.extraMinutes ? ` · ${todayLog.extraMinutes} min` : ''}</BText>
       <TouchableOpacity onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
        <BText style={{ color: '#0A1823', fontFamily: F.body, fontSize: 18 }}>×</BText>
       </TouchableOpacity>
      </View>
     ) : (
      <BText style={styles.extraSportSub}>{lang === 'en' ? 'Log any extra activity you did today outside your plan.' : lang === 'fr' ? 'Note toute activité extra que tu as faite aujourd\'hui hors de ton plan.' : lang === 'it' ? 'Registra qualsiasi attività extra che hai fatto oggi fuori dal piano.' : 'Registra cualquier actividad extra que hayas hecho hoy fuera de tu plan.'}</BText>
     )}
    </View>
    {!todayLog?.extraSport && (
     <TouchableOpacity style={styles.extraSportBtn} onPress={() => setAddingSport(true)}>
      <BText style={styles.extraSportBtnTxt}>{lang === 'en' ? 'Add activity' : lang === 'fr' ? 'Ajouter activité' : lang === 'it' ? 'Aggiungi attività' : 'Añadir actividad'}</BText>
     </TouchableOpacity>
    )}
   </View>
  )}
 </View>
 </>}

 {/* Tu plan de ejercicios — Figma blue card #8EC5F1 */}
 <View style={styles.planExercCard}>
 <View style={styles.planExercHeader}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
   <BookOpen size={16} color="#0A1823" />
   <BText style={styles.planExercHeaderTxt}>{lang === 'en' ? 'My exercise plan' : lang === 'fr' ? 'Mon plan d\'exercice' : lang === 'it' ? 'Il mio piano' : 'Mi plan de ejercicio'}</BText>
  </View>
  <ChevronRight size={16} color="#0A1823" />
 </View>
 {progState && (
  <>
   <BText style={styles.planExercTitle}>{progState.program?.name?.[lang] || progState.program?.name?.es || progState.program?.id || ''}</BText>
   {progState.program?.desc?.[lang] || progState.program?.desc?.es ? (
    <BText style={styles.planExercDesc}>{progState.program?.desc?.[lang] || progState.program?.desc?.es}</BText>
   ) : null}
  </>
 )}
 {progState?.program?.tags?.length > 0 && (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
   {progState.program.tags.map((t, i) => (
    <View key={i} style={styles.planExercTag}>
     <BText style={styles.planExercTagTxt}>{t[lang] || t.es || t}</BText>
    </View>
   ))}
  </View>
 )}
 <View style={styles.planExercDays}>
 {(() => {
   const letters = ['A', 'B', 'C'];
   const restLabel = { es: 'Descanso', en: 'Rest', fr: 'Repos', it: 'Riposo' }[lang] || 'Descanso';
   const restDetail = { es: 'Recuperación activa', en: 'Active recovery', fr: 'Récupération active', it: 'Recupero attivo' }[lang] || 'Recuperación activa';
   if (progState) {
     // Rows dinámicos: una fila por sesión/semana del programa + fila descanso
     const prog = progState.program;
     let dynRows = [];
     if (prog.phaseRotation) {
       // Programa por fase: mostrar la sesión actual de la fase
       const ps = progState.session;
       if (ps) dynRows.push({ label: `${lang === 'en' ? 'Session' : lang === 'fr' ? 'Séance' : lang === 'it' ? 'Sessione' : 'Sesión'} (${ps.phase || ''})`, detail: `${sessionMinutes(ps.spec)}'` });
     } else {
       const firstWeek = prog.weeks[0];
       const sessions = firstWeek.list || Array(prog.spw).fill(firstWeek.all);
       dynRows = sessions.slice(0, 3).map((spec, i) => ({
         label: `${prog.emoji} ${lang === 'en' ? 'Session' : lang === 'fr' ? 'Séance' : lang === 'it' ? 'Sessione' : 'Sesión'} ${i + 1}`,
         detail: `${sessionMinutes(spec)}'`,
       }));
     }
     if (dynRows.length < 3) dynRows.push({ label: restLabel, detail: restDetail });
     return dynRows.map((row, i) => (
       <View key={i} style={styles.planExercRow}>
         <View style={styles.planExercAvatar}><BText style={styles.planExercAvatarTxt}>{letters[i] || '+'}</BText></View>
         <View style={{ flex: 1 }}>
           <BText style={styles.planExercLabel}>{row.label}</BText>
           <BText style={styles.planExercDetail}>{row.detail}</BText>
         </View>
       </View>
     ));
   }
   return g.programRows.map((row, i) => (
     <View key={i} style={styles.planExercRow}>
       <View style={styles.planExercAvatar}><BText style={styles.planExercAvatarTxt}>{letters[i]}</BText></View>
       <View style={{ flex: 1 }}>
         <BText style={styles.planExercLabel}>{row.label}</BText>
         <BText style={styles.planExercDetail}>{row.detail}</BText>
       </View>
     </View>
   ));
 })()}
 </View>
 <TouchableOpacity style={styles.planExercEditBtn} onPress={() => gymOpenRef.current?.()}>
 <BText style={styles.planExercEditTxt}>
 {({ es: 'Editar plan', en: 'Edit plan', fr: 'Modifier le plan', it: 'Modifica piano' }[lang] || 'Editar plan')}
 </BText>
 </TouchableOpacity>
 </View>

 <TipsCard articles={gymArticles} lang={lang} variant="azote" />
 </>}

 {/* ════════════════════════ SALUD ════════════════════════ */}
 {sub === 'salud' && (
 <>
 <HealthTab
 hl={hl}
 hd={hd}
 lang={lang}
 wLabel={wLabel}
 wEmoji={wEmoji}
 profileExtended={profileExtended}
 saveProfileExtended={saveProfileExtended}
 />
 <SleepCard sleepLog={sleepLog} logSleep={logSleep} lang={lang} healthSleep={hd?.lastSleep} />
 <WeightCard lang={lang} weight={weight} height={height} goal={goal} profileExtended={profileExtended} saveProfileExtended={saveProfileExtended} logWeight={logWeight} />
 <WearablesCard hd={hd} hl={hl} lang={lang} />
 </>
 )}

 {/* ── FAVORITOS ── */}
 {sub === 'favoritos' && (() => {
  const favIds = profileExtended?.favoriteWorkouts || [];
  const favWorkouts = (dbWorkouts || []).filter(w => favIds.includes(w.id));
  const emptyTxt = { es: 'Aún no tienes favoritos', en: 'No favourites yet', fr: 'Pas encore de favoris', it: 'Ancora nessun preferito' };
  const hintTxt = { es: 'Pulsa el corazón en cualquier entrenamiento para guardarlo aquí.', en: 'Tap the heart on any workout to save it here.', fr: 'Appuie sur le cœur sur un entraînement pour le sauvegarder ici.', it: 'Tocca il cuore su un allenamento per salvarlo qui.' };
  if (!favWorkouts.length) return (
  <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
   <Heart size={40} color="#E5E5E5" style={{ marginBottom: 12 }} />
   <BText style={{ fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 8, textAlign: 'center' }}>{emptyTxt[lang] || emptyTxt.es}</BText>
   <BText style={{ fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 20 }}>{hintTxt[lang] || hintTxt.es}</BText>
  </View>
  );
  return favWorkouts.map(w => {
  const name = w.name?.[lang] || w.name?.es || w.name || '';
  const desc = w.description?.[lang] || w.description?.es || w.description || '';
  const dur  = w.duration ? `${w.duration}'` : '';
  return (
   <View key={w.id} style={styles.favCard}>
   <View style={styles.favCardContent}>
    <View style={styles.favCardTop}>
    <BText style={styles.favCardTitle}>{w.emoji ? `${w.emoji} ` : ''}{name}</BText>
    {dur ? <View style={styles.favTag}><BText style={styles.favTagTxt}>{dur}</BText></View> : null}
    {desc ? <BText style={{ fontSize: 12, color: '#737373', fontFamily: F.body, lineHeight: 18, marginTop: 4 }} numberOfLines={2}>{desc}</BText> : null}
    </View>
    <View style={styles.favActions}>
    <TouchableOpacity style={styles.favHeartBtn} onPress={() => toggleFavoriteWorkout?.(w.id)}>
     <Heart size={16} color="white" fill="white" />
    </TouchableOpacity>
    </View>
   </View>
   </View>
  );
  });
 })()}

 {/* ════════════════════════ REGISTRO ════════════════════════ */}
 {sub === 'registro' && (
 <WorkoutHistoryTab
  activityLog={profileExtended?.activityLog || {}}
  lang={lang}
 />
 )}

 </ScrollView>
 </SwipeableTabs>
 );
}

// ─── Health tab ───────────────────────────────────────────────────────────────
function HealthTab({ hl, hd, lang, wLabel, wEmoji, profileExtended, saveProfileExtended }) {
 const {
 isAvailable, isConnected, isLoading, lastSync,
 lastWorkout, recentWorkouts, todayMetrics, lastSleep, sleepHistory,
 requestPermissions, syncData, disconnect,
 } = hd;

 const [identifyingId, setIdentifyingId] = useState(null);
 const [editingDurationId, setEditingDurationId] = useState(null);
 const [durationInput, setDurationInput] = useState('');
 const typeOverrides = profileExtended?.workoutTypeOverrides || {};
 const durationOverrides = profileExtended?.workoutDurationOverrides || {};

 const resolveDuration = (w) => durationOverrides[w.id] ?? w.duration ?? null;

 const saveDurationOverride = async (workoutId) => {
 const mins = parseInt(durationInput, 10);
 if (!mins || mins <= 0) { setEditingDurationId(null); return; }
 await saveProfileExtended?.({ workoutDurationOverrides: { ...durationOverrides, [workoutId]: mins } });
 setEditingDurationId(null);
 setDurationInput('');
 };

 const resolveType = (w) => typeOverrides[w.id] ?? w.type;
 const resolvedLabel = (w) => {
 const t = resolveType(w);
 if (t === 'other') return wLabel(t);
 const sport = SPORTS_LIST.find(s => s.id === t);
 return sport ? (sport.label[lang] || sport.label.es) : wLabel(t);
 };
 const resolvedEmoji = (w) => {
 const t = resolveType(w);
 const sport = SPORTS_LIST.find(s => s.id === t);
 return sport ? sport.emoji : wEmoji(t);
 };

 const saveTypeOverride = async (workoutId, sportId) => {
 await saveProfileExtended?.({ workoutTypeOverrides: { ...typeOverrides, [workoutId]: sportId } });
 setIdentifyingId(null);
 };

 const SportIdentifyPicker = ({ workoutId }) => (
 <View style={{ marginTop: 10, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 10 }}>
 <BText style={{ fontSize: 12, fontFamily: F.bodyB, color: '#737373', marginBottom: 8 }}>
 {{ es: '¿Qué deporte fue?', en: 'What sport was it?', fr: 'Quel sport était-ce ?', it: 'Che sport era?' }[lang] || '¿Qué deporte fue?'}
 </BText>
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
 {SPORTS_LIST.filter(s => s.id !== 'other').map(s => (
 <TouchableOpacity key={s.id} onPress={() => saveTypeOverride(workoutId, s.id)}
 style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}>
 <BText style={{ fontSize: 12, color: '#1E40AF', fontWeight: '500' }}>{s.emoji} {s.label[lang] || s.label.es}</BText>
 </TouchableOpacity>
 ))}
 </View>
 <TouchableOpacity onPress={() => setIdentifyingId(null)} style={{ marginTop: 8 }}>
 <BText style={{ fontSize: 12, color: '#737373', textAlign: 'center' }}>
 {{ es: 'Cancelar', en: 'Cancel', fr: 'Annuler', it: 'Annulla' }[lang] || 'Cancelar'}
 </BText>
 </TouchableOpacity>
 </View>
 );

 // ── Last workout card ──────────────────────────────────────────────────────
 const LastWorkoutCard = () => {
 if (!isConnected) return null;
 if (!lastWorkout) {
 return (
 <View style={styles.card}>
 <BText style={styles.sectionTitle}>{hl?.lastSession}</BText>
 <BText style={styles.tipText}>{hl?.noSession}</BText>
 </View>
 );
 }
 const w = lastWorkout;
 const isUnknown = resolveType(w) === 'other';
 const isIdentifying = identifyingId === w.id;
 const dur = resolveDuration(w);
 const isEditingDur = editingDurationId === w.id;
 return (
 <View style={[styles.card, { gap: 24 }]}>
 <BText style={styles.sectionLabel}>{hl?.lastSession}</BText>

 {/* Header */}
 <View style={styles.workoutHeader}>
 <View style={{ flex: 1 }}>
 <BText style={styles.workoutName} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>{resolvedLabel(w)}</BText>
 {dur != null && <BText style={styles.workoutTime}>{dur} {hl?.min}</BText>}
 </View>
 <TouchableOpacity
 onPress={() => {
 const opening = !(isIdentifying || isEditingDur);
 setIdentifyingId(opening ? w.id : null);
 setEditingDurationId(opening ? w.id : null);
 setDurationInput(dur != null ? String(dur) : '');
 }}
 style={{ padding: 6 }}>
 {(isIdentifying || isEditingDur) ? <X size={18} color="#737373" /> : <Pencil size={16} color="#737373" />}
 </TouchableOpacity>
 </View>

 {isIdentifying && <SportIdentifyPicker workoutId={w.id} />}

 {isEditingDur && (
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 10 }}>
 <TextInput
 style={{ flex: 1, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, color: '#0A0A0A', backgroundColor: 'white' }}
 keyboardType="number-pad"
 placeholder={{ es: 'Minutos', en: 'Minutes', fr: 'Minutes', it: 'Minuti' }[lang] || 'Minutos'}
 value={durationInput}
 onChangeText={setDurationInput}
 maxLength={3}
 autoFocus
 />
 <BText style={{ fontSize: 13, color: '#737373' }}>{hl?.min}</BText>
 <TouchableOpacity onPress={() => saveDurationOverride(w.id)}
 style={{ backgroundColor: BLUE.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 }}>
 <Check size={16} color="white" />
 </TouchableOpacity>
 <TouchableOpacity onPress={() => setEditingDurationId(null)}>
 <X size={16} color="#737373" />
 </TouchableOpacity>
 </View>
 )}

 {/* Metric pills — duración ya visible en header, se omite aquí */}
 <View style={styles.metricRow}>
 {w.avgHR != null && <MetricPill label={hl?.avgHR} value={`${w.avgHR} ${hl?.bpm}`} color="#EF4444" />}
 {w.maxHR != null && <MetricPill label={hl?.maxHR} value={`${w.maxHR} ${hl?.bpm}`} color="#EF4444" />}
 {w.calories != null && <MetricPill label={hl?.calories} value={`${w.calories} kcal`} color="#F97316" />}
 {w.distance != null && <MetricPill label={hl?.distance} value={`${w.distance} ${hl?.km}`} color="#8B5CF6" />}
 </View>
 </View>
 );
 };


 // ── Today's metrics ────────────────────────────────────────────────────────
 const MetricsCard = () => {
 const m = todayMetrics;
 if (!m) return null;
 const pairs = [
  m.steps != null ? { label: hl?.steps || 'Pasos', value: fmtNum(m.steps) } : null,
  m.activeCalories != null ? { label: hl?.activeCalories || 'Kcal activas', value: fmtNum(m.activeCalories) } : null,
 ].filter(Boolean);
 if (!pairs.length) return null;
 return (
  <View style={styles.metricsOuterCard}>
   <BText style={styles.metricsOuterTitle}>{hl?.metrics || 'Métricas de hoy'}</BText>
   <View style={{ flexDirection: 'row', gap: 2 }}>
    {pairs.map((p, i) => (
     <View key={i} style={styles.metricsInnerCard}>
      <BText style={styles.metricsInnerLabel}>{p.label}</BText>
      <BText style={[styles.metricsInnerValue, { fontSize: p.value.length > 5 ? 28 : p.value.length > 3 ? 36 : 48, lineHeight: p.value.length > 5 ? 30.8 : p.value.length > 3 ? 39.6 : 52.8 }]}>{p.value}</BText>
     </View>
    ))}
   </View>
  </View>
 );
 };

 // ── Sleep history (Calidad de sueño) ──────────────────────────────────────
 const SleepHistoryCard = () => {
 const data = sleepHistory?.length > 0 ? sleepHistory : (lastSleep ? [lastSleep] : []);
 if (!data.length) return null;
 const displayed = [...data].slice(-7); // oldest → newest
 const latest = displayed[displayed.length - 1];
 const maxDur = Math.max(...displayed.map(n => n.duration), 1);
 const BAR_MAX = 100;
 const labelBed = { es: 'Acostarse', en: 'Bedtime', fr: 'Coucher', it: 'Andare a letto' };
 const labelWake = { es: 'Interrupciones', en: 'Interruptions', fr: 'Réveils', it: 'Risvegli' };
 const labelDeep = { es: 'Profundo', en: 'Deep', fr: 'Profond', it: 'Profondo' };
 const t = (obj) => obj[lang] ?? obj.es;
 return (
  <View style={styles.sleepHistCard}>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <BedDouble size={16} color='#FECA04' />
    <BText style={styles.sectionLabel}>{hl?.sleepTitle || 'Calidad de sueño'}</BText>
   </View>
   {/* 7-day stacked bar chart */}
   <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: BAR_MAX + 20 }}>
    {displayed.map((n, i) => {
     const totalH = Math.max(8, Math.round((n.duration / maxDur) * BAR_MAX));
     const deepH = n.deepSleep > 0 ? Math.round((n.deepSleep / maxDur) * BAR_MAX) : 0;
     const remH = n.remSleep > 0 ? Math.round((n.remSleep / maxDur) * BAR_MAX) : 0;
     const isLatest = i === displayed.length - 1;
     const _d = new Date(n.date + 'T12:00:00'); const dayLabel = `${_d.getDate()}/${_d.getMonth() + 1}`;
     return (
      <View key={n.date} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: BAR_MAX + 20, gap: 4 }}>
       <View style={{ width: '100%', height: totalH, backgroundColor: isLatest ? '#FECA04' : '#FFF4CD', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' }}>
        {deepH > 0 && <View style={{ width: '100%', height: deepH, backgroundColor: isLatest ? '#FE6004' : '#FFDFCD' }} />}
        {remH > 0 && <View style={{ width: '100%', height: remH, backgroundColor: isLatest ? '#49CF38' : '#DBF5D7' }} />}
       </View>
       <BText style={{ fontSize: 12, fontFamily: F.body, color: '#737373', lineHeight: 15.6 }}>{dayLabel}</BText>
      </View>
     );
    })}
   </View>
   {/* Duration + data rows */}
   <View style={{ gap: 16 }}>
    <View>
     <BText style={{ fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 }}>{t({ es: 'Duración', en: 'Duration', fr: 'Durée', it: 'Durata' })}</BText>
     <BText style={{ fontSize: 48, fontFamily: F.heading, color: '#FECA04', lineHeight: 52.8 }}>{latest.duration} h</BText>
    </View>
    <View style={{ gap: 2 }}>
     {latest.bedtime && (
      <View style={styles.sleepHistRow}>
       <BText style={styles.sleepHistRowLabel}>{t(labelBed)}</BText>
       <View style={[styles.sleepHistChip, { backgroundColor: '#D4D4D4' }]}><BText style={styles.sleepHistChipTxt}>{fmtTime(latest.bedtime)}</BText></View>
      </View>
     )}
     {latest.interruptions != null && (
      <View style={styles.sleepHistRow}>
       <BText style={styles.sleepHistRowLabel}>{t(labelWake)}</BText>
       <View style={[styles.sleepHistChip, { backgroundColor: '#F69191' }]}><BText style={[styles.sleepHistChipTxt, { color: '#2B0D0D' }]}>{latest.interruptions}</BText></View>
      </View>
     )}
     {latest.deepSleep > 0 && (
      <View style={styles.sleepHistRow}>
       <BText style={styles.sleepHistRowLabel}>{t(labelDeep)}</BText>
       <View style={[styles.sleepHistChip, { backgroundColor: '#FEA068' }]}><BText style={[styles.sleepHistChipTxt, { color: '#6E2A02' }]}>{latest.deepSleep} {({ es: 'horas', en: 'hours', fr: 'heures', it: 'ore' }[lang] || 'horas')}</BText></View>
      </View>
     )}
     {latest.remSleep > 0 && (
      <View style={styles.sleepHistRow}>
       <BText style={styles.sleepHistRowLabel}>REM</BText>
       <View style={[styles.sleepHistChip, { backgroundColor: '#92E288' }]}><BText style={[styles.sleepHistChipTxt, { color: '#205A18' }]}>{latest.remSleep} {({ es: 'horas', en: 'hours', fr: 'heures', it: 'ore' }[lang] || 'horas')}</BText></View>
      </View>
     )}
    </View>
   </View>
  </View>
 );
 };

 return (
 <>
 <MetricsCard />
 <LastWorkoutCard />
 <SleepHistoryCard />
 </>
 );
}

// ─── Wearables card ───────────────────────────────────────────────────────────
function WearablesCard({ hd, hl, lang }) {
 const { isAvailable, isConnected, isLoading, lastSync, requestPermissions, syncData, disconnect } = hd;
 const syncTime = lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
 const devices = isConnected ? [
  { name: Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect', lastSync: syncTime },
 ] : [];
 return (
  <View style={styles.wearablesCard}>
   <BText style={styles.sectionLabel}>{hl?.title || 'Wearables'}</BText>
   {devices.length > 0 && (
    <View>
     {devices.map((d, i) => (
      <View key={d.name} style={[styles.wearablesRow, i < devices.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }]}>
       <BText style={styles.wearablesName}>{d.name}</BText>
       <BText style={styles.wearablesSync}>{d.lastSync}</BText>
       <View style={{ flexDirection: 'row', gap: 2 }}>
        <TouchableOpacity style={styles.wearablesBtn} onPress={syncData} disabled={isLoading}>
         <RefreshCcw size={16} color="#0A0A0A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.wearablesBtn} onPress={disconnect}>
         <X size={16} color="#0A0A0A" />
        </TouchableOpacity>
       </View>
      </View>
     ))}
    </View>
   )}
   <TouchableOpacity style={styles.wearablesAddBtn} onPress={!isConnected ? requestPermissions : undefined}>
    <BText style={styles.wearablesAddTxt}>
     {isLoading ? '...' : (isConnected ? (hl?.connectIos || 'Añadir dispositivo') : (hl?.connectIos || 'Añadir dispositivo'))}
    </BText>
   </TouchableOpacity>
  </View>
 );
}

// ─── Small UI components ──────────────────────────────────────────────────────
function MetricPill({ label, value, color = BLUE.primary }) {
 return (
 <View style={[styles.pill, { borderColor: color + '33', backgroundColor: color + '0D' }]}>
 <View>
 <BText style={[styles.pillLabel, { color }]}>{label}</BText>
 <BText style={[styles.pillValue, { color }]}>{value}</BText>
 </View>
 </View>
 );
}

function BigMetric({ label, value, color = BLUE.primary }) {
 return (
 <View style={styles.bigMetric}>
 <BText style={[styles.bigMetricValue, { color }]}>{value}</BText>
 <BText style={styles.bigMetricLabel}>{label}</BText>
 </View>
 );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: 'white' },
 content: { padding: 16, paddingTop: 58, paddingBottom: 120 },

 // tabs
 tabRow: { flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 20, padding: 4, marginBottom: 14 },
 tab: { flex: 1, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
 tabActive: { backgroundColor: 'white' },
 tabText: { fontSize: 16, color: 'white', fontFamily: F.body },
 tabTextActive: { color: '#0A0A0A', fontFamily: F.body },

 // weekly strip (mini calendar) — pestaña Hoy
 weekStripCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2, gap: 24 },
 weekNavAzote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 weekNavLabelAzote: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body,lineHeight: 20.8 },
 weekStripRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap'  },
 weekStripCell: { flex: 1, paddingVertical: 8, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', gap: 2 },
 weekStripLabel: { fontSize: 10, color: '#737373', fontFamily: F.body, textTransform: 'uppercase' },
 weekStripLabelToday: { color: 'rgba(255,255,255,0.7)' },
 weekStripCellToday: { backgroundColor: '#171717' },
 weekStripCellExpanded: { borderWidth: 2, borderColor: '#171717' },
 weekStripDay: { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
 weekStripDayToday: { color: 'white', fontFamily: F.bodyB },
 weekStripDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },

 progMiniCard: { borderRadius: 24, overflow: 'hidden', padding: 8 },
 progMiniBlur: { flex: 1, padding: 8, backgroundColor: 'rgba(255,255,255,0.30)', borderRadius: 16, justifyContent: 'flex-start', alignItems: 'flex-start' },
 progMiniLabel: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 progMiniName: { fontSize: 18, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 23.4 },
 weekDetailAzote: { marginTop: 12, backgroundColor: 'white', borderRadius: 16, padding: 12 },
 weekDetailWorkout: { fontSize: 14, color: '#0A0A0A', marginBottom: 8, fontFamily: F.heading },
 weekDetailStatus: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 weekActionBtn: { paddingVertical: 11, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center' },
 weekActionBtnTxt: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },

 // cards
 card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
 sectionTitle: { fontSize: 14, color: '#0A0A0A', marginBottom: 10, fontFamily: F.heading },

 // health banner (mini, on top of hoy)
 healthBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F5F5', borderRadius: 24, padding: 12, marginBottom: 2 },
 healthBannerIco: { fontSize: 28, fontFamily: F.body },
 healthBannerTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 healthBannerSub: { fontSize: 12, color: '#525252', marginTop: 2, fontFamily: F.body },

 // session
 sessionBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
 sessionTag: { fontSize: 10, fontFamily: F.bodyB, letterSpacing: 0.8, marginBottom: 4 },
 sessionName: { fontSize: 26, marginBottom: 4, fontFamily: F.headingX, lineHeight: 30 },
 fitnessNote: { fontSize: 12, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, marginTop: 8, lineHeight: 18, fontFamily: F.body },
 conditionNote: { fontSize: 12, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8, marginTop: 6, lineHeight: 18, fontFamily: F.body },
 sessionDur: { fontSize: 13, opacity: 0.8, fontFamily: F.body },
 statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexShrink: 0 },
 statusText: { fontSize: 12, fontFamily: F.bodyB },

 // circuit
 circuitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
 progressText: { fontSize: 12, color: '#0A0A0A', fontFamily: F.bodyB },
 warmupRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFEA9B', borderRadius: 16, padding: 10, marginBottom: 10 },
 warmupIco: { fontSize: 18, fontFamily: F.body },
 warmupLabel: { fontSize: 12, fontFamily: F.bodyB, color: '#261E01', marginBottom: 2 },
 warmupDetail: { fontSize: 12, color: '#261E01', fontFamily: F.body },
 exRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, backgroundColor: 'white', marginBottom: 6, gap: 10 },
 exRowDone: { backgroundColor: '#B6ECAF' },
 exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 exNumDone: { backgroundColor: '#171717' },
 exNumText: { fontSize: 12, fontFamily: F.bodyB, color: '#0A0A0A' },
 exName: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 exNameDone: { color: '#0B1F08', textDecorationLine: 'line-through' },
 exDetail: { fontSize: 11, color: '#737373', marginTop: 1, fontFamily: F.body },
 exReps: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A', flexShrink: 0 },
 restRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
 restIco: { fontSize: 16, fontFamily: F.body },
 restText: { fontSize: 13, color: '#737373', fontFamily: F.body },
 variationBtn: { marginTop: 10, padding: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#429FE7', alignItems: 'center' },
 variationBtnText: { color: '#429FE7', fontFamily: F.bodyB, fontSize: 13 },
 variationBox: { marginTop: 8, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12 },
 tipBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
 tipTitle: { fontSize: 12, fontFamily: F.bodyB, color: '#737373', marginBottom: 6 },
 tipText: { fontSize: 12, color: '#737373', lineHeight: 20, fontFamily: F.body },
 phaseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
 phaseNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 phaseNumText: { fontSize: 12, fontFamily: F.bodyB },
 phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
 phaseLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 phaseDur: { fontSize: 12, color: '#429FE7', fontFamily: F.bodyB },
 phaseDetail: { fontSize: 12, color: '#737373', lineHeight: 18, fontFamily: F.body },

 // log buttons
 quickActions: { flexDirection: 'row', gap: 2, marginBottom: 2 },
 quickBtn: { flex: 1, padding: 12, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center' },
 quickBtnTxt: { fontSize: 22, marginBottom: 2, fontFamily: F.body },
 quickBtnLbl: { fontSize: 11, color: '#0A0A0A', fontFamily: F.body },

 logBtns: { flexDirection: 'row', gap: 2, marginBottom: 2 },
 doneBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center' },
 doneBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 14 },
 skipBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
 skipBtnText: { color: '#0A0A0A', fontFamily: F.bodyB, fontSize: 14 },
 undoBtn: { padding: 10, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', marginBottom: 2 },
 undoBtnText: { fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#B6ECAF', borderRadius: 16 },
 extraText: { fontSize: 13, color: '#0B1F08', fontFamily: F.body },
 extraRemove: { color: '#0B1F08', fontSize: 18, fontFamily: F.body },
 extraInput: { flexDirection: 'row', gap: 8 },
 input: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: '#FAFAFA', fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 addBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#171717', justifyContent: 'center' },
 addBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 13 },
 dashedBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: 'white' },
 dashedBtnText: { fontSize: 13, color: '#525252', fontFamily: F.body },
 extraSportCard: { backgroundColor: '#429FE7', borderRadius: 24, padding: 16, gap: 24, marginBottom: 2 },
 extraSportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
 extraSportHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#0A1823', lineHeight: 15.6 },
 extraSportTitle: { fontSize: 32, fontFamily: F.heading, color: '#0A1823', lineHeight: 35.2 },
 extraSportSub: { fontSize: 14, fontFamily: F.body, color: '#0A1823', lineHeight: 19.6 },
 extraSportBtn: { height: 48, backgroundColor: '#0A0A0A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
 extraSportBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA', lineHeight: 24 },
 restTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 8 },
 restSub: { fontSize: 13, color: '#525252', lineHeight: 20, textAlign: 'center', fontFamily: F.body },

 // week navigation
 weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
 weekNavBtn: { padding: 8 },
 weekNavArrow: { fontSize: 28, color: BLUE.primary, fontFamily: F.bodyB, lineHeight: 32 },
 weekNavLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },

 // week
 weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
 weekDate: { width: 60, alignItems: 'center', flexShrink: 0 },
 weekDayLabel: { fontSize: 10, color: '#737373', fontFamily: F.body },
 weekDayNum: { fontSize: 18, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 22 },
 weekWorkout: { fontSize: 13, fontFamily: F.body },
 weekDur: { fontSize: 11, color: '#737373', fontFamily: F.body },
 weekExtra: { fontSize: 11, color: '#429FE7', marginTop: 1, fontFamily: F.body },
 progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(26,86,219,0.08)' },
 progLabel: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 progDetail: { fontSize: 12, color: '#737373', marginTop: 1, fontFamily: F.body },

 // Calendar — Figma Hoy tab
 calCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2, gap: 24 },
 calMonthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 calMonthLabel: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8 },
 calHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
 calHeaderCell: { flex: 1, padding: 4, alignItems: 'center' },
 calHeaderTxt: { fontSize: 10, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', lineHeight: 13, textAlign: 'center' },
 calDaysRow: { flexDirection: 'row', gap: 4 },
 calDayCell: { flex: 1, height: 43, backgroundColor: 'white', borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
 calDayCellSelected: { borderWidth: 1, borderColor: '#0A0A0A' },
 calDayNum: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 calDayGlow: { position: 'absolute', width: 44, height: 44, left: -1, top: 21, borderRadius: 22, opacity: 0.7 },
 calDayDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },

 // Session card — Figma Hoy tab
 sessionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 sessionNameBlue: { fontSize: 32, fontFamily: F.headingX, color: '#429FE7', lineHeight: 36, letterSpacing: -0.64 },
 sessionDurSmall: { fontSize: 14, fontFamily: F.body, color: '#525252' },
 realizadosLbl: { fontSize: 14, fontFamily: F.body, color: '#260E01' },
 realizadosCount: { fontSize: 12, fontFamily: F.body, color: '#260E01' },
realizadosTrack: { height: 6, borderRadius: 3, backgroundColor: '#E5E5E5', flexDirection: 'row', overflow: 'hidden' },
realizadosFill:  { backgroundColor: '#429FE7', borderRadius: 3 },
 todoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
 todoDoneBox: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 todoPendingBox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#D4D4D4', backgroundColor: 'white' },
 todoItemName: { flex: 1, fontSize: 16, fontFamily: F.body, color: '#0A0A0A' },
 todoItemDoneText: { color: '#737373', textDecorationLine: 'line-through' },
 todoItemReps: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A' },
 sessionActions: { flexDirection: 'row', gap: 2, marginBottom: 2 },
 sessionActionBtn: { flex: 1, height: 52, backgroundColor: '#F5F5F5', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

 // Tu plan de ejercicios — Figma blue card #8EC5F1
 planExercCard: { backgroundColor: '#8EC5F1', borderRadius: 24, padding: 16, marginBottom: 2, gap: 12 },
 planExercHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 planExercHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#0A1823' },
 planExercTitle: { fontSize: 20, fontFamily: F.heading, color: '#0A1823', lineHeight: 24 },
 planExercDesc: { fontSize: 13, fontFamily: F.body, color: '#3A5166', lineHeight: 18 },
 planExercTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#B3D9F5' },
 planExercTagTxt: { fontSize: 13, fontFamily: F.body, color: '#0A1823' },
 planExercDesc: { fontSize: 13, color: '#0A1823', lineHeight: 18, fontFamily: F.body },
 planExercDays: { gap: 2 },
 planExercRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#B3D9F5', borderRadius: 16, padding: 12 },
 planExercAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#8EC5F1', alignItems: 'center', justifyContent: 'center' },
 planExercAvatarTxt: { fontSize: 24, fontFamily: F.headingX, color: '#0A1823' },
 planExercLabel: { fontSize: 18, fontFamily: F.headingX, color: '#0A1823' },
 planExercDetail: { fontSize: 14, color: '#296390', marginTop: 1, fontFamily: F.body },
 planExercEditBtn: { backgroundColor: '#0A1823', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 planExercEditTxt: { fontSize: 18, fontFamily: F.body, color: '#ECF5FD' },

 // Añadir deporte extra — Figma blue card
 addExtraCard: { backgroundColor: '#429FE7', borderRadius: 24, padding: 16, marginBottom: 2, gap: 12 },
 addExtraTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 addExtraLabel: { fontSize: 12, fontFamily: F.body, color: '#0A1823' },
 addExtraTitle: { fontSize: 32, fontFamily: F.headingX, color: '#0A0A0A', lineHeight: 36, letterSpacing: -0.64 },
 addExtraBtn: { backgroundColor: '#0A0A0A', borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
 addExtraBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },
addExtraSub: { fontSize: 13, fontFamily: F.body, color: '#0A1823', lineHeight: 17, opacity: 0.7 },

 // Favoritos tab
 favCard: { backgroundColor: 'white', borderRadius: 18, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
 favCardContent: { padding: 14, gap: 10 },
 favCardTop: { gap: 4 },
 favCardTitle: { fontSize: 15, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 20 },
 favTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#EFF6FF' },
 favTagTxt: { fontSize: 11, fontFamily: F.bodyB, color: '#2563EB' },
 favActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
 favHeartBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

 // Consejos header card
 consejosCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 8 },
 consejosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 consejosTitle: { fontSize: 20, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 24 },
 weekDetail: { marginTop: -4, marginBottom: 6, backgroundColor: '#F8FBFF', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#429FE7', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 12, gap: 6 },
 weekExRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#EFF6FF' },
 weekExNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 weekExNumText: { fontSize: 11, fontFamily: F.bodyB, color: '#429FE7' },
 weekExName: { flex: 1, fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 weekExReps: { fontSize: 12, fontFamily: F.bodyB, color: '#429FE7' },

 // health tab — connection
 connectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#49CF38', flexShrink: 0 },
 connectedLabel: { fontSize: 12, color: '#0B1F08', fontFamily: F.bodyB, marginTop: 2 },
 lastSyncText: { fontSize: 11, color: '#737373', marginTop: 2, fontFamily: F.body },
 syncBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: 'white' },
 syncBtnText: { fontSize: 12, color: '#0A0A0A', fontFamily: F.bodyB },
 disconnectText: { fontSize: 11, color: '#737373', textDecorationLine: 'underline', fontFamily: F.body },
 connectBtn: { backgroundColor: '#171717', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 connectBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 14 },

 sectionLabel: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A' },

 // health tab — last workout
 dateChip: { fontSize: 11, color: '#0A0A0A', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', fontFamily: F.body },
 workoutHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
 workoutName: { fontSize: 48, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 52.8, flexShrink: 1 },
 workoutTime: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body, lineHeight: 19.6 },
 metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'white', borderWidth: 0 },
 pillLabel: { fontSize: 9, fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.4 },
 pillValue: { fontSize: 13, fontFamily: F.bodyB },

 // health tab — metrics Figma (two white cards side by side)
 metricsOuterCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 metricsOuterTitle: { fontSize: 12, fontFamily: F.body, color: '#0A1823', lineHeight: 15.6 },
 metricsInnerCard: { flex: 1, backgroundColor: 'white', borderRadius: 24, padding: 16, gap: 24 },
 metricsInnerLabel: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 metricsInnerValue: { fontSize: 48, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 52.8 },

 // health tab — recent workouts
 recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'white' },
 recentName: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 recentDate: { fontSize: 11, color: '#737373', marginTop: 2, fontFamily: F.body },
 recentDur: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 recentCal: { fontSize: 11, color: '#FE6004', marginTop: 2, fontFamily: F.body },

 // health tab — metrics grid (legacy)
 metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 bigMetric: { flex: 1, minWidth: '40%', backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center' },
 bigMetricValue: { fontSize: 20, fontFamily: F.bodyB, marginBottom: 2 },
 bigMetricLabel: { fontSize: 11, color: '#737373', fontFamily: F.body },

 // health tab — sleep history (Calidad de sueño)
 sleepHistCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 sleepHistRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 sleepHistRowLabel: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 },
 sleepHistChip: { paddingHorizontal: 8, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
 sleepHistChipTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 12 },

 // legacy sleep fields
 sleepHours: { fontSize: 42, fontFamily: F.bodyB, color: '#171717' },
 sleepUnit: { fontSize: 20, color: '#171717', fontFamily: F.bodyB },
 sleepDate: { fontSize: 12, color: '#737373', fontFamily: F.body },

 // Gym empty state fullscreen
 gymEmptyScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
 gymEmptyGlassCard: { borderRadius: 24, padding: 24, overflow: 'hidden', width: '100%', gap: 24, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
 gymEmptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#429FE7', alignItems: 'center', justifyContent: 'center' },
 gymEmptyTitleTxt: { fontSize: 24, fontFamily: F.headingX, color: 'white', textAlign: 'center' },
 gymEmptySubTxt: { fontSize: 16, fontFamily: F.body, color: 'white', textAlign: 'center', lineHeight: 22 },
 gymEmptyCtaBtn: { width: '100%', backgroundColor: '#171717', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 gymEmptyCtaBtnTxt: { fontSize: 18, fontFamily: F.body, color: 'white' },

 // wearables Figma
 wearablesCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 wearablesRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 8 },
 wearablesName: { flex: 1, fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 20.8 },
 wearablesSync: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8 },
 wearablesBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
 wearablesAddBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 wearablesAddTxt: { fontSize: 18, fontFamily: F.body, color: 'white', lineHeight: 24 },
});
const ge = StyleSheet.create({
 wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
 card: { borderRadius: 24, padding: 16, gap: 32, overflow: 'hidden', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.20)' },
 iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#429FE7', alignItems: 'center', justifyContent: 'center' },
 iconInner: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0A1823' },
 title: { fontSize: 24, fontFamily: F.heading, color: 'white', textAlign: 'center', lineHeight: 28.8 },
 sub: { fontSize: 16, fontFamily: F.body, color: 'white', textAlign: 'center', lineHeight: 20.8 },
 btn: { alignSelf: 'stretch', height: 48, backgroundColor: '#171717', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
 btnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA', lineHeight: 24 },
});


