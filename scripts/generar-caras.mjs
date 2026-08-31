/**
 * Genera public/fonts/caras.css: las ocho caras latinas de Manrope e IBM Plex
 * Mono incrustadas en base64.
 *
 * POR QUÉ UNA HOJA APARTE Y NO INCRUSTADO EN EL HTML (30-ago-2026):
 * incrustarlo en cada página mataba el parpadeo pero engordaba el HTML de 73 KB
 * a ~196 KB COMPRIMIDOS, y encima se re-descargaba en cada navegación —antes
 * los .woff2 se cacheaban entre páginas—. Una hoja enlazada en el <head> es
 * render-blocking, así que el navegador tampoco pinta antes de tenerla: mismo
 * resultado visual, pero se cachea una vez y las demás páginas la sacan de
 * caché al instante.
 *
 * `font-display: optional` y no `block`: la fuente viene en el propio CSS, sin
 * red de por medio, así que entra de sobra en la ventana de ~100 ms que da
 * `optional` y se aplica YA en el primer trazado. Con `block` el navegador
 * maquetaba con las métricas del respaldo y recolocaba al llegar Manrope —el
 * menú crecía 36 px y los títulos saltaban a la izquierda, que es justo lo que
 * John vio con Ctrl+Shift+R—.
 *
 * Se ejecuta a mano cuando cambien los .woff2:  node scripts/generar-caras.mjs
 * El resultado se commitea, así que el build no depende de este script.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = new URL("../public/fonts/", import.meta.url);
const RANGO_LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC," +
  "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193," +
  "U+2212,U+2215,U+FEFF,U+FFFD";

const CARAS = [
  ["manrope-400-latin.woff2", "Manrope", 400],
  ["manrope-500-latin.woff2", "Manrope", 500],
  ["manrope-600-latin.woff2", "Manrope", 600],
  ["manrope-700-latin.woff2", "Manrope", 700],
  ["manrope-800-latin.woff2", "Manrope", 800],
  ["ibm-plex-mono-latin-400-normal.woff2", "IBM Plex Mono", 400],
  ["ibm-plex-mono-latin-500-normal.woff2", "IBM Plex Mono", 500],
  ["ibm-plex-mono-latin-600-normal.woff2", "IBM Plex Mono", 600],
];

const cabecera = `/* GENERADO por scripts/generar-caras.mjs — no editar a mano.
   Las caras latinas van en base64 para que no haya ninguna petición de fuente
   que pueda llegar tarde: el navegador no pinta hasta tener esta hoja, así que
   el texto nace con la tipografía definitiva. Las latin-ext siguen siendo
   archivos sueltos y a demanda (ver src/styles/fonts.css). */\n`;

const css =
  cabecera +
  CARAS.map(([archivo, familia, peso]) => {
    const b64 = fs.readFileSync(new URL(archivo, DIR)).toString("base64");
    return (
      `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};` +
      `font-display:optional;src:url(data:font/woff2;base64,${b64}) format('woff2');` +
      `unicode-range:${RANGO_LATIN}}`
    );
  }).join("\n");

const salida = new URL("caras.css", DIR);
fs.writeFileSync(salida, css);
console.log(`caras.css: ${(css.length / 1024).toFixed(0)} KB · ${CARAS.length} caras`);
