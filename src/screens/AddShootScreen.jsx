import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addShoot, updateShoot, getShootById } from '../storage/storage.jsx';
import { CATEGORIES, CATEGORY_ICONS } from '../data/seedData.jsx';

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

const EMPTY_FORM = {
  title: '',
  location: '',
  date: '',
  category: '',
  notes: '',
  iso: '',
  aperture: '',
  shutterSpeed: '',
};

// ---------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------

// Today as "YYYY-MM-DD" using the phone's local time
function getTodayText() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// True only for real calendar dates in the format YYYY-MM-DD
function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Accepts "2.8", "f2.8", "f/2.8". Returns "f/2.8", or null if invalid.
function normalizeAperture(text) {
  const match = text
    .trim()
    .toLowerCase()
    .match(/^f?\s*\/?\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (value < 0.7 || value > 64) return null;
  return `f/${match[1]}`;
}

// Accepts "1/200", "1/200s", "2", "0.5s". Returns "1/200s", or null if invalid.
function normalizeShutter(text) {
  const cleaned = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/(sec|s)$/, '');

  if (/^\d+\/\d+$/.test(cleaned)) {
    const [top, bottom] = cleaned.split('/').map(Number);
    if (top <= 0 || bottom <= 0) return null;
    return `${cleaned}s`;
  }
  if (/^\d+(\.\d+)?$/.test(cleaned) && parseFloat(cleaned) > 0) {
    return `${cleaned}s`;
  }
  return null;
}

