/**
 * Páginas por entidad contratante (seo/fase-3). Tipos del snapshot, umbrales y
 * texto condicional. El diseño completo está en docs/seo/diseno-programatico.md.
 *
 * El snapshot lo exporta un script del repo `contradar` que corre en
 * DESARROLLO (nunca en el VPS) y se descarga en el build. Sin snapshot no se
 * genera ninguna página de entidad.
 */
import fs from "node:fs";
import path from "node:path";

export interface Proveedor {
  nombre: string;
  /** NIT de persona jurídica (^[89]\d{8}$) o proponente plural. El script ya
   *  excluye personas naturales; aquí se vuelve a comprobar. */
  nit: string;
  plural: boolean;
  contratos: number;
  valor: number;
}

export interface Entidad {
  nit: string;
  slug: string;
  nombre: string;
  departamento: string;
  municipio: string;
  /** Hash de las cifras: el lastmod de la página solo se mueve si cambia. */
  hash?: string;
  /** Fecha (AAAA-MM-DD) en que cambiaron sus cifras por última vez. La pone
   *  el exportador comparando el hash con el snapshot anterior; sin ella se
   *  usa la fecha de corte. */
  modificado?: string;
  /** Contratos y valor adjudicado por año, SECOP II. */
  porAnio: { anio: number; contratos: number; valor: number }[];
  /** Procesos publicados por modalidad (el campo se llama contratos por
   *  compatibilidad con el exportador; son PROCESOS). */
  modalidades: { nombre: string; contratos: number }[];
  sectores: { nombre: string; contratos: number; valor: number }[];
  /** Mediana del desvío % frente al presupuesto (negativo = descuento). */
  desvio: { mediana: number; n: number; nacionalModalidad: number; modalidad: string } | null;
  oferentes: { mediana: number; n: number } | null;
  proveedores: Proveedor[];
  abiertosHoy: { n: number; corte: string } | null;
  /** Tanda de indexación (1 = primera). null = noindex. */
  tanda: number | null;
}

/** Agregado sector × departamento (/licitaciones/<sector>/<departamento>/). */
export interface SectorDepto {
  sector: string;
  /** Slug de src/data/sectores.ts cuando existe la página de sector; si no, el de la vertical. */
  sectorSlug: string;
  departamento: string;
  departamentoSlug: string;
  /** Contratos y valor adjudicado 2023-2025, SECOP II. */
  contratos: number;
  valor: number;
  /** Mediana del valor por contrato. */
  mediana: number;
  /** Entidades compradoras distintas. */
  compradoras: number;
  /** Top 10 entidades compradoras: [nit, nombre, contratos, valor]. Solo
   *  las que tengan página propia llevan `slug`. */
  topEntidades: { nit: string; nombre: string; contratos: number; valor: number; slug?: string }[];
}

export interface Snapshot {
  /** Fecha de corte de los datos (AAAA-MM-DD). */
  corte: string;
  /** Versión de los umbrales con que se exportó (para el manifest). */
  version?: string;
  maqueta?: boolean;
  entidades: Entidad[];
  sectorDepto?: SectorDepto[];
}

export const slugDepto = (d: string) =>
  d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const UMBRAL = {
  contratos: 30,
  bloques: 3,
  nDesvio: 10,
  nOferentes: 10,
  proveedores: 5,
} as const;

const PJ = /^[89]\d{8}$/;
export const esPersonaJuridica = (p: Proveedor) => p.plural || PJ.test(p.nit);

export const totalContratos = (e: Entidad) => e.porAnio.reduce((s, a) => s + a.contratos, 0);
export const totalValor = (e: Entidad) => e.porAnio.reduce((s, a) => s + a.valor, 0);

/** Bloques con muestra suficiente, para el umbral de publicación. */
export function bloques(e: Entidad) {
  return {
    volumen: totalContratos(e) >= UMBRAL.contratos,
    modalidad: e.modalidades.length >= 2,
    desvio: !!e.desvio && e.desvio.n >= UMBRAL.nDesvio,
    oferentes: !!e.oferentes && e.oferentes.n >= UMBRAL.nOferentes,
    proveedores: e.proveedores.filter(esPersonaJuridica).length >= UMBRAL.proveedores,
  };
}

export function publicable(e: Entidad): "indexar" | "noindex" | "no" {
  if (totalContratos(e) < UMBRAL.contratos) return "no";
  const n = Object.values(bloques(e)).filter(Boolean).length;
  if (n < UMBRAL.bloques) return "noindex";
  return e.tanda !== null ? "indexar" : "noindex";
}

const pct = (x: number) => `${x.toLocaleString("es-CO", { maximumFractionDigits: 1 })} %`;

