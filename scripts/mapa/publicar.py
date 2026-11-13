"""Recorta los renders del mapa a lo que tiene tinta, los pasa a WebP con alfa
(1600 y 960 px) y escribe src/data/mapa-secop.json con las posiciones de cada
departamento ya en coordenadas del recorte (0..1).

python3 publicar.py <web-contradar>
"""
import json, sys
from pathlib import Path
from PIL import Image

AQUI = Path(__file__).resolve().parent
WEB = Path(sys.argv[1])
claro = Image.open(AQUI / "mapa-claro.png").convert("RGBA")
oscuro = Image.open(AQUI / "mapa-oscuro.png").convert("RGBA")
W, H = claro.size

# El plano que recibe la sombra deja un velo tenue en todo el cuadro (se veía
# como un rectángulo gris). Se resta ese piso al alfa: el mapa (alfa 255) no
# cambia y solo queda la sombra de contacto.
def sin_velo(im, piso=70):
    r, g, b, a = im.split()
    a = a.point(lambda v: 0 if v <= piso else round((v - piso) * 255 / (255 - piso)))
    return Image.merge("RGBA", (r, g, b, a))
claro, oscuro = sin_velo(claro), sin_velo(oscuro)

# caja: alfa > 8 en cualquiera de los dos (la sombra cuenta, es parte del objeto)
def caja(im):
    return im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
b1, b2 = caja(claro), caja(oscuro)
x0, y0 = min(b1[0], b2[0]), min(b1[1], b2[1])
x1, y1 = max(b1[2], b2[2]), max(b1[3], b2[3])
pad = int(0.02 * W)
x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
cw, ch = x1 - x0, y1 - y0
print("recorte", (x0, y0, x1, y1), cw, ch)

dest = WEB / "public" / "mapa"
dest.mkdir(parents=True, exist_ok=True)
for nombre, im in (("claro", claro), ("oscuro", oscuro)):
    r = im.crop((x0, y0, x1, y1))
    for ancho in (1600, 960):
        alto = round(ch * ancho / cw)
        r.resize((ancho, alto), Image.LANCZOS).save(dest / f"mapa-secop-{nombre}-{ancho}.webp", "WEBP", quality=84, method=6)
        print(nombre, ancho, alto, (dest / f"mapa-secop-{nombre}-{ancho}.webp").stat().st_size // 1024, "KB")

pos = json.loads((AQUI / "mapa-claro.json").read_text())
procesos = json.loads((AQUI / "procesos.json").read_text())
deptos = []
for nom, n in sorted(procesos.items(), key=lambda kv: -kv[1]):
    p = pos.get(nom)
    d = {"nombre": nom, "procesos": n}
    if p:
        d["x"] = round((p["x"] * W - x0) / cw, 4)
        d["y"] = round((p["y"] * H - y0) / ch, 4)
    deptos.append(d)
salida = {
    "periodo": "noviembre de 2025 a octubre de 2026",
    "medido": "2026-11-13",
    "fuente": "opportunities (base de dev), publish_date en el periodo, por departamento de la entidad",
    "total": sum(procesos.values()),
    "proporcion": round(ch / cw, 4),
    "deptos": deptos,
}
(WEB / "src" / "data" / "mapa-secop.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1))
print("total", salida["total"], "proporcion", salida["proporcion"])
