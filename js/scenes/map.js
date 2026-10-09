/*
 * The map scene: grid movement with smooth steps, party members following in a line, NPCs, chests,
 * events, warps and random encounters. Maps come from js/data/maps.js.
 */
(function () {
  'use strict';
  var g = RPG.g, T = RPG.TILE;
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
      this.trail = [];                                 // previous player tiles, for the followers
      for (var i = 0; i < 4; i++) this.trail.push({ x: s.x, y: s.y, dir: s.dir });
      this.npcs = (m.npcs || []).map(function (n) { return Object.assign({ x0: n.x, y0: n.y, fx: n.x, fy: n.y, dir: n.dir || 'down', t: 0, wanderT: RPG.ri(60, 180) }, n); });
      this.busy = false;
      this.banner = m.name; this.bannerT = 150;
      this.encounterSteps = 0;
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
      this.trail.unshift({ x: p.x, y: p.y, dir: dir }); this.trail.length = 4;
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
      this.busy = true;
      return Promise.resolve(promise).then(function () { self.busy = false; }, function (e) { self.busy = false; console.error(e); });
    },

    // finished a step: warps, touch events, encounters
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
          var troop = RPG.pickWeighted(enc.troops);
          this.runBusy(RPG.battle(troop));
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
      if (RPG.flag(c.flag)) { await RPG.ui.say('裡面已經空了。'); return; }
      RPG.setFlag(c.flag);
      if (c.gold) await RPG.run([{ gold: c.gold }]);
      if (c.item) await RPG.run([{ give: c.item, count: c.count || 1 }]);
    },

    // ======================= drawing =======================
    draw: function () {
      var p = this.player;
      var camX = RPG.clamp(p.fx * T + T / 2 - RPG.W / 2, 0, Math.max(0, this.w * T - RPG.W));
      var camY = RPG.clamp(p.fy * T + T / 2 - RPG.H / 2, 0, Math.max(0, this.h * T - RPG.H));
      if (this.w * T < RPG.W) camX = (this.w * T - RPG.W) / 2;
      if (this.h * T < RPG.H) camY = (this.h * T - RPG.H) / 2;
      camX = Math.round(camX); camY = Math.round(camY);
      g.fillStyle = this.map.bg || '#000'; g.fillRect(0, 0, RPG.W, RPG.H);
      var x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T));
      var x1 = Math.min(this.w - 1, Math.ceil((camX + RPG.W) / T)), y1 = Math.min(this.h - 1, Math.ceil((camY + RPG.H) / T));
      var anim = Math.floor(RPG.frame / 30);
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var id = this.grid[y][x];
        if (id) g.drawImage(RPG.tileImage(id, anim), x * T - camX, y * T - camY);
      }
      // things on the map, sorted by row so nearer things are in front
      var list = [];
      (this.map.chests || []).forEach(function (c) { list.push({ y: c.y, draw: function () { RPG.drawSprite('chest', c.x * T - camX, c.y * T - camY, { pose: RPG.flag(c.flag) ? 'open' : 'closed' }); } }); });
      this.visibleNpcs().forEach(function (n) {
        list.push({ y: n.fy, draw: function () { drawWalker(n.sprite, n.fx, n.fy, n.dir, n.moving ? Math.floor(n.t / 8) : 0, n.palette, camX, camY); } });
      });
      var party = RPG.state.party, trail = this.trail, moving = p.moving, k = p.moving ? p.t / STEP : 1;
      for (var i = party.length - 1; i >= 1; i--) {
        var a = trail[i] , b = trail[i - 1];
        var fx = moving ? a.x + (b.x - a.x) * k : b.x, fy = moving ? a.y + (b.y - a.y) * k : b.y;
        (function (id, fx, fy, dir) {
          var c = RPG.get('characters', id);
          list.push({ y: fy - 0.01, draw: function () { drawWalker(c.sprite, fx, fy, dir, moving ? Math.floor(p.t / 4) : 0, c.palette, camX, camY); } });
        })(party[i], fx, fy, b.dir);
      }
      var lead = RPG.get('characters', party[0]);
      list.push({ y: p.fy, draw: function () { drawWalker(lead.sprite, p.fx, p.fy, p.dir, p.moving ? Math.floor(p.t / 4) : 0, lead.palette, camX, camY); } });
      list.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.draw(); });
      if (this.map.tint) { g.fillStyle = this.map.tint; g.fillRect(0, 0, RPG.W, RPG.H); }
      if (this.bannerT > 0) {
        g.globalAlpha = Math.min(1, this.bannerT / 30);
        var w = RPG.textWidth(this.banner, 12, true) + 30;
        RPG.box((RPG.W - w) / 2, 12, w, 24);
        RPG.text(this.banner, RPG.W / 2, 18, { size: 12, bold: true, align: 'center', color: '#ffd860' });
        g.globalAlpha = 1;
      }
    }
  };

  function drawWalker(sprite, fx, fy, dir, step, palette, camX, camY) {
    var pose = dir === 'left' || dir === 'right' ? 'side' : dir;
    RPG.drawSprite(sprite, Math.round(fx * T - camX), Math.round(fy * T - camY) - 2, { pose: pose, frame: step % 2, palette: palette, flip: dir === 'left' });
  }
  RPG.drawWalker = drawWalker;
})();
