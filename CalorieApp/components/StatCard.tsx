import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  icon: string;
  value: string | number;
  label: string;
}

export default function StatCard({ icon, value, label }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: 'white', borderRadius: 16,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  icon: { fontSize: 20, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '900', color: '#222' },
  label: { fontSize: 10, color: '#999', fontWeight: '600', marginTop: 2, textAlign: 'center' },
});
