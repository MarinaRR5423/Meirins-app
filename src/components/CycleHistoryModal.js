import React, { useState, useMemo } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, ChevronLeft, ChevronRight,
  Droplets, Smile, Zap, Moon, Activity,
} from 'lucide-react-native';
import { CYCLE_CATEGORIES } from '../data/cycleTracking';
import { F } from '../theme/fonts';
import BText from './BText';

// ─── Phase palette (same as CicloScreen) ─────────────────────────────────────
const PHASE_COLORS = { menstrual:'#92E288', follicular:'#C79ADF', ovulation:'#FEDF68', luteal:'#FEA068' };
const PHASE_BG     = { menstrual:'#b6ecaf', follicular:'#d9bce9', ovulation:'#ffea9b', luteal:'#ffbf9b' };
const PHASE_TEXT   = { menstrual:'#0b1f08', follicular:'#180d1e', ovulation:'#261e01', luteal:'#260e01' };
const PHASES_ORDER = ['menstrual', 'follicular', 'ovulation', 'luteal'];

// ─── i18n helpers ─────────────────────────────────────────────────────────────
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

// ─── Which categories to show per row ────────────────────────────────────────
const ROW_CATS = [
  { id: 'flow',          Icon: Droplets },
  { id: 'feelings',      Icon: Smile    },
  { id: 'energy',        Icon: Zap      },
  { id: 'sleep_quality', Icon: Moon     },
  { id: 'pain',          Icon: Activity },
];

