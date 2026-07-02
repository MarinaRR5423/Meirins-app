import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
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
          ← {tr('Cambiar deporte', 'Change sport', 'Changer de sport', 'Cambia sport')}
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
  const [sub, setSub] = useState('hoy');
  const [addingSport, setAddingSport] = useState(false);
  const [workoutLog, setWorkoutLog] = useState({});
  const [completedExercises, setCompletedExercises] = useState({});
  const [showVariations, setShowVariations] = useState(false);
  const [expandedWeekDay, setExpandedWeekDay] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);  // 0 = semana actual, -1 = semana anterior, etc.

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
  const offsetDays  = Array.from({ length: 7 }, (_, i) => {
    const date    = new Date();
    date.setDate(date.getDate() + weekOffset * 7 + i);
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
    <SwipeableTabs tabs={['hoy', 'semana', 'salud']} current={sub} onChange={setSub}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <GymSetupCard lang={lang} trainDays={trainDays} setTrainDays={setTrainDays}
        profileExtended={profileExtended} saveProfileExtended={saveProfileExtended || (() => {})} />

      {/* ── Tab bar ── */}
      <View style={styles.tabRow}>
        {[
          { id: 'hoy',    l: g.today    },
          { id: 'semana', l: g.week     },
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
            <Text style={{ fontSize: 16 }}>✓</Text>
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
                      <Text style={[styles.exNumText, done && { color: 'white' }]}>{done ? '✓' : i + 1}</Text>
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
      </>}

      {/* ════════════════════════ SEMANA ════════════════════════ */}
      {sub === 'semana' && <>
        {/* Navegación de semana */}
        {(() => {
          const weekStart = offsetDays[0];
          const weekEnd   = offsetDays[6];
          const fmt = d => `${d.dayNum} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.date.getMonth()]}`;
          return (
            <View style={styles.weekNav}>
              <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); setExpandedWeekDay(null); }}
                style={styles.weekNavBtn}>
                <Text style={styles.weekNavArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.weekNavLabel}>
                {weekOffset === 0
                  ? (g.thisWeek ?? 'Esta semana')
                  : weekOffset === -1
                    ? (g.lastWeek ?? 'Semana pasada')
                    : `${fmt(weekStart)} – ${fmt(weekEnd)}`}
              </Text>
              <TouchableOpacity
                onPress={() => { if (weekOffset < 0) { setWeekOffset(o => o + 1); setExpandedWeekDay(null); } }}
                style={[styles.weekNavBtn, weekOffset >= 0 && { opacity: 0.3 }]}
                disabled={weekOffset >= 0}>
                <Text style={styles.weekNavArrow}>›</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{g.weekPlanning}</Text>
          {offsetDays.map((day, i) => {
            const s         = day.session;
            const isExpanded = expandedWeekDay === i;
            return (
              <View key={i}>
                <TouchableOpacity
                  onPress={() => s ? setExpandedWeekDay(isExpanded ? null : i) : null}
                  activeOpacity={s ? 0.7 : 1}
                  style={[styles.weekRow, {
                    backgroundColor: day.isToday ? '#EFF6FF' : isExpanded ? '#F0F9FF' : s ? '#F8FAFC' : 'white',
                    borderColor: isExpanded ? BLUE.primary : day.isToday ? '#BFDBFE' : '#F1F5F9',
                    borderWidth: isExpanded ? 1.5 : 1,
                  }]}>
                  <View style={styles.weekDate}>
                    <Text style={[styles.weekDayLabel, (day.isToday || isExpanded) && { color: BLUE.primary, fontWeight: '700' }]}>
                      {day.dayLabel}
                    </Text>
                    <Text style={styles.weekDayNum}>{day.dayNum}</Text>
                  </View>
                  {/* Punto de color */}
                  {day.dotColor && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: day.dotColor, marginRight: 6, flexShrink: 0, alignSelf: 'center' }} />
                  )}
                  <Text style={{ fontSize: 20, flexShrink: 0 }}>{s ? s.ico : '😴'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.weekWorkout,
                      { color: s ? '#1E293B' : '#CBD5E1', fontWeight: s ? '600' : '400' }]}
                      numberOfLines={1}>
                      {s ? s.name : g.rest}
                    </Text>
                    {s && <Text style={styles.weekDur}>{s.duration}</Text>}
                    {day.extraSport && <Text style={styles.weekExtra}>+ {day.extraSport}</Text>}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {day.status === 'done'    && <Text style={{ color: GREEN.text,  fontWeight: '700', fontSize: 16 }}>✓</Text>}
                    {day.status === 'skipped' && <Text style={{ color: '#EAB308',   fontWeight: '700', fontSize: 16 }}>–</Text>}
                    {s && <Text style={{ fontSize: 11, color: '#94A3B8' }}>{isExpanded ? '▲' : '▼'}</Text>}
                  </View>
                </TouchableOpacity>

                {isExpanded && s && (
                  <View style={[styles.weekDetail, { borderColor: BLUE.primary }]}>
                    {s.type === 'running' && s.phases?.map((phase, pi) => (
                      <View key={pi} style={styles.phaseRow}>
                        <View style={[styles.phaseNum, { backgroundColor: pi === 1 ? BLUE.primary : '#F1F5F9' }]}>
                          <Text style={[styles.phaseNumText, { color: pi === 1 ? 'white' : '#94A3B8' }]}>{pi + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.phaseHeader}>
                            <Text style={styles.phaseLabel}>{phase.label}</Text>
                            <Text style={styles.phaseDur}>{phase.duration}</Text>
                          </View>
                          <Text style={styles.phaseDetail}>{phase.detail}</Text>
                        </View>
                      </View>
                    ))}
                    {s.type === 'renfo' && s.exercises?.map((ex, ei) => (
                      <View key={ei} style={styles.weekExRow}>
                        <View style={styles.weekExNum}>
                          <Text style={styles.weekExNumText}>{ei + 1}</Text>
                        </View>
                        <Text style={styles.weekExName}>{ex.name}</Text>
                        <Text style={styles.weekExReps}>{ex.sets}×{ex.reps || ex.dur}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>{g.myProgram}</Text>
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
          <TipsCard articles={gymArticles} lang={lang} />
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
  const typeOverrides = profileExtended?.workoutTypeOverrides || {};

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
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>{hl?.lastSession}</Text>
          <Text style={styles.dateChip}>{fmtDate(w.startTime, lang)}</Text>
        </View>

        {/* Header */}
        <TouchableOpacity
          activeOpacity={isUnknown ? 0.7 : 1}
          onPress={() => isUnknown && setIdentifyingId(isIdentifying ? null : w.id)}
          style={styles.workoutHeader}>
          <Text style={{ fontSize: 36 }}>{resolvedEmoji(w)}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.workoutName}>{resolvedLabel(w)}</Text>
              {isUnknown && (
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600' }}>
                    {{ es: 'Identificar', en: 'Identify', fr: 'Identifier', it: 'Identifica' }[lang] || 'Identificar'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutTime}>
              {fmtTime(w.startTime)}{w.endTime ? ` → ${fmtTime(w.endTime)}` : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {isIdentifying && <SportIdentifyPicker workoutId={w.id} />}

        {/* Metric pills */}
        <View style={styles.metricRow}>
          <MetricPill icon="⏱" label={hl?.duration} value={w.duration != null ? `${w.duration} ${hl?.min}` : '—'} />
          {w.avgHR     != null && <MetricPill icon="❤️" label={hl?.avgHR}    value={`${w.avgHR} ${hl?.bpm}`}  color="#EF4444" />}
          {w.maxHR     != null && <MetricPill icon="🔺" label={hl?.maxHR}    value={`${w.maxHR} ${hl?.bpm}`}  color="#EF4444" />}
          {w.calories  != null && <MetricPill icon="🔥" label={hl?.calories} value={`${w.calories} kcal`}     color="#F97316" />}
          {w.distance  != null && <MetricPill icon="📍" label={hl?.distance} value={`${w.distance} ${hl?.km}`} color="#8B5CF6" />}
        </View>
      </View>
    );
  };

  // ── Recent workouts list ───────────────────────────────────────────────────
  const RecentWorkoutsCard = () => {
    if (!isConnected || !recentWorkouts?.length || recentWorkouts.length < 2) return null;
    const rest = recentWorkouts.slice(1, 7); // skip first (already shown as lastWorkout)
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{hl?.recentSessions}</Text>
        {rest.map((w, i) => {
          const isUnknown    = resolveType(w) === 'other';
          const isIdentifying = identifyingId === w.id;
          return (
            <View key={i}>
              <TouchableOpacity
                activeOpacity={isUnknown ? 0.7 : 1}
                onPress={() => isUnknown && setIdentifyingId(isIdentifying ? null : w.id)}
                style={styles.recentRow}>
                <Text style={{ fontSize: 22, flexShrink: 0 }}>{resolvedEmoji(w)}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.recentName}>{resolvedLabel(w)}</Text>
                    {isUnknown && (
                      <View style={{ backgroundColor: '#FEF3C7', borderRadius: 50, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 10, color: '#92400E', fontWeight: '600' }}>?</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recentDate}>{fmtDate(w.startTime, lang)}  ·  {fmtTime(w.startTime)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recentDur}>{w.duration} {hl?.min}</Text>
                  {w.calories != null && (
                    <Text style={styles.recentCal}>🔥 {w.calories}</Text>
                  )}
                </View>
              </TouchableOpacity>
              {isIdentifying && <SportIdentifyPicker workoutId={w.id} />}
            </View>
          );
        })}
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
      <RecentWorkoutsCard />
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
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },

  // tabs
  tabRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 50, padding: 4, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 46, alignItems: 'center' },
  tabActive: { backgroundColor: '#1A56DB' },
  tabText: { fontSize: 12, color: '#94A3B8' },
  tabTextActive: { color: 'white', fontWeight: '700' },

  // cards
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },

  // health banner (mini, on top of hoy)
  healthBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#86EFAC' },
  healthBannerIco: { fontSize: 28 },
  healthBannerTitle: { fontSize: 13, fontWeight: '700', color: '#166534' },
  healthBannerSub: { fontSize: 12, color: '#4ADE80', marginTop: 2 },

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
  progressText: { fontSize: 12, color: '#1A56DB', fontWeight: '600' },
  warmupRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 10, marginBottom: 10 },
  warmupIco: { fontSize: 18 },
  warmupLabel: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  warmupDetail: { fontSize: 12, color: '#78350F' },
  exRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 6, gap: 10 },
  exRowDone: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  exNumDone: { backgroundColor: '#16A34A' },
  exNumText: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },
  exName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  exNameDone: { color: '#16A34A', textDecorationLine: 'line-through' },
  exDetail: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  exReps: { fontSize: 13, fontWeight: '700', color: '#1A56DB', flexShrink: 0 },
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
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickBtn:     { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: 'white', alignItems: 'center' },
  quickBtnTxt:  { fontSize: 22, marginBottom: 2 },
  quickBtnLbl:  { fontSize: 11, color: '#64748B', fontWeight: '500' },

  logBtns: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  doneBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#16A34A', alignItems: 'center' },
  doneBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  skipBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center' },
  skipBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  undoBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: 'white', alignItems: 'center', marginBottom: 12 },
  undoBtnText: { fontSize: 13, color: '#64748B' },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#F0FDF4', borderRadius: 10 },
  extraText: { fontSize: 13, color: '#166534', fontWeight: '500' },
  extraRemove: { color: '#94A3B8', fontSize: 18 },
  extraInput: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13 },
  addBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1A56DB', justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  dashedBtn: { padding: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1', alignItems: 'center' },
  dashedBtnText: { fontSize: 13, color: '#64748B' },
  restTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  restSub: { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center' },

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
  connectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16A34A', flexShrink: 0 },
  connectedLabel: { fontSize: 12, color: '#16A34A', fontWeight: '600', marginTop: 2 },
  lastSyncText: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  syncBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: BLUE.light, borderWidth: 1, borderColor: '#BFDBFE' },
  syncBtnText: { fontSize: 12, color: BLUE.primary, fontWeight: '600' },
  disconnectText: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'underline' },
  connectBtn: { backgroundColor: BLUE.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  connectBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  // health tab — last workout
  dateChip: { fontSize: 11, color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  workoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  workoutName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  workoutTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  pillValue: { fontSize: 13, fontWeight: '700' },

  // health tab — recent workouts
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recentName: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  recentDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  recentDur: { fontSize: 13, fontWeight: '700', color: BLUE.primary },
  recentCal: { fontSize: 11, color: '#F97316', marginTop: 2 },

  // health tab — metrics grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bigMetric: { flex: 1, minWidth: '40%', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, alignItems: 'center' },
  bigMetricValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  bigMetricLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  // health tab — sleep
  sleepHours: { fontSize: 42, fontWeight: '700', color: '#4F46E5' },
  sleepUnit: { fontSize: 20, color: '#4F46E5', fontWeight: '600' },
  sleepDate: { fontSize: 12, color: '#94A3B8' },
});
