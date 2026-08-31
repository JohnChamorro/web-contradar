/**
 * Las ocho caras latinas, en base64, para incrustarlas en el <head>.
 *
 * POR QUÉ VUELVEN AQUÍ (31-ago-2026, tercera vez que John reporta el mismo
 * síntoma). Estaban incrustadas, se movieron a public/fonts/caras.css —una
 * hoja enlazada y cacheable— para que el HTML no engordara, y con eso volvió
 * el salto del encabezado.
 *
 * La razón, medida cuadro a cuadro sobre producción a 3 Mbps con la caché
 * desactivada: caras.css termina de llegar a los 772 ms, y la fuente no se
 * aplica hasta los 1089 ms. En esos 317 ms el navegador MAQUETA con las
 * métricas del respaldo, y al aplicarse Manrope todo se recoloca:
 *
 *     1003 ms   nav = 589   grupo derecho = 206   «Precios» en x=542,6
 *     1089 ms   nav = 611   grupo derecho = 214   «Precios» en x=533,6
 *
 * Nueve píxeles. Poco, pero en el encabezado se ve, y es lo primero que mira
 * quien entra.
 *
 * Se intentó cerrar el hueco afinando las métricas del respaldo por peso. No
 * alcanza y no puede alcanzar: `size-adjust` escala TODO por igual, y la
 * diferencia entre Arial y Manrope es por glifo — medido sobre el propio menú,
 * «Precios» necesita ×1,013 y «Diagnóstico gratis» ×1,069. Ningún valor único
 * sirve para los dos.
 *
 * Con las caras en el HTML no hay hueco que cerrar: el navegador las conoce al
 * parsear y decodifica antes de la primera maquetación. Cuando estuvieron así,
 * el medidor de saltos dio CERO en cuatro corridas.
 *
 * EL PRECIO, dicho claro: ~170 KB por página que antes se cacheaban entre
 * páginas. Es el coste de que el encabezado no se mueva, y es una decisión de
 * producto, no una optimización: la web es la primera impresión y las páginas
 * se sirven desde el borde de Cloudflare.
 *
 * Esto corre en build. `node:fs` no llega al navegador.
 */
import fs from "node:fs";

/** Subconjunto `latin` de Google Fonts — el mismo que traen los .woff2. */
const RANGO_LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC," +
  "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193," +
  "U+2212,U+2215,U+FEFF,U+FFFD";

const CARAS: { archivo: string; familia: string; peso: number }[] = [
  { archivo: "manrope-400-latin.woff2", familia: "Manrope", peso: 400 },
  { archivo: "manrope-500-latin.woff2", familia: "Manrope", peso: 500 },
  { archivo: "manrope-600-latin.woff2", familia: "Manrope", peso: 600 },
  { archivo: "manrope-700-latin.woff2", familia: "Manrope", peso: 700 },
  { archivo: "manrope-800-latin.woff2", familia: "Manrope", peso: 800 },
  // Las cifras (.dato) son media web: si parpadean, parpadean todos los
  // montos, scores y fechas del sitio.
  { archivo: "ibm-plex-mono-latin-400-normal.woff2", familia: "IBM Plex Mono", peso: 400 },
  { archivo: "ibm-plex-mono-latin-500-normal.woff2", familia: "IBM Plex Mono", peso: 500 },
  { archivo: "ibm-plex-mono-latin-600-normal.woff2", familia: "IBM Plex Mono", peso: 600 },
];

function cara(c: (typeof CARAS)[number]): string {
  const ruta = new URL(`../../public/fonts/${c.archivo}`, import.meta.url);
  const b64 = fs.readFileSync(ruta).toString("base64");
  return (
    "@font-face{font-family:'" + c.familia + "';font-style:normal;font-weight:" + c.peso +
    ";font-display:block;src:url(data:font/woff2;base64," + b64 +
    ") format('woff2');unicode-range:" + RANGO_LATIN + "}"
  );
}

export const CARAS_CRITICAS: string = CARAS.map(cara).join("");
