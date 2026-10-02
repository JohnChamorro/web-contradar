import type { DatoGuia } from "../datos-guias";

/* Datos de /sectores/salud/. Nacen en null: los mide John en producción con
   la consulta del mismo id (docs/seo/consultas-fase-2.md) y hasta entonces
   <DatoContRadar> no pinta nada.
   Universo: sector oficial de la entidad = Salud y protección social (misma definición que el hub).
   Ventana: contratos adjudicados entre el 2025-01-01 y el 2025-12-31, SECOP I y II.
   Mediana, nunca promedio (regla de la casa). */
export default {
  "sector-salud-contratos-2025": {
    frase: "En 2025 el Estado adjudicó {valor} contratos de entidades del sector salud entre SECOP I y SECOP II.",
    valor: null,
    muestra: null,
    periodo: "contratos adjudicados en 2025",
    consulta: "sector-salud-contratos-2025",
    medido: null,
  },
  "sector-salud-mediana-2025": {
    frase: "La mediana de los contratos de entidades del sector salud adjudicados en 2025 fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "contratos adjudicados en 2025",
    consulta: "sector-salud-mediana-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
