/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#151513",
          900: "#1c1c19",
          850: "#22231f",
          800: "#282a25",
          700: "#35372f",
        },
        flame: {
          500: "#ff7b55",
          400: "#ff9a6d",
          300: "#ffbd8f",
        },
      },
      boxShadow: {
        executive: "0 18px 50px rgba(0,0,0,.34)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
