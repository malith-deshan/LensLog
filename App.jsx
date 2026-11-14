import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

const CHECKS = [
  'Expo project created',
  'JSX entry point configured',
  'Dependencies installed',
  'Folder structure ready',
];

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.iconCircle}>
        <Ionicons name="camera" size={44} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>LensLog</Text>
      <Text style={styles.subtitle}>Offline Photography Companion</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phase 1 – Setup</Text>
        {CHECKS.map((item) => (
          <View key={item} style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  cardTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowText: {
    color: COLORS.white,
    fontSize: 15,
    marginLeft: 10,
  },
});