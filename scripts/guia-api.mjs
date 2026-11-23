#!/usr/bin/env node
/**
 * Guía pública de la API para clientes (/api/, 23-nov-2026).
 *
 * LA FUENTE ES UNA SOLA: `docs/api-clientes.md` del repo de la app
 * (~/eulertech/contradar). Esa guía termina con «Notas internas (ContRadar)»
 * —diseño, seguridad, tablas— que NUNCA sale al público. Este script:
 *
 *   1. corta todo desde «## Notas internas» y el enlace del índice que lleva a ella;
 *   2. escribe `src/data/api/guia.md` para la página (sin el H1 ni el índice
 *      «Contenido:», que en la web los ponen el hero y la columna lateral);
 *   3. imprime el PDF descargable en `public/api/contradar-api-guia-v1.pdf`
 *      (con H1 e índice, para leerlo suelto) con el Chrome instalado.
 *
 * Uso:  node scripts/guia-api.mjs [ruta/a/api-clientes.md]
 *       (por defecto ../contradar/docs/api-clientes.md)
 * Se corre a mano cada vez que cambia la guía en la app, y se suben los dos
 * archivos generados en el mismo commit. Falla si quedara algo interno.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { chromium } from "playwright";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fuente = resolve(process.argv[2] ?? resolve(raiz, "../contradar/docs/api-clientes.md"));
const MD_WEB = resolve(raiz, "src/data/api/guia.md");
const PDF = resolve(raiz, "public/api/contradar-api-guia-v1.pdf");

let md = readFileSync(fuente, "utf8");
const corte = md.indexOf("\n## Notas internas");
if (corte < 0) throw new Error("No encontré «## Notas internas»: revisa la guía antes de publicarla.");
md = md.slice(0, corte).replace(/\n---\s*$/, "\n");
md = md.replace(/\s*·\s*\[Notas internas\]\(#notas-internas-contradar\)/, "");

/* Candado: nada de lo que solo vive en las notas internas puede quedar. */
const PROHIBIDO = [/notas internas/i, /contradar_app/, /SET ROLE/, /backend\//, /SHA-256/, /hmac/i, /pool PROPIO/i];
for (const re of PROHIBIDO) if (re.test(md)) throw new Error(`La parte pública contiene ${re}: no se publica.`);

/* Web: sin H1 (lo pone el hero) ni el párrafo «Contenido:» (lo pone la columna). */
const web = md
  .replace(/^# .*\n+/, "")
  .replace(/\nContenido:[\s\S]*?\n\n/, "\n\n");
mkdirSync(dirname(MD_WEB), { recursive: true });
writeFileSync(MD_WEB, `<!-- GENERADO por scripts/guia-api.mjs desde contradar/docs/api-clientes.md. No se edita aquí. -->\n\n${web}`);

/* PDF: la guía entera (H1 e índice incluidos), sin la parte interna. */
const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, "").replace(/[`]/g, "").trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
let html = micromark(md, { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
html = html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, n, t) => `<h${n} id="${slug(t)}">${t}</h${n}>`);
/* El PDF es un archivo suelto: no lee tokens.css, así que lleva sus colores impresos
   (los mismos valores de la tinta, la línea y el azul de la marca). */
const doc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>API de ContRadar para clientes · v1</title><style>
@page{size:A4;margin:18mm 16mm}
body{font-family:Manrope,"Segoe UI",Helvetica,Arial,sans-serif;color:#0A1628;font-size:10.5pt;line-height:1.55}
h1{font-size:22pt;margin:0 0 6pt;letter-spacing:-.02em}
h2{font-size:15pt;margin:20pt 0 6pt;padding-top:8pt;border-top:1px solid #d9dee6;break-after:avoid}
h3{font-size:12pt;margin:14pt 0 4pt;break-after:avoid}
code{font-family:"IBM Plex Mono",Consolas,monospace;font-size:9pt;background:#f1f3f6;padding:0 3px;border-radius:3px}
pre{background:#f1f3f6;padding:8pt 10pt;border-radius:6px;white-space:pre-wrap;word-break:break-all;break-inside:avoid}
pre code{background:none;padding:0}
blockquote{margin:8pt 0;padding:6pt 10pt;border-left:3px solid #0D4488;background:#f6f7f9}
blockquote p{margin:0}
table{border-collapse:collapse;width:100%;margin:6pt 0;font-size:9.5pt}
th,td{border:1px solid #d9dee6;padding:4pt 6pt;text-align:left;vertical-align:top}
th{background:#f6f7f9}
tr{break-inside:avoid}
a{color:#0D4488;text-decoration:none}
hr{display:none}
</style></head><body>${html}</body></html>`;

const nav = await chromium.launch({ channel: "chrome" });
const pag = await nav.newPage();
await pag.setContent(doc, { waitUntil: "load" });
mkdirSync(dirname(PDF), { recursive: true });
await pag.pdf({ path: PDF, format: "A4", printBackground: true, displayHeaderFooter: false });
await nav.close();
console.log(`guía web → ${MD_WEB}\nPDF      → ${PDF}`);
