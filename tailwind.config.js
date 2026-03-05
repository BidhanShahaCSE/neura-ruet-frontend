/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0b0b0b',
          100: '#111111',
          200: '#161616',
          300: '#1a1a1a',
          400: '#222222',
          500: '#2a2a2a',
        },
        neon: {
          DEFAULT: '#7CFF6B',
          dark: '#5ecc4e',
          glow: 'rgba(124, 255, 107, 0.15)',
          glowStrong: 'rgba(124, 255, 107, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(124, 255, 107, 0.15)',
        'neon-md': '0 0 40px rgba(124, 255, 107, 0.2)',
        'neon-lg': '0 0 80px rgba(124, 255, 107, 0.25)',
        'neon-xl': '0 0 120px rgba(124, 255, 107, 0.3)',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(124, 255, 107, 0.15)' },
          '50%': { boxShadow: '0 0 80px rgba(124, 255, 107, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