// ─── Phase computation ────────────────────────────────────────────────────────
function getPhaseForDate(dateStr, lastPeriodStr, cycleLen = 28) {
  if (!lastPeriodStr) return null;
  const diff = Math.floor(
    (new Date(dateStr + 'T12:00:00') - new Date(lastPeriodStr + 'T12:00:00')) / 86400000,
  );
  const day = ((diff % cycleLen) + cycleLen) % cycleLen + 1;
  if (day <= 5)  return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

// ─── Label lookup ─────────────────────────────────────────────────────────────
function getLabel(catId, value, lang) {
  const cat = CYCLE_CATEGORIES.find(c => c.id === catId);
  if (!cat || !value) return null;
  if (Array.isArray(value)) {
    const labels = value
      .map(v => cat.options.find(o => o.id === v)?.label?.[lang] || v)
      .filter(Boolean);
    return labels.length ? labels.join(' · ') : null;
  }
  return cat.options.find(o => o.id === value)?.label?.[lang] || value;
}

// ─── Trend computation ────────────────────────────────────────────────────────
const ENERGY_SCORE = { exhausted: 1, tired: 2, ok: 3, energetic: 4 };

function computeTrends(allEntries, lang) {
  if (allEntries.length < 7) return null;

  const energyByPhase  = { menstrual:[], follicular:[], ovulation:[], luteal:[] };
  const painByPhase    = { menstrual:[], follicular:[], ovulation:[], luteal:[] };
  const feelingCount   = {};
  const feelingsByPhase = { menstrual:{}, follicular:{}, ovulation:{}, luteal:{} };

  allEntries.forEach(({ phase, data }) => {
    if (!phase || !data) return;

    if (data.energy && ENERGY_SCORE[data.energy] != null) {
      energyByPhase[phase].push(ENERGY_SCORE[data.energy]);
    }
    if (data.pain) {
      const pains = Array.isArray(data.pain) ? data.pain : [data.pain];
      painByPhase[phase].push(pains.some(p => p !== 'none') ? 1 : 0);
    }
    if (data.feelings) {
      const fs = Array.isArray(data.feelings) ? data.feelings : [data.feelings];
      fs.forEach(id => {
        feelingCount[id] = (feelingCount[id] || 0) + 1;
        feelingsByPhase[phase][id] = (feelingsByPhase[phase][id] || 0) + 1;
      });
    }
  });

  // Normalize energy 0–100%
  const avgEnergy = {};
  const painFreq  = {};
  PHASES_ORDER.forEach(ph => {
    const e = energyByPhase[ph];
    avgEnergy[ph] = e.length ? Math.round(e.reduce((a, b) => a + b, 0) / e.length / 4 * 100) : 0;
    const p = painByPhase[ph];
    painFreq[ph] = p.length ? Math.round(p.reduce((a, b) => a + b, 0) / p.length * 100) : 0;
  });

  // Top feelings
  const feelingsCat = CYCLE_CATEGORIES.find(c => c.id === 'feelings');
  const topFeelings = Object.entries(feelingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => ({
      id,
      label: feelingsCat?.options.find(o => o.id === id)?.label?.[lang] || id,
      pct: Math.round(count / allEntries.length * 100),
    }));

  // Insight: most anxious phase (with at least 3 entries)
  let insightPhase = null;
  let maxAnxietyRatio = 0;
  PHASES_ORDER.forEach(ph => {
    const total = allEntries.filter(e => e.phase === ph).length;
    const anxious = feelingsByPhase[ph]['anxious'] || 0;
    if (total >= 3 && anxious / total > maxAnxietyRatio) {
      maxAnxietyRatio = anxious / total;
      insightPhase = ph;
    }
  });

  return { avgEnergy, painFreq, topFeelings, insightPhase, totalDays: allEntries.length };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CycleHistoryModal({
  visible,
  onClose,
  lang = 'es',
  cycleDailyLogs = {},
  lastPeriod,
  cycleLength = 28,
}) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] ?? es);

  const PHASE_NAMES = {
    menstrual:  tr('Menstrual',  'Menstrual',   'Menstruelle',   'Mestruale'),
    follicular: tr('Folicular',  'Follicular',  'Folliculaire',  'Follicolare'),
    ovulation:  tr('Ovulación',  'Ovulation',   'Ovulation',     'Ovulazione'),
    luteal:     tr('Lútea',      'Luteal',      'Lutéale',       'Luteinica'),
  };

  // All entries sorted newest-first
  const allEntries = useMemo(() => (
    Object.entries(cycleDailyLogs)
      .filter(([, v]) => v && typeof v === 'object')
      .map(([date, data]) => ({
        date,
        phase: getPhaseForDate(date, lastPeriod, cycleLength),
        data,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  ), [cycleDailyLogs, lastPeriod, cycleLength]);

  // Entries for the selected month
  const monthEntries = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    return allEntries.filter(e => e.date.startsWith(prefix));
  }, [allEntries, year, month]);

  // Navigation limits
  const earliest = allEntries.length
    ? new Date(allEntries[allEntries.length - 1].date + 'T12:00:00')
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

  const trends = useMemo(() => computeTrends(allEntries, lang), [allEntries, lang]);

  const monthNames = MONTH_NAMES[lang] ?? MONTH_NAMES.es;
  const monthShort = MONTH_SHORT[lang] ?? MONTH_SHORT.es;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <BText style={s.headerEye}>{tr('Histórico', 'History', 'Historique', 'Storico')}</BText>
            <BText style={s.headerTitle}>{tr('Registro & Histórico', 'Log & History', 'Journal & Historique', 'Registro & Storico')}</BText>
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

          {/* ── Month nav ───────────────────────────────────────────────────── */}
          <View style={s.monthNav}>
            <TouchableOpacity
              style={[s.monthArrow, !canGoPrev && { opacity: 0.3 }]}
              onPress={goPrev}
              disabled={!canGoPrev}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#0A0A0A" />
            </TouchableOpacity>
            <BText style={s.monthLabel}>{monthNames[month]} {year}</BText>
            <TouchableOpacity
              style={[s.monthArrow, !canGoNext && { opacity: 0.3 }]}
              onPress={goNext}
              disabled={!canGoNext}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#0A0A0A" />
            </TouchableOpacity>
          </View>

          {/* ── Log list ────────────────────────────────────────────────────── */}
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
              {monthEntries.map(({ date, phase, data }) => {
                const day = parseInt(date.split('-')[2], 10);
                const bg     = phase ? PHASE_BG[phase]    : '#F5F5F5';
                const tc     = phase ? PHASE_TEXT[phase]  : '#0A0A0A';
                const border = phase ? PHASE_COLORS[phase]: '#E5E7EB';
                return (
                  <View key={date} style={[s.logRow, { backgroundColor: bg }]}>
                    {/* Day */}
                    <View style={[s.logDayCol, { borderRightColor: border + '88' }]}>
                      <BText style={[s.logDayNum, { color: tc }]}>{day}</BText>
                      <BText style={[s.logDayMon, { color: tc }]}>{monthShort[month]}</BText>
                    </View>
                    {/* Chips */}
                    <View style={s.logContent}>
                      {ROW_CATS.map(({ id, Icon }) => {
                        const label = getLabel(id, data[id], lang);
                        if (!label) return null;
                        return (
                          <View key={id} style={s.logChip}>
                            <Icon size={11} color={tc} strokeWidth={2} />
                            <BText style={[s.logChipTxt, { color: tc }]}>{label}</BText>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Trends ──────────────────────────────────────────────────────── */}
          {trends && (
            <>
              <View style={s.divider} />
              <BText style={s.sectionLabel}>
                {tr(
                  `Tendencias · ${trends.totalDays} días`,
                  `Trends · ${trends.totalDays} days`,
                  `Tendances · ${trends.totalDays} jours`,
                  `Tendenze · ${trends.totalDays} giorni`,
                )}
              </BText>

              {/* Insight */}
              {trends.insightPhase && (
                <View style={s.insightBox}>
                  <BText style={s.insightTxt}>
                    {tr(
                      `Durante tu fase ${PHASE_NAMES[trends.insightPhase].toLowerCase()} sueles sentirte más ansiosa. Considera reducir el estrés esa semana.`,
                      `During your ${PHASE_NAMES[trends.insightPhase].toLowerCase()} phase you tend to feel more anxious. Consider reducing stress that week.`,
                      `Durant ta phase ${PHASE_NAMES[trends.insightPhase].toLowerCase()}, tu te sens souvent plus anxieuse. Essaie de réduire le stress cette semaine.`,
                      `Durante la fase ${PHASE_NAMES[trends.insightPhase].toLowerCase()} tendi a sentirti più ansiosa. Considera di ridurre lo stress quella settimana.`,
                    )}
                  </BText>
                </View>
              )}

              {/* Energy per phase */}
              <View style={s.trendCard}>
                <BText style={s.trendTitle}>
                  {tr('Energía media por fase', 'Average energy by phase', 'Énergie moyenne par phase', 'Energia media per fase')}
                </BText>
                {PHASES_ORDER.map(ph => (
                  <View key={ph} style={s.barRow}>
                    <BText style={s.barPhase}>{PHASE_NAMES[ph]}</BText>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${trends.avgEnergy[ph]}%`, backgroundColor: PHASE_COLORS[ph] }]} />
                    </View>
                    <BText style={s.barPct}>{trends.avgEnergy[ph]}%</BText>
                  </View>
                ))}
              </View>

              {/* Pain frequency per phase */}
              <View style={s.trendCard}>
                <BText style={s.trendTitle}>
                  {tr('Frecuencia de dolor por fase', 'Pain frequency by phase', 'Fréquence de douleur par phase', 'Frequenza dolore per fase')}
                </BText>
                {PHASES_ORDER.map(ph => (
                  <View key={ph} style={s.barRow}>
                    <BText style={s.barPhase}>{PHASE_NAMES[ph]}</BText>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${trends.painFreq[ph]}%`, backgroundColor: PHASE_COLORS[ph] }]} />
                    </View>
                    <BText style={s.barPct}>{trends.painFreq[ph]}%</BText>
                  </View>
                ))}
              </View>

              {/* Top feelings */}
              {trends.topFeelings.length > 0 && (
                <View style={s.trendCard}>
                  <BText style={s.trendTitle}>
                    {tr('Sentimientos más frecuentes', 'Most frequent feelings', 'Sentiments les plus fréquents', 'Sentimenti più frequenti')}
                  </BText>
                  <View style={s.feelingsRow}>
                    {trends.topFeelings.map(f => (
                      <View key={f.id} style={s.feelingTag}>
                        <Smile size={11} color="#0A0A0A" strokeWidth={2} />
                        <BText style={s.feelingTagTxt}>{f.label}</BText>
                        <BText style={s.feelingTagPct}>{f.pct}%</BText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
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

  // Month nav
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

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyTxt: { fontSize: 13, fontFamily: F.body, color: '#9CA3AF' },

  // Log list
  logList: { gap: 2 },
  logRow: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 12, overflow: 'hidden' },
  logDayCol: {
    width: 48, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRightWidth: 1,
  },
  logDayNum: { fontSize: 18, fontFamily: F.bodyB, lineHeight: 22 },
  logDayMon: { fontSize: 9, fontFamily: F.body, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 },
  logContent: {
    flex: 1, padding: 10,
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignContent: 'center',
  },
  logChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logChipTxt: { fontSize: 11, fontFamily: F.body },

  divider: { height: 0.5, backgroundColor: '#E5E7EB', marginVertical: 4 },

  // Insight
  insightBox: {
    backgroundColor: 'rgba(73,207,56,0.10)', borderWidth: 0.5,
    borderColor: 'rgba(73,207,56,0.40)', borderRadius: 14, padding: 12,
  },
  insightTxt: { fontSize: 13, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20 },

  // Trend cards
  trendCard: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, gap: 8 },
  trendTitle: {
    fontSize: 10, fontFamily: F.bodyB, color: '#737373',
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barPhase: { fontSize: 11, fontFamily: F.body, color: '#737373', width: 72 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  barPct: { fontSize: 10, fontFamily: F.body, color: '#9CA3AF', width: 30, textAlign: 'right' },

  feelingsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  feelingTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EBEBEB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  feelingTagTxt: { fontSize: 11, fontFamily: F.body, color: '#0A0A0A' },
  feelingTagPct: { fontSize: 10, fontFamily: F.body, color: '#737373' },
});
