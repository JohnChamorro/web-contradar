"""Las dos imágenes de lo que más pesa en la portada: la IA que lee el pliego y
el llenado de formatos. Papel de verdad (grosor, canto, esquina levantada),
foco corto y luz suave de estudio. Sin brillos ni halos (regla de John).

blender -b -P documentos.py -- <pliego|formatos> <salida.png> <ancho> <alto> <muestras>

Las hojas salen de tex/ (python3 texturas.py). Todo el contenido es de ejemplo.
"""
import bpy, bmesh, math, os, random, sys
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index("--") + 1:]
ESCENA, SALIDA, ANCHO, ALTO, MUESTRAS = a[0], a[1], int(a[2]), int(a[3]), int(a[4])
AQUI = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene; random.seed(31)
AX, AY = 0.21, 0.297  # A4, en metros

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

def mat(nombre, color, rug=0.6, metal=0.0):
    m = bpy.data.materials.new(nombre); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color); b.inputs["Roughness"].default_value = rug; b.inputs["Metallic"].default_value = metal
    return m

def mat_papel(nombre, imagen=None):
    """Papel: la hoja impresa como color, y una fibra muy fina en el relieve."""
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.62
    if imagen:
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(AQUI, "tex", imagen)); t.extension = "EXTEND"
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    else:
        b.inputs["Base Color"].default_value = lin("#FBFBF8")
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 900; n.inputs["Detail"].default_value = 3
    bu = nt.nodes.new("ShaderNodeBump"); bu.inputs["Strength"].default_value = 0.035
    nt.links.new(n.outputs["Fac"], bu.inputs["Height"]); nt.links.new(bu.outputs["Normal"], b.inputs["Normal"])
    return m

def mat_canto(nombre):
    """El canto de una pila: las hojas se ven como rayas finas."""
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    g = nt.nodes.new("ShaderNodeNewGeometry"); s = nt.nodes.new("ShaderNodeSeparateXYZ")
    mu = nt.nodes.new("ShaderNodeMath"); mu.operation = "MULTIPLY"; mu.inputs[1].default_value = 9000
    fr = nt.nodes.new("ShaderNodeMath"); fr.operation = "FRACT"
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["A"].default_value = lin("#F4F4F0"); mix.inputs["B"].default_value = lin("#C9CDD3")
    nt.links.new(g.outputs["Position"], s.inputs[0]); nt.links.new(s.outputs["Z"], mu.inputs[0]); nt.links.new(mu.outputs[0], fr.inputs[0])
    nt.links.new(fr.outputs[0], mix.inputs["Factor"]); nt.links.new(mix.outputs["Result"], b.inputs["Base Color"]); b.inputs["Roughness"].default_value = 0.8
    return m

def enlazar(nombre, me, m, suave=False):
    o = bpy.data.objects.new(nombre, me); esc.collection.objects.link(o); me.materials.append(m)
    if suave:
        for p in me.polygons: p.use_smooth = True
    return o

def hoja(nombre, m, loc, rotz=0.0, rizo=0.0, esquina=(1, 1)):
    """Una hoja A4 con grosor; `rizo` levanta una esquina, como papel real."""
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=24, y_segments=32, size=0.5)
    uv = bm.loops.layers.uv.new("uv")
    x0 = min(v.co.x for v in bm.verts); x1 = max(v.co.x for v in bm.verts); y0 = min(v.co.y for v in bm.verts); y1 = max(v.co.y for v in bm.verts)
    for f in bm.faces:
        for l in f.loops: l[uv].uv = ((l.vert.co.x - x0) / (x1 - x0), (l.vert.co.y - y0) / (y1 - y0))
    for v in bm.verts:
        u, w = (v.co.x - x0) / (x1 - x0), (v.co.y - y0) / (y1 - y0); v.co.x, v.co.y = u - 0.5, w - 0.5
        du = u if esquina[0] > 0 else 1 - u; dw = w if esquina[1] > 0 else 1 - w
        v.co.z = rizo * max(0.0, du + dw - 1.25) ** 2 + 0.0006 * math.sin(u * 5.1) * math.sin(w * 3.7)
        v.co.x *= AX; v.co.y *= AY
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    # 0,8 mm de aire: la onda del papel no debe hundirse en la pila ni en la mesa
    o = enlazar(nombre, me, m, suave=True); o.location = (loc[0], loc[1], loc[2] + 0.0008); o.rotation_euler = (0, 0, rotz)
    s = o.modifiers.new("g", "SOLIDIFY"); s.thickness = 0.00014; s.offset = 1
    return o

def caja(nombre, m, loc, tam, rotz=0.0, bisel=0.0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Diagonal((*tam, 1)))
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    o = enlazar(nombre, me, m); o.location = (loc[0], loc[1], loc[2] + tam[2] / 2); o.rotation_euler = (0, 0, rotz)
    if bisel: bv = o.modifiers.new("b", "BEVEL"); bv.width = bisel; bv.segments = 3
    return o

def pila(nombre, loc, alto, rotz, m_canto):
    return caja(nombre, m_canto, loc, (AX, AY, alto), rotz)

def boligrafo(loc, rotz, cuerpo, punta):
    L = 0.142; R = 0.0052
    def cil(nombre, m, r1, r2, largo, x0):
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=r1, radius2=r2, depth=largo)
        me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free(); o = enlazar(nombre, me, m, suave=True)
        o.matrix_world = Matrix.Translation(loc) @ Matrix.Rotation(rotz, 4, "Z") @ Matrix.Translation((x0 + largo / 2, 0, R)) @ Matrix.Rotation(math.pi / 2, 4, "Y")
        o.modifiers.new("e", "EDGE_SPLIT").split_angle = math.radians(40)
    cil("cuerpo", cuerpo, R, R, L, 0); cil("cono", punta, R, 0.0012, 0.018, L); cil("tapa", punta, R * 1.04, R * 1.04, 0.012, -0.012)
    c = caja("clip", punta, (0, 0, 0), (0.04, 0.0022, 0.0012)); c.matrix_world = Matrix.Translation(loc) @ Matrix.Rotation(rotz, 4, "Z") @ Matrix.Translation((0.018, 0, R * 2 + 0.0004))

def luz(energia, tam, loc, apunta, color=(1, 1, 1)):
    l = bpy.data.lights.new("l", "AREA"); l.energy = energia; l.size = tam; l.color = color
    o = bpy.data.objects.new("l", l); esc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(apunta) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

def mundo(color, fuerza):
    w = bpy.data.worlds.new("w"); esc.world = w; w.use_nodes = True; b = w.node_tree.nodes["Background"]
    b.inputs["Color"].default_value = lin(color); b.inputs["Strength"].default_value = fuerza

def mesa(color, rug):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=8)
    me = bpy.data.meshes.new("mesa"); bm.to_mesh(me); bm.free(); enlazar("mesa", me, mat("mesa", color, rug))

def camara(loc, mira, lente, foco, f):
    cd = bpy.data.cameras.new("cam"); cd.lens = lente; c = bpy.data.objects.new("cam", cd); esc.collection.objects.link(c); esc.camera = c
    c.location = loc; c.rotation_euler = (Vector(mira) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    cd.dof.use_dof = True; cd.dof.focus_distance = (Vector(foco) - Vector(loc)).length; cd.dof.aperture_fstop = f

def escena_pliego():
    """El pliego abierto en la página 31, con lo que ContRadar marca y las
    banderitas en las páginas donde lo encontró. Fondo del color de la web clara."""
    mundo("#F4F7FA", 0.55); mesa("#E6EBF1", 0.8); canto = mat_canto("canto")
    # el anexo técnico, debajo y girado; el pliego (86 páginas) encima
    pila("anexo", (-0.115, 0.075, 0), 0.0024, 0.42, canto); hoja("anexo_tapa", mat_papel("blanco"), (-0.115, 0.075, 0.0024), 0.42, 0.0, (-1, 1))
    for k in range(4):
        hoja(f"suelta{k}", mat_papel(f"b{k}"), (0.012 * (k - 1.5), -0.006 * k, 0.0003 + 0.0002 * k), random.uniform(-0.2, 0.16), 0.0)
    Z = 0.0012; ALTO = 0.0095; R = -0.07
    pila("pliego", (0, 0, Z), ALTO, R, canto)
    hoja("pagina", mat_papel("pliego", "pliego.png"), (0, 0, Z + ALTO), R, 0.0, (1, -1))
    # banderitas: azul, ámbar y jade, cada una a la altura de la página que marca
    for y, z, c in [(0.085, 0.72, "#0D4488"), (0.02, 0.5, "#E08700"), (-0.045, 0.3, "#0E7A5F"), (0.115, 0.88, "#0D4488")]:
        o = caja("bandera", mat("b" + c, c, 0.5), (0, 0, 0), (0.034, 0.011, 0.00025))
        o.matrix_world = Matrix.Rotation(R, 4, "Z") @ Matrix.Translation((AX / 2 + 0.008, y, Z + ALTO * z))
    boligrafo(Vector((-0.27, -0.13, 0)), 0.5, mat("cuerpo", "#0A1628", 0.35), mat("metal", "#B9C2CE", 0.3, 1.0))
    luz(24, 1.1, (-0.75, 0.25, 0.85), (0, 0, 0)); luz(3, 1.6, (0.8, -0.5, 0.6), (0, 0, 0), (0.9, 0.95, 1))
    camara((0.24, -0.44, 0.40), (0.0, -0.01, 0.0), 55, (0.0, 0.03, Z + ALTO), 16)

def escena_formatos():
    """Los formatos ya llenos, en abanico sobre la mesa oscura, y el bolígrafo
    para lo único que falta: la firma. Fondo del bloque tinta (--panel-ink)."""
    mundo("#0A1628", 0.2); mesa("#0A1628", 0.7)
    orden = ["formato-6.png", "formato-1.png", "formato-4.png", "formato-6.png", "formato-1.png"]
    for k, t in enumerate(orden):
        x = -0.33 + 0.165 * k; y = 0.03 * math.sin(k * 1.7)
        hoja(f"f{k}", mat_papel(f"m{k}", t), (x, y, 0.0002 + 0.00035 * k), 0.16 - 0.08 * k, 0.0, (1, -1))
    boligrafo(Vector((0.02, -0.165, 0)), 0.32, mat("cuerpo", "#0D4488", 0.3), mat("metal", "#B9C2CE", 0.3, 1.0))
    luz(34, 1.2, (-0.7, 0.3, 0.9), (0, 0, 0), (1, 0.97, 0.93)); luz(2.5, 1.6, (0.8, -0.6, 0.5), (0, 0, 0), (0.8, 0.88, 1))
    camara((0.09, -0.47, 0.40), (0.0, -0.01, 0.0), 52, (0.0, -0.03, 0.0), 11)

{"pliego": escena_pliego, "formatos": escena_formatos}[ESCENA]()
esc.render.engine = "CYCLES"; esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ALTO
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.render.image_settings.file_format = "PNG"; esc.render.filepath = SALIDA
bpy.ops.render.render(write_still=True); print("LISTO", ESCENA)
