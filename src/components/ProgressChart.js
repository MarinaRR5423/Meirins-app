/**
 * ProgressChart — gráfico de línea SVG para métricas de evolución
 * Usa react-native-svg (ya instalado).
 *
 * Props:
 * data [{date:'YYYY-MM-DD', value:number}] puntos del gráfico
 * color string color de la línea
 * unit string unidad (ej: 'kg')
 * goal 'lose_weight'|'gain_muscle'|'maintain'
 * width number ancho total del SVG
 */
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
 Path, Polyline, Circle, Line, Defs,
 LinearGradient, Stop, Text as SvgText,
} from 'react-native-svg';
import { F } from '../theme/fonts';
import BText from './BText';

const PAD = { top: 24, bottom: 28, left: 38, right: 14 };

export default function ProgressChart({ data, color = '#429FE7', unit = 'kg', goal, width }) {
 const { width: screenW } = useWindowDimensions();
 const W = width || (screenW > 0 ? screenW - 56 : 320);
 const H = 160;

 if (!data || data.length < 2) {
 return (
 <View style={[s.empty, { width: W, height: H }]}>
 <BText style={s.emptyTxt}>Añade al menos 2 registros para ver la gráfica</BText>
 </View>
 );
 }

 // Ordenar ascendente por fecha
 const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
 const values = sorted.map(d => d.value);
 const minV = Math.min(...values);
 const maxV = Math.max(...values);
 const range = maxV - minV || 0.5; // evitar división por 0

 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const toX = (i) => PAD.left + (i / Math.max(sorted.length - 1, 1)) * chartW;
 const toY = (v) => PAD.top + chartH - ((v - minV) / range) * chartH;

 // Polyline points string
 const ptStr = sorted.map((d, i) => `${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join('');

 // Area path (cierra por debajo)
 const areaD = [
 `M ${toX(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)}`,
 ...sorted.map((d, i) => `L ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`),
 `L ${toX(sorted.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)}`,
 'Z',
 ].join('');

 const last = sorted[sorted.length - 1];
 const first = sorted[0];
 const delta = last.value - first.value;

 // Color del delta según objetivo
 const deltaGood =
 goal === 'gain_muscle' ? delta >= 0 :
 goal === 'maintain' ? Math.abs(delta) < 1 :
 delta <= 0; // lose_weight
 const deltaColor = deltaGood ? '#16A34A' : '#EF4444';

 // Etiquetas del eje X: máximo 6 puntos, siempre el primero y el último
 const xLabelIdxs = (() => {
 const n = sorted.length;
 if (n <= 6) return sorted.map((_, i) => i);
 const step = Math.ceil(n / 5);
 const idxs = new Set([0]);
 for (let i = step; i < n; i += step) idxs.add(i);
 idxs.add(n - 1);
 return [...idxs].sort((a, b) => a - b);
 })();

 // Líneas de cuadrícula Y: 3 líneas
 const gridYs = [0, 0.5, 1].map(pct => ({
 y: PAD.top + pct * chartH,
 val: (maxV - pct * range).toFixed(1),
 }));

 const gradId = `grad_${color.replace('#', '')}`;

 return (
 <View>
 <Svg width={W} height={H}>
 <Defs>
 <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
 <Stop offset="0" stopColor={color} stopOpacity="0.22" />
 <Stop offset="1" stopColor={color} stopOpacity="0.01" />
 </LinearGradient>
 </Defs>

 {/* Cuadrícula */}
 {gridYs.map(({ y, val }, i) => (
 <React.Fragment key={i}>
 <Line
 x1={PAD.left} y1={y.toFixed(1)}
 x2={(W - PAD.right).toFixed(1)} y2={y.toFixed(1)}
 stroke="#F1F5F9" strokeWidth="1"
 />
 <SvgText
 x={(PAD.left - 4).toFixed(1)} y={(y + 4).toFixed(1)}
 fontSize="9" fill="#E5E5E5" textAnchor="end"
 >{val}</SvgText>
 </React.Fragment>
 ))}

 {/* Área de relleno */}
 <Path d={areaD} fill={`url(#${gradId})`} />

 {/* Línea */}
 <Polyline
 points={ptStr}
 fill="none"
 stroke={color}
 strokeWidth="2.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 {/* Puntos */}
 {sorted.map((d, i) => {
 const isLast = i === sorted.length - 1;
 return (
 <Circle
 key={i}
 cx={toX(i).toFixed(1)}
 cy={toY(d.value).toFixed(1)}
 r={isLast ? 5 : 3}
 fill="white"
 stroke={color}
 strokeWidth={isLast ? 2.5 : 1.5}
 />
 );
 })}

 {/* Etiqueta del último valor */}
 <SvgText
 x={toX(sorted.length - 1).toFixed(1)}
 y={(toY(last.value) - 10).toFixed(1)}
 fontSize="11" fill={color}
 textAnchor={toX(sorted.length - 1) > W * 0.75 ? 'end' : 'middle'}
 fontFamily="F.bodyB"
 >{last.value} {unit}</SvgText>

 {/* Etiquetas eje X */}
 {xLabelIdxs.map(i => {
 const d = sorted[i];
 const dt = new Date(d.date + 'T12:00:00');
 const lbl = `${dt.getDate()}/${dt.getMonth() + 1}`;
 return (
 <SvgText
 key={i}
 x={toX(i).toFixed(1)}
 y={(H - 4).toFixed(1)}
 fontSize="9" fill="#737373" textAnchor="middle"
 >{lbl}</SvgText>
 );
 })}
 </Svg>

 {/* Delta badge */}
 {data.length >= 2 && (
 <View style={s.deltaRow}>
 <BText style={[s.delta, { color: deltaColor }]}>
 {delta >= 0 ? '+' : ''}{delta.toFixed(1)} {unit}
 </BText>
 <BText style={s.deltaSub}>
 {' desde '}{new Date(first.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
 </BText>
 </View>
 )}
 </View>
 );
}

const s = StyleSheet.create({
 empty: { justifyContent: 'center', alignItems: 'center' },
 emptyTxt: { fontSize: 12, color: '#E5E5E5', textAlign: 'center', fontFamily: F.body },
 deltaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2, paddingLeft: 38 },
 delta: { fontSize: 14, fontFamily: F.bodyB },
 deltaSub: { fontSize: 12, color: '#737373', fontFamily: F.body },
});
