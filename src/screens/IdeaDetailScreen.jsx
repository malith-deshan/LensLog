import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getIdeaById,
  isFavorite,
  addFavorite,
  removeFavorite,
} from '../storage/storage.jsx';
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

export default function IdeaDetailScreen({ route, navigation }) {
  // The Ideas / Dashboard screens send { ideaId } when navigating here
  const ideaId = route.params ? route.params.ideaId : undefined;

  const [idea, setIdea] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadIdea = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const found = await getIdeaById(ideaId);
      if (!found) {
        setIdea(null);
      } else {
        const fav = await isFavorite(ideaId);
        setIdea(found);
        setFavorite(fav);
      }
    } catch (e) {
      setError(e.message || 'Could not load this idea.');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  const handleToggleFavorite = async () => {
    if (saving || !idea) return;
    setSaving(true);
    try {
      if (favorite) {
        await removeFavorite(idea.id);
      } else {
        await addFavorite(idea.id);
      }
      setFavorite(!favorite);
    } catch (e) {
      Alert.alert('Error', 'Could not update favorites. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading idea…</Text>
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
        <TouchableOpacity style={styles.primaryButton} onPress={loadIdea}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Not found state ----------
  if (!idea) {
    return (
      <View style={styles.center}>
        <Ionicons name="help-circle-outline" size={48} color={COLORS.muted} />
        <Text style={styles.errorTitle}>Idea not found</Text>
        <Text style={styles.centerText}>
          This photography idea does not exist.
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
    { label: 'ISO', value: idea.iso, icon: 'sunny-outline' },
    { label: 'Aperture', value: idea.aperture, icon: 'aperture-outline' },
    { label: 'Shutter', value: idea.shutterSpeed, icon: 'timer-outline' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---------- Title and category ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons
            name={CATEGORY_ICONS[idea.category] || 'camera'}
            size={32}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{idea.category}</Text>
        </View>
        <Text style={styles.title}>{idea.title}</Text>
      </View>

      {/* ---------- Description ---------- */}
      <Text style={styles.sectionTitle}>Description</Text>
      <View style={styles.card}>
        <Text style={styles.description}>{idea.description}</Text>
      </View>

      {/* ---------- Recommended settings ---------- */}
      <Text style={styles.sectionTitle}>Recommended settings</Text>
      <View style={styles.settingsRow}>
        {settings.map((item) => (
          <View key={item.label} style={styles.settingBox}>
            <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            <Text style={styles.settingValue}>{item.value}</Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ---------- Favorite button ---------- */}
      <TouchableOpacity
        style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
        onPress={handleToggleFavorite}
        activeOpacity={0.8}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator
            color={favorite ? COLORS.primary : COLORS.background}
          />
        ) : (
          <>
            <Ionicons
              name={favorite ? 'heart-dislike-outline' : 'heart'}
              size={20}
              color={favorite ? COLORS.primary : COLORS.background}
            />
            <Text
              style={[
                styles.favoriteText,
                favorite && styles.favoriteTextActive,
              ]}
            >
              {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* ---------- Link to the camera settings guide ---------- */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('CameraSettings')}
        activeOpacity={0.8}
      >
        <Ionicons name="school-outline" size={20} color={COLORS.primary} />
        <Text style={styles.linkText}>Learn what these settings mean</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
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
  hero: { alignItems: 'center', marginBottom: 8 },
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

  // Sections
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
  description: { color: COLORS.white, fontSize: 15, lineHeight: 23 },

  // Settings boxes
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

  // Favorite button
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    marginTop: 28,
  },
  favoriteButtonActive: {
    backgroundColor: 'transparent',
  },
  favoriteText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  favoriteTextActive: { color: COLORS.primary },

  // Link to camera settings
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  linkText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
});