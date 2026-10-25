/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#111612',
          800: '#151D17',
          700: '#1B251E',
          600: '#222F26',
          500: '#2E5A36',
          400: '#4E8752',
          300: '#8FB996',
          200: '#A3C9A8',
          100: '#C2DFC3',
          50: '#E8EFE9'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
