import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PHASES } from '../data/phases';
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

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
const HORMONAL_CONTRA = ['pill', 'hormonal_iud', 'ring', 'patch', 'implant'];
export default function HomeScreen({ pi, profile, lang = 'es', healthData }) {
  useEffect(() => { trackScreen('Home', { phase: pi?.phase }); }, []);
  const { phaseData } = usePhaseData(pi?.phase, lang);
  const baseD = phaseData;
  const d = baseD ? getPhaseDisplay(lang, pi?.phase, baseD) : null;

  const isHormonalContra = HORMONAL_CONTRA.includes(profile?.profileExtended?.contraception);
  const navigation = useNavigation();
  const cals = calcCalories(profile, pi?.phase);

  // Sesión de hoy — primero intenta plan desde Supabase, sino fallback estático
  const { workouts: dbWorkouts } = useWorkouts();
  const ext = profile?.profileExtended || {};
  const jsDay = new Date().getDay();

  // Mismo perfil que GimnasioScreen para que la sesión de hoy coincida
  const todayKeyH   = new Date().toISOString().split('T')[0];
  const skippedBlkH = ext.skippedTodayWorkout || {};
  const skippedIdsH = skippedBlkH.date === todayKeyH ? (skippedBlkH.ids || []) : [];

  const planFromDb = dbWorkouts?.length && pi?.phase && profile?.trainDays?.length
    ? buildPersonalizedWeekPlan(
        dbWorkouts,
        {
          fitnessLevel: ext.fitnessLevel || 'regular',
          conditions:   ext.conditions   || [],
          gymAccess:    ext.gymAccess    || 'home',
          lifeStage:    ext.lifeStage    || null,
          primaryGoals: ext.primaryGoals || [],
          sportProfile: ext.sportProfile || {},
          goal:         profile?.goal,
          favoriteWorkouts: ext.favoriteWorkouts || [],
          skippedWorkoutIds: skippedIdsH,
        },
        pi?.phase,
        profile?.trainDays,
        lang,
      )
    : null;

  // Programa activo: su sesión manda sobre el plan del motor (igual que Gimnasio)
  const progState = getActiveProgramState(ext);
  const progDays  = progState ? getProgramDays(progState.program, profile?.trainDays || []) : [];
  const todayIsProgramDay = !!progState && (progDays.includes(jsDay) || !(profile?.trainDays || []).length);

  const todaySession = todayIsProgramDay
    ? programSessionToCard(progState, lang)
    : planFromDb?.[jsDay] || getTodayWorkout(
        pi?.phase,
        profile?.trainDays || [],
        ext.fitnessLevel || 'regular',
        ext.conditions   || [],
      );
  const pKeys = ['menstrual', 'follicular', 'ovulation', 'luteal'];
  const pR = { menstrual: [1, 5], follicular: [6, 13], ovulation: [14, 16], luteal: [17, pi?.cycleLen || 28] };
  const h = (T[lang] || T.es).home;
  const c = (T[lang] || T.es).common;

  // ── Saludo personalizado según hora del día ────────────────────────────────
  const hour = new Date().getHours();
  const greetingTxt = (() => {
    const slot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
    const map = {
      morning:   { es: 'Buenos días',   en: 'Good morning',   fr: 'Bonjour',      it: 'Buongiorno' },
      afternoon: { es: 'Buenas tardes', en: 'Good afternoon', fr: 'Bon après-midi', it: 'Buon pomeriggio' },
      evening:   { es: 'Buenas noches', en: 'Good evening',   fr: 'Bonsoir',      it: 'Buonasera' },
      night:     { es: 'Hola',          en: 'Hi',             fr: 'Salut',        it: 'Ciao' },
    };
    return map[slot][lang] || map[slot].es;
  })();
  const userName = profile?.profileExtended?.name?.trim() || '';
  const greeting = userName ? `${greetingTxt}, ${userName}` : greetingTxt;

  // Empty state — sin datos de ciclo
  if (!pi) {
    const emptyTxt = {
      title:    { es: 'Registra tu primer ciclo', en: 'Log your first cycle', fr: 'Enregistre ton premier cycle', it: 'Registra il tuo primo ciclo' },
      subtitle: { es: 'Ve a la pestaña Ciclo para introducir la fecha de tu último período y desbloquear todo tu programa personalizado.', en: 'Go to the Cycle tab to enter your last period date and unlock your personalised programme.', fr: 'Va dans l\'onglet Cycle pour saisir ta dernière date de règles et débloquer ton programme.', it: 'Vai alla scheda Ciclo per inserire la data dell\'ultimo periodo e sbloccare il tuo programma.' },
      cta:      { es: 'Ir a Ciclo →', en: 'Go to Cycle →', fr: 'Aller au Cycle →', it: 'Vai al Ciclo →' },
    };
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSub}>Meirins · {h.today}</Text>
          <Text style={styles.headerTitle}>👋 {greeting}</Text>
        </View>
        <EmptyState
          emoji="🌙"
          title={emptyTxt.title[lang] || emptyTxt.title.es}
          subtitle={emptyTxt.subtitle[lang] || emptyTxt.subtitle.es}
          ctaLabel={emptyTxt.cta[lang] || emptyTxt.cta.es}
          onCta={() => navigation.navigate('Ciclo')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{greeting}</Text>
          <Text style={styles.headerTitle}>
            {isHormonalContra ? `💊 ${{ es: 'Ciclo con AC', en: 'Cycle on BC', fr: 'Cycle sous CO', it: 'Ciclo con AC' }[lang] || 'Ciclo con AC'}` : `${d?.emoji} ${h.phase} ${d?.name}`}
          </Text>
        </View>
        <View style={styles.dayBadge}>
          <Text style={styles.dayNum}>{pi?.day}</Text>
          <Text style={styles.dayLabel}>{h.cycleDay}</Text>
        </View>
      </View>
      <View style={styles.headerTag}>
        <Text style={styles.headerTagText}>
          {isHormonalContra
            ? `${{ es: 'Fases hormonales no aplican', en: 'Hormonal phases don\'t apply', fr: 'Phases hormonales non applicables', it: 'Fasi ormonali non applicable' }[lang] || 'Fases hormonales no aplican'} · ${h.remaining} `
            : `${d?.tagline} · ${h.remaining} `}
          <Text style={{ fontWeight: '700' }}>{pi?.daysLeft} {h.daysLeft}</Text>
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>{h.yourCycle}</Text>
            <Text style={styles.cardMuted}>{h.dayOf} {pi?.day} {h.of} {pi?.cycleLen}</Text>
          </View>
          {isHormonalContra ? (
            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10, marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                💊 {{ es: 'Con anticoncepción hormonal las fases no se muestran', en: 'Cycle phases not shown with hormonal contraception', fr: 'Phases non affichées avec contraception hormonale', it: 'Fasi non mostrate con contraccezione ormonale' }[lang]}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.progressBar}>
                {pKeys.map(ph => {
                  const [s, e] = pR[ph];
                  const w = ((e - s + 1) / (pi?.cycleLen || 28)) * 100;
                  return <View key={ph} style={{ width: `${w}%`, backgroundColor: ph === pi?.phase ? PHASES[ph].color : PHASES[ph].mid }} />;
                })}
              </View>
              <View style={styles.phaseLabels}>
                {pKeys.map(ph => <Text key={ph} style={[styles.phaseLabel, { color: ph === pi?.phase ? PHASES[ph].color : '#CBD5E1', fontWeight: ph === pi?.phase ? '700' : '400' }]}>{PHASES[ph].emoji} {PHASES[ph].name.slice(0, 3)}</Text>)}
              </View>
              <View style={[styles.tagBg, { backgroundColor: d?.mid }]}>
                <Text style={[styles.tagText, { color: d?.color }]}>{d?.tagline}</Text>
                <Text style={styles.tagMuted}> · {h.remaining} <Text style={{ fontWeight: '700' }}>{pi?.daysLeft} {pi?.daysLeft !== 1 ? c.days : c.day}</Text></Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.grid}>
          {!isHormonalContra && (
            <View style={[styles.card, styles.gridCard]}>
              <Text style={styles.cardLabel}>{h.intensityToday}</Text>
              <Text style={[styles.intensity, { color: d?.color }]}>{d?.intensity}</Text>
              <View style={styles.intensityBar}>
                <View style={[styles.intensityFill, { width: `${d?.intensityPct}%`, backgroundColor: d?.color }]} />
              </View>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Gimnasio')} style={[styles.card, styles.gridCard]}>
  <Text style={styles.cardLabel}>{h.sessionToday}</Text>
  <Text style={{ fontSize: 22 }}>{todaySession?.ico ?? '😴'}</Text>
  <Text style={styles.sessionName}>{todaySession?.name ?? (lang === 'en' ? 'Rest' : lang === 'fr' ? 'Repos' : 'Descanso')}</Text>
  {todaySession?.dur ? <Text style={[styles.sessionDur, { color: BLUE.primary }]}>{todaySession.dur}</Text> : null}
</TouchableOpacity>
        </View>

{/* ── RACHA ── */}
{(() => {
  const adh = calcAdherence(profile?.profileExtended?.activityLog || {}, 30);
  if (adh.streak < 1) return null;
  const streakTxt = {
    title:  { es: '¡Vas genial!', en: 'You\'re on fire!', fr: 'Tu es en feu !', it: 'Sei in forma!' },
    days:   { es: 'días seguidos', en: 'days in a row', fr: 'jours de suite', it: 'giorni di fila' },
    msg1:   { es: 'Sigue así, estás construyendo un hábito real.', en: 'Keep it up, you\'re building a real habit.', fr: 'Continue, tu construis une vraie habitude.', it: 'Continua così, stai costruendo un\'abitudine vera.' },
    msg7:   { es: '¡Una semana entera! Tu cuerpo ya lo nota.', en: 'A full week! Your body can already feel it.', fr: 'Une semaine entière ! Ton corps le ressent déjà.', it: 'Una settimana intera! Il tuo corpo lo sente già.' },
    msg14:  { es: 'Dos semanas. Esto ya es un estilo de vida.', en: 'Two weeks. This is already a lifestyle.', fr: 'Deux semaines. C\'est déjà un mode de vie.', it: 'Due settimane. È già uno stile di vita.' },
    msg30:  { es: '¡Un mes! Eres imparable.', en: 'One month! You\'re unstoppable.', fr: 'Un mois ! Tu es inarrêtable.', it: 'Un mese! Sei inarrestabile.' },
  };
  const msg = adh.streak >= 30 ? streakTxt.msg30 : adh.streak >= 14 ? streakTxt.msg14 : adh.streak >= 7 ? streakTxt.msg7 : streakTxt.msg1;
  const streakColor = adh.streak >= 14 ? '#7C3AED' : adh.streak >= 7 ? '#D97706' : '#1A56DB';
  const streakBg = adh.streak >= 14 ? 'rgba(124,58,237,0.07)' : adh.streak >= 7 ? 'rgba(217,119,6,0.07)' : 'rgba(26,86,219,0.07)';
  return (
    <View style={[styles.card, { marginBottom: 12, borderLeftWidth: 3, borderLeftColor: streakColor }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500', marginBottom: 2 }}>{streakTxt.title[lang] || streakTxt.title.es}</Text>
          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>{msg[lang] || msg.es}</Text>
        </View>
        <View style={{ backgroundColor: streakBg, borderRadius: 14, padding: 12, alignItems: 'center', minWidth: 64 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: streakColor, lineHeight: 30 }}>{adh.streak}</Text>
          <Text style={{ fontSize: 10, color: streakColor, marginTop: 1 }}>🔥 {streakTxt.days[lang] || streakTxt.days.es}</Text>
        </View>
      </View>
    </View>
  );
})()}

{/* ── SUEÑO + NUTRICIÓN lado a lado ── */}
{(() => {
  const s = healthData?.lastSleep;
  const adh = calcAdherence(profile?.profileExtended?.activityLog || {}, 7);
  const hasNutri = adh.recipesPct != null;
  const hasWorkout = adh.workoutsPct != null;
  if (!s && !hasNutri && !hasWorkout) return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Nutrición')} style={{ flex: 1, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 12, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
        <Text style={{ fontSize: 22, marginBottom: 4 }}>🥗</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#16A34A' }}>{sleepTxt.nutri[lang] || sleepTxt.nutri.es}</Text>
        <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
          {{ es: 'Ver plan →', en: 'View plan →', fr: 'Voir plan →', it: 'Vedi piano →' }[lang] || 'Ver plan →'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const sleepTxt = {
    title:  { es: 'Sueño', en: 'Sleep', fr: 'Sommeil', it: 'Sonno' },
    nutri:  { es: 'Nutrición', en: 'Nutrition', fr: 'Nutrition', it: 'Nutrizione' },
    workout:{ es: 'Entreno', en: 'Workout', fr: 'Entraînement', it: 'Allenamento' },
    streak: { es: 'racha', en: 'streak', fr: 'série', it: 'serie' },
  };
  const sleepEmoji = !s ? '🌙' : s.duration >= 7 ? '😴' : s.duration >= 6 ? '🌙' : '⚠️';
  const sleepColor = !s ? '#94A3B8' : s.duration >= 7 ? '#0284C7' : s.duration >= 6 ? '#7C3AED' : '#DC2626';

  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
      {/* Sueño */}
      {s && (
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 22, marginBottom: 4 }}>{sleepEmoji}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: sleepColor }}>{s.duration}</Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>h</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{sleepTxt.title[lang] || sleepTxt.title.es}</Text>
          {(s.deepSleep > 0 || s.remSleep > 0) && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {s.deepSleep > 0 && <Text style={{ fontSize: 10, color: '#0284C7', fontWeight: '600' }}>{s.deepSleep}h deep</Text>}
              {s.remSleep  > 0 && <Text style={{ fontSize: 10, color: '#7C3AED', fontWeight: '600' }}>{s.remSleep}h rem</Text>}
            </View>
          )}
        </View>
      )}
      {/* Nutrición */}
      {hasNutri && (
        <View style={{ flex: 1, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 12, alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 22, marginBottom: 4 }}>🥗</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#16A34A' }}>{adh.recipesPct}</Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>%</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{sleepTxt.nutri[lang] || sleepTxt.nutri.es}</Text>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{adh.recipesDone}/{adh.recipesTotal}</Text>
        </View>
      )}
      {/* Entreno */}
      {hasWorkout && (
        <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 12, alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 22, marginBottom: 4 }}>🏋️</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: BLUE.primary }}>{adh.workoutsPct}</Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>%</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{sleepTxt.workout[lang] || sleepTxt.workout.es}</Text>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{adh.workoutsDone}/{adh.workoutsTotal}</Text>
          {adh.streak > 0 && <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '700', marginTop: 3 }}>🔥 {adh.streak}</Text>}
        </View>
      )}
    </View>
  );
})()}

