import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/agua-y-saneamiento/. Nacen en null: los mide John en producción con
   la consulta del mismo id (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada.
   Universo: al menos un código UNSPSC de la clase 83101500 o de los productos 72141119, 72141120, 72141121 y 72141125 (los de src/data/sectores.ts).
   Ventana: contratos adjudicados entre el 2025-01-01 y el 2025-12-31, SECOP I y II.
   Mediana, nunca promedio (regla de la casa). */
export default {
  "sector-agua-y-saneamiento-contratos-2025": {
    frase: "En 2025 el Estado adjudicó {valor} contratos de agua y saneamiento entre SECOP I y SECOP II.",
    valor: null,
    muestra: null,
    periodo: "contratos adjudicados en 2025",
    consulta: "sector-agua-y-saneamiento-contratos-2025",
    medido: null,
  },
  "sector-agua-y-saneamiento-mediana-2025": {
    frase: "La mediana de los contratos de agua y saneamiento adjudicados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos adjudicados en 2025",
    consulta: "sector-agua-y-saneamiento-mediana-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
