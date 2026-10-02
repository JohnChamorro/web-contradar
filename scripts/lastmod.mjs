/* lastmod REAL para el sitemap: la fecha del último commit que tocó la página
   o cualquier cosa que la página importe (componentes, layouts, datos).

   Por qué no la fecha del build: un lastmod que cambia en cada despliegue
   aunque nada cambie le enseña a Google que el campo miente, y deja de
   creerlo. Por qué no solo el archivo de la página: /precios/ casi no cambia,
   pero Pricing.astro sí, y lo que lee el rastreador es el HTML final.

   Se siguen los `import` relativos de forma recursiva dentro de src/. Si git
   no está disponible o el clon es superficial y no trae la historia, la
   función devuelve undefined y la URL sale SIN lastmod: mejor ningún dato que
   uno falso. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PAGINAS = path.join(RAIZ, "src/pages");

/* El MARCO común no cuenta: lo importan todas las páginas, así que un
   cambio en el menú o en el pie movería el lastmod de las veinte a la vez y
   volvería a decir nada. Cuenta lo que es contenido de cada página: el
   archivo de la página, sus secciones y los datos que pinta. */
const MARCO = [
  "src/layouts/Base.astro",
  "src/components/Nav.astro",
  "src/components/Footer.astro",
  "src/components/AccessForm.astro",
  "src/components/Flecha.astro",
  "src/components/Logo.astro",
  "src/components/WhatsAppIcon.astro",
  "src/consts.ts",
  "src/lib/",
  "src/styles/",
].map((r) => path.join(RAIZ, r));
const esMarco = (archivo) => MARCO.some((m) => archivo === m || (m.endsWith("/") && archivo.startsWith(m)));

const cacheFecha = new Map();
const cacheDeps = new Map();

function fechaGit(archivo) {
  if (cacheFecha.has(archivo)) return cacheFecha.get(archivo);
  let fecha;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", archivo], {
      cwd: RAIZ,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out) fecha = new Date(out);
  } catch {
    /* sin git: se queda undefined */
  }
  cacheFecha.set(archivo, fecha);
  return fecha;
}

const RE_IMPORT = /(?:import|from)\s+["']([^"']+)["']/g;
const EXTS = ["", ".astro", ".ts", ".mjs", ".js", "/index.ts"];

function dependencias(archivo, vistos = new Set()) {
  if (vistos.has(archivo)) return vistos;
  vistos.add(archivo);
  if (esMarco(archivo)) return vistos;
  let texto = "";
  try {
    texto = fs.readFileSync(archivo, "utf8");
  } catch {
    return vistos;
  }
  for (const m of texto.matchAll(RE_IMPORT)) {
    const spec = m[1].split("?")[0];
    if (!spec.startsWith(".")) continue;
    const base = path.resolve(path.dirname(archivo), spec);
    const real = EXTS.map((e) => base + e).find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
    if (real && real.startsWith(path.join(RAIZ, "src"))) dependencias(real, vistos);
  }
  return vistos;
}

/** "/producto/busquedas/" → src/pages/producto/busquedas.astro (o /index.astro). */
function archivoDePagina(ruta) {
  const limpio = ruta.replace(/^\/|\/$/g, "");
  const candidatos = limpio
    ? [`${limpio}.astro`, `${limpio}/index.astro`]
    : ["index.astro"];
  return candidatos.map((c) => path.join(PAGINAS, c)).find((p) => fs.existsSync(p));
}

/** Fecha del último commit que afecta a la URL, o undefined si no se sabe. */
export function lastmodDe(url) {
  const ruta = new URL(url).pathname;
  const archivo = archivoDePagina(ruta);
  if (!archivo) return undefined;
  if (!cacheDeps.has(archivo)) cacheDeps.set(archivo, [...dependencias(archivo)]);
  let max;
  for (const dep of cacheDeps.get(archivo)) {
    if (esMarco(dep)) continue;
    const f = fechaGit(dep);
    if (f && (!max || f > max)) max = f;
  }
  return max;
}
