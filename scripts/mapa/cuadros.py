"""Cuadros de «el país sube»: el mismo render del mapa con la altura de 0 a
(N-1)/N (MAPA_K), recortados con la MISMA caja que el mapa final para que calcen
encima. N = 12 desde el 14-nov-2026 (antes 5: se veía a saltos).

  N=12; for t in claro oscuro; do for i in $(seq 0 $N); do
    MAPA_CPU=1 MAPA_K=$(python3 -c "print($i/$N)") blender -b -P mapa_relieve.py -- $t <dir>/$t-$i.png 1440 900 64
  done; done
  python3 cuadros.py <dir> <web-contradar> $N

El cuadro N (K=1) solo sirve para medir la caja; en la web lo reemplaza el mapa
final de publicar.py, que va a más resolución. La web funde cada cuadro con el
siguiente (MapaSecop.astro), así que N cuadros se ven como un crecimiento
continuo.
"""
import json, sys
from pathlib import Path
from PIL import Image
DIR, WEB = Path(sys.argv[1]), Path(sys.argv[2])
N = int(sys.argv[3]) if len(sys.argv) > 3 else 12

def sin_velo(im, piso=70):
    r, g, b, a = im.split()
    a = a.point(lambda v: 0 if v <= piso else round((v - piso) * 255 / (255 - piso)))
    return Image.merge("RGBA", (r, g, b, a))
def caja(im): return im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()

fin = {t: sin_velo(Image.open(DIR / f"{t}-{N}.png").convert("RGBA")) for t in ("claro", "oscuro")}
W, H = fin["claro"].size
b1, b2 = caja(fin["claro"]), caja(fin["oscuro"])
pad = int(0.02 * W)
x0, y0 = max(0, min(b1[0], b2[0]) - pad), max(0, min(b1[1], b2[1]) - pad)
x1, y1 = min(W, max(b1[2], b2[2]) + pad), min(H, max(b1[3], b2[3]) + pad)
prop = (y1 - y0) / (x1 - x0)
esperada = json.loads((WEB / "src/data/mapa-secop.json").read_text())["proporcion"]
print("caja", (x0, y0, x1, y1), "proporción", round(prop, 4), "· la del mapa publicado:", esperada)
assert abs(prop - esperada) < 0.01, "la caja no calza con el mapa publicado: hay que volver a correr publicar.py"
dest = WEB / "public/mapa"; ancho = 960; alto = round(ancho * prop)
for t in ("claro", "oscuro"):
    for vieja in dest.glob(f"sube-{t}-*.webp"): vieja.unlink()
    for i in range(N):
        im = sin_velo(Image.open(DIR / f"{t}-{i}.png").convert("RGBA")).crop((x0, y0, x1, y1)).resize((ancho, alto), Image.LANCZOS)
        f = dest / f"sube-{t}-{i}.webp"; im.save(f, "WEBP", quality=74, method=6); print(f.name, f.stat().st_size // 1024, "KB")
