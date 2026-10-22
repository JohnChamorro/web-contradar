import type { DatoGuia } from "../datos-guias";

/* Guía /guias/capacidad-residual/. Consulta cr-plazo-obra en
   docs/seo/consultas-fase-2.md (ronda SEO 2). Nace en null: se publica cuando
   John la corre en producción (en dev el 22-oct dio 96,2 %, n = 17.311). */
export default {
  "cr-plazo-obra": {
    frase: "{valor} de los contratos de obra pública firmados en 2025 tuvo un plazo de 12 meses o menos: en esos procesos el K no se prorratea y te exigen el presupuesto entero, menos el anticipo.",
    valor: null,
    muestra: null,
    periodo: "contratos de obra firmados en 2025, SECOP I y II",
    consulta: "cr-plazo-obra",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
