import type { DatoGuia } from "../datos-guias";

/* Guía /guias/que-es-el-rup/. Misma medición que `mc-participacion` (corrida por
   John en producción el 2-oct-2026). Si se vuelve a medir, se cambian las dos.
   Solo SECOP II: SECOP I no tiene adjudicaciones en el espejo. */
export default {
  "rup-minima-cuantia": {
    frase: "{valor} de los procesos adjudicados en SECOP II en 2025 fue de mínima cuantía, donde la ley no exige RUP.",
    valor: "55,4 %",
    muestra: "83.806 procesos",
    periodo: "adjudicados en 2025 en SECOP II",
    consulta: "mc-participacion",
    medido: "2026-10-02",
  },
} satisfies Record<string, DatoGuia>;
