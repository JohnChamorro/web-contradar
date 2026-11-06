/* Asistente de la web «Pregúntale a ContRadar» (5-nov-2026). Todo lo que se
   edita a mano vive aquí: nombre, textos del globo por página y el video.
   Precios y límites NO: salen de data/producto.ts, la misma fuente de /precios.
   Diseño y reglas: contradar/docs/asistente/diseno.md. */

import { PRUEBA } from "./producto";

/** Nombre visible del asistente. Uno solo en todo el repo. */
export const ASISTENTE_NOMBRE = "Pregúntale a ContRadar";

/** Texto del globo de invitación por página (ruta con barra final). */
export const GLOBOS: Record<string, string> = {
  "/": "¿Hay licitaciones para tu empresa hoy?",
  "/precios/": "¿Qué plan te sirve? Son 2 preguntas.",
  "/funcionalidades/": "¿Te mostramos cómo llenamos los formatos?",
};
export const GLOBO_POR_DEFECTO = "¿En qué te ayudamos?";

/** El globo cambia, sutil, según la sección que se está leyendo (id de la
 *  sección). Son los textos de Radar del acompañante de la portada (Web Radar,
 *  5-nov-2026), tal cual: John los quiere de vuelta (5-nov-2026). Una sección sin
 *  texto aquí deja el de la anterior; antes de la primera, el de la página. */
export const GLOBOS_SECCION: Record<string, string> = {
  formatos: "Esto me toma minutos. A ti, una noche.",
  "asi-funciona": "Esto lo hago yo en un minuto.",
  inteligencia: "Antes de ofertar, mira esto.",
  modulos: "Y esto también es trabajo mío.",
  proceso: "Te acompaño hasta la liquidación.",
  "para-quien": "¿A cuál te pareces?",
  precios: `${PRUEBA.dias} días gratis, sin tarjeta.`,
  nosotros: "Ellos me enseñaron todo.",
  faq: "¿Otra duda? Pregúntame.",
};

/** El rezago de la fuente: el MISMO texto de /producto/busquedas/. */
export const REZAGO =
  "Trabajamos con los datos abiertos del SECOP, que se actualizan una vez al día, así que lo normal es ver una licitación al día siguiente de publicada.";

/** Video de «cómo llenamos los formatos» (44 s, sin sonido), grabado en la app
    el 5-nov-2026 con una empresa de EJEMPLO inventada (Cordillera del Sur S.A.S.,
    NIT 901234567, representante «Ana Gómez») sobre una licitación pública real
    de Arauca. La espera del llenado va a 8×. Con `null` el panel muestra un
    espacio reservado. */
export const VIDEO_FORMATOS: { mp4: string; poster: string } | null = {
  mp4: "/capturas/formatos-llenado.mp4",
  poster: "/capturas/formatos-llenado.webp",
};

/** Recomendador de planes: las respuestas y lo que piden. */
export const PERSONAS = [
  { etiqueta: "Solo yo", n: 1 },
  { etiqueta: "2 personas", n: 2 },
  { etiqueta: "3 a 5", n: 5 },
  { etiqueta: "6 a 15", n: 15 },
  { etiqueta: "Más de 15", n: 16 },
] as const;
export const PROPUESTAS = [
  { etiqueta: "1 al mes", n: 1 },
  { etiqueta: "2 a 5", n: 5 },
  { etiqueta: "6 a 30", n: 30 },
  { etiqueta: "Más de 30", n: 31 },
] as const;
