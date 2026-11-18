"""Rebuild the camera labs' hand in Blender: forearm instead of the blunt wrist, and bone-heat skin weights.
   usage: python build_hand.py <hand-model.js in> <hand-model.js out>"""
import sys, numpy as np; sys.path.insert(0, '.')
import bpy, bmesh, handio
from mathutils import Vector
src, dst = sys.argv[1], sys.argv[2]
H, pos, nrm, idx, ji, jw, tint = handio.load(src)
rest = np.array(H['rest'], dtype=float); bones = H['bones']
def signed_volume(P, F): a, b, c = P[F[:, 0]], P[F[:, 1]], P[F[:, 2]]; return float(np.einsum('ij,ij->i', a, np.cross(b, c)).sum() / 6)
vol0 = signed_volume(pos, idx)
bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------- mesh, with the nail marks carried on a vertex layer ----------
bm = bmesh.new()
nail = bm.verts.layers.int.new('nail')
vs = [bm.verts.new(p) for p in pos]
for v, t in zip(vs, tint): v[nail] = int(t)
for f in idx:
    try: bm.faces.new([vs[i] for i in f])
    except ValueError: pass
bm.normal_update()

# ---------- forearm: cut the wrist stump off and extrude a tapered forearm ----------
CUT = -0.42
geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, CUT, 0), plane_no=(0, -1, 0), clear_outer=True)
loop = [e for e in bm.edges if e.is_boundary]
ring = list({v for e in loop for v in e.verts})
cx = sum(v.co.x for v in ring) / len(ring); cz = sum(v.co.z for v in ring) / len(ring)
print('wrist ring', len(ring), 'verts, centre', round(cx, 3), round(cz, 3))
# forearm rings: (drop below the cut, width scale, depth scale). A wrist is narrowest; the forearm widens and rounds out.
RINGS = [(.12, 1.0, 1.0), (.3, 1.03, 1.05), (.55, 1.07, 1.12), (.85, 1.11, 1.18), (1.15, 1.13, 1.2), (1.32, 1.0, 1.06), (1.42, .72, .78)]
edges = loop; new_verts = []
y0 = CUT; base = {v: (v.co.x - cx, v.co.z - cz) for v in ring}
prev_ring = ring
for dy, sx, sz in RINGS:
    ex = bmesh.ops.extrude_edge_only(bm, edges=edges)
    nv = [g for g in ex['geom'] if isinstance(g, bmesh.types.BMVert)]
    edges = [g for g in ex['geom'] if isinstance(g, bmesh.types.BMEdge) and g.is_boundary]
    # each new vertex came from one vertex of the previous ring: find it by position
    for v in nv:
        src_v = min(prev_ring, key=lambda u: (u.co - v.co).length)
        bx, bz = base[src_v]
        v.co = Vector((cx + bx * sx, y0 - dy, cz + bz * sz)); base[v] = (bx, bz); v[nail] = 0
    new_verts += nv; prev_ring = nv
# close the end with a rounded cap
cap = bmesh.ops.holes_fill(bm, edges=edges, sides=0)
capf = cap['faces']
bmesh.ops.triangulate(bm, faces=capf, quad_method='BEAUTY', ngon_method='BEAUTY')
# soften the join at the wrist and the forearm, keeping the heights
soft = list(set(new_verts + ring))
for _ in range(6): bmesh.ops.smooth_vert(bm, verts=soft, factor=.45, use_axis_x=True, use_axis_y=False, use_axis_z=True)
bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3], quad_method='BEAUTY', ngon_method='BEAUTY')
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

me = bpy.data.meshes.new('Hand'); bm.to_mesh(me); me.update()
ob = bpy.data.objects.new('Hand', me); bpy.context.scene.collection.objects.link(ob)
for p in me.polygons: p.use_smooth = True

# ---------- skeleton on the 21 tracked points, and bone-heat weights ----------
arm = bpy.data.armatures.new('Rig'); ao = bpy.data.objects.new('Rig', arm); bpy.context.scene.collection.objects.link(ao)
bpy.context.view_layer.objects.active = ao; ao.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for b, (a, c) in enumerate(bones):
    eb = arm.edit_bones.new('b%02d' % b); eb.head = Vector(rest[a]); eb.tail = Vector(rest[c])
    pa = b - 1 if b % 4 else None
    if pa is not None: eb.parent = arm.edit_bones['b%02d' % pa]; eb.use_connect = True
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); ao.select_set(True); bpy.context.view_layer.objects.active = ao
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
# a few passes of weight smoothing, then keep the four strongest bones per vertex
bpy.context.view_layer.objects.active = ob; bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
for vg in ob.vertex_groups: ob.vertex_groups.active_index = vg.index
bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
bpy.ops.object.vertex_group_smooth(group_select_mode='ALL', factor=.5, repeat=3)
bpy.ops.object.mode_set(mode='OBJECT')

me = ob.data; nvt = len(me.vertices)
gi = {vg.index: int(vg.name[1:]) for vg in ob.vertex_groups}
W = np.zeros((nvt, 20))
for v in me.vertices:
    for g in v.groups:
        if g.group in gi: W[v.index, gi[g.group]] = g.weight
empty = np.where(W.sum(1) <= 1e-6)[0]
print('verts with no weight from Blender:', len(empty))
if len(empty):   # fall back to the old weights by nearest original vertex
    P0 = pos
    for i in empty:
        j = int(np.argmin(((P0 - np.array(me.vertices[i].co)) ** 2).sum(1)))
        for k in range(4):
            if jw[j, k]: W[i, ji[j, k]] += jw[j, k] / 255
order = np.argsort(-W, axis=1)[:, :4]; top = np.take_along_axis(W, order, 1)
top = top / top.sum(1, keepdims=True)
q = np.floor(top * 255).astype(int); q[:, 0] += 255 - q.sum(1)
ji2 = order.astype(np.uint8); jw2 = q.astype(np.uint8)
# ---------- export ----------
me.calc_loop_triangles()
P = np.array([v.co[:] for v in me.vertices]); N = np.array([v.normal[:] for v in me.vertices])
F = np.array([t.vertices[:] for t in me.loop_triangles])
bm2 = bmesh.new(); bm2.from_mesh(me); lay = bm2.verts.layers.int.get('nail'); bm2.verts.ensure_lookup_table()
T2 = np.array([v[lay] if lay else 0 for v in bm2.verts], dtype=np.uint8)
if np.sign(signed_volume(P, F)) != np.sign(vol0): F = F[:, ::-1]          # same winding convention as before
print('out: verts', len(P), 'tris', len(F), 'nails', int((T2 > 0).sum()), 'mean top weight', round(float(top[:, 0].mean()), 3), 'verts with >=2 bones over 10 %', int((top[:, 1] > .1).sum()))
handio.save(dst, H, P, N, F, ji2, jw2, T2, '/* Human hand for the camera labs. Modelled in Blender, with a forearm; skin weights by Blender\'s bone-heat weighting on a 20-bone skeleton placed on the 21 tracked points. */')
bpy.ops.wm.save_as_mainfile(filepath=dst.rsplit('.', 1)[0] + '.blend')
