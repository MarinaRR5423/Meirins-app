import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { ChevronRight, Check, Scale } from 'lucide-react-native';
import { F } from '../theme/fonts';
import BText from './BText';

const PURPLE = '#A157C9';
const PURPLE_CHIP = '#C79ADF';
const PURPLE_CHIP_TXT = '#180D1E';

const OBJETIVO_OPTS = [
 { id: 'lose_weight',          label: { es: 'Perder peso',             en: 'Lose weight',            fr: 'Perdre du poids',       it: 'Perdere peso' } },
 { id: 'gain_muscle',          label: { es: 'Ganar músculo',           en: 'Gain muscle',            fr: 'Gagner du muscle',      it: 'Guadagnare muscoli' } },
 { id: 'maintain',             label: { es: 'Mantener peso',           en: 'Maintain weight',        fr: 'Maintenir le poids',    it: 'Mantenere il peso' } },
 { id: 'inflammation',         label: { es: 'Inflamación',             en: 'Inflammation',           fr: 'Inflammation',          it: 'Infiammazione' } },
 { id: 'menstrual_pain',       label: { es: 'Reducir dolor menstrual', en: 'Reduce menstrual pain',  fr: 'Réduire douleurs menst.', it: 'Ridurre dolori mestruali' } },
 { id: 'energy',               label: { es: 'Más energía',             en: 'More energy',            fr: 'Plus d\'énergie',       it: 'Più energia' } },
];

