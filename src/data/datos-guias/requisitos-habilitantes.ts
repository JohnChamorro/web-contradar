import type { DatoGuia } from "../datos-guias";

/* Guía /guias/requisitos-habilitantes/. Misma medición que `cuut-share-obra`
   (corrida por John en producción el 2-oct-2026): cuando los requisitos superan
   a una empresa sola, asociarse es la salida. Si se vuelve a medir, se cambian
   las dos. */
export default {
  "rh-asociados-obra": {
    frase: "En obra, {valor} de los contratos firmados en SECOP II en 2025 fue a consorcios y uniones temporales, y se llevaron el 76,6 % del valor contratado.",
    valor: "21,3 %",
    muestra: "9.838 contratos de obra",
    periodo: "contratos de obra firmados en 2025 en SECOP II",
    consulta: "cuut-share-obra",
    medido: "2026-10-02",
  },
} satisfies Record<string, DatoGuia>;
