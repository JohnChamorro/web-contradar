// Fotos de la web (15-nov-2026): PNG grande → AVIF y WebP a 1280, 1920 y 2560 px en public/fotos/.
//
//   node scripts/fotos/web.mjs <carpeta-con-png> [nombre ...]
//
// Las fotos son escenas generadas en local con FLUX.1-schnell y ampliadas con
// Real-ESRGAN (herramientas en /mnt/hdd/herramientas/comfyui: foto.py y
// ampliar_foto.py). Las capas con transparencia (p. ej. la cordillera sin cielo)
// conservan el canal alfa.
import { readdirSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import sharp from "sharp";

const [dir, ...solo] = process.argv.slice(2);
if (!dir) { console.error("uso: node scripts/fotos/web.mjs <carpeta> [nombre ...]"); process.exit(1); }
const destino = new URL("../../public/fotos/", import.meta.url).pathname;
mkdirSync(destino, { recursive: true });

const pngs = readdirSync(dir).filter((f) => f.endsWith(".png") && (!solo.length || solo.includes(basename(f, ".png"))));
for (const f of pngs) {
  const n = basename(f, ".png");
  for (const w of [1280, 1920, 2560]) {
    const base = sharp(join(dir, f)).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(join(destino, `${n}-${w}.avif`));
    await base.clone().webp({ quality: 74, effort: 5 }).toFile(join(destino, `${n}-${w}.webp`));
  }
  console.log("ok", n);
}
