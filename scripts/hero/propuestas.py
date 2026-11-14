"""Cinco propuestas de hero (13-nov-2026). Una escena por concepto.

blender -b -P propuestas.py -- <radar|obra|viernes|mapa|pliego> <salida.png> <ancho> <alto> <muestras>

Look de cine: sin brillos ni halos, luz suave, colores sobrios. Render en CPU.
"""
import bpy, bmesh, json, math, random, sys
from pathlib import Path
from mathutils import Vector, Matrix, noise, geometry

AQUI = Path(__file__).resolve().parent
a = sys.argv[sys.argv.index("--") + 1:]
ESCENA, SALIDA, ANCHO, ALTO, MUESTRAS = a[0], a[1], int(a[2]), int(a[3]), int(a[4])

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
random.seed(7)

def lin(h, alfa=1.0):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (alfa,)

def mat(nombre, color, rug=0.7, metal=0.0, emision=0.0, alfa=1.0):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color); b.inputs["Roughness"].default_value = rug
    b.inputs["Metallic"].default_value = metal
    if emision:
        b.inputs["Emission Color"].default_value = lin(color); b.inputs["Emission Strength"].default_value = emision
    if alfa < 1:
        b.inputs["Alpha"].default_value = alfa
    return m

def obj(nombre, bm, m, suave=False):
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); esc.collection.objects.link(o); me.materials.append(m)
    if suave:
        for p in me.polygons: p.use_smooth = True
    return o

class Lote:
    """Muchas cajas y cilindros en una sola malla por material."""
    def __init__(self): self.b = {}
    def _bm(self, m): return self.b.setdefault(m.name, (bmesh.new(), m))[0]
    def caja(self, m, loc, tam, rot=(0, 0, 0)):
        M = Matrix.Translation(loc) @ Matrix.Rotation(rot[2], 4, "Z") @ Matrix.Rotation(rot[1], 4, "Y") @ Matrix.Rotation(rot[0], 4, "X") @ Matrix.Diagonal((*tam, 1))
        bmesh.ops.create_cube(self._bm(m), size=1.0, matrix=M)
    def cil(self, m, loc, r, h, seg=32, rot=(0, 0, 0)):
        M = Matrix.Translation(loc) @ Matrix.Rotation(rot[2], 4, "Z") @ Matrix.Rotation(rot[1], 4, "Y") @ Matrix.Rotation(rot[0], 4, "X")
        bmesh.ops.create_cone(self._bm(m), cap_ends=True, segments=seg, radius1=r, radius2=r, depth=h, matrix=M)
    def esfera(self, m, loc, r):
        bmesh.ops.create_uvsphere(self._bm(m), u_segments=16, v_segments=10, radius=r, matrix=Matrix.Translation(loc))
    def anillo(self, m, centro, r, ancho, z=0.0, seg=180):
        bm = self._bm(m); vs = []
        for i in range(seg):
            t = 2 * math.pi * i / seg
            vs.append((bm.verts.new((centro[0] + r * math.cos(t), centro[1] + r * math.sin(t), z)),
                       bm.verts.new((centro[0] + (r + ancho) * math.cos(t), centro[1] + (r + ancho) * math.sin(t), z))))
        for i in range(seg):
            a_, b_ = vs[i], vs[(i + 1) % seg]
            bm.faces.new((a_[0], a_[1], b_[1], b_[0]))
    def volcar(self, bisel=0.0, suave=()):
        for n, (bm, m) in self.b.items():
            o = obj("lote_" + n, bm, m, suave=n in suave)
            if bisel:
                bv = o.modifiers.new("b", "BEVEL"); bv.width = bisel; bv.segments = 2; bv.limit_method = "ANGLE"

def luz(nombre, energia, tam, loc, apunta, color=(1, 1, 1)):
    l = bpy.data.lights.new(nombre, "AREA"); l.energy = energia; l.size = tam; l.color = color
    o = bpy.data.objects.new(nombre, l); esc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(apunta) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); return o

def sol(energia, apunta_desde, angulo=2.0, color=(1, 1, 1)):
    l = bpy.data.lights.new("sol", "SUN"); l.energy = energia; l.angle = math.radians(angulo); l.color = color
    o = bpy.data.objects.new("sol", l); esc.collection.objects.link(o)
    o.rotation_euler = (-Vector(apunta_desde)).to_track_quat("-Z", "Y").to_euler(); return o

