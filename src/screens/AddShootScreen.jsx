import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

export default function AddShootScreen({ route }) {
  // If shootId is present we are editing, otherwise we are adding
  const { shootId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {shootId ? 'Edit Shoot' : 'Add New Shoot'}
      </Text>
      <Text style={styles.subtitle}>Placeholder – built in Phase 7</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Received shootId</Text>
        <Text style={styles.value}>{shootId ?? 'none (new record)'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 14, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  label: { color: COLORS.muted, fontSize: 13 },
  value: { color: COLORS.primary, fontSize: 22, fontWeight: '700', marginTop: 4 },
});