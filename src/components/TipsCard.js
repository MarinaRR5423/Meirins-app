import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';
import { ChevronRight, BookOpen } from 'lucide-react-native';
import { ARTICLE_CATEGORIES } from '../data/articles';
import T from '../i18n/translations';
import BText from './BText';

const SUBTITLE = {
 es: 'Artículos y trucos para cada fase de tu ciclo',
 en: 'Articles and tips for every phase of your cycle',
 fr: 'Articles et astuces pour chaque phase de ton cycle',
 it: 'Articoli e consigli per ogni fase del tuo ciclo',
};

/**
 * TipsCard — lista de artículos.
 * variant="default" (blanco, compacto) o "azote" (estilo Ciclo: fondo gris,
 * tags pill, tarjetas más grandes) — el variant solo afecta a esta instancia,
 * no a otras pantallas que usen el mismo componente.
 */
export default function TipsCard({ articles = [], lang = 'es', variant = 'default' }) {
 const tips = (T[lang] || T.es).tips;
 const [open, setOpen] = useState(null);
 const azote = variant === 'azote';
 const visibleArticles = articles.slice(0, 2);

 if (!visibleArticles.length) return null;
 const cat = open ? ARTICLE_CATEGORIES[open.category] : null;

 if (azote) {
 return (
 <>
 <View style={a.card}>
 <View style={a.header}>
 <View style={a.headerLabel}>
 <BookOpen size={16} color="#0A0A0A" strokeWidth={2} />
 <BText style={a.headerLabelTxt}>{tips.title}</BText>
 </View>
 <ChevronRight size={16} color="#0A0A0A" />
 </View>
 <BText style={a.title}>{tips.title}</BText>
 <BText style={a.subtitle}>{SUBTITLE[lang] || SUBTITLE.es}</BText>

 <View style={{ gap: 2 }}>
 {visibleArticles.map((article) => {
 const c = ARTICLE_CATEGORIES[article.category];
 return (
 <TouchableOpacity
 key={article.id}
 style={a.row}
 onPress={() => setOpen(article)}
 activeOpacity={0.75}
 >
 <View style={a.body}>
 <BText style={a.articleTitle}>{article.title[lang] || article.title.es}</BText>
 <BText style={a.summary} numberOfLines={2}>{article.summary[lang] || article.summary.es}</BText>
 <View style={a.tagsRow}>
 <View style={[a.tag, { backgroundColor: c.bg }]}>
 <BText style={[a.tagTxt, { color: c.color }]}>{article.category}</BText>
 </View>
 <View style={a.tagNeutral}>
 <BText style={a.tagNeutralTxt}>{article.readTime} {tips.readTime}</BText>
 </View>
 </View>
 </View>
 </TouchableOpacity>
 );
 })}
 </View>
 </View>

 {open && <ArticleModal article={open} cat={cat} lang={lang} tips={tips} onClose={() => setOpen(null)} />}
 </>
 );
 }

 return (
 <>
 <View style={styles.card}>
 <View style={styles.header}>
 <BText style={styles.title}>{tips.title}</BText>
 </View>

 {visibleArticles.map((article, idx) => {
 const c = ARTICLE_CATEGORIES[article.category];
 const isLast = idx === visibleArticles.length - 1;
 return (
 <TouchableOpacity
 key={article.id}
 style={[styles.row, !isLast && styles.rowBorder]}
 onPress={() => setOpen(article)}
 activeOpacity={0.75}
 >
 <View style={[styles.iconBg, { backgroundColor: c.bg }]}>
 <BText style={[styles.icon, { color: c.color, fontSize: 10 }]}>{article.category}</BText>
 </View>
 <View style={styles.body}>
 <BText style={styles.articleTitle}>{article.title[lang] || article.title.es}</BText>
 <BText style={styles.summary} numberOfLines={1}>{article.summary[lang] || article.summary.es}</BText>
 <BText style={styles.meta}>{article.readTime} {tips.readTime}</BText>
 </View>
 <ChevronRight size={20} color="#737373" />
 </TouchableOpacity>
 );
 })}
 </View>

 {open && <ArticleModal article={open} cat={cat} lang={lang} tips={tips} onClose={() => setOpen(null)} />}
 </>
 );
}

