import React, { useCallback, useRef, useState } from 'react';
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
import { getShoots } from '../storage/storage.jsx';
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

const FILTERS = ['All', ...CATEGORIES];

// "2026-11-14" -> "14 Nov 2026". Returns the original text if it is not a valid date.
function formatDate(text) {
  if (!text) return 'No date';
  const parts = text.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return text;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function JournalScreen({ navigation }) {
  const [shoots, setShoots] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Used to ignore old results if the user types quickly
  const requestId = useRef(0);

  const loadShoots = useCallback(async () => {
    const thisRequest = ++requestId.current;
    try {
      setError(null);
      const list = await getShoots(searchText, category);
      if (thisRequest !== requestId.current) return; // outdated result
      setShoots(list);
    } catch (e) {
      if (thisRequest === requestId.current) {
        setError(e.message || 'Could not load your shoots.');
      }
    } finally {
      if (thisRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [searchText, category]);

  // Reloads when the tab comes into view (after adding, editing or deleting)
  // and when the search text or category changes.
  useFocusEffect(
    useCallback(() => {
      const delay = searchText ? 250 : 0;
      const timer = setTimeout(loadShoots, delay);
      return () => clearTimeout(timer);
    }, [loadShoots, searchText])
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
          placeholder="Search title, location, notes…"
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
          {shoots.length} {shoots.length === 1 ? 'shoot' : 'shoots'}
        </Text>
      )}
    </View>
  );

  // ---------- One shoot card ----------
  const renderShoot = ({ item }) => {
    const settings = [
      item.iso ? `ISO ${item.iso}` : '',
      item.aperture,
      item.shutterSpeed,
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <TouchableOpacity
        style={styles.shootCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ShootDetail', { shootId: item.id })}
      >
        <View style={styles.shootIcon}>
          <Ionicons
            name={CATEGORY_ICONS[item.category] || 'camera'}
            size={22}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.shootInfo}>
          <Text style={styles.shootTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            {item.location !== '' && (
              <>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={COLORS.muted}
                  style={styles.metaGap}
                />
                <Text style={[styles.metaText, styles.metaFlex]} numberOfLines={1}>
                  {item.location}
                </Text>
              </>
            )}
          </View>

          {item.category !== '' && (
            <Text style={styles.shootCategory}>{item.category}</Text>
          )}
          {settings !== '' && (
            <Text style={styles.shootSettings} numberOfLines={1}>
              {settings}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
    );
  };

  // ---------- Empty state ----------
  const renderEmpty = () => {
    if (loading || error) return null;
    return (
      <View style={styles.emptyBox}>
        <Ionicons
          name={hasFilters ? 'search-outline' : 'camera-outline'}
          size={44}
          color={COLORS.muted}
        />
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'No shoots found' : 'No shoots yet'}
        </Text>
        <Text style={styles.emptyText}>
          {hasFilters
            ? 'Try a different search or category.'
            : 'Record your first photoshoot to start your journal.'}
        </Text>
        {hasFilters ? (
          <TouchableOpacity style={styles.button} onPress={clearFilters}>
            <Text style={styles.buttonText}>Clear filters</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AddShoot')}
          >
            <Text style={styles.buttonText}>Add your first shoot</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------- First loading state ----------
  if (loading && shoots.length === 0 && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading journal…</Text>
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
            loadShoots();
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
        data={shoots}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderShoot}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Floating "Add new shoot" button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddShoot')}
      >
        <Ionicons name="add" size={30} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 16, paddingBottom: 100 },

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

  // Chips
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

  // Shoot cards
  shootCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  shootIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shootInfo: { flex: 1 },
  shootTitle: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { color: COLORS.muted, fontSize: 12, marginLeft: 4 },
  metaGap: { marginLeft: 10 },
  metaFlex: { flex: 1 },
  shootCategory: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  shootSettings: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

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

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});