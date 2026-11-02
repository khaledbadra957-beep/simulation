/* Organic Naming Lab — 3D model of the molecule in the builder, with a benzene resonance view.
   Geometry: a small distance-geometry relaxation (bond lengths, VSEPR bond angles, C=C planarity,
   non-bonded repulsion) starting from the 2D drawing. Benzene: resonance OFF shows one Kekulé
   structure (C=C 1.34 Å, C–C 1.54 Å, three separate π bonds); resonance ON shows the hybrid
   (all C–C 1.39 Å, bond order 1.5, one delocalised π ring above and below the plane). */
(function () {
  'use strict';
  var host = document.getElementById('o3dHost');
  if (!host || typeof toGraph !== 'function') return;

  var COL = { C: 0x3C4248, H: 0xF2F2F2, O: 0xD8322A, N: 0x2F5FD0, F: 0x86C540, Cl: 0x2EA44F, Br: 0x9A3A1C, I: 0x7A3AA8 };
  var VDW = { C: 1.7, H: 1.2, O: 1.52, N: 1.55, F: 1.47, Cl: 1.75, Br: 1.85, I: 1.98 };
  var BALL = { C: 0.36, H: 0.24, O: 0.36, N: 0.36, F: 0.34, Cl: 0.42, Br: 0.46, I: 0.5 };
  var NAME = { C: 'carbon', H: 'hydrogen', O: 'oxygen', N: 'nitrogen', F: 'fluorine', Cl: 'chlorine', Br: 'bromine', I: 'iodine' };
  function blen(a, b, o) {
    var k = [a, b].sort().join('');
    var T = { CC: [1.54, 1.34, 1.20], CO: [1.43, 1.23], CN: [1.47], CF: [1.35], CCl: [1.77], BrC: [1.94], CI: [2.14], CH: [1.09], HO: [0.96], HN: [1.01] };
    var v = T[k]; return v ? (v[o - 1] || v[0]) : 1.5;
  }

  var S = { rep: 'bs', showH: true, rot: true, res: false, flip: 0, pOrb: true, lengths: true, st: null, mol: null, ready: false };

  /* ---------- build the 3D atom list from the builder state ---------- */
  function buildMol(st) {
    var G = toGraph(st), A = [], B = [];
    var arom = G.ring && G.ring.arom;
    function add(el, x, y, z) { A.push({ el: el, p: [x, y, z], nb: [] }); return A.length - 1; }
    function bond(i, j, o, ar) { B.push({ i: i, j: j, o: o, ar: !!ar }); A[i].nb.push(j); A[j].nb.push(i); }
    var sc = 1.5;
    G.atoms.forEach(function (a) { add('C', a.x * sc, a.y * sc, (Math.random() - .5) * .25); });
    G.links.forEach(function (l) {
      var ar = arom && l[4];
      bond(l[0], l[1], ar ? 0 : l[2], ar);
    });
    // aromatic Kekulé orders for the ring bonds (0..5 around the ring)
    var ringB = [];
    if (arom) B.forEach(function (b) { if (b.ar) ringB.push(b); });
    function outward(i) { // unit vector pointing away from the heavy neighbours (2-D)
      var p = A[i].p, vx = 0, vy = 0;
      A[i].nb.forEach(function (j) { if (A[j].el === 'H') return; var q = A[j].p, dx = p[0] - q[0], dy = p[1] - q[1], L = Math.hypot(dx, dy) || 1; vx += dx / L; vy += dy / L; });
      var L = Math.hypot(vx, vy); if (L < 1e-3) { vx = 0; vy = -1; L = 1; } return [vx / L, vy / L];
    }
    function addHs(i, n, flat, d) {
      if (!n) return; var o = outward(i), base = Math.atan2(o[1], o[0]), p = A[i].p;
      var spreads = n === 1 ? [[0, 0]] : n === 2 ? (flat ? [[-1.05, 0], [1.05, 0]] : [[-.6, .9], [.6, -.9]]) : [[0, 0], [-1.6, .9], [1.6, -.9]];
      spreads.forEach(function (sp) { var a = base + sp[0], z = sp[1]; var hh = add('H', p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, p[2] + z * d * .6); bond(i, hh, 1); });
    }
    G.hets.forEach(function (h) {
      var el = h.g === 'OH' || h.g === 'O' ? 'O' : h.g === 'NH2' ? 'N' : h.g;
      var k = add(el, h.x * sc, h.y * sc, (Math.random() - .5) * .1);
      bond(h.atom, k, h.g === 'O' ? 2 : 1);
      addHs(k, h.g === 'OH' ? 1 : h.g === 'NH2' ? 2 : 0, false, 1.0);
    });
    G.atoms.forEach(function (a, i) {
      var flat = (arom && a.inRing) || a.nb.some(function (e) { return e.o === 2; });
      addHs(i, hCount(a), flat, 1.1);
    });
    return { A: A, B: B, G: G, arom: arom, ringN: arom ? 6 : 0, ringB: ringB };
  }

  function order(m, b) { // effective bond order used for geometry and drawing
    if (!b.ar) return b.o;
    if (S.res) return 1.5;
    var idx = Math.min(b.i, b.j) === 0 && Math.max(b.i, b.j) === 5 ? 5 : Math.min(b.i, b.j);
    return ((idx + S.flip) % 2) === 0 ? 2 : 1;
  }
  function lenOf(m, b) {
    var o = order(m, b);
    if (o === 1.5) return 1.39;
    return blen(m.A[b.i].el, m.A[b.j].el, o);
  }

  /* ---------- relax the geometry ---------- */
  function relax(m, iters) {
    var A = m.A, n = A.length, C = [];
    var bmap = {};
    m.B.forEach(function (b) { bmap[b.i + ',' + b.j] = bmap[b.j + ',' + b.i] = b; });
    function bondTo(i, j) { return bmap[i + ',' + j]; }
    m.B.forEach(function (b) { C.push([b.i, b.j, lenOf(m, b), 1]); });
    var near = {};
    A.forEach(function (a, i) {
      var pi = 0, tri = false;
      a.nb.forEach(function (j) { var o = order(m, bondTo(i, j)); if (o === 3) tri = true; if (o >= 1.5) pi += (o === 2 ? 1 : o === 1.5 ? .5 : 0); });
      var ang;
      if (a.el === 'O' && a.nb.length === 2) ang = 104.5;
      else if (a.el === 'N' && a.nb.length === 3) ang = 107;
      else if (tri || pi >= 2) ang = 180;
      else if (pi > 0) ang = 120;
      else ang = 109.47;
      a.ang = ang;
      for (var x = 0; x < a.nb.length; x++) for (var y = x + 1; y < a.nb.length; y++) {
        var j = a.nb[x], k = a.nb[y], dj = lenOf(m, bondTo(i, j)), dk = lenOf(m, bondTo(i, k));
        var t = Math.sqrt(dj * dj + dk * dk - 2 * dj * dk * Math.cos(ang * Math.PI / 180));
        C.push([j, k, t, .6]); near[j + ',' + k] = near[k + ',' + j] = 1;
      }
      a.nb.forEach(function (j) { near[i + ',' + j] = near[j + ',' + i] = 1; });
    });
    // planarity across double (and aromatic) bonds: 1-4 distances from the 2-D layout (cis or trans)
    m.B.forEach(function (b) {
      var o = order(m, b); if (o < 1.5 || o === 3) return;
      var i = b.i, j = b.j, d = lenOf(m, b);
      A[i].nb.forEach(function (a) {
        if (a === j) return;
        A[j].nb.forEach(function (c) {
          if (c === i || c === a) return;
          var pi = m.p2[i], pj = m.p2[j], pa = m.p2[a], pc = m.p2[c];
          var ex = pj[0] - pi[0], ey = pj[1] - pi[1];
          var sa = ex * (pa[1] - pi[1]) - ey * (pa[0] - pi[0]), sc2 = ex * (pc[1] - pi[1]) - ey * (pc[0] - pi[0]);
          var cis = sa * sc2 > 0;
          var la = lenOf(m, bondTo(i, a)), lc = lenOf(m, bondTo(j, c)), th = 120 * Math.PI / 180;
          var ax = la * Math.cos(th), ay = la * Math.sin(th), cx = d - lc * Math.cos(th), cy = (cis ? 1 : -1) * lc * Math.sin(th);
          C.push([a, c, Math.hypot(cx - ax, cy - ay), .5]);
        });
      });
    });
    var P = A.map(function (a) { return a.p; });
    for (var it = 0; it < iters; it++) {
      var step = 0.25 * (1 - it / iters) + 0.02;
      for (var q = 0; q < C.length; q++) {
        var c = C[q], p = P[c[0]], r = P[c[1]];
        var dx = r[0] - p[0], dy = r[1] - p[1], dz = r[2] - p[2], d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        var f = (d - c[2]) / d * .5 * step * c[3] * 2;
        p[0] += dx * f; p[1] += dy * f; p[2] += dz * f; r[0] -= dx * f; r[1] -= dy * f; r[2] -= dz * f;
      }
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        if (near[i + ',' + j]) continue;
        var p2 = P[i], r2 = P[j], ex = r2[0] - p2[0], ey = r2[1] - p2[1], ez = r2[2] - p2[2], dd = Math.sqrt(ex * ex + ey * ey + ez * ez) || 1e-6;
        var min = (A[i].el === 'H' || A[j].el === 'H') ? (A[i].el === 'H' && A[j].el === 'H' ? 2.2 : 2.6) : 3.0;
        if (dd < min) { var g = (min - dd) / dd * .25 * step; p2[0] -= ex * g; p2[1] -= ey * g; p2[2] -= ez * g; r2[0] += ex * g; r2[1] += ey * g; r2[2] += ez * g; }
      }
    }
    // centre
    var cx2 = 0, cy2 = 0, cz2 = 0; P.forEach(function (p) { cx2 += p[0]; cy2 += p[1]; cz2 += p[2]; }); cx2 /= n; cy2 /= n; cz2 /= n;
    P.forEach(function (p) { p[0] -= cx2; p[1] -= cy2; p[2] -= cz2; });
  }

  function makeMol(st) {
    var m = buildMol(st);
    m.p2 = m.A.map(function (a) { return [a.p[0], a.p[1]]; });
    if (m.arom) { // flatten the ring start so it relaxes to a plane
      for (var i = 0; i < m.A.length; i++) m.A[i].p[2] *= .2;
    }
    relax(m, 700);
    return m;
  }

  /* ---------- three.js scene ---------- */
  var T, R, scene, cam, world, th = .25, ph = 1.3, dist = 14, anim = null, electrons = [], tween = null;
  function init() {
    if (S.ready) return true;
    if (!window.THREE) { host.innerHTML = '<p class="note" style="padding:16px">The 3D model needs an internet connection the first time (it loads three.js). Check the connection and reload.</p>'; return false; }
    T = window.THREE;
    R = new T.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    host.appendChild(R.domElement); R.domElement.style.display = 'block'; R.domElement.style.touchAction = 'none';
    scene = new T.Scene(); cam = new T.PerspectiveCamera(40, 1, .1, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x445566, .8)); var dl = new T.DirectionalLight(0xffffff, .8); dl.position.set(5, 10, 8); scene.add(dl);
    var dl2 = new T.DirectionalLight(0xffffff, .3); dl2.position.set(-6, -3, -5); scene.add(dl2);
    var el = R.domElement, drag = null, pinch = null;
    el.addEventListener('pointerdown', function (e) { el.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; S.rot = false; syncBtns(); });
    el.addEventListener('pointermove', function (e) { if (!drag || drag.id !== e.pointerId || pinch) return; th -= (e.clientX - drag.x) * .01; ph = Math.max(.1, Math.min(3.0, ph - (e.clientY - drag.y) * .01)); drag.x = e.clientX; drag.y = e.clientY; });
    el.addEventListener('pointerup', function () { drag = null; }); el.addEventListener('pointercancel', function () { drag = null; });
    el.addEventListener('wheel', function (e) { e.preventDefault(); dist = Math.max(5, Math.min(40, dist * (1 + Math.sign(e.deltaY) * .08))); }, { passive: false });
    el.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); drag = null; } }, { passive: true });
    el.addEventListener('touchmove', function (e) { if (e.touches.length === 2 && pinch) { var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); dist = Math.max(5, Math.min(40, dist * pinch / d)); pinch = d; } }, { passive: true });
    el.addEventListener('touchend', function () { pinch = null; }, { passive: true });
    S.ready = true; resize(); loop(); return true;
  }
  function resize() { if (!S.ready) return; var w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); R.domElement.style.width = '100%'; R.domElement.style.height = '100%'; cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix(); }
  window.addEventListener('resize', resize);
  function V(p) { return new T.Vector3(p[0], -p[1], p[2]); }
  function mat(c, o) { o = o || {}; return new T.MeshStandardMaterial({ color: c, roughness: o.r != null ? o.r : .4, metalness: 0, transparent: o.a != null, opacity: o.a != null ? o.a : 1, depthWrite: o.a == null, side: o.side || T.FrontSide, emissive: o.em || 0x000000, emissiveIntensity: o.ei || 0 }); }
  var cylG, sphG;
  function cyl(g, a, b, r, m) {
    var d = new T.Vector3().subVectors(b, a), c = new T.Mesh(cylG, m);
    c.position.copy(a).addScaledVector(d, .5); c.scale.set(r, d.length(), r); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize()); g.add(c); return c;
  }
  function label(text, col) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 96; var x = c.getContext('2d');
    x.fillStyle = 'rgba(20,24,28,.82)'; x.beginPath(); if (x.roundRect) x.roundRect(8, 12, 240, 72, 20); else x.rect(8, 12, 240, 72); x.fill();
    x.fillStyle = col || '#fff'; x.font = '700 46px "IBM Plex Mono",monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 50);
    var sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); sp.scale.set(1.25, .47, 1); sp.renderOrder = 10; return sp;
  }
  function ringInfo(m) {
    var c = new T.Vector3(), pts = [];
    for (var i = 0; i < 6; i++) { var v = V(m.A[i].p); pts.push(v); c.add(v); }
    c.multiplyScalar(1 / 6);
    var nrm = new T.Vector3().crossVectors(new T.Vector3().subVectors(pts[0], c), new T.Vector3().subVectors(pts[1], c)).normalize();
    return { c: c, n: nrm, pts: pts };
  }

  function draw() {
    if (!S.ready || !S.mol) return;
    if (world) scene.remove(world);
    world = new T.Group(); scene.add(world); electrons = [];
    cylG = cylG || new T.CylinderGeometry(1, 1, 1, 14); sphG = sphG || new T.SphereGeometry(1, 28, 20);
    var m = S.mol, sf = S.rep === 'sf', bondM = mat(0xB9C0C8, { r: .5 });
    var hidden = {}; if (!S.showH) m.A.forEach(function (a, i) { if (a.el === 'H') hidden[i] = 1; });
    m.A.forEach(function (a, i) {
      if (hidden[i]) return;
      var s = new T.Mesh(sphG, mat(COL[a.el] || 0x999999, { r: .35 }));
      var r = sf ? VDW[a.el] * .78 : BALL[a.el];
      s.scale.setScalar(r); s.position.copy(V(a.p)); world.add(s);
    });
    var ri = m.arom ? ringInfo(m) : null;
    if (!sf) m.B.forEach(function (b) {
      if (hidden[b.i] || hidden[b.j]) return;
      var a = V(m.A[b.i].p), c = V(m.A[b.j].p), o = order(m, b);
      var d = new T.Vector3().subVectors(c, a).normalize();
      // offset direction for multiple bonds: in the molecule's local plane
      var ref = ri && b.ar ? new T.Vector3().subVectors(ri.c, a.clone().add(c).multiplyScalar(.5)).normalize() : null;
      if (!ref) {
        var other = m.A[b.i].nb.find(function (k) { return k !== b.j; }); if (other == null) other = m.A[b.j].nb.find(function (k) { return k !== b.i; });
        ref = other != null ? new T.Vector3().subVectors(V(m.A[other].p), a) : new T.Vector3(0, 0, 1);
        ref.addScaledVector(d, -ref.dot(d)); if (ref.lengthSq() < 1e-4) ref.set(d.y, -d.x, 0); ref.normalize();
      }
      if (o === 1) cyl(world, a, c, .1, bondM);
      else if (o === 2) {
        if (b.ar) { cyl(world, a, c, .1, bondM); cyl(world, a.clone().addScaledVector(ref, .26).addScaledVector(d, .2), c.clone().addScaledVector(ref, .26).addScaledVector(d, -.2), .07, mat(0xE8A33C, { r: .4 })); }
        else { cyl(world, a.clone().addScaledVector(ref, .13), c.clone().addScaledVector(ref, .13), .07, bondM); cyl(world, a.clone().addScaledVector(ref, -.13), c.clone().addScaledVector(ref, -.13), .07, bondM); }
      } else if (o === 3) {
        var side = new T.Vector3().crossVectors(d, ref).normalize();
        cyl(world, a, c, .07, bondM); cyl(world, a.clone().addScaledVector(ref, .18), c.clone().addScaledVector(ref, .18), .06, bondM); cyl(world, a.clone().addScaledVector(side, .18), c.clone().addScaledVector(side, .18), .06, bondM);
      } else if (o === 1.5) {
        cyl(world, a, c, .1, bondM);
        var a2 = a.clone().addScaledVector(ref, .26), c2 = c.clone().addScaledVector(ref, .26), dm = mat(0x9B7BE0, { r: .4 });
        for (var k = 0; k < 5; k++) { var u0 = .16 + k * .15, u1 = u0 + .08; cyl(world, a2.clone().lerp(c2, u0), a2.clone().lerp(c2, u1), .06, dm); }
      }
      if (m.arom && b.ar && S.lengths) {
        var lab = label(lenOf(m, b).toFixed(2) + ' Å', o === 2 ? '#F2B45A' : o === 1 ? '#C9D4DC' : '#C9B5FF');
        lab.position.copy(a.clone().add(c).multiplyScalar(.5)).addScaledVector(ref, -.75); world.add(lab);
      }
    });
    if (m.arom) drawPi(m, ri);
    note();
  }
  function drawPi(m, ri) {
    var n = ri.n, up = n.clone();
    var q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), n);
    if (S.pOrb) { // p orbital on every ring carbon: two lobes along the normal
      var lobeG = new T.SphereGeometry(1, 20, 14), mA = mat(0x5B8DEF, { a: .38, r: .6 }), mB = mat(0xF07A7A, { a: .38, r: .6 });
      ri.pts.forEach(function (p) {
        [1, -1].forEach(function (s) { var l = new T.Mesh(lobeG, s > 0 ? mA : mB); l.scale.set(.32, .32, .62); l.quaternion.copy(q); l.position.copy(p).addScaledVector(up, s * .62); world.add(l); });
      });
    }
    if (S.res) { // one delocalised ring above and one below
      var R0 = ri.pts[0].distanceTo(ri.c), tor = new T.TorusGeometry(R0, .42, 18, 64), tm = mat(0x7C5CE0, { a: .3, r: .5, side: T.DoubleSide });
      [1, -1].forEach(function (s) { var t = new T.Mesh(tor, tm); t.quaternion.copy(q); t.position.copy(ri.c).addScaledVector(up, s * .72); world.add(t); });
      var eG = new T.SphereGeometry(.13, 12, 10), eM = mat(0xFFD23F, { em: 0xFFB300, ei: .9 });
      for (var k = 0; k < 6; k++) { var e = new T.Mesh(eG, eM); world.add(e); electrons.push({ m: e, a: k * Math.PI / 3, s: k % 2 ? 1 : -1, R: R0, c: ri.c, n: up, q: q }); }
    } else { // three separate π bonds over the C=C bonds only
      var blob = new T.SphereGeometry(1, 22, 16), bm = mat(0x7C5CE0, { a: .32, r: .5 });
      m.B.forEach(function (b) {
        if (!b.ar || order(m, b) !== 2) return;
        var a = V(m.A[b.i].p), c = V(m.A[b.j].p), mid = a.clone().add(c).multiplyScalar(.5), d = new T.Vector3().subVectors(c, a);
        [1, -1].forEach(function (s) {
          var o = new T.Mesh(blob, bm); o.scale.set(d.length() * .62, .3, .42);
          var qq = new T.Quaternion().setFromUnitVectors(new T.Vector3(1, 0, 0), d.clone().normalize()); o.quaternion.copy(qq);
          o.position.copy(mid).addScaledVector(up, s * .7); world.add(o);
        });
        for (var k = 0; k < 2; k++) { var e = new T.Mesh(new T.SphereGeometry(.13, 12, 10), mat(0xFFD23F, { em: 0xFFB300, ei: .9 })); world.add(e); electrons.push({ m: e, loc: true, a0: a, a1: c, s: k ? 1 : -1, n: up, ph: k * Math.PI }); }
      });
    }
  }
  var t0 = performance.now();
  function loop() {
    var now = performance.now(), t = (now - t0) / 1000;
    if (S.rot) th += .004;
    cam.position.set(dist * Math.sin(ph) * Math.sin(th), dist * Math.cos(ph), dist * Math.sin(ph) * Math.cos(th)); cam.lookAt(0, 0, 0);
    electrons.forEach(function (e) {
      if (e.loc) { var u = .5 + .45 * Math.sin(t * 2.2 + e.ph); e.m.position.copy(e.a0).lerp(e.a1, u).addScaledVector(e.n, e.s * .7); }
      else { var a = e.a + t * 1.1 * e.s; var v = new T.Vector3(Math.cos(a) * e.R, Math.sin(a) * e.R, 0).applyQuaternion(e.q); e.m.position.copy(e.c).add(v).addScaledVector(e.n, e.s * .72); }
    });
    if (tween) { var u = Math.min(1, (now - tween.t0) / 900), k = u * u * (3 - 2 * u); S.mol.A.forEach(function (a, i) { for (var j = 0; j < 3; j++) a.p[j] = tween.from[i][j] + (tween.to[i][j] - tween.from[i][j]) * k; }); draw(); if (u >= 1) tween = null; }
    R.render(scene, cam);
    requestAnimationFrame(loop);
  }

  /* ---------- 2-D resonance strip and notes ---------- */
  function hexSVG(flip, mode, active) {
    var r = 30, cx = 44, cy = 40, pts = [];
    for (var i = 0; i < 6; i++) { var a = -Math.PI / 2 + i * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    var s = '<svg viewBox="0 0 88 80" width="88" height="80" aria-hidden="true" class="kek' + (active ? ' on' : '') + '">';
    for (var k = 0; k < 6; k++) {
      var p = pts[k], q = pts[(k + 1) % 6]; s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '"/>';
      if (mode === 'k' && (k + flip) % 2 === 0) { var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, ix = (cx - mx) * .22, iy = (cy - my) * .22; s += '<line x1="' + (p[0] + ix + (q[0] - p[0]) * .15) + '" y1="' + (p[1] + iy + (q[1] - p[1]) * .15) + '" x2="' + (q[0] + ix - (q[0] - p[0]) * .15) + '" y2="' + (q[1] + iy - (q[1] - p[1]) * .15) + '"/>'; }
    }
    if (mode === 'h') s += '<circle cx="' + cx + '" cy="' + cy + '" r="17" fill="none" stroke-dasharray="4 3"/>';
    return s + '</svg>';
  }
  function note() {
    var m = S.mol, box = document.getElementById('o3dRes');
    box.hidden = !m.arom;
    if (!m.arom) { document.getElementById('o3dInfo').textContent = 'Drag to turn the molecule, scroll or pinch to zoom. ' + (m.A.some(function (a) { return a.ang > 109 && a.ang < 110; }) ? 'Single-bonded carbons are tetrahedral (109.5°), so chains zig-zag in 3D.' : ''); return; }
    document.getElementById('o3dStrip').innerHTML = hexSVG(0, 'k', !S.res && S.flip === 0) + '<span class="dharrow" aria-hidden="true">⟷</span>' + hexSVG(1, 'k', !S.res && S.flip === 1) + '<span class="eqs" aria-hidden="true">=</span>' + hexSVG(0, 'h', S.res);
    document.getElementById('o3dInfo').innerHTML = S.res
      ? '<b>Resonance ON: the real benzene.</b> The six π electrons are not stuck in three double bonds. They are <b>delocalised</b> around the whole ring (purple rings above and below the plane). Every C–C bond is the same: <b>1.39 Å</b>, bond order <b>1.5</b>, between a single (1.54 Å) and a double bond (1.34 Å). The ring is a perfect, flat hexagon, and this delocalisation makes benzene extra stable (about 150 kJ/mol): it prefers substitution to addition.'
      : '<b>Resonance OFF: one Kekulé structure.</b> Three C=C double bonds (<b>1.34 Å</b>) alternate with three C–C single bonds (<b>1.54 Å</b>), so the hexagon would be uneven. The π electrons sit in three separate π bonds. Press <b>Flip</b> to see the other Kekulé structure. Real benzene is <b>neither</b>: experiments show all six bonds are equal, so turn resonance on.';
    syncBtns();
  }
  function syncBtns() {
    var q = function (id) { return document.getElementById(id); };
    q('o3dRot').textContent = 'Auto-rotate: ' + (S.rot ? 'on' : 'off');
    q('o3dResOn').setAttribute('aria-pressed', S.res); q('o3dResOff').setAttribute('aria-pressed', !S.res);
    q('o3dFlip').disabled = S.res;
    q('o3dSF').setAttribute('aria-pressed', S.rep === 'sf'); q('o3dBS').setAttribute('aria-pressed', S.rep === 'bs');
  }

  function fitView() { var m = S.mol; if (!m) return; var r = 0; m.A.forEach(function (a) { r = Math.max(r, Math.hypot(a.p[0], a.p[1], a.p[2])); }); dist = Math.max(6.5, r * 2.5 + 2.5); var asp = host.clientWidth / Math.max(1, host.clientHeight); if (asp < 1.2) dist *= Math.pow(1.2 / asp, .7); }
  function rebuild(keepView) {
    if (!S.st) return;
    S.mol = makeMol(S.st); fitView();
    if (S.ready) draw(); else note();
  }
  function regeometry() { // same atoms, new bond orders (resonance / flip): animate to the new geometry
    var m = S.mol; if (!m) return;
    var from = m.A.map(function (a) { return a.p.slice(); });
    relax(m, 400);
    var to = m.A.map(function (a) { return a.p.slice(); });
    m.A.forEach(function (a, i) { a.p = from[i].slice(); });
    tween = { from: from, to: to, t0: performance.now() }; draw();
  }

  window.Organic3D = {
    update: function (st) { var key = JSON.stringify(st); if (key === S.key) return; S.key = key; S.st = JSON.parse(key); S.flip = 0; rebuild(); },
    show: function () { if (init()) { resize(); draw(); } },
    debug: function () { return S.mol; }
  };
  var q = function (id) { return document.getElementById(id); };
  q('o3dRot').onclick = function () { S.rot = !S.rot; syncBtns(); };
  q("o3dReset").onclick = function () { th = .25; ph = 1.3; fitView(); };
  q('o3dBS').onclick = function () { S.rep = 'bs'; draw(); syncBtns(); };
  q('o3dSF').onclick = function () { S.rep = 'sf'; draw(); syncBtns(); };
  q('o3dH').onchange = function (e) { S.showH = e.target.checked; draw(); };
  q('o3dResOn').onclick = function () { if (S.res) return; S.res = true; regeometry(); note(); };
  q('o3dResOff').onclick = function () { if (!S.res) return; S.res = false; regeometry(); note(); };
  q('o3dFlip').onclick = function () { if (S.res) return; S.flip = 1 - S.flip; regeometry(); note(); };
  q('o3dP').onchange = function (e) { S.pOrb = e.target.checked; draw(); };
  q('o3dL').onchange = function (e) { S.lengths = e.target.checked; draw(); };
  q('o3dBenz').onclick = function () { if (window.Organic3DLoadBenzene) window.Organic3DLoadBenzene(); };
  // start when the card scrolls into view (saves work on phones)
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { window.Organic3D.show(); io.disconnect(); } }); }) : null;
  if (io) io.observe(host); else window.Organic3D.show();
})();
