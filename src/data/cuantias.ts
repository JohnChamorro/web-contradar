/**
 * Cuantías de la contratación estatal: el ÚNICO sitio donde vive el salario
 * mínimo y lo que se calcula con él (menor y mínima cuantía por tramo).
 *
 * POR QUÉ EXISTE (ronda SEO 4, 21-nov-2026). La mitad de lo que Google nos
 * muestra es «mínima cuantía 2026», y esa búsqueda cambia de año el día que
 * sale el decreto del salario mínimo (finales de diciembre). Las cifras
 * estaban escritas a mano en la guía; ahora salen de aquí, y la herramienta
 * del tope por entidad lee lo mismo.
 *
 * CUANDO SALGA EL SMMLV DE 2027: docs/seo/runbook-smmlv.md. En corto: añadir
 * el año a `SMMLV`, subir `ANIO_CUANTIAS` y revisar los textos que hablan del
 * decreto. Nunca se escribe un salario que no esté decretado.
 */

/** Salario mínimo legal mensual vigente, por año, en pesos. */
export const SMMLV: Record<number, number> = {
  2025: 1_423_500, // Decreto 1572 de 2024
  2026: 1_750_905, // Decreto 1469 de 2025
};

/** El año que la web presenta como vigente. */
export const ANIO_CUANTIAS = 2026;

/**
 * Tramos del literal b del numeral 2 del artículo 2 de la Ley 1150 de 2007:
 * la menor cuantía depende del presupuesto anual de la entidad, todo en SMMLV.
 * `hasta` es exclusivo; el último tramo no tiene techo.
 */
export const TRAMOS_LEY_1150 = [
  { desde: 0, hasta: 120_000, menorSmmlv: 280 },
  { desde: 120_000, hasta: 400_000, menorSmmlv: 450 },
  { desde: 400_000, hasta: 850_000, menorSmmlv: 650 },
  { desde: 850_000, hasta: 1_200_000, menorSmmlv: 850 },
  { desde: 1_200_000, hasta: null, menorSmmlv: 1_000 },
] as const;

/** La mínima cuantía es el 10 % de la menor (art. 2, num. 5, Ley 1150). */
export const FRACCION_MINIMA = 0.1;

export interface TramoCuantia {
  /** «Menos de 120.000 SMMLV», «De 120.000 a menos de 400.000»… */
  etiqueta: string;
  desdeSmmlv: number;
  hastaSmmlv: number | null;
  /** Presupuesto anual desde el que aplica el tramo, en pesos. */
  desdePesos: number;
  hastaPesos: number | null;
  menorSmmlv: number;
  menorPesos: number;
  minimaSmmlv: number;
  minimaPesos: number;
}

const miles = (n: number) => n.toLocaleString("es-CO");

/** Los cinco tramos con sus cifras en pesos del año pedido. */
export function tramosCuantia(anio: number = ANIO_CUANTIAS): TramoCuantia[] {
  const s = SMMLV[anio];
  if (!s) throw new Error(`No hay salario mínimo decretado para ${anio} en src/data/cuantias.ts`);
  return TRAMOS_LEY_1150.map((t, i) => ({
    etiqueta:
      i === 0 ? `Menos de ${miles(t.hasta!)} SMMLV`
      : t.hasta === null ? `${miles(t.desde)} SMMLV o más`
      : `De ${miles(t.desde)} a menos de ${miles(t.hasta)}`,
    desdeSmmlv: t.desde,
    hastaSmmlv: t.hasta,
    desdePesos: t.desde * s,
    hastaPesos: t.hasta === null ? null : t.hasta * s,
    menorSmmlv: t.menorSmmlv,
    menorPesos: t.menorSmmlv * s,
    minimaSmmlv: t.menorSmmlv * FRACCION_MINIMA,
    minimaPesos: Math.round(t.menorSmmlv * s * FRACCION_MINIMA),
  }));
}

/**
 * Las cuantías del Código General del Proceso (Ley 1564 de 2012, art. 25) NO
 * son las de la contratación estatal: clasifican demandas, no compras. Se
 * publican porque quien busca «mínima cuantía CGP» llega a nuestra guía.
 */
export const CGP = { minimaHastaSmmlv: 40, menorHastaSmmlv: 150 } as const;

export function cuantiasCgp(anio: number = ANIO_CUANTIAS) {
  const s = SMMLV[anio];
  if (!s) throw new Error(`No hay salario mínimo decretado para ${anio} en src/data/cuantias.ts`);
  return { minimaHasta: CGP.minimaHastaSmmlv * s, menorHasta: CGP.menorHastaSmmlv * s };
}
