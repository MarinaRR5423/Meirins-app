import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';

/**
 * EmptyState — pantalla de estado vacío reutilizable.
 *
 * Props:
 *   emoji       string   emoji grande central
 *   title       string   título principal
 *   subtitle    string   texto explicativo
 *   ctaLabel    string   texto del botón (opcional)
 *   onCta       func     acción del botón (opcional)
 *   compact     bool     versión pequeña para insertar dentro de una card
 */
export default function EmptyState({ emoji, title, subtitle, ctaLabel, onCta, compact = false }) {
  if (compact) {
    return (
      <View style={s.compact}>
        <Text style={s.compactEmoji}>{emoji}</Text>
        <Text style={s.compactTitle}>{title}</Text>
        {!!subtitle && <Text style={s.compactSub}>{subtitle}</Text>}
        {ctaLabel && onCta && (
          <TouchableOpacity onPress={onCta} style={s.compactBtn} activeOpacity={0.8}>
            <Text style={s.compactBtnTxt}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={s.title}>{title}</Text>
      {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <TouchableOpacity onPress={onCta} style={s.btn} activeOpacity={0.8}>
          <Text style={s.btnTxt}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  // Full
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  emoji:     { fontSize: 64, marginBottom: 20 },
  title:     { fontSize: 20, fontFamily: F.bodyB, color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  subtitle:  { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn:       { backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50 },
  btnTxt:    { color: 'white', fontFamily: F.bodyB, fontSize: 15 },

  // Compact (dentro de card)
  compact:        { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  compactEmoji:   { fontSize: 40, marginBottom: 10 },
  compactTitle:   { fontSize: 15, fontFamily: F.bodyB, color: '#334155', textAlign: 'center', marginBottom: 6 },
  compactSub:     { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  compactBtn:     { backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  compactBtnTxt:  { color: '#1A56DB', fontFamily: F.bodyB, fontSize: 13 },
});
