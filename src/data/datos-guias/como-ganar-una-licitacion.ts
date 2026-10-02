import type { DatoGuia } from "../datos-guias";

/* Guía /guias/como-ganar-una-licitacion/. Nace en null: se llena cuando se
   corra la consulta del mismo id de docs/seo/consultas-fase-2.md en
   producción. Solo contratos ADJUDICADOS (cobertura validada); nada de
   ofertados ni tasas de éxito mientras la puerta G6 no esté verde. */
export default {
  "cg-adiciones-share": {
    frase: "{valor} de los contratos estatales tuvieron al menos una adición en valor.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados entre 2018 y 2024",
    consulta: "cg-adiciones-share",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
