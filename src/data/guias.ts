/**
 * REGISTRO DE GUÍAS (seo/fase-2). Una entrada por guía publicada en
 * /guias/<slug>/. Lo leen el índice de guías, la página pilar
 * (/licitaciones-colombia/), el pie y los bloques de «guías relacionadas».
 *
 * La intención de búsqueda de cada guía está en docs/seo/mapa-keywords.md:
 * dos guías no pueden perseguir la misma palabra (canibalización).
 */

export type Etapa = "empezar" | "habilitarse" | "ofertar" | "herramientas";

export interface Guia {
  slug: string;
  /** Titular corto para tarjetas y enlaces. */
  titulo: string;
  /** Una línea para la tarjeta. */
  resumen: string;
  etapa: Etapa;
}

export const ETAPAS: Record<Etapa, string> = {
  empezar: "Empezar a licitar",
  habilitarse: "Habilitarte",
  ofertar: "Ofertar y ganar",
  herramientas: "Herramientas",
};

export const GUIAS: Guia[] = [
  {
    slug: "como-buscar-licitaciones-en-secop",
    titulo: "Cómo buscar licitaciones en SECOP",
    resumen: "Paso a paso para encontrar procesos en SECOP I y II: filtros, UNSPSC y los errores que cuestan contratos.",
    etapa: "empezar",
  },
  {
    slug: "secop-i-vs-secop-ii",
    titulo: "SECOP I vs. SECOP II",
    resumen: "Qué se publica en cada plataforma, por qué siguen conviviendo y dónde mirar para no perder procesos.",
    etapa: "empezar",
  },
  {
    slug: "que-es-el-paa",
    titulo: "Qué es el PAA y cómo aprovecharlo",
    resumen: "El Plan Anual de Adquisiciones te dice qué planea comprar el Estado, meses antes de que abra la licitación.",
    etapa: "empezar",
  },
  {
    slug: "minima-cuantia",
    titulo: "Mínima cuantía",
    resumen: "La modalidad más frecuente del Estado: tope, plazos, cómo se evalúa y por qué gana el precio más bajo.",
    etapa: "empezar",
  },
  {
    slug: "seleccion-abreviada",
    titulo: "Selección abreviada",
    resumen: "Menor cuantía, subasta inversa y acuerdos marco: cuándo aplica cada una y cómo se compite.",
    etapa: "empezar",
  },
  {
    slug: "que-es-el-rup",
    titulo: "Qué es el RUP y cómo actualizarlo",
    resumen: "El Registro Único de Proponentes: qué certifica, cuándo renovarlo y los errores que te inhabilitan.",
    etapa: "habilitarse",
  },
  {
    slug: "requisitos-habilitantes",
    titulo: "Requisitos habilitantes",
    resumen: "Capacidad jurídica, financiera, organizacional y experiencia: qué piden y cómo se verifican.",
    etapa: "habilitarse",
  },
  {
    slug: "capacidad-residual",
    titulo: "Capacidad residual (K)",
    resumen: "Cómo se calcula el K de contratación en obra pública, con la metodología de Colombia Compra Eficiente.",
    etapa: "habilitarse",
  },
  {
    slug: "consorcios-y-uniones-temporales",
    titulo: "Consorcios y uniones temporales",
    resumen: "Diferencias de responsabilidad, cómo se suman la experiencia y los indicadores, y qué firmar antes.",
    etapa: "habilitarse",
  },
  {
    slug: "poliza-de-seriedad-de-la-oferta",
    titulo: "Póliza de seriedad de la oferta",
    resumen: "Cuánto debe cubrir, por cuánto tiempo y los errores en la garantía que descalifican una oferta.",
    etapa: "ofertar",
  },
  {
    slug: "como-calcular-la-oferta-economica",
    titulo: "Cómo calcular la oferta económica",
    resumen: "Del presupuesto oficial al precio que presentas: AIU, imprevistos, redondeos y el riesgo de precio artificialmente bajo.",
    etapa: "ofertar",
  },
  {
    slug: "como-ganar-una-licitacion",
    titulo: "Cómo ganar una licitación",
    resumen: "Qué decide una adjudicación en Colombia y qué puedes controlar antes de ofertar.",
    etapa: "ofertar",
  },
  {
    slug: "mejores-apps-licitaciones-colombia",
    titulo: "Mejores apps de licitaciones en Colombia",
    resumen: "Comparativa con información pública: qué hace cada plataforma, qué no hace y cuánto cuesta.",
    etapa: "herramientas",
  },
];

export const guia = (slug: string) => {
  const g = GUIAS.find((x) => x.slug === slug);
  if (!g) throw new Error(`Guía no registrada en src/data/guias.ts: ${slug}`);
  return g;
};
