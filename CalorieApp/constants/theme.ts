import { useColorScheme } from 'react-native';

// ── LIGHT THEME ───────────────────────────────────────────
export const LIGHT_COLORS = {
  primary:               '#6750c8',
  primaryLight:          '#ede9ff',
  primaryGradientStart:  '#7c6fe0',
  primaryGradientEnd:    '#6750c8',
  background:            '#f5f4fc',
  card:                  '#ffffff',
  white:                 '#ffffff',
  text:                  '#111111',
  textMuted:             '#888888',
  textLight:             '#aaaaaa',
  border:                '#f0f0f0',
  success:               '#22c55e',
  warning:               '#f59e0b',
  info:                  '#3b82f6',
  error:                 '#ef4444',
  scanCard:              '#ffffff',
  navBar:                '#ffffff',
  shimmer:               '#ede9ff',
  inputBg:               '#ffffff',
  sectionBg:             '#f5f4fc',
};

// ── DARK THEME ────────────────────────────────────────────
export const DARK_COLORS = {
  primary:               '#8B7FE8',
  primaryLight:          '#2D2A4A',
  primaryGradientStart:  '#9B8FE8',
  primaryGradientEnd:    '#7B6FD8',
  background:            '#0F0F1A',
  card:                  '#1A1A2E',
  white:                 '#1A1A2E',
  text:                  '#F0F0F5',
  textMuted:             '#9090A0',
  textLight:             '#6060708',
  border:                '#2A2A3E',
  success:               '#22c55e',
  warning:               '#f59e0b',
  info:                  '#3b82f6',
  error:                 '#ef4444',
  scanCard:              '#1A1A2E',
  navBar:                '#12121F',
  shimmer:               '#2A2A4A',
  inputBg:               '#252538',
  sectionBg:             '#0F0F1A',
};

// ── DEFAULT EXPORT (Light) ────────────────────────────────
// Existing screens use COLORS — yeh light theme se same hai
export const COLORS = LIGHT_COLORS;

export const CALORIE_GOAL = 2000;
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';