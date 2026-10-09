/*
 * Turn-based battles. RPG.battle(troopId) returns a Promise of 'win' | 'lose' | 'escape'.
 * Enemies and troops come from js/data/enemies.js, skills from skills.js, animations from anims.js.
 *
 * Enemy AI (in the enemy's data):
 *   ai: [ { skill: 'attack', weight: 4 }, { skill: 'sting', weight: 2 },
 *         { skill: 'heal', weight: 5, if: function (self, battle) { return self.hp < self.maxHp / 2; } } ]
 */
(function () {
  'use strict';
  RPG.battle = async function (troopId, opts) {
    opts = opts || {};
    var prev = RPG.scene, troop = RPG.get('troops', troopId);
    RPG.sfx('encounter');
    for (var i = 0; i < 6; i++) { RPG.fadeAlpha = i % 2 ? 0.8 : 0; await RPG.wait(4); }
    RPG.fadeAlpha = 0;
    var b = new Battle(troop, opts);
    RPG.scenes.battle.b = b;
    RPG.scene = RPG.scenes.battle;
    var result = await b.run();
    b.cleanup();
    await RPG.fadeOut(14);
    RPG.scene = prev;
    if (result === 'lose') {
      if (!opts.canLose) { RPG.fadeAlpha = 0; await RPG.gameOver(); return 'lose'; }
      RPG.party().forEach(function (m) { m.hp = Math.max(1, m.hp); });
    }
    await RPG.fadeIn(14);
    return result;
  };

  RPG.scenes.battle = {
    update: function () { if (this.b) this.b.tick(); },
    draw: function () { if (this.b) this.b.draw(); }
  };

  function Battle(troop, opts) {
    this.troop = troop; this.opts = opts;
    this.backdrop = troop.backdrop || (RPG.scenes.map.map && RPG.scenes.map.map.backdrop) || 'default';
    this.popups = []; this.fx = []; this.msg = null;
    this.party = RPG.party();
    this.party.forEach(function (m) { m.buffs = []; m.defending = false; m.status = m.status || []; });
    var counts = {}, seen = {};
    troop.enemies.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
    var n = troop.enemies.length;
    this.enemies = troop.enemies.map(function (id, i) {
      var def = RPG.get('enemies', id), letter = '';
      if (counts[id] > 1) { seen[id] = (seen[id] || 0) + 1; letter = String.fromCharCode(64 + seen[id]); }
      var sc = def.scale || 3, size = 16 * sc;
      return {
        isEnemy: true, id: id, def: def, name: RPG.name('enemies', id) + letter, hp: def.stats.maxHp, mp: def.stats.maxMp || 0,
        status: [], buffs: [], size: size, scale: sc,
        x: Math.round(110 - (n - 1) * 30 + i * 60 - size / 2 + (i % 2) * 6), y: Math.round(118 - size + (i % 2) * 14),
        shake: 0, flash: 0, deathT: 0
      };
    });
    this.party.forEach(function (m, i) { m.bx = 248 + i * 8; m.by = 56 + i * 30; m.shake = 0; m.flash = 0; });
  }
  var B = Battle.prototype;

  B.cleanup = function () {
    this.party.forEach(function (m) {
      delete m.buffs; delete m.defending; delete m.bx; delete m.by; delete m.shake; delete m.flash;
      m.status = (m.status || []).filter(function (s) { var d = RPG.db.statuses[s.id]; return d && d.persist; });
    });
  };

  // ---------------- helpers ----------------
  B.say = async function (text, frames) {
    this.msg = text;
    var n = frames || 46;
    for (var i = 0; i < n; i++) { await RPG.wait(1); if (RPG.input.held('ok') && i > 10) i += 2; }
  };
  B.pop = function (t, text, color, sub) {
    var p = this.pos(t);
    this.popups.push({ x: p.x, y: p.y - 6, text: text, color: color, sub: sub, t: 0 });
    if (sub) this.msgSub = sub;
  };
  B.shake = function (t) { t.shake = 12; t.flash = 0.8; };
  B.pos = function (t) {
    if (t.isEnemy) return { x: t.x + t.size / 2, y: t.y + t.size / 2 };
    return { x: t.bx + 16, y: t.by + 14 };
  };
  B.anim = async function (id, targets) {
    var a = RPG.db.anims[id] || RPG.db.anims.hit, self = this;
    if (!a) return;
    var list = targets.map(function (t) { var p = self.pos(t); return { anim: a, x: p.x, y: p.y, t: 0 }; });
    if (a.sfx) RPG.sfx(a.sfx);
    this.fx = this.fx.concat(list);
    await RPG.wait(a.frames || 20);
  };
  B.aliveParty = function () { return this.party.filter(RPG.alive); };
  B.aliveEnemies = function () { return this.enemies.filter(RPG.alive); };
  B.sideOf = function (actor, which) {                 // 'foes' or 'friends' of an actor
    var foes = actor.isEnemy ? this.party : this.enemies, friends = actor.isEnemy ? this.enemies : this.party;
    return which === 'foes' ? foes : friends;
  };
  // resolve a target mode into battlers (`pick` = the chosen one for single-target modes)
  B.targetsFor = function (actor, mode, pick) {
    var foes = this.sideOf(actor, 'foes').filter(RPG.alive), friends = this.sideOf(actor, 'friends');
    switch (mode) {
      case 'enemies': return foes;
      case 'allies': return friends.filter(RPG.alive);
      case 'self': return [actor];
      case 'deadAlly': return pick && !RPG.alive(pick) ? [pick] : friends.filter(function (f) { return !RPG.alive(f); }).slice(0, 1);
      case 'ally': return pick && RPG.alive(pick) ? [pick] : friends.filter(RPG.alive).slice(0, 1);
      default: return pick && RPG.alive(pick) ? [pick] : foes.length ? [RPG.pick(foes)] : [];
    }
  };
  B.canAct = function (b) { return RPG.alive(b); };
  B.over = function () {
    if (!this.aliveEnemies().length) return 'win';
    if (!this.aliveParty().length) return 'lose';
    return null;
  };

  // ---------------- the battle ----------------
  B.run = async function () {
    var names = this.enemies.map(function (e) { return e.name; });
    var introKey = 'troop.' + this.troop.id + '.intro';
    await this.say(RPG.hasText(introKey) ? RPG.t(introKey) : RPG.t(names.length > 2 ? 'battle.appearMany' : 'battle.appear', { names: names.slice(0, 2).join(RPG.t('ui.listSep')) }), 60);
    for (var round = 1; ; round++) {
      this.msg = null;
      var actions = [], escaped = false;
      // party picks commands (a member can step back to the previous one with X)
      var choosers = this.party.filter(function (m) { return RPG.alive(m) && !skipsTurn(m); });
      for (var i = 0; i < choosers.length; i++) {
        var a = await this.choose(choosers[i], i > 0);
        if (a === 'back') { actions.pop(); i -= 2; continue; }
        if (a.type === 'run') {
          if (await this.tryRun()) return 'escape';
          actions = []; break;
        }
        actions.push(a);
      }
      if (this.forceEscape) { await this.say(RPG.t('battle.slipAway')); return 'escape'; }
      var self = this;
      this.aliveEnemies().forEach(function (e) { if (!skipsTurn(e)) actions.push(self.enemyAction(e)); });
      actions.forEach(function (a) { a.speed = RPG.statOf(a.actor, 'spd') * (0.85 + Math.random() * 0.3) + (a.type === 'defend' ? 999 : 0); });
      actions.sort(function (a, b) { return b.speed - a.speed; });
      // statuses that skip a turn
      var skippers = this.party.concat(this.enemies).filter(function (b) { return RPG.alive(b) && skipsTurn(b); });
      for (var s = 0; s < skippers.length; s++) await this.say(statusSkipText(skippers[s]), 40);
      for (var k = 0; k < actions.length; k++) {
        var act = actions[k];
        if (!RPG.alive(act.actor)) continue;
        await this.execute(act);
        if (this.forceEscape) { await this.say(RPG.t('battle.slipAway')); return 'escape'; }
        var res = this.over();
        if (res) return this.finish(res);
      }
      await this.endRound();
      var res2 = this.over();
      if (res2) return this.finish(res2);
    }
  };

  function skipsTurn(b) {
    return (b.status || []).some(function (s) { var d = RPG.db.statuses[s.id]; return d && d.skipTurn && (d.skipTurn === true || Math.random() < d.skipTurn); });
  }
  function statusSkipText(b) {
    var s = (b.status || []).filter(function (s) { var d = RPG.db.statuses[s.id]; return d && d.skipTurn; })[0];
    var key = s && 'status.' + s.id + '.skip';
    return RPG.t(key && RPG.hasText(key) ? key : 'battle.cantMove', { name: RPG.nameOf(b) });
  }

  B.tryRun = async function () {
    if (this.troop.canRun === false) { await this.say(RPG.t('battle.cantRun')); return false; }
    var mine = avg(this.aliveParty().map(function (m) { return RPG.statOf(m, 'spd'); }));
    var theirs = avg(this.aliveEnemies().map(function (e) { return RPG.statOf(e, 'spd'); }));
    var p = RPG.clamp(0.55 + (mine - theirs) / 40, 0.2, 0.95);
    if (Math.random() < p) { RPG.sfx('run'); await this.say(RPG.t('battle.ranAway')); return true; }
    await this.say(RPG.t('battle.runFailed'));
    return false;
  };
  function avg(a) { return a.reduce(function (s, v) { return s + v; }, 0) / Math.max(1, a.length); }

  // ---- player command menus ----
  B.choose = async function (m, canBack) {
    this.active = m;
    var name = RPG.nameOf(m);
    for (;;) {
      this.msg = RPG.t('battle.whatWill', { name: name });
      var i = await RPG.ui.menu({ items: [{ label: RPG.t('battle.cmdAttack') }, { label: RPG.t('battle.cmdSkill'), disabled: !m.skills.length }, { label: RPG.t('battle.cmdItem') },
                                          { label: RPG.t('battle.cmdDefend') }, { label: RPG.t('battle.cmdRun'), disabled: this.troop.canRun === false }],
                                  x: 6, y: 128, w: 74, rows: 5, lineHeight: 13, cancel: canBack });
      if (i < 0) { this.active = null; return 'back'; }
      if (i === 0) { var t = await this.pickTarget(m, 'enemy'); if (t) return done(this, { type: 'attack', actor: m, targets: t }); }
      if (i === 1) { var sk = await this.pickSkill(m); if (sk) { var ts = await this.pickTarget(m, sk.target); if (ts) return done(this, { type: 'skill', actor: m, skill: sk, targets: ts }); } }
      if (i === 2) { var it = await this.pickItem(); if (it) { var ti = await this.pickTarget(m, it.target || 'ally'); if (ti) return done(this, { type: 'item', actor: m, item: it, targets: ti }); } }
      if (i === 3) return done(this, { type: 'defend', actor: m });
      if (i === 4) return done(this, { type: 'run', actor: m });
    }
    function done(self, a) { self.active = null; return a; }
  };
  B.pickSkill = async function (m) {
    var self = this, list = m.skills.map(function (id) { return RPG.get('skills', id); }).filter(function (s) { return s.battle !== false; });
    var i = await RPG.ui.menu({
      title: RPG.t('ui.skills'), w: 196, x: 84, y: 54, rows: 6,
      items: list.map(function (s) { return { label: RPG.name('skills', s.id), right: s.mp ? s.mp + ' MP' : '', disabled: m.mp < (s.mp || 0) }; }),
      onMove: function (k) { self.msg = list[k] ? RPG.desc('skills', list[k].id) : ''; }
    });
    return i < 0 ? null : list[i];
  };
  B.pickItem = async function () {
    var self = this, ids = Object.keys(RPG.state.inventory).filter(function (id) { var it = RPG.db.items[id]; return it && it.type === 'consumable' && it.battle !== false; });
    var i = await RPG.ui.menu({
      title: RPG.t('ui.items'), w: 196, x: 84, y: 54, rows: 6, empty: RPG.t('battle.noItems'),
      items: ids.map(function (id) { return { label: RPG.name('items', id), right: '×' + RPG.itemCount(id) }; }),
      onMove: function (k) { self.msg = ids[k] ? RPG.desc('items', ids[k]) : ''; }
    });
    return i < 0 ? null : RPG.db.items[ids[i]];
  };
  // a cursor over enemies or party members; returns the list of targets or null
  B.pickTarget = function (actor, mode) {
    var self = this;
    if (mode === 'enemies' || mode === 'allies' || mode === 'self') return Promise.resolve(this.targetsFor(actor, mode));
    var pool = mode === 'enemy' ? this.aliveEnemies() : mode === 'deadAlly' ? this.party.filter(function (m) { return !RPG.alive(m); }) : this.party.filter(RPG.alive);
    if (!pool.length) { RPG.sfx('buzz'); return Promise.resolve(null); }
    var idx = 0;
    return RPG.ui.push({
      update: function () {
        if (RPG.input.take('down', true) || RPG.input.take('right', true)) { idx = (idx + 1) % pool.length; RPG.sfx('cursor'); }
        if (RPG.input.take('up', true) || RPG.input.take('left', true)) { idx = (idx + pool.length - 1) % pool.length; RPG.sfx('cursor'); }
        self.targetCursor = pool[idx];
        if (RPG.input.take('ok')) { RPG.sfx('ok'); self.targetCursor = null; this.close([pool[idx]]); }
        if (RPG.input.take('cancel')) { RPG.sfx('back'); self.targetCursor = null; this.close(null); }
      }
    });
  };

  // ---- enemy AI ----
  B.enemyAction = function (e) {
    var self = this;
    var options = (e.def.ai || [{ skill: 'attack', weight: 1 }]).filter(function (o) {
      if (o['if'] && !o['if'](e, self)) return false;
      if (o.skill !== 'attack') { var sk = RPG.db.skills[o.skill]; if (!sk || e.mp < (sk.mp || 0)) return false; }
      return true;
    });
    var pick = RPG.pickWeighted(options.length ? options : [{ skill: 'attack', weight: 1 }]);
    if (pick.skill === 'attack') return { type: 'attack', actor: e, targets: this.targetsFor(e, 'enemy') };
    var sk = RPG.get('skills', pick.skill), pickOne = null;
    if (sk.target === 'ally') pickOne = this.aliveEnemies().sort(function (a, b) { return a.hp / a.def.stats.maxHp - b.hp / b.def.stats.maxHp; })[0];
    return { type: 'skill', actor: e, skill: sk, targets: this.targetsFor(e, sk.target || 'enemy', pickOne) };
  };

  // ---- carrying out an action ----
  B.execute = async function (a) {
    var self = this, actor = a.actor, name = RPG.nameOf(actor);
    // single targets that died meanwhile: pick another one on the same side
    var targets = a.targets || [];
    if (a.type !== 'defend' && targets.length === 1 && !RPG.alive(targets[0]) && !(a.skill && a.skill.target === 'deadAlly') && !(a.item && a.item.target === 'deadAlly')) {
      var side = targets[0].isEnemy ? this.aliveEnemies() : this.aliveParty();
      targets = side.length ? [RPG.pick(side)] : [];
    }
    var pop = function (t, text, color, sub) { self.pop(t, text, color, sub); };
    this.msgSub = null;
    if (a.type === 'defend') { actor.defending = true; await this.say(RPG.t('battle.defends', { name: name }), 30); return; }
    if (a.type === 'attack') {
      await this.say(RPG.t('battle.attacks', { name: name }), 18);
      var weapon = !actor.isEnemy && actor.equip.weapon && RPG.db.items[actor.equip.weapon];
      await this.anim(actor.isEnemy ? (actor.def.attackAnim || 'claw') : (weapon && weapon.anim) || 'hit', targets);
      RPG.applyEffects({ effects: [{ type: 'damage', power: 1, element: weapon && weapon.element }] }, actor, targets, this, pop);
    } else if (a.type === 'skill') {
      var sk = a.skill;
      if (actor.mp < (sk.mp || 0)) { await this.say(RPG.t('battle.noMp', { name: name })); return; }
      actor.mp -= sk.mp || 0;
      await this.say(RPG.t('battle.usesSkill', { name: name, skill: RPG.name('skills', sk.id) }), 22);
      await this.anim(sk.anim || 'sparkle', targets);
      RPG.applyEffects(sk, actor, targets, this, pop);
    } else if (a.type === 'item') {
      if (RPG.itemCount(a.item.id) <= 0) { await this.say(RPG.t('battle.itemGone')); return; }
      RPG.addItem(a.item.id, -1);
      await this.say(RPG.t('battle.usesItem', { name: name, item: RPG.name('items', a.item.id) }), 22);
      await this.anim(a.item.anim || 'heal', targets);
      RPG.applyEffects(a.item, actor, targets, this, pop);
    }
    await RPG.wait(16);
    if (this.msgSub) { await this.say(this.msgSub, 26); this.msgSub = null; }
    var fallen = targets.filter(function (t) { return !RPG.alive(t) && !t.reported; });
    for (var i = 0; i < fallen.length; i++) {
      fallen[i].reported = true;
      var fk = fallen[i].isEnemy ? 'enemy.' + fallen[i].id + '.defeat' : null;
      await this.say(RPG.t(fk && RPG.hasText(fk) ? fk : fallen[i].isEnemy ? 'battle.defeated' : 'battle.fainted', { name: RPG.nameOf(fallen[i]) }), 30);
    }
    this.party.forEach(function (m) { if (RPG.alive(m)) m.reported = false; });
  };

  B.endRound = async function () {
    var all = this.party.concat(this.enemies).filter(RPG.alive), self = this;
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      b.defending = false;
      for (var k = 0; k < b.status.length; k++) {
        var d = RPG.db.statuses[b.status[k].id];
        if (d && d.perTurn) {                          // e.g. poison: { type: 'damage', percent: 0.08 }
          var n = Math.max(1, Math.round(RPG.statOf(b, 'maxHp') * (d.perTurn.percent || 0) + (d.perTurn.amount || 0)));
          RPG.hurt(b, n); self.pop(b, String(n), d.color || '#c080ff'); self.shake(b);
          var tk = 'status.' + b.status[k].id + '.tick';
          await this.say(RPG.t(RPG.hasText(tk) ? tk : 'battle.hurtTick', { name: RPG.nameOf(b) }), 26);
          if (!RPG.alive(b)) await this.say(RPG.t('battle.fainted', { name: RPG.nameOf(b) }), 26);
        }
      }
      b.status = b.status.filter(function (s) { s.turns--; return s.turns > 0; });
      b.buffs = (b.buffs || []).filter(function (bf) { bf.turns--; return bf.turns > 0; });
    }
  };

  // ---- win / lose ----
  B.finish = async function (res) {
    this.msg = null;
    if (res === 'lose') { await this.say(RPG.t('battle.allDown'), 70); return 'lose'; }
    RPG.sfx('win');
    var exp = 0, gold = 0, drops = [];
    this.enemies.forEach(function (e) {
      exp += e.def.exp || 0; gold += e.def.gold || 0;
      (e.def.drops || []).forEach(function (d) { if (Math.random() < (d.chance == null ? 1 : d.chance)) drops.push(d.item); });
    });
    RPG.state.gold += gold;
    var lines = [{ text: RPG.t('battle.victory'), color: '#ffd860' }, RPG.t('battle.reward', { exp: exp, gold: gold })];
    drops.forEach(function (id) { RPG.addItem(id, 1); lines.push(RPG.t('battle.found', { item: RPG.name('items', id) })); });
    var ups = [];
    this.aliveParty().forEach(function (m) {
      RPG.gainExp(m, exp).forEach(function (u) {
        ups.push({ text: RPG.t('battle.levelUp', { name: RPG.nameOf(m), level: u.level }), color: '#80ffb0' });
        u.learned.forEach(function (sk) { ups.push({ text: RPG.t('battle.learned', { skill: RPG.name('skills', sk) }), color: '#a0d8ff' }); });
      });
    });
    await RPG.ui.alert(lines);
    if (ups.length) { RPG.sfx('levelup'); await RPG.ui.alert(ups, { w: 240 }); }
    return 'win';
  };

  // ---------------- drawing ----------------
  B.tick = function () {
    this.party.concat(this.enemies).forEach(function (b) {
      if (b.shake > 0) b.shake--;
      if (b.flash > 0) b.flash = Math.max(0, b.flash - 0.08);
      if (b.isEnemy && !RPG.alive(b)) b.deathT = Math.min(30, b.deathT + 1);
    });
    this.popups.forEach(function (p) { p.t++; });
    this.popups = this.popups.filter(function (p) { return p.t < 50; });
    this.fx.forEach(function (f) { f.t++; });
    this.fx = this.fx.filter(function (f) { return f.t < (f.anim.frames || 20); });
  };

  B.draw = function () {
    var self = this, bd = RPG.db.backdrops[this.backdrop] || RPG.db.backdrops['default'], g = RPG.ctx, fx = RPG.fx.active();
    if (fx) {                                          // the background slightly out of focus, like a stage behind the actors
      var k = RPG.scale, bb = RPG.fx.buffer('battlebd', RPG.W * k / 2, RPG.H * k / 2), bc = bb.getContext('2d');
      bc.setTransform(k / 2, 0, 0, k / 2, 0, 0); bc.imageSmoothingEnabled = true;
      var keep = RPG.ctx; RPG.ctx = bc; bd.draw(bc, RPG.frame); RPG.ctx = keep;
      g.save(); g.filter = 'blur(' + (0.6 * RPG.scale / 2).toFixed(2) + 'px)'; g.imageSmoothingEnabled = true; g.drawImage(bb, 0, 0, RPG.W, RPG.H); g.restore();
    } else if (bd) bd.draw(g, RPG.frame);
    // enemies
    this.enemies.forEach(function (e) {
      if (!RPG.alive(e) && e.deathT >= 30) return;
      var dx = e.shake ? (e.shake % 4 < 2 ? -2 : 2) : 0;
      var bob = RPG.alive(e) ? Math.round(Math.sin((RPG.frame + e.x) / 18) * 1.5) : 0;
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(e.x + e.size / 2, e.y + e.size + 2, e.size * 0.4, 4, 0, 0, Math.PI * 2); g.fill();
      RPG.drawSprite(e.def.sprite, e.x + dx, e.y + bob, { pose: 'idle', frame: Math.floor(RPG.frame / 24) % 2, scale: e.scale, palette: e.def.palette,
                                                         alpha: RPG.alive(e) ? 1 : 1 - e.deathT / 30, flash: e.flash });
      if (self.targetCursor === e) RPG.cursor(e.x + e.size / 2 - 3, e.y - 12 + Math.sin(RPG.frame / 6) * 2);
      if (e.status.length && RPG.alive(e)) RPG.text(e.status.map(function (s) { return RPG.textOf('statuses', s.id, 'short'); }).join(''), e.x + e.size / 2, e.y - 4, { size: 8, align: 'center', color: '#e0a0ff' });
    });
    // party (facing left)
    this.party.forEach(function (m) {
      var c = RPG.get('characters', m.id), dx = m.shake ? (m.shake % 4 < 2 ? -2 : 2) : 0;
      var forward = self.active === m ? -10 : 0;
      g.fillStyle = 'rgba(10,6,20,0.3)'; g.beginPath(); g.ellipse(m.bx + 17 + forward, m.by + 31, 11, 3, 0, 0, Math.PI * 2); g.fill();
      if (!RPG.alive(m)) { g.globalAlpha = 0.5; }
      RPG.drawSprite(c.sprite, m.bx + dx + forward, m.by + (RPG.alive(m) ? 0 : 8), { pose: 'side', frame: self.active === m ? Math.floor(RPG.frame / 12) % 2 : 0, scale: 2, palette: c.palette, flip: true, flash: m.flash });
      g.globalAlpha = 1;
      if (self.targetCursor === m) RPG.cursor(m.bx - 12, m.by + 12);
    });
    // effects and damage numbers
    this.fx.forEach(function (f) { f.anim.draw(g, f.x, f.y, f.t / (f.anim.frames || 20), f.t); });
    this.popups.forEach(function (p) {
      var y = p.y - Math.min(14, p.t * 0.8);
      g.globalAlpha = p.t > 36 ? 1 - (p.t - 36) / 14 : 1;
      RPG.text(p.text, p.x, y, { size: 12, bold: true, align: 'center', color: p.color });
      g.globalAlpha = 1;
    });
    if (fx) RPG.fx.post({ bloom: 0.34, grade: (RPG.db.backdrops[this.backdrop] || {}).grade || 'warm', vignette: 0.55 });
    // message bar
    if (this.msg) { RPG.box(4, 4, RPG.W - 8, 24); RPG.text(this.msg, 14, 10, { size: 11 }); }
    // party status window
    RPG.box(82, 170, RPG.W - 86, 66);
    this.party.forEach(function (m, i) {
      var y = 177 + i * 18, st = RPG.stats(m), alive = RPG.alive(m);
      RPG.text(RPG.nameOf(m), 92, y, { size: 10, bold: true, color: self.active === m ? '#ffd860' : alive ? '#f4f0e8' : '#ff7070' });
      RPG.text('HP', 146, y + 1, { size: 8, color: '#a0b0d0' });
      RPG.bar(160, y + 4, 52, 4, m.hp / st.maxHp, m.hp < st.maxHp * 0.3 ? '#ff6060' : '#60e080');
      RPG.text(m.hp + '/' + st.maxHp, 186, y + 6, { size: 8, align: 'center' });
      RPG.text('MP', 220, y + 1, { size: 8, color: '#a0b0d0' });
      RPG.bar(234, y + 4, 40, 4, st.maxMp ? m.mp / st.maxMp : 0, '#60a0ff');
      RPG.text(String(m.mp), 254, y + 6, { size: 8, align: 'center' });
      var tags = (m.status || []).map(function (s) { return RPG.textOf('statuses', s.id, 'short'); }).join('') + (m.defending ? RPG.t('battle.defTag') : '');
      if (tags) RPG.text(tags, 300, y, { size: 9, align: 'right', color: '#e0a0ff' });
    });
  };
})();
