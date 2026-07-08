import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/api';

interface Props {
  onSignup: () => void;
  onGoToLogin: () => void;
}

export default function SignupScreen({ onSignup, onGoToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Sab fields bhaaro!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password kam az kam 6 characters ka hona chahiye!');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Error', data.error || 'Signup fail ho gaya!');
        return;
      }
      Alert.alert('Success! 🎉', 'Account ban gaya! Ab login karein.', [
        { text: 'OK', onPress: onGoToLogin }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Network masla — internet check karein!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>CalorieAI 🥗</Text>
        <Text style={styles.subtitle}>Naya account banayein</Text>

        <TextInput
          style={styles.input}
          placeholder="Naam"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (kam az kam 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Signup</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToLogin} style={styles.link}>
          <Text style={styles.linkText}>
            Account hai? <Text style={styles.linkBold}>Login karein</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 32, fontWeight: '900',
    color: COLORS.primary, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, color: '#888',
    textAlign: 'center', marginBottom: 32, fontWeight: '600',
  },
  input: {
    backgroundColor: 'white', borderRadius: 14,
    padding: 16, fontSize: 15, marginBottom: 16,
    borderWidth: 1, borderColor: '#f0f0f0',
    color: '#111',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  btn: {
    backgroundColor: '#6750c8', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#6750c8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#888' },
  linkBold: { color: '#6750c8', fontWeight: '800' },
});