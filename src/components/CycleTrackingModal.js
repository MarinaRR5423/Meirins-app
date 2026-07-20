/**
 * CycleTrackingModal — registro diario estilo Clue
 * Permite a la usuaria registrar flujo, dolor, energía, mood, etc.
 */
import React, { useState, useMemo } from 'react';
import {
  Modal, SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Platform,
} from 'react-native';
import { CYCLE_CATEGORIES } from '../data/cycleTracking';
import { getInsight } from '../data/symptomInsights';

const BLUE = '#1A56DB';

export default function CycleTrackingModal({ visible, onClose, lang = 'es', cycleLog = {}, onSave, currentPhase = null }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dayData, setDayData] = useState(cycleLog[selectedDate] || {});
  const [note, setNote] = useState(cycleLog[selectedDate]?.note || '');
  // Pop-up educativo: { catId, optId } del último síntoma seleccionado que tenga insight
  const [activeInsight, setActiveInsight] = useState(null);

  // Cuando cambia la fecha → cargar lo guardado de ese día
  React.useEffect(() => {
    setDayData(cycleLog[selectedDate] || {});
    setNote(cycleLog[selectedDate]?.note || '');
  }, [selectedDate, cycleLog]);

  // Últimos 7 días para el selector
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  }), []);

  const todayStr = new Date().toISOString().split('T')[0];

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
    // Muestra pop-up educativo al seleccionar (no al deseleccionar)
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
    title:   { es: `Hoy: ${formatDate(selectedDate, lang)}`, en: `Today: ${formatDate(selectedDate, lang)}`, fr: `Aujourd'hui: ${formatDate(selectedDate, lang)}`, it: `Oggi: ${formatDate(selectedDate, lang)}` },
    note:    { es: 'Nota diaria', en: 'Daily note', fr: 'Note du jour', it: 'Nota giornaliera' },
    notePh:  { es: '¿Quieres añadir algún detalle extra hoy?', en: 'Want to add any extra detail today?', fr: 'Tu veux ajouter un détail ?', it: 'Vuoi aggiungere un dettaglio?' },
    save:    { es: 'Guardar', en: 'Save', fr: 'Enregistrer', it: 'Salva' },
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.title}>{txt.title[lang] || txt.title.es}</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Date selector */}
        <View style={s.dateRow}>
          {dates.map(d => {
            const dt = new Date(d + 'T12:00:00');
            const isSel = selectedDate === d;
            const isToday = d === todayStr;
            const hasData = cycleLog[d] && Object.keys(cycleLog[d]).length > 0;
            return (
              <TouchableOpacity key={d} onPress={() => setSelectedDate(d)} style={[s.dateBtn, isSel && s.dateBtnSel]}>
                <Text style={[s.dayLetter, isSel && { color: 'white' }]}>
                  {dt.toLocaleDateString('default', { weekday: 'narrow' })}
                </Text>
                <Text style={[s.dayNum, isSel && { color: 'white' }, isToday && !isSel && { color: BLUE, fontWeight: '700' }]}>
                  {dt.getDate()}
                </Text>
                {hasData && <View style={[s.dot, isSel && { backgroundColor: 'white' }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {CYCLE_CATEGORIES.map(cat => {
            const value = dayData[cat.id];
            return (
              <View key={cat.id} style={s.category}>
                <Text style={[s.catTitle, { color: cat.color }]}>{cat.label[lang] || cat.label.es}</Text>
                <View style={s.options}>
                  {cat.options.map(opt => {
                    const isSel = cat.multi ? value?.includes?.(opt.id) : value === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => toggleOption(cat.id, opt.id, cat.multi)}
                        style={[
                          s.option,
                          isSel && { borderColor: cat.color, backgroundColor: cat.color + '12' },
                        ]}>
                        <Text style={s.optIco}>{opt.icon}</Text>
                        <Text style={[s.optLbl, isSel && { color: cat.color, fontWeight: '700' }]}>
                          {opt.label[lang] || opt.label.es}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Pop-up educativo de síntoma */}
          {activeInsight && (
            <View style={s.insightCard}>
              <View style={s.insightHeader}>
                <Text style={s.insightIcon}>💡</Text>
                <Text style={s.insightTitle}>
                  {{ es: '¿Por qué ocurre?', en: 'Why does this happen?', fr: 'Pourquoi cela se produit ?', it: 'Perché succede?' }[lang] || '¿Por qué ocurre?'}
                </Text>
                <TouchableOpacity onPress={() => setActiveInsight(null)} style={s.insightClose}>
                  <Text style={s.insightCloseTxt}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.insightWhy}>{activeInsight.why}</Text>
              {!!activeInsight.helps && (
                <View style={s.insightHelpsRow}>
                  <Text style={s.insightHelpsLabel}>
                    {{ es: 'Qué ayuda:', en: 'What helps:', fr: 'Ce qui aide :', it: 'Cosa aiuta:' }[lang] || 'Qué ayuda:'}
                  </Text>
                  <Text style={s.insightHelps}>{activeInsight.helps}</Text>
                </View>
              )}
            </View>
          )}

          {/* Nota */}
          <View style={s.noteSection}>
            <Text style={s.noteTitle}>{txt.note[lang] || txt.note.es}</Text>
            <TextInput
              style={s.noteInput}
              multiline
              maxLength={3000}
              value={note}
              onChangeText={setNote}
              placeholder={txt.notePh[lang] || txt.notePh.es}
              placeholderTextColor="#94A3B8"
            />
            <Text style={s.noteCounter}>{note.length}/3000</Text>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Save button */}
        <View style={s.footer}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveTxt}>{txt.save[lang] || txt.save.es}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function formatDate(dateStr, lang) {
  const d = new Date(dateStr + 'T12:00:00');
  const locale = lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: 'white' },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  closeTxt:  { fontSize: 14, color: '#64748B', fontWeight: '600' },
  title:     { fontSize: 16, fontWeight: '700', color: '#1E293B' },

  dateRow:   { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  dateBtn:   { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginHorizontal: 2, position: 'relative' },
  dateBtnSel:{ backgroundColor: BLUE },
  dayLetter: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  dayNum:    { fontSize: 16, color: '#334155', fontWeight: '600', marginTop: 2 },
  dot:       { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: BLUE },

  scroll:    { padding: 16 },
  category:  { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12 },
  catTitle:  { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  options:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option:    { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', gap: 6 },
  optIco:    { fontSize: 18 },
  optLbl:    { fontSize: 13, color: '#475569' },

  insightCard:  { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  insightHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  insightIcon:  { fontSize: 18 },
  insightTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', flex: 1 },
  insightClose: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  insightCloseTxt: { fontSize: 11, color: '#3B82F6', fontWeight: '700' },
  insightWhy:   { fontSize: 13, color: '#1E293B', lineHeight: 19, marginBottom: 10 },
  insightHelpsRow: { backgroundColor: '#DBEAFE', borderRadius: 10, padding: 10 },
  insightHelpsLabel: { fontSize: 11, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  insightHelps: { fontSize: 12, color: '#1E293B', lineHeight: 18 },

  noteSection:{ marginTop: 8, marginBottom: 8 },
  noteTitle:  { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  noteInput:  { backgroundColor: 'white', borderRadius: 12, padding: 12, fontSize: 14, color: '#1E293B', minHeight: 100, textAlignVertical: 'top' },
  noteCounter:{ fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 4 },

  footer:    { padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: 'white' },
  saveBtn:   { backgroundColor: BLUE, paddingVertical: 14, borderRadius: 50, alignItems: 'center' },
  saveTxt:   { color: 'white', fontWeight: '700', fontSize: 15 },
});