{cals && (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>{h.caloriesGoal}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: d?.color }}>{cals.total}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{h.kcalPhase}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#475569' }}>{cals.tdee}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{h.kcalMaint}</Text>
      </View>
      <View style={{ backgroundColor: d?.mid, borderRadius: 10, padding: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: d?.color }}>{d?.kcal?.split('·')[0]}</Text>
      </View>
    </View>
  </View>
)}
        <TouchableOpacity onPress={() => navigation.navigate('Nutrición')} style={styles.card}>
  <Text style={styles.sectionTitle}>{h.nutritionToday}</Text>
  <View style={styles.tags}>
    {d?.focus?.map(f => <View key={f} style={styles.tag}><Text style={styles.tagLabel}>{f}</Text></View>)}
  </View>
  <View style={[styles.highlight, { borderLeftColor: BLUE.primary }]}>
    <Text style={styles.highlightTitle}>{d?.meals?.[0]?.ico} {d?.meals?.[0]?.title}</Text>
    <Text style={styles.highlightSub}>{getMealLabel(lang, d?.meals?.[0]?.t)} · {d?.meals?.[0]?.items?.slice(0,2).join(' · ')}</Text>
  </View>
</TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{h.phaseTip}</Text>
          <Text style={styles.tip}>"{d?.tip}"</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  header: { backgroundColor: '#1A56DB', padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: { fontSize: 24, color: 'white', fontWeight: '700', marginTop: 4 },
  dayBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dayNum: { fontSize: 28, color: 'white', fontWeight: '700', lineHeight: 32 },
  dayLabel: { fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5, marginTop: 2 },
  headerTag: { backgroundColor: '#1A56DB', paddingHorizontal: 20, paddingBottom: 20 },
  headerTagInner: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12 },
  headerTagText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontStyle: 'italic' },
  scroll: { flex: 1 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  cardMuted: { fontSize: 12, color: '#94A3B8' },
  progressBar: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', height: 10, marginBottom: 10 },
  phaseLabels: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  phaseLabel: { fontSize: 9 },
  tagBg: { borderRadius: 10, padding: 10 },
  tagText: { fontSize: 13, fontWeight: '700' },
  tagMuted: { fontSize: 13, color: '#475569' },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridCard: { flex: 1, margin: 0 },
  intensity: { fontSize: 20, fontWeight: '700', marginVertical: 4 },
  intensityBar: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  intensityFill: { height: '100%', borderRadius: 2 },
  sessionName: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginTop: 4 },
  sessionDur: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: 'rgba(26,86,219,0.10)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagLabel: { fontSize: 11, color: '#1A56DB', fontWeight: '500' },
  highlight: { borderLeftWidth: 3, paddingLeft: 12 },
  highlightTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  highlightSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  tip: { fontSize: 13, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
});