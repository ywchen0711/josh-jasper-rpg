/*
 * Chapter 2 — 校外教學大騷動！ / Field Trip Frenzy!
 * The class goes on a field trip to Torrey Pines: a chaotic bus ride, a hermit crab that stole the lunch cooler,
 * a tide-pool octopus with Dad's camera, then the fog rolls in, Mochi goes missing, a "ghost" haunts the bluffs
 * and something huge waits in the sea cave at Flat Rock.
 *
 * Everything for the chapter is in this one file (art, tiles, backdrops, skills, items, enemies, shops, maps and
 * story scripts) plus the texts in js/lang/zh.ch2.js and js/lang/en.ch2.js. It also hooks into Chapter 1:
 *   - config.endingAfter: after the Chapter 1 ending the story continues here (instead of going back to the title)
 *   - a few NPCs on the Chapter 1 maps get Chapter 2 lines (see "changes to Chapter 1 maps" at the bottom)
 *
 * Story flags: ch2 (chapter started) → ch2_bus → ch2_sunbot + ch2_mochi (arrive) → ch2_crab_seen → ch2_lunch
 *              → tp_star / tp_anemone / tp_hare → ch2_inkyOut → ch2_inky → ch2_fog + ch2_search → ch2_ghost
 *              → ch2_kraken → ch2_done            optional: sandking_done
 */
