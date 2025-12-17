/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        highlight: '#e94560',
        'dark-bg': '#0f0f1e',
        'dark-card': '#1a1a2e',
        'dark-hover': '#16213e',
        'text-primary': '#eaeaea',
        'text-secondary': '#a0a0a0'
      }
    },
  },
  plugins: [],
}