def camara(loc, mira, lente, foco=None, f=4.0):
    cd = bpy.data.cameras.new("cam"); cd.lens = lente
    c = bpy.data.objects.new("cam", cd); esc.collection.objects.link(c); esc.camera = c
    c.location = loc; c.rotation_euler = (Vector(mira) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if foco is not None:
        cd.dof.use_dof = True; cd.dof.focus_distance = (Vector(foco) - Vector(loc)).length; cd.dof.aperture_fstop = f
    return c

def mundo(color, fuerza):
    w = bpy.data.worlds.new("w"); esc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = lin(color); bg.inputs["Strength"].default_value = fuerza

def piso(color, rug=0.9, tam=300, z=0.0):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=tam, matrix=Matrix.Translation((0, 0, z)))
    return obj("piso", bm, mat("piso", color, rug))

# ════════════════════════════════════════════════════════════════════════
def escena_radar():
    """El instrumento: una consola de radar real. Oscura, con metal y vidrio."""
    TINTA, VIDRIO, LINEA, AZUL, CLARO = "#0A1628", "#0C1B30", "#33475F", "#2F6FBF", "#9CC3F0"
    mundo(TINTA, 0.15); piso("#070F1C", 0.55)
    L = Lote()
    m_vid = mat("vidrio", VIDRIO, 0.5); m_lin = mat("linea", LINEA, 0.5); m_bis = mat("bisel", "#16263B", 0.35, metal=0.9)
    m_tenue = mat("tenue", "#46618B", 0.5); m_tuyo = mat("tuyo", CLARO, 0.4, emision=1.2); m_doc = mat("doc", "#E8EDF3", 0.6)
    m_cuna = mat("cuna", AZUL, 0.5, alfa=0.38)
    R = 3.0
    L.cil(m_vid, (0, 0, 0.05), R, 0.1, seg=128)
    L.cil(m_bis, (0, 0, 0.03), R + 0.22, 0.06, seg=128)
    for r in (0.75, 1.5, 2.25, 2.97):
        L.anillo(m_lin, (0, 0), r, 0.012, z=0.1012)
    for ang in range(0, 180, 30):
        L.caja(m_lin, (0, 0, 0.1012), (2 * R, 0.006, 0.0006), rot=(0, 0, math.radians(ang)))
    for i in range(72):  # marcas del bisel
        t = math.radians(i * 5); largo = 0.12 if i % 6 == 0 else 0.05
        L.caja(m_tenue, ((R + 0.1) * math.cos(t), (R + 0.1) * math.sin(t), 0.062), (largo, 0.012, 0.004), rot=(0, 0, t))
    # la cuña del barrido
    bm = L._bm(m_cuna); c = bm.verts.new((0, 0, 0.1018)); a0, a1 = math.radians(18), math.radians(62); prev = None
    for i in range(25):
        t = a0 + (a1 - a0) * i / 24; v = bm.verts.new((R * 0.985 * math.cos(t), R * 0.985 * math.sin(t), 0.1018))
        if prev: bm.faces.new((c, prev, v))
        prev = v
    # los puntos: muchos tenues, pocos «para ti»
    for _ in range(70):
        r = R * math.sqrt(random.uniform(0.02, 0.92)); t = random.uniform(0, 2 * math.pi)
        L.cil(m_tenue, (r * math.cos(t), r * math.sin(t), 0.105), 0.028, 0.012, seg=16)
    tuyos = [(1.25, 0.95), (-0.9, 1.6), (0.35, -1.5), (2.05, -0.35), (-1.8, -0.7)]
    for i, (x, y) in enumerate(tuyos):
        h = 0.5 if i == 0 else 0.26
        L.cil(m_tuyo, (x, y, 0.1 + h / 2), 0.008, h, seg=8); L.esfera(m_tuyo, (x, y, 0.1 + h), 0.05)
        L.anillo(m_tuyo, (x, y), 0.11, 0.008, z=0.1022, seg=48)
    x, y = tuyos[0]  # el principal lleva su pliego
    L.caja(m_doc, (x + 0.02, y, 0.1 + 0.5 + 0.2), (0.21, 0.012, 0.29), rot=(0, 0, math.radians(-28)))
    L.volcar(suave=("vidrio", "bisel", "tuyo"))
    luz("clave", 500, 7, (6, -5, 6), (0.5, 0.5, 0)); luz("contra", 1400, 6, (-6, 7, 1.6), (0, 0, 0.2), color=(0.72, 0.84, 1))
    camara((2.6, -5.4, 1.75), (0.55, 0.25, 0.25), 38, foco=(x, y, 0.6), f=3.2)

