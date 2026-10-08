import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { API_URL } from '../constants/api';

interface Props {
  token: string;
}

const GOAL_STORAGE_KEY = 'water_daily_goal';
const DEFAULT_GOAL = 8;
const MIN_GOAL = 4;
const MAX_GOAL = 15;

export default function WaterTracker({ token }: Props) {
  const { colors } = useTheme();
  const [glasses, setGlasses] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load saved goal on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
        if (saved) setDailyGoal(parseInt(saved, 10));
      } catch (e) { console.log('Goal load error:', e); }
    })();
  }, []);

  const changeGoal = async (delta: number) => {
    const newGoal = Math.min(MAX_GOAL, Math.max(MIN_GOAL, dailyGoal + delta));
    setDailyGoal(newGoal);
    try {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, String(newGoal));
    } catch (e) { console.log('Goal save error:', e); }
  };

  const fetchWater = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/water`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setGlasses(data.water.totalCups);
    } catch (e) { console.log('Water fetch error:', e); }
  }, [token]);

  useEffect(() => { fetchWater(); }, [fetchWater]);

  const addGlass = async () => {
    if (glasses >= dailyGoal + 4) { Alert.alert('Great job! 💧', 'You have exceeded your daily water goal!'); return; }
    setLoading(true);

    // Animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    try {
      const res = await fetch(`${API_URL}/api/water`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cups: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        const newTotal = data.water.totalCups;
        setGlasses(newTotal);
        if (newTotal === dailyGoal) {
          Alert.alert('Goal Reached! 🎉', `You have reached your daily water goal of ${dailyGoal} glasses!`);
        }
      } else {
        console.log('Water add failed:', data.error);
      }
    } catch (e) { console.log('Water add error:', e); }
    finally { setLoading(false); }
  };

  const removeGlass = async () => {
    if (glasses <= 0) return;
    try {
      const res = await fetch(`${API_URL}/api/water/latest`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setGlasses(data.water.totalCups);
      else console.log('Water remove failed:', data.error);
    } catch (e) { console.log('Water remove error:', e); }
  };

  const percentage = Math.min((glasses / dailyGoal) * 100, 100);

  const getWaterColor = () => {
    if (percentage >= 100) return '#22c55e';
    if (percentage >= 60)  return '#3b82f6';
    if (percentage >= 30)  return '#60a5fa';
    return '#93c5fd';
  };

  const waterColor = getWaterColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💧 Water Intake</Text>

        <View style={styles.goalAdjustRow}>
          <TouchableOpacity
            style={[styles.goalStepBtn, { borderColor: colors.border }]}
            onPress={() => changeGoal(-1)}
            disabled={dailyGoal <= MIN_GOAL}
          >
            <Text style={[styles.goalStepTxt, { color: colors.textMuted }]}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.goal, { color: colors.textMuted }]}>{glasses}/{dailyGoal} glasses</Text>

          <TouchableOpacity
            style={[styles.goalStepBtn, { borderColor: colors.border }]}
            onPress={() => changeGoal(1)}
            disabled={dailyGoal >= MAX_GOAL}
          >
            <Text style={[styles.goalStepTxt, { color: colors.textMuted }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: waterColor }]} />
      </View>
      <Text style={[styles.percentage, { color: waterColor }]}>{Math.round(percentage)}% of daily goal</Text>

      {/* Glass Icons — display only, no tap-to-remove to avoid accidental deletes */}
      <View style={styles.glassesRow}>
        {Array.from({ length: dailyGoal }).map((_, i) => (
          <View key={i}>
            <Text style={[styles.glassIcon, { opacity: i < glasses ? 1 : 0.25 }]}>💧</Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.removeBtn, { borderColor: colors.border }]}
          onPress={removeGlass}
          disabled={glasses <= 0}
        >
          <Text style={[styles.removeBtnTxt, { color: colors.textMuted }]}>− Remove</Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 2 }}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: waterColor }]}
            onPress={addGlass}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnTxt}>+ Add Glass</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Tip */}
      {glasses === 0 && (
        <Text style={[styles.tip, { color: colors.textMuted }]}>💡 Start your day with a glass of water!</Text>
      )}
      {glasses > 0 && glasses < dailyGoal && (
        <Text style={[styles.tip, { color: colors.textMuted }]}>Keep going! {dailyGoal - glasses} more glass{dailyGoal - glasses !== 1 ? 'es' : ''} to reach your goal!</Text>
      )}
      {glasses >= dailyGoal && (
        <Text style={[styles.tip, { color: '#22c55e' }]}>🎉 Daily goal achieved! Great job!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:       { fontSize: 16, fontWeight: '900' },
  goalAdjustRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalStepBtn: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  goalStepTxt: { fontSize: 14, fontWeight: '800', marginTop: -1 },
  goal:        { fontSize: 13, fontWeight: '700' },
  progressBg:  { height: 8, borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  percentage:  { fontSize: 12, fontWeight: '700', marginBottom: 12 },
  glassesRow:  { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 14 },
  glassIcon:   { fontSize: 24 },
  btnRow:      { flexDirection: 'row', gap: 8, marginBottom: 10 },
  removeBtn:   { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  removeBtnTxt: { fontSize: 13, fontWeight: '700' },
  addBtn:      { borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  addBtnTxt:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  tip:         { fontSize: 12, textAlign: 'center', fontWeight: '600' },
});