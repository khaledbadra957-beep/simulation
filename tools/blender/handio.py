"""Read and write the camera labs' hand model (hand-model.js): quantised positions, normals, triangles, 4 bone weights per vertex."""
import json, base64, numpy as np
def load(path):
    t = open(path, encoding='utf-8').read(); H = json.loads(t[t.index('{'):t.rindex('}') + 1])
    d = lambda k, dt: np.frombuffer(base64.b64decode(H[k]), dtype=dt)
    nv = H['nv']; q = d('pos', np.uint16).reshape(nv, 3).astype(np.float64)
    pos = np.array(H['min']) + q / 65535.0 * np.array(H['size'])
    nrm = d('nrm', np.int8).reshape(nv, 3) / 127.0
    idx = d('idx', np.uint16).reshape(-1, 3); ji = d('ji', np.uint8).reshape(nv, 4); jw = d('jw', np.uint8).reshape(nv, 4); tint = d('tint', np.uint8)
    return H, pos, nrm, idx, ji, jw, tint
def save(path, H, pos, nrm, idx, ji, jw, tint, header):
    mn = pos.min(0); sz = pos.max(0) - mn
    q = np.round((pos - mn) / sz * 65535).astype(np.uint16)
    n = np.round(np.clip(nrm, -1, 1) * 127).astype(np.int8)
    e = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
    out = dict(H); out.update(nv=int(len(pos)), ni=int(idx.size), min=[round(float(v), 5) for v in mn], size=[round(float(v), 5) for v in sz],
        pos=e(q), nrm=e(n), idx=e(idx.astype(np.uint16)), ji=e(ji.astype(np.uint8)), jw=e(jw.astype(np.uint8)), tint=e(tint.astype(np.uint8)))
    keys = ['nv', 'ni', 'min', 'size', 'bones', 'rest', 'pos', 'nrm', 'idx', 'ji', 'jw', 'tint'] + [k for k in out if k not in ('nv', 'ni', 'min', 'size', 'bones', 'rest', 'pos', 'nrm', 'idx', 'ji', 'jw', 'tint')]
    open(path, 'w', encoding='utf-8').write(header + '\nwindow.HAND_MODEL=' + json.dumps({k: out[k] for k in keys}, separators=(',', ':')) + ';\n')
