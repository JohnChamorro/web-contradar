/* Qué URLs del snapshot van al sitemap. Lo usa astro.config.mjs, que no puede
   importar TypeScript: por eso la regla se repite aquí, en corto, y debe
   coincidir con src/lib/entidades.ts (publicable / deptoIndexable).

   Solo cuenta el snapshot REAL (.snapshot/entidades.json): la maqueta del
   checkpoint nunca entra al sitemap. */
import fs from "node:fs";
import path from "node:path";

const slugDepto = (d) =>
  d.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* /licitaciones/<departamento>/ (abiertos del día): fuera del sitemap si ese
   día tiene menos de 10 (va con noindex); lastmod = el corte. Mismo umbral
   que MIN_INDEXAR_DEPTO de src/lib/abiertos.ts. Un archivo de más de 36 h no
   genera páginas (descargar-abiertos.mjs ya lo borra). */
function abiertos(fuera, lastmod) {
  const f = path.join(process.cwd(), ".snapshot/abiertos.json");
  if (!fs.existsSync(f)) return;
  const ab = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const [slug, d] of Object.entries(ab.departamentos ?? {})) {
    if (!(d.n > 0)) continue;
    const url = `/licitaciones/${slug}/`;
    if (d.n < 10) fuera.add(url);
    lastmod.set(url, ab.corte);
  }
}

export function urlsIndexables() {
  const f = path.join(process.cwd(), ".snapshot/entidades.json");
  const fuera = new Set(); // generadas con noindex: no van al sitemap
  if (!fs.existsSync(f)) {
    const lastmod = new Map();
    abiertos(fuera, lastmod);
    return { fuera, lastmod };
  }
  const snap = JSON.parse(fs.readFileSync(f, "utf8"));
  const lastmod = new Map();
  const porDepto = new Map();
  for (const e of snap.entidades) {
    const total = e.porAnio.reduce((s, a) => s + a.contratos, 0);
    if (total < 30) continue;
    const url = `/entidades/${e.slug}-${e.nit}/`;
    // El exportador solo asigna tanda a las que pasan los bloques: tanda
    // null = noindex (src/lib/entidades.ts → publicable).
    const indexable = e.tanda !== null && e.tanda !== undefined;
    if (!indexable) fuera.add(url);
    lastmod.set(url, e.modificado ?? snap.corte);
    const d = slugDepto(e.departamento);
    porDepto.set(d, (porDepto.get(d) ?? 0) + (indexable ? 1 : 0));
  }
  for (const [d, n] of porDepto) {
    const url = `/entidades/${d}/`;
    if (n < 3) fuera.add(url);
    lastmod.set(url, snap.corte);
  }
  lastmod.set("/entidades/", snap.corte);
  for (const c of snap.sectorDepto ?? []) {
    const url = `/licitaciones/${c.sectorSlug}/${c.departamentoSlug}/`;
    if (process.env.INDEXAR_SECTOR_DEPTO !== "1") fuera.add(url);
    lastmod.set(url, snap.corte);
  }
  abiertos(fuera, lastmod);
  return { fuera, lastmod };
}
