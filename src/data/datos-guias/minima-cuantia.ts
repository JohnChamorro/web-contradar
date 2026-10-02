import type { DatoGuia } from "../datos-guias";

/* Guía /guias/minima-cuantia/. Nacen en null: se llenan cuando se corra la
   consulta del mismo id de docs/seo/consultas-fase-2.md en producción. */
export default {
  "mc-participacion": {
    frase: "{valor} de los procesos adjudicados en SECOP II fueron de mínima cuantía.",
    valor: null,
    muestra: null,
    periodo: "procesos adjudicados en 2025 en SECOP II",
    consulta: "mc-participacion",
    medido: null,
  },
  "mc-desvio-mediana": {
    frase: "En mínima cuantía, la mediana de la diferencia entre el valor adjudicado y el presupuesto oficial fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "procesos de mínima cuantía adjudicados en 2025 en SECOP II",
    consulta: "mc-desvio-mediana",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
