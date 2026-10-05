/** GymMate Design Tokens: مصدر واحد للحقيقة، مطابق لـ Figma */
export const colors = {
  bg: '#0E0D0B',
  surface: '#1A1815',
  elevated: '#24211D',
  gold: '#D4AF6A',
  goldLight: '#F3DDA8',
  goldDeep: '#B8904C',
  ember: '#E0823F',
  steel: '#7DB4D6',
  danger: '#E5484D',
  text: '#F2EEE6',
  muted: '#A39C8F'
} as const;

export const radius = { sm: 8, md: 14, lg: 18, xl: 22, '2xl': 26, full: 9999 } as const;
export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;
export const typography = {
  fontHeading: 'Noto Kufi Arabic',
  fontBody: 'IBM Plex Sans Arabic',
  fontDisplay: 'Khand',
  sizes: { sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, display: 64 }
} as const;
export const motion = { fast: 0.15, base: 0.25, slow: 0.4, spring: { type: 'spring', stiffness: 380, damping: 30 } as const };
export const touchTarget = 44;
