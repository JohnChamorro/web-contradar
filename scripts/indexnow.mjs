/* Avisa a IndexNow (Bing, Yandex, Seznam, Naver…) de las páginas que
   cambiaron en el último despliegue. Google NO usa IndexNow: para Google
   está el sitemap con su lastmod real (scripts/lastmod.mjs).

   Va DESPUÉS del despliegue y de la purga de caché de Cloudflare: lee el
   sitemap PUBLICADO, así que si la purga no se hizo verá el sitemap viejo y
   no encontrará nada que enviar (y lo dice).

     npm run indexnow                    lo nuevo o cambiado desde el último envío
     npm run indexnow -- --seco          muestra qué enviaría, sin enviar ni guardar
     npm run indexnow -- --desde 2026-10-01   lastmod desde esa fecha (ignora el estado)
     npm run indexnow -- --todas         todo el sitemap (primera vez, o tras un cambio de dominio)
     npm run indexnow -- https://contradar.com.co/precios/ …   URLs concretas

   CÓMO SABE QUÉ CAMBIÓ. Guarda en .indexnow/ultimo-envio.json (fuera de git)
   el lastmod de cada URL tal como estaba en el último envío aceptado. En cada
   corrida compara el sitemap publicado con ese archivo: URL que no estaba =
   nueva; lastmod distinto = modificada. Sin archivo (primera vez en esta
   máquina) toma lo que tenga lastmod de los últimos 2 días, y lo avisa.

   SOLO HTML. El sitemap ya excluye recursos, pero el filtro va igual: nada
   con extensión distinta de .html (.svg, .png, .css, .js, .json, .txt…).
   Gastar el cupo de IndexNow en recursos estáticos no indexa nada.

   La clave es pública por diseño: el buscador comprueba que /<clave>.txt
   exista en el dominio y diga la clave, y eso prueba que el envío es
   nuestro. Antes de enviar se comprueba aquí lo mismo. */
import fs from "node:fs";
import path from "node:path";

const HOST = "contradar.com.co";
const SITIO = `https://${HOST}`;
const CLAVE = "6cd3f559f2eafbb26561dc2ce203cead";
const UBICACION_CLAVE = `${SITIO}/${CLAVE}.txt`;
const SITEMAP = `${SITIO}/sitemap-index.xml`;
const API = "https://api.indexnow.org/indexnow";
const LOTE = 10_000; // máximo de URLs por POST según el protocolo
const DIAS_SIN_ESTADO = 2;

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ESTADO = path.join(RAIZ, ".indexnow", "ultimo-envio.json");

const args = process.argv.slice(2);
const seco = args.includes("--seco") || process.env.SECO === "1";
const todas = args.includes("--todas");
const iDesde = args.indexOf("--desde");
const desde = iDesde >= 0 ? args[iDesde + 1] : null;
const concretas = args.filter((a, i) => a.startsWith("http") && args[i - 1] !== "--desde");

const salir = (msg, codigo = 1) => {
  (codigo ? console.error : console.log)(msg);
  process.exit(codigo);
};

async function texto(url) {
  /* Sin caché del lado del cliente: queremos lo que sirve Cloudflare ahora. */
  const r = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`${url} respondió HTTP ${r.status}`);
  return r.text();
}

/** Mapa url → lastmod (o "" si la URL no trae lastmod) de todo el sitemap publicado. */
async function sitemapPublicado() {
  const indice = await texto(SITEMAP);
  const hijos = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Map();
  for (const hijo of hijos) {
    const xml = await texto(hijo);
    for (const [, bloque] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = bloque.match(/<loc>([^<]+)<\/loc>/)?.[1];
      const lastmod = bloque.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "";
      if (loc) urls.set(loc.trim(), lastmod.trim());
    }
  }
  return urls;
}

/** Solo páginas HTML de nuestro host: sin extensión (/ruta/) o .html. */
function esPagina(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== HOST) return false;
    const ultimo = u.pathname.split("/").pop();
    return !ultimo.includes(".") || ultimo.endsWith(".html");
  } catch {
    return false;
  }
}

function leerEstado() {
  try {
    return JSON.parse(fs.readFileSync(ESTADO, "utf8"));
  } catch {
    return null;
  }
}

/* 1. La clave tiene que estar publicada y decir lo mismo: si no, IndexNow
      responde 403 y el envío se pierde. */
try {
  const publicada = (await texto(UBICACION_CLAVE)).trim();
  if (publicada !== CLAVE) salir(`La clave publicada en ${UBICACION_CLAVE} no coincide («${publicada.slice(0, 40)}»). No envié nada.`);
} catch (e) {
  salir(`No pude leer la clave en ${UBICACION_CLAVE} (${e.message}). No envié nada.`);
}

