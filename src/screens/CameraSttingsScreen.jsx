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

export default function CameraSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Settings</Text>
      <Text style={styles.subtitle}>Placeholder – built in Phase 6</Text>
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
  subtitle: { color: COLORS.muted, fontSize: 14 },
});