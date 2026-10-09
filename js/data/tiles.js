/*
 * Map tiles. Each tile: { solid, encounter, frames, draw(g, frame) } drawing a 16x16 square.
 * Maps refer to tiles through a legend (one character per tile, see config.js and maps.js).
 * To add a tile: add an entry here and give it a character in a legend.
 */
(function () {
  'use strict';

  // seeded speckles so every copy of a tile looks the same
  function speck(g, colors, n, seed, w, h) {
    var s = seed || 7;
    for (var i = 0; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      g.fillStyle = colors[s % colors.length];
      g.fillRect(s % 16, (s >> 5) % 16, w || 1, h || 1);
    }
  }
  function base(g, color) { g.fillStyle = color; g.fillRect(0, 0, 16, 16); }
  function grass(g) { base(g, '#5c9c48'); speck(g, ['#4a8a3a', '#6aac54', '#4e8e3e'], 26, 11); }
  function sand(g) { base(g, '#d8b880'); speck(g, ['#c8a870', '#e8c890', '#b89860'], 20, 5); }
  function floorWood(g) {
    base(g, '#a8743e');
    g.fillStyle = '#8a5a2e'; [3, 7, 11, 15].forEach(function (y) { g.fillRect(0, y, 16, 1); });
    g.fillStyle = '#7a4e26'; g.fillRect(5, 0, 1, 4); g.fillRect(11, 4, 1, 4); g.fillRect(3, 8, 1, 4); g.fillRect(9, 12, 1, 4);
  }
  function tree(g, leaf, dark) {
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(8, 14, 6, 2, 0, 0, 7); g.fill();
    g.fillStyle = '#6a4424'; g.fillRect(7, 10, 3, 5);
    g.fillStyle = dark; g.beginPath(); g.arc(8, 7, 7, 0, 7); g.fill();
    g.fillStyle = leaf; g.beginPath(); g.arc(7, 6, 5.5, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(4, 3, 3, 2);
  }

  RPG.add('tiles', {
    // ---- outdoors ----
    grass:    { draw: grass },
    flowers:  { draw: function (g) { grass(g); [[3, 4, '#f06080'], [11, 3, '#f0e060'], [6, 11, '#ffffff'], [13, 12, '#a070e0']].forEach(function (f) { g.fillStyle = f[2]; g.fillRect(f[0], f[1], 2, 2); g.fillStyle = '#f8e070'; g.fillRect(f[0], f[1], 1, 1); }); } },
    tallgrass:{ encounter: true, draw: function (g) {
      base(g, '#4a8a3a');
      g.fillStyle = '#6aac54'; for (var x = 0; x < 16; x += 3) { g.fillRect(x, 4 + (x % 2) * 3, 1, 6); g.fillRect(x + 1, 9 - (x % 2) * 2, 1, 6); }
      g.fillStyle = '#3a7a2e'; for (x = 1; x < 16; x += 4) g.fillRect(x, 2, 1, 5);
    } },
    path:     { draw: function (g) { base(g, '#c8a46a'); speck(g, ['#b89058', '#d8b47a'], 18, 3); } },
    road:     { draw: function (g) { base(g, '#4a4a52'); speck(g, ['#5a5a62', '#3e3e46'], 22, 9); } },
    roadLine: { draw: function (g) { base(g, '#4a4a52'); speck(g, ['#5a5a62', '#3e3e46'], 22, 9); g.fillStyle = '#f0d040'; g.fillRect(0, 7, 8, 2); } },
    sidewalk: { draw: function (g) { base(g, '#c8c4b8'); g.fillStyle = '#a8a498'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); speck(g, ['#b8b4a8'], 6, 2); } },
    water:    { solid: true, frames: 2, draw: function (g, f) {
      base(g, '#3a7ac8'); g.fillStyle = '#5a9ae0';
      g.fillRect(2 + f * 3, 4, 5, 1); g.fillRect(9 - f * 2, 10, 5, 1); g.fillStyle = '#8ac0f0'; g.fillRect(6 + f, 7, 2, 1);
    } },
    tree:     { solid: true, draw: function (g) { grass(g); tree(g, '#3a8a3a', '#2a6a2a'); } },
    oak:      { solid: true, draw: function (g) { sand(g); tree(g, '#5a7a44', '#40603a'); } },
    palm:     { solid: true, draw: function (g) {
      grass(g); g.fillStyle = '#8a6a44'; g.fillRect(7, 5, 2, 10);
      g.fillStyle = '#3a9a3a'; [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (d) { g.beginPath(); g.ellipse(8 + d[0] * 4, 4 + d[1] * 1.5, 5, 1.6, d[0] * d[1] * 0.4, 0, 7); g.fill(); });
    } },
    bush:     { solid: true, draw: function (g) { grass(g); g.fillStyle = '#2a7a34'; g.beginPath(); g.ellipse(8, 10, 7, 5, 0, 0, 7); g.fill(); g.fillStyle = '#3a9a44'; g.beginPath(); g.ellipse(7, 9, 5, 3.5, 0, 0, 7); g.fill(); } },
    fence:    { solid: true, draw: function (g) { grass(g); g.fillStyle = '#e8e0d0'; g.fillRect(0, 5, 16, 2); g.fillRect(0, 10, 16, 2); [1, 7, 13].forEach(function (x) { g.fillRect(x, 3, 2, 11); }); } },
    roof:     { solid: true, draw: function (g) { base(g, '#b05a3a'); g.fillStyle = '#8a4228'; for (var y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1); g.fillStyle = '#c86a48'; for (y = 0; y < 16; y += 4) for (var x = (y / 4 % 2) * 4; x < 16; x += 8) g.fillRect(x, y + 1, 3, 2); } },
    houseWall:{ solid: true, draw: function (g) { base(g, '#f0e4c8'); g.fillStyle = '#d8ccb0'; g.fillRect(0, 15, 16, 1); } },
    window:   { solid: true, draw: function (g) { base(g, '#f0e4c8'); g.fillStyle = '#5a7ab8'; g.fillRect(3, 3, 10, 9); g.fillStyle = '#a8d0f0'; g.fillRect(4, 4, 8, 7); g.fillStyle = '#f0e4c8'; g.fillRect(7, 4, 2, 7); g.fillRect(4, 7, 8, 1); } },
    door:     { draw: function (g) { base(g, '#f0e4c8'); g.fillStyle = '#7a4a22'; g.fillRect(3, 1, 10, 15); g.fillStyle = '#5a3416'; g.fillRect(4, 2, 8, 13); g.fillStyle = '#f0c040'; g.fillRect(10, 9, 1, 2); } },
    sign:     { solid: true, draw: function (g) { grass(g); g.fillStyle = '#6a4424'; g.fillRect(7, 8, 2, 7); g.fillStyle = '#a0703e'; g.fillRect(2, 2, 12, 7); g.fillStyle = '#5a3416'; g.fillRect(4, 4, 8, 1); g.fillRect(4, 6, 6, 1); } },
    // ---- canyon ----
    sand:     { draw: sand },
    rock:     { solid: true, draw: function (g) { sand(g); g.fillStyle = '#7a6a5a'; g.beginPath(); g.ellipse(8, 9, 7, 6, 0, 0, 7); g.fill(); g.fillStyle = '#9a8a78'; g.beginPath(); g.ellipse(6, 7, 4, 3, 0, 0, 7); g.fill(); } },
    cliff:    { solid: true, draw: function (g) { base(g, '#a07850'); g.fillStyle = '#8a6440'; for (var y = 2; y < 16; y += 5) g.fillRect(0, y, 16, 2); speck(g, ['#b08860', '#7a5a38'], 12, 13); } },
    cactus:   { solid: true, draw: function (g) { sand(g); g.fillStyle = '#3a8a4a'; g.fillRect(6, 3, 4, 12); g.fillRect(2, 6, 3, 2); g.fillRect(2, 4, 2, 4); g.fillRect(11, 7, 3, 2); g.fillRect(12, 5, 2, 4); g.fillStyle = '#e8e8c0'; g.fillRect(7, 5, 1, 1); g.fillRect(8, 9, 1, 1); g.fillStyle = '#e04aa0'; g.fillRect(7, 2, 2, 1); } },
    sage:     { encounter: true, draw: function (g) { sand(g); g.fillStyle = '#8aa070'; g.beginPath(); g.ellipse(8, 10, 7, 5, 0, 0, 7); g.fill(); g.fillStyle = '#a8b890'; g.beginPath(); g.ellipse(6, 8, 4, 3, 0, 0, 7); g.fill(); g.fillStyle = '#a070c8'; g.fillRect(4, 6, 1, 1); g.fillRect(11, 7, 1, 1); g.fillRect(8, 4, 1, 1); } },
    // ---- inside ----
    floorWood:{ draw: floorWood },
    rug:      { draw: function (g) { base(g, '#a83a3a'); g.fillStyle = '#c8a040'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillStyle = '#8a2a2a'; g.fillRect(6, 6, 4, 4); } },
    wallIn:   { solid: true, draw: function (g) { base(g, '#e8d8b8'); g.fillStyle = '#c8b898'; g.fillRect(0, 12, 16, 4); g.fillStyle = '#a89878'; g.fillRect(0, 12, 16, 1); } },
    counter:  { solid: true, draw: function (g) { floorWood(g); g.fillStyle = '#e8e8e0'; g.fillRect(0, 2, 16, 4); g.fillStyle = '#9a9a92'; g.fillRect(0, 6, 16, 9); g.fillStyle = '#7a7a72'; g.fillRect(2, 8, 5, 5); g.fillRect(9, 8, 5, 5); } },
    table:    { solid: true, draw: function (g) { floorWood(g); g.fillStyle = '#7a4a22'; g.fillRect(1, 3, 14, 8); g.fillStyle = '#9a6a3a'; g.fillRect(2, 4, 12, 6); g.fillStyle = '#5a3416'; g.fillRect(2, 11, 2, 4); g.fillRect(12, 11, 2, 4); } },
    bed:      { solid: true, draw: function (g) { floorWood(g); g.fillStyle = '#5a7ab8'; g.fillRect(1, 1, 14, 14); g.fillStyle = '#ffffff'; g.fillRect(3, 2, 10, 4); g.fillStyle = '#4a6aa8'; g.fillRect(1, 8, 14, 1); } },
    shelf:    { solid: true, draw: function (g) {
      base(g, '#6a4020'); var cols = ['#c84a4a', '#4a7ac8', '#4ab060', '#e8c040', '#9a5ac8'];
      for (var r = 0; r < 3; r++) { for (var b = 0; b < 6; b++) { g.fillStyle = cols[(b + r * 2) % 5]; g.fillRect(1 + b * 2 + (b > 2 ? 1 : 0), 1 + r * 5, 2, 4); } g.fillStyle = '#4a2a10'; g.fillRect(0, 5 + r * 5, 16, 1); }
    } },
    tv:       { solid: true, draw: function (g) { floorWood(g); g.fillStyle = '#202024'; g.fillRect(1, 3, 14, 10); g.fillStyle = '#4a7ab8'; g.fillRect(2, 4, 12, 8); g.fillStyle = '#80b0e8'; g.fillRect(3, 5, 4, 2); } },
    // ---- school ----
    blacktop: { draw: function (g) { base(g, '#4e4e58'); speck(g, ['#5e5e68', '#40404a'], 20, 21); } },
    hopscotch:{ draw: function (g) { base(g, '#4e4e58'); g.strokeStyle = '#f0e060'; g.lineWidth = 1; g.strokeRect(2.5, 2.5, 11, 11); } },
    schoolWall:{ solid: true, draw: function (g) { base(g, '#e8dcc0'); g.fillStyle = '#2a64b8'; g.fillRect(0, 0, 16, 3); g.fillStyle = '#c8bca0'; g.fillRect(0, 15, 16, 1); } },
    schoolWin:{ solid: true, draw: function (g) { base(g, '#e8dcc0'); g.fillStyle = '#2a64b8'; g.fillRect(0, 0, 16, 3); g.fillStyle = '#9ad0f0'; g.fillRect(3, 5, 10, 7); g.fillStyle = '#2a64b8'; g.fillRect(7, 5, 2, 7); } },
    schoolDoor:{ draw: function (g) { base(g, '#e8dcc0'); g.fillStyle = '#2a64b8'; g.fillRect(0, 0, 16, 3); g.fillRect(3, 3, 10, 13); g.fillStyle = '#1a4488'; g.fillRect(4, 4, 8, 12); g.fillStyle = '#f0c040'; g.fillRect(10, 10, 1, 2); } },
    lunchTable:{ solid: true, draw: function (g) { base(g, '#4e4e58'); g.fillStyle = '#2a64b8'; g.fillRect(1, 4, 14, 6); g.fillStyle = '#9aa4b0'; g.fillRect(2, 10, 2, 4); g.fillRect(12, 10, 2, 4); } },
    snackBar: { solid: true, draw: function (g) { base(g, '#e8dcc0'); g.fillStyle = '#d84a4a'; for (var x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 4); g.fillStyle = '#9ad0f0'; g.fillRect(2, 6, 12, 6); g.fillStyle = '#a0703e'; g.fillRect(0, 12, 16, 4); } },
    field:    { draw: function (g) { base(g, '#6aac54'); g.fillStyle = '#7abc64'; g.fillRect(0, 0, 16, 8); } },
    fieldLine:{ draw: function (g) { base(g, '#6aac54'); g.fillStyle = '#7abc64'; g.fillRect(0, 0, 16, 8); g.fillStyle = '#ffffff'; g.fillRect(0, 7, 16, 2); } },
    flagpole: { solid: true, draw: function (g) { base(g, '#4e4e58'); g.fillStyle = '#d0d0d0'; g.fillRect(7, 0, 2, 16); g.fillStyle = '#c8202a'; g.fillRect(9, 1, 6, 4); g.fillStyle = '#20307a'; g.fillRect(9, 1, 3, 2); } },
    // ---- library & lab ----
    carpet:   { draw: function (g) { base(g, '#2a7a7a'); g.fillStyle = '#348a8a'; for (var i = 0; i < 16; i += 4) g.fillRect(i, (i * 3) % 16, 2, 2); } },
    libWall:  { solid: true, draw: function (g) { base(g, '#e8d8b8'); g.fillStyle = '#8a5a30'; g.fillRect(0, 11, 16, 5); } },
    labFloor: { draw: function (g) { base(g, '#d8dce0'); g.fillStyle = '#c0c4c8'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(8, 8, 8, 8); } },
    labDesk:  { solid: true, draw: function (g) { base(g, '#d8dce0'); g.fillStyle = '#3a3a44'; g.fillRect(0, 4, 16, 8); g.fillStyle = '#ff6aa0'; g.fillRect(3, 1, 3, 4); g.fillStyle = '#6ad050'; g.fillRect(9, 2, 3, 3); } },
    machine:  { solid: true, frames: 2, draw: function (g, f) { base(g, '#8a929c'); g.fillStyle = '#5a626c'; g.fillRect(1, 1, 14, 14); g.fillStyle = f ? '#40ff80' : '#ff4040'; g.fillRect(3, 3, 2, 2); g.fillStyle = '#80e0ff'; g.fillRect(7, 4, 6, 5); } },
    // ---- cave ----
    caveFloor:{ draw: function (g) { base(g, '#5a4a3e'); speck(g, ['#4a3c32', '#6a5a4c'], 18, 17); } },
    caveWall: { solid: true, draw: function (g) { base(g, '#2a221c'); speck(g, ['#3a3028', '#1a140e'], 16, 23, 2, 2); g.fillStyle = '#4a4036'; g.fillRect(0, 0, 16, 2); } },
    trash:    { solid: true, draw: function (g) { base(g, '#5a4a3e'); g.fillStyle = '#9aa4b0'; g.fillRect(3, 6, 10, 9); g.fillStyle = '#7a848e'; g.fillRect(2, 4, 12, 3); g.fillStyle = '#e8c040'; g.fillRect(5, 2, 3, 2); } },
    dark:     { solid: true, draw: function (g) { base(g, '#000000'); } }
  });
})();