/* 2. Qué enviar. */
let publicado;
try {
  publicado = await sitemapPublicado();
} catch (e) {
  salir(`No pude leer ${SITEMAP} (${e.message}). ¿Sin internet o el sitio caído? No envié nada.`);
}
console.log(`IndexNow: el sitemap publicado tiene ${publicado.size} URL.`);

let elegidas;
let motivo;
if (concretas.length) {
  elegidas = concretas;
  motivo = "URLs dadas a mano";
} else if (todas) {
  elegidas = [...publicado.keys()];
  motivo = "todo el sitemap (--todas)";
} else if (desde) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) salir("--desde espera AAAA-MM-DD.");
  elegidas = [...publicado].filter(([, lm]) => lm && lm.slice(0, 10) >= desde).map(([u]) => u);
  motivo = `lastmod desde ${desde}`;
} else {
  const estado = leerEstado();
  if (estado?.urls) {
    const antes = new Map(Object.entries(estado.urls));
    const nuevas = [...publicado.keys()].filter((u) => !antes.has(u));
    const cambiadas = [...publicado].filter(([u, lm]) => antes.has(u) && antes.get(u) !== lm).map(([u]) => u);
    const quitadas = [...antes.keys()].filter((u) => !publicado.has(u));
    elegidas = [...nuevas, ...cambiadas];
    motivo = `comparado con el envío del ${estado.fecha}: ${nuevas.length} nueva(s), ${cambiadas.length} modificada(s)`;
    if (quitadas.length) {
      console.log(`Salieron del sitemap ${quitadas.length} URL (no se envían; si tienen 301, el buscador la verá al volver):`);
      quitadas.forEach((u) => console.log(`  - ${u}`));
    }
  } else {
    const limite = new Date(Date.now() - DIAS_SIN_ESTADO * 86_400_000).toISOString().slice(0, 10);
    elegidas = [...publicado].filter(([, lm]) => lm && lm.slice(0, 10) >= limite).map(([u]) => u);
    motivo = `primera vez en esta máquina (sin ${path.relative(RAIZ, ESTADO)}): lastmod desde ${limite}`;
  }
}

const descartadas = elegidas.filter((u) => !esPagina(u));
const urls = [...new Set(elegidas.filter(esPagina))];
console.log(`Criterio: ${motivo}.`);
if (descartadas.length) console.log(`Descartadas por no ser páginas HTML de ${HOST}: ${descartadas.length}.`);

const guardarEstado = () => {
  fs.mkdirSync(path.dirname(ESTADO), { recursive: true });
  fs.writeFileSync(ESTADO, JSON.stringify({ fecha: new Date().toISOString(), urls: Object.fromEntries(publicado) }, null, 2));
};

if (urls.length === 0) {
  console.log("No hay páginas nuevas ni modificadas que enviar.");
  console.log("Si acabas de desplegar algo que cambia el contenido: ¿se purgó la caché de Cloudflare? Sin purga, el sitemap publicado sigue siendo el viejo.");
  /* Igual se guarda el estado si no hay ninguno: deja la línea base puesta. */
  if (!seco && !leerEstado() && !concretas.length) guardarEstado();
  process.exit(0);
}

console.log(`Enviando ${urls.length} URL:`);
urls.forEach((u) => console.log(`  ${u}`));

if (seco) salir("--seco: no se envió nada ni se guardó el estado.", 0);

/* 3. Envío, en lotes de 10.000 (hoy son decenas). */
let ok = true;
for (let i = 0; i < urls.length; i += LOTE) {
  const lote = urls.slice(i, i + LOTE);
  const r = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: CLAVE, keyLocation: UBICACION_CLAVE, urlList: lote }),
    signal: AbortSignal.timeout(30_000),
  });
  const cuerpo = (await r.text()).trim();
  /* 200 = recibido · 202 = recibido, la clave se está validando ·
     400 = formato · 403 = clave no encontrada o no coincide ·
     422 = URL de otro host · 429 = demasiados envíos. */
  const bien = r.status === 200 || r.status === 202;
  console.log(`IndexNow respondió HTTP ${r.status} para ${lote.length} URL${bien ? " (ok)" : ""}${cuerpo ? ` · ${cuerpo.slice(0, 300)}` : ""}`);
  ok &&= bien;
}

if (!ok) salir("Hubo respuestas distintas de 200/202: NO se guardó el estado, la próxima corrida lo reintenta.");
/* Solo con URLs elegidas por el sitemap: un envío a mano no dice nada del resto. */
if (!concretas.length) guardarEstado();
console.log(`Listo: ${urls.length} URL enviadas.`);
