"""Mapa de Colombia en relieve: cada departamento sube según los procesos
publicados en SECOP (nov-2025 a oct-2026, base de dev). Render en Cycles.

blender -b -P mapa_relieve.py -- <tema: claro|oscuro> <salida.png> <ancho> <alto> <muestras>

Escribe además <salida>.json con la posición en pantalla (0..1) de la cima de
cada departamento, para poner las cifras en HTML encima de la imagen.
"""
import bpy, bmesh, json, math, sys
from pathlib import Path
from mathutils import Vector, geometry
from bpy_extras.object_utils import world_to_camera_view

AQUI = Path(__file__).resolve().parent
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TEMA = args[0] if len(args) > 0 else "claro"
SALIDA = args[1] if len(args) > 1 else str(AQUI / f"mapa-{TEMA}.png")
ANCHO = int(args[2]) if len(args) > 2 else 2400
ALTO = int(args[3]) if len(args) > 3 else 1500
MUESTRAS = int(args[4]) if len(args) > 4 else 160

datos = json.loads((AQUI / "procesos.json").read_text())
geo = json.loads((AQUI / "geo" / "col.geojson").read_text())

# ---- escena limpia
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene

def hex_lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

if TEMA == "claro":
    FONDO, BASE, ALTO_C, SUELO = "#FFFFFF", "#D3DCE6", "#0D4488", "#FFFFFF"
else:
    FONDO, BASE, ALTO_C, SUELO = "#0A1628", "#22344D", "#74ABEA", "#0A1628"

# ---- proyección: equirectangular con corrección de latitud media (4,5° N)
LAT0 = 4.5
K = math.cos(math.radians(LAT0))
ESCALA = 0.55  # unidades Blender por grado
def proy(lon, lat):
    return ((lon + 73.5) * K * ESCALA, (lat - LAT0) * ESCALA)

def dp(pts, tol):
    if len(pts) < 4:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-12
    dmax, im = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax: dmax, im = d, i
    if dmax > tol:
        return dp(pts[:im + 1], tol)[:-1] + dp(pts[im:], tol)
    return [a, b]

TOL = 0.0035

def dp_anillo(pts, tol):
    # anillo cerrado: se parte en dos mitades para que la recta de DP no degenere
    pts = pts[:-1] if pts[0] == pts[-1] else pts
    if len(pts) < 8:
        return pts
    m = len(pts) // 2
    return dp(pts[:m + 1], tol)[:-1] + dp(pts[m:] + [pts[0]], tol)[:-1]

def anillos(geom):
    if geom["type"] == "Polygon":
        yield geom["coordinates"]
    else:
        for p in geom["coordinates"]:
            yield p

NOMBRES = {"Bogota": "Bogotá D.C.", "San Andrés y Providencia": "San Andrés y Providencia"}
vmax = max(datos.values())
H_MAX = 1.35

def altura(n):
    # raíz: Bogotá no aplasta al resto, y el orden se conserva.
    return 0.06 + H_MAX * math.sqrt(n / vmax)

def material(nombre, t):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    a, z = hex_lin(BASE), hex_lin(ALTO_C)
    # mezcla en lineal; la curva t**0.8 deja ver diferencias en los bajos
    t = t ** 1.6
    b.inputs["Base Color"].default_value = tuple(a[i] + (z[i] - a[i]) * t for i in range(3)) + (1,)
    b.inputs["Roughness"].default_value = 0.62
    return m

orden = sorted(datos, key=datos.get)
rango = {k: i / (len(orden) - 1) for i, k in enumerate(orden)}
cimas = {}
for f in geo["features"]:
    nom = f["properties"].get("name")
    if not nom:
        continue
    nom = NOMBRES.get(nom, nom)
    if nom == "San Andrés y Providencia":
        continue  # a esta escala es un punto en el mar; se muestra aparte en HTML
    n = datos.get(nom)
    if n is None:
        print("SIN DATO", nom); continue
    h = altura(n)
    bm = bmesh.new()
    mayor = None
    for poli in anillos(f["geometry"]):
        ext = dp_anillo([proy(*p) for p in poli[0]], TOL)
        if len(ext) < 3:
            continue
        huecos = [dp_anillo([proy(*p) for p in r], TOL) for r in poli[1:]]
        rings = [[Vector((x, y, 0)) for x, y in ext]] + [[Vector((x, y, 0)) for x, y in r] for r in huecos if len(r) >= 3]
        tris = geometry.tessellate_polygon(rings)
        todos = [v for r in rings for v in r]
        vb = [bm.verts.new((v.x, v.y, 0)) for v in todos]
        vt = [bm.verts.new((v.x, v.y, h)) for v in todos]
        for a, b_, c in tris:
            try:
                bm.faces.new((vt[a], vt[b_], vt[c]))
                bm.faces.new((vb[c], vb[b_], vb[a]))
            except ValueError:
                pass
        # paredes
        i0 = 0
        for r in rings:
            m = len(r)
            for i in range(m):
                j = (i + 1) % m
                try:
                    bm.faces.new((vb[i0 + i], vb[i0 + j], vt[i0 + j], vt[i0 + i]))
                except ValueError:
                    pass
            i0 += m
        area = abs(sum(ext[i][0] * ext[(i + 1) % len(ext)][1] - ext[(i + 1) % len(ext)][0] * ext[i][1] for i in range(len(ext)))) / 2
        if mayor is None or area > mayor[0]:
            cx = sum(p[0] for p in ext) / len(ext); cy = sum(p[1] for p in ext) / len(ext)
            mayor = (area, cx, cy)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(nom, me)
    esc.collection.objects.link(ob)
    ob.data.materials.append(material("m_" + nom, rango[nom]))
    # bisel suave en el canto superior: la luz dibuja el borde
    mod = ob.modifiers.new("bisel", "BEVEL"); mod.width = 0.008; mod.segments = 1; mod.limit_method = "ANGLE"; mod.angle_limit = math.radians(60)
    for p in me.polygons:
        p.use_smooth = abs(p.normal.z) < 0.5
    for e in me.edges:
        e.use_edge_sharp = False
    import bmesh as _b
    bb = _b.new(); bb.from_mesh(me)
    for e in bb.edges:
        caras = e.link_faces
        if len(caras) == 2 and (abs(caras[0].normal.z) > 0.5) != (abs(caras[1].normal.z) > 0.5):
            e.smooth = False
    bb.to_mesh(me); bb.free()
    cimas[nom] = (mayor[1], mayor[2], h, n)

# ---- suelo
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.001))
suelo = bpy.context.active_object
ms = bpy.data.materials.new("suelo"); ms.use_nodes = True
ms.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = hex_lin(SUELO)
ms.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
suelo.data.materials.append(ms)
suelo.is_shadow_catcher = True

# ---- mundo y luz: cielo neutro tenue + una luz de área grande (look de cine, sin halos)
mundo = bpy.data.worlds.new("mundo"); esc.world = mundo; mundo.use_nodes = True
bg = mundo.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = hex_lin(FONDO); bg.inputs["Strength"].default_value = 0.55 if TEMA == "claro" else 0.25

luz = bpy.data.lights.new("clave", "AREA"); luz.size = 14
luz.energy = 2600 if TEMA == "claro" else 1500
ol = bpy.data.objects.new("clave", luz); esc.collection.objects.link(ol)
ol.location = (-9, -7, 12); ol.rotation_euler = (math.radians(42), 0, math.radians(-50))
rel = bpy.data.lights.new("relleno", "AREA"); rel.size = 20; rel.energy = 500 if TEMA == "claro" else 300
orl = bpy.data.objects.new("relleno", rel); esc.collection.objects.link(orl)
orl.location = (10, 4, 9); orl.rotation_euler = (math.radians(-35), math.radians(25), 0)

# ---- cámara: desde el suroeste, baja, teleobjetivo (menos distorsión)
cam_d = bpy.data.cameras.new("cam"); cam_d.lens = 85
cam = bpy.data.objects.new("cam", cam_d); esc.collection.objects.link(cam); esc.camera = cam
xs = [c[0] for c in cimas.values()]; ys = [c[1] for c in cimas.values()]
centro = Vector(((min(xs) + max(xs)) / 2 + 0.15, (min(ys) + max(ys)) / 2 - 0.35, 0.3))
cam_d.lens = 62
cam.location = centro + Vector((-5.5, -15.5, 15.0))
direc = centro - cam.location
cam.rotation_euler = direc.to_track_quat("-Z", "Y").to_euler()

# ---- render
esc.render.engine = "CYCLES"
esc.cycles.samples = MUESTRAS
esc.cycles.use_denoising = True
import os
try:
    if os.environ.get("MAPA_CPU") == "1":
        raise RuntimeError("CPU pedida (la GPU la usa el render del video)")
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for tipo in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = tipo; prefs.get_devices()
            if any(d.type == tipo for d in prefs.devices):
                for d in prefs.devices: d.use = d.type == tipo
                esc.cycles.device = "GPU"; print("GPU", tipo); break
        except TypeError:
            continue
except Exception as e:
    print("sin GPU", e)
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ALTO
esc.render.film_transparent = True
esc.view_settings.view_transform = "AgX"
esc.view_settings.look = "AgX - Base Contrast" if TEMA == "claro" else "None"
esc.render.image_settings.file_format = "PNG"
esc.render.image_settings.color_mode = "RGBA"
esc.render.filepath = SALIDA

# ---- posiciones de pantalla de cada cima (para las cifras en HTML)
bpy.context.view_layer.update()
pos = {}
for nom, (x, y, h, n) in cimas.items():
    co = world_to_camera_view(esc, cam, Vector((x, y, h)))
    pos[nom] = {"x": round(co.x, 4), "y": round(1 - co.y, 4), "procesos": n}
Path(SALIDA).with_suffix(".json").write_text(json.dumps(pos, ensure_ascii=False, indent=1))

bpy.ops.render.render(write_still=True)
print("LISTO", SALIDA)
