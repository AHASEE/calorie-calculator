import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  consumed: number;
  goal: number;
  size?: number;
}

export default function CircularProgress({ consumed, goal, size = 120 }: Props) {
  const pct = Math.min(consumed / goal, 1);
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill as any}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={strokeWidth} />
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.number}>{consumed}</Text>
        <Text style={styles.label}>of {goal} kcal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 26, fontWeight: '900', color: 'white', lineHeight: 30 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
