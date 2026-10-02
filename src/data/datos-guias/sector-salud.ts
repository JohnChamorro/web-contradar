import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/salud/. Nacen en null: los mide John en producción con
   la consulta del mismo id (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada.
   Universo: sector oficial de la entidad = Salud y protección social (misma definición que el hub).
   Ventana: contratos adjudicados entre el 2025-01-01 y el 2025-12-31, SECOP I y II.
   Mediana, nunca promedio (regla de la casa). */
export default {
  "sector-salud-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de bienes y servicios de salud (UNSPSC 42, 51 y 85) en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-salud-contratos-2025",
    medido: null,
  },
  "sector-salud-mediana-2025": {
    frase: "La mediana del valor de los contratos de bienes y servicios de salud (UNSPSC 42, 51 y 85) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-salud-mediana-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
