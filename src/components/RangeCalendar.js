/**
 * RangeCalendar — selector de rango de fechas con calendario mensual.
 *
 * - Primer tap: marca inicio
 * - Segundo tap: marca fin (si es posterior)
 * - Tercer tap: reinicia y marca nuevo inicio
 * - Los días intermedios se colorean
 *
 * Props:
 * start 'YYYY-MM-DD' fecha inicial seleccionada
 * end 'YYYY-MM-DD' fecha final seleccionada
 * onChange (start, end) => void
 * color color principal de selección (default rojo)
 * maxPastMonths cuántos meses hacia atrás (default 6)
 * lang idioma para nombres de meses
 */
import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { F } from '../theme/fonts';
import BText from './BText';

const DEFAULT_COLOR = '#49CF38';

export default function RangeCalendar({ start, end, onChange, color = DEFAULT_COLOR, maxPastMonths = 6, lang = 'es' }) {
 const [viewDate, setViewDate] = useState(() => {
 if (start) return new Date(start + 'T12:00:00');
 return new Date();
 });

 const todayStr = new Date().toISOString().split('T')[0];
 const year = viewDate.getFullYear();
 const month = viewDate.getMonth();
 const monthName = viewDate.toLocaleDateString(
 lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES',
 { month: 'long', year: 'numeric' },
 );

 const firstDay = new Date(year, month, 1).getDay(); // 0=Dom
 const daysInMonth = new Date(year, month + 1, 0).getDate();
 const startOffset = (firstDay + 6) % 7; // Lun como primer día

 // Letras de los días de la semana en el header
 const weekHeader = lang === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
 : lang === 'fr' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
 : lang === 'it' ? ['L', 'M', 'M', 'G', 'V', 'S', 'D']
 : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

 const handleTap = (dateStr) => {
 // Si no hay nada o ya hay rango completo → empezar de nuevo
 if (!start || (start && end)) {
 onChange(dateStr, null);
 return;
 }
 // Hay start pero no end
 if (dateStr < start) {
 // Tap anterior al start → se convierte en nuevo start
 onChange(dateStr, null);
 } else if (dateStr === start) {
 // Mismo día → mantener como rango de 1 día (start = end)
 onChange(start, start);
 } else {
 // Tap posterior → fija el end
 onChange(start, dateStr);
 }
 };

 // Navegación de meses — limitada al pasado para no programar a futuro
 const canGoPrev = (() => {
 const limit = new Date();
 limit.setMonth(limit.getMonth() - maxPastMonths);
 return new Date(year, month, 1) > new Date(limit.getFullYear(), limit.getMonth(), 1);
 })();
 const canGoNext = (() => {
 const now = new Date();
 return new Date(year, month, 1) < new Date(now.getFullYear(), now.getMonth(), 1);
 })();

 const goPrev = () => { if (canGoPrev) setViewDate(new Date(year, month - 1, 1)); };
 const goNext = () => { if (canGoNext) setViewDate(new Date(year, month + 1, 1)); };

 return (
 <View>
 {/* Header con navegación */}
 <View style={s.header}>
 <TouchableOpacity onPress={goPrev} disabled={!canGoPrev} style={[s.navBtn, !canGoPrev && { opacity: 0.3 }]}>
 <ChevronLeft size={20} color={color} />
 </TouchableOpacity>
 <BText style={s.title}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</BText>
 <TouchableOpacity onPress={goNext} disabled={!canGoNext} style={[s.navBtn, !canGoNext && { opacity: 0.3 }]}>
 <ChevronRight size={20} color={color} />
 </TouchableOpacity>
 </View>

 {/* Encabezado de letras */}
 <View style={s.weekHeader}>
 {weekHeader.map((d, i) => (
 <BText key={i} style={s.weekHeaderTxt}>{d}</BText>
 ))}
 </View>

 {/* Cuadrícula de días */}
 <View style={s.grid}>
 {Array.from({ length: startOffset }).map((_, i) => (
 <View key={'empty-' + i} style={s.cell} />
 ))}
 {Array.from({ length: daysInMonth }, (_, i) => {
 const dayNum = i + 1;
 const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
 const isFuture = dateStr > todayStr;
 const isStart = start && dateStr === start;
 const isEnd = end && dateStr === end;
 const isInRange = start && end && dateStr > start && dateStr < end;
 const isToday = dateStr === todayStr;
 const isEdge = isStart || isEnd;

 return (
 <TouchableOpacity
 key={dayNum}
 onPress={() => !isFuture && handleTap(dateStr)}
 activeOpacity={isFuture ? 1 : 0.7}
 style={[
 s.cell,
 isInRange && { backgroundColor: '#B6ECAF', borderRadius: 4 },
 isStart && { backgroundColor: color, borderRadius: 4 },
 isEnd && { backgroundColor: color, borderRadius: 4 },
 ]}
 >
 <BText style={[
 s.dayNum,
 isToday && !isEdge && { color: '#171717', fontFamily: F.bodyB },
 isEdge && { color: '#0B1F08', fontFamily: F.bodyB },
 isFuture && { color: '#D4D4D4' },
 ]}>
 {dayNum}
 </BText>
 </TouchableOpacity>
 );
 })}
 </View>

 {/* Leyenda */}
 {start && (
 <View style={s.legend}>
 <BText style={s.legendTxt}>
 {end
 ? `${formatRange(start, end, lang)} · ${dayDiff(start, end) + 1} ${lang === 'en' ? 'days' : lang === 'fr' ? 'jours' : lang === 'it' ? 'giorni' : 'días'}`
 : (lang === 'en' ? 'Now tap the last day of your period'
 : lang === 'fr' ? 'Tape maintenant le dernier jour de tes règles'
 : lang === 'it' ? 'Ora tocca l\'ultimo giorno del ciclo'
 : 'Ahora toca el último día de tu período')}
 </BText>
 </View>
 )}
 {!start && (
 <View style={s.legend}>
 <BText style={s.legendTxt}>
 {lang === 'en' ? 'Tap the first day of your last period'
 : lang === 'fr' ? 'Tape le premier jour de tes dernières règles'
 : lang === 'it' ? 'Tocca il primo giorno dell\'ultimo ciclo'
 : 'Toca el primer día de tu último período'}
 </BText>
 </View>
 )}
 </View>
 );
}

function dayDiff(a, b) {
 return Math.floor((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}

function formatRange(start, end, lang) {
 const opt = { day: 'numeric', month: 'short' };
 const locale = lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES';
 const s = new Date(start + 'T12:00:00').toLocaleDateString(locale, opt);
 const e = new Date(end + 'T12:00:00').toLocaleDateString(locale, opt);
 return start === end ? s : `${s} → ${e}`;
}

const s = StyleSheet.create({
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
 navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
 navTxt: { color: '#171717', fontSize: 22, fontFamily: F.bodyB, marginTop: -2 },
 title: { color: '#0A0A0A', fontSize: 16, fontWeight: '500', textTransform: 'capitalize', fontFamily: F.body },
 weekHeader: { flexDirection: 'row', marginBottom: 4 },
 weekHeaderTxt:{ flex: 1, textAlign: 'center', fontSize: 10, fontFamily: F.bodyB, color: '#737373', textTransform: 'uppercase' },
 grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
 cell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
 dayNum: { fontSize: 12, color: '#0A0A0A', fontWeight: '500', fontFamily: F.body },
 legend: { marginTop: 12, padding: 0 },
 legendTxt: { fontSize: 12, color: '#525252', textAlign: 'center', fontFamily: F.body },
});
