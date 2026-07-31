import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';
import BText from './BText';

/**
 * EmptyState — pantalla de estado vacío reutilizable.
 *
 * Props:
 * emoji string emoji grande central
 * title string título principal
 * subtitle string texto explicativo
 * ctaLabel string texto del botón (opcional)
 * onCta func acción del botón (opcional)
 * compact bool versión pequeña para insertar dentro de una card
 */
export default function EmptyState({ emoji, title, subtitle, ctaLabel, onCta, compact = false }) {
 if (compact) {
 return (
 <View style={s.compact}>
 <BText style={s.compactEmoji}>{emoji}</BText>
 <BText style={s.compactTitle}>{title}</BText>
 {!!subtitle && <BText style={s.compactSub}>{subtitle}</BText>}
 {ctaLabel && onCta && (
 <TouchableOpacity onPress={onCta} style={s.compactBtn} activeOpacity={0.8}>
 <BText style={s.compactBtnTxt}>{ctaLabel}</BText>
 </TouchableOpacity>
 )}
 </View>
 );
 }

 return (
 <View style={s.container}>
 <BText style={s.emoji}>{emoji}</BText>
 <BText style={s.title}>{title}</BText>
 {!!subtitle && <BText style={s.subtitle}>{subtitle}</BText>}
 {ctaLabel && onCta && (
 <TouchableOpacity onPress={onCta} style={s.btn} activeOpacity={0.8}>
 <BText style={s.btnTxt}>{ctaLabel}</BText>
 </TouchableOpacity>
 )}
 </View>
 );
}

const s = StyleSheet.create({
 // Full
 container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
 emoji: { fontSize: 64, marginBottom: 20, fontFamily: F.body },
 title: { fontSize: 20, fontFamily: F.bodyB, color: '#0A0A0A', textAlign: 'center', marginBottom: 10 },
 subtitle: { fontSize: 14, color: '#737373', textAlign: 'center', lineHeight: 22, marginBottom: 28, fontFamily: F.body },
 btn: { backgroundColor: '#171717', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50 },
 btnTxt: { color: 'white', fontFamily: F.bodyB, fontSize: 15 },

 // Compact (dentro de card)
 compact: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
 compactEmoji: { fontSize: 40, marginBottom: 10, fontFamily: F.body },
 compactTitle: { fontSize: 15, fontFamily: F.bodyB, color: '#0A0A0A', textAlign: 'center', marginBottom: 6 },
 compactSub: { fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 20, marginBottom: 14, fontFamily: F.body },
 compactBtn: { backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
 compactBtnTxt: { color: '#0A0A0A', fontFamily: F.bodyB, fontSize: 13 },
});
