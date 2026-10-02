import type { DatoGuia } from "../datos-guias";

/* Guía /guias/seleccion-abreviada/. Nace en null: se llena cuando se corra la
   consulta del mismo id de docs/seo/consultas-fase-2.md en producción. */
export default {
  "sa-desvio-subasta": {
    frase: "En subasta inversa, la mediana de la diferencia entre el valor adjudicado y el presupuesto oficial fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "procesos de subasta inversa adjudicados en 2025 en SECOP II",
    consulta: "sa-desvio-subasta",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
