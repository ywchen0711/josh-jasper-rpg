/*
 * Map tiles. Each tile: { solid, encounter, frames, draw(g, frame) } drawing a 16x16 square.
 * Tiles are rendered at 2x, so half-pixel details (0.5) show up as fine pixels — that is where the HD-2D texture comes from.
 *
 * Standing things (trees, cactus, flagpole) use
 *   tall: n          extra tiles of height above the tile
 *   tallW: px        width of the standing image (wider than 16 lets a tree crown spill over its neighbours)
 *   drawTall(g, frame, height)   draws the standing part; the tile's own square is x 0..16, y height-16..height
 * They are depth-sorted with the characters, so you can walk behind them, and get a soft drop shadow.
 *
 *   light: { r, color }   glows in the dark when map effects are on (r in tiles, color 'rgba(r,g,b,A)')
 *
 * Maps refer to tiles through a legend (one character per tile, see config.js and maps.js).
 * To add a tile: add an entry here and give it a character in a legend.
 */
(function () {
  'use strict';

  // ---------- helpers ----------
  function rng(seed) { var s = seed || 7; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  // seeded speckles on the half-pixel grid, so every copy of a tile looks the same
  function speck(g, colors, n, seed, w, h, area) {
    var r = rng(seed), a = area || [0, 0, 16, 16];
    for (var i = 0; i < n; i++) {
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      g.fillRect(a[0] + Math.floor(r() * a[2] * 2) / 2, a[1] + Math.floor(r() * a[3] * 2) / 2, w || 0.5, h || 0.5);
    }
  }
  function base(g, color) { g.fillStyle = color; g.fillRect(0, 0, 16, 16); }
  function vgrad(g, x, y, w, h, top, bottom) {
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  function blob(g, x, y, rx, ry, color) { g.fillStyle = color; g.beginPath(); g.ellipse(x, y, rx, ry || rx, 0, 0, Math.PI * 2); g.fill(); }

  // ---------- ground ----------
  function grass(g, seed) {
    vgrad(g, 0, 0, 16, 16, '#66a84e', '#57983f');
    speck(g, ['#4c8a38', '#5a9a44', '#72b45a'], 40, seed || 11);
    var r = rng((seed || 11) + 3);
    for (var i = 0; i < 14; i++) {                         // little blades: light tip, dark root
      var x = Math.floor(r() * 31) / 2, y = Math.floor(r() * 28) / 2 + 1;
      g.fillStyle = '#80c464'; g.fillRect(x, y, 0.5, 1);
      g.fillStyle = '#45823a'; g.fillRect(x, y + 1, 0.5, 1);
    }
  }
  function sand(g, seed) {
    vgrad(g, 0, 0, 16, 16, '#d4b47c', '#c6a46c');
    speck(g, ['#c4a26c', '#ead0a0', '#b8955e'], 34, seed || 5);
    var r = rng((seed || 5) + 9);
    for (var i = 0; i < 4; i++) {                          // pebbles with a lit top
      var x = Math.floor(r() * 28) / 2 + 1, y = Math.floor(r() * 28) / 2 + 1;
      g.fillStyle = '#9a7c50'; g.fillRect(x, y + 0.5, 1.5, 1);
      g.fillStyle = '#f2dcb0'; g.fillRect(x, y, 1, 0.5);
    }
  }
  function floorWood(g) {
    vgrad(g, 0, 0, 16, 16, '#b47e46', '#a46e3a');
    for (var row = 0; row < 4; row++) {
      var y = row * 4;
      g.fillStyle = '#c48e54'; g.fillRect(0, y, 16, 0.5);                 // lit edge of each plank
      g.fillStyle = '#7e4e26'; g.fillRect(0, y + 3.5, 16, 0.5);          // gap
      g.fillStyle = '#8a5a2e'; g.fillRect([5, 11, 3, 9][row], y, 0.5, 3.5);
      g.fillStyle = 'rgba(90,50,20,0.35)'; g.fillRect([1, 7, 12, 4][row], y + 1.5, 3, 0.5);   // grain
    }
  }
  function stone(g, top, bottom, line, seed) {
    vgrad(g, 0, 0, 16, 16, top, bottom);
    speck(g, [line], 10, seed);
  }

  // ---------- trees ----------
  function crown(g, cx, cy, r, P, f) {
    var o = f ? 0.5 : 0;
    blob(g, cx, cy + 2.5, r, r * 0.85, P[0]);
    blob(g, cx - r * 0.6, cy + 2, r * 0.55, r * 0.5, P[0]); blob(g, cx + r * 0.62, cy + 2, r * 0.55, r * 0.5, P[0]);
    blob(g, cx - r * 0.35 + o, cy, r * 0.62, r * 0.55, P[1]); blob(g, cx + r * 0.4 + o, cy + 0.5, r * 0.55, r * 0.5, P[1]);
    blob(g, cx + o, cy - r * 0.35, r * 0.62, r * 0.52, P[1]);
    blob(g, cx - r * 0.42 + o, cy - r * 0.32, r * 0.36, r * 0.3, P[2]); blob(g, cx + r * 0.1 + o, cy - r * 0.62, r * 0.32, r * 0.26, P[2]);
    speck(g, [P[3]], 22, 31, 0.5, 0.5, [cx - r * 0.9 + o, cy - r * 0.9, r * 1.2, r * 0.9]);   // sunlit leaves
    speck(g, [P[0]], 18, 37, 0.5, 0.5, [cx - r * 0.2, cy, r * 1.1, r * 0.9]);                // leaves in shade
  }
  function trunk(g, x, y, h, light, dark) {
    g.fillStyle = dark; g.fillRect(x, y, 3, h);
    g.fillStyle = light; g.fillRect(x, y, 1.5, h);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 0.5, y + 2, 0.5, 1); g.fillRect(x + 2, y + 4, 0.5, 1.5);
    g.fillStyle = dark; g.fillRect(x - 1, y + h - 1, 5, 1);               // roots
  }
  var GREEN = ['#24602c', '#34823a', '#4aa04a', '#9ad86a'], OLIVE = ['#3e5a30', '#56783e', '#6e9450', '#c0d888'];

  // ---------- roofs: [top, bottom, lit edge, gap, speckles...] ----------
  var ROOFS = {
    terracotta: ['#c46a44', '#9a4a2e', '#d88058', '#7a3420', '#e09070', '#8a3e26'],
    slate:      ['#7a8494', '#5a6272', '#98a2b2', '#40485a', '#aab4c4', '#4a5262'],
    brown:      ['#9a7454', '#76543a', '#b48c6a', '#5a3e28', '#c49a78', '#644630'],
    navy:       ['#4a6aa8', '#34508a', '#6a8ac8', '#22386a', '#8aa8e0', '#2a4478']
  };
  function roof(g, c) {
    vgrad(g, 0, 0, 16, 16, c[0], c[1]);
    for (var y = 0; y < 16; y += 4) for (var x = (y / 4 % 2) * 4 - 4; x < 16; x += 8) {
      g.fillStyle = c[2]; g.fillRect(x + 0.5, y + 0.5, 7, 0.5);                    // lit top of each shingle
      g.fillStyle = c[3]; g.fillRect(x, y + 3.5, 8, 0.5); g.fillRect(x + 7.5, y, 0.5, 4);
    }
    speck(g, [c[4], c[5]], 10, 47);
  }

  // ---------- walls ----------
  function stucco(g, top, bottom) { vgrad(g, 0, 0, 16, 16, top, bottom); speck(g, ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.12)'], 24, 41); }
  function glass(g, x, y, w, h) {
    vgrad(g, x, y, w, h, '#cfeaff', '#6a9ed8');
    g.fillStyle = 'rgba(255,255,255,0.55)';                           // diagonal reflection
    for (var i = 0; i < h * 0.7; i += 0.5) g.fillRect(x + Math.max(0, w * 0.3 - i * 0.6), y + i, 1, 0.5);
  }

  RPG.add('tiles', {
    // ======================= outdoors =======================
    grass:    { draw: function (g) { grass(g); } },
    flowers:  { draw: function (g) {
      grass(g, 19);
      [[3, 4, '#f06080', '#ff9ab0'], [11, 3, '#f0d040', '#fff0a0'], [6, 11, '#f4f4ff', '#ffffff'], [13, 12, '#a070e0', '#d0b0ff'], [9, 7.5, '#f08040', '#ffc080']].forEach(function (f) {
        g.fillStyle = '#3a7a30'; g.fillRect(f[0] + 0.5, f[1] + 1.5, 0.5, 1.5);
        g.fillStyle = f[2]; g.fillRect(f[0], f[1], 1.5, 1.5);
        g.fillStyle = f[3]; g.fillRect(f[0], f[1], 0.5, 0.5);
        g.fillStyle = '#f8e070'; g.fillRect(f[0] + 0.5, f[1] + 0.5, 0.5, 0.5);
      });
    } },
    tallgrass:{ encounter: true, frames: 2, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#4e9040', '#3c7a32');
      for (var x = 0; x < 16; x += 1.5) {
        var h = 5 + ((x * 7) % 5), sway = f && (x * 2) % 3 === 0 ? 0.5 : 0;
        g.fillStyle = '#2e6a28'; g.fillRect(x + sway, 16 - h, 0.5, h);
        g.fillStyle = '#7cc062'; g.fillRect(x + sway, 16 - h, 0.5, 1.5);
        g.fillStyle = '#5aa04a'; g.fillRect(x + 0.5, 16 - h + 3, 0.5, h - 3);
      }
      speck(g, ['#a8e080'], 8, 23, 0.5, 0.5, [0, 3, 16, 6]);
    } },
    path:     { draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#d4b07a', '#c4a068');
      speck(g, ['#b08a56', '#e0c48e', '#a07a48'], 36, 3);
      g.fillStyle = 'rgba(255,240,200,0.25)'; g.fillRect(3, 5, 2, 0.5); g.fillRect(10, 11, 2.5, 0.5);
    } },
    road:     { draw: function (g) { stone(g, '#50505a', '#46464f', '#5e5e68', 9); speck(g, ['#3a3a42', '#6a6a74'], 18, 13); } },
    roadLine: { draw: function (g) {
      stone(g, '#50505a', '#46464f', '#5e5e68', 9); speck(g, ['#3a3a42', '#6a6a74'], 18, 13);
      g.fillStyle = '#e8c838'; g.fillRect(0, 7, 8, 2); g.fillStyle = '#fff07a'; g.fillRect(0, 7, 8, 0.5);
    } },
    crosswalk:{ draw: function (g) {
      stone(g, '#50505a', '#46464f', '#5e5e68', 9);
      for (var y = 1; y < 16; y += 5) { g.fillStyle = '#e8e8e0'; g.fillRect(2, y, 12, 3); g.fillStyle = '#ffffff'; g.fillRect(2, y, 12, 0.5); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(2, y + 2.5, 12, 0.5); }
    } },
    lamp:     { solid: true, tall: 1, light: { r: 2.6, color: 'rgba(255,214,150,A)' }, draw: function (g) { grass(g, 101); },
                drawTall: function (g, f, h) {
                  g.fillStyle = '#3a3e48'; g.fillRect(6.5, h - 3, 3, 2);
                  g.fillStyle = '#4a505c'; g.fillRect(7.5, h - 24, 1.5, 22); g.fillStyle = '#8a92a0'; g.fillRect(7.5, h - 24, 0.5, 22);
                  g.fillStyle = '#2a2e38'; g.fillRect(5, h - 27, 6.5, 2);
                  g.fillStyle = '#fff2c0'; g.fillRect(5.5, h - 25, 5.5, 2.5); g.fillStyle = '#ffffff'; g.fillRect(6, h - 25, 2, 1);
                } },
    sidewalk: { draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#d4d0c4', '#c4c0b4');
      g.fillStyle = '#a4a094'; g.fillRect(0, 15.5, 16, 0.5); g.fillRect(15.5, 0, 0.5, 16);
      g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, 16, 0.5); g.fillRect(0, 0, 0.5, 16);
      speck(g, ['#b4b0a4', '#dcd8cc'], 14, 2);
    } },
    water:    { solid: true, frames: 3, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#4a8ad4', '#2e64b0');
      g.fillStyle = '#6aa8ec'; g.fillRect((2 + f * 3) % 16, 4, 5, 0.5); g.fillRect((9 + 16 - f * 2) % 16, 10, 5, 0.5); g.fillRect((5 + f * 4) % 16, 13.5, 4, 0.5);
      g.fillStyle = '#a8d8ff'; g.fillRect((6 + f) % 16, 7, 1.5, 0.5); g.fillRect((12 + f * 2) % 16, 2, 1, 0.5);
      g.fillStyle = '#ffffff'; g.fillRect([3, 10, 7][f], [9, 5, 12][f], 0.5, 0.5);                 // sparkle
    } },
    tree:     { solid: true, tall: 1, tallW: 30, frames: 2, draw: function (g) { grass(g); },
                drawTall: function (g, f, h) { trunk(g, 6.5, h - 9, 8, '#8a5a32', '#5a3a1e'); crown(g, 8, h - 17, 10.5, GREEN, f); } },
    oak:      { solid: true, tall: 1, tallW: 30, frames: 2, draw: function (g) { sand(g); },
                drawTall: function (g, f, h) { trunk(g, 6.5, h - 9, 8, '#8a6a48', '#5a4630'); crown(g, 8, h - 16, 9.5, OLIVE, f); } },
    palm:     { solid: true, tall: 2, tallW: 32, frames: 2, draw: function (g) { grass(g); },
                drawTall: function (g, f, h) {
                  for (var i = 0; i < 24; i++) {                    // a gently curving trunk with rings
                    var y = h - 2 - i, x = 7 + Math.sin(i / 9) * 2;
                    g.fillStyle = i % 3 === 0 ? '#6a4a2c' : '#9a7448'; g.fillRect(x, y, 2.5, 1);
                    g.fillStyle = '#b8925e'; g.fillRect(x, y, 0.5, 1);
                  }
                  var tx = 9, ty = h - 27, sw = f ? 0.06 : 0;
                  [[-1, 0.6, '#2a7a34'], [1, 0.6, '#2a7a34'], [-1, -0.2, '#3a9a3e'], [1, -0.2, '#3a9a3e']].forEach(function (d) {
                    g.save(); g.translate(tx, ty); g.rotate(d[0] * (d[1] + sw));
                    g.fillStyle = d[2]; g.beginPath(); g.ellipse(d[0] * 6.5, 1, 7, 1.8, 0, 0, Math.PI * 2); g.fill();
                    g.fillStyle = '#8ad870'; g.fillRect(d[0] * 6.5 - 3, 0.5, 6, 0.5);
                    g.restore();
                  });
                  blob(g, tx, ty - 1, 2.5, 3, '#4cb048'); g.fillStyle = '#9ae67a'; g.fillRect(tx - 0.5, ty - 3.5, 0.5, 3);
                  blob(g, tx - 1, ty + 1.5, 1.2, 1.2, '#6a4420'); blob(g, tx + 1.2, ty + 1.8, 1.2, 1.2, '#7a5028');
                } },
    bush:     { solid: true, draw: function (g) {
      grass(g, 29);
      blob(g, 8, 11, 7.5, 5, 'rgba(10,30,10,0.35)');
      blob(g, 8, 9.5, 7, 5, '#24702e'); blob(g, 5, 8.5, 4, 3.5, '#348a3c'); blob(g, 10.5, 8, 4, 3.5, '#348a3c');
      blob(g, 6, 7, 2.5, 2, '#52a850'); blob(g, 10, 6.5, 2, 1.6, '#52a850');
      speck(g, ['#9ad870'], 10, 43, 0.5, 0.5, [3, 5, 10, 4]);
      g.fillStyle = '#e04a5a'; g.fillRect(4, 10, 1, 1); g.fillRect(11, 9, 1, 1); g.fillRect(8, 12, 1, 1);
      g.fillStyle = '#ffb0b8'; g.fillRect(4, 10, 0.5, 0.5); g.fillRect(11, 9, 0.5, 0.5);
    } },
    fence:    { solid: true, draw: function (g) {
      grass(g, 37);
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, 13, 16, 1.5);
      [5, 10].forEach(function (y) { g.fillStyle = '#c8c0b0'; g.fillRect(0, y, 16, 2); g.fillStyle = '#ffffff'; g.fillRect(0, y, 16, 0.5); });
      [1, 7, 13].forEach(function (x) { g.fillStyle = '#d8d0c0'; g.fillRect(x, 3, 2, 11); g.fillStyle = '#ffffff'; g.fillRect(x, 3, 0.5, 11); g.fillStyle = '#a8a090'; g.fillRect(x + 1.5, 3, 0.5, 11); });
    } },
    roof:     { solid: true, draw: function (g) { roof(g, ROOFS.terracotta); } },
    roofSlate:{ solid: true, draw: function (g) { roof(g, ROOFS.slate); } },
    roofBrown:{ solid: true, draw: function (g) { roof(g, ROOFS.brown); } },
    roofNavy: { solid: true, draw: function (g) { roof(g, ROOFS.navy); } },
    houseWall:{ solid: true, draw: function (g) {
      stucco(g, '#f4e8cc', '#e4d4b4');
      g.fillStyle = '#c8b898'; g.fillRect(0, 14, 16, 2); g.fillStyle = '#f8f0dc'; g.fillRect(0, 14, 16, 0.5);
    } },
    window:   { solid: true, draw: function (g) {
      stucco(g, '#f4e8cc', '#e4d4b4');
      g.fillStyle = '#4a6a9a'; g.fillRect(2.5, 2.5, 11, 10);
      glass(g, 3.5, 3.5, 9, 8);
      g.fillStyle = '#f8f0dc'; g.fillRect(7.5, 3.5, 1, 8); g.fillRect(3.5, 7, 9, 1);
      g.fillStyle = '#c8b898'; g.fillRect(2, 12.5, 12, 1.5); g.fillStyle = '#ffffff'; g.fillRect(2, 12.5, 12, 0.5);
      g.fillStyle = '#e05a6a'; g.fillRect(3.5, 11.5, 1, 1); g.fillRect(11, 11.5, 1, 1);    // flower box
    } },
    door:     { draw: function (g) {
      stucco(g, '#f4e8cc', '#e4d4b4');
      g.fillStyle = '#5a3416'; g.fillRect(2.5, 0.5, 11, 15.5);
      vgrad(g, 3.5, 1.5, 9, 14.5, '#8a5428', '#6a3e1c');
      g.fillStyle = '#9a6434'; g.fillRect(4.5, 2.5, 3, 5); g.fillRect(8.5, 2.5, 3, 5); g.fillRect(4.5, 9, 3, 5); g.fillRect(8.5, 9, 3, 5);
      g.fillStyle = '#ffd860'; g.fillRect(10.5, 8.5, 1, 1); g.fillStyle = '#ffffff'; g.fillRect(10.5, 8.5, 0.5, 0.5);
    } },
    sign:     { solid: true, draw: function (g) {
      grass(g, 53);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(6, 14, 5, 1);
      g.fillStyle = '#5a3a1e'; g.fillRect(7, 8, 2, 7); g.fillStyle = '#8a5a32'; g.fillRect(7, 8, 0.5, 7);
      g.fillStyle = '#6a4424'; g.fillRect(1.5, 1.5, 13, 8);
      vgrad(g, 2, 2, 12, 7, '#c08a50', '#a0703e');
      g.fillStyle = '#e0b07a'; g.fillRect(2, 2, 12, 0.5);
      g.fillStyle = '#4a2a10'; g.fillRect(4, 4, 8, 0.5); g.fillRect(4, 6, 6, 0.5);
    } },
    // ======================= canyon =======================
    sand:     { draw: function (g) { sand(g); } },
    rock:     { solid: true, draw: function (g) {
      sand(g, 59);
      blob(g, 9, 13, 7, 2.5, 'rgba(60,40,20,0.35)');
      blob(g, 8, 9, 7, 6, '#6a5a4a'); blob(g, 7.5, 8, 6.5, 5.2, '#86745e'); blob(g, 6, 6.5, 4, 3, '#a8947a');
      g.fillStyle = '#c8b498'; g.fillRect(4.5, 5, 2, 0.5); g.fillRect(4, 5.5, 0.5, 1);
      g.fillStyle = '#4a3e32'; g.fillRect(9, 7, 0.5, 3); g.fillRect(9.5, 10, 1.5, 0.5);
    } },
    cliff:    { solid: true, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#b08458', '#8a6440');
      [[0, '#c49870', '#7a5636'], [5, '#b88c62', '#6e4c2e'], [10, '#a87e56', '#664428']].forEach(function (b, i) {
        g.fillStyle = b[1]; g.fillRect(0, b[0] + 0.5, 16, 0.5);                       // sunlit ledge
        g.fillStyle = b[2]; g.fillRect(0, b[0] + 4, 16, 1);                          // shadowed underside
        g.fillStyle = 'rgba(60,36,16,0.4)'; g.fillRect([3, 9, 13][i], b[0] + 1, 0.5, 3);
      });
      speck(g, ['#c8a07a', '#6a4a2c'], 20, 13);
    } },
    cactus:   { solid: true, tall: 1, draw: function (g) { sand(g, 61); },
                drawTall: function (g, f, h) {
                  var top = h - 26;
                  function col(x, y, w, hh) {
                    g.fillStyle = '#2a6a36'; g.fillRect(x, y + 1, w, hh - 1); g.fillRect(x + 0.5, y, w - 1, 1);
                    g.fillStyle = '#4aa052'; g.fillRect(x + 0.5, y + 0.5, w * 0.45, hh - 1);
                    g.fillStyle = '#7acc72'; g.fillRect(x + 0.5, y + 1, 0.5, hh - 2);
                  }
                  col(6, top, 4.5, 24); col(1.5, top + 8, 3, 5); col(2.5, top + 12, 4, 2.5); col(11.5, top + 5, 3, 6); col(9.5, top + 10, 3, 2.5);
                  speck(g, ['#f0f0d0'], 14, 67, 0.5, 0.5, [6, top + 2, 4.5, 20]);
                  g.fillStyle = '#ff6ab0'; g.fillRect(7, top - 1, 2.5, 1.5); g.fillStyle = '#ffd0e8'; g.fillRect(7.5, top - 1, 1, 0.5);
                } },
    sage:     { encounter: true, frames: 2, draw: function (g, f) {
      sand(g, 71);
      blob(g, 8, 11.5, 7, 3.5, 'rgba(60,50,30,0.3)');
      blob(g, 8, 10, 7, 5, '#748a5c'); blob(g, 5.5 + f * 0.5, 8.5, 4, 3, '#8ea472'); blob(g, 10.5, 8, 3.5, 2.6, '#8ea472');
      speck(g, ['#c0d0a0'], 12, 73, 0.5, 0.5, [2, 5, 12, 5]);
      g.fillStyle = '#a070c8'; g.fillRect(4, 6, 1, 1); g.fillRect(11, 6.5, 1, 1); g.fillRect(8, 4.5, 1, 1);
      g.fillStyle = '#d8b0ff'; g.fillRect(4, 6, 0.5, 0.5); g.fillRect(8, 4.5, 0.5, 0.5);
    } },
    // ======================= inside =======================
    floorWood:{ draw: floorWood },
    rug:      { draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#b84444', '#9a3434');
      g.fillStyle = '#d8b050'; g.fillRect(0, 0.5, 16, 1); g.fillRect(0, 14.5, 16, 1);
      g.fillStyle = '#8a2a2a'; g.fillRect(5, 5, 6, 6); g.fillStyle = '#d8b050'; g.fillRect(7, 7, 2, 2);
      speck(g, ['#c85656', '#8a2c2c'], 16, 79);
    } },
    wallIn:   { solid: true, draw: function (g) {
      stucco(g, '#f0e2c4', '#e2d2b0');
      g.fillStyle = '#c8b494'; g.fillRect(0, 12, 16, 4); g.fillStyle = '#a89070'; g.fillRect(0, 12, 16, 0.5); g.fillStyle = '#dcc8a8'; g.fillRect(0, 12.5, 16, 0.5);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 15, 16, 1);
    } },
    counter:  { solid: true, draw: function (g) {
      floorWood(g);
      g.fillStyle = '#f4f4ee'; g.fillRect(0, 2, 16, 4); g.fillStyle = '#ffffff'; g.fillRect(0, 2, 16, 0.5);
      vgrad(g, 0, 6, 16, 9, '#a8a8a0', '#86867e');
      g.fillStyle = '#6a6a62'; g.fillRect(2, 8, 5, 5); g.fillRect(9, 8, 5, 5);
      g.fillStyle = '#c8c8c0'; g.fillRect(6, 10, 0.5, 1); g.fillRect(9.5, 10, 0.5, 1);
    } },
    table:    { solid: true, draw: function (g) {
      floorWood(g);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(2, 11, 13, 4);
      g.fillStyle = '#5a3416'; g.fillRect(2, 10, 2, 5); g.fillRect(12, 10, 2, 5);
      g.fillStyle = '#6a3e1c'; g.fillRect(1, 3, 14, 8);
      vgrad(g, 1.5, 3.5, 13, 6.5, '#b47c46', '#94602e');
      g.fillStyle = '#d0965a'; g.fillRect(1.5, 3.5, 13, 0.5);
      g.fillStyle = '#ffffff'; g.fillRect(5, 5, 3, 2); g.fillStyle = '#e04a4a'; g.fillRect(9.5, 5, 2, 2);          // plate and apple
    } },
    bed:      { solid: true, draw: function (g) {
      floorWood(g);
      g.fillStyle = '#5a3416'; g.fillRect(0.5, 0.5, 15, 15);
      vgrad(g, 1, 6, 14, 9.5, '#6a92d0', '#4a6aa8');
      g.fillStyle = '#ffffff'; g.fillRect(2.5, 1.5, 11, 4); g.fillStyle = '#d8e0f0'; g.fillRect(2.5, 4.5, 11, 1);
      g.fillStyle = '#8ab0e8'; g.fillRect(1, 6, 14, 0.5); g.fillStyle = '#3a5a98'; g.fillRect(1, 9, 14, 0.5);
    } },
    shelf:    { solid: true, draw: function (g) {
      base(g, '#5a3418'); g.fillStyle = '#7a4c26'; g.fillRect(0, 0, 0.5, 16); g.fillRect(15.5, 0, 0.5, 16);
      var cols = ['#c84a4a', '#4a7ac8', '#4ab060', '#e8c040', '#9a5ac8', '#e08040'];
      for (var r = 0; r < 3; r++) {
        for (var b = 0; b < 7; b++) {
          var c = cols[(b * 3 + r * 2) % 6], hgt = 3.5 + ((b + r) % 3) * 0.5, x = 1 + b * 2;
          g.fillStyle = c; g.fillRect(x, 5 + r * 5 - hgt, 1.5, hgt);
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, 5 + r * 5 - hgt, 0.5, hgt);
          g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x + 0.5, 5 + r * 5 - hgt + 1, 0.5, 0.5);
        }
        g.fillStyle = '#3a200c'; g.fillRect(0, 5 + r * 5, 16, 0.5); g.fillStyle = '#8a5a30'; g.fillRect(0, 5.5 + r * 5, 16, 0.5);
      }
    } },
    tv:       { solid: true, frames: 2, light: { r: 1.8, color: 'rgba(140,190,255,A)' }, draw: function (g, f) {
      floorWood(g);
      g.fillStyle = '#5a3416'; g.fillRect(2, 12, 12, 3);
      g.fillStyle = '#18181c'; g.fillRect(1, 2.5, 14, 10);
      vgrad(g, 2, 3.5, 12, 8, f ? '#7ab0f0' : '#90c8ff', '#3a6ab0');
      g.fillStyle = '#ffffff'; g.fillRect(3, 4.5, 3, 0.5); g.fillStyle = f ? '#80e070' : '#f0d050'; g.fillRect(8, 7, 4, 3);
    } },
    // ======================= school =======================
    blacktop: { draw: function (g) { stone(g, '#55555f', '#4a4a54', '#62626c', 21); speck(g, ['#3e3e48', '#6a6a76'], 20, 25); } },
    hopscotch:{ draw: function (g) {
      stone(g, '#55555f', '#4a4a54', '#62626c', 21);
      g.fillStyle = '#f0e060'; g.fillRect(2.5, 2.5, 11, 0.5); g.fillRect(2.5, 13, 11, 0.5); g.fillRect(2.5, 2.5, 0.5, 11); g.fillRect(13, 2.5, 0.5, 11);
      g.fillStyle = 'rgba(240,224,96,0.4)'; g.fillRect(6.5, 6, 3, 4);
    } },
    schoolWall:{ solid: true, draw: function (g) {
      stucco(g, '#efe2c4', '#dccca8');
      vgrad(g, 0, 0, 16, 3, '#3a7ad0', '#2454a0'); g.fillStyle = '#6aa0ea'; g.fillRect(0, 0, 16, 0.5);
      g.fillStyle = '#c4b490'; g.fillRect(0, 14.5, 16, 1.5);
    } },
    schoolWin:{ solid: true, draw: function (g) {
      stucco(g, '#efe2c4', '#dccca8');
      vgrad(g, 0, 0, 16, 3, '#3a7ad0', '#2454a0'); g.fillStyle = '#6aa0ea'; g.fillRect(0, 0, 16, 0.5);
      g.fillStyle = '#2454a0'; g.fillRect(2.5, 4.5, 11, 8);
      glass(g, 3, 5, 10, 7);
      g.fillStyle = '#2454a0'; g.fillRect(7.5, 5, 1, 7);
      g.fillStyle = '#c4b490'; g.fillRect(0, 14.5, 16, 1.5);
    } },
    schoolDoor:{ draw: function (g) {
      stucco(g, '#efe2c4', '#dccca8');
      vgrad(g, 0, 0, 16, 3, '#3a7ad0', '#2454a0');
      g.fillStyle = '#1a3a78'; g.fillRect(2.5, 3, 11, 13);
      vgrad(g, 3.5, 4, 4, 12, '#3a6ab8', '#24488a'); vgrad(g, 8.5, 4, 4, 12, '#3a6ab8', '#24488a');
      glass(g, 4, 5, 3, 4); glass(g, 9, 5, 3, 4);
      g.fillStyle = '#ffd860'; g.fillRect(7, 10, 0.5, 2); g.fillRect(8.5, 10, 0.5, 2);
    } },
    lunchTable:{ solid: true, draw: function (g) {
      stone(g, '#55555f', '#4a4a54', '#62626c', 21);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(2, 10, 13, 4);
      g.fillStyle = '#8a94a0'; g.fillRect(2, 9, 1.5, 5); g.fillRect(12.5, 9, 1.5, 5);
      g.fillStyle = '#1a4a90'; g.fillRect(1, 4, 14, 6);
      vgrad(g, 1, 4, 14, 5, '#3a7ad0', '#2a5aa8'); g.fillStyle = '#7ab0f0'; g.fillRect(1, 4, 14, 0.5);
    } },
    snackBar: { solid: true, light: { r: 2.2, color: 'rgba(255,214,140,A)' }, draw: function (g) {
      stucco(g, '#efe2c4', '#dccca8');
      for (var x = 0; x < 16; x += 4) { g.fillStyle = '#e05050'; g.fillRect(x, 0, 2, 4); g.fillStyle = '#ffffff'; g.fillRect(x + 2, 0, 2, 4); }
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, 4, 16, 1);
      vgrad(g, 2, 5.5, 12, 6.5, '#fff0c0', '#f0c070');
      g.fillStyle = '#e04a4a'; g.fillRect(4, 8, 1.5, 2); g.fillStyle = '#4ab060'; g.fillRect(7, 8.5, 1.5, 1.5); g.fillStyle = '#4a7ac8'; g.fillRect(10, 8, 1.5, 2);
      vgrad(g, 0, 12, 16, 4, '#b47c46', '#8a5a30'); g.fillStyle = '#d4a06a'; g.fillRect(0, 12, 16, 0.5);
    } },
    field:    { draw: function (g) { vgrad(g, 0, 0, 16, 8, '#7ec068', '#76b860'); vgrad(g, 0, 8, 16, 8, '#6aac54', '#62a44c'); speck(g, ['#5a9a46', '#8ccc74'], 22, 83); } },
    fieldLine:{ draw: function (g) {
      vgrad(g, 0, 0, 16, 8, '#7ec068', '#76b860'); vgrad(g, 0, 8, 16, 8, '#6aac54', '#62a44c'); speck(g, ['#5a9a46', '#8ccc74'], 22, 83);
      g.fillStyle = '#f4f4f0'; g.fillRect(0, 7, 16, 2); speck(g, ['#c8d8c0'], 6, 89, 0.5, 0.5, [0, 7, 16, 2]);
    } },
    flagpole: { solid: true, tall: 2, tallW: 24, frames: 3, draw: function (g) { stone(g, '#55555f', '#4a4a54', '#62626c', 21); },
                drawTall: function (g, f, h) {
                  g.fillStyle = '#6a6a72'; g.fillRect(5, h - 4, 6, 3); g.fillStyle = '#9a9aa2'; g.fillRect(5, h - 4, 6, 0.5);
                  g.fillStyle = '#c8c8d0'; g.fillRect(7, h - 44, 2, 41); g.fillStyle = '#ffffff'; g.fillRect(7, h - 44, 0.5, 41);
                  blob(g, 8, h - 45, 1.4, 1.4, '#f0d050');
                  for (var x = 0; x < 10; x += 0.5) {                     // a waving flag, stripes and a blue corner
                    var dy = Math.sin(x / 2.2 + f * 2.1) * 0.8;
                    for (var s = 0; s < 6; s++) { g.fillStyle = s % 2 ? '#f4f4f4' : '#d02a32'; g.fillRect(9 + x, h - 43 + dy + s, 0.5, 1); }
                    if (x < 4.5) { g.fillStyle = '#20307a'; g.fillRect(9 + x, h - 43 + dy, 0.5, 3); }
                  }
                } },
    // ======================= library & lab =======================
    carpet:   { draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#2e8282', '#287474');
      g.fillStyle = '#3a9494'; for (var i = 0; i < 16; i += 4) g.fillRect(i, (i * 3) % 16, 1.5, 1.5);
      g.fillStyle = '#c8a040'; g.fillRect(0, 0, 16, 0.5);
      speck(g, ['#246a6a', '#3c9898'], 20, 97);
    } },
    libWall:  { solid: true, draw: function (g) {
      stucco(g, '#efe0c0', '#ddcca8');
      vgrad(g, 0, 10.5, 16, 5.5, '#9a6a3a', '#744a24'); g.fillStyle = '#c08a50'; g.fillRect(0, 10.5, 16, 0.5);
      g.fillStyle = '#5a3416'; g.fillRect(7.5, 11, 0.5, 5);
    } },
    labFloor: { draw: function (g) {
      base(g, '#dcdfe4'); g.fillStyle = '#c8ccd2'; g.fillRect(8, 8, 8, 8); g.fillRect(0, 0, 8, 8);
      g.fillStyle = '#b0b4ba'; g.fillRect(0, 0, 16, 0.5); g.fillRect(0, 0, 0.5, 16);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(2, 10, 3, 0.5); g.fillRect(10, 2, 3, 0.5);
    } },
    labDesk:  { solid: true, light: { r: 1.2, color: 'rgba(255,140,200,A)' }, draw: function (g) {
      base(g, '#dcdfe4');
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(1, 12, 15, 2);
      g.fillStyle = '#2a2a32'; g.fillRect(0, 4, 16, 8);
      vgrad(g, 0, 4, 16, 3, '#5a5a66', '#3a3a44'); g.fillStyle = '#7a7a88'; g.fillRect(0, 4, 16, 0.5);
      g.fillStyle = '#ff6aa0'; g.fillRect(3, 1, 3, 4); g.fillStyle = '#ffc0d8'; g.fillRect(3.5, 1.5, 0.5, 2.5); g.fillStyle = '#e8e8f0'; g.fillRect(3.5, 0.5, 2, 1);
      g.fillStyle = '#6ad050'; g.fillRect(9, 2, 3, 3); g.fillStyle = '#c0ffa8'; g.fillRect(9.5, 2.5, 0.5, 1.5);
    } },
    machine:  { solid: true, frames: 2, light: { r: 2.4, color: 'rgba(120,230,255,A)' }, draw: function (g, f) {
      vgrad(g, 0, 0, 16, 16, '#9aa2ac', '#6a727c');
      vgrad(g, 1, 1, 14, 14, '#6a727c', '#4a525c');
      g.fillStyle = f ? '#40ff80' : '#ff4848'; g.fillRect(3, 3, 2, 2); g.fillStyle = '#ffffff'; g.fillRect(3, 3, 0.5, 0.5);
      vgrad(g, 7, 3.5, 6, 5, '#b0f0ff', '#40a0d0');
      g.fillStyle = '#ffffff'; for (var x = 7.5; x < 12.5; x += 0.5) g.fillRect(x, 6 + Math.round(Math.sin(x * 2 + f * 2) * 2) / 2, 0.5, 0.5);
      g.fillStyle = '#2a323c'; g.fillRect(3, 11, 10, 0.5); g.fillRect(3, 12.5, 10, 0.5);
    } },
    // ======================= cave =======================
    caveFloor:{ draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#5e4e40', '#52443a');
      speck(g, ['#463a30', '#6e5e50', '#3e3228'], 34, 17);
      g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(4, 6, 2, 0.5); g.fillRect(11, 12, 1.5, 0.5);
    } },
    caveWall: { solid: true, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#3a3028', '#1e1812');
      [[0, 0, 7, 6], [7, 1, 9, 5], [1, 7, 6, 5], [8, 6, 7, 6], [0, 12, 9, 4], [10, 12, 6, 4]].forEach(function (b) {
        g.fillStyle = '#2a221a'; g.fillRect(b[0], b[1], b[2], b[3]);
        g.fillStyle = '#4e4236'; g.fillRect(b[0] + 0.5, b[1] + 0.5, b[2] - 1, 0.5);      // lit top edge
        g.fillStyle = '#140e0a'; g.fillRect(b[0], b[1] + b[3] - 0.5, b[2], 0.5);
      });
      g.fillStyle = '#7adcd0'; g.fillRect(12, 8, 1, 1); g.fillStyle = '#d0fff8'; g.fillRect(12, 8, 0.5, 0.5);   // a glinting crystal
    } },
    trash:    { solid: true, light: { r: 1.6, color: 'rgba(255,220,120,A)' }, draw: function (g) {
      vgrad(g, 0, 0, 16, 16, '#5e4e40', '#52443a');
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(3, 14, 11, 1.5);
      vgrad(g, 3, 6, 10, 9, '#b0b8c4', '#7a848e');
      g.fillStyle = '#c8d0da'; g.fillRect(4, 6, 0.5, 9); g.fillStyle = '#6a747e'; for (var x = 5.5; x < 13; x += 2.5) g.fillRect(x, 7, 0.5, 7);
      vgrad(g, 2, 4, 12, 2.5, '#c8d0da', '#8a949e');
      g.fillStyle = '#f0c840'; g.fillRect(5, 2, 3, 2); g.fillStyle = '#fff4b0'; g.fillRect(5, 2, 1, 0.5);    // something shiny on top
      g.fillStyle = '#e04a4a'; g.fillRect(9, 2.5, 2, 1.5);
    } },
    dark:     { solid: true, draw: function (g) { base(g, '#000000'); } }
  });
})();
