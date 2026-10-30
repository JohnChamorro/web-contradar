import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/construccion/. Nacen en null: los mide John en producción con la
   consulta sectores-2025 (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada. Sin prestación de servicios. Mediana, nunca
   promedio. SECOP I y II por segmento UNSPSC. Los montos no son equivalentes, por eso la mediana va por plataforma. En dev el 30-oct: 14.932 + 9.788 contratos; $91 M y $40 M. */
export default {
  "sector-construccion-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de obra y materiales de construcción (UNSPSC 22, 30, 72 y 95) en SECOP I y II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP I y II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
  "sector-construccion-mediana-2025": {
    frase: "La mediana del valor de los contratos de obra y materiales de construcción (UNSPSC 22, 30, 72 y 95) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP I y II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
