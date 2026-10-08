import React, { useState } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, Pressable, ScrollView,
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
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateInputs = (): boolean => {
    const newErrors = { email: '', password: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return newErrors.email === '' && newErrors.password === '';
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Attempting login with:', email);
      console.log('📍 API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password 
        }),
      });

      console.log('📊 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        Alert.alert(
          'Login Failed',
          data.error || 'Invalid email or password. Please try again.'
        );
        return;
      }

      if (!data.token || !data.user) {
        Alert.alert('Error', 'Invalid response from server');
        return;
      }

      console.log('✅ Login successful!');
      onLogin(data.token, data.user);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      if (error.message.includes('JSON')) {
        Alert.alert(
          'Server Error',
          'Unexpected server response. Please try again later.'
        );
      } else if (error.message.includes('Network')) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>CalorieAI 🥗</Text>
            <Text style={styles.subtitle}>Welcome Back</Text>
            <Text style={styles.description}>Sign in to track your calories</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                placeholderTextColor="#ccc"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                secureTextEntry
                editable={!loading}
                placeholderTextColor="#ccc"
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                pressed && !loading && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                loading && styles.btnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?{' '}</Text>
            <Pressable
              onPress={onGoToSignup}
              disabled={loading}
              style={({ pressed }) => [
                pressed && !loading && { opacity: 0.6 }
              ]}
            >
              <Text style={styles.signUpLink}>Create one</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f4fc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6750c8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    color: '#111',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
    marginTop: 6,
  },
  btn: {
    backgroundColor: '#6750c8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    elevation: 4,
    shadowColor: '#6750c8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 14,
    color: '#6750c8',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});