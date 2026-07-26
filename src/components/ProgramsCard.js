/**
 * ProgramsCard — programas de entrenamiento guiados (Gimnasio > Hoy).
 *
 * Sin programa activo: banner que abre el catálogo de programas.
 * Con programa activo: muestra la próxima sesión, progreso y botón de completar.
 *
 * Progreso en profile_extended.activeProgram = { id, started, done }
 * Historial en profile_extended.completedPrograms = [id, ...]
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { X, ChevronRight, ChevronLeft, Check, Footprints } from 'lucide-react-native';
import {
  PROGRAMS, totalSessions, getSession, formatSession, sessionMinutes,
  LEVEL_LABEL, isRecommended,
} from '../data/trainingPrograms';

const BLUE = '#1A56DB';

export default function ProgramsCard({ lang = 'es', profileExtended, saveProfileExtended, compact = false }) {
  const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);
  const L  = (o) => o?.[lang] || o?.es || '';

  const [open, setOpen]       = useState(false);
  const [detail, setDetail]   = useState(null);   // programa en vista detalle
  const [saving, setSaving]   = useState(false);

  const active   = profileExtended?.activeProgram || null;
  const program  = active ? PROGRAMS.find(p => p.id === active.id) : null;
  const total    = program ? totalSessions(program) : 0;
  const done     = active?.done || 0;
  const session  = program && done < total ? getSession(program, done) : null;
  const completedIds = profileExtended?.completedPrograms || [];

  const startProgram = async (p) => {
    setSaving(true);
    await saveProfileExtended?.({
      activeProgram: { id: p.id, started: new Date().toISOString().split('T')[0], done: 0 },
    });
    setSaving(false);
    setDetail(null);
    setOpen(false);
  };

  const completeSession = async () => {
    if (!program) return;
    setSaving(true);
    const next = done + 1;
    if (next >= total) {
      // Programa terminado 🎉
      await saveProfileExtended?.({
        activeProgram: null,
        completedPrograms: [...completedIds.filter(id => id !== program.id), program.id],
      });
    } else {
      await saveProfileExtended?.({ activeProgram: { ...active, done: next } });
    }
    setSaving(false);
  };

  const abandonProgram = async () => {
    setSaving(true);
    await saveProfileExtended?.({ activeProgram: null });
    setSaving(false);
    setOpen(false);
  };

  // ── Tarjeta en la pestaña Hoy ──────────────────────────────────────────────
  return (
    <>
      {program && session ? (
        <View style={st.card}>
          <View style={st.headerRow}>
            <View style={st.headerLabel}>
              <Footprints size={14} color="#0A1823" />
              <Text style={st.headerLabelTxt}>{tr('Tu plan de ejercicio', 'Your training plan', 'Ton plan d\'entraînement', 'Il tuo piano di allenamento')}</Text>
            </View>
            <TouchableOpacity onPress={() => setOpen(true)}>
              <ChevronRight size={16} color="#0A1823" />
            </TouchableOpacity>
          </View>

          <Text style={st.title}>{program.emoji} {L(program.name)}</Text>

          <View style={st.tagsRow}>
            <View style={st.tag}><Text style={st.tagTxt}>{program.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')}</Text></View>
            <View style={st.tag}><Text style={st.tagTxt}>{done}/{total} {tr('sesiones', 'sessions', 'séances', 'sessioni')}</Text></View>
          </View>

          {/* Barra de progreso */}
          <View style={st.progressBg}>
            <View style={[st.progressFill, { width: `${Math.round((done / total) * 100)}%` }]} />
          </View>

          {compact ? (
            /* Hoy toca sesión del programa: se muestra como "Sesión de hoy"
               justo debajo — aquí solo el aviso para no duplicar */
            <Text style={st.compactHint}>
              👇 {tr('Hoy toca la sesión de tu programa — está justo debajo',
                     'Today is a programme session — it is right below',
                     'Aujourd\'hui séance du programme — juste en dessous',
                     'Oggi tocca la sessione del programma — è qui sotto')}
            </Text>
          ) : (
            <>
              {/* Próxima sesión */}
              <Text style={st.sessionLabel}>
                {tr('PRÓXIMA SESIÓN', 'NEXT SESSION', 'PROCHAINE SÉANCE', 'PROSSIMA SESSIONE')}
                {'  ·  ⏱ ~'}{sessionMinutes(session.spec)}{'\''}
              </Text>
              <View style={st.sessionCard}>
                {formatSession(session.spec, lang).map((line, i) => (
                  <View key={i} style={st.lineRow}>
                    <View style={st.lineDot} />
                    <Text style={st.lineTxt}>{line}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[st.doneBtn, saving && { opacity: 0.6 }]} onPress={completeSession} disabled={saving}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color="white" />
                  <Text style={st.doneBtnTxt}>{tr('Sesión completada', 'Session done', 'Séance terminée', 'Sessione completata')}</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <TouchableOpacity style={st.banner} onPress={() => setOpen(true)} activeOpacity={0.85}>
          <Text style={{ fontSize: 26 }}>📚</Text>
          <View style={{ flex: 1 }}>
            <Text style={st.bannerTitle}>
              {tr('Programas de entrenamiento', 'Training programmes', 'Programmes d\'entraînement', 'Programmi di allenamento')}
            </Text>
            <Text style={st.bannerSub}>
              {tr('9 planes guiados: correr, nadar, fuerza…', '9 guided plans: run, swim, strength…', '9 plans guidés : courir, nager, force…', '9 piani guidati: correre, nuotare, forza…')}
            </Text>
          </View>
          <ChevronRight size={20} color="#0A0A0A" />
        </TouchableOpacity>
      )}

      {/* ── Modal: catálogo / detalle / programa activo ── */}
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setOpen(false); setDetail(null); }}>
        <SafeAreaView style={st.modal}>
          <View style={st.modalHeader}>
            {detail ? (
              <TouchableOpacity onPress={() => setDetail(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={18} color="#1A56DB" />
                <Text style={st.backTxt}>{tr('Programas', 'Programmes', 'Programmes', 'Programmi')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={st.modalTitle}>
                📚 {tr('Programas', 'Programmes', 'Programmes', 'Programmi')}
              </Text>
            )}
            <TouchableOpacity onPress={() => { setOpen(false); setDetail(null); }} style={st.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={st.modalBody}>
            {detail ? (
              /* ── DETALLE DE UN PROGRAMA ── */
              <>
                <Text style={st.detailTitle}>{detail.emoji} {L(detail.name)}</Text>
                <View style={st.metaRow}>
                  <Text style={st.metaChip}>{detail.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')}</Text>
                  <Text style={st.metaChip}>{detail.spw}×/{tr('sem', 'wk', 'sem', 'sett')}</Text>
                  <Text style={st.metaChip}>{L(LEVEL_LABEL[detail.level])}</Text>
                </View>
                <Text style={st.detailDesc}>{L(detail.desc)}</Text>

                {detail.weeks.map((w, i) => {
                  const spec = w.all || w.list[w.list.length - 1];
                  return (
                    <View key={i} style={st.weekRow}>
                      <Text style={st.weekNum}>{tr('Sem', 'Wk', 'Sem', 'Sett')} {i + 1}</Text>
                      <Text style={st.weekTxt} numberOfLines={2}>
                        {formatSession(spec, lang).join(' · ')}
                      </Text>
                    </View>
                  );
                })}

                {active && active.id !== detail.id && (
                  <Text style={st.warnTxt}>
                    ⚠️ {tr('Empezar este programa abandonará el actual.',
                          'Starting this programme will abandon the current one.',
                          'Commencer ce programme abandonnera le programme en cours.',
                          'Iniziare questo programma abbandonerà quello attuale.')}
                  </Text>
                )}
                <TouchableOpacity style={[st.startBtn, saving && { opacity: 0.6 }]} onPress={() => startProgram(detail)} disabled={saving}>
                  <Text style={st.startBtnTxt}>
                    {tr('Empezar programa', 'Start programme', 'Commencer', 'Inizia programma')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ── CATÁLOGO ── */
              <>
                {program && (
                  <TouchableOpacity style={st.abandonBtn} onPress={abandonProgram} disabled={saving}>
                    <Text style={st.abandonTxt}>
                      {tr('Abandonar programa actual', 'Abandon current programme', 'Abandonner le programme en cours', 'Abbandona il programma attuale')} ({L(program.name)})
                    </Text>
                  </TouchableOpacity>
                )}
                {[...PROGRAMS]
                  .sort((a, b) => Number(isRecommended(b, profileExtended)) - Number(isRecommended(a, profileExtended)))
                  .map(p => {
                    const rec = isRecommended(p, profileExtended);
                    const isActive = active?.id === p.id;
                    const isDone = completedIds.includes(p.id);
                    return (
                      <TouchableOpacity key={p.id} style={[st.progRow, isActive && st.progRowActive]} onPress={() => setDetail(p)}>
                        <Text style={{ fontSize: 26 }}>{p.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={st.progName}>{L(p.name)}</Text>
                            {rec && <Text style={st.recBadge}>{tr('Para ti', 'For you', 'Pour toi', 'Per te')}</Text>}
                            {isActive && <Text style={st.activeBadge}>{tr('En curso', 'Active', 'En cours', 'In corso')}</Text>}
                            {isDone && !isActive && <View style={[st.doneBadge, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}><Check size={11} color="#16A34A" /><Text style={st.doneBadgeTxt}>{tr('Completado', 'Done', 'Terminé', 'Completato')}</Text></View>}
                          </View>
                          <Text style={st.progMeta}>
                            {p.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')} · {p.spw}×/{tr('sem', 'wk', 'sem', 'sett')} · {L(LEVEL_LABEL[p.level])}
                          </Text>
                        </View>
                        <ChevronRight size={20} color="#94A3B8" />
                      </TouchableOpacity>
                    );
                  })}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const st = StyleSheet.create({
  // Tarjeta programa activo — variante "azul clarito" (Figma)
  card: { backgroundColor: '#8EC5F1', borderRadius: 24, padding: 16, marginBottom: 2 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLabel:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerLabelTxt: { fontSize: 12, color: '#0A1823' },
  title:       { fontSize: 20, fontWeight: '800', color: '#0A1823', marginBottom: 8 },
  link:        { fontSize: 13, color: '#0A1823', fontWeight: '600' },
  tagsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 },
  tag:         { height: 24, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#B3D9F5', justifyContent: 'center' },
  tagTxt:      { fontSize: 10, fontWeight: '600', color: '#0A1823', textTransform: 'uppercase', letterSpacing: 0.3 },
  progressBg:  { height: 6, borderRadius: 3, backgroundColor: 'rgba(10,24,35,0.15)', overflow: 'hidden', marginBottom: 16 },
  progressFill:{ height: 6, borderRadius: 3, backgroundColor: '#0A1823' },
  progressTxt: { fontSize: 12, color: '#296390', marginTop: 6, marginBottom: 12 },
  sessionLabel:{ fontSize: 11, fontWeight: '700', color: '#0A1823', letterSpacing: 1, marginBottom: 8 },
  sessionCard: { backgroundColor: '#B3D9F5', borderRadius: 16, padding: 12, gap: 6, marginBottom: 12 },
  lineRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0A1823' },
  lineTxt:     { fontSize: 13, color: '#0A1823', flex: 1 },
  doneBtn:     { backgroundColor: '#0A1823', borderRadius: 12, padding: 13, alignItems: 'center' },
  doneBtnTxt:  { color: '#ECF5FD', fontWeight: '700', fontSize: 14 },
  compactHint: { fontSize: 13, color: '#0A1823', backgroundColor: '#B3D9F5', borderRadius: 12, padding: 10 },

  // Banner sin programa
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 16,
    marginBottom: 2, borderWidth: 1, borderColor: '#E5E5E5',
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 2 },
  bannerSub:   { fontSize: 12, color: '#525252' },
  bannerArrow: { fontSize: 18, color: '#0A0A0A', fontWeight: '700' },

  // Modal
  modal:       { flex: 1, backgroundColor: '#0F172A' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: 'white' },
  backTxt:     { fontSize: 15, color: '#93C5FD', fontWeight: '600' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  closeTxt:    { color: 'white', fontSize: 14, fontWeight: '600' },
  modalBody:   { padding: 20, paddingBottom: 60 },

  // Lista de programas
  progRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  progRowActive: { borderColor: '#93C5FD' },
  progName:      { fontSize: 14.5, color: 'white', fontWeight: '700' },
  progMeta:      { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  progArrow:     { fontSize: 20, color: 'rgba(255,255,255,0.4)' },
  recBadge:      { fontSize: 10, fontWeight: '700', color: '#312E81', backgroundColor: '#A5B4FC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
  activeBadge:   { fontSize: 10, fontWeight: '700', color: 'white', backgroundColor: BLUE, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
  doneBadge:     { backgroundColor: '#6EE7B7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
  doneBadgeTxt:  { fontSize: 10, fontWeight: '700', color: '#065F46' },
  abandonBtn:    { padding: 10, marginBottom: 10 },
  abandonTxt:    { fontSize: 12, color: '#FCA5A5', textAlign: 'center', textDecorationLine: 'underline' },

  // Detalle
  detailTitle: { fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 10 },
  metaRow:     { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaChip:    { fontSize: 12, color: 'white', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, overflow: 'hidden', fontWeight: '600' },
  detailDesc:  { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 21, marginBottom: 18 },
  weekRow:     { flexDirection: 'row', gap: 10, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 10 },
  weekNum:     { fontSize: 12, fontWeight: '700', color: '#93C5FD', width: 52 },
  weekTxt:     { fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 },
  warnTxt:     { fontSize: 12, color: '#FCD34D', textAlign: 'center', marginTop: 12 },
  startBtn:    { backgroundColor: 'white', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 14 },
  startBtnTxt: { color: BLUE, fontWeight: '700', fontSize: 15 },
});
