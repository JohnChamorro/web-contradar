import type { DatoGuia } from "../datos-guias";

/* Guía /guias/que-es-el-paa/. Consulta paa-lineas-2026 de
   docs/seo/consultas-fase-2.md: solo la última versión del plan de cada entidad,
   porque contar todas las versiones duplica (en dev, 2,85 M de filas de SECOP II
   contra 1,08 M reales). Nace en null. */
export default {
  "paa-lineas-2026": {
    frase: "Los planes anuales de 2026 suman {valor} líneas de compra en SECOP I y II.",
    valor: null,
    muestra: null,
    periodo: "último plan 2026 de cada entidad",
    consulta: "paa-lineas-2026",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
