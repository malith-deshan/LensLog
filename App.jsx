import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { initializeDatabase } from './src/storage/storage.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const setupDatabase = useCallback(async () => {
    try {
      setError(null);
      await initializeDatabase();
      setReady(true);
    } catch (e) {
      setError(e.message || 'Unknown database error');
    }
  }, []);

  useEffect(() => {
    setupDatabase();
  }, [setupDatabase]);

  // Error state
  if (error) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Could not open the database</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={setupDatabase}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (!ready) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing LensLog…</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: COLORS.muted, fontSize: 15, marginTop: 16 },
  errorTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
});