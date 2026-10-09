/*
 * Pixel painter for hi-res sprites. A sprite can be painted by code instead of typed as rows:
 *   { w: 16, h: 16, palette: { ... }, paint: function (P, pose, frame, colors) { ... } }
 * P is a 32x32 pixel grid (two pixels per game pixel, so faces get real detail). Everything snaps to whole
 * pixels, so it stays crisp pixel art. Helpers: P.set, P.rect, P.oval, P.ball (a shaded 3-tone oval),
 * P.poly, P.line, P.eye (a cute eye with highlights), P.blush.
 *
 * Builders for whole characters (used in js/data/sprites.js):
 *   RPG.chibi({ hair: 'short' | 'cap' | 'pony' | 'bob' | 'spiky' | 'bun' | 'bald' | 'hood', mouth, glasses, adult, pack }, palette)
 *   RPG.pup(palette)                      — Mochi the shiba
 *   RPG.monster(function (P, f, c) {...}, palette)   — battle sprites (pose 'idle', 2 frames)
 */
(function () {
  'use strict';

  // ---------- colors ----------
  var rgbCache = {};
  function rgb(c) {
    if (rgbCache[c]) return rgbCache[c];
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c), v;
    if (m) {
      var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
      v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
    } else {
      var a = /rgba?\(([^)]+)\)/.exec(c).slice(1)[0].split(',').map(Number);
      v = [a[0], a[1], a[2], a.length > 3 ? Math.round(a[3] * 255) : 255];
    }
    return (rgbCache[c] = v);
  }
  function hex(v) { return '#' + v.slice(0, 3).map(function (n) { return ('0' + Math.round(Math.max(0, Math.min(255, n))).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  // shade: negative = darker (toward a cool purple), positive = lighter (toward warm cream) — reads nicer than black/white
  function shade(c, t) { return t < 0 ? mix(c, '#2a1a48', -t) : mix(c, '#fff4d6', t); }
  RPG.color = { mix: mix, shade: shade };

  // ---------- the pixel grid ----------
  function Pix(w, h) { this.w = w; this.h = h; this.px = new Array(w * h); this.ox = 0; this.oy = 0; }
  var P = Pix.prototype;
  P.set = function (x, y, c) {
    x = Math.round(x + this.ox); y = Math.round(y + this.oy);
    if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
  };
  P.clear = function (x, y) {
    x = Math.round(x + this.ox); y = Math.round(y + this.oy);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = undefined;
  };
  P.get = function (x, y) { x = Math.round(x + this.ox); y = Math.round(y + this.oy); return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : null; };
  P.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  // pixels whose centers fall inside the ellipse; fn(x, y, nx, ny) may pick the color per pixel
  P.oval = function (cx, cy, rx, ry, c, fn) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) this.set(x, y, fn ? fn(x, y, nx, ny) : c);
    }
  };
  // a round shape lit from the top left: highlight, base, shadow, and a little shine
  P.ball = function (cx, cy, rx, ry, c, o) {
    o = o || {};
    var hi = shade(c, o.light == null ? 0.28 : o.light), lo = shade(c, o.dark == null ? -0.28 : -o.dark);
    this.oval(cx, cy, rx, ry, c, function (x, y, nx, ny) {
      var d = nx * 0.7 + ny * 0.75;
      return d > 0.62 ? lo : d < -0.72 ? hi : c;
    });
    if (o.shine !== false && rx > 3) { this.set(cx - rx * 0.45, cy - ry * 0.55, shade(c, 0.6)); if (rx > 6) this.set(cx - rx * 0.45 + 1, cy - ry * 0.55, shade(c, 0.5)); }
  };
  P.poly = function (pts, c) {
    var minX = 99, maxX = -99, minY = 99, maxY = -99;
    pts.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    for (var y = Math.floor(minY); y <= maxY; y++) for (var x = Math.floor(minX); x <= maxX; x++) {
      var px = x + 0.5, py = y + 0.5, inside = false;
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[i], b = pts[j];
        if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      if (inside) this.set(x, y, c);
    }
  };
  P.line = function (x0, y0, x1, y1, c) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (var i = 0; i <= n; i++) this.set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
  };
  // a cute eye: dark, with a big highlight on top and a colored bottom row
  P.eye = function (x, y, w, h, c, iris) {
    this.rect(x, y, w, h, c);
    if (iris && h > 2) this.rect(x, y + h - 1, w, 1, iris);
    this.set(x, y, '#ffffff'); if (w > 2 && h > 3) this.set(x + 1, y, '#ffffff');
    if (w > 2 && h > 3) this.set(x + w - 1, y + h - 2, 'rgba(255,255,255,0.9)');
  };
  P.blush = function (x, y, w, c) { this.rect(x, y, w || 2, 1, c || '#ff8fa0'); };
  P.canvas = function () {
    var cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
    var g = cv.getContext('2d'), id = g.createImageData(this.w, this.h), d = id.data;
    for (var i = 0; i < this.px.length; i++) {
      if (!this.px[i]) continue;
      var v = rgb(this.px[i]); d[i * 4] = v[0]; d[i * 4 + 1] = v[1]; d[i * 4 + 2] = v[2]; d[i * 4 + 3] = v[3];
    }
    g.putImageData(id, 0, 0);
    return cv;
  };
  RPG.Pix = Pix;

  // ======================= chibi people =======================
  // palette: H hair (or cap), h hair under a cap, S skin, K eyes, I iris, M mouth, T shirt, P pants, B shoes,
  //          G backpack, A accent (hair tie, glasses, collar)
  var PEOPLE = { H: '#4a2a14', h: '#5a3418', S: '#f6cba4', K: '#2a1c24', I: '#6a4a3a', M: '#c0505a', T: '#5a7ab8', P: '#3a3a5a', B: '#4a2a14', G: '#e07050', A: '#e04870', W: '#ffffff' };

  RPG.chibi = function (o, palette) {
    o = o || {};
    return { w: 16, h: 16, palette: Object.assign({}, PEOPLE, palette), outline: true,
             paint: function (P, pose, f, c) { chibi(P, pose === 'up' || pose === 'side' ? pose : 'down', f, c, o); } };
  };

  function chibi(P, pose, f, c, o) {
    var ad = !!o.adult;
    var hx = 16, hy = ad ? 9.5 : 11, rx = ad ? 8.6 : 10, ry = ad ? 8.2 : 9.5;
    var top = Math.round(hy - ry), bodyY = ad ? 17 : 20, legY = ad ? 25 : 26;
    var skin = c.S, skinD = shade(c.S, -0.18), hair = c.H, hairD = shade(c.H, -0.3), hairL = shade(c.H, 0.35);
    var shirt = c.T, shirtD = shade(c.T, -0.3), shirtL = shade(c.T, 0.25), pants = c.P, pantsD = shade(c.P, -0.3), shoe = c.B;
    P.oy = f ? -1 : 0;                                    // a little bounce while walking
    var side = pose === 'side', up = pose === 'up';

    // ---- things behind the head ----
    if (o.hair === 'pony') {
      if (side) { P.ball(5, hy, 3.2, 5, hair, { shine: false }); P.set(7, hy - 3, c.A); P.set(8, hy - 3, c.A); }
      else if (up) { P.ball(16, hy + 6, 3, 5, hair, { shine: false }); P.rect(15, hy + 1, 3, 1, c.A); }
      else { P.ball(27, hy - 1, 3, 5.5, hair, { shine: false }); P.rect(25, hy - 5, 2, 2, c.A); }
    }
    if (o.hair === 'bob' || o.hair === 'hood') {
      if (!side) P.oval(hx, hy + 2, rx + 1, ry - 0.5, o.hair === 'hood' ? hair : hairD);
      else P.oval(hx - 2, hy + 2, rx - 1, ry - 0.5, hairD);
    }
    if (o.pack !== false && side) { P.rect(7, bodyY + 1, 4, 6, c.G); P.rect(7, bodyY + 1, 1, 6, shade(c.G, 0.25)); P.rect(7, bodyY + 6, 4, 1, shade(c.G, -0.3)); }

    // ---- legs and shoes ----
    var lift = f ? 1 : 0;
    if (side) {
      var fx = f ? 3 : 0;                                 // stride
      P.rect(12 - fx / 2, legY, 4, 3, pantsD); P.rect(16 + fx / 2 - 1, legY, 4, 3, pants);
      P.rect(11 - fx / 2, 29, 5, 2, shade(shoe, -0.15)); P.rect(16 + fx / 2 - 1, 29, 6, 2, shoe); P.set(21 + fx / 2, 30, shoe);
    } else {
      P.rect(11, legY, 10, 2, pants); P.rect(11, legY + 2, 4, 2 - lift, pants); P.rect(17, legY + 2, 4, 2, pants);
      P.rect(11, legY, 10, 1, shade(pants, 0.12));
      P.rect(10, 29 - lift, 5, 2, shoe); P.rect(17, 29, 5, 2, shoe);
      P.rect(10, 29 - lift, 5, 1, shade(shoe, 0.3)); P.rect(17, 29, 5, 1, shade(shoe, 0.3));
    }

    // ---- body ----
    var bw = side ? 9 : 12, bx = side ? 11 : 10, bh = legY - bodyY;
    P.rect(bx, bodyY, bw, bh, shirt);
    P.clear(bx, bodyY); P.clear(bx + bw - 1, bodyY);     // rounded shoulders
    P.rect(bx, bodyY + bh - 1, bw, 1, shirtD);
    P.rect(bx + 1, bodyY + 1, 1, bh - 2, shirtL);
    if (!side && !up) { P.set(15, bodyY, shade(shirt, 0.45)); P.set(16, bodyY, shade(shirt, 0.45)); P.set(15.5, bodyY + 1, shirtD); }   // collar
    if (up && o.pack !== false) {                          // backpack
      P.rect(11, bodyY, 10, bh - 1, c.G); P.rect(11, bodyY, 10, 1, shade(c.G, 0.3)); P.rect(11, bodyY + bh - 2, 10, 1, shade(c.G, -0.3));
      P.rect(13, bodyY + 2, 6, 2, shade(c.G, -0.15)); P.set(16, bodyY + 3, '#f0d060');
    }
    // arms
    if (side) {
      var sw = f ? 2 : 0;
      P.rect(14 + sw, bodyY + 1, 3, 3, shirtD); P.rect(14 + sw, bodyY + 4, 3, 2, skin);
    } else {
      var a1 = f ? -1 : 0, a2 = f ? 1 : 0;
      P.rect(8, bodyY + 1, 2, 3, shirt); P.rect(8, bodyY + 4 + a1, 2, 2, skin);
      P.rect(22, bodyY + 1, 2, 3, shirtD); P.rect(22, bodyY + 4 + a2, 2, 2, skinD);
    }

    // ---- head ----
    var faceX = side ? hx + 1 : hx;
    P.oval(faceX, hy, rx, ry, skin, function (x, y, nx, ny) { return nx * 0.5 + ny > 0.82 ? skinD : skin; });
    if (!side) { P.rect(hx - rx - 1, hy + 1, 1, 3, skin); P.rect(hx + rx, hy + 1, 1, 3, skinD); }   // ears

    // ---- hair ----
    var style = o.hair || 'short';
    if (up) {
      P.oval(faceX, hy - 0.3, rx + 0.6, ry + 0.4, hair, function (x, y, nx, ny) { return ny > 0.55 ? hairD : nx < -0.3 && ny < -0.3 ? hairL : hair; });
      if (style === 'cap') { P.oval(faceX, hy - 3, rx + 0.4, ry - 3, c.H); P.rect(hx - 3, hy + 2, 6, 1, shade(c.H, -0.3)); P.oval(faceX, hy + 3, rx - 1, 3, c.h); }
      if (style === 'bald') { P.oval(faceX, hy - 2, rx - 1.5, ry - 3, skin); P.set(hx - 3, hy - 6, shade(skin, 0.5)); }
      if (style === 'hood') ears(P, hx, top, hair, c.A);
      if (style === 'bun') P.ball(hx, top - 1, 3.2, 3, hair);
    } else if (side) {
      // back of the head and the top; the face shows on the right
      P.oval(faceX - 1, hy - 1, rx + 0.6, ry, hair, function (x, y, nx, ny) {
        if (x > faceX + 1 && ny > -0.45) return null;
        if (x > faceX - 3 && ny > 0.1) return null;
        return ny > 0.5 ? hairD : nx < -0.2 && ny < -0.4 ? hairL : hair;
      });
      P.rect(faceX - 3, hy + 1, 2, 3, skinD);           // ear
      if (style === 'cap') { P.oval(faceX, hy - 4, rx, ry - 4, c.H); P.rect(faceX + 2, hy - 2, rx + 2, 2, shade(c.H, -0.25)); P.rect(faceX + 2, hy - 2, rx + 2, 1, shade(c.H, 0.2)); }
      if (style === 'spiky') for (var s = 0; s < 3; s++) P.poly([[faceX - 7 + s * 5, top + 2], [faceX - 5 + s * 5, top - 3], [faceX - 2 + s * 5, top + 2]], hair);
      if (style === 'bun') P.ball(faceX - 4, top, 3.2, 3, hair);
      if (style === 'bald') { P.oval(faceX, hy - 3, rx - 1, ry - 3, skin); P.set(faceX - 1, top + 3, shade(skin, 0.5)); }
      if (style === 'hood') ears(P, faceX - 2, top, hair, c.A);
    } else {
      // front: the top of the head, sides, and a jagged fringe
      var fringe = Math.round(hy - 2);
      P.oval(faceX, hy - 0.8, rx + 0.6, ry - 0.2, hair, function (x, y, nx, ny) {
        if (y < fringe) return nx < -0.25 && ny < -0.5 ? hairL : hair;
        var sideHair = Math.abs(nx) > (style === 'bob' || style === 'hood' ? 0.62 : 0.78);
        if (y <= fringe + 1 && !sideHair) return ((x + (y - fringe)) % 3 === 0) ? null : hairD;
        return sideHair && y < hy + (style === 'bob' || style === 'hood' ? 6 : 3) ? hairD : null;
      });
      if (style !== 'bald' && style !== 'cap') { P.set(hx - 5, top + 2, shade(hair, 0.55)); P.set(hx - 4, top + 2, shade(hair, 0.45)); P.set(hx - 6, top + 3, shade(hair, 0.4)); }
      if (style === 'cap') {
        P.oval(faceX, hy - 3.5, rx + 0.6, ry - 3, c.H, function (x, y, nx, ny) { return ny > 0.6 ? null : nx < -0.3 && ny < -0.3 ? shade(c.H, 0.3) : c.H; });
        P.rect(hx - rx, fringe - 1, rx * 2 + 1, 2, shade(c.H, -0.25)); P.rect(hx - rx, fringe - 1, rx * 2 + 1, 1, shade(c.H, -0.05));
        P.rect(hx - 2, top + 2, 4, 3, '#ffffff'); P.rect(hx - 1, top + 3, 2, 1, c.H);            // badge on the cap
        P.rect(hx - rx - 0.5, fringe + 1, 2, 3, c.h); P.rect(hx + rx - 1, fringe + 1, 2, 3, c.h);
      }
      if (style === 'spiky') for (var k = 0; k < 4; k++) P.poly([[hx - 9 + k * 5, top + 2], [hx - 7 + k * 5, top - 3], [hx - 4 + k * 5, top + 2]], hair);
      if (style === 'bun') { P.ball(hx, top - 1, 3.4, 3, hair); P.rect(hx - 2, top + 1, 4, 1, c.A); }
      if (style === 'bald') { P.oval(faceX, hy - 3, rx - 1.5, ry - 4, skin); P.set(hx - 3, top + 3, shade(skin, 0.5)); P.set(hx - 2, top + 3, shade(skin, 0.4)); }
      if (style === 'hood') ears(P, hx, top, hair, c.A);
    }

    // ---- face ----
    if (!up) {
      var ey = Math.round(hy + (ad ? 0.5 : 1)), eh = ad ? 3 : 4, ew = ad ? 2 : 3;
      if (side) {
        P.eye(faceX + 4, ey, ew - 1 || 2, eh, c.K, c.I);
        P.blush(faceX + 5, ey + eh + (ad ? 0 : 1), 2);
        mouth(P, faceX + 7, ey + eh + 2, o.mouth, c, true);
        if (o.glasses) { P.rect(faceX + 3, ey - 1, 5, 1, c.A); P.rect(faceX + 3, ey + eh, 5, 1, c.A); P.rect(faceX + 7, ey - 1, 1, eh + 2, c.A); P.rect(faceX - 3, ey, 6, 1, c.A); }
        if (o.mustache) P.rect(faceX + 6, ey + eh + 1, 3, 1, c.H);
      } else {
        var lx = Math.round(hx - (ad ? 5 : 6)), rxp = Math.round(hx + (ad ? 3 : 3));
        P.eye(lx, ey, ew, eh, c.K, c.I); P.eye(rxp, ey, ew, eh, c.K, c.I);
        P.blush(lx - 2, ey + eh + (ad ? 0 : 1), 2); P.blush(rxp + ew, ey + eh + (ad ? 0 : 1), 2);
        mouth(P, hx, ey + eh + 2, o.mouth, c, false);
        if (o.glasses) {
          [lx, rxp].forEach(function (x) { P.rect(x - 1, ey - 1, ew + 2, 1, c.A); P.rect(x - 1, ey + eh, ew + 2, 1, c.A); P.rect(x - 1, ey - 1, 1, eh + 2, c.A); P.rect(x + ew, ey - 1, 1, eh + 2, c.A); });
          P.rect(lx + ew + 1, ey + 1, rxp - lx - ew - 2, 1, c.A);
        }
        if (o.mustache) { P.rect(hx - 3, ey + eh + 1, 3, 1, c.H); P.rect(hx, ey + eh + 1, 3, 1, c.H); }
      }
    }
    P.oy = 0;
  }
  function ears(P, x, top, c, inner) {
    P.poly([[x - 10, top + 5], [x - 8, top - 4], [x - 3, top + 2]], c); P.poly([[x + 10, top + 5], [x + 8, top - 4], [x + 3, top + 2]], c);
    P.set(x - 8, top, inner || '#f4a0b0'); P.set(x - 7, top + 1, inner || '#f4a0b0'); P.set(x + 7, top, inner || '#f4a0b0'); P.set(x + 6, top + 1, inner || '#f4a0b0');
  }
  function mouth(P, x, y, kind, c, side) {
    if (side) { if (kind === 'grin') { P.rect(x - 1, y - 1, 2, 1, '#ffffff'); P.set(x - 1, y, c.M); } else P.set(x, y - 1, c.M); return; }
    if (kind === 'grin') {                                 // big smile with a missing tooth
      P.rect(x - 2, y - 1, 4, 2, c.M); P.rect(x - 2, y - 1, 4, 1, '#ffffff'); P.set(x, y - 1, c.M);
    } else if (kind === 'open') { P.rect(x - 1, y - 1, 2, 2, c.M); P.set(x - 1, y, shade(c.M, 0.3)); }
    else if (kind === 'flat') P.rect(x - 1, y - 1, 2, 1, shade(c.M, -0.2));
    else { P.set(x - 2, y - 1, c.M); P.rect(x - 1, y, 2, 1, c.M); P.set(x + 1, y - 1, c.M); }   // 'smile'
  }

  // ======================= Mochi the shiba =======================
  RPG.pup = function (palette) {
    return { w: 16, h: 16, palette: Object.assign({ F: '#e8a860', W: '#fff6ea', K: '#2a1c24', N: '#2a1c24', R: '#e04050', Y: '#f8d048', E: '#f4a0a8' }, palette),
             paint: function (P, pose, f, c) { pup(P, pose === 'up' || pose === 'side' ? pose : 'down', f, c); } };
  };
  function pup(P, pose, f, c) {
    var fur = c.F, furD = shade(c.F, -0.25), white = c.W;
    P.oy = f ? -1 : 0;
    if (pose === 'side') {
      P.ball(5, 18 - (f ? 1 : 0), 3, 3, fur, { shine: false }); P.oval(5, 18 - (f ? 1 : 0), 1.5, 1.5, white);
      P.ball(13, 22, 9, 5, fur);
      P.oval(14, 25, 6, 2.2, white);
      [[7, 0], [11, 1], [16, 0], [20, 1]].forEach(function (l, i) { var d = f && i % 2 ? -1 : 0; P.rect(l[0], 26 + d, 3, 3, i % 2 ? furD : fur); P.rect(l[0], 28 + d, 3, 2, white); });
      P.ball(21, 13, 8, 7, fur);
      P.poly([[15, 9], [17, 1], [21, 7]], fur); P.set(17, 5, c.E); P.set(17, 6, c.E);
      P.oval(26, 16, 4.2, 3, white); P.rect(28, 13, 2, 2, c.N);
      P.eye(23, 10, 2, 3, c.K); P.blush(24, 14, 2, c.E);
      P.rect(14, 19, 6, 2, c.R); P.set(17, 21, c.Y);
    } else if (pose === 'up') {
      P.ball(16, 24, 8, 5, fur);
      P.ball(16, 19, 3, 3, fur, { shine: false }); P.oval(16, 19, 1.5, 1.5, white);
      [[9, 0], [20, 1]].forEach(function (l, i) { P.rect(l[0], 27 + (f && i ? -1 : 0), 3, 3, white); });
      P.ball(16, 12, 10, 8.5, fur);
      P.poly([[7, 8], [8, -1], [13, 5]], fur); P.poly([[25, 8], [24, -1], [19, 5]], fur);
      P.rect(11, 19, 10, 2, c.R);
    } else {
      P.ball(16, 24, 7.5, 5, fur);
      P.oval(16, 25, 4, 3, white);
      P.ball(25, 21, 2.6, 2.8, fur, { shine: false }); P.set(25, 21, white);
      [[10, 0], [14, 1], [18, 0], [21, 1]].forEach(function (l, i) { var d = f && i % 2 ? -1 : 0; P.rect(l[0], 27 + d, 3, 3, white); });
      P.ball(16, 12, 10.5, 8.5, fur);
      P.poly([[6, 8], [7, -1], [13, 5]], fur); P.poly([[26, 8], [25, -1], [19, 5]], fur);
      P.set(8, 3, c.E); P.set(8, 4, c.E); P.set(9, 4, c.E); P.set(24, 3, c.E); P.set(24, 4, c.E); P.set(23, 4, c.E);
      P.oval(10, 15, 3, 2.5, white); P.oval(22, 15, 3, 2.5, white); P.oval(16, 16, 4.5, 3.4, white);
      P.eye(10, 10, 3, 4, c.K); P.eye(19, 10, 3, 4, c.K);
      P.rect(15, 14, 2, 1, c.N); P.set(15, 15, c.N); P.set(16, 15, c.N);
      P.set(14, 17, c.N); P.set(17, 17, c.N); P.rect(15, 18, 2, 1, c.N);      // a little "w" mouth
      P.blush(7, 15, 2, c.E); P.blush(23, 15, 2, c.E);
      P.rect(10, 20, 12, 2, c.R); P.rect(15, 22, 2, 2, c.Y);
    }
    P.oy = 0;
  }

  // ======================= monsters =======================
  RPG.monster = function (paint, palette, size) {
    return { w: size || 16, h: size || 16, palette: palette || {}, paint: function (P, pose, f, c) { paint(P, f % 2, c); P.oy = 0; P.ox = 0; } };
  };
})();
