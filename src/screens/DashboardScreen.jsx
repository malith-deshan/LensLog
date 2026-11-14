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

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Placeholder – built in Phase 4</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CameraSettings')}
      >
        <Text style={styles.buttonText}>Open Camera Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.buttonText}>Open Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddShoot')}
      >
        <Text style={styles.buttonText}>Add New Shoot</Text>
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
  button: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  buttonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});