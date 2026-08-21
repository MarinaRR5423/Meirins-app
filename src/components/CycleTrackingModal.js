import React, { useState, useMemo } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, TextInput, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelTodayMoodCheck } from '../utils/notifications';
import { CYCLE_CATEGORIES } from '../data/cycleTracking';
import { F } from '../theme/fonts';
import { getInsight } from '../data/symptomInsights';
import {
 X, SlidersHorizontal,
 Droplets, Droplet, Dot, Smile, Zap, Cloud, Moon, Brain,
 Utensils, Activity, Sparkles, Heart, Thermometer, MessageCircle,
 Shield, Wind,
} from 'lucide-react-native';

const LUCIDE_MAP = {
 Droplets, Droplet, Dot, Smile, Zap, Cloud, Moon, Brain,
 Utensils, Activity, Sparkles, Heart, Thermometer, MessageCircle,
 Shield, Wind,
};

function CatIcon({ name, color, size = 16 }) {
 const Icon = LUCIDE_MAP[name];
 if (!Icon) return null;
 return <Icon size={size} color={color} />;
}
import BText from './BText';

// Categorías ocultas por defecto (nicho o médico)
const HIDDEN_BY_DEFAULT = ['rhinitis', 'temperature', 'cervical'];

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

export default function CycleTrackingModal({ visible, onClose, lang = 'es', cycleLog = {}, onSave, currentPhase = null, trackingPrefs = {}, onSavePrefs }) {
 const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
 const [dayData, setDayData] = useState(cycleLog[selectedDate] || {});
 const [note, setNote] = useState(cycleLog[selectedDate]?.note || '');
 const [activeInsight, setActiveInsight] = useState(null);
 const [customizing, setCustomizing] = useState(false);
 const [foodNote, setFoodNote] = useState(cycleLog[selectedDate]?.food_note || '');
 const [localPrefs, setLocalPrefs] = useState(() => {
  const prefs = {};
  CYCLE_CATEGORIES.forEach(c => {
   prefs[c.id] = c.id in trackingPrefs ? trackingPrefs[c.id] : !HIDDEN_BY_DEFAULT.includes(c.id);
  });
  return prefs;
 });

 React.useEffect(() => {
  setDayData(cycleLog[selectedDate] || {});
  setNote(cycleLog[selectedDate]?.note || '');
  setFoodNote(cycleLog[selectedDate]?.food_note || '');
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

 const shownCategories = CYCLE_CATEGORIES.filter(c => localPrefs[c.id] !== false);

 const savePrefs = () => {
  onSavePrefs?.(localPrefs);
  setCustomizing(false);
 };

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
  if (foodNote?.trim()) fullData.food_note = foodNote.trim();
  // Si la usuaria marcó "No", limpiar triggers y nota de comida
  if (fullData.food_reaction === 'no') {
   delete fullData.food_triggers;
   delete fullData.food_note;
  }
  await onSave?.(selectedDate, fullData);
  // Cancela el recordatorio "apunta cómo te sientes" del día si el registro es de hoy
  const today = new Date().toISOString().split('T')[0];
  if (selectedDate === today) cancelTodayMoodCheck().catch(() => {});
  onClose?.();
 };

 const txt = {
  note: { es: 'Nota diaria', en: 'Daily note', fr: 'Note du jour', it: 'Nota giornaliera' },
  notePh: { es: 'Enter a text....', en: 'Enter a text....', fr: 'Saisir un texte....', it: 'Inserisci testo....' },
  save: { es: 'Guardar', en: 'Save', fr: 'Enregistrer', it: 'Salva' },
  customize: { es: 'Personalizar', en: 'Customize', fr: 'Personnaliser', it: 'Personalizza' },
  customizeTitle: { es: 'Personaliza tu seguimiento', en: 'Customize tracking', fr: 'Personnalise ton suivi', it: 'Personalizza il tracciamento' },
  customizeDesc: { es: 'Activa o desactiva las categorías que quieres ver en tu registro diario.', en: 'Turn on or off the categories you want to see in your daily log.', fr: 'Active ou désactive les catégories que tu veux voir dans ton journal.', it: 'Attiva o disattiva le categorie che vuoi vedere nel tuo diario.' },
  done: { es: 'Listo', en: 'Done', fr: 'Terminé', it: 'Fatto' },
 };

 const weekLabels = WEEK_LABELS[lang] || WEEK_LABELS.es;

 return (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
   <SafeAreaView style={s.container}>
    {/* Header */}
    <View style={s.header}>
     <BText style={s.title}>{{ es: 'Registro', en: 'Log', fr: 'Journal', it: 'Registro' }[lang] || 'Registro'}</BText>
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

     {/* Personalizar button */}
     <TouchableOpacity style={s.customizeBtn} onPress={() => setCustomizing(v => !v)} activeOpacity={0.75}>
      <SlidersHorizontal size={14} color="#0A0A0A" />
      <BText style={s.customizeTxt}>{txt.customize[lang] || txt.customize.es}</BText>
     </TouchableOpacity>

     {/* Personalization panel */}
     {customizing && (
      <View style={s.customPanel}>
       <BText style={s.customTitle}>{txt.customizeTitle[lang] || txt.customizeTitle.es}</BText>
       <BText style={s.customDesc}>{txt.customizeDesc[lang] || txt.customizeDesc.es}</BText>
       <View style={s.customList}>
        {CYCLE_CATEGORIES.map(cat => (
         <View key={cat.id} style={s.customRow}>
          <View style={s.customRowLeft}>
           <View style={[s.catIconWrap, { backgroundColor: cat.color + '22' }]}>
            <CatIcon name={cat.icon} color={cat.color} size={14} />
           </View>
           <BText style={s.customRowLabel}>{cat.label[lang] || cat.label.es}</BText>
          </View>
          <Switch
           value={localPrefs[cat.id] !== false}
           onValueChange={v => setLocalPrefs(p => ({ ...p, [cat.id]: v }))}
           trackColor={{ false: '#E5E5E5', true: '#180D1E' }}
           thumbColor="white"
          />
         </View>
        ))}
       </View>
       <TouchableOpacity style={s.doneBtn} onPress={savePrefs} activeOpacity={0.85}>
        <BText style={s.saveTxt}>{txt.done[lang] || txt.done.es}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* Symptom sections */}
     {!customizing && (
      <View style={s.sections}>
       {shownCategories.map(cat => {
        // Renderizado condicional: ocultar si depende de otra categoría no seleccionada
        if (cat.dependsOn && dayData[cat.dependsOn.field] !== cat.dependsOn.value) return null;

        const value = dayData[cat.id];
        return (
         <View key={cat.id} style={s.category}>
          <View style={s.catHeader}>
           <View style={[s.catIconWrap, { backgroundColor: cat.color + '22' }]}>
            <CatIcon name={cat.icon} color={cat.color} size={14} />
           </View>
           <BText style={s.catTitle}>{cat.label[lang] || cat.label.es}</BText>
          </View>
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
          {/* Campo libre "¿Algún alimento en particular?" — solo tras food_triggers */}
          {cat.id === 'food_triggers' && (
           <TextInput
            style={s.foodNoteInput}
            value={foodNote}
            onChangeText={setFoodNote}
            placeholder={{ es: '¿Algún alimento en particular?', en: 'Any specific food?', fr: 'Un aliment en particulier ?', it: 'Qualche alimento in particolare?' }[lang] || '¿Algún alimento en particular?'}
            placeholderTextColor="#737373"
            maxLength={200}
           />
          )}
         </View>
        );
       })}
      </View>
     )}

     {/* Nota diaria */}
     {!customizing && <View style={s.noteSection}>
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
     </View>}

     {/* Save */}
     {!customizing && <View style={s.saveWrap}>
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
       <BText style={s.saveTxt}>{txt.save[lang] || txt.save.es}</BText>
      </TouchableOpacity>
     </View>}

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
 catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 catIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
 catTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 options: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
 option: { height: 40, paddingHorizontal: 8, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
 optionActive: { backgroundColor: '#180D1E' },
 optLbl: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, lineHeight: 24 },
 optLblActive: { color: 'white' },

 // Note
 foodNoteInput: {
  marginTop: 10, backgroundColor: '#F5F5F5', borderRadius: 12,
  paddingHorizontal: 12, paddingVertical: 10,
  fontSize: 14, color: '#0A0A0A', fontFamily: F.body,
  borderWidth: 0.5, borderColor: '#E5E7EB',
 },

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

 // Personalizar
 customizeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F5F5F5', borderRadius: 20 },
 customizeTxt: { fontSize: 13, fontFamily: F.body, color: '#0A0A0A' },
 customPanel: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 16 },
 customTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A' },
 customDesc: { fontSize: 13, fontFamily: F.body, color: '#737373', lineHeight: 18 },
 customList: { gap: 0 },
 customRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
 customRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
 customRowLabel: { fontSize: 15, fontFamily: F.body, color: '#0A0A0A' },
 doneBtn: { backgroundColor: '#171717', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
