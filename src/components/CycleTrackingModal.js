import React, { useState, useMemo } from 'react';
import { Modal, SafeAreaView, View, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { CYCLE_CATEGORIES } from '../data/cycleTracking';
import { F } from '../theme/fonts';
import { getInsight } from '../data/symptomInsights';
import { X } from 'lucide-react-native';
import BText from './BText';

const SHOWN_IDS = ['flow', 'spotting', 'feelings', 'pain', 'rhinitis', 'pms', 'energy'];

const PHASE_GLOW = {
 menstrual: '#92E288',
 follicular: '#C79ADF',
 ovulation: '#FEDF68',
 luteal: '#FEA068',
};

const WEEK_LABELS = {
 es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
 en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
 it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
};

function formatDateLong(dateStr, lang) {
 const d = new Date(dateStr + 'T12:00:00');
 const locale = lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES';
 return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CycleTrackingModal({ visible, onClose, lang = 'es', cycleLog = {}, onSave, currentPhase = null }) {
 const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
 const [dayData, setDayData] = useState(cycleLog[selectedDate] || {});
 const [note, setNote] = useState(cycleLog[selectedDate]?.note || '');
 const [activeInsight, setActiveInsight] = useState(null);

 React.useEffect(() => {
  setDayData(cycleLog[selectedDate] || {});
  setNote(cycleLog[selectedDate]?.note || '');
 }, [selectedDate, cycleLog]);

 const todayStr = new Date().toISOString().split('T')[0];

 const weekDates = useMemo(() => {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
   const d = new Date(monday);
   d.setDate(monday.getDate() + i);
   return d.toISOString().split('T')[0];
  });
 }, []);

 const shownCategories = CYCLE_CATEGORIES.filter(c => SHOWN_IDS.includes(c.id))
  .sort((a, b) => SHOWN_IDS.indexOf(a.id) - SHOWN_IDS.indexOf(b.id));

 const toggleOption = async (catId, optId, multi) => {
  let isSelecting = false;
  if (multi) {
   const current = dayData[catId] || [];
   isSelecting = !current.includes(optId);
   const next = isSelecting ? [...current, optId] : current.filter(x => x !== optId);
   setDayData({ ...dayData, [catId]: next });
  } else {
   isSelecting = dayData[catId] !== optId;
   const newData = { ...dayData };
   if (!isSelecting) delete newData[catId];
   else newData[catId] = optId;
   setDayData(newData);
  }
  if (isSelecting) {
   const insight = await getInsight(catId, optId, currentPhase, lang);
   if (insight) setActiveInsight({ catId, optId, ...insight });
   else setActiveInsight(null);
  } else {
   setActiveInsight(null);
  }
 };

 const handleSave = async () => {
  const fullData = { ...dayData };
  if (note?.trim()) fullData.note = note.trim();
  await onSave?.(selectedDate, fullData);
  onClose?.();
 };

 const txt = {
  note: { es: 'Nota diaria', en: 'Daily note', fr: 'Note du jour', it: 'Nota giornaliera' },
  notePh: { es: 'Enter a text....', en: 'Enter a text....', fr: 'Saisir un texte....', it: 'Inserisci testo....' },
  save: { es: 'Guardar', en: 'Save', fr: 'Enregistrer', it: 'Salva' },
 };

 const weekLabels = WEEK_LABELS[lang] || WEEK_LABELS.es;

 return (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
   <SafeAreaView style={s.container}>
    {/* Header */}
    <View style={s.header}>
     <BText style={s.title}>Registro</BText>
     <TouchableOpacity onPress={onClose} style={s.closeBtn}>
      <X size={16} color="#0A0A0A" />
     </TouchableOpacity>
    </View>

    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
     {/* Calendar week selector */}
     <View style={s.calSection}>
      <View style={s.calInner}>
       <BText style={s.calDateLabel}>{formatDateLong(selectedDate, lang)}</BText>

       {/* Week day headers */}
       <View style={s.calWeekRow}>
        {weekLabels.map((d, i) => (
         <View key={i} style={s.calWeekCell}>
          <BText style={s.calWeekLabel}>{d}</BText>
         </View>
        ))}
       </View>

       {/* Day cells */}
       <View style={s.calDayRow}>
        {weekDates.map(dateStr => {
         const dayNum = new Date(dateStr + 'T12:00:00').getDate();
         const isToday = dateStr === todayStr;
         const isSel = dateStr === selectedDate;
         const glowColor = (isToday || isSel) && currentPhase ? PHASE_GLOW[currentPhase] : null;
         return (
          <TouchableOpacity
           key={dateStr}
           style={[s.calCell, (isToday || isSel) && s.calCellActive]}
           onPress={() => setSelectedDate(dateStr)}
           activeOpacity={0.75}
          >
           {glowColor && <View style={[s.calGlow, { backgroundColor: glowColor }]} />}
           <BText style={s.calDayNum}>{dayNum}</BText>
          </TouchableOpacity>
         );
        })}
       </View>
      </View>
     </View>

     {/* Symptom sections */}
     <View style={s.sections}>
      {shownCategories.map(cat => {
       const value = dayData[cat.id];
       return (
        <View key={cat.id} style={s.category}>
         <BText style={s.catTitle}>{cat.label[lang] || cat.label.es}</BText>
         <View style={s.options}>
          {cat.options.map(opt => {
           const isSel = cat.multi ? value?.includes?.(opt.id) : value === opt.id;
           return (
            <TouchableOpacity
             key={opt.id}
             onPress={() => toggleOption(cat.id, opt.id, cat.multi)}
             style={[s.option, isSel && s.optionActive]}
             activeOpacity={0.75}
            >
             <BText style={[s.optLbl, isSel && s.optLblActive]}>
              {opt.label[lang] || opt.label.es}
             </BText>
            </TouchableOpacity>
           );
          })}
         </View>
        </View>
       );
      })}
     </View>

     {/* Nota diaria */}
     <View style={s.noteSection}>
      <BText style={s.noteTitle}>{txt.note[lang] || txt.note.es}</BText>
      <TextInput
       style={s.noteInput}
       multiline
       maxLength={3000}
       value={note}
       onChangeText={setNote}
       placeholder={txt.notePh[lang] || txt.notePh.es}
       placeholderTextColor="#737373"
       textAlignVertical="top"
      />
     </View>

     {/* Save */}
     <View style={s.saveWrap}>
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
       <BText style={s.saveTxt}>{txt.save[lang] || txt.save.es}</BText>
      </TouchableOpacity>
     </View>

     <View style={{ height: 40 }} />
    </ScrollView>
   </SafeAreaView>
  </Modal>
 );
}

