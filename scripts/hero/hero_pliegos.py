"""Hero de la portada: un campo de pliegos apilados que se pierde en el fondo y
uno solo marcado en azul, con los anillos del radar en el piso.

blender -b -P hero_pliegos.py -- <claro|oscuro> <salida.png> <ancho> <alto> <muestras>

Look de cine (regla de John): sin brillos ni halos, luz suave, colores sobrios.
HERO_CPU=1 fuerza el procesador (la GPU suele estar ocupada con el video).
"""
import bpy, math, os, random, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TEMA = args[0] if len(args) > 0 else "claro"
SALIDA = args[1] if len(args) > 1 else f"/tmp/hero-{TEMA}.png"
ANCHO = int(args[2]) if len(args) > 2 else 2880
ALTO = int(args[3]) if len(args) > 3 else 1620
MUESTRAS = int(args[4]) if len(args) > 4 else 128

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
random.seed(2027)

def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

if TEMA == "claro":
    FONDO, PISO = "#FFFFFF", "#F4F7FA"
    PAPEL = ["#F2F4F7", "#E6EBF1", "#DCE3EA", "#CFD8E2"]
    CARPETA = ["#B7C3D0", "#9DAEC2", "#5A6E82"]
    MARCA, ANILLO = "#0D4488", "#0D4488"
else:
    FONDO, PISO = "#0A1628", "#0A1628"
    PAPEL = ["#1B2B42", "#22344D", "#16263B", "#2A3B54"]
    CARPETA = ["#33475F", "#2A3B54", "#46618B"]
    MARCA, ANILLO = "#74ABEA", "#74ABEA"

def mat(nombre, color, rug=0.75):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color); b.inputs["Roughness"].default_value = rug
    return m

def mat_canto(nombre, a, b_):
    """Papel visto de canto: rayas finas horizontales (las hojas)."""
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 260
    fr = nt.nodes.new("ShaderNodeMath"); fr.operation = "FRACT"
    gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.55
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs["A"].default_value = lin(a); mix.inputs["B"].default_value = lin(b_)
    nt.links.new(nt.nodes.new("ShaderNodeNewGeometry").outputs["Position"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], mul.inputs[0])
    nt.links.new(mul.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], gt.inputs[0])
    nt.links.new(gt.outputs[0], mix.inputs["Factor"]); nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85
    return m

M_PAPEL = [mat_canto(f"papel{i}", PAPEL[i], PAPEL[(i + 2) % len(PAPEL)]) for i in range(len(PAPEL))]
M_CARP = [mat(f"carp{i}", c, 0.6) for i, c in enumerate(CARPETA)]
M_MARCA = mat("marca", MARCA, 0.45)
M_ANILLO = mat("anillo", ANILLO, 0.6)

import bmesh
from mathutils import Matrix
# Toda la geometría va a una malla por material: miles de objetos sueltos
# hacían la escena lentísima de armar.
_bm = {}
def caja(x, y, z, sx, sy, sz, rot, m):
    bm = _bm.setdefault(m.name, (bmesh.new(), m))[0]
    M = Matrix.Translation((x, y, z + sz / 2)) @ Matrix.Rotation(rot, 4, "Z") @ Matrix.Diagonal((sx, sy, sz, 1))
    bmesh.ops.create_cube(bm, size=1.0, matrix=M)

def volcar():
    for nombre, (bm, m) in _bm.items():
        me = bpy.data.meshes.new("pilas_" + nombre); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new("pilas_" + nombre, me); esc.collection.objects.link(o)
        me.materials.append(m)
        bv = o.modifiers.new("b", "BEVEL"); bv.width = 0.002; bv.segments = 1

AX, AY = 0.23, 0.31  # carpeta tamaño oficio, en metros

def pila(x, y, alto, marcada=False):
    rot0 = random.uniform(-0.5, 0.5)
    z = 0.0
    restante = alto
    while restante > 0.004:
        h = min(restante, random.choice([0.015, 0.025, 0.04, 0.06, 0.09]))
        es_carpeta = random.random() < 0.3
        m = random.choice(M_CARP) if es_carpeta else random.choice(M_PAPEL)
        caja(x + random.uniform(-0.012, 0.012), y + random.uniform(-0.012, 0.012), z,
             AX * random.uniform(0.94, 1.0), AY * random.uniform(0.94, 1.0), h,
             rot0 + random.uniform(-0.09, 0.09), m)
        z += h; restante -= h
    if marcada:
        caja(x, y, z, AX * 1.04, AY * 1.04, 0.035, rot0 + 0.05, M_MARCA)
    return z

