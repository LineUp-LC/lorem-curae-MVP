import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Primary - Buttons, primary accents, primary hovers
        primary: {
          DEFAULT: '#C4704D',
          50: '#FDF8F5',
          100: '#F9EDE6',
          200: '#F2D5C7',
          300: '#E8A888',
          400: '#D4885F',
          500: '#C4704D',
          600: '#A85D3E',
          700: '#8B4D35',
          800: '#6E3D2A',
          900: '#512D1F',
        },
        // Light - Gradients, soft highlights, subtle backgrounds
        light: {
          DEFAULT: '#E8A888',
        },
        // Dark - Hover states, pressed states, strong accents
        dark: {
          DEFAULT: '#8B4D35',
        },
        // Cream - Page backgrounds, section backgrounds
        cream: {
          DEFAULT: '#FDF8F5',
          50: '#FFFFFF',
          100: '#FDF8F5',
          200: '#F8F0EB',
          300: '#F3E8E1',
          400: '#EBD9CF',
          500: '#E0C9BC',
          600: '#D4B5A5',
          700: '#C8A18E',
          800: '#BC8D77',
          900: '#B07960',
        },
        // Deep - Headings, strong text, titles
        deep: {
          DEFAULT: '#2D2A26',
          50: '#F5F5F4',
          100: '#E7E6E5',
          200: '#CFCDCB',
          300: '#A8A5A1',
          400: '#7A7672',
          500: '#5C5854',
          600: '#4A4743',
          700: '#3B3834',
          800: '#2D2A26',
          900: '#1F1D1A',
        },
        // Sage - Secondary accents, secondary buttons, supportive UI elements
        sage: {
          DEFAULT: '#7A8B7A',
          50: '#F4F6F4',
          100: '#E5EAE5',
          200: '#CCD5CC',
          300: '#A9B8A9',
          400: '#8FA08F',
          500: '#7A8B7A',
          600: '#627062',
          700: '#4F5A4F',
          800: '#3D463D',
          900: '#2B322B',
        },
        // Warm Gray - Body text, paragraph text, descriptions
        'warm-gray': {
          DEFAULT: '#6B635A',
          50: '#F7F6F5',
          100: '#EDECEA',
          200: '#DBD8D4',
          300: '#C0BBB4',
          400: '#A59E95',
          500: '#8A827A',
          600: '#6B635A',
          700: '#564F48',
          800: '#413C36',
          900: '#2C2924',
        },
        // Blush - Borders, dividers, subtle accents, card outlines
        blush: {
          DEFAULT: '#E8D4CC',
          50: '#FDFBFA',
          100: '#F8F3F0',
          200: '#F1E7E2',
          300: '#E8D4CC',
          400: '#DBBFB3',
          500: '#CEAA9A',
          600: '#C19581',
          700: '#B48068',
          800: '#A76B4F',
          900: '#9A5636',
        },
        // Legacy colors for backwards compatibility
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