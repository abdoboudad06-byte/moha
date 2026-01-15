
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s infinite alternate ease-in-out',
        'spin-slow': 'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
}
