/* phys-parts.js — realistic bench hardware for the physics camera labs (three.js r128, used with hand-kit.js).
   PhysParts(K) returns factories for apparatus in the same look as the rest of the lab bench: turned and
   bevelled shapes, brass, copper, steel, bakelite and wood, printed labels, and meters with live screens.
   Everything is built from code, so the labs stay small files with no model downloads. */
(function () {
  'use strict';
  function make(K) {
    var T = K.T, P = {}, PI = Math.PI, texts = [];
    var std = P.std = function (c, r, m, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r == null ? .6 : r, metalness: m || 0 }, o || {})); };
    /* a canvas texture with text on it: drawn again once the web fonts have loaded */
    var ptex = P.tex = function (w, h, fn) { var t = K.canvasTex(w, h, fn); texts.push({ t: t, fn: fn, w: w, h: h }); return t; };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { texts.forEach(function (q) { var x = q.t.image.getContext('2d'); x.clearRect(0, 0, q.w, q.h); x.shadowBlur = 0; q.fn(x, q.w, q.h); q.t.needsUpdate = true; }); });
    var MONO = '"IBM Plex Mono",ui-monospace,monospace', DISP = '"Bricolage Grotesque","Trebuchet MS",sans-serif';
    P.MONO = MONO; P.DISP = DISP;

    /* ---------- materials ---------- */
    P.brass = std(0xD8B45A, .28, .75, { envMapIntensity: 1 }); P.copper = std(0xC87A45, .3, .8, { envMapIntensity: 1.1 }); P.steel = std(0xC9D1D6, .3, .8, { envMapIntensity: 1 });
    P.dark = std(0x23282C, .5, .05); P.rubber = std(0x15181B, .85); P.ivory = std(0xF1EEE4, .5); P.grey = std(0x7A8794, .6); P.foot = std(0x2D363B, .6);
    P.wood = function (base, grain) {
      return std(0xffffff, .78, 0, { map: K.canvasTex(256, 256, function (x, w, h) { x.fillStyle = base || '#B07C48'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 80; i++) { x.strokeStyle = 'rgba(' + (grain || '70,40,12') + ',' + (.05 + Math.random() * .13) + ')'; x.lineWidth = .6 + Math.random() * 2.2; var y = Math.random() * h, d = (Math.random() - .5) * 26; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + d, w * .65, y - d, w, y + d * .4); x.stroke(); } }) });
    };
    var cast = P.cast = function (g) { g.traverse(function (m) { if (m.isMesh && !m.material.transparent) m.castShadow = true; }); return g; };
    var mesh = P.mesh = function (geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };

    /* ---------- shapes ---------- */
    /* box with rounded corners and bevelled edges, centred on the origin */
    P.rbox = function (w, h, d, r, b) {
      b = b == null ? Math.min(w, h, d) * .08 : b; var W = w - 2 * b, H = h - 2 * b, s = new T.Shape(), x = -W / 2, y = -H / 2; r = Math.max(.001, Math.min(r == null ? b * 2 : r, W / 2, H / 2));
      s.moveTo(x + r, y); s.lineTo(x + W - r, y); s.quadraticCurveTo(x + W, y, x + W, y + r); s.lineTo(x + W, y + H - r); s.quadraticCurveTo(x + W, y + H, x + W - r, y + H); s.lineTo(x + r, y + H); s.quadraticCurveTo(x, y + H, x, y + H - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      var g = new T.ExtrudeGeometry(s, { depth: Math.max(.001, d - 2 * b), bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 6 }); g.translate(0, 0, -(d - 2 * b) / 2); return g;
    };
    /* something turned on a lathe from a profile [[radius, height], ...] */
    P.turned = function (prof, mat, seg) { return new T.Mesh(new T.LatheGeometry(prof.map(function (p) { return new T.Vector2(p[0], p[1]); }), seg || 32), mat); };
    /* a printed label: flat, with its own text */
    P.label = function (text, w, h, o) {
      o = o || {}; var cw = o.res || 256, ch = Math.max(8, Math.round(cw * h / w));
      var t = ptex(cw, ch, function (x) { if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, cw, ch); } x.fillStyle = o.ink || '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = (o.weight || '700') + ' ' + Math.round(ch * (o.size || .7)) + 'px ' + (o.font || MONO); x.fillText(text, cw / 2, ch * .54, cw * .94); });
      return new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: t, transparent: !o.bg }));
    };
    /* stand: a chrome rod on a dark foot. Returns the group; the top of the rod is at height h */
    P.stand = function (h, o) {
      o = o || {}; var g = new T.Group(); g.add(mesh(P.rbox(o.fw || 1.1, .12, o.fd || .9, .08, .03), P.foot, 0, .06, 0)); g.add(mesh(new T.CylinderGeometry(.065, .065, h, 14), P.steel, 0, h / 2, 0));
      g.add(mesh(new T.CylinderGeometry(.11, .13, .14, 14), P.foot, 0, .19, 0)); return cast(g);
    };

    /* ---------- terminals and cables ---------- */
    /* binding post standing along +y: brass stem and a coloured knurled cap */
    P.post = function (col) {
      var g = new T.Group(), cm = std(col == null ? 0xC62828 : col, .5);
      g.add(mesh(new T.CylinderGeometry(.085, .1, .06, 6), P.brass, 0, .03, 0)); g.add(mesh(new T.CylinderGeometry(.038, .038, .26, 10), P.brass, 0, .15, 0));
      g.add(mesh(new T.CylinderGeometry(.1, .1, .15, 18), cm, 0, .2, 0));
      for (var i = 0; i < 9; i++) { var a = i / 9 * PI * 2, r = mesh(new T.BoxGeometry(.018, .15, .022), cm, Math.cos(a) * .1, .2, Math.sin(a) * .1); r.rotation.y = -a; g.add(r); }
      g.add(mesh(new T.CylinderGeometry(.055, .055, .02, 12), P.brass, 0, .285, 0)); return g;
    };
    /* flexible lead. set([Vector3 or [x,y,z], ...]) lays it through those points */
    P.cable = function (col, rad) {
      var m = new T.Mesh(new T.BufferGeometry(), std(col == null ? 0x16191C : col, .55)); m.castShadow = true; m.frustumCulled = false; K.scene.add(m);
      var c = { mesh: m, set: function (pts) { var v = pts.map(function (p) { return p.isVector3 ? p : new T.Vector3(p[0], p[1], p[2] || 0); }); m.geometry.dispose(); m.geometry = new T.TubeGeometry(new T.CatmullRomCurve3(v, false, 'centripetal'), Math.max(16, v.length * 9), rad || .045, 7, false); return c; } };
      return c;
    };
    /* points of a slack lead from a to b that sags by `sag` and rests on the bench instead of going through it */
    P.hang = function (a, b, sag, bow) {
      var out = [], n = 7; for (var i = 0; i <= n; i++) { var u = i / n, q = 4 * u * (1 - u); out.push(new T.Vector3(a.x + (b.x - a.x) * u, Math.max(.05, a.y + (b.y - a.y) * u - (sag || 0) * q), a.z + (b.z - a.z) * u + (bow || 0) * q)); } return out;
    };
    /* banana plug pushed into a socket along -y */
    P.plug = function (col) { var g = new T.Group(); g.add(mesh(new T.CylinderGeometry(.055, .07, .3, 12), std(col, .5), 0, .15, 0)); g.add(mesh(new T.CylinderGeometry(.03, .03, .1, 8), P.brass, 0, -.04, 0)); return g; };

    /* ---------- meters ---------- */
    /* digital meter with a live screen. o: { w, h, d, col, title, sub }. show(text, unit) writes on the screen. */
    P.meter = function (o) {
      o = o || {}; var w = o.w || 1.7, h = o.h || 1.25, d = o.d || .5, g = new T.Group();
      g.add(mesh(P.rbox(w, h, d, .1, .04), std(o.col == null ? 0xF2B41F : o.col, .55), 0, h / 2, 0));
      g.add(mesh(P.rbox(w * .88, h * .84, .04, .06, .012), std(0x23282C, .6), 0, h / 2, d / 2));
      var cv = document.createElement('canvas'); cv.width = 320; cv.height = 128; var tx = new T.CanvasTexture(cv), last = null;
      var sw = w * .76, sh = sw * .4, scr = mesh(new T.PlaneGeometry(sw, sh), new T.MeshBasicMaterial({ map: tx }), 0, h * .62, d / 2 + .024); g.add(scr);
      g.add(mesh(P.rbox(sw + .08, sh + .08, .03, .04, .01), std(0x0E1113, .4), 0, h * .62, d / 2 + .008));
      if (o.title) { var lb = P.label(o.title, w * .7, h * .15, { ink: '#E9EEF0', size: .78 }); lb.position.set(0, h * .25, d / 2 + .026); g.add(lb); }
      var posts = []; [[-1, 0x16191C], [1, 0xC62828]].forEach(function (q) { var j = mesh(new T.CylinderGeometry(.075, .075, .06, 16), std(q[1], .5), q[0] * w * .34, h * .11 + .03, d / 2 + .02); j.rotation.x = PI / 2; g.add(j);
        var hole = mesh(new T.CylinderGeometry(.035, .035, .065, 10), std(0x050607, .8), q[0] * w * .34, h * .11 + .03, d / 2 + .022); hole.rotation.x = PI / 2; g.add(hole); posts.push(new T.Vector3(q[0] * w * .34, h * .11 + .03, d / 2 + .05)); });
      for (var i = 0; i < 4; i++) g.add(mesh(new T.CylinderGeometry(.06, .07, .05, 10), P.rubber, (i % 2 ? 1 : -1) * w * .4, -.02, (i < 2 ? 1 : -1) * d * .3));
      var me = { g: cast(g), w: w, h: h, d: d, posts: posts,
        show: function (text, unit, dim) { var s = text + '|' + unit + '|' + dim; if (s === last) return; last = s; var x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#D3DEC2'); gr.addColorStop(1, '#AFBE98'); x.fillStyle = gr; x.fillRect(0, 0, 320, 128);
          x.fillStyle = dim ? 'rgba(23,33,15,.45)' : '#17210F'; x.textBaseline = 'middle'; x.textAlign = 'right'; x.font = '700 70px ' + MONO; x.fillText(text, 232, 68, 220); x.textAlign = 'left'; x.font = '700 36px ' + MONO; x.fillText(unit || '', 242, 80, 72); tx.needsUpdate = true; },
        post: function (i) { return g.localToWorld(posts[i].clone()); } };
      me.show('0.00', o.unit || ''); return me;
    };
    /* centre-zero galvanometer with a moving needle. o: { full (µA at full scale), unit, majors (numbered divisions each side), steps (small steps in each) }. set(a) and ghost(a) take -1..1 */
    P.galvanometer = function (o) {
      o = o || {}; var full = o.full || 300, g = new T.Group(), body = new T.Group(); g.add(body); body.rotation.x = -.14;
      body.add(mesh(P.rbox(2.3, 2.05, .7, .16, .05), std(0x1E2326, .42, .05), 0, 1.06, 0));
      body.add(mesh(P.rbox(2.06, 1.36, .06, .1, .015), std(0x0B0D0F, .35), 0, 1.3, .35));
      var SP = 50 * PI / 180, dial = ptex(512, 320, function (x, w, h) {
        var gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FBF9F0'); gr.addColorStop(1, '#ECE8D8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
        var cx = 256, cy = 300, R = 226; x.strokeStyle = '#1B2024'; x.fillStyle = '#1B2024'; x.lineCap = 'butt';
        x.lineWidth = 12; x.strokeStyle = '#C9D6DC'; x.beginPath(); x.arc(cx, cy, R - 62, -PI / 2 - SP, -PI / 2 + SP); x.stroke();        // the mirror strip that real meters have
        x.strokeStyle = '#1B2024'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R, -PI / 2 - SP, -PI / 2 + SP); x.stroke();
        var MJ = o.majors || 3, ST = o.steps || 10, NT = MJ * ST;          // numbered divisions each side, and small steps in each
        for (var i = -NT; i <= NT; i++) { var a = -PI / 2 + i / NT * SP, big = i % ST === 0, mid = ST % 2 === 0 && i % (ST / 2) === 0, l = big ? 30 : mid ? 21 : 13; x.lineWidth = big ? 4 : 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.lineTo(cx + Math.cos(a) * (R - l), cy + Math.sin(a) * (R - l)); x.stroke();
          if (big) { x.save(); x.translate(cx + Math.cos(a) * (R + 22), cy + Math.sin(a) * (R + 22)); x.rotate(a + PI / 2); x.font = '700 25px ' + MONO; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(Math.abs(Math.round(i / NT * full))), 0, 0); x.restore(); } }
        x.font = '800 62px ' + DISP; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('G', cx, 214); x.font = '600 24px ' + MONO; x.fillText(o.unit || 'µA', cx, 258);
        x.font = '700 30px ' + MONO; x.fillText('−', 60, 250); x.fillText('+', 452, 250);
      });
      body.add(mesh(new T.PlaneGeometry(1.92, 1.2), new T.MeshBasicMaterial({ map: dial }), 0, 1.3, .384));
      var piv = new T.Group(); piv.position.set(0, 1.3 - .6 + 20 / 320 * 1.2, .4); body.add(piv);
      var ghost = mesh(new T.BoxGeometry(.016, .86, .004), new T.MeshBasicMaterial({ color: 0xE08A1E, transparent: true, opacity: 0 }), 0, .43, 0), gp = new T.Group(); gp.add(ghost); piv.add(gp);
      var np = new T.Group(); np.position.z = .012; np.add(mesh(new T.BoxGeometry(.022, .9, .006), new T.MeshBasicMaterial({ color: 0xB3231B }), 0, .42, 0)); np.add(mesh(new T.BoxGeometry(.05, .16, .006), new T.MeshBasicMaterial({ color: 0x1B2024 }), 0, -.06, 0)); piv.add(np);
      var cap = mesh(new T.CylinderGeometry(.07, .07, .04, 18), std(0x15181B, .4), 0, 0, .03); cap.rotation.x = PI / 2; piv.add(cap);
      body.add(mesh(new T.PlaneGeometry(1.92, 1.2), new T.MeshPhysicalMaterial({ color: 0xDDEEF5, transparent: true, opacity: .1, roughness: .02, depthWrite: false, envMapIntensity: 2 }), 0, 1.3, .44));
      var name = P.label(o.name || 'GALVANOMETER', 1.5, .17, { ink: '#C9D1D6', size: .74, res: 384 }); name.position.set(0, .44, .356); body.add(name);
      var posts = []; [[-1, 0x16191C], [1, 0xC62828]].forEach(function (q) { var p = P.post(q[1]); p.rotation.x = PI / 2; p.position.set(q[0] * .78, .2, .35); body.add(p); posts.push(new T.Vector3(q[0] * .78, .2, .62)); });
      var scr = mesh(new T.CylinderGeometry(.045, .045, .03, 12), P.steel, 0, .2, .36); scr.rotation.x = PI / 2; body.add(scr);
      cast(g); K.scene.add(g);
      return { g: g, full: full, set: function (a) { np.rotation.z = -Math.max(-1.12, Math.min(1.12, a)) * SP; }, ghost: function (a, op) { gp.rotation.z = -Math.max(-1.12, Math.min(1.12, a)) * SP; ghost.material.opacity = op; },
        post: function (i) { g.updateMatrixWorld(true); return body.localToWorld(posts[i].clone()); } };
    };

    /* ---------- magnet and coil ---------- */
    /* painted bar magnet lying along x, N pole at +x. Letters on the front and on the back, so it reads the right way when turned round. */
    P.barMagnet = function (len, th) {
      len = len || 2.2; th = th || .36; var g = new T.Group(), half = len / 2;
      var paint = function (c) { return std(c, .32, .12, { envMapIntensity: .9 }); };
      g.add(mesh(P.rbox(half, th, th, .04, .025), paint(0xC8322B), half / 2, 0, 0)); g.add(mesh(P.rbox(half, th, th, .04, .025), paint(0x2C5FB8), -half / 2, 0, 0));
      g.add(mesh(new T.BoxGeometry(.03, th * 1.005, th * 1.005), std(0xE9EEF0, .4), 0, 0, 0));
      [['N', 1], ['S', -1]].forEach(function (q) { [1, -1].forEach(function (f) { var l = P.label(q[0], th * .8, th * .8, { res: 96, size: .86, weight: '800', font: DISP }); l.position.set(q[1] * (half - th * .62), 0, f * (th / 2 + .003)); if (f < 0) l.rotation.y = PI; g.add(l); });
        var t = P.label(q[0], th * .8, th * .8, { res: 96, size: .86, weight: '800', font: DISP }); t.rotation.x = -PI / 2; t.position.set(q[1] * (half - th * .62), th / 2 + .003, 0); g.add(t); });
      return g;
    };
    /* air-cored coil along x on a clear former, on a wooden cradle. o: { len, r, turns }. setTurns(n) rewinds it. Origin: the middle of the axis. */
    P.coil = function (o) {
      o = o || {}; var len = o.len || 2.6, r = o.r || .56, g = new T.Group(), wl = len - .3;
      var tube = mesh(new T.CylinderGeometry(r - .045, r - .045, len, 40, 1, true), K.glass(.2)); tube.rotation.z = PI / 2; g.add(tube);
      [-1, 1].forEach(function (s) { var fl = P.turned([[r - .05, 0], [r + .3, 0], [r + .3, .09], [r - .05, .09]], std(0x2A3035, .45, .05), 40); fl.rotation.z = -PI / 2; fl.position.x = s * len / 2 - .045; g.add(fl);
        var rim = mesh(new T.TorusGeometry(r - .05, .012, 6, 40), K.edgeMat); rim.rotation.y = PI / 2; rim.position.x = s * (len / 2 + .05); g.add(rim); });
      var wind = new T.Mesh(new T.BufferGeometry(), std(0xC9773F, .28, .85, { envMapIntensity: 1.2 })); wind.castShadow = true; g.add(wind);
      var c = { g: g, len: len, r: r, turns: 0, setTurns: function (n) { c.turns = n; var wr = Math.min(.036, wl / n * .46), pts = [], steps = n * 18;
          for (var i = 0; i <= steps; i++) { var u = i / steps, a = u * n * PI * 2; pts.push(new T.Vector3(-wl / 2 + u * wl, -Math.cos(a) * (r + wr * .4), Math.sin(a) * (r + wr * .4))); }
          pts.unshift(new T.Vector3(-wl / 2, -r - .5, .12)); pts.push(new T.Vector3(wl / 2, -r - .5, .12));
          wind.geometry.dispose(); wind.geometry = new T.TubeGeometry(new T.CatmullRomCurve3(pts, false, 'catmullrom', .2), steps, wr, 6, false); } };
      // cradle: a wooden beam with two saddles and an end stop, and the two terminals
      var wood = P.wood(); g.add(mesh(P.rbox(len + .9, .16, 1.1, .05, .03), wood, .15, -r - .62, 0));
      [-1, 1].forEach(function (s) { var sd = mesh(P.rbox(.14, .34, .9, .04, .02), wood, s * (len / 2 - .22), -r - .4, 0); g.add(sd); var p = P.post(s < 0 ? 0x16191C : 0xC62828); p.position.set(s * wl / 2, -r - .54, .34); g.add(p); });
      g.add(mesh(P.rbox(.2, r * 2 + .7, 1.0, .05, .03), wood, len / 2 + .22, -.28, 0));
      c.posts = [new T.Vector3(-wl / 2, -r - .3, .34), new T.Vector3(wl / 2, -r - .3, .34)]; c.setTurns(o.turns || 20); cast(g); return c;
    };
    /* ---------- controls ---------- */
    /* a live screen on its own: { m, show(text, unit, dim) } */
    P.lcd = function (sw) {
      var cv = document.createElement('canvas'); cv.width = 320; cv.height = 128; var tx = new T.CanvasTexture(cv), last = null, sh = sw * .4, m = new T.Group();
      m.add(mesh(P.rbox(sw + .08, sh + .08, .03, .04, .01), std(0x0E1113, .4), 0, 0, 0)); m.add(mesh(new T.PlaneGeometry(sw, sh), new T.MeshBasicMaterial({ map: tx }), 0, 0, .018));
      var o = { m: m, show: function (text, unit, dim) { var s = text + '|' + unit + '|' + dim; if (s === last) return; last = s; var x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#D3DEC2'); gr.addColorStop(1, '#AFBE98'); x.fillStyle = gr; x.fillRect(0, 0, 320, 128);
        x.fillStyle = dim ? 'rgba(23,33,15,.45)' : '#17210F'; x.textBaseline = 'middle'; x.textAlign = 'right'; x.font = '700 70px ' + MONO; x.fillText(text, 232, 68, 220); x.textAlign = 'left'; x.font = '700 36px ' + MONO; x.fillText(unit || '', 242, 80, 72); tx.needsUpdate = true; } };
      o.show('0.00', ''); return o;
    };
    /* fluted knob facing the student. set(u) turns it: u = 0 fully left, 1 fully right */
    P.knob = function (r) {
      r = r || .3; var g = new T.Group(), m = std(0x1B1F22, .42, .1), turn = new T.Group(), sk = mesh(new T.CylinderGeometry(r * 1.2, r * 1.3, .05, 32), m, 0, 0, .025); sk.rotation.x = PI / 2; g.add(sk); g.add(turn);
      var b = mesh(new T.CylinderGeometry(r * .84, r, .24, 28), m, 0, 0, .17); b.rotation.x = PI / 2; turn.add(b);
      for (var i = 0; i < 16; i++) { var a = i / 16 * PI * 2, f = mesh(new T.BoxGeometry(r * .1, r * .1, .22), m, Math.cos(a) * r * .93, Math.sin(a) * r * .93, .17); f.rotation.z = a; turn.add(f); }
      var cap = mesh(new T.CylinderGeometry(r * .8, r * .8, .02, 28), std(0xC9D1D6, .3, .8), 0, 0, .295); cap.rotation.x = PI / 2; turn.add(cap);
      turn.add(mesh(new T.BoxGeometry(r * .1, r * .62, .012), new T.MeshBasicMaterial({ color: 0xFFFFFF }), 0, r * .5, .31));
      return { g: g, set: function (u) { turn.rotation.z = (.75 - 1.5 * u) * PI; } };
    };
    /* instrument case with a screen on the left and a knob on the right. o: { w, h, d, col, title, knobLabel, scale: [left, right] } */
    P.supply = function (o) {
      o = o || {}; var w = o.w || 2.3, h = o.h || 1.5, d = o.d || .6, g = new T.Group(), z = d / 2;
      g.add(mesh(P.rbox(w, h, d, .1, .04), std(o.col == null ? 0xDDE3E6 : o.col, .5), 0, h / 2, 0)); g.add(mesh(P.rbox(w * .93, h * .88, .04, .06, .012), std(0x2B3238, .6), 0, h / 2, z));
      var L = P.lcd(w * .44); L.m.position.set(-w * .2, h * .64, z + .03); g.add(L.m);
      var kn = P.knob(Math.min(.3, h * .2)); kn.g.position.set(w * .27, h * .56, z + .02); g.add(kn.g);
      if (o.title) { var t = P.label(o.title, w * .46, h * .13, { ink: '#E9EEF0', size: .78, res: 320 }); t.position.set(-w * .2, h * .3, z + .026); g.add(t); }
      if (o.knobLabel) { var kl = P.label(o.knobLabel, w * .4, h * .1, { ink: '#C9D1D6', size: .8, res: 320 }); kl.position.set(w * .27, h * .2, z + .026); g.add(kl); }
      if (o.scale) [[-1, o.scale[0]], [1, o.scale[1]]].forEach(function (q) { var s = P.label(q[1], w * .14, h * .1, { ink: '#C9D1D6', size: .85, res: 128 }); s.position.set(w * .27 + q[0] * w * .16, h * .33, z + .026); g.add(s); });
      var posts = []; [[-1, 0x16191C], [1, 0xC62828]].forEach(function (q) { var j = mesh(new T.CylinderGeometry(.07, .07, .06, 16), std(q[1], .5), -w * .2 + q[0] * w * .13, h * .13, z + .02); j.rotation.x = PI / 2; g.add(j); posts.push(new T.Vector3(-w * .2 + q[0] * w * .13, h * .13, z + .05)); });
      for (var i = 0; i < 4; i++) g.add(mesh(new T.CylinderGeometry(.06, .07, .05, 10), P.rubber, (i % 2 ? 1 : -1) * w * .4, -.02, (i < 2 ? 1 : -1) * d * .3));
      cast(g); return { g: g, w: w, h: h, show: L.show, knob: kn, knobAt: new T.Vector3(w * .27, h * .56, z + .2), post: function (i) { g.updateMatrixWorld(true); return g.localToWorld(posts[i].clone()); } };
    };

    /* ---------- light and the phototube ---------- */
    /* lamp housing. The light leaves from the origin along -x; a filter slide sits in the two rails at the nose. glow(hex, u) lights the lens. */
    P.lamp = function () {
      var g = new T.Group(), blk = std(0x1E2326, .5, .25), ax = function (m) { m.rotation.z = PI / 2; return m; };
      g.add(ax(mesh(new T.CylinderGeometry(.3, .33, .6, 28), blk, .36, 0, 0))); g.add(ax(mesh(new T.CylinderGeometry(.52, .52, 1.5, 32), blk, 1.4, 0, 0)));
      g.add(ax(mesh(new T.CylinderGeometry(.33, .52, .16, 32), blk, .6, 0, 0)));
      for (var i = 0; i < 6; i++) { var fin = mesh(new T.TorusGeometry(.53, .03, 6, 32), std(0x2E353A, .45, .3), .9 + i * .2, 0, 0); fin.rotation.y = PI / 2; g.add(fin); }
      var back = P.turned([[0, 0], [.3, .02], [.48, .1], [.52, .22]], blk, 28); back.rotation.z = -PI / 2; back.position.x = 2.37; g.add(back);
      var lens = mesh(new T.CircleGeometry(.27, 28), new T.MeshBasicMaterial({ color: 0x20262A }), .05, 0, 0); lens.rotation.y = -PI / 2; g.add(lens);
      var ring = mesh(new T.TorusGeometry(.28, .03, 8, 28), P.steel, .05, 0, 0); ring.rotation.y = PI / 2; g.add(ring);
      // filter holder: a collar on the nose with a three-sided frame that a slide drops into
      var hm = std(0x3A4248, .4, .4); g.add(ax(mesh(new T.CylinderGeometry(.36, .36, .1, 28), hm, .1, 0, 0)));
      [-1, 1].forEach(function (s) { g.add(mesh(P.rbox(.12, 1.02, .07, .02, .01), hm, .0, -.02, s * .41)); }); g.add(mesh(P.rbox(.12, .07, .88, .02, .01), hm, .0, -.54, 0));
      g.add(mesh(P.rbox(.5, .16, .3, .04, .02), blk, 1.4, -.58, 0)); var lb = P.label('Hg LAMP', .8, .16, { ink: '#C9D1D6', size: .8 }); lb.position.set(1.45, 0, .525); g.add(lb);
      cast(g); return { g: g, glow: function (hex, u) { lens.material.color.setHex(u > 0 ? hex : 0x20262A); if (u > 0) lens.material.color.lerp(new T.Color(0xffffff), .25 + .3 * u); } };
    };
    /* colour filter slide: tinted glass in a black frame with the wavelength printed on it */
    P.filter = function (hex, text) {
      var g = new T.Group(), fr = std(0x23282C, .5), W = .7, H = .88, win = .5, cy = .1;
      g.add(mesh(P.rbox(W, .1, .06, .02, .01), fr, 0, cy + win / 2 + .05, 0)); g.add(mesh(P.rbox(W, H - win - .1 - .0, .06, .02, .01), fr, 0, cy - win / 2 - (H - win - .1) / 2, 0));
      [-1, 1].forEach(function (s) { g.add(mesh(P.rbox((W - win) / 2, win, .06, .01, .008), fr, s * (win / 2 + (W - win) / 4), cy, 0)); });
      g.add(mesh(new T.PlaneGeometry(win, win), new T.MeshPhysicalMaterial({ color: hex, transparent: true, opacity: .7, roughness: .04, side: T.DoubleSide, depthWrite: false, envMapIntensity: 1.5 }), 0, cy, 0));
      [1, -1].forEach(function (f) { var l = P.label(text, W * .86, .2, { bg: '#F4F3EE', ink: '#1B2024', size: .72, res: 192 }); l.position.set(0, cy - win / 2 - .14, f * .032); if (f < 0) l.rotation.y = PI; g.add(l); });
      return g;
    };
    /* evacuated glass tube lying along x with two plates inside: the emitter on the left, the collector on the right. Origin: the middle of the axis. */
    P.phototube = function (o) {
      o = o || {}; var L = o.len || 3.6, r = o.r || .8, H0 = o.height || 1.75, g = new T.Group(), prof = [], i, a, dome = r * .7;
      for (i = 0; i <= 8; i++) { a = i / 8 * PI / 2; prof.push([r * Math.sin(a), -L / 2 + dome * (1 - Math.cos(a))]); } for (i = 8; i >= 0; i--) { a = i / 8 * PI / 2; prof.push([r * Math.sin(a), L / 2 - dome * (1 - Math.cos(a))]); }
      var env = P.turned(prof, K.glass(.17), 48); env.rotation.z = -PI / 2; g.add(env);
      var out = new T.Line(new T.BufferGeometry().setFromPoints(prof.map(function (p) { return new T.Vector3(p[1], p[0], 0); }).concat(prof.slice().reverse().map(function (p) { return new T.Vector3(p[1], -p[0], 0); }))), new T.LineBasicMaterial({ color: 0x3F6170, transparent: true, opacity: .7 })); g.add(out); K.outlines.push(out.material);
      var cat = std(0xC9CCD0, .35, .85, { envMapIntensity: 1.1 }), px = L / 2 - .65, posts = [];
      var em = mesh(P.rbox(.1, r * 1.3, r * 1.25, .18, .02), cat, -px, 0, 0); em.rotation.z = .3; g.add(em); var bk = mesh(P.rbox(.05, r * 1.36, r * 1.3, .18, .01), std(0x3A4046, .5, .4), -px - .085, -.025, 0); bk.rotation.z = .3; g.add(bk);
      g.add(mesh(P.rbox(.07, r * 1.2, r * 1.15, .16, .015), P.steel, px, 0, 0));
      [-1, 1].forEach(function (s) { var rod = mesh(new T.CylinderGeometry(.03, .03, .75, 8), P.steel, s * (L / 2 - .3), 0, 0); rod.rotation.z = PI / 2; g.add(rod);
        var seal = mesh(new T.SphereGeometry(.1, 12, 10), K.glass(.5), s * (L / 2 - .02), 0, 0); g.add(seal);
        var capM = mesh(new T.CylinderGeometry(.2, .24, .24, 20), P.brass, s * (L / 2 + .1), 0, 0); capM.rotation.z = PI / 2; g.add(capM);
        var p = P.post(s < 0 ? 0x16191C : 0xC62828); p.position.set(s * (L / 2 + .1), .18, 0); g.add(p); posts.push(new T.Vector3(s * (L / 2 + .1), .3, .12)); });
      var wood = P.wood(), by = -H0 + .08; g.add(mesh(P.rbox(L + .9, .16, 1.35, .05, .03), wood, 0, by, 0));
      [-1, 1].forEach(function (s) { var hh = H0 - r - .04; g.add(mesh(P.rbox(.16, hh, 1.2, .05, .02), wood, s * (L / 2 - 1.0), -H0 + .16 + hh / 2, 0));
        var sad = mesh(new T.TorusGeometry(r + .03, .05, 8, 24, PI), std(0x2A3035, .5), s * (L / 2 - 1.0), 0, 0); sad.rotation.y = PI / 2; sad.rotation.z = PI; g.add(sad); });
      cast(g); return { g: g, cat: cat, L: L, r: r, px: px, post: function (i) { g.updateMatrixWorld(true); return g.localToWorld(posts[i].clone()); } };
    };
    /* ---------- circuit board parts. Each lies along x between two terminals `E` apart and faces the student,
       so it can be turned to sit on an upright or a level gap of the board. ---------- */
    function partBase(E, inner, col) {
      var g = new T.Group(), wm = col == null ? P.steel : std(col, .5);
      [-1, 1].forEach(function (s) { g.add(mesh(new T.TorusGeometry(.115, .034, 8, 20), P.brass, s * E / 2, 0, .02)); var L = E / 2 - .115 - inner; if (L > .01) { var w = mesh(new T.CylinderGeometry(.03, .03, L, 8), wm, s * (inner + L / 2), 0, .02); w.rotation.z = PI / 2; g.add(w); } });
      return g;
    }
    /* lamp in a holder. glow(u): 0 = off, 1 = normal brightness */
    P.bulb = function (E) {
      var g = partBase(E, .42), gl = new T.MeshPhysicalMaterial({ color: 0xFFF6D8, transparent: true, opacity: .32, roughness: .03, depthWrite: false, envMapIntensity: 1.6, emissive: 0xFFC860, emissiveIntensity: 0 }), fil = std(0x55504A, .5, .4, { emissive: 0xFFB040, emissiveIntensity: 0 });
      var base = P.turned([[0, 0], [.46, 0], [.46, .08], [.4, .12], [.3, .12], [.3, .24], [.24, .3]], std(0xEDE7D8, .45), 32); base.rotation.x = PI / 2; g.add(base);
      var screw = P.turned([[.2, .2], [.215, .23], [.2, .26], [.215, .29], [.2, .32], [.215, .35], [.2, .38]], P.brass, 20); screw.rotation.x = PI / 2; g.add(screw);
      var globe = mesh(new T.SphereGeometry(.34, 28, 20), gl, 0, 0, .62); globe.scale.z = 1.12; g.add(globe);
      [-1, 1].forEach(function (s) { var sup = mesh(new T.CylinderGeometry(.012, .012, .3, 6), P.steel, s * .09, 0, .5); sup.rotation.x = PI / 2; g.add(sup); var scw = mesh(new T.CylinderGeometry(.05, .05, .05, 10), P.brass, s * .42, 0, .1); scw.rotation.x = PI / 2; g.add(scw); });
      var coil = mesh(new T.TorusGeometry(.09, .02, 6, 14, PI), fil, 0, 0, .65); coil.rotation.x = PI / 2; g.add(coil);
      var halo = new T.Sprite(new T.SpriteMaterial({ map: K.canvasTex(128, 128, function (x) { var gr = x.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(.3, 'rgba(255,190,80,.55)'); gr.addColorStop(1, 'rgba(255,160,50,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); }), transparent: true, opacity: 0, depthWrite: false })); halo.position.z = .75; g.add(halo);
      return { g: g, glow: function (u) { var v = Math.max(0, Math.min(1.5, u)); gl.emissiveIntensity = v * 1.1; gl.opacity = .32 + .4 * Math.min(1, v); fil.emissiveIntensity = Math.min(1, u * 6) * 2.2; halo.material.opacity = Math.min(.8, v * .7); var s = .8 + 1.5 * v; halo.scale.set(s, s, 1); } };
    };
    /* resistor with colour bands on a printed plinth. bands: three hex colours */
    P.resistor = function (E, text, bands) {
      var g = partBase(E, .52);
      g.add(mesh(P.rbox(1.0, .86, .07, .06, .015), std(0xF4F3EE, .5), 0, -.08, 0));
      var b = P.turned([[0, -.4], [.13, -.4], [.17, -.34], [.17, -.2], [.14, -.14], [.14, .14], [.17, .2], [.17, .34], [.13, .4], [0, .4]], std(0xD9C29A, .5), 20); b.rotation.z = PI / 2; b.position.set(0, .1, .2); g.add(b);
      (bands || []).concat([0xC9A227]).forEach(function (c, i) { var r = mesh(new T.CylinderGeometry(i === 3 ? .175 : (i === 0 ? .175 : .145), i === 3 ? .175 : (i === 0 ? .175 : .145), .06, 18), std(c, .45), i === 3 ? .27 : -.27 + i * .14, .1, .2); r.rotation.z = PI / 2; g.add(r); });
      [-1, 1].forEach(function (s) { var w = mesh(new T.CylinderGeometry(.025, .025, .14, 6), P.steel, s * .46, .1, .2); w.rotation.z = PI / 2; g.add(w); var d = mesh(new T.CylinderGeometry(.025, .025, .2, 6), P.steel, s * .52, .05, .11); d.rotation.x = PI / 2; g.add(d); });
      var lb = P.label(text, .8, .24, { ink: '#1B2024', size: .82, res: 192 }); lb.position.set(0, -.3, .04); g.add(lb);
      return { g: g };
    };
    /* capacitor: a can on a printed plinth, with a bar that fills as it charges. charge(u): 0 = empty, 1 = full (u < 0: charged the other way) */
    P.capacitor = function (E, text) {
      var g = partBase(E, .42);
      g.add(mesh(P.rbox(.92, .84, .07, .06, .015), std(0xF4F3EE, .5), 0, -.06, 0));
      var can = mesh(new T.CylinderGeometry(.27, .27, .6, 28), std(0x1F3B57, .45, .1), 0, .08, .37); can.rotation.x = PI / 2; g.add(can);
      var top = mesh(new T.CylinderGeometry(.262, .262, .02, 28), P.steel, 0, .08, .675); top.rotation.x = PI / 2; g.add(top);
      [0, 1].forEach(function (k) { var s = mesh(new T.BoxGeometry(.36, .012, .006), std(0x8C969C, .4, .6), 0, .08, .687); s.rotation.z = k * PI / 2; g.add(s); });
      var stripe = mesh(new T.CylinderGeometry(.272, .272, .5, 28, 1, true, -.35, .7), std(0xD9DEE2, .5), 0, .08, .37); stripe.rotation.x = PI / 2; g.add(stripe);
      [-1, 1].forEach(function (s) { var d = mesh(new T.CylinderGeometry(.025, .025, .3, 6), P.steel, s * .3, .08, .12); d.rotation.x = PI / 2; g.add(d); var w = mesh(new T.CylinderGeometry(.025, .025, .14, 6), P.steel, s * .37, .08, .02); w.rotation.z = PI / 2; g.add(w); });
      g.add(mesh(new T.BoxGeometry(.72, .07, .012), std(0x2A3238, .6), 0, -.27, .075));
      var bar = mesh(new T.BoxGeometry(.7, .05, .014), std(0x3898A8, .5), -.35, -.27, .08); bar.geometry.translate(.35, 0, 0); bar.scale.x = .001; g.add(bar);
      var lb = P.label(text, .8, .16, { ink: '#1B2024', size: .82, res: 192 }); lb.position.set(0, -.38, .04); g.add(lb);
      return { g: g, charge: function (u) { var a = Math.min(1, Math.abs(u)); bar.scale.x = Math.max(.001, a); bar.material.color.setHex(u < 0 ? 0xE05A33 : 0x3898A8); } };
    };
    /* rheostat: a wire coil on a ceramic tube with a sliding contact on a rod. set(u): contact from the left end (0) to the right end (1) */
    P.rheostat = function (E) {
      var g = partBase(E, .64), L = 1.16, pts = [], n = 24, i;
      g.add(mesh(P.rbox(1.42, .9, .07, .06, .015), std(0x2D363B, .6), 0, 0, 0));
      var tube = mesh(new T.CylinderGeometry(.14, .14, L, 20), std(0xEFE8D8, .7), 0, -.08, .28); tube.rotation.z = PI / 2; g.add(tube);
      for (i = 0; i <= n * 16; i++) { var u = i / (n * 16), th = u * n * PI * 2; pts.push(new T.Vector3(-L / 2 + u * L, -.08 + .155 * Math.cos(th), .28 + .155 * Math.sin(th))); }
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), n * 16, .018, 5, false), P.copper));
      [-1, 1].forEach(function (s) { g.add(mesh(P.rbox(.08, .62, .5, .02, .01), std(0x15181B, .5), s * (L / 2 + .06), .04, .27)); });
      var rod = mesh(new T.CylinderGeometry(.03, .03, L + .1, 10), P.steel, 0, .3, .5); rod.rotation.z = PI / 2; g.add(rod);
      var wiper = new T.Group(); wiper.position.set(0, .3, .5); g.add(wiper);
      wiper.add(mesh(P.rbox(.16, .14, .16, .03, .01), P.brass, 0, 0, 0)); wiper.add(mesh(new T.BoxGeometry(.03, .26, .03), P.copper, 0, -.17, -.07));
      var kn = mesh(new T.CylinderGeometry(.075, .075, .14, 14), std(0x15181B, .5), 0, .14, 0); wiper.add(kn);
      var lb = P.label('0–50 Ω', .7, .16, { ink: '#E8EDF0', size: .8, res: 192 }); lb.position.set(0, -.37, .04); g.add(lb);
      return { g: g, len: L, set: function (u) { wiper.position.x = -L / 2 + L * Math.max(0, Math.min(1, u)); } };
    };
    /* insulated lead with a slight bow towards the student */
    P.wire = function (E, col) {
      var g = partBase(E, E / 2 - .12), pts = [], n = 8; for (var i = 0; i <= n; i++) { var u = i / n; pts.push(new T.Vector3(-E / 2 + .12 + u * (E - .24), 0, .03 + .16 * 4 * u * (1 - u))); }
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 16, .055, 8, false), std(col == null ? 0x2E7D5B : col, .5))); return { g: g };
    };
    /* ammeter that goes in line with the circuit. Its case stays upright: turn `body` back when the part is turned */
    P.inlineMeter = function (E, title) {
      var g = partBase(E, .56), body = new T.Group(); g.add(body); body.add(mesh(P.rbox(1.12, .92, .3, .1, .03), std(0x2F6FD0, .5), 0, 0, .15));
      var L = P.lcd(.86); L.m.position.set(0, .12, .31); body.add(L.m); var t = P.label(title || 'AMMETER', .8, .16, { ink: '#FFFFFF', size: .8, res: 192 }); t.position.set(0, -.3, .305); body.add(t);
      return { g: g, body: body, show: L.show };
    };
    /* battery holder with two cells, + at +x. setLabel(text) prints the voltage */
    P.cellPack = function (E) {
      var g = partBase(E, .92), body = new T.Group(); g.add(body); g.add(mesh(P.rbox(1.9, .8, .12, .08, .02), std(0x1B1F22, .5), 0, 0, .06));
      [-1, 1].forEach(function (s) { var c = mesh(new T.CylinderGeometry(.3, .3, .78, 24), std(0x22272B, .4, .2), s * .43, 0, .36); c.rotation.z = PI / 2; g.add(c);
        var top = mesh(new T.CylinderGeometry(.302, .302, .22, 24), std(0xC8873A, .3, .7), s * .43 + .28, 0, .36); top.rotation.z = PI / 2; g.add(top); var nub = mesh(new T.CylinderGeometry(.09, .09, .06, 12), P.steel, s * .43 + .42, 0, .36); nub.rotation.z = PI / 2; g.add(nub); });
      g.add(mesh(P.rbox(.06, .7, .5, .02, .01), std(0xC62828, .5), .93, 0, .3)); g.add(mesh(P.rbox(.06, .7, .5, .02, .01), std(0x2B3238, .5), -.93, 0, .3));
      var cv = null, tx = ptex(256, 96, function (x) { cv = x; draw(x); }), text = '6 V'; function draw(x) { x.clearRect(0, 0, 256, 96); x.fillStyle = '#FFFFFF'; x.font = '800 64px ' + DISP; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 52); }
      body.add(mesh(P.rbox(.9, .4, .04, .06, .01), std(0x15181B, .5), 0, 0, .68)); var lb = mesh(new T.PlaneGeometry(.8, .3), new T.MeshBasicMaterial({ map: tx, transparent: true }), 0, 0, .705); body.add(lb);
      var plus = P.label('+', .3, .3, { ink: '#C62828', size: 1, res: 64 }); plus.position.set(.72, .56, .05); body.add(plus); var minus = P.label('−', .3, .3, { ink: '#1B2024', size: 1, res: 64 }); minus.position.set(-.72, .56, .05); body.add(minus);
      return { g: g, body: body, label: lb, signs: [plus, minus], setLabel: function (t) { text = t; draw(tx.image.getContext('2d')); tx.needsUpdate = true; } };
    };
    /* knife switch. set(closed, instantly) */
    P.knife = function (E) {
      var g = partBase(E, .62), bl = new T.Group(), open = 0, want = 0; g.add(mesh(P.rbox(1.5, .56, .1, .06, .02), std(0xF1EEE4, .45), 0, 0, .05));
      [-1, 1].forEach(function (s) { g.add(mesh(P.rbox(.16, .2, .3, .03, .015), P.brass, s * .5, 0, .2)); var scw = mesh(new T.CylinderGeometry(.05, .05, .04, 10), P.brass, s * .66, 0, .12); scw.rotation.x = PI / 2; g.add(scw); });
      bl.position.set(-.5, 0, .3); bl.add(mesh(P.rbox(1.12, .1, .06, .02, .01), std(0xC87A45, .3, .8), .5, 0, 0)); var kn = mesh(new T.SphereGeometry(.13, 16, 12), std(0x15181B, .45), 1.14, 0, .02); kn.scale.set(1.3, 1, 1); bl.add(kn); g.add(bl);
      return { g: g, set: function (closed, now) { want = closed ? 0 : 1; if (now) { open = want; bl.rotation.y = -open * .75; } }, step: function (dt) { open += (want - open) * Math.min(1, dt * 14); bl.rotation.y = -open * .75; } };
    };
    /* test probe: the tip is at the origin and the handle leans away down to the left; `tail` is where its lead joins */
    P.probe = function (col) {
      var g = new T.Group(), in1 = new T.Group(); in1.rotation.z = -.55; g.add(in1); in1.add(mesh(new T.CylinderGeometry(.012, .03, .34, 8), P.steel, 0, -.17, .1));
      in1.add(mesh(new T.CylinderGeometry(.075, .05, .2, 12), std(col, .5), 0, -.44, .1)); in1.add(mesh(new T.CylinderGeometry(.075, .075, .85, 12), std(col, .5), 0, -.96, .1)); var grd = mesh(new T.TorusGeometry(.08, .022, 6, 14), std(0x15181B, .6), 0, -.58, .1); grd.rotation.x = PI / 2; in1.add(grd);
      g.tail = new T.Vector3(-Math.sin(.55) * 1.38, -Math.cos(.55) * 1.38, .1); return g;
    };
    /* upright demonstration board with terminals. pegs: [[x, y], ...]; links: [[i, j], ...] printed as dashed gaps */
    P.board = function (w, h, cy, pegs, links) {
      var g = new T.Group(), sc = 96, cw = Math.round(w * sc), ch = Math.round(h * sc), X = function (x) { return (x + w / 2) * sc; }, Y = function (y) { return (cy + h / 2 - y) * sc; };
      var tx = K.canvasTex(cw, ch, function (x) { x.fillStyle = '#EEF2EE'; x.fillRect(0, 0, cw, ch); x.strokeStyle = 'rgba(40,70,80,.07)'; x.lineWidth = 1; for (var i = 0; i < cw; i += 24) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, ch); x.stroke(); } for (i = 0; i < ch; i += 24) { x.beginPath(); x.moveTo(0, i); x.lineTo(cw, i); x.stroke(); }
        x.strokeStyle = 'rgba(40,70,80,.34)'; x.lineWidth = 3; x.setLineDash([10, 9]); links.forEach(function (l) { x.beginPath(); x.moveTo(X(pegs[l[0]][0]), Y(pegs[l[0]][1])); x.lineTo(X(pegs[l[1]][0]), Y(pegs[l[1]][1])); x.stroke(); }); });
      var face = mesh(new T.PlaneGeometry(w, h), std(0xffffff, .8, 0, { map: tx }), 0, cy, -.239); face.receiveShadow = true; g.add(face); g.face = face.material;
      var slab = mesh(P.rbox(w + .16, h + .16, .14, .1, .03), std(0x8A6B45, .7), 0, cy, -.32); slab.castShadow = true; g.add(slab);
      [-1, 1].forEach(function (s) { var leg = mesh(P.rbox(.16, cy - h / 2 + .2, .16, .03, .02), P.foot, s * (w / 2 - .5), (cy - h / 2 + .2) / 2 - .05, -.42); leg.castShadow = true; g.add(leg); var ft = mesh(P.rbox(.5, .1, 1.3, .04, .02), P.foot, s * (w / 2 - .5), .05, -.2); ft.castShadow = true; g.add(ft); });
      pegs.forEach(function (p) { var st = mesh(new T.CylinderGeometry(.06, .075, .26, 12), P.brass, p[0], p[1], -.11); st.rotation.x = PI / 2; st.castShadow = true; g.add(st); var hd = mesh(new T.CylinderGeometry(.085, .085, .05, 14), P.brass, p[0], p[1], .09); hd.rotation.x = PI / 2; g.add(hd); });
      return g;
    };
    return P;
  }
  window.PhysParts = make;
})();