# ════════════════════════════════════════════════════════════════════════
def escena_obra():
    """La maqueta: el territorio en capas de cartón, la vía y un puente azul."""
    BLANCO = "#F4F5F7"
    mundo("#FFFFFF", 0.55);
    m_t = mat("terreno", BLANCO, 0.85); m_via = mat("via", "#B7C3D0", 0.7); m_p = mat("puente", "#0D4488", 0.45)
    m_c = mat("casa", "#FFFFFF", 0.8); m_g = mat("grua", "#E08700", 0.5); m_agua = mat("agua", "#C9D8E8", 0.25)
    paso = 0.07
    def rio(x): return 0.9 * math.sin(x * 0.55) + 0.25 * math.sin(x * 1.7)
    def h(x, y):
        d = abs(y - rio(x))
        base = 0.55 + 0.5 * noise.noise(Vector((x * 0.28, y * 0.28, 0.3))) + 0.22 * noise.noise(Vector((x * 0.9, y * 0.9, 2.0)))
        canon = min(1.0, (d / 1.05)) ** 1.6
        z = max(0.0, base * canon + 0.12 * (1 - canon) * 0 + 0.35 * (abs(y) / 5))
        return math.floor(z / paso) * paso
    N = 300; X0, X1, Y0, Y1 = -8, 8, -5, 6
    bm = bmesh.new(); vs = [[None] * (N + 1) for _ in range(N + 1)]
    for i in range(N + 1):
        for j in range(N + 1):
            x = X0 + (X1 - X0) * i / N; y = Y0 + (Y1 - Y0) * j / N
            vs[i][j] = bm.verts.new((x, y, h(x, y)))
    for i in range(N):
        for j in range(N):
            bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
    obj("terreno", bm, m_t)
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=20, matrix=Matrix.Translation((0, 0, 0.012)))
    obj("agua", bm, m_agua)
    L = Lote()
    # la vía: baja por la ladera norte, cruza el cañón por el puente y sigue al sur
    PX = 0.6; yr = rio(PX); zt = max(h(PX, yr + 1.25), h(PX, yr - 1.25)) + 0.02
    def via(y_a, y_b):
        n = 60
        for k in range(n):
            y = y_a + (y_b - y_a) * (k + 0.5) / n; x = PX + 0.5 * math.sin((y - yr) * 0.5) * (abs(y - yr) > 1.3)
            L.caja(m_via, (x, y, max(h(x, y), zt * (abs(y - yr) < 1.6)) + 0.012 - 0.1), (0.16, abs(y_b - y_a) / n * 1.02, 0.2))
    via(yr + 1.25, Y1); via(Y0, yr - 1.25)
    L.caja(m_p, (PX, yr, zt + 0.02), (0.2, 2.6, 0.05))                          # tablero
    for s in (-1, 1):
        L.caja(m_p, (PX + s * 0.11, yr, zt + 0.075), (0.012, 2.6, 0.06))        # barandas
    for dy in (-0.75, 0, 0.75):
        L.caja(m_c, (PX, yr + dy, zt / 2), (0.09, 0.09, zt))                     # pilas
    # el pueblo y la grúa
    for _ in range(46):
        x = random.uniform(2.2, 4.6); y = yr + random.uniform(1.7, 3.6); s = random.uniform(0.09, 0.2)
        L.caja(m_c, (x, y, h(x, y) + s * 0.4), (s, s * random.uniform(0.8, 1.5), s * 0.8), rot=(0, 0, random.uniform(0, 1.5)))
    gx, gy = PX - 0.55, yr + 1.5; gz = h(gx, gy)
    L.caja(m_g, (gx, gy, gz + 0.3), (0.022, 0.022, 0.6)); L.caja(m_g, (gx + 0.14, gy - 0.12, gz + 0.585), (0.46, 0.016, 0.016), rot=(0, 0, math.radians(-40)))
    L.volcar()
    sol(5.5, (-6, -2.5, 2.4), angulo=2.5, color=(1, 0.95, 0.88)); luz("relleno", 300, 20, (6, -8, 8), (0, 0, 0))
    camara((-4.6, -8.2, 4.4), (1.1, yr + 0.3, 0.3), 50, foco=(PX, yr, zt), f=5.6)

# ════════════════════════════════════════════════════════════════════════
def escena_viernes():
    """Viernes, 4:57 p. m.: el escritorio, el reloj y la luz de la tarde por la persiana."""
    mundo("#1A1410", 0.12)
    m_mesa = mat("mesa", "#4A3222", 0.42); m_pared = mat("pared", "#B9B2A6", 0.9); m_papel = mat("papel", "#EFEDE6", 0.75)
    m_carp = mat("carp", "#0D4488", 0.5); m_lap = mat("lap", "#2A2D33", 0.35, metal=0.7); m_taza = mat("taza", "#E8E4DA", 0.3)
    m_reloj = mat("reloj", "#F3F1EA", 0.5); m_neg = mat("neg", "#14161A", 0.4); m_per = mat("per", "#111111", 0.9)
    m_rojo = mat("rojo", "#A5231A", 0.45)
    L = Lote()
    L.caja(m_mesa, (0, 0, 0.72), (3.6, 1.5, 0.05)); L.caja(m_pared, (0, 1.1, 1.6), (9, 0.05, 4))
    # el pliego: una pila gruesa con carpeta azul encima
    z = 0.745
    for k in range(34):
        hh = random.choice([0.004, 0.006, 0.009])
        L.caja(m_papel, (0.25 + random.uniform(-.006, .006), 0.05 + random.uniform(-.006, .006), z + hh / 2), (0.225, 0.3, hh), rot=(0, 0, 0.35 + random.uniform(-.04, .04)))
        z += hh
    L.caja(m_carp, (0.25, 0.05, z + 0.004), (0.235, 0.31, 0.008), rot=(0, 0, 0.38))
    for k in range(3):  # hojas sueltas
        L.caja(m_papel, (-0.2 - k * 0.16, -0.2 + k * 0.05, 0.746 + k * 0.001), (0.21, 0.297, 0.001), rot=(0, 0, -0.3 - 0.25 * k))
    # portátil visto desde atrás, taza y bolígrafo
    L.caja(m_lap, (-0.75, 0.25, 0.752), (0.34, 0.24, 0.014), rot=(0, 0, -0.35))
    L.caja(m_lap, (-0.79, 0.36, 0.865), (0.34, 0.008, 0.23), rot=(math.radians(-14), 0, -0.35))
    L.cil(m_taza, (0.82, 0.28, 0.795), 0.042, 0.095); L.cil(m_neg, (0.82, 0.28, 0.838), 0.036, 0.004)
    L.cil(m_neg, (0.62, -0.3, 0.751), 0.005, 0.14, seg=10, rot=(math.radians(90), 0, 0.9))
    # el reloj: 4:57
    cx, cz, yv = 0.62, 1.56, 1.07
    L.cil(m_neg, (cx, yv, cz), 0.245, 0.03, seg=64, rot=(math.radians(90), 0, 0)); L.cil(m_reloj, (cx, yv - 0.012, cz), 0.225, 0.02, seg=64, rot=(math.radians(90), 0, 0))
    for i in range(12):
        t = math.radians(i * 30); largo = 0.035 if i % 3 == 0 else 0.018
        L.caja(m_neg, (cx + 0.19 * math.sin(t), yv - 0.024, cz + 0.19 * math.cos(t)), (0.008, 0.003, largo), rot=(0, -t, 0))
    def manecilla(ang, largo, ancho, m, dy):
        t = math.radians(ang)
        L.caja(m, (cx + largo / 2 * math.sin(t), yv - dy, cz + largo / 2 * math.cos(t)), (ancho, 0.003, largo), rot=(0, -t, 0))
    manecilla((4 + 57 / 60) * 30, 0.11, 0.012, m_neg, 0.027); manecilla(57 * 6, 0.17, 0.008, m_neg, 0.030); manecilla(200, 0.18, 0.003, m_rojo, 0.033)
    # la persiana: láminas entre el sol y la escena
    for k in range(26):
        L.caja(m_per, (-4.2, -1.2, 0.6 + k * 0.105), (0.02, 3.4, 0.062), rot=(0, math.radians(18), math.radians(28)))
    L.volcar(bisel=0.0015, suave=("taza", "reloj", "neg"))
    sol(9, (-6, -2.6, 2.3), angulo=1.2, color=(1, 0.72, 0.46)); luz("relleno", 110, 6, (2, -3, 2.5), (0, 0, 1), color=(0.7, 0.8, 1))
    camara((-0.35, -2.5, 1.3), (0.15, 0.6, 1.14), 38, foco=(0.25, 0.05, 0.95), f=4.0)

