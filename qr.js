/* qr.js — a small QR code maker for the site (no libraries, works offline).
   QR.svg(text, {ecc:'M', border:4, dark:'#13232B', light:'#FFFFFF'}) returns an <svg> string.
   QR.matrix(text, ecc) returns the modules as an array of rows of true/false.
   Byte mode, versions 1–40, error correction L/M/Q/H, automatic mask choice.
   Follows the ISO/IEC 18004 layout (the same method as Project Nayuki's reference code). */
(function () {
  'use strict';
  var ECC = { L: 0, M: 1, Q: 2, H: 3 }, FMT = [1, 0, 3, 2];
  // codewords of error correction per block, and number of blocks, for versions 1..40 (index 0 unused)
  var EPB = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
  var NB = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];

  function rawModules(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function dataCodewords(v, e) { return Math.floor(rawModules(v) / 8) - EPB[e][v] * NB[e][v]; }

  /* Reed–Solomon over GF(256), polynomial 0x11D */
  function mul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; }
  function divisor(deg) { var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1); var root = 1;
    for (i = 0; i < deg; i++) { for (var j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; }
  function remainder(data, div) { var r = div.map(function () { return 0; });
    data.forEach(function (b) { var f = b ^ r.shift(); r.push(0); div.forEach(function (c, i) { r[i] ^= mul(c, f); }); }); return r; }

  function utf8(s) { var out = [], b = unescape(encodeURIComponent(s)); for (var i = 0; i < b.length; i++) out.push(b.charCodeAt(i)); return out; }

  function matrix(text, eccName) {
    var e = ECC[eccName || 'M'], data = utf8(text), v, cap;
    for (v = 1; v <= 40; v++) { var ccBits = v < 10 ? 8 : 16; cap = dataCodewords(v, e) * 8; if (4 + ccBits + data.length * 8 <= cap) break; }
    if (v > 40) throw new Error('Text too long for a QR code');
    // bits: mode, length, data, terminator, padding
    var bits = [], put = function (val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(data.length, v < 10 ? 8 : 16); data.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var words = []; for (var i = 0; i < bits.length; i += 8) { var w = 0; for (var k = 0; k < 8; k++) w = (w << 1) | bits[i + k]; words.push(w); }
    // split into blocks, add error correction, interleave
    var nb = NB[e][v], ecl = EPB[e][v], raw = Math.floor(rawModules(v) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = divisor(ecl), blocks = [], pos = 0;
    for (i = 0; i < nb; i++) { var dl = shortLen - ecl + (i < nShort ? 0 : 1), d = words.slice(pos, pos + dl); pos += dl; blocks.push({ d: d, e: remainder(d, div) }); }
    var out = [], maxD = shortLen - ecl + 1;
    for (i = 0; i < maxD; i++) blocks.forEach(function (b) { if (i < b.d.length) out.push(b.d[i]); });
    for (i = 0; i < ecl; i++) blocks.forEach(function (b) { out.push(b.e[i]); });

    // the grid
    var n = v * 4 + 17, M = [], F = [];
    for (i = 0; i < n; i++) { M.push(new Array(n).fill(false)); F.push(new Array(n).fill(false)); }
    var set = function (x, y, on) { M[y][x] = on; F[y][x] = true; };
    for (i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(cx, cy) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4); } }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    if (v > 1) { var na = Math.floor(v / 7) + 2, step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2, al = [6];
      for (var p = n - 7; al.length < na; p -= step) al.splice(1, 0, p);
      al.forEach(function (ay, a) { al.forEach(function (ax, b) { if ((a === 0 && b === 0) || (a === 0 && b === na - 1) || (a === na - 1 && b === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }); }); }
    function format(mask) {
      var d = FMT[e] << 3 | mask, r = d; for (var j = 0; j < 10; j++) r = (r << 1) ^ ((r >>> 9) * 0x537); var b = (d << 10 | r) ^ 0x5412, bit = function (j) { return ((b >>> j) & 1) !== 0; };
      for (j = 0; j <= 5; j++) set(8, j, bit(j)); set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8)); for (j = 9; j < 15; j++) set(14 - j, 8, bit(j));
      for (j = 0; j < 8; j++) set(n - 1 - j, 8, bit(j)); for (j = 8; j < 15; j++) set(8, n - 15 + j, bit(j)); set(8, n - 8, true);
    }
    format(0);
    if (v >= 7) { var r = v; for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); var vb = v << 12 | r;
      for (i = 0; i < 18; i++) { var on = ((vb >>> i) & 1) !== 0, a2 = n - 11 + i % 3, b2 = Math.floor(i / 3); set(a2, b2, on); set(b2, a2, on); } }
    // data in the zigzag
    var bi = 0, total = out.length * 8;
    for (var right = n - 1; right >= 1; right -= 2) { if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) for (var j2 = 0; j2 < 2; j2++) { var x = right - j2, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert;
        if (!F[y][x] && bi < total) { M[y][x] = ((out[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; } } }
    // masks: try all eight, keep the one with the lowest penalty
    var MASK = [function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; }, function (x) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
      function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; }, function (x, y) { return x * y % 2 + x * y % 3 === 0; },
      function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; }, function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }];
    function apply(m) { for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (!F[y][x] && MASK[m](x, y)) M[y][x] = !M[y][x]; }
    function penalty() {
      var s = 0, x, y, run, c, dark = 0;
      function lines(get) { for (var a = 0; a < n; a++) { run = 1; c = get(a, 0);
        for (var b = 1; b < n; b++) { var q = get(a, b); if (q === c) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else { run = 1; c = q; } }
        var row = []; for (b = 0; b < n; b++) row.push(get(a, b) ? 1 : 0); var str = '0000' + row.join('') + '0000';   // light border counts as light
        ['10111010000', '00001011101'].forEach(function (pt) { var i0 = str.indexOf(pt); while (i0 >= 0) { s += 40; i0 = str.indexOf(pt, i0 + 1); } }); } }
      lines(function (a, b) { return M[a][b]; }); lines(function (a, b) { return M[b][a]; });
      for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) { c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) s += 3; }
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (M[y][x]) dark++;
      var k = Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1; s += Math.max(0, k) * 10;
      return s;
    }
    var best = 0, bestP = Infinity;
    for (var m = 0; m < 8; m++) { apply(m); format(m); var pn = penalty(); if (pn < bestP) { bestP = pn; best = m; } apply(m); }
    apply(best); format(best);
    return M;
  }

  function svg(text, o) {
    o = o || {}; var M = matrix(text, o.ecc), n = M.length, b = o.border == null ? 4 : o.border, size = n + 2 * b, path = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (M[y][x]) path += 'M' + (x + b) + ',' + (y + b) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="QR code for ' + String(text).replace(/[&<>"]/g, '') + '">' +
      '<rect width="100%" height="100%" fill="' + (o.light || '#FFFFFF') + '"/><path d="' + path + '" fill="' + (o.dark || '#13232B') + '"/></svg>';
  }
  var api = { matrix: matrix, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else window.QR = api;
})();
