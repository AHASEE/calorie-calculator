import { colors as brand } from './colors';

// ── LIGHT THEME ───────────────────────────────────────────
export const LIGHT_COLORS = {
  primary:               brand.primary,
  primaryLight:          '#E8F3EC',
  primaryGradientStart:  '#0B6B46',
  primaryGradientEnd:    brand.primary,
  secondary:             brand.secondary,
  accent:                brand.accent,
  background:            brand.background,
  card:                  brand.card,
  white:                 '#FFFFFF',
  text:                  brand.text,
  textMuted:             brand.textMuted,
  textLight:             '#9AA79F',
  border:                brand.border,
  success:               '#22C55E',
  warning:               brand.accent,
  info:                  brand.water,
  error:                 brand.danger,
  scanCard:              '#FFFFFF',
  navBar:                '#FFFFFF',
  shimmer:               '#E8F3EC',
  inputBg:               '#FFFFFF',
  sectionBg:             '#F0F6F2',
};

// ── DARK THEME ────────────────────────────────────────────
export const DARK_COLORS = {
  primary:               '#4CAF78',
  primaryLight:          '#183D2E',
  primaryGradientStart:  '#0B6B46',
  primaryGradientEnd:    '#064E35',
  secondary:             '#8BC34A',
  accent:                '#FF8A1F',
  background:            '#0B1711',
  card:                  '#12241A',
  white:                 '#12241A',
  text:                  '#F2F7F4',
  textMuted:             '#A1B2A8',
  textLight:             '#73847A',
  border:                '#254235',
  success:               '#4ADE80',
  warning:               '#FF8A1F',
  info:                  '#60A5FA',
  error:                 '#F87171',
  scanCard:              '#12241A',
  navBar:                '#0F1F17',
  shimmer:               '#1C3528',
  inputBg:               '#182C21',
  sectionBg:             '#0B1711',
};

// Existing screens that import COLORS use the light Alviva theme.
export const COLORS = LIGHT_COLORS;

export const CALORIE_GOAL = 2000;
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
