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
    '.tour-block{position:fixed;z-index:1000;background:rgba(8,16,20,.58)}.tour-cover{background:transparent!important}' +
    '.tour-hole{position:fixed;z-index:1001;border-radius:12px;pointer-events:none;box-shadow:0 0 0 3px var(--accent,#0A6A88)}' +
    '.tour-tip{position:fixed;z-index:1002;width:min(340px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#13232B);border:1px solid var(--line,#D9DCE1);border-radius:14px;padding:14px 16px 12px;box-shadow:0 14px 40px rgba(0,0,0,.28);font:15px/1.45 var(--body,"Atkinson Hyperlegible",system-ui,sans-serif);transition:left .32s cubic-bezier(.2,.7,.2,1),top .32s cubic-bezier(.2,.7,.2,1)}' +
    '.tour-tip.live .t-body p:last-child{font-weight:700}.tour-tip .t-done{margin:8px 0 0;color:var(--ok,#1E8A55);font-weight:700}.tour-tip .t-calc{font:600 12.5px/1.55 var(--data,"IBM Plex Mono",monospace);background:var(--sunk,#EDEFF2);border-radius:8px;padding:8px 10px;margin:8px 0 0;white-space:pre-wrap}' +
    '.tour-tip button:disabled{opacity:.45;cursor:default}.tour-tip button.t-do{border-color:var(--accent,#0A6A88);color:var(--accent,#0A6A88)}.tour-tip .t-dots i.was{background:var(--accent,#0A6A88);opacity:.45}.tour-tip.mid,.tour-tip.live{width:min(400px,calc(100vw - 24px))}' +
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
    '.tour-tip[data-place="right"] .t-arrow{left:-8px;border-top:0;border-right:0}.tour-tip[data-place="left"] .t-arrow{right:-8px;border-bottom:0;border-left:0}.tour-tip[data-place="sheet"] .t-arrow,.tour-tip[data-place="bottom"] .t-arrow{display:none}' +
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

  /* step fields: el (optional: no el = a card in the middle), title, text (or html), onShow(), onLeave(),
     wait() → true when the student has done the step (the lit part can then be clicked), doIt() for "Do it for me",
     done: text shown once the step is done. */
  function start(steps, opts) {
    opts = opts || {}; css(); end(true); dismissOffer();
    var list = opts.lazy ? steps.slice() : steps.filter(function (s) { return !s.el || s.lazy || find(s.el); });   // lazy: the parts are looked up when their step comes (they may be on another screen now)
    if (!list.length) return;
    var shades = [0, 1, 2, 3].map(function () { var d = doc.createElement('div'); d.className = 'tour-block'; doc.body.appendChild(d); return d; });
    var cover = doc.createElement('div'); cover.className = 'tour-block tour-cover'; doc.body.appendChild(cover);
    var hole = doc.createElement('div'); hole.className = 'tour-hole';
    var tip = doc.createElement('div'); tip.className = 'tour-tip'; tip.setAttribute('role', 'dialog'); tip.setAttribute('aria-live', 'polite');
    doc.body.appendChild(hole); doc.body.appendChild(tip);
    var i = 0, raf = 0, poll = 0, adv = 0, back = doc.activeElement, isDone = false;
    cur = { end: function (quiet) { finish(quiet); }, next: function () { go(1); } };
    function stepEl(s) { return s.el ? find(s.el) : null; }
    function draw() {
      clearInterval(poll); clearTimeout(adv); isDone = false;
      var s = list[i]; if (typeof s.onShow === 'function') { try { s.onShow(); } catch (e) { } }
      var e = stepEl(s);
      if (s.el && !e && !s.lazy && !opts.lazy) { if (i < list.length - 1) { i++; draw(); } else finish(); return; }
      var last = i === list.length - 1, live = typeof s.wait === 'function';
      tip.setAttribute('aria-label', (opts.label || 'Tour') + ', step ' + (i + 1) + ' of ' + list.length + ': ' + (s.title || ''));
      tip.innerHTML = '<span class="t-arrow"></span><span class="t-n">' + esc(opts.label ? opts.label + ' · ' : '') + (i + 1) + ' / ' + list.length + '</span>' + (s.title ? '<h3>' + esc(s.title) + '</h3>' : '') +
        '<div class="t-body">' + (s.html || '<p>' + esc(s.text) + '</p>') + '</div>' + (live ? '<p class="t-done" hidden></p>' : '') +
        '<div class="t-dots" aria-hidden="true">' + list.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : k < i ? ' class="was"' : '') + '></i>'; }).join('') + '</div>' +
        '<div class="t-row"><button type="button" class="t-skip">' + (last ? '' : (opts.skipText || 'Skip tour')) + '</button><span class="sp"></span>' +
        (i ? '<button type="button" class="t-back">Back</button>' : '') + (live && s.doIt ? '<button type="button" class="t-do">' + esc(s.doLabel || 'Do it for me') + '</button>' : '') +
        '<button type="button" class="t-next">' + (last ? (opts.doneText || 'Done') : 'Next') + '</button></div>';
      var sk = tip.querySelector('.t-skip'); if (!sk.textContent) sk.style.visibility = 'hidden'; sk.onclick = function () { finish(); };
      var bk = tip.querySelector('.t-back'); if (bk) bk.onclick = function () { go(-1); };
      var nx = tip.querySelector('.t-next'); nx.onclick = function () { go(1); };
      var dob = tip.querySelector('.t-do'); if (dob) dob.onclick = function () { try { s.doIt(); } catch (er) { } check(); };
      tip.classList.toggle('live', live); tip.classList.toggle('mid', !s.el);
      if (live) { nx.disabled = true; poll = setInterval(check, 200); check(); }
      if (e) { var r0 = e.getBoundingClientRect(), nb = document.querySelector('.lg-nav'), lim = nb && nb.getClientRects().length ? nb.getBoundingClientRect().top : innerHeight;
        if (r0.top < 0 || r0.bottom > lim) { e.scrollIntoView({ block: 'center', behavior: 'auto' }); var r1 = e.getBoundingClientRect(); if (r1.bottom > lim - 8 && r1.top > 8) window.scrollBy(0, Math.min(r1.bottom - lim + 16, r1.top - 8)); } }
      place(); setTimeout(place, 60);
      var f = tip.querySelector(live && dob ? '.t-do' : '.t-next'); if (f && !f.disabled) f.focus({ preventScroll: true });
    }
    function check() {
      var s = list[i]; if (!s || typeof s.wait !== 'function' || isDone) return; var ok = false; try { ok = !!s.wait(); } catch (e) { }
      if (!ok) return; isDone = true; clearInterval(poll);
      var nx = tip.querySelector('.t-next'), dn = tip.querySelector('.t-done'), dob = tip.querySelector('.t-do');
      if (dob) dob.remove(); nx.disabled = false; nx.focus({ preventScroll: true });
      var msg = typeof s.done === 'function' ? s.done() : s.done; if (dn) { dn.hidden = false; dn.textContent = '✓ ' + (msg || 'Done.'); }
      tip.classList.add('ok'); place();
      if (s.auto) adv = setTimeout(function () { if (list[i] === s) go(1); }, s.auto === true ? 1400 : s.auto);
    }
    function place() {
      var s = list[i]; if (!s) return; var e = stepEl(s), W = innerWidth, H = innerHeight, tw = tip.offsetWidth, th = tip.offsetHeight, gap = 16, x, y, pl;
      var r = e ? e.getBoundingClientRect() : null, pad = 6;
      if (r) { var L = r.left - pad, T = r.top - pad, R = r.right + pad, B = r.bottom + pad;
        hole.style.display = ''; hole.style.left = L + 'px'; hole.style.top = T + 'px'; hole.style.width = (R - L) + 'px'; hole.style.height = (B - T) + 'px';
        // four shades around the lit part block clicks elsewhere; the lit part itself is clickable when the step waits for the student
        var set = function (d, l, t, w, h) { d.style.inset = 'auto'; d.style.left = l + 'px'; d.style.top = t + 'px'; d.style.width = Math.max(0, w) + 'px'; d.style.height = Math.max(0, h) + 'px'; };
        set(shades[0], 0, 0, W, T); set(shades[1], 0, B, W, H - B); set(shades[2], 0, T, L, B - T); set(shades[3], R, T, W - R, B - T);
        cover.style.display = typeof s.wait === 'function' || s.interactive ? 'none' : ''; set(cover, L, T, R - L, B - T);
      } else { hole.style.display = 'none'; shades.forEach(function (d, k) { d.style.inset = 'auto'; d.style.left = '0'; d.style.top = '0'; d.style.width = k ? '0' : '100vw'; d.style.height = k ? '0' : '100vh'; }); cover.style.display = 'none'; }
      var nav = s.at === 'bottom' && document.querySelector('.lg-nav'), nb = nav && nav.getClientRects().length ? nav.getBoundingClientRect().top : H, by = nb - th - 12;
      if (r && s.at === 'bottom' && W >= 560 && by > r.bottom + gap) { pl = 'bottom'; y = by; x = r.left + r.width / 2 - tw / 2;
        // s.avoid: things the card should not cover (e.g. the drawn molecules); try a few spots along the bottom and keep the clearest
        if (s.avoid) { var av = Array.prototype.map.call(document.querySelectorAll(s.avoid), function (q) { return q.getBoundingClientRect(); }), best = 1e18;
          for (var cx = 12; cx <= W - tw - 12; cx += 40) { var ov = 0; av.forEach(function (q) { ov += Math.max(0, Math.min(cx + tw, q.right) - Math.max(cx, q.left)) * Math.max(0, Math.min(by + th, q.bottom) - Math.max(by, q.top)); });
            ov += Math.abs(cx + tw / 2 - (r.left + r.width / 2)) * 0.01; if (ov < best) { best = ov; x = cx; } } } }
      else if (r && s.prefer === 'right' && W >= 560 && r.right + gap + tw < W - 8) { pl = 'right'; x = r.right + gap; y = r.top + r.height / 2 - th / 2; }
      else if (r && s.prefer === 'left' && W >= 560 && r.left - gap - tw > 8) { pl = 'left'; x = r.left - gap - tw; y = r.top + r.height / 2 - th / 2; }
      else if (!r) { pl = 'sheet'; x = (W - tw) / 2; y = (H - th) / 2; }
      else if (W < 560) { pl = 'sheet'; x = (W - tw) / 2; y = r.bottom + gap + th < H - 8 ? r.bottom + gap : r.top - gap - th > 8 ? r.top - gap - th : H - th - 12; }
      else if (r.bottom + gap + th < H - 8) { pl = 'below'; y = r.bottom + gap; x = r.left + r.width / 2 - tw / 2; }
      else if (r.top - gap - th > 8) { pl = 'above'; y = r.top - gap - th; x = r.left + r.width / 2 - tw / 2; }
      else if (r.left - gap - tw > 8) { pl = 'left'; x = r.left - gap - tw; y = r.top + r.height / 2 - th / 2; }
      else if (r.right + gap + tw < W - 8) { pl = 'right'; x = r.right + gap; y = r.top + r.height / 2 - th / 2; }
      else { pl = 'sheet'; x = (W - tw) / 2; y = H - th - 16; }
      x = Math.max(12, Math.min(W - tw - 12, x)); y = Math.max(12, Math.min(H - th - 12, y));
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.dataset.place = pl;
      var a = tip.querySelector('.t-arrow');
      if (r && (pl === 'below' || pl === 'above')) { a.style.left = Math.max(14, Math.min(tw - 28, r.left + r.width / 2 - x - 7)) + 'px'; a.style.top = ''; }
      else if (r && (pl === 'left' || pl === 'right')) { a.style.top = Math.max(14, Math.min(th - 28, r.top + r.height / 2 - y - 7)) + 'px'; a.style.left = ''; }
    }
    function go(d) { var s = list[i]; if (d > 0 && typeof s.wait === 'function' && !isDone) return; if (typeof s.onLeave === 'function') { try { s.onLeave(); } catch (e) { } }
      var n = i + d; if (n < 0) return; if (n >= list.length) { finish(); return; } i = n; draw(); }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); finish(); } else if (e.key === 'ArrowRight' && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft' && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) { e.preventDefault(); go(-1); } }
    function onMove() { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); }
    var ro = window.ResizeObserver ? new ResizeObserver(onMove) : null; if (ro) ro.observe(doc.body);
    function finish(quiet) {
      if (!hole.parentNode) return; clearInterval(poll); clearTimeout(adv); var s = list[i]; if (s && typeof s.onLeave === 'function') { try { s.onLeave(); } catch (e) { } }
      shades.forEach(function (d) { d.remove(); }); cover.remove(); hole.remove(); tip.remove(); cur = null; if (ro) ro.disconnect();
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
