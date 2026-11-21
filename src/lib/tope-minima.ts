/**
 * Lectura del tope de mínima cuantía que una entidad declara en su Plan Anual
 * de Adquisiciones (herramienta /herramientas/tope-minima-cuantia/).
 *
 * El dato es de la entidad, no nuestro: aquí solo se dice con qué coincide.
 * NO se calcula «lo que le tocaría por ley»: para eso haría falta su
 * presupuesto anual, y el PAA trae el valor de lo que planea comprar, que es
 * otra cosa (docs/seo/ronda-4.md §2). Una cifra que no se puede respaldar no
 * se publica.
 *
 * Sin dependencias del navegador: lo importan la página, el generador de
 * datos y las pruebas de Node (`npm test`).
 */
import { SMMLV, tramosCuantia } from "../data/cuantias.ts";

export type LecturaTope =
  /** Coincide con uno de los cinco tramos de la Ley 1150 para el año. */
  | { tipo: "tramo"; indice: number; smmlv: number }
  /** Coincide con un tramo del año anterior: el plan no se actualizó. */
  | { tipo: "anterior"; indice: number; anio: number; smmlv: number }
  /** Escribió como mínima un valor que es una menor cuantía de la ley. */
  | { tipo: "menor-como-minima"; indice: number; smmlv: number }
  /** Otro valor. `smmlv` es su equivalente; `smmlvExacto` si da un entero. */
  | { tipo: "otro"; smmlv: number; smmlvExacto: boolean };

const igual = (a: number, b: number) => Math.abs(a - b) <= 1;

/** A qué corresponde el tope que declaró la entidad. */
export function leerTope(minima: number, anio: number): LecturaTope {
  const s = SMMLV[anio];
  const smmlv = minima / s;
  const tramos = tramosCuantia(anio);
  let i = tramos.findIndex((t) => igual(t.minimaPesos, minima));
  if (i >= 0) return { tipo: "tramo", indice: i, smmlv: tramos[i].minimaSmmlv };
  i = tramos.findIndex((t) => igual(t.menorPesos, minima));
  if (i >= 0) return { tipo: "menor-como-minima", indice: i, smmlv };
  if (SMMLV[anio - 1]) {
    const antes = tramosCuantia(anio - 1);
    i = antes.findIndex((t) => igual(t.minimaPesos, minima));
    if (i >= 0) return { tipo: "anterior", indice: i, anio: anio - 1, smmlv: antes[i].minimaSmmlv };
  }
  const redondo = Math.round(smmlv);
  return { tipo: "otro", smmlv, smmlvExacto: redondo > 0 && igual(redondo * s, minima) };
}

/** ¿La mínima declarada es el 10 % de la menor declarada? (±0,5 %) */
export function coherenteConMenor(minima: number, menor: number | null): boolean | null {
  if (!menor || menor <= 0) return null;
  return Math.abs(minima - menor * 0.1) <= menor * 0.1 * 0.005;
}

/** Texto sin tildes ni mayúsculas, para buscar como escribe la gente. */
export const sinTildes = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Fila del archivo de datos: [nombre, departamento, municipio, mínima, menor, fecha]. */
export type FilaTope = [string, string, string, number, number | null, string];

/**
 * Busca entidades: todas las palabras escritas tienen que estar en el nombre
 * o en el lugar. Primero las que empiezan por lo escrito, luego las más cortas
 * (la alcaldía antes que sus dependencias).
 */
export function buscarEntidades(filas: FilaTope[], indice: string[], consulta: string, max = 8): number[] {
  const q = sinTildes(consulta);
  if (q.length < 3) return [];
  const palabras = q.split(" ");
  const hallados: [number, number][] = [];
  for (let i = 0; i < indice.length; i++) {
    const texto = indice[i];
    if (!palabras.every((p) => texto.includes(p))) continue;
    const empieza = texto.startsWith(q) ? 0 : texto.includes(" " + q) ? 1 : 2;
    hallados.push([i, empieza * 1000 + Math.min(filas[i][0].length, 999)]);
  }
  hallados.sort((a, b) => a[1] - b[1]);
  return hallados.slice(0, max).map((h) => h[0]);
}

/** El texto en el que se busca cada fila. */
export const textoBusqueda = (f: FilaTope) => sinTildes(`${f[0]} ${f[2]} ${f[1]}`);
