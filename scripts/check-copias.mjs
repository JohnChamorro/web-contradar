// Verifica que las copias generadas por contradar-design/sync-tokens.sh no se
// editaron a mano: la primera línea lleva la huella sha256 del contenido y aquí
// se recalcula. Corre antes de cada build (prebuild): si falla, no se publica.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const COPIAS = [
  "src/components/asistente/personaje/personaje.svg",
  "src/components/asistente/personaje/personaje.css",
];
const errores = [];
for (const c of COPIAS) {
  let txt;
  try { txt = readFileSync(new URL(`../${c}`, import.meta.url), "utf8"); }
  catch { errores.push(`${c}: no existe. Corre contradar-design/sync-tokens.sh.`); continue; }
  const [cab, ...resto] = txt.split("\n");
  const m = cab.match(/sha256:([0-9a-f]{64})/);
  if (!m) { errores.push(`${c}: sin huella en la cabecera.`); continue; }
  const h = createHash("sha256").update(resto.join("\n")).digest("hex");
  if (h !== m[1]) errores.push(`${c}: se editó la copia. Cambia contradar-design/personaje/ y corre sync-tokens.sh.`);
}
if (errores.length) { console.error(errores.join("\n")); process.exit(1); }
console.log(`check-copias: ${COPIAS.length} copias al día.`);
