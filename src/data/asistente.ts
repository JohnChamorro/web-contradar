/* Asistente de la web «Pregúntale a ContRadar» (5-nov-2026). Todo lo que se
   edita a mano vive aquí: nombre, textos del globo por página y el video.
   Precios y límites NO: salen de data/producto.ts, la misma fuente de /precios.
   Diseño y reglas: contradar/docs/asistente/diseno.md. */

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
 *  sección). Como el acompañante de la portada que reemplazó el asistente, pero
 *  en la voz «nosotros». Una sección sin texto aquí deja el de la página. */
export const GLOBOS_SECCION: Record<string, string> = {
  "asi-funciona": "¿Quieres verlo con una licitación tuya?",
  formatos: "Esto nos toma minutos. ¿Te mostramos cómo?",
  inteligencia: "¿Te decimos contra quién compites?",
  alertas: "¿Qué licitaciones hay hoy para ti?",
  modulos: "¿Cuál de estos te sirve más?",
  proceso: "Te acompañamos hasta la liquidación.",
  "para-quien": "¿A cuál te pareces? Cuéntanos.",
  precios: "¿Qué plan te sirve? Son 2 preguntas.",
  nosotros: "¿Quieres hablar con alguien del equipo?",
  faq: "¿Otra duda? Pregúntanos.",
};

/** El rezago de la fuente: el MISMO texto de /producto/busquedas/. */
export const REZAGO =
  "Trabajamos con los datos abiertos del SECOP, que se actualizan una vez al día, así que lo normal es ver una licitación al día siguiente de publicada.";

/** Video corto de «cómo llenamos los formatos». PENDIENTE: todavía no existe;
    con `null` el panel muestra un espacio reservado marcado como pendiente.
    Cuando exista: { mp4: "/capturas/formatos.mp4", poster: "/capturas/formatos.webp" }. */
export const VIDEO_FORMATOS: { mp4: string; poster: string } | null = null;

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
