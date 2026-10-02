import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/tecnologia-y-telecomunicaciones/. Nacen en null: los mide John en producción con
   la consulta del mismo id (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada.
   Universo: sector oficial de la entidad = Tecnologías de la información y las comunicaciones (misma definición que el hub).
   Ventana: contratos adjudicados entre el 2025-01-01 y el 2025-12-31, SECOP I y II.
   Mediana, nunca promedio (regla de la casa). */
export default {
  "sector-tecnologia-y-telecomunicaciones-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de tecnología y telecomunicaciones (UNSPSC 32, 43, 8111 y 8112) en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-tecnologia-y-telecomunicaciones-contratos-2025",
    medido: null,
  },
  "sector-tecnologia-y-telecomunicaciones-mediana-2025": {
    frase: "La mediana del valor de los contratos de tecnología y telecomunicaciones (UNSPSC 32, 43, 8111 y 8112) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sector-tecnologia-y-telecomunicaciones-mediana-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
