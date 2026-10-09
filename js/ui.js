/*
 * Input (keyboard + touch) and UI layers. UI calls return Promises, so game flow reads top to bottom:
 *   await RPG.ui.say('Hi!', 'Josh');
 *   var i = await RPG.ui.menu({ items: [...] });
 * The topmost layer gets the input; the scene underneath keeps drawing.
 */
(function () {
  'use strict';
  var g = RPG.g;

  // ======================= input =======================
  var KEYS = {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    ok: ['KeyZ', 'Enter', 'Space'], cancel: ['KeyX', 'Escape', 'Backspace'], menu: ['KeyC', 'Tab']
  };
  var held = {}, pressed = {}, byCode = {};
  Object.keys(KEYS).forEach(function (k) { KEYS[k].forEach(function (c) { byCode[c] = k; }); });
  window.addEventListener('keydown', function (e) {
    var k = byCode[e.code];
    if (!k) return;
    e.preventDefault();
    if (!held[k]) { pressed[k] = true; repeatT[k] = 0; }
    held[k] = true;
  });
  window.addEventListener('keyup', function (e) { var k = byCode[e.code]; if (k) held[k] = false; });
  window.addEventListener('blur', function () { held = {}; });
  var repeatT = {};
  RPG.input = {
    held: function (k) { return !!held[k]; },
    // edge-triggered; arrows auto-repeat in menus when `repeat` is set
    take: function (k, repeat) {
      if (pressed[k]) { pressed[k] = false; return true; }
      if (repeat && held[k]) { repeatT[k] = (repeatT[k] || 0) + 1; if (repeatT[k] > 18 && repeatT[k] % 5 === 0) return true; }
      return false;
    },
    clear: function () { pressed = {}; },
    endFrame: function () { pressed = {}; },
    press: function (k) { pressed[k] = true; },        // for touch buttons and tests
    set: function (k, v) { held[k] = v; }
  };

  // touch: a d-pad and A / B / menu buttons
  var pad = document.getElementById('touch');
  if (pad && ('ontouchstart' in window || (window.matchMedia && matchMedia('(pointer: coarse)').matches))) {
    pad.hidden = false;
    Array.prototype.forEach.call(pad.querySelectorAll('[data-k]'), function (b) {
      var k = b.dataset.k;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (!held[k]) pressed[k] = true; held[k] = true; b.classList.add('on'); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { held[k] = false; b.classList.remove('on'); }); });
    });
  }

  // ======================= layers =======================
  var layers = [];
  RPG.ui = {
    layers: layers,
    busy: function () { return layers.length > 0; },
    push: function (layer) {
      return new Promise(function (resolve) {
        layer.close = function (v) { var i = layers.indexOf(layer); if (i >= 0) layers.splice(i, 1); RPG.input.clear(); resolve(v); };
        layers.push(layer);
      });
    },
    update: function () { if (layers.length) layers[layers.length - 1].update(); },
    draw: function () { layers.forEach(function (l) { if (l.draw) l.draw(); }); drawToasts(); }
  };

  // ---- dialogue: typewriter text, 3 lines per page, optional speaker name ----
  RPG.ui.say = function (text, name, opts) {
    opts = opts || {};
    var w = RPG.W - 16, lines = RPG.wrap(text, w - 24, 11), pages = [];
    for (var i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
    var page = 0, shown = 0;
    return RPG.ui.push({
      update: function () {
        var total = pages[page].join('').length;
        shown = Math.min(total, shown + (RPG.input.held('ok') ? 3 : 1.2));
        if (RPG.input.take('ok') || RPG.input.take('cancel')) {
          if (shown < total) shown = total;
          else if (page < pages.length - 1) { page++; shown = 0; }
          else this.close();
        }
      },
      draw: function () {
        var y = opts.top ? 8 : RPG.H - 66;
        RPG.box(8, y, w, 58);
        if (name) { RPG.box(14, y - 13, Math.max(48, RPG.textWidth(name, 10, true) + 16), 18, { fill: 'rgba(42,100,184,0.97)' }); RPG.text(name, 22, y - 10, { size: 10, bold: true }); }
        var left = shown;
        pages[page].forEach(function (ln, k) {
          var part = ln.slice(0, Math.max(0, Math.floor(left)));
          left -= ln.length;
          RPG.text(part, 20, y + 10 + k * 15, { size: 11 });
        });
        if (shown >= pages[page].join('').length && Math.floor(RPG.frame / 20) % 2) {
          g.fillStyle = '#fff'; g.beginPath(); g.moveTo(w - 4, y + 46); g.lineTo(w + 4, y + 46); g.lineTo(w, y + 51); g.fill();
        }
      }
    });
  };

  // ---- menu: { items: [{ label, right, disabled, color, desc }], x, y, w, rows, title, cancel, index, onMove, columns } ----
  RPG.ui.menu = function (o) {
    var items = o.items, idx = o.index || 0, top = 0, rows = o.rows || Math.min(items.length, 8), lh = o.lineHeight || 15;
    var w = o.w || 120, h = rows * lh + 12 + (o.title ? 16 : 0);
    var x = o.x == null ? (RPG.W - w) / 2 : o.x, y = o.y == null ? (RPG.H - h) / 2 : o.y;
    function fix() {
      if (idx < top) top = idx;
      if (idx >= top + rows) top = idx - rows + 1;
      if (o.onMove) o.onMove(idx, items[idx]);
    }
    fix();
    return RPG.ui.push({
      update: function () {
        if (!items.length) { if (RPG.input.take('cancel') || RPG.input.take('ok')) this.close(-1); return; }
        if (RPG.input.take('down', true)) { idx = (idx + 1) % items.length; fix(); RPG.sfx('cursor'); }
        if (RPG.input.take('up', true)) { idx = (idx + items.length - 1) % items.length; fix(); RPG.sfx('cursor'); }
        if (RPG.input.take('ok')) {
          if (items[idx].disabled) RPG.sfx('buzz');
          else { RPG.sfx('ok'); this.close(idx); }
        }
        if (o.cancel !== false && RPG.input.take('cancel')) { RPG.sfx('back'); this.close(-1); }
      },
      draw: function () {
        RPG.box(x, y, w, h);
        var ty = y + 6;
        if (o.title) { RPG.text(o.title, x + w / 2, ty, { size: 10, bold: true, align: 'center', color: '#ffd860' }); ty += 16; }
        if (!items.length) RPG.text(o.empty || '（沒有東西）', x + 12, ty + 2, { size: 11, color: '#9098b0' });
        for (var i = top; i < Math.min(items.length, top + rows); i++) {
          var it = items[i], yy = ty + (i - top) * lh;
          if (i === idx) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 6, yy - 1, w - 12, lh); RPG.cursor(x + 6, yy + 3); }
          RPG.text(it.label, x + 16, yy + 1, { size: 11, color: it.disabled ? '#7a8098' : it.color || '#f4f0e8' });
          if (it.right != null) RPG.text(String(it.right), x + w - 10, yy + 1, { size: 11, align: 'right', color: it.disabled ? '#7a8098' : '#c8d0e8' });
        }
        if (top > 0) RPG.text('▲', x + w - 12, y + 2, { size: 7 });
        if (top + rows < items.length) RPG.text('▼', x + w - 12, y + h - 10, { size: 7 });
        if (o.drawExtra) o.drawExtra(idx, items[idx]);
      }
    });
  };

  RPG.ui.choice = function (options, opts) {
    opts = opts || {};
    return RPG.ui.menu({ items: options.map(function (s) { return { label: s }; }), x: RPG.W - 128, y: RPG.H - 70 - options.length * 15 - 14, w: 120, cancel: opts.cancel !== false ? true : false });
  };

  // a box that waits for OK (used for summaries like "level up")
  RPG.ui.alert = function (lines, opts) {
    opts = opts || {};
    var w = opts.w || 220, h = lines.length * 15 + 20;
    return RPG.ui.push({
      update: function () { if (RPG.input.take('ok') || RPG.input.take('cancel')) this.close(); },
      draw: function () {
        var x = (RPG.W - w) / 2, y = (RPG.H - h) / 2;
        RPG.box(x, y, w, h);
        lines.forEach(function (ln, i) { RPG.text(ln.text || ln, x + w / 2, y + 10 + i * 15, { size: 11, align: 'center', color: ln.color }); });
      }
    });
  };

  // short-lived messages that don't block
  var toasts = [];
  RPG.ui.toast = function (text, color) { toasts.push({ text: text, color: color, t: 0 }); while (toasts.length > 2) toasts.shift(); };
  function drawToasts() {
    toasts.forEach(function (t, i) {
      t.t++;
      var a = t.t < 90 ? 1 : 1 - (t.t - 90) / 30;
      g.globalAlpha = Math.max(0, a);
      var w = RPG.textWidth(t.text, 10) + 20;
      RPG.box((RPG.W - w) / 2, 8 + i * 22, w, 20, { fill: 'rgba(16,24,58,0.9)' });
      RPG.text(t.text, RPG.W / 2, 13 + i * 22, { size: 10, align: 'center', color: t.color });
      g.globalAlpha = 1;
    });
    for (var i = toasts.length - 1; i >= 0; i--) if (toasts[i].t > 120) toasts.splice(i, 1);
  }

  // ======================= tiny sound effects (Web Audio) =======================
  var actx = null;
  function ac() {
    if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; actx = new A(); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  window.addEventListener('keydown', function () { ac(); }, { once: true });
  window.addEventListener('pointerdown', function () { ac(); }, { once: true });
  function tone(f, len, type, vol, to, at) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (at || 0), o = a.createOscillator(), gn = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
    gn.gain.setValueAtTime(vol || 0.05, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + len + 0.02);
  }
  var SFX = {
    cursor: function () { tone(880, 0.04, 'square', 0.03); },
    ok: function () { tone(660, 0.05, 'square', 0.04); tone(990, 0.06, 'square', 0.04, null, 0.05); },
    back: function () { tone(500, 0.06, 'square', 0.04, 300); },
    buzz: function () { tone(120, 0.12, 'sawtooth', 0.05); },
    hit: function () { tone(200, 0.1, 'square', 0.08, 60); },
    crit: function () { tone(300, 0.15, 'sawtooth', 0.08, 80); tone(900, 0.08, 'square', 0.05); },
    magic: function () { [523, 784, 1047].forEach(function (f, i) { tone(f, 0.12, 'triangle', 0.05, null, i * 0.05); }); },
    heal: function () { [659, 880, 1175].forEach(function (f, i) { tone(f, 0.15, 'sine', 0.07, null, i * 0.07); }); },
    miss: function () { tone(400, 0.12, 'triangle', 0.05, 900); },
    step: function () { tone(90, 0.03, 'triangle', 0.03); },
    encounter: function () { [880, 660, 880, 660, 1100].forEach(function (f, i) { tone(f, 0.06, 'square', 0.05, null, i * 0.06); }); },
    win: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, 0.14, 'square', 0.05, null, i * 0.11); }); },
    levelup: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.12, 'triangle', 0.07, null, i * 0.07); }); },
    item: function () { tone(1319, 0.08, 'square', 0.04); tone(1760, 0.12, 'square', 0.04, null, 0.08); },
    door: function () { tone(180, 0.15, 'triangle', 0.08, 120); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.08, null, i * 0.25); }); },
    run: function () { [400, 600, 800].forEach(function (f, i) { tone(f, 0.05, 'square', 0.04, null, i * 0.04); }); }
  };
  RPG.sfx = function (name) { try { if (SFX[name]) SFX[name](); } catch (e) { /* audio is optional */ } };
  RPG.addSfx = function (name, fn) { SFX[name] = fn; };
  RPG.tone = tone;
})();
