/*
 * The map scene: grid movement with smooth steps, party members following in a line, NPCs, chests,
 * events, warps and random encounters. Maps come from js/data/maps.js.
 * Drawing (HD-2D): the map is drawn into a "world" canvas with shadows, tall objects, particles and lights,
 * then tilted into the screen with depth of field and bloom (js/fx.js). Without effects it draws straight to the screen.
 */
(function () {
  'use strict';
  var T = RPG.TILE;
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var STEP = 8;                                        // frames per tile

  var S = RPG.scenes.map = {
    enter: function () { this.load(RPG.state.map); },

    load: function (id) {
      var m = this.map = RPG.get('maps', id), legend = Object.assign({}, RPG.db.config.legend, m.legend || {});
      this.legend = legend;
      this.grid = m.rows.map(function (row) { return row.split('').map(function (ch) { return legend[ch] || legend['.']; }); });
      this.w = m.rows[0].length; this.h = m.rows.length;
      var s = RPG.state;
      this.player = { x: s.x, y: s.y, fx: s.x, fy: s.y, dir: s.dir || 'down', t: 0, moving: false, from: null };
      this.trail = [];
      for (var i = 0; i < 8; i++) this.trail.push({ x: s.x, y: s.y, dir: s.dir });
      this.npcs = (m.npcs || []).map(function (n) { return Object.assign({ x0: n.x, y0: n.y, fx: n.x, fy: n.y, dir: n.dir || 'down', t: 0, wanderT: RPG.ri(60, 180) }, n); });
      this.busy = (this.busyN || 0) > 0;     // a script that warped here is still running: keep the map locked until it ends
      this.bannerT = 150;
      this.encounterSteps = 0;
      this.prepare();
    },
    // light sources from tiles, and ambient-occlusion edges under walls
    prepare: function () {
      var self = this;
      this.tileLights = []; this.ao = [];
      for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
        var t = RPG.db.tiles[this.grid[y][x]];
        if (!t) continue;
        if (t.light) this.tileLights.push({ x: x, y: y, r: t.light.r, color: t.light.color });
        if (!t.solid && !t.tall && y > 0) {
          var up = RPG.db.tiles[this.grid[y - 1][x]];
          if (up && up.solid && !up.tall) this.ao.push({ x: x, y: y });
        }
      }
      void self;
    },

    // ---- queries ----
    visibleNpcs: function () {
      return this.npcs.filter(function (n) {
        if (RPG.flag('hide_' + n.id)) return false;
        if (n.showIf && !RPG.check(n.showIf)) return false;
        if (n.hideIf && RPG.check(n.hideIf)) return false;
        return true;
      });
    },
    tileAt: function (x, y) { return (this.grid[y] && this.grid[y][x]) || null; },
    npcAt: function (x, y) { return this.visibleNpcs().filter(function (n) { return n.x === x && n.y === y; })[0]; },
    chestAt: function (x, y) { return (this.map.chests || []).filter(function (c) { return c.x === x && c.y === y; })[0]; },
    blocked: function (x, y, self) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return true;
      var t = RPG.db.tiles[this.tileAt(x, y)];
      if (!t || t.solid) return true;
      if (this.chestAt(x, y)) return true;
      var n = this.npcAt(x, y);
      if (n && n !== self && n.solid !== false) return true;
      if (self && self !== this.player && this.player.x === x && this.player.y === y) return true;
      return false;
    },

    update: function (blocked) {
      var p = this.player;
      if (this.bannerT > 0) this.bannerT--;
      this.updateNpcs(blocked);
      if (p.moving) {
        p.t++;
        var k = p.t / STEP;
        p.fx = p.from.x + (p.x - p.from.x) * k; p.fy = p.from.y + (p.y - p.from.y) * k;
        if (p.t >= STEP) { p.moving = false; p.fx = p.x; p.fy = p.y; this.arrived(); }
        return;
      }
      if (blocked || this.busy) return;
      if (RPG.input.take('menu')) { this.runBusy(RPG.openMenu()); return; }
      if (RPG.input.take('ok')) { this.action(); return; }
      var dir = ['up', 'down', 'left', 'right'].filter(function (d) { return RPG.input.held(d); })[0];
      if (!dir) return;
      p.dir = dir; RPG.state.dir = dir;
      var nx = p.x + DIRS[dir][0], ny = p.y + DIRS[dir][1];
      if (this.blocked(nx, ny)) return;
      this.trail.unshift({ x: p.x, y: p.y, dir: dir }); this.trail.length = 8;
      p.from = { x: p.x, y: p.y }; p.x = nx; p.y = ny; p.t = 0; p.moving = true;
    },

    updateNpcs: function (blocked) {
      var self = this;
      this.visibleNpcs().forEach(function (n) {
        if (n.moving) {
          n.t++;
          n.fx = n.from.x + (n.x - n.from.x) * n.t / (STEP * 2); n.fy = n.from.y + (n.y - n.from.y) * n.t / (STEP * 2);
          if (n.t >= STEP * 2) { n.moving = false; n.fx = n.x; n.fy = n.y; }
          return;
        }
        if (!n.wander || blocked || self.busy) return;
        if (--n.wanderT > 0) return;
        n.wanderT = RPG.ri(80, 220);
        var d = RPG.pick(Object.keys(DIRS)), nx = n.x + DIRS[d][0], ny = n.y + DIRS[d][1];
        n.dir = d;
        var range = n.wander === true ? 2 : n.wander;
        if (Math.abs(nx - n.x0) > range || Math.abs(ny - n.y0) > range || self.blocked(nx, ny, n)) return;
        n.from = { x: n.x, y: n.y }; n.x = nx; n.y = ny; n.t = 0; n.moving = true;
      });
    },

    runBusy: function (promise) {
      var self = this;
      // counts running scripts, so one finishing can't unlock the map while another (or the rest of a warping script) still runs
      this.busyN = (this.busyN || 0) + 1; this.busy = true;
      function done() { self.busyN = Math.max(0, self.busyN - 1); self.busy = self.busyN > 0; }
      return Promise.resolve(promise).then(done, function (e) { done(); console.error(e); });
    },

    arrived: function () {
      var p = this.player, s = RPG.state, m = this.map, self = this;
      s.x = p.x; s.y = p.y; s.steps++;
      var warp = (m.warps || []).filter(function (w) { return w.x === p.x && w.y === p.y && RPG.check(w['if']); })[0];
      if (warp) { this.runBusy(RPG.warp(warp.to, warp.tx, warp.ty, warp.dir)); return; }
      var ev = (m.events || []).filter(function (e) { return e.x === p.x && e.y === p.y && (e.trigger || 'touch') === 'touch' && self.eventReady(e); })[0];
      if (ev) { this.runBusy(this.runEvent(ev)); return; }
      var enc = m.encounters, tile = RPG.db.tiles[this.tileAt(p.x, p.y)];
      if (enc && (enc.anywhere || (tile && tile.encounter)) && RPG.check(enc['if'])) {
        this.encounterSteps++;
        if (this.encounterSteps > (enc.minSteps || 4) && RPG.chance(enc.rate || 0.08)) {
          this.encounterSteps = 0;
          this.runBusy(RPG.battle(RPG.pickWeighted(enc.troops)));
        }
      }
    },
    eventReady: function (e) { return RPG.check(e['if']) && !(e.once && RPG.flag(e.once)); },
    runEvent: async function (e, ctx) {
      if (e.once) RPG.setFlag(e.once);
      await RPG.run(e.script, ctx || {});
    },

    action: function () {
      var p = this.player, d = DIRS[p.dir], x = p.x + d[0], y = p.y + d[1], self = this;
      var npc = this.npcAt(x, y);
      if (npc) {
        npc.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[p.dir];
        this.runBusy(RPG.run(typeof npc.script === 'function' ? npc.script() : npc.script, { npc: npc }));
        return;
      }
      var chest = this.chestAt(x, y);
      if (chest) { this.runBusy(this.openChest(chest)); return; }
      var ev = (this.map.events || []).filter(function (e) { return e.x === x && e.y === y && e.trigger === 'action' && self.eventReady(e); })[0];
      if (ev) this.runBusy(this.runEvent(ev));
    },
    openChest: async function (c) {
      if (RPG.flag(c.flag)) { await RPG.ui.say(RPG.t('ui.chestEmpty')); return; }
      RPG.setFlag(c.flag);
      if (c.gold) await RPG.run([{ gold: c.gold }]);
      if (c.item) await RPG.run([{ give: c.item, count: c.count || 1 }]);
    },

    // ======================= drawing =======================
    draw: function () {
      var fx = RPG.fx.active(), p = this.player, m = this.map;
      var ww = fx ? Math.ceil(RPG.W * RPG.fx.MARGIN_X) : RPG.W, wh = fx ? RPG.H + RPG.fx.MARGIN_Y : RPG.H;
      var world = fx ? RPG.fx.beginWorld(ww, wh) : null, g = RPG.ctx;
      var camX = RPG.clamp(p.fx * T + T / 2 - ww / 2, 0, Math.max(0, this.w * T - ww));
      var camY = RPG.clamp(p.fy * T + T / 2 - wh / 2, 0, Math.max(0, this.h * T - wh));
      if (this.w * T < ww) camX = (this.w * T - ww) / 2;
      if (this.h * T < wh) camY = (this.h * T - wh) / 2;
      camX = Math.round(camX); camY = Math.round(camY);
      g.fillStyle = m.bg || '#000'; g.fillRect(0, 0, ww, wh);
      var x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T));
      var x1 = Math.min(this.w - 1, Math.ceil((camX + ww) / T)), y1 = Math.min(this.h - 1, Math.ceil((camY + wh) / T) + 2);
      var anim = Math.floor(RPG.frame / 30), x, y;
      // ground
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        var id = this.grid[y][x];
        if (id) g.drawImage(RPG.tileImage(id, anim), x * T - camX, y * T - camY, T, T);
      }
      // soft shade where the ground meets a wall
      this.ao.forEach(function (a) {
        if (a.x < x0 || a.x > x1 || a.y < y0 || a.y > y1) return;
        var gx = a.x * T - camX, gy = a.y * T - camY, gr = g.createLinearGradient(0, gy, 0, gy + 6);
        gr.addColorStop(0, 'rgba(0,0,0,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(gx, gy, T, 6);
      });
      // things that stand up, sorted by row (characters can walk behind trees)
      var list = [], self = this;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        var t = RPG.db.tiles[this.grid[y][x]];
        if (t && t.tall) (function (tx, ty, tile, tid) {
          shadow(g, tx * T - camX + 8, ty * T - camY + 13, (tile.tallW || T) * 0.42, 3.5);
          list.push({ y: ty + 0.5, draw: function () {
            var img = RPG.tallImage(tid, anim), iw = img.width / 2, ih = img.height / 2;
            g.drawImage(img, tx * T - camX - (iw - T) / 2, (ty + 1) * T - camY - ih, iw, ih);
          } });
        })(x, y, t, this.grid[y][x]);
      }
      (m.chests || []).forEach(function (c) {
        list.push({ y: c.y, draw: function () { shadow(g, c.x * T - camX + 8, c.y * T - camY + 13, 7, 2.5); RPG.drawSprite('chest', c.x * T - camX, c.y * T - camY, { pose: RPG.flag(c.flag) ? 'open' : 'closed' }); } });
      });
      this.visibleNpcs().forEach(function (n) {
        list.push({ y: n.fy, draw: function () { walker(g, n.sprite, n.fx, n.fy, n.dir, n.moving ? Math.floor(n.t / 8) : 0, n.palette, camX, camY); } });
      });
      var party = RPG.state.party, trail = this.trail, moving = p.moving, k = p.moving ? p.t / STEP : 1;
      for (var i = party.length - 1; i >= 1; i--) {
        var a = trail[i], b = trail[i - 1];
        var fxp = moving ? a.x + (b.x - a.x) * k : b.x, fyp = moving ? a.y + (b.y - a.y) * k : b.y;
        (function (cid, px, py, dir) {
          var c = RPG.get('characters', cid);
          list.push({ y: py - 0.01, draw: function () { walker(g, c.sprite, px, py, dir, moving ? Math.floor(p.t / 4) : 0, c.palette, camX, camY); } });
        })(party[i], fxp, fyp, b.dir);
      }
      var lead = RPG.get('characters', party[0]);
      list.push({ y: p.fy, draw: function () { walker(g, lead.sprite, p.fx, p.fy, p.dir, p.moving ? Math.floor(p.t / 4) : 0, lead.palette, camX, camY); } });
      list.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.draw(); });
      if (m.tint) { g.fillStyle = m.tint; g.fillRect(0, 0, ww, wh); }

      if (fx) {
        RPG.fx.particles(m.particles, camX, camY, ww, wh, RPG.frame);
        var lights = (m.lights || []).concat(this.tileLights).map(function (l) {
          return { x: l.x * T + 8 - camX, y: l.y * T + 8 - camY, r: (l.r || 3) * T, color: l.color };
        });
        if (m.playerLight) lights.push({ x: p.fx * T + 8 - camX, y: p.fy * T + 4 - camY, r: m.playerLight * T, color: 'rgba(255,210,140,A)' });
        RPG.fx.lighting(m.ambient || 0, lights, ww, wh);
        RPG.ctx = RPG.g;
        RPG.g.setTransform(RPG.scale, 0, 0, RPG.scale, 0, 0);
        RPG.fx.diorama(world, ww, wh);
        RPG.fx.post({ dof: true, bloom: m.bloom, grade: m.grade || 'warm', vignette: m.vignette || 0.5 });
      }
      RPG.ctx = RPG.g;
      RPG.g.setTransform(RPG.scale, 0, 0, RPG.scale, 0, 0);
      if (this.bannerT > 0) {
        var name = RPG.name('maps', m.id);
        RPG.g.globalAlpha = Math.min(1, this.bannerT / 30);
        var w = RPG.textWidth(name, 12, true) + 30;
        RPG.box((RPG.W - w) / 2, 12, w, 24);
        RPG.text(name, RPG.W / 2, 18, { size: 12, bold: true, align: 'center', color: '#ffd860' });
        RPG.g.globalAlpha = 1;
      }
    }
  };

  function shadow(g, cx, cy, rx, ry) {
    g.save(); g.fillStyle = 'rgba(10,6,20,0.28)';
    g.beginPath(); g.ellipse(cx + 2, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  function walker(g, sprite, fx, fy, dir, step, palette, camX, camY) {
    var pose = dir === 'left' || dir === 'right' ? 'side' : dir;
    var x = Math.round((fx * T - camX) * 2) / 2, y = Math.round((fy * T - camY) * 2) / 2;
    shadow(g, x + 8, y + 14, 6, 2.2);
    RPG.drawSprite(sprite, x, y - 3, { pose: pose, frame: step % 2, palette: palette, flip: dir === 'left' });
  }
  RPG.drawWalker = walker;
})();
