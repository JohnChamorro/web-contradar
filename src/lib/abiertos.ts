/**
 * Licitaciones abiertas HOY (ronda SEO 2). Lo produce el job `abiertos_web`
 * de la app a las 06:50 y lo baja scripts/descargar-abiertos.mjs en el build.
 * Diseño: docs/seo/licitaciones-abiertas.md.
 *
 * Sin archivo, o con un corte de más de 36 h, todo devuelve null y las
 * páginas no pintan listados: un proceso «abierto» que ya cerró hace más
 * daño que no mostrar nada.
 */
import fs from "node:fs";
import path from "node:path";
import { nombreEmpresa } from "./nombres";

export interface Proceso {
  entidad: string;
  departamento: string;
  municipio: string | null;
  objeto: string;
  modalidad: string;
  tipo: string | null;
  valor: number;
  /** AAAA-MM-DD; null en SECOP I, que no publica el cierre. */
  cierre: string | null;
  fuente: "SECOP I" | "SECOP II";
  url: string | null;
}

export interface Listado {
  n: number;
  valor: number;
  top: Proceso[];
}

export interface Abiertos {
  version: number;
  /** Fecha y hora del corte, ISO con zona de Bogotá. */
  corte: string;
  sectores: Record<string, Listado>;
  departamentos: Record<string, Listado & { nombre: string }>;
  /** Llave «<sectorSlug>/<deptoSlug>». */
  sectorDepto: Record<string, Listado>;
  /** NIT → total y por departamento (slug). */
  entidades: Record<string, { total: number; porDepto: Record<string, number> }>;
}

/** Un departamento con menos de esto no se indexa ese día. */
export const MIN_INDEXAR_DEPTO = 10;
export const HORAS_VIGENCIA = 36;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «22 de octubre de 2026». */
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Texto de SECOP en MAYÚSCULA sostenida → tipo oración (regla de la casa). */
export function tipoOracion(t: string): string {
  const letras = t.replace(/[^\p{L}]/gu, "");
  if (!letras || letras.replace(/[^\p{Lu}]/gu, "").length / letras.length < 0.7) return t;
  const bajo = t.toLowerCase();
  return bajo.charAt(0).toUpperCase() + bajo.slice(1);
}

let cache: Abiertos | null | undefined;

export function leerAbiertos(ahora = Date.now()): Abiertos | null {
  if (cache !== undefined) return cache;
  const f = path.join(process.cwd(), ".snapshot/abiertos.json");
  cache = null;
  if (!fs.existsSync(f)) return cache;
  const d = JSON.parse(fs.readFileSync(f, "utf8")) as Abiertos;
  const horas = (ahora - new Date(d.corte).getTime()) / 3_600_000;
  if (!(horas >= 0 && horas <= HORAS_VIGENCIA)) return cache;
  const legibles = (l: Listado) => {
    for (const p of l.top) {
      p.entidad = nombreEmpresa(p.entidad);
      p.objeto = tipoOracion(p.objeto);
    }
  };
  Object.values(d.sectores).forEach(legibles);
  Object.values(d.departamentos).forEach(legibles);
  Object.values(d.sectorDepto).forEach(legibles);
  cache = d;
  return cache;
}