export default function WeightCard({ lang = 'es', weight, height, goal, profileExtended, saveProfileExtended, logWeight }) {
 const weightLog = profileExtended?.weightLog || [];
 const todayStr = new Date().toISOString().split('T')[0];
 const todayEntry = weightLog.find(e => e.date === todayStr);
 const [todayW, setTodayW] = useState(todayEntry?.weight ?? (weight || 60));
 const [targetW, setTargetW] = useState(profileExtended?.targetWeight || '');
 const [editTarget, setEditTarget] = useState(false);
 const [wLogged, setWLogged] = useState(!!todayEntry);

 // Objetivos múltiples
 const savedObjetivos = profileExtended?.objetivos || (goal ? [goal] : []);
 const [localObjetivos, setLocalObjetivos] = useState(savedObjetivos);
 const toggleObjetivo = async (id) => {
  const next = localObjetivos.includes(id)
   ? localObjetivos.filter(x => x !== id)
   : [...localObjetivos, id];
  setLocalObjetivos(next);
  await saveProfileExtended?.({ objetivos: next });
 };

 const changeW = (delta) => setTodayW(w => Math.max(30, Math.min(200, Math.round((+w + delta) * 10) / 10)));

 const handleLogWeight = async () => {
  if (!logWeight) return;
  await logWeight({ date: todayStr, weight: +todayW });
  if (targetW && !profileExtended?.targetWeight) {
   await saveProfileExtended?.({ targetWeight: +targetW });
  }
  setWLogged(true);
 };

 const h = height, w = weight;
 const bmi = h && w ? +(w / ((h / 100) ** 2)).toFixed(1) : null;
 const bmiLabel = bmi
  ? bmi < 18.5 ? { es: 'Bajo peso', en: 'Underweight', fr: 'Sous-poids', it: 'Sottopeso' }[lang]
  : bmi < 25 ? { es: 'Normal', en: 'Normal', fr: 'Normal', it: 'Normale' }[lang]
  : bmi < 30 ? { es: 'Sobrepeso', en: 'Overweight', fr: 'Surpoids', it: 'Sovrappeso' }[lang]
  : { es: 'Obesidad', en: 'Obese', fr: 'Obésité', it: 'Obesità' }[lang]
  : null;

 const tgt = profileExtended?.targetWeight ? +profileExtended.targetWeight : null;
 const currW = weightLog.length > 0 ? weightLog[0].weight : weight;

 const tr = (es, en) => ({ es, en }[lang] || es);

 // 7-day dot chart data
 const last7 = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i));
  const dateStr = d.toISOString().split('T')[0];
  const entry = weightLog.find(e => e.date === dateStr);
  return { dateStr, weight: entry?.weight || null, day: d.toLocaleDateString('default', { weekday: 'narrow' }) };
 });
 const chartVals = last7.filter(d => d.weight != null);
 const chartMin = chartVals.length ? Math.min(...chartVals.map(d => d.weight)) - 2 : 0;
 const chartMax = chartVals.length ? Math.max(...chartVals.map(d => d.weight)) + 2 : 100;
 const chartRange = chartMax - chartMin || 1;

 return (
  <View style={s.card}>
   {/* Title + chevron */}
   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
     <Scale size={16} color="#A157C9" />
     <BText style={s.sectionLabel}>{tr('Objetivo', 'Goal')}</BText>
    </View>
    <ChevronRight size={16} color="#737373" />
   </View>

   {/* 7-day dot chart */}
   <View style={{ flexDirection: 'row', height: 80, alignItems: 'flex-end', gap: 2 }}>
    {last7.map((d, i) => {
     const filled = d.weight != null;
     const norm = filled ? (d.weight - chartMin) / chartRange : 0.5;
     const topOffset = Math.round((1 - norm) * 56);
     return (
      <View key={d.dateStr} style={{ flex: 1, alignItems: 'center', height: 80 }}>
       <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: topOffset }}>
        <View style={[s.dot, !filled && s.dotEmpty]} />
       </View>
       <BText style={{ fontSize: 12, fontFamily: F.body, color: '#737373', lineHeight: 15.6, marginTop: 4 }}>{d.day}</BText>
      </View>
     );
    })}
   </View>

   {/* Current weight big */}
   <View>
    <BText style={s.weightLabel}>{tr('Peso', 'Weight')}</BText>
    <BText style={s.weightValue}>{currW ? `${currW} kg` : '— kg'}</BText>
   </View>

   {/* Data rows */}
   <View style={{ gap: 4 }}>
    {!!bmi && (
     <View style={s.dataRow}>
      <BText style={s.dataRowLabel}>IMC</BText>
      <View style={s.chipGray}>
       <BText style={s.chipGrayTxt}>{bmi} · {bmiLabel}</BText>
      </View>
     </View>
    )}
    {!!tgt && (
     <View style={s.dataRow}>
      <BText style={s.dataRowLabel}>{tr('Peso objetivo', 'Target')}</BText>
      <View style={s.chipPurple}>
       <BText style={s.chipPurpleTxt}>{tgt} kg</BText>
      </View>
     </View>
    )}
    {localObjetivos.length > 0 && (
     <View style={s.dataRow}>
      <BText style={s.dataRowLabel}>{tr('Buscas', 'Goals')}</BText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
       {localObjetivos.map(id => {
        const opt = OBJETIVO_OPTS.find(o => o.id === id);
        if (!opt) return null;
        return (
         <View key={id} style={s.chipPurple}>
          <BText style={s.chipPurpleTxt}>{opt.label[lang] || opt.label.es}</BText>
         </View>
        );
       })}
      </View>
     </View>
    )}
   </View>

   {/* Objetivos seleccionables */}
   <View style={{ gap: 6 }}>
    <BText style={s.objetivosTitle}>{tr('¿Qué buscas?', 'What are you looking for?')}</BText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
     {OBJETIVO_OPTS.map(opt => {
      const sel = localObjetivos.includes(opt.id);
      return (
       <TouchableOpacity key={opt.id} onPress={() => toggleObjetivo(opt.id)}
        style={[s.objetivoChip, sel && s.objetivoChipActive]}>
        <BText style={[s.objetivoChipTxt, sel && s.objetivoChipTxtActive]}>
         {opt.label[lang] || opt.label.es}
        </BText>
       </TouchableOpacity>
      );
     })}
    </View>
   </View>

   {/* Stepper peso hoy */}
   <View style={s.stepperRow}>
    <BText style={s.stepperLabel}>{tr('Peso hoy', "Today's weight")}</BText>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
     <TouchableOpacity style={s.stepperBtn} onPress={() => changeW(-0.1)}>
      <BText style={s.stepperBtnTxt}>−</BText>
     </TouchableOpacity>
     <View style={s.stepperValBox}>
      <BText style={s.stepperVal}>{(+todayW).toFixed(1)}</BText>
     </View>
     <TouchableOpacity style={s.stepperBtn} onPress={() => changeW(0.1)}>
      <BText style={s.stepperBtnTxt}>+</BText>
     </TouchableOpacity>
    </View>
   </View>

   {/* Establecer peso objetivo */}
   {!tgt && !editTarget && (
    <TouchableOpacity onPress={() => setEditTarget(true)}>
     <BText style={s.setTargetLink}>
      {tr('Establecer peso objetivo', 'Set target weight')}
     </BText>
    </TouchableOpacity>
   )}
   {editTarget && !tgt && (
    <View style={s.targetRow}>
     <TextInput
      style={s.targetInput}
      value={String(targetW)}
      onChangeText={setTargetW}
      keyboardType="decimal-pad"
      placeholder="65.0"
      placeholderTextColor="#CBD5E1"
     />
     <BText style={{ fontSize: 14, color: '#737373', fontFamily: F.body }}>kg</BText>
     <TouchableOpacity style={s.targetSave} onPress={async () => {
      if (targetW) { await saveProfileExtended?.({ targetWeight: +targetW }); setEditTarget(false); }
     }}>
      <Check size={16} color="white" />
     </TouchableOpacity>
    </View>
   )}
   {tgt && (
    <TouchableOpacity onPress={() => saveProfileExtended?.({ targetWeight: null })}>
     <BText style={[s.setTargetLink, { color: '#94A3B8' }]}>
      × {tr('Eliminar objetivo', 'Remove target')}
     </BText>
    </TouchableOpacity>
   )}

   {/* Registrar */}
   <TouchableOpacity style={[s.saveBtn, wLogged && s.saveBtnDone]} onPress={handleLogWeight}>
    <BText style={[s.saveBtnTxt, wLogged && { color: '#49CF38' }]}>
     {wLogged ? tr('Registrado', 'Logged') : tr('Registrar', 'Log weight')}
    </BText>
   </TouchableOpacity>
  </View>
 );
}

