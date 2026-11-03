/* lab-viz.js — shared drawing helpers so every lab looks like one collection.
   LabViz.glass(ctx, pathFn, o)  realistic glassware: tinted glass, liquid with depth gradient,
                                 curved meniscus, highlight stripe, rim and bench shadow
   LabViz.ball(ctx, x, y, r, col) shaded 3-D looking particle
   LabViz.lens(ctx, cx, cy, R, drawFn, o)  circular magnifier with a pointer to what it magnifies
   LabViz.readout(canvas, getInfo, redraw)  tap / hover on a graph to read the value under the finger */
(function () {
  'use strict';
  var dark = function () {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  };
  function parse(col) { // '#rrggbb' | 'rgb(a)' -> [r,g,b,a]
    if (!col) return [0, 0, 0, 1];
    if (col[0] === '#') { var h = col.slice(1); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); var n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, 1]; }
    var m = col.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function shade(c, k) { return c.map(function (v, i) { return i === 3 ? v : Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); }); }

  /* o: { left, right, top, bottom (bounding box), liquidY (surface y or null), liquid (css colour),
          ink (outline colour), shadow (true), rim (y of rim, optional), neck: [x1,x2] for meniscus width } */
  function glass(x, path, o) {
    o = o || {};
    if (!(o.right - o.left > 2) || !(o.bottom - o.top > 2)) return;
    var L = o.left, R = o.right, B = o.bottom, T = o.top, w = R - L, dk = dark();
    // bench shadow
    if (o.shadow !== false) {
      var sg = x.createRadialGradient((L + R) / 2, B + 2, 2, (L + R) / 2, B + 2, w * .6);
      sg.addColorStop(0, 'rgba(0,0,0,' + (dk ? .45 : .18) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = sg; x.beginPath(); x.ellipse((L + R) / 2, B + 3, w * .6, 6, 0, 0, 7); x.fill();
    }
    // glass tint
    x.save(); path(x); x.clip();
    var gt = x.createLinearGradient(L, 0, R, 0);
    gt.addColorStop(0, dk ? 'rgba(150,190,215,.16)' : 'rgba(190,220,235,.32)'); gt.addColorStop(.5, dk ? 'rgba(150,190,215,.05)' : 'rgba(225,240,248,.12)'); gt.addColorStop(1, dk ? 'rgba(150,190,215,.2)' : 'rgba(170,205,225,.35)');
    x.fillStyle = gt; x.fillRect(L - 2, T - 2, w + 4, B - T + 4);
    // liquid
    if (o.liquidY != null && o.liquidY < B) {
      var c = parse(o.liquid || 'rgba(200,225,245,.35)'), a = Math.max(.12, c[3]);
      var lg = x.createLinearGradient(0, o.liquidY, 0, B);
      lg.addColorStop(0, rgba(shade(c, .25), a * .85)); lg.addColorStop(1, rgba(shade(c, -.18), Math.min(1, a * 1.15)));
      x.fillStyle = lg; x.fillRect(L - 2, o.liquidY, w + 4, B - o.liquidY + 2);
      // meniscus: a thin brighter band curving up at the walls
      var nx = o.neck || [L, R], mw = nx[1] - nx[0];
      x.strokeStyle = rgba(shade(c, -.3), Math.min(1, a + .25)); x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(nx[0], o.liquidY - Math.min(5, mw * .08)); x.quadraticCurveTo((nx[0] + nx[1]) / 2, o.liquidY + Math.min(4, mw * .05), nx[1], o.liquidY - Math.min(5, mw * .08)); x.stroke();
      x.fillStyle = 'rgba(255,255,255,' + (dk ? .08 : .25) + ')'; x.fillRect(L - 2, o.liquidY, w + 4, 2);
      // round vessel: liquid darker towards the walls, light ripples on the bottom
      var hs = x.createLinearGradient(L, 0, R, 0);
      hs.addColorStop(0, 'rgba(0,10,20,' + (dk ? .22 : .14) + ')'); hs.addColorStop(.22, 'rgba(0,10,20,0)'); hs.addColorStop(.78, 'rgba(0,10,20,0)'); hs.addColorStop(1, 'rgba(0,10,20,' + (dk ? .26 : .17) + ')');
      x.fillStyle = hs; x.fillRect(L - 2, o.liquidY, w + 4, B - o.liquidY + 2);
      if (B - o.liquidY > 26 && w > 40) {
        var tt = performance.now() / 1000; x.strokeStyle = 'rgba(255,255,255,' + (dk ? .07 : .3) + ')'; x.lineWidth = 1.2;
        for (var k = 0; k < 3; k++) { var yy = B - 8 - k * 6; x.beginPath(); for (var xx = L; xx <= R; xx += 5) { var y2 = yy + Math.sin(xx * .07 + tt * 1.4 + k * 1.9) * 1.6 + Math.sin(xx * .16 - tt) * .8; xx === L ? x.moveTo(xx, y2) : x.lineTo(xx, y2); } x.stroke(); }
      }
    }
    // glass walls bend the light: a darker band inside each wall, and a thicker base
    var wb = Math.min(7, w * .12);
    var wl = x.createLinearGradient(L, 0, L + wb, 0); wl.addColorStop(0, dk ? 'rgba(200,230,240,.22)' : 'rgba(40,70,85,.2)'); wl.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = wl; x.fillRect(L, T, wb, B - T);
    var wr = x.createLinearGradient(R, 0, R - wb, 0); wr.addColorStop(0, dk ? 'rgba(200,230,240,.22)' : 'rgba(40,70,85,.22)'); wr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = wr; x.fillRect(R - wb, T, wb, B - T);
    if (o.base !== false && w > 30) { x.fillStyle = dk ? 'rgba(200,230,240,.12)' : 'rgba(255,255,255,.35)'; x.fillRect(L, B - 5, w, 5); }
    // highlight stripes
    var hg = x.createLinearGradient(L, 0, L + w * .3, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(.35, 'rgba(255,255,255,' + (dk ? .18 : .55) + ')'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = hg; x.fillRect(L + w * .08, T + (B - T) * .08, w * .14, (B - T) * .8);
    x.fillStyle = 'rgba(255,255,255,' + (dk ? .08 : .3) + ')'; x.fillRect(R - w * .13, T + (B - T) * .12, w * .04, (B - T) * .65);
    x.restore();
    // outline: dark outer + light inner = glass thickness
    var op = o.outline || path; op(x); x.lineJoin = 'round';
    x.strokeStyle = o.ink || (dk ? '#C9D6DE' : '#33434C'); x.lineWidth = 2.2; x.stroke();
    op(x); x.strokeStyle = 'rgba(255,255,255,' + (dk ? .12 : .6) + ')'; x.lineWidth = .8; x.stroke();
  }


  /* ---------- realistic bench parts (shared by the chemistry labs) ---------- */
  function rr(x, X, Y, W, H, r) { r = Math.max(0, Math.min(r, W / 2, H / 2)); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function hex(c, k, a) { var p = shade(parse(c), k || 0); return rgba(p, a == null ? 1 : a); }
  // lab wall + bench top. baseY = bench surface.
  function bench(x, w, h, baseY) {
    var dk = dark(); var g = x.createLinearGradient(0, 0, 0, baseY);
    g.addColorStop(0, dk ? '#15262D' : '#F6F9F8'); g.addColorStop(1, dk ? '#0E1A1F' : '#E1E9E8'); x.fillStyle = g; x.fillRect(0, 0, w, baseY);
    x.strokeStyle = dk ? 'rgba(255,255,255,.025)' : 'rgba(40,70,80,.05)'; x.lineWidth = 1;
    for (var yy = baseY - 46; yy > 0; yy -= 46) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
    var b = x.createLinearGradient(0, baseY, 0, h); b.addColorStop(0, dk ? '#2A3C44' : '#CBD3D1'); b.addColorStop(.12, dk ? '#1C2A30' : '#B9C4C2'); b.addColorStop(1, dk ? '#0F181C' : '#A3AEAC');
    x.fillStyle = b; x.fillRect(0, baseY, w, h - baseY); x.fillStyle = dk ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.75)'; x.fillRect(0, baseY, w, 1.5);
  }
  function contact(x, cx, y, rx) { x.save(); x.translate(cx, y); x.scale(1, .14); var g = x.createRadialGradient(0, 0, 2, 0, 0, rx); g.addColorStop(0, dark() ? 'rgba(0,0,0,.5)' : 'rgba(20,40,45,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, 7); x.fill(); x.restore(); }
  // chrome / steel rod: horizontal (w>h) or vertical
  function chrome(x, X, Y, W, H) { var vert = H > W, g = vert ? x.createLinearGradient(X, 0, X + W, 0) : x.createLinearGradient(0, Y, 0, Y + H);
    g.addColorStop(0, '#59636A'); g.addColorStop(.35, '#E8EDF0'); g.addColorStop(.55, '#B8C1C7'); g.addColorStop(1, '#4C555B'); x.fillStyle = g; x.fillRect(X, Y, W, H); }
  // magnetic stirrer: top plate at y = top, centred on cx
  function stirrer(x, cx, top, w, on, hh) {
    var h = hh || Math.max(22, w * .26); contact(x, cx, top + h + 2, w * .62);
    var bg = x.createLinearGradient(0, top, 0, top + h); bg.addColorStop(0, '#E9EDEF'); bg.addColorStop(1, '#AEB8BD'); x.fillStyle = bg; rr(x, cx - w / 2, top + 3, w, h - 3, 6); x.fill();
    x.fillStyle = '#2F3A40'; rr(x, cx - w / 2 + 6, top + h * .42, w - 12, h * .46, 4); x.fill();
    var cg = x.createLinearGradient(0, top - 3, 0, top + 6); cg.addColorStop(0, '#FFFFFF'); cg.addColorStop(1, '#D4DADD'); x.fillStyle = cg; rr(x, cx - w / 2 - 3, top, w + 6, 7, 3); x.fill(); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 1; x.stroke();
    for (var k = 0; k < 2; k++) { var kx = cx - w * .3 + k * w * .22, ky = top + h * .65, kr = Math.max(3.5, h * .16); var kg = x.createRadialGradient(kx - kr * .3, ky - kr * .3, 1, kx, ky, kr); kg.addColorStop(0, '#9AA5AB'); kg.addColorStop(1, '#1F262A'); x.fillStyle = kg; x.beginPath(); x.arc(kx, ky, kr, 0, 7); x.fill(); }
    x.fillStyle = on ? '#47E07A' : '#3C4A44'; x.beginPath(); x.arc(cx + w * .32, top + h * .65, Math.max(2, h * .07), 0, 7); x.fill();
    if (on) { x.fillStyle = 'rgba(71,224,122,.35)'; x.beginPath(); x.arc(cx + w * .32, top + h * .65, Math.max(5, h * .18), 0, 7); x.fill(); }
    return top + h;
  }
  // stir bar lying on the bottom of a vessel
  function stirBar(x, cx, y, len, ang) { x.save(); x.translate(cx, y); x.scale(1, .32); x.rotate(ang || 0); var g = x.createLinearGradient(0, -5, 0, 5); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#BFC6CA'); x.fillStyle = g; rr(x, -len, -5, 2 * len, 10, 5); x.fill(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.5; x.stroke(); x.restore(); }
  // LCD read-out
  function lcd(x, X, Y, W, H, text, o) { o = o || {};
    var bg = x.createLinearGradient(0, Y, 0, Y + H); bg.addColorStop(0, o.green === false ? '#1A2E26' : '#D3DEC2'); bg.addColorStop(1, o.green === false ? '#0E1C17' : '#AFBE98');
    x.fillStyle = '#2A2F34'; rr(x, X - 4, Y - 4, W + 8, H + 8, 6); x.fill(); x.fillStyle = bg; rr(x, X, Y, W, H, 4); x.fill();
    x.fillStyle = o.green === false ? '#7CFF9E' : '#17210F'; x.font = '700 ' + Math.round(H * .58) + 'px "IBM Plex Mono",monospace'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(text, X + W - 6, Y + H / 2 + 1); x.textBaseline = 'alphabetic';
    if (o.unit) { x.font = '600 ' + Math.round(H * .26) + 'px "IBM Plex Mono",monospace'; x.textAlign = 'left'; x.fillText(o.unit, X + 5, Y + H * .34); } }
  // falling or hanging drop
  function drop(x, px, py, r, col) { var c = parse(col); x.fillStyle = rgba(c, Math.max(.55, c[3])); x.beginPath(); x.moveTo(px, py - r * 1.9); x.bezierCurveTo(px + r * .5, py - r * .9, px + r, py - r * .3, px + r, py + r * .15); x.arc(px, py + r * .15, r, 0, Math.PI); x.bezierCurveTo(px - r, py - r * .3, px - r * .5, py - r * .9, px, py - r * 1.9); x.fill(); x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(px - r * .35, py - r * .1, r * .28, 0, 7); x.fill(); }
  // paper label
  function paper(x, cx, cy, w, h, lines) { x.fillStyle = 'rgba(0,0,0,.15)'; rr(x, cx - w / 2 + 1.5, cy - h / 2 + 2, w, h, 3); x.fill(); var g = x.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, '#E9E2CC'); g.addColorStop(.35, '#FFFBEE'); g.addColorStop(1, '#DCD4BC'); x.fillStyle = g; rr(x, cx - w / 2, cy - h / 2, w, h, 3); x.fill();
    x.textAlign = 'center'; (lines || []).forEach(function (l, i) { x.fillStyle = i ? '#4A4535' : '#1E1A10'; x.font = (i ? '500 ' : '700 ') + (l[1] || 11) + 'px "IBM Plex Mono",monospace'; x.fillText(l[0], cx, cy - h / 2 + 4 + (l[1] || 11) + i * ((l[1] || 11) + 3)); }); }
  // retort stand: heavy base, chrome rod, boss head with clamp arm to armX
  function stand(x, rodX, top, baseY, baseW, armY, armX) {
    contact(x, rodX + baseW * .3, baseY, baseW * .7);
    var bg = x.createLinearGradient(0, baseY - 12, 0, baseY); bg.addColorStop(0, '#5B6870'); bg.addColorStop(1, '#2D363B'); x.fillStyle = bg; rr(x, rodX - baseW * .2, baseY - 12, baseW, 12, 4); x.fill();
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(rodX - baseW * .2 + 4, baseY - 11, baseW - 8, 1.5);
    chrome(x, rodX - 4, top, 8, baseY - 12 - top);
    if (armY != null) { chrome(x, rodX, armY - 3, armX - rodX - 8, 6); var hg = x.createLinearGradient(rodX - 9, 0, rodX + 9, 0); hg.addColorStop(0, '#2C3236'); hg.addColorStop(.5, '#6A747A'); hg.addColorStop(1, '#22282B'); x.fillStyle = hg; rr(x, rodX - 9, armY - 10, 18, 20, 3); x.fill();
      x.fillStyle = '#C9A34A'; x.beginPath(); x.arc(rodX - 13, armY, 4, 0, 7); x.fill(); x.fillRect(rodX - 19, armY - 1.5, 6, 3); }
  }
  // reagent bottle with screw cap and paper label
  function bottle(x, cx, base, w, h, liquid, lines, amber) {
    contact(x, cx, base + 1, w * .75); var nw = w * .42, sh = h * .2, top = base - h;
    var path = function (x) { x.beginPath(); x.moveTo(cx - nw / 2, top); x.lineTo(cx - nw / 2, top + sh * .55); x.quadraticCurveTo(cx - w / 2, top + sh * .7, cx - w / 2, top + sh * 1.3); x.lineTo(cx - w / 2, base - 5); x.quadraticCurveTo(cx - w / 2, base, cx - w / 2 + 5, base); x.lineTo(cx + w / 2 - 5, base); x.quadraticCurveTo(cx + w / 2, base, cx + w / 2, base - 5); x.lineTo(cx + w / 2, top + sh * 1.3); x.quadraticCurveTo(cx + w / 2, top + sh * .7, cx + nw / 2, top + sh * .55); x.lineTo(cx + nw / 2, top); x.closePath(); };
    if (amber) { x.save(); path(x); x.fillStyle = 'rgba(150,80,20,.35)'; x.fill(); x.restore(); }
    glass(x, path, { left: cx - w / 2, right: cx + w / 2, top: top, bottom: base, liquidY: base - h * .62, liquid: liquid, shadow: false });
    var cg = x.createLinearGradient(cx - nw / 2 - 2, 0, cx + nw / 2 + 2, 0); cg.addColorStop(0, '#1E2427'); cg.addColorStop(.45, '#5E686E'); cg.addColorStop(1, '#161A1C'); x.fillStyle = cg; rr(x, cx - nw / 2 - 2, top - h * .1, nw + 4, h * .11, 2); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1; for (var k = 1; k < 6; k++) { var xx = cx - nw / 2 - 2 + (nw + 4) * k / 6; x.beginPath(); x.moveTo(xx, top - h * .1 + 1); x.lineTo(xx, top - 1); x.stroke(); }
    if (lines) paper(x, cx, base - h * .38, w * .82, h * .3, lines);
  }

  /* sealed glass reaction chamber. Call with phase 'back' before the particles and 'front' after them. */
  function chamber(x, X, Y, W, H, phase, o) {
    o = o || {}; var dk = dark();
    if (phase === 'back') {
      var g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, dk ? 'rgba(28,46,56,.9)' : 'rgba(240,247,250,.95)'); g.addColorStop(1, dk ? 'rgba(14,26,32,.95)' : 'rgba(214,229,235,.95)');
      x.fillStyle = g; x.fillRect(X, Y, W, H);
      x.strokeStyle = dk ? 'rgba(255,255,255,.03)' : 'rgba(40,80,95,.05)'; x.lineWidth = 1; for (var gx = X + 30; gx < X + W; gx += 30) { x.beginPath(); x.moveTo(gx, Y); x.lineTo(gx, Y + H); x.stroke(); }
      return;
    }
    var t = Math.max(5, Math.min(11, Math.min(W, H) * .028));
    var sideG = function (x0, x1) { var gg = x.createLinearGradient(x0, 0, x1, 0); gg.addColorStop(0, dk ? 'rgba(190,225,238,.45)' : 'rgba(120,165,182,.55)'); gg.addColorStop(.45, 'rgba(255,255,255,' + (dk ? .25 : .7) + ')'); gg.addColorStop(1, dk ? 'rgba(190,225,238,.1)' : 'rgba(150,190,205,.2)'); return gg; };
    var topG = function (y0, y1) { var gg = x.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, dk ? 'rgba(190,225,238,.45)' : 'rgba(120,165,182,.55)'); gg.addColorStop(.45, 'rgba(255,255,255,' + (dk ? .25 : .7) + ')'); gg.addColorStop(1, dk ? 'rgba(190,225,238,.1)' : 'rgba(150,190,205,.2)'); return gg; };
    x.fillStyle = topG(Y - t, Y + t * .2); x.fillRect(X, Y - t, W, t); x.fillStyle = topG(Y + H + t, Y + H - t * .2); x.fillRect(X, Y + H, W, t);
    if (!o.noLeft) { x.fillStyle = sideG(X - t, X); x.fillRect(X - t, Y - t, t, H + 2 * t); }
    if (!o.noRight) { x.fillStyle = sideG(X + W + t, X + W); x.fillRect(X + W, Y - t, t, H + 2 * t); }
    x.strokeStyle = dk ? 'rgba(200,230,240,.55)' : 'rgba(45,75,88,.75)'; x.lineWidth = 1.4; x.strokeRect(X - t, Y - t, W + 2 * t, H + 2 * t);
    x.strokeStyle = 'rgba(255,255,255,' + (dk ? .2 : .65) + ')'; x.lineWidth = 1; x.strokeRect(X + .5, Y + .5, W - 1, H - 1);
    // a soft reflection across the front pane
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); var rg = x.createLinearGradient(X, Y, X + W * .35, Y + H); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.45, 'rgba(255,255,255,' + (dk ? .05 : .16) + ')'); rg.addColorStop(.55, 'rgba(255,255,255,0)');
    x.fillStyle = rg; x.beginPath(); x.moveTo(X + W * .06, Y); x.lineTo(X + W * .2, Y); x.lineTo(X + W * .08, Y + H); x.lineTo(X - W * .06, Y + H); x.fill(); x.restore();
    // steel end flanges with bolts
    var fw = Math.max(8, t * 1.6);
    [[X - t - fw, 1], [X + W + t, -1]].forEach(function (f, i) {
      if ((i === 0 && o.noLeft) || (i === 1 && o.noRight)) return;
      chrome(x, f[0], Y - t - 6, fw, H + 2 * t + 12);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.strokeRect(f[0], Y - t - 6, fw, H + 2 * t + 12);
      [Y - t + 2, Y + H / 2, Y + H + t - 2].forEach(function (by) { var bx = f[0] + fw / 2, br = Math.max(2.4, fw * .26); var bg = x.createRadialGradient(bx - br * .3, by - br * .3, .5, bx, by, br); bg.addColorStop(0, '#F4F6F7'); bg.addColorStop(1, '#4C555B'); x.fillStyle = bg; x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); });
    });
  }
  /* steel piston plate at px with its rod running to rodEnd */
  function piston(x, px, Y, H, rodEnd) {
    var pw = Math.max(9, H * .05); chrome(x, px, Y, pw, H); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.strokeRect(px, Y, pw, H);
    x.fillStyle = '#2B3236'; x.fillRect(px - 2, Y + 3, 3, H - 6);
    var ry = Y + H / 2 - 4; var rg = x.createLinearGradient(0, ry, 0, ry + 8); rg.addColorStop(0, '#59636A'); rg.addColorStop(.4, '#EEF2F4'); rg.addColorStop(1, '#4C555B'); x.fillStyle = rg; x.fillRect(px + pw, ry, Math.max(0, rodEnd - px - pw), 8);
    var kx = rodEnd, kg = x.createRadialGradient(kx - 3, ry + 1, 1, kx, ry + 4, 12); kg.addColorStop(0, '#5A6066'); kg.addColorStop(1, '#111417'); x.fillStyle = kg; rr(x, kx - 4, ry - 10, 14, 28, 6); x.fill();
  }

  function ball(x, cx, cy, r, col, alpha) {
    if (!(r > 0.5)) return;
    var c = parse(col), g = x.createRadialGradient(cx - r * .35, cy - r * .4, r * .12, cx, cy, r);
    g.addColorStop(0, rgba(shade(c, .55), alpha == null ? 1 : alpha)); g.addColorStop(.55, rgba(c, alpha == null ? 1 : alpha)); g.addColorStop(1, rgba(shade(c, -.35), alpha == null ? 1 : alpha));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  }

  /* draw a magnifier at (cx,cy) radius R; drawFn(x, cx, cy, R) paints the inside (already clipped).
     o.from = [x,y] the spot being magnified, o.title, o.ink, o.bg */
  function lens(x, cx, cy, R, drawFn, o) {
    if (!(R > 12)) return;
    o = o || {}; var dk = dark(), ink = o.ink || (dk ? '#E7EFF1' : '#13232B');
    if (o.from) {
      x.save(); x.strokeStyle = ink; x.globalAlpha = .55; x.setLineDash([4, 4]); x.lineWidth = 1.5;
      var a = Math.atan2(o.from[1] - cy, o.from[0] - cx);
      x.beginPath(); x.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.lineTo(o.from[0], o.from[1]); x.stroke();
      x.setLineDash([]); x.globalAlpha = 1; x.beginPath(); x.arc(o.from[0], o.from[1], 8, 0, 7); x.stroke(); x.restore();
    }
    x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fillStyle = o.bg || (dk ? '#0F1B20' : '#FFFFFF'); x.fill(); x.clip();
    drawFn(x, cx, cy, R);
    var gl = x.createRadialGradient(cx - R * .4, cy - R * .5, R * .1, cx, cy, R);
    gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(.6, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    x.restore();
    x.strokeStyle = ink; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, R - 3, 0, 7); x.stroke();
    if (o.title) {
      x.font = '700 11px "IBM Plex Mono",monospace'; var tw = x.measureText(o.title).width + 12;
      x.fillStyle = ink; x.beginPath(); if (x.roundRect) x.roundRect(cx - tw / 2, cy + R - 10, tw, 18, 9); else x.rect(cx - tw / 2, cy + R - 10, tw, 18); x.fill();
      x.fillStyle = dk ? '#0F1B20' : '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.title, cx, cy + R - 1); x.textBaseline = 'alphabetic';
    }
  }

  /* graph read-out. getInfo(px, py, w, h) returns null or { x: canvasX, y: canvasY, text: 'line 1|line 2', col } in CSS px.
     The graph's own draw function should call LabViz.drawReadout(ctx, canvas) at the end. */
  var RO = new WeakMap();
  function readout(c, getInfo, redraw) {
    var st = { info: null, pin: false }; RO.set(c, { st: st, getInfo: getInfo });
    function at(e) { var r = c.getBoundingClientRect(); st.info = getInfo(e.clientX - r.left, e.clientY - r.top, r.width, r.height); redraw(); }
    c.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || st.pin) at(e); });
    c.addEventListener('pointerdown', function (e) { st.pin = true; at(e); });
    c.addEventListener('pointerup', function () { st.pin = false; });
    c.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { st.info = null; redraw(); } });
    if (!c.title) c.title = 'Point at or tap the graph to read a value';
  }
  function drawReadout(x, c) {
    var R = RO.get(c); if (!R || !R.st.info) return; var i = R.st.info, dk = dark(), ink = dk ? '#E7EFF1' : '#13232B';
    x.save(); x.strokeStyle = ink; x.globalAlpha = .45; x.setLineDash([3, 3]); x.lineWidth = 1;
    x.beginPath(); x.moveTo(i.x, i.top != null ? i.top : 0); x.lineTo(i.x, i.bottom != null ? i.bottom : c.clientHeight); x.stroke(); x.restore();
    ball(x, i.x, i.y, 6, i.col || '#C2185B');
    var lines = String(i.text).split('|'); x.font = '600 12px "IBM Plex Mono",monospace';
    var tw = Math.max.apply(null, lines.map(function (s) { return x.measureText(s).width; })) + 16, th = lines.length * 16 + 8;
    var bx = i.x + 12 + tw > c.clientWidth ? i.x - 12 - tw : i.x + 12, by = Math.max(4, Math.min(c.clientHeight - th - 4, i.y - th - 8));
    x.fillStyle = dk ? 'rgba(15,27,32,.92)' : 'rgba(255,255,255,.95)'; x.strokeStyle = i.col || '#C2185B'; x.lineWidth = 1.5;
    x.beginPath(); if (x.roundRect) x.roundRect(bx, by, tw, th, 8); else x.rect(bx, by, tw, th); x.fill(); x.stroke();
    x.fillStyle = ink; x.textAlign = 'left'; x.textBaseline = 'top'; lines.forEach(function (s, k) { x.fillText(s, bx + 8, by + 6 + k * 16); }); x.textBaseline = 'alphabetic';
  }
  /* moving tracer dot at the newest point of a live curve */
  function tracer(x, px, py, col, t) {
    var k = .5 + .5 * Math.sin((t || performance.now()) / 220);
    x.fillStyle = col; x.globalAlpha = .25 + .2 * k; x.beginPath(); x.arc(px, py, 9 + 3 * k, 0, 7); x.fill(); x.globalAlpha = 1; ball(x, px, py, 5, col);
  }
  window.LabViz = { chamber: chamber, piston: piston, rr: rr, hex: hex, bench: bench, contact: contact, chrome: chrome, stirrer: stirrer, stirBar: stirBar, lcd: lcd, drop: drop, paper: paper, stand: stand, bottle: bottle, glass: glass, ball: ball, lens: lens, readout: readout, drawReadout: drawReadout, tracer: tracer, parse: parse, dark: dark };
})();
