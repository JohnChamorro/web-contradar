/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Marca ContRadar (espeja el frontend del producto)
        // Paleta v1 — convive con la v2 hasta la fase 6. No borrar antes.
        navy: "#1a2e4a",
        "navy-deep": "#0f172a",
        teal: "#14b8a6",
        sky: "#4a90e2",
        // Paleta v2 "Plano técnico" — canales RGB desde tokens.css
        // (sincronizado desde contradar-design; <alpha-value> habilita bg-azul-500/10)
        azul: {
          50: "rgb(var(--azul-050-rgb) / <alpha-value>)",
          100: "rgb(var(--azul-100-rgb) / <alpha-value>)",
          300: "rgb(var(--azul-300-rgb) / <alpha-value>)",
          500: "rgb(var(--azul-500-rgb) / <alpha-value>)",
          600: "rgb(var(--azul-600-rgb) / <alpha-value>)",
          700: "rgb(var(--azul-700-rgb) / <alpha-value>)",
        },
        ambar: {
          50: "rgb(var(--ambar-050-rgb) / <alpha-value>)",
          500: "rgb(var(--ambar-500-rgb) / <alpha-value>)",
          700: "rgb(var(--ambar-700-rgb) / <alpha-value>)",
        },
        jade: {
          50: "rgb(var(--jade-050-rgb) / <alpha-value>)",
          500: "rgb(var(--jade-500-rgb) / <alpha-value>)",
          700: "rgb(var(--jade-700-rgb) / <alpha-value>)",
        },
        sello: {
          50: "rgb(var(--sello-050-rgb) / <alpha-value>)",
          500: "rgb(var(--sello-500-rgb) / <alpha-value>)",
          700: "rgb(var(--sello-700-rgb) / <alpha-value>)",
        },
        papel: {
          0: "rgb(var(--papel-000-rgb) / <alpha-value>)",
          50: "rgb(var(--papel-050-rgb) / <alpha-value>)",
          100: "rgb(var(--papel-100-rgb) / <alpha-value>)",
          150: "rgb(var(--papel-150-rgb) / <alpha-value>)",
          200: "rgb(var(--papel-200-rgb) / <alpha-value>)",
          300: "rgb(var(--papel-300-rgb) / <alpha-value>)",
        },
        grafito: {
          300: "rgb(var(--grafito-300-rgb) / <alpha-value>)",
          400: "rgb(var(--grafito-400-rgb) / <alpha-value>)",
          500: "rgb(var(--grafito-500-rgb) / <alpha-value>)",
          700: "rgb(var(--grafito-700-rgb) / <alpha-value>)",
          900: "rgb(var(--grafito-900-rgb) / <alpha-value>)",
        },
        tinta: {
          600: "rgb(var(--tinta-600-rgb) / <alpha-value>)",
          800: "rgb(var(--tinta-800-rgb) / <alpha-value>)",
          900: "rgb(var(--tinta-900-rgb) / <alpha-value>)",
          txt: "rgb(var(--tinta-txt-rgb) / <alpha-value>)",
          "txt-2": "rgb(var(--tinta-txt-2-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
