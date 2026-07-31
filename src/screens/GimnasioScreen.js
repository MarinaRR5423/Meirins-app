import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, ImageBackground, Modal, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { F } from '../theme/fonts';
import { Check, X, ChevronRight, ChevronLeft, SportShoe, Pencil, RefreshCcw, Plus, Heart, BookOpen, Moon } from 'lucide-react-native';
import { TouchableOpacity as GHTouchable } from 'react-native-gesture-handler';
import T, { getDayLabels } from '../i18n/translations';
import { GymSetupCard, SPORTS_LIST } from '../components/TabSetupCard';
import ProgramsCard from '../components/ProgramsCard';
import { getActiveProgramState, getProgramDays, programSessionToCard } from '../data/trainingPrograms';
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
import { trackScreen, trackEvent, Events } from '../lib/analytics';
import BText from '../components/BText';

const GYM_ARTICLE_IDS = ['cycle-training', 'pcos-hormones'];
const gymArticles = ARTICLES.filter(a => GYM_ARTICLE_IDS.includes(a.id));

const PHASE_IMAGES = {
 menstrual:  require('../../assets/phases/menstrual.png'),
 follicular: require('../../assets/phases/follicular.png'),
 ovulation:  require('../../assets/phases/ovulation.png'),
 luteal:     require('../../assets/phases/luteal.png'),
};

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
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
// ─── Panel “Añadir actividad” — diseño Figma ────────────────
function ExtraSportPicker({ lang, g, onPick, onClose }) {
 const [other, setOther] = useState(false);
 const [txt, setTxt] = useState('');
 const [sport, setSport] = useState(null);
 const [durationH, setDurationH] = useState(0.5);
 const [intensity, setIntensity] = useState('media');
 const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

 const INTENSITIES = [
 { id: 'baja', label: tr('Baja', 'Low', 'Faible', 'Bassa') },
 { id: 'media', label: tr('Media', 'Medium', 'Moyenne', 'Media') },
 { id: 'alta', label: tr('Alta', 'High', 'Haute', 'Alta') },
 ];

 const handleAdd = () => {
 if (!sport) return;
 onPick(sport, Math.round(durationH * 60), intensity);
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

 {/* Tiempo */}
 <View style={{ gap: 12 }}>
 <BText style={sp.sectionLabel}>{tr('Tiempo', 'Time', 'Temps', 'Tempo')}</BText>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
 <TouchableOpacity onPress={() => setDurationH(h => Math.max(0.5, h - 0.5))} style={sp.stepBtn}>
 <BText style={sp.stepBtnTxt}>−</BText>
 </TouchableOpacity>
 <View style={sp.stepValue}>
 <BText style={sp.stepValueTxt}>{durationH} h</BText>
 </View>
 <TouchableOpacity onPress={() => setDurationH(h => Math.min(8, h + 0.5))} style={sp.stepBtn}>
 <BText style={sp.stepBtnTxt}>+</BText>
 </TouchableOpacity>
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
 stepBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 stepBtnTxt: { fontSize: 22, color: 'white', fontFamily: F.bodyB, lineHeight: 26 },
 stepValue: { flex: 1, height: 48, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
 stepValueTxt: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A' },
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
 const progState = getActiveProgramState(profileExtended);
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
 if (done + 1 >= total) {
 const completed = profileExtended?.completedPrograms || [];
 await saveProfileExtended?.({
 activeProgram: null,
 completedPrograms: [...completed.filter(id => id !== program.id), program.id],
 });
 } else {
 await saveProfileExtended?.({ activeProgram: { ...active, done: done + 1 } });
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
 const card = programSessionToCard(progState, lang, progState.done + progOffset);
 if (card) { session = card; progOffset += 1; }
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
 dotColor = '#CBD5E1'; // gris — día de descanso
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
 <SwipeableTabs tabs={['hoy', 'salud']} current={sub} onChange={setSub}>
 <ScrollView style={styles.container} contentContainerStyle={styles.content}>

 <GymSetupCard lang={lang} trainDays={trainDays} setTrainDays={setTrainDays}
 profileExtended={profileExtended} saveProfileExtended={saveProfileExtended || (() => {})} />

 {/* ── Tab bar ── */}
 <View style={styles.tabRow}>
 {[
 { id: 'hoy', l: g.today },
 { id: 'salud', l: g.salud },
 ].map(t => (
 <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
 style={[styles.tab, sub === t.id && styles.tabActive]}>
 <BText style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</BText>
 </TouchableOpacity>
 ))}
 </View>

 {/* ════════ Calendario + mini programa (hoy y salud) ════════ */}
 <View style={styles.calCard}>
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
    {offsetDays.map((day, i) => {
     const isExpanded = weekAction?.dateKey === day.dateKey;
     return (
      <TouchableOpacity key={i}
       onPress={() => setWeekAction(isExpanded ? null : { dateKey: day.dateKey, step: 'main' })}
       style={[styles.calDayCell, day.isToday && styles.calDayCellToday, isExpanded && styles.calDayCellSelected]}>
       <BText style={[styles.calDayNum, day.isToday && styles.calDayNumToday]}>{day.dayNum}</BText>
       {day.dotColor && <View style={[styles.calDayGlow, { backgroundColor: day.dotColor }]} />}
      </TouchableOpacity>
     );
    })}
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
 ? ` ${lang === 'en' ? 'Logged' : 'Registrado'}${logEntry.extraSport ? ` · ${logEntry.extraSport}` : ''}`
 : `${lang === 'en' ? 'Rest' : 'Descanso'}`}
 </BText>
 <GHTouchable onPress={async () => { await clearActivityDay(day.dateKey); setWeekAction(null); }}>
 <BText style={{ fontSize: 12, color: '#737373' }}>{lang === 'en' ? 'Clear' : 'Borrar'}</BText>
 </GHTouchable>
 </View>
 )}
 <View style={{ gap: 2 }}>
 {s && (
 <GHTouchable
 onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'done' }); setWeekAction(null); }}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{lang === 'en' ? 'I did it' : 'Lo hice'}</BText>
 </GHTouchable>
 )}
 <GHTouchable
 onPress={() => setWeekAction(prev => ({ ...prev, step: 'sport' }))}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{lang === 'en' ? 'Add sport' : 'Añadir deporte'}</BText>
 </GHTouchable>
 <GHTouchable
 onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'skipped' }); setWeekAction(null); }}
 style={styles.weekActionBtn}>
 <BText style={styles.weekActionBtnTxt}>{lang === 'en' ? 'Rest day' : 'Descansé'}</BText>
 </GHTouchable>
 </View>
 </View>
 )}
 {weekAction.step === 'sport' && (
 <View>
 <GHTouchable onPress={() => setWeekAction(prev => ({ ...prev, step: 'main' }))} style={{ marginBottom: 8 }}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
 <ChevronLeft size={14} color="#737373" />
 <BText style={{ fontSize: 12, color: '#737373' }}>{lang === 'en' ? 'Back' : 'Volver'}</BText>
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
 </View>

 {progState && (
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
     <BText style={styles.realizadosLbl}>Realizados</BText>
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
   <BText style={styles.addExtraLabel}>Registro</BText>
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
 <View style={styles.card}>
 <BText style={styles.sectionTitle}>{g.restRecord}</BText>
 {todayLog?.extraSport ? (
 <View style={[styles.extraRow, { backgroundColor: BLUE.light }]}>
 <BText style={[styles.extraText, { color: '#1E40AF' }]}>{todayLog.extraSport}{todayLog.extraMinutes ? ` · ${todayLog.extraMinutes} min` : ''}</BText>
 <TouchableOpacity onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
 <BText style={styles.extraRemove}>×</BText>
 </TouchableOpacity>
 </View>
 ) : addingSport ? (
 <ExtraSportPicker lang={lang} g={g}
 onPick={(label, minutes) => {
 saveLog({ status: 'extra', extraSport: label, extraMinutes: minutes || null });
 setAddingSport(false);
 }} onClose={() => setAddingSport(false)} />
 ) : (
 <TouchableOpacity style={styles.dashedBtn} onPress={() => setAddingSport(true)}>
 <BText style={styles.dashedBtnText}>{g.addSpontaneous}</BText>
 </TouchableOpacity>
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
  <BText style={styles.planExercTitle}>{progState.program?.name?.[lang] || progState.program?.name?.es || progState.program?.id || ''}</BText>
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
 {g.programRows.map((row, i) => {
 const letter = i === 0 ? 'A' : i === 1 ? 'B' : 'C';
 return (
 <View key={i} style={styles.planExercRow}>
 <View style={styles.planExercAvatar}>
 <BText style={styles.planExercAvatarTxt}>{letter}</BText>
 </View>
 <View style={{ flex: 1 }}>
 <BText style={styles.planExercLabel}>{row.label}</BText>
 <BText style={styles.planExercDetail}>{row.detail}</BText>
 </View>
 </View>
 );
 })}
 </View>
 <TouchableOpacity style={styles.planExercEditBtn}>
 <BText style={styles.planExercEditTxt}>
 {lang === 'en' ? 'Edit plan' : lang === 'fr' ? 'Modifier le plan' : 'Editar plan'}
 </BText>
 </TouchableOpacity>
 </View>

 {/* Consejos — gray card header + TipsCard */}
 <View style={styles.consejosCard}>
  <View style={styles.consejosHeader}>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <BookOpen size={16} color="#0A0A0A" />
    <BText style={styles.sectionLabel}>Consejos</BText>
   </View>
   <ChevronRight size={16} color="#737373" />
  </View>
  <BText style={styles.consejosTitle}>Tips y consejos</BText>
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
 {/* Consejos */}
 <View style={styles.consejosCard}>
  <View style={styles.consejosHeader}>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <BookOpen size={16} color="#0A0A0A" />
    <BText style={styles.sectionLabel}>Consejos</BText>
   </View>
   <ChevronRight size={16} color="#737373" />
  </View>
  <BText style={styles.consejosTitle}>Tips y consejos</BText>
 </View>
 <TipsCard articles={gymArticles} lang={lang} variant="azote" />
 </>
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
 <BText style={{ fontSize: 12, fontFamily: F.bodyB, color: '#475569', marginBottom: 8 }}>
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
 <BText style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
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
 <BText style={styles.workoutName}>{resolvedLabel(w)}</BText>
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
 {(isIdentifying || isEditingDur) ? <X size={18} color="#64748B" /> : <Pencil size={16} color="#737373" />}
 </TouchableOpacity>
 </View>

 {isIdentifying && <SportIdentifyPicker workoutId={w.id} />}

 {isEditingDur && (
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 10 }}>
 <TextInput
 style={{ flex: 1, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, color: '#1E293B', backgroundColor: 'white' }}
 keyboardType="number-pad"
 placeholder={{ es: 'Minutos', en: 'Minutes', fr: 'Minutes', it: 'Minuti' }[lang] || 'Minutos'}
 value={durationInput}
 onChangeText={setDurationInput}
 maxLength={3}
 autoFocus
 />
 <BText style={{ fontSize: 13, color: '#64748B' }}>{hl?.min}</BText>
 <TouchableOpacity onPress={() => saveDurationOverride(w.id)}
 style={{ backgroundColor: BLUE.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 }}>
 <Check size={16} color="white" />
 </TouchableOpacity>
 <TouchableOpacity onPress={() => setEditingDurationId(null)}>
 <X size={16} color="#94A3B8" />
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
      <BText style={styles.metricsInnerValue}>{p.value}</BText>
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
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <Moon size={14} color='#FECA04' />
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
      <View key={n.date} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: BAR_MAX + 20, gap: 3 }}>
       <View style={{ width: '100%', height: totalH, backgroundColor: isLatest ? '#FECA04' : '#FFF4CD', borderTopLeftRadius: 6, borderTopRightRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' }}>
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
     <BText style={{ fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 }}>Duración</BText>
     <BText style={{ fontSize: 48, fontFamily: F.heading, color: '#FECA04', lineHeight: 52.8 }}>{latest.duration} h</BText>
    </View>
    <View style={{ gap: 4 }}>
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
       <View style={[styles.sleepHistChip, { backgroundColor: '#FEA068' }]}><BText style={[styles.sleepHistChipTxt, { color: '#6E2A02' }]}>{latest.deepSleep} {lang === 'en' ? 'hours' : lang === 'fr' ? 'heures' : 'horas'}</BText></View>
      </View>
     )}
     {latest.remSleep > 0 && (
      <View style={styles.sleepHistRow}>
       <BText style={styles.sleepHistRowLabel}>REM</BText>
       <View style={[styles.sleepHistChip, { backgroundColor: '#92E288' }]}><BText style={[styles.sleepHistChipTxt, { color: '#205A18' }]}>{latest.remSleep} {lang === 'en' ? 'hours' : lang === 'fr' ? 'heures' : 'horas'}</BText></View>
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
 weekStripCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2 },
 weekNavAzote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
 weekNavLabelAzote: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 weekStripRow: { flexDirection: 'row', gap: 4 },
 weekStripCell: { flex: 1, paddingVertical: 8, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', gap: 2 },
 weekStripLabel: { fontSize: 9, color: '#737373', fontFamily: F.body, textTransform: 'uppercase' },
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
 restText: { fontSize: 13, color: '#64748B', fontFamily: F.body },
 variationBtn: { marginTop: 10, padding: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#1A56DB', alignItems: 'center' },
 variationBtnText: { color: '#1A56DB', fontFamily: F.bodyB, fontSize: 13 },
 variationBox: { marginTop: 8, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12 },
 tipBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
 tipTitle: { fontSize: 12, fontFamily: F.bodyB, color: '#475569', marginBottom: 6 },
 tipText: { fontSize: 12, color: '#64748B', lineHeight: 20, fontFamily: F.body },
 phaseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
 phaseNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 phaseNumText: { fontSize: 12, fontFamily: F.bodyB },
 phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
 phaseLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#1E293B' },
 phaseDur: { fontSize: 12, color: '#1A56DB', fontFamily: F.bodyB },
 phaseDetail: { fontSize: 12, color: '#64748B', lineHeight: 18, fontFamily: F.body },

 // log buttons
 quickActions: { flexDirection: 'row', gap: 2, marginBottom: 2 },
 quickBtn: { flex: 1, padding: 12, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center' },
 quickBtnTxt: { fontSize: 22, marginBottom: 2, fontFamily: F.body },
 quickBtnLbl: { fontSize: 11, color: '#0A0A0A', fontWeight: '500', fontFamily: F.body },

 logBtns: { flexDirection: 'row', gap: 2, marginBottom: 2 },
 doneBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center' },
 doneBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 14 },
 skipBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
 skipBtnText: { color: '#0A0A0A', fontFamily: F.bodyB, fontSize: 14 },
 undoBtn: { padding: 10, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', marginBottom: 2 },
 undoBtnText: { fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#B6ECAF', borderRadius: 16 },
 extraText: { fontSize: 13, color: '#0B1F08', fontWeight: '500', fontFamily: F.body },
 extraRemove: { color: '#0B1F08', fontSize: 18, fontFamily: F.body },
 extraInput: { flexDirection: 'row', gap: 8 },
 input: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: '#FAFAFA', fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 addBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#171717', justifyContent: 'center' },
 addBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 13 },
 dashedBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: 'white' },
 dashedBtnText: { fontSize: 13, color: '#525252', fontFamily: F.body },
 restTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 8 },
 restSub: { fontSize: 13, color: '#525252', lineHeight: 20, textAlign: 'center', fontFamily: F.body },

 // week navigation
 weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
 weekNavBtn: { padding: 8 },
 weekNavArrow: { fontSize: 28, color: BLUE.primary, fontFamily: F.bodyB, lineHeight: 32 },
 weekNavLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#1E293B' },

 // week
 weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
 weekDate: { width: 60, alignItems: 'center', flexShrink: 0 },
 weekDayLabel: { fontSize: 10, color: '#94A3B8', fontFamily: F.body },
 weekDayNum: { fontSize: 18, fontFamily: F.bodyB, color: '#1E293B', lineHeight: 22 },
 weekWorkout: { fontSize: 13, fontFamily: F.body },
 weekDur: { fontSize: 11, color: '#94A3B8', fontFamily: F.body },
 weekExtra: { fontSize: 11, color: '#1A56DB', marginTop: 1, fontFamily: F.body },
 progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(26,86,219,0.08)' },
 progLabel: { fontSize: 13, fontFamily: F.bodyB, color: '#1E293B' },
 progDetail: { fontSize: 12, color: '#475569', marginTop: 1, fontFamily: F.body },

 // Calendar — Figma Hoy tab
 calCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2, gap: 24 },
 calMonthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
 calMonthLabel: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8 },
 calHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
 calHeaderCell: { flex: 1, padding: 4, alignItems: 'center' },
 calHeaderTxt: { fontSize: 10, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', lineHeight: 13 },
 calDaysRow: { flexDirection: 'row', gap: 4 },
 calDayCell: { flex: 1, height: 43, backgroundColor: 'white', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
 calDayCellToday: { borderWidth: 1, borderColor: '#0A0A0A' },
 calDayCellSelected: { borderWidth: 2, borderColor: '#0A0A0A' },
 calDayNum: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 calDayNumToday: {},
 calDayGlow: { position: 'absolute', bottom: 0, left: -1, right: -1, height: 22, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, opacity: 0.55 },

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
 planExercCard: { backgroundColor: '#8EC5F1', borderRadius: 24, padding: 16, marginBottom: 2, gap: 40 },
 planExercHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 planExercHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#0A1823' },
 planExercTitle: { fontSize: 20, fontFamily: F.heading, color: '#0A1823', lineHeight: 24 },
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

 // Consejos header card
 consejosCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 8 },
 consejosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 consejosTitle: { fontSize: 20, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 24 },
 weekDetail: { marginTop: -4, marginBottom: 6, backgroundColor: '#F8FBFF', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#1A56DB', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 12, gap: 6 },
 weekExRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#EFF6FF' },
 weekExNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 weekExNumText: { fontSize: 11, fontFamily: F.bodyB, color: '#1A56DB' },
 weekExName: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500', fontFamily: F.body },
 weekExReps: { fontSize: 12, fontFamily: F.bodyB, color: '#1A56DB' },

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
 workoutName: { fontSize: 48, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 52.8 },
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
 bigMetricLabel: { fontSize: 11, color: '#737373', fontWeight: '500', fontFamily: F.body },

 // health tab — sleep history (Calidad de sueño)
 sleepHistCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 sleepHistRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
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
