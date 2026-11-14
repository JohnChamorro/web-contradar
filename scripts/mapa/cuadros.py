"""Cuadros de «el país sube»: el mismo render del mapa con la altura de 0 a 0,8
(MAPA_K), recortados con la MISMA caja que el mapa final para que calcen encima.

  for t in claro oscuro; do for i in 0 1 2 3 4 5; do
    MAPA_CPU=1 MAPA_K=$(python3 -c "print($i/5)") blender -b -P mapa_relieve.py -- $t <dir>/$t-$i.png 1440 900 64
  done; done
  python3 cuadros.py <dir> <web-contradar>

El cuadro 5 (K=1) solo sirve para medir la caja; en la web lo reemplaza el mapa
final de publicar.py, que va a más resolución.
"""
import json, sys
from pathlib import Path
from PIL import Image
DIR, WEB = Path(sys.argv[1]), Path(sys.argv[2])

def sin_velo(im, piso=70):
    r, g, b, a = im.split()
    a = a.point(lambda v: 0 if v <= piso else round((v - piso) * 255 / (255 - piso)))
    return Image.merge("RGBA", (r, g, b, a))
def caja(im): return im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()

fin = {t: sin_velo(Image.open(DIR / f"{t}-5.png").convert("RGBA")) for t in ("claro", "oscuro")}
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
    for i in range(5):
        im = sin_velo(Image.open(DIR / f"{t}-{i}.png").convert("RGBA")).crop((x0, y0, x1, y1)).resize((ancho, alto), Image.LANCZOS)
        f = dest / f"sube-{t}-{i}.webp"; im.save(f, "WEBP", quality=78, method=6); print(f.name, f.stat().st_size // 1024, "KB")