# El pliego marcado: a la derecha del cuadro, a media distancia.
OBJ = Vector((1.25, 3.0, 0))
pila(OBJ.x, OBJ.y, 0.42, marcada=True)
CAM = Vector((-0.5, -1.2, 1.75))

# El campo. A la izquierda (donde va el texto) casi nada y bajo; a la derecha y
# al fondo, alto y denso.
paso = 0.46
for i in range(-10, 28):
    for j in range(0, 42):
        x = i * paso + random.uniform(-0.13, 0.13)
        y = j * paso * 1.08 + random.uniform(-0.13, 0.13)
        if (Vector((x, y, 0)) - OBJ).length < 1.0:
            continue  # aire alrededor del marcado: ahí van los anillos
        # pasillo despejado entre la cámara y el marcado, y nada pegado a la cámara
        ab = Vector((OBJ.x - CAM.x, OBJ.y - CAM.y)); ap = Vector((x - CAM.x, y - CAM.y))
        t = max(0.0, min(1.0, ap.dot(ab) / ab.dot(ab)))
        if (ap - ab * t).length < 0.75 or y < 1.4:
            continue
        if x < 0.1 and y < 6.5:
            continue  # la izquierda cercana queda limpia: ahí va el texto
        # densidad: crece hacia la derecha y con la distancia
        lado = min(1.0, max(0.0, (x + 1.2) / 3.0))
        fondo = min(1.0, y / 9.0)
        dens = 0.10 + 0.55 * lado + 0.35 * fondo
        if random.random() > dens:
            continue
        alto = random.lognormvariate(-1.9, 0.75) * (0.5 + 0.9 * lado + 0.6 * fondo)
        pila(x, y, min(alto, 1.5))

volcar()

# Anillos del radar en el piso, alrededor del marcado (geometría plana, sin luz propia).
def anillo(r, ancho):
    bpy.ops.mesh.primitive_circle_add(vertices=160, radius=r, fill_type="NOTHING", location=(OBJ.x, OBJ.y, 0.0015))
    o = bpy.context.active_object
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.extrude_region_move(); bpy.ops.transform.resize(value=((r + ancho) / r,) * 3)
    bpy.ops.object.mode_set(mode="OBJECT")
    o.data.materials.append(M_ANILLO); return o
anillo(0.42, 0.016); anillo(0.66, 0.010); anillo(0.90, 0.006)

# Piso y mundo del color de la página: la imagen se funde con el fondo.
bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 60, 0))
bpy.context.active_object.data.materials.append(mat("piso", PISO, 0.95))
mundo = bpy.data.worlds.new("m"); esc.world = mundo; mundo.use_nodes = True
bg = mundo.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = lin(FONDO); bg.inputs["Strength"].default_value = 0.75 if TEMA == "claro" else 0.5

# Luz: una fuente grande y alta desde la derecha-atrás; relleno muy suave.
def luz(nombre, energia, tam, loc, apunta):
    l = bpy.data.lights.new(nombre, "AREA"); l.energy = energia; l.size = tam
    o = bpy.data.objects.new(nombre, l); esc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(apunta) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
luz("clave", 9000 if TEMA == "claro" else 6500, 6, (10, 0.5, 8), (2, 5, 0))
luz("relleno", 500 if TEMA == "claro" else 250, 14, (-7, -4, 6), (2, 5, 0))

# Cámara: baja, gran angular moderado, foco en el pliego marcado.
cd = bpy.data.cameras.new("cam"); cd.lens = 34; cd.sensor_width = 36
cam = bpy.data.objects.new("cam", cd); esc.collection.objects.link(cam); esc.camera = cam
cam.location = CAM
mira = Vector((0.35, 3.6, 0.1))
cam.rotation_euler = (mira - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
cd.dof.use_dof = True; cd.dof.focus_distance = (OBJ + Vector((0, 0, 0.3)) - Vector(cam.location)).length
cd.dof.aperture_fstop = 5.6

esc.render.engine = "CYCLES"; esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
if os.environ.get("HERO_CPU") != "1":
    try:
        p = bpy.context.preferences.addons["cycles"].preferences
        p.compute_device_type = "OPTIX"; p.get_devices()
        for d in p.devices: d.use = d.type == "OPTIX"
        esc.cycles.device = "GPU"
    except Exception as e:
        print("sin GPU", e)
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ALTO
esc.view_settings.view_transform = "AgX"
esc.render.image_settings.file_format = "PNG"; esc.render.filepath = SALIDA
bpy.ops.render.render(write_still=True)
print("LISTO", SALIDA, len(bpy.data.objects), "objetos")
