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
      
      /* ============================================
         MOTION DESIGN SYSTEM TOKENS
         ============================================ */
      
      // Duration tokens
      transitionDuration: {
        'instant': '0ms',
        'fast': '150ms',
        'normal': '200ms',
        'moderate': '250ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      
      // Easing tokens
      transitionTimingFunction: {
        'default': 'ease-out',
        'enter': 'ease-out',
        'exit': 'ease-in',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Keyframe definitions
      keyframes: {
        // === ENTER ANIMATIONS ===
        'enter-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'enter-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'enter-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'enter-right': {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'enter-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        
        // === EXIT ANIMATIONS ===
        'exit-fade': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'exit-down': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'exit-scale': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        
        // === LOADING ANIMATIONS ===
        'loading-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'loading-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'loading-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        },
        'loading-dots': {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // === UTILITY ANIMATIONS ===
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ping': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        
        // === LEGACY (for backwards compatibility) ===
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      
      // Animation compositions
      animation: {
        // === SEMANTIC ENTER ANIMATIONS ===
        'enter-fade': 'enter-fade 200ms ease-out forwards',
        'enter-up': 'enter-up 250ms ease-out forwards',
        'enter-down': 'enter-down 250ms ease-out forwards',
        'enter-right': 'enter-right 200ms ease-out forwards',
        'enter-scale': 'enter-scale 200ms ease-out forwards',
        
        // === SEMANTIC EXIT ANIMATIONS ===
        'exit-fade': 'exit-fade 150ms ease-in forwards',
        'exit-down': 'exit-down 200ms ease-in forwards',
        'exit-scale': 'exit-scale 150ms ease-in forwards',
        
        // === LOADING ANIMATIONS ===
        'loading-spin': 'loading-spin 1s linear infinite',
        'loading-pulse': 'loading-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loading-bounce': 'loading-bounce 1s infinite',
        'loading-dots': 'loading-dots 1.4s infinite ease-in-out both',
        
        // === UTILITY ===
        'shimmer': 'shimmer 2s infinite linear',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // === LEGACY (backwards compatibility) ===
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.15s ease-in',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;