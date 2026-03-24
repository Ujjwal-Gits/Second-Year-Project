/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          colors: {
              "primary": "#1D7447", 
              "primary-dark": "#0F281E",
              "primary-light": "#268C58",
              "accent": "#C5A059",
              "background-light": "#F2F4F3",
              "background-dark": "#131f19",
          },
          fontFamily: {
              "display": ["Plus Jakarta Sans", "sans-serif"],
              "serif": ["Playfair Display", "serif"],
          },
          borderRadius: {
              "DEFAULT": "0.5rem",
              "lg": "1rem",
              "xl": "1.5rem",
              "2xl": "2rem",
              "3xl": "2.5rem",
              "full": "9999px"
          },
          letterSpacing: {
              "widest-heading": "0.15em",
              "ultra": "0.25em"
          }
      },
  },
  plugins: [],
}
