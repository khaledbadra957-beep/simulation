/* hand-kit.js — shared engine for the camera "hands-on" labs.
   HandKit.create(o) builds a 3-D lab bench (three.js) whose objects can be picked up either with a real hand
   seen by the camera (MediaPipe hand tracking: pinch thumb + first finger to grab) or with mouse / touch.
   The look follows the 2-D labs: same wall, bench, glass, metal and label colours, light and dark theme.
   o: { stage, canvas, hud, video, intro, startCam, startMouse, showCam, status(text, cls),
        layout(k), onGrab(item), onDrop(item), onFrame(dt, now), onHUD(g), targets(item) } */
(function () {
  'use strict';
  var MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  var HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  var root = document.documentElement;
  var isDark = function () { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); };

  function create(o) {
    var T = window.THREE, k = { T: T, items: [], held: null, hover: null, W: 640, H: 360, halfW: 7, isDark: isDark };
    var stage = o.stage, video = o.video, hud = o.hud, g = hud.getContext('2d');
    var st = k.st = { mode: null, cur: { sx: 0, sy: 0, has: false }, pinch: false, lms: null, seen: 0, ptr: false, ratio: 0 };

    /* ---------- scene ---------- */
    var renderer = new T.WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: true }); renderer.setClearColor(0, 0);
    renderer.localClippingEnabled = true; k.renderer = renderer; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    var scene = k.scene = new T.Scene(), cam = k.cam = new T.PerspectiveCamera(40, 16 / 9, .1, 100); cam.position.set(0, 3.6, 11.5); cam.lookAt(0, 2.9, 0);
    var hemi = new T.HemisphereLight(0xffffff, 0x556677, .5); scene.add(hemi);
    var sun = new T.DirectionalLight(0xffffff, .7); sun.position.set(4, 9, 7); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9; sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -3; sun.shadow.camera.near = 1; sun.shadow.camera.far = 30; scene.add(sun);
    try { // a soft "room" so glass and metal have something to reflect
      var pm = new T.PMREMGenerator(renderer), es = new T.Scene(); es.add(new T.Mesh(new T.BoxGeometry(40, 40, 40), new T.MeshBasicMaterial({ color: 0x6d7d88, side: T.BackSide })));
      var pane = function (w, h, x, y, z, c) { var q = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); q.position.set(x, y, z); q.lookAt(0, 0, 0); es.add(q); };
      pane(16, 7, 0, 18, 2, 0xffffff); pane(9, 12, -18, 5, 6, 0xdde8ff); pane(8, 9, 17, 5, -9, 0xfff0d6); pane(30, 3, 0, 2, 19, 0xcfdde6);
      scene.environment = pm.fromScene(es, .03).texture; pm.dispose();
    } catch (e) { }
    var benchMat = new T.MeshStandardMaterial({ color: 0xB4BFBD, roughness: .9, metalness: 0, envMapIntensity: .15 });
    var bench = new T.Mesh(new T.BoxGeometry(40, 3, 3.8), benchMat); bench.position.set(0, -1.5, -.1); bench.receiveShadow = true; scene.add(bench);
    var edgeMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 });
    var edge = new T.Mesh(new T.BoxGeometry(40, .03, .05), edgeMat); edge.position.set(0, 0, 1.8); scene.add(edge);
    k.theme = function () { var dk = isDark(); benchMat.color.set(dk ? 0x24343B : 0xB4BFBD); edgeMat.opacity = dk ? .15 : .7; hemi.intensity = dk ? .45 : .5; k.edgeMat.color.set(dk ? 0xBFE0EA : 0x3F6170); k.outlines.forEach(function (m) { m.color.set(dk ? 0xBFE0EA : 0x3F6170); }); stage.classList.toggle('dk', dk); };

    /* ---------- materials and parts (the 2-D labs' look) ---------- */
    k.edgeMat = new T.MeshBasicMaterial({ color: 0x3F6170, transparent: true, opacity: .75 });
    k.glass = function (op) { return new T.MeshPhysicalMaterial({ color: 0xBFDDE8, transparent: true, opacity: op || .24, roughness: .04, metalness: 0, side: T.DoubleSide, depthWrite: false, envMapIntensity: 1.4 }); };
    k.liquid = function (col, op) { return new T.MeshStandardMaterial({ color: col, transparent: true, opacity: op, roughness: .12, depthWrite: false }); };
    function canvasTex(w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); var t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
    k.canvasTex = canvasTex;
    k.metal = function (col, brushed) {
      var m = new T.MeshStandardMaterial({ color: col, metalness: .55, roughness: .38, envMapIntensity: .9 });
      if (brushed) m.map = canvasTex(64, 256, function (x, w, h) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (var i = 0; i < 180; i++) { x.fillStyle = 'rgba(0,0,0,' + (Math.random() * .12) + ')'; x.fillRect(0, Math.random() * h, w * (.3 + Math.random() * .7), 1); } });
      return m;
    };
    /* beaker: o2 { r, h, liq, op, level, marks } standing on the bench at x */
    k.beaker = function (x, o2) {
      o2 = o2 || {}; var r = o2.r || 1.15, h = o2.h || 2.5, grp = new T.Group(); grp.position.set(x, 0, o2.z || 0);
      var wall = new T.Mesh(new T.CylinderGeometry(r, r, h, 48, 1, true), k.glass()); wall.position.y = h / 2; grp.add(wall);
      var rim = new T.Mesh(new T.TorusGeometry(r, .03, 8, 56), k.edgeMat); rim.rotation.x = Math.PI / 2; rim.position.y = h; grp.add(rim);
      var foot = new T.Mesh(new T.TorusGeometry(r, .025, 8, 56), k.edgeMat); foot.rotation.x = Math.PI / 2; foot.position.y = .03; grp.add(foot);
      [-1, 1].forEach(function (s) { var e = new T.Mesh(new T.BoxGeometry(.035, h, .035), k.edgeMat); e.position.set(s * r, h / 2, 0); grp.add(e); });   // the outline you see from the front
      var base = new T.Mesh(new T.CylinderGeometry(r, r, .07, 48), new T.MeshStandardMaterial({ color: 0xEAF6FB, transparent: true, opacity: .35, roughness: .1, depthWrite: false })); base.position.y = .035; grp.add(base);
      var liq = null;
      if (o2.liq != null) { var lv = o2.level || h * .6; liq = new T.Mesh(new T.CylinderGeometry(r - .06, r - .06, 1, 48), k.liquid(o2.liq, o2.op == null ? .5 : o2.op)); liq.scale.y = lv; liq.position.y = .08 + lv / 2; grp.add(liq); }
      if (o2.marks !== false) { // white graduation marks like the 2-D beakers
        var tex = canvasTex(256, 512, function (c, w, hh) { c.clearRect(0, 0, w, hh); c.strokeStyle = c.fillStyle = 'rgba(255,255,255,.97)'; c.shadowColor = 'rgba(30,60,72,.75)'; c.shadowBlur = 5; c.lineWidth = 5; c.font = '600 34px "IBM Plex Mono",monospace'; c.textBaseline = 'middle';
          for (var i = 1; i <= 5; i++) { var y = hh - i * hh / 6, big = i % 2 === 0; c.beginPath(); c.moveTo(20, y); c.lineTo(big ? 96 : 66, y); c.stroke(); if (big) c.fillText((o2.unit || 50) * i + ' mL', 106, y); } });
        var mk = new T.Mesh(new T.CylinderGeometry(r + .012, r + .012, h * .92, 24, 1, true, .25, 1.0), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); mk.position.y = h * .46 + .05; grp.add(mk);
      }
      scene.add(grp); return { g: grp, liq: liq, r: r, h: h };
    };
    /* glass vessel turned from a profile [[radius, height], ...]; returns { g, setLevel(y), radiusAt(y) } with liquid clipped at a level */
    k.vessel = function (x, prof, o2) {
      o2 = o2 || {}; var grp = new T.Group(); grp.position.set(x, o2.y || 0, o2.z || 0);
      var pts = prof.map(function (p) { return new T.Vector2(p[0], p[1]); });
      var wall = new T.Mesh(new T.LatheGeometry(pts, 48), k.glass(.22)); grp.add(wall);
      var out = new T.Line(new T.BufferGeometry().setFromPoints(prof.map(function (p) { return new T.Vector3(p[0], p[1], 0); }).concat(prof.slice().reverse().map(function (p) { return new T.Vector3(-p[0], p[1], 0); }))), new T.LineBasicMaterial({ color: 0x3F6170, transparent: true, opacity: .8 })); grp.add(out); k.outlines.push(out.material);
      var plane = new T.Plane(new T.Vector3(0, -1, 0), 0), lmat = new T.MeshStandardMaterial({ color: o2.liq || 0xBFD9E8, transparent: true, opacity: o2.op == null ? .5 : o2.op, roughness: .1, depthWrite: false, side: T.DoubleSide, clippingPlanes: [plane] });
      var liq = new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(Math.max(0, p.x - .04), p.y); }), 48), lmat); grp.add(liq);
      var top = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshStandardMaterial({ color: o2.liq || 0xBFD9E8, transparent: true, opacity: .75, roughness: .05, depthWrite: false, side: T.DoubleSide })); top.rotation.x = -Math.PI / 2; grp.add(top);
      var radiusAt = function (y) { for (var i = 1; i < prof.length; i++) { if (y <= prof[i][1] && prof[i][1] > prof[i - 1][1]) { var u = (y - prof[i - 1][1]) / (prof[i][1] - prof[i - 1][1]); return prof[i - 1][0] + (prof[i][0] - prof[i - 1][0]) * Math.max(0, u); } } return prof[prof.length - 1][0]; };
      var v = { g: grp, liq: liq, top: top, mat: lmat, radiusAt: radiusAt, level: 0,
        setLevel: function (y) { v.level = y; plane.constant = grp.position.y + y; var rr = Math.max(.01, radiusAt(y) - .045); top.scale.set(rr, rr, 1); top.position.y = y; top.visible = liq.visible = y > .03; },
        setColor: function (hex, op) { lmat.color.set(hex); top.material.color.set(hex); if (op != null) { lmat.opacity = op; top.material.opacity = Math.min(.95, op + .2); } } };
      v.setLevel(o2.level || 0); scene.add(grp); return v;
    };
    k.outlines = [];
    /* a small flat picture that always faces the camera: ions, electrons, labels */
    k.dot = function (col, label, size, ink) {
      var tex = canvasTex(96, 96, function (c) { var gr = c.createRadialGradient(36, 34, 4, 48, 48, 44); gr.addColorStop(0, '#fff'); gr.addColorStop(.35, col); gr.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = col; c.beginPath(); c.arc(48, 48, 44, 0, 7); c.fill(); c.fillStyle = gr; c.globalAlpha = .75; c.fill(); c.globalAlpha = 1;
        if (label) { c.fillStyle = ink || '#10202A'; c.font = '700 44px "IBM Plex Mono",monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, 48, 50); } });
      var s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.scale.set(size || .3, size || .3, 1); return s;
    };
    k.card = function (text, sub, col) {
      var tex = canvasTex(512, 168, function (x) { var r = 26; x.fillStyle = '#FFFBEE'; x.beginPath(); x.moveTo(r, 4); x.arcTo(508, 4, 508, 164, r); x.arcTo(508, 164, 4, 164, r); x.arcTo(4, 164, 4, 4, r); x.arcTo(4, 4, 508, 4, r); x.fill(); x.strokeStyle = '#CFC6A8'; x.lineWidth = 6; x.stroke();
        x.fillStyle = col || '#1E1A10'; x.textAlign = 'center'; x.font = '800 56px "Bricolage Grotesque","Trebuchet MS",sans-serif'; x.fillText(text, 256, 78); x.font = '600 34px "Atkinson Hyperlegible",sans-serif'; x.fillStyle = '#5A5036'; x.fillText(sub, 256, 130); });
      return new T.Mesh(new T.PlaneGeometry(1.9, .62), new T.MeshBasicMaterial({ map: tex, transparent: true }));
    };

    /* ---------- things that can be picked up ---------- */
    k.addItem = function (id, obj, ud) {
      obj.userData = Object.assign({ id: id, home: new T.Vector3(), goal: new T.Vector3(), placed: false, locked: false, r: 1.0, grabY: 0 }, ud || {});
      obj.traverse(function (m) { if (m.isMesh) m.castShadow = true; }); scene.add(obj); k.items.push(obj); return obj;
    };
    k.item = function (id) { for (var i = 0; i < k.items.length; i++) if (k.items[i].userData.id === id) return k.items[i]; };
    k.grabPoint = function (it) { return new T.Vector3(it.position.x, it.position.y + it.userData.grabY, 0); };
    k.heldId = function () { return k.held ? k.held.userData.id : null; };
    var world = new T.Vector3(), ray = new T.Vector3();
    k.toWorld = function (sx, sy) { ray.set(sx / k.W * 2 - 1, 1 - sy / k.H * 2, .5).unproject(cam).sub(cam.position).normalize(); return world.copy(cam.position).addScaledVector(ray, -cam.position.z / ray.z); };
    k.toScreen = function (v) { var p = v.clone().project(cam); return [(p.x + 1) / 2 * k.W, (1 - p.y) / 2 * k.H]; };
    function nearest(p) { var best = null, bd = 1e9; k.items.forEach(function (it) { var u = it.userData; if (u.locked || u.hidden) return; var d = Math.hypot(it.position.x - p.x, it.position.y + u.grabY - p.y); if (d < u.r && d < bd) { bd = d; best = it; } }); return best; }
    var grabOff = new T.Vector3();
    function grab() { var p = k.toWorld(st.cur.sx, st.cur.sy), it = nearest(p); if (!it) { if (o.onPinchEmpty) o.onPinchEmpty(p); return; } k.held = it; grabOff.set(it.position.x - p.x, it.position.y - p.y, 0); stage.style.cursor = 'grabbing'; if (o.onGrab) o.onGrab(it); }
    function drop() { var it = k.held; k.held = null; stage.style.cursor = 'grab'; if (o.onRelease) o.onRelease(); if (it && o.onDrop) o.onDrop(it); }
    k.near = function (it, v, r) { return Math.hypot(it.position.x - v.x, it.position.y - v.y) < (r || 1.5); };
    k.home = function (it) { it.userData.goal.copy(it.userData.home); };

    /* ---------- input: a hand in front of the camera, or a pointer ---------- */
    function setCursor(x, y) { st.cur.sx = Math.max(0, Math.min(k.W, x)); st.cur.sy = Math.max(0, Math.min(k.H, y)); st.cur.has = true; }
    function setPinch(on) { if (on === st.pinch) return; st.pinch = on; if (on) grab(); else drop(); }
    var REACH = 1.3;                                   // the middle of the camera picture covers the whole bench
    k.feed = function (lms, now) {
      if (st.ptr) { st.lms = lms || null; return; }    // a mouse or finger on the screen wins over the camera
      if (!lms) { st.lms = null; if (st.pinch && now - st.seen > 450) setPinch(false); return; }
      st.lms = lms; st.seen = now;
      var px = function (i) { return (1 - lms[i].x) * k.W; }, py = function (i) { return lms[i].y * k.H; };
      var tx = k.W / 2 + ((px(4) + px(8)) / 2 - k.W / 2) * REACH, ty = k.H / 2 + ((py(4) + py(8)) / 2 - k.H / 2) * REACH, a = st.cur.has ? .5 : 1;
      setCursor(st.cur.sx + (tx - st.cur.sx) * a, st.cur.sy + (ty - st.cur.sy) * a);
      var size = Math.hypot(px(0) - px(9), py(0) - py(9)) || 1; st.ratio = Math.hypot(px(4) - px(8), py(4) - py(8)) / size;
      setPinch(st.pinch ? st.ratio < .55 : st.ratio < .33);
    };
    var pt = function (e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    stage.addEventListener('pointerdown', function (e) { if (!st.mode || (o.intro && e.target.closest('#' + o.intro.id))) return; var p = pt(e); setCursor(p[0], p[1]); st.ptr = true; try { stage.setPointerCapture(e.pointerId); } catch (_) { } setPinch(true); });
    stage.addEventListener('pointermove', function (e) { if (!st.mode) return; if (st.ptr || !st.lms) { var p = pt(e); setCursor(p[0], p[1]); } });
    var up = function () { if (st.ptr) { st.ptr = false; setPinch(false); } }; stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);

    /* ---------- labels on the heads-up layer, styled like the 2-D labs ---------- */
    k.tag = function (txt, v, col, dy, bold) {
      var p = k.toScreen(v), x = p[0], y = p[1] + (dy || 0), dk = isDark(); g.font = (bold ? '700 ' : '600 ') + Math.max(11, Math.min(15, k.W * .014)) + 'px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      var w = g.measureText(txt).width + 14; g.fillStyle = dk ? 'rgba(15,27,32,.74)' : 'rgba(255,255,255,.82)'; g.beginPath(); var r = 10, X = x - w / 2, Y = y - 10;
      g.moveTo(X + r, Y); g.arcTo(X + w, Y, X + w, Y + 20, r); g.arcTo(X + w, Y + 20, X, Y + 20, r); g.arcTo(X, Y + 20, X, Y, r); g.arcTo(X, Y, X + w, Y, r); g.fill();
      g.fillStyle = col || (dk ? '#94A7AE' : '#52646C'); g.fillText(txt, x, y + .5);
    };
    k.ink = function () { return isDark() ? '#E7EFF1' : '#13232B'; };

    /* ---------- frame loop ---------- */
    function resize() {
      var r = stage.getBoundingClientRect(); k.W = Math.max(2, Math.round(r.width)); k.H = Math.max(2, Math.round(r.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(k.W, k.H, false); cam.aspect = k.W / k.H; cam.updateProjectionMatrix(); hud.width = k.W; hud.height = k.H;
      k.halfW = Math.tan(20 * Math.PI / 180) * 11.5 * cam.aspect; if (o.layout) o.layout(k);
      k.items.forEach(function (it) { if (!it.userData.placed && k.held !== it) it.userData.goal.copy(it.userData.home); });
    }
    k.resize = resize;
    var tPrev = 0;
    function frame(now) {
      requestAnimationFrame(frame); var dt = Math.min(.05, (now - tPrev) / 1000 || .016); tPrev = now;
      if (st.cur.has) { var p = k.toWorld(st.cur.sx, st.cur.sy); k.cursorWorld = p;
        if (k.held && !k.held.userData.fixed) k.held.position.set(Math.max(-k.halfW + .4, Math.min(k.halfW - .4, p.x + grabOff.x)), Math.max(.3, Math.min(6.7, p.y + grabOff.y)), k.held.userData.liftZ == null ? .9 : k.held.userData.liftZ);
        else k.hover = nearest(p); }
      k.items.forEach(function (it) { var u = it.userData; if (it !== k.held || u.fixed) it.position.lerp(u.goal, .2); var s = (u.scale || 1) * (it === k.held ? 1.07 : (it === k.hover && !st.pinch ? 1.05 : 1)); it.scale.setScalar(it.scale.x + (s - it.scale.x) * .25); });
      if (o.onFrame) o.onFrame(dt, now);
      renderer.render(scene, cam);
      g.clearRect(0, 0, k.W, k.H);
      if (o.onHUD) o.onHUD(g);
      if (k.held && o.targets) { g.setLineDash([6, 6]); g.lineWidth = 2; g.strokeStyle = isDark() ? 'rgba(86,195,223,.85)' : 'rgba(10,106,136,.8)'; (o.targets(k.held) || []).forEach(function (v) { var q = k.toScreen(v); g.beginPath(); g.arc(q[0], q[1], Math.max(22, k.W * .035), 0, 6.3); g.stroke(); }); g.setLineDash([]); }
      if (st.lms) { g.strokeStyle = isDark() ? 'rgba(86,195,223,.8)' : 'rgba(10,106,136,.75)'; g.lineWidth = 2.5; g.lineCap = 'round';
        [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]].forEach(function (c) { g.beginPath(); c.forEach(function (i, n) { var x = (1 - st.lms[i].x) * k.W, y = st.lms[i].y * k.H; n ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); });
        g.fillStyle = '#E0A63A'; [4, 8].forEach(function (i) { g.beginPath(); g.arc((1 - st.lms[i].x) * k.W, st.lms[i].y * k.H, 5, 0, 6.3); g.fill(); }); }
      if (st.cur.has && st.mode) { var rr = st.pinch ? 9 : 20; g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(st.cur.sx, st.cur.sy, rr, 0, 6.3); g.stroke();
        g.lineWidth = 3; g.strokeStyle = st.pinch ? '#E0A63A' : k.hover ? '#2FBF7A' : '#FFFFFF'; g.beginPath(); g.arc(st.cur.sx, st.cur.sy, rr, 0, 6.3); g.stroke();
        if (!st.pinch && k.hover && !k.held) { g.font = '700 12px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.fillStyle = isDark() ? '#4ACB8A' : '#1E8A55'; g.fillText(st.lms ? 'pinch to grab' : 'press to grab', st.cur.sx, st.cur.sy + 36); } }
    }

    /* ---------- start: camera or mouse ---------- */
    var say = o.status || function () { }, tracker = null;
    k.startMouse = function () { st.mode = 'mouse'; if (o.intro) o.intro.hidden = true; say('Mouse or touch: press on something to pick it up, drag it, and let go.', 'ok'); };
    k.startCamera = async function () {
      if (o.startCam) o.startCam.disabled = true; var where = 'camera';
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('this browser will not give this page a camera');
        say('Asking for the camera…'); var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        video.srcObject = stream; video.hidden = o.showCam ? !o.showCam.checked : false; await video.play();
        if (video.videoWidth) stage.style.setProperty('--ar', (video.videoWidth / video.videoHeight).toFixed(4));
        where = 'hand tracker'; say('Loading the hand tracker (the first time takes a few seconds)…');
        var vision = await import(MP + '/vision_bundle.mjs'), files = await vision.FilesetResolver.forVisionTasks(MP + '/wasm');
        var mk = function (d) { return vision.HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: HAND_MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 1 }); };
        try { tracker = await mk('GPU'); } catch (e) { tracker = await mk('CPU'); }
        st.mode = 'cam'; if (o.intro) o.intro.hidden = true; resize(); say('Camera on. Hold up one hand and pinch to grab.', 'ok');
        var last = -1, lost = 0;
        (function tick() { requestAnimationFrame(tick); if (video.readyState < 2 || video.currentTime === last) return; last = video.currentTime; var now = performance.now();
          try { var r = tracker.detectForVideo(video, now), l = r.landmarks && r.landmarks[0]; k.feed(l || null, now);
            if (!l) { if (!lost) lost = now; if (now - lost > 1500 && !st.ptr) say('I cannot see a hand. Hold it up in front of the camera, with light on it.', 'bad'); } else { if (lost) say('Hand found. Pinch to grab, open to drop.', 'ok'); lost = 0; } }
          catch (e) { say('The tracker hit an error: ' + e.message, 'bad'); } })();
      } catch (err) {
        if (o.startCam) o.startCam.disabled = false; var denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
        say(denied ? 'Camera blocked. Allow the camera for this page, or use mouse or touch.' : 'Could not start the ' + where + ': ' + (err && err.message || err) + '. You can use mouse or touch.', 'bad');
      }
    };
    if (o.startCam) o.startCam.onclick = k.startCamera; if (o.startMouse) o.startMouse.onclick = k.startMouse;
    if (o.showCam) o.showCam.onchange = function (e) { video.hidden = !e.target.checked || !video.srcObject; };
    k.start = function () { k.theme(); new ResizeObserver(resize).observe(stage); resize(); k.items.forEach(function (it) { it.position.copy(it.userData.home); it.userData.goal.copy(it.userData.home); }); requestAnimationFrame(frame); if (location.hash === '#mouse') k.startMouse(); };
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { k.theme(); });
    return k;
  }
  /* page shell shared by the hands-on labs: theme button that uses the same saved choice as the 2-D galvanic lab */
  function themeButton(btn, kit) {
    try { var t = localStorage.getItem('gal-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) { }
    var label = function () { btn.textContent = isDark() ? 'Light mode' : 'Dark mode'; if (kit) kit.theme(); };
    btn.onclick = function () { var n = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', n); try { localStorage.setItem('gal-theme', n); } catch (e) { } label(); };
    label();
  }
  window.HandKit = { create: create, themeButton: themeButton, isDark: isDark };
})();