# ════════════════════════════════════════════════════════════════════════
def escena_mapa():
    """El país de noche: el relieve de la contratación y un alfiler por cada lote de procesos."""
    mundo("#050B15", 0.2); piso("#050B15", 0.6)
    datos = json.loads((AQUI.parent / "mapa" / "procesos.json").read_text())
    geo = json.loads((AQUI.parent / "mapa" / "geo" / "col.geojson").read_text())
    K = math.cos(math.radians(4.5)); E = 0.55
    def proy(lon, lat): return ((lon + 73.5) * K * E, (lat - 4.5) * E)
    vmax = max(datos.values()); orden = sorted(datos, key=datos.get); rango = {k: i / (len(orden) - 1) for i, k in enumerate(orden)}
    L = Lote(); m_pin = mat("pin", "#9CC3F0", 0.4, emision=1.6); m_anillo = mat("anillo", "#2F6FBF", 0.5)
    def dentro(p, ring):
        x, y = p; c = False
        for i in range(len(ring)):
            (x1, y1), (x2, y2) = ring[i], ring[i - 1]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
        return c
    for f in geo["features"]:
        nom = f["properties"].get("name")
        if not nom: continue
        nom = {"Bogota": "Bogotá D.C."}.get(nom, nom); n = datos.get(nom)
        if n is None or nom.startswith("San Andr"): continue
        alto = 0.05 + 1.1 * math.sqrt(n / vmax); t = rango[nom] ** 1.5
        c0, c1 = lin("#14233A"), lin("#3C5F8F"); m = bpy.data.materials.new(nom); m.use_nodes = True
        bs = m.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = tuple(c0[i] + (c1[i] - c0[i]) * t for i in range(3)) + (1,); bs.inputs["Roughness"].default_value = 0.55
        bm = bmesh.new(); polis = [f["geometry"]["coordinates"]] if f["geometry"]["type"] == "Polygon" else f["geometry"]["coordinates"]
        mayor = None
        for poli in polis:
            ext = [proy(*p) for p in poli[0]][:-1][::5]
            if len(ext) < 3: continue
            ring = [Vector((x, y, 0)) for x, y in ext]; tris = geometry.tessellate_polygon([ring])
            vb = [bm.verts.new((v.x, v.y, 0)) for v in ring]; vt = [bm.verts.new((v.x, v.y, alto)) for v in ring]
            for a_, b_, c_ in tris:
                try: bm.faces.new((vt[a_], vt[b_], vt[c_]))
                except ValueError: pass
            for i in range(len(ring)):
                j = (i + 1) % len(ring)
                try: bm.faces.new((vb[i], vb[j], vt[j], vt[i]))
                except ValueError: pass
            if mayor is None or len(ext) > len(mayor): mayor = ext
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); obj(nom, bm, m)
        # alfileres: uno por cada ~4.000 procesos, repartidos dentro del departamento
        xs = [p[0] for p in mayor]; ys = [p[1] for p in mayor]; puestos = 0; intentos = 0
        while puestos < max(1, round(n / 5000)) and intentos < 1500:
            intentos += 1; p = (random.uniform(min(xs), max(xs)), random.uniform(min(ys), max(ys)))
            if dentro(p, mayor):
                hh = random.uniform(0.10, 0.32); L.cil(m_pin, (p[0], p[1], alto + hh / 2), 0.0035, hh, seg=6); L.esfera(m_pin, (p[0], p[1], alto + hh), 0.013); puestos += 1
    for r in (2.2, 3.4, 4.6, 5.8, 7.0):
        L.anillo(m_anillo, (0.2, 0.2), r, 0.012, z=0.004)
    L.volcar(suave=("pin",))
    luz("clave", 3200, 6, (-9, -5, 7), (0, 0, 0), color=(1, 0.86, 0.72)); luz("contra", 1800, 5, (7, 9, 4), (0, 0, 0.5), color=(0.7, 0.82, 1))
    camara((-1.7, -6.3, 2.3), (0.15, 0.35, 0.35), 30, foco=(-0.2, -0.6, 0.6), f=4.0)

