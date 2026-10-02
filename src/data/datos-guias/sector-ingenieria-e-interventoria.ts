import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/ingenieria-e-interventoria/. Nacen en null: los mide John en producción con
   la consulta del mismo id (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada.
   Universo: tipo de contrato = Consultoría o Interventoría.
   Ventana: contratos adjudicados entre el 2025-01-01 y el 2025-12-31, SECOP I y II.
   Mediana, nunca promedio (regla de la casa). */
export default {
  "sector-ingenieria-e-interventoria-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de servicios de ingeniería (UNSPSC 8110) en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-ingenieria-e-interventoria-contratos-2025",
    medido: null,
  },
  "sector-ingenieria-e-interventoria-mediana-2025": {
    frase: "La mediana del valor de los contratos de servicios de ingeniería (UNSPSC 8110) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-ingenieria-e-interventoria-mediana-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
