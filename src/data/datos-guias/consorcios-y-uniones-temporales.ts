import type { DatoGuia } from "../datos-guias";

/* Guía /guias/consorcios-y-uniones-temporales/. Consulta cuut-share-obra de
   docs/seo/consultas-fase-2.md, corrida por John en producción el 2-oct-2026
   (ceth_no_marcados = 0: la regla no se queda corta). */
export default {
  "cuut-share-obra": {
    frase: "{valor} de los contratos de obra firmados en SECOP II en 2025 fueron a consorcios y uniones temporales, y se llevaron el 76,6 % del valor contratado.",
    valor: "21,3 %",
    muestra: "9.838 contratos de obra",
    periodo: "contratos de obra firmados en 2025 en SECOP II",
    consulta: "cuut-share-obra",
    medido: "2026-10-02",
  },
} satisfies Record<string, DatoGuia>;
