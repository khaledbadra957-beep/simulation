/* bench-setup.js — "Set it up yourself": the parts wait in a tray, the student puts each one in its place on the bench.
   Idea from the Robotics Lab assembly screen, rebuilt in plain 2D. Light on purpose: no libraries, nothing runs while closed.

   const su = BenchSetup.attach({
     key: 'titration',                  // best time remembered on this device under this key
     wrap: el, stage: canvas, bar: el,  // box that holds the drawing, the drawing, where the button goes
     title: 'Set up the titration',
     parts: () => [{ id, name, icon, spot: [x0,y0,x1,y1] (CSS px of the stage), needs: ['id'], early: 'why it must wait',
                     why: 'shown when placed', hint: 'where it goes' }],
     extras: () => [{ id, name, icon, why }],      // things that are not needed: each explains why
     watch: ['…', '…'],                             // "Watch for" lines on the finished card
     onOpen, onClose, onChange, onDone              // hooks for the lab
   });
   su.active · su.has(id) (true when closed) · su.age(id) ms since placed (Infinity when closed) · su.open() · su.close() */
(function () {
  'use strict';
  var CSS = '.su-layer{position:absolute;left:0;top:0;pointer-events:none;z-index:3}' +
    '.su-catch{position:absolute;inset:0;z-index:2;pointer-events:auto;cursor:default;touch-action:manipulation}.su-catch.sel{cursor:copy}' +
    '.su-panel{background:var(--stage,#fff);border:1.5px solid var(--line,#C6D2D1);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:9px;margin:10px 0}.su-panel[hidden]{display:none}' +
    '.su-panel.su-float{position:absolute;z-index:5;top:10px;right:10px;width:min(320px,40%);max-height:calc(100% - 20px);overflow:auto;margin:0;padding:10px 12px;gap:7px;box-shadow:0 10px 30px -10px rgba(0,0,0,.35)}' +
    '.su-float .su-tray{flex-direction:column;flex-wrap:nowrap;gap:4px;overflow:auto;min-height:60px;flex:1 1 auto;padding:2px}.su-float{overflow:hidden!important}.su-float .su-row button{padding:4px 8px;font-size:.85rem}.su-float .su-sp{display:none}.su-float .su-it{width:100%;padding:3px 8px 3px 4px;font-size:.9rem}.su-float .su-it svg{width:24px;height:24px}.su-float .su-tip{display:none}.su-float .su-fb{font-size:.92rem;padding:6px 8px}' +
    '.su-top{gap:6px;padding:10px 12px}.su-top .su-tray{flex-wrap:nowrap;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin}.su-top .su-tray li{flex:none}.su-top .su-it{touch-action:pan-x;white-space:nowrap}.su-top .su-tip{display:none}.su-top .su-fb{font-size:.92rem;padding:6px 9px}.su-top .su-row button{padding:4px 9px;font-size:.85rem}.su-top .su-sp{display:none}' +
    '.su-noselect,.su-noselect *{user-select:none!important;-webkit-user-select:none!important}' +
    '.su-panel button{width:auto}.su-head{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}.su-head h4{margin:0;font-size:1.05rem;flex:1;min-width:160px}' +
    '.su-k{font:600 12px/1.3 ui-monospace,monospace;letter-spacing:.04em;color:var(--muted,#52646C)}' +
    '.su-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
    '.su-tray{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}' +
    '.su-it{display:flex;align-items:center;gap:6px;border:1.5px solid var(--line,#C6D2D1);background:var(--surface,#F8FAF9);color:var(--ink,#13232B);border-radius:10px;padding:5px 10px 5px 6px;font:inherit;font-size:.95rem;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.su-it svg{width:28px;height:28px;flex:none}.su-it span{text-align:left}.su-it:hover{border-color:var(--ink,#13232B)}.su-it.on{border-color:var(--accent,#0A6A88);box-shadow:0 0 0 3px rgba(10,106,136,.2)}' +
    '.su-it.pulse{animation:su-p 1s ease-in-out 3}@keyframes su-p{50%{border-color:var(--accent,#0A6A88);box-shadow:0 0 0 5px rgba(10,106,136,.25)}}' +
    '.su-it.out{opacity:.45;text-decoration:line-through;cursor:default}' +
    '.su-fly{position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%) scale(1.15);opacity:.92;box-shadow:0 8px 22px rgba(0,0,0,.25)}' +
    '.su-fb{margin:0;padding:7px 10px;border-radius:9px}.su-fb b{font-weight:700}.su-fb.ok{color:var(--ok,#1E8A55);background:rgba(30,138,85,.1)}.su-fb.bad{color:var(--bad,#C0392B);background:rgba(192,57,43,.1)}.su-fb.info{background:var(--surface,#F8FAF9)}' +
    '.su-fb.ok span,.su-fb.bad span{color:var(--ink,#13232B);font-weight:400}' +
    '.su-done h4{margin:0 0 4px}.su-done ul{margin:4px 0 0;padding-left:20px}.su-done li{margin:2px 0}' +
    '@media (prefers-reduced-motion:reduce){.su-it.pulse{animation:none;border-color:var(--accent,#0A6A88)}}';
  var ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="display:inline-block;width:16px;height:16px;flex:none;vertical-align:-3px;margin:0 5px 0 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h16M7 20V9h4v11M15 20v-6h4v6M9 9V4"/></svg>';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clock(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function lc(s) { return /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function inBox(b, x, y, pad) { return x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad; }

  function attach(o) {
    if (!document.getElementById('su-css')) { var st = el('style'); st.id = 'su-css'; st.textContent = CSS; document.head.appendChild(st); }
    var wrap = o.wrap, stage = o.stage, KEY = 'su:' + (o.key || location.pathname);
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    var btn = el('button', 'btn small su-btn', ICON + 'Set it up'); btn.type = 'button'; btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Put each piece of apparatus in its place yourself';
    o.bar.appendChild(btn);
    var layer = el('canvas', 'su-layer'), catcher = el('div', 'su-catch'); layer.setAttribute('aria-hidden', 'true');
    catcher.hidden = true; layer.hidden = true; wrap.appendChild(catcher); wrap.appendChild(layer);
    var panel = el('div', 'su-panel'); panel.hidden = true; panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', o.title || 'Set it up');
    wrap.parentNode.insertBefore(panel, wrap.nextSibling);
    function layout() {   // wide benches: the tray floats on the empty right side of the drawing, so tray and bench are both in view
      var f = o.float !== false && wrap.clientWidth >= 460;
      if (f) { if (panel.parentNode !== wrap) wrap.appendChild(panel); }
      else if (panel.nextSibling !== wrap) wrap.parentNode.insertBefore(panel, wrap);   // narrow: a one-row tray above the bench, both in view
      panel.classList.toggle('su-float', f); panel.classList.toggle('su-top', !f);
    }
    layout();

    var S = null;   // state while open
    function best() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
    function saveBest(t) { try { localStorage.setItem(KEY, JSON.stringify({ t: t })); } catch (e) {} }
    function P() { return o.parts() || []; }
    function X() { return o.extras ? o.extras() || [] : []; }
    function find(id) { return P().filter(function (p) { return p.id === id; })[0] || X().filter(function (p) { return p.id === id; })[0]; }
    function ready(p) { return (p.needs || []).every(function (n) { return S.placed[n] != null || !find(n); }); }
    function nextPart() { var L = P().filter(function (p) { return S.placed[p.id] == null; }); return L.filter(ready)[0] || L[0]; }
    function off() { var r = stage.getBoundingClientRect(), w = wrap.getBoundingClientRect(); return { x: r.left - w.left, y: r.top - w.top, r: r }; }

    /* ---------- the overlay: outlines, hint pulse, right/wrong flashes ---------- */
    var fx = [], raf = 0;
    function css(n, d) { return getComputedStyle(wrap).getPropertyValue(n).trim() || d; }
    function draw() {
      raf = 0; if (!S) return;
      var O = off(), d = window.devicePixelRatio || 1, w = O.r.width, h = O.r.height;
      layer.style.left = O.x + 'px'; layer.style.top = O.y + 'px'; layer.style.width = w + 'px'; layer.style.height = h + 'px';
      if (layer.width !== Math.round(w * d) || layer.height !== Math.round(h * d)) { layer.width = Math.round(w * d); layer.height = Math.round(h * d); }
      var x = layer.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h);
      var now = performance.now(), ink = css('--muted', '#52646C'), acc = css('--accent', '#0A6A88');
      if (!S.done) P().forEach(function (p) {
        if (S.placed[p.id] != null || !p.spot) return;
        var b = p.spot, hint = S.hint === p.id && now < S.hintUntil;
        if ((S.challenge || p.outline === false) && !hint) return;
        x.save(); x.beginPath(); rr(x, b[0], b[1], b[2] - b[0], b[3] - b[1], 8);
        if (hint) { var a = .55 + .45 * Math.sin(now / 160); x.strokeStyle = acc; x.lineWidth = 3; x.globalAlpha = a; x.setLineDash([]); x.shadowColor = acc; x.shadowBlur = 12; x.stroke(); }
        else { x.strokeStyle = ink; x.globalAlpha = .55; x.lineWidth = 1.6; x.setLineDash([5, 4]); x.stroke(); }
        x.restore();
      });
      fx = fx.filter(function (f) { return now - f.t0 < 700; });
      fx.forEach(function (f) {
        var u = (now - f.t0) / 700, b = f.b; x.save(); x.globalAlpha = 1 - u; x.lineWidth = 3; x.strokeStyle = f.ok ? css('--ok', '#1E8A55') : css('--bad', '#C0392B');
        if (b) { x.beginPath(); rr(x, b[0] - 4 * u, b[1] - 4 * u, b[2] - b[0] + 8 * u, b[3] - b[1] + 8 * u, 9); x.stroke(); }
        else { var r = 10 + 8 * u; x.beginPath(); x.moveTo(f.x - r, f.y - r); x.lineTo(f.x + r, f.y + r); x.moveTo(f.x + r, f.y - r); x.lineTo(f.x - r, f.y + r); x.stroke(); }
        x.restore();
      });
      if (fx.length || (S.hint && now < S.hintUntil)) raf = requestAnimationFrame(draw);
    }
    function redraw() { if (!raf && S) raf = requestAnimationFrame(draw); }
    function rr(x, a, b, w, h, r) { r = Math.min(r, w / 2, h / 2); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

    /* ---------- the panel ---------- */
    function render() {
      if (!S) return;
      var all = P(), n = all.filter(function (p) { return S.placed[p.id] != null; }).length, B = best();
      if (S.done) {
        var t = S.t1 - S.t0, rec = S.challenge && !S.helped && (!B || t < B.t);
        if (rec) saveBest(t);
        panel.innerHTML = '<div class="su-done"><h4>Set up and ready to titrate</h4>' +
          '<p class="su-k">Time ' + clock(t) + ' · Mistakes ' + S.miss + (S.helped ? ' · Placed for you ' + S.helped : '') + (S.challenge ? ' · Challenge mode' : '') + '</p>' +
          (rec ? '<p class="su-fb ok"><b>New best time: ' + clock(t) + '</b></p>' : (B ? '<p class="su-k">Best challenge time on this device: ' + clock(B.t) + '</p>' : '')) +
          (o.watch && o.watch.length ? '<p style="margin:8px 0 0"><b>Watch for</b></p><ul>' + o.watch.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>' : '') +
          '</div><div class="su-row"><button class="btn" data-a="go" type="button">Start titrating</button><button class="btn small" data-a="again" type="button">Set it up again</button>' +
          (S.challenge ? '' : '<button class="btn small" data-a="chal" type="button">Try challenge mode</button>') + '</div>';
        return;
      }
      var items = all.filter(function (p) { return S.placed[p.id] == null; }).concat(X());
      items.sort(function (a, b) { return a.name < b.name ? -1 : 1; });   // alphabetical, so the tray does not give the order away
      panel.innerHTML = '<div class="su-head"><h4>' + esc(o.title || 'Set it up') + '</h4><span class="su-k" data-s></span></div>' +
        (S.fb ? '<p class="su-fb ' + S.fb.cls + '" role="status">' + S.fb.html + '</p>' : '<p class="su-fb info" role="status">' + (n ? n + ' of ' + all.length + ' in place.' : 'Drag a piece to its place on the bench, or tap it and then tap its place. Not everything here is needed.') + '</p>') +
        '<ul class="su-tray" aria-label="Apparatus tray">' + items.map(function (p) {
          var gone = S.out[p.id];
          return '<li><button type="button" class="su-it' + (gone ? ' out' : '') + (S.sel === p.id ? ' on' : '') + '" data-id="' + p.id + '"' + (gone ? ' disabled' : '') + ' aria-pressed="' + (S.sel === p.id) + '">' + (p.icon || '') + '<span>' + esc(p.name) + '</span></button></li>';
        }).join('') + '</ul>' +
        '<div class="su-row"><button class="btn small" data-a="hint" type="button">Hint</button><button class="btn small" data-a="auto" type="button">Place one for me</button>' +
        '<span class="su-sp" style="flex:1"></span><button class="btn small" data-a="mode" type="button" aria-pressed="' + S.challenge + '">Challenge mode</button><button class="btn small" data-a="again" type="button">Start over</button><button class="btn small" data-a="close" type="button">Close</button></div>';
      tick();
    }
    function tick() {
      if (!S) return; var s = panel.querySelector('[data-s]'); if (!s) return;
      var all = P(), n = all.filter(function (p) { return S.placed[p.id] != null; }).length, B = best();
      s.textContent = n + '/' + all.length + ' · ' + clock(S.t0 ? performance.now() - S.t0 : 0) + (S.miss ? ' · mistakes ' + S.miss : '') + (S.challenge && B ? ' · best ' + clock(B.t) : '');
    }
    function say(cls, html) { S.fb = { cls: cls, html: html }; }

    /* ---------- placing ---------- */
    function start() { if (!S.t0) S.t0 = performance.now(); }
    function put(p, how) {
      S.placed[p.id] = performance.now(); fx.push({ b: p.spot, ok: true, t0: performance.now() });
      say('ok', '<b>' + esc(p.name) + (how ? ' (placed for you)' : '') + '.</b> <span>' + p.why + '</span>');
      if (P().every(function (q) { return S.placed[q.id] != null; })) { S.done = true; S.t1 = performance.now(); clearInterval(S.timer); if (o.onDone) o.onDone(); }
      changed();
    }
    function tryAt(id, x, y) {
      var p = find(id); if (!p) return; start(); S.sel = null;
      var isPart = P().some(function (q) { return q.id === id; }), pad = Math.max(10, Math.min(18, stage.getBoundingClientRect().width / 40));
      if (!isPart) { S.out[id] = 1; S.miss++; fx.push({ x: x, y: y, ok: false, t0: performance.now() }); say('bad', '<b>' + esc(p.name) + ': not needed here.</b> <span>' + p.why + '</span>'); changed(); return; }
      if (p.spot && inBox(p.spot, x, y, pad)) {
        if (!ready(p)) { var need = (p.needs || []).filter(function (n) { return S.placed[n] == null && find(n); }).map(function (n) { return find(n).name; });
          S.miss++; fx.push({ b: p.spot, ok: false, t0: performance.now() }); say('bad', '<b>Not yet: ' + esc(need.map(lc).join(' and ')) + ' first.</b> <span>' + (p.early || '') + '</span>'); changed(); return; }
        put(p); return;
      }
      var other = P().filter(function (q) { return q.id !== id && S.placed[q.id] == null && q.spot && inBox(q.spot, x, y, 0); })[0];
      if (other) { S.miss++; fx.push({ b: other.spot, ok: false, t0: performance.now() }); say('bad', '<b>That is not where the ' + esc(lc(p.name)) + ' goes.</b> <span>' + (p.hint || '') + '</span>'); }
      else { fx.push({ x: x, y: y, ok: false, t0: performance.now() }); say('info', '<b>Not there.</b> ' + (p.hint || 'Look for its outline on the bench.')); }
      changed();
    }
    function changed() { render(); redraw(); if (o.onChange) o.onChange(); }

    /* tray: drag, or tap then tap the bench */
    var drag = null;
    panel.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      var b = e.target.closest('.su-it'); if (!b || b.disabled || !S) return;
      e.preventDefault(); document.documentElement.classList.add('su-noselect'); drag = { id: b.dataset.id, x0: e.clientX, y0: e.clientY, b: b, fly: null, pid: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch (er) {}
    });
    panel.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.pid) return;
      if (!drag.fly && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) { drag.fly = drag.b.cloneNode(true); drag.fly.classList.add('su-fly'); document.body.appendChild(drag.fly); start(); }
      if (drag.fly) { drag.fly.style.left = e.clientX + 'px'; drag.fly.style.top = e.clientY + 'px'; }
    });
    function endDrag(e, cancel) {
      if (!drag || e.pointerId !== drag.pid) return; var d = drag; drag = null; document.documentElement.classList.remove('su-noselect');
      if (d.fly) { d.fly.remove(); if (cancel) return; var r = stage.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) tryAt(d.id, e.clientX - r.left, e.clientY - r.top);
        else { S.sel = null; say('info', 'Drop it on the bench drawing.'); render(); }
      } else if (!cancel) { S.sel = S.sel === d.id ? null : d.id; var p = find(d.id); if (S.sel) say('info', '<b>' + esc(p.name) + '</b> picked up. Now tap where it goes on the bench.'); else S.fb = null; render(); catcher.classList.toggle('sel', !!S.sel); }
    }
    panel.addEventListener('pointerup', function (e) { endDrag(e, false); });
    panel.addEventListener('pointercancel', function (e) { endDrag(e, true); });
    panel.addEventListener('keydown', function (e) {   // keyboard: Enter picks up, then Enter on "Hint"/"Place…" or click the bench
      var b = e.target.closest('.su-it'); if (!b || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault();
      S.sel = S.sel === b.dataset.id ? null : b.dataset.id; var p = find(b.dataset.id); say('info', S.sel ? '<b>' + esc(p.name) + '</b> picked up. Click its place on the bench.' : ''); if (!S.sel) S.fb = null; render(); catcher.classList.toggle('sel', !!S.sel);
      var nb = panel.querySelector('.su-it[data-id="' + b.dataset.id + '"]'); if (nb) nb.focus();
    });
    catcher.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); if (!S || S.done) return; var r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (S.sel) { tryAt(S.sel, x, y); catcher.classList.remove('sel'); }
      else { say('info', 'First pick a piece from the tray below the bench.'); render(); }
    });
    panel.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]'); if (!a || !S) return; a = a.dataset.a;
      if (a === 'hint') { var p = nextPart(); if (!p) return; start(); S.hint = p.id; S.hintUntil = performance.now() + 2600; say('info', '<b>Next: the ' + esc(lc(p.name)) + '.</b> ' + (p.hint || '')); render(); var it = panel.querySelector('.su-it[data-id="' + p.id + '"]'); if (it) it.classList.add('pulse'); redraw(); }
      else if (a === 'auto') { var q = nextPart(); if (q) { start(); S.helped++; put(q, true); } }
      else if (a === 'mode') { var c = !S.challenge; reset(c); say('info', c ? 'Challenge mode: no outlines, and your best time is saved on this device.' : 'Outlines are back.'); render(); }
      else if (a === 'again') reset(S.challenge);
      else if (a === 'chal') reset(true);
      else if (a === 'go' || a === 'close') close();
    });

    function reset(ch) { clearInterval(S && S.timer); S = { placed: {}, out: {}, sel: null, miss: 0, helped: 0, t0: 0, t1: 0, done: false, challenge: !!ch, hint: null, hintUntil: 0, fb: null }; S.timer = setInterval(tick, 1000); catcher.classList.remove('sel'); changed(); }
    function open() { if (S) return; btn.setAttribute('aria-pressed', 'true'); panel.hidden = false; catcher.hidden = false; layer.hidden = false; if (o.onOpen) o.onOpen(); layout(); reset(false);
      var top = (panel.classList.contains('su-top') ? panel : wrap).getBoundingClientRect().top; if (top < 0 || top > innerHeight * .5) window.scrollBy({ top: top - 10, behavior: 'smooth' }); }
    function close() { if (!S) return; clearInterval(S.timer); S = null; fx = []; btn.setAttribute('aria-pressed', 'false'); panel.hidden = true; catcher.hidden = true; layer.hidden = true; if (o.onClose) o.onClose(); if (o.onChange) o.onChange(); }
    btn.onclick = function () { S ? close() : open(); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S && !panel.contains(document.activeElement)) close(); });
    if (window.ResizeObserver) new ResizeObserver(function () { layout(); redraw(); }).observe(stage);

    return {
      open: open, close: close, refresh: redraw, button: btn,
      get active() { return !!S; },
      has: function (id) { return !S || S.placed[id] != null; },
      age: function (id) { return !S ? Infinity : S.placed[id] == null ? -1 : performance.now() - S.placed[id]; }
    };
  }
  window.BenchSetup = { attach: attach };
})();
