import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getIdeas, getFavorites } from '../storage/storage.jsx';
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

// "All" is a filter option only, it is not a real category
const FILTERS = ['All', ...CATEGORIES];

export default function IdeasScreen({ navigation, route }) {
  const [ideas, setIdeas] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Used to ignore old results if the user types quickly
  const requestId = useRef(0);

  // If another screen opens this tab with { category }, apply it.
  // (The Categories screen will use this in Phase 6.)
    const routeCategory = route && route.params ? route.params.category : undefined;
  const routeStamp = route && route.params ? route.params.stamp : undefined;
  useEffect(() => {
    if (routeCategory) {
      setCategory(routeCategory);
    }
  }, [routeCategory, routeStamp]);

  const loadIdeas = useCallback(async () => {
    const thisRequest = ++requestId.current;
    try {
      setError(null);
      const [ideaList, favoriteList] = await Promise.all([
        getIdeas(searchText, category),
        getFavorites(),
      ]);
      if (thisRequest !== requestId.current) return; // outdated result
      setIdeas(ideaList);
      setFavoriteIds(new Set(favoriteList.map((item) => item.id)));
    } catch (e) {
      if (thisRequest === requestId.current) {
        setError(e.message || 'Could not load ideas.');
      }
    } finally {
      if (thisRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [searchText, category]);

  // Reloads when the screen comes into view AND when the search text
  // or category changes. A short delay while typing avoids a database
  // query on every single key press.
  useFocusEffect(
    useCallback(() => {
      const delay = searchText ? 250 : 0;
      const timer = setTimeout(loadIdeas, delay);
      return () => clearTimeout(timer);
    }, [loadIdeas, searchText])
  );

  const clearFilters = () => {
    setSearchText('');
    setCategory('All');
  };

  const hasFilters = searchText.trim() !== '' || category !== 'All';

  // ---------- Header: search box and category chips ----------
  const renderHeader = () => (
    <View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ideas…"
          placeholderTextColor={COLORS.muted}
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
        keyboardShouldPersistTaps="handled"
      >
        {FILTERS.map((item) => {
          const active = item === category;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategory(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!loading && !error && (
        <Text style={styles.resultCount}>
          {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
        </Text>
      )}
    </View>
  );

  // ---------- One idea row ----------
  const renderIdea = ({ item }) => {
    const isFav = favoriteIds.has(item.id);
    return (
      <TouchableOpacity
        style={styles.ideaCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
      >
        <View style={styles.ideaIcon}>
          <Ionicons
            name={CATEGORY_ICONS[item.category] || 'camera'}
            size={22}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.ideaInfo}>
          <Text style={styles.ideaTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.ideaCategory}>{item.category}</Text>
          <Text style={styles.ideaMeta} numberOfLines={1}>
            ISO {item.iso} · {item.aperture} · {item.shutterSpeed}
          </Text>
        </View>
        {isFav && (
          <Ionicons
            name="heart"
            size={18}
            color={COLORS.primary}
            style={styles.heart}
          />
        )}
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
    );
  };

  // ---------- Empty state ----------
  const renderEmpty = () => {
    if (loading || error) return null;
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="search-outline" size={40} color={COLORS.muted} />
        <Text style={styles.emptyTitle}>No ideas found</Text>
        <Text style={styles.emptyText}>
          {hasFilters
            ? 'Try a different search or category.'
            : 'There are no photography ideas yet.'}
        </Text>
        {hasFilters && (
          <TouchableOpacity style={styles.button} onPress={clearFilters}>
            <Text style={styles.buttonText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------- First loading state ----------
  if (loading && ideas.length === 0 && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading ideas…</Text>
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
          style={styles.button}
          onPress={() => {
            setLoading(true);
            loadIdeas();
          }}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderIdea}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 16, paddingBottom: 32 },

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

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    marginLeft: 8,
  },

  // Category chips
  chipsScroll: { flexGrow: 0, marginTop: 12 },
  chipsContent: { paddingRight: 8 },
  chip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: COLORS.background },

  resultCount: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 14,
    marginBottom: 10,
  },

  // Idea rows
  ideaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  ideaIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ideaInfo: { flex: 1 },
  ideaTitle: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  ideaCategory: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ideaMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  heart: { marginRight: 8 },

  // Empty state
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  // Buttons
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 18,
  },
  buttonText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
});