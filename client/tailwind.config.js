/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rentzoo: {
          ink: "#123b36",
          teal: "#0f766e",
          mint: "#e7f5f0",
          coral: "#e4583f",
          gold: "#c98716"
        }
      },
      boxShadow: {
        panel: "0 16px 40px rgba(18, 59, 54, 0.08)"
      }
    }
  },
  plugins: []
};
