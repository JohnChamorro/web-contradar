import type { DatoGuia } from "../datos-guias";

/* Guía /guias/minima-cuantia/. Consultas en docs/seo/consultas-fase-2.md,
   corridas por John en producción el 2-oct-2026. */
export default {
  "mc-participacion": {
    frase: "{valor} de los procesos adjudicados en SECOP II fueron de mínima cuantía.",
    valor: "55,4 %",
    muestra: "83.806 procesos",
    periodo: "adjudicados en 2025 en SECOP II",
    consulta: "mc-participacion",
    medido: "2026-10-02",
  },
  /* Ronda SEO 3 (30-oct-2026). Reemplaza a `mc-desvio-mediana`: la mediana de
     TODOS los adjudicados daba −0,04 % porque casi la mitad se adjudica al
     presupuesto, así que no decía a qué precio se gana. Estas dos separan las
     dos cosas sin usar oferentes (puerta G6 sin validar). Nacen en null: se
     publican cuando John las corra en PRD (consultas-fase-2.md). En dev el
     30-oct: 56,0 % al presupuesto, −10,1 % cuando bajó (n = 33.443), y 85,5 %
     de 539 municipios sin pasar de $49.025.340. */
  "mc-al-presupuesto-2026": {
    frase: "{valor} de las mínimas cuantías adjudicadas en 2026 se adjudicó por el presupuesto exacto: nadie bajó el precio.",
    valor: null,
    muestra: null,
    periodo: "adjudicados en 2026 en SECOP II",
    consulta: "mc-precio-2026",
    medido: null,
  },
  "mc-baja-2026": {
    frase: "Cuando la oferta ganadora sí bajó del presupuesto, la mediana de esa baja fue de {valor}.",
    valor: null,
    muestra: null,
    periodo: "adjudicados por debajo del presupuesto en 2026 en SECOP II",
    consulta: "mc-precio-2026",
    medido: null,
  },
  /* Lo que la propia entidad declara en la cabecera de su PAA. En dev el 30-oct:
     48,9 % de 10.124 entidades (último plan de cada una). El 39,1 % declara un
     valor que no coincide con ningún tramo exacto de 2026: no se publica como
     «el tope de la entidad», solo el tramo más común. */
  "mc-tope-paa-2026": {
    frase: "{valor} de las entidades que declararon su tope en el Plan Anual de Adquisiciones de 2026 usa el tramo más bajo: $49.025.340.",
    valor: null,
    muestra: null,
    periodo: "último plan 2026 de cada entidad en SECOP II",
    consulta: "mc-tope-paa-2026",
    medido: null,
  },
  "mc-municipios-tope": {
    frase: "{valor} de los municipios con 5 o más mínimas cuantías en 2026 no publicó ninguna por encima de $49.025.340, el tope del tramo más bajo.",
    valor: null,
    muestra: null,
    periodo: "con procesos publicados en 2026 en SECOP II",
    consulta: "mc-municipios-tope",
    medido: null,
  },
} satisfies Record<string, DatoGuia>;
