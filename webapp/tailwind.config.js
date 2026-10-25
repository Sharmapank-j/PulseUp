/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B101B',
          900: '#111827',
          850: '#151D2D',
          800: '#1A2235',
          750: '#1C2541',
          700: '#222C44',
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        indigoA: {
          DEFAULT: '#3B82F6',
        },
        amberA: {
          DEFAULT: '#F59E0B',
        },
        crimsonA: {
          DEFAULT: '#EF4444',
        },
        purpleA: {
          DEFAULT: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
