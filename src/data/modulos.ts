/* Los módulos del producto, ordenados por CUÁNDO entran en la vida de una
   licitación. Lo usan /funcionalidades/ (el índice) y «Sigue con» al pie de cada
   página de producto (components/ModulosRelacionados.astro). Cada módulo tiene su
   miniatura en public/capturas/indice/{slug}. */

export interface Modulo { slug: string; href: string; t: string; d: string }
export interface Momento { momento: string; cuando: string; modulos: Modulo[] }

export const arco: Momento[] = [
  {
    momento: "Antes del pliego",
    cuando: "Meses antes de que el proceso exista",
    modulos: [
      { slug: "paa", href: "/producto/busquedas/#paa", t: "Plan anual (PAA)", d: "Lo que el Estado planea comprar, meses antes de publicarlo." },
      { slug: "sondeos", href: "/producto/busquedas/#sondeos", t: "Sondeos (RFI)", d: "Cuando la entidad sale a preguntarle al mercado." },
    ],
  },
  {
    momento: "Cuando sale",
    cuando: "El proceso se publica y hay que decidir",
    modulos: [
      { slug: "busquedas", href: "/producto/busquedas/", t: "Búsquedas automáticas", d: "SECOP I y II cada día, con un puntaje de 0 a 100." },
      { slug: "estadistica", href: "/producto/estadistica-de-la-licitacion/", t: "Estadística de la licitación", d: "Cuánto bajan las ganadoras, quién oferta y en cuánto paga la entidad." },
      { slug: "competencia", href: "/producto/analisis-de-competencia/", t: "Análisis de competencia", d: "Empresas, contratantes y tu mercado." },
      { slug: "ia", href: "/inteligencia/", t: "Asistente IA", d: "Lee el pliego, responde con la página y llena los formatos." },
    ],
  },
  {
    momento: "Cuando ya es tuyo",
    cuando: "De la propuesta a la liquidación",
    modulos: [
      { slug: "mis-licitaciones", href: "/producto/mis-licitaciones/", t: "Mis licitaciones", d: "Cada proceso con su responsable, hasta la adjudicación." },
      { slug: "mis-contratos", href: "/producto/mis-contratos/", t: "Mis contratos", d: "Del acta de inicio a la liquidación, con la K al día." },
      { slug: "calendario", href: "/producto/calendario/", t: "Calendario", d: "Cierres, pólizas, pagos y las fechas del equipo." },
    ],
  },
  {
    momento: "Todo el tiempo",
    cuando: "Lo que cambia, te llega",
    modulos: [
      { slug: "avisos", href: "/producto/notificaciones/", t: "Avisos", d: "Campana y correo: adendas, cierres, resultados y vencimientos." },
    ],
  },
];

/** Todos, en orden, sin repetir página (PAA y Sondeos viven dentro de Búsquedas). */
export const MODULOS: Modulo[] = arco.flatMap((m) => m.modulos);
