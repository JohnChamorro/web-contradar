import type { DatoGuia } from "../datos-guias";

/* Guía /guias/como-buscar-licitaciones-en-secop/. Consulta cb-competitivos-dia
   de docs/seo/consultas-fase-2.md, SECOP I y II. Sin contratación directa, porque
   ahí no hay convocatoria. Nace en null; en dev el 30-oct: 588 procesos por día
   hábil, 168 de ellos en SECOP I, sobre 111.145 de enero a septiembre de 2026. */
export default {
  "cb-competitivos-dia": {
    frase: "En un día hábil típico de 2026 se publicaron {valor} procesos de modalidades con convocatoria en SECOP I y II.",
    valor: null,
    muestra: null,
    periodo: "publicados de enero a septiembre de 2026, sin contratación directa",
    consulta: "cb-competitivos-dia",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
