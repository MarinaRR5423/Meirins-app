import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PHASES } from '../data/phases';
import T, { getPhaseDisplay, getDayLetters } from '../i18n/translations';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import { CicloSetupCard, CicloHealthCard } from '../components/TabSetupCard';
import CycleTrackingModal from '../components/CycleTrackingModal';
import SwipeableTabs from '../components/SwipeableTabs';

const CICLO_ARTICLE_IDS = ['sleep-cycle', 'cycle-training'];
const cicloArticles = ARTICLES.filter(a => CICLO_ARTICLE_IDS.includes(a.id));

const BLUE = { primary: '#1A56DB', light: '#EFF6FF' };
const SCREEN_W = Dimensions.get('window').width;

const WHEEL_PHASES = [
  { key: 'menstrual',  days: 5,  color: '#FCA5A5', stroke: '#EF4444' },
  { key: 'follicular', days: 8,  color: '#93C5FD', stroke: '#3B82F6' },
  { key: 'ovulation',  days: 3,  color: '#FCD34D', stroke: '#F59E0B' },
  { key: 'luteal',     days: 12, color: '#C4B5FD', stroke: '#7C3AED' },
];

const QUALITY_MOONS = ['🌑','🌘','🌗','🌖','🌕'];
const QUALITY_COLORS = ['#94A3B8','#F97316','#F59E0B','#3B82F6','#7C3AED'];

