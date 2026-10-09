/*
 * Battle animations and backdrops.
 *   anims:     { frames, sfx, draw(g, x, y, progress 0..1, frame) } — played on each target; skills/items pick one with `anim`
 *   backdrops: { draw(g, frame) } — battle backgrounds (troop.backdrop or the map's backdrop), plus 'title' and 'ending'
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
    zzz: { frames: 26, sfx: 'magic', draw: function (g, x, y, p) { RPG.text('Z', x - 6 + p * 8, y - 6 - p * 18, { size: 10, bold: true, color: 'rgba(200,220,255,' + (1 - p) + ')' }); RPG.text('z', x + 4, y - p * 12, { size: 8, color: 'rgba(200,220,255,' + (1 - p) + ')' }); } }
  });

  // ---- backdrops ----
  function sky(g, top, bottom) { var gr = g.createLinearGradient(0, 0, 0, 170); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, RPG.W, RPG.H); }
  function hills(g, color, base, amp, seed) { g.fillStyle = color; g.beginPath(); g.moveTo(0, RPG.H); for (var x = 0; x <= RPG.W; x += 8) g.lineTo(x, base - Math.abs(Math.sin(x / 40 + seed)) * amp); g.lineTo(RPG.W, RPG.H); g.fill(); }
  function floor(g, color, y) { g.fillStyle = color; g.fillRect(0, y, RPG.W, RPG.H - y); g.fillStyle = 'rgba(0,0,0,0.12)'; for (var i = 0; i < 6; i++) g.fillRect(0, y + i * 10, RPG.W, 1); }

  RPG.add('backdrops', {
    'default': { draw: function (g) { sky(g, '#6ab4f8', '#b8e0ff'); hills(g, '#5c9c48', 130, 14, 1); floor(g, '#4a8a3a', 130); } },
    street: { draw: function (g) { sky(g, '#6ab4f8', '#c8e8ff'); g.fillStyle = '#f0e4c8'; for (var i = 0; i < 4; i++) { g.fillRect(10 + i * 80, 80, 60, 50); g.fillStyle = '#b05a3a'; g.fillRect(4 + i * 80, 70, 72, 12); g.fillStyle = '#f0e4c8'; } floor(g, '#4a4a52', 130); } },
    canyon: { draw: function (g) { sky(g, '#88c8f0', '#e8e0c0'); hills(g, '#b8a080', 110, 30, 2); hills(g, '#a08060', 130, 16, 5); floor(g, '#d8b880', 130); } },
    school: { draw: function (g) {
      sky(g, '#7cc4f4', '#c8e8ff'); g.fillStyle = '#e8dcc0'; g.fillRect(0, 80, RPG.W, 50); g.fillStyle = '#2a64b8'; g.fillRect(0, 76, RPG.W, 6);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#9ad0f0'; g.fillRect(12 + i * 54, 92, 24, 18); } floor(g, '#4e4e58', 130);
    } },
    library: { draw: function (g) {
      g.fillStyle = '#f0e2c4'; g.fillRect(0, 0, RPG.W, RPG.H);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#8a5a30'; g.fillRect(6 + i * 54, 20, 46, 110); for (var r = 0; r < 5; r++) for (var b = 0; b < 7; b++) { g.fillStyle = ['#c86060', '#6080c0', '#60a070', '#d0b050'][(b + r + i) % 4]; g.fillRect(9 + i * 54 + b * 6, 24 + r * 21, 5, 17); } }
      floor(g, '#2a7a7a', 130);
    } },
    lab: { draw: function (g, f) {
      sky(g, '#c8d0d8', '#e8ecf0');
      for (var i = 0; i < 5; i++) { g.fillStyle = '#5a626c'; g.fillRect(10 + i * 64, 60, 44, 70); g.fillStyle = (Math.floor(f / 20) + i) % 2 ? '#40ff80' : '#ff4040'; g.fillRect(16 + i * 64, 66, 4, 4); g.fillStyle = '#80e0ff'; g.fillRect(26 + i * 64, 70, 22, 16); }
      floor(g, '#b8bcc0', 130);
    } },
    cave: { draw: function (g) { g.fillStyle = '#1a140e'; g.fillRect(0, 0, RPG.W, RPG.H); hills(g, '#2a221c', 140, 50, 3); g.fillStyle = 'rgba(255,200,120,0.08)'; g.beginPath(); g.arc(160, 100, 120, 0, 7); g.fill(); floor(g, '#4a3c32', 130); } },
    home: { draw: function (g) { g.fillStyle = '#e8d8b8'; g.fillRect(0, 0, RPG.W, RPG.H); g.fillStyle = '#9ad0f0'; g.fillRect(40, 30, 60, 50); g.fillRect(220, 30, 60, 50); floor(g, '#a8743e', 130); } },
    title: { draw: function (g, t) {
      sky(g, '#5aa8f0', '#c8e8ff');
      g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(260, 40, 16, 0, 7); g.fill();
      hills(g, '#a8b49a', 175, 30, t / 400); hills(g, '#8aa070', 190, 18, 2 + t / 300);
      g.fillStyle = '#e8dcc0'; g.fillRect(40, 150, 240, 40); g.fillStyle = '#2a64b8'; g.fillRect(36, 146, 248, 6);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#9ad0f0'; g.fillRect(52 + i * 38, 160, 18, 14); }
      floor(g, '#5c9c48', 190);
    } },
    ending: { draw: function (g, t) {
      sky(g, '#f09060', '#f8d0a0'); g.fillStyle = '#ffe080'; g.beginPath(); g.arc(160, 120, 40, 0, 7); g.fill();
      hills(g, '#6a5a8a', 150, 20, 1); floor(g, '#5c9c48', 150);
      RPG.drawSprite('josh', 120, 110, { pose: 'down', frame: Math.floor(t / 20) % 2, scale: 2 });
      RPG.drawSprite('coyote', 148, 104, { pose: 'down', frame: Math.floor(t / 15) % 2, scale: 2.4 });
      RPG.drawSprite('jasper', 180, 110, { pose: 'down', frame: Math.floor(t / 20 + 1) % 2, scale: 2 });
    } }
  });
})();
