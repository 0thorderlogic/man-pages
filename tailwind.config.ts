/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        gruv: {
          bg: "#282828",
          "bg0-s": "#1d2021",
          fg: "#ebdbb2",
          gray: "#a89984",
          red: "#cc241d",
          green: "#98971a",
          yellow: "#d79921",
          blue: "#458588",
          purple: "#b16286",
          aqua: "#689d6a",
          // Bright variants
          "gray-light": "#928374",
          "red-light": "#fb4934",
          "green-light": "#b8bb26",
          "yellow-light": "#fabd2f",
          "blue-light": "#83a598",
          "purple-light": "#d3869b",
          "aqua-light": "#8ec07c",
        },
      },
    },
  },
  plugins: [],
};
