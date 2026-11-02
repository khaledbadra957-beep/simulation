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
    }
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
  window.LabViz = { glass: glass, ball: ball, lens: lens, readout: readout, drawReadout: drawReadout, tracer: tracer, parse: parse, dark: dark };
})();
