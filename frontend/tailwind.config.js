/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#052e16',
        },
        forest: {
          50: '#f6f9f3',
          100: '#ebf3e6',
          200: '#d7e8cc',
          300: '#c2dcb3',
          400: '#acd199',
          500: '#97c580',
          600: '#2d5016',
          700: '#1a3d0a',
          800: '#0f2605',
          900: '#051302',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'leaf': 'leaf 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgb(34, 197, 94, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgb(34, 197, 94, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        leaf: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(10px) rotate(2deg)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-lg': '0 0 40px rgba(34, 197, 94, 0.4)',
      },
    },
  },
  plugins: [],
}
