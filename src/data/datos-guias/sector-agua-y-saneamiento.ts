import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/agua-y-saneamiento/. Nacen en null: los mide John en producción con la
   consulta sectores-2025 (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada. Sin prestación de servicios. Mediana, nunca
   promedio. Solo SECOP II: SECOP I guarda el UNSPSC solo a nivel de segmento, así que no permite separar estos códigos. En dev el 30-oct: 1.163 contratos; $194 M. Solo lo codificado con los UNSPSC de agua, no toda la obra del sector. */
export default {
  "sector-agua-y-saneamiento-contratos-2025": {
    frase: "En 2025 se firmaron {valor} contratos con códigos UNSPSC de acueducto, alcantarillado y tratamiento de agua en SECOP II, sin contar prestación de servicios.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
  "sector-agua-y-saneamiento-mediana-2025": {
    frase: "La mediana del valor de los contratos con códigos UNSPSC de acueducto, alcantarillado y tratamiento de agua firmados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025 en SECOP II, sin prestación de servicios",
    consulta: "sectores-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
