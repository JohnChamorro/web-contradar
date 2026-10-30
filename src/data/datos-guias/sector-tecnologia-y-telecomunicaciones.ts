import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/tecnologia-y-telecomunicaciones/. Nacen en null: los mide John en producción con la
   consulta sectores-2025 (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada. Sin prestación de servicios. Mediana, nunca
   promedio. Solo SECOP II: SECOP I guarda el UNSPSC solo a nivel de segmento (todo 81000000), así que no permite separar estas familias. En dev el 30-oct: 5.588 contratos; $45 M. */
export default {
  "sector-tecnologia-y-telecomunicaciones-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos de tecnología y telecomunicaciones (UNSPSC 32, 43, 8111 y 8112) en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
  "sector-tecnologia-y-telecomunicaciones-mediana-2025": {
    frase: "La mediana del valor de los contratos de tecnología y telecomunicaciones (UNSPSC 32, 43, 8111 y 8112) firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
