// Base de conocimiento de «Pregúntale a ContRadar» (web-3, 5-nov-2026).
//
// Corre después del build (npm «postbuild») y escribe dist/asistente/kb.json
// con el texto de /ayuda/, /funcionalidades/, /nosotros/ y /guias/, partido por
// secciones (h2/h3). La API lo baja de https://contradar.com.co/asistente/kb.json
// (ASSISTANT_KB_URL) y fija la versión por su hash: así los dos repos no se
// acoplan a mano. Lo que no está publicado en esas páginas, el asistente no lo
// sabe.
//
// Precios y límites NO entran: se cambian por «[ver /precios/]» y la API manda
// esas preguntas al recomendador de planes (la fuente es data/producto.ts).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.argv[2] || "dist");
const SITIO = "https://contradar.com.co";
const MAX = 1200;

function paginas() {
  const out = ["ayuda", "funcionalidades", "nosotros", "guias"].map((p) => `${p}/index.html`);
  const g = path.join(DIST, "guias");
  if (existsSync(g)) {
    for (const d of readdirSync(g, { withFileTypes: true })) {
      if (d.isDirectory() && existsSync(path.join(g, d.name, "index.html"))) out.push(`guias/${d.name}/index.html`);
    }
  }
  return out.filter((p) => existsSync(path.join(DIST, p)));
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " ", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ" };
const texto = (html) =>
  html.replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => {
      if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENT[e.toLowerCase()] ?? m;
    })
    .replace(/\$\s?\d[\d.,]*(\s?(M|millones|mil))?/gi, "[ver /precios/]")
    .replace(/\s+/g, " ").trim();

function secciones(rel) {
  let html = readFileSync(path.join(DIST, rel), "utf8");
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  html = m ? m[1] : html;
  html = html.replace(/<(script|style|svg|nav|footer|form|template|noscript|button)[\s\S]*?<\/\1>/gi, " ");
  const ruta = `/${rel.replace(/index\.html$/, "")}`;
  const titulo = texto((readFileSync(path.join(DIST, rel), "utf8").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ""])[1]);
  const partes = html.split(/(?=<h[23][\s>])/i);
  const out = [];
  for (const p of partes) {
    const h = p.match(/^<h[23]([^>]*)>([\s\S]*?)<\/h[23]>/i);
    const sub = h ? texto(h[2]) : titulo;
    const id = h?.[1].match(/id="([^"]+)"/)?.[1];
    const cuerpo = texto(h ? p.slice(h[0].length) : p);
    if (cuerpo.length < 80) continue;
    for (let i = 0; i < cuerpo.length; i += MAX) {
      let trozo = cuerpo.slice(i, i + MAX + 200);
      if (i + MAX < cuerpo.length) trozo = trozo.slice(0, trozo.lastIndexOf(". ", MAX) + 1 || MAX);
      out.push({ url: `${SITIO}${ruta}${id ? `#${id}` : ""}`, title: sub && sub !== titulo ? `${titulo} · ${sub}` : titulo, text: trozo.trim() });
    }
  }
  return out;
}

const chunks = paginas().flatMap(secciones).map((c, i) => ({ id: `k${i}`, ...c }));
const version = createHash("sha256").update(JSON.stringify(chunks)).digest("hex").slice(0, 16);
mkdirSync(path.join(DIST, "asistente"), { recursive: true });
writeFileSync(path.join(DIST, "asistente", "kb.json"), JSON.stringify({ version, generated: new Date().toISOString(), chunks }));
console.log(`[kb] ${chunks.length} secciones de ${paginas().length} páginas · versión ${version}`);
