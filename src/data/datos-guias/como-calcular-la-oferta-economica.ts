import type { DatoGuia } from "../datos-guias";

/* Guía /guias/como-calcular-la-oferta-economica/. Nace en null: se llena
   cuando se corra la consulta del mismo id de docs/seo/consultas-fase-2.md en
   producción. `valor` es una lista corta ya formateada, una modalidad por
   tramo (p. ej. «licitación pública, −x %; selección abreviada de menor
   cuantía, −y %; mínima cuantía, −z %»). */
export default {
  "oe-desvio-por-modalidad": {
    frase: "Mediana de la diferencia entre el valor adjudicado y el presupuesto oficial, por modalidad: {valor}.",
    valor: null,
    muestra: null,
    periodo: "procesos adjudicados en 2025",
    consulta: "oe-desvio-por-modalidad",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