const s = StyleSheet.create({
 container: { flex: 1, backgroundColor: 'white' },
 header: {
  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 48,
 },
 title: { fontSize: 24, color: '#0A0A0A', fontFamily: F.headingX, lineHeight: 29 },
 closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },

 scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 24 },

 // Calendar
 calSection: { backgroundColor: '#F5F5F5', borderRadius: 32, padding: 16, gap: 4 },
 calInner: { gap: 4 },
 calDateLabel: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 21, marginBottom: 4 },
 calWeekRow: { flexDirection: 'row' },
 calWeekCell: { flex: 1, padding: 4, alignItems: 'center' },
 calWeekLabel: { fontSize: 10, fontFamily: F.body, color: '#737373', textTransform: 'uppercase', lineHeight: 13 },
 calDayRow: { flexDirection: 'row', gap: 4 },
 calCell: { width: 43, height: 43, backgroundColor: 'white', borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
 calCellActive: { borderWidth: 1, borderColor: '#0A0A0A' },
 calGlow: { position: 'absolute', top: 21, left: -1, width: 44, height: 44, borderRadius: 22, opacity: 0.85 },
 calDayNum: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A' },

 // Sections
 sections: { gap: 2 },
 category: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24 },
 catTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 options: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 option: { height: 40, paddingHorizontal: 8, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
 optionActive: { backgroundColor: '#180D1E' },
 optLbl: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, lineHeight: 24 },
 optLblActive: { color: 'white' },

 // Note
 noteSection: { gap: 8 },
 noteTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 noteInput: {
  backgroundColor: '#FAFAFA', borderRadius: 12, padding: 8,
  fontSize: 16, color: '#0A0A0A', height: 96,
  fontFamily: F.body, lineHeight: 21,
 },

 // Save
 saveWrap: { paddingTop: 8, paddingBottom: 8 },
 saveBtn: { backgroundColor: '#171717', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
 saveTxt: { color: 'white', fontFamily: F.body, fontSize: 18, lineHeight: 24 },
});
