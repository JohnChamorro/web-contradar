import type { DatoGuia } from "../datos-guias";

/* Guía /guias/como-ganar-una-licitacion/. Consulta cg-adiciones-share de
   docs/seo/consultas-fase-2.md, corrida por John en producción el
   2-oct-2026. Se publica SOLO la fila de SECOP II: SECOP I mide otra cosa
   (9,1 % sobre 4.630.404 contratos 2018-2024, con otra definición) y la fila
   AMBAS mezcla las dos. */
export default {
  "cg-adiciones-share": {
    frase: "En SECOP II, {valor} de los contratos ya cerrados terminó valiendo más de lo adjudicado; en obra, el 47,8 % (16.301 contratos).",
    valor: "35,0 %",
    muestra: "230.987 contratos",
    periodo: "contratos firmados entre 2020 y 2024 y ya cerrados, con valor adjudicado conocido",
    consulta: "cg-adiciones-share",
    medido: "2026-10-02",
  },
} satisfies Record<string, DatoGuia>;