function ArticleModal({ article, cat, lang, tips, onClose }) {
 const body = article.body[lang] || article.body.es;
 const title = article.title[lang] || article.title.es;
 const summary = article.summary[lang] || article.summary.es;
 const mid = Math.ceil(body.length / 2);
 const part1 = body.slice(0, mid);
 const part2 = body.slice(mid);
 return (
 <Modal visible animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
 <View style={m.overlay}>
 <SafeAreaView style={m.sheet}>
 <View style={m.header}>
 <BText style={m.headerTitle}>{{ es: 'Información', en: 'Information', fr: 'Information', it: 'Informazione' }[lang] || 'Información'}</BText>
 <TouchableOpacity style={m.closeBtn} onPress={onClose}>
 <BText style={m.closeTxt}>✕</BText>
 </TouchableOpacity>
 </View>
 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={m.content}>
 <View style={m.section}>
 <View style={[m.banner, { backgroundColor: cat.bg }]}>
 <BText style={[m.bannerTxt, { color: cat.color }]}>{article.category}</BText>
 </View>
 <BText style={m.articleTitle}>{title}</BText>
 <BText style={m.bodyTxt}>{summary}</BText>
 </View>
 {part1.length > 0 && (
 <View style={m.section}>
 <BText style={m.sectionTitle}>{tips.readMore || 'Artículo'}</BText>
 {part1.map((para, i) => <BText key={i} style={m.bodyTxt}>{para}</BText>)}
 </View>
 )}
 {part2.length > 0 && (
 <View style={m.section}>
 <BText style={m.sectionTitle}>{tips.tips || 'Más'}</BText>
 {part2.map((para, i) => <BText key={i} style={m.bodyTxt}>{para}</BText>)}
 </View>
 )}
 </ScrollView>
 </SafeAreaView>
 </View>
 </Modal>
 );
}

const styles = StyleSheet.create({
 card: {
 backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
 shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
 },
 header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
 title: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },

 row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
 rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 icon: { fontSize: 22, fontFamily: F.body },
 body: { flex: 1 },
 articleTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 2, lineHeight: 18 },
 summary: { fontSize: 11, color: '#737373', lineHeight: 16, marginBottom: 3, fontFamily: F.body },
 meta: { fontSize: 10, color: '#737373', fontFamily: F.body },
 chevron: { fontSize: 22, color: '#E5E5E5', fontFamily: F.body },

 // Modal
 modal: { flex: 1, backgroundColor: '#FAFCFF' },
 modalHeader: {
 flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
 paddingHorizontal: 20, paddingVertical: 12,
 borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
 },
 backBtn: { paddingVertical: 4 },
 backText: { fontSize: 15, color: '#429FE7', fontFamily: F.bodyB },
 catChip: { height: 28, paddingHorizontal: 10, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
 modalContent: { padding: 24, paddingTop: 32 },
 modalTitle: { fontSize: 22, color: '#0A0A0A', textAlign: 'center', lineHeight: 28, marginBottom: 8, fontFamily: F.headingX },
 modalMeta: { fontSize: 12, color: '#737373', textAlign: 'center', marginBottom: 20, fontFamily: F.body },
 divider: { height: 3, borderRadius: 2, width: 40, alignSelf: 'center', marginBottom: 24 },
 para: { fontSize: 15, color: '#0A0A0A', lineHeight: 26, marginBottom: 16, fontFamily: F.body },
});

// ─── Article modal ────────────────────────────────────────────────────────────
const m = StyleSheet.create({
 overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 sheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1, maxHeight: '90%' },
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 48 },
 headerTitle: { flex: 1, fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },
 closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
 closeTxt: { fontSize: 18, color: '#0A0A0A', fontFamily: F.body, lineHeight: 22 },
 content: { padding: 16, paddingBottom: 48, gap: 48 },
 section: { gap: 16 },
 banner: { width: '100%', height: 200, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
 bannerTxt: { fontSize: 32, fontFamily: F.heading },
 articleTitle: { fontSize: 28, fontFamily: F.heading, color: '#171717' },
 sectionTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#171717' },
 bodyTxt: { fontSize: 16, fontFamily: F.body, color: '#171717', lineHeight: 21 },
});

// ─── Variant "azote" (Ciclo) ───────────────────────────────────────────────────
const a = StyleSheet.create({
 card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 12 },
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
 headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
 headerLabelTxt: { fontSize: 12, fontFamily: F.bodyB, color: '#0A0A0A' },
 title: { fontSize: 20, color: '#0A0A0A', marginBottom: 4, fontFamily: F.headingX },
 subtitle: { fontSize: 14, color: '#525252', marginBottom: 16, lineHeight: 20, fontFamily: F.body },

 row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'white', borderRadius: 16, padding: 8 },
 iconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 icon: { fontSize: 22, fontFamily: F.body },
 body: { flex: 1, gap: 8 },
 articleTitle: { fontSize: 16, color: '#0A0A0A', marginBottom: 2, lineHeight: 20, fontFamily: F.heading },
 summary: { fontSize: 13, color: '#525252', lineHeight: 18, fontFamily: F.body },
 tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
 tag: { height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
 tagTxt: { fontSize: 10, fontFamily: F.bodyB, textTransform: 'uppercase', letterSpacing: 0.3 },
 tagNeutral: { height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
 tagNeutralTxt: { fontSize: 10, fontFamily: F.bodyB, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },
});
