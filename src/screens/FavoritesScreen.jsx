import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, removeFavorite } from '../storage/storage.jsx';
import { CATEGORY_ICONS } from '../data/seedData.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    try {
      setError(null);
      const list = await getFavorites();
      setFavorites(list);
    } catch (e) {
      setError(e.message || 'Could not load your favorites.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reloads every time this tab comes into view, so favorites added
  // on the Idea Detail screen appear straight away.
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemove = async (idea) => {
    if (removingId !== null) return; // ignore taps while one is in progress
    setRemovingId(idea.id);
    try {
      await removeFavorite(idea.id);
      // Remove it from the list on screen without reloading everything
      setFavorites((previous) => previous.filter((item) => item.id !== idea.id));
    } catch (e) {
      Alert.alert('Error', 'Could not remove this favorite. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  // ---------- One favorite card ----------
  const renderFavorite = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
    >
      <View style={styles.cardIcon}>
        <Ionicons
          name={CATEGORY_ICONS[item.category] || 'camera'}
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          ISO {item.iso} · {item.aperture} · {item.shutterSpeed}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => handleRemove(item)}
        disabled={removingId !== null}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        {removingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="heart" size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ---------- Empty state ----------
  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="heart-outline" size={48} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>
        Open a photography idea and tap "Add to Favorites" to save it here.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Ideas')}
      >
        <Text style={styles.primaryButtonText}>Browse ideas</Text>
      </TouchableOpacity>
    </View>
  );

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading favorites…</Text>
      </View>
    );
  }

  // ---------- Error state ----------
  if (error && favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.centerText}>{error}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setLoading(true);
            loadFavorites();
          }}
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderFavorite}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <Text style={styles.count}>
              {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
            </Text>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.card}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  count: { color: COLORS.muted, fontSize: 13, marginBottom: 10 },

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

  // Favorite cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  cardCategory: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  cardMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  heartButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Empty state
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 21,
  },

  // Buttons
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
});