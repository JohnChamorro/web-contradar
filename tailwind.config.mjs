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
        // Marco de la landing. El tope duro sube a 1600 px y el 92vw manda en
        // pantallas menores, para que en portátiles de 1366 siga habiendo aire
        // a los lados en vez de texto pegado al borde. Es un ancho propio del
        // sitio público: --maxw (1200) sigue siendo el del sistema para la app.
        //
        // Tramo 1 responsive (ago-2026): 1400 → 1600. A 2560 el contenido pasa
        // de ocupar el 54,7% de la pantalla al 62,5%. El 92vw sólo manda por
        // debajo de 1739 px de viewport (1600 ÷ 0,92); por encima manda el tope.
        // La cabecera conserva su razón de 1,05 sobre el contenido y sus +2vw.
        contenido: "min(1600px, 92vw)",
        cabecera: "min(1680px, 94vw)",
      },

      // ── ESCALA TIPOGRÁFICA FLUIDA · SÓLO LA LANDING ──────────────────────
      // Divergencia deliberada respecto a tokens.css. Ver la nota larga al pie
      // de este archivo y el comentario de src/layouts/Base.astro.
      //
      // Patrón: clamp(<valor actual>, <rem> + <vw>, <techo>).
      // Nunca vw puro — el término rem del medio es lo que mantiene vivo el
      // zoom del navegador.
      //
      // Los coeficientes están resueltos para que el término medio valga
      // EXACTAMENTE el valor de fábrica de Tailwind a 1024 px y alcance el
      // techo a 2560 px:
      //     B(vw) = (techo − actual) / 15.36
      //     A(px) = actual − B × 10.24
      // Como el medio crece con el ancho y vale el mínimo justo en 1024, por
      // debajo de 1024 gana siempre el mínimo: móvil y portátil se ven IGUAL
      // que antes. Todo el crecimiento ocurre por encima de 1024.
      //
      // Los line-height pasan de rem fijo a ratio adimensional equivalente
      // (18/28 → 1.5556, etc.): mismo render a los tamaños de hoy, pero
      // acompañan a la fuente cuando crece. Con el rem fijo, el interlineado
      // se quedaría corto en monitor grande.
      fontSize: {
        //                     1024px → 2560px
        // cuerpo de la landing: 16 → 17 px. Sube el piso del sistema (15 px,
        // "densidad de producto de datos") a propósito: la landing es un
        // documento de lectura, no una herramienta de datos.
        base: ["clamp(1rem, 0.9583rem + 0.0651vw, 1.0625rem)", { lineHeight: "1.5" }],
        // 18 → 21 px · párrafo del hero y texto destacado
        lg: ["clamp(1.125rem, 1rem + 0.1953vw, 1.3125rem)", { lineHeight: "1.5556" }],
        // 20 → 23 px
        xl: ["clamp(1.25rem, 1.125rem + 0.1953vw, 1.4375rem)", { lineHeight: "1.4" }],
        // 36 → 44 px · titulares de sección
        "4xl": ["clamp(2.25rem, 1.9167rem + 0.5208vw, 2.75rem)", { lineHeight: "1.1111" }],
        // 48 → 60 px · H1 de páginas interiores y cifras .dato grandes
        "5xl": ["clamp(3rem, 2.5rem + 0.7813vw, 3.75rem)", { lineHeight: "1" }],
        // 60 → 76 px · sin uso hoy; queda listo y coherente con la escala
        "6xl": ["clamp(3.75rem, 3.0833rem + 1.0417vw, 4.75rem)", { lineHeight: "1" }],
        // 40 → 56 px · exclusivo del H1 del hero. Bajó de 56-72 el 29-ago porque a
        // 1512 px la segunda frase se partía en dos y el hero quedaba de tres
        // líneas: apilado. Con este tamaño cada frase cabe entera en su renglón.
        // congelado desde 1024. Clave propia para no pisar ninguna de fábrica.
        hero: ["clamp(2.5rem, 1.9rem + 0.8vw, 3.5rem)", { lineHeight: "1.07" }],
      },
      fontFamily: {
        // 'Manrope Fallback' va SEGUNDA, antes de system-ui: es Arial con las
        // métricas de Manrope calcadas (ver fonts.css). Si la fuente real no
        // llega a tiempo, el diseño no desencaja. system-ui queda de último
        // recurso porque sus métricas varían por sistema operativo.
        sans: ["Manrope", "Manrope Fallback", "system-ui", "Arial", "sans-serif"],
        // Cifras: la misma pila que --font-dato (redefinida en global.css).
        // `font-mono` y `.dato` deben renderizar idéntico.
        mono: ["IBM Plex Mono", "IBM Plex Mono Fallback", "ui-monospace", "SF Mono", "Menlo", "monospace"],
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

// ── POR QUÉ LA LANDING NO USA LA ESCALA DE tokens.css ──────────────────────
//
// Decisión de ago-2026 (docs/auditoria-responsive-2026-08-03.md). Si vienes a
// "arreglar" esto porque parece que la web ignora el sistema de diseño: es a
// propósito, y esto es lo que hay que saber antes de tocarlo.
//
// 1. Los --fs-* de tokens.css topan entre 992 px y 1493 px de viewport. Están
//    calculados para móvil → portátil. Por encima de ~1500 px no responden, que
//    es justo el problema que este archivo resuelve.
//
// 2. tokens.css está marcado GENERADO: lo pisa contradar-design/sync-tokens.sh
//    sin avisar. Cualquier fluidez escrita allí se pierde en la próxima
//    sincronización. Por eso vive aquí, en un archivo que es sólo de la landing.
//
// 3. La app NO comparte esta escala y no debe compartirla. La landing es un
//    documento de lectura: más ancho = contenido más grande. La app es una
//    herramienta de datos: más ancho = MÁS contenido (más filas, más columnas),
//    no letras más grandes. Escalar tipografía con vw en sus tablas rompería la
//    alineación tabular que protegen .dato y font-variant-numeric.
//    El ancho desaprovechado de la app va por ticket aparte.
//
// Si algún día esta escala se valida en pantalla grande y se quiere promover al
// sistema, el sitio correcto es contradar-design/tokens.css como familia propia
// (--fs-mkt-*), NUNCA sobrescribiendo los --fs-* que consume la app.
