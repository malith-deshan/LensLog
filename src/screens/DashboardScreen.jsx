import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStatistics } from '../storage/storage.jsx';
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

// Returns a greeting that matches the current time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Example: "Saturday, 14 November 2026"
function getTodayText() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Quick navigation buttons. "type" decides how we navigate.
const QUICK_ACTIONS = [
  { label: 'Browse Ideas', icon: 'bulb-outline', route: 'Ideas' },
  { label: 'New Shoot', icon: 'add-circle-outline', route: 'AddShoot' },
  { label: 'Camera Settings', icon: 'aperture-outline', route: 'CameraSettings' },
  { label: 'Categories', icon: 'albums-outline', route: 'Categories' },
];

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboardStatistics();
      setStats(data);
    } catch (e) {
      setError(e.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Runs every time this tab comes into view, so the numbers
  // are always up to date after adding a shoot or a favorite.
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading dashboard…</Text>
      </View>
    );
  }

  // ---------- Error state ----------
  if (error && !stats) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.centerText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            loadStats();
          }}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statCards = [
    {
      label: 'Ideas',
      value: stats.totalIdeas,
      icon: 'bulb',
      route: 'Ideas',
    },
    {
      label: 'Shoots',
      value: stats.totalShoots,
      icon: 'camera',
      route: 'Journal',
    },
    {
      label: 'Favorites',
      value: stats.totalFavorites,
      icon: 'heart',
      route: 'Favorites',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
          progressBackgroundColor={COLORS.card}
        />
      }
    >
      {/* ---------- Welcome section ---------- */}
      <View style={styles.welcome}>
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>{getGreeting()}, photographer</Text>
          <Text style={styles.date}>{getTodayText()}</Text>
          <Text style={styles.tagline}>
            Ready to capture something great today?
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Ionicons name="camera" size={30} color={COLORS.primary} />
        </View>
      </View>

      {/* ---------- Statistics ---------- */}
      <View style={styles.statsRow}>
        {statCards.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            <Text style={styles.statNumber}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- Quick navigation ---------- */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(action.route)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- Recently added ideas ---------- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleInline}>Recently added ideas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Ideas')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {stats.recentIdeas.length === 0 ? (
        // ---------- Empty state ----------
        <View style={styles.emptyCard}>
          <Ionicons name="images-outline" size={36} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>No ideas yet</Text>
          <Text style={styles.emptyText}>
            Photography ideas will appear here once they are available.
          </Text>
        </View>
      ) : (
        stats.recentIdeas.map((idea) => (
          <TouchableOpacity
            key={idea.id}
            style={styles.ideaCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('IdeaDetail', { ideaId: idea.id })}
          >
            <View style={styles.ideaIcon}>
              <Ionicons
                name={CATEGORY_ICONS[idea.category] || 'camera'}
                size={22}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.ideaInfo}>
              <Text style={styles.ideaTitle} numberOfLines={1}>
                {idea.title}
              </Text>
              <Text style={styles.ideaMeta} numberOfLines={1}>
                {idea.category} · ISO {idea.iso} · {idea.aperture} ·{' '}
                {idea.shutterSpeed}
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
  content: { padding: 20, paddingBottom: 40 },

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
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  retryText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },

  // Welcome
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  welcomeText: { flex: 1, paddingRight: 12 },
  greeting: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  date: { color: COLORS.primary, fontSize: 13, marginTop: 4 },
  tagline: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: -4 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: { color: COLORS.muted, fontSize: 13, marginTop: 2 },

  // Section titles
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleInline: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  // Quick actions (2 x 2 grid)
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },

  actionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    margin: '1%',
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ideaInfo: { flex: 1 },
  ideaTitle: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  ideaMeta: { color: COLORS.muted, fontSize: 12, marginTop: 3 },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});