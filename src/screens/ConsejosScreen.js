import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ARTICLES, ARTICLE_CATEGORIES } from '../data/articles';
import { fetchArticles } from '../data/dataService';
import T from '../i18n/translations';

function ArticleCard({ article, lang, onPress }) {
  const cat = ARTICLE_CATEGORIES[article.category];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardIconBg, { backgroundColor: cat.bg }]}>
        <Text style={styles.cardIcon}>{article.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={[styles.catChip, { backgroundColor: cat.bg }]}>
          <Text style={[styles.catChipText, { color: cat.color }]}>{cat.icon} {article.category}</Text>
        </View>
        <Text style={styles.cardTitle}>{article.title[lang] || article.title.es}</Text>
        <Text style={styles.cardSummary} numberOfLines={2}>{article.summary[lang] || article.summary.es}</Text>
        <Text style={styles.cardReadTime}>⏱ {article.readTime} min</Text>
      </View>
    </TouchableOpacity>
  );
}

function ArticleModal({ article, lang, tips, onClose }) {
  if (!article) return null;
  const cat = ARTICLE_CATEGORIES[article.category];
  const body = article.body[lang] || article.body.es;
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>{tips.back}</Text>
          </TouchableOpacity>
          <View style={[styles.catChip, { backgroundColor: cat.bg }]}>
            <Text style={[styles.catChipText, { color: cat.color }]}>{cat.icon}</Text>
          </View>
        </View>
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <Text style={styles.modalIcon}>{article.icon}</Text>
          <Text style={styles.modalTitle}>{article.title[lang] || article.title.es}</Text>
          <Text style={styles.modalMeta}>⏱ {article.readTime} {tips.readTime} · {cat.icon} {article.category}</Text>
          <View style={[styles.modalDivider, { backgroundColor: cat.color }]} />
          {body.map((para, i) => (
            <Text key={i} style={styles.modalPara}>{para}</Text>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ConsejosScreen({ lang = 'es' }) {
  const tips = (T[lang] || T.es).tips;
  const [activeCategory, setActiveCategory] = useState('all');
  const [openArticle, setOpenArticle]       = useState(null);
  const [articles, setArticles]             = useState(ARTICLES);

  useEffect(() => {
    fetchArticles()
      .then(remote => { if (remote?.length) setArticles(remote); })
      .catch(() => {});
  }, []);

  const categories = ['all', ...Object.keys(ARTICLE_CATEGORIES)];
  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tips.title}</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {categories.map(cat => {
          const isActive = cat === activeCategory;
          const catData = ARTICLE_CATEGORIES[cat];
          const label = cat === 'all'
            ? tips.all
            : (tips.categories?.[cat] || cat);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: catData?.color || '#1A56DB', borderColor: catData?.color || '#1A56DB' },
              ]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Articles list */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            lang={lang}
            onPress={() => setOpenArticle(article)}
          />
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Article detail modal */}
      <ArticleModal
        article={openArticle}
        lang={lang}
        tips={tips}
        onClose={() => setOpenArticle(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },

  header: {
    backgroundColor: '#1A56DB',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white' },

  filterRow: { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: 'white' },

  list: { padding: 14 },

  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardIconBg: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  catChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 6 },
  catChipText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4, lineHeight: 20 },
  cardSummary: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  cardReadTime: { fontSize: 11, color: '#94A3B8' },

  // Modal
  modal: { flex: 1, backgroundColor: '#FAFCFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: '#1A56DB', fontWeight: '600' },
  modalScroll: { flex: 1 },
  modalContent: { padding: 24, paddingTop: 32 },
  modalIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', textAlign: 'center', lineHeight: 30, marginBottom: 8 },
  modalMeta: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  modalDivider: { height: 3, borderRadius: 2, width: 40, alignSelf: 'center', marginBottom: 24 },
  modalPara: { fontSize: 15, color: '#334155', lineHeight: 26, marginBottom: 16 },
});
