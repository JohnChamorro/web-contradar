"""Tres mezclas de «El país» con «La maqueta» (13-nov-2026). El puente azul manda.

blender -b -P mezclas.py -- <a|b|c> <salida.png> <ancho> <alto> <muestras>

a · El país en cartón blanco, visto en diagonal, con el puente entre sus dos cimas.
b · El país de noche en terrazas, el río Magdalena tallado y el puente que lo cruza.
c · El país en planta (vista cenital), sombras largas y el puente como trazo azul.
"""
import bpy, bmesh, json, math, random, sys
from pathlib import Path
from mathutils import Vector, Matrix, noise, geometry

AQUI = Path(__file__).resolve().parent
a = sys.argv[sys.argv.index("--") + 1:]
ESCENA, SALIDA, ANCHO, ALTO, MUESTRAS = a[0], a[1], int(a[2]), int(a[3]), int(a[4])
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
random.seed(11)

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

def mat(nombre, color, rug=0.7, emision=0.0):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color); b.inputs["Roughness"].default_value = rug
    if emision:
        b.inputs["Emission Color"].default_value = lin(color); b.inputs["Emission Strength"].default_value = emision
    return m

def mat_capas(nombre, c1, c2, paso):
    """Cartón laminado: bandas horizontales alternas en los cantos; la tapa, lisa."""
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    nt = m.node_tree; bs = nt.nodes["Principled BSDF"]; g = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 1 / paso
    fr = nt.nodes.new("ShaderNodeMath"); fr.operation = "FRACT"; gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.82
    sn = nt.nodes.new("ShaderNodeSeparateXYZ"); ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"
    lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.5
    y = nt.nodes.new("ShaderNodeMath"); y.operation = "MULTIPLY"
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["A"].default_value = lin(c1); mix.inputs["B"].default_value = lin(c2)
    nt.links.new(g.outputs["Position"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], mul.inputs[0]); nt.links.new(mul.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], gt.inputs[0])
    nt.links.new(g.outputs["Normal"], sn.inputs[0]); nt.links.new(sn.outputs["Z"], ab.inputs[0]); nt.links.new(ab.outputs[0], lt.inputs[0])
    nt.links.new(gt.outputs[0], y.inputs[0]); nt.links.new(lt.outputs[0], y.inputs[1])
    nt.links.new(y.outputs[0], mix.inputs["Factor"]); nt.links.new(mix.outputs["Result"], bs.inputs["Base Color"]); bs.inputs["Roughness"].default_value = 0.85
    return m

def obj(nombre, bm, m):
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); esc.collection.objects.link(o); me.materials.append(m); return o

class Lote:
    def __init__(self): self.b = {}
    def _bm(self, m): return self.b.setdefault(m.name, (bmesh.new(), m))[0]
    def caja(self, m, loc, tam, rot=(0, 0, 0)):
        M = Matrix.Translation(loc) @ Matrix.Rotation(rot[2], 4, "Z") @ Matrix.Rotation(rot[1], 4, "Y") @ Matrix.Diagonal((*tam, 1))
        bmesh.ops.create_cube(self._bm(m), size=1.0, matrix=M)
    def cil(self, m, loc, r, h, seg=8):
        bmesh.ops.create_cone(self._bm(m), cap_ends=True, segments=seg, radius1=r, radius2=r, depth=h, matrix=Matrix.Translation(loc))
    def esfera(self, m, loc, r):
        bmesh.ops.create_uvsphere(self._bm(m), u_segments=12, v_segments=8, radius=r, matrix=Matrix.Translation(loc))
    def anillo(self, m, c, r, ancho, z, seg=200):
        bm = self._bm(m); vs = []
        for i in range(seg):
            t = 2 * math.pi * i / seg
            vs.append((bm.verts.new((c[0] + r * math.cos(t), c[1] + r * math.sin(t), z)), bm.verts.new((c[0] + (r + ancho) * math.cos(t), c[1] + (r + ancho) * math.sin(t), z))))
        for i in range(seg):
            p, q = vs[i], vs[(i + 1) % seg]; bm.faces.new((p[0], p[1], q[1], q[0]))
    def volcar(self):
        for n, (bm, m) in self.b.items(): obj("lote_" + n, bm, m)

def luz(energia, tam, loc, apunta, color=(1, 1, 1)):
    l = bpy.data.lights.new("l", "AREA"); l.energy = energia; l.size = tam; l.color = color
    o = bpy.data.objects.new("l", l); esc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(apunta) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

def sol(energia, desde, angulo=2.0, color=(1, 1, 1)):
    l = bpy.data.lights.new("sol", "SUN"); l.energy = energia; l.angle = math.radians(angulo); l.color = color
    o = bpy.data.objects.new("sol", l); esc.collection.objects.link(o); o.rotation_euler = (-Vector(desde)).to_track_quat("-Z", "Y").to_euler()

def mundo(color, fuerza):
    w = bpy.data.worlds.new("w"); esc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = lin(color); bg.inputs["Strength"].default_value = fuerza

def piso(color, rug=0.9):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=300); obj("piso", bm, mat("piso", color, rug))

# ── Colombia ─────────────────────────────────────────────────────────────
datos = json.loads((AQUI.parent / "mapa" / "procesos.json").read_text())
geo = json.loads((AQUI.parent / "mapa" / "geo" / "col.geojson").read_text())
K = math.cos(math.radians(4.5)); E = 0.55
def proy(lon, lat): return ((lon + 73.5) * K * E, (lat - 4.5) * E)

def dp(pts, tol):
    if len(pts) < 4: return pts
    p, q = pts[0], pts[-1]; dx, dy = q[0] - p[0], q[1] - p[1]; Lg = math.hypot(dx, dy) or 1e-12; dm, im = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + q[0] * p[1] - q[1] * p[0]) / Lg
        if d > dm: dm, im = d, i
    return dp(pts[:im + 1], tol)[:-1] + dp(pts[im:], tol) if dm > tol else [p, q]
def dp_anillo(pts, tol):
    pts = pts[:-1] if pts[0] == pts[-1] else pts
    if len(pts) < 8: return pts
    m = len(pts) // 2; return dp(pts[:m + 1], tol)[:-1] + dp(pts[m:] + [pts[0]], tol)[:-1]

vmax = max(datos.values()); orden = sorted(datos, key=datos.get); rango = {k: i / (len(orden) - 1) for i, k in enumerate(orden)}
DEPTOS = []  # (nombre, [anillos exteriores], altura, rango, procesos)
for f in geo["features"]:
    nom = f["properties"].get("name")
    if not nom: continue
    nom = {"Bogota": "Bogotá D.C."}.get(nom, nom); n = datos.get(nom)
    if n is None or nom.startswith("San Andr"): continue
    polis = [f["geometry"]["coordinates"]] if f["geometry"]["type"] == "Polygon" else f["geometry"]["coordinates"]
    anillos = [r for r in (dp_anillo([proy(*p) for p in poli[0]], 0.003) for poli in polis) if len(r) >= 3]
    DEPTOS.append((nom, anillos, 0.08 + 1.25 * math.sqrt(n / vmax), rango[nom], n))

def centro(nom):
    for d in DEPTOS:
        if d[0] == nom:
            r = max(d[1], key=len); return Vector((sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r), d[2]))

def extruir(anillos, alto, m, nombre, bisel=0.006):
    bm = bmesh.new()
    for ext in anillos:
        ring = [Vector((x, y, 0)) for x, y in ext]; tris = geometry.tessellate_polygon([ring])
        vb = [bm.verts.new((v.x, v.y, 0)) for v in ring]; vt = [bm.verts.new((v.x, v.y, alto)) for v in ring]
        for p, q, r in tris:
            try: bm.faces.new((vt[p], vt[q], vt[r]))
            except ValueError: pass
        for i in range(len(ring)):
            j = (i + 1) % len(ring)
            try: bm.faces.new((vb[i], vb[j], vt[j], vt[i]))
            except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); o = obj(nombre, bm, m)
    if bisel:
        bv = o.modifiers.new("b", "BEVEL"); bv.width = bisel; bv.segments = 2; bv.limit_method = "ANGLE"; bv.angle_limit = math.radians(60)
    return o

def puente(L, p0, p1, m_azul, m_pila, ancho=0.07, grua=None):
    """Tablero recto de p0 a p1 (pueden ir a distinta altura), barandas y pilas hasta el piso."""
    d = p1 - p0; largo = d.length; yaw = math.atan2(d.y, d.x); pitch = -math.asin(d.z / largo); c = (p0 + p1) / 2
    L.caja(m_azul, c + Vector((0, 0, 0.016)), (largo, ancho, 0.034), rot=(0, pitch, yaw))
    lat = Vector((-math.sin(yaw), math.cos(yaw), 0))
    for s in (-1, 1):
        L.caja(m_azul, c + lat * s * ancho / 2 + Vector((0, 0, 0.048)), (largo, 0.008, 0.03), rot=(0, pitch, yaw))
    n = max(2, int(largo / 0.22))
    for k in range(1, n):
        p = p0 + d * (k / n); L.caja(m_pila, (p.x, p.y, p.z / 2), (0.022, ancho * 0.7, p.z), rot=(0, 0, yaw))
    if grua:
        g = p0 + lat * 0.09; L.caja(grua, (g.x, g.y, g.z + 0.16), (0.012, 0.012, 0.32)); L.caja(grua, (g.x + 0.07, g.y, g.z + 0.315), (0.24, 0.01, 0.01), rot=(0, 0, yaw + 0.5))

