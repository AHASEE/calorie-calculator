import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../components/ThemeContext';
import { supabase } from '../lib/supabase';

interface Props {
  onComplete: () => void;
}

export default function ResetPasswordScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please enter the same password twice.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Password updated',
        'Your password has been changed. Please sign in again.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
              onComplete();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to reset password',
        error?.message || 'Please request a new reset link and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Create a new password</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Choose a strong password for your Alviva account.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>New password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Confirm password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Enter password again"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loading && { opacity: 0.65 }]}
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: { fontSize: 30 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