# ════════════════════════════════════════════════════════════════════════
def escena_pliego():
    """El pliego de cerca: renglones, tres resaltados y las banderitas de quien lo lee."""
    mundo("#FFFFFF", 0.7); piso("#E9EDF2", 0.8, z=-0.004)
    m_h = mat("hoja", "#FBFBF9", 0.7); m_tx = mat("tx", "#5A6672", 0.8); m_ti = mat("ti", "#0A1628", 0.8)
    m_j = mat("jade", "#3AAE8C", 0.7, alfa=0.42); m_a = mat("ambar", "#F2B347", 0.7, alfa=0.5); m_z = mat("azul", "#2F6FBF", 0.7, alfa=0.36)
    m_bj = mat("bj", "#0E7A5F", 0.5); m_ba = mat("ba", "#E08700", 0.5); m_bz = mat("bz", "#0D4488", 0.5)
    L = Lote(); W, H = 0.216, 0.33
    for k in range(40):  # el fajo debajo
        L.caja(m_h, (random.uniform(-.004, .004), random.uniform(-.004, .004), -0.004 + k * 0.0001 * 1), (W, H, 0.0001), rot=(0, 0, random.uniform(-.03, .03)))
    L.caja(m_h, (0, 0, 0.0002), (W, H, 0.0003))
    y = H / 2 - 0.03; z = 0.0005; resalta = {7: (m_j, m_bj), 15: (m_a, m_ba), 24: (m_z, m_bz)}; n = 0
    L.caja(m_ti, (-0.03, y, z), (0.11, 0.0055, 0.0001)); y -= 0.016
    while y > -H / 2 + 0.025:
        if n % 6 == 5:
            y -= 0.006; L.caja(m_ti, (-W / 2 + 0.022 + 0.03, y, z), (0.06, 0.0034, 0.0001)); y -= 0.0085
        largo = (W - 0.044) * (random.uniform(0.45, 0.8) if n % 6 == 4 else random.uniform(0.9, 1.0))
        x = -W / 2 + 0.022 + largo / 2
        L.caja(m_tx, (x, y, z), (largo, 0.0021, 0.0001))
        if n in resalta:
            mr, mb = resalta[n]
            L.caja(mr, (x, y, z + 0.00015), (largo + 0.004, 0.0062, 0.00005))
            L.caja(mb, (W / 2 + 0.006, y, 0.0006), (0.022, 0.011, 0.0002))  # banderita que asoma
        y -= 0.0071; n += 1
    L.volcar()
    luz("ventana", 22, 0.9, (-0.5, 0.35, 0.45), (0, 0, 0)); luz("relleno", 4, 1.2, (0.5, -0.4, 0.4), (0, 0, 0))
    yo = H / 2 - 0.03 - 0.016 - 15 * 0.0071 - 2 * 0.0145
    camara((0.2, yo - 0.2, 0.13), (0.01, yo + 0.02, 0.0), 60, foco=(0.04, yo, 0.0005), f=6.3)

{"radar": escena_radar, "obra": escena_obra, "viernes": escena_viernes, "mapa": escena_mapa, "pliego": escena_pliego}[ESCENA]()

esc.render.engine = "CYCLES"; esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ALTO
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Base Contrast"
esc.render.image_settings.file_format = "PNG"; esc.render.filepath = SALIDA
bpy.ops.render.render(write_still=True)
print("LISTO", ESCENA)
