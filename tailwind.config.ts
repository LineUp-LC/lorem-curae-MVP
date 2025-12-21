import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f8f6',
          100: '#e3e9e3',
          200: '#c7d3c7',
          300: '#a1b5a1',
          400: '#7a957a',
          500: '#5f7a5f',
          600: '#4a614a',
          700: '#3d4f3d',
          800: '#334133',
          900: '#2b362b',
        },
        coral: {
          50: '#fef5f3',
          100: '#fde8e4',
          200: '#fbd5cd',
          300: '#f7b8aa',
          400: '#f18f7a',
          500: '#e76f54',
          600: '#d4533a',
          700: '#b2422f',
          800: '#933a2b',
          900: '#7a3429',
        },
        forest: {
          50: '#f3f6f4',
          100: '#e3e9e5',
          200: '#c7d3cb',
          300: '#a1b5a8',
          400: '#769180',
          500: '#577464',
          600: '#435b4e',
          700: '#374940',
          800: '#2e3d36',
          900: '#28342f',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ede6da',
          400: '#e3d7c5',
          500: '#d4c3aa',
          600: '#c0a989',
          700: '#a88d6d',
          800: '#8b745b',
          900: '#72604c',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;