/*
 * HD-2D style effects (inspired by Octopath Traveler): pixel art inside a tilted "diorama" with depth of field,
 * bloom, light sources in the dark, drifting particles, color grading and a vignette.
 * Turn them off in the settings (or automatically when the browser can't filter canvases).
 *
 * A map can set:  ambient: 0..1 (darkness), lights: [{ x, y, r, color }], particles: 'leaves' | 'dust' | 'fireflies' | 'motes',
 *                 grade: 'warm' | 'cool' | 'dusk' | 'night'.  A tile can set light: { r, color } (see tiles.js).
 */
(function () {
  'use strict';
  var FX = RPG.fx = {};
  var bufs = {};
  var test = document.createElement('canvas').getContext('2d');
  FX.canFilter = 'filter' in test && typeof test.filter === 'string';
  FX.on = FX.canFilter;
  try { if (localStorage.getItem('jjrpg.fx') === 'off') FX.on = false; } catch (e) { /* ignore */ }
  FX.set = function (on) { FX.on = !!on && FX.canFilter; try { localStorage.setItem('jjrpg.fx', on ? 'on' : 'off'); } catch (e) { /* ignore */ } };
  FX.active = function () { return FX.on && FX.canFilter; };

  function buf(name, w, h) {
    var b = bufs[name] || (bufs[name] = document.createElement('canvas'));
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    if (b.width !== w || b.height !== h) { b.width = w; b.height = h; b.dirty = true; }
    return b;
  }
  FX.buffer = buf;

  // ---- the world canvas a map is drawn into (a bit larger than the screen, for the tilt) ----
  FX.MARGIN_X = 1.3; FX.MARGIN_Y = 30;
  FX.beginWorld = function (ww, wh) {
    var k = RPG.scale, c = buf('world', ww * k, wh * k), g = c.getContext('2d');
    g.setTransform(k, 0, 0, k, 0, 0); g.imageSmoothingEnabled = false;
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    RPG.ctx = g;
    return c;
  };

  // ---- tilt the world like a model on a table: farther rows (top) get narrower and squeezed ----
  FX.diorama = function (world, ww, wh) {
    var g = RPG.g, k = RPG.scale, W = RPG.W, H = RPG.H, N = 60;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true;
    var pos = function (t) { return Math.pow(t, 0.9); };
    for (var i = 0; i < N; i++) {
      var t0 = i / N, t1 = (i + 1) / N, s = 0.8 + 0.2 * (t0 + t1) / 2;
      var srcW = W / s, sx = (ww - srcW) / 2, sy0 = wh * pos(t0), sy1 = wh * pos(t1);
      var dy0 = Math.floor(t0 * H * k), dy1 = Math.ceil(t1 * H * k);
      g.drawImage(world, sx * k, sy0 * k, srcW * k, (sy1 - sy0) * k, 0, dy0, W * k, dy1 - dy0 + 1);
    }
    // atmosphere: distant rows fade into a soft haze
    var gr = g.createLinearGradient(0, 0, 0, H * k * 0.4);
    gr.addColorStop(0, 'rgba(210,225,255,0.22)'); gr.addColorStop(1, 'rgba(210,225,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W * k, H * k * 0.4);
    g.restore();
  };

  // ---- depth of field: blur the top and bottom of the screen ----
  function mask(w, h) {
    var m = buf('dofmask', w, h);
    if (m.dirty) {
      var mg = m.getContext('2d'), gr = mg.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.3, 'rgba(0,0,0,0)');
      gr.addColorStop(0.74, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)');
      mg.clearRect(0, 0, w, h); mg.fillStyle = gr; mg.fillRect(0, 0, w, h); m.dirty = false;
    }
    return m;
  }
  FX.tiltShift = function () {
    var c = RPG.canvas, w = c.width, h = c.height, g = RPG.g;
    var small = buf('dofsmall', w / 3, h / 3), sg = small.getContext('2d');
    sg.filter = 'blur(' + Math.max(1, RPG.scale * 0.5) + 'px)'; sg.imageSmoothingEnabled = true;
    sg.clearRect(0, 0, small.width, small.height); sg.drawImage(c, 0, 0, small.width, small.height); sg.filter = 'none';
    var tmp = buf('dofbig', w, h), tg = tmp.getContext('2d');
    tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, w, h); tg.imageSmoothingEnabled = true;
    tg.drawImage(small, 0, 0, w, h);
    tg.globalCompositeOperation = 'destination-in'; tg.drawImage(mask(w, h), 0, 0);
    tg.globalCompositeOperation = 'source-over';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.restore();
  };

  // ---- bloom: bright parts glow softly ----
  FX.bloom = function (amount) {
    var c = RPG.canvas, g = RPG.g, b = buf('bloom', c.width / 4, c.height / 4), bg = b.getContext('2d');
    bg.filter = 'brightness(0.68) contrast(3.2) saturate(1.4) blur(' + Math.max(1.5, RPG.scale * 0.8) + 'px)';
    bg.imageSmoothingEnabled = true; bg.clearRect(0, 0, b.width, b.height);
    bg.drawImage(c, 0, 0, b.width, b.height); bg.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.globalAlpha = amount == null ? 0.32 : amount;
    g.imageSmoothingEnabled = true; g.drawImage(b, 0, 0, c.width, c.height); g.restore();
  };

  // ---- color grading and vignette ----
  var GRADES = {
    warm: ['rgba(255,190,110,0.10)', 'soft-light'], cool: ['rgba(110,150,255,0.12)', 'soft-light'],
    dusk: ['rgba(255,120,80,0.16)', 'soft-light'], night: ['rgba(40,60,160,0.22)', 'multiply'], none: null
  };
  FX.grade = function (name) {
    var gd = GRADES[name || 'warm']; if (!gd) return;
    var g = RPG.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = gd[1]; g.fillStyle = gd[0]; g.fillRect(0, 0, RPG.canvas.width, RPG.canvas.height); g.restore();
  };
  FX.vignette = function (strength) {
    var c = RPG.canvas, g = RPG.g, v = buf('vig', c.width, c.height);
    if (v.dirty || v.strength !== strength) {
      var vg = v.getContext('2d'), gr = vg.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.width * 0.72);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,4,18,' + (strength || 0.55) + ')');
      vg.clearRect(0, 0, c.width, c.height); vg.fillStyle = gr; vg.fillRect(0, 0, c.width, c.height); v.dirty = false; v.strength = strength;
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(v, 0, 0); g.restore();
  };
  // everything after the scene is drawn and before the UI
  FX.post = function (o) {
    o = o || {};
    if (o.dof) FX.tiltShift();
    FX.bloom(o.bloom);
    FX.grade(o.grade);
    FX.vignette(o.vignette);
  };

  // ---- light in the dark (drawn into the world, in world-view coordinates) ----
  FX.lighting = function (ambient, lights, ww, wh) {
    var g = RPG.ctx;
    if (ambient > 0) {
      var k = RPG.scale, L = buf('light', ww * k / 2, wh * k / 2), lg = L.getContext('2d');
      lg.setTransform(k / 2, 0, 0, k / 2, 0, 0); lg.globalCompositeOperation = 'source-over';
      lg.clearRect(0, 0, ww, wh); lg.fillStyle = 'rgba(8,8,26,' + ambient + ')'; lg.fillRect(0, 0, ww, wh);
      lg.globalCompositeOperation = 'destination-out';
      lights.forEach(function (l) {
        var gr = lg.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        lg.fillStyle = gr; lg.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      });
      g.save(); g.imageSmoothingEnabled = true; g.drawImage(L, 0, 0, ww, wh); g.restore();
    }
    g.save(); g.globalCompositeOperation = 'lighter';
    lights.forEach(function (l) {
      if (!l.color) return;
      var r = l.glow || l.r * 0.55, gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
      gr.addColorStop(0, l.color.replace('A', '0.35')); gr.addColorStop(1, l.color.replace('A', '0'));
      g.fillStyle = gr; g.fillRect(l.x - r, l.y - r, r * 2, r * 2);
    });
    g.restore();
  };

  // ---- drifting particles (no state: positions come from the frame counter) ----
  function hash(i, s) { var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }
  FX.particles = function (kind, camX, camY, ww, wh, frame) {
    if (!kind) return;
    var g = RPG.ctx, n = { leaves: 22, dust: 40, fireflies: 26, motes: 34 }[kind] || 20;
    g.save();
    for (var i = 0; i < n; i++) {
      var t = frame / 60, x, y, a;
      if (kind === 'leaves') {
        var sp = 8 + hash(i, 1) * 10;
        x = ((hash(i, 2) * (ww + 80) + t * sp * 0.8 - camX * 0.2) % (ww + 80) + ww + 80) % (ww + 80) - 40;
        y = ((hash(i, 3) * (wh + 40) + t * sp - camY * 0.2) % (wh + 40) + wh + 40) % (wh + 40) - 20;
        x += Math.sin(t * 1.5 + i) * 6;
        g.fillStyle = ['#e8a040', '#c86a30', '#a8c050'][i % 3]; g.globalAlpha = 0.85;
        g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillRect(-1.5, -0.8, 3, 1.6); g.restore();
      } else if (kind === 'fireflies') {
        x = (hash(i, 4) * ww + Math.sin(t * 0.7 + i) * 18 - camX * 0.1 + ww * 2) % ww;
        y = (hash(i, 5) * wh + Math.cos(t * 0.9 + i * 2) * 12 - camY * 0.1 + wh * 2) % wh;
        a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i));
        g.globalCompositeOperation = 'lighter';
        var gr = g.createRadialGradient(x, y, 0, x, y, 5); gr.addColorStop(0, 'rgba(220,255,140,' + a + ')'); gr.addColorStop(1, 'rgba(220,255,140,0)');
        g.fillStyle = gr; g.fillRect(x - 5, y - 5, 10, 10);
      } else {                                         // dust / motes floating in light
        x = (hash(i, 6) * ww + Math.sin(t * 0.4 + i) * 10 + t * 3 - camX * 0.15 + ww * 4) % ww;
        y = (hash(i, 7) * wh - t * (2 + hash(i, 8) * 4) - camY * 0.15 + wh * 40) % wh;
        a = 0.25 + 0.35 * Math.abs(Math.sin(t + i));
        g.globalCompositeOperation = 'lighter'; g.fillStyle = kind === 'motes' ? 'rgba(255,240,200,' + a + ')' : 'rgba(255,255,255,' + a * 0.7 + ')';
        g.fillRect(x, y, hash(i, 9) < 0.3 ? 1 : 0.6, hash(i, 9) < 0.3 ? 1 : 0.6);
      }
    }
    g.restore();
  };

  // ---- god rays for backdrops ----
  // slanted beams of light falling from the top edge (color like 'rgba(255,240,200,A)')
  FX.rays = function (g, x, y, color, frame) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 5; i++) {
      var bx = x + i * 46 + Math.sin(frame / 90 + i) * 4, w0 = 10 + (i % 3) * 8, w1 = w0 * 3, len = 240;
      var gr = g.createLinearGradient(bx, y, bx + len * 0.55, y + len);
      var a = 0.07 + 0.04 * Math.sin(frame / 60 + i * 1.7);
      gr.addColorStop(0, color.replace('A', a.toFixed(3))); gr.addColorStop(1, color.replace('A', '0'));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(bx, y); g.lineTo(bx + w0, y); g.lineTo(bx + len * 0.55 + w1, y + len); g.lineTo(bx + len * 0.55, y + len); g.closePath(); g.fill();
    }
    g.restore();
  };
})();
