import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

export default function ShootDetailScreen({ route, navigation }) {
  const { shootId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shoot Detail</Text>
      <Text style={styles.subtitle}>Placeholder – built in Phase 7</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Received shootId</Text>
        <Text style={styles.value}>{shootId ?? 'none'}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddShoot', { shootId })}
      >
        <Text style={styles.buttonText}>Edit This Shoot</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  label: { color: COLORS.muted, fontSize: 13 },
  value: { color: COLORS.primary, fontSize: 22, fontWeight: '700', marginTop: 4 },
  button: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  buttonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});