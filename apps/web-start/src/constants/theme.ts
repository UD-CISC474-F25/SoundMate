export const COLORS = {
  primary: '#2e2e2e',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    400: '#9ca3af',
    700: '#374151',
    800: '#1f2937',
  },
  medieval: {
    green: '#3B5B29',
    greenLight: '#e8f2e5',
    greenHover: '#2d4620',
    yellow: '#F6B93B',
    yellowLight: '#fef3e2',
    yellowDark: '#d97706',
    red: '#A50034',
  },
  status: {
    unread: '#ff4444',
    due: '#ffaa00',
    graded: '#44ff44',
  },
} as const;

export const OPACITY = {
  high: 1,
  medium: 0.7,
  low: 0.5,
} as const;

export const SPACING = {
  xs: '0.25rem',  // 4px
  s: '0.5rem',    // 8px
  m: '1rem',      // 16px
  l: '1.5rem',    // 24px
  xl: '2rem',     // 32px
  xxl: '3rem',    // 48px
} as const;
