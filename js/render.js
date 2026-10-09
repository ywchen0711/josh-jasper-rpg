/*
 * Drawing. A 320x240 logical screen rendered at the device's resolution.
 *  - RPG.ctx is the current drawing target (the screen, or the map's "world" canvas before the HD-2D effects)
 *  - sprites (pixel maps from js/data/sprites.js) are upscaled with Scale2x, outlined and lit from above,
 *    so 16px art draws with twice the detail
 *  - tiles (js/data/tiles.js) are drawn at 2x; tiles with `tall` also have a part that stands up (trees)
 */
(function () {
  'use strict';
  var W = RPG.W = 320, H = RPG.H = 240, T = RPG.TILE = 16;
  var canvas = document.getElementById('screen'), main = canvas.getContext('2d');
  RPG.canvas = canvas; RPG.g = main; RPG.ctx = main;
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
    RPG.ctx = main;
    main.setTransform(RPG.scale, 0, 0, RPG.scale, 0, 0);
    main.imageSmoothingEnabled = false;
    main.globalAlpha = 1; main.globalCompositeOperation = 'source-over'; main.filter = 'none';
  };

  // ======================= text =======================
  var FONT = '"Nunito","Huninn","Noto Sans TC","PingFang TC","Microsoft JhengHei","Segoe UI",sans-serif';
  RPG.font = function (size, bold) { return (bold ? '700 ' : '500 ') + (size || 11) + 'px ' + FONT; };
  RPG.text = function (str, x, y, opts) {
    var g = RPG.ctx;
    opts = opts || {};
    g.font = RPG.font(opts.size, opts.bold);
    g.textAlign = opts.align || 'left';
    g.textBaseline = opts.baseline || 'top';
    if (opts.shadow !== false) { g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillText(str, x + 0.7, y + 0.7); }
    g.fillStyle = opts.color || '#f4f0e8';
    g.fillText(str, x, y);
  };
  RPG.textWidth = function (str, size, bold) { var g = RPG.ctx; g.font = RPG.font(size, bold); return g.measureText(str).width; };
  // wrap by measuring characters (Chinese and English); "\n" forces a break; English words stay together
  RPG.wrap = function (str, width, size) {
    var g = RPG.ctx;
    g.font = RPG.font(size);
    var out = [];
    String(str).split('\n').forEach(function (para) {
      var line = '';
      for (var i = 0; i < para.length; i++) {
        var ch = para[i];
        if (g.measureText(line + ch).width > width && line) {
          var sp = line.lastIndexOf(' ');
          if (/[^\s]/.test(ch) && sp > 0 && /[A-Za-z0-9,.!?'’]/.test(line[line.length - 1]) && /[A-Za-z0-9]/.test(ch)) { out.push(line.slice(0, sp)); line = line.slice(sp + 1); }
          else { out.push(line); line = ch === ' ' ? '' : ''; if (ch === ' ') continue; }
        }
        line += ch;
      }
      out.push(line);
    });
    return out;
  };

  // ======================= windows =======================
  RPG.box = function (x, y, w, h, opts) {
    var g = RPG.ctx;
    opts = opts || {};
    var r = Math.min(7, h / 2 - 1), gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, opts.fill || 'rgba(58,62,128,0.95)'); gr.addColorStop(1, opts.fill2 || opts.fill || 'rgba(32,30,78,0.95)');
    g.fillStyle = 'rgba(10,6,30,0.35)'; roundRect(g, x + 1, y + 2, w, h, r); g.fill();           // soft drop shadow
    g.fillStyle = gr; roundRect(g, x, y, w, h, r); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.07)'; roundRect(g, x + 2, y + 2, w - 4, Math.min(10, h / 2), Math.max(1, r - 2)); g.fill();
    g.strokeStyle = opts.border || '#fff1d6'; g.lineWidth = 1.4;
    roundRect(g, x + 1.2, y + 1.2, w - 2.4, h - 2.4, r - 1); g.stroke();
    g.strokeStyle = 'rgba(255,190,210,0.35)'; g.lineWidth = 1;
    roundRect(g, x + 3, y + 3, w - 6, h - 6, Math.max(1, r - 3)); g.stroke();
    if (w > 40 && h > 20 && opts.sparkle !== false) star(g, x + w - 7, y + 6, 1.8, '#ffe9a8');
  };
  function star(g, x, y, r, color) {
    g.fillStyle = color; g.beginPath();
    g.moveTo(x, y - r * 2); g.lineTo(x + r * 0.5, y - r * 0.5); g.lineTo(x + r * 2, y); g.lineTo(x + r * 0.5, y + r * 0.5);
    g.lineTo(x, y + r * 2); g.lineTo(x - r * 0.5, y + r * 0.5); g.lineTo(x - r * 2, y); g.lineTo(x - r * 0.5, y - r * 0.5); g.closePath(); g.fill();
  }
  RPG.star = star;
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  RPG.bar = function (x, y, w, h, frac, color) {
    var g = RPG.ctx;
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, color); gr.addColorStop(1, color);
    g.fillStyle = 'rgba(0,0,0,0.0)'; roundRect(g, x, y, w, h, h / 2);
    g.save(); g.clip(); g.fillStyle = 'rgba(20,14,40,0.6)'; g.fillRect(x, y, w, h);
    g.fillStyle = gr; g.fillRect(x, y, Math.round(w * RPG.clamp(frac, 0, 1)), h); g.restore();
  };
  RPG.cursor = function (x, y) {
    // a little bouncing heart
    var g = RPG.ctx, b = Math.round(Math.sin(RPG.frame / 6) * 1.2), cx = x + 3.5 + b, cy = y + 4;
    g.fillStyle = 'rgba(0,0,0,0.4)'; heart(g, cx + 0.7, cy + 0.7, 3.4);
    g.fillStyle = '#ff7a9c'; heart(g, cx, cy, 3.4);
    g.fillStyle = '#ffd4de'; g.fillRect(cx - 2.2, cy - 2.2, 1.2, 1.2);
  };

  function heart(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y + r);
    g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.8, y - r * 1.5, x, y - r * 0.5);
    g.bezierCurveTo(x + r * 0.8, y - r * 1.5, x + r * 1.6, y - r * 0.2, x, y + r); g.fill();
  }

  // ======================= sprites: paint → Scale2x → outline → light =======================
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
  // Scale2x (EPX): doubles the resolution and smooths diagonal edges of pixel art
  function scale2x(src) {
    var w = src.width, h = src.height, sd = src.getContext('2d').getImageData(0, 0, w, h);
    var s = new Uint32Array(sd.data.buffer), out = document.createElement('canvas');
    out.width = w * 2; out.height = h * 2;
    var og = out.getContext('2d'), od = og.createImageData(w * 2, h * 2), d = new Uint32Array(od.data.buffer);
    function px(x, y) { return x < 0 || y < 0 || x >= w || y >= h ? 0 : s[y * w + x]; }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var P = s[y * w + x], A = px(x, y - 1), B = px(x + 1, y), C = px(x - 1, y), D = px(x, y + 1);
      var e0 = P, e1 = P, e2 = P, e3 = P;
      if (C === A && C !== D && A !== B) e0 = A;
      if (A === B && A !== C && B !== D) e1 = B;
      if (D === C && D !== B && C !== A) e2 = C;
      if (B === D && B !== A && D !== C) e3 = D;
      var o = (y * 2) * (w * 2) + x * 2;
      d[o] = e0; d[o + 1] = e1; d[o + w * 2] = e2; d[o + w * 2 + 1] = e3;
    }
    og.putImageData(od, 0, 0);
    return out;
  }
  // a dark 1px outline (at 2x, so half a game pixel) and soft top-down light
  function finish(src, opts) {
    var w = src.width + 2, h = src.height + 2, c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.drawImage(src, 1, 1);
    if (opts.outline !== false) {
      var id = g.getImageData(0, 0, w, h), a = id.data, copy = new Uint8ClampedArray(a);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        if (copy[i + 3] > 0) continue;
        var near = (x > 0 && copy[i - 1] > 0) || (x < w - 1 && copy[i + 7] > 0) || (y > 0 && copy[i - w * 4 + 3] > 0) || (y < h - 1 && copy[i + w * 4 + 3] > 0);
        if (near) { a[i] = 22; a[i + 1] = 16; a[i + 2] = 28; a[i + 3] = 230; }
      }
      g.putImageData(id, 0, 0);
    }
    if (opts.light !== false) {
      g.globalCompositeOperation = 'source-atop';
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(255,244,220,0.22)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,10,60,0.28)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    }
    return c;
  }
  function flipped(c) {
    var f = document.createElement('canvas'); f.width = c.width; f.height = c.height;
    var fg = f.getContext('2d'); fg.translate(c.width, 0); fg.scale(-1, 1); fg.drawImage(c, 0, 0);
    return f;
  }
  // returns a canvas at 2x resolution with a 1px (2x) border; draw it at half size, offset by -0.5
  RPG.spriteImage = function (id, pose, frame, palette, flip) {
    var key = id + '|' + pose + '|' + frame + '|' + (palette ? JSON.stringify(palette) : '') + (flip ? '|f' : '');
    if (spriteCache[key]) return spriteCache[key];
    var sp = RPG.get('sprites', id), pal = Object.assign({}, sp.palette, palette || {}), img;
    if (sp.paint) {                                    // painted by code at 2x (js/pixel.js): no upscaling needed
      var P = new RPG.Pix(sp.w * 2, sp.h * 2);
      sp.paint(P, pose, frame, pal);
      img = finish(P.canvas(), sp);
    } else {
      var frames = sp.frames[pose] || sp.frames[Object.keys(sp.frames)[0]];
      img = finish(scale2x(paint(frames[frame % frames.length], pal)), sp);
    }
    if (flip) img = flipped(img);
    spriteCache[key] = img;
    return img;
  };
  // opts: pose, frame, palette, flip, scale, alpha, flash
  RPG.drawSprite = function (id, x, y, opts) {
    var g = RPG.ctx;
    opts = opts || {};
    var img = RPG.spriteImage(id, opts.pose || 'down', opts.frame || 0, opts.palette, opts.flip);
    var s = (opts.scale || 1) / 2, dx = x - s, dy = y - s;
    if (opts.alpha != null) g.globalAlpha = opts.alpha;
    var smooth = g.imageSmoothingEnabled; g.imageSmoothingEnabled = false;
    g.drawImage(img, dx, dy, img.width * s, img.height * s);
    if (opts.flash) {
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = opts.flash;
      g.drawImage(img, dx, dy, img.width * s, img.height * s);
      g.globalCompositeOperation = 'source-over';
    }
    g.imageSmoothingEnabled = smooth;
    g.globalAlpha = 1;
    return img;
  };
  RPG.spriteSize = function (id, pose) {
    var sp = RPG.get('sprites', id);
    if (sp.paint) return { w: sp.w, h: sp.h };
    var f = sp.frames[pose] || sp.frames[Object.keys(sp.frames)[0]];
    return { w: f[0][0].length, h: f[0].length };
  };

  // ======================= tiles (2x) =======================
  var tileCache = {};
  RPG.tileImage = function (id, frame) {
    var t = RPG.get('tiles', id), f = t.frames ? frame % t.frames : 0, key = id + '|' + f;
    if (tileCache[key]) return tileCache[key];
    var c = document.createElement('canvas'); c.width = c.height = T * 2;
    var g = c.getContext('2d'); g.scale(2, 2);
    t.draw(g, f);
    tileCache[key] = c;
    return c;
  };
  // the standing part of a tall tile: `tall: n` extra tiles above, drawn by drawTall(g, frame, height) with the tile's
  // own square at x 0..16, y height-16..height. `tallW` (px) lets it spill sideways (a wide tree crown), centered.
  RPG.tallImage = function (id, frame) {
    var t = RPG.get('tiles', id), f = t.frames ? frame % t.frames : 0, key = id + '|tall|' + f;
    if (tileCache[key]) return tileCache[key];
    var w = t.tallW || T, hgt = T * (1 + t.tall), c = document.createElement('canvas'); c.width = w * 2; c.height = hgt * 2;
    var g = c.getContext('2d'); g.scale(2, 2); g.translate((w - T) / 2, 0);
    t.drawTall(g, f, hgt);
    tileCache[key] = c;
    return c;
  };
})();