const s = StyleSheet.create({
 card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 2, gap: 24 },
 sectionLabel: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A' },
 dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: PURPLE, alignSelf: 'center' },
 dotEmpty: { backgroundColor: '#ECDDF4' },
 weightLabel: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 },
 weightValue: { fontSize: 48, fontFamily: F.heading, color: PURPLE, lineHeight: 52.8 },
 dataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 dataRowLabel: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6 },
 chipGray: { paddingHorizontal: 8, height: 24, borderRadius: 8, backgroundColor: '#D4D4D4', justifyContent: 'center', alignItems: 'center' },
 chipGrayTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 12 },
 chipPurple: { paddingHorizontal: 8, height: 24, borderRadius: 8, backgroundColor: PURPLE_CHIP, justifyContent: 'center', alignItems: 'center' },
 chipPurpleTxt: { fontSize: 10, fontFamily: F.body, color: PURPLE_CHIP_TXT, textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 12 },
 objetivosTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A' },
 objetivoChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E5E5' },
 objetivoChipActive: { backgroundColor: PURPLE_CHIP, borderColor: PURPLE_CHIP },
 objetivoChipTxt: { fontSize: 13, fontFamily: F.body, color: '#525252' },
 objetivoChipTxtActive: { color: PURPLE_CHIP_TXT },
 stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 24, padding: 16, minHeight: 80 },
 stepperLabel: { flex: 1, fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8 },
 stepperBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 stepperBtnTxt: { fontSize: 24, color: 'white', fontFamily: F.bodyB, lineHeight: 30 },
 stepperValBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
 stepperVal: { fontSize: 16, fontFamily: F.body, color: '#171717', textAlign: 'center', lineHeight: 20.8 },
 setTargetLink: { fontSize: 18, fontFamily: F.body, color: '#171717', textDecorationLine: 'underline', textAlign: 'center', lineHeight: 24 },
 targetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 targetInput: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', fontSize: 16, textAlign: 'center', color: '#0A0A0A', fontFamily: F.body, backgroundColor: 'white' },
 targetSave: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
 saveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 saveBtnDone: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
 saveBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA', lineHeight: 24 },
});
