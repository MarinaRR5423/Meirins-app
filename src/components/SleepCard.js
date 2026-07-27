/**
 * SleepCard — registro de horas de sueño + calidad + gráfico 7 días.
 * Acepta healthSleep (HealthKit) para pre-rellenar horas automáticamente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import T from '../i18n/translations';
import { F } from '../theme/fonts';

const QUALITY_MOONS  = ['🌑', '🌘', '🌗', '🌖', '🌕'];
const QUALITY_COLORS = ['#94A3B8', '#F97316', '#F59E0B', '#3B82F6', '#7C3AED'];
const BLUE = { primary: '#1A56DB' };

export default function SleepCard({ sleepLog = [], logSleep, lang = 'es', healthSleep = null }) {
  const sl = (T[lang] || T.es).sleep;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  const todayEntry = sleepLog.find(e => e.date === today);

  // Pre-rellenar con datos de HealthKit si existen y corresponden a anoche
  const healthHours = healthSleep?.duration && healthSleep?.date === yesterday
    ? healthSleep.duration : null;

  const [hours,   setHours]   = useState(todayEntry?.hours   || healthHours || 7.5);
  const [quality, setQuality] = useState(todayEntry?.quality || 3);
  const [saved,   setSaved]   = useState(!!todayEntry);

  useEffect(() => {
    if (!todayEntry && healthHours) setHours(healthHours);
  }, [healthHours]);

  const changeHours = (delta) => setHours(h => Math.min(12, Math.max(3, Math.round((h + delta) * 2) / 2)));

  const handleLog = async () => {
    await logSleep?.({ date: today, hours, quality });
    setSaved(true);
  };

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = sleepLog.find(e => e.date === dateStr);
    // Enriquecer con datos HealthKit si coincide con ayer
    const hk = healthSleep?.date === dateStr ? healthSleep : null;
    return { dateStr, entry, hk, dayLetter: d.toLocaleDateString('default', { weekday: 'narrow' }) };
  }), [sleepLog, healthSleep]);

  const avgHours = sleepLog.length > 0
    ? (sleepLog.slice(0, 7).reduce((s, e) => s + e.hours, 0) / Math.min(7, sleepLog.length)).toFixed(1)
    : null;

  // Calidad del sueño de anoche desde HealthKit
  const hkYesterday = healthSleep?.date === yesterday ? healthSleep : null;
  const sleepScore = hkYesterday
    ? Math.min(100, Math.round(
        (hkYesterday.duration / 8) * 50 +
        (hkYesterday.deepSleep / 1.5) * 30 +
        (hkYesterday.remSleep / 1.5) * 20
      ))
    : null;

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>{sl.title}</Text>
        {avgHours && (
          <View style={s.avgBadge}>
            <Text style={s.avgText}>{sl.avgLabel} {avgHours}{sl.hoursShort}</Text>
          </View>
        )}
      </View>

      {/* Métricas HealthKit de anoche */}
      {hkYesterday && (
        <View style={s.hkBanner}>
          <View style={s.hkMetric}>
            <Text style={s.hkValue}>{hkYesterday.duration}{sl.hoursShort}</Text>
            <Text style={s.hkLabel}>Total</Text>
          </View>
          {hkYesterday.deepSleep > 0 && (
            <View style={s.hkMetric}>
              <Text style={[s.hkValue, { color: '#0284C7' }]}>{hkYesterday.deepSleep}{sl.hoursShort}</Text>
              <Text style={s.hkLabel}>Profundo</Text>
            </View>
          )}
          {hkYesterday.remSleep > 0 && (
            <View style={s.hkMetric}>
              <Text style={[s.hkValue, { color: '#7C3AED' }]}>{hkYesterday.remSleep}{sl.hoursShort}</Text>
              <Text style={s.hkLabel}>REM</Text>
            </View>
          )}
          {sleepScore !== null && (
            <View style={s.hkMetric}>
              <Text style={[s.hkValue, { color: sleepScore >= 75 ? '#16A34A' : sleepScore >= 50 ? '#F59E0B' : '#DC2626' }]}>
                {sleepScore}
              </Text>
              <Text style={s.hkLabel}>Score</Text>
            </View>
          )}
        </View>
      )}

      {healthHours && !todayEntry && (
        <Text style={s.hkNote}>Horas pre-rellenadas desde Apple Health</Text>
      )}

      <View style={s.row}>
        <Text style={s.label}>{sl.todayLabel}</Text>
        <View style={s.hoursRow}>
          <TouchableOpacity style={s.hoursBtn} onPress={() => changeHours(-0.5)}><Text style={s.hoursBtnText}>−</Text></TouchableOpacity>
          <Text style={s.hoursValue}>{hours}{sl.hoursShort}</Text>
          <TouchableOpacity style={s.hoursBtn} onPress={() => changeHours(0.5)}><Text style={s.hoursBtnText}>+</Text></TouchableOpacity>
        </View>
      </View>

      <View style={s.qualityRow}>
        <Text style={s.label}>{sl.quality}</Text>
        <View style={s.qualityBtns}>
          {QUALITY_MOONS.map((moon, i) => (
            <TouchableOpacity key={i} onPress={() => setQuality(i + 1)}
              style={[s.qualityBtn, quality === i + 1 && { backgroundColor: QUALITY_COLORS[i] + '22', borderColor: QUALITY_COLORS[i] }]}>
              <Text style={s.qualityMoon}>{moon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={s.qualityLabelText}>{sl.qualityLabels[quality - 1]}</Text>

      <TouchableOpacity style={[s.logBtn, saved && s.logBtnSaved]} onPress={handleLog}>
        <Text style={[s.logBtnText, saved && s.logBtnTextSaved]}>
          {saved ? sl.logged : sl.log}
        </Text>
      </TouchableOpacity>

      {sleepLog.length > 0 ? (
        <View style={s.chart}>
          <Text style={s.chartLabel}>{sl.history}</Text>
          <View style={s.barsRow}>
            {last7.map(({ dateStr, entry, hk, dayLetter }) => {
              const displayHours = entry?.hours || hk?.duration || 0;
              const barH = displayHours ? Math.max(4, (displayHours / 12) * 60) : 0;
              const qColor = entry ? QUALITY_COLORS[entry.quality - 1] : hk ? '#3B82F6' : '#E2E8F0';
              const isToday = dateStr === today;
              return (
                <View key={dateStr} style={s.barItem}>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { height: barH, backgroundColor: qColor }]} />
                    {/* Franja de sueño profundo */}
                    {hk?.deepSleep > 0 && displayHours > 0 && (
                      <View style={[s.barFill, {
                        height: Math.max(2, (hk.deepSleep / 12) * 60),
                        backgroundColor: '#0284C7',
                        position: 'absolute', bottom: 0, width: '100%'
                      }]} />
                    )}
                  </View>
                  <Text style={[s.barDay, isToday && { color: BLUE.primary, fontFamily: F.bodyB }]}>{dayLetter}</Text>
                  {displayHours > 0 && <Text style={s.barHours}>{displayHours}{sl.hoursShort}</Text>}
                </View>
              );
            })}
          </View>
          <View style={s.legendRow}>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#7C3AED' }]}/><Text style={s.legendText}>Calidad subjetiva</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#0284C7' }]}/><Text style={s.legendText}>Sueño profundo</Text></View>
          </View>
        </View>
      ) : (
        <Text style={s.noData}>{sl.noData}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card:       { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:  { fontSize: 14, fontFamily: F.bodyB, color: '#1E293B' },
  avgBadge:   { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  avgText:    { fontSize: 11, color: BLUE.primary, fontFamily: F.bodyB },
  hkBanner:   { flexDirection: 'row', backgroundColor: '#F8FAFF', borderRadius: 12, padding: 12, marginBottom: 12, gap: 8 },
  hkMetric:   { flex: 1, alignItems: 'center' },
  hkValue:    { fontSize: 18, color: '#1E293B', fontFamily: F.headingX },
  hkLabel:    { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  hkNote:     { fontSize: 11, color: '#94A3B8', marginBottom: 8, textAlign: 'center', fontStyle: 'italic' },
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label:      { fontSize: 13, color: '#475569', fontWeight: '500' },
  hoursRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hoursBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F4FA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  hoursBtnText: { fontSize: 18, fontFamily: F.bodyB, color: BLUE.primary, lineHeight: 22 },
  hoursValue: { fontSize: 20, color: '#1E293B', minWidth: 50, textAlign: 'center', fontFamily: F.headingX },
  qualityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  qualityBtns: { flexDirection: 'row', gap: 6 },
  qualityBtn:  { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  qualityMoon: { fontSize: 18 },
  qualityLabelText: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginBottom: 12 },
  logBtn:        { backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  logBtnSaved:   { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  logBtnText:    { fontSize: 14, fontFamily: F.bodyB, color: BLUE.primary },
  logBtnTextSaved: { color: '#16A34A' },
  chart:      { marginTop: 4 },
  chartLabel: { fontSize: 11, color: '#94A3B8', fontFamily: F.bodyB, marginBottom: 8 },
  barsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barItem:    { flex: 1, alignItems: 'center' },
  barBg:      { width: 24, height: 60, backgroundColor: '#F1F5F9', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill:    { width: '100%', borderRadius: 6 },
  barDay:     { fontSize: 9, color: '#94A3B8', marginTop: 4 },
  barHours:   { fontSize: 8, color: '#64748B', marginTop: 1 },
  legendRow:  { flexDirection: 'row', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#94A3B8' },
  noData:     { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
});
