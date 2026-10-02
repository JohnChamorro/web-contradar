import type { DatoGuia } from "../datos-guias";

/* Guía /guias/consorcios-y-uniones-temporales/. Nace en null: se llena cuando
   se corra la consulta del mismo id de docs/seo/consultas-fase-2.md en
   producción. */
export default {
  "cuut-share-obra": {
    frase: "{valor} de los contratos de obra pública se adjudicaron a consorcios y uniones temporales.",
    valor: null,
    muestra: null,
    periodo: "contratos de obra firmados en 2025 en SECOP II",
    consulta: "cuut-share-obra",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
