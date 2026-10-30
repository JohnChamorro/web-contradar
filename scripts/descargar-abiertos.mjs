/* Descarga las licitaciones abiertas HOY antes del build (npm lo corre en
   «prebuild», después del snapshot de entidades). Lo produce el job
   `abiertos_web` de la app a las 06:50 y lo sirve GET /public/abiertos-web;
   ese mismo job dispara el build de Pages. Diseño:
   docs/seo/licitaciones-abiertas.md.

   Variable de entorno (Cloudflare Pages → Settings → Variables):
     ABIERTOS_URL   https://app.contradar.com.co/api/v1/public/abiertos-web

   Sin la variable, o si la descarga falla, o si el corte tiene más de 36 h,
   el build sigue SIN listados: las páginas quedan como antes. Nunca se
   publica un listado viejo de procesos «abiertos». */
import fs from "node:fs";
import path from "node:path";

const url = process.env.ABIERTOS_URL;
const archivo = path.join(process.cwd(), ".snapshot/abiertos.json");
fs.rmSync(archivo, { force: true });

if (!url) {
  console.log("[abiertos] ABIERTOS_URL vacío: build sin listados de abiertos.");
  process.exit(0);
}
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const texto = await res.text();
  const d = JSON.parse(texto);
  if (!d.corte || !d.departamentos || !d.sectores) throw new Error("no tiene la forma esperada");
  const horas = (Date.now() - new Date(d.corte).getTime()) / 3_600_000;
  if (!(horas >= 0 && horas <= 36)) throw new Error(`corte de hace ${horas.toFixed(0)} h`);
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, texto);
  console.log(`[abiertos] corte ${d.corte} · ${Object.keys(d.departamentos).length} departamentos`);
} catch (e) {
  console.error(`\n[abiertos] ⚠ SIN LISTADOS (${e.message}). El sitio se construye como si no hubiera abiertos.\n`);
}