// Checks every field. Returns the error messages and the cleaned values.
function validateForm(form) {
  const errors = {};

  const title = form.title.trim();
  if (!title) errors.title = 'Title is required.';

  const date = form.date.trim();
  if (!date) {
    errors.date = 'Date is required.';
  } else if (!isValidDate(date)) {
    errors.date = 'Use the format YYYY-MM-DD, e.g. 2026-11-14.';
  }

  if (!form.category) errors.category = 'Please choose a category.';

  let iso = form.iso.trim();
  if (iso) {
    const isoNumber = Number(iso);
    if (!/^\d+$/.test(iso) || isoNumber < 50 || isoNumber > 409600) {
      errors.iso = 'Whole number, 50 to 409600.';
    }
  }

  let aperture = form.aperture.trim();
  if (aperture) {
    const normalized = normalizeAperture(aperture);
    if (normalized) {
      aperture = normalized;
    } else {
      errors.aperture = 'Example: f/2.8';
    }
  }

  let shutterSpeed = form.shutterSpeed.trim();
  if (shutterSpeed) {
    const normalized = normalizeShutter(shutterSpeed);
    if (normalized) {
      shutterSpeed = normalized;
    } else {
      errors.shutterSpeed = 'Example: 1/200 or 2s';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    cleaned: {
      title,
      location: form.location.trim(),
      date,
      category: form.category,
      notes: form.notes.trim(),
      iso,
      aperture,
      shutterSpeed,
    },
  };
}

// ---------------------------------------------------------------
// A reusable labelled input. It is defined OUTSIDE the screen so the
// keyboard does not close every time you type a letter.
// ---------------------------------------------------------------
function Field({ label, required, error, style, inputStyle, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, inputStyle, error && styles.inputError]}
        placeholderTextColor={COLORS.muted}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------
// Screen
// ---------------------------------------------------------------
export default function AddShootScreen({ route, navigation }) {
  const shootId = route.params ? route.params.shootId : undefined;
  const isEditing = shootId !== undefined && shootId !== null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Header title
  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Shoot' : 'New Shoot' });
  }, [navigation, isEditing]);

  // Editing: load the existing record into the form
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    async function loadShoot() {
      try {
        const shoot = await getShootById(shootId);
        if (cancelled) return;
        if (!shoot) {
          setLoadError('This shoot no longer exists.');
        } else {
          setForm({
            title: shoot.title,
            location: shoot.location,
            date: shoot.date,
            category: shoot.category,
            notes: shoot.notes,
            iso: shoot.iso,
            aperture: shoot.aperture,
            shutterSpeed: shoot.shutterSpeed,
          });
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Could not load this shoot.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadShoot();
    return () => {
      cancelled = true;
    };
  }, [isEditing, shootId]);

  // Updates one field and clears its error message
  const setField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    if (saving) return;

    const { valid, errors: foundErrors, cleaned } = validateForm(form);
    setErrors(foundErrors);
    if (!valid) return;

    setSaving(true);
    try {
      if (isEditing) {
        await updateShoot(shootId, cleaned);
      } else {
        await addShoot(cleaned);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  // ---------- Loading state (edit mode) ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading shoot…</Text>
      </View>
    );
  }

  // ---------- Error / not found state (edit mode) ----------
  if (loadError) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
        <Text style={styles.errorTitle}>Cannot edit this shoot</Text>
        <Text style={styles.centerText}>{loadError}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Field
          label="Title"
          required
          value={form.title}
          onChangeText={(text) => setField('title', text)}
          placeholder="e.g. Sunrise at Horton Plains"
          maxLength={80}
          error={errors.title}
        />

        <Field
          label="Location"
          value={form.location}
          onChangeText={(text) => setField('location', text)}
          placeholder="e.g. Nuwara Eliya"
          maxLength={80}
        />

        {/* Date with a "Today" shortcut */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Date<Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.dateRow}>
            <TextInput
              style={[
                styles.input,
                styles.dateInput,
                errors.date && styles.inputError,
              ]}
              value={form.date}
              onChangeText={(text) => setField('date', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              maxLength={10}
              keyboardType="numbers-and-punctuation"
            />
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setField('date', getTodayText())}
              activeOpacity={0.8}
            >
              <Ionicons name="today-outline" size={18} color={COLORS.primary} />
              <Text style={styles.todayText}>Today</Text>
            </TouchableOpacity>
          </View>
          {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
        </View>

        {/* Category chips */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Category<Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((item) => {
              const active = form.category === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setField('category', item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[item] || 'camera'}
                    size={14}
                    color={active ? COLORS.background : COLORS.primary}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category ? (
            <Text style={styles.errorText}>{errors.category}</Text>
          ) : null}
        </View>

        {/* Camera settings */}
        <Text style={styles.sectionTitle}>Camera settings (optional)</Text>
        <View style={styles.settingsRow}>
          <Field
            style={styles.settingField}
            label="ISO"
            value={form.iso}
            onChangeText={(text) => setField('iso', text)}
            placeholder="200"
            keyboardType="number-pad"
            maxLength={6}
            error={errors.iso}
          />
          <Field
            style={styles.settingField}
            label="Aperture"
            value={form.aperture}
            onChangeText={(text) => setField('aperture', text)}
            placeholder="f/2.8"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={8}
            error={errors.aperture}
          />
          <Field
            style={styles.settingField}
            label="Shutter"
            value={form.shutterSpeed}
            onChangeText={(text) => setField('shutterSpeed', text)}
            placeholder="1/200"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            error={errors.shutterSpeed}
          />
        </View>

        <Field
          label="Notes"
          value={form.notes}
          onChangeText={(text) => setField('notes', text)}
          placeholder="What went well? What would you change?"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
          inputStyle={styles.notesInput}
        />

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color={COLORS.background} />
              <Text style={styles.saveText}>
                {isEditing ? 'Save changes' : 'Save shoot'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },

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

  // Fields
  field: { marginBottom: 18 },
  label: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: { color: COLORS.primary },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.white,
    fontSize: 15,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 6 },
  notesInput: { height: 120, paddingTop: 12 },

  // Date row
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateInput: { flex: 1 },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 14,
    marginLeft: 10,
  },
  todayText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Category chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  chipTextActive: { color: COLORS.background },

  // Camera settings
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  settingsRow: { flexDirection: 'row', marginHorizontal: -4 },
  settingField: { flex: 1, marginHorizontal: 4 },

  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 54,
    marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveText: {
    color: COLORS.background,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 8,
  },
  cancelText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
});