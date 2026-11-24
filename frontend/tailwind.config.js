/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#fbf6ea',
          100: '#f4e7c6',
          200: '#e9cf8e',
          300: '#ddb661',
          400: '#d1a443',
          500: '#c9962b',
          600: '#a97b21',
          700: '#86611c',
          800: '#6b4e1a',
          900: '#584118',
        },
        indigo: {
          50: '#fbf6ea',
          100: '#f4e7c6',
          200: '#e9cf8e',
          300: '#ddb661',
          400: '#d1a443',
          500: '#c9962b',
          600: '#a97b21',
          700: '#86611c',
          800: '#6b4e1a',
          900: '#584118',
        },
        pink: {
          50: '#fbf6ea',
          100: '#f4e7c6',
          200: '#e9cf8e',
          300: '#ddb661',
          400: '#d1a443',
          500: '#c9962b',
          600: '#a97b21',
          700: '#86611c',
          800: '#6b4e1a',
          900: '#584118',
        },
        primary: {
          50: '#f1f7f2',
          100: '#dcebdf',
          200: '#b9d6bf',
          300: '#8fbb98',
          400: '#62996e',
          500: '#4a8758',
          600: '#3f7d4e',
          700: '#33653f',
          800: '#2a5134',
          900: '#22422b',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
    },
  },
  plugins: [],
}
