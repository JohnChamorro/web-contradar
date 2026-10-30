/**
 * BANDERA DEL LANZAMIENTO DE NOVIEMBRE.
 *
 * Lo nuevo de la app —lee el pliego, pregúntale al pliego, formatos listos,
 * oferta económica, aliados, vencimientos y calendario— no se anuncia hasta que
 * esté en PRD. La bandera se lee al compilar: `LANZAMIENTO_NOV=1` en las
 * variables del despliegue de Cloudflare Pages. Apagada, esas páginas no se
 * generan y ningún texto las nombra. Orden: docs/rediseno/runbook.md.
 *
 * Telegram NO entra aquí: no se anuncia hasta que exista el bot, con la bandera
 * encendida o apagada.
 */
const valor = String(import.meta.env.LANZAMIENTO_NOV ?? process.env.LANZAMIENTO_NOV ?? "").trim();

export const LANZAMIENTO_NOV = valor === "1" || valor === "true";

/** Elige el texto según la bandera, para no repetir el ternario en cada frase. */
export const nov = <T,>(nuevo: T, actual: T): T => (LANZAMIENTO_NOV ? nuevo : actual);
