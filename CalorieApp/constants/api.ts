

export const API_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3000'; // local dev ke liye fallback

console.log('🌐 API URL:', API_URL); // Debug ke liye