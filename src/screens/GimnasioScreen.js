import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { Check, X, ChevronRight, ChevronLeft } from 'lucide-react-native';
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
import { useWorkouts } from '../hooks/useWorkouts';
import { buildPersonalizedWeekPlan } from '../utils/workoutEngine';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import SwipeableTabs from '../components/SwipeableTabs';
import { trackScreen, trackEvent, Events } from '../lib/analytics';

const GYM_ARTICLE_IDS = ['cycle-training', 'pcos-hormones'];
const gymArticles = ARTICLES.filter(a => GYM_ARTICLE_IDS.includes(a.id));

const BLUE  = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
const GREEN = { bg: '#F0FDF4', border: '#86EFAC', text: '#16A34A' };
const RED   = { bg: '#FEF2F2', text: '#DC2626' };

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
// ─── Selector de deporte extra: lista de deportes + "Otro" + duración ────────
function ExtraSportPicker({ lang, g, onPick }) {
  const [other, setOther] = useState(false);
  const [txt, setTxt]     = useState('');
  const [sport, setSport] = useState(null);   // deporte elegido, pendiente de duración
  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);
  const DURATIONS = [15, 30, 45, 60, 90, 120];

  // Paso 2: ¿cuánto tiempo?
  if (sport) return (
    <View>
      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600', marginBottom: 8 }}>
        🏅 {sport} — {tr('¿cuánto tiempo?', 'how long?', 'combien de temps ?', 'quanto tempo?')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DURATIONS.map(m => (
          <TouchableOpacity key={m} onPress={() => onPick(sport, m)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>{m} min</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => onPick(sport, null)}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#64748B' }}>
            {tr('Sin tiempo', 'Skip time', 'Sans durée', 'Senza tempo')}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setSport(null)} style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
          {tr('Cambiar deporte', 'Change sport', 'Changer de sport', 'Cambia sport')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Paso 1: ¿qué deporte?
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SPORTS_LIST.map(o => (
          <TouchableOpacity key={o.id}
            onPress={() => o.id === 'other' ? setOther(!other) : setSport(o.label[lang] || o.label.es)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50,
              backgroundColor: (o.id === 'other' && other) ? BLUE.primary : '#F1F5F9',
              borderWidth: 1, borderColor: (o.id === 'other' && other) ? BLUE.primary : '#E2E8F0',
            }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: (o.id === 'other' && other) ? 'white' : '#334155' }}>
              {o.emoji} {o.label[lang] || o.label.es}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {other && (
        <View style={[styles.extraInput, { marginTop: 10 }]}>
          <TextInput style={styles.input} value={txt} onChangeText={setTxt}
            placeholder={g.extraPlaceholder} autoFocus />
          <TouchableOpacity style={styles.addBtn} onPress={() => txt.trim() && setSport(txt.trim())}>
            <Text style={styles.addBtnText}>{g.add}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function GimnasioScreen({
  pi, trainDays, setTrainDays, program, lang = 'es', goal,
  healthData, profileExtended, saveProfileExtended,
  toggleFavoriteWorkout, skipWorkout, logWorkoutDone,
  sleepLog = [], logSleep,
}) {
  useEffect(() => { trackScreen('Gimnasio', { phase: pi?.phase }); }, []);
  const [sub, setSub] = useState('hoy');
  const [addingSport, setAddingSport] = useState(false);
  const [workoutLog, setWorkoutLog] = useState({});
  const [completedExercises, setCompletedExercises] = useState({});
  const [showVariations, setShowVariations] = useState(false);
  const [weekAction, setWeekAction] = useState(null); // { dateKey, step:'main'|'sport' }
  const [weekOffset, setWeekOffset] = useState(0);  // 0 = semana actual, -1 = semana anterior, etc.

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
  const sessionRenfo   = resolveSession(program?.sessionRenfo,   lang, SESSION_RENFO_STATIC);

  const g  = (T[lang] || T.es).gym;
  const cm = (T[lang] || T.es).common;
  const hl = g.health;

  const DAY_LABELS_I18N = getDayLabels(lang);
  const todayJS         = new Date();
  const todayKey        = todayJS.toISOString().split('T')[0];
  const todayDow        = todayJS.getDay();

  // ── Plan personalizado (fase + trainDays + fitness + condiciones) ────────────
  const fitnessLevel = profileExtended?.fitnessLevel || 'regular';
  const conditions   = profileExtended?.conditions   || [];
  const gymAccess    = profileExtended?.gymAccess    || 'home';
  const lifeStage    = profileExtended?.lifeStage    || null;
  const primaryGoals = profileExtended?.primaryGoals || [];

  // Carga workouts de Supabase
  const { workouts: dbWorkouts } = useWorkouts();

  // Skipped workouts de hoy
  const todayStrW   = todayKey;
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
  //    entreno (N = sesiones/semana del programa); el motor rellena el resto ──
  const progState  = getActiveProgramState(profileExtended);
  const progDays   = progState ? getProgramDays(progState.program, trainDays) : [];
  const todayIsProgramDay = !!progState && (progDays.includes(todayDow) || (trainDays?.length ?? 0) === 0);

  const todaySession = todayIsProgramDay
    ? programSessionToCard(progState, lang)
    : (personalPlan[todayDow] ?? null);   // null = día de descanso
  const todayLog     = workoutLog[todayKey];
  const phaseConfig  = PHASE_CONFIG[pi?.phase] || PHASE_CONFIG.follicular;

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

  const completedCount  = Object.values(completedExercises).filter(Boolean).length;
  const totalExercises  = sessionRenfo?.exercises?.length || 0;

  let progOffset = 0;   // numera las sesiones del programa a lo largo de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date    = new Date(); date.setDate(date.getDate() + i);
    const dow     = date.getDay();
    const dateKey = date.toISOString().split('T')[0];
    let session = personalPlan[dow] ?? null;
    if (progState && progDays.includes(dow)) {
      const card = programSessionToCard(progState, lang, progState.done + progOffset);
      if (card) { session = card; progOffset += 1; }
    }
    const sType   = session ? 'workout' : 'rest';
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
  const offsetDays  = Array.from({ length: 7 }, (_, i) => {
    const date    = new Date(thisMonday);
    date.setDate(thisMonday.getDate() + i);
    const dow     = date.getDay();
    const dateKey = date.toISOString().split('T')[0];
    const isPast  = dateKey < todayKey;
    const isToday = dateKey === todayKey;
    // Sesión planificada para ese día de la semana
    let session = personalPlan[dow] ?? null;
    if (progState && progDays.includes(dow)) {
      const card = programSessionToCard(progState, lang, progState.done);
      if (card) session = card;
    }
    // Estado del entrenamiento: primero log en memoria (hoy), luego activityLog histórico
    const memLog      = isToday ? workoutLog[dateKey] : null;
    const savedStatus = activityLog[dateKey]?.workout;
    const status      = memLog?.status ?? savedStatus ?? null;
    // Código de color
    let dotColor = null;
    if (session) {
      if (status === 'done')    dotColor = '#22C55E';  // verde
      else if (status === 'skipped') dotColor = '#EAB308';  // amarillo
      else if (isPast)          dotColor = '#EF4444';  // rojo — día de entreno pasado sin marcar
      // futuro: sin punto
    } else {
      dotColor = '#CBD5E1';  // gris — día de descanso
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
  const hd        = healthData ?? {};
  const connected = hd.isConnected;
  const available = hd.isAvailable;

  // ── workout type label + emoji ──────────────────────────────────────────────
  const wLabel = (type) => hl?.workoutTypes?.[type] ?? type ?? '—';
  const wEmoji = (type) => hl?.workoutEmoji?.[type] ?? '💪';

  return (
    <SwipeableTabs tabs={['hoy', 'salud']} current={sub} onChange={setSub}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <GymSetupCard lang={lang} trainDays={trainDays} setTrainDays={setTrainDays}
        profileExtended={profileExtended} saveProfileExtended={saveProfileExtended || (() => {})} />

      {/* ── Tab bar ── */}
      <View style={styles.tabRow}>
        {[
          { id: 'hoy',    l: g.today    },
          { id: 'salud',  l: g.salud    },
        ].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
            style={[styles.tab, sub === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════════════ HOY ════════════════════════ */}
      {sub === 'hoy' && <>
        {/* Semana — calendario compacto con navegación y acciones por día */}
        <View style={styles.weekStripCard}>
          <View style={styles.weekNavAzote}>
            <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); setWeekAction(null); }} style={{ padding: 4 }}>
              <ChevronLeft size={16} color="#0A0A0A" />
            </TouchableOpacity>
            <Text style={styles.weekNavLabelAzote}>
              {weekOffset === 0
                ? (g.thisWeek ?? 'Esta semana')
                : weekOffset === -1
                  ? (g.lastWeek ?? 'Semana pasada')
                  : weekOffset === 1
                    ? ({ es: 'Semana siguiente', en: 'Next week', fr: 'Semaine prochaine', it: 'Settimana prossima' }[lang] || 'Semana siguiente')
                    : ''}
            </Text>
            <TouchableOpacity onPress={() => { setWeekOffset(o => o + 1); setWeekAction(null); }} style={{ padding: 4 }}>
              <ChevronRight size={16} color="#0A0A0A" />
            </TouchableOpacity>
          </View>
          <View style={styles.weekStripRow}>
            {offsetDays.map((day, i) => {
              const isExpanded = weekAction?.dateKey === day.dateKey;
              return (
                <TouchableOpacity key={i}
                  onPress={() => setWeekAction(isExpanded ? null : { dateKey: day.dateKey, step: 'main' })}
                  style={[styles.weekStripCell, day.isToday && styles.weekStripCellToday, isExpanded && styles.weekStripCellExpanded]}>
                  <Text style={[styles.weekStripDay, day.isToday && styles.weekStripDayToday]}>{day.dayNum}</Text>
                  {day.dotColor && <View style={[styles.weekStripDot, { backgroundColor: day.dotColor }]} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {weekAction && (() => {
            const day      = offsetDays.find(d => d.dateKey === weekAction.dateKey);
            if (!day) return null;
            const s        = day.session;
            const logEntry = (profileExtended?.activityLog || {})[day.dateKey] || {};
            const logged   = logEntry.workout;
            return (
              <View style={styles.weekDetailAzote}>
                {weekAction.step === 'main' && (
                  <View>
                    <Text style={styles.weekDetailWorkout}>{s ? s.name : g.rest}</Text>
                    {logged && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text style={styles.weekDetailStatus}>
                          {(logged === 'done' || logged === 'extra')
                            ? `✓ ${lang === 'en' ? 'Logged' : 'Registrado'}${logEntry.extraSport ? ` · ${logEntry.extraSport}` : ''}`
                            : `😴 ${lang === 'en' ? 'Rest' : 'Descanso'}`}
                        </Text>
                        <GHTouchable onPress={async () => { await clearActivityDay(day.dateKey); setWeekAction(null); }}>
                          <Text style={{ fontSize: 12, color: '#737373' }}>{lang === 'en' ? 'Clear' : 'Borrar'}</Text>
                        </GHTouchable>
                      </View>
                    )}
                    <View style={{ gap: 2 }}>
                      {s && (
                        <GHTouchable
                          onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'done' }); setWeekAction(null); }}
                          style={styles.weekActionBtn}>
                          <Text style={styles.weekActionBtnTxt}>✓ {lang === 'en' ? 'I did it' : 'Lo hice'}</Text>
                        </GHTouchable>
                      )}
                      <GHTouchable
                        onPress={() => setWeekAction(prev => ({ ...prev, step: 'sport' }))}
                        style={styles.weekActionBtn}>
                        <Text style={styles.weekActionBtnTxt}>🏅 {lang === 'en' ? 'Add sport' : 'Añadir deporte'}</Text>
                      </GHTouchable>
                      <GHTouchable
                        onPress={async () => { await saveActivityDay(day.dateKey, { workout: 'skipped' }); setWeekAction(null); }}
                        style={styles.weekActionBtn}>
                        <Text style={styles.weekActionBtnTxt}>😴 {lang === 'en' ? 'Rest day' : 'Descansé'}</Text>
                      </GHTouchable>
                    </View>
                  </View>
                )}
                {weekAction.step === 'sport' && (
                  <View>
                    <GHTouchable onPress={() => setWeekAction(prev => ({ ...prev, step: 'main' }))} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ChevronLeft size={14} color="#737373" />
                        <Text style={{ fontSize: 12, color: '#737373' }}>{lang === 'en' ? 'Back' : 'Volver'}</Text>
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
                    />
                  </View>
                )}
              </View>
            );
          })()}
        </View>

        {/* Programas guiados (de 0 a 5K, natación, fuerza…). Si hoy toca
            sesión del programa, la tarjeta es compacta porque la sesión
            se muestra como "Sesión de hoy" más abajo */}
        <ProgramsCard lang={lang} profileExtended={profileExtended}
          saveProfileExtended={saveProfileExtended} compact={todayIsProgramDay} />

        {/* Mini health banner (last workout from HealthKit, if today) */}
        {connected && hd.lastWorkout && hd.lastWorkout.date === todayKey && (
          <View style={styles.healthBanner}>
            <Text style={styles.healthBannerIco}>{wEmoji(hd.lastWorkout.type)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.healthBannerTitle}>
                {wLabel(hd.lastWorkout.type)} · {fmtTime(hd.lastWorkout.startTime)}
              </Text>
              <Text style={styles.healthBannerSub}>
                {hd.lastWorkout.duration} {hl?.min}
                {hd.lastWorkout.avgHR   ? `  ·  ❤️ ${hd.lastWorkout.avgHR} ${hl?.bpm}` : ''}
                {hd.lastWorkout.calories ? `  ·  🔥 ${hd.lastWorkout.calories} kcal` : ''}
              </Text>
            </View>
            <Check size={16} color={GREEN.text} />
          </View>
        )}

        {todaySession ? <>
          {/* Bannière de séance — compatible con datos de fase y datos legacy */}
          {(() => {
            const bgColor   = todaySession.phaseColor || todaySession.color   || BLUE.light;
            // Si el fondo es claro, texto oscuro; si es oscuro, blanco
            const isLightBg = (() => {
              const m = /^#?([0-9a-f]{6})/i.exec(String(bgColor));
              if (!m) return false;
              const n = parseInt(m[1], 16);
              const r = (n >> 16) & 255, gC = (n >> 8) & 255, b = n & 255;
              return (0.299 * r + 0.587 * gC + 0.114 * b) > 160;
            })();
            const txtColor  = todaySession.textColor  || (isLightBg ? '#1E3A8A' : 'white');
            const durLabel  = todaySession.dur         || todaySession.duration || '';
            return (
              <View style={[styles.card, { backgroundColor: bgColor }]}>
                <View style={styles.sessionBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionTag, { color: txtColor, opacity: 0.8 }]}>{g.todaySession}</Text>
                    <Text style={[styles.sessionName, { color: txtColor }]}>{todaySession.ico} {todaySession.name}</Text>
                    {!!durLabel && <Text style={[styles.sessionDur, { color: txtColor, opacity: 0.9 }]}>⏱ {durLabel}</Text>}
                    {/* Nota de fitness */}
                    {todaySession.fitnessNote && (() => {
                      const note = todaySession.fitnessNote[lang] || todaySession.fitnessNote.es || '';
                      return note ? <Text style={styles.fitnessNote}>{note}</Text> : null;
                    })()}
                    {/* Nota de condición */}
                    {todaySession.conditionNote && (() => {
                      const note = todaySession.conditionNote[lang] || todaySession.conditionNote.es || '';
                      return note ? <Text style={styles.conditionNote}>{note}</Text> : null;
                    })()}
                  </View>
                  {todayLog && (
                    <View style={[styles.statusBadge,
                      { backgroundColor: todayLog.status === 'done' ? GREEN.bg : RED.bg }]}>
                      <Text style={[styles.statusText,
                        { color: todayLog.status === 'done' ? GREEN.text : RED.text }]}>
                        {todayLog.status === 'done' ? g.done : g.skipped}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })()}

          {/* EJERCICIOS DEL DÍA — desde plan personalizado */}
          {todaySession.exercises?.length > 0 && (
            <View style={styles.card}>
              <View style={styles.circuitHeader}>
                <Text style={styles.sectionTitle}>
                  {lang === 'en' ? 'Today\'s exercises' : lang === 'fr' ? 'Exercices du jour' : 'Ejercicios de hoy'}
                </Text>
                <Text style={styles.progressText}>
                  {completedCount}/{todaySession.exercises.length} {g.exercises}
                </Text>
              </View>
              {todaySession.exercises.map((ex, i) => {
                const done   = !!completedExercises[i];
                const detail = ex.sets
                  ? `${ex.sets}×${ex.reps || ex.dur || ''}`
                  : ex.dur || '';
                return (
                  <TouchableOpacity key={i} onPress={() => toggleExercise(i)}
                    style={[styles.exRow, done && styles.exRowDone]}>
                    <View style={[styles.exNum, done && styles.exNumDone]}>
                      {done ? <Check size={14} color="white" /> : <Text style={styles.exNumText}>{i + 1}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exName, done && styles.exNameDone]}>{ex.name}</Text>
                    </View>
                    {!!detail && (
                      <Text style={[styles.exReps, done && { color: GREEN.text }]}>{detail}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Acciones rápidas: favorito + swap */}
          {todaySession?.id && !todaySession.isProgram && (toggleFavoriteWorkout || skipWorkout) && (
            <View style={styles.quickActions}>
              {toggleFavoriteWorkout && (() => {
                const isFav = profileExtended?.favoriteWorkouts?.includes(todaySession.id);
                return (
                  <TouchableOpacity onPress={() => toggleFavoriteWorkout(todaySession.id)} style={styles.quickBtn}>
                    <Text style={styles.quickBtnTxt}>{isFav ? '❤️' : '🤍'}</Text>
                    <Text style={styles.quickBtnLbl}>{lang === 'en' ? 'Favourite' : lang === 'fr' ? 'Favori' : 'Favorito'}</Text>
                  </TouchableOpacity>
                );
              })()}
              {skipWorkout && (
                <TouchableOpacity onPress={() => skipWorkout(todaySession.id)} style={styles.quickBtn}>
                  <Text style={styles.quickBtnTxt}>🔄</Text>
                  <Text style={styles.quickBtnLbl}>{lang === 'en' ? 'Swap' : 'Cambiar'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Botones log */}
          {!todayLog ? (
            <View style={styles.logBtns}>
              <TouchableOpacity style={styles.doneBtn}
                onPress={() => { saveLog({ status: 'done', extraSport: '' }); logWorkoutDone?.('done'); }}>
                <Text style={styles.doneBtnText}>{g.sessionDone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn}
                onPress={() => { saveLog({ status: 'skipped', extraSport: '' }); logWorkoutDone?.('skipped'); }}>
                <Text style={styles.skipBtnText}>{g.sessionSkipped}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.undoBtn}
              onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
              <Text style={styles.undoBtnText}>{g.undo}</Text>
            </TouchableOpacity>
          )}

          {/* Actividad extra */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{g.addExtra}</Text>
            {todayLog?.extraSport ? (
              <View style={styles.extraRow}>
                <Text style={styles.extraText}>🏅 {todayLog.extraSport}{todayLog.extraMinutes ? ` · ${todayLog.extraMinutes} min` : ''}</Text>
                <TouchableOpacity onPress={() => saveLog({ ...todayLog, extraSport: '' })}>
                  <Text style={styles.extraRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ) : addingSport ? (
              <ExtraSportPicker lang={lang} g={g}
                onPick={(label, minutes) => {
                  saveLog({ ...(todayLog || { status: 'done' }), extraSport: label, extraMinutes: minutes || null });
                  setAddingSport(false);
                }} />
            ) : (
              <TouchableOpacity style={styles.dashedBtn} onPress={() => setAddingSport(true)}>
                <Text style={styles.dashedBtnText}>{g.addActivity}</Text>
              </TouchableOpacity>
            )}
          </View>

        </> : <>
          {/* Día de descanso */}
          <View style={[styles.card, { alignItems: 'center', padding: 28 }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>😴</Text>
            <Text style={styles.restTitle}>{g.restDay}</Text>
            <Text style={styles.restSub}>{g.restDesc}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{g.restRecord}</Text>
            {todayLog?.extraSport ? (
              <View style={[styles.extraRow, { backgroundColor: BLUE.light }]}>
                <Text style={[styles.extraText, { color: '#1E40AF' }]}>🏅 {todayLog.extraSport}{todayLog.extraMinutes ? ` · ${todayLog.extraMinutes} min` : ''}</Text>
                <TouchableOpacity onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
                  <Text style={styles.extraRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ) : addingSport ? (
              <ExtraSportPicker lang={lang} g={g}
                onPick={(label, minutes) => {
                  saveLog({ status: 'extra', extraSport: label, extraMinutes: minutes || null });
                  setAddingSport(false);
                }} />
            ) : (
              <TouchableOpacity style={styles.dashedBtn} onPress={() => setAddingSport(true)}>
                <Text style={styles.dashedBtnText}>{g.addSpontaneous}</Text>
              </TouchableOpacity>
            )}
          </View>
        </>}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{g.myProgram}</Text>
          {g.programRows.map((row, i) => (
            <View key={i} style={styles.progRow}>
              <Text style={{ fontSize: 22, flexShrink: 0 }}>{row.ico}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.progLabel}>{row.label}</Text>
                <Text style={styles.progDetail}>{row.detail}</Text>
              </View>
            </View>
          ))}
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
  const typeOverrides     = profileExtended?.workoutTypeOverrides     || {};
  const durationOverrides = profileExtended?.workoutDurationOverrides || {};

  const resolveDuration = (w) => durationOverrides[w.id] ?? w.duration ?? null;

  const saveDurationOverride = async (workoutId) => {
    const mins = parseInt(durationInput, 10);
    if (!mins || mins <= 0) { setEditingDurationId(null); return; }
    await saveProfileExtended?.({ workoutDurationOverrides: { ...durationOverrides, [workoutId]: mins } });
    setEditingDurationId(null);
    setDurationInput('');
  };

  const resolveType  = (w) => typeOverrides[w.id] ?? w.type;
  const resolvedLabel = (w) => {
    const t = resolveType(w);
    if (t === 'other') return wLabel(t);
    const sport = SPORTS_LIST.find(s => s.id === t);
    return sport ? `${sport.emoji} ${sport.label[lang] || sport.label.es}` : wLabel(t);
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
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
        {{ es: '¿Qué deporte fue?', en: 'What sport was it?', fr: 'Quel sport était-ce ?', it: 'Che sport era?' }[lang] || '¿Qué deporte fue?'}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {SPORTS_LIST.filter(s => s.id !== 'other').map(s => (
          <TouchableOpacity key={s.id} onPress={() => saveTypeOverride(workoutId, s.id)}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}>
            <Text style={{ fontSize: 12, color: '#1E40AF', fontWeight: '500' }}>{s.emoji} {s.label[lang] || s.label.es}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => setIdentifyingId(null)} style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
          {{ es: 'Cancelar', en: 'Cancel', fr: 'Annuler', it: 'Annulla' }[lang] || 'Cancelar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Connection card ────────────────────────────────────────────────────────
  const ConnectCard = () => {
    if (!isAvailable) {
      return (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>📵</Text>
          <Text style={styles.sectionTitle}>{hl?.title}</Text>
          <Text style={[styles.tipText, { textAlign: 'center', marginTop: 4 }]}>
            {hl?.notAvailable}
          </Text>
        </View>
      );
    }
    if (isConnected) {
      return (
        <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
          <View style={styles.connectedDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{hl?.title}</Text>
            <Text style={styles.connectedLabel}>
              {hl?.connectedTo} · {Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}
            </Text>
            {lastSync && (
              <Text style={styles.lastSyncText}>
                {hl?.lastSync}: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}>
            <TouchableOpacity style={styles.syncBtn} onPress={syncData} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator size="small" color={BLUE.primary} />
                : <Text style={styles.syncBtnText}>{hl?.sync}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={disconnect}>
              <Text style={styles.disconnectText}>{hl?.disconnect}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{hl?.title}</Text>
        <Text style={[styles.tipText, { marginBottom: 16 }]}>{hl?.permissionsInfo}</Text>
        <TouchableOpacity style={styles.connectBtn} onPress={requestPermissions}>
          <Text style={styles.connectBtnText}>
            {Platform.OS === 'ios' ? hl?.connectIos : hl?.connectAndroid}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Last workout card ──────────────────────────────────────────────────────
  const LastWorkoutCard = () => {
    if (!isConnected) return null;
    if (!lastWorkout) {
      return (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{hl?.lastSession}</Text>
          <Text style={styles.tipText}>{hl?.noSession}</Text>
        </View>
      );
    }
    const w = lastWorkout;
    const isUnknown = resolveType(w) === 'other';
    const isIdentifying = identifyingId === w.id;
    const dur = resolveDuration(w);
    const isEditingDur = editingDurationId === w.id;
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>{hl?.lastSession}</Text>
          <Text style={styles.dateChip}>{fmtDate(w.startTime, lang)}</Text>
        </View>

        {/* Header */}
        <View style={styles.workoutHeader}>
          <Text style={{ fontSize: 36 }}>{resolvedEmoji(w)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.workoutName}>{resolvedLabel(w)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <Text style={styles.workoutTime}>{fmtTime(w.startTime)}{w.endTime ? ` → ${fmtTime(w.endTime)}` : ''}</Text>
              {dur != null && <Text style={{ fontSize: 13, fontWeight: '700', color: BLUE.primary }}>⏱ {dur} {hl?.min}</Text>}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              const opening = !(isIdentifying || isEditingDur);
              setIdentifyingId(opening ? w.id : null);
              setEditingDurationId(opening ? w.id : null);
              setDurationInput(dur != null ? String(dur) : '');
            }}
            style={{ padding: 6 }}>
            {(isIdentifying || isEditingDur) ? <X size={18} color="#64748B" /> : <Text style={{ fontSize: 18 }}>✏️</Text>}
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
            <Text style={{ fontSize: 13, color: '#64748B' }}>{hl?.min}</Text>
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
          {w.avgHR     != null && <MetricPill icon="❤️" label={hl?.avgHR}    value={`${w.avgHR} ${hl?.bpm}`}  color="#EF4444" />}
          {w.maxHR     != null && <MetricPill icon="🔺" label={hl?.maxHR}    value={`${w.maxHR} ${hl?.bpm}`}  color="#EF4444" />}
          {w.calories  != null && <MetricPill icon="🔥" label={hl?.calories} value={`${w.calories} kcal`}     color="#F97316" />}
          {w.distance  != null && <MetricPill icon="📍" label={hl?.distance} value={`${w.distance} ${hl?.km}`} color="#8B5CF6" />}
        </View>
      </View>
    );
  };


  // ── Today's metrics ────────────────────────────────────────────────────────
  const MetricsCard = () => {
    if (!isConnected) return null;
    const m = todayMetrics;
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{hl?.metrics}</Text>
        {!m ? (
          <Text style={styles.tipText}>{hl?.noMetrics}</Text>
        ) : (
          <View style={styles.metricsGrid}>
            {m.steps          != null && <BigMetric icon="👣" label={hl?.steps}          value={fmtNum(m.steps)} />}
            {m.activeCalories != null && <BigMetric icon="🔥" label={hl?.activeCalories} value={`${fmtNum(m.activeCalories)} kcal`} />}
            {m.restingHR      != null && <BigMetric icon="❤️" label={hl?.restingHR}      value={`${m.restingHR} ${hl?.bpm}`} color="#EF4444" />}
            {m.hrv            != null && <BigMetric icon="📈" label={hl?.hrv}            value={`${m.hrv} ms`}              color="#8B5CF6" />}
          </View>
        )}
      </View>
    );
  };

  // ── Sleep history (7 days) ─────────────────────────────────────────────────
  const SleepCard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const data = sleepHistory?.length > 0 ? sleepHistory : (lastSleep ? [lastSleep] : []);
    if (!data.length) return null;

    const maxDur = Math.max(...data.map(n => n.duration), 8);
    const scoreColor = (d) => d >= 7 ? '#16A34A' : d >= 6 ? '#F59E0B' : '#DC2626';
    const displayed = [...data].reverse(); // oldest → newest left-to-right
    const selected  = selectedDate ? data.find(n => n.date === selectedDate) ?? data[0] : data[0];

    const labelDur   = { es: 'Duración', en: 'Duration', fr: 'Durée', it: 'Durata' };
    const labelBed   = { es: 'Acostarse', en: 'Bedtime', fr: 'Coucher', it: 'Andare a letto' };
    const labelWake  = { es: 'Despertares', en: 'Awakenings', fr: 'Réveils', it: 'Risvegli' };
    const labelDeep  = { es: 'Profundo', en: 'Deep', fr: 'Profond', it: 'Profondo' };
    const labelREM   = { es: 'REM', en: 'REM', fr: 'REM', it: 'REM' };
    const labelInBed = { es: 'En cama', en: 'In bed', fr: 'Au lit', it: 'A letto' };
    const t = (obj) => obj[lang] ?? obj.es;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{hl?.sleepTitle}</Text>

        {/* 7-day bar chart — tappable */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 12, marginTop: 8 }}>
          {displayed.map((n, i) => {
            const barH   = Math.max(4, (n.duration / maxDur) * 72);
            const deepH  = n.deepSleep > 0 ? Math.max(2, (n.deepSleep / maxDur) * 72) : 0;
            const dayLabel = new Date(n.date + 'T12:00:00').toLocaleDateString('default', { weekday: 'narrow' });
            const isLatest   = i === displayed.length - 1;
            const isSelected = n.date === (selectedDate ?? data[0].date);
            const barColor   = isSelected ? '#1A56DB' : isLatest ? '#64748B' : '#94A3B8';
            return (
              <TouchableOpacity
                key={n.date}
                onPress={() => setSelectedDate(n.date === selectedDate ? null : n.date)}
                activeOpacity={0.7}
                style={{ flex: 1, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 9, color: scoreColor(n.duration), fontWeight: '700', marginBottom: 2 }}>
                  {n.duration}h
                </Text>
                <View style={{ width: '100%', height: 72, justifyContent: 'flex-end', backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden',
                  borderWidth: isSelected ? 1.5 : 0, borderColor: '#1A56DB' }}>
                  <View style={{ width: '100%', height: barH, backgroundColor: barColor, borderRadius: 6 }} />
                  {deepH > 0 && (
                    <View style={{ position: 'absolute', bottom: 0, width: '100%', height: deepH, backgroundColor: '#0284C7', borderRadius: 6 }} />
                  )}
                </View>
                <Text style={{ fontSize: 9, color: isSelected ? '#1A56DB' : '#94A3B8', marginTop: 3, fontWeight: isSelected ? '700' : '400' }}>
                  {dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detail panel for selected day */}
        {selected && (
          <View style={{ backgroundColor: '#F8FAFF', borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
              <Text style={styles.sleepHours}>{selected.duration}</Text>
              <Text style={styles.sleepUnit}>h</Text>
              <Text style={styles.sleepDate}> · {fmtDate(selected.date + 'T00:00:00', lang)}</Text>
            </View>

            {/* Row 1: Duración + Acostarse + Despertares */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: scoreColor(selected.duration) }}>{selected.duration}h</Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{t(labelDur)}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                  {selected.bedtime ? fmtTime(selected.bedtime) : '—'}
                </Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>🌙 {t(labelBed)}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: (selected.interruptions ?? 0) === 0 ? '#16A34A' : (selected.interruptions ?? 0) <= 2 ? '#F59E0B' : '#DC2626' }}>
                  {selected.interruptions ?? 0}
                </Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>⚡ {t(labelWake)}</Text>
              </View>
            </View>

            {/* Row 2: Profundo + REM + En cama */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {selected.deepSleep > 0 && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#4F46E5' }}>{selected.deepSleep}h</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>🌑 {t(labelDeep)}</Text>
                </View>
              )}
              {selected.remSleep > 0 && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#7C3AED' }}>{selected.remSleep}h</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>🌙 {t(labelREM)}</Text>
                </View>
              )}
              {selected.inBed > 0 && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B' }}>{selected.inBed}h</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>🛏 {t(labelInBed)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {!isConnected && (
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' }}>
            Datos guardados · Reconecta Apple Health para actualizar
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <MetricsCard />
      <LastWorkoutCard />
      <SleepCard />
      <ConnectCard />
    </>
  );
}

// ─── Small UI components ──────────────────────────────────────────────────────
function MetricPill({ icon, label, value, color = BLUE.primary }) {
  return (
    <View style={[styles.pill, { borderColor: color + '33', backgroundColor: color + '0D' }]}>
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <View>
        <Text style={[styles.pillLabel, { color }]}>{label}</Text>
        <Text style={[styles.pillValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function BigMetric({ icon, label, value, color = BLUE.primary }) {
  return (
    <View style={styles.bigMetric}>
      <Text style={{ fontSize: 28, marginBottom: 4 }}>{icon}</Text>
      <Text style={[styles.bigMetricValue, { color }]}>{value}</Text>
      <Text style={styles.bigMetricLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 16, paddingTop: 58, paddingBottom: 120 },

  // tabs
  tabRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#171717' },
  tabText: { fontSize: 12, color: '#525252' },
  tabTextActive: { color: 'white', fontWeight: '700' },

  // weekly strip (mini calendar) — pestaña Hoy
  weekStripCard: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, marginBottom: 2 },
  weekNavAzote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  weekNavLabelAzote: { fontSize: 14, color: '#0A0A0A' },
  weekStripRow: { flexDirection: 'row', gap: 4 },
  weekStripCell: { flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  weekStripCellToday: { backgroundColor: '#171717' },
  weekStripCellExpanded: { borderWidth: 2, borderColor: '#171717' },
  weekStripDay: { fontSize: 12, color: '#0A0A0A' },
  weekStripDayToday: { color: 'white', fontWeight: '700' },
  weekStripDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },

  weekDetailAzote: { marginTop: 12, backgroundColor: 'white', borderRadius: 16, padding: 12 },
  weekDetailWorkout: { fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 8 },
  weekDetailStatus: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  weekActionBtn: { paddingVertical: 11, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center' },
  weekActionBtnTxt: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },

  // cards
  card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 10 },

  // health banner (mini, on top of hoy)
  healthBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F5F5', borderRadius: 24, padding: 12, marginBottom: 2 },
  healthBannerIco: { fontSize: 28 },
  healthBannerTitle: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  healthBannerSub: { fontSize: 12, color: '#525252', marginTop: 2 },

  // session
  sessionBanner:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sessionTag:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  sessionName:    { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  fitnessNote:    { fontSize: 12, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, marginTop: 8, lineHeight: 18 },
  conditionNote:  { fontSize: 12, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8, marginTop: 6, lineHeight: 18 },
  sessionDur: { fontSize: 13, opacity: 0.8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexShrink: 0 },
  statusText: { fontSize: 12, fontWeight: '700' },

  // circuit
  circuitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressText: { fontSize: 12, color: '#0A0A0A', fontWeight: '600' },
  warmupRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFEA9B', borderRadius: 16, padding: 10, marginBottom: 10 },
  warmupIco: { fontSize: 18 },
  warmupLabel: { fontSize: 12, fontWeight: '700', color: '#261E01', marginBottom: 2 },
  warmupDetail: { fontSize: 12, color: '#261E01' },
  exRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, backgroundColor: 'white', marginBottom: 6, gap: 10 },
  exRowDone: { backgroundColor: '#B6ECAF' },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  exNumDone: { backgroundColor: '#171717' },
  exNumText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  exName: { fontSize: 14, fontWeight: '600', color: '#0A0A0A' },
  exNameDone: { color: '#0B1F08', textDecorationLine: 'line-through' },
  exDetail: { fontSize: 11, color: '#737373', marginTop: 1 },
  exReps: { fontSize: 13, fontWeight: '700', color: '#0A0A0A', flexShrink: 0 },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  restIco: { fontSize: 16 },
  restText: { fontSize: 13, color: '#64748B' },
  variationBtn: { marginTop: 10, padding: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#1A56DB', alignItems: 'center' },
  variationBtnText: { color: '#1A56DB', fontWeight: '600', fontSize: 13 },
  variationBox: { marginTop: 8, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12 },
  tipBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  tipTitle: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  tipText: { fontSize: 12, color: '#64748B', lineHeight: 20 },
  phaseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  phaseNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  phaseNumText: { fontSize: 12, fontWeight: '700' },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  phaseLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  phaseDur: { fontSize: 12, color: '#1A56DB', fontWeight: '600' },
  phaseDetail: { fontSize: 12, color: '#64748B', lineHeight: 18 },

  // log buttons
  quickActions: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  quickBtn:     { flex: 1, padding: 12, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center' },
  quickBtnTxt:  { fontSize: 22, marginBottom: 2 },
  quickBtnLbl:  { fontSize: 11, color: '#0A0A0A', fontWeight: '500' },

  logBtns: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  doneBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center' },
  doneBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  skipBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
  skipBtnText: { color: '#0A0A0A', fontWeight: '700', fontSize: 14 },
  undoBtn: { padding: 10, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', marginBottom: 2 },
  undoBtnText: { fontSize: 13, color: '#0A0A0A' },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#B6ECAF', borderRadius: 16 },
  extraText: { fontSize: 13, color: '#0B1F08', fontWeight: '500' },
  extraRemove: { color: '#0B1F08', fontSize: 18 },
  extraInput: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: '#FAFAFA', fontSize: 13, color: '#0A0A0A' },
  addBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#171717', justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  dashedBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: 'white' },
  dashedBtnText: { fontSize: 13, color: '#525252' },
  restTitle: { fontSize: 16, fontWeight: '700', color: '#0A0A0A', marginBottom: 8 },
  restSub: { fontSize: 13, color: '#525252', lineHeight: 20, textAlign: 'center' },

  // week navigation
  weekNav:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  weekNavBtn:   { padding: 8 },
  weekNavArrow: { fontSize: 28, color: BLUE.primary, fontWeight: '700', lineHeight: 32 },
  weekNavLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  // week
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
  weekDate: { width: 60, alignItems: 'center', flexShrink: 0 },
  weekDayLabel: { fontSize: 10, color: '#94A3B8' },
  weekDayNum: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 22 },
  weekWorkout: { fontSize: 13 },
  weekDur: { fontSize: 11, color: '#94A3B8' },
  weekExtra: { fontSize: 11, color: '#1A56DB', marginTop: 1 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(26,86,219,0.08)' },
  progLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  progDetail: { fontSize: 12, color: '#475569', marginTop: 1 },
  weekDetail: { marginTop: -4, marginBottom: 6, backgroundColor: '#F8FBFF', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#1A56DB', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 12, gap: 6 },
  weekExRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#EFF6FF' },
  weekExNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  weekExNumText: { fontSize: 11, fontWeight: '700', color: '#1A56DB' },
  weekExName: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500' },
  weekExReps: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },

  // health tab — connection
  connectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#49CF38', flexShrink: 0 },
  connectedLabel: { fontSize: 12, color: '#0B1F08', fontWeight: '600', marginTop: 2 },
  lastSyncText: { fontSize: 11, color: '#737373', marginTop: 2 },
  syncBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: 'white' },
  syncBtnText: { fontSize: 12, color: '#0A0A0A', fontWeight: '600' },
  disconnectText: { fontSize: 11, color: '#737373', textDecorationLine: 'underline' },
  connectBtn: { backgroundColor: '#171717', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  connectBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  // health tab — last workout
  dateChip: { fontSize: 11, color: '#0A0A0A', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  workoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  workoutName: { fontSize: 18, fontWeight: '700', color: '#0A0A0A' },
  workoutTime: { fontSize: 12, color: '#525252', marginTop: 2 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'white', borderWidth: 0 },
  pillLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  pillValue: { fontSize: 13, fontWeight: '700' },

  // health tab — recent workouts
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'white' },
  recentName: { fontSize: 13, fontWeight: '600', color: '#0A0A0A' },
  recentDate: { fontSize: 11, color: '#737373', marginTop: 2 },
  recentDur: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  recentCal: { fontSize: 11, color: '#FE6004', marginTop: 2 },

  // health tab — metrics grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bigMetric: { flex: 1, minWidth: '40%', backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center' },
  bigMetricValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  bigMetricLabel: { fontSize: 11, color: '#737373', fontWeight: '500' },

  // health tab — sleep
  sleepHours: { fontSize: 42, fontWeight: '700', color: '#171717' },
  sleepUnit: { fontSize: 20, color: '#171717', fontWeight: '600' },
  sleepDate: { fontSize: 12, color: '#737373' },
});
