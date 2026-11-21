/* Guided tour: dims the page, lights up one thing at a time and explains it in a short card.
   Tour.start(steps, opts)  steps: [{ el: selector | element | function, title, text }]
                            opts:  { key: 'name' (remembered as seen), onEnd: fn }
   Tour.offer(opts)         a small "New here?" card next to opts.near, shown once per key.
   Steps whose target is missing or hidden are skipped. Esc ends the tour, ← and → move through it.
   Uses the page's colour variables (--surface, --ink, --muted, --line, --accent), so it follows light and dark. */
(function () {
  'use strict';
  if (window.Tour) return;
  var doc = document, root = doc.documentElement;
  var CSS =
    '.tour-block{position:fixed;inset:0;z-index:1000;background:transparent}' +
    '.tour-hole{position:fixed;z-index:1001;border-radius:12px;pointer-events:none;box-shadow:0 0 0 3px var(--accent,#0A6A88),0 0 0 200vmax rgba(8,16,20,.58);transition:left .32s cubic-bezier(.2,.7,.2,1),top .32s cubic-bezier(.2,.7,.2,1),width .32s cubic-bezier(.2,.7,.2,1),height .32s cubic-bezier(.2,.7,.2,1)}' +
    '.tour-tip{position:fixed;z-index:1002;width:min(340px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#13232B);border:1px solid var(--line,#D9DCE1);border-radius:14px;padding:14px 16px 12px;box-shadow:0 14px 40px rgba(0,0,0,.28);font:15px/1.45 var(--body,"Atkinson Hyperlegible",system-ui,sans-serif);transition:left .32s cubic-bezier(.2,.7,.2,1),top .32s cubic-bezier(.2,.7,.2,1)}' +
    '.tour-tip .t-n{font:600 12px/1 var(--data,"IBM Plex Mono",monospace);color:var(--muted,#55666E);letter-spacing:.06em}' +
    '.tour-tip h3{margin:6px 0 4px;font:800 18px/1.2 var(--display,"Bricolage Grotesque",system-ui,sans-serif);letter-spacing:-.01em}' +
    '.tour-tip p{margin:0;color:var(--ink,#13232B)}' +
    '.tour-tip .t-dots{display:flex;gap:5px;margin:12px 0 0}.tour-tip .t-dots i{width:7px;height:7px;border-radius:50%;background:var(--line,#D9DCE1)}.tour-tip .t-dots i.on{background:var(--accent,#0A6A88);width:18px;border-radius:4px}' +
    '.tour-tip .t-row{display:flex;align-items:center;gap:8px;margin-top:12px}.tour-tip .t-row .sp{flex:1}' +
    '.tour-tip button{font:700 14px/1 var(--body,system-ui,sans-serif);border-radius:9px;min-height:38px;padding:0 14px;cursor:pointer;border:1px solid var(--line,#D9DCE1);background:transparent;color:var(--ink,#13232B)}' +
    '.tour-tip button.t-next{background:var(--accent,#0A6A88);border-color:var(--accent,#0A6A88);color:var(--on-accent,#fff)}' +
    '.tour-tip button.t-skip{border:0;color:var(--muted,#55666E);padding:0 6px}.tour-tip button:focus-visible{outline:3px solid var(--focus,#E2632B);outline-offset:2px}' +
    '.tour-tip .t-arrow{position:absolute;width:14px;height:14px;background:inherit;border:inherit;transform:rotate(45deg)}' +
    '.tour-tip[data-place="below"] .t-arrow{top:-8px;border-right:0;border-bottom:0}.tour-tip[data-place="above"] .t-arrow{bottom:-8px;border-left:0;border-top:0}' +
    '.tour-tip[data-place="right"] .t-arrow{left:-8px;border-top:0;border-right:0}.tour-tip[data-place="left"] .t-arrow{right:-8px;border-bottom:0;border-left:0}.tour-tip[data-place="sheet"] .t-arrow{display:none}' +
    '.tour-offer{position:fixed;z-index:990;width:min(300px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#13232B);border:1px solid var(--line,#D9DCE1);border-radius:14px;padding:12px 14px;box-shadow:0 12px 32px rgba(0,0,0,.22);font:14.5px/1.4 var(--body,system-ui,sans-serif);animation:tourIn .35s cubic-bezier(.2,.7,.2,1) both}' +
    '.tour-offer b{display:block;font:800 16px/1.2 var(--display,system-ui,sans-serif);margin-bottom:2px}.tour-offer .t-row{display:flex;gap:8px;margin-top:10px}' +
    '.tour-offer button{font:700 14px/1 var(--body,system-ui,sans-serif);border-radius:9px;min-height:36px;padding:0 13px;cursor:pointer;border:1px solid var(--line,#D9DCE1);background:transparent;color:var(--ink,#13232B)}.tour-offer button.go{background:var(--accent,#0A6A88);border-color:var(--accent,#0A6A88);color:var(--on-accent,#fff)}' +
    '.tour-beacon{position:fixed;z-index:991;width:14px;height:14px;border-radius:50%;background:var(--reset,#E2632B);pointer-events:none}.tour-beacon::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:3px solid var(--reset,#E2632B);animation:tourPulse 1.6s ease-out infinite}' +
    '@keyframes tourPulse{from{transform:scale(.6);opacity:1}to{transform:scale(1.8);opacity:0}}@keyframes tourIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion: reduce){.tour-hole,.tour-tip{transition:none}.tour-offer{animation:none}.tour-beacon::after{animation:none}}' +
    '@media print{.tour-block,.tour-hole,.tour-tip,.tour-offer,.tour-beacon{display:none}}';
  function css() { if (doc.getElementById('tour-css')) return; var s = doc.createElement('style'); s.id = 'tour-css'; s.textContent = CSS; doc.head.appendChild(s); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function find(el) {
    var e = typeof el === 'function' ? el() : typeof el === 'string' ? doc.querySelector(el) : el;
    if (!e) return null; var r = e.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null; if (e.closest('[hidden]')) return null;
    var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null;
    return e;
  }
  function seen(key) { try { return !!localStorage.getItem('tour:' + key); } catch (e) { return true; } }
  function mark(key) { try { localStorage.setItem('tour:' + key, '1'); } catch (e) { } }
  var cur = null;

  function start(steps, opts) {
    opts = opts || {}; css(); end(true); dismissOffer();
    var list = steps.filter(function (s) { return find(s.el); });
    if (!list.length) return;
    var block = doc.createElement('div'); block.className = 'tour-block';
    var hole = doc.createElement('div'); hole.className = 'tour-hole';
    var tip = doc.createElement('div'); tip.className = 'tour-tip'; tip.setAttribute('role', 'dialog'); tip.setAttribute('aria-modal', 'true'); tip.setAttribute('aria-live', 'polite');
    doc.body.appendChild(block); doc.body.appendChild(hole); doc.body.appendChild(tip);
    var i = 0, raf = 0, back = doc.activeElement;
    cur = { end: function (quiet) { finish(quiet); } };
    function draw() {
      var s = list[i], e = find(s.el);
      if (!e) { if (i < list.length - 1) { i++; draw(); } else finish(); return; }
      tip.setAttribute('aria-label', 'Tour, step ' + (i + 1) + ' of ' + list.length + ': ' + (s.title || ''));
      tip.innerHTML = '<span class="t-arrow"></span><span class="t-n">' + (i + 1) + ' / ' + list.length + '</span>' + (s.title ? '<h3>' + esc(s.title) + '</h3>' : '') + '<p>' + esc(s.text) + '</p>' +
        '<div class="t-dots" aria-hidden="true">' + list.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' +
        '<div class="t-row"><button type="button" class="t-skip">' + (i === list.length - 1 ? '' : 'Skip tour') + '</button><span class="sp"></span>' +
        (i ? '<button type="button" class="t-back">Back</button>' : '') + '<button type="button" class="t-next">' + (i === list.length - 1 ? 'Done' : 'Next') + '</button></div>';
      var sk = tip.querySelector('.t-skip'); if (!sk.textContent) sk.style.visibility = 'hidden'; sk.onclick = function () { finish(); };
      var bk = tip.querySelector('.t-back'); if (bk) bk.onclick = function () { go(-1); };
      tip.querySelector('.t-next').onclick = function () { go(1); };
      var r0 = e.getBoundingClientRect(); if (r0.top < 0 || r0.bottom > innerHeight) e.scrollIntoView({ block: 'center', behavior: 'auto' });
      place(); tip.querySelector('.t-next').focus({ preventScroll: true });
    }
    function place() {
      var e = find(list[i].el); if (!e) return; var r = e.getBoundingClientRect(), pad = 6, W = innerWidth, H = innerHeight;
      hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px'; hole.style.width = (r.width + 2 * pad) + 'px'; hole.style.height = (r.height + 2 * pad) + 'px';
      var tw = tip.offsetWidth, th = tip.offsetHeight, gap = 16, x, y, pl;
      if (W < 560) { pl = 'sheet'; x = (W - tw) / 2; y = r.bottom + gap + th < H - 8 ? r.bottom + gap : r.top - gap - th > 8 ? r.top - gap - th : H - th - 12; }
      else if (r.bottom + gap + th < H - 8) { pl = 'below'; y = r.bottom + gap; x = r.left + r.width / 2 - tw / 2; }
      else if (r.top - gap - th > 8) { pl = 'above'; y = r.top - gap - th; x = r.left + r.width / 2 - tw / 2; }
      else if (r.right + gap + tw < W - 8) { pl = 'right'; x = r.right + gap; y = r.top + r.height / 2 - th / 2; }
      else if (r.left - gap - tw > 8) { pl = 'left'; x = r.left - gap - tw; y = r.top + r.height / 2 - th / 2; }
      else { pl = 'sheet'; x = (W - tw) / 2; y = H - th - 16; }
      x = Math.max(12, Math.min(W - tw - 12, x)); y = Math.max(12, Math.min(H - th - 12, y));
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.dataset.place = pl;
      var a = tip.querySelector('.t-arrow');
      if (pl === 'below' || pl === 'above') { a.style.left = Math.max(14, Math.min(tw - 28, r.left + r.width / 2 - x - 7)) + 'px'; a.style.top = ''; }
      else if (pl === 'left' || pl === 'right') { a.style.top = Math.max(14, Math.min(th - 28, r.top + r.height / 2 - y - 7)) + 'px'; a.style.left = ''; }
    }
    function go(d) { var n = i + d; if (n < 0) return; if (n >= list.length) { finish(); return; } i = n; draw(); }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); finish(); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Tab') { var f = tip.querySelectorAll('button'), vis = Array.prototype.filter.call(f, function (b) { return b.style.visibility !== 'hidden'; }); if (!vis.length) return; var a = vis[0], z = vis[vis.length - 1]; if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } } }
    function onMove() { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); }
    function finish(quiet) {
      if (!block.parentNode) return; block.remove(); hole.remove(); tip.remove(); cur = null;
      doc.removeEventListener('keydown', onKey, true); removeEventListener('resize', onMove); removeEventListener('scroll', onMove, true);
      if (opts.key) mark(opts.key); if (back && back.focus) try { back.focus({ preventScroll: true }); } catch (e) { }
      if (!quiet && typeof opts.onEnd === 'function') opts.onEnd();
    }
    doc.addEventListener('keydown', onKey, true); addEventListener('resize', onMove); addEventListener('scroll', onMove, true);
    draw();
  }
  function end(quiet) { if (cur) cur.end(quiet); }

  /* a small card that offers the tour once: next to opts.near (an element), with a pulsing dot on it */
  var offerEl = null, beaconEl = null;
  function dismissOffer() { if (offerEl) { offerEl.remove(); offerEl = null; } if (beaconEl) { beaconEl.remove(); beaconEl = null; } }
  function offer(opts) {
    if (!opts || seen(opts.key)) return; css(); dismissOffer();
    var near = typeof opts.near === 'string' ? doc.querySelector(opts.near) : opts.near; if (!near) return;
    offerEl = doc.createElement('div'); offerEl.className = 'tour-offer'; offerEl.setAttribute('role', 'dialog'); offerEl.setAttribute('aria-label', 'Take the tour?');
    offerEl.innerHTML = '<b>' + esc(opts.title || 'New here?') + '</b>' + esc(opts.text || 'Take a 30-second tour of the buttons.') + '<div class="t-row"><button type="button" class="go">Show me</button><button type="button" class="no">No thanks</button></div>';
    beaconEl = doc.createElement('span'); beaconEl.className = 'tour-beacon'; beaconEl.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(offerEl); doc.body.appendChild(beaconEl);
    function pos() { if (!offerEl) return; var r = near.getBoundingClientRect(), W = innerWidth, w = offerEl.offsetWidth, h = offerEl.offsetHeight;
      beaconEl.style.left = (r.right - 9) + 'px'; beaconEl.style.top = (r.top - 5) + 'px';
      var y = r.bottom + 12; if (y + h > innerHeight - 8) y = r.top - h - 12;
      offerEl.style.left = Math.max(12, Math.min(W - w - 12, r.right - w)) + 'px'; offerEl.style.top = Math.max(12, y) + 'px'; }
    pos(); addEventListener('resize', pos);
    var mine = offerEl; setTimeout(function () { if (offerEl === mine) { removeEventListener('resize', pos); dismissOffer(); mark(opts.key); } }, opts.wait || 15000);   // it does not nag: gone after a few seconds, and not offered again
    offerEl.querySelector('.go').onclick = function () { removeEventListener('resize', pos); dismissOffer(); opts.start(); };
    offerEl.querySelector('.no').onclick = function () { removeEventListener('resize', pos); dismissOffer(); mark(opts.key); };
  }
  window.Tour = { start: start, end: end, offer: offer, seen: seen, dismissOffer: dismissOffer };
})();
