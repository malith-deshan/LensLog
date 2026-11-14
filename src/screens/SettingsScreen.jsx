import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStatistics, clearUserData } from '../storage/storage.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
  error: '#FF6B6B',
};

const APP_VERSION = '1.0.0';

// Information rows shown in the "Works offline" card
const OFFLINE_POINTS = [
  {
    icon: 'phone-portrait-outline',
    title: 'Stored on your device',
    text: 'Your shoots and favorites are saved in a local SQLite database.',
  },
  {
    icon: 'cloud-offline-outline',
    title: 'No internet needed',
    text: 'Every feature works in airplane mode, in the field or anywhere.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Private by design',
    text: 'No account, no cloud sync, and no data ever leaves your phone.',
  },
];

// Shortcuts to other screens
const LINKS = [
  {
    label: 'Camera Settings Guide',
    icon: 'aperture-outline',
    route: 'CameraSettings',
  },
  { label: 'Browse Categories', icon: 'albums-outline', route: 'Categories' },
];

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export default function SettingsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboardStatistics();
      setStats(data);
    } catch (e) {
      setError(e.message || 'Could not load your data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh the counts every time this tab comes into view
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const nothingToClear =
    stats !== null && stats.totalShoots === 0 && stats.totalFavorites === 0;

  const confirmClear = () => {
    if (!stats || clearing) return;

    if (nothingToClear) {
      Alert.alert('Nothing to clear', 'You have no shoots or favorites saved.');
      return;
    }

    Alert.alert(
      'Clear all local data?',
      `This will permanently delete ${plural(stats.totalShoots, 'shoot')} and ` +
        `${plural(stats.totalFavorites, 'favorite')} from this device. ` +
        'The built-in photography ideas are kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear data', style: 'destructive', onPress: handleClear },
      ]
    );
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearUserData();
      await loadStats();
      Alert.alert('Done', 'Your shoots and favorites have been cleared.');
    } catch (e) {
      Alert.alert('Could not clear data', 'Something went wrong. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading settings…</Text>
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
          style={styles.primaryButton}
          onPress={() => {
            setLoading(true);
            loadStats();
          }}
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dataBoxes = [
    { label: 'Ideas', value: stats.totalIdeas, icon: 'bulb' },
    { label: 'Shoots', value: stats.totalShoots, icon: 'camera' },
    { label: 'Favorites', value: stats.totalFavorites, icon: 'heart' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---------- App header ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="camera" size={38} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>LensLog</Text>
        <Text style={styles.appTagline}>Offline Photography Companion</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        </View>
      </View>

      {/* ---------- About ---------- */}
      <Text style={styles.sectionTitle}>About LensLog</Text>
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          LensLog helps photographers find shooting ideas, learn camera
          settings, and keep a journal of every photoshoot. Browse{' '}
          {stats.totalIdeas} ready-made ideas across 9 categories, save your
          favorites, and record the ISO, aperture, and shutter speed that
          worked for you.
        </Text>
      </View>

      {/* ---------- Offline information ---------- */}
      <Text style={styles.sectionTitle}>Works offline</Text>
      <View style={styles.card}>
        {OFFLINE_POINTS.map((item, index) => (
          <View key={item.title}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.pointRow}>
              <View style={styles.pointIcon}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>{item.title}</Text>
                <Text style={styles.pointDescription}>{item.text}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ---------- Data on this device ---------- */}
      <Text style={styles.sectionTitle}>Data on this device</Text>
      <View style={styles.statsRow}>
        {dataBoxes.map((item) => (
          <View key={item.label} style={styles.statBox}>
            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
            <Text style={styles.statNumber}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ---------- Shortcuts ---------- */}
      <Text style={styles.sectionTitle}>Learn</Text>
      {LINKS.map((link) => (
        <TouchableOpacity
          key={link.route}
          style={styles.linkRow}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(link.route)}
        >
          <Ionicons name={link.icon} size={22} color={COLORS.primary} />
          <Text style={styles.linkText}>{link.label}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      ))}

      {/* ---------- Clear data ---------- */}
      <Text style={styles.sectionTitle}>Manage data</Text>
      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Clear local data</Text>
        <Text style={styles.dangerText}>
          Deletes all your photoshoot records and favorites from this device.
          The built-in photography ideas are not affected.
        </Text>
        <TouchableOpacity
          style={[
            styles.dangerButton,
            nothingToClear && styles.dangerButtonDisabled,
          ]}
          onPress={confirmClear}
          activeOpacity={0.85}
          disabled={clearing}
        >
          {clearing ? (
            <ActivityIndicator color={COLORS.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.dangerButtonText}>Clear local data</Text>
            </>
          )}
        </TouchableOpacity>
        {nothingToClear && (
          <Text style={styles.dangerNote}>Nothing to clear right now.</Text>
        )}
      </View>

      <Text style={styles.footer}>
        Built with React Native, Expo and SQLite
      </Text>
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

  // Hero
  hero: { alignItems: 'center', marginBottom: 4 },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
  },
  appTagline: { color: COLORS.muted, fontSize: 14, marginTop: 2 },
  versionBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  versionText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  // Sections and cards
  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  paragraph: { color: COLORS.white, fontSize: 14, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

  // Offline points
  pointRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pointText: { flex: 1 },
  pointTitle: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  pointDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },

  // Data counts
  statsRow: { flexDirection: 'row', marginHorizontal: -4 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  // Link rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  linkText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },

  // Danger zone
  dangerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  dangerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  dangerText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    height: 48,
    marginTop: 16,
  },
  dangerButtonDisabled: { opacity: 0.5 },
  dangerButtonText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  dangerNote: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },

  footer: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});