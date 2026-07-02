/**
 * Loading — componente consistente de carga para toda la app.
 *
 * Variantes:
 *   - fullscreen  → pantalla completa azul oscuro (igual que splash)
 *   - inline      → indicator pequeño dentro de una card
 *   - subtle      → puntito gris discreto
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loading({ variant = 'inline', label, color }) {
  if (variant === 'fullscreen') {
    return (
      <View style={s.fullscreen}>
        <Text style={s.fsEmoji}>🌙</Text>
        <Text style={s.fsBrand}>MEIRINS</Text>
        <ActivityIndicator color="white" size="large" />
        {label && <Text style={s.fsLabel}>{label}</Text>}
      </View>
    );
  }

  if (variant === 'subtle') {
    return (
      <View style={s.subtle}>
        <ActivityIndicator size="small" color={color || '#94A3B8'} />
      </View>
    );
  }

  // inline
  return (
    <View style={s.inline}>
      <ActivityIndicator size="small" color={color || '#1A56DB'} />
      {label && <Text style={s.inlineLabel}>{label}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  fullscreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1F4A' },
  fsEmoji:    { fontSize: 48, marginBottom: 16 },
  fsBrand:    { color: 'white', fontSize: 18, fontWeight: '700', letterSpacing: 1.5, marginBottom: 18 },
  fsLabel:    { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 12 },

  inline:      { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, justifyContent: 'center' },
  inlineLabel: { fontSize: 13, color: '#64748B' },

  subtle:      { padding: 8, alignItems: 'center' },
});
