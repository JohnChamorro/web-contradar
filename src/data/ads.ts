/**
 * LANDINGS DE GOOGLE ADS (ronda SEO 2, 22-oct-2026). Una por intención de
 * docs/seo/google-ads.md. Van con noindex y fuera del sitemap: existen para
 * que el anuncio caiga en una página que repite su promesa, no para competir
 * con la home ni con /producto/* en orgánico (una intención = una URL).
 *
 * Cada frase sale de lo que ya publica el sitio (producto.ts, content.ts y
 * las páginas de /producto/). Si el producto cambia, se cambia allá y aquí.
 */
export interface LandingAds {
  slug: string;
  /** <title>: no se indexa, pero es lo que se ve en la pestaña. */
  title: string;
  h1: string;
  bajada: string;
  puntos: { t: string; d: string; href: string }[];
  /** Qué CTA va primero: la prueba o el diagnóstico por NIT. */
  primero: "prueba" | "diagnostico";
  /** Texto prellenado del WhatsApp. */
  whatsapp: string;
}

export const LANDINGS_ADS: LandingAds[] = [
  {
    slug: "plataforma-licitaciones",
    title: "Plataforma de licitaciones para el SECOP · ContRadar",
    h1: "La plataforma para preparar licitaciones del SECOP",
    bajada:
      "Encuentra los procesos que encajan con tu empresa, mira a qué precio se adjudica en tu sector y tu zona y contra quién compites, y lleva cada licitación y cada contrato con tu equipo.",
    puntos: [
      { t: "Búsquedas automáticas", d: "SECOP I y II cada mañana en tu correo, con puntaje de 0 a 100 según tu empresa.", href: "/producto/busquedas/" },
      { t: "Estadística de la licitación", d: "A qué precio se adjudica en tu sector y tu zona. Por entidad, en el plan Dominio.", href: "/producto/estadistica-de-la-licitacion/" },
      { t: "Análisis de competencia", d: "Qué contratos ganó cada empresa, con qué entidades, a qué precio y con quién se asocia.", href: "/producto/analisis-de-competencia/" },
      { t: "Mis licitaciones y Mis contratos", d: "Un tablero compartido por proceso y el calendario de cada contrato, con sus hitos y sus pólizas.", href: "/producto/mis-licitaciones/" },
    ],
    primero: "prueba",
    whatsapp: "Hola, vi el anuncio de ContRadar y quiero saber cómo funciona la plataforma.",
  },
  {
    slug: "alertas-secop",
    title: "Alertas de licitaciones del SECOP · ContRadar",
    h1: "Alertas de licitaciones del SECOP I y II en tu correo, cada mañana",
    bajada:
      "Configura tu búsqueda una vez y recibe solo los procesos que encajan con tu sector, tu zona y tu rango de valor, incluidos los que el portal nombra distinto.",
    puntos: [
      { t: "SECOP I y SECOP II", d: "Las dos plataformas en la misma alerta: no dependes de saber dónde publica cada entidad.", href: "/guias/secop-i-vs-secop-ii/" },
      { t: "Puntaje de 0 a 100", d: "Cada proceso llega calificado según el perfil de tu empresa, para leer primero lo que más encaja.", href: "/producto/busquedas/" },
      { t: "Avisos de lo que cambia", d: "Adendas, paso a evaluación y vencimientos, por correo y en la app.", href: "/producto/notificaciones/" },
    ],
    primero: "prueba",
    whatsapp: "Hola, vi el anuncio de ContRadar y quiero configurar alertas de licitaciones.",
  },
  {
    slug: "competencia",
    title: "Análisis de competencia en licitaciones · ContRadar",
    h1: "Mira contra quién compites y a qué precio se adjudica en tu zona",
    bajada:
      "Escribe tu NIT y mira gratis cuántos procesos has ganado, quién gana en tu sector y tu zona, y qué cerró sin ti. Con datos públicos del SECOP I y II.",
    puntos: [
      { t: "Quién le gana a quién", d: "Los contratos de cada competidor, con qué entidades, a qué precio y con qué socios.", href: "/producto/analisis-de-competencia/" },
      { t: "A qué precio se adjudica", d: "El desvío entre lo adjudicado y el presupuesto en tu sector y tu zona, con el número de casos detrás. Por entidad, en el plan Dominio.", href: "/producto/estadistica-de-la-licitacion/" },
      { t: "Lo que se te escapó", d: "Los procesos parecidos a los que ganas que cerraron sin tu oferta.", href: "/diagnostico/" },
    ],
    primero: "diagnostico",
    whatsapp: "Hola, vi el anuncio de ContRadar y quiero ver el análisis de competencia.",
  },
];
