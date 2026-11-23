/* ex-link.js — "Share this exercise": a link (and QR code) that opens the Exercise screen with the same numbers filled in.
   Works on any lab whose exercise has a #exSolve (or #mySolve) button. The numbers travel in the link (?ex=…), nothing is stored on a server. */
(function () {
  'use strict';
  var SOLVE = '#exSolve, #mySolve';
  function solveBtn() { return document.querySelector(SOLVE); }
  function box() { var b = solveBtn(); return b ? (b.closest('section, .screen, [id^="p-"]') || b.parentElement) : null; }
  function fields(c) { return Array.prototype.filter.call(c.querySelectorAll('input, select, textarea'), function (e) { return e.type !== 'button' && e.type !== 'submit' && e.type !== 'file' && !e.closest('.lp-panel'); }); }
  function toggles(c) { return Array.prototype.slice.call(c.querySelectorAll('[aria-pressed], [role="tab"][aria-selected], [role="radio"][aria-checked]')); }
  function on(t) { return t.getAttribute('aria-pressed') === 'true' || t.getAttribute('aria-selected') === 'true' || t.getAttribute('aria-checked') === 'true'; }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }

  /* what the student has typed: toggles that are on, then each field by id (or by its place in the exercise) */
  function grab() {
    var c = box(); if (!c) return null;
    var T = toggles(c), t = []; T.forEach(function (x, i) { if (on(x)) t.push(i); });
    var v = []; fields(c).forEach(function (e, i) { var k = e.id ? e.id : '@' + i, val = e.type === 'checkbox' || e.type === 'radio' ? (e.checked ? 1 : 0) : e.value; v.push([k, val]); });
    return { t: t, v: v };
  }
  function link() { var d = grab(); if (!d) return location.href; return location.origin + location.pathname + '?ex=' + b64(JSON.stringify(d)) + '#ex'; }

  function setAll(c, v) {
    var F = fields(c);
    v.forEach(function (kv) { var k = kv[0], val = kv[1], e = k.charAt(0) === '@' ? F[+k.slice(1)] : document.getElementById(k); if (!e || !c.contains(e)) return;
      if (e.type === 'checkbox' || e.type === 'radio') { if (!!val !== e.checked) { e.checked = !!val; e.dispatchEvent(new Event('change', { bubbles: true })); } return; }
      if (e.value === String(val)) return; e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
  }
  function restore(d) {
    var c = box(); if (!c) return;
    var T = toggles(c); (d.t || []).forEach(function (i) { var x = T[i]; if (x && !on(x)) x.click(); });
    setTimeout(function () { setAll(c, d.v || []); setTimeout(function () { setAll(box() || c, d.v || []); note(); }, 350); }, 150);   // twice: some fields only appear after an earlier one is filled
  }

  var CSS = '.xl-btn{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.xl-btn svg{width:16px;height:16px;flex:none}' +
    '.xl-pop{position:fixed;inset:0;z-index:2147483000;background:rgba(10,20,25,.45);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.xl-card{background:var(--stage,#fff);color:var(--ink,#123);border:1.5px solid var(--line,#C6D2D1);border-radius:16px;padding:18px;max-width:420px;width:100%;box-shadow:0 20px 50px -15px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:12px}' +
    '.xl-card h3{margin:0;font-size:1.1rem}.xl-card p{margin:0;font-size:.92rem;opacity:.85}.xl-qr{align-self:center;background:#fff;padding:8px;border-radius:10px;width:200px;height:200px}.xl-qr svg{width:100%;height:100%;display:block}' +
    '.xl-url{width:100%;font:500 .8rem/1.3 "IBM Plex Mono",monospace;padding:8px;border:1.5px solid var(--line,#C6D2D1);border-radius:8px;background:var(--sunk,#F3F6F6);color:inherit;resize:none}' +
    '.xl-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.xl-row button{width:auto}' +
    '.xl-note{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:2147482000;background:var(--ink,#123);color:var(--stage,#fff);border-radius:12px;padding:10px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);max-width:calc(100% - 24px);font-size:.95rem}' +
    '.xl-note span{flex:1 1 12rem}.xl-note button{width:auto;flex:none}@media (max-width:520px){.xl-note{flex-wrap:wrap;bottom:76px;width:calc(100% - 24px)}}';
  function css() { if (document.getElementById('xl-css')) return; var s = document.createElement('style'); s.id = 'xl-css'; s.textContent = CSS; document.head.appendChild(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function copy(text, ta) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return old(); });
    return Promise.resolve(old());
    function old() { try { ta.focus(); ta.select(); return document.execCommand('copy'); } catch (e) { return false; } }
  }
  function withQR(cb) { if (window.QR) return cb(); var s = document.createElement('script'); s.src = 'qr.js'; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }

  function openPop() {
    css(); var url = link(), last = document.activeElement;
    var pop = document.createElement('div'); pop.className = 'xl-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-label', 'Share this exercise');
    pop.innerHTML = '<div class="xl-card"><h3>Share this exercise</h3><p>The link opens this lab with the same numbers filled in. Paste it in Classera or WhatsApp, or let students scan the code.</p>' +
      '<div class="xl-qr" aria-hidden="true"></div><textarea class="xl-url" rows="3" readonly aria-label="Link to this exercise">' + esc(url) + '</textarea>' +
      '<div class="xl-row">' + (navigator.share ? '<button type="button" class="btn" data-share>Share…</button>' : '') + '<button type="button" class="btn primary" data-copy>Copy link</button><button type="button" class="btn" data-close>Close</button></div></div>';
    document.body.appendChild(pop);
    var ta = pop.querySelector('textarea'), bc = pop.querySelector('[data-copy]');
    withQR(function () { var q = pop.querySelector('.xl-qr'); if (window.QR && q) { try { q.innerHTML = QR.svg(url, { ecc: 'L', border: 1, dark: '#111' }); } catch (e) { q.remove(); } } else if (q) q.remove(); });
    function close() { pop.remove(); document.removeEventListener('keydown', key); if (last && last.focus) last.focus(); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    pop.addEventListener('click', function (e) { if (e.target === pop) close(); });
    pop.querySelector('[data-close]').onclick = close;
    bc.onclick = function () { copy(url, ta).then(function (ok) { bc.textContent = ok ? 'Copied ✓' : 'Select and copy'; if (!ok) { ta.focus(); ta.select(); } setTimeout(function () { bc.textContent = 'Copy link'; }, 2000); }); };
    var bs = pop.querySelector('[data-share]'); if (bs) bs.onclick = function () { navigator.share({ title: document.title, text: 'Try this exercise in the lab', url: url }).catch(function () { }); };
    bc.focus();
  }

  function note() {
    css(); var off = document.querySelector('.tour-offer'); if (off) off.style.display = 'none';   // the tour can wait: the student came for this exercise
    var n = document.createElement('div'); n.className = 'xl-note'; n.setAttribute('role', 'status');
    n.innerHTML = '<span>Exercise opened from a link: the numbers are filled in.</span><button type="button" class="btn small primary">Solve it in the lab</button><button type="button" class="btn small" aria-label="Dismiss">✕</button>';
    document.body.appendChild(n);
    var bs = n.querySelectorAll('button'); bs[0].onclick = function () { n.remove(); var s = solveBtn(); if (s) s.click(); }; bs[1].onclick = function () { n.remove(); };
    setTimeout(function () { if (n.parentNode) n.remove(); }, 20000);
  }

  function addButton() {
    var s = solveBtn(); if (!s || document.querySelector('.xl-btn')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn xl-btn' + (s.classList.contains('small') ? ' small' : '');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>Share this exercise';
    b.onclick = openPop; css();
    s.parentNode.insertBefore(b, s.nextSibling);
    var row = s.parentNode; if (getComputedStyle(row).display.indexOf('flex') >= 0) { row.style.flexWrap = 'wrap'; if (!row.style.gap && getComputedStyle(row).gap === 'normal') row.style.gap = '8px'; }
    var up = row.parentNode; if (up && getComputedStyle(up).display.indexOf('flex') >= 0) { up.style.flexWrap = 'wrap'; row.style.minWidth = '0'; row.style.maxWidth = '100%'; row.style.flexShrink = '1'; }
  }

  function start() {
    addButton();
    var m = /[?&]ex=([^&#]+)/.exec(location.search); if (!m) return;
    var d; try { d = JSON.parse(unb64(m[1])); } catch (e) { return; }
    var tries = 0; (function wait() { if (box() && box().getClientRects().length) restore(d); else if (tries++ < 20) setTimeout(wait, 250); })();
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { }   // keep the address short after loading
  }
  window.ExLink = { link: link, grab: grab, restore: restore, open: openPop };
  if (document.readyState === 'complete') setTimeout(start, 400); else window.addEventListener('load', function () { setTimeout(start, 400); });
})();
