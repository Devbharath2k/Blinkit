/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#212121",
        secondary: "#E5E5E5",
        success: "#4CAF50",
        danger: "#F44336",
        warning: "#FF9800",
      },
    },
  },
  plugins: [],
}