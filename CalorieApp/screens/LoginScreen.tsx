import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { API_URL } from '../constants/api';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_REDIRECT_URI = makeRedirectUri({
  scheme: 'alviva',
  path: 'auth/callback',
});

interface Props {
  onLogin: (token: string, user: any) => void;
  onGoToSignup: () => void;
}

export default function LoginScreen({
  onLogin,
  onGoToSignup,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [loading, setLoading] =
    useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateInputs = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email.trim()) {
      newErrors.email =
        'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      newErrors.email =
        'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password =
        'Password is required';
    } else if (password.length < 8) {
      newErrors.password =
        'Password must be at least 8 characters';
    }

    setErrors(newErrors);

    return (
      newErrors.email === '' &&
      newErrors.password === ''
    );
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Accept:
              'application/json',
          },
          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Login Failed',
          data.error ||
            'Invalid email or password. Please try again.'
        );
        return;
      }

      if (!data.token || !data.user) {
        Alert.alert(
          'Error',
          'Invalid response from server'
        );
        return;
      }

      let signedInUser =
        data.user;

      if (
        typeof data.refreshToken ===
          'string' &&
        data.refreshToken
      ) {
        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.setSession(
            {
              access_token:
                data.token,
              refresh_token:
                data.refreshToken,
            }
          );

        if (sessionError) {
          console.warn(
            'Unable to persist session:',
            sessionError.message
          );
        } else if (
          sessionData.user
        ) {
          signedInUser =
            sessionData.user;
        }
      }

      onLogin(
        data.token,
        signedInUser
      );
    } catch (error: any) {
      console.error(
        'Login error:',
        error?.message
      );

      if (
        error?.message?.includes(
          'JSON'
        )
      ) {
        Alert.alert(
          'Server Error',
          'Unexpected server response. Please try again later.'
        );
      } else if (
        error?.message?.includes(
          'Network'
        )
      ) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error?.message ||
            'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin =
    async () => {
      setGoogleLoading(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth
            .signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo:
                  GOOGLE_REDIRECT_URI,
                skipBrowserRedirect:
                  true,
              },
            });

        if (error) {
          throw error;
        }

        if (!data?.url) {
          throw new Error(
            'Google login URL was not created'
          );
        }

        const result =
          await WebBrowser
            .openAuthSessionAsync(
              data.url,
              GOOGLE_REDIRECT_URI
            );

        if (
          result.type !==
          'success'
        ) {
          return;
        }

        const {
          params,
          errorCode,
        } =
          QueryParams
            .getQueryParams(
              result.url
            );

        if (errorCode) {
          throw new Error(
            String(errorCode)
          );
        }

        const accessToken =
          typeof params
            .access_token ===
          'string'
            ? params
                .access_token
            : '';

        const refreshToken =
          typeof params
            .refresh_token ===
          'string'
            ? params
                .refresh_token
            : '';

        if (
          !accessToken ||
          !refreshToken
        ) {
          throw new Error(
            'Google login session was not returned'
          );
        }

        const {
          data: sessionData,
          error:
            sessionError,
        } =
          await supabase.auth
            .setSession({
              access_token:
                accessToken,
              refresh_token:
                refreshToken,
            });

        if (sessionError) {
          throw sessionError;
        }

        if (
          !sessionData.session ||
          !sessionData.user
        ) {
          throw new Error(
            'Unable to create Google session'
          );
        }

        onLogin(
          sessionData.session
            .access_token,
          sessionData.user
        );
      } catch (error: any) {
        console.error(
          'Google login error:',
          error?.message
        );

        Alert.alert(
          'Google Login Failed',
          error?.message ||
            'Unable to sign in with Google. Please try again.'
        );
      } finally {
        setGoogleLoading(false);
      }
    };

  const isBusy =
    loading || googleLoading;

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.container
          }
        >
          <View
            style={styles.header}
          >
            <Text
              style={styles.title}
            >
              Alviva 🥗
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Welcome Back
            </Text>

            <Text
              style={
                styles.description
              }
            >
              Sign in to track your
              calories
            </Text>
          </View>

          <View
            style={styles.form}
          >
            <Pressable
              style={({
                pressed,
              }) => [
                styles.googleBtn,
                pressed &&
                  !isBusy && {
                    opacity: 0.85,
                  },
                isBusy &&
                  styles.btnDisabled,
              ]}
              onPress={
                handleGoogleLogin
              }
              disabled={isBusy}
            >
              {googleLoading ? (
                <ActivityIndicator
                  color="#111"
                  size="small"
                />
              ) : (
                <>
                  <View
                    style={
                      styles.googleIcon
                    }
                  >
                    <Text
                      style={
                        styles.googleIconText
                      }
                    >
                      G
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.googleBtnText
                    }
                  >
                    Continue with
                    Google
                  </Text>
                </>
              )}
            </Pressable>

            <View
              style={
                styles.dividerRow
              }
            >
              <View
                style={
                  styles.divider
                }
              />
              <Text
                style={
                  styles.dividerText
                }
              >
                OR
              </Text>
              <View
                style={
                  styles.divider
                }
              />
            </View>

            <View
              style={
                styles.inputContainer
              }
            >
              <Text
                style={styles.label}
              >
                Email Address
              </Text>

              <TextInput
                style={[
                  styles.input,
                  errors.email &&
                    styles.inputError,
                ]}
                placeholder="Enter your email"
                value={email}
                onChangeText={(
                  text
                ) => {
                  setEmail(text);

                  if (
                    errors.email
                  ) {
                    setErrors({
                      ...errors,
                      email: '',
                    });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isBusy}
                placeholderTextColor="#ccc"
              />

              {errors.email ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View
              style={
                styles.inputContainer
              }
            >
              <Text
                style={styles.label}
              >
                Password
              </Text>

              <TextInput
                style={[
                  styles.input,
                  errors.password &&
                    styles.inputError,
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(
                  text
                ) => {
                  setPassword(
                    text
                  );

                  if (
                    errors.password
                  ) {
                    setErrors({
                      ...errors,
                      password: '',
                    });
                  }
                }}
                secureTextEntry
                editable={!isBusy}
                placeholderTextColor="#ccc"
              />

              {errors.password ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.password
                  }
                </Text>
              ) : null}
            </View>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.btn,
                pressed &&
                  !isBusy && {
                    opacity: 0.85,
                    transform: [
                      {
                        scale:
                          0.98,
                      },
                    ],
                  },
                isBusy &&
                  styles.btnDisabled,
              ]}
              onPress={
                handleLogin
              }
              disabled={isBusy}
            >
              {loading ? (
                <ActivityIndicator
                  color="white"
                  size="small"
                />
              ) : (
                <Text
                  style={
                    styles.btnText
                  }
                >
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>

          <View
            style={styles.footer}
          >
            <Text
              style={
                styles.footerText
              }
            >
              Don&apos;t have an
              account?{' '}
            </Text>

            <Pressable
              onPress={
                onGoToSignup
              }
              disabled={isBusy}
              style={({
                pressed,
              }) => [
                pressed &&
                  !isBusy && {
                    opacity: 0.6,
                  },
              ]}
            >
              <Text
                style={
                  styles.signUpLink
                }
              >
                Create one
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        '#f5f4fc',
    },

    scrollContent: {
      flexGrow: 1,
    },

    container: {
      flex: 1,
      padding: 24,
      justifyContent:
        'space-between',
    },

    header: {
      marginBottom: 32,
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

    googleBtn: {
      minHeight: 54,
      backgroundColor:
        '#ffffff',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor:
        '#dedede',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 12,
      paddingHorizontal: 16,
    },

    googleIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        '#e0e0e0',
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#fff',
    },

    googleIconText: {
      fontSize: 17,
      fontWeight: '900',
      color: '#4285F4',
    },

    googleBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#222',
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      gap: 12,
    },

    divider: {
      flex: 1,
      height: 1,
      backgroundColor:
        '#dddddd',
    },

    dividerText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#999',
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
      backgroundColor:
        'white',
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      borderWidth: 1.5,
      borderColor:
        '#e0e0e0',
      color: '#111',
      fontWeight: '500',
    },

    inputError: {
      borderColor:
        '#f44336',
      backgroundColor:
        '#ffebee',
    },

    errorText: {
      fontSize: 12,
      color: '#f44336',
      fontWeight: '600',
      marginTop: 6,
    },

    btn: {
      backgroundColor:
        '#6750c8',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
      elevation: 4,
      shadowColor:
        '#6750c8',
      shadowOffset: {
        width: 0,
        height: 4,
      },
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
      justifyContent:
        'center',
      alignItems: 'center',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor:
        '#e0e0e0',
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
      textDecorationLine:
        'underline',
    },
  });
