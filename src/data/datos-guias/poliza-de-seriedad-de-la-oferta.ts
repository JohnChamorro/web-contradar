import type { DatoGuia } from "../datos-guias";

/* Guía /guias/poliza-de-seriedad-de-la-oferta/. El SECOP no publica el valor de
   las pólizas de seriedad: esto es el presupuesto típico sobre el que se calcula
   el 10 %. SECOP II porque SECOP I no tiene presupuesto y adjudicado comparables
   en historical_processes. Nace en null; en dev el 30-oct: $2.111 M en licitación
   y $247 M en menor cuantía. */
export default {
  "pol-presupuesto-mediano": {
    frase: "La mediana del presupuesto de los procesos adjudicados en 2025 fue de {valor}. Una oferta por ese valor pide una garantía de seriedad de por lo menos el 10 %.",
    valor: null,
    muestra: null,
    periodo: "adjudicados en 2025 en SECOP II",
    consulta: "modalidad-precio-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
