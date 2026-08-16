import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BedDouble } from 'lucide-react-native';
import T from '../i18n/translations';
import { F } from '../theme/fonts';
import BText from './BText';

// Fallback si translations no tiene qualityLabels
const QUALITY_FALLBACK = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];

export default function SleepCard({ sleepLog = [], logSleep, lang = 'es', healthSleep = null }) {
 const sl = (T[lang] || T.es).sleep;
 const today = new Date().toISOString().split('T')[0];
 const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
 const todayEntry = sleepLog.find(e => e.date === today);
 const healthHours = healthSleep?.duration && healthSleep?.date === yesterday ? healthSleep.duration : null;

 const [hours, setHours] = useState(todayEntry?.hours || healthHours || 7.5);
 const [quality, setQuality] = useState(todayEntry?.quality || 3);
 const [qualityOpen, setQualityOpen] = useState(false);
 const [saved, setSaved] = useState(!!todayEntry);

 useEffect(() => {
  if (!todayEntry && healthHours) setHours(healthHours);
 }, [healthHours]);

 const changeHours = (delta) => setHours(h => Math.min(12, Math.max(3, Math.round((h + delta) * 2) / 2)));

 const handleLog = async () => {
  await logSleep?.({ date: today, hours, quality });
  setSaved(true);
 };

 const qualityLabels = sl.qualityLabels?.length === 5 ? sl.qualityLabels : QUALITY_FALLBACK;
 const qualityLabel = qualityLabels[quality - 1] ?? 'Regular';

 return (
  <View style={s.card}>
   {/* Title */}
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <BedDouble size={16} color="#FECA04" />
    <BText style={s.title}>{sl.title || 'Registro de sueño'}</BText>
   </View>

   {/* Duration display */}
   <View>
    <BText style={s.durLabel}>{sl.duration || 'Duración'}</BText>
    <BText style={s.durValue}>{hours} h</BText>
   </View>

   {/* Anoche dormí counter */}
   <View style={s.counterCard}>
    <BText style={s.counterLabel}>{sl.todayLabel || 'Anoche dormí'}</BText>
    <View style={s.counterRow}>
     <TouchableOpacity style={s.counterBtn} onPress={() => changeHours(-0.5)}>
      <BText style={s.counterBtnTxt}>−</BText>
     </TouchableOpacity>
     <View style={s.counterValueBox}>
      <BText style={s.counterValue}>{hours}</BText>
     </View>
     <TouchableOpacity style={s.counterBtn} onPress={() => changeHours(0.5)}>
      <BText style={s.counterBtnTxt}>+</BText>
     </TouchableOpacity>
    </View>
   </View>

   {/* Quality selector */}
   <View style={s.counterCard}>
    <BText style={s.counterLabel}>{sl.quality || 'Calidad'}</BText>
    <TouchableOpacity style={s.qualityPill} onPress={() => setQualityOpen(o => !o)}>
     <BText style={s.qualityPillTxt}>{qualityLabel}</BText>
     <BText style={s.qualityChevron}>›</BText>
    </TouchableOpacity>
   </View>

   {qualityOpen && (
    <View style={s.qualityDropdown}>
     {qualityLabels.map((label, i) => (
      <TouchableOpacity key={i} style={[s.qualityOpt, quality === i + 1 && s.qualityOptActive]} onPress={() => { setQuality(i + 1); setQualityOpen(false); }}>
       <BText style={[s.qualityOptTxt, quality === i + 1 && s.qualityOptTxtActive]}>{label}</BText>
      </TouchableOpacity>
     ))}
    </View>
   )}

   {/* Registrar button */}
   <TouchableOpacity style={[s.logBtn, saved && s.logBtnSaved]} onPress={handleLog}>
    <BText style={s.logBtnTxt}>{saved ? (sl.logged || 'Registrado') : (sl.log || 'Registrar')}</BText>
   </TouchableOpacity>
  </View>
 );
}

const s = StyleSheet.create({
 card: { backgroundColor: '#FEDF68', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 title: { fontSize: 12, fontFamily: F.body, color: '#261E01' },
 durLabel: { fontSize: 14, fontFamily: F.body, color: '#261E01', marginBottom: 4 },
 durValue: { fontSize: 48, fontFamily: F.headingX, color: '#261E01', lineHeight: 52, letterSpacing: -0.96 },
 counterCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 counterLabel: { flex: 1, fontSize: 16, fontFamily: F.body, color: '#0A0A0A' },
 counterRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
 counterBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 counterBtnTxt: { fontSize: 24, color: 'white', fontFamily: F.bodyB, lineHeight: 30 },
 counterValueBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
 counterValue: { fontSize: 16, fontFamily: F.body, color: '#171717', textAlign: 'center' },
 qualityPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAFAFA', paddingHorizontal: 8, height: 48, borderRadius: 16, flex: 1 },
 qualityPillTxt: { flex: 1, fontSize: 16, fontFamily: F.body, color: '#737373' },
 qualityChevron: { fontSize: 18, color: '#0A0A0A', fontFamily: F.body },
 qualityDropdown: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, overflow: 'hidden' },
 qualityOpt: { paddingHorizontal: 16, paddingVertical: 12 },
 qualityOptActive: { backgroundColor: '#261E01' },
 qualityOptTxt: { fontSize: 15, fontFamily: F.body, color: '#261E01' },
 qualityOptTxtActive: { color: '#FEDF68', fontFamily: F.bodyB },
 logBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 logBtnSaved: { backgroundColor: '#49CF38' },
 logBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },
});
