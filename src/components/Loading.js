/**
 * Loading — componente consistente de carga para toda la app.
 *
 * Variantes:
 * - fullscreen → pantalla completa azul oscuro (igual que splash)
 * - inline → indicator pequeño dentro de una card
 * - subtle → puntito gris discreto
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';
import BText from './BText';

export default function Loading({ variant = 'inline', label, color }) {
 if (variant === 'fullscreen') {
 return (
 <View style={s.fullscreen}>
 <BText style={s.fsEmoji}></BText>
 <BText style={s.fsBrand}>Blumm</BText>
 <ActivityIndicator color="#1A1A1A" size="large" />
 {label && <BText style={s.fsLabel}>{label}</BText>}
 </View>
 );
 }

 if (variant === 'subtle') {
 return (
 <View style={s.subtle}>
 <ActivityIndicator size="small" color={color || '#737373'} />
 </View>
 );
 }

 // inline
 return (
 <View style={s.inline}>
 <ActivityIndicator size="small" color={color || '#0A0A0A'} />
 {label && <BText style={s.inlineLabel}>{label}</BText>}
 </View>
 );
}

const s = StyleSheet.create({
 fullscreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
 fsEmoji: { fontSize: 48, marginBottom: 16, fontFamily: F.body },
 fsBrand: { color: '#1A1A1A', fontSize: 18, fontFamily: F.bodyB, letterSpacing: 1.5, marginBottom: 18 },
 fsLabel: { color: 'rgba(0,0,0,0.5)', fontSize: 13, marginTop: 12, fontFamily: F.body },

 inline: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, justifyContent: 'center' },
 inlineLabel: { fontSize: 13, color: '#737373', fontFamily: F.body },

 subtle: { padding: 8, alignItems: 'center' },
});
