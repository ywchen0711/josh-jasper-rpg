/*
 * Battle animations and backdrops.
 *   anims:     { frames, sfx, draw(g, x, y, progress 0..1, frame) } — played on each target; skills/items pick one with `anim`
 *   backdrops: { grade, draw(g, frame) } — battle backgrounds (troop.backdrop or the map's backdrop), plus 'title' and 'ending'
 *              grade is the color grade used in battle when effects are on ('warm' | 'cool' | 'dusk' | 'night')
 */
(function () {
  'use strict';

  function ring(g, x, y, r, color, w) { g.strokeStyle = color; g.lineWidth = w || 2; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }

  RPG.add('anims', {
    hit: { frames: 14, draw: function (g, x, y, p) {
      g.strokeStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x - 14 + p * 6, y - 14); g.lineTo(x + 14, y + 14 - p * 6); g.stroke();
    } },
    claw: { frames: 16, draw: function (g, x, y, p) {
      g.strokeStyle = 'rgba(255,90,90,' + (1 - p) + ')'; g.lineWidth = 2;
      for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x - 10 + i * 5, y - 12); g.lineTo(x + 6 + i * 5, y + 12 * p); g.stroke(); }
    } },
    ball: { frames: 18, sfx: 'hit', draw: function (g, x, y, p) {
      var bx = x + 60 * (1 - p), by = y - Math.sin(p * Math.PI) * 18;
      g.fillStyle = '#e03a3a'; g.beginPath(); g.arc(bx, by, 6, 0, 7); g.fill(); g.fillStyle = '#ff9a9a'; g.fillRect(bx - 3, by - 3, 2, 2);
    } },
    kick: { frames: 20, sfx: 'crit', draw: function (g, x, y, p) {
      var bx = x + 80 * (1 - p), by = y;
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx, by, 6, 0, 7); g.fill(); g.fillStyle = '#202020'; g.fillRect(bx - 2, by - 2, 4, 4);
      if (p > 0.8) ring(g, x, y, (p - 0.8) * 100, 'rgba(255,220,80,' + (1 - p) * 4 + ')', 3);
    } },
    sparkle: { frames: 22, sfx: 'magic', draw: function (g, x, y, p) {
      for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + p * 4, r = 18 * (1 - p); g.fillStyle = 'rgba(160,220,255,' + (1 - p) + ')'; g.fillRect(x + Math.cos(a) * r - 1, y + Math.sin(a) * r - 1, 3, 3); }
    } },
    plane: { frames: 22, sfx: 'magic', draw: function (g, x, y, p) {
      var px = x + 70 * (1 - p), py = y - 10 + Math.sin(p * 9) * 4;
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(px - 7, py); g.lineTo(px + 7, py - 4); g.lineTo(px + 7, py + 4); g.closePath(); g.fill();
    } },
    fire: { frames: 26, sfx: 'magic', draw: function (g, x, y, p) {
      for (var i = 0; i < 8; i++) { var dx = Math.sin(i * 2.3) * 12, h = 6 + (i % 3) * 4; g.fillStyle = i % 2 ? 'rgba(255,140,40,' + (1 - p) + ')' : 'rgba(255,220,80,' + (1 - p) + ')'; g.beginPath(); g.ellipse(x + dx, y + 6 - p * 16 - (i % 3) * 3, 3, h, 0, 0, 7); g.fill(); }
    } },
    bolt: { frames: 18, sfx: 'crit', draw: function (g, x, y, p) {
      if (p > 0.7) return;
      g.strokeStyle = '#fff8a0'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 4, y - 40);
      g.lineTo(x - 4, y - 18); g.lineTo(x + 5, y - 10); g.lineTo(x - 3, y + 8); g.stroke();
      g.fillStyle = 'rgba(255,255,200,' + (0.4 - p * 0.5) + ')'; g.fillRect(x - 30, y - 30, 60, 60);
    } },
    water: { frames: 18, sfx: 'hit', draw: function (g, x, y, p) {
      for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2; g.fillStyle = 'rgba(100,170,255,' + (1 - p) + ')'; g.beginPath(); g.arc(x + Math.cos(a) * p * 18, y + Math.sin(a) * p * 18, 3, 0, 7); g.fill(); }
    } },
    heal: { frames: 26, sfx: 'heal', draw: function (g, x, y, p) {
      for (var i = 0; i < 5; i++) { var px = x - 12 + i * 6, py = y + 10 - p * 26 - (i % 2) * 6; g.fillStyle = 'rgba(120,255,150,' + (1 - p) + ')'; g.fillRect(px - 1, py - 3, 2, 6); g.fillRect(px - 3, py - 1, 6, 2); }
    } },
    shine: { frames: 24, sfx: 'magic', draw: function (g, x, y, p) { ring(g, x, y, 4 + p * 16, 'rgba(255,220,100,' + (1 - p) + ')', 2); } },
    note: { frames: 26, sfx: 'magic', draw: function (g, x, y, p) {
      g.fillStyle = 'rgba(220,180,255,' + (1 - p) + ')';
      for (var i = 0; i < 3; i++) { var nx = x - 10 + i * 10, ny = y - p * 20 - i * 4; g.beginPath(); g.arc(nx, ny, 2.5, 0, 7); g.fill(); g.fillRect(nx + 2, ny - 8, 1, 8); }
    } },
    bark: { frames: 20, sfx: 'hit', draw: function (g, x, y, p) { for (var i = 0; i < 3; i++) ring(g, x + 20, y, 6 + i * 7 + p * 10, 'rgba(255,255,255,' + (1 - p) * 0.8 + ')', 1.5); } },
    goo: { frames: 20, sfx: 'hit', draw: function (g, x, y, p) { g.fillStyle = 'rgba(110,210,80,' + (1 - p) + ')'; g.beginPath(); g.ellipse(x, y + p * 6, 14 * p + 4, 8 * p + 3, 0, 0, 7); g.fill(); } },
    slam: { frames: 22, sfx: 'crit', draw: function (g, x, y, p) { ring(g, x, y + 10, p * 30, 'rgba(255,200,120,' + (1 - p) + ')', 4); } },
    stars: { frames: 26, sfx: 'magic', draw: function (g, x, y, p) {
      for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + p * 2, r = 4 + p * 18; RPG.star(g, x + Math.cos(a) * r, y + Math.sin(a) * r - p * 6, 1.6 * (1 - p) + 0.4, 'rgba(255,230,140,' + (1 - p) + ')'); }
    } },
    bubbles: { frames: 28, sfx: 'magic', draw: function (g, x, y, p) {
      for (var i = 0; i < 7; i++) {
        var bx = x - 14 + i * 5 + Math.sin(p * 8 + i) * 2, by = y + 10 - p * 28 - (i % 3) * 5;
        g.strokeStyle = 'rgba(190,240,255,' + (1 - p) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, 2 + (i % 2), 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.fillRect(bx - 1, by - 1.5, 1, 1);
      }
    } },
    zzz: { frames: 26, sfx: 'magic', draw: function (g, x, y, p) { RPG.text('Z', x - 6 + p * 8, y - 6 - p * 18, { size: 10, bold: true, color: 'rgba(200,220,255,' + (1 - p) + ')' }); RPG.text('z', x + 4, y - p * 12, { size: 8, color: 'rgba(200,220,255,' + (1 - p) + ')' }); } }
  });

  // ---- backdrops ----
  // Layered like a stage set: sky, far hills in haze, middle ground, a floor in perspective, light rays on top.
  var W = RPG.W, H = RPG.H;
  function sky(g, top, bottom, horizon) {
    var gr = g.createLinearGradient(0, 0, 0, horizon || 170); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  function sun(g, x, y, r, color, glow) {
    var gr = g.createRadialGradient(x, y, r * 0.6, x, y, r * 4); gr.addColorStop(0, glow); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
    g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  function clouds(g, y, t, color) {
    g.fillStyle = color;
    for (var i = 0; i < 4; i++) {
      var x = ((i * 97 + t * 0.08 * (1 + i % 2)) % (W + 80)) - 40, cy = y + (i % 2) * 14;
      g.beginPath(); g.ellipse(x, cy, 22, 6, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x + 14, cy - 4, 14, 6, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x - 12, cy - 2, 12, 5, 0, 0, 7); g.fill();
    }
  }
  function hills(g, color, base, amp, seed, step) {
    g.fillStyle = color; g.beginPath(); g.moveTo(0, H);
    for (var x = 0; x <= W; x += step || 6) g.lineTo(x, base - Math.abs(Math.sin(x / 40 + seed)) * amp - Math.sin(x / 13 + seed * 3) * amp * 0.12);
    g.lineTo(W, H); g.fill();
  }
  function haze(g, y, h, color) {
    var gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, color.replace('A', '0')); gr.addColorStop(1, color.replace('A', '0.55'));
    g.fillStyle = gr; g.fillRect(0, y - h, W, h);
  }
  // a floor in perspective: rows get wider apart toward the viewer, columns fan out
  function floor(g, top, bottom, y, line) {
    var gr = g.createLinearGradient(0, y, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, y, W, H - y);
    g.strokeStyle = line; g.lineWidth = 1; g.beginPath();
    for (var i = 1; i < 7; i++) { var yy = Math.round(y + Math.pow(i / 7, 1.7) * (H - y)) + 0.5; g.moveTo(0, yy); g.lineTo(W, yy); }
    for (var k = -8; k <= 8; k++) { g.moveTo(W / 2 + k * 24, y); g.lineTo(W / 2 + k * 90, H); }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y, W, 1);
  }
  function rays(g, color, t) { if (RPG.fx && RPG.fx.rays) RPG.fx.rays(g, 30, -10, color, t || 0); }
  function house(g, x, y, w, h, wall, roof) {
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 4, y + h, w, 4);
    g.fillStyle = wall; g.fillRect(x, y, w, h);
    g.fillStyle = roof; g.beginPath(); g.moveTo(x - 6, y + 2); g.lineTo(x + w / 2, y - 16); g.lineTo(x + w + 6, y + 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.moveTo(x - 6, y + 2); g.lineTo(x + w / 2, y - 16); g.lineTo(x + w / 2, y - 12); g.lineTo(x - 2, y + 2); g.fill();
    g.fillStyle = '#7ab0e0'; g.fillRect(x + 8, y + 10, 12, 10); g.fillRect(x + w - 20, y + 10, 12, 10);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 9, y + 11, 3, 3); g.fillRect(x + w - 19, y + 11, 3, 3);
  }
  function tree(g, x, y, s, dark, light) {
    g.fillStyle = '#5a3a1e'; g.fillRect(x - 2 * s, y, 4 * s, 14 * s);
    g.fillStyle = dark; g.beginPath(); g.arc(x, y - 4 * s, 14 * s, 0, 7); g.fill();
    g.fillStyle = light; g.beginPath(); g.arc(x - 4 * s, y - 9 * s, 8 * s, 0, 7); g.fill();
  }
  function cactus(g, x, y) { g.fillStyle = '#3a8a4a'; g.fillRect(x, y - 24, 6, 26); g.fillRect(x - 6, y - 14, 6, 4); g.fillRect(x - 6, y - 20, 3, 8); g.fillStyle = '#6ac070'; g.fillRect(x + 1, y - 23, 1, 24); }

  // shared with other data files (chapter2.js): RPG.bd.sky(g, top, bottom, horizon) ...
  RPG.bd = { sky: sky, sun: sun, clouds: clouds, hills: hills, haze: haze, floor: floor, rays: rays, tree: tree };

  RPG.add('backdrops', {
    'default': { grade: 'warm', draw: function (g, t) {
      sky(g, '#5aa8f0', '#d0ecff'); sun(g, 250, 36, 12, '#fff8d8', 'rgba(255,250,210,0.5)'); clouds(g, 40, t, 'rgba(255,255,255,0.75)');
      hills(g, '#9ab8a8', 112, 22, 1); haze(g, 128, 30, 'rgba(220,236,255,A)'); hills(g, '#5c9c48', 130, 12, 3);
      floor(g, '#5a9a44', '#3e7a30', 130, 'rgba(0,40,0,0.12)'); rays(g, 'rgba(255,250,220,A)', t);
    } },
    street: { grade: 'warm', draw: function (g, t) {
      sky(g, '#5aa8f0', '#d8eeff'); sun(g, 270, 30, 11, '#fff8d8', 'rgba(255,250,210,0.5)'); clouds(g, 34, t, 'rgba(255,255,255,0.7)');
      hills(g, '#a8c0c8', 96, 16, 4); haze(g, 108, 24, 'rgba(230,240,255,A)');
      for (var i = 0; i < 4; i++) house(g, 14 + i * 80, 84, 56, 42, i % 2 ? '#f4e8cc' : '#f0dcc0', i % 2 ? '#b05a3a' : '#8a5a9a');
      tree(g, 6, 112, 1, '#2e7a36', '#4ea04a'); tree(g, 316, 108, 1.1, '#2e7a36', '#4ea04a');
      g.fillStyle = '#c8c4b8'; g.fillRect(0, 126, W, 6); g.fillStyle = '#e8e4d8'; g.fillRect(0, 126, W, 1);
      floor(g, '#56565f', '#3a3a42', 132, 'rgba(255,255,255,0.05)');
      g.fillStyle = 'rgba(240,210,60,0.8)'; for (var x = 0; x < W; x += 40) g.fillRect(x, 182, 22, 3);
      rays(g, 'rgba(255,240,210,A)', t);
    } },
    canyon: { grade: 'warm', draw: function (g, t) {
      sky(g, '#7ab8ec', '#f4e0b8'); sun(g, 70, 40, 13, '#fff4d0', 'rgba(255,230,180,0.55)'); clouds(g, 30, t, 'rgba(255,248,236,0.6)');
      hills(g, '#c8a888', 92, 34, 2, 4); haze(g, 110, 34, 'rgba(250,230,200,A)');
      hills(g, '#b08a64', 116, 22, 5, 4);
      g.fillStyle = 'rgba(0,0,0,0.08)'; for (var i = 0; i < 6; i++) g.fillRect(0, 100 + i * 5, W, 1);
      hills(g, '#94704c', 132, 10, 7, 4);
      floor(g, '#dcbc88', '#b8965e', 132, 'rgba(120,80,30,0.14)');
      cactus(g, 30, 150); cactus(g, 290, 160);
      rays(g, 'rgba(255,230,180,A)', t);
    } },
    school: { grade: 'warm', draw: function (g, t) {
      sky(g, '#6ab8f4', '#d8eeff'); sun(g, 40, 30, 11, '#fff8d8', 'rgba(255,250,210,0.5)'); clouds(g, 38, t, 'rgba(255,255,255,0.75)');
      hills(g, '#a8c0b8', 78, 14, 6); haze(g, 86, 20, 'rgba(230,240,255,A)');
      var gr = g.createLinearGradient(0, 76, 0, 130); gr.addColorStop(0, '#f2e6c8'); gr.addColorStop(1, '#d8c8a4');
      g.fillStyle = gr; g.fillRect(0, 76, W, 54);
      g.fillStyle = '#2a64b8'; g.fillRect(0, 72, W, 7); g.fillStyle = '#6aa0ea'; g.fillRect(0, 72, W, 1);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#2454a0'; g.fillRect(10 + i * 54, 88, 28, 22); g.fillStyle = '#9ad0f0'; g.fillRect(12 + i * 54, 90, 24, 18); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(13 + i * 54, 91, 6, 6); }
      g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, 126, W, 4);
      floor(g, '#5a5a66', '#3e3e48', 130, 'rgba(255,255,255,0.05)');
      g.strokeStyle = 'rgba(240,224,96,0.6)'; g.lineWidth = 1; g.strokeRect(220.5, 160.5, 40, 30);
      rays(g, 'rgba(255,245,215,A)', t);
    } },
    library: { grade: 'cool', draw: function (g, t) {
      var gr = g.createLinearGradient(0, 0, 0, 130); gr.addColorStop(0, '#d8c8a8'); gr.addColorStop(1, '#f0e2c4'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (var i = 0; i < 6; i++) {
        var x = 6 + i * 54;
        g.fillStyle = '#6a4020'; g.fillRect(x, 16, 46, 114); g.fillStyle = '#8a5a30'; g.fillRect(x, 16, 46, 3);
        for (var r = 0; r < 5; r++) {
          for (var b = 0; b < 7; b++) {
            var h = 14 + ((b + r + i) % 3) * 1.5;
            g.fillStyle = ['#c86060', '#6080c0', '#60a070', '#d0b050', '#9a6ac8'][(b * 2 + r + i) % 5]; g.fillRect(x + 3 + b * 6, 22 + r * 21 + 17 - h, 5, h);
            g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 3 + b * 6, 22 + r * 21 + 17 - h, 1, h);
          }
          g.fillStyle = '#4a2a10'; g.fillRect(x, 39 + r * 21, 46, 2);
        }
      }
      g.fillStyle = 'rgba(30,20,10,0.25)'; g.fillRect(0, 0, W, 14);
      floor(g, '#2e8282', '#1e5a5a', 130, 'rgba(0,0,0,0.12)');
      rays(g, 'rgba(255,240,200,A)', t);
    } },
    lab: { grade: 'cool', draw: function (g, f) {
      sky(g, '#b8c4d0', '#e8ecf0', 130);
      g.fillStyle = 'rgba(0,0,0,0.08)'; for (var y = 10; y < 130; y += 20) g.fillRect(0, y, W, 1);
      for (var i = 0; i < 5; i++) {
        var x = 10 + i * 64;
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + 4, 126, 44, 4);
        var gr = g.createLinearGradient(x, 0, x + 44, 0); gr.addColorStop(0, '#7a828c'); gr.addColorStop(1, '#4a525c'); g.fillStyle = gr; g.fillRect(x, 56, 44, 72);
        g.fillStyle = (Math.floor(f / 20) + i) % 2 ? '#40ff80' : '#ff4040'; g.fillRect(x + 6, 62, 4, 4);
        var sg = g.createLinearGradient(0, 66, 0, 86); sg.addColorStop(0, '#c0f4ff'); sg.addColorStop(1, '#40a0d0'); g.fillStyle = sg; g.fillRect(x + 16, 66, 22, 18);
        g.fillStyle = '#ffffff'; for (var k = 0; k < 20; k += 2) g.fillRect(x + 17 + k, 75 + Math.round(Math.sin(k / 2 + f / 8 + i) * 4), 2, 1);
        var glow = g.createRadialGradient(x + 27, 75, 2, x + 27, 75, 30); glow.addColorStop(0, 'rgba(120,230,255,0.25)'); glow.addColorStop(1, 'rgba(120,230,255,0)');
        g.fillStyle = glow; g.fillRect(x - 3, 45, 60, 60);
      }
      floor(g, '#c8ccd2', '#9a9ea6', 130, 'rgba(0,0,0,0.08)');
    } },
    cave: { grade: 'night', draw: function (g, t) {
      g.fillStyle = '#120e0a'; g.fillRect(0, 0, W, H);
      hills(g, '#221a14', 150, 70, 3, 5);
      var gr = g.createRadialGradient(160, 110, 10, 160, 110, 150); gr.addColorStop(0, 'rgba(255,200,120,0.22)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2e241c'; for (var i = 0; i < 9; i++) { var x = i * 38 + 10; g.beginPath(); g.moveTo(x - 7, 0); g.lineTo(x + 7, 0); g.lineTo(x, 18 + (i % 3) * 12); g.fill(); }
      [[40, 120, '#7adcd0'], [270, 112, '#a890ff'], [210, 128, '#7adcd0']].forEach(function (c) {
        var cg = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], 16); cg.addColorStop(0, c[2]); cg.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalAlpha = 0.35 + 0.15 * Math.sin((t || 0) / 30 + c[0]); g.fillStyle = cg; g.fillRect(c[0] - 16, c[1] - 16, 32, 32); g.globalAlpha = 1;
        g.fillStyle = c[2]; g.beginPath(); g.moveTo(c[0], c[1] - 7); g.lineTo(c[0] + 3, c[1] + 3); g.lineTo(c[0] - 3, c[1] + 3); g.fill();
      });
      floor(g, '#4e4034', '#2a2018', 132, 'rgba(0,0,0,0.2)');
      g.fillStyle = '#c8a040'; [[150, 140], [168, 146], [140, 150]].forEach(function (c) { g.fillRect(c[0], c[1], 4, 3); });
    } },
    home: { grade: 'warm', draw: function (g, t) {
      var gr = g.createLinearGradient(0, 0, 0, 130); gr.addColorStop(0, '#e2d0ac'); gr.addColorStop(1, '#f0e2c4'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      [40, 220].forEach(function (x) {
        g.fillStyle = '#8a6a48'; g.fillRect(x - 3, 27, 66, 56);
        var sg = g.createLinearGradient(0, 30, 0, 80); sg.addColorStop(0, '#8ac8f8'); sg.addColorStop(1, '#d0ecff'); g.fillStyle = sg; g.fillRect(x, 30, 60, 50);
        g.fillStyle = '#8a6a48'; g.fillRect(x + 29, 30, 2, 50); g.fillRect(x, 54, 60, 2);
        g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 4, 34, 8, 8);
      });
      g.fillStyle = '#5a3a1e'; g.fillRect(130, 60, 60, 70); g.fillStyle = '#c84a4a'; g.fillRect(136, 68, 10, 18); g.fillStyle = '#4a7ac8'; g.fillRect(150, 66, 10, 20); g.fillStyle = '#e8c040'; g.fillRect(164, 70, 8, 16);
      floor(g, '#b47e46', '#8a5a2e', 130, 'rgba(60,30,10,0.18)');
      rays(g, 'rgba(255,240,200,A)', t);
    } },
    title: { draw: function (g, t) {
      sky(g, '#4a98e8', '#f8e4c0', 190);
      sun(g, 262, 44, 16, '#fff6d0', 'rgba(255,240,200,0.6)');
      clouds(g, 50, t, 'rgba(255,255,255,0.8)');
      hills(g, '#b4c0b0', 168, 34, t / 400); haze(g, 178, 30, 'rgba(250,240,220,A)');
      hills(g, '#88a070', 186, 18, 2 + t / 300);
      var gr = g.createLinearGradient(0, 146, 0, 190); gr.addColorStop(0, '#f2e6c8'); gr.addColorStop(1, '#d8c8a4');
      g.fillStyle = gr; g.fillRect(40, 150, 240, 40); g.fillStyle = '#2a64b8'; g.fillRect(36, 146, 248, 6); g.fillStyle = '#6aa0ea'; g.fillRect(36, 146, 248, 1);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#9ad0f0'; g.fillRect(52 + i * 38, 160, 18, 14); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(53 + i * 38, 161, 5, 5); }
      tree(g, 22, 176, 1.1, '#2e7a36', '#4ea04a'); tree(g, 300, 178, 1.2, '#2e7a36', '#4ea04a');
      floor(g, '#5c9c48', '#3e7a30', 190, 'rgba(0,40,0,0.12)');
      rays(g, 'rgba(255,240,200,A)', t);
    } },
    ending: { grade: 'dusk', draw: function (g, t) {
      sky(g, '#e07050', '#f8d0a0', 150); sun(g, 160, 120, 40, '#ffe080', 'rgba(255,200,120,0.5)');
      clouds(g, 50, t, 'rgba(255,200,170,0.6)');
      hills(g, '#6a5a8a', 150, 20, 1); haze(g, 150, 24, 'rgba(255,190,150,A)');
      floor(g, '#5c9c48', '#2e5a28', 150, 'rgba(0,30,0,0.15)');
      rays(g, 'rgba(255,220,160,A)', t);
      [[120, 110, 'josh', 2, 20, 0], [148, 104, 'coyote', 2.4, 15, 0], [180, 110, 'jasper', 2, 20, 1]].forEach(function (s) {
        g.fillStyle = 'rgba(40,20,30,0.3)'; g.beginPath(); g.ellipse(s[0] + 16, s[1] + 34, 14, 3.5, 0, 0, 7); g.fill();
        RPG.drawSprite(s[2], s[0], s[1], { pose: 'down', frame: Math.floor(t / s[4] + s[5]) % 2, scale: s[3] });
      });
    } }
  });
})();
