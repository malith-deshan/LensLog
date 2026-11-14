import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getIdeas } from '../storage/storage.jsx';
import { CATEGORIES, CATEGORY_ICONS } from '../data/seedData.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

export default function CategoriesScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadIdeas = useCallback(async () => {
    try {
      setError(null);
      const list = await getIdeas();
      setIdeas(list);
    } catch (e) {
      setError(e.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  // How many ideas does each category have?
  const countFor = (category) =>
    ideas.filter((idea) => idea.category === category).length;

  const relatedIdeas = ideas.filter((idea) => idea.category === selected);

  // Open the Ideas tab already filtered to the selected category.
  // "stamp" changes every time so the filter is applied again.
  const openInIdeasTab = () => {
    navigation.navigate('MainTabs', {
      screen: 'Ideas',
      params: { category: selected, stamp: Date.now() },
    });
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading categories…</Text>
      </View>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.centerText}>{error}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setLoading(true);
            loadIdeas();
          }}
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Choose a category</Text>

      {/* ---------- Category grid ---------- */}
      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const active = category === selected;
          const count = countFor(category);
          return (
            <TouchableOpacity
              key={category}
              style={styles.gridCell}
              activeOpacity={0.8}
              onPress={() => setSelected(category)}
            >
              <View style={[styles.categoryCard, active && styles.categoryCardActive]}>
                <Ionicons
                  name={CATEGORY_ICONS[category] || 'camera'}
                  size={26}
                  color={active ? COLORS.background : COLORS.primary}
                />
                <Text
                  style={[styles.categoryName, active && styles.categoryNameActive]}
                  numberOfLines={1}
                >
                  {category}
                </Text>
                <Text
                  style={[styles.categoryCount, active && styles.categoryCountActive]}
                >
                  {count} {count === 1 ? 'idea' : 'ideas'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------- Related ideas ---------- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{selected} ideas</Text>
        <TouchableOpacity onPress={openInIdeasTab}>
          <Text style={styles.seeAll}>Open in Ideas</Text>
        </TouchableOpacity>
      </View>

      {relatedIdeas.length === 0 ? (
        // ---------- Empty state ----------
        <View style={styles.emptyBox}>
          <Ionicons name="images-outline" size={36} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>No ideas in this category</Text>
        </View>
      ) : (
        relatedIdeas.map((idea) => (
          <TouchableOpacity
            key={idea.id}
            style={styles.ideaCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('IdeaDetail', { ideaId: idea.id })}
          >
            <View style={styles.ideaInfo}>
              <Text style={styles.ideaTitle} numberOfLines={1}>
                {idea.title}
              </Text>
              <Text style={styles.ideaMeta} numberOfLines={1}>
                ISO {idea.iso} · {idea.aperture} · {idea.shutterSpeed}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  heading: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },

  // Loading / error
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },

  // Grid: 3 columns
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '33.333%', padding: 4 },
  categoryCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  categoryNameActive: { color: COLORS.background },
  categoryCount: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  categoryCountActive: { color: COLORS.background },

  // Related ideas
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  sectionTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  ideaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  ideaInfo: { flex: 1 },
  ideaTitle: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  ideaMeta: { color: COLORS.muted, fontSize: 12, marginTop: 3 },

  // Empty state
  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
});