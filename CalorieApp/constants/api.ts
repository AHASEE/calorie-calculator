const DEFAULT_API_URL =
  'https://calorie-calculator-4ls7.onrender.com';

export const API_URL =
  (
    process.env.EXPO_PUBLIC_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, '');

if (__DEV__) {
  console.log('🌐 API URL:', API_URL);
}