(function () {
  'use strict';
  var sh = RPG.color.shade, W = RPG.W, H = RPG.H;
  var chibi = RPG.chibi;

  // ======================= people =======================
  var SKIN = '#f6cba4', SKIN2 = '#e8b088';
  var PAL = {
    leo:       { H: '#2a1a10', T: '#4a9ad8', P: '#3a3a4a' },
    ava:       { H: '#c89040', T: '#e05a8a', P: '#5a3a6a' },
    noah:      { H: '#1a1a1a', T: '#f0d040', P: '#2a4a2a' },
    lifeguard: { H: '#e04040', h: '#e8c890', T: '#e04040', P: '#f0d040' },
    ranger:    { H: '#5a3a1a', T: '#7a8a3a', P: '#5a4a2a', G: '#7a8a3a' },
    shack:     { H: '#6a3a1a', T: '#40b0a0', P: '#f0a040' }
  };

  // ======================= monsters (32x32 grid, frame f = 0 / 1) =======================
  function face(P, x, y, gap, o) {
    o = o || {};
    var w = o.w || 3, h = o.h || 4, k = o.k || '#2a1c24';
    P.eye(x, y, w, h, k); P.eye(x + gap, y, w, h, k);
    if (o.angry) { P.line(x - 1, y - 2, x + w, y - 1, k); P.line(x + gap - 1, y - 1, x + gap + w, y - 2, k); }
    if (o.blush !== false) { P.blush(x - 2, y + h + 1, 2); P.blush(x + gap + w, y + h + 1, 2); }
    var mx = x + Math.round((gap + w) / 2) - 1, my = y + h + 2;
    if (o.mouth === 'open') { P.rect(mx - 1, my - 1, 3, 2, '#8a2a3a'); P.set(mx, my, '#ff8090'); }
    else if (o.mouth !== false) { P.set(mx - 1, my - 1, k); P.set(mx, my, k); P.set(mx + 1, my - 1, k); }
  }
  var S = {};
  S.crab = function (P, f, c) {
    var u = f ? -1 : 0, d = sh(c.R, -0.3);
    [[9, 22, 4, 28], [11, 24, 7, 29], [23, 22, 28, 28], [21, 24, 25, 29]].forEach(function (l) { P.line(l[0], l[1], l[2], l[3], d); });
    P.line(10, 18, 6, 14 + u, d); P.line(22, 18, 26, 14 + u, d);
    P.ball(5, 11 + u, 4.5, 4, c.R); P.ball(3, 6 + u, 2, 2.6, c.R); P.ball(27, 11 + u, 4.5, 4, c.R); P.ball(29, 6 + u, 2, 2.6, c.R);
    P.rect(12, 11, 1, 6, d); P.rect(19, 11, 1, 6, d);
    P.ball(16, 20, 10, 6.5, c.R); P.oval(16, 23.5, 6, 1.8, sh(c.R, 0.3));
    P.ball(12.5, 9, 2.6, 2.6, '#ffffff', { shine: false }); P.ball(19.5, 9, 2.6, 2.6, '#ffffff', { shine: false });
    P.rect(12, 9, 2, 2, c.K); P.rect(19, 9, 2, 2, c.K); P.set(12, 9, '#ffffff'); P.set(19, 9, '#ffffff');
    P.blush(10, 20, 2); P.blush(20, 20, 2); P.set(15, 21, c.K); P.set(16, 22, c.K); P.set(17, 21, c.K);
  };
  S.jelly = function (P, f, c) {
    for (var i = 0; i < 5; i++) for (var y = 18; y < 30; y++) P.set(8 + i * 4 + Math.round(Math.sin((y + i * 2 + f * 3) / 2) * 1.2), y, i % 2 ? c.T : sh(c.T, -0.2));
    P.oval(16, 14 - f, 11, 9, c.P, function (x, y, nx, ny) { return ny > 0.45 ? null : ny < -0.5 && nx < -0.1 ? sh(c.P, 0.45) : ny > 0.2 ? sh(c.P, -0.2) : c.P; });
    P.rect(6, 18 - f, 21, 1, sh(c.P, -0.3));
    face(P, 11, 11 - f, 7, { w: 2, h: 3 });
    P.set(9, 8 - f, '#ffffff'); P.set(10, 7 - f, '#ffffff');
  };
  S.castle = function (P, f, c, crown) {
    var s = c.S, d = sh(s, -0.25), l = sh(s, 0.3);
    P.rect(4, 14, 24, 15, s); P.rect(4, 14, 24, 1, l); P.rect(4, 27, 24, 2, d);
    [4, 14, 24].forEach(function (x) { P.rect(x, 11, 4, 3, s); P.rect(x, 11, 4, 1, l); });
    P.rect(11, 5, 10, 9, s); P.rect(11, 5, 10, 1, l); [11, 15, 19].forEach(function (x) { P.rect(x, 2, 2, 3, s); });
    P.rect(15, 22, 4, 7, sh(s, -0.5)); P.oval(17, 22, 2, 2, sh(s, -0.5));
    for (var i = 0; i < 16; i++) P.set(5 + ((i * 7) % 22), 16 + ((i * 5) % 10), i % 2 ? d : l);
    P.rect(13, 7, 1, 2, d); P.rect(18, 7, 1, 2, d);
    if (crown) {
      [11, 15, 19].forEach(function (x) { P.poly([[x - 1, 3], [x + 1, -1], [x + 3, 3]], c.Y); });
      P.rect(10, 2, 12, 2, c.Y); P.set(16, 2, '#e03040'); P.set(12, 2, '#40a0ff'); P.set(20, 2, '#40a0ff');
      P.poly([[2, 14], [0, 30], [4, 30]], c.R); P.poly([[30, 14], [32, 30], [28, 30]], c.R);
    } else { P.line(12, 0, 12, 2, '#6a4a2a'); P.rect(13, f, 3, 2, c.F); }
    face(P, 11, 16, 7, { w: 3, h: 3, angry: true, mouth: 'open', blush: false });
    P.ball(8, 25, 1.6, 1.2, c.B, { shine: false }); P.ball(25, 24, 1.6, 1.2, '#ffffff', { shine: false });
  };
  S.starfish = function (P, f, c) {
    var cy = 17 - f, pts = [], i, a;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; pts.push([16 + Math.cos(a) * (i % 2 ? 6 : 14), cy + Math.sin(a) * (i % 2 ? 6 : 14)]); }
    P.poly(pts, c.O); pts = [];
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; pts.push([15 + Math.cos(a) * (i % 2 ? 4 : 10), cy - 1 + Math.sin(a) * (i % 2 ? 4 : 10)]); }
    P.poly(pts, sh(c.O, 0.22));
    [[16, 6], [9, 13], [23, 13], [11, 24], [21, 24]].forEach(function (d) { P.set(d[0], d[1] - f, sh(c.O, 0.6)); });
    face(P, 12, 14 - f, 6, { w: 2, h: 3 });
  };
  S.urchin = function (P, f, c) {
    for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8 + (f ? 0.12 : 0); P.line(16 + Math.cos(a) * 7, 19 + Math.sin(a) * 6, 16 + Math.cos(a) * 14, 19 + Math.sin(a) * 11, i % 2 ? c.U : sh(c.U, -0.3)); }
    P.ball(16, 19, 9, 7.5, c.U);
    face(P, 12, 16, 6, { w: 2, h: 3, angry: true });
  };
  S.seaHare = function (P, f, c) {
    var w = f ? 1 : 0;
    P.ball(16, 22, 12, 6, c.H); P.oval(16, 26, 10, 2, sh(c.H, -0.3));
    P.poly([[7, 18], [5, 9 + w], [10, 16]], c.H); P.poly([[12, 17], [12, 8 - w], [15, 16]], c.H);
    P.ball(22, 16, 4, 3, sh(c.H, 0.2));
    [[10, 21], [18, 19], [23, 23], [14, 25], [26, 20]].forEach(function (d) { P.ball(d[0], d[1], 1.4, 1.2, c.S, { shine: false }); });
    face(P, 7, 19, 6, { w: 2, h: 3 });
  };
  S.wisp = function (P, f, c) {
    var b = f ? -1 : 0;
    P.oval(16, 13 + b, 10, 9, c.W, function (x, y, nx, ny) { return ny < -0.4 && nx < 0 ? sh(c.W, 0.4) : c.W; });
    P.rect(6, 13 + b, 21, 9, c.W);
    for (var i = 0; i < 5; i++) P.ball(8 + i * 4, 22 + b + ((i + f) % 2), 2.2, 2.6, c.W, { shine: false });
    P.oval(12, 13 + b, 2, 3, c.K); P.oval(20, 13 + b, 2, 3, c.K); P.set(12, 12 + b, c.E); P.set(20, 12 + b, c.E);
    P.oval(16, 19 + b, 1.5, 1.5, c.K);
  };
  S.owl = function (P, f, c) {
    P.poly([[8, 9], [9, 2], [13, 7]], c.B); P.poly([[24, 9], [23, 2], [19, 7]], c.B);
    P.ball(5, 20, 3, 7, sh(c.B, -0.2)); P.ball(27, 20, 3, 7, sh(c.B, -0.2));
    P.ball(16, 18, 11, 11, c.B); P.oval(16, 22, 7, 7, c.L);
    for (var i = 0; i < 6; i++) P.set(12 + (i % 3) * 4, 19 + Math.floor(i / 3) * 4, sh(c.L, -0.3));
    P.ball(11, 13, 4.5, 4.5, '#f8f0e0', { shine: false }); P.ball(21, 13, 4.5, 4.5, '#f8f0e0', { shine: false });
    P.ball(11, 13, 3, 3, c.Y, { shine: false }); P.ball(21, 13, 3, 3, c.Y, { shine: false });
    if (f) { P.rect(8, 13, 7, 1, sh(c.B, -0.3)); P.rect(18, 13, 7, 1, sh(c.B, -0.3)); }
    else { P.rect(10, 12, 2, 3, '#1a1010'); P.rect(20, 12, 2, 3, '#1a1010'); P.set(10, 12, '#ffffff'); P.set(20, 12, '#ffffff'); }
    P.poly([[15, 16], [17.5, 16], [16, 19]], '#f0a030');
    P.rect(12, 28, 2, 2, '#f0a030'); P.rect(18, 28, 2, 2, '#f0a030');
  };
  S.eel = function (P, f, c) {
    for (var i = 0; i < 24; i++) {
      var y = 25 + Math.round(Math.sin((i + f * 3) / 4) * 2.5) - (i > 16 ? (i - 16) * 1.3 : 0);
      P.ball(3 + i, y, 2.6, 2.6, i % 4 === 0 ? sh(c.G, -0.2) : c.G, { shine: false });
      if (i % 3 === 0) P.set(3 + i, y + 2, sh(c.G, 0.35));
    }
    P.ball(26, 12, 5, 4.5, c.G); P.oval(26, 15, 3.5, 1.2, sh(c.G, 0.3));
    P.poly([[27, 13], [31.5, 14], [27, 17]], '#2a1018'); P.set(29, 14, '#ffffff'); P.set(28, 16, '#ffffff');
    P.eye(23, 9, 2, 3, c.K);
  };
  S.barnacle = function (P, f, c) {
    [[8, 25, 6], [23, 24, 7], [16, 20, 8], [7, 15, 4.5], [25, 14, 5]].forEach(function (b, i) {
      var top = b[1] - b[2] * 0.7;
      P.poly([[b[0] - b[2], b[1] + b[2] * 0.6], [b[0] - b[2] * 0.45, top], [b[0] + b[2] * 0.45, top], [b[0] + b[2], b[1] + b[2] * 0.6]], i % 2 ? sh(c.B, -0.1) : c.B);
      P.rect(b[0] - b[2] * 0.45, top, b[2] * 0.9, 1, sh(c.B, 0.35));
      P.oval(b[0], top, b[2] * 0.35, 0.8, sh(c.B, -0.55));
      if ((i + f) % 2) for (var k = -2; k <= 2; k++) P.line(b[0], top, b[0] + k * 1.4, top - 4, c.F);
    });
    face(P, 12, 19, 6, { w: 2, h: 3, mouth: false, blush: false });
  };
  S.sunbot = function (P, f, c) {
    var b = f ? -1 : 0, a1 = f ? 2 : 0, a2 = f ? 0 : 2;
    P.line(9, 15 + b, 4, 11 + a1, '#8a929c'); P.line(23, 15 + b, 28, 11 + a2, '#8a929c'); P.ball(4, 10 + a1, 1.6, 1.6, c.O); P.ball(28, 10 + a2, 1.6, 1.6, c.O);
    P.rect(9, 7 + b, 14, 20, c.W); P.rect(9, 7 + b, 2, 20, sh(c.W, 0.3)); P.rect(21, 7 + b, 2, 20, sh(c.W, -0.2));
    P.rect(11, 3 + b, 10, 4, c.O); P.rect(14, 0 + b + 1, 4, 2, c.O); P.rect(18, 1 + b, 6, 2, c.O);
    P.rect(10, 15 + b, 12, 7, c.Y); P.ball(16, 18.5 + b, 2.5, 2.5, '#ffffff', { shine: false });
    for (var i = 0; i < 8; i++) P.set(16 + Math.round(Math.cos(i * Math.PI / 4) * 4), 18.5 + b + Math.round(Math.sin(i * Math.PI / 4) * 3), '#ffffff');
    P.rect(11, 9 + b, 10, 4, '#202430'); P.rect(12, 10 + b, 3, 2, c.L); P.rect(17, 10 + b, 3, 2, c.L);
    P.rect(10, 27 + b, 4, 3, '#5a6470'); P.rect(18, 27 + b, 4, 3, '#5a6470');
    if (f) { P.set(25, 1, '#ffffff'); P.set(27, 0, '#ffffff'); P.set(26, 3, '#ffffff'); P.set(29, 2, '#ffffff'); }
  };
  S.coolerCrab = function (P, f, c) {
    var u = f ? -1 : 0, d = sh(c.R, -0.3);
    [[8, 25, 3, 30], [11, 26, 7, 31], [24, 25, 29, 30], [21, 26, 25, 31]].forEach(function (l) { P.line(l[0], l[1], l[2], l[3], d); });
    P.rect(12, 4, 1, 6, d); P.rect(19, 4, 1, 6, d);
    P.ball(12.5, 4, 2.4, 2.4, '#ffffff', { shine: false }); P.ball(19.5, 4, 2.4, 2.4, '#ffffff', { shine: false });
    P.rect(12, 4, 2, 2, c.K); P.rect(19, 4, 2, 2, c.K); P.set(12, 4, '#ffffff'); P.set(19, 4, '#ffffff');
    P.poly([[9, 2], [23, 2], [20, 0], [12, 0]], '#2a2a3a'); P.rect(15, 0, 2, 1, c.Y);          // a tiny captain's hat
    P.rect(5, 10, 22, 17, c.C); P.rect(5, 10, 22, 1, sh(c.C, 0.35)); P.rect(5, 25, 22, 2, sh(c.C, -0.3)); P.rect(24, 10, 3, 17, sh(c.C, -0.15));
    P.rect(7, 15, 18, 2, '#ffffff');
    P.rect(4, 8, 24, 3, '#f4f4f4'); P.rect(4, 8, 24, 1, '#ffffff'); P.rect(13, 6, 6, 2, '#d0d0d8');
    P.blush(8, 20, 2); P.blush(22, 20, 2); P.rect(14, 21, 4, 1, '#2a1c24'); P.set(13, 20, '#2a1c24'); P.set(18, 20, '#2a1c24');
    P.ball(4, 17 + u, 4.5, 4.2, c.R); P.ball(2, 12 + u, 2.2, 3, c.R);
    P.ball(28, 15 + u, 5.5, 5, c.R); P.ball(30.5, 9 + u, 2.5, 3.4, c.R); P.set(27, 13 + u, sh(c.R, 0.5));
  };
  S.inky = function (P, f, c) {
    var s = f ? 1 : 0;
    for (var i = 0; i < 6; i++) {
      var bx = 5 + i * 4.4;
      for (var k = 0; k < 9; k++) P.ball(bx + Math.round(Math.sin((k + i * 1.7 + s * 2) / 2.2) * 1.6), 19 + k, 1.8 - k * 0.1, 1.2, i % 2 ? c.O : sh(c.O, -0.15), { shine: false });
    }
    P.ball(16, 13, 11, 10, c.O); P.oval(16, 19, 9, 2.5, sh(c.O, -0.2));
    [[9, 7], [22, 8], [11, 16], [21, 16]].forEach(function (d) { P.ball(d[0], d[1], 1.2, 1, sh(c.O, 0.35), { shine: false }); });
    P.eye(10, 10, 3, 4, '#2a1c24'); P.eye(19, 10, 3, 4, '#2a1c24');
    if (c.M) { for (var a = 0; a < 20; a++) P.set(20.5 + Math.cos(a * Math.PI / 10) * 3.6, 12 + Math.sin(a * Math.PI / 10) * 3.6, c.M); P.line(24, 14, 25, 21, c.M); }
    P.poly([[11, 18], [16, 16.5], [16, 18.5], [10, 20]], '#3a1a2a'); P.poly([[21, 18], [16, 16.5], [16, 18.5], [22, 20]], '#3a1a2a');
    if (c.C) { P.rect(24 + s, 21, 7, 5, '#2a2a30'); P.ball(27.5 + s, 23.5, 1.6, 1.6, '#8ac8f8', { shine: false }); P.set(25 + s, 21, '#e04040'); }
    P.blush(7, 15, 2); P.blush(23, 16, 2);
  };
  S.towelGhost = function (P, f, c) {
    var b = f ? -1 : 0, st = [c.R, '#ffffff', c.Y, '#ffffff', c.B];
    function stripe(x, y) { return st[Math.floor((x + y * 0.4 + 40) / 3) % 5]; }
    P.poly([[5, 14 + b], [0, 9 + (f ? 4 : 0)], [6, 20 + b]], st[0]); P.poly([[27, 14 + b], [32, 8 + (f ? 4 : 0)], [26, 20 + b]], st[4]);
    P.oval(16, 12 + b, 11, 10, '#ffffff', function (x, y) { return stripe(x, y); });
    for (var x = 5; x <= 27; x++) for (var y = 12 + b; y < 30; y++) if (y < 26 + Math.sin(x / 1.6 + f * 2) * 2.2) P.set(x, y, stripe(x, y));
    P.oval(12, 12 + b, 2.5, 3.5, '#1a1028'); P.oval(20, 12 + b, 2.5, 3.5, '#1a1028'); P.set(12, 12 + b, c.G); P.set(20, 12 + b, c.G);
    P.oval(16, 19 + b, 3, 2, '#1a1028');
    P.poly([[24, 22 + b], [31.5, 25 + b], [24, 25.5 + b]], '#f0a030'); P.line(24, 24 + b, 31, 25 + b, '#c07818');    // ...is that a beak?
  };
  S.kraken = function (P, f, c) {
    var s = f ? 1 : 0;
    for (var i = 0; i < 8; i++) {
      var bx = 2.5 + i * 3.9;
      for (var k = 0; k < 12; k++) {
        var x = bx + Math.round(Math.sin((k + i * 1.3 + s * 2) / 2.5) * 2.2), y = 18 + k;
        P.ball(x, y, 2.3 - k * 0.12, 1.3, i % 2 ? c.K : sh(c.K, -0.2), { shine: false });
        if (k % 3 === 1) P.set(x, y + 1, sh(c.K, 0.5));
      }
    }
    P.ball(16, 12, 13, 11, c.K); P.oval(16, 6, 8, 4, sh(c.K, 0.15));
    [8, 12, 16, 20, 24].forEach(function (x, i) { P.poly([[x - 1.5, 4], [x + (i % 2 ? 1 : -1), i % 2 ? 0 : -1], [x + 1.5, 4]], c.G); });
    P.rect(7, 3, 19, 2, sh(c.G, -0.2));
    P.oval(10, 12, 3.5, 2.5, '#101820'); P.oval(22, 12, 3.5, 2.5, '#101820');
    P.rect(9, 11, 3, 2, c.E); P.rect(21, 11, 3, 2, c.E); P.set(10, 11, '#ffffff'); P.set(22, 11, '#ffffff');
    P.line(6, 8, 13, 10, '#101820'); P.line(26, 8, 19, 10, '#101820');
    P.oval(16, 18, 4, 1.5, '#101820'); P.set(14, 18, '#ffffff'); P.set(18, 18, '#ffffff');
    [[2, 6], [29, 4], [4, 2], [27, 1]].forEach(function (m, i) { if ((i + f) % 2) P.ball(m[0], m[1], 1.5, 1, '#d8e4f4', { shine: false }); });
  };
  S.pelican = function (P, f, c) {
    P.ball(14, 21, 9, 7, c.W); P.ball(9, 20, 5, 4, sh(c.W, -0.15));
    if (f) P.poly([[5, 18], [1, 13], [9, 17]], sh(c.W, -0.2));
    P.rect(13, 9, 4, 9, c.W); P.ball(16, 8, 5, 4.5, c.W);
    P.poly([[19, 7], [31, 10], [19, 11]], c.Y); P.poly([[19, 11], [30, 11], [22, 15], [19, 14]], sh(c.Y, -0.15));
    P.eye(15, 6, 2, 3, '#2a1c24'); P.blush(13, 10, 2);
    P.rect(11, 27, 2, 3, c.Y); P.rect(16, 27, 2, 3, c.Y);
  };
  S.seaLion = function (P, f, c) {
    var b = f ? -1 : 0;
    P.poly([[5, 25], [0, 30], [9, 29]], sh(c.B, -0.25)); P.poly([[25, 25], [31, 30], [22, 29]], sh(c.B, -0.25));
    P.ball(15, 24, 11, 6, c.B);
    P.rect(12, 11 + b, 8, 12, c.B); P.oval(15, 18, 4, 4, sh(c.B, 0.25));
    P.ball(16, 10 + b, 6, 5.5, c.B); P.oval(19.5, 12 + b, 3, 2, sh(c.B, 0.3));
    P.eye(12, 7 + b, 2, 3, '#1a1010'); P.eye(17, 7 + b, 2, 3, '#1a1010'); P.set(21, 11 + b, '#1a1010'); P.set(22, 11 + b, '#1a1010');
    P.line(21, 13 + b, 26, 12 + b, '#f0e8d8'); P.line(21, 14 + b, 26, 15 + b, '#f0e8d8'); P.blush(10, 12 + b, 2);
  };
  S.seaPup = function (P, f, c) {
    var b = f ? -1 : 0;
    P.poly([[8, 27], [4, 30], [11, 30]], sh(c.B, -0.25)); P.poly([[23, 27], [28, 30], [20, 30]], sh(c.B, -0.25));
    P.ball(16, 26, 8, 4.5, c.B);
    P.ball(16, 18 + b, 7, 6, c.B); P.oval(16, 22 + b, 3, 1.8, sh(c.B, 0.3));
    P.eye(11, 15 + b, 3, 4, '#1a1010'); P.eye(18, 15 + b, 3, 4, '#1a1010'); P.set(15, 21 + b, '#1a1010'); P.set(16, 21 + b, '#1a1010');
    P.blush(9, 20 + b, 2); P.blush(21, 20 + b, 2);
    if (c.Y) { P.ball(25, 27, 2.6, 2.4, c.Y, { shine: false }); P.set(24, 26, '#ffffff'); }     // the glowing stone it guards
  };

  RPG.add('sprites', {
    msRivera:  chibi({ adult: true, pack: false, hair: 'pony', glasses: true }, { H: '#3a2014', S: SKIN2, T: '#3aa0a0', P: '#e0d0b0', B: '#5a3a2a', A: '#2a2a3a' }),
    busDriver: chibi({ adult: true, pack: false, hair: 'cap', mustache: true }, { H: '#3a5a9a', h: '#c0c0c8', S: SKIN, T: '#3a5a9a', P: '#2a2a3a', B: '#202020' }),
    dadTrip:   chibi({ adult: true, pack: false, hair: 'cap', glasses: true }, { H: '#4a3220', h: '#3a2818', S: SKIN, T: '#ff7f50', P: '#c8b080', B: '#5a3a1a', A: '#1a1a1a' }),
    surfer:    chibi({ adult: true, pack: false, hair: 'spiky', mouth: 'grin' }, { H: '#f0d060', S: '#e0a878', T: '#40a0e0', P: '#f08040', B: '#e8c890' }),
    // monsters
    crab:       RPG.monster(S.crab, { R: '#e8583a', K: '#2a1c24' }),
    ghostCrab:  RPG.monster(S.crab, { R: '#dcd4c0', K: '#3a2a4a' }),
    jelly:      RPG.monster(S.jelly, { P: '#f8a0d0', T: '#c890e8' }),
    castle:     RPG.monster(function (P, f, c) { S.castle(P, f, c, false); }, { S: '#e2c690', F: '#e04040', B: '#f0a0b0' }),
    sandKing:   RPG.monster(function (P, f, c) { S.castle(P, f, c, true); }, { S: '#f0d498', Y: '#f8d040', R: '#c03050', B: '#80d0ff' }),
    starfish:   RPG.monster(S.starfish, { O: '#f08040' }),
    urchin:     RPG.monster(S.urchin, { U: '#7a4ac8' }),
    seaHare:    RPG.monster(S.seaHare, { H: '#b070c8', S: '#f0e080' }),
    wisp:       RPG.monster(S.wisp, { W: '#d8e4f4', K: '#3a4a6a', E: '#80ffff' }),
    owl:        RPG.monster(S.owl, { B: '#8a6a4a', L: '#e0c8a0', Y: '#f8d040' }),
    eel:        RPG.monster(S.eel, { G: '#4a9a6a', K: '#2a1c24' }),
    barnacle:   RPG.monster(S.barnacle, { B: '#a8a49a', F: '#f0d8b0' }),
    sunbot:     RPG.monster(S.sunbot, { W: '#f4f4f4', O: '#f08a30', Y: '#f8d040', L: '#80e8ff' }),
    coolerCrab: RPG.monster(S.coolerCrab, { R: '#e8583a', C: '#3a7ad8', K: '#2a1c24', Y: '#f8d040' }),
    inky:       RPG.monster(S.inky, { O: '#b05ac8', M: '#f8d040', C: true }),
    grandpaInk: RPG.monster(S.inky, { O: '#7a6a9a' }),
    towelGhost: RPG.monster(S.towelGhost, { R: '#e84a5a', Y: '#f8d040', B: '#3a8ad8', G: '#a0ffd0' }),
    kraken:     RPG.monster(S.kraken, { K: '#2a5a6a', G: '#4aa060', E: '#7affd8' }),
    pelican:    RPG.monster(S.pelican, { W: '#f0ece0', Y: '#f0a030' }),
    seaLion:    RPG.monster(S.seaLion, { B: '#8a6a50' }),
    seaPup:     RPG.monster(S.seaPup, { B: '#a08060', Y: '#80f0ff' })
  });

  // ======================= tiles =======================
  function rng(seed) { var s = seed || 7; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function speck(g, colors, n, seed, w, h, area) {
    var r = rng(seed), a = area || [0, 0, 16, 16];
    for (var i = 0; i < n; i++) {
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      g.fillRect(a[0] + Math.floor(r() * a[2] * 2) / 2, a[1] + Math.floor(r() * a[3] * 2) / 2, w || 0.5, h || 0.5);
    }
  }
  function vgrad(g, x, y, w, h, top, bottom) { var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  function blob(g, x, y, rx, ry, color) { g.fillStyle = color; g.beginPath(); g.ellipse(x, y, rx, ry || rx, 0, 0, Math.PI * 2); g.fill(); }
  function beachSand(g, seed) { vgrad(g, 0, 0, 16, 16, '#ead0a0', '#dcbe88'); speck(g, ['#d4b47c', '#f6e2b8', '#c8a670', '#ffffff'], 30, seed || 5); }
  function asphalt(g) { vgrad(g, 0, 0, 16, 16, '#5a5a62', '#4a4a52'); speck(g, ['#6a6a72', '#3e3e46', '#74747c'], 26, 61); }
  function busFloor(g) { vgrad(g, 0, 0, 16, 16, '#6a6e78', '#5a5e68'); g.fillStyle = 'rgba(255,255,255,0.08)'; for (var y = 1; y < 16; y += 3) g.fillRect(0, y, 16, 0.5); }
  function wetRock(g) { vgrad(g, 0, 0, 16, 16, '#3c4450', '#2e343e'); speck(g, ['#4a5462', '#262a32', '#56606e'], 26, 97); }

  RPG.add('tiles', {
    // ---- the beach ----
    surf:      { solid: true, frames: 3, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#3a8ccc', '#2a6aaa');
      g.fillStyle = '#5aaee4'; g.fillRect((1 + f * 4) % 16, 3, 6, 0.5); g.fillRect((10 + 16 - f * 3) % 16, 8, 5, 0.5); g.fillRect((4 + f * 5) % 16, 12.5, 6, 0.5);
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect((7 + f * 4) % 16, 3.5, 2, 0.5); g.fillRect((13 + f * 2) % 16, 12, 1.5, 0.5);
      g.fillStyle = '#ffffff'; g.fillRect([2, 11, 6][f], [6, 10, 1][f], 0.5, 0.5);
    } },
    shore:     { encounter: true, frames: 3, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#cdb07c', '#bc9c68'); speck(g, ['#b0925e', '#dcc292', '#ffffff'], 22, 17);
      var e = [3, 4.5, 3.5][f];
      g.fillStyle = 'rgba(120,190,230,0.45)'; g.fillRect(0, 0, e + 1, 16);
      g.fillStyle = 'rgba(255,255,255,0.85)'; for (var y = 0; y < 16; y++) g.fillRect(e + Math.sin((y + f * 3) / 2.2), y, 1, 1);
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(e + 3, (f * 5 + 2) % 16, 0.5, 0.5);
    } },
    dune:      { encounter: true, frames: 2, draw: function (g, f) {
      beachSand(g, 23);
      var r = rng(29);
      for (var i = 0; i < 6; i++) {
        var x = 1 + Math.floor(r() * 26) / 2, y = 4 + Math.floor(r() * 20) / 2, s = f ? 0.5 : 0;
        g.fillStyle = '#6a8a3a'; g.fillRect(x, y, 0.5, 3); g.fillStyle = '#8aac4a'; g.fillRect(x + 0.5 + s, y - 1.5, 0.5, 3); g.fillStyle = '#b0d068'; g.fillRect(x - 0.5 - s, y - 0.5, 0.5, 2.5);
      }
    } },
    sandstone: { solid: true, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#e0b888', '#c89a6a');
      [[2, '#ecc898'], [6.5, '#d4a474'], [11, '#e6be8e']].forEach(function (b) { g.fillStyle = b[1]; g.fillRect(0, b[0], 16, 1.5); });
      g.fillStyle = 'rgba(120,70,30,0.35)'; g.fillRect(4, 0, 0.5, 16); g.fillRect(11.5, 3, 0.5, 13); g.fillRect(8, 9, 0.5, 7);
      g.fillStyle = 'rgba(255,240,210,0.5)'; g.fillRect(4.5, 0, 0.5, 16); g.fillRect(12, 3, 0.5, 13);
      speck(g, ['#b88a5a', '#f4d4a8'], 14, 71);
    } },
    torreyPine: { solid: true, tall: 2, tallW: 34, frames: 2, draw: function (g) { beachSand(g, 31); },
      drawTall: function (g, f, h) {
        var o = f ? 0.5 : 0;
        for (var i = 0; i < 26; i++) { var x = 7 + Math.sin(i / 6) * 1.6; g.fillStyle = i % 4 ? '#6a4630' : '#4a3020'; g.fillRect(x, h - 2 - i, 3, 1); g.fillStyle = '#8a6448'; g.fillRect(x, h - 2 - i, 0.8, 1); }
        g.fillStyle = '#5a3c26'; g.fillRect(2, h - 20, 6, 1.2); g.fillRect(10, h - 24, 7, 1.2);
        [[-1, h - 25, 6.5, 3.2], [9, h - 30, 8, 3.8], [18, h - 25, 6, 3], [3, h - 20, 4.5, 2.4], [14, h - 21, 4.5, 2.4]].forEach(function (c) {
          blob(g, c[0] + o, c[1] + 1, c[2], c[3], '#1e4a34'); blob(g, c[0] + o - 0.5, c[1], c[2] * 0.85, c[3] * 0.8, '#2e6a46'); blob(g, c[0] + o - 1.5, c[1] - 1, c[2] * 0.5, c[3] * 0.45, '#4a8a5a');
        });
        speck(g, ['#7ab878'], 16, 57, 0.5, 0.5, [-6 + o, h - 34, 30, 14]);
      } },
    umbrella:  { solid: true, tall: 1, tallW: 30, draw: function (g) { beachSand(g, 37); },
      drawTall: function (g, f, h) {
        g.fillStyle = '#e8e0d0'; g.fillRect(7.5, h - 22, 1, 19); g.fillStyle = '#b8b0a0'; g.fillRect(8, h - 22, 0.5, 19);
        for (var i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#e8504a'; g.beginPath(); g.moveTo(8, h - 27); g.lineTo(-3 + i * 3.67, h - 21); g.lineTo(-3 + (i + 1) * 3.67, h - 21); g.closePath(); g.fill(); }
        g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(-3, h - 21, 22, 0.5); g.fillStyle = '#ffd040'; g.fillRect(7.5, h - 28, 1, 1);
      } },
    towel:     { draw: function (g) {
      beachSand(g, 43);
      ['#3a8ad8', '#ffffff', '#f8d040', '#ffffff', '#3a8ad8', '#ffffff', '#f8d040'].forEach(function (c, i) { g.fillStyle = c; g.fillRect(3, 2 + i * 1.7, 10, 1.7); });
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(3, 13.9, 10, 0.6);
      g.fillStyle = '#ffffff'; for (var x = 3; x < 13; x += 1) g.fillRect(x, 1.5, 0.5, 0.5);
    } },
    lifeguard: { solid: true, tall: 2, tallW: 24, draw: function (g) { beachSand(g, 41); },
      drawTall: function (g, f, h) {
        g.fillStyle = '#d8d4cc'; g.fillRect(1, h - 18, 1.5, 17); g.fillRect(13.5, h - 18, 1.5, 17); g.fillStyle = '#a8a49c'; g.fillRect(2, h - 18, 0.5, 17);
        g.fillStyle = '#c8c4bc'; for (var y = h - 12; y < h - 1; y += 2.5) g.fillRect(5, y, 6, 0.5);
        g.fillStyle = '#2a74c8'; g.fillRect(-2, h - 30, 20, 12); g.fillStyle = '#4a94e8'; g.fillRect(-2, h - 30, 20, 1);
        g.fillStyle = '#bfe4ff'; g.fillRect(0, h - 27, 7, 5); g.fillRect(9, h - 27, 7, 5); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0.5, h - 26.5, 2, 2);
        g.fillStyle = '#f4f4f4'; g.fillRect(-3, h - 32, 22, 2.5); g.fillStyle = '#e04040'; g.fillRect(-3, h - 31, 22, 0.8);
        g.fillStyle = '#ffffff'; g.fillRect(-2, h - 19, 20, 1.5);
        g.fillStyle = '#8a8a90'; g.fillRect(16.5, h - 40, 0.6, 8); g.fillStyle = '#e04040'; g.fillRect(17, h - 40, 4, 2.5 + (f ? 0.5 : 0));
      } },
    trailFence:{ solid: true, draw: function (g) {
      beachSand(g, 47);
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, 13, 16, 1);
      [2, 12].forEach(function (x) { g.fillStyle = '#7a5434'; g.fillRect(x, 4, 2, 10); g.fillStyle = '#a07454'; g.fillRect(x, 4, 0.5, 10); });
      g.fillStyle = '#c8b080'; g.fillRect(0, 6, 16, 0.8); g.fillRect(0, 10, 16, 0.8);
    } },
    parkLine:  { draw: function (g) { asphalt(g); g.fillStyle = '#f0f0e8'; g.fillRect(7.5, 0, 1, 16); } },
    busTop:    { solid: true, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#f8c828', '#e8a818'); g.fillStyle = '#f8e070'; g.fillRect(0, 0, 16, 1);
      g.fillStyle = '#3a3a44'; g.fillRect(1.5, 2.5, 13, 8); vgrad(g, 2, 3, 12, 7, '#cfeaff', '#6a9ed8'); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(3, 3.5, 3, 1);
      g.fillStyle = '#2a2a30'; g.fillRect(0, 13, 16, 1.5);
    } },
    busBottom: { solid: true, draw: function (g) {
      asphalt(g); vgrad(g, 0, 0, 16, 9, '#e8a818', '#c88a10'); g.fillStyle = '#1e1e24'; g.fillRect(0, 2.5, 16, 1);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 9, 16, 3);
      blob(g, 8, 10, 3.6, 3.6, '#1a1a1e'); blob(g, 8, 10, 1.6, 1.6, '#9a9aa4'); g.fillStyle = '#d8d8e0'; g.fillRect(7.5, 9.5, 1, 1);
    } },
    // ---- tide pools ----
    tideRock:  { encounter: true, frames: 2, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#6a6258', '#545048'); speck(g, ['#7a7266', '#4a443e', '#8a8070'], 30, 83);
      blob(g, 4, 5, 3, 2, '#4a7a3a'); blob(g, 12, 11, 3.5, 2, '#4a7a3a'); speck(g, ['#6aa04a'], 8, 89, 0.5, 0.5, [1, 3, 14, 10]);
      g.fillStyle = 'rgba(160,210,240,0.55)'; g.fillRect(9, 3, 3, 1.5); g.fillStyle = '#ffffff'; g.fillRect(f ? 10 : 11, 3, 0.5, 0.5);
      g.fillStyle = '#e8e0d0'; g.fillRect(2, 11, 1, 1); g.fillRect(3.5, 12, 1, 1); g.fillRect(13, 4, 1, 1);
    } },
    tidePool:  { solid: true, frames: 2, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#5e5850', '#4c4842'); blob(g, 8, 8.5, 7, 6, '#3a3632'); blob(g, 8, 8, 6.2, 5.2, '#2a7a8a'); blob(g, 8, 7.5, 5, 4, '#3aa0b0');
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(f ? 4 : 5, 5, 2, 0.5); g.fillRect(f ? 10 : 9, 10, 1.5, 0.5);
      blob(g, 5, 10, 1.2, 1, '#f070a0'); g.fillStyle = '#ffb0d0'; g.fillRect(4.5, 9.5, 0.5, 0.5);
      g.fillStyle = '#f09040'; g.fillRect(10.5, 6, 2, 0.5); g.fillRect(11.25, 5.25, 0.5, 2);
    } },
    // ---- the bus ----
    busFloor:  { draw: function (g) { busFloor(g); } },
    busSeat:   { draw: function (g) {
      busFloor(g);
      g.fillStyle = '#1e5a3a'; g.fillRect(1, 1, 14, 5); g.fillStyle = '#2e7a4e'; g.fillRect(1, 1, 14, 1);
      g.fillStyle = '#3a8a5a'; g.fillRect(1, 6, 14, 7); g.fillStyle = '#5aaa7a'; g.fillRect(1.5, 6.5, 13, 0.5);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(1, 13, 14, 1.5); g.fillStyle = '#c0c0c8'; g.fillRect(1, 0.5, 14, 0.5);
    } },
    busWall:   { solid: true, frames: 4, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#e8e0c8', '#d0c8b0');
      g.fillStyle = '#8a8a90'; g.fillRect(2, 1.5, 12, 11);
      g.save(); g.beginPath(); g.rect(3, 2.5, 10, 9); g.clip();
      vgrad(g, 3, 2.5, 10, 9, '#8ac8f8', '#d0ecff');
      for (var i = 0; i < 3; i++) { var y = ((i * 5 + f * 4) % 15) - 2; blob(g, i % 2 ? 5 : 10, 2.5 + y, 2.4, 2, '#4a9a4a'); blob(g, i % 2 ? 4.5 : 9.5, 2 + y, 1.2, 1, '#7ac06a'); }
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(4, 3.5, 1, 3); g.fillStyle = '#b8b098'; g.fillRect(0, 14, 16, 2);
    } },
    busDash:   { solid: true, frames: 4, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 9, '#8ac8f8', '#e0f0ff'); g.fillStyle = '#6a6a72'; g.fillRect(0, 6, 16, 3);
      g.fillStyle = '#f0f0e8'; g.fillRect(7.5, 6 + (f % 2) * 1.5, 1, 1);
      g.fillStyle = '#2a2a32'; g.fillRect(0, 9, 16, 7); g.fillStyle = '#4a4a54'; g.fillRect(0, 9, 16, 1);
      g.fillStyle = f % 2 ? '#80e080' : '#40a040'; g.fillRect(3, 11, 1, 1); g.fillStyle = '#ff8040'; g.fillRect(12, 11, 1, 1);
    } },
    // ---- the sea cave ----
    seaFloor:  { draw: function (g) { wetRock(g); g.fillStyle = 'rgba(120,200,230,0.18)'; g.fillRect(3, 9, 5, 1); g.fillRect(10, 4, 4, 1); g.fillStyle = '#f0e0d0'; g.fillRect(12, 12, 1, 0.5); g.fillRect(4, 3, 0.5, 0.5); } },
    seaWall:   { solid: true, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#2a303c', '#1a1e28'); speck(g, ['#363e4c', '#12161e', '#424a5a'], 30, 101);
      g.fillStyle = '#4a5466'; g.fillRect(0, 0, 16, 0.5); g.fillStyle = '#a8a49a'; g.fillRect(3, 11, 1, 1); g.fillRect(4.5, 12, 1, 1); g.fillRect(12, 6, 1, 1);
    } },
    caveWater: { solid: true, frames: 3, light: { r: 1.4, color: 'rgba(80,220,230,A)' }, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#0e4a5a', '#082a3a');
      g.fillStyle = 'rgba(120,240,255,0.45)'; g.fillRect((2 + f * 4) % 16, 4, 5, 0.5); g.fillRect((9 + 16 - f * 3) % 16, 10, 4, 0.5);
      g.fillStyle = '#a0ffff'; g.fillRect([4, 12, 8][f], [7, 3, 13][f], 0.5, 0.5);
    } },
    seaGlass:  { solid: true, frames: 2, light: { r: 2.2, color: 'rgba(110,220,255,A)' }, draw: function (g, f) {
      wetRock(g);
      [[5, 14, 3, 9, '#5ad0f0'], [9, 14, 3.5, 12, '#8ae8ff'], [12.5, 14, 2.5, 7, '#4ab8e0']].forEach(function (c) {
        g.fillStyle = c[4]; g.beginPath(); g.moveTo(c[0] - c[2] / 2, c[1]); g.lineTo(c[0], c[1] - c[3]); g.lineTo(c[0] + c[2] / 2, c[1]); g.fill();
      });
      g.fillStyle = 'rgba(255,255,255,' + (f ? 0.9 : 0.5) + ')'; g.fillRect(8.5, 5, 0.5, 4);
    } }
  });

  // ======================= battle backdrops =======================
  var B = RPG.bd;
  function sea(g, y, h, t, top, bottom) {
    var sg = g.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, top); sg.addColorStop(1, bottom); g.fillStyle = sg; g.fillRect(0, y, W, h);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    for (var i = 0; i < 16; i++) g.fillRect(((i * 41 + t * 0.25 * (i % 3 + 1)) % (W + 30)) - 15, y + 4 + (i * 7) % (h - 6), 8 + (i % 3) * 4, 1);
  }
  function pine(g, x, y, s, color) {
    g.fillStyle = color; g.fillRect(x - s, y - 26 * s, 2 * s, 26 * s);
    [[-9, -28, 9, 3.5], [3, -33, 10, 4], [-2, -22, 7, 3]].forEach(function (c) { g.beginPath(); g.ellipse(x + c[0] * s, y + c[1] * s, c[2] * s, c[3] * s, 0, 0, 7); g.fill(); });
  }
  RPG.add('backdrops', {
    beach: { grade: 'warm', draw: function (g, t) {
      B.sky(g, '#58a8f0', '#e0f4ff', 110); B.sun(g, 250, 34, 12, '#fff8d8', 'rgba(255,250,210,0.5)'); B.clouds(g, 30, t, 'rgba(255,255,255,0.8)');
      sea(g, 92, 40, t, '#2a7ac0', '#5ab8e4');
      g.fillStyle = '#d8aa78'; g.beginPath(); g.moveTo(222, 132); g.lineTo(236, 74); g.lineTo(270, 64); g.lineTo(320, 60); g.lineTo(320, 132); g.fill();
      g.fillStyle = 'rgba(150,90,40,0.35)'; for (var i = 0; i < 6; i++) g.fillRect(232 + i * 15, 70 - i, 2, 62);
      g.fillStyle = 'rgba(255,240,210,0.35)'; g.fillRect(226, 96, 94, 2); g.fillRect(230, 112, 90, 2);
      g.fillStyle = '#ffffff'; for (var x = 0; x < W; x += 2) g.fillRect(x, 130 + Math.sin(x / 9 + t / 20) * 1.5, 2, 1.5);
      B.floor(g, '#ecd2a0', '#cca870', 132, 'rgba(120,80,30,0.1)'); B.rays(g, 'rgba(255,245,215,A)', t);
    } },
    tidepool: { grade: 'warm', draw: function (g, t) {
      B.sky(g, '#6aa8e8', '#f8e0c0', 110); B.sun(g, 70, 46, 13, '#fff0c8', 'rgba(255,230,180,0.55)'); B.clouds(g, 36, t, 'rgba(255,245,235,0.7)');
      sea(g, 96, 36, t, '#2a6ab0', '#4a9ad0');
      B.floor(g, '#5e5850', '#3a3630', 132, 'rgba(0,0,0,0.14)');
      [[60, 170, 30, 9], [220, 186, 40, 11], [150, 214, 26, 8]].forEach(function (p) {
        g.fillStyle = '#2a2622'; g.beginPath(); g.ellipse(p[0], p[1], p[2] + 3, p[3] + 2, 0, 0, 7); g.fill();
        g.fillStyle = '#3aa0b0'; g.beginPath(); g.ellipse(p[0], p[1], p[2], p[3], 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(p[0] - p[2] * 0.5, p[1] - 2, p[2] * 0.4, 1);
        g.fillStyle = '#f070a0'; g.fillRect(p[0] + p[2] * 0.3, p[1] + 1, 3, 2);
      });
      B.rays(g, 'rgba(255,235,200,A)', t);
    } },
    bluffs: { grade: 'mist', draw: function (g, t) {
      B.sky(g, '#6a6a8a', '#d8c8c8', 140);
      B.hills(g, '#9a8a90', 104, 20, 2, 4);
      [[30, 112, 1.1], [92, 104, 0.8], [250, 108, 1.2], [300, 116, 0.9]].forEach(function (p) { pine(g, p[0], p[1], p[2], 'rgba(60,60,80,0.55)'); });
      B.haze(g, 124, 40, 'rgba(230,232,244,A)');
      B.hills(g, '#b89a7a', 130, 10, 6, 4);
      B.floor(g, '#d0b090', '#9a7a5a', 132, 'rgba(60,40,30,0.12)');
      for (var i = 0; i < 6; i++) { var x = ((i * 70 + t * 0.15 * (1 + i % 2)) % (W + 120)) - 60, y = 110 + (i % 3) * 22; var fg = g.createRadialGradient(x, y, 0, x, y, 60); fg.addColorStop(0, 'rgba(236,238,248,0.45)'); fg.addColorStop(1, 'rgba(236,238,248,0)'); g.fillStyle = fg; g.fillRect(x - 60, y - 60, 120, 120); }
    } },
    seacave: { grade: 'night', draw: function (g, t) {
      g.fillStyle = '#0a1018'; g.fillRect(0, 0, W, H);
      var mg = g.createRadialGradient(160, 80, 6, 160, 80, 70); mg.addColorStop(0, 'rgba(160,200,255,0.5)'); mg.addColorStop(1, 'rgba(160,200,255,0)');
      g.fillStyle = mg; g.fillRect(80, 10, 160, 140);
      g.fillStyle = '#1a2a40'; g.beginPath(); g.ellipse(160, 96, 46, 50, 0, Math.PI, 0); g.fill();
      sea(g, 96, 36, t, '#1a3a5a', '#0e2a40');
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(172, 60, 6, 0, 7); g.fill();
      g.fillStyle = '#121a26'; for (var i = 0; i < 9; i++) { var x = i * 38 + 10; g.beginPath(); g.moveTo(x - 7, 0); g.lineTo(x + 7, 0); g.lineTo(x, 22 + (i % 3) * 12); g.fill(); }
      [[40, 124, '#5ad0f0'], [280, 116, '#8ae8ff'], [230, 132, '#5ad0f0'], [90, 136, '#8ae8ff']].forEach(function (c) {
        var cg = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], 18); cg.addColorStop(0, c[2]); cg.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalAlpha = 0.4 + 0.15 * Math.sin((t || 0) / 30 + c[0]); g.fillStyle = cg; g.fillRect(c[0] - 18, c[1] - 18, 36, 36); g.globalAlpha = 1;
        g.fillStyle = c[2]; g.beginPath(); g.moveTo(c[0], c[1] - 9); g.lineTo(c[0] + 3, c[1] + 3); g.lineTo(c[0] - 3, c[1] + 3); g.fill();
      });
      B.floor(g, '#2e3644', '#141a24', 132, 'rgba(120,220,255,0.06)');
    } },
    bus: { grade: 'warm', draw: function (g, t) {
      var gr = g.createLinearGradient(0, 0, 0, 130); gr.addColorStop(0, '#e8e0c8'); gr.addColorStop(1, '#d0c8b0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (var i = 0; i < 5; i++) {
        var x = 8 + i * 64; g.fillStyle = '#8a8a90'; g.fillRect(x, 20, 52, 50);
        g.save(); g.beginPath(); g.rect(x + 3, 23, 46, 44); g.clip();
        B.sky(g, '#7ac0f8', '#d8f0ff', 70);
        for (var k = 0; k < 4; k++) { var tx = x + ((k * 23 - t * 1.5) % 70 + 70) % 70 - 10; g.fillStyle = '#3a8a3a'; g.beginPath(); g.arc(tx + 10, 58, 9, 0, 7); g.fill(); g.fillStyle = '#5aaa4a'; g.beginPath(); g.arc(tx + 7, 54, 5, 0, 7); g.fill(); }
        g.restore();
        g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 5, 26, 4, 14);
      }
      g.fillStyle = '#1e5a3a'; for (var s = 0; s < 4; s++) g.fillRect(4 + s * 82, 86, 66, 28);
      g.fillStyle = '#3a8a5a'; for (s = 0; s < 4; s++) g.fillRect(4 + s * 82, 86, 66, 4);
      B.floor(g, '#6a6e78', '#4a4e58', 130, 'rgba(255,255,255,0.06)');
    } },
    ending2: { grade: 'dusk', draw: function (g, t) {
      B.sky(g, '#d86a60', '#f8d0a0', 120); B.sun(g, 160, 104, 30, '#ffe080', 'rgba(255,200,120,0.5)');
      B.clouds(g, 40, t, 'rgba(255,200,170,0.6)');
      sea(g, 104, 46, t, '#b85a70', '#e8a080');
      g.fillStyle = '#6a3a3a'; g.beginPath(); g.moveTo(250, 150); g.lineTo(262, 90); g.lineTo(300, 82); g.lineTo(320, 80); g.lineTo(320, 150); g.fill();
      B.floor(g, '#e0b080', '#a07050', 150, 'rgba(80,40,20,0.12)');
      B.rays(g, 'rgba(255,220,160,A)', t);
      [[86, 110, 'josh', 2, 20, 0], [120, 116, 'mochi', 2, 12, 0], [150, 110, 'jasper', 2, 20, 1], [184, 114, 'seaPup', 2, 24, 0], [212, 104, 'dadTrip', 2, 22, 1]].forEach(function (s) {
        g.fillStyle = 'rgba(40,20,30,0.3)'; g.beginPath(); g.ellipse(s[0] + 16, s[1] + 34, 14, 3.5, 0, 0, 7); g.fill();
        RPG.drawSprite(s[2], s[0], s[1], { pose: s[2] === 'seaPup' ? 'idle' : 'down', frame: Math.floor(t / s[4] + s[5]) % 2, scale: s[3] });
      });
    } }
  });

  // ======================= statuses and skills =======================
  RPG.add('statuses', {
    inked: { color: '#7a6aa8', turns: 3, stats: { atk: 0.75, luck: 0.5 } },
    soggy: { color: '#80c0ff', turns: 3, perTurn: { percent: 0.04 }, stats: { spd: 0.7 } }
  });
  RPG.add('skills', {
    // ---- new moves for the kids (learned at higher levels) ----
    bodySurf:     { mp: 8, target: 'enemies', anim: 'water', effects: [{ type: 'damage', power: 1.15, element: 'water' }] },
    captainJosh:  { mp: 10, target: 'allies', anim: 'stars', effects: [{ type: 'buff', stat: 'atk', mult: 1.3, turns: 3 }, { type: 'buff', stat: 'def', mult: 1.25, turns: 3 }] },
    superStar:    { mp: 16, target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 3.8 }] },
    tideTurn:     { mp: 9, target: 'enemies', anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 1.35, element: 'water' }] },
    starfishHeal: { mp: 12, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.8, amount: 18 }] },
    supernova:    { mp: 18, target: 'enemies', anim: 'fire', effects: [{ type: 'damage', kind: 'magic', power: 2.0, element: 'fire' }] },
    dig:          { mp: 5, target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.7 }, { type: 'buff', stat: 'def', mult: 0.75, turns: 3 }] },
    howl:         { mp: 7, target: 'allies', anim: 'bark', effects: [{ type: 'buff', stat: 'atk', mult: 1.3, turns: 3 }] },
    shibaSmile:   { mp: 10, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.2, amount: 30 }, { type: 'cure', status: 'all' }] },
    spikeBall:    { mp: 8, target: 'enemy', anim: 'ball', effects: [{ type: 'damage', power: 2.4, element: 'wind' }] },
    teamPlay:     { mp: 10, target: 'allies', anim: 'stars', effects: [{ type: 'buff', stat: 'spd', mult: 1.3, turns: 3 }, { type: 'buff', stat: 'atk', mult: 1.2, turns: 3 }] },
    megaSpike:    { mp: 15, target: 'enemies', anim: 'ball', effects: [{ type: 'damage', power: 1.6, element: 'wind' }] },
    droneStrike:  { mp: 9, target: 'enemies', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.3, element: 'thunder' }] },
    repairKit:    { mp: 11, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.5, amount: 16 }, { type: 'cure', status: ['sticky', 'inked', 'soggy'] }] },
    laserGrid:    { mp: 17, target: 'enemies', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.9, element: 'thunder' }] },
    // ---- Dad (dadJoke, grounded and coffeeBreak are his moves from Chapter 1) ----
    grillMaster:  { mp: 8, target: 'enemies', anim: 'fire', effects: [{ type: 'damage', power: 1.0, element: 'fire' }] },
    dadHug:       { mp: 9, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.0, amount: 60 }] },
    dadDance:     { mp: 7, target: 'enemies', anim: 'stars', effects: [{ type: 'status', status: 'giggle', chance: 0.6 }] },
    // ---- enemies ----
    pinch:        { target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.3 }] },
    jellySting:   { target: 'enemy', mp: 3, anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.0, element: 'thunder' }, { type: 'status', status: 'sticky', chance: 0.3 }] },
    sandSpray:    { target: 'enemies', mp: 3, anim: 'hit', effects: [{ type: 'damage', power: 0.7 }, { type: 'status', status: 'scared', chance: 0.2 }] },
    regrow:       { target: 'self', mp: 4, anim: 'heal', effects: [{ type: 'heal', percent: 0.25 }] },
    spikeRoll:    { target: 'enemies', mp: 3, anim: 'hit', effects: [{ type: 'damage', power: 0.8 }] },
    inkSquirt:    { target: 'enemy', mp: 3, anim: 'goo', effects: [{ type: 'damage', power: 0.6 }, { type: 'status', status: 'inked', chance: 0.6 }] },
    spooky:       { target: 'enemies', mp: 4, anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.3 }] },
    chill:        { target: 'enemy', mp: 4, anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 1.1, element: 'water' }] },
    hoot:         { target: 'enemies', mp: 4, anim: 'zzz', effects: [{ type: 'status', status: 'sleep', chance: 0.35 }] },
    shock:        { target: 'enemy', mp: 4, anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.3, element: 'thunder' }] },
    clamp:        { target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.2 }, { type: 'buff', stat: 'spd', mult: 0.7, turns: 2 }] },
    sunSpray:     { target: 'enemies', mp: 3, anim: 'bubbles', effects: [{ type: 'damage', kind: 'magic', power: 0.6 }, { type: 'status', status: 'sticky', chance: 0.4 }] },
    bigPinch:     { target: 'enemy', mp: 4, anim: 'slam', effects: [{ type: 'damage', power: 2.0 }] },
    shellHide:    { target: 'self', anim: 'shine', effects: [{ type: 'buff', stat: 'def', mult: 1.6, turns: 2 }] },
    coolerChill:  { target: 'enemies', mp: 5, anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 0.8, element: 'water' }, { type: 'status', status: 'soggy', chance: 0.4 }] },
    inkCloud:     { target: 'enemies', mp: 5, anim: 'goo', effects: [{ type: 'status', status: 'inked', chance: 0.55 }] },
    tentacleSlap: { target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 0.9 }, { type: 'damage', power: 0.9 }] },
    camFlash:     { target: 'enemies', mp: 4, anim: 'shine', effects: [{ type: 'damage', kind: 'magic', power: 0.5 }, { type: 'status', status: 'scared', chance: 0.3 }] },
    towelWhip:    { target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 1.6 }] },
    flapStorm:    { target: 'enemies', mp: 5, anim: 'plane', effects: [{ type: 'damage', power: 0.95, element: 'wind' }] },
    fishBreath:   { target: 'enemies', mp: 4, anim: 'bubbles', effects: [{ type: 'status', status: 'sad', chance: 0.4 }, { type: 'status', status: 'scared', chance: 0.2 }] },
    fogWave:      { target: 'enemies', mp: 6, anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 1.0, element: 'water' }, { type: 'status', status: 'soggy', chance: 0.4 }] },
    krakenHug:    { target: 'enemy', mp: 5, anim: 'slam', effects: [{ type: 'damage', power: 2.1 }] },
    sandStorm:    { target: 'enemies', mp: 6, anim: 'hit', effects: [{ type: 'damage', power: 1.0 }, { type: 'status', status: 'scared', chance: 0.25 }] },
    castleCrush:  { target: 'enemy', mp: 5, anim: 'slam', effects: [{ type: 'damage', power: 2.3 }] },
    moatFlood:    { target: 'enemies', mp: 6, anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 1.2, element: 'water' }] }
  });

  // ======================= items =======================
  var KIDS = ['josh', 'jasper', 'mia', 'ethan'];
  RPG.add('items', {
    // ---- snacks ----
    momBento:     { type: 'consumable', price: 0, target: 'allies', effects: [{ type: 'heal', amount: 250 }, { type: 'mp', amount: 20 }] },
    fishTaco:     { type: 'consumable', price: 80, target: 'ally', effects: [{ type: 'heal', amount: 200 }] },
    shaveIce:     { type: 'consumable', price: 90, target: 'ally', effects: [{ type: 'mp', amount: 50 }] },
    seaweedSnack: { type: 'consumable', price: 40, target: 'ally', effects: [{ type: 'heal', amount: 90 }, { type: 'cure', status: 'all' }] },
    coconutWater: { type: 'consumable', price: 260, target: 'allies', effects: [{ type: 'heal', amount: 180 }] },
    sunscreen:    { type: 'consumable', price: 60, target: 'ally', anim: 'shine', effects: [{ type: 'cure', status: 'all' }, { type: 'buff', stat: 'def', mult: 1.3, turns: 3 }] },
    glowStick:    { type: 'consumable', price: 50, target: 'enemies', field: false, anim: 'shine', effects: [{ type: 'status', status: 'scared', chance: 0.5 }] },
    goldSticker:  { type: 'consumable', price: 300, target: 'deadAlly', effects: [{ type: 'revive', percent: 1 }] },
    // ---- weapons ----
    driftwood:    { type: 'weapon', price: 160, stats: { atk: 16 }, equipBy: ['josh', 'jasper'] },
    bodyboard:    { type: 'weapon', price: 420, stats: { atk: 20, spd: 2 }, element: 'water', anim: 'water', equipBy: ['josh'] },
    seaShovel:    { type: 'weapon', price: 0, stats: { atk: 27, def: 2 }, equipBy: ['josh', 'jasper'] },
    tideWand:     { type: 'weapon', price: 480, stats: { mag: 18, atk: 3 }, element: 'water', anim: 'water', equipBy: ['jasper'] },
    beachBall:    { type: 'weapon', price: 450, stats: { atk: 22, spd: 3 }, anim: 'ball', equipBy: ['mia'] },
    sonarGun:     { type: 'weapon', price: 500, stats: { atk: 6, mag: 19 }, element: 'thunder', anim: 'bolt', equipBy: ['ethan'] },
    frisbee:      { type: 'weapon', price: 380, stats: { atk: 18, spd: 2 }, equipBy: ['mochi'] },
    bbqTongs:     { type: 'weapon', price: 0, stats: { atk: 14 }, element: 'fire', equipBy: ['dad'] },
    // ---- clothes ----
    rashGuard:    { type: 'armor', price: 380, stats: { def: 13, spd: 3 }, equipBy: KIDS },
    wetsuit:      { type: 'armor', price: 620, stats: { def: 17, maxHp: 20 }, equipBy: KIDS },
    lifeVest:     { type: 'armor', price: 520, stats: { def: 15, maxHp: 30 }, equipBy: KIDS.concat(['dad']) },
    dogLifeJacket:{ type: 'armor', price: 400, stats: { def: 15, spd: 2 }, equipBy: ['mochi'] },
    hawaiianShirt:{ type: 'armor', price: 0, stats: { def: 12, luck: 5 }, equipBy: ['dad'] },
    // ---- accessories ----
    sunglasses:   { type: 'accessory', price: 220, stats: { spd: 4, def: 3 } },
    shellNecklace:{ type: 'accessory', price: 260, stats: { luck: 6, mag: 4 } },
    crabClaw:     { type: 'accessory', price: 0, stats: { atk: 8 } },
    inkPearl:     { type: 'accessory', price: 0, stats: { mag: 10, maxMp: 15 } },
    pelicanFeather:{ type: 'accessory', price: 0, stats: { spd: 10, luck: 3 } },
    kelpCrown:    { type: 'accessory', price: 0, stats: { atk: 5, def: 5, mag: 5, spd: 5, luck: 5, maxHp: 30 } },
    sandCrown:    { type: 'accessory', price: 0, stats: { atk: 8, def: 8, mag: 8, spd: 8, luck: 8, maxHp: 50 } },
    // ---- story ----
    permissionSlip: { type: 'key', price: 0 },
    worksheet:      { type: 'key', price: 0 },
    classCamera:    { type: 'key', price: 0 },
    seaEye:         { type: 'key', price: 0 }
  });

  // ======================= Dad joins as a guest, and the kids learn new moves =======================
  RPG.add('characters', {
    dad: {
      sprite: 'dadTrip', level: 16,
      base:   { maxHp: 70, maxMp: 16, atk: 16, def: 12, mag: 8, spd: 8, luck: 10 },
      growth: { maxHp: 11, maxMp: 2.6, atk: 2.8, def: 2, mag: 1.6, spd: 1, luck: 1 },
      learn: { 1: ['grounded', 'dadJoke', 'coffeeBreak'], 16: ['grillMaster', 'dadHug'], 19: ['dadDance'] },
      equip: { weapon: 'bbqTongs', armor: 'hawaiianShirt' }
    }
  });
  var LEARN = {
    josh:   { 14: ['bodySurf'], 18: ['captainJosh'], 22: ['superStar'] },
    jasper: { 14: ['tideTurn'], 18: ['starfishHeal'], 22: ['supernova'] },
    mochi:  { 13: ['dig'], 17: ['howl'], 21: ['shibaSmile'] },
    mia:    { 14: ['spikeBall'], 18: ['teamPlay'], 22: ['megaSpike'] },
    ethan:  { 14: ['droneStrike'], 18: ['repairKit'], 22: ['laserGrid'] }
  };
  Object.keys(LEARN).forEach(function (id) {
    var learn = RPG.db.characters[id].learn = RPG.db.characters[id].learn || {};
    Object.keys(LEARN[id]).forEach(function (lv) { learn[lv] = (learn[lv] || []).concat(LEARN[id][lv]); });
  });

  // ======================= enemies and troops =======================
  function hpBelow(f) { return function (self) { return self.hp < self.def.stats.maxHp * f; }; }
  RPG.add('enemies', {
    // ---- the beach ----
    crab:      { sprite: 'crab', stats: { maxHp: 230, atk: 33, def: 22, mag: 8, spd: 12, luck: 6 }, exp: 32, gold: 22, weak: ['thunder'], resist: ['water'],
                 drops: [{ item: 'seaweedSnack', chance: 0.15 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'pinch', weight: 2 }] },
    jelly:     { sprite: 'jelly', stats: { maxHp: 190, maxMp: 30, atk: 26, def: 14, mag: 30, spd: 11, luck: 5 }, exp: 30, gold: 20, weak: ['fire'], resist: ['water'],
                 drops: [{ item: 'shaveIce', chance: 0.08 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'jellySting', weight: 2 }] },
    castle:    { sprite: 'castle', stats: { maxHp: 290, maxMp: 20, atk: 35, def: 26, mag: 6, spd: 6, luck: 4 }, exp: 38, gold: 30, weak: ['water'],
                 drops: [{ item: 'fishTaco', chance: 0.1 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'sandSpray', weight: 2 }] },
    snackGull: { sprite: 'gull', palette: { G: '#c0c8d4', Y: '#f8c020' }, stats: { maxHp: 200, atk: 34, def: 16, mag: 8, spd: 24, luck: 10 }, exp: 33, gold: 26, weak: ['wind'],
                 drops: [{ item: 'fishTaco', chance: 0.12 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'snatch', weight: 2 }, { skill: 'screech', weight: 1 }] },
    // ---- the tide pools ----
    starfish:  { sprite: 'starfish', stats: { maxHp: 320, maxMp: 30, atk: 37, def: 26, mag: 18, spd: 9, luck: 6 }, exp: 44, gold: 30, weak: ['thunder'],
                 drops: [{ item: 'seaweedSnack', chance: 0.2 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'regrow', weight: 3, 'if': hpBelow(0.5) }] },
    urchin:    { sprite: 'urchin', stats: { maxHp: 290, maxMp: 20, atk: 40, def: 34, mag: 10, spd: 7, luck: 5 }, exp: 46, gold: 28, weak: ['thunder'],
                 drops: [{ item: 'sunscreen', chance: 0.15 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'spikeRoll', weight: 2 }] },
    seaHare:   { sprite: 'seaHare', stats: { maxHp: 300, maxMp: 40, atk: 30, def: 20, mag: 36, spd: 11, luck: 6 }, exp: 45, gold: 32, weak: ['fire'],
                 drops: [{ item: 'shaveIce', chance: 0.12 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'inkSquirt', weight: 2 }, { skill: 'chill', weight: 1 }] },
    // ---- the foggy bluffs ----
    wisp:      { sprite: 'wisp', stats: { maxHp: 330, maxMp: 50, atk: 30, def: 20, mag: 42, spd: 18, luck: 8 }, exp: 56, gold: 36, weak: ['fire'], immune: ['sleep'],
                 drops: [{ item: 'glowStick', chance: 0.2 }], ai: [{ skill: 'attack', weight: 1 }, { skill: 'chill', weight: 2 }, { skill: 'spooky', weight: 1 }] },
    owl:       { sprite: 'owl', stats: { maxHp: 400, maxMp: 30, atk: 44, def: 26, mag: 16, spd: 24, luck: 8 }, exp: 58, gold: 38, weak: ['wind'],
                 drops: [{ item: 'fishTaco', chance: 0.15 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'hoot', weight: 1 }] },
    ghostCrab: { sprite: 'ghostCrab', stats: { maxHp: 380, atk: 46, def: 30, mag: 10, spd: 20, luck: 8 }, exp: 58, gold: 40, weak: ['thunder'], resist: ['water'],
                 drops: [{ item: 'seaweedSnack', chance: 0.2 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'pinch', weight: 2 }] },
    // ---- the sea cave ----
    eel:       { sprite: 'eel', stats: { maxHp: 480, maxMp: 40, atk: 50, def: 30, mag: 34, spd: 22, luck: 8 }, exp: 70, gold: 50, weak: ['fire'], resist: ['thunder', 'water'],
                 drops: [{ item: 'coconutWater', chance: 0.06 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'shock', weight: 2 }] },
    barnacle:  { sprite: 'barnacle', stats: { maxHp: 540, atk: 44, def: 42, mag: 12, spd: 5, luck: 4 }, exp: 68, gold: 50, weak: ['thunder'],
                 drops: [{ item: 'goldSticker', chance: 0.04 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'clamp', weight: 2 }, { skill: 'hunker', weight: 1 }] },
    // ---- bosses ----
    sunbot:    { sprite: 'sunbot', scale: 4, immune: ['sleep', 'scared'], stats: { maxHp: 620, maxMp: 40, atk: 30, def: 20, mag: 26, spd: 12, luck: 5 }, exp: 120, gold: 120, weak: ['water'],
                 drops: [{ item: 'sunscreen', chance: 1 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'sunSpray', weight: 2 }] },
    pinch:     { sprite: 'coolerCrab', scale: 5, immune: ['sleep', 'scared'], stats: { maxHp: 1600, maxMp: 60, atk: 40, def: 30, mag: 18, spd: 14, luck: 6 }, exp: 300, gold: 300, weak: ['thunder'],
                 drops: [{ item: 'crabClaw', chance: 1 }],
                 ai: [{ skill: 'attack', weight: 3 }, { skill: 'pinch', weight: 2 }, { skill: 'coolerChill', weight: 2 }, { skill: 'bigPinch', weight: 2, 'if': hpBelow(0.6) }, { skill: 'shellHide', weight: 2, 'if': hpBelow(0.4) }] },
    inky:      { sprite: 'inky', scale: 5, immune: ['sleep'], stats: { maxHp: 2200, maxMp: 90, atk: 42, def: 28, mag: 42, spd: 18, luck: 8 }, exp: 400, gold: 400, weak: ['thunder'], resist: ['water'],
                 drops: [{ item: 'inkPearl', chance: 1 }],
                 ai: [{ skill: 'attack', weight: 2 }, { skill: 'tentacleSlap', weight: 3 }, { skill: 'inkCloud', weight: 2 }, { skill: 'camFlash', weight: 2 }, { skill: 'lecture', weight: 1 }] },
    towelGhost:{ sprite: 'towelGhost', scale: 5, immune: ['sleep', 'scared'], stats: { maxHp: 3000, maxMp: 100, atk: 50, def: 30, mag: 40, spd: 22, luck: 8 }, exp: 520, gold: 500, weak: ['fire'],
                 drops: [{ item: 'pelicanFeather', chance: 1 }],
                 ai: [{ skill: 'attack', weight: 2 }, { skill: 'towelWhip', weight: 3 }, { skill: 'flapStorm', weight: 2 }, { skill: 'spooky', weight: 1 }, { skill: 'fishBreath', weight: 2, 'if': hpBelow(0.5) }] },
    kraken:    { sprite: 'kraken', scale: 5.5, immune: ['sleep', 'scared'], stats: { maxHp: 3400, maxMp: 160, atk: 46, def: 34, mag: 40, spd: 18, luck: 8 }, exp: 900, gold: 1000, weak: ['thunder'], resist: ['water'],
                 drops: [{ item: 'kelpCrown', chance: 1 }],
                 ai: [{ skill: 'attack', weight: 3 }, { skill: 'tentacleSlap', weight: 2 }, { skill: 'fogWave', weight: 2 }, { skill: 'inkCloud', weight: 1 },
                      { skill: 'krakenHug', weight: 2, 'if': hpBelow(0.7) }, { skill: 'feast', weight: 1, 'if': hpBelow(0.3) }] },
    sandKing:  { sprite: 'sandKing', scale: 5.5, immune: ['sleep', 'scared'], stats: { maxHp: 6000, maxMp: 200, atk: 66, def: 40, mag: 48, spd: 20, luck: 10 }, exp: 1500, gold: 1500, weak: ['water'],
                 drops: [{ item: 'sandCrown', chance: 1 }],
                 ai: [{ skill: 'attack', weight: 2 }, { skill: 'sandStorm', weight: 2 }, { skill: 'castleCrush', weight: 2 }, { skill: 'moatFlood', weight: 2 }, { skill: 'feast', weight: 1, 'if': hpBelow(0.3) }] }
  });
  RPG.add('troops', {
    crabs:      { enemies: ['crab', 'crab'] },
    jellies:    { enemies: ['jelly', 'jelly', 'jelly'] },
    castleCrab: { enemies: ['castle', 'crab'] },
    gulls2:     { enemies: ['snackGull', 'snackGull'] },
    beachMix:   { enemies: ['crab', 'jelly', 'snackGull'] },
    stars:      { enemies: ['starfish', 'starfish'] },
    urchins:    { enemies: ['urchin', 'seaHare'] },
    hares:      { enemies: ['seaHare', 'seaHare'] },
    tideMix:    { enemies: ['starfish', 'urchin', 'crab'] },
    wisps:      { enemies: ['wisp', 'wisp'] },
    owls:       { enemies: ['owl', 'wisp'] },
    ghostCrabs: { enemies: ['ghostCrab', 'ghostCrab'] },
    bluffMix:   { enemies: ['owl', 'ghostCrab', 'wisp'] },
    eels:       { enemies: ['eel', 'barnacle'] },
    barnacles:  { enemies: ['barnacle', 'barnacle'] },
    caveCrabs:  { enemies: ['ghostCrab', 'eel'] },
    caveMix:    { enemies: ['eel', 'wisp', 'ghostCrab'] },
    sunbot:     { enemies: ['sunbot'], canRun: false, backdrop: 'bus' },
    pinch:      { enemies: ['pinch'], canRun: false, backdrop: 'beach' },
    inky:       { enemies: ['inky'], canRun: false, backdrop: 'tidepool' },
    towelGhost: { enemies: ['towelGhost'], canRun: false, backdrop: 'bluffs' },
    kraken:     { enemies: ['kraken'], canRun: false, backdrop: 'seacave' },
    sandKing:   { enemies: ['sandKing'], canRun: false, backdrop: 'beach' }
  });

  // ======================= shops =======================
  RPG.add('shops', {
    beachShack:    { keeper: 'shackOwner', items: ['fishTaco', 'shaveIce', 'seaweedSnack', 'sunscreen', 'glowStick', 'juice', 'bento', 'sticker',
                                                    'sunglasses', 'shellNecklace', 'rashGuard', 'bodyboard', 'beachBall', 'frisbee'] },
    rangerStation: { keeper: 'parkRanger', items: ['fishTaco', 'seaweedSnack', 'coconutWater', 'glowStick', 'goldSticker', 'sticker',
                                                'lifeVest', 'wetsuit', 'dogLifeJacket', 'tideWand', 'sonarGun', 'driftwood'] }
  });

  // ======================= story scripts =======================
  // the bus pulls in at the beach once both things on the bus have happened
  var ARRIVE = { 'if': ['ch2_sunbot', 'ch2_mochi'], then: [
    { wait: 20 }, { sfx: 'door' },
    { say: 'trip.bus.arrive1', name: 'driver' }, { say: 'trip.bus.arrive2', name: 'teacher' },
    { warp: 'beach', x: 31, y: 22, dir: 'up' },
    { say: 'trip.beach.arrive1', name: null }, { say: 'trip.beach.arrive2', name: 'josh' }, { say: 'trip.beach.arrive3', name: 'jasper' },
    { say: 'trip.beach.arrive4', name: 'teacher' }
  ] };
  var CHECK3 = { 'if': ['tp_star', 'tp_anemone', 'tp_hare'], then: [
    { say: 'trip.tide.out1', name: 'dad' }, { say: 'trip.tide.out2', name: null }, { say: 'trip.tide.out3', name: 'josh' }, { set: 'ch2_inkyOut' }
  ] };
  function spot(x, y, flag, key, reward) {
    return { x: x, y: y, trigger: 'action', script: [
      { 'if': flag, then: [{ say: 'trip.tide.' + key + 'Done', name: null }], 'else': [
        { say: 'trip.tide.' + key + '1', name: null }, { say: 'trip.tide.' + key + '2', name: 'jasper' },
        { set: flag }, { give: reward }, { toast: 'trip.tide.progress' }, CHECK3
      ] }
    ] };
  }
  // Dad leaves the party at the end: anything the player lent him goes back into the bag
  function returnDadsGear() {
    var m = RPG.member('dad'); if (!m) return;
    RPG.SLOTS.forEach(function (s) { var it = m.equip[s] && RPG.db.items[m.equip[s]]; if (it && !(it.equipBy && it.equipBy.length === 1 && it.equipBy[0] === 'dad')) RPG.equip(m, s, null); });
  }

  // after the Chapter 1 ending: one week later, at home
  RPG.config({
    endingAfter: [
      { set: 'ch2' },
      { warp: 'home', x: 4, y: 3, dir: 'down' },
      { chapter: 2 },
      { say: 'trip.start.1', name: null },
      { say: 'trip.start.2', name: 'mom' },
      { say: 'trip.start.3', name: 'josh' },
      { say: 'trip.start.4', name: 'jasper' },
      { say: 'trip.start.5', name: 'dad' },
      { say: 'trip.start.6', name: 'josh' },
      { say: 'trip.start.7', name: 'jasper' },
      { say: 'trip.start.8', name: 'dad' },
      { say: 'trip.start.9', name: 'mom' },
      { 'if': { member: 'mochi' }, then: [{ say: 'trip.start.mochi1', name: 'mom' }, { say: 'trip.start.mochi2', name: null }, { leave: 'mochi' }, { set: 'mochi_home' }] },
      { give: 'momBento', count: 2 },
      { give: 'permissionSlip' },
      { heal: true },
      { say: 'trip.start.10', name: 'mom' }
    ],
    endings: {
      ch2: {
        art: 'ending2',
        pages: ['ending2.1', 'ending2.2', 'ending2.3', 'ending2.4', 'ending2.5', { text: 'ending2.sand', 'if': 'sandking_done' }, 'ending2.6'],
        card: { top: 'chapter.2.end', big: 'chapter.2.name', sub: 'chapter.3.teaser' },
        after: [
          { warp: 'home', x: 4, y: 3, dir: 'down' },
          { say: 'trip.home.1', name: 'mom' }, { say: 'trip.home.2', name: 'dad' }, { say: 'trip.home.3', name: 'josh' }, { say: 'trip.home.4', name: 'jasper' },
          { heal: true }, { toast: 'trip.home.tip' }
        ]
      }
    }
  });

  var FOG = { grade: 'mist', particles: 'fog', bloom: 0.35, vignette: 0.6, tint: 'rgba(205,212,228,0.16)' };
  function fog(o) { return Object.assign({}, FOG, o); }

  // ======================= maps =======================
  var BEACH_ROWS = [
    '~~~~~ww____rCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    '~~~~~ww_____rvCCCCCCCCCCCCCCCCCCCCCCCCCC',
    '~~~~~ww_______vvCCCCCCCCCCCCCCCCCCCCCCCC',
    '~~~~~ww___y______vvCCCCCCCCCCCCCCCCCCCCC',
    '~~~~~ww_______U____vvvCCCCCCCCCCCCCCCCCC',
    '~~~~www______________vvvvCCCCCCCCCCCCCCC',
    '~~~~ww_____L___________vvgCCCCCCCCCCCCCC',
    '~~~~ww____________y______vvgCCCCCCCCCCCC',
    '~~~~ww____U______________vvgpppppppppppp',
    '~~~~ww___________________vvgCCCCCCCCCCCC',
    '~~~~www________y_______U__vvCCCCCCCCCCCC',
    '~~~~~ww____________________vCCCCCCCCCCCC',
    '~~~~~ww____U______________________CCCCCC',
    '~~~~~ww_____________y_____________CCCCCC',
    '~~~~~www__________________________rCCCCC',
    '~~~~~~ww___U_______________________rCCCC',
    '~~~~~~ww_______^^^^^________________rCCC',
    '~~~~~~ww_______HQQQH_________________rCC',
    '~~~~~~ww____________________kkkkkkkkkkkC',
    '~~~~~~ww___y________________klklklklkkkC',
    '~~~~~~www___________________kYYYYYYkkkkC',
    '~~~~~~~ww___________________kXXXXXXkkkkC',
    '~~~~~~~ww___r_______________kkkkkkkkkkkC',
    '~~~~~~~ww_______rr__________klklklklkkkC',
    '~~~~~~~www______r___________kkkkkkkkkkkC',
    '~~~~~~~rrrrrrrrrrCCCCCCCCCCCCCCCCCCCCCCC'
  ];
  var BEACH_LEGEND = { '~': 'surf', 'w': 'shore', 'v': 'dune', 'C': 'sandstone', 'U': 'umbrella', 'y': 'towel', 'L': 'lifeguard',
                       'l': 'parkLine', 'Y': 'busTop', 'X': 'busBottom' };
  var BEACH_CHESTS = [
    { x: 36, y: 24, item: 'sunscreen', count: 2, flag: 'chest_beach1' },
    { x: 8, y: 1, item: 'seaweedSnack', count: 2, flag: 'chest_beach2' },
    { x: 26, y: 12, gold: 120, flag: 'chest_beach3' },
    { x: 33, y: 14, item: 'shellNecklace', flag: 'chest_beach4' }
  ];
  var SHACK = { id: 'shack', x: 17, y: 18, sprite: 'adult', palette: PAL.shack, name: 'shackOwner', dir: 'down', script: [{ say: 'trip.beach.shack' }, { shop: 'beachShack' }] };
  var LIFEGUARD = { id: 'lifeguard', x: 12, y: 7, sprite: 'capAdult', palette: PAL.lifeguard, name: 'lifeguard', dir: 'down', script: [
    { say: 'trip.beach.guard' }, { inn: 0, text: 'trip.beach.guardRest' }
  ] };
  var SUN_LIGHTS = [{ x: 30, y: 4, r: 6, color: 'rgba(255,236,190,A)' }];

  RPG.add('maps', {
    // ======================= the school bus =======================
    bus: {
      bg: '#2a2a30', backdrop: 'bus',
      ambient: 0.12, particles: 'motes', grade: 'warm', bloom: 0.4, vignette: 0.5,
      legend: { 'W': 'busWall', 'd': 'busDash', 'f': 'busFloor', 'e': 'busSeat' },
      lights: [{ x: 4, y: 0, r: 4, color: 'rgba(255,240,200,A)' }, { x: 0, y: 6, r: 3, color: 'rgba(255,240,200,A)' }, { x: 8, y: 9, r: 3, color: 'rgba(255,240,200,A)' }],
      rows: [
        'WdddddddW',
        'WfffffffW',
        'WeefffeeW',
        'WfffffffW',
        'WeefffeeW',
        'WfffffffW',
        'WeefffeeW',
        'WfffffffW',
        'WeefffeeW',
        'WfffffffW',
        'WeefffeeW',
        'WfffffffW',
        'WeeeeeeeW',
        'WWWWWWWWW'
      ],
      npcs: [
        { id: 'driver', x: 1, y: 1, sprite: 'busDriver', name: 'driver', dir: 'up', script: [{ say: 'trip.bus.driver' }] },
        { id: 'teacher', x: 7, y: 1, sprite: 'msRivera', name: 'teacher', dir: 'down', script: [{ say: 'trip.bus.teacher' }] },
        { id: 'dad', x: 6, y: 4, sprite: 'dadTrip', name: 'dad', dir: 'left', script: [
          { say: ['trip.bus.dad1', 'trip.bus.dad2'] }, { say: 'trip.bus.dadJosh', name: 'josh' }, { say: 'trip.bus.dad3' }
        ] },
        { id: 'leo', x: 1, y: 6, sprite: 'kid', palette: PAL.leo, name: 'leo', dir: 'right', script: [
          { say: ['trip.bus.leo1', 'trip.bus.leo2', 'trip.bus.leo3'] }, { say: 'trip.bus.leoJasper', name: 'jasper' }, { say: 'trip.bus.leo4' }
        ] },
        { id: 'ava', x: 7, y: 8, sprite: 'kidGirl', palette: PAL.ava, name: 'ava', dir: 'left', script: [
          { 'if': 'ava_better', then: [{ say: 'trip.bus.avaOk' }], 'else': [
            { say: 'trip.bus.ava1' },
            { 'if': { item: 'cookie' }, then: [
              { choice: ['trip.bus.avaGive', 'trip.bus.avaNo'], text: 'trip.bus.avaAsk', name: 'josh', then: [
                [{ take: 'cookie' }, { say: 'trip.bus.ava2' }, { give: 'sunglasses' }, { set: 'ava_better' }],
                [{ say: 'trip.bus.ava3' }]
              ] }
            ], 'else': [{ say: 'trip.bus.ava3' }] }
          ] }
        ] },
        { id: 'noah', x: 2, y: 10, sprite: 'kid', palette: PAL.noah, name: 'noah', dir: 'right', script: [{ say: ['trip.bus.noah1', 'trip.bus.noah2'] }] }
      ],
      events: [
        { x: 4, y: 7, trigger: 'touch', once: 'ch2_sunbot_seen', script: [
          { say: 'trip.bus.sun1', name: 'ethan' }, { say: 'trip.bus.sun2', name: 'jasper' }, { say: 'trip.bus.sun3', name: null }, { say: 'trip.bus.sun4', name: 'ethan' },
          { battle: 'sunbot', win: [
            { set: 'ch2_sunbot' },
            { say: 'trip.bus.sun5', name: null }, { say: 'trip.bus.sun6', name: 'teacher' }, { say: 'trip.bus.sun7', name: 'ethan' }, { say: 'trip.bus.sun8', name: 'dad' },
            ARRIVE
          ] }
        ] },
        { x: 4, y: 12, trigger: 'action', 'if': '!ch2_mochi', script: [
          { say: 'trip.bus.pack1', name: null }, { say: 'trip.bus.pack2', name: 'josh' }, { say: 'trip.bus.pack3', name: null }, { say: 'trip.bus.pack4', name: 'jasper' },
          { choice: ['trip.bus.hide', 'trip.bus.tell'], text: 'trip.bus.packAsk', name: 'josh', then: [
            [{ say: 'trip.bus.hide1', name: null }, { say: 'trip.bus.hide2', name: 'teacher' }, { say: 'trip.bus.hide3', name: 'dad' }, { say: 'trip.bus.hide4', name: 'teacher' }, { say: 'trip.bus.hide5', name: null }],
            [{ say: 'trip.bus.tell1', name: 'teacher' }, { say: 'trip.bus.tell2', name: 'dad' }, { say: 'trip.bus.tell3', name: 'teacher' }]
          ] },
          { join: 'mochi', level: 13 }, { unset: 'mochi_home' }, { set: 'ch2_mochi' },
          ARRIVE
        ] },
        { x: 4, y: 12, trigger: 'action', 'if': 'ch2_mochi', script: [{ say: 'trip.bus.packEmpty', name: null }] }
      ]
    },

    // ======================= Torrey Pines State Beach =======================
    beach: {
      bg: '#2a6aaa', backdrop: 'beach',
      particles: 'motes', grade: 'warm', bloom: 0.42, vignette: 0.45, lights: SUN_LIGHTS,
      legend: BEACH_LEGEND, rows: BEACH_ROWS,
      warps: [
        { x: 8, y: 0, to: 'tidepool', tx: 11, ty: 18, dir: 'up', 'if': 'ch2_lunch' }, { x: 9, y: 0, to: 'tidepool', tx: 11, ty: 18, dir: 'up', 'if': 'ch2_lunch' },
        { x: 10, y: 0, to: 'tidepool', tx: 11, ty: 18, dir: 'up', 'if': 'ch2_lunch' },
        { x: 39, y: 8, to: 'bluffs', tx: 1, ty: 20, dir: 'right', 'if': 'ch2_search' }
      ],
      encounters: { rate: 0.08, troops: [['crabs', 3], ['jellies', 2], ['castleCrab', 2], ['gulls2', 2], ['beachMix', 1]] },
      chests: BEACH_CHESTS,
      events: [
        { x: 8, y: 0, trigger: 'touch', 'if': '!ch2_lunch', script: [{ say: 'trip.beach.notYet', name: 'teacher' }] },
        { x: 9, y: 0, trigger: 'touch', 'if': '!ch2_lunch', script: [{ say: 'trip.beach.notYet', name: 'teacher' }] },
        { x: 10, y: 0, trigger: 'touch', 'if': '!ch2_lunch', script: [{ say: 'trip.beach.notYet', name: 'teacher' }] },
        { x: 39, y: 8, trigger: 'touch', 'if': '!ch2_search', script: [{ say: 'trip.beach.trailClosed', name: null }] }
      ],
      npcs: [
        { id: 'teacher', x: 24, y: 18, sprite: 'msRivera', name: 'teacher', dir: 'down', hideIf: 'ch2_fog', script: [
          { 'if': 'ch2_lunch', then: [{ say: 'trip.beach.t.work' }], 'else': [
            { 'if': 'ch2_crab_seen', then: [{ say: 'trip.beach.t.cooler2' }], 'else': [
              { say: ['trip.beach.t.lunch1', 'trip.beach.t.lunch2'] }, { say: 'trip.beach.t.lunch3', name: 'dad' }, { say: 'trip.beach.t.lunch4', name: 'leo' },
              { say: 'trip.beach.t.lunch5' }, { set: 'ch2_crab_seen' }
            ] }
          ] }
        ] },
        { id: 'dad', x: 22, y: 19, sprite: 'dadTrip', name: 'dad', dir: 'down', hideIf: 'ch2_fog', script: [
          { 'if': 'ch2_lunch', then: [{ say: 'trip.beach.dad2' }], 'else': [{ say: 'trip.beach.dad1' }] }
        ] },
        { id: 'leo', x: 20, y: 13, sprite: 'kid', palette: PAL.leo, name: 'leo', wander: 2, hideIf: 'ch2_fog', script: [{ say: ['trip.beach.leo1', 'trip.beach.leo2'] }] },
        { id: 'ava', x: 14, y: 10, sprite: 'kidGirl', palette: PAL.ava, name: 'ava', dir: 'left', hideIf: 'ch2_fog', script: [
          { 'if': 'ch2_lunch', then: [{ say: 'trip.beach.ava2' }], 'else': [{ say: 'trip.beach.ava1' }] }
        ] },
        { id: 'noah', x: 9, y: 16, sprite: 'kid', palette: PAL.noah, name: 'noah', wander: 2, hideIf: 'ch2_fog', script: [{ say: 'trip.beach.noah' }] },
        { id: 'surfer', x: 6, y: 12, sprite: 'surfer', name: 'surfer', dir: 'right', script: [{ say: ['trip.beach.surfer1', 'trip.beach.surfer2'] }] },
        LIFEGUARD, SHACK,
        { id: 'driver', x: 35, y: 22, sprite: 'busDriver', name: 'driver', dir: 'left', script: [
          { 'if': 'ch2_done', then: [
            { choice: ['trip.ride.school', 'trip.ride.stay'], text: 'trip.ride.askSchool', then: [[{ warp: 'school', x: 1, y: 8, dir: 'right' }], []] }
          ], 'else': [{ say: 'trip.beach.driver' }] }
        ] },
        // Captain Pinch, the hermit crab who moved into the lunch cooler
        { id: 'pinch', x: 12, y: 23, sprite: 'coolerCrab', name: 'pinch', dir: 'up', showIf: 'ch2_crab_seen', hideIf: 'ch2_lunch', script: [
          { say: 'trip.beach.pinch1', name: null }, { say: 'trip.beach.pinch2' }, { say: 'trip.beach.pinch3', name: 'josh' }, { say: 'trip.beach.pinch4' },
          { say: 'trip.beach.pinch5', name: 'mia', 'if': { member: 'mia' } },
          { battle: 'pinch', win: [
            { say: 'trip.beach.pinch6' }, { say: 'trip.beach.pinch7', name: 'jasper' }, { say: 'trip.beach.pinch8', name: 'dad' }, { say: 'trip.beach.pinch9', name: null },
            { say: 'trip.beach.pinch10' },
            { say: 'trip.beach.lunch1', name: 'teacher' }, { say: 'trip.beach.lunch2', name: 'dad' }, { say: 'trip.beach.lunch3', name: 'josh' },
            { heal: true }, { give: 'worksheet' }, { say: 'trip.beach.lunch4', name: 'teacher' }, { set: 'ch2_lunch' }
          ] }
        ] },
        { id: 'pinchHat', x: 13, y: 8, sprite: 'crab', name: 'pinch', wander: 1, showIf: 'ch2_lunch', script: [
          { 'if': 'ch2_done', then: [{ say: 'trip.beach.pinchAfter' }], 'else': [{ say: 'trip.beach.pinchHat' }] }
        ] },
        // after the field trip: the class gathered for the bus home
        { id: 'teacherEnd', x: 24, y: 18, sprite: 'msRivera', name: 'teacher', dir: 'down', showIf: ['ch2_kraken', '!ch2_done'], script: [{ say: 'trip.end.2' }] },
        { id: 'leoEnd', x: 22, y: 18, sprite: 'kid', palette: PAL.leo, name: 'leo', dir: 'down', showIf: ['ch2_kraken', '!ch2_done'], script: [{ say: 'trip.end.3' }] },
        { id: 'avaEnd', x: 26, y: 18, sprite: 'kidGirl', palette: PAL.ava, name: 'ava', dir: 'down', showIf: ['ch2_kraken', '!ch2_done'], script: [{ say: 'trip.fog.ava' }] },
        // the optional boss after the chapter: Ava's sandcastle came alive
        { id: 'sandKing', x: 12, y: 2, sprite: 'sandKing', name: 'sandKing', dir: 'down', showIf: 'ch2_done', hideIf: 'sandking_done', script: [
          { say: 'trip.sand.1', name: null }, { say: 'trip.sand.2' }, { say: 'trip.sand.3', name: 'josh' }, { say: 'trip.sand.4' },
          { battle: 'sandKing', win: [{ say: 'trip.sand.5', name: null }, { say: 'trip.sand.6', name: 'jasper' }, { set: 'sandking_done' }],
            lose: [{ say: 'trip.sand.lost', name: null }] }
        ] }
      ]
    },

    // ======================= the beach in the fog =======================
    beachFog: fog({
      bg: '#7a8aa0', backdrop: 'beach', ambient: 0.22,
      legend: BEACH_LEGEND, rows: BEACH_ROWS,
      warps: [{ x: 39, y: 8, to: 'bluffs', tx: 1, ty: 20, dir: 'right' }],
      encounters: { rate: 0.07, troops: [['crabs', 2], ['wisps', 2], ['jellies', 1], ['ghostCrabs', 1]] },
      chests: BEACH_CHESTS,
      events: [
        { x: 8, y: 0, trigger: 'touch', script: [{ say: 'trip.fog.noTide', name: 'teacher' }] },
        { x: 9, y: 0, trigger: 'touch', script: [{ say: 'trip.fog.noTide', name: 'teacher' }] },
        { x: 10, y: 0, trigger: 'touch', script: [{ say: 'trip.fog.noTide', name: 'teacher' }] }
      ],
      npcs: [
        { id: 'teacher', x: 24, y: 18, sprite: 'msRivera', name: 'teacher', dir: 'down', script: [{ say: 'trip.fog.t' }] },
        { id: 'leo', x: 22, y: 17, sprite: 'kid', palette: PAL.leo, name: 'leo', dir: 'down', script: [{ say: 'trip.fog.leoIdle' }] },
        { id: 'ava', x: 26, y: 17, sprite: 'kidGirl', palette: PAL.ava, name: 'ava', dir: 'down', script: [{ say: 'trip.fog.ava' }] },
        { id: 'noah', x: 20, y: 18, sprite: 'kid', palette: PAL.noah, name: 'noah', dir: 'down', script: [{ say: 'trip.fog.noah' }] },
        { id: 'ranger', x: 27, y: 9, sprite: 'capAdult', palette: PAL.ranger, name: 'parkRanger', dir: 'left', script: [{ say: 'trip.fog.rangerIdle' }] },
        { id: 'pinchHat', x: 9, y: 9, sprite: 'crab', name: 'pinch', wander: 1, script: [{ say: 'trip.fog.pinch' }] },
        LIFEGUARD, SHACK,
        { id: 'driver', x: 35, y: 22, sprite: 'busDriver', name: 'driver', dir: 'left', script: [{ say: 'trip.fog.driver' }] }
      ]
    }),

    // ======================= the tide pools =======================
    tidepool: {
      bg: '#2a6aaa', backdrop: 'tidepool',
      particles: 'motes', grade: 'warm', bloom: 0.42, vignette: 0.5, lights: [{ x: 9.5, y: 2.5, r: 3, color: 'rgba(120,230,255,A)' }],
      legend: { '~': 'surf', 'w': 'shore', 'q': 'tideRock', 'o': 'tidePool', 'C': 'sandstone', 'v': 'dune' },
      rows: [
        '~~~~~~~~CCCCCCCCCCCCCCCCCCCCCC',
        '~~~~~~~qqqqCCCCCCCCCCCCCCCCCCC',
        '~~~~~~qqooooqqqCCCCCCCCCCCCCCC',
        '~~~~~~qqooooqqqqqCCCCCCCCCCCCC',
        '~~~~~~qqqqqqqqqqqqqCCCCCCCCCCC',
        '~~~~~qqqrqqqqooqqqqqqCCCCCCCCC',
        '~~~~~qqqqqqqqooqqqqqqqqCCCCCCC',
        '~~~~~~qqqoqqqqqqqqrqqqqqqCCCCC',
        '~~~~~~~qqqqqqqqqqqqqqooqqqCCCC',
        '~~~~~~~wqqqqrqqqqqqqqooqqqqCCC',
        '~~~~~~wwqqqqqqqqoqqqqqqqqqqCCC',
        '~~~~~~wwwqqqqqqqqqqqqrqqqqvCCC',
        '~~~~~~ww__qqqqqqqqqqqqqqqvvCCC',
        '~~~~~~ww____qqqqqqqqqq___vvCCC',
        '~~~~~~ww_______qqqq_______vCCC',
        '~~~~~~ww______________r___vCCC',
        '~~~~~~www_________________vCCC',
        '~~~~~~~ww________________vvCCC',
        '~~~~~~~ww_________________vCCC',
        '~~~~~~~ww_____CCCCCCCCCCCCCCCC'
      ],
      warps: [
        { x: 10, y: 19, to: 'beach', tx: 9, ty: 1, dir: 'down' }, { x: 11, y: 19, to: 'beach', tx: 9, ty: 1, dir: 'down' },
        { x: 12, y: 19, to: 'beach', tx: 9, ty: 1, dir: 'down' }, { x: 13, y: 19, to: 'beach', tx: 9, ty: 1, dir: 'down' }
      ],
      encounters: { rate: 0.09, troops: [['stars', 3], ['urchins', 3], ['hares', 2], ['tideMix', 2], ['crabs', 1]] },
      chests: [
        { x: 20, y: 5, item: 'fishTaco', count: 2, flag: 'chest_tide1' },
        { x: 23, y: 13, item: 'rashGuard', flag: 'chest_tide2' },
        { x: 7, y: 1, item: 'goldSticker', flag: 'chest_tide3' }
      ],
      events: [
        spot(13, 5, 'tp_star', 'star', 'seaweedSnack'),
        spot(21, 8, 'tp_anemone', 'anemone', 'shaveIce'),
        spot(16, 10, 'tp_hare', 'hare', 'fishTaco'),
        { x: 9, y: 3, trigger: 'action', 'if': '!ch2_inkyOut', script: [{ say: 'trip.tide.bigPool', name: null }] }
      ],
      npcs: [
        { id: 'teacher', x: 9, y: 13, sprite: 'msRivera', name: 'teacher', dir: 'up', hideIf: 'ch2_inky', script: [
          { 'if': 'ch2_inkyOut', then: [{ say: 'trip.tide.teacher2' }], 'else': [{ say: ['trip.tide.teacher1', 'trip.tide.teacherHint'] }] }
        ] },
        { id: 'dad', x: 12, y: 12, sprite: 'dadTrip', name: 'dad', dir: 'up', hideIf: 'ch2_inky', script: [
          { 'if': 'ch2_inkyOut', then: [{ say: 'trip.tide.dad2' }], 'else': [{ say: 'trip.tide.dad1' }] }
        ] },
        { id: 'noah', x: 20, y: 13, sprite: 'kid', palette: PAL.noah, name: 'noah', wander: 2, hideIf: 'ch2_inky', script: [{ say: 'trip.tide.noah' }] },
        { id: 'inky', x: 10, y: 4, sprite: 'inky', name: 'inky', dir: 'down', showIf: 'ch2_inkyOut', hideIf: 'ch2_inky', script: [
          { say: 'trip.tide.inky1' }, { say: 'trip.tide.inky2', name: 'jasper' }, { say: 'trip.tide.inky3' }, { say: 'trip.tide.inky4', name: 'dad' },
          { battle: 'inky', win: [
            { say: 'trip.tide.win1' }, { take: 'worksheet' }, { give: 'classCamera' },
            { say: 'trip.tide.win2', name: 'jasper' }, { say: 'trip.tide.win3' }, { say: 'trip.tide.win4', name: 'dad' }, { say: 'trip.tide.photo', name: null },
            { set: 'ch2_inky' }, { wait: 30 },
            { say: 'trip.tide.fog1', name: null }, { say: 'trip.tide.fog2', name: 'teacher' },
            { warp: 'beachFog', x: 24, y: 20, dir: 'up' },
            { say: 'trip.fog.count1', name: 'teacher' }, { say: 'trip.fog.count2', name: 'josh' }, { say: 'trip.fog.count3', name: null }, { say: 'trip.fog.count4', name: 'jasper' },
            { leave: 'mochi' }, { set: 'ch2_fog' },
            { say: ['trip.fog.leo1', 'trip.fog.leo2'], name: 'leo' }, { say: 'trip.fog.josh', name: 'josh' },
            { say: 'trip.fog.teacher1', name: 'teacher' }, { say: 'trip.fog.dad1', name: 'dad' }, { say: 'trip.fog.teacher2', name: 'teacher' }, { say: 'trip.fog.ranger', name: 'parkRanger' },
            { join: 'dad', level: 16 }, { set: 'ch2_search' }, { heal: true }, { say: 'trip.fog.go', name: 'dad' }
          ] }
        ] },
        { id: 'inkyAfter', x: 12, y: 4, sprite: 'inky', name: 'inky', dir: 'down', showIf: 'ch2_kraken', script: [{ say: 'trip.tide.inkyAfter' }] }
      ]
    },

    // ======================= the Torrey Pines bluffs, in the fog =======================
    bluffs: fog({
      bg: '#5a5a6a', backdrop: 'bluffs', ambient: 0.42, playerLight: 3.6, vignette: 0.7,
      lights: [{ x: 20, y: 15, r: 3.5, color: 'rgba(255,200,130,A)' }, { x: 21, y: 14, r: 2.5, color: 'rgba(255,200,130,A)' }],
      legend: { 'C': 'sandstone', 'I': 'torreyPine', 'F': 'trailFence', '=': 'floorWood' },
      rows: [
        'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        'CCCCCCCCCCCCCCCCCCCCI__g___I__CCCC',
        'CCCCCCCCCCCCCCCCCCCg__________FFCC',
        'CCCCCCCCCCCCCCCCCCI_____rr_______=',
        'CCCCCCCCCCCCCCCCCCg__g_______g__FC',
        'CCCCCCCCCCCCCCCCCCC_pp__I____FFFCC',
        'CCCCCCCCCCCCCCCCCCCCpCCCCCCCCCCCCC',
        'CCCCCCCCCCgg_I_____ppp_g_CCCCCCCCC',
        'CCCCCCCCCg___gpppp_____g__I_CCCCCC',
        'CCCCCCCCC_I__ppgg__r____gg_____CCC',
        'CCCCCCCCCg___p____g___I____g___CCC',
        'CCCCCCCCCFF__p__I______gg___FFCCCC',
        'CCCCCCCCCCC__pp____g___________CCC',
        'CCCCCCCCCCC_g_ppp__^^^^^__g__I__CC',
        'CCCCCCCCCCI____pp__HHDHH_____g__CC',
        'CCCCCCCCCCg_____ppppippp__g_____CC',
        'CCCCCCCg__I______p____gg___I___CCC',
        'CCCCCC__g______ppp___g______g__CCC',
        'CCCCC_____I__pp___________FFFFCCCC',
        'CCC__g_____pp___g___I_____CCCCCCCC',
        'pppppppppppp___g_______CCCCCCCCCCC',
        'C____g____I____g___CCCCCCCCCCCCCCC',
        'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
      ],
      warps: [
        { x: 0, y: 20, to: 'beachFog', tx: 38, ty: 8, dir: 'left', 'if': '!ch2_kraken' },
        { x: 0, y: 20, to: 'beach', tx: 38, ty: 8, dir: 'left' },
        { x: 33, y: 3, to: 'seacave', tx: 11, ty: 13, dir: 'up', 'if': 'ch2_ghost' }
      ],
      encounters: { rate: 0.075, anywhere: true, 'if': '!ch2_kraken', troops: [['wisps', 3], ['owls', 3], ['ghostCrabs', 2], ['bluffMix', 2]] },
      chests: [
        { x: 31, y: 15, item: 'lifeVest', flag: 'chest_bluff1' },
        { x: 2, y: 21, item: 'fishTaco', count: 2, flag: 'chest_bluff2' },
        { x: 28, y: 1, item: 'goldSticker', flag: 'chest_bluff3' },
        { x: 11, y: 9, gold: 150, flag: 'chest_bluff4' }
      ],
      events: [
        { x: 3, y: 20, trigger: 'touch', once: 'bl_1', script: [
          { say: 'trip.bluff.e1a', name: null }, { say: 'trip.bluff.e1b', name: 'dad' }, { say: 'trip.bluff.e1c', name: 'jasper' }, { say: 'trip.bluff.e1d', name: 'josh' }
        ] },
        { x: 12, y: 19, trigger: 'touch', once: 'bl_2', script: [
          { say: 'trip.bluff.e2a', name: null }, { say: 'trip.bluff.e2b', name: 'josh' }, { say: 'trip.bluff.e2c', name: 'dad' }
        ] },
        { x: 14, y: 12, trigger: 'touch', once: 'bl_3', script: [
          { say: 'trip.bluff.e3a', name: null }, { say: 'trip.bluff.e3b', name: 'josh' }, { say: 'trip.bluff.e3c', name: 'jasper' }, { say: 'trip.bluff.e3d', name: 'josh' }
        ] },
        { x: 20, y: 8, trigger: 'touch', once: 'bl_4', script: [
          { say: 'trip.bluff.e4a', name: null }, { say: 'trip.bluff.e4b', name: 'dad' }, { say: 'trip.bluff.e4c', name: null },
          { say: ['trip.bluff.e4d', 'trip.bluff.e4e'], name: 'raccoonScout' }, { give: 'glowStick', count: 3 }, { say: 'trip.bluff.e4f', name: 'jasper' }, { say: 'trip.bluff.e4g', name: 'dad' }
        ] },
        { x: 20, y: 6, trigger: 'touch', once: 'bl_5', script: [
          { say: 'trip.bluff.e5a', name: null }, { say: 'trip.bluff.e5b', name: 'jasper' }, { say: 'trip.bluff.e5c', name: 'dad' }
        ] },
        { x: 21, y: 14, trigger: 'action', script: [{ say: 'trip.bluff.hutDoor', name: null }] },
        { x: 33, y: 3, trigger: 'touch', 'if': '!ch2_ghost', script: [{ say: 'trip.bluff.blocked', name: null }] }
      ],
      npcs: [
        { id: 'ranger', x: 22, y: 15, sprite: 'capAdult', palette: PAL.ranger, name: 'parkRanger', dir: 'down', script: [
          { say: 'trip.bluff.ranger' },
          { choice: ['trip.bluff.optRest', 'trip.bluff.optShop', 'trip.bluff.optBye'], then: [
            [{ inn: 0, text: 'trip.bluff.rest' }], [{ shop: 'rangerStation' }], []
          ] }
        ] },
        { id: 'towelGhost', x: 27, y: 3, sprite: 'towelGhost', name: 'ghost', dir: 'left', hideIf: 'ch2_ghost', script: [
          { say: 'trip.bluff.ghost1', name: null }, { say: 'trip.bluff.ghost2' }, { say: 'trip.bluff.ghost3', name: 'dad' }, { say: 'trip.bluff.ghost4', name: 'josh' },
          { battle: 'towelGhost', win: [
            { say: 'trip.bluff.gw1', name: null }, { say: 'trip.bluff.gw2', name: 'jasper' }, { say: 'trip.bluff.gw3', name: 'dad' }, { say: 'trip.bluff.gw4', name: null },
            { say: 'trip.bluff.gw5', name: 'pelican' }, { say: 'trip.bluff.gw6', name: 'josh' }, { set: 'ch2_ghost' }
          ] }
        ] },
        { id: 'pelican', x: 27, y: 3, sprite: 'pelican', name: 'pelican', dir: 'left', showIf: 'ch2_ghost', script: [
          { 'if': 'ch2_kraken', then: [{ say: 'trip.bluff.pelicanAfter' }], 'else': [{ say: 'trip.bluff.pelicanIdle' }] }
        ] }
      ]
    }),

    // ======================= the sea cave at Flat Rock =======================
    seacave: {
      bg: '#06080e', tint: 'rgba(0,10,30,0.18)', backdrop: 'seacave',
      ambient: 0.62, playerLight: 4, particles: 'motes', grade: 'night', bloom: 0.7, vignette: 0.72,
      lights: [{ x: 11.5, y: 1.5, r: 5, color: 'rgba(110,230,255,A)' }, { x: 10, y: 3, r: 2.2, color: 'rgba(140,250,255,A)' }],
      legend: { 'q': 'seaFloor', 'W': 'seaWall', 'o': 'caveWater', 'Z': 'seaGlass' },
      rows: [
        'WWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWooooooooooWWWWWWW',
        'WWWZqqqooooooooooqqqZWWW',
        'WWqqqqqqqqqqqqqqqqqqqqWW',
        'WqqqZqqqqqqqqqqqqqqZqqqW',
        'WqWWWWWqqqqqqqqqqWWWWWqW',
        'WqWooooWqqWWWWqqWooooWqW',
        'WqWooooWqqqqqqqqWooooWqW',
        'WqWWqWWWqqWWWWqqWWWqWWqW',
        'WqqqqqqqqqqZZqqqqqqqqqqW',
        'WWWWqWWWWqqqqqqqqWWWWqWW',
        'WZqqqqqqWqqooooqqWqqqqZW',
        'WqqoooqqWqqooooqqWqqoqqW',
        'WqqqqqqqqqqqqqqqqqqqqqqW',
        'WWWWWWWWWWWqqWWWWWWWWWWW',
        'WWWWWWWWWWWqqWWWWWWWWWWW'
      ],
      warps: [{ x: 11, y: 15, to: 'bluffs', tx: 32, ty: 3, dir: 'left' }, { x: 12, y: 15, to: 'bluffs', tx: 32, ty: 3, dir: 'left' }],
      encounters: { rate: 0.09, anywhere: true, 'if': '!ch2_kraken', troops: [['eels', 3], ['barnacles', 2], ['caveCrabs', 2], ['caveMix', 2]] },
      chests: [
        { x: 22, y: 4, item: 'seaShovel', flag: 'chest_seacave1' },
        { x: 1, y: 9, item: 'coconutWater', flag: 'chest_seacave2' },
        { x: 21, y: 12, gold: 200, flag: 'chest_seacave3' },
        { x: 6, y: 12, item: 'goldSticker', flag: 'chest_seacave4' }
      ],
      events: [
        { x: 11, y: 13, trigger: 'touch', once: 'cv_1', script: [
          { say: 'trip.cave.e1a', name: null }, { say: 'trip.cave.e1b', name: 'dad' }, { say: 'trip.cave.e1c', name: 'jasper' }, { say: 'trip.cave.e1d', name: 'ethan', 'if': { member: 'ethan' } }
        ] },
        { x: 10, y: 9, trigger: 'touch', once: 'cv_2', script: [{ say: 'trip.cave.e2a', name: null }, { say: 'trip.cave.e2b', name: 'josh' }] }
      ],
      npcs: [
        { id: 'mochiCave', x: 9, y: 3, sprite: 'mochi', name: 'mochi', dir: 'right', hideIf: 'ch2_kraken', script: [{ say: 'trip.cave.mochiIdle', name: null }] },
        { id: 'pup', x: 10, y: 3, sprite: 'seaPup', name: 'pup', dir: 'down', script: [
          { 'if': 'ch2_kraken', then: [{ say: 'trip.cave.pupHappy', name: null }], 'else': [{ say: 'trip.cave.pupIdle', name: null }] }
        ] },
        { id: 'kraken', x: 13, y: 3, sprite: 'kraken', name: 'kraken', dir: 'left', hideIf: 'ch2_kraken', script: [
          { say: 'trip.cave.k1', name: null }, { say: 'trip.cave.k2', name: 'mochi' }, { say: 'trip.cave.k3', name: 'josh' }, { say: 'trip.cave.k4', name: null },
          { say: 'trip.cave.k5' }, { say: 'trip.cave.k6', name: 'jasper' }, { say: 'trip.cave.k7', name: 'dad' }, { say: 'trip.cave.k8', name: 'josh' }, { say: 'trip.cave.k9', name: 'dad' },
          { battle: 'kraken', win: [
            { say: 'trip.cave.w1', name: null }, { say: 'trip.cave.w2', name: 'grandpa' }, { say: 'trip.cave.w3', name: 'inky' }, { say: 'trip.cave.w4', name: 'grandpa' },
            { say: 'trip.cave.w5', name: 'ethan' }, { say: 'trip.cave.w6', name: 'grandpa' },
            { set: 'ch2_kraken' },
            { say: 'trip.cave.w7', name: null }, { say: 'trip.cave.w8', name: 'pup' }, { say: 'trip.cave.w9', name: null },
            { join: 'mochi', level: 13 }, { say: 'trip.cave.w10', name: 'mochi' },
            { give: 'seaEye' }, { say: 'trip.cave.w11', name: 'jasper' }, { say: 'trip.cave.w12', name: 'dad' }, { say: 'trip.cave.w13', name: 'josh' }, { say: 'trip.cave.w14', name: 'jasper' },
            { warp: 'beach', x: 24, y: 20, dir: 'up' },
            { say: 'trip.end.1', name: null }, { say: 'trip.end.2', name: 'teacher' }, { say: 'trip.end.3', name: 'leo' }, { say: 'trip.end.4', name: 'josh' },
            { say: 'trip.end.5', name: 'mia', 'if': { member: 'mia' } }, { say: 'trip.end.6', name: 'teacher' }, { say: 'trip.end.7', name: 'dad' },
            { call: returnDadsGear }, { leave: 'dad' }, { set: 'ch2_done' }, { ending: 'ch2' }
          ] }
        ] },
        { id: 'grandpa', x: 13, y: 3, sprite: 'grandpaInk', name: 'grandpa', dir: 'left', showIf: 'ch2_kraken', script: [{ say: 'trip.cave.grandpaAfter' }] },
        { id: 'seaLion', x: 15, y: 3, sprite: 'seaLion', name: 'seaLion', dir: 'left', showIf: 'ch2_kraken', script: [{ say: 'trip.cave.seaLionAfter', name: null }] }
      ]
    }
  });

  // ======================= changes to Chapter 1 maps =======================
  function npc(mapId, id) { return RPG.db.maps[mapId].npcs.filter(function (n) { return n.id === id; })[0]; }
  // the principal doesn't hand out the trophy ending again once Chapter 2 has started
  var principal = npc('school', 'principal');
  principal.script = [{ 'if': 'ch2', then: [{ 'if': 'ch2_done', then: [{ say: 'trip.school.principalDone' }], 'else': [{ say: 'trip.school.principal' }] }], 'else': principal.script }];
  // Dad is on the field trip, then back home with a story to tell
  var dad = npc('home', 'dad');
  dad.showIf = function () { return RPG.flag('jeff_done') || RPG.flag('ch2_done'); };
  dad.hideIf = function () { return RPG.flag('ch2') && !RPG.flag('ch2_done'); };
  dad.script = [{ 'if': 'ch2_done', then: [{ say: ['trip.home.dad1', 'trip.home.dad2'] }], 'else': dad.script }];
  // the puppy at the park stays home with the family once she's joined (or once Chapter 2 starts)
  npc('street', 'mochi').hideIf = function () { return RPG.check({ member: 'mochi' }) || RPG.flag('ch2'); };
  RPG.db.maps.home.npcs.push(
    { id: 'mochiHome', x: 8, y: 6, sprite: 'mochi', name: 'mochi', dir: 'up', showIf: 'mochi_home', script: [{ say: 'trip.home.mochi', name: null }] }
  );
  RPG.db.maps.school.npcs.push(
    { id: 'teacher', x: 16, y: 3, sprite: 'msRivera', name: 'teacher', dir: 'down', showIf: 'ch2', hideIf: 'ch2_bus', script: [
      { say: ['trip.school.t1', 'trip.school.t2'] }, { say: 'trip.school.leo', name: 'leo' }, { say: 'trip.school.t3' },
      { choice: ['trip.school.go', 'trip.school.wait'], text: 'trip.school.ask', then: [
        [{ take: 'permissionSlip' }, { say: 'trip.school.t4' }, { set: 'ch2_bus' }, { warp: 'bus', x: 4, y: 1, dir: 'down' },
         { say: 'trip.bus.go1', name: null }, { say: 'trip.bus.go2', name: 'driver' }],
        [{ say: 'trip.school.t5' }]
      ] }
    ] },
    { id: 'teacherTrip', x: 16, y: 3, sprite: 'msRivera', name: 'teacher', dir: 'down', showIf: 'ch2_done', script: [
      { choice: ['trip.ride.beach', 'trip.ride.stay'], text: 'trip.ride.askBeach', then: [[{ warp: 'beach', x: 31, y: 22, dir: 'up' }], []] }
    ] }
  );
})();
