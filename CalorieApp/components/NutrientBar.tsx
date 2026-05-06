import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  current: number;
  total: number;
  color: string;
}

export default function NutrientBar({ label, current, total, color }: Props) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{current}g / {total}g</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#333' },
  value: { fontSize: 12, color: '#888', fontWeight: '600' },
  track: { height: 7, backgroundColor: '#e8e8e8', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});
