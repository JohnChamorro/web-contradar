"""Texturas de las hojas para documentos.py: una página de pliego con lo que
ContRadar marca y tres formatos llenos. Todo es de ejemplo: empresa, persona y
cifras inventadas (901234567, Cordillera del Sur).

python3 texturas.py   →   tex/pliego.png, tex/formato-{1,2,3}.png
"""
from PIL import Image, ImageDraw, ImageFont
import os, textwrap
D = "/usr/share/fonts/truetype/dejavu/"
F = lambda n, s: ImageFont.truetype(D + n, s)
W, H = 1654, 2339; M = 170
TINTA, GRIS, AZUL = (26, 32, 44), (108, 118, 132), (13, 68, 136)
SAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")

def hoja():
    im = Image.new("RGB", (W, H), (252, 252, 250)); return im, ImageDraw.Draw(im)

def parrafo(d, y, txt, f, ancho=74, color=TINTA, inter=1.5, x=M, marca=None):
    alto = int(f.size * inter)
    for ln in textwrap.wrap(txt, ancho):
        if marca: d.rectangle([x - 8, y - 3, x + d.textlength(ln, font=f) + 8, y + alto - 6], fill=marca)
        d.text((x, y), ln, font=f, fill=color); y += alto
    return y

def pliego():
    im, d = hoja(); y = 150
    d.text((M, y), "MUNICIPIO DE TIMBÍO · SECRETARÍA DE INFRAESTRUCTURA", font=F("DejaVuSans.ttf", 22), fill=GRIS); y += 44
    d.text((M, y), "Licitación pública LP-014-2026 · Pliego de condiciones", font=F("DejaVuSans.ttf", 22), fill=GRIS); y += 40
    d.line([M, y, W - M, y], fill=(190, 196, 204), width=2); y += 60
    d.text((M, y), "CAPÍTULO 4", font=F("DejaVuSans-Bold.ttf", 26), fill=GRIS); y += 46
    d.text((M, y), "Requisitos habilitantes", font=F("DejaVuSerif-Bold.ttf", 54), fill=TINTA); y += 110
    s, b = F("DejaVuSerif.ttf", 29), F("DejaVuSerif-Bold.ttf", 31)
    AZ, AM, VE = (196, 220, 248), (250, 226, 178), (198, 234, 220)
    bloques = [
        ("4.1  Experiencia del proponente", "El proponente deberá acreditar experiencia en máximo tres (3) contratos ejecutados y liquidados, cuyo objeto corresponda a construcción, mejoramiento o rehabilitación de vías terciarias, inscritos en el RUP y clasificados en el código UNSPSC 721410.", AZ,
         "La sumatoria de los contratos aportados, expresada en SMMLV, deberá ser igual o superior al cien por ciento (100 %) del presupuesto oficial."),
        ("4.2  Indicadores financieros", "Se verificarán con la información del RUP vigente y en firme: índice de liquidez mayor o igual a 1,5; índice de endeudamiento menor o igual a 0,70; razón de cobertura de intereses mayor o igual a 1,0.", AZ, None),
        ("4.3  Garantía de seriedad de la oferta", "La oferta deberá estar acompañada de una garantía de seriedad por el diez por ciento (10 %) del presupuesto oficial, con vigencia de noventa (90) días contados desde la fecha de cierre. La no entrega de la garantía junto con la oferta no es subsanable.", AM, None),
        ("4.4  Capacidad residual de contratación (K)", "La capacidad residual del proponente deberá ser igual o superior a la capacidad residual del proceso, calculada según la metodología de Colombia Compra Eficiente.", VE,
         "En proponentes plurales se sumará la capacidad residual de cada integrante."),
    ]
    for t, cuerpo, marca, extra in bloques:
        d.text((M, y), t, font=b, fill=TINTA); y += 62
        y = parrafo(d, y, cuerpo, s, marca=marca) + 18
        if extra: y = parrafo(d, y, extra, s) + 18
        y += 34
    d.line([M, H - 190, W - M, H - 190], fill=(190, 196, 204), width=2)
    d.text((M, H - 160), "Pliego de condiciones · Versión definitiva", font=F("DejaVuSans.ttf", 22), fill=GRIS)
    d.text((W - M - 150, H - 160), "Página 31", font=F("DejaVuSans.ttf", 22), fill=GRIS)
    im.save(os.path.join(SAL, "pliego.png"))

