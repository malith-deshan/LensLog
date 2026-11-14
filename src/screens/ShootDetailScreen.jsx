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
import { getShootById, deleteShoot } from '../storage/storage.jsx';
import { CATEGORY_ICONS } from '../data/seedData.jsx';

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

// "2026-11-14" -> "Saturday, 14 November 2026"
function formatDate(text) {
  if (!text) return 'No date';
  const parts = text.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return text;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// SQLite stores created_at as UTC text: "2026-11-14 09:30:00"
function formatCreated(text) {
  if (!text) return '';
  const date = new Date(text.replace(' ', 'T') + 'Z');
  if (isNaN(date.getTime())) return text;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShootDetailScreen({ route, navigation }) {
  const shootId = route.params ? route.params.shootId : undefined;

  const [shoot, setShoot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const loadShoot = useCallback(async () => {
    try {
      setError(null);
      const found = await getShootById(shootId);
      setShoot(found);
    } catch (e) {
      setError(e.message || 'Could not load this shoot.');
    } finally {
      setLoading(false);
    }
  }, [shootId]);

  // Runs every time this screen comes back into view, so edits made
  // on the form screen appear immediately.
  useFocusEffect(
    useCallback(() => {
      loadShoot();
    }, [loadShoot])
  );

  const confirmDelete = () => {
    if (!shoot || deleting) return;
    Alert.alert(
      'Delete this shoot?',
      `"${shoot.title}" will be permanently removed from your journal. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteShoot(shoot.id);
      navigation.goBack();
    } catch (e) {
      setDeleting(false);
      Alert.alert('Could not delete', 'Something went wrong. Please try again.');
    }
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading shoot…</Text>
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
            loadShoot();
          }}
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Not found state ----------
  if (!shoot) {
    return (
      <View style={styles.center}>
        <Ionicons name="help-circle-outline" size={48} color={COLORS.muted} />
        <Text style={styles.errorTitle}>Shoot not found</Text>
        <Text style={styles.centerText}>
          This record may have been deleted.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const settings = [
    { label: 'ISO', value: shoot.iso, icon: 'sunny-outline' },
    { label: 'Aperture', value: shoot.aperture, icon: 'aperture-outline' },
    { label: 'Shutter', value: shoot.shutterSpeed, icon: 'timer-outline' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---------- Hero ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons
            name={CATEGORY_ICONS[shoot.category] || 'camera'}
            size={32}
            color={COLORS.primary}
          />
        </View>
        {shoot.category !== '' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{shoot.category}</Text>
          </View>
        )}
        <Text style={styles.title}>{shoot.title}</Text>
      </View>

      {/* ---------- Date and location ---------- */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(shoot.date)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {shoot.location !== '' ? shoot.location : 'Not recorded'}
            </Text>
          </View>
        </View>
      </View>

      {/* ---------- Camera settings ---------- */}
      <Text style={styles.sectionTitle}>Camera settings</Text>
      <View style={styles.settingsRow}>
        {settings.map((item) => (
          <View key={item.label} style={styles.settingBox}>
            <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            <Text style={styles.settingValue}>
              {item.value !== '' ? item.value : '–'}
            </Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ---------- Notes ---------- */}
      <Text style={styles.sectionTitle}>Notes</Text>
      <View style={styles.card}>
        <Text style={shoot.notes !== '' ? styles.notes : styles.notesEmpty}>
          {shoot.notes !== '' ? shoot.notes : 'No notes for this shoot.'}
        </Text>
      </View>

      {shoot.createdAt ? (
        <Text style={styles.created}>
          Added on {formatCreated(shoot.createdAt)}
        </Text>
      ) : null}

      {/* ---------- Actions ---------- */}
      <TouchableOpacity
        style={styles.editButton}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddShoot', { shootId: shoot.id })}
        disabled={deleting}
      >
        <Ionicons name="create-outline" size={20} color={COLORS.background} />
        <Text style={styles.editText}>Edit shoot</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.85}
        onPress={confirmDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color={COLORS.error} />
        ) : (
          <>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteText}>Delete shoot</Text>
          </>
        )}
      </TouchableOpacity>
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
  hero: { alignItems: 'center', marginBottom: 20 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  badgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 14 },
  infoLabel: { color: COLORS.muted, fontSize: 12 },
  infoValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },

  // Settings
  settingsRow: { flexDirection: 'row', marginHorizontal: -4 },
  settingBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  settingValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  settingLabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  // Notes
  notes: { color: COLORS.white, fontSize: 15, lineHeight: 23 },
  notesEmpty: { color: COLORS.muted, fontSize: 14, fontStyle: 'italic' },
  created: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },

  // Buttons
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    marginTop: 28,
  },
  editText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 14,
    height: 52,
    marginTop: 12,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});