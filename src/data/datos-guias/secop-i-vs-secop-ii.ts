import type { DatoGuia } from "../datos-guias";

/* Guía /guias/secop-i-vs-secop-ii/. Consulta secop-share-secop-i en
   docs/seo/consultas-fase-2.md: primero la puerta de cobertura de SECOP I
   (≥ 95 % contra f789; en dev 99,6 % el 22-oct), después el dato. Nace en
   null (en dev dio 19,2 %, n = 1.301.032). */
export default {
  "secop-share-secop-i": {
    frase: "{valor} de los contratos estatales firmados en 2025 se publicó en SECOP I: si solo miras SECOP II, no los ves.",
    valor: null,
    muestra: null,
    periodo: "contratos firmados en 2025, SECOP I y II",
    consulta: "secop-share-secop-i",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
