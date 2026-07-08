import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { API_URL } from '../constants/api';  

const PURPLE = '#6C63FF';

interface Props {
  token: string;
  currentGoal: number;
  currentName: string;
  onSave: (goal: number, name: string) => void;
  onSkip: () => void;
}

const GOAL_PRESETS = [
  { label: '🏃 Weight Loss',  cal: 1500, desc: 'Calorie deficit — fat burn' },
  { label: '⚖️ Maintain',    cal: 2000, desc: 'Healthy balance' },
  { label: '💪 Muscle Gain', cal: 2500, desc: 'Calorie surplus — muscle build' },
  { label: '🔥 Very Active', cal: 3000, desc: 'High activity level' },
];

export default function GoalSetupScreen({ token, currentGoal, currentName, onSave, onSkip }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<number>(0);
  const [customGoal, setCustomGoal]     = useState('');
  const [name, setName]                 = useState(currentName);
  const [loading, setLoading]           = useState(false);
  const [useCustom, setUseCustom]       = useState(false);

  const finalGoal = useCustom ? (parseInt(customGoal) || 0) : selectedGoal;

  const handleSelectPreset = (cal: number) => {
    setSelectedGoal(cal);
    setUseCustom(false);
    setCustomGoal('');
  };

  const handleSave = async () => {
    if (!finalGoal || finalGoal < 500 || finalGoal > 10000) {
      Alert.alert('Error', 'Goal must be between 500 and 10,000 calories!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/goals/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ daily_goal: finalGoal, name }),
      });
      const data = await res.json();
      if (data.success) {
        onSave(finalGoal, name);
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error — check your connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>🎯 Set Your Daily Goal</Text>
      <Text style={styles.subtitle}>This will be your daily calorie limit</Text>

      {/* Name */}
      <Text style={styles.label}>Your Name</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name..."
          placeholderTextColor="#BBB"
        />
      </View>

      {/* Preset Goals */}
      <Text style={styles.label}>Select Your Goal</Text>
      <View style={styles.presetsWrap}>
        {GOAL_PRESETS.map(preset => {
          const isSelected = !useCustom && selectedGoal === preset.cal;
          return (
            <TouchableOpacity
              key={preset.cal}
              style={[styles.presetCard, isSelected && styles.presetCardOn]}
              onPress={() => handleSelectPreset(preset.cal)}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetLabel, isSelected && styles.presetLabelOn]}>
                {preset.label}
              </Text>
              <Text style={[styles.presetCal, isSelected && styles.presetCalOn]}>
                {preset.cal} kcal
              </Text>
              <Text style={[styles.presetDesc, isSelected && styles.presetDescOn]}>
                {preset.desc}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkTxt}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Goal */}
      <TouchableOpacity
        style={[styles.customToggle, useCustom && styles.customToggleOn]}
        onPress={() => { setUseCustom(!useCustom); setSelectedGoal(0); }}
      >
        <Text style={[styles.customToggleTxt, useCustom && { color: '#fff' }]}>
          ✏️ Set Custom Goal
        </Text>
      </TouchableOpacity>

      {useCustom && (
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={customGoal}
            onChangeText={setCustomGoal}
            placeholder="Enter calories (e.g. 1800)"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            autoFocus
          />
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTxt}>Your daily goal:</Text>
        <Text style={styles.summaryNum}>
          {finalGoal > 0 ? `${finalGoal} kcal` : 'Not selected'}
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnTxt}>Save Goal ✅</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipTxt}>Skip — set later</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F5F5F7' },
  content:    { padding: 24, paddingBottom: 40 },
  title:      { fontSize: 26, fontWeight: '900', color: '#1a1a1a', marginBottom: 6, textAlign: 'center' },
  subtitle:   { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 28 },
  label:      { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10 },
  inputWrap:  { marginBottom: 20 },
  input:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#1a1a1a', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  presetsWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  presetCard:    { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 2, borderColor: '#F0F0F0', position: 'relative' },
  presetCardOn:  { borderColor: PURPLE, backgroundColor: '#EEF0FF' },
  presetLabel:   { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 6 },
  presetLabelOn: { color: PURPLE },
  presetCal:     { fontSize: 20, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  presetCalOn:   { color: PURPLE },
  presetDesc:    { fontSize: 11, color: '#aaa', lineHeight: 15 },
  presetDescOn:  { color: '#9B97E8' },
  checkBadge:    { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' },
  checkTxt:      { color: '#fff', fontSize: 11, fontWeight: '900' },

  customToggle:    { borderWidth: 1.5, borderColor: PURPLE, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  customToggleOn:  { backgroundColor: PURPLE },
  customToggleTxt: { fontSize: 14, color: PURPLE, fontWeight: '600' },

  summaryBox: { backgroundColor: PURPLE, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, marginTop: 8, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  summaryTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  summaryNum: { color: '#fff', fontSize: 34, fontWeight: '900' },

  saveBtn:    { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  skipBtn:    { alignItems: 'center', paddingVertical: 10 },
  skipTxt:    { color: '#aaa', fontSize: 13 },
});