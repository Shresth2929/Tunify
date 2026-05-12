/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        accent: {
          DEFAULT: '#EC4899',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        dark: {
          DEFAULT: '#080808',
          50:  '#141414',
          100: '#111111',
          200: '#1A1A1A',
          300: '#222222',
          400: '#2A2A2A',
          500: '#333333',
        },
        surface: '#111111',
        card: '#181818',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
        'poster-in': 'posterIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        posterIn: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249,115,22,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(249,115,22,0.8)' },
        },
      },
    },
  },
  plugins: [],
};
