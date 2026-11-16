// Fotos de la web (15-nov-2026): PNG grande → AVIF y WebP a 1280, 1920 y 2560 px en public/fotos/.
//
//   node scripts/fotos/web.mjs <carpeta-con-png> [nombre ...] [--anchos=640,960]
//
// --anchos cambia los tamaños que se sacan (16-nov-2026): las fotos de la tarjeta
// del hero (via, escuela, puente) llevan además 640 y 960 px, porque se ven a
// ~300 px de ancho y la de 1280 era cuatro veces lo que hacía falta. Misma
// calidad y mismo proceso que las demás.
//
// Las fotos son escenas generadas en local con FLUX.1-schnell y ampliadas con
// Real-ESRGAN (herramientas en /mnt/hdd/herramientas/comfyui: foto.py y
// ampliar_foto.py). Las capas con transparencia (p. ej. la cordillera sin cielo)
// conservan el canal alfa.
import { readdirSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const opcion = args.find((a) => a.startsWith("--anchos="));
const anchos = opcion ? opcion.slice(9).split(",").map(Number) : [1280, 1920, 2560];
const [dir, ...solo] = args.filter((a) => !a.startsWith("--"));
if (!dir) { console.error("uso: node scripts/fotos/web.mjs <carpeta> [nombre ...]"); process.exit(1); }
const destino = new URL("../../public/fotos/", import.meta.url).pathname;
mkdirSync(destino, { recursive: true });

const pngs = readdirSync(dir).filter((f) => f.endsWith(".png") && (!solo.length || solo.includes(basename(f, ".png"))));
for (const f of pngs) {
  const n = basename(f, ".png");
  for (const w of anchos) {
    const base = sharp(join(dir, f)).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(join(destino, `${n}-${w}.avif`));
    await base.clone().webp({ quality: 74, effort: 5 }).toFile(join(destino, `${n}-${w}.webp`));
  }
  console.log("ok", n);
}
