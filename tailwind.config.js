/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': {
          50: '#f4f4f6',
          100: '#e8e8ec',
          200: '#c5c5ce',
          300: '#a3a3b0',
          400: '#5e5e75',
          500: '#1a1a3a',
          600: '#171734',
          700: '#13132c',
          800: '#0f0f24',
          900: '#0c0c1e',
        },
        'silk': {
          50: '#fdfffe',
          100: '#fbfefd',
          200: '#f4fcf9',
          300: '#edfaf5',
          400: '#def6ee',
          500: '#cef2e7',
          600: '#b9dad0',
          700: '#9bb5ad',
          800: '#7c908a',
          900: '#657671',
        },
        'knight': {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#f9f9f9',
          300: '#f5f5f5',
          400: '#ededed',
          500: '#e5e5e5',
          600: '#cecece',
          700: '#ababab',
          800: '#898989',
          900: '#6f6f6f',
        }
      },
      fontFamily: {
        'hollow': ['ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}