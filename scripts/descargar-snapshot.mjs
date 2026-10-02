/* Descarga el snapshot de entidades ANTES del build (npm lo corre solo como
   «prebuild»). Lo exporta el repo contradar en DESARROLLO
   (backend/scripts/exportar_snapshot_web.py) y John lo sube a R2 cada mes
   (docs/operacion/snapshot-web.md en ese repo).

   Variables de entorno (Cloudflare Pages → Settings → Variables):
     SNAPSHOT_URL    URL del entidades.json.gz (R2 con dominio propio o r2.dev)
     SNAPSHOT_TOKEN  opcional: se manda como «Authorization: Bearer …» si el
                     bucket está detrás de Cloudflare Access o de una regla WAF

   Sin SNAPSHOT_URL no pasa nada: el build sigue y no genera páginas de
   entidad. Si la descarga FALLA con la variable puesta, también sigue, pero
   lo dice fuerte: es preferible publicar el sitio sin entidades a no
   publicarlo. El snapshot contiene lo mismo que las páginas publican (sin
   personas naturales ni datos de contacto), así que no es secreto. */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const url = process.env.SNAPSHOT_URL;
const destino = path.join(process.cwd(), ".snapshot");
const archivo = path.join(destino, "entidades.json");

if (!url) {
  console.log("[snapshot] SNAPSHOT_URL vacío: build sin páginas de entidad.");
  process.exit(0);
}

try {
  const res = await fetch(url, {
    headers: process.env.SNAPSHOT_TOKEN ? { Authorization: `Bearer ${process.env.SNAPSHOT_TOKEN}` } : {},
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let datos = Buffer.from(await res.arrayBuffer());
  if (datos[0] === 0x1f && datos[1] === 0x8b) datos = zlib.gunzipSync(datos);
  const snap = JSON.parse(datos.toString("utf8"));
  if (!snap.corte || !Array.isArray(snap.entidades)) throw new Error("no tiene la forma de un Snapshot");
  fs.mkdirSync(destino, { recursive: true });
  fs.writeFileSync(archivo, datos);
  console.log(`[snapshot] corte ${snap.corte} · ${snap.entidades.length} entidades · ${(datos.length / 1e6).toFixed(1)} MB`);
} catch (e) {
  console.error(`\n[snapshot] ⚠ NO SE PUDO DESCARGAR (${e.message}). El sitio se construye SIN páginas de entidad.\n`);
}
