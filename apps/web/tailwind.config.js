/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blackboard: {
          canvas: '#1F3D2F',
          surface: '#14271E',
          raised: '#1B3529',
          border: '#2C5441',
          text: '#F0FDF4',
          muted: '#A7F3D0',
          accent: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
