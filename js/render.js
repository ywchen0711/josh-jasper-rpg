/*
 * Drawing: a 320x240 logical screen rendered at the device's resolution (crisp pixels, sharp Chinese text),
 * window boxes, text, and caches for sprites (pixel maps from js/data/sprites.js) and tiles (js/data/tiles.js).
 */
(function () {
  'use strict';
  var W = RPG.W = 320, H = RPG.H = 240, T = RPG.TILE = 16;
  var canvas = document.getElementById('screen'), g = canvas.getContext('2d');
  RPG.canvas = canvas; RPG.g = g;
  RPG.scale = 1;

  RPG.resize = function () {
    var dpr = window.devicePixelRatio || 1;
    var fit = Math.min(window.innerWidth / W, window.innerHeight / H) * dpr;
    var k = fit >= 2 ? Math.floor(fit) : Math.max(1, fit);
    RPG.scale = k;
    canvas.width = Math.round(W * k); canvas.height = Math.round(H * k);
    canvas.style.width = (W * k / dpr) + 'px'; canvas.style.height = (H * k / dpr) + 'px';
  };
  window.addEventListener('resize', RPG.resize);
  RPG.resize();
  RPG.beginFrame = function () {
    g.setTransform(RPG.scale, 0, 0, RPG.scale, 0, 0);
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 1;
  };

  // ======================= text =======================
  var FONT = '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
  RPG.font = function (size, bold) { return (bold ? '700 ' : '500 ') + (size || 11) + 'px ' + FONT; };
  // opts: color, size, align, bold, shadow (default true), baseline
  RPG.text = function (str, x, y, opts) {
    opts = opts || {};
    g.font = RPG.font(opts.size, opts.bold);
    g.textAlign = opts.align || 'left';
    g.textBaseline = opts.baseline || 'top';
    if (opts.shadow !== false) { g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillText(str, x + 0.7, y + 0.7); }
    g.fillStyle = opts.color || '#f4f0e8';
    g.fillText(str, x, y);
  };
  RPG.textWidth = function (str, size, bold) { g.font = RPG.font(size, bold); return g.measureText(str).width; };
  // wrap by measuring characters (works for Chinese and English); "\n" forces a line break
  RPG.wrap = function (str, width, size) {
    g.font = RPG.font(size);
    var out = [];
    String(str).split('\n').forEach(function (para) {
      var line = '';
      for (var i = 0; i < para.length; i++) {
        var ch = para[i];
        if (g.measureText(line + ch).width > width && line) {
          // keep English words together when possible
          var sp = line.lastIndexOf(' ');
          if (/[A-Za-z0-9]/.test(ch) && sp > 0 && /[A-Za-z]/.test(line[line.length - 1])) { out.push(line.slice(0, sp)); line = line.slice(sp + 1); }
          else { out.push(line); line = ''; }
        }
        line += ch;
      }
      out.push(line);
    });
    return out;
  };

  // ======================= windows =======================
  RPG.box = function (x, y, w, h, opts) {
    opts = opts || {};
    g.fillStyle = opts.fill || 'rgba(16,24,58,0.94)';
    roundRect(x, y, w, h, 4); g.fill();
    g.strokeStyle = opts.border || '#e8e0c8'; g.lineWidth = 1.5;
    roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 3); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1;
    roundRect(x + 3, y + 3, w - 6, h - 6, 2); g.stroke();
  };
  function roundRect(x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  RPG.bar = function (x, y, w, h, frac, color) {
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y, w, h);
    g.fillStyle = color; g.fillRect(x, y, Math.round(w * RPG.clamp(frac, 0, 1)), h);
  };
  RPG.cursor = function (x, y) {                       // a little pointing hand
    var b = Math.floor(RPG.frame / 15) % 2;
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(x + b, y); g.lineTo(x + 6 + b, y + 4); g.lineTo(x + b, y + 8); g.closePath(); g.fill();
  };

  // ======================= sprites =======================
  // A sprite in RPG.db.sprites: { palette: { ch: color }, frames: { poseName: [rows, rows, ...] } }
  // rows are strings, '.' is transparent; every other character is looked up in the palette.
  var spriteCache = {};
  function paint(rows, pal) {
    var w = rows[0].length, c = document.createElement('canvas');
    c.width = w; c.height = rows.length;
    var cg = c.getContext('2d');
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var col = pal[row[x]];
        if (row[x] === '.' || !col) continue;
        cg.fillStyle = col; cg.fillRect(x, y, 1, 1);
      }
    });
    return c;
  }
  function flipped(c) {
    var f = document.createElement('canvas'); f.width = c.width; f.height = c.height;
    var fg = f.getContext('2d'); fg.translate(c.width, 0); fg.scale(-1, 1); fg.drawImage(c, 0, 0);
    return f;
  }
  RPG.spriteImage = function (id, pose, frame, palette, flip) {
    var key = id + '|' + pose + '|' + frame + '|' + (palette ? JSON.stringify(palette) : '') + (flip ? '|f' : '');
    if (spriteCache[key]) return spriteCache[key];
    var sp = RPG.get('sprites', id), frames = sp.frames[pose] || sp.frames[Object.keys(sp.frames)[0]];
    var rows = frames[frame % frames.length];
    var img = paint(rows, Object.assign({}, sp.palette, palette || {}));
    if (flip) img = flipped(img);
    spriteCache[key] = img;
    return img;
  };
  // opts: pose, frame, palette, flip, scale, alpha, flash
  RPG.drawSprite = function (id, x, y, opts) {
    opts = opts || {};
    var img = RPG.spriteImage(id, opts.pose || 'down', opts.frame || 0, opts.palette, opts.flip);
    var s = opts.scale || 1;
    if (opts.alpha != null) g.globalAlpha = opts.alpha;
    g.drawImage(img, Math.round(x), Math.round(y), img.width * s, img.height * s);
    if (opts.flash) {                                  // white flash when hit
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = opts.flash;
      g.drawImage(img, Math.round(x), Math.round(y), img.width * s, img.height * s);
      g.globalCompositeOperation = 'source-over';
    }
    g.globalAlpha = 1;
    return img;
  };

  // ======================= tiles =======================
  // A tile in RPG.db.tiles: { solid, encounter, frames, draw(g, frame) } — drawn once per frame into a 16x16 canvas
  var tileCache = {};
  RPG.tileImage = function (id, frame) {
    var t = RPG.get('tiles', id), f = t.frames ? frame % t.frames : 0, key = id + '|' + f;
    if (tileCache[key]) return tileCache[key];
    var c = document.createElement('canvas'); c.width = c.height = T;
    t.draw(c.getContext('2d'), f);
    tileCache[key] = c;
    return c;
  };
})();
