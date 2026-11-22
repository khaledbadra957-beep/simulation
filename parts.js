/* parts.js — numbered labels + a "Find the part" quiz on top of any lab drawing (canvas or SVG).
   Light on purpose: no libraries, no 3D, nothing runs while the labels and quiz are closed.
   Idea from the Robotics Lab "Labels / Find the part" screens, rebuilt in plain 2D.

   const api = LabParts.attach({
     key: 'titration',              // best score is remembered on this device under this key
     wrap: el,                      // position:relative box that holds the drawing
     stage: canvasOrSvg,            // the drawing itself (clicks are caught above it during the quiz)
     bar: el,                       // where the two buttons go
     parts: () => [{ id, name, what, hint, q, x, y, boxes: [[x0,y0,x1,y1], …], show: true }],   // CSS px inside wrap
     max: 6                         // questions per round
   });
   api.refresh() re-reads the positions (call after the drawing changes size). */
(function () {
  'use strict';
  var CSS = '.lp-layer{position:absolute;inset:0;pointer-events:none;z-index:3}' +
    '.lp-m{position:absolute;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;border:2px solid var(--ink,#13232B);background:var(--stage,#fff);color:var(--ink,#13232B);font:700 12px/20px system-ui,sans-serif;text-align:center;padding:0;cursor:pointer;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,.25)}' +
    '.lp-m:hover,.lp-m.on{background:var(--accent,#0A6A88);border-color:var(--accent,#0A6A88);color:var(--accent-ink,#fff)}' +
    '.lp-hi{position:absolute;border:3px solid var(--accent,#0A6A88);border-radius:8px;box-shadow:0 0 0 4px rgba(10,106,136,.18);pointer-events:none;transition:all .2s}' +
    '.lp-hi.ok{border-color:var(--ok,#1E8A55);box-shadow:0 0 0 4px rgba(30,138,85,.2)}.lp-hi.bad{border-color:var(--bad,#C0392B);box-shadow:0 0 0 4px rgba(192,57,43,.2)}' +
    '.lp-catch{position:absolute;inset:0;cursor:crosshair;pointer-events:auto;z-index:2}' +
    '.lp-panel{background:var(--stage,#fff);border:1.5px solid var(--line,#C6D2D1);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;margin-top:10px}' +
    '.lp-panel[hidden]{display:none}.lp-k{display:flex;justify-content:space-between;gap:8px;font:600 12px/1.3 ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#52646C)}' +
    '.lp-list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:2px 12px}' +
    '.lp-list button{display:flex;gap:8px;align-items:center;width:100%;text-align:left;border:0;background:none;padding:4px 2px;font:inherit;color:inherit;cursor:pointer;border-radius:6px}.lp-list button:hover,.lp-list button.on{background:var(--surface,#F8FAF9)}' +
    '.lp-list i{flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid currentColor;font:700 11px/17px system-ui;text-align:center;font-style:normal}' +
    '.lp-card h4{margin:0;font-size:1.05rem}.lp-card p{margin:2px 0 0}.lp-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.lp-row .sp{flex:1}' +
    '.lp-q{margin:0;font-size:1.08rem;font-weight:700}.lp-bars{display:flex;gap:4px}.lp-bars i{flex:1;height:4px;border-radius:2px;background:var(--line,#C6D2D1)}.lp-bars i.d{background:var(--ink,#13232B)}.lp-bars i.ok{background:var(--ok,#1E8A55)}.lp-bars i.no{background:var(--bad,#C0392B)}' +
    '.lp-fb{margin:0;padding:7px 10px;border-radius:9px;font-weight:700}.lp-fb.ok{color:var(--ok,#1E8A55);background:rgba(30,138,85,.1)}.lp-fb.bad{color:var(--bad,#C0392B);background:rgba(192,57,43,.1)}.lp-fb.info{background:var(--surface,#F8FAF9)}';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var ICON_L = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="vertical-align:-3px;margin-right:5px" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6.5h9.2l6.8 5.5-6.8 5.5H4z"/></svg>';
  var ICON_Q = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="vertical-align:-3px;margin-right:5px" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';

  function attach(o) {
    if (!document.getElementById('lp-css')) { var st = el('style'); st.id = 'lp-css'; st.textContent = CSS; document.head.appendChild(st); }
    var wrap = o.wrap, layer = el('div', 'lp-layer'), hi = el('div', 'lp-hi'), catcher = el('div', 'lp-catch'), panel = el('div', 'lp-panel');
    hi.hidden = true; catcher.hidden = true; panel.hidden = true; layer.appendChild(hi); wrap.appendChild(layer); wrap.appendChild(catcher); wrap.parentNode.insertBefore(panel, wrap.nextSibling);
    var bL = el('button', 'btn small', ICON_L + 'Labels'), bQ = el('button', 'btn small', ICON_Q + 'Find the part');
    [bL, bQ].forEach(function (b) { b.type = 'button'; b.setAttribute('aria-pressed', 'false'); o.bar.appendChild(b); });
    var mode = null, sel = -1, P = [], timer = 0, Q = null, marks = { ids: '', list: [] }, KEY = 'lp:' + (o.key || location.pathname);
    function best() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
    function list() { return (o.parts() || []).filter(function (p) { return p.show !== false; }); }
    function boxOf(p) { var b = p.boxes[0].slice(); p.boxes.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[2]); b[3] = Math.max(b[3], q[3]); }); return b; }
    function showHi(p, cls) { if (!p) { hi.hidden = true; return; } var b = boxOf(p), pad = 4; hi.hidden = false; hi.className = 'lp-hi' + (cls ? ' ' + cls : ''); hi.style.left = (b[0] - pad) + 'px'; hi.style.top = (b[1] - pad) + 'px'; hi.style.width = (b[2] - b[0] + 2 * pad) + 'px'; hi.style.height = (b[3] - b[1] + 2 * pad) + 'px'; }
    function place() {
      P = list(); var W = wrap.clientWidth, H = wrap.clientHeight, ids = mode === 'labels' ? P.map(function (p) { return p.id; }).join(',') : '';
      if (ids !== marks.ids) { marks.list.forEach(function (m) { m.remove(); }); marks = { ids: ids, list: [] };
        if (mode === 'labels') P.forEach(function (p, i) { var m = el('button', 'lp-m', String(i + 1)); m.type = 'button'; m.title = p.name; m.setAttribute('aria-label', (i + 1) + ': ' + p.name); m.onclick = function () { pick(i); }; layer.appendChild(m); marks.list.push(m); }); }
      marks.list.forEach(function (m, i) { var p = P[i]; m.classList.toggle('on', i === sel); m.style.left = Math.max(12, Math.min(W - 12, p.x)) + 'px'; m.style.top = Math.max(12, Math.min(H - 12, p.y)) + 'px'; });
      if (mode === 'labels') showHi(sel >= 0 ? P[sel] : null); else if (Q && Q.show) showHi(Q.show.p, Q.show.cls);
    }
    function loop() { clearInterval(timer); if (mode) timer = setInterval(place, 400); }
    /* ---------- labels ---------- */
    function renderLabels() {
      var h = '<div class="lp-k"><span>Labels · ' + P.length + ' parts</span><button class="btn small" type="button" data-x>Close</button></div>';
      if (sel >= 0) { var p = P[sel]; h += '<div class="lp-card"><h4>' + (sel + 1) + ' · ' + esc(p.name) + '</h4><p>' + p.what + '</p></div><div class="lp-row"><button class="btn small" type="button" data-pv>← Back</button><button class="btn small" type="button" data-nx>Next →</button><span class="sp"></span><button class="btn small" type="button" data-all>All parts</button></div>'; }
      else h += '<ol class="lp-list">' + P.map(function (p, i) { return '<li><button type="button" data-i="' + i + '"><i>' + (i + 1) + '</i>' + esc(p.name) + '</button></li>'; }).join('') + '</ol><p class="lp-k" style="text-transform:none;letter-spacing:0">Tap a number on the drawing or a name here.</p>';
      panel.innerHTML = h;
      panel.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
      var q = function (s) { return panel.querySelector(s); };
      if (q('[data-pv]')) q('[data-pv]').onclick = function () { pick((sel - 1 + P.length) % P.length); };
      if (q('[data-nx]')) q('[data-nx]').onclick = function () { pick((sel + 1) % P.length); };
      if (q('[data-all]')) q('[data-all]').onclick = function () { sel = -1; renderLabels(); place(); };
      q('[data-x]').onclick = close;
    }
    function pick(i) { sel = i; renderLabels(); place(); }
    /* ---------- quiz ---------- */
    function startQuiz() {
      P = list(); var qs = shuffle(P.slice()).slice(0, o.max || 6);
      Q = { qs: qs, i: 0, score: 0, res: [], tries: 0, hinted: false, done: false, show: null, fb: null }; renderQuiz();
    }
    function renderQuiz() {
      var n = Q.qs.length, h = '<div class="lp-k"><span>Find the part</span><span>' + (Q.done ? 'Done' : 'Question ' + (Q.i + 1) + ' of ' + n) + '</span></div><div class="lp-bars">' +
        Q.qs.map(function (_, k) { return '<i class="' + (Q.res[k] === true ? 'ok' : Q.res[k] === false ? 'no' : k === Q.i && !Q.done ? 'd' : '') + '"></i>'; }).join('') + '</div>';
      if (Q.done) { var b = best(), msg = Q.score === n ? 'Flawless — you know this equipment by sight.' : Q.score >= n - 2 ? 'Nice work. One more round and you’ll get them all.' : 'Open the labels, look again, then try another round.';
        h += '<p class="lp-q">Score: ' + Q.score + ' / ' + n + '</p><p style="margin:0">' + msg + (b ? ' Best on this device: ' + b.s + ' / ' + b.n + '.' : '') + '</p><div class="lp-row"><button class="btn small primary" type="button" data-again>Play again</button><button class="btn small" type="button" data-lab>Show the labels</button><span class="sp"></span><button class="btn small" type="button" data-x>Close</button></div>'; }
      else { var p = Q.qs[Q.i];
        h += '<p class="lp-q">' + esc(p.q || 'Find the ' + (/^[A-Z][a-z]/.test(p.name) ? p.name[0].toLowerCase() + p.name.slice(1) : p.name) + '.') + '</p>' + (Q.fb ? '<p class="lp-fb ' + Q.fb[0] + '">' + Q.fb[1] + '</p>' : '<p class="lp-k" style="text-transform:none;letter-spacing:0">Click it on the drawing.</p>') +
          '<div class="lp-row">' + (Q.show && Q.show.cls !== 'bad' ? '<button class="btn small primary" type="button" data-next>Next →</button>' : '<button class="btn small" type="button" data-hint>Hint</button><button class="btn small" type="button" data-skip>Skip</button>') + '<span class="sp"></span><span class="lp-k">Score ' + Q.score + '</span><button class="btn small" type="button" data-x>Close</button></div>'; }
      panel.innerHTML = h; var q = function (s) { return panel.querySelector(s); };
      if (q('[data-hint]')) q('[data-hint]').onclick = function () { Q.hinted = true; Q.fb = ['info', esc(Q.qs[Q.i].hint || 'Look at the labels: ' + Q.qs[Q.i].name + '.')]; renderQuiz(); };
      if (q('[data-skip]')) q('[data-skip]').onclick = function () { Q.res[Q.i] = false; Q.show = { p: Q.qs[Q.i], cls: '' }; Q.fb = ['bad', 'Answer: ' + esc(Q.qs[Q.i].name) + '. It is outlined on the drawing.']; renderQuiz(); place(); };
      if (q('[data-next]')) q('[data-next]').onclick = next;
      if (q('[data-again]')) q('[data-again]').onclick = startQuiz;
      if (q('[data-lab]')) q('[data-lab]').onclick = function () { open('labels'); };
      q('[data-x]').onclick = close;
    }
    function next() { Q.i++; Q.tries = 0; Q.hinted = false; Q.show = null; Q.fb = null; showHi(null);
      if (Q.i >= Q.qs.length) { Q.done = true; var b = best(); if (!b || Q.score / Q.qs.length > b.s / b.n) { try { localStorage.setItem(KEY, JSON.stringify({ s: Q.score, n: Q.qs.length })); } catch (e) { } } }
      renderQuiz(); }
    function hit(x, y) { var best_ = null, bd = 1e9; P.forEach(function (p) { p.boxes.forEach(function (b) { var pad = 6; if (x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad) { var a = (b[2] - b[0]) * (b[3] - b[1]); if (a < bd) { bd = a; best_ = p; } } }); }); return best_; }
    catcher.addEventListener('click', function (e) {
      if (mode !== 'quiz' || !Q || Q.done || (Q.show && Q.show.cls !== 'bad')) return; P = list();
      var r = wrap.getBoundingClientRect(), p = hit(e.clientX - r.left, e.clientY - r.top), want = Q.qs[Q.i];
      if (p && p.id === want.id) { var first = Q.tries === 0 && !Q.hinted; if (Q.res[Q.i] == null) Q.res[Q.i] = first; if (first) Q.score++; Q.show = { p: p, cls: 'ok' }; Q.fb = ['ok', 'Correct — ' + esc(p.name) + '. ' + p.what]; }
      else { Q.tries++; Q.show = p ? { p: p, cls: 'bad' } : null; Q.fb = ['bad', p ? 'Not quite — that is the ' + esc(/^[A-Z][a-z]/.test(p.name) ? p.name[0].toLowerCase() + p.name.slice(1) : p.name) + '. Try again.' : 'Not quite. Try again.']; }
      renderQuiz(); place();
    });
    /* ---------- open / close ---------- */
    function open(m) { mode = m; sel = -1; Q = m === 'quiz' ? Q : null; bL.setAttribute('aria-pressed', String(m === 'labels')); bQ.setAttribute('aria-pressed', String(m === 'quiz')); catcher.hidden = m !== 'quiz'; panel.hidden = false; showHi(null);
      P = list(); if (m === 'labels') renderLabels(); else startQuiz(); place(); loop(); }
    function close() { mode = null; Q = null; sel = -1; clearInterval(timer); panel.hidden = true; catcher.hidden = true; showHi(null); place(); bL.setAttribute('aria-pressed', 'false'); bQ.setAttribute('aria-pressed', 'false'); }
    bL.onclick = function () { mode === 'labels' ? close() : open('labels'); };
    bQ.onclick = function () { mode === 'quiz' ? close() : open('quiz'); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mode) close(); });
    return { refresh: place, close: close, open: open, parts: list, hit: function (x, y) { P = list(); var p = hit(x, y); return p && p.id; }, get mode() { return mode; } };
  }
  window.LabParts = { attach: attach };
})();