def formato(n, titulo, campos, tabla=None, firma=True):
    im, d = hoja(); y = 150
    d.text((M, y), "MUNICIPIO DE TIMBÍO · LP-014-2026", font=F("DejaVuSans.ttf", 22), fill=GRIS)
    d.text((W - M - 190, y), f"FORMATO {n}", font=F("DejaVuSans-Bold.ttf", 24), fill=GRIS); y += 46
    d.line([M, y, W - M, y], fill=(190, 196, 204), width=2); y += 64
    d.text((M, y), titulo, font=F("DejaVuSerif-Bold.ttf", 50), fill=TINTA); y += 130
    et, va = F("DejaVuSans.ttf", 24), F("DejaVuSansMono.ttf", 34)
    for k, v in campos:
        d.text((M, y), k, font=et, fill=GRIS); y += 40
        d.text((M + 6, y), v, font=va, fill=AZUL); y += 52
        d.line([M, y, W - M, y], fill=(150, 158, 170), width=2); y += 46
    if tabla:
        y += 20; cols = tabla[0]; xs = [M, M + 150, M + 880, W - M]
        d.rectangle([M, y, W - M, y + 60], fill=(234, 238, 243))
        for i, c in enumerate(cols): d.text((xs[i] + 14, y + 16), c, font=F("DejaVuSans-Bold.ttf", 22), fill=TINTA)
        y += 60
        for fila in tabla[1:]:
            for i, c in enumerate(fila): d.text((xs[i] + 14, y + 18), c, font=F("DejaVuSansMono.ttf", 26), fill=AZUL)
            y += 70; d.line([M, y, W - M, y], fill=(190, 196, 204), width=2)
        d.rectangle([M, y - 70 * (len(tabla) - 1) - 60, W - M, y], outline=(150, 158, 170), width=2)
    if firma:
        d.line([M, H - 330, M + 620, H - 330], fill=TINTA, width=2)
        d.text((M, H - 310), "Firma del representante legal", font=et, fill=GRIS)
    d.text((M, H - 160), "Lleno con los datos de la empresa. Revísalo antes de firmar.", font=F("DejaVuSans.ttf", 22), fill=GRIS)
    im.save(os.path.join(SAL, f"formato-{n}.png"))

os.makedirs(SAL, exist_ok=True)
pliego()
base = [("Proponente", "Cordillera del Sur S.A.S."), ("NIT", "901234567-1"), ("Representante legal", "Laura Rincón Ordóñez"), ("Dirección", "Carrera 9 # 14-32, Popayán"), ("Correo", "licitaciones@cordilleradelsur.example")]
formato(1, "Carta de presentación", base + [("Valor de la oferta", "La diligencia el proponente"), ("Plazo de ejecución", "Cuatro (4) meses")])
formato(4, "Experiencia del proponente", base[:2], tabla=[["N.º", "Objeto del contrato", "Valor (SMMLV)"], ["1", "Mejoramiento vía La Sierra", "1.842"], ["2", "Rehabilitación vía Rosas", "1.215"], ["3", "Placa huella El Tambo", "  968"]])
formato(6, "Capacidad residual (K)", base[:2] + [("Capacidad de organización (CO)", "$ 6.480.000.000"), ("Experiencia (E)", "120 puntos"), ("Capacidad financiera (CF)", "40 puntos"), ("Saldos de contratos en ejecución (SCE)", "$ 1.930.000.000"), ("Capacidad residual del proponente", "$ 8.438.000.000")])
print("ok", os.listdir(SAL))
