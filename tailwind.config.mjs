/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Marca ContRadar (espeja el frontend del producto)
        navy: "#1a2e4a",
        "navy-deep": "#0f172a",
        teal: "#14b8a6",
        sky: "#4a90e2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
