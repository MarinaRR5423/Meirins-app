import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassWater, ChevronRight } from 'lucide-react-native';
import T from '../i18n/translations';

const WATER_GOAL = 8;
const ML_PER_GLASS = 250;

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

  const ml = count * ML_PER_GLASS;
  const goalMl = WATER_GOAL * ML_PER_GLASS;
  const remaining = Math.max(0, goalMl - ml);
  const pct = Math.min(1, ml / goalMl);
  const done = count >= WATER_GOAL;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.headerLabel}>
          <GlassWater size={16} color="#0A0A0A" strokeWidth={2} />
          <Text style={s.headerLabelTxt}>{w.title}</Text>
        </View>
        <ChevronRight size={16} color="#0A0A0A" />
      </View>

      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={s.mlValue}>{ml}ml</Text>
          <Text style={s.mlSubLabel}>{done ? w.done : `${remaining} ${w.ml} restantes`}</Text>

          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={s.barLabels}>
            <Text style={s.barLabelTxt}>{ml}</Text>
            <Text style={s.barLabelTxt}>{goalMl}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.addBtn}
          onPress={() => updateCount(Math.min(WATER_GOAL, count + 1))}
          disabled={done}
          activeOpacity={0.8}
        >
          <Text style={s.addBtnTxt}>{done ? '✓' : (w.addGlass || 'Añadir vaso')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerLabelTxt: { fontSize: 12, color: '#0A0A0A' },
  mlValue: { fontSize: 32, fontWeight: '800', color: '#429FE7', lineHeight: 36 },
  mlSubLabel: { fontSize: 14, color: '#0A0A0A', marginTop: 2 },
  barBg: { height: 4, borderRadius: 2, backgroundColor: '#E5E5E5', marginTop: 14, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, backgroundColor: '#429FE7' },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabelTxt: { fontSize: 12, color: '#429FE7', textTransform: 'uppercase' },
  addBtn: { backgroundColor: '#0A0A0A', height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  addBtnTxt: { color: 'white', fontWeight: '600', fontSize: 14 },
});
