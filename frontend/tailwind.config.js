/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B6B63',
        ink: '#12211E',
        sand: '#F5F7F6',
        mist: '#E4F0ED',
        gold: '#C9A227'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      },
      gridTemplateColumns: {
        auto: 'repeat(auto-fill, minmax(260px, 1fr))'
      },
      boxShadow: {
        soft: '0 12px 40px -20px rgba(18, 33, 30, 0.28)',
        card: '0 1px 2px rgba(18, 33, 30, 0.06), 0 8px 24px -12px rgba(18, 33, 30, 0.12)'
      }
    },
  },
  plugins: [],
}