/** 4-6 frases elegidas por los datos. Ninguna se dice si su dato no pasa su n. */
export function narrativa(e: Entidad): string[] {
  const f: string[] = [];
  const b = bloques(e);
  const anios = [...e.porAnio].sort((x, y) => x.anio - y.anio);
  const mayor = [...anios].sort((x, y) => y.valor - x.valor)[0];
  if (anios.length >= 2) {
    const [pen, ult] = anios.slice(-2);
    const cambio = pen.valor > 0 ? ((ult.valor - pen.valor) / pen.valor) * 100 : 0;
    if (Math.abs(cambio) >= 15) {
      f.push(`En ${ult.anio} su contratación ${cambio > 0 ? "creció" : "cayó"} ${pct(Math.abs(cambio))} frente a ${pen.anio}.`);
    } else {
      f.push(`Su contratación se mantuvo estable entre ${pen.anio} y ${ult.anio}; el año de más valor adjudicado fue ${mayor.anio}.`);
    }
  }
  const top = e.modalidades[0];
  const total = e.modalidades.reduce((s, m) => s + m.contratos, 0);
  if (b.modalidad && top && total > 0) {
    const p = (top.contratos / total) * 100;
    f.push(p >= 50 ? `La mayoría de sus procesos (${pct(p)}) va por ${top.nombre.toLowerCase()}.` : `Reparte sus procesos entre varias modalidades; la más frecuente es ${top.nombre.toLowerCase()} (${pct(p)}).`);
  }
  if (b.desvio && e.desvio) {
    const d = e.desvio;
    const diff = d.mediana - d.nacionalModalidad;
    if (d.mediana > -1) f.push(`Adjudica casi al valor del presupuesto: la mediana del descuento es de ${pct(Math.abs(d.mediana))}.`);
    else if (diff < -2) f.push(`Adjudica con descuentos más hondos que la media nacional en ${d.modalidad.toLowerCase()} (${pct(Math.abs(d.mediana))} frente a ${pct(Math.abs(d.nacionalModalidad))}): aquí se compite por precio.`);
    else if (diff > 2) f.push(`Sus adjudicaciones quedan más cerca del presupuesto que la media nacional en ${d.modalidad.toLowerCase()} (${pct(Math.abs(d.mediana))} frente a ${pct(Math.abs(d.nacionalModalidad))}).`);
    else f.push(`Su descuento típico frente al presupuesto (${pct(Math.abs(d.mediana))}) está en la media nacional de ${d.modalidad.toLowerCase()}.`);
  }
  if (b.oferentes && e.oferentes) {
    const o = e.oferentes.mediana;
    if (o <= 2) f.push(`En sus procesos competitivos se presentan pocas empresas: la mediana es de ${o} ofertas.`);
    else if (o >= 6) f.push(`Sus procesos son muy disputados: la mediana es de ${o} ofertas por proceso.`);
    else f.push(`En un proceso típico recibe ${o} ofertas.`);
  }
  if (b.proveedores) {
    const pj = e.proveedores.filter(esPersonaJuridica);
    const tv = totalValor(e);
    const top3 = pj.slice(0, 3).reduce((s, p) => s + p.valor, 0);
    const p = tv > 0 ? (top3 / tv) * 100 : 0;
    if (p > 50) f.push(`Es un mercado concentrado: tres empresas se llevan el ${pct(p)} del valor adjudicado.`);
    else if (p < 20) f.push(`Es un mercado abierto: ninguna empresa domina; las tres primeras suman el ${pct(p)} del valor.`);
  }
  return f;
}

/** Lee el snapshot real (descargado en el build) o la maqueta si se pide. */
export function leerSnapshot(): Snapshot | null {
  // Desde la raíz del proyecto: en el build este módulo vive dentro de dist/,
  // así que una ruta relativa a import.meta.url apuntaría a otro sitio.
  const real = path.join(process.cwd(), ".snapshot/entidades.json");
  if (fs.existsSync(real)) return JSON.parse(fs.readFileSync(real, "utf8"));
  if (process.env.MUESTRAS_ENTIDADES === "1") {
    const m = path.join(process.cwd(), "docs/seo/muestras/maqueta-entidades.json");
    return { ...JSON.parse(fs.readFileSync(m, "utf8")), maqueta: true };
  }
  return null;
}

/* ── Hubs y enlazado (seo/fase-3) ─────────────────────────────────────── */

export const urlEntidad = (e: Entidad) => `/entidades/${e.slug}-${e.nit}/`;

/** Entidades que tienen página (indexable o no), agrupadas por departamento. */
export function porDepartamento(snap: Snapshot) {
  const m = new Map<string, { nombre: string; slug: string; entidades: Entidad[] }>();
  for (const e of snap.entidades) {
    if (publicable(e) === "no") continue;
    const slug = slugDepto(e.departamento);
    if (!m.has(slug)) m.set(slug, { nombre: e.departamento, slug, entidades: [] });
    m.get(slug)!.entidades.push(e);
  }
  for (const d of m.values()) d.entidades.sort((a, b) => totalValor(b) - totalValor(a));
  return [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/** Hasta 6 entidades del mismo departamento y modalidad principal, por valor. */
export function similares(e: Entidad, snap: Snapshot, n = 6): Entidad[] {
  const mod = e.modalidades[0]?.nombre;
  const mismas = snap.entidades.filter(
    (x) => x.nit !== e.nit && x.departamento === e.departamento && publicable(x) !== "no",
  );
  const conMod = mismas.filter((x) => x.modalidades[0]?.nombre === mod);
  return [...conMod, ...mismas.filter((x) => !conMod.includes(x))]
    .slice(0, n);
}

/** Un hub de departamento se indexa si tiene al menos 3 entidades indexables. */
export const deptoIndexable = (entidades: Entidad[]) =>
  entidades.filter((e) => publicable(e) === "indexar").length >= 3;