// ─── Cycle visual (pure RN, no SVG) ───────────────────────────────────────────
function CycleOrbit({ pi, cycleLen }) {
  const totalDays = cycleLen || 28;
  const currentDay = pi?.day || null;
  const currentPhase = pi?.phase || null;
  const d = pi?.data;
  const barW = SCREEN_W - 60;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
      <View style={[orbitStyles.circle, { borderColor: d?.color || '#E2E8F0' }]}>
        <Text style={orbitStyles.circleEmoji}>{d?.emoji || '🌙'}</Text>
        <Text style={orbitStyles.circleDay}>{currentDay ?? '—'}</Text>
        <Text style={orbitStyles.circleLabel}>día del ciclo</Text>
        {d?.name && <Text style={[orbitStyles.circlePhaseName, { color: d.color }]}>{d.name}</Text>}
      </View>

      <View style={{ marginTop: 20, width: barW }}>
        <View style={{ flexDirection: 'row', borderRadius: 10, overflow: 'hidden', height: 14 }}>
          {WHEEL_PHASES.map(ph => {
            const widthPct = (ph.days / 28) * 100;
            const isActive = ph.key === currentPhase;
            return (
              <View key={ph.key} style={{ width: `${widthPct}%`, backgroundColor: isActive ? ph.stroke : ph.color, opacity: isActive ? 1 : 0.55 }} />
            );
          })}
        </View>
        {currentDay && (
          <View style={{ position: 'relative', height: 16 }}>
            <View style={[orbitStyles.dayMarker, { left: `${((currentDay - 1) / totalDays) * 100}%` }]} />
          </View>
        )}
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {WHEEL_PHASES.map(ph => {
            const widthPct = (ph.days / 28) * 100;
            const isActive = ph.key === currentPhase;
            return (
              <View key={ph.key} style={{ width: `${widthPct}%`, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: isActive ? ph.stroke : '#94A3B8', fontWeight: isActive ? '700' : '400' }}>{PHASES[ph.key]?.emoji}</Text>
                <Text style={{ fontSize: 8, color: isActive ? ph.stroke : '#94A3B8', fontWeight: isActive ? '700' : '400', textAlign: 'center' }}>{ph.key.slice(0,4)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={orbitStyles.legendRow}>
        {WHEEL_PHASES.map(ph => (
          <View key={ph.key} style={orbitStyles.legendItem}>
            <View style={[orbitStyles.legendDot, { backgroundColor: ph.color, borderColor: ph.stroke, borderWidth: 1.5 }]} />
            <Text style={orbitStyles.legendText}>{ph.days}d</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const orbitStyles = StyleSheet.create({
  circle: { width: 170, height: 170, borderRadius: 85, borderWidth: 6, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  circleEmoji: { fontSize: 36, marginBottom: 2 },
  circleDay: { fontSize: 38, fontWeight: '800', color: '#1E293B', lineHeight: 44 },
  circleLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5 },
  circlePhaseName: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  dayMarker: { position: 'absolute', top: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#1A56DB', borderWidth: 2, borderColor: 'white', marginLeft: -5, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 3 },
  legendRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, color: '#94A3B8' },
});

// ─── Calendar helpers ──────────────────────────────────────────────────────────
const PHASE_BG   = { menstrual:'#FECACA', follicular:'#BFDBFE', ovulation:'#FDE68A', luteal:'#DDD6FE' };
const PHASE_TEXT = { menstrual:'#991B1B', follicular:'#1E40AF', ovulation:'#92400E', luteal:'#5B21B6' };

function getPhaseForDate(dateStr, lastPeriodStr, cycleLen) {
  if (!lastPeriodStr) return null;
  const diff = Math.floor((new Date(dateStr + 'T12:00:00') - new Date(lastPeriodStr + 'T12:00:00')) / 86400000);
  const day = ((diff % cycleLen) + cycleLen) % cycleLen + 1;
  if (day <= 5)  return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

// ─── Sleep Tracker ─────────────────────────────────────────────────────────────
function SleepCard({ sleepLog, logSleep, lang }) {
  const sl = (T[lang] || T.es).sleep;
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = sleepLog.find(e => e.date === today);

  const [hours, setHours]     = useState(todayEntry?.hours || 7.5);
  const [quality, setQuality] = useState(todayEntry?.quality || 3);
  const [saved, setSaved]     = useState(!!todayEntry);

  const changeHours = (delta) => setHours(h => Math.min(12, Math.max(3, Math.round((h + delta) * 2) / 2)));

  const handleLog = async () => {
    await logSleep({ date: today, hours, quality });
    setSaved(true);
  };

  // Last 7 days for the mini chart
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const entry = sleepLog.find(e => e.date === dateStr);
      return { dateStr, entry, dayLetter: d.toLocaleDateString('default', { weekday: 'narrow' }) };
    });
  }, [sleepLog]);

  const avgHours = sleepLog.length > 0
    ? (sleepLog.slice(0, 7).reduce((s, e) => s + e.hours, 0) / Math.min(7, sleepLog.length)).toFixed(1)
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{sl.title}</Text>
        {avgHours && (
          <View style={styles.avgBadge}>
            <Text style={styles.avgText}>{sl.avgLabel} {avgHours}{sl.hoursShort}</Text>
          </View>
        )}
      </View>

      {/* Today's log */}
      <View style={styles.sleepLogRow}>
        <Text style={styles.sleepLabel}>{sl.todayLabel}</Text>
        <View style={styles.hoursRow}>
          <TouchableOpacity style={styles.hoursBtn} onPress={() => changeHours(-0.5)}><Text style={styles.hoursBtnText}>−</Text></TouchableOpacity>
          <Text style={styles.hoursValue}>{hours}{sl.hoursShort}</Text>
          <TouchableOpacity style={styles.hoursBtn} onPress={() => changeHours(0.5)}><Text style={styles.hoursBtnText}>+</Text></TouchableOpacity>
        </View>
      </View>

      {/* Quality picker */}
      <View style={styles.qualityRow}>
        <Text style={styles.sleepLabel}>{sl.quality}</Text>
        <View style={styles.qualityBtns}>
          {QUALITY_MOONS.map((moon, i) => (
            <TouchableOpacity key={i} onPress={() => setQuality(i + 1)}
              style={[styles.qualityBtn, quality === i + 1 && { backgroundColor: QUALITY_COLORS[i] + '22', borderColor: QUALITY_COLORS[i] }]}>
              <Text style={styles.qualityMoon}>{moon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={styles.qualityLabelText}>{sl.qualityLabels[quality - 1]}</Text>

      {/* Log button */}
      <TouchableOpacity
        style={[styles.logBtn, saved && styles.logBtnSaved]}
        onPress={handleLog}
      >
        <Text style={[styles.logBtnText, saved && styles.logBtnTextSaved]}>
          {saved ? sl.logged : sl.log}
        </Text>
      </TouchableOpacity>

      {/* 7-day chart */}
      {sleepLog.length > 0 ? (
        <View style={styles.sleepChart}>
          <Text style={styles.chartLabel}>{sl.history}</Text>
          <View style={styles.barsRow}>
            {last7.map(({ dateStr, entry, dayLetter }) => {
              const barH = entry ? Math.max(4, (entry.hours / 12) * 60) : 0;
              const qColor = entry ? QUALITY_COLORS[entry.quality - 1] : '#E2E8F0';
              const isToday = dateStr === today;
              return (
                <View key={dateStr} style={styles.barItem}>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { height: barH, backgroundColor: qColor }]} />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: BLUE.primary, fontWeight: '700' }]}>{dayLetter}</Text>
                  {entry && <Text style={styles.barHours}>{entry.hours}{sl.hoursShort}</Text>}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>{sl.noData}</Text>
      )}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CicloScreen({ pi, lastPeriod, setLastPeriod, setCycleLength, periodEnd, setPeriodEnd, sleepLog = [], logSleep, lang = 'es', profileExtended, saveProfileExtended, logCycleDay }) {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [view, setView]              = useState('calendar'); // 'calendar' | 'wheel'
  const [expandedPhase, setExpanded] = useState(pi?.phase || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const cy = (T[lang] || T.es).cycle;

  const today     = new Date();
  const todayStr  = today.toISOString().split('T')[0];
  const cycleLen  = pi?.cycleLen || 28;
  const d         = pi?.data;

  // Anticoncepción hormonal: oculta ventana fértil y fases hormonales proyectadas
  const contra = profileExtended?.contraception;
  const HORMONAL_CONTRA = ['pill', 'hormonal_iud', 'ring', 'patch', 'implant'];
  const isHormonalContra = HORMONAL_CONTRA.includes(contra);

  // Calendar — navegación por meses (0 = mes actual, negativo = pasado, positivo = pronóstico)
  const [calOffset, setCalOffset] = useState(0);
  const [marking, setMarking]     = useState(false);   // modo "marcar regla"
  const [markStart, setMarkStart] = useState(null);
  const [markEnd, setMarkEnd]     = useState(null);

  const calBase     = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
  const year        = calBase.getFullYear();
  const month       = calBase.getMonth();
  const monthName   = calBase.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES', { month: 'long', year: 'numeric' });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  // Historial de reglas reales (profile_extended.periodHistory) + el período vigente
  const periods = useMemo(() => {
    const hist = Array.isArray(profileExtended?.periodHistory)
      ? profileExtended.periodHistory.filter(p => p?.start) : [];
    const all = [...hist];
    if (lastPeriod && !all.some(p => p.start === lastPeriod)) {
      all.push({ start: lastPeriod, end: periodEnd || null });
    }
    return all.sort((a, b) => a.start.localeCompare(b.start));
  }, [profileExtended?.periodHistory, lastPeriod, periodEnd]);

  const inRealPeriod = (dateStr) => {
    const norm = dateStr.split('T')[0];
    return periods.some(p => {
      const pStart = p.start?.split('T')[0] || p.start;
      const pEnd   = (p.end?.split('T')[0]  || p.end)  || pStart;
      return norm >= pStart && norm <= pEnd;
    });
  };

  // Duración media real del ciclo (últimos 3 intervalos entre reglas) para el pronóstico
  const effectiveCycleLen = useMemo(() => {
    const starts = periods.map(p => p.start);
    if (starts.length < 2) return cycleLen;
    const gaps = [];
    for (let i = 1; i < starts.length; i++) {
      const g = Math.round((new Date(starts[i] + 'T12:00:00') - new Date(starts[i - 1] + 'T12:00:00')) / 86400000);
      if (g >= 18 && g <= 45) gaps.push(g);   // descarta huecos no plausibles (meses sin registrar)
    }
    if (!gaps.length) return cycleLen;
    const recent = gaps.slice(-3);
    return Math.round(recent.reduce((s, g) => s + g, 0) / recent.length);
  }, [periods, cycleLen]);

  // Modo marcar regla: la selección se puede ampliar y REDUCIR tocando
  // el nuevo inicio o fin (fix: antes un rango completo se reiniciaba y
  // los días sobrantes parecían no desmarcarse)
  const handleMarkTap = (dateStr) => {
    if (dateStr > todayStr) return;               // no se marcan reglas en el futuro
    if (!markStart) { setMarkStart(dateStr); return; }

    if (markEnd) {
      // Rango completo → ajustar inicio o fin
      const daysFromEnd = Math.round((new Date(dateStr + 'T12:00:00') - new Date(markEnd + 'T12:00:00')) / 86400000);
      if (daysFromEnd > 15) {
        // Toque muy lejano: es otra regla distinta → empezar selección nueva
        setMarkStart(dateStr); setMarkEnd(null);
      } else if (dateStr < markStart) {
        setMarkStart(dateStr);                    // ampliar por el inicio
      } else {
        setMarkEnd(dateStr);                      // mover el fin (reduce o amplía)
        if (dateStr < markStart) setMarkStart(dateStr);
      }
      return;
    }

    // Solo inicio marcado → segundo toque define el fin (con intercambio si va antes)
    if (dateStr < markStart) {
      setMarkEnd(markStart); setMarkStart(dateStr);
    } else {
      setMarkEnd(dateStr);
    }
  };

  const savePeriodMark = async () => {
    if (!markStart) return;
    const entry = { start: markStart, end: markEnd || markStart };
    const hist = Array.isArray(profileExtended?.periodHistory)
      ? profileExtended.periodHistory.filter(p => p?.start) : [];
    const overlaps = (p) => !((p.end || p.start) < entry.start || p.start > entry.end);
    const merged = hist.filter(p => !overlaps(p));   // reemplaza períodos solapados

    const isNewest = !lastPeriod || entry.start >= lastPeriod;
    if (isNewest) {
      // El período vigente pasa al historial; el nuevo se convierte en el actual
      const current = lastPeriod ? { start: lastPeriod, end: periodEnd || lastPeriod } : null;
      if (current && !overlaps(current) && !merged.some(p => p.start === current.start)) merged.push(current);
      merged.push(entry);
      merged.sort((a, b) => a.start.localeCompare(b.start));
      await saveProfileExtended({ periodHistory: merged.slice(-24), periodEnd: entry.end });
      await setLastPeriod(entry.start);
    } else {
      merged.push(entry);
      merged.sort((a, b) => a.start.localeCompare(b.start));
      await saveProfileExtended({ periodHistory: merged.slice(-24) });
    }
    setMarking(false); setMarkStart(null); setMarkEnd(null);
  };

  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

  const pDays = {
    menstrual:  cy.phaseDays.menstrual,
    follicular: cy.phaseDays.follicular,
    ovulation:  cy.phaseDays.ovulation,
    luteal:     cy.phaseDays.luteal + (cycleLen || 28),
  };
  const phaseInfo = cy.phaseInfo;

  const dateLocale = lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : 'es-ES';

  return (
    <SwipeableTabs tabs={['calendar', 'wheel']} current={view} onChange={setView}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── SETUP CARDS ── */}
      <CicloSetupCard
        lang={lang}
        lastPeriod={lastPeriod}
        setLastPeriod={setLastPeriod}
        cycleLength={pi?.cycleLen}
        setCycleLength={setCycleLength}
        profileExtended={profileExtended}
        saveProfileExtended={saveProfileExtended}
      />
      <CicloHealthCard
        lang={lang}
        profileExtended={profileExtended}
        saveProfileExtended={saveProfileExtended}
      />

      {/* ── HOY BANNER ── */}
      <View style={[styles.card, { backgroundColor: isHormonalContra ? '#6B7280' : (d?.color || BLUE.primary) }]}>
        <View style={styles.todayRow}>
          <View style={styles.todayBlock}>
            <Text style={styles.todayLabel}>{cy.cycleDay}</Text>
            <Text style={styles.todayDay}>{pi?.day ?? '—'}</Text>
          </View>
          <View style={styles.todayPhase}>
            {isHormonalContra ? (
              <>
                <Text style={{ fontSize: 34 }}>💊</Text>
                <Text style={styles.todayPhaseName}>{tr('Ciclo con AC', 'Cycle on BC', 'Cycle sous CO', 'Ciclo con AC')}</Text>
                <Text style={[styles.todayTagline, { opacity: 0.8 }]}>{tr('Fases no aplican', 'Phases don\'t apply', 'Phases non applicables', 'Fasi non applicable')}</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 34 }}>{d?.emoji}</Text>
                <Text style={styles.todayPhaseName}>{d?.name}</Text>
                <Text style={styles.todayTagline}>{d?.tagline}</Text>
              </>
            )}
          </View>
          <View style={styles.todayBlock}>
            <Text style={styles.todayLabel}>{cy.remaining}</Text>
            <Text style={styles.todayDay}>{pi?.daysLeft ?? '—'}</Text>
            <Text style={styles.todayLabel}>{cy.days}</Text>
          </View>
        </View>
      </View>

      {/* ── WHEEL VIEW ── */}
      {view === 'wheel' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{cy.myTitle}</Text>
            <TouchableOpacity onPress={() => setView('calendar')} style={styles.viewToggleBtn}>
              <Text style={styles.viewToggleBtnText}>📅</Text>
            </TouchableOpacity>
          </View>
          {isHormonalContra ? (
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
              <Text style={{ fontSize: 48 }}>💊</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151' }}>
                {tr('Anticoncepción hormonal activa', 'Hormonal contraception active', 'Contraception hormonale active', 'Contraccezione ormonale attiva')}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 }}>
                {tr(
                  'Las fases del ciclo (folicular, ovulación, lútea) no se muestran porque la anticoncepción hormonal suprime la ovulación y altera el patrón hormonal natural.',
                  'Cycle phases (follicular, ovulation, luteal) are not shown because hormonal contraception suppresses ovulation and alters the natural hormonal pattern.',
                  'Les phases du cycle (folliculaire, ovulation, lutéale) ne sont pas affichées car la contraception hormonale supprime l\'ovulation et modifie le schéma hormonal naturel.',
                  'Le fasi del ciclo (follicolare, ovulazione, luteale) non vengono mostrate perché la contraccezione ormonale sopprime l\'ovulazione e altera il pattern ormonale naturale.',
                )}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 }}>
                {tr('Día del ciclo: ', 'Cycle day: ', 'Jour du cycle : ', 'Giorno del ciclo: ')}<Text style={{ fontWeight: '700', color: '#374151' }}>{pi?.day ?? '—'}</Text>
              </Text>
            </View>
          ) : (
            <>
              <CycleOrbit pi={pi} cycleLen={cycleLen} />
              {!pi && <Text style={styles.noDataNote}>{cy.noData}</Text>}
            </>
          )}
        </View>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <View style={[styles.card, { paddingHorizontal: 8 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
              <TouchableOpacity onPress={() => setCalOffset(o => Math.max(-24, o - 1))}
                style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 20, color: '#1A56DB', fontWeight: '700' }}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.cardTitle, { flex: 1, textAlign: 'center' }]}>
                {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setCalOffset(o => Math.min(6, o + 1))}
                style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 20, color: '#1A56DB', fontWeight: '700' }}>›</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setView('wheel')} style={styles.viewToggleBtn}>
              <Text style={styles.viewToggleBtnText}>🔵</Text>
            </TouchableOpacity>
          </View>
          {calOffset > 0 && (
            <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 8 }}>
              {tr('🔮 Pronóstico estimado', '🔮 Estimated forecast', '🔮 Prévision estimée', '🔮 Previsione stimata')}
            </Text>
          )}
          {isHormonalContra ? (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: 'row', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>💊</Text>
              <Text style={{ fontSize: 12, color: '#92400E', flex: 1, lineHeight: 17 }}>
                {tr(
                  'Con anticoncepción hormonal el ciclo no sigue el patrón natural. Solo se muestra la regla real — las fases estimadas no aplican.',
                  'With hormonal contraception the cycle does not follow a natural pattern. Only real period data is shown — estimated phases do not apply.',
                  'Avec une contraception hormonale, le cycle ne suit pas le schéma naturel. Seules les règles réelles sont affichées — les phases estimées ne s\'appliquent pas.',
                  'Con contraccettivi ormonali il ciclo non segue il pattern naturale. Vengono mostrate solo le mestruazioni reali — le fasi stimate non si applicano.',
                )}
              </Text>
            </View>
          ) : (
            <View style={styles.legend}>
              {Object.keys(PHASE_BG).map(k => {
                const phTr = getPhaseDisplay(lang, k, PHASES[k]);
                return (
                  <View key={k} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: PHASE_BG[k] }]} />
                    <Text style={styles.legendText}>{PHASES[k]?.emoji} {phTr.name}</Text>
                  </View>
                );
              })}
            </View>
          )}
          <View style={styles.calHeader}>
            {[...getDayLetters(lang).slice(1), getDayLetters(lang)[0]].map((h, i) => (
              <Text key={i} style={styles.calHeaderText}>{h}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={'e'+i} style={styles.calCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
              const isFuture = dateStr > todayStr;
              // Regla real (historial) → rojo; desde el último período → fórmula/pronóstico;
              // Con anticoncepción hormonal, solo se muestra la regla real (no las fases)
              const isReal = inRealPeriod(dateStr);
              const phase = isReal ? 'menstrual'
                : (!isHormonalContra && lastPeriod && dateStr >= lastPeriod) ? getPhaseForDate(dateStr, lastPeriod, effectiveCycleLen)
                : null;
              const isToday = dateStr === todayStr;
              const isSelected = !marking && dateStr === selectedDate;
              const isMarked = marking && markStart && dateStr >= markStart && dateStr <= (markEnd || markStart);
              return (
                <TouchableOpacity
                  key={dayNum}
                  onPress={() => marking ? handleMarkTap(dateStr) : lastPeriod && setSelectedDate(isSelected ? null : dateStr)}
                  activeOpacity={(marking || lastPeriod) ? 0.65 : 1}
                  style={[
                    styles.calCell,
                    phase && { backgroundColor: PHASE_BG[phase] },
                    isFuture && phase && { opacity: 0.55 },
                    // En modo edición, atenúa todo lo no seleccionado para que
                    // quede claro qué días formarán la regla al guardar
                    marking && !isMarked && { opacity: 0.3 },
                    isMarked && { backgroundColor: '#EF4444', opacity: 1 },
                    isToday && styles.calCellToday,
                    isSelected && styles.calCellSelected,
                  ]}
                >
                  <Text style={[
                    styles.calDayNum,
                    phase && { color: PHASE_TEXT[phase] },
                    isMarked && { color: 'white', fontWeight: '700' },
                    isToday && styles.calDayNumToday,
                    isSelected && styles.calDayNumSelected,
                  ]}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Marcar regla directamente en el calendario ── */}
          {!marking ? (
            <TouchableOpacity
              onPress={() => {
                setMarking(true); setSelectedDate(null);
                // Precarga la regla actual para poder ajustarla (reducir/ampliar)
                setMarkStart(lastPeriod || null);
                setMarkEnd(periodEnd || null);
              }}
              style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 13 }}>
                🩸 {tr('Marcar regla en el calendario', 'Mark period on the calendar', 'Marquer les règles sur le calendrier', 'Segna il ciclo sul calendario')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 10 }}>
                {!markStart
                  ? tr('Toca el día de inicio de tu regla', 'Tap the first day of your period', 'Touche le premier jour de tes règles', 'Tocca il primo giorno del tuo ciclo')
                  : !markEnd
                  ? tr('Ahora toca el día de fin (o guarda si fue solo un día)', 'Now tap the last day (or save if it was one day)', 'Touche maintenant le dernier jour (ou enregistre si un seul jour)', 'Ora tocca l\'ultimo giorno (o salva se è stato un solo giorno)')
                  : tr('Toca otro día para ajustar el inicio o el fin, y guarda', 'Tap another day to adjust start or end, then save', 'Touche un autre jour pour ajuster le début ou la fin, puis enregistre', 'Tocca un altro giorno per regolare inizio o fine, poi salva')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { setMarking(false); setMarkStart(null); setMarkEnd(null); }}
                  style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13 }}>
                    {tr('Cancelar', 'Cancel', 'Annuler', 'Annulla')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={savePeriodMark} disabled={!markStart}
                  style={{ flex: 1, backgroundColor: markStart ? '#EF4444' : '#FCA5A5', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                    {tr('Guardar regla', 'Save period', 'Enregistrer', 'Salva ciclo')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Day detail panel (oculto con anticoncepción hormonal) ── */}
          {!isHormonalContra && !marking && selectedDate && lastPeriod && (() => {
            const selPhase = getPhaseForDate(selectedDate, lastPeriod, effectiveCycleLen);
            const diff = Math.floor((new Date(selectedDate + 'T12:00:00') - new Date(lastPeriod + 'T12:00:00')) / 86400000);
            const selCycleDay = ((diff % effectiveCycleLen) + effectiveCycleLen) % effectiveCycleLen + 1;
            const ph = PHASES[selPhase];
            const phTr = getPhaseDisplay(lang, selPhase, ph);
            const dayLabel = lang === 'en' ? 'Day' : lang === 'fr' ? 'Jour' : 'Día';
            const selDateFormatted = new Date(selectedDate + 'T12:00:00').toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' });
            return (
              <View style={[styles.dayDetail, { backgroundColor: PHASE_BG[selPhase], borderColor: PHASE_TEXT[selPhase] + '44' }]}>
                <Text style={[styles.dayDetailDate, { color: PHASE_TEXT[selPhase] }]}>
                  {selDateFormatted.charAt(0).toUpperCase() + selDateFormatted.slice(1)}
                </Text>
                <View style={styles.dayDetailRow}>
                  <Text style={styles.dayDetailEmoji}>{ph.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dayDetailPhase, { color: PHASE_TEXT[selPhase] }]}>{phTr.name}</Text>
                    <Text style={[styles.dayDetailTagline, { color: PHASE_TEXT[selPhase] }]}>{phTr.tagline}</Text>
                  </View>
                  <View style={[styles.dayDetailBadge, { backgroundColor: PHASE_TEXT[selPhase] }]}>
                    <Text style={styles.dayDetailBadgeText}>{dayLabel} {selCycleDay}</Text>
                  </View>
                </View>
              </View>
            );
          })()}

          {!lastPeriod && <Text style={styles.noDataNote}>{cy.noDataCal}</Text>}
        </View>
      )}

      {/* ── FASES (ocultas con anticoncepción hormonal: la info de fases no aplica) ── */}
      {!isHormonalContra && Object.entries(PHASES).map(([key, ph]) => {
        const isA    = key === pi?.phase;
        const isOpen = expandedPhase === key;
        const info   = phaseInfo[key];
        const phTr   = getPhaseDisplay(lang, key, ph);
        return (
          <TouchableOpacity key={key} onPress={() => setExpanded(isOpen ? null : key)}
            style={[styles.card, isA && { borderWidth: 2, borderColor: ph.color }]}>
            <View style={styles.phaseRow}>
              <View>
                <Text style={[styles.phaseTitle, { color: isA ? ph.color : '#334155' }]}>{ph.emoji} {phTr.name}</Text>
                <Text style={styles.phaseDays}>{pDays[key]}</Text>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                {isA && <View style={[styles.badge, { backgroundColor: ph.color }]}><Text style={styles.badgeText}>{cy.todayBadge}</Text></View>}
                <Text style={{ color:'#CBD5E1', fontSize:14 }}>{isOpen ? '▲' : '▼'}</Text>
              </View>
            </View>
            {isOpen && (
              <View style={{ marginTop:12, paddingTop:12, borderTopWidth:1, borderTopColor:'#F1F5F9' }}>
                <Text style={styles.phaseDesc}>{phTr.desc}</Text>
                <View style={{ marginTop:10, gap:6 }}>
                  <Text style={{ fontSize:12, color:'#64748B' }}>{info.hormones}</Text>
                  <Text style={{ fontSize:12, color:'#64748B' }}>{info.energy}</Text>
                  <Text style={{ fontSize:12, color:'#64748B' }}>{info.body}</Text>
                </View>
                <View style={{ marginTop:10 }}>
                  <Text style={{ fontSize:12, fontWeight:'700', color:'#1E293B', marginBottom:6 }}>{cy.tips}</Text>
                  {info.tips.map((tip, i) => (
                    <View key={i} style={{ flexDirection:'row', gap:8, marginBottom:4 }}>
                      <Text style={{ fontSize:12, color:'#1A56DB' }}>·</Text>
                      <Text style={{ fontSize:12, color:'#475569', flex:1 }}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* ── SLEEP TRACKER ── */}
      {/* SleepCard movido a Gimnasio > Salud */}

      {/* ── Botón para registrar el día (tracking Clue-style) ── */}
      <TouchableOpacity
        style={{ backgroundColor: '#1A56DB', borderRadius: 18, padding: 18, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
        onPress={() => setTrackingOpen(true)}>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
          📝 {lang === 'en' ? 'Log today' : lang === 'fr' ? 'Enregistrer le jour' : lang === 'it' ? 'Registra il giorno' : 'Registrar el día'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
          {lang === 'en' ? 'Flow, mood, pain, energy…'
           : lang === 'fr' ? 'Flux, humeur, douleur, énergie…'
           : lang === 'it' ? 'Flusso, umore, dolore, energia…'
           : 'Flujo, ánimo, dolor, energía…'}
        </Text>
      </TouchableOpacity>

      <CycleTrackingModal
        visible={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        lang={lang}
        cycleLog={profileExtended?.cycleLog || {}}
        onSave={(date, data) => logCycleDay?.(date, data)}
        currentPhase={pi?.phase || null}
      />

      {/* La fecha y duración del ciclo se editan ahora marcando la regla
          directamente en la vista calendario (🩸 Marcar regla). */}

      {/* ── CONSEJOS ── */}
      <TipsCard articles={cicloArticles} lang={lang} />

    </ScrollView>
    </SwipeableTabs>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F0F4FA' },
  content: { padding:14, paddingTop:60, paddingBottom:30 },
  card: { backgroundColor:'white', borderRadius:18, padding:16, marginBottom:12, shadowColor:'#000', shadowOffset:{ width:0, height:2 }, shadowOpacity:0.06, shadowRadius:8, elevation:2 },

  // Banner
  todayRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  todayBlock: { alignItems:'center' },
  todayLabel: { fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.7)', letterSpacing:0.8 },
  todayDay: { fontSize:32, fontWeight:'800', color:'white' },
  todayPhase: { alignItems:'center' },
  todayPhaseName: { fontSize:15, fontWeight:'700', color:'white', marginTop:2 },
  todayTagline: { fontSize:10, color:'rgba(255,255,255,0.8)', marginTop:2, textAlign:'center' },

  // Card header
  cardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cardTitle: { fontSize:14, fontWeight:'700', color:'#1E293B' },
  viewToggleBtn: { backgroundColor:'#F0F4FA', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#E2E8F0' },
  viewToggleBtnText: { fontSize:15 },

  // Calendar
  legend: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
  legendItem: { flexDirection:'row', alignItems:'center', gap:4 },
  legendDot: { width:10, height:10, borderRadius:5 },
  legendText: { fontSize:10, color:'#64748B' },
  calHeader: { flexDirection:'row', marginBottom:6 },
  calHeaderText: { flex:1, textAlign:'center', fontSize:12, fontWeight:'700', color:'#94A3B8' },
  calGrid: { flexDirection:'row', flexWrap:'wrap' },
  calCell: { width:'14.28%', aspectRatio:1, justifyContent:'center', alignItems:'center', borderRadius:10, padding:1 },
  calCellToday: { borderWidth:2, borderColor:'#1A56DB' },
  calDayNum: { fontSize:15, fontWeight:'500', color:'#334155' },
  calDayNumToday: { fontWeight:'800', color:'#1A56DB' },
  calCellSelected: { borderWidth:2, borderColor:'#1E293B' },
  calDayNumSelected: { fontWeight:'800' },
  noDataNote: { fontSize:12, color:'#94A3B8', textAlign:'center', marginTop:8, lineHeight:18 },

  // Day detail panel
  dayDetail: { marginTop:14, borderRadius:14, padding:14, borderWidth:1 },
  dayDetailDate: { fontSize:12, fontWeight:'600', marginBottom:8, textTransform:'capitalize' },
  dayDetailRow: { flexDirection:'row', alignItems:'center', gap:10 },
  dayDetailEmoji: { fontSize:28 },
  dayDetailPhase: { fontSize:15, fontWeight:'700', lineHeight:20 },
  dayDetailTagline: { fontSize:12, opacity:0.8, marginTop:2 },
  dayDetailBadge: { paddingHorizontal:10, paddingVertical:5, borderRadius:12 },
  dayDetailBadgeText: { color:'white', fontSize:12, fontWeight:'700' },

  // Sleep card
  sleepLogRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  sleepLabel: { fontSize:13, color:'#475569', fontWeight:'500' },
  hoursRow: { flexDirection:'row', alignItems:'center', gap:8 },
  hoursBtn: { width:32, height:32, borderRadius:16, backgroundColor:'#F0F4FA', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#E2E8F0' },
  hoursBtnText: { fontSize:18, fontWeight:'700', color:'#1A56DB', lineHeight:22 },
  hoursValue: { fontSize:20, fontWeight:'800', color:'#1E293B', minWidth:50, textAlign:'center' },
  qualityRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  qualityBtns: { flexDirection:'row', gap:6 },
  qualityBtn: { width:36, height:36, borderRadius:18, borderWidth:1.5, borderColor:'#E2E8F0', justifyContent:'center', alignItems:'center' },
  qualityMoon: { fontSize:18 },
  qualityLabelText: { fontSize:11, color:'#94A3B8', textAlign:'right', marginBottom:12 },
  logBtn: { backgroundColor:'#EFF6FF', borderRadius:12, paddingVertical:10, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#BFDBFE' },
  logBtnSaved: { backgroundColor:'#F0FDF4', borderColor:'#BBF7D0' },
  logBtnText: { fontSize:14, fontWeight:'700', color:'#1A56DB' },
  logBtnTextSaved: { color:'#16A34A' },
  sleepChart: { marginTop:4 },
  chartLabel: { fontSize:11, color:'#94A3B8', fontWeight:'600', marginBottom:8 },
  barsRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end' },
  barItem: { flex:1, alignItems:'center' },
  barBg: { width:24, height:60, backgroundColor:'#F1F5F9', borderRadius:6, justifyContent:'flex-end', overflow:'hidden' },
  barFill: { width:'100%', borderRadius:6 },
  barDay: { fontSize:9, color:'#94A3B8', marginTop:4 },
  barHours: { fontSize:8, color:'#64748B', marginTop:1 },
  avgBadge: { backgroundColor:'#EFF6FF', paddingHorizontal:10, paddingVertical:4, borderRadius:10 },
  avgText: { fontSize:11, color:'#1A56DB', fontWeight:'700' },
  noDataText: { fontSize:12, color:'#94A3B8', textAlign:'center', marginTop:8 },

  // Phase cards
  phaseRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  phaseTitle: { fontSize:14, fontWeight:'600' },
  phaseDays: { fontSize:12, color:'#94A3B8', marginTop:2 },
  badge: { paddingHorizontal:10, paddingVertical:3, borderRadius:20 },
  badgeText: { color:'white', fontSize:10, fontWeight:'700' },
  phaseDesc: { fontSize:12, color:'#475569', lineHeight:20 },

  // Edit
  editBtn: { fontSize:13, color:'#64748B', textAlign:'center', padding:4 },
  editTitle: { fontSize:14, fontWeight:'600', color:'#1E293B', marginBottom:12 },
  editLabel: { fontSize:12, color:'#64748B', marginBottom:8 },
  periodEndHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  periodEndClear: { fontSize:12, color:'#EF4444', fontWeight:'600' },
  dateBtn: { padding:10, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', marginRight:8, alignItems:'center', minWidth:60 },
  dateBtnSmall: { minWidth:50, padding:8 },
  dateBtnActive: { backgroundColor:'#1A56DB', borderColor:'#1A56DB' },
  dateBtnText: { fontSize:12, color:'#475569' },
  lenRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  lenBtn: { padding:8, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', minWidth:40, alignItems:'center' },
  lenBtnActive: { backgroundColor:'#1A56DB', borderColor:'#1A56DB' },
  lenBtnText: { fontSize:13, color:'#475569' },
  lenBtnTextActive: { color:'white', fontWeight:'700' },
  editBtns: { flexDirection:'row', gap:8 },
  cancelBtn: { flex:1, padding:10, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', alignItems:'center' },
  cancelText: { fontSize:14, color:'#64748B' },
  saveBtn: { flex:1, padding:10, borderRadius:10, backgroundColor:'#1A56DB', alignItems:'center' },
  saveText: { fontSize:14, color:'white', fontWeight:'600' },
});
