import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { API_URL } from '../constants/api';

interface Props {
  token: string;
  currentGoal: number;
  currentName: string;
  onSave: (goal: number, name: string) => void;
  onSkip: () => void;
}

const GOAL_PRESETS = [
  { label: '🏃 Weight Loss',  cal: 1500, desc: 'Calorie deficit — fat burn' },
  { label: '⚖️ Maintain',     cal: 2000, desc: 'Healthy balance' },
  { label: '💪 Muscle Gain',  cal: 2500, desc: 'Calorie surplus — muscle build' },
  { label: '🔥 Very Active',  cal: 3000, desc: 'High activity level' },
];

const PURPLE = '#6C63FF';

export default function GoalSetupScreen({ token, currentGoal, currentName, onSave, onSkip }: Props) {
  const [name, setName] = useState(currentName || '');
  const [selectedGoal, setSelectedGoal] = useState<number | null>(currentGoal || null);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const goalToSave = showCustom ? parseInt(customGoal) : selectedGoal;
    if (!goalToSave || goalToSave < 500 || goalToSave > 10000) {
      Alert.alert('Error', 'Please enter a valid calorie goal (500-10000)!');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/goals/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Token add kiya
        },
        body: JSON.stringify({ daily_goal: goalToSave, name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Error', data.error || 'Something went wrong');
        return;
      }
      onSave(goalToSave, name.trim());
    } catch (e) {
      Alert.alert('Error', 'Network error — please check your connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🎯 Set Your Daily Goal</Text>
      <Text style={styles.subtitle}>This will be your daily calorie limit</Text>

      {/* Name Input */}
      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#bbb"
      />

      {/* Goal Presets */}
      <Text style={styles.label}>Select Your Goal</Text>
      <View style={styles.presetGrid}>
        {GOAL_PRESETS.map(p => (
          <TouchableOpacity
            key={p.cal}
            style={[styles.presetCard, selectedGoal === p.cal && !showCustom && styles.presetCardOn]}
            onPress={() => { setSelectedGoal(p.cal); setShowCustom(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.presetLabel, selectedGoal === p.cal && !showCustom && { color: PURPLE }]}>{p.label}</Text>
            <Text style={[styles.presetCal, selectedGoal === p.cal && !showCustom && { color: PURPLE }]}>{p.cal} kcal</Text>
            <Text style={styles.presetDesc}>{p.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Goal */}
      <TouchableOpacity style={styles.customBtn} onPress={() => { setShowCustom(!showCustom); setSelectedGoal(null); }}>
        <Text style={styles.customBtnTxt}>✏️ Set Custom Goal</Text>
      </TouchableOpacity>

      {showCustom && (
        <TextInput
          style={styles.input}
          value={customGoal}
          onChangeText={setCustomGoal}
          placeholder="Enter calories (e.g. 1800)"
          placeholderTextColor="#bbb"
          keyboardType="numeric"
        />
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Your daily goal:</Text>
        <Text style={styles.summaryVal}>
          {showCustom ? (customGoal || 'Not set') : (selectedGoal ? `${selectedGoal} kcal` : 'Not selected')}
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnTxt}>Save Goal ✅</Text>}
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipTxt}>Skip — set later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 24, paddingBottom: 48 },
  title:        { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 6, textAlign: 'center' },
  subtitle:     { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  label:        { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
  input:        { backgroundColor: '#fff', borderRadius: 14, padding: 16, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: '#eee', color: '#111', elevation: 2 },
  presetGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  presetCard:   { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#eee', elevation: 2 },
  presetCardOn: { borderColor: PURPLE, backgroundColor: '#f0eeff' },
  presetLabel:  { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 4 },
  presetCal:    { fontSize: 20, fontWeight: '900', color: '#1a1a2e', marginBottom: 2 },
  presetDesc:   { fontSize: 11, color: '#aaa' },
  customBtn:    { borderWidth: 1.5, borderColor: PURPLE, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  customBtnTxt: { color: PURPLE, fontWeight: '700', fontSize: 14 },
  summary:      { backgroundColor: PURPLE, borderRadius: 18, padding: 20, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  summaryVal:   { color: '#fff', fontSize: 28, fontWeight: '900' },
  saveBtn:      { backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 4, marginBottom: 12 },
  saveBtnTxt:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  skipBtn:      { alignItems: 'center', paddingVertical: 8 },
  skipTxt:      { color: '#aaa', fontSize: 13 },
});