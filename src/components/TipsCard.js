import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';
import { ChevronRight, BookOpen } from 'lucide-react-native';
import { ARTICLE_CATEGORIES } from '../data/articles';
import T from '../i18n/translations';

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

  if (!articles.length) return null;
  const cat = open ? ARTICLE_CATEGORIES[open.category] : null;

  if (azote) {
    return (
      <>
        <View style={a.card}>
          <View style={a.header}>
            <View style={a.headerLabel}>
              <BookOpen size={16} color="#0A0A0A" strokeWidth={2} />
              <Text style={a.headerLabelTxt}>{tips.title}</Text>
            </View>
            <ChevronRight size={16} color="#0A0A0A" />
          </View>
          <Text style={a.title}>{tips.title}</Text>
          <Text style={a.subtitle}>{SUBTITLE[lang] || SUBTITLE.es}</Text>

          <View style={{ gap: 2 }}>
            {articles.map((article) => {
              const c = ARTICLE_CATEGORIES[article.category];
              return (
                <TouchableOpacity
                  key={article.id}
                  style={a.row}
                  onPress={() => setOpen(article)}
                  activeOpacity={0.75}
                >
                  <View style={[a.iconBg, { backgroundColor: c.bg }]}>
                    <Text style={a.icon}>{article.icon}</Text>
                  </View>
                  <View style={a.body}>
                    <Text style={a.articleTitle}>{article.title[lang] || article.title.es}</Text>
                    <Text style={a.summary} numberOfLines={2}>{article.summary[lang] || article.summary.es}</Text>
                    <View style={a.tagsRow}>
                      <View style={[a.tag, { backgroundColor: c.bg }]}>
                        <Text style={[a.tagTxt, { color: c.color }]}>{c.icon} {article.category}</Text>
                      </View>
                      <View style={a.tagNeutral}>
                        <Text style={a.tagNeutralTxt}>{article.readTime} {tips.readTime}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {open && (
          <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(null)}>
            <SafeAreaView style={styles.modal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setOpen(null)} style={styles.backBtn}>
                  <Text style={styles.backText}>{tips.back}</Text>
                </TouchableOpacity>
                <View style={[styles.catChip, { backgroundColor: cat.bg }]}>
                  <Text style={{ color: cat.color, fontSize: 15 }}>{cat.icon}</Text>
                </View>
              </View>
              <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalIcon}>{open.icon}</Text>
                <Text style={styles.modalTitle}>{open.title[lang] || open.title.es}</Text>
                <Text style={styles.modalMeta}>⏱ {open.readTime} {tips.readTime} · {cat.icon} {open.category}</Text>
                <View style={[styles.divider, { backgroundColor: cat.color }]} />
                {(open.body[lang] || open.body.es).map((para, i) => (
                  <Text key={i} style={styles.para}>{para}</Text>
                ))}
                <View style={{ height: 32 }} />
              </ScrollView>
            </SafeAreaView>
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 {tips.title}</Text>
        </View>

        {articles.map((article, idx) => {
          const c = ARTICLE_CATEGORIES[article.category];
          const isLast = idx === articles.length - 1;
          return (
            <TouchableOpacity
              key={article.id}
              style={[styles.row, !isLast && styles.rowBorder]}
              onPress={() => setOpen(article)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBg, { backgroundColor: c.bg }]}>
                <Text style={styles.icon}>{article.icon}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.articleTitle}>{article.title[lang] || article.title.es}</Text>
                <Text style={styles.summary} numberOfLines={1}>{article.summary[lang] || article.summary.es}</Text>
                <Text style={styles.meta}>⏱ {article.readTime} {tips.readTime} · {c.icon}</Text>
              </View>
              <ChevronRight size={20} color="#94A3B8" />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Full article modal ── */}
      {open && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setOpen(null)} style={styles.backBtn}>
                <Text style={styles.backText}>{tips.back}</Text>
              </TouchableOpacity>
              <View style={[styles.catChip, { backgroundColor: cat.bg }]}>
                <Text style={{ color: cat.color, fontSize: 15 }}>{cat.icon}</Text>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalIcon}>{open.icon}</Text>
              <Text style={styles.modalTitle}>{open.title[lang] || open.title.es}</Text>
              <Text style={styles.modalMeta}>⏱ {open.readTime} {tips.readTime} · {cat.icon} {open.category}</Text>
              <View style={[styles.divider, { backgroundColor: cat.color }]} />
              {(open.body[lang] || open.body.es).map((para, i) => (
                <Text key={i} style={styles.para}>{para}</Text>
              ))}
              <View style={{ height: 32 }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  icon: { fontSize: 22 },
  body: { flex: 1 },
  articleTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 2, lineHeight: 18 },
  summary: { fontSize: 11, color: '#64748B', lineHeight: 16, marginBottom: 3 },
  meta: { fontSize: 10, color: '#94A3B8' },
  chevron: { fontSize: 22, color: '#CBD5E1', fontWeight: '300' },

  // Modal
  modal: { flex: 1, backgroundColor: '#FAFCFF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: '#1A56DB', fontWeight: '600' },
  catChip: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, paddingTop: 32 },
  modalIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center', lineHeight: 28, marginBottom: 8, fontFamily: F.headingX },
  modalMeta: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  divider: { height: 3, borderRadius: 2, width: 40, alignSelf: 'center', marginBottom: 24 },
  para: { fontSize: 15, color: '#334155', lineHeight: 26, marginBottom: 16 },
});

// ─── Variant "azote" (Ciclo) ───────────────────────────────────────────────────
const a = StyleSheet.create({
  card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerLabelTxt: { fontSize: 12, fontWeight: '600', color: '#0A0A0A' },
  title: { fontSize: 20, fontWeight: '800', color: '#0A0A0A', marginBottom: 4, fontFamily: F.headingX },
  subtitle: { fontSize: 14, color: '#525252', marginBottom: 16, lineHeight: 20 },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'white', borderRadius: 16, padding: 8 },
  iconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  icon: { fontSize: 22 },
  body: { flex: 1, gap: 8 },
  articleTitle: { fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 2, lineHeight: 20, fontFamily: F.heading },
  summary: { fontSize: 13, color: '#525252', lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tagTxt: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  tagNeutral: { height: 24, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  tagNeutralTxt: { fontSize: 10, fontWeight: '600', color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: 0.3 },
});
