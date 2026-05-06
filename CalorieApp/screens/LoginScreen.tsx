import React, { useState } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, Pressable,
} from 'react-native';
import { API_URL } from '../constants/api';

interface Props {
  onLogin: (token: string, user: any) => void;
  onGoToSignup: () => void;
}

export default function LoginScreen({ onLogin, onGoToSignup }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email aur password daalein!');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Error', data.error || 'Login fail ho gaya!');
        return;
      }
      onLogin(data.token, data.user);
    } catch (e) {
      Alert.alert('Error', 'Network masla — backend chal raha hai?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>CalorieAI 🥗</Text>
        <Text style={styles.subtitle}>Login karein</Text>

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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onGoToSignup}
          style={({ pressed }) => [
            styles.link,
            pressed && { opacity: 0.6 }
          ]}
        >
          <Text style={styles.linkText}>
            Account nahi hai?{' '}
            <Text style={styles.linkBold}>Signup karein</Text>
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4fc' },
  container: {
    flex: 1, padding: 24, justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontWeight: '900',
    color: '#6750c8', textAlign: 'center', marginBottom: 8,
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
    elevation: 2,
  },
  btn: {
    backgroundColor: '#6750c8', borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 8,
    elevation: 4,
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  link: { marginTop: 24, alignItems: 'center', padding: 12 },
  linkText: { fontSize: 14, color: '#888' },
  linkBold: { color: '#6750c8', fontWeight: '800' },
});