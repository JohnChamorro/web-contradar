import type { DatoGuia } from "../datos-guias";

/* Guía /guias/como-calcular-la-oferta-economica/. Sale de modalidad-precio-2025
   (docs/seo/consultas-fase-2.md). Solo la baja de quienes bajaron: la mediana de
   todos los adjudicados daba casi cero porque cerca de la mitad cierra al
   presupuesto. Solo SECOP II: SECOP I no tiene presupuesto y adjudicado
   comparables. `valor` es una lista corta ya formateada. Nace en null; en dev el
   30-oct: mínima cuantía 10,1 %, licitación 2,0 %, subasta 2,0 %, menor cuantía
   1,7 %. */
export default {
  "oe-desvio-por-modalidad": {
    frase: "Cuando la oferta ganadora bajó del presupuesto oficial, la mediana de esa baja fue: {valor}.",
    valor: null,
    muestra: null,
    periodo: "adjudicados por debajo del presupuesto en 2025 en SECOP II",
    consulta: "modalidad-precio-2025",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
