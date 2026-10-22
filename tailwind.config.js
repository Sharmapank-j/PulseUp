/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // PulseUp core palette (matches the original demo)
        pulse: {
          50: '#ecfdf5',
          100: '#d1fae5',
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
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        // Claymorphism extras
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
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(16,185,129,0.25)',
        'glow-sm': '0 0 12px rgba(16,185,129,0.35)',
        // Glassmorphism shadows
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255,255,255,0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.3)',
        // Claymorphism shadows
        'clay': '0 4px 6px rgba(black, 0.05), 0 10px 15px -3px rgba(black, 0.1)',
        'clay-lg': '0 10px 15px -3px rgba(black, 0.08), 0 4px 6px -2px rgba(black, 0.05), 0 0 0 1px rgba(black, 0.05)',
        // 3D depth shadows
        '3d': '0 25px 50px -12px rgba(0,0,0,0.25)',
        '3d-sm': '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.1)',
        '3d-hover': '0 30px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(16,185,129,0.2)',
      },
      // 3D perspective for transforms
      transformPerspective: {
        'card': '1000px',
        'scene': '800px',
      },
      borderRadius: {
        'clay': '24px', // friendly rounded corners for claymorphism
        'pill': '9999px',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ecg: {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        // Glassmorphism reveal animation
        'glass-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // 3D hover float
        'float': {
          '0%, 100%': { transform: 'translateY(0) perspective(1000px) rotateX(0deg)' },
          '50%': { transform: 'translateY(-4px) perspective(1000px) rotateX(1deg)' },
        },
        // Clay blob wobble
        'blob': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 40% 60% 30% 70%' },
        },
        // Gradient rotation for 3D depth
        'gradient-rotate': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        // Glow pulse for glass edges
        'edge-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(16,185,129,0.3), 0 8px 32px rgba(31,38,135,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(16,185,129,0.5), 0 8px 32px rgba(31,38,135,0.15)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-up': 'fade-up .35s ease-out both',
        'glass-in': 'glass-in .4s ease-out both',
        'float': 'float 3s ease-in-out infinite',
        'edge-glow': 'edge-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
