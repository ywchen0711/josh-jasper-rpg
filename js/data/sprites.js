/*
 * Pixel art. Two ways to make a sprite:
 *   1. painted by code at 2x detail (js/pixel.js) — all people, Mochi and the monsters use this:
 *        RPG.chibi({ hair: 'short', mouth: 'grin', glasses: true, adult: true }, { H: hair, S: skin, T: shirt, P: pants, ... })
 *        RPG.pup({ F: fur })
 *        RPG.monster(function (P, frame, colors) { P.ball(16, 18, 9, 8, colors.B); P.eye(12, 15, 3, 4, colors.K); ... }, palette)
 *      The grid is 32x32 (two pixels per game pixel). P.ball draws a shaded round shape, P.eye a cute eye.
 *   2. typed rows: { palette: { char: color }, frames: { pose: [rows, rows] } }  ('.' is transparent, 16x16, upscaled)
 *
 * Walkers have poses down / up / side (side faces right; left is mirrored), 2 frames each.
 * Battle sprites have a pose 'idle' with 2 frames. NPCs can recolor a sprite with `palette` in maps.js.
 */
(function () {
  'use strict';
  var sh = RPG.color.shade, mix = RPG.color.mix;

  // ======================= people =======================
  var SKIN = '#f6cba4', SKIN2 = '#e8b088', SKIN3 = '#c88a60';
  var chibi = RPG.chibi;

  // ======================= monsters (32x32 grid, frame f = 0 / 1) =======================
  function face(P, x, y, gap, c, o) {             // two cute eyes, blush and a small mouth
    o = o || {};
    var w = o.w || 3, h = o.h || 4;
    P.eye(x, y, w, h, c.K || '#2a1c24', o.iris); P.eye(x + gap, y, w, h, c.K || '#2a1c24', o.iris);
    if (o.angry) { P.line(x - 1, y - 2, x + w, y - 1, c.K || '#2a1c24'); P.line(x + gap - 1, y - 1, x + gap + w, y - 2, c.K || '#2a1c24'); }
    if (o.blush !== false) { P.blush(x - 2, y + h + 1, 2); P.blush(x + gap + w, y + h + 1, 2); }
    var mx = x + Math.round((gap + w) / 2) - 1, my = y + h + 2;
    if (o.mouth === 'open') { P.rect(mx - 1, my - 1, 3, 2, '#8a2a3a'); P.set(mx, my, '#ff8090'); }
    else if (o.mouth === 'fang') { P.set(mx - 1, my - 1, '#2a1c24'); P.rect(mx, my - 1, 2, 1, '#2a1c24'); P.set(mx, my, '#ffffff'); }
    else if (o.mouth !== false) { P.set(mx - 1, my - 1, '#2a1c24'); P.set(mx, my, '#2a1c24'); P.set(mx + 1, my - 1, '#2a1c24'); }
  }
  var M = {};

  M.lizard = function (P, f, c) {
    var t = f ? 1 : 0;
    P.ball(5, 22 - t, 4.5, 2.2, c.B, { shine: false }); P.ball(1.5, 20 - t * 2, 2, 1.5, c.B, { shine: false });
    [[10, 0], [14, 1], [18, 0], [21, 1]].forEach(function (l, i) { P.rect(l[0], 25 + (f && i % 2 ? -1 : 0), 2, 4, sh(c.B, -0.3)); });
    P.ball(15, 22, 9, 5, c.B);
    P.oval(15, 25, 6, 1.4, c.N);
    [[11, 19], [15, 18], [19, 19]].forEach(function (s) { P.rect(s[0], s[1], 2, 1, sh(c.B, -0.25)); });
    P.ball(24, 16, 6.5, 5.5, c.B);
    P.eye(22, 13, 3, 4, c.K); P.eye(27, 13, 2, 4, c.K);
    P.blush(20, 18, 2); P.rect(26, 19, 3, 1, '#2a1c24');
  };
  function bird(P, f, c, o) {
    o = o || {};
    var up = f ? 0 : 1;
    P.rect(13, 25, 1, 3, c.Y); P.rect(18, 25, 1, 3, c.Y); P.rect(12, 27, 3, 1, c.Y); P.rect(17, 27, 3, 1, c.Y);
    P.poly(up ? [[8, 16], [0, 6], [3, 18]] : [[8, 16], [0, 24], [5, 20]], c.G); P.poly(up ? [[24, 16], [32, 6], [29, 18]] : [[24, 16], [32, 24], [27, 20]], sh(c.G, -0.15));
    P.ball(16, 17, 9, 8.5, c.W);
    P.oval(16, 21, 6, 3, sh(c.W, -0.08));
    P.poly([[23, 15], [30, 17], [23, 19]], c.Y); P.rect(23, 17, 6, 1, sh(c.Y, -0.3));
    face(P, 13, 12, 6, c, { w: 2, h: 3, angry: o.angry, mouth: false, blush: !o.angry });
    if (o.hat) {                                          // captain's hat
      P.rect(9, 6, 14, 3, c.H); P.rect(10, 3, 12, 3, '#ffffff'); P.rect(10, 3, 12, 1, '#e8e8f0'); P.rect(9, 8, 14, 1, sh(c.H, -0.3));
      P.rect(15, 4, 2, 2, '#f0c840'); P.rect(12, 22, 8, 2, c.A);
    }
  }
  M.gull = function (P, f, c) { bird(P, f, c); };
  M.crow = function (P, f, c) { bird(P, f, c, { angry: true }); };
  M.bigGull = function (P, f, c) { bird(P, f, c, { hat: true, angry: true }); };
  M.bee = function (P, f, c) {
    var wing = 'rgba(220,240,255,0.9)';
    if (f) { P.oval(15, 10, 4, 3, wing); P.oval(21, 10, 4, 3, wing); } else { P.oval(14, 7, 3.5, 5, wing); P.oval(21, 7, 3.5, 5, wing); }
    P.poly([[26, 18], [31, 20], [26, 22]], '#2a1c24');
    P.oval(19, 20, 8, 6.5, c.Y, function (x, y, nx, ny) { var k = (x - 13) % 5 < 2 ? c.K : c.Y; return nx * 0.6 + ny * 0.8 > 0.6 ? sh(k, -0.25) : k; });
    P.set(16, 16, sh(c.Y, 0.6));
    P.line(9, 10, 7, 4, '#2a1c24'); P.line(13, 10, 14, 4, '#2a1c24'); P.ball(7, 4, 1.4, 1.4, '#2a1c24', { shine: false }); P.ball(14, 4, 1.4, 1.4, '#2a1c24', { shine: false });
    P.ball(11, 17, 6.5, 6, c.Y);
    face(P, 8, 15, 5, c, { w: 2, h: 3 });
  };
  M.homework = function (P, f, c) {
    P.oy = f ? -1 : 0;
    P.rect(7, 5, 18, 23, c.W); P.rect(7, 27, 18, 1, sh(c.W, -0.15)); P.rect(24, 5, 1, 23, sh(c.W, -0.12));
    for (var y = 9; y < 27; y += 3) P.rect(9, y, 14, 1, c.L);
    P.poly([[20, 5], [25, 5], [25, 10]], sh(c.W, -0.25)); P.poly([[20, 5], [20, 10], [25, 10]], '#ffffff');
    P.oval(11, 9, 3, 2.5, null); P.rect(9, 7, 5, 4, c.R); P.rect(10, 8, 3, 2, c.W); P.set(11, 8, c.R); P.set(11, 9, c.R);   // a red "0"
    face(P, 11, 14, 7, c, { angry: true, mouth: 'open' });
    P.line(4, 18, 7, 16, c.W); P.line(25, 16, 28, f ? 13 : 19, c.W);
  };
  M.book = function (P, f, c) {
    P.rect(6, 6, 20, 21, c.R); P.rect(6, 6, 3, 21, sh(c.R, -0.3)); P.rect(9, 6, 17, 1, sh(c.R, 0.3));
    P.rect(25, 7, 2, 19, c.W); for (var y = 8; y < 26; y += 2) P.set(26, y, sh(c.W, -0.2));
    P.rect(9, 6, 17, 2, c.Y); P.rect(9, 25, 17, 2, c.Y);
    face(P, 11, 11, 8, c, { angry: true, mouth: false });
    var mh = f ? 4 : 2;
    P.rect(12, 19, 10, mh, '#3a1020'); for (var x = 12; x < 22; x += 2) { P.set(x, 19, '#ffffff'); P.set(x + 1, 18 + mh, '#ffffff'); }
  };
  M.clock = function (P, f, c) {
    var s = f ? 1 : -1;
    P.ball(8 + s, 6, 4, 4, c.Y); P.ball(24 - s, 6, 4, 4, c.Y); P.rect(15, 3, 2, 4, '#5a5a6a'); P.ball(16, 3, 1.5, 1.5, '#5a5a6a', { shine: false });
    P.rect(8, 26, 3, 3, c.K); P.rect(21, 26, 3, 3, c.K);
    P.ball(16, 17, 11, 10, c.R);
    P.oval(16, 17, 8.5, 7.8, c.W);
    for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; P.set(16 + Math.cos(a) * 7, 17 + Math.sin(a) * 6.5, sh(c.W, -0.35)); }
    P.line(16, 17, 16, 11, c.K); P.line(16, 17, 20, 17, c.K);
    face(P, 11, 15, 8, c, { w: 2, h: 3, mouth: 'open' });
    if (f) { P.line(2, 12, 0, 10, c.Y); P.line(30, 12, 32, 10, c.Y); }
  };
  M.slime = function (P, f, c) {
    var rx = f ? 13 : 12, ry = f ? 7.5 : 9, cy = f ? 22 : 21;
    P.ball(16, cy, rx, ry, c.G, { shine: false });
    P.rect(16 - rx + 2, 28, rx * 2 - 4, 1, sh(c.G, -0.35));
    P.oval(10, cy - ry + 4, 2.2, 1.4, '#ffffff'); P.set(13, cy - ry + 3, '#ffffff');
    face(P, 10, cy - 2, 8, c, { mouth: 'open' });
  };
  M.robovac = function (P, f, c) {
    P.line(16, 13, 16, 8, '#5a6470'); P.ball(16, 7, 1.8, 1.8, f ? c.a : '#ffd040', { shine: false });
    P.rect(5, 26, 4, 3, c.K); P.rect(23, 26, 4, 3, c.K);
    P.ball(16, 21, 13, 7, c.M);
    P.oval(16, 18, 10.5, 4.5, sh(c.M, 0.25));
    P.rect(8, 19, 16, 5, '#202838'); P.rect(8, 19, 16, 1, '#3a4a60');
    P.rect(11, 20, 3, 3, c.L); P.rect(18, 20, 3, 3, c.L); P.set(11, 20, '#ffffff'); P.set(18, 20, '#ffffff');
    P.rect(14, 23, 4, 1, c.L);
    P.rect(4, 24, 24, 2, c.G);
  };
  M.bat = function (P, f, c) {
    var up = !f;
    P.poly(up ? [[12, 15], [1, 6], [3, 12], [0, 16], [5, 18], [11, 19]] : [[12, 15], [1, 22], [4, 19], [2, 15], [8, 15]], sh(c.K, 0.1));
    P.poly(up ? [[20, 15], [31, 6], [29, 12], [32, 16], [27, 18], [21, 19]] : [[20, 15], [31, 22], [28, 19], [30, 15], [24, 15]], c.K);
    P.poly([[10, 11], [11, 4], [14, 9]], c.K); P.poly([[22, 11], [21, 4], [18, 9]], c.K);
    P.ball(16, 15, 7, 6.5, c.K);
    P.oval(16, 18, 4, 2.5, sh(c.K, 0.25));
    P.rect(12, 13, 3, 3, '#ffffff'); P.rect(18, 13, 3, 3, '#ffffff'); P.rect(13, 14, 2, 2, c.R); P.rect(18, 14, 2, 2, c.R);
    P.set(15, 19, '#ffffff'); P.set(17, 19, '#ffffff');
  };
  function raccoonBody(P, f, c, o) {
    o = o || {};
    if (o.cape) P.poly([[7, 16], [25, 16], [28, 30], [4, 30]], c.P);
    var sw = f ? 1 : 0;
    for (var i = 0; i < 5; i++) P.ball(25 + sw, 26 - i * 3, 3.2, 2, i % 2 ? c.g : c.G, { shine: false });     // ringed tail
    P.ball(16, 24, 8, 6, c.G);
    P.oval(16, 26, 4.5, 3, c.W);
    P.rect(10, 28, 4, 2, c.g); P.rect(18, 28, 4, 2, c.g);
    P.poly([[7, 8], [8, 1], [13, 5]], c.G); P.poly([[25, 8], [24, 1], [19, 5]], c.G); P.set(9, 4, '#f4a0b0'); P.set(23, 4, '#f4a0b0');
    P.ball(16, 12, 10, 8.5, c.G);
    P.oval(16, 16, 5.5, 3.5, c.W);
    P.oval(11, 12, 4.2, 2.6, c.K); P.oval(21, 12, 4.2, 2.6, c.K);
    P.eye(10, 11, 2, 3, '#ffffff'); P.eye(20, 11, 2, 3, '#ffffff'); P.rect(11, 12, 1, 2, c.K); P.rect(21, 12, 1, 2, c.K);
    P.rect(15, 15, 2, 1, c.N); P.set(15, 17, c.N); P.set(16, 17, c.N);
    P.blush(7, 15, 2); P.blush(23, 15, 2);
    if (o.angry) { P.line(8, 8, 13, 9, c.K); P.line(19, 9, 24, 8, c.K); }
  }
  M.raccoon = function (P, f, c) { raccoonBody(P, f, c); P.ball(9, 22, 2.5, 2.2, '#f0c060'); };
  M.raccoonGuard = function (P, f, c) {
    P.line(27, 8, 24 + (f ? 1 : 0), 28, '#8a5a30'); P.line(28, 8, 25 + (f ? 1 : 0), 28, '#6a4020');
    raccoonBody(P, f, c, { angry: true });
    P.oval(16, 5, 9, 4, '#9aa4b0'); P.rect(7, 5, 18, 3, '#9aa4b0'); P.rect(7, 7, 18, 1, '#6a7480'); P.rect(9, 3, 3, 2, '#c8d0da');   // bucket helmet
  };
  M.king = function (P, f, c) {
    raccoonBody(P, f, c, { cape: true });
    var b = f ? -1 : 0;
    var cy = 2 + b;                                       // crown: three points over a jeweled band
    [10, 15, 20].forEach(function (x) { P.poly([[x - 0.5, cy + 2], [x + 1, cy - 2.5], [x + 2.5, cy + 2]], c.Y); P.set(x + 1, cy - 2, sh(c.Y, 0.5)); });
    P.rect(10, cy + 1, 12, 3, c.Y); P.rect(10, cy + 1, 12, 1, sh(c.Y, 0.35)); P.rect(10, cy + 3, 12, 1, sh(c.Y, -0.3));
    P.set(12, cy + 2, c.R); P.set(16, cy + 2, '#40a0ff'); P.set(19, cy + 2, c.R);
    P.ball(26, 21, 3.5, 3, c.Y); P.rect(25, 24, 3, 3, sh(c.Y, -0.2)); P.rect(24, 27, 5, 1, c.Y);      // the stolen trophy
  };
  M.possum = function (P, f, c) {
    P.line(4, 26, 1, 20 + (f ? 1 : 0), '#f0a0b0'); P.line(5, 26, 2, 20 + (f ? 1 : 0), '#f0a0b0');
    P.ball(14, 23, 9, 6, c.G);
    P.rect(8, 27, 3, 2, '#f0a0b0'); P.rect(18, 27, 3, 2, '#f0a0b0');
    P.ball(11, 8, 3, 3, '#f0b0c0'); P.ball(23, 8, 3, 3, '#f0b0c0');
    P.ball(17, 14, 8.5, 7, c.W);
    P.poly([[20, 14], [30, 17], [20, 20]], c.W); P.ball(29, 17, 1.8, 1.6, '#f070a0', { shine: false });
    P.eye(13, 11, 2, 3, '#2a1c24'); P.eye(19, 11, 2, 3, '#2a1c24'); P.blush(11, 16, 2); P.blush(21, 16, 2);
  };
  M.squirrel = function (P, f, c) {
    var sw = f ? 1 : 0;
    P.ball(24 + sw, 14, 6.5, 10, sh(c.B, 0.15)); P.oval(25 + sw, 9, 3, 4, sh(c.B, 0.35));
    P.ball(14, 23, 7, 6, c.B); P.oval(14, 25, 4, 3.5, c.W);
    P.rect(8, 27, 3, 2, sh(c.B, -0.3)); P.rect(17, 27, 3, 2, sh(c.B, -0.3));
    P.poly([[7, 7], [8, 1], [11, 5]], c.B); P.poly([[19, 7], [18, 1], [15, 5]], c.B);
    P.ball(13, 12, 7.5, 7, c.B);
    P.oval(9, 15, 2.5, 2, c.W); P.oval(17, 15, 2.5, 2, c.W);
    face(P, 9, 10, 6, c, { w: 2, h: 3 });
    P.ball(13, 21, 2.6, 2.4, '#c89048', { shine: false }); P.rect(11, 18, 5, 2, '#6a4020');   // an acorn
  };
  M.roadrunner = function (P, f, c) {
    P.poly([[9, 18], [0, 6], [3, 5], [12, 15]], sh(c.B, -0.25));
    if (f) { P.line(13, 23, 9, 29, c.L); P.line(17, 23, 21, 29, c.L); } else { P.line(14, 23, 13, 29, c.L); P.line(17, 23, 18, 29, c.L); }
    P.ball(15, 18, 8, 5.5, c.B);
    for (var i = 0; i < 6; i++) P.set(10 + i * 2, 17 + (i % 2), sh(c.B, 0.4));
    P.ball(22, 11, 5.5, 5, c.B);
    P.poly([[19, 7], [17, 1], [21, 5]], sh(c.B, -0.3)); P.poly([[21, 6], [21, 0], [24, 5]], sh(c.B, -0.3));
    P.poly([[26, 10], [32, 12], [26, 13]], '#3a3a44');
    P.eye(22, 9, 2, 3, c.K); P.rect(24, 10, 2, 1, '#40a0e0'); P.rect(24, 11, 2, 1, '#ff6040'); P.blush(20, 13, 2);
  };
  M.tumbleweed = function (P, f, c) {
    var s = f ? 2 : 0;
    P.oval(16, 18, 11, 10, null, null);
    P.oval(16, 18, 11, 10, c.B, function (x, y, nx, ny) {
      var k = (x * 3 + y * 5 + s * 3) % 7;
      return k < 2 ? sh(c.B, -0.3) : k === 3 ? sh(c.B, 0.3) : (x + y + s) % 3 === 0 ? c.B : null;
    });
    P.oval(16, 28, 9, 1.2, 'rgba(120,90,50,0.5)');
    P.oval(12, 16, 2.6, 3, '#ffffff'); P.oval(20, 16, 2.6, 3, '#ffffff');
    P.rect(12, 16, 2, 2, '#2a1c24'); P.rect(20, 16, 2, 2, '#2a1c24'); P.set(12, 16, '#ffffff'); P.set(20, 16, '#ffffff');
    P.rect(15, 21, 3, 1, '#2a1c24');
  };
  M.rattler = function (P, f, c) {
    var r = f ? -1 : 0;
    P.rect(3, 19 + r, 3, 2, c.Y); P.rect(3, 21 + r, 3, 1, sh(c.Y, -0.3)); P.rect(3, 22 + r, 3, 2, c.Y);
    P.ball(16, 25, 11, 4, c.G); P.oval(16, 26.5, 8, 1.5, c.W);
    P.ball(16, 20, 8, 3.5, c.G);
    [[9, 24], [15, 23], [21, 24], [12, 19], [18, 19]].forEach(function (d) { P.rect(d[0], d[1], 2, 1, sh(c.G, -0.3)); });
    P.rect(15, 13, 5, 7, c.G); P.rect(15, 13, 1, 7, sh(c.G, 0.25));
    P.ball(18, 10, 6.5, 5.5, c.G);
    P.oval(18, 13, 3.5, 1.8, c.W);
    face(P, 14, 7, 6, c, { w: 2, h: 3, mouth: false });
    if (f) { P.rect(24, 12, 3, 1, '#e03040'); P.set(27, 11, '#e03040'); P.set(27, 13, '#e03040'); }
  };
  M.pencil = function (P, f, c) {
    P.oy = f ? -1 : 0;
    P.rect(11, 2, 10, 4, '#f4a0b0'); P.rect(11, 2, 10, 1, '#ffc8d4');
    P.rect(11, 6, 10, 2, '#c0c8d0'); P.rect(11, 7, 10, 1, '#8a929c');
    P.rect(11, 8, 10, 15, c.Y); P.rect(11, 8, 2, 15, sh(c.Y, 0.3)); P.rect(19, 8, 2, 15, sh(c.Y, -0.25)); P.rect(15, 8, 1, 15, sh(c.Y, -0.12));
    P.poly([[11, 23], [21, 23], [16, 30]], '#f0d0a0'); P.poly([[14.5, 27.5], [17.5, 27.5], [16, 30.5]], '#3a3a44');
    face(P, 12, 11, 5, c, { w: 2, h: 3, angry: true });
    P.line(8, 16, 11, 14, '#3a3a44'); P.line(21, 14, 24, f ? 11 : 17, '#3a3a44');
  };
  M.beaker = function (P, f, c) {
    var glass = 'rgba(220,240,255,0.85)';
    P.rect(12, 3, 8, 2, sh('#dceeff', -0.15)); P.rect(13, 5, 6, 8, glass);
    P.poly([[13, 12], [19, 12], [27, 28], [5, 28]], glass);
    P.poly([[10, 19], [22, 19], [26.5, 27.5], [5.5, 27.5]], c.L);
    for (var x = 10; x < 23; x += 2) P.set(x, 19 + ((x + f) % 2), sh(c.L, 0.35));
    P.rect(6, 28, 21, 1, sh('#dceeff', -0.3));
    P.set(14 + f * 2, 16 - f * 2, sh(c.L, 0.4)); P.set(17 - f, 10 + f, sh(c.L, 0.4)); P.set(16, 7 - f, '#ffffff');
    P.rect(7, 22, 1, 4, '#ffffff');
    face(P, 11, 21, 7, c, { w: 2, h: 3, mouth: 'open' });
  };
  M.mushroom = function (P, f, c) {
    var sq = f ? 1 : 0;
    P.ball(16, 24, 6.5, 5.5, c.W);
    P.ball(16, 12 + sq, 13, 8.5 - sq, c.B);
    P.rect(4, 15 + sq, 24, 2, sh(c.B, -0.35));
    [[10, 9], [20, 8], [15, 13], [25, 13], [7, 13]].forEach(function (d) { P.oval(d[0], d[1] + sq, 1.8, 1.4, '#ffffff'); });
    P.rect(12, 22, 3, 1, '#2a1c24'); P.rect(18, 22, 3, 1, '#2a1c24');           // sleepy eyes
    P.blush(10, 24, 2); P.blush(21, 24, 2); P.set(16, 26, '#2a1c24');
  };

  RPG.add('sprites', {
    // ---- party ----
    josh:   chibi({ hair: 'cap' }, { H: '#2e9e44', h: '#5a3418', S: SKIN, T: '#46c460', P: '#2a4fa8', B: '#4a2a14', G: '#e8a030' }),
    jasper: chibi({ hair: 'short', mouth: 'grin' }, { H: '#1c1614', S: '#f0c49a', T: '#4a504c', P: '#a8c4e0', B: '#2a2a2e', G: '#e05a5a' }),
    mochi:  RPG.pup({ F: '#e8a860' }),
    mia:    chibi({ hair: 'pony' }, { H: '#8a4a24', S: SKIN, T: '#f06a9a', P: '#7a5ac8', B: '#ffffff', G: '#f0c040', A: '#ffd040', I: '#6a8a3a' }),
    ethan:  chibi({ hair: 'spiky', glasses: true, mouth: 'open' }, { H: '#3a2618', S: SKIN2, T: '#3ab0a0', P: '#c8a878', B: '#3a3a44', G: '#5a6ad0', A: '#2a2a3a', I: '#3a5a8a' }),
    // ---- townsfolk (recolor with `palette` in maps.js) ----
    kid:       chibi({ hair: 'short' }, { H: '#6a3a1a', T: '#d84a4a', P: '#2a3a6a' }),
    kidGirl:   chibi({ hair: 'pony' }, { H: '#c89040', T: '#e05a8a', P: '#5a3a6a', A: '#80d0ff' }),
    adult:     chibi({ adult: true, pack: false }, { H: '#4a2a14', T: '#5a7ab8', P: '#3a3a4a', B: '#2a2a2a' }),
    mom:       chibi({ adult: true, pack: false, hair: 'bob' }, { H: '#5a3418', T: '#e07090', P: '#3a3a5a' }),
    principal: chibi({ adult: true, pack: false, hair: 'bald', mustache: true }, { H: '#a0a0a8', S: SKIN2, T: '#2a64b8', P: '#2a2a3a', B: '#202020' }),
    nurse:     chibi({ adult: true, pack: false, hair: 'bun' }, { H: '#2a1a10', T: '#f4f4f4', P: '#9ad0f0', A: '#e04060' }),
    librarian: chibi({ adult: true, pack: false, hair: 'bun', glasses: true }, { H: '#8a5a2a', T: '#9a5ac8', P: '#3a3a4a', A: '#5a3a2a' }),
    oldman:    chibi({ adult: true, pack: false, hair: 'bald', mustache: true }, { H: '#e8e8ec', S: SKIN, T: '#8a6a4a', P: '#4a4a4a' }),
    dad:       chibi({ adult: true, pack: false, hair: 'cap' }, { H: '#4a3220', h: '#3a2818', S: SKIN, T: '#f0c840', P: '#3a3a4a', B: '#2a2a2a' }),
    // the hidden boss: Dad's outline in the dark, with glowing eyes
    jeffShadow: RPG.silhouette(chibi({ adult: true, pack: false, hair: 'cap' }, { H: '#4a3220' }), { eyes: [[11, 10], [19, 10]] }),
    capAdult:  chibi({ adult: true, pack: false, hair: 'cap' }, { H: '#d84040', h: '#2a2a2a', T: '#d84040', P: '#2a2a3a' }),
    coyote:    chibi({ hair: 'hood' }, { H: '#b88a5a', S: SKIN, T: '#2a64b8', P: '#2a64b8', B: '#3a2a1a', G: '#2a64b8', A: '#f4c8a0' }),
    // ---- things ----
    chest:  { palette: { K: '#2a1808', b: '#a0622a', B: '#7a4418', Y: '#f0c040' }, frames: {
      closed: [['................', '................', '..KKKKKKKKKKKK..', '.KbbbbbbbbbbbbK.', '.KbBBBBBBBBBBbK.', '.KbbbbbbbbbbbbK.',
                '.KYYYYYYYYYYYYK.', '.KbbbbbYYbbbbbK.', '.KBBBBBYYBBBBBK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '................', '................', '................']],
      open:   [['................', '..KKKKKKKKKKKK..', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '.K............K.', '.K............K.',
                '.KYYYYYYYYYYYYK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '................', '................', '................']] } },
    // ---- monsters ----
    lizard:     RPG.monster(M.lizard, { B: '#b8945e', N: '#4a7ae0', K: '#2a1c24' }),
    gull:       RPG.monster(M.gull, { G: '#a8b4c4', W: '#ffffff', Y: '#f0a020', K: '#2a1c24' }),
    crow:       RPG.monster(M.crow, { G: '#2a2a3a', W: '#4a4a62', Y: '#f0b020', K: '#ff5050' }),
    bigGull:    RPG.monster(M.bigGull, { G: '#a8b4c4', W: '#ffffff', Y: '#f0a020', K: '#2a1c24', H: '#2a3a7a', A: '#e04040' }),
    bee:        RPG.monster(M.bee, { Y: '#f8c820', K: '#2a1c24' }),
    homework:   RPG.monster(M.homework, { W: '#fafaf2', L: '#9ab8e8', R: '#e03030', K: '#2a1c24' }),
    book:       RPG.monster(M.book, { R: '#b03040', Y: '#f0c860', W: '#fff4e0', K: '#2a1c24' }),
    clock:      RPG.monster(M.clock, { R: '#e04848', Y: '#f0c840', W: '#fffaf0', K: '#2a1c24' }),
    slime:      RPG.monster(M.slime, { G: '#6ad050', K: '#1a3a1a' }),
    robovac:    RPG.monster(M.robovac, { M: '#b0bac6', L: '#80e8ff', G: '#5a6470', K: '#202430', a: '#ff4040' }),
    bat:        RPG.monster(M.bat, { K: '#4a3a6a', R: '#ff4060' }),
    raccoon:    RPG.monster(M.raccoon, { G: '#8a8a96', g: '#4a4a56', W: '#f4f4f4', K: '#2a2a34', N: '#1a1a20' }),
    raccoonGuard: RPG.monster(M.raccoonGuard, { G: '#7a7a88', g: '#40404c', W: '#eaeaea', K: '#24242c', N: '#1a1a20' }),
    king:       RPG.monster(M.king, { G: '#8a8a96', g: '#4a4a56', W: '#f4f4f4', K: '#2a2a34', N: '#1a1a20', Y: '#f4c840', R: '#e03040', P: '#8a3ab0' }),
    possum:     RPG.monster(M.possum, { G: '#9a9aa8', W: '#f8f4f0' }),
    squirrel:   RPG.monster(M.squirrel, { B: '#b06a3a', W: '#f8e8d0', K: '#2a1c24' }),
    roadrunner: RPG.monster(M.roadrunner, { B: '#8a6a4a', L: '#6a7a9a', K: '#2a1c24' }),
    tumbleweed: RPG.monster(M.tumbleweed, { B: '#c8a060' }),
    rattler:    RPG.monster(M.rattler, { G: '#8aa858', W: '#f0e0b0', Y: '#e8c870', K: '#2a1c24' }),
    pencil:     RPG.monster(M.pencil, { Y: '#f8c830', K: '#2a1c24' }),
    beaker:     RPG.monster(M.beaker, { L: '#70e070', K: '#1a3a1a' }),
    mushroom:   RPG.monster(M.mushroom, { B: '#7a70e8', W: '#f8f0e0' })
  });
  void mix; void SKIN3;
})();
