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
    var T = window.THREE, k = { T: T, items: [], W: 640, H: 360, halfW: 7, isDark: isDark };
    var stage = o.stage, video = o.video, hud = o.hud, g = hud.getContext('2d');
    var NH = o.hands || 1, hands = k.hands = [];
    for (var hi = 0; hi < NH; hi++) hands.push({ i: hi, cur: { sx: 0, sy: 0, has: false }, pinch: false, lms: null, seen: 0, ptr: false, pid: null, ratio: 0, held: null, hover: null, grabOff: new T.Vector3(), world: new T.Vector3(), pose: 0 });
    var st = k.st = hands[0]; st.mode = null;        // the first hand doubles as the old single-hand state
    Object.defineProperty(k, 'held', { get: function () { for (var q = 0; q < NH; q++) if (hands[q].held) return hands[q].held; return null; } });
    Object.defineProperty(k, 'hover', { get: function () { for (var q = 0; q < NH; q++) if (hands[q].hover) return hands[q].hover; return null; } });
    k.holder = function (it) { for (var q = 0; q < NH; q++) if (hands[q].held === it) return hands[q]; return null; };

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
    function nearestFree(p, h) { var best = null, bd = 1e9; k.items.forEach(function (it) { var u = it.userData, hd = k.holder(it); if (u.locked || u.hidden || (hd && hd !== h)) return; var d = Math.hypot(it.position.x - p.x, it.position.y + u.grabY - p.y); if (d < u.r && d < bd) { bd = d; best = it; } }); return best; }
    function grab(h) { var p = k.toWorld(h.cur.sx, h.cur.sy), it = nearestFree(p, h); if (!it) { if (o.onPinchEmpty) o.onPinchEmpty(p, h); return; }
      var gu = it.userData;
      if (gu.managed && gu.gear === 'gloves') { k.putOn('gloves'); return; }                 // pinch the box: you take a pair and put them on
      if (gearOpt && !gu.gear && !k.safe()) { var miss = gearOpt.list.filter(function (n) { return !k.wear[n]; }).map(function (n) { return GEAR[n].toLowerCase(); });
        gearOpt.say('Safety first. Put on your ' + (miss.length > 1 ? miss.slice(0, -1).join(', ') + ' and ' + miss[miss.length - 1] : miss[0]) + ' before you touch anything on the bench. ' + (gearOpt.why || '')); if (mir) { mir.host.classList.remove('warn'); void mir.host.offsetWidth; mir.host.classList.add('warn'); } return; }
      h.held = it; h.grabOff.set(it.position.x - p.x, it.position.y - p.y, 0); stage.style.cursor = 'grabbing'; if (o.onGrab) o.onGrab(it, h); }
    function drop(h) { var it = h.held; h.held = null; stage.style.cursor = 'grab'; if (o.onRelease) o.onRelease(h);
      if (it && it.userData.managed) { var u = it.userData; if (u.onBody || Math.hypot(it.position.x - u.home.x, it.position.y - u.home.y) > 1.2) k.putOn(u.gear); else k.home(it); u.onBody = false; return; }
      if (it && o.onDrop) o.onDrop(it, h); if (it) it.userData.onBody = false; }
    k.near = function (it, v, r) { return Math.hypot(it.position.x - v.x, it.position.y - v.y) < (r || 1.5); };
    k.home = function (it) { it.userData.goal.copy(it.userData.home); };

    /* ---------- input: hands in front of the camera, or pointers (one finger or mouse per hand) ---------- */
    function setCursor(h, x, y) { h.cur.sx = Math.max(0, Math.min(k.W, x)); h.cur.sy = Math.max(0, Math.min(k.H, y)); h.cur.has = true; }
    function setPinch(h, on) { if (on === h.pinch) return; h.pinch = on; if (on) grab(h); else drop(h); }
    var REACH = 1.3;                                   // the middle of the camera picture covers the whole bench
    k.mapX = function (x) { return k.W / 2 + ((1 - x) * k.W - k.W / 2) * REACH; }; k.mapY = function (y) { return k.H / 2 + (y * k.H - k.H / 2) * REACH; };
    /* One Euro filter (Casiez, Roussel and Vogel 2012): smooths hard while the hand is still, follows quickly when it moves.
       The tracker's points jitter by a few pixels every frame; without this the 3-D hand shakes. Depth is the noisiest, so it is smoothed most. */
    var EURO = { xy: [1.2, 9], z: [.35, 1.2] };
    function euro(f, x, dt, mc, beta) {
      if (f.x == null) { f.x = x; f.dx = 0; return x; }
      var ad = 1 / (1 + 1 / (2 * Math.PI * 1.0 * dt)), d = (x - f.x) / dt; f.dx += (d - f.dx) * ad;
      var fc = mc + beta * Math.abs(f.dx), a = 1 / (1 + 1 / (2 * Math.PI * fc * dt)); f.x += (x - f.x) * a; return f.x;
    }
    function smoothHand(h, lms, now) {
      var dt = Math.max(.008, Math.min(.1, (now - (h.ft || now - 33)) / 1000)), fresh = !h.sm || now - h.seen > 300; h.ft = now;
      if (fresh) { h.ef = []; h.sm = []; for (var i = 0; i < 21; i++) { h.ef.push([{}, {}, {}]); h.sm.push({ x: 0, y: 0, z: 0 }); } }
      for (var j = 0; j < 21; j++) { var q = lms[j], e = h.ef[j], o = h.sm[j];
        o.x = euro(e[0], q.x, dt, EURO.xy[0], EURO.xy[1]); o.y = euro(e[1], q.y, dt, EURO.xy[0], EURO.xy[1]); o.z = euro(e[2], q.z || 0, dt, EURO.z[0], EURO.z[1]); }
      return h.sm;
    }
    k.euro = EURO;
    function feedHand(h, raw, now) {
      if (h.ptr) { h.lms = raw ? smoothHand(h, raw, now) : null; if (raw) h.seen = now; return; }      // a mouse or finger on the screen wins over the camera
      var firm = !!(h.held && h.held.userData.firm);   // firm items (a flask being turned over) are not dropped by a short tracking hiccup
      if (!raw) { h.lms = null; if (h.pinch && now - h.seen > (firm ? 1500 : 450)) setPinch(h, false); if (now - h.seen > 1200 && st.mode === 'cam') h.cur.has = false; return; }
      var lms = smoothHand(h, raw, now); h.lms = lms; h.seen = now;
      var px = function (i) { return (1 - lms[i].x) * k.W; }, py = function (i) { return lms[i].y * k.H; };
      var tx = (k.mapX(lms[4].x) + k.mapX(lms[8].x)) / 2, ty = (k.mapY(lms[4].y) + k.mapY(lms[8].y)) / 2;
      setCursor(h, tx, ty);
      var size = Math.hypot(px(0) - px(9), py(0) - py(9)) || 1; h.ratio = Math.hypot(px(4) - px(8), py(4) - py(8)) / size;
      h.ang = Math.atan2(px(9) - px(0), py(0) - py(9));
      if (h.needOpen) { if (h.ratio > .5) h.needOpen = false; else return; }
      var want = h.pinch ? h.ratio < (firm ? .6 : .55) : h.ratio < .33;
      if (h.pinch && !want && firm) { if (!h.openT) h.openT = now; if (now - h.openT < 450) want = true; } else h.openT = 0;
      setPinch(h, want);
    }
    k.feed = function (lms, now) { feedHand(hands[0], lms, now); };
    /* list: [{ lms, label }] from the tracker. With two hands, each keeps its own slot: the one on the left of the screen is hand 0. */
    k.feedAll = function (list, now) {
      if (NH === 1) { feedHand(hands[0], list[0] ? list[0].lms : null, now); return; }
      var got = [null, null];
      if (list.length >= 2) { var a = list[0], b = list[1], ax = 1 - a.lms[0].x, bx = 1 - b.lms[0].x; if (ax <= bx) { got[0] = a.lms; got[1] = b.lms; } else { got[0] = b.lms; got[1] = a.lms; } }
      else if (list.length === 1) { var sx = k.mapX(list[0].lms[9].x), d0 = hands[0].cur.has && now - hands[0].seen < 900 ? Math.abs(hands[0].cur.sx - sx) : 1e9, d1 = hands[1].cur.has && now - hands[1].seen < 900 ? Math.abs(hands[1].cur.sx - sx) : 1e9;
        var slot = d0 === 1e9 && d1 === 1e9 ? (sx < k.W / 2 ? 0 : 1) : (d0 <= d1 ? 0 : 1); got[slot] = list[0].lms; }
      feedHand(hands[0], got[0], now); feedHand(hands[1], got[1], now);
    };
    var pt = function (e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    stage.addEventListener('pointerdown', function (e) {
      if (!st.mode || (o.intro && e.target.closest('#' + o.intro.id))) return; var p = pt(e), h = null;
      if (NH === 1) h = hands[0]; else { var free = hands.filter(function (q) { return !q.ptr; }); if (!free.length) return; h = free.length === 1 ? free[0] : (e.pointerType === 'mouse' || p[0] < k.W / 2 ? hands[0] : hands[1]); }
      if (h.ptr) return; setCursor(h, p[0], p[1]); h.ptr = true; h.pid = e.pointerId; try { stage.setPointerCapture(e.pointerId); } catch (_) { } setPinch(h, true);
    });
    stage.addEventListener('pointermove', function (e) { if (!st.mode) return; var p = pt(e), h = null; hands.forEach(function (q) { if (q.ptr && q.pid === e.pointerId) h = q; });
      if (h) setCursor(h, p[0], p[1]); else if (e.pointerType === 'mouse') { var q0 = NH > 1 && hands[0].ptr ? hands[1] : hands[0]; if (!q0.lms && !q0.ptr && !(k.sticky && q0.held)) setCursor(q0, p[0], p[1]); } });
    var up = function (e) { hands.forEach(function (q) { if (q.ptr && q.pid === e.pointerId) { q.ptr = false; if (!(k.sticky && q.held && q.held.userData.sticky)) setPinch(q, false); } }); };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    k.release = function (h) { setPinch(h, false); };

    /* ---------- 3-D hands: a human hand (hand-model.js, modelled in Blender) that bends with the 21 tracked points.
       It is drawn as your own hand seen from behind, reaching into the lab. Mouse and touch get a posed hand.
       If hand-model.js is missing, a simple jointed hand is drawn instead. ---------- */
    var BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
    var OPEN = [[0, 0, 0], [-.34, .2, .1], [-.6, .46, .16], [-.76, .7, .18], [-.86, .93, .18], [-.28, .95, 0], [-.31, 1.35, .02], [-.32, 1.6, .05], [-.33, 1.82, .08], [-.02, 1.0, 0], [-.02, 1.45, .02], [-.02, 1.74, .05], [-.02, 1.98, .08], [.22, .95, 0], [.25, 1.36, .02], [.27, 1.61, .05], [.28, 1.81, .08], [.42, .82, 0], [.5, 1.12, .02], [.55, 1.33, .05], [.58, 1.5, .08]];
    var PINCH = OPEN.map(function (p) { return p.slice(); }); [[1, -.3, .22, .2], [2, -.5, .52, .34], [3, -.56, .82, .4], [4, -.5, 1.05, .4], [6, -.37, 1.27, .22], [7, -.47, 1.3, .38], [8, -.5, 1.1, .42], [10, -.03, 1.38, .2], [11, -.05, 1.5, .45], [12, -.07, 1.38, .62], [14, .24, 1.3, .2], [15, .25, 1.4, .43], [16, .25, 1.28, .58], [18, .48, 1.08, .17], [19, .5, 1.16, .36], [20, .5, 1.06, .48]].forEach(function (q) { PINCH[q[0]] = [q[1], q[2], q[3]]; });
    var glove = new T.MeshStandardMaterial({ color: 0x3E8FCB, roughness: .5, metalness: .05, envMapIntensity: .6 }), cuffMat = new T.MeshStandardMaterial({ color: 0xF4F6F7, roughness: .85 });
    var sph = new T.SphereGeometry(1, 14, 10), cyl = new T.CylinderGeometry(1, 1, 1, 12), ZH = 1.7, UP = new T.Vector3(0, 1, 0), tv = new T.Vector3(), tq = new T.Quaternion();
    k.gloveMat = glove; k.sleeves = false;

    /* one frame per bone: side, along the bone, palm side, and where the bone starts. The palm side is carried along each finger so a curled finger does not twist. */
    function frames(P, chi, s, F, unit, L0) {
      var ax = P[17].x - P[0].x, ay = P[17].y - P[0].y, az = P[17].z - P[0].z, bx = P[5].x - P[0].x, by = P[5].y - P[0].y, bz = P[5].z - P[0].z;
      var nx = (ay * bz - az * by) * chi, ny = (az * bx - ax * bz) * chi, nz = (ax * by - ay * bx) * chi, nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      for (var f = 0; f < 5; f++) {
        var zx = nx, zy = ny, zz = nz, px = 0, py = 1, pz = 0;
        for (var j = 0; j < 4; j++) {
          var bi = f * 4 + j, A = P[j ? f * 4 + j : 0], B = P[f * 4 + j + 1], dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, len = Math.hypot(dx, dy, dz) || 1e-5, yx = dx / len, yy = dy / len, yz = dz / len;
          if (j) { var c = px * yx + py * yy + pz * yz; if (c > -.995) { var wx = py * yz - pz * yy, wy = pz * yx - px * yz, wz = px * yy - py * yx, wd = (wx * zx + wy * zy + wz * zz) / (1 + c), rx = zx * c + (wy * zz - wz * zy) + wx * wd, ry = zy * c + (wz * zx - wx * zz) + wy * wd, rz = zz * c + (wx * zy - wy * zx) + wz * wd; zx = rx; zy = ry; zz = rz; } }
          var d = zx * yx + zy * yy + zz * yz; zx -= d * yx; zy -= d * yy; zz -= d * yz; var zl = Math.hypot(zx, zy, zz);
          if (zl < 1e-4) { zx = -yz; zy = 0; zz = yx; zl = Math.hypot(zx, zy, zz) || 1; if (zl === 1 && !zx && !zz) zx = 1; } zx /= zl; zy /= zl; zz /= zl;
          var xx = (yy * zz - yz * zy) * chi, xy = (yz * zx - yx * zz) * chi, xz = (yx * zy - yy * zx) * chi, o12 = bi * 12, ys = unit ? 1 : len / L0[bi];
          F[o12] = xx * s; F[o12 + 1] = xy * s; F[o12 + 2] = xz * s; F[o12 + 3] = yx * ys; F[o12 + 4] = yy * ys; F[o12 + 5] = yz * ys; F[o12 + 6] = zx * s; F[o12 + 7] = zy * s; F[o12 + 8] = zz * s; F[o12 + 9] = A.x; F[o12 + 10] = A.y; F[o12 + 11] = A.z;
          px = yx; py = yy; pz = yz;
        }
      }
    }
    var HM = (function () {
      var m = window.HAND_MODEL; if (!m || !window.atob) return null;
      try {
        var dec = function (str) { var b = atob(str), u = new Uint8Array(b.length); for (var n = 0; n < b.length; n++) u[n] = b.charCodeAt(n); return u; };
        var q = new Uint16Array(dec(m.pos).buffer), nq = new Int8Array(dec(m.nrm).buffer), pos = new Float32Array(m.nv * 3), nrm = new Float32Array(m.nv * 3), n, idx = new Uint16Array(dec(m.idx).buffer), rev = new Uint16Array(idx.length);
        for (n = 0; n < m.nv * 3; n++) { pos[n] = m.min[n % 3] + q[n] / 65535 * m.size[n % 3]; nrm[n] = nq[n] / 127; }
        for (n = 0; n < idx.length; n += 3) { rev[n] = idx[n]; rev[n + 1] = idx[n + 2]; rev[n + 2] = idx[n + 1]; }
        var jw8 = dec(m.jw), jw = new Float32Array(m.nv * 4); for (n = 0; n < m.nv; n++) { var sum = jw8[n * 4] + jw8[n * 4 + 1] + jw8[n * 4 + 2] + jw8[n * 4 + 3] || 1; for (var c = 0; c < 4; c++) jw[n * 4 + c] = jw8[n * 4 + c] / sum; }
        var rest = m.rest.map(function (p) { return { x: p[0], y: p[1], z: p[2] }; }), L0 = m.bones.map(function (b) { return Math.hypot(rest[b[1]].x - rest[b[0]].x, rest[b[1]].y - rest[b[0]].y, rest[b[1]].z - rest[b[0]].z); }), RF = new Float32Array(240);
        frames(rest, 1, 1, RF, true);
        return { nv: m.nv, pos: pos, nrm: nrm, idx: new T.BufferAttribute(idx, 1), rev: new T.BufferAttribute(rev, 1), ji: dec(m.ji), jw: jw, tint: dec(m.tint), L0: L0, RF: RF, col: new T.BufferAttribute(new Float32Array(m.nv * 3), 3) };
      } catch (e) { return null; }
    })();
    var REST = HM ? null : OPEN.map(function (p) { return { x: p[0], y: p[1], z: p[2] }; }), RL = HM ? HM.L0 : [];   // rest length of each finger bone, in the order the skin uses: bone b joins point (b % 4 ? b : 0) to point b + 1
    if (!HM) for (var rb = 0; rb < 20; rb++) { var ra = REST[rb % 4 ? rb : 0], rc = REST[rb + 1]; RL.push(Math.hypot(rc.x - ra.x, rc.y - ra.y, rc.z - ra.z)); }
    var HAND_MIN = .72, HAND_MAX = 1.08, TW = new T.Vector3();                 // drawn size of a tracked hand, wrist to middle knuckle, in bench units
    var RS = HM ? Math.hypot(window.HAND_MODEL.rest[9][0] - window.HAND_MODEL.rest[0][0], window.HAND_MODEL.rest[9][1] - window.HAND_MODEL.rest[0][1], window.HAND_MODEL.rest[9][2] - window.HAND_MODEL.rest[0][2]) : 1.0;   // wrist to middle knuckle at rest
    /* skin tones, and the blue lab glove */
    var TONES = [['t1', 0xF1CDB6, 'Skin tone 1'], ['t2', 0xDDA987, 'Skin tone 2'], ['t3', 0xC0875F, 'Skin tone 3'], ['t4', 0x94603F, 'Skin tone 4'], ['t5', 0x63402C, 'Skin tone 5'], ['glove', 0x3E8FCB, 'Blue lab glove']];
    var skinMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: .62, metalness: 0, envMapIntensity: .3 }), LV = new Float32Array(240), toneBox = null;
    k.wear = { gog: false, coat: false, gloves: false };
    k.tone = 't3'; try { var tn0 = localStorage.getItem('hand-tone'); if (tn0 && TONES.some(function (t) { return t[0] === tn0; })) k.tone = tn0; } catch (e) { }
    function paint() {
      var id = k.wear.gloves ? 'glove' : k.tone, t = TONES.filter(function (q) { return q[0] === id; })[0] || TONES[2];
      if (!HM) { glove.color.setHex(t[1]); return; }
      var isGlove = t[0] === 'glove', base = new T.Color(t[1]), nail = base.clone().lerp(new T.Color(0xFBE3DA), .55), palm = base.clone().lerp(new T.Color(0xF0BFA8), .5), a = HM.col.array, cc = new T.Color();
      for (var n = 0; n < HM.nv; n++) { cc.copy(base); if (!isGlove) { if (HM.tint[n]) cc.copy(nail); else { var u = Math.max(0, Math.min(1, (HM.nrm[n * 3 + 2] - .15) * 1.6)); cc.lerp(palm, u * .7); } } a[n * 3] = cc.r; a[n * 3 + 1] = cc.g; a[n * 3 + 2] = cc.b; }
      HM.col.needsUpdate = true; skinMat.roughness = isGlove ? .42 : .62;
    }
    k.setTone = function (id) {
      var t = TONES.filter(function (q) { return q[0] === id; })[0] || TONES[2]; k.tone = t[0]; try { localStorage.setItem('hand-tone', k.tone); } catch (e) { }
      if (toneBox) Array.prototype.forEach.call(toneBox.children, function (b) { b.setAttribute('aria-pressed', b.dataset.tone === k.tone ? 'true' : 'false'); });
      paint();
    };
    k.setTone(k.tone);
    if (HM) {
      toneBox = document.createElement('div'); toneBox.className = 'tones'; toneBox.setAttribute('role', 'group'); toneBox.setAttribute('aria-label', 'Hand colour');
      TONES.forEach(function (t) { var b = document.createElement('button'); b.type = 'button'; b.title = t[2]; b.setAttribute('aria-label', t[2]); b.dataset.tone = t[0]; b.style.background = '#' + ('00000' + t[1].toString(16)).slice(-6); b.setAttribute('aria-pressed', t[0] === k.tone ? 'true' : 'false');
        b.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); b.onclick = function () { k.setTone(t[0]); }; toneBox.appendChild(b); });
      stage.appendChild(toneBox);
    }
    function rigOf(h) {
      if (h.rig) return h.rig; var grp = new T.Group(), R = { g: grp, j: [], b: [], P: [], chi: 0, lean: 0 }, i;
      for (i = 0; i < 21; i++) R.P.push(new T.Vector3());
      if (HM) {
        var geo = new T.BufferGeometry(); R.pa = new T.BufferAttribute(new Float32Array(HM.nv * 3), 3); R.na = new T.BufferAttribute(new Float32Array(HM.nv * 3), 3); R.pa.setUsage(T.DynamicDrawUsage); R.na.setUsage(T.DynamicDrawUsage);
        geo.setAttribute('position', R.pa); geo.setAttribute('normal', R.na); geo.setAttribute('color', HM.col); geo.setIndex(HM.idx); R.M = new Float32Array(240);
        R.skin = new T.Mesh(geo, skinMat); R.skin.frustumCulled = false; R.skin.castShadow = true; grp.add(R.skin);
      } else {
        for (i = 0; i < 21; i++) { var m = new T.Mesh(sph, glove); m.castShadow = true; grp.add(m); R.j.push(m); }
        BONES.forEach(function () { var m2 = new T.Mesh(cyl, glove); m2.castShadow = true; grp.add(m2); R.b.push(m2); });
        var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(new Float32Array(18), 3)); pg.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5]); R.palm = new T.Mesh(pg, new T.MeshStandardMaterial({ color: 0x3E8FCB, roughness: .5, side: T.DoubleSide })); grp.add(R.palm);
        R.band = new T.Mesh(cyl, glove); grp.add(R.band);
      }
      R.cuff = new T.Mesh(cyl, cuffMat); R.cuff.castShadow = true; grp.add(R.cuff);
      scene.add(grp); h.rig = R; return R;
    }
    function planePoint(sx, sy, z, out) { ray.set(sx / k.W * 2 - 1, 1 - sy / k.H * 2, .5).unproject(cam).sub(cam.position).normalize(); return out.copy(cam.position).addScaledVector(ray, (z - cam.position.z) / ray.z); }
    /* which side of the palm the thumb and the curled fingers are on: tells a left hand from a right hand */
    function lean(P) {
      var ax = P[17].x - P[0].x, ay = P[17].y - P[0].y, az = P[17].z - P[0].z, bx = P[5].x - P[0].x, by = P[5].y - P[0].y, bz = P[5].z - P[0].z, nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, nl = Math.hypot(nx, ny, nz) || 1, c = 0, i;
      for (i = 1; i <= 4; i++) c += (P[i].x - P[0].x) * nx + (P[i].y - P[0].y) * ny + (P[i].z - P[0].z) * nz;
      for (i = 5; i <= 17; i += 4) c += .5 * ((P[i + 3].x - P[i].x) * nx + (P[i + 3].y - P[i].y) * ny + (P[i + 3].z - P[i].z) * nz);
      return c / nl;
    }
    function skinTo(R, s) {
      var M = R.M, RF = HM.RF, b, i, j, o;
      for (b = 0; b < 20; b++) { o = b * 12; for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) M[o + j * 3 + i] = LV[o + i] * RF[o + j] + LV[o + 3 + i] * RF[o + 3 + j] + LV[o + 6 + i] * RF[o + 6 + j];
        for (i = 0; i < 3; i++) M[o + 9 + i] = LV[o + 9 + i] - (M[o + i] * RF[o + 9] + M[o + 3 + i] * RF[o + 10] + M[o + 6 + i] * RF[o + 11]); }
      var pos = HM.pos, nrm = HM.nrm, ji = HM.ji, jw = HM.jw, out = R.pa.array, on = R.na.array;
      for (var v = 0, v3 = 0, v4 = 0; v < HM.nv; v++, v3 += 3, v4 += 4) {
        var x = pos[v3], y = pos[v3 + 1], z = pos[v3 + 2], nx = nrm[v3], ny = nrm[v3 + 1], nz = nrm[v3 + 2], X = 0, Y = 0, Z = 0, NX = 0, NY = 0, NZ = 0;
        for (var q = 0; q < 4; q++) { var w = jw[v4 + q]; if (!w) continue; o = ji[v4 + q] * 12;
          X += w * (M[o] * x + M[o + 3] * y + M[o + 6] * z + M[o + 9]); Y += w * (M[o + 1] * x + M[o + 4] * y + M[o + 7] * z + M[o + 10]); Z += w * (M[o + 2] * x + M[o + 5] * y + M[o + 8] * z + M[o + 11]);
          NX += w * (M[o] * nx + M[o + 3] * ny + M[o + 6] * nz); NY += w * (M[o + 1] * nx + M[o + 4] * ny + M[o + 7] * nz); NZ += w * (M[o + 2] * nx + M[o + 5] * ny + M[o + 8] * nz); }
        var l = Math.hypot(NX, NY, NZ) || 1; out[v3] = X; out[v3 + 1] = Y; out[v3 + 2] = Z; on[v3] = NX / l; on[v3 + 1] = NY / l; on[v3 + 2] = NZ / l;
      }
      R.pa.needsUpdate = true; R.na.needsUpdate = true;
    }
    function updateRig(h) {
      var R = rigOf(h), P = R.P, i; if (!h.cur.has || !st.mode) { R.g.visible = false; return; } R.g.visible = true;
      var size, tracked = !!(h.lms && !h.ptr);
      if (tracked) {                                      // the real hand: every tracked point, with its depth (nearer the camera = further into the lab)
        var wpp = 2 * k.halfW / k.W, T0 = R.T || (R.T = []);
        for (i = 0; i < 21; i++) { T0[i] = T0[i] || new T.Vector3(); planePoint(k.mapX(h.lms[i].x), k.mapY(h.lms[i].y), ZH, T0[i]); T0[i].z += (h.lms[i].z || 0) * k.W * wpp * 1.1; }
        /* a real hand does not change shape from frame to frame. Its size follows the palm slowly, each finger bone keeps a length
           learned over a couple of seconds (so it fits this student's hand), and the joints are rebuilt from the wrist outwards
           along the tracked directions. This stops fingers stretching and shrinking with the tracker's noise. */
        var palm = (T0[0].distanceTo(T0[5]) / RL[4] + T0[0].distanceTo(T0[9]) / RL[8] + T0[0].distanceTo(T0[13]) / RL[12] + T0[0].distanceTo(T0[17]) / RL[16]) / 4;
        if (!R.sc || h.seen - (R.seenAt || 0) > 300) { R.sc = palm; R.bl = RL.map(function (L) { return L; }); } R.seenAt = h.seen; R.sc += (palm - R.sc) * .12;
        P[0].copy(T0[0]);
        for (var f = 0; f < 5; f++) for (var jj = 0; jj < 4; jj++) {
          var b = f * 4 + jj, c = b + 1, pa = jj ? c - 1 : 0, meas = T0[c].distanceTo(T0[pa]) / R.sc;
          if (meas > RL[b] * .55 && meas < RL[b] * 1.6) R.bl[b] += (meas - R.bl[b]) * .02;
          tv.subVectors(T0[c], T0[pa]); var ln = tv.length(); if (ln < 1e-6) tv.set(0, 1, 0); else tv.multiplyScalar(1 / ln);
          P[c].copy(P[pa]).addScaledVector(tv, R.bl[b] * R.sc);
        }
        size = R.sc * RS;
        /* a hand close to the camera looks huge in the picture; on the bench it would hide the apparatus. Keep the drawn hand within
           a sensible size (the mouse hand is 0.9), shrinking or growing it around the pinch point so grabbing still lines up. */
        var want = Math.max(HAND_MIN, Math.min(HAND_MAX, size));
        if (want !== size) { var f = want / size; tv.addVectors(P[4], P[8]).multiplyScalar(.5); for (i = 0; i < 21; i++) P[i].sub(tv).multiplyScalar(f).add(tv); size = want; }
        tv.addVectors(P[4], P[8]).multiplyScalar(.5); planePoint(h.cur.sx, h.cur.sy, tv.z, TW).sub(tv); for (i = 0; i < 21; i++) P[i].add(TW);   // the drawn pinch point sits exactly on the cursor
        R.raw = R.sc * RS;
      } else {                                            // mouse or touch: a posed hand whose pinch point is the pointer
        h.pose += ((h.pinch ? 1 : 0) - h.pose) * .35; size = .9; var s = size / 1.0, flip = NH > 1 && h.i === 0 ? -1 : 1, a = h.pose;
        var mx = (OPEN[4][0] + OPEN[8][0]) / 2 * (1 - a) + PINCH[4][0] * a * .5 + PINCH[8][0] * a * .5, my = (OPEN[4][1] + OPEN[8][1]) / 2 * (1 - a) + (PINCH[4][1] + PINCH[8][1]) / 2 * a;
        planePoint(h.cur.sx, h.cur.sy, ZH, tv);
        for (i = 0; i < 21; i++) { var ox = OPEN[i][0] + (PINCH[i][0] - OPEN[i][0]) * a, oy = OPEN[i][1] + (PINCH[i][1] - OPEN[i][1]) * a, oz = OPEN[i][2] + (PINCH[i][2] - OPEN[i][2]) * a; P[i].set(tv.x + (ox - mx) * s * flip, tv.y + (oy - my) * s, tv.z - oz * s); }
      }
      var rf = size * .112;
      if (HM) {
        var c = lean(P) / (size * size || 1); R.lean = tracked && R.chi ? R.lean + (c - R.lean) * .2 : c; var want = R.chi && Math.abs(R.lean) < .05 ? R.chi : (R.lean >= 0 ? 1 : -1);
        R.vote = want !== R.chi ? (R.vote || 0) + 1 : 0; var chi = !R.chi || !tracked || R.vote > 6 ? want : R.chi;
        if (chi !== R.chi) { if (R.chi) R.flips = (R.flips || 0) + 1; R.chi = chi; R.vote = 0; R.skin.geometry.setIndex(chi > 0 ? HM.idx : HM.rev); }
        frames(P, chi, size, LV, false, HM.L0); skinTo(R, size);
      } else {
        for (i = 0; i < 21; i++) { R.j[i].position.copy(P[i]); R.j[i].scale.setScalar(i === 0 ? rf * 1.5 : (i % 4 === 1 && i > 1 ? rf * 1.25 : rf * (i < 5 ? 1.12 : 1.02))); }
        BONES.forEach(function (bn, n) { var A = P[bn[0]], B = P[bn[1]], m = R.b[n]; tv.subVectors(B, A); var len = tv.length() || 1e-4; m.position.copy(A).addScaledVector(tv, .5); m.quaternion.setFromUnitVectors(UP, tv.multiplyScalar(1 / len)); var palmBone = bn[0] === 0 || (bn[0] % 4 === 1 && bn[1] % 4 === 1); m.scale.set(palmBone ? rf * 1.2 : rf * (bn[0] < 4 ? 1.08 : .98), len, palmBone ? rf * 1.2 : rf * (bn[0] < 4 ? 1.08 : .98)); });
        var pa = R.palm.geometry.attributes.position; [0, 1, 5, 9, 13, 17].forEach(function (id, n) { pa.setXYZ(n, P[id].x, P[id].y, P[id].z); }); pa.needsUpdate = true; R.palm.geometry.computeVertexNormals();
      }
      // a white coat sleeve once the lab coat is on
      tv.subVectors(P[0], P[9]).normalize(); tq.setFromUnitVectors(UP, tv);
      if (R.band) { R.band.position.copy(P[0]).addScaledVector(tv, size * .16); R.band.quaternion.copy(tq); R.band.scale.set(rf * 3.1, size * .34, rf * 2.2); }
      R.cuff.visible = !!k.sleeves; if (k.sleeves) { R.cuff.position.copy(P[0]).addScaledVector(tv, size * 1.2); R.cuff.quaternion.copy(tq); R.cuff.scale.set(rf * 3.5, size * 1.7, rf * 2.7); }
    }

    /* ---------- labels on the heads-up layer, styled like the 2-D labs ---------- */
    k.tag = function (txt, v, col, dy, bold) {
      var p = k.toScreen(v), x = p[0], y = p[1] + (dy || 0), dk = isDark(); g.font = (bold ? '700 ' : '600 ') + Math.max(11, Math.min(15, k.W * .014)) + 'px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      var w = g.measureText(txt).width + 14; g.fillStyle = dk ? 'rgba(15,27,32,.74)' : 'rgba(255,255,255,.82)'; g.beginPath(); var r = 10, X = x - w / 2, Y = y - 10;
      g.moveTo(X + r, Y); g.arcTo(X + w, Y, X + w, Y + 20, r); g.arcTo(X + w, Y + 20, X, Y + 20, r); g.arcTo(X, Y + 20, X, Y, r); g.arcTo(X, Y, X + w, Y, r); g.fill();
      g.fillStyle = col || (dk ? '#94A7AE' : '#52646C'); g.fillText(txt, x, y + .5);
    };
    k.ink = function () { return isDark() ? '#E7EFF1' : '#13232B'; };

    /* ---------- safety gear, and the safety mirror: your own camera picture with the gear drawn on you ---------- */
    var POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
    var GEAR = { gog: 'Goggles', coat: 'Lab coat', gloves: 'Gloves' }, gearOpt = null, gearItems = {}, body = null, bodySeen = 0, poser = null, poseNext = 0, mir = null;
    var WORN = { gog: 'Goggles on. They protect your eyes from splashes and stay on until everything is put away.', coat: 'Lab coat on and buttoned. It keeps chemicals off your skin and clothes.', gloves: 'Gloves on. They keep the solutions off your hands: do not touch your face with them.' };
    k.bodyNow = function () { return body && performance.now() - bodySeen < 1500 ? body : null; };
    k.safe = function () { return !gearOpt || gearOpt.list.every(function (n) { return k.wear[n]; }); };
    function chips() { if (mir) Array.prototype.forEach.call(mir.list.children, function (li) { li.className = k.wear[li.dataset.g] ? 'on' : ''; }); }
    k.setWear = function (kind, on) { k.wear[kind] = !!on; if (kind === 'coat') k.sleeves = !!on; if (kind === 'gloves') paint(); chips(); };
    k.putOn = function (kind, quiet) {
      if (k.wear[kind]) return; var it = gearItems[kind]; if (it) { it.userData.locked = true; it.userData.hidden = true; it.visible = false; } k.setWear(kind, true);
      if (gearOpt && !quiet) { var left = gearOpt.list.filter(function (n) { return !k.wear[n]; }).map(function (n) { return GEAR[n].toLowerCase(); });
        gearOpt.say((gearOpt.worn && gearOpt.worn[kind] || WORN[kind]) + (left.length ? ' Still to put on: ' + left.join(', ') + '.' : ' You are ready. ' + (gearOpt.ready || ''))); if (gearOpt.onWear) gearOpt.onWear(kind, !left.length); }
    };
    k.takeOff = function () { ['gog', 'coat', 'gloves'].forEach(function (n) { k.setWear(n, false); var it = gearItems[n]; if (it) { it.userData.locked = false; it.userData.hidden = false; it.visible = true; k.home(it); } }); if (gearOpt && gearOpt.onWear) gearOpt.onWear(null, false); };
    k.wearAll = function () { (gearOpt ? gearOpt.list : ['gog', 'coat']).forEach(function (n) { k.putOn(n, true); }); if (gearOpt && gearOpt.onWear) gearOpt.onWear(null, true); };
    /* gear on hooks at the top of the bench. opt: { list, say(text), why, ready, worn: { kind: text }, onWear(kind, allOn), x0(k) } */
    k.gear = function (opt) {
      gearOpt = opt; opt.list = opt.list || ['gog', 'coat', 'gloves'];
      var gog = new T.Group(), lens = new T.MeshPhysicalMaterial({ color: 0xBFE4F5, transparent: true, opacity: .45, roughness: .05 }), rim = new T.MeshStandardMaterial({ color: 0x1E2A30, roughness: .5 }), blue = new T.MeshStandardMaterial({ color: 0x2F6FD0, roughness: .6 });
      [-1, 1].forEach(function (sg) { var l = new T.Mesh(new T.CircleGeometry(.3, 24), lens); l.position.x = sg * .36; gog.add(l); var r = new T.Mesh(new T.TorusGeometry(.3, .05, 8, 24), rim); r.position.x = sg * .36; gog.add(r); var sp = new T.Mesh(new T.BoxGeometry(.3, .1, .05), blue); sp.position.set(sg * .8, 0, -.05); gog.add(sp); });
      gog.add(new T.Mesh(new T.BoxGeometry(.2, .07, .07), rim));
      var coat = new T.Group(), wm = new T.MeshStandardMaterial({ color: 0xF6F8F9, roughness: .85 }), gm = new T.MeshStandardMaterial({ color: 0xC9D1D6 }); coat.add(new T.Mesh(new T.BoxGeometry(.95, 1.3, .22), wm));
      [-1, 1].forEach(function (sg) { var sl = new T.Mesh(new T.BoxGeometry(.3, 1.05, .2), wm); sl.position.set(sg * .66, .08, 0); sl.rotation.z = sg * .22; coat.add(sl); var lap = new T.Mesh(new T.BoxGeometry(.07, .62, .02), gm); lap.position.set(sg * .13, .34, .12); lap.rotation.z = -sg * .36; coat.add(lap); });
      for (var bi = 0; bi < 3; bi++) { var bt = new T.Mesh(new T.SphereGeometry(.035, 8, 6), new T.MeshStandardMaterial({ color: 0x52646C })); bt.position.set(.05, -.05 - bi * .22, .12); coat.add(bt); }
      var box = new T.Group(), bx = new T.Mesh(new T.BoxGeometry(.95, .55, .5), new T.MeshStandardMaterial({ color: 0x2E7FBF, roughness: .7 })); box.add(bx);
      var lb = new T.Mesh(new T.PlaneGeometry(.8, .4), new T.MeshBasicMaterial({ map: k.canvasTex(256, 128, function (x) { x.fillStyle = '#F4F8FB'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#17486E'; x.textAlign = 'center'; x.font = '800 50px "Bricolage Grotesque",sans-serif'; x.fillText('GLOVES', 128, 62); x.font = '600 28px "IBM Plex Mono",monospace'; x.fillText('nitrile · M', 128, 104); }) })); lb.position.z = .255; box.add(lb);
      var tng = new T.Mesh(new T.BoxGeometry(.3, .26, .05), new T.MeshStandardMaterial({ color: 0x4A9BD6, roughness: .45 })); tng.position.set(.1, .36, 0); tng.rotation.z = -.25; box.add(tng);
      var all = { gog: [gog, 'safety goggles', .7], coat: [coat, 'lab coat', .95], gloves: [box, 'gloves', .6] };
      opt.list.forEach(function (n) { gearItems[n] = k.addItem(n, all[n][0], { gname: all[n][1], gear: n, managed: true, firm: true, r: .95, scale: .85, tagY: all[n][2] }); });
      k.gearHome = function () { var x = opt.x0 ? opt.x0(k) : -k.halfW + 1.35, row = { gog: [0, 5.9], coat: [1.55, 5.65], gloves: [3.0, 5.85] }; opt.list.forEach(function (n) { gearItems[n].userData.home.set(x + row[n][0], row[n][1], 0); }); };
      k.gearHome();
    };
    /* the mirror card. host: an empty element in the page; list: which gear this lab uses */
    k.mirror = function (host, list) {
      list = list || (gearOpt && gearOpt.list) || ['gog', 'coat', 'gloves'];
      host.innerHTML = '<h3>Safety mirror</h3><div class="mirror"><canvas width="480" height="360" aria-label="Your camera picture with the safety gear you are wearing"></canvas></div><ul class="gear">' + list.map(function (n) { return '<li data-g="' + n + '">' + GEAR[n] + '</li>'; }).join('') + '</ul><p class="small" style="margin:8px 0 0">With the camera: pinch the goggles and bring them to your face' + (list.indexOf('coat') >= 0 ? ', bring the coat to your shoulders' : '') + (list.indexOf('gloves') >= 0 ? ', and pinch the glove box' : '') + '. With mouse or touch: drag ' + (list.length > 1 ? 'each one off its hook' : 'them off the hook') + ' and let go. Your camera picture stays on this device.</p>';
      var cv = host.querySelector('canvas'); mir = { host: host, cv: cv, g: cv.getContext('2d'), list: host.querySelector('ul.gear') }; chips();
    };
    function mGoggles(x, eL, eR, earL, earR, nose) {
      var d = Math.hypot(eR[0] - eL[0], eR[1] - eL[1]); if (d < 4) return; var a = Math.atan2(eR[1] - eL[1], eR[0] - eL[0]), cx = (eL[0] + eR[0]) / 2, cy = (eL[1] + eR[1]) / 2, ca = Math.cos(a), sa = Math.sin(a);
      var loc = function (p) { var dx = p[0] - cx, dy = p[1] - cy; return [(dx * ca + dy * sa) / d, (-dx * sa + dy * ca) / d]; }, t = nose ? Math.max(-.35, Math.min(.35, loc(nose)[0])) * .3 : 0;
      x.save(); x.translate(cx, cy); x.rotate(a); x.scale(d, d); x.lineCap = 'round'; x.lineJoin = 'round';
      [[earL, -1], [earR, 1]].forEach(function (q) { if (!q[0]) return; var e = loc(q[0]); if (Math.abs(e[0]) < 1.0) return; x.strokeStyle = '#1F4E9C'; x.lineWidth = .26; x.beginPath(); x.moveTo(q[1] * 1.0 + t, 0); x.lineTo(e[0], e[1] - .08); x.stroke(); x.strokeStyle = '#2F6FD0'; x.lineWidth = .2; x.stroke(); });
      x.translate(t, 0);
      var path = function () { x.beginPath(); x.moveTo(-.78, -.48); x.lineTo(.78, -.48); x.quadraticCurveTo(1.1, -.46, 1.1, -.12); x.lineTo(1.06, .2); x.quadraticCurveTo(1.02, .46, .72, .46); x.lineTo(.44, .46); x.quadraticCurveTo(.22, .44, .13, .22); x.quadraticCurveTo(0, .04, -.13, .22); x.quadraticCurveTo(-.22, .44, -.44, .46); x.lineTo(-.72, .46); x.quadraticCurveTo(-1.02, .46, -1.06, .2); x.lineTo(-1.1, -.12); x.quadraticCurveTo(-1.1, -.46, -.78, -.48); x.closePath(); };
      path(); x.fillStyle = 'rgba(185,226,250,.24)'; x.fill();
      x.save(); path(); x.clip(); x.fillStyle = 'rgba(255,255,255,.3)'; [[-.95, .3], [.25, .16]].forEach(function (q) { x.beginPath(); x.moveTo(q[0], -.5); x.lineTo(q[0] + q[1], -.5); x.lineTo(q[0] + q[1] - .3, .5); x.lineTo(q[0] - .3, .5); x.closePath(); x.fill(); }); x.restore();
      path(); x.lineWidth = .12; x.strokeStyle = 'rgba(18,52,70,.92)'; x.stroke(); x.lineWidth = .045; x.strokeStyle = 'rgba(150,215,245,.95)'; x.stroke();
      x.fillStyle = 'rgba(18,52,70,.9)'; [-1, 1].forEach(function (sg) { x.fillRect(sg * 1.1 - .07, -.14, .14, .28); });
      x.restore();
    }
    function mCoat(x, sL, sR, H) {
      var w = Math.hypot(sR[0] - sL[0], sR[1] - sL[1]); if (w < 12) return; var a = Math.atan2(sR[1] - sL[1], sR[0] - sL[0]), far = H * 1.6 / w + 2;
      x.save(); x.translate((sL[0] + sR[0]) / 2, (sL[1] + sR[1]) / 2); x.rotate(a); x.scale(w, w); x.lineJoin = 'round';
      x.beginPath(); x.moveTo(-.2, -.19); x.quadraticCurveTo(-.42, -.13, -.6, -.03); x.quadraticCurveTo(-.74, .08, -.76, .42); x.lineTo(-.84, far); x.lineTo(.84, far); x.lineTo(.76, .42); x.quadraticCurveTo(.74, .08, .6, -.03); x.quadraticCurveTo(.42, -.13, .2, -.19); x.lineTo(0, .46); x.closePath();
      var gr = x.createLinearGradient(-.8, 0, .8, 0); gr.addColorStop(0, '#D5DCE1'); gr.addColorStop(.2, '#F7F9FA'); gr.addColorStop(.8, '#F7F9FA'); gr.addColorStop(1, '#D5DCE1'); x.fillStyle = gr; x.fill(); x.lineWidth = .014; x.strokeStyle = 'rgba(105,122,132,.7)'; x.stroke();
      [-1, 1].forEach(function (sg) { x.beginPath(); x.moveTo(sg * .2, -.19); x.lineTo(0, .46); x.lineTo(sg * .21, .37); x.lineTo(sg * .37, .05); x.closePath(); x.fillStyle = '#E7ECEF'; x.fill(); x.stroke(); });
      x.beginPath(); x.moveTo(0, .46); x.lineTo(0, far); x.stroke();
      x.fillStyle = '#66767F'; for (var i = 0; i < 5; i++) { x.beginPath(); x.arc(.045, .62 + i * .3, .022, 0, 6.3); x.fill(); }
      x.strokeRect(.27, .52, .27, .25); x.beginPath(); x.moveTo(.27, .57); x.lineTo(.54, .57); x.stroke(); x.fillStyle = '#2F6FD0'; x.fillRect(.33, .44, .03, .13); x.fillStyle = '#C0392B'; x.fillRect(.39, .46, .03, .11);
      x.restore();
    }
    function mGlove(x, P) {
      var sz = Math.hypot(P[9][0] - P[0][0], P[9][1] - P[0][1]); if (sz < 4) return; x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
      var bx = P[0][0] - (P[9][0] - P[0][0]) * .45, by = P[0][1] - (P[9][1] - P[0][1]) * .45;
      [['#255F93', .34], ['#4A9BD6', .26]].forEach(function (c) { x.strokeStyle = c[0]; x.fillStyle = c[0];
        x.lineWidth = sz * (c[1] + .42); x.beginPath(); x.moveTo(P[0][0], P[0][1]); x.lineTo(bx, by); x.stroke();
        x.lineWidth = sz * c[1]; x.beginPath(); [0, 1, 5, 9, 13, 17].forEach(function (i, n) { if (n) x.lineTo(P[i][0], P[i][1]); else x.moveTo(P[i][0], P[i][1]); }); x.closePath(); x.stroke(); x.fill();
        for (var f = 0; f < 5; f++) { x.lineWidth = sz * c[1] * (f ? .82 : .95); x.beginPath(); x.moveTo(P[f * 4 + 1][0], P[f * 4 + 1][1]); for (var j = 2; j <= 4; j++) x.lineTo(P[f * 4 + j][0], P[f * 4 + j][1]); x.stroke(); } });
      x.restore();
    }
    function drawMirror(now) {
      var cv = mir.cv, x = mir.g, W = cv.width, H = cv.height, live = st.mode === 'cam' && video.videoWidth > 0, pts = null, map = null;
      x.clearRect(0, 0, W, H);
      if (live) {
        var vw = video.videoWidth, vh = video.videoHeight, sc = Math.max(W / vw, H / vh), dw = vw * sc, dh = vh * sc, ox = (W - dw) / 2, oy = (H - dh) / 2;
        x.save(); x.translate(W, 0); x.scale(-1, 1); try { x.drawImage(video, ox, oy, dw, dh); } catch (e) { } x.restore();
        map = function (q) { return [W - (ox + q.x * dw), oy + q.y * dh]; };
        if (body && now - bodySeen < 1500) { pts = body.map(map); pts.vis = body.map(function (q) { return q.v; }); }
      } else {
        var gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#22343C'); gr.addColorStop(1, '#16242A'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
        x.fillStyle = '#6F8A96'; x.beginPath(); x.moveTo(W * .5 - H * .5, H); x.quadraticCurveTo(W * .5 - H * .46, H * .74, W * .5 - H * .12, H * .7); x.lineTo(W * .5 + H * .12, H * .7); x.quadraticCurveTo(W * .5 + H * .46, H * .74, W * .5 + H * .5, H); x.closePath(); x.fill(); x.fillRect(W * .5 - H * .075, H * .55, H * .15, H * .2);
        x.fillStyle = '#86A2AE'; x.beginPath(); x.ellipse(W * .5, H * .38, H * .165, H * .215, 0, 0, 6.3); x.fill();
        pts = []; pts[0] = [W * .5, H * .44]; pts[2] = [W * .5 + H * .07, H * .37]; pts[5] = [W * .5 - H * .07, H * .37]; pts[7] = [W * .5 + H * .17, H * .4]; pts[8] = [W * .5 - H * .17, H * .4]; pts[11] = [W * .5 + H * .36, H * .8]; pts[12] = [W * .5 - H * .36, H * .8]; pts.vis = []; [0, 2, 5, 7, 8, 11, 12].forEach(function (i) { pts.vis[i] = 1; });
      }
      if (pts) {
        var eA = pts[2], eB = pts[5], eL = eA[0] <= eB[0] ? eA : eB, eR = eL === eA ? eB : eA, rA = pts[7], rB = pts[8], rL = rA[0] <= rB[0] ? rA : rB, rR = rL === rA ? rB : rA, ed = Math.hypot(eR[0] - eL[0], eR[1] - eL[1]);
        if (k.wear.coat) {
          var sA = pts[11], sB = pts[12], ok = pts.vis[11] > .3 && pts.vis[12] > .3 && Math.abs(sA[0] - sB[0]) > ed * 1.6;
          if (!ok) { var mx = (eL[0] + eR[0]) / 2, my = (eL[1] + eR[1]) / 2; sA = [mx - ed * 2.6, my + ed * 3.5]; sB = [mx + ed * 2.6, my + ed * 3.5]; }   // shoulders out of the picture: place the coat from the face
          mCoat(x, sA[0] <= sB[0] ? sA : sB, sA[0] <= sB[0] ? sB : sA, H);
        }
        if (k.wear.gog) mGoggles(x, eL, eR, rL, rR, pts[0]);
      }
      if (live && k.wear.gloves) hands.forEach(function (h) { if (h.lms) mGlove(x, h.lms.map(map)); });
      if (live && !pts) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, H - 30, W, 30); x.fillStyle = '#fff'; x.font = '600 14px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(poser ? 'Move back until your face and shoulders show' : 'Finding your face…', W / 2, H - 10); }
    }
    /* gear in a tracked hand goes on when the hand reaches the face (goggles) or the shoulders (coat) */
    function gearReach(now) {
      if (!body || now - bodySeen > 1500) return;
      hands.forEach(function (h) {
        var it = h.held, kind = it && it.userData.gear; if (!kind || kind === 'gloves' || !h.lms || h.ptr) return;
        var ar = video.videoWidth / (video.videoHeight || 1) || 1.78, hx = (h.lms[4].x + h.lms[8].x) / 2 * ar, hy = (h.lms[4].y + h.lms[8].y) / 2, near;
        var ex = (body[2].x + body[5].x) / 2 * ar, ey = (body[2].y + body[5].y) / 2, de = Math.hypot((body[2].x - body[5].x) * ar, body[2].y - body[5].y);
        if (kind === 'gog') near = Math.hypot(hx - ex, hy - ey) < Math.max(.07, de * 1.6);
        else { var sx = (body[11].x + body[12].x) / 2 * ar, sy = (body[11].y + body[12].y) / 2, sw = Math.hypot((body[11].x - body[12].x) * ar, body[11].y - body[12].y); if (!(body[11].v > .3 && body[12].v > .3)) { sx = ex; sy = ey + de * 3.5; sw = de * 5.2; } near = Math.abs(hx - sx) < sw * .55 && hy > sy - sw * .3 && hy < sy + sw * .7; }
        if (near) { it.userData.onBody = true; h.needOpen = true; setPinch(h, false); }
      });
    }

    /* ---------- frame loop ---------- */
    function resize() {
      var r = stage.getBoundingClientRect(); k.W = Math.max(2, Math.round(r.width)); k.H = Math.max(2, Math.round(r.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(k.W, k.H, false); cam.aspect = k.W / k.H; cam.updateProjectionMatrix(); hud.width = k.W; hud.height = k.H;
      k.halfW = Math.tan(20 * Math.PI / 180) * 11.5 * cam.aspect; if (o.layout) o.layout(k); if (k.gearHome) k.gearHome();
      k.items.forEach(function (it) { if (!it.userData.placed && k.held !== it) it.userData.goal.copy(it.userData.home); });
    }
    k.resize = resize;
    var tPrev = 0, frameN = 0;
    function frame(now) {
      requestAnimationFrame(frame); var dt = Math.min(.05, (now - tPrev) / 1000 || .016); tPrev = now; if (k.paused) return;
      hands.forEach(function (h) {
        if (!h.cur.has) { h.hover = null; return; } var p = k.toWorld(h.cur.sx, h.cur.sy); h.world.copy(p);
        if (h.held && !h.held.userData.fixed) h.held.position.set(Math.max(-k.halfW + .4, Math.min(k.halfW - .4, p.x + h.grabOff.x)), Math.max(.3, Math.min(6.7, p.y + h.grabOff.y)), h.held.userData.liftZ == null ? .9 : h.held.userData.liftZ);
        h.hover = h.held ? null : nearestFree(p, h);
      });
      k.cursorWorld = hands[0].world;
      k.items.forEach(function (it) { var u = it.userData, hd = k.holder(it); if (!hd || u.fixed) it.position.lerp(u.goal, u.snap || .2); var hov = false; hands.forEach(function (h) { if (h.hover === it && !h.pinch) hov = true; }); var s = (u.scale || 1) * (hd ? 1.07 : (hov ? 1.05 : 1)); it.scale.setScalar(it.scale.x + (s - it.scale.x) * .25); });
      gearReach(now);
      if (o.onFrame) o.onFrame(dt, now);
      hands.forEach(updateRig);
      renderer.render(scene, cam);
      g.clearRect(0, 0, k.W, k.H);
      if (o.onHUD) o.onHUD(g);
      for (var gn in gearItems) { var gi = gearItems[gn]; if (gi.visible && !k.holder(gi)) k.tag(gi.userData.gname, tv.set(gi.position.x, gi.position.y - gi.userData.tagY, 0), k.ink(), 0, true); }
      if (mir && (frameN++ & 1)) drawMirror(now);
      hands.forEach(function (h) {
        if (h.held && o.targets) { g.setLineDash([6, 6]); g.lineWidth = 2; g.strokeStyle = isDark() ? 'rgba(86,195,223,.85)' : 'rgba(10,106,136,.8)'; (o.targets(h.held) || []).forEach(function (v) { var q = k.toScreen(v); g.beginPath(); g.arc(q[0], q[1], Math.max(22, k.W * .035), 0, 6.3); g.stroke(); }); g.setLineDash([]); }
        if (h.cur.has && st.mode) { var rr = h.pinch ? 7 : 15; g.lineWidth = 4.5; g.strokeStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(h.cur.sx, h.cur.sy, rr, 0, 6.3); g.stroke();
          g.lineWidth = 2.5; g.strokeStyle = h.pinch ? '#E0A63A' : h.hover ? '#2FBF7A' : '#FFFFFF'; g.beginPath(); g.arc(h.cur.sx, h.cur.sy, rr, 0, 6.3); g.stroke();
          if (!h.pinch && h.hover && !h.held) { g.font = '700 12px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.fillStyle = isDark() ? '#4ACB8A' : '#1E8A55'; g.fillText(h.lms && !h.ptr ? 'pinch to grab' : 'press to grab', h.cur.sx, h.cur.sy + 34); } }
      });
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
        var mk = function (d) { return vision.HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: HAND_MODEL, delegate: d }, runningMode: 'VIDEO', numHands: NH }); };
        try { tracker = await mk('GPU'); } catch (e) { tracker = await mk('CPU'); }
        if (mir && vision.PoseLandmarker) { var mkP = function (d) { return vision.PoseLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: POSE_MODEL, delegate: d }, runningMode: 'VIDEO', numPoses: 1 }); };
          mkP('GPU').catch(function () { return mkP('CPU'); }).then(function (pz) { poser = pz; }).catch(function () { }); }
        st.mode = 'cam'; if (o.intro) o.intro.hidden = true; resize(); say(NH > 1 ? 'Camera on. Hold up both hands and pinch to grab.' : 'Camera on. Hold up one hand and pinch to grab.', 'ok');
        var last = -1, lost = 0;
        (function tick() { requestAnimationFrame(tick); if (video.readyState < 2 || video.currentTime === last) return; last = video.currentTime; var now = performance.now();
          try { var r = tracker.detectForVideo(video, now), L = r.landmarks || [], hd = r.handedness || r.handednesses || [], l = L[0];
            if (poser && now >= poseNext) { var t0 = performance.now(); try { var pr = poser.detectForVideo(video, now), pl = pr.landmarks && pr.landmarks[0];
              if (pl) { if (!body || now - bodySeen > 800) body = pl.map(function (q) { return { x: q.x, y: q.y, v: q.visibility == null ? 1 : q.visibility }; }); else pl.forEach(function (q, n) { var bq = body[n]; bq.x += (q.x - bq.x) * .6; bq.y += (q.y - bq.y) * .6; bq.v = q.visibility == null ? 1 : q.visibility; }); bodySeen = now; } } catch (e2) { }
              poseNext = now + Math.max(60, Math.min(400, (performance.now() - t0) * 2.5)); }
            k.feedAll(L.map(function (lm, n) { return { lms: lm, label: hd[n] && hd[n][0] ? hd[n][0].categoryName : '' }; }), now);
            if (!l) { if (!lost) lost = now; if (now - lost > 1500 && !hands.some(function (q) { return q.ptr; })) say(NH > 1 ? 'I cannot see your hands. Hold them up in front of the camera, with light on them.' : 'I cannot see a hand. Hold it up in front of the camera, with light on it.', 'bad'); } else { if (lost) say(NH > 1 ? 'Hands found. Pinch to grab, open to drop.' : 'Hand found. Pinch to grab, open to drop.', 'ok'); lost = 0; } }
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
