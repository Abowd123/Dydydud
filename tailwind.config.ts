import type { Config } from 'tailwindcss';

/**
 * GymMate "Chronograph" Design System
 * منطق ميناء ساعة فاخرة: أسود دافئ (Obsidian)، ذهبي شمبانيا، حلقات تدريج دقيقة، عقرب يدور.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        ink: '#17130B', // نص فوق الذهبي
        gold: { DEFAULT: 'rgb(var(--gold) / <alpha-value>)', 200: '#F3DDA8', 300: '#E8C989', 400: '#D4AF6A', 500: '#B8904C', 600: '#94703A' },
        primary: { DEFAULT: 'rgb(var(--gold) / <alpha-value>)', 600: '#B8904C', 400: '#E8C989' },
        accent: { DEFAULT: '#E0823F', 600: '#C66A2B', 400: '#EDA06A' }, // نحاس الجمر: السلسلة والحماس
        danger: '#E5484D',
        water: '#7DB4D6', // فولاذ مزرق
        success: '#6FBF8E'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        heading: ['"Noto Kufi Arabic"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        display: ['Khand', '"Noto Kufi Arabic"', 'sans-serif']
      },
      // أصغر نص 13px عشان القراءة تبقى مريحة
      fontSize: { xs: ['0.8125rem', { lineHeight: '1.15rem' }] },
      borderRadius: { xl: '14px', '2xl': '18px', '3xl': '26px' },
      boxShadow: {
        soft: '0 18px 40px -18px rgb(0 0 0 / 0.65), 0 2px 6px -2px rgb(0 0 0 / 0.35)',
        glow: '0 10px 30px -10px rgb(212 175 106 / 0.55)',
        'glow-accent': '0 10px 30px -10px rgb(224 130 63 / 0.55)',
        bevel: 'inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 -1px 0 rgb(0 0 0 / 0.4)'
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #F3DDA8 0%, #D4AF6A 38%, #B8904C 72%, #E8C989 100%)',
        'grad-energy': 'linear-gradient(120deg, #E8C989 0%, #D4AF6A 45%, #E0823F 100%)',
        'grad-hero':
          'radial-gradient(90% 70% at 100% 0%, rgb(212 175 106 / 0.20) 0%, transparent 60%), radial-gradient(80% 60% at 0% 100%, rgb(224 130 63 / 0.10) 0%, transparent 60%)',
        'grad-metal': 'linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface-2)) 100%)'
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(-100%)' } },
        flame: { '0%,100%': { transform: 'scale(1) rotate(-2deg)' }, '50%': { transform: 'scale(1.12) rotate(2deg)' } },
        sheen: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '60%,100%': { transform: 'translateX(220%) skewX(-20deg)' } },
        breathe: { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        flame: 'flame 1.2s ease-in-out infinite',
        sheen: 'sheen 7s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
