import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/ingenieria-e-interventoria/. Nacen en null: los mide John en producción con la
   consulta sectores-2025 (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada. Sin prestación de servicios. Mediana, nunca
   promedio. Solo SECOP II: SECOP I guarda el UNSPSC solo a nivel de segmento (todo 81000000), así que no permite separar estas familias. En dev el 30-oct: 3.326 contratos; $146 M. */
export default {
  "sector-ingenieria-e-interventoria-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de servicios de ingeniería (UNSPSC 8110) en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
  "sector-ingenieria-e-interventoria-mediana-2025": {
    frase: "La mediana del valor de los contratos de servicios de ingeniería (UNSPSC 8110) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
