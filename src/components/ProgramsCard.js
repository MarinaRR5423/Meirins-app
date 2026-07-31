/**
 * ProgramsCard â€" programas de entrenamiento guiados (Gimnasio > Hoy).
 *
 * Sin programa activo: banner que abre el catÃ¡logo de programas.
 * Con programa activo: muestra la prÃ³xima sesiÃ³n, progreso y botÃ³n de completar.
 *
 * Progreso en profile_extended.activeProgram = { id, started, done }
 * Historial en profile_extended.completedPrograms = [id, ...]
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { X, ChevronRight, ChevronLeft, Check, SportShoe } from 'lucide-react-native';
import { F } from '../theme/fonts';
import BText from './BText';
import {
 PROGRAMS, totalSessions, getSession, formatSession, sessionMinutes,
 LEVEL_LABEL, isRecommended,
} from '../data/trainingPrograms';

const BLUE = '#429FE7';

export default function ProgramsCard({ lang = 'es', profileExtended, saveProfileExtended, compact = false }) {
 const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);
 const L = (o) => o?.[lang] || o?.es || '';

 const [open, setOpen] = useState(false);
 const [detail, setDetail] = useState(null); // programa en vista detalle
 const [saving, setSaving] = useState(false);

 const active = profileExtended?.activeProgram || null;
 const program = active ? PROGRAMS.find(p => p.id === active.id) : null;
 const total = program ? totalSessions(program) : 0;
 const done = active?.done || 0;
 const session = program && done < total ? getSession(program, done) : null;
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
 // Programa terminado ðŸŽ‰
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

 // â"€â"€ Tarjeta en la pestaÃ±a Hoy â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
 return (
 <>
 {program && session ? (
 <ImageBackground
 source={require('../../assets/onboarding-bg.png')}
 style={st.card}
 imageStyle={{ borderRadius: 24, opacity: 0.35 }}>
 <View style={st.headerRow}>
 <View style={st.headerLabel}>
 <SportShoe size={14} color="white" />
 <BText style={[st.headerLabelTxt, { color: 'rgba(255,255,255,0.85)' }]}>{tr('Mi programa', 'My programme', 'Mon programme', 'Il mio programma')}</BText>
 </View>
 <TouchableOpacity onPress={() => setOpen(true)}>
 <ChevronRight size={16} color="white" />
 </TouchableOpacity>
 </View>

 <BText style={st.title}>{L(program.name)}</BText>

 <View style={st.tagsRow}>
 <View style={st.tag}><BText style={st.tagTxt}>{program.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')}</BText></View>
 <View style={st.tag}><BText style={st.tagTxt}>{done}/{total} {tr('sesiones', 'sessions', 'sÃ©ances', 'sessioni')}</BText></View>
 {session && <View style={st.tag}><BText style={st.tagTxt}>{sessionMinutes(session.spec)}'</BText></View>}
 </View>

 {/* Barra de progreso */}
 <View style={st.progressBg}>
 <View style={[st.progressFill, { width: `${Math.round((done / total) * 100)}%` }]} />
 </View>

 {compact ? (
 /* Hoy toca sesiÃ³n del programa: se muestra como "SesiÃ³n de hoy"
 justo debajo â€" aquÃ­ solo el aviso para no duplicar */
 <BText style={st.compactHint}>
 {tr('Hoy toca la sesiÃ³n de tu programa â€" estÃ¡ justo debajo',
 'Today is a programme session â€" it is right below',
 'Aujourd\'hui sÃ©ance du programme â€" juste en dessous',
 'Oggi tocca la sessione del programma â€" Ã¨ qui sotto')}
 </BText>
 ) : (
 <>
 {/* PrÃ³xima sesiÃ³n */}
 <BText style={st.sessionLabel}>
 {tr('PRÃ"XIMA SESIÃ"N', 'NEXT SESSION', 'PROCHAINE SÃ‰ANCE', 'PROSSIMA SESSIONE')}
 {' Â· â± ~'}{sessionMinutes(session.spec)}{'\''}
 </BText>
 <View style={st.sessionCard}>
 {formatSession(session.spec, lang).map((line, i) => (
 <View key={i} style={st.lineRow}>
 <View style={st.lineDot} />
 <BText style={st.lineTxt}>{line}</BText>
 </View>
 ))}
 </View>

 <TouchableOpacity style={[st.doneBtn, saving && { opacity: 0.6 }]} onPress={completeSession} disabled={saving}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
 <Check size={16} color="white" />
 <BText style={st.doneBtnTxt}>{tr('SesiÃ³n completada', 'Session done', 'SÃ©ance terminÃ©e', 'Sessione completata')}</BText>
 </View>
 </TouchableOpacity>
 </>
 )}
 </ImageBackground>
 ) : (
 <TouchableOpacity style={st.banner} onPress={() => setOpen(true)} activeOpacity={0.85}>
 <SportShoe size={26} color="#0A0A0A" />
 <View style={{ flex: 1 }}>
 <BText style={st.bannerTitle}>
 {tr('Programas de entrenamiento', 'Training programmes', 'Programmes d\'entraÃ®nement', 'Programmi di allenamento')}
 </BText>
 <BText style={st.bannerSub}>
 {tr('9 planes guiados: correr, nadar, fuerzaâ€¦', '9 guided plans: run, swim, strengthâ€¦', '9 plans guidÃ©s : courir, nager, forceâ€¦', '9 piani guidati: correre, nuotare, forzaâ€¦')}
 </BText>
 </View>
 <ChevronRight size={20} color="#0A0A0A" />
 </TouchableOpacity>
 )}

 {/* â"€â"€ Modal: catÃ¡logo / detalle / programa activo â"€â"€ */}
 <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setOpen(false); setDetail(null); }}>
 <SafeAreaView style={st.modal}>
 <View style={st.modalHeader}>
 {detail ? (
 <TouchableOpacity onPress={() => setDetail(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
 <ChevronLeft size={18} color="#429FE7" />
 <BText style={st.backTxt}>{tr('Programas', 'Programmes', 'Programmes', 'Programmi')}</BText>
 </TouchableOpacity>
 ) : (
 <BText style={st.modalTitle}>
 {tr('Programas', 'Programmes', 'Programmes', 'Programmi')}
 </BText>
 )}
 <TouchableOpacity onPress={() => { setOpen(false); setDetail(null); }} style={st.closeBtn}>
 <X size={20} color="#737373" />
 </TouchableOpacity>
 </View>

 <ScrollView contentContainerStyle={st.modalBody}>
 {detail ? (
 /* â"€â"€ DETALLE DE UN PROGRAMA â"€â"€ */
 <>
 <BText style={st.detailTitle}>{detail.emoji} {L(detail.name)}</BText>
 <View style={st.metaRow}>
 <BText style={st.metaChip}>{detail.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')}</BText>
 <BText style={st.metaChip}>{detail.spw}Ã—/{tr('sem', 'wk', 'sem', 'sett')}</BText>
 <BText style={st.metaChip}>{L(LEVEL_LABEL[detail.level])}</BText>
 </View>
 <BText style={st.detailDesc}>{L(detail.desc)}</BText>

 {detail.weeks.map((w, i) => {
 const spec = w.all || w.list[w.list.length - 1];
 return (
 <View key={i} style={st.weekRow}>
 <BText style={st.weekNum}>{tr('Sem', 'Wk', 'Sem', 'Sett')} {i + 1}</BText>
 <BText style={st.weekTxt} numberOfLines={2}>
 {formatSession(spec, lang).join(' Â· ')}
 </BText>
 </View>
 );
 })}

 {active && active.id !== detail.id && (
 <BText style={st.warnTxt}>
 âš ï¸ {tr('Empezar este programa abandonarÃ¡ el actual.',
 'Starting this programme will abandon the current one.',
 'Commencer ce programme abandonnera le programme en cours.',
 'Iniziare questo programma abbandonerÃ  quello attuale.')}
 </BText>
 )}
 <TouchableOpacity style={[st.startBtn, saving && { opacity: 0.6 }]} onPress={() => startProgram(detail)} disabled={saving}>
 <BText style={st.startBtnTxt}>
 {tr('Empezar programa', 'Start programme', 'Commencer', 'Inizia programma')}
 </BText>
 </TouchableOpacity>
 </>
 ) : (
 /* â"€â"€ CATÃLOGO â"€â"€ */
 <>
 {program && (
 <TouchableOpacity style={st.abandonBtn} onPress={abandonProgram} disabled={saving}>
 <BText style={st.abandonTxt}>
 {tr('Abandonar programa actual', 'Abandon current programme', 'Abandonner le programme en cours', 'Abbandona il programma attuale')} ({L(program.name)})
 </BText>
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
 <BText style={{ fontSize: 26 }}>{p.emoji}</BText>
 <View style={{ flex: 1 }}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
 <BText style={st.progName}>{L(p.name)}</BText>
 {rec && <BText style={st.recBadge}>{tr('Para ti', 'For you', 'Pour toi', 'Per te')}</BText>}
 {isActive && <BText style={st.activeBadge}>{tr('En curso', 'Active', 'En cours', 'In corso')}</BText>}
 {isDone && !isActive && <View style={[st.doneBadge, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}><Check size={11} color="#16A34A" /><BText style={st.doneBadgeTxt}>{tr('Completado', 'Done', 'TerminÃ©', 'Completato')}</BText></View>}
 </View>
 <BText style={st.progMeta}>
 {p.weeks.length} {tr('semanas', 'weeks', 'semaines', 'settimane')} Â· {p.spw}Ã—/{tr('sem', 'wk', 'sem', 'sett')} Â· {L(LEVEL_LABEL[p.level])}
 </BText>
 </View>
 <ChevronRight size={20} color="#737373" />
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
 // Tarjeta programa activo â€" variante "azul clarito" (Figma)
 card: { backgroundColor: '#0A1823', borderRadius: 24, padding: 16, marginBottom: 2, overflow: 'hidden' },
 headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
 headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
 headerLabelTxt: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: F.body },
 title: { fontSize: 22, color: 'white', marginBottom: 8, fontFamily: F.headingX },
 link: { fontSize: 13, color: 'white', fontFamily: F.bodyB },
 tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 },
 tag: { height: 24, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' },
 tagTxt: { fontSize: 10, fontFamily: F.bodyB, color: 'white', textTransform: 'uppercase', letterSpacing: 0.3 },
 progressBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', marginBottom: 16 },
 progressFill:{ height: 6, borderRadius: 3, backgroundColor: 'white' },
 progressTxt: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, marginBottom: 12, fontFamily: F.body },
 sessionLabel:{ fontSize: 11, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 8 },
 sessionCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 12, gap: 6, marginBottom: 12 },
 lineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 lineDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' },
 lineTxt: { fontSize: 13, color: 'white', flex: 1, fontFamily: F.body },
 doneBtn: { backgroundColor: 'white', borderRadius: 12, padding: 13, alignItems: 'center' },
 doneBtnTxt: { color: '#0A1823', fontFamily: F.bodyB, fontSize: 14 },
 compactHint: { fontSize: 13, color: 'white', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, fontFamily: F.body },

 // Banner sin programa
 banner: {
 flexDirection: 'row', alignItems: 'center', gap: 12,
 backgroundColor: '#FAFAFA', borderRadius: 24, padding: 16,
 marginBottom: 2, borderWidth: 1, borderColor: '#E5E5E5',
 },
 bannerTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 2 },
 bannerSub: { fontSize: 12, color: '#525252', fontFamily: F.body },
 bannerArrow: { fontSize: 18, color: '#0A0A0A', fontFamily: F.bodyB },

 // Modal
 modal: { flex: 1, backgroundColor: '#0A0A0A' },
 modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
 modalTitle: { fontSize: 18, fontFamily: F.bodyB, color: 'white' },
 backTxt: { fontSize: 15, color: '#93C5FD', fontFamily: F.bodyB },
 closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
 closeTxt: { color: 'white', fontSize: 14, fontFamily: F.bodyB },
 modalBody: { padding: 20, paddingBottom: 60 },

 // Lista de programas
 progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
 progRowActive: { borderColor: '#93C5FD' },
 progName: { fontSize: 14.5, color: 'white', fontFamily: F.bodyB },
 progMeta: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontFamily: F.body },
 progArrow: { fontSize: 20, color: 'rgba(255,255,255,0.4)', fontFamily: F.body },
 recBadge: { fontSize: 10, fontFamily: F.bodyB, color: '#312E81', backgroundColor: '#A5B4FC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
 activeBadge: { fontSize: 10, fontFamily: F.bodyB, color: 'white', backgroundColor: BLUE, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
 doneBadge: { backgroundColor: '#6EE7B7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, overflow: 'hidden' },
 doneBadgeTxt: { fontSize: 10, fontFamily: F.bodyB, color: '#065F46' },
 abandonBtn: { padding: 10, marginBottom: 10 },
 abandonTxt: { fontSize: 12, color: '#FCA5A5', textAlign: 'center', textDecorationLine: 'underline', fontFamily: F.body },

 // Detalle
 detailTitle: { fontSize: 20, fontFamily: F.bodyB, color: 'white', marginBottom: 10 },
 metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
 metaChip: { fontSize: 12, color: 'white', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, overflow: 'hidden', fontFamily: F.bodyB },
 detailDesc: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 21, marginBottom: 18, fontFamily: F.body },
 weekRow: { flexDirection: 'row', gap: 10, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 10 },
 weekNum: { fontSize: 12, fontFamily: F.bodyB, color: '#93C5FD', width: 52 },
 weekTxt: { fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1, fontFamily: F.body },
 warnTxt: { fontSize: 12, color: '#FCD34D', textAlign: 'center', marginTop: 12, fontFamily: F.body },
 startBtn: { backgroundColor: 'white', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 14 },
 startBtnTxt: { color: BLUE, fontFamily: F.bodyB, fontSize: 15 },
});


