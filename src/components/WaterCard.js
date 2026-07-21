import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import T from '../i18n/translations';

const WATER_GOAL = 8;
const ML_PER_GLASS = 250;
const BLUE_PRIMARY = '#1A56DB';

export default function WaterCard({ lang }) {
  const n = (T[lang] || T.es).nutri;
  const w = n.water;
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `water_count_${todayStr}`;
  const [count, setCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(v => { if (v) setCount(parseInt(v, 10)); });
  }, [storageKey]);

  const updateCount = (newCount) => {
    setCount(newCount);
    AsyncStorage.setItem(storageKey, String(newCount));
  };

  const handleBubble = (i) => {
    updateCount(i < count ? i : i + 1);
  };

  const ml = count * ML_PER_GLASS;
  const goalMl = WATER_GOAL * ML_PER_GLASS;
  const pct = Math.min(1, ml / goalMl);
  const done = count >= WATER_GOAL;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{w.title}</Text>
        <Text style={[styles.mlText, done && { color: '#16A34A' }]}>
          {done ? w.done : `${ml} / ${goalMl} ${w.ml}`}
        </Text>
      </View>
      <View style={styles.bubblesRow}>
        {Array.from({ length: WATER_GOAL }, (_, i) => {
          const filled = i < count;
          return (
            <TouchableOpacity key={i} onPress={() => handleBubble(i)} activeOpacity={0.7}
              style={[styles.bubble, filled ? styles.bubbleFilled : styles.bubbleEmpty]}>
              <Text style={[styles.bubbleEmoji, !filled && { opacity: 0.2 }]}>💧</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: done ? '#16A34A' : BLUE_PRIMARY }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{count} / {WATER_GOAL} {w.glasses} · {w.goal}</Text>
        {count > 0 && (
          <TouchableOpacity onPress={() => updateCount(0)}>
            <Text style={styles.resetText}>{w.reset}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  mlText: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },
  bubblesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bubble: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bubbleFilled: { backgroundColor: '#DBEAFE' },
  bubbleEmpty: { borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  bubbleEmoji: { fontSize: 18 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 11, color: '#64748B' },
  resetText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
