/** @type {import('tailwindcss').Config} */
// NOTE: This project uses Tailwind CSS v4 via @tailwindcss/vite.
// In v4, this config file is NOT used for theme customization.
// Custom colors/fonts are defined in index.css using @theme {} instead.
// This file is kept for reference only.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}