import type { DatoGuia } from "../datos-guias";

/* Guía /guias/minima-cuantia/. Consultas en docs/seo/consultas-fase-2.md,
   corridas por John en producción el 2-oct-2026. */
export default {
  "mc-participacion": {
    frase: "{valor} de los procesos adjudicados en SECOP II fueron de mínima cuantía.",
    valor: "55,4 %",
    muestra: "83.806 procesos",
    periodo: "procesos adjudicados en 2025 en SECOP II",
    consulta: "mc-participacion",
    medido: "2026-10-02",
  },
  /* EN ESPERA (2-oct-2026): la mediana salió −0,04 % con el 48,2 % de los
     procesos adjudicados exactamente al presupuesto. Mide TODOS los
     adjudicados, también los de un solo oferente (donde adjudicar al
     presupuesto es lo normal), así que no dice «a qué precio se gana» sino
     cuántos procesos no tuvieron puja. Se publica cuando haya la versión
     restringida a procesos con más de una oferta. */
  "mc-desvio-mediana": {
    frase: "En mínima cuantía, la mediana de la diferencia entre el valor adjudicado y el presupuesto oficial fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "procesos de mínima cuantía adjudicados en 2025 en SECOP II",
    consulta: "mc-desvio-mediana",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
