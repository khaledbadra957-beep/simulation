/* lab-svg.js — realistic lab-bench parts for labs that draw with SVG strings.
   Every function returns an SVG string. Call LabSVG.defs() once inside each <svg>.
   bench, beaker, erlen, burner, tripod, hotplate, block, thermometer, cup, balance, shimmer */
(function () {
  'use strict';
  var uid = 0;
  var dark = function () { var t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); };
  var n = function (v) { return Math.round(v * 10) / 10; };
  function defs() {
    var dk = dark();
    return '<defs>' +
      '<linearGradient id="lsv-tint" x1="0" x2="1"><stop offset="0" stop-color="' + (dk ? '#9CC4DA' : '#B7D6E6') + '" stop-opacity="' + (dk ? .22 : .5) + '"/><stop offset=".18" stop-color="#E6F3F9" stop-opacity="' + (dk ? .05 : .12) + '"/><stop offset=".82" stop-color="#E6F3F9" stop-opacity="' + (dk ? .05 : .12) + '"/><stop offset="1" stop-color="' + (dk ? '#9CC4DA' : '#A9CCDF') + '" stop-opacity="' + (dk ? .26 : .55) + '"/></linearGradient>' +
      '<linearGradient id="lsv-hl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity="' + (dk ? .28 : .75) + '"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="lsv-liq" x1="0" x2="1"><stop offset="0" stop-color="#001018" stop-opacity=".2"/><stop offset=".22" stop-color="#001018" stop-opacity="0"/><stop offset=".78" stop-color="#001018" stop-opacity="0"/><stop offset="1" stop-color="#001018" stop-opacity=".24"/></linearGradient>' +
      '<linearGradient id="lsv-depth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#001020" stop-opacity=".16"/></linearGradient>' +
      '<linearGradient id="lsv-steelV" x1="0" x2="1"><stop offset="0" stop-color="#59636A"/><stop offset=".35" stop-color="#E8EDF0"/><stop offset=".55" stop-color="#B8C1C7"/><stop offset="1" stop-color="#4C555B"/></linearGradient>' +
      '<linearGradient id="lsv-steelH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59636A"/><stop offset=".35" stop-color="#E8EDF0"/><stop offset=".55" stop-color="#B8C1C7"/><stop offset="1" stop-color="#4C555B"/></linearGradient>' +
      '<linearGradient id="lsv-brass" x1="0" x2="1"><stop offset="0" stop-color="#8A6A22"/><stop offset=".45" stop-color="#F3D27A"/><stop offset="1" stop-color="#7A5A18"/></linearGradient>' +
      '<radialGradient id="lsv-shadow"><stop offset="0" stop-color="#000" stop-opacity="' + (dk ? .55 : .3) + '"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="lsv-flameO" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3D7BFF" stop-opacity=".95"/><stop offset=".45" stop-color="#6FA0FF" stop-opacity=".75"/><stop offset="1" stop-color="#B9D0FF" stop-opacity=".05"/></linearGradient>' +
      '<linearGradient id="lsv-flameI" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9FE3FF"/><stop offset="1" stop-color="#2E5BFF" stop-opacity=".6"/></linearGradient>' +
      '<radialGradient id="lsv-glow"><stop offset="0" stop-color="#FFB25A" stop-opacity=".7"/><stop offset="1" stop-color="#FF7A2A" stop-opacity="0"/></radialGradient>' +
      '<pattern id="lsv-foam" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#F7F8F4"/><circle cx="2" cy="2" r="1.6" fill="#E4E6DF"/><circle cx="5.5" cy="5" r="1.4" fill="#ECEEE8"/></pattern>' +
      '<pattern id="lsv-gauze" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="none"/><path d="M0 0L5 5M5 0L0 5" stroke="#6E777C" stroke-width=".7"/></pattern>' +
      '</defs>';
  }
  function bench(w, h, y) {
    var dk = dark(), id = 'lsvb' + (++uid);
    var s = '<defs><linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (dk ? '#15262D' : '#F6F9F8') + '"/><stop offset="1" stop-color="' + (dk ? '#0E1A1F' : '#E1E9E8') + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (dk ? '#2A3C44' : '#CBD3D1') + '"/><stop offset=".15" stop-color="' + (dk ? '#1C2A30' : '#B9C4C2') + '"/><stop offset="1" stop-color="' + (dk ? '#0F181C' : '#A3AEAC') + '"/></linearGradient></defs>' +
      '<rect x="0" y="0" width="' + w + '" height="' + y + '" fill="url(#' + id + 'w)"/>';
    for (var yy = y - 46; yy > 0; yy -= 46) s += '<line x1="0" x2="' + w + '" y1="' + yy + '" y2="' + yy + '" stroke="' + (dk ? 'rgba(255,255,255,.03)' : 'rgba(40,70,80,.05)') + '"/>';
    return s + '<rect x="0" y="' + y + '" width="' + w + '" height="' + (h - y) + '" fill="url(#' + id + 'b)"/><rect x="0" y="' + y + '" width="' + w + '" height="1.5" fill="' + (dk ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.8)') + '"/>';
  }
  function shadow(cx, y, rx) { return '<ellipse cx="' + n(cx) + '" cy="' + n(y) + '" rx="' + n(rx) + '" ry="' + n(Math.max(4, rx * .1)) + '" fill="url(#lsv-shadow)"/>'; }
  var edge = function (a) { return dark() ? 'rgba(195,225,235,' + a + ')' : 'rgba(55,85,95,' + a + ')'; };
  /* beaker: o.level (px of liquid), o.liq (colour), o.alpha, o.inner (svg drawn in the liquid), o.marks, o.shadow */
  function beaker(cx, base, w, h, o) {
    o = o || {}; var L = cx - w / 2, R = cx + w / 2, T = base - h, id = 'lsvk' + (++uid), lv = Math.max(0, Math.min(h - 4, o.level || 0)), ly = base - 3 - lv;
    var body = 'M' + n(L) + ' ' + n(T) + ' L' + n(L) + ' ' + n(base - 6) + ' Q' + n(L) + ' ' + n(base) + ' ' + n(L + 6) + ' ' + n(base) + ' L' + n(R - 6) + ' ' + n(base) + ' Q' + n(R) + ' ' + n(base) + ' ' + n(R) + ' ' + n(base - 6) + ' L' + n(R) + ' ' + n(T) + ' Z';
    var s = (o.shadow === false ? '' : shadow(cx, base + 3, w * .62)) + '<defs><clipPath id="' + id + '"><path d="' + body + '"/></clipPath></defs>';
    s += '<path d="' + body + '" fill="url(#lsv-tint)"/>';
    if (lv > 0) {
      s += '<g clip-path="url(#' + id + ')"><rect x="' + n(L) + '" y="' + n(ly) + '" width="' + n(w) + '" height="' + n(lv + 4) + '" fill="' + (o.liq || '#CFE6F5') + '" opacity="' + (o.alpha == null ? .9 : o.alpha) + '"/>' +
        '<rect x="' + n(L) + '" y="' + n(ly) + '" width="' + n(w) + '" height="' + n(lv + 4) + '" fill="url(#lsv-depth)"/><rect x="' + n(L) + '" y="' + n(ly) + '" width="' + n(w) + '" height="' + n(lv + 4) + '" fill="url(#lsv-liq)"/>' + (o.inner || '') +
        '<ellipse cx="' + n(cx) + '" cy="' + n(ly) + '" rx="' + n(w / 2 - 2) + '" ry="' + n(Math.min(5, w * .04)) + '" fill="#fff" opacity="' + (dark() ? .1 : .32) + '"/></g>' +
        '<path d="M' + n(L + 2) + ' ' + n(ly - 3) + ' Q' + n(cx) + ' ' + n(ly + 3) + ' ' + n(R - 2) + ' ' + n(ly - 3) + '" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>';
    } else if (o.inner) s += '<g clip-path="url(#' + id + ')">' + o.inner + '</g>';
    if (o.marks !== false) { for (var k = 1; k <= 4; k++) { var my = base - h * k / 5; s += '<line x1="' + n(R - 18) + '" x2="' + n(R - (k % 2 ? 10 : 4)) + '" y1="' + n(my) + '" y2="' + n(my) + '" stroke="' + (dark() ? 'rgba(230,240,245,.6)' : 'rgba(255,255,255,.95)') + '" stroke-width="1.5"/>'; } }
    s += '<rect x="' + n(L + w * .08) + '" y="' + n(T + h * .08) + '" width="' + n(Math.max(4, w * .1)) + '" height="' + n(h * .78) + '" rx="4" fill="url(#lsv-hl)"/><rect x="' + n(R - w * .14) + '" y="' + n(T + h * .14) + '" width="' + n(Math.max(2, w * .03)) + '" height="' + n(h * .55) + '" rx="2" fill="#fff" opacity=".35"/>';
    s += '<rect x="' + n(L) + '" y="' + n(base - 5) + '" width="' + n(w) + '" height="5" fill="#fff" opacity="' + (dark() ? .1 : .35) + '"/>';
    s += '<path d="M' + n(L - 7) + ' ' + n(T - 5) + ' Q' + n(L - 1) + ' ' + n(T - 2) + ' ' + n(L) + ' ' + n(T + 4) + ' L' + n(L) + ' ' + n(base - 6) + ' Q' + n(L) + ' ' + n(base) + ' ' + n(L + 6) + ' ' + n(base) + ' L' + n(R - 6) + ' ' + n(base) + ' Q' + n(R) + ' ' + n(base) + ' ' + n(R) + ' ' + n(base - 6) + ' L' + n(R) + ' ' + n(T) + '" fill="none" stroke="' + edge(.9) + '" stroke-width="2.2" stroke-linejoin="round"/>';
    s += '<path d="M' + n(L + 2.5) + ' ' + n(T + 6) + ' L' + n(L + 2.5) + ' ' + n(base - 6) + '" stroke="rgba(255,255,255,.55)" stroke-width="1"/>';
    return s;
  }
  /* Erlenmeyer flask; s = half width of the base */
  function erlen(cx, base, s, o) {
    o = o || {}; var top = base - s * 1.6, nw = s * .36, nb = top + s * .45, id = 'lsve' + (++uid);
    var body = 'M' + n(cx - nw / 2) + ' ' + n(top) + ' L' + n(cx - nw / 2) + ' ' + n(nb) + ' L' + n(cx - s) + ' ' + n(base - 5) + ' Q' + n(cx - s) + ' ' + n(base) + ' ' + n(cx - s + 6) + ' ' + n(base) + ' L' + n(cx + s - 6) + ' ' + n(base) + ' Q' + n(cx + s) + ' ' + n(base) + ' ' + n(cx + s) + ' ' + n(base - 5) + ' L' + n(cx + nw / 2) + ' ' + n(nb) + ' L' + n(cx + nw / 2) + ' ' + n(top) + ' Z';
    var lv = o.level || 0, ly = base - 3 - lv;
    var str = (o.shadow === false ? '' : shadow(cx, base + 3, s * 1.25)) + '<defs><clipPath id="' + id + '"><path d="' + body + '"/></clipPath></defs><path d="' + body + '" fill="url(#lsv-tint)"/>';
    if (lv > 0) str += '<g clip-path="url(#' + id + ')"><rect x="' + n(cx - s) + '" y="' + n(ly) + '" width="' + n(2 * s) + '" height="' + n(lv + 4) + '" fill="' + (o.liq || '#CFE6F5') + '" opacity="' + (o.alpha == null ? .9 : o.alpha) + '"/><rect x="' + n(cx - s) + '" y="' + n(ly) + '" width="' + n(2 * s) + '" height="' + n(lv + 4) + '" fill="url(#lsv-depth)"/><rect x="' + n(cx - s) + '" y="' + n(ly) + '" width="' + n(2 * s) + '" height="' + n(lv + 4) + '" fill="url(#lsv-liq)"/>' + (o.inner || '') + '</g>';
    else if (o.inner) str += '<g clip-path="url(#' + id + ')">' + o.inner + '</g>';
    str += '<path d="M' + n(cx - s * .62) + ' ' + n(base - 10) + ' L' + n(cx - nw * .3) + ' ' + n(nb + 6) + '" stroke="url(#lsv-hl)" stroke-width="' + n(Math.max(3, s * .12)) + '" stroke-linecap="round" opacity=".9"/>';
    str += '<path d="' + body.replace(' Z', '') + '" fill="none" stroke="' + edge(.9) + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M' + n(cx - nw / 2 - 3) + ' ' + n(top) + ' h' + n(nw + 6) + '" stroke="' + edge(.9) + '" stroke-width="3" stroke-linecap="round"/>';
    return str;
  }
  /* Bunsen burner standing on y = base; flame reaches up to flameTop */
  function burner(cx, base, on, flameTop, t) {
    t = t || performance.now() / 1000;
    var s = shadow(cx, base + 2, 30) + '<path d="M' + (cx - 26) + ' ' + base + ' L' + (cx - 22) + ' ' + (base - 8) + ' L' + (cx + 22) + ' ' + (base - 8) + ' L' + (cx + 26) + ' ' + base + ' Z" fill="#2D363B"/>' +
      '<rect x="' + (cx - 22) + '" y="' + (base - 9) + '" width="44" height="2" fill="rgba(255,255,255,.25)"/>';
    var tubeTop = flameTop + Math.max(18, (base - flameTop) * .45);
    s += '<rect x="' + (cx - 6) + '" y="' + n(tubeTop) + '" width="12" height="' + n(base - 8 - tubeTop) + '" fill="url(#lsv-steelV)"/><rect x="' + (cx - 8) + '" y="' + n(base - 22) + '" width="16" height="9" rx="2" fill="url(#lsv-brass)"/><circle cx="' + cx + '" cy="' + n(base - 17.5) + '" r="2.4" fill="#2B2F33"/>' +
      '<rect x="' + (cx + 8) + '" y="' + n(base - 15) + '" width="16" height="5" rx="2" fill="#4A555C"/><path d="M' + (cx + 24) + ' ' + n(base - 12.5) + ' q14 4 24 14" fill="none" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/>';
    if (on) {
      var fh = tubeTop - flameTop, f1 = 1 + Math.sin(t * 17) * .05 + Math.sin(t * 29) * .04, w = 8.5;
      var top = tubeTop - fh * f1;
      s += '<ellipse cx="' + cx + '" cy="' + n(tubeTop - fh * .45) + '" rx="' + n(w * 2.6) + '" ry="' + n(fh * .75) + '" fill="url(#lsv-glow)" opacity=".35"/>';
      s += '<path d="M' + (cx - w) + ' ' + n(tubeTop) + ' Q' + n(cx - w * 1.15) + ' ' + n(tubeTop - fh * .55) + ' ' + n(cx + Math.sin(t * 11) * 1.5) + ' ' + n(top) + ' Q' + n(cx + w * 1.15) + ' ' + n(tubeTop - fh * .55) + ' ' + (cx + w) + ' ' + n(tubeTop) + ' Z" fill="url(#lsv-flameO)"/>';
      s += '<path d="M' + (cx - w * .55) + ' ' + n(tubeTop) + ' Q' + n(cx - w * .5) + ' ' + n(tubeTop - fh * .3) + ' ' + cx + ' ' + n(tubeTop - fh * .5 * f1) + ' Q' + n(cx + w * .5) + ' ' + n(tubeTop - fh * .3) + ' ' + n(cx + w * .55) + ' ' + n(tubeTop) + ' Z" fill="url(#lsv-flameI)"/>';
    }
    return s;
  }
  /* tripod with wire gauze; gauze top at y = top, feet on base */
  function tripod(cx, top, base, w) {
    var s = '';
    [[-1, 1], [1, 1], [0, .35]].forEach(function (l) { s += '<path d="M' + n(cx + l[0] * w * .38) + ' ' + n(top + 4) + ' L' + n(cx + l[0] * w * .5) + ' ' + base + '" stroke="#3B4449" stroke-width="' + (l[1] < 1 ? 3 : 4) + '" stroke-linecap="round" opacity="' + l[1] + '"/>'; });
    s += '<rect x="' + n(cx - w * .42) + '" y="' + n(top + 2) + '" width="' + n(w * .84) + '" height="5" rx="2.5" fill="url(#lsv-steelH)"/>';
    s += '<rect x="' + n(cx - w / 2) + '" y="' + n(top - 1) + '" width="' + w + '" height="4" fill="url(#lsv-gauze)" stroke="#5E676C" stroke-width=".8"/><rect x="' + n(cx - w * .2) + '" y="' + n(top - 1) + '" width="' + n(w * .4) + '" height="4" rx="2" fill="#E9E4DA"/>';
    return s;
  }
  /* hot plate on y = base; plate top at base - h */
  function hotplate(cx, base, w, heat, hh) {
    var h = hh || 34, s = shadow(cx, base + 2, w * .6);
    s += '<rect x="' + n(cx - w / 2) + '" y="' + (base - h + 6) + '" width="' + w + '" height="' + (h - 6) + '" rx="6" fill="#DDE3E6"/><rect x="' + n(cx - w / 2 + 6) + '" y="' + (base - h + 14) + '" width="' + (w - 12) + '" height="' + (h - 20) + '" rx="3" fill="#2F3A40"/>';
    s += '<circle cx="' + n(cx - w * .3) + '" cy="' + (base - 10) + '" r="5" fill="#1F262A"/><circle cx="' + n(cx + w * .32) + '" cy="' + (base - 10) + '" r="2.6" fill="' + (heat > 0 ? '#FF5A3C' : '#4A3A36') + '"/>';
    s += '<rect x="' + n(cx - w / 2 - 3) + '" y="' + (base - h) + '" width="' + (w + 6) + '" height="7" rx="3" fill="' + (heat > 0 ? 'rgb(' + Math.round(70 + 150 * heat) + ',' + Math.round(70 + 20 * heat) + ',60)' : '#5B666C') + '"/>';
    if (heat > .05) s += '<ellipse cx="' + cx + '" cy="' + (base - h + 2) + '" rx="' + n(w * .5) + '" ry="10" fill="url(#lsv-glow)" opacity="' + n(.8 * heat) + '"/>';
    return s;
  }
  /* metal block with a top face; glow 0..1 tints it orange-red */
  function block(x, y, w, h, col, glow, label) {
    var d = Math.min(10, w * .18), id = 'lsvm' + (++uid);
    var s = '<defs><linearGradient id="' + id + '" x1="0" x2="1"><stop offset="0" stop-color="' + col + '" stop-opacity="1"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".55" stop-color="' + col + '" stop-opacity="1"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>';
    s += shadow(x + w / 2 + d / 2, y + h + 2, w * .7);
    s += '<path d="M' + n(x) + ' ' + n(y) + ' l' + n(d) + ' ' + n(-d) + ' h' + n(w) + ' l' + n(-d) + ' ' + n(d) + ' Z" fill="' + col + '"/><path d="M' + n(x) + ' ' + n(y) + ' l' + n(d) + ' ' + n(-d) + ' h' + n(w) + ' l' + n(-d) + ' ' + n(d) + ' Z" fill="#fff" opacity=".35"/>';
    s += '<path d="M' + n(x + w) + ' ' + n(y) + ' l' + n(d) + ' ' + n(-d) + ' v' + n(h) + ' l' + n(-d) + ' ' + n(d) + ' Z" fill="' + col + '"/><path d="M' + n(x + w) + ' ' + n(y) + ' l' + n(d) + ' ' + n(-d) + ' v' + n(h) + ' l' + n(-d) + ' ' + n(d) + ' Z" fill="#000" opacity=".3"/>';
    s += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="url(#' + id + ')"/>';
    for (var k = 1; k < 6; k++) s += '<line x1="' + n(x + 2) + '" x2="' + n(x + w - 2) + '" y1="' + n(y + h * k / 6) + '" y2="' + n(y + h * k / 6 + 1) + '" stroke="#fff" stroke-opacity=".12"/>';
    if (glow > 0) s += '<rect x="' + n(x) + '" y="' + n(y - d) + '" width="' + n(w + d) + '" height="' + n(h + d) + '" fill="#FF6A2A" opacity="' + n(glow * .45) + '"/>';
    s += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="none" stroke="rgba(0,0,0,.35)"/>';
    if (label) s += '<text x="' + n(x + w / 2) + '" y="' + n(y + h / 2 + 4) + '" text-anchor="middle" font-size="10" font-weight="700" fill="rgba(0,0,0,.55)">' + label + '</text>';
    return s;
  }
  /* wavy heat haze above a hot object */
  function shimmer(cx, y, w, amt, t) {
    if (amt <= .02) return ''; t = t || performance.now() / 1000; var s = '';
    for (var k = 0; k < 3; k++) { var x = cx - w * .3 + k * w * .3, d = 'M' + n(x) + ' ' + n(y); for (var j = 1; j <= 6; j++) d += ' L' + n(x + Math.sin(t * 4 + j + k * 2) * 3) + ' ' + n(y - j * 6); s += '<path d="' + d + '" fill="none" stroke="' + (dark() ? '#FFFFFF' : '#7A8A90') + '" stroke-opacity="' + n(.35 * amt) + '" stroke-width="1.4" stroke-linecap="round"/>'; }
    return s;
  }
  /* lab thermometer: red alcohol column, glass tube, white scale card */
  function thermometer(x, y, h, T, lo, hi, step, bare) {
    step = step || 20; var f = Math.max(0, Math.min(1, (T - lo) / (hi - lo))), col = h - 26, top = y + 6, bot = y + h - 20, colTop = bot - (bot - top) * f;
    var ink = bare ? (dark() ? '#E7EFF1' : '#1E2A30') : '#222', s = bare ? '' : '<rect x="' + (x - 3) + '" y="' + (y - 2) + '" width="34" height="' + (h - 14) + '" rx="4" fill="' + (dark() ? '#E9EEF0' : '#FFFFFF') + '" opacity=".92" stroke="rgba(0,0,0,.2)"/>';
    for (var t = lo; t <= hi + 1e-9; t += step / 2) { var ty = bot - (bot - top) * (t - lo) / (hi - lo), major = Math.abs(((t - lo) / step) % 1) < 1e-6; s += '<line x1="' + (x + 7) + '" x2="' + (x + (major ? 15 : 11)) + '" y1="' + n(ty) + '" y2="' + n(ty) + '" stroke="' + ink + '" stroke-width="' + (major ? 1.2 : .7) + '"/>' + (major ? '<text x="' + (x + 17) + '" y="' + n(ty + 3.5) + '" font-size="9" font-family="IBM Plex Mono,monospace" fill="' + ink + '">' + t + '</text>' : ''); }
    s += '<rect x="' + (x - 6) + '" y="' + (y - 10) + '" width="12" height="' + (h - 4) + '" rx="6" fill="rgba(225,240,248,.55)" stroke="' + edge(.85) + '" stroke-width="1.4"/>';
    s += '<rect x="' + (x - 2) + '" y="' + n(colTop) + '" width="4" height="' + n(bot - colTop + 6) + '" fill="#D8262B"/><circle cx="' + x + '" cy="' + (y + h - 11) + '" r="8.5" fill="#D8262B" stroke="' + edge(.8) + '" stroke-width="1.4"/>';
    s += '<rect x="' + (x - 4.5) + '" y="' + (y - 6) + '" width="2" height="' + (h - 22) + '" fill="#fff" opacity=".7"/><circle cx="' + (x - 3) + '" cy="' + (y + h - 14) + '" r="2.2" fill="#fff" opacity=".7"/>';
    return s;
  }
  /* expanded-polystyrene coffee-cup calorimeter with a lid */
  function cup(cx, top, base, wTop, wBot, o) {
    o = o || {}; var id = 'lsvc' + (++uid), lv = o.level || 0;
    var path = 'M' + n(cx - wTop / 2) + ' ' + top + ' L' + n(cx - wBot / 2) + ' ' + base + ' L' + n(cx + wBot / 2) + ' ' + base + ' L' + n(cx + wTop / 2) + ' ' + top + ' Z';
    var s = shadow(cx, base + 3, wBot * .7) + '<defs><clipPath id="' + id + '"><path d="' + path + '"/></clipPath><linearGradient id="' + id + 'g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient></defs>';
    s += '<path d="' + path + '" fill="url(#lsv-foam)"/>';
    if (o.cutaway) {
      var ix = 9, ipath = 'M' + n(cx - wTop / 2 + ix) + ' ' + (top + 6) + ' L' + n(cx - wBot / 2 + ix) + ' ' + (base - 8) + ' L' + n(cx + wBot / 2 - ix) + ' ' + (base - 8) + ' L' + n(cx + wTop / 2 - ix) + ' ' + (top + 6) + ' Z';
      s += '<path d="' + ipath + '" fill="' + (dark() ? '#1A262C' : '#EEF3F5') + '"/>';
      s += '<defs><clipPath id="' + id + 'i"><path d="' + ipath + '"/></clipPath></defs>';
      if (lv > 0) s += '<g clip-path="url(#' + id + 'i)"><rect x="' + n(cx - wTop / 2) + '" y="' + n(base - 8 - lv) + '" width="' + wTop + '" height="' + n(lv + 2) + '" fill="' + (o.liq || '#9FCBEA') + '" opacity=".9"/><rect x="' + n(cx - wTop / 2) + '" y="' + n(base - 8 - lv) + '" width="' + wTop + '" height="' + n(lv + 2) + '" fill="url(#lsv-depth)"/>' + (o.inner || '') + '</g>';
      else if (o.inner) s += '<g clip-path="url(#' + id + 'i)">' + o.inner + '</g>';
      s += '<path d="' + ipath + '" fill="none" stroke="rgba(0,0,0,.18)"/>';
    }
    s += '<path d="' + path + '" fill="url(#' + id + 'g)"/><path d="' + path + '" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>';
    s += '<rect x="' + n(cx - wTop / 2 - 8) + '" y="' + (top - 10) + '" width="' + (wTop + 16) + '" height="12" rx="4" fill="url(#lsv-foam)" stroke="rgba(0,0,0,.25)"/>';
    return s;
  }
  /* digital balance; pan top at base - 40 */
  function balance(cx, base, w, text) {
    var bh = Math.max(38, Math.round(w * .1)), lh = Math.round(bh * .55), fs = Math.round(lh * .72);
    var s = shadow(cx, base + 2, w * .6) + '<rect x="' + n(cx - w / 2) + '" y="' + (base - bh) + '" width="' + w + '" height="' + bh + '" rx="8" fill="#C9D1D5"/><rect x="' + n(cx - w / 2) + '" y="' + (base - bh) + '" width="' + w + '" height="12" rx="6" fill="#EEF2F3"/>';
    s += '<rect x="' + n(cx - w * .2) + '" y="' + (base - lh - 8) + '" width="' + n(w * .4) + '" height="' + (lh + 4) + '" rx="4" fill="#2A2F34"/><rect x="' + n(cx - w * .19) + '" y="' + (base - lh - 6) + '" width="' + n(w * .38) + '" height="' + lh + '" rx="3" fill="#0F2A20"/>';
    s += '<text x="' + n(cx + w * .17) + '" y="' + n(base - 6 - lh * .22) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-weight="700" font-size="' + fs + '" fill="#7CFF9E">' + text + '</text>';
    s += '<rect x="' + n(cx - w * .46) + '" y="' + (base - bh - 6) + '" width="' + n(w * .92) + '" height="7" rx="3" fill="url(#lsv-steelH)"/>';
    return s;
  }
  window.LabSVG = { defs: defs, bench: bench, shadow: shadow, beaker: beaker, erlen: erlen, burner: burner, tripod: tripod, hotplate: hotplate, block: block, shimmer: shimmer, thermometer: thermometer, cup: cup, balance: balance, dark: dark };
})();
