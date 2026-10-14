/**
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{tsx,ts,jsx,js}'],
  darkMode: ['class', '[data-night="true"]'],
  theme: {
    extend: {
      colors: {
        // PulseUp core palette (matches the original demo)
        pulse: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        night: {
          950: '#0B101B', // app background (dark)
          900: '#0f1524',
          800: '#151D2D', // card background
          700: '#1c2740',
          600: '#253352',
          400: '#334060',
        },
        ice: '#F1F5F9', // dark-mode text
        accent: {
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        clay: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        clay: '1.25rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        '3d-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '3d': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        '3d-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-hover': '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.2)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'clay-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.05)', opacity: '0.2' },
        },
        'edge-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(16,185,129,0.3), 0 8px 32px rgba(31,38,135,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(16,185,129,0.5), 0 8px 32px rgba(31,38,135,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'edge-glow': 'edge-glow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
