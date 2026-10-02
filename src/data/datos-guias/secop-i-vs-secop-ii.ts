import type { DatoGuia } from "../datos-guias";

/* Guía /guias/secop-i-vs-secop-ii/. Nace en null: se llena cuando se corra la
   consulta del mismo id de docs/seo/consultas-fase-2.md en producción. */
export default {
  "secop-share-secop-i": {
    frase: "{valor} de los contratos del año se publicaron solo en SECOP I.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025",
    consulta: "secop-share-secop-i",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
