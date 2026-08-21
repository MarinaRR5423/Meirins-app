import React, { useState, useMemo } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft, ChevronRight, Check, Minus, Plus, Clock } from 'lucide-react-native';
import { SPORTS_LIST } from './TabSetupCard';
import { F } from '../theme/fonts';
import BText from './BText';

// ─── i18n ────────────────────────────────────────────────────────────────────
const MONTH_NAMES = {
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
};
const MONTH_SHORT = {
  es: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  fr: ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'],
  it: ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSportLabel(sportId, lang) {
  const sport = SPORTS_LIST.find(s => s.id === sportId);
  return sport ? (sport.label[lang] || sport.label.es) : sportId;
}

function computeStreak(activityLog) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = activityLog[key];
    if (entry?.workout === 'done' || entry?.workout === 'extra') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Brand green ─────────────────────────────────────────────────────────────
const GREEN_BG   = 'rgba(73,207,56,0.14)';
const GREEN_TEXT = '#0b3d07';
const GREEN_SUB  = '#1a5c15';

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkoutHistoryModal({ visible, onClose, activityLog = {}, lang = 'es' }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] ?? es);

  // All entries sorted newest-first
  const allEntries = useMemo(() => (
    Object.entries(activityLog)
      .filter(([, v]) => v?.workout)
      .sort((a, b) => b[0].localeCompare(a[0]))
  ), [activityLog]);

  // Entries for selected month
  const monthEntries = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    return allEntries.filter(([k]) => k.startsWith(prefix));
  }, [allEntries, year, month]);

  // Stats
  const stats = useMemo(() => {
    const done   = monthEntries.filter(([, v]) => v.workout === 'done' || v.workout === 'extra').length;
    const rested = monthEntries.filter(([, v]) => v.workout === 'skipped').length;
    const sportCount = {};
    monthEntries.forEach(([, v]) => {
      if (v.extraSport) sportCount[v.extraSport] = (sportCount[v.extraSport] || 0) + 1;
    });
    const topSport = Object.entries(sportCount).sort((a, b) => b[1] - a[1])[0] ?? null;
    return { done, rested, topSport, sportCount, streak: computeStreak(activityLog) };
  }, [monthEntries, activityLog]);

  // Nav limits
  const earliest = allEntries.length
    ? new Date(allEntries[allEntries.length - 1][0] + 'T12:00:00')
    : today;
  const canGoPrev = !(year === earliest.getFullYear() && month === earliest.getMonth());
  const canGoNext = !(year === today.getFullYear()    && month === today.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthNames = MONTH_NAMES[lang] ?? MONTH_NAMES.es;
  const monthShort = MONTH_SHORT[lang] ?? MONTH_SHORT.es;

  const sortedSports = Object.entries(stats.sportCount).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedSports[0]?.[1] ?? 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <BText style={s.headerEye}>{tr('Entrenamiento', 'Workout', 'Entraînement', 'Allenamento')}</BText>
            <BText style={s.headerTitle}>{tr('Registro & Histórico', 'Log & History', 'Journal & Historique', 'Registro & Storico')}</BText>
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

          {/* ── Month nav ────────────────────────────────────────────────────── */}
          <View style={s.monthNav}>
            <TouchableOpacity
              style={[s.monthArrow, !canGoPrev && { opacity: 0.3 }]}
              onPress={goPrev} disabled={!canGoPrev} activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#0A0A0A" />
            </TouchableOpacity>
            <BText style={s.monthLabel}>{monthNames[month]} {year}</BText>
            <TouchableOpacity
              style={[s.monthArrow, !canGoNext && { opacity: 0.3 }]}
              onPress={goNext} disabled={!canGoNext} activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#0A0A0A" />
            </TouchableOpacity>
          </View>

          {/* ── Stats ────────────────────────────────────────────────────────── */}
          <BText style={s.sectionLabel}>{tr('Este mes', 'This month', 'Ce mois', 'Questo mese')}</BText>
          <View style={s.statsGrid}>

            <View style={[s.statCard, { backgroundColor: GREEN_BG }]}>
              <BText style={[s.statVal, { color: GREEN_TEXT }]}>{stats.done}</BText>
              <BText style={[s.statLbl, { color: GREEN_SUB }]}>
                {tr('Sesiones completadas', 'Sessions completed', 'Séances complétées', 'Sessioni completate')}
              </BText>
            </View>

            <View style={s.statCard}>
              <BText style={s.statVal}>{stats.streak > 0 ? `🔥 ${stats.streak}` : '—'}</BText>
              <BText style={s.statLbl}>{tr('Racha (días)', 'Streak (days)', 'Série (jours)', 'Serie (giorni)')}</BText>
            </View>

            <View style={s.statCard}>
              <BText style={s.statVal} numberOfLines={1}>
                {stats.topSport ? getSportLabel(stats.topSport[0], lang) : '—'}
              </BText>
              <BText style={s.statLbl}>{tr('Deporte más frecuente', 'Most frequent sport', 'Sport le plus fréquent', 'Sport più frequente')}</BText>
            </View>

            <View style={s.statCard}>
              <BText style={s.statVal}>{stats.rested}</BText>
              <BText style={s.statLbl}>{tr('Días de descanso', 'Rest days', 'Jours de repos', 'Giorni di riposo')}</BText>
            </View>

          </View>

          {/* ── Log list ─────────────────────────────────────────────────────── */}
          <BText style={s.sectionLabel}>
            {monthEntries.length > 0
              ? tr(`${monthEntries.length} días registrados`, `${monthEntries.length} days logged`, `${monthEntries.length} jours enregistrés`, `${monthEntries.length} giorni registrati`)
              : tr('Días registrados', 'Days logged', 'Jours enregistrés', 'Giorni registrati')}
          </BText>

          {monthEntries.length === 0 ? (
            <View style={s.emptyBox}>
              <BText style={s.emptyTxt}>
                {tr('Sin registros este mes', 'No entries this month', 'Aucun enregistrement ce mois', 'Nessuna registrazione questo mese')}
              </BText>
            </View>
          ) : (
            <View style={s.logList}>
              {monthEntries.map(([dateKey, entry]) => {
                const day    = parseInt(dateKey.split('-')[2], 10);
                const status = entry.workout;
                const isDone  = status === 'done';
                const isExtra = status === 'extra';
                const isSkip  = status === 'skipped';

                const sportLabel = entry.extraSport ? getSportLabel(entry.extraSport, lang) : null;
                const mins = entry.extraMinutes ?? null;

                const bgColor     = isDone ? GREEN_BG    : isExtra ? '#EFF6FF' : '#F5F5F5';
                const tc          = isDone ? GREEN_TEXT  : isExtra ? '#1a3a6c' : '#737373';
                const borderColor = isDone ? '#49CF3866' : isExtra ? '#429FE766' : '#E5E7EB';

                let mainText = '';
                if (isDone)       mainText = sportLabel
                  ? `${tr('Sesión','Session','Séance','Sessione')} · ${sportLabel}`
                  : tr('Sesión completada', 'Session completed', 'Séance complétée', 'Sessione completata');
                else if (isExtra) mainText = sportLabel || tr('Actividad extra', 'Extra activity', 'Activité extra', 'Attività extra');
                else              mainText = tr('Descanso', 'Rest day', 'Repos', 'Riposo');

                return (
                  <View key={dateKey} style={[s.logRow, { backgroundColor: bgColor, marginBottom: 2 }]}>
                    <View style={[s.logDayCol, { borderRightColor: borderColor }]}>
                      <BText style={[s.logDayNum, { color: tc }]}>{day}</BText>
                      <BText style={[s.logDayMon, { color: tc }]}>{monthShort[month]}</BText>
                    </View>
                    <View style={s.logContent}>
                      <View style={s.logMainRow}>
                        {isDone  && <Check  size={13} color={tc} strokeWidth={2.5} />}
                        {isExtra && <Plus   size={13} color={tc} strokeWidth={2.5} />}
                        {isSkip  && <Minus  size={13} color={tc} strokeWidth={2}   />}
                        <BText style={[s.logMainTxt, { color: tc }]} numberOfLines={1}>{mainText}</BText>
                      </View>
                      {!!mins && (
                        <View style={s.logSubRow}>
                          <Clock size={11} color={tc} strokeWidth={2} />
                          <BText style={[s.logSubTxt, { color: tc }]}>{mins} min</BText>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Sports frequency ─────────────────────────────────────────────── */}
          {sortedSports.length > 0 && (
            <>
              <BText style={s.sectionLabel}>
                {tr('Deportes este mes', 'Sports this month', 'Sports ce mois', 'Sport questo mese')}
              </BText>
              <View style={s.trendCard}>
                {sortedSports.map(([sportId, count]) => (
                  <View key={sportId} style={s.barRow}>
                    <BText style={s.barName}>{getSportLabel(sportId, lang)}</BText>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${Math.round(count / maxCount * 100)}%` }]} />
                    </View>
                    <BText style={s.barN}>{count}</BText>
                  </View>
                ))}
              </View>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
  },
  headerEye: {
    fontSize: 10, fontFamily: F.body, color: '#737373',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2,
  },
  headerTitle: { fontSize: 18, fontFamily: F.bodyB, color: '#0A0A0A' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F5F5F5', borderWidth: 0.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },

  body: { padding: 16, gap: 12 },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', borderRadius: 14, borderWidth: 0.5, borderColor: '#E5E7EB',
    paddingHorizontal: 4, height: 48,
  },
  monthArrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  monthLabel: { fontSize: 15, fontFamily: F.bodyB, color: '#0A0A0A', letterSpacing: -0.2 },

  sectionLabel: {
    fontSize: 10, fontFamily: F.body, color: '#737373',
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#F5F5F5',
    borderRadius: 14, padding: 14, gap: 4,
  },
  statVal: { fontSize: 24, fontFamily: F.headingX, color: '#0A0A0A', lineHeight: 28 },
  statLbl: { fontSize: 11, fontFamily: F.body, color: '#737373', lineHeight: 15 },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyTxt: { fontSize: 13, fontFamily: F.body, color: '#9CA3AF' },

  logList: { gap: 2 },
  logRow: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 12, overflow: 'hidden' },
  logDayCol: {
    width: 48, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRightWidth: 1,
  },
  logDayNum: { fontSize: 18, fontFamily: F.bodyB, lineHeight: 22 },
  logDayMon: { fontSize: 9, fontFamily: F.body, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 },
  logContent: { flex: 1, paddingHorizontal: 10, paddingVertical: 9, justifyContent: 'center', gap: 3 },
  logMainRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logMainTxt: { fontSize: 12, fontFamily: F.bodyB, flex: 1 },
  logSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.7 },
  logSubTxt: { fontSize: 11, fontFamily: F.body },

  trendCard: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barName: { fontSize: 11, fontFamily: F.body, color: '#737373', width: 92 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: '#0A0A0A' },
  barN: { fontSize: 10, fontFamily: F.body, color: '#9CA3AF', width: 22, textAlign: 'right' },
});
