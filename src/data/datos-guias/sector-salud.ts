import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/salud/. Nacen en null: los mide John en producción con la
   consulta sectores-2025 (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada. Sin prestación de servicios. Mediana, nunca
   promedio. SECOP I y II por segmento UNSPSC. Los montos no son equivalentes, por eso la mediana va por plataforma. En dev el 30-oct: 20.248 + 2.233 contratos; $18 M y $13 M. */
export default {
  "sector-salud-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de bienes y servicios de salud (UNSPSC 42, 51 y 85) en SECOP I y II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP I y II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
  "sector-salud-mediana-2025": {
    frase: "La mediana del valor de los contratos de bienes y servicios de salud (UNSPSC 42, 51 y 85) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP I y II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
