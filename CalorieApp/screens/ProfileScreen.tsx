import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { API_URL } from '../constants/api';

interface Props {
  token: string;
  onSave?: (suggestedGoal: number) => void;
}

interface ProfileData {
  name: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: string | null;
  activity_level: string | null;
  daily_goal: number;
  bmi: number | null;
  bmiCategory: string | null;
  bmiColor: string | null;
  suggestedGoal: number;
}

const GENDERS = ['Male', 'Female', 'Other'];
const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { key: 'moderate',  label: 'Moderate',  desc: '3-5 days/week' },
  { key: 'active',    label: 'Active',    desc: '6-7 days/week' },
];

export default function ProfileScreen({ token, onSave }: Props) {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');

  // Live BMI calculate karo as user types
  const liveBMI = weight && height
    ? Math.round((parseFloat(weight) / ((parseFloat(height) / 100) ** 2)) * 10) / 10
    : null;

  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6', goal: 2500 };
    if (bmi < 25)   return { category: 'Normal',      color: '#22c55e', goal: 2000 };
    if (bmi < 30)   return { category: 'Overweight',  color: '#f59e0b', goal: 1700 };
    return             { category: 'Obese',         color: '#ef4444', goal: 1500 };
  };

  const liveBMIInfo = getBMICategory(liveBMI);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setName(data.profile.name || '');
        setAge(data.profile.age?.toString() || '');
        setWeight(data.profile.weight?.toString() || '');
        setHeight(data.profile.height?.toString() || '');
        setGender(data.profile.gender || '');
        setActivityLevel(data.profile.activity_level || 'moderate');
      }
    } catch (e) {
      console.log('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty!'); return; }

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (age && (ageNum < 10 || ageNum > 100)) { Alert.alert('Error', 'Age must be between 10 and 100!'); return; }
    if (weight && (weightNum < 20 || weightNum > 300)) { Alert.alert('Error', 'Weight must be between 20 and 300 kg!'); return; }
    if (height && (heightNum < 100 || heightNum > 250)) { Alert.alert('Error', 'Height must be between 100 and 250 cm!'); return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          age: age ? ageNum : null,
          weight: weight ? weightNum : null,
          height: height ? heightNum : null,
          gender: gender || null,
          activity_level: activityLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        Alert.alert('Success ✅', 'Profile updated successfully!');
        onSave?.(data.profile.suggestedGoal);
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error — please check your connection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>

      <Text style={[styles.title, { color: colors.text }]}>👤 Your Profile</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Help us personalize your experience</Text>

      {/* Name */}
      <Text style={[styles.label, { color: colors.text }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textLight}
      />

      {/* Age + Gender Row */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.text }]}>Age</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, { borderColor: colors.border }, gender === g && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderTxt, { color: colors.textMuted }, gender === g && { color: '#fff' }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Weight + Height Row */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Activity Level */}
      <Text style={[styles.label, { color: colors.text }]}>Activity Level</Text>
      <View style={{ gap: 8, marginBottom: 16 }}>
        {ACTIVITY_LEVELS.map(a => (
          <TouchableOpacity
            key={a.key}
            style={[styles.activityCard, { borderColor: colors.border, backgroundColor: colors.card }, activityLevel === a.key && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
            onPress={() => setActivityLevel(a.key)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityLabel, { color: colors.text }, activityLevel === a.key && { color: colors.primary }]}>{a.label}</Text>
              <Text style={[styles.activityDesc, { color: colors.textMuted }]}>{a.desc}</Text>
            </View>
            {activityLevel === a.key && <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* BMI Card — live preview */}
      {liveBMI && liveBMIInfo && (
        <View style={[styles.bmiCard, { backgroundColor: liveBMIInfo.color + '15', borderColor: liveBMIInfo.color }]}>
          <View style={styles.bmiTop}>
            <View>
              <Text style={[styles.bmiLabel, { color: colors.textMuted }]}>Your BMI</Text>
              <Text style={[styles.bmiValue, { color: liveBMIInfo.color }]}>{liveBMI}</Text>
            </View>
            <View style={[styles.bmiBadge, { backgroundColor: liveBMIInfo.color }]}>
              <Text style={styles.bmiBadgeTxt}>{liveBMIInfo.category}</Text>
            </View>
          </View>
          <Text style={[styles.bmiTip, { color: colors.textMuted }]}>
            💡 Suggested daily goal: <Text style={{ fontWeight: '800', color: colors.text }}>{liveBMIInfo.goal} kcal</Text>
          </Text>
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Save Profile ✅</Text>}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  content:    { padding: 20, paddingBottom: 40 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  subtitle:   { fontSize: 13, marginBottom: 24 },
  label:      { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input:      { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, marginBottom: 4 },
  row:        { flexDirection: 'row', gap: 12 },
  genderRow:  { flexDirection: 'row', gap: 6 },
  genderChip: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  genderTxt:  { fontSize: 12, fontWeight: '700' },
  activityCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, padding: 14 },
  activityLabel: { fontSize: 14, fontWeight: '800' },
  activityDesc:  { fontSize: 12, marginTop: 2 },
  bmiCard:    { borderRadius: 16, padding: 16, borderWidth: 1.5, marginTop: 8, marginBottom: 24 },
  bmiTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiLabel:   { fontSize: 12, fontWeight: '600' },
  bmiValue:   { fontSize: 32, fontWeight: '900', marginTop: 2 },
  bmiBadge:   { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  bmiBadgeTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  bmiTip:     { fontSize: 13, marginTop: 12 },
  saveBtn:    { borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 4 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});