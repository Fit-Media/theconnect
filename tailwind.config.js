/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        sand: '#F4EFEA',
        charcoal: '#1A1A1A',
        deep: '#121212'
      }
    },
  },
  plugins: [],
}
