import sharp from "sharp";
const S = process.argv[2], D = process.argv[3];
// Caja en CSS px a 1440×900 (DSF 2): del rótulo «Esto dice el SECOP de» al final de «Tu competencia»,
// sin la tarjeta de registro de la derecha.
// Uso: node recortar.mjs <carpeta con cord-light.png y cord-dark.png> <destino>
const [x0, y0, x1, y1] = [48 - 24, 120 - 24, 1016, 1336].map((v) => v * 2);
for (const t of ["light", "dark"]) {
  const nombre = t === "light" ? "claro" : "oscuro";
  const base = sharp(`${S}/cord-${t}.png`).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
  for (const w of [860, 1712]) {
    await base.clone().resize({ width: w }).webp({ quality: 82 }).toFile(`${D}/ejemplo-${nombre}-${w}.webp`);
    await base.clone().resize({ width: w }).avif({ quality: 55 }).toFile(`${D}/ejemplo-${nombre}-${w}.avif`);
  }
}
const m = await sharp(`${D}/ejemplo-claro-1712.webp`).metadata();
console.log(m.width, m.height);