def pip(p, ring):
    x, y = p; c = False
    for i in range(len(ring)):
        (x1, y1), (x2, y2) = ring[i], ring[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c

def alfileres(L, m, cada=5000, alto=(0.06, 0.2)):
    for nom, anillos, h, _, n in DEPTOS:
        r = max(anillos, key=len); xs = [p[0] for p in r]; ys = [p[1] for p in r]; k = 0; it = 0
        while k < max(1, round(n / cada)) and it < 1500:
            it += 1; p = (random.uniform(min(xs), max(xs)), random.uniform(min(ys), max(ys)))
            if pip(p, r):
                hh = random.uniform(*alto); L.cil(m, (p[0], p[1], h + hh / 2), 0.003, hh, seg=6); L.esfera(m, (p[0], p[1], h + hh), 0.011); k += 1

def camara(loc, mira, lente, foco=None, f=5.6, orto=None):
    cd = bpy.data.cameras.new("cam"); cd.lens = lente
    c = bpy.data.objects.new("cam", cd); esc.collection.objects.link(c); esc.camera = c
    c.location = loc; c.rotation_euler = (Vector(mira) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if orto: cd.type = "ORTHO"; cd.ortho_scale = orto
    if foco is not None: cd.dof.use_dof = True; cd.dof.focus_distance = (Vector(foco) - Vector(loc)).length; cd.dof.aperture_fstop = f

# ════════════════════════════════════════════════════════════════════════
def pais_blanco(L, con_alfileres):
    m_az = mat("azul", "#0D4488", 0.42); m_pi = mat("pila", "#FFFFFF", 0.8); m_gr = mat("grua", "#E08700", 0.5)
    for nom, anillos, h, rg, _ in DEPTOS:
        # blanco cartón; los más activos, un punto más fríos, para que el relieve se lea
        t = rg ** 2.2; c1 = "#FAFBFC" if t < 0.3 else ("#E4EBF3" if t < 0.7 else "#C4D5E9")
        extruir(anillos, h, mat_capas("c_" + nom, c1, "#A9B7C7", 0.045), nom)
    p0, p1 = centro("Antioquia"), centro("Bogotá D.C.")
    d = (p1 - p0); d.z = 0; d.normalize()
    puente(L, p0 + d * 0.28, p1 - d * 0.02, m_az, m_pi, ancho=0.12, grua=m_gr)
    if con_alfileres: alfileres(L, mat("pin", "#0D4488", 0.5), cada=14000, alto=(0.05, 0.13))
    return p0, p1

def escena_a():
    mundo("#FFFFFF", 0.42); piso("#DDE5EE", 0.92); L = Lote()
    p0, p1 = pais_blanco(L, True); L.volcar()
    sol(5.2, (-5, -3.2, 2.6), angulo=2.2, color=(1, 0.95, 0.88)); luz(260, 18, (6, -7, 8), (0, 0, 0))
    m = (p0 + p1) / 2
    camara((m.x - 4.9, m.y - 9.8, 7.6), (m.x + 0.2, m.y - 0.35, 0.3), 50, foco=m, f=8)

def escena_c():
    mundo("#FFFFFF", 0.5); piso("#DDE5EE", 0.95); L = Lote()
    pais_blanco(L, False)
    m_an = mat("anillo", "#0D4488", 0.6); c = centro("Bogotá D.C.")
    for r in (0.9, 1.7, 2.5, 3.3): L.anillo(m_an, (c.x, c.y), r, 0.007, 0.002)
    L.volcar()
    sol(5.5, (-4.5, -3.2, 4.2), angulo=1.6, color=(1, 0.95, 0.88))
    camara((-3.6, -0.2, 30), (-3.6, -0.2, 0), 50, orto=19); esc.camera.rotation_euler = (0, 0, 0)

def escena_b(hero=False, cerca=False):
    """Terrazas con la silueta del país, el Magdalena tallado y el puente que lo cruza.
    hero=True es la toma de la portada: el país corrido a la derecha para dejar
    limpio el lado del texto, el puente algo más ancho y el piso mate del color
    del bloque tinta (--panel-ink), para que el velo se funda sin borde."""
    mundo("#0A1628" if hero else "#050B15", 0.22); piso("#0A1628" if hero else "#060D19", 0.92 if hero else 0.6); L = Lote()
    rio = [proy(*p) for p in [(-74.85, 11.0), (-74.75, 10.2), (-74.45, 9.2), (-73.95, 8.2), (-73.9, 7.1), (-74.35, 6.2), (-74.67, 5.45), (-74.85, 4.4), (-75.15, 3.3), (-75.6, 2.4), (-76.1, 1.9)]]
    def d_rio(x, y):
        m = 9
        for i in range(len(rio) - 1):
            (x1, y1), (x2, y2) = rio[i], rio[i + 1]; dx, dy = x2 - x1, y2 - y1
            t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy))); m = min(m, math.hypot(x - x1 - t * dx, y - y1 - t * dy))
        return m
    cajas = []
    for nom, anillos, h, rg, n in DEPTOS:
        for r in anillos:
            if len(r) < 12 and len(anillos) > 1: continue
            rs = dp_anillo(r + [r[0]], 0.012)
            cajas.append((min(p[0] for p in r), max(p[0] for p in r), min(p[1] for p in r), max(p[1] for p in r), rs, h))
    PASO = 0.05
    def H(x, y):
        for x0, x1, y0, y1, r, h in cajas:
            if x0 <= x <= x1 and y0 <= y <= y1 and pip((x, y), r):
                z = h * (0.82 + 0.3 * noise.noise(Vector((x * 1.3, y * 1.3, 0.7)))) + 0.05
                z *= 0.12 + 0.88 * min(1.0, d_rio(x, y) / 0.2) ** 1.4
                return max(PASO, math.floor(z / PASO) * PASO)
        return None
    N = 340; X0, X1, Y0, Y1 = -3.3, 3.9, -5.0, 4.6
    bm = bmesh.new(); V = {}
    for i in range(N + 1):
        for j in range(N + 1):
            x = X0 + (X1 - X0) * i / N; y = Y0 + (Y1 - Y0) * j / N; z = H(x, y)
            if z is not None: V[i, j] = (bm.verts.new((x, y, z)), z)
    dentro = []
    for (i, j), (v, z) in V.items():
        q = [V.get(k) for k in ((i + 1, j), (i + 1, j + 1), (i, j + 1))]
        if all(q): bm.faces.new((v, q[0][0], q[1][0], q[2][0])); dentro.append((v.co.x, v.co.y, z))
    # canto del país: se baja el borde al piso
    borde = [e for e in bm.edges if len(e.link_faces) == 1]
    r = bmesh.ops.extrude_edge_only(bm, edges=borde)
    for v in [g for g in r["geom"] if isinstance(g, bmesh.types.BMVert)]: v.co.z = 0
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj("pais", bm, mat_capas("terrazas", "#3A5578", "#1A2B45", PASO))
    m_az = mat("azul", "#4D8FE0", 0.4, emision=0.9 if hero else 0.35); m_pi = mat("pila", "#C9D6E6", 0.6); m_pin = mat("pin", "#BFD9F7", 0.4, emision=1.5)
    bx, by = proy(-74.67, 5.45); z = max(H(bx - 0.3, by) or 0.3, H(bx + 0.3, by) or 0.3)
    puente(L, Vector((bx - 0.34, by, z)), Vector((bx + 0.34, by, z)), m_az, m_pi, ancho=0.12 if hero else 0.07)
    for x, y, zz in random.sample(dentro, 420):
        if d_rio(x, y) > 0.12:
            hh = random.uniform(0.06, 0.2); L.cil(m_pin, (x, y, zz + hh / 2), 0.003, hh, seg=6); L.esfera(m_pin, (x, y, zz + hh), 0.011)
    L.volcar()
    luz(4200, 6, (-8, -4, 6), (0, 0.5, 0), color=(1, 0.85, 0.7)); luz(1500, 6, (7, 8, 4), (0, 0, 0.4), color=(0.7, 0.82, 1))
    if cerca:
        # Cierre de la portada: la misma maqueta, a la altura del puente.
        camara((bx - 2.6, by - 4.6, 2.6), (bx - 0.75, by + 0.2, 0.75), 50, foco=(bx, by, z), f=4.0)
    elif hero:
        # Cámara alta y casi desde el sur: se ve la silueta entera (La Guajira,
        # las dos costas, la Amazonía) y se reconoce que es Colombia.
        import os; cx, cy = 0.3, -0.2
        v = [float(t) for t in os.environ.get("HERO_CAM", "-2.0,-10,10.2,-2.5,0.1,38").split(",")]
        camara((cx + v[0], cy + v[1], v[2]), (cx + v[3], cy + v[4], 0.0), v[5], foco=(bx, by, z), f=8)
    else: camara((bx - 3.6, by - 7.0, 4.6), (bx + 0.1, by + 0.1, 0.3), 40, foco=(bx, by, z), f=5.6)

{"a": escena_a, "b": escena_b, "c": escena_c, "hero": lambda: escena_b(hero=True), "cierre": lambda: escena_b(hero=True, cerca=True)}[ESCENA]()
esc.render.engine = "CYCLES"; esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ALTO
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Base Contrast"
esc.render.image_settings.file_format = "PNG"; esc.render.filepath = SALIDA
bpy.ops.render.render(write_still=True); print("LISTO", ESCENA)
