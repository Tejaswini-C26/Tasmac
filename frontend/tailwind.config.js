/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../4RGE-Platform-main/packages/platform/dist/**/*.{js,mjs}',
    '../../4RGE-Platform-main/packages/platform/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#f97316', // 4RGE Electric Brand Orange
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          foreground: '#ffffff',
        },
        forge: {
          darkest: '#000000',
          darker: '#080808',
          dark: '#101010',
          card: '#101010',
          cardHover: '#161616',
          border: '#222222',
          borderLight: '#2a2a2a',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          accent: '#f97316',
          accentGlow: 'rgba(249, 115, 22, 0.15)',
          success: '#10b981',
          warning: '#f59e0b',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", '"SF Mono"', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

