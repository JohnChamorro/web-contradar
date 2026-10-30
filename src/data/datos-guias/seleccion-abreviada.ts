import type { DatoGuia } from "../datos-guias";

/* Guía /guias/seleccion-abreviada/. Sale de la consulta modalidad-precio-2025 de
   docs/seo/consultas-fase-2.md. Reemplaza a `sa-desvio-subasta`: separa lo que se
   adjudicó al presupuesto de la baja real. Solo SECOP II: SECOP I no tiene
   presupuesto y adjudicado comparables. Nacen en null; en dev el 30-oct: 63,8 %
   de 5.936 y baja de 2,0 % en 2.149 procesos. */
export default {
  "sa-subasta-presupuesto": {
    frase: "{valor} de las subastas inversas adjudicadas en 2025 se adjudicó por el presupuesto exacto.",
    valor: null,
    muestra: null,
    periodo: "adjudicados en 2025 en SECOP II",
    consulta: "modalidad-precio-2025",
    medido: null,
  },
  "sa-subasta-baja": {
    frase: "Cuando la subasta sí bajó del presupuesto, la mediana de la baja fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "adjudicados por debajo del presupuesto en 2025 en SECOP II",
    consulta: "modalidad-precio-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
