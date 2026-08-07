/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8A2BE2",
          light: "#A64DFF",
          dark: "#6C2BD9"
        },
        secondary: "#A64DFF",
        accent: "#6C2BD9",
        purplebg: "#F8F5FF",
        borderlight: "#F0E6FF",
        background: "#F8F5FF"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      },
      borderRadius: {
        'nec': '16px'
      },
      boxShadow: {
        'glow': '0 0 15px rgba(138, 43, 226, 0.4)',
        'glow-lg': '0 0 25px rgba(138, 43, 226, 0.6)',
        'premium': '0 10px 30px -5px rgba(138, 43, 226, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}