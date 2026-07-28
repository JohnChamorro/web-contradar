/** @type {import('tailwindcss').Config} */

// Alias legados → tokens, espejo del mapeo del repo de la app (frontend/
// tailwind.config.js). Cada tono de fábrica cae al token más cercano.
const T = (name) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

// Neutros: fondos en papel, texto en grafito.
const legacyNeutro = {
  DEFAULT: T("grafito-500"),
  50: T("papel-100"),
  100: T("papel-150"),
  200: T("papel-200"),
  300: T("papel-300"),
  400: T("grafito-400"),
  500: T("grafito-500"),
  600: T("grafito-700"),
  700: T("grafito-700"),
  800: T("grafito-900"),
  900: T("grafito-900"),
};

const legacyJade = {
  DEFAULT: T("jade-500"),
  50: T("jade-050"),
  100: T("jade-050"),
  200: T("jade-050"),
  300: T("jade-500"),
  400: T("jade-500"),
  500: T("jade-500"),
  600: T("jade-700"),
  700: T("jade-700"),
  800: T("jade-700"),
  900: T("jade-700"),
};

const legacySello = {
  DEFAULT: T("sello-500"),
  50: T("sello-050"),
  100: T("sello-050"),
  200: T("sello-050"),
  300: T("sello-500"),
  400: T("sello-500"),
  500: T("sello-500"),
  600: T("sello-700"),
  700: T("sello-700"),
  800: T("sello-700"),
  900: T("sello-700"),
};

const legacyAmbar = {
  DEFAULT: T("ambar-500"),
  50: T("ambar-050"),
  100: T("ambar-050"),
  200: T("ambar-050"),
  300: T("ambar-500"),
  400: T("ambar-500"),
  500: T("ambar-500"),
  600: T("ambar-700"),
  700: T("ambar-700"),
  800: T("ambar-700"),
  900: T("ambar-700"),
};

export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta v1 retirada en fase 6: navy/navy-deep/teal/sky ya no existen.
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

        // ── Alias legados → tokens (NO usar en código nuevo) ──
        // Mismo mecanismo que el tailwind.config.js de la app: las ~380
        // clases de fábrica aún presentes (text-slate-600, bg-emerald-50…)
        // renderizan en paleta sin editarlas una a una. La fase 6 las
        // renombra en el código y borra estos alias.
        slate: legacyNeutro,
        gray: legacyNeutro,
        zinc: legacyNeutro,
        emerald: legacyJade,
        green: legacyJade,
        red: legacySello,
        rose: legacySello,
        amber: legacyAmbar,
        orange: legacyAmbar,
        yellow: legacyAmbar,
      },
      maxWidth: {
        // Marco de la landing. El tope duro sube a 1400 px y el 92vw manda en
        // pantallas menores, para que en portátiles de 1366 siga habiendo aire
        // a los lados en vez de texto pegado al borde. Es un ancho propio del
        // sitio público: --maxw (1200) sigue siendo el del sistema para la app.
        contenido: "min(1220px, calc(88vw - 60px))",
        cabecera: "min(1300px, calc(90vw - 60px))",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "Arial", "sans-serif"],
        // Cifras: la misma pila que --font-dato (tokens.css). `font-mono`
        // y `.dato` deben renderizar idéntico.
        mono: ["IBM Plex Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        // Fase 2 — sombra→línea: la "sombra" de tarjeta es un anillo de 1px.
        // La sombra difusa real solo vive en .flota / --sh-flota.
        card: "0 0 0 1px var(--papel-200)",
        "card-hover": "0 0 0 1px var(--azul-500)",
      },
      borderRadius: {
        // Radio por tamaño (tokens --r-*): 3/5/8/12/16. Tope 16px.
        sm: "3px",
        DEFAULT: "5px",
        md: "5px",
        lg: "8px", // botones, inputs
        xl: "12px", // tarjetas, paneles
        "2xl": "16px", // bandas, fotos, contenedores grandes
        "3xl": "16px", // tope: nada más redondo que 16px
      },
    },
  },
  plugins: [],
};
