/*
 * Effects: what skills and items actually do. A skill or item lists effects:
 *   effects: [ { type: 'damage', power: 1.4, kind: 'magic', element: 'fire' }, { type: 'status', status: 'sleep', chance: 0.5 } ]
 * Each effect type is a function (effect, ctx). ctx = { user, target, battle (null outside battle), source, say(text), pop(target, text, color) }
 * Add a new type:  RPG.effects.myType = function (eff, ctx) { ... }
 *
 * "Battlers" are party members (they keep hp/mp between battles) or enemies created by the battle.
 * RPG.statOf(battler, 'atk') includes equipment, buffs and status modifiers.
 */
(function () {
  'use strict';

  RPG.statOf = function (b, key) {
    var base = b.isEnemy ? (b.def.stats[key] || 0) : RPG.stats(b)[key];
    var mult = 1;
    (b.buffs || []).forEach(function (bf) { if (bf.stat === key) mult *= bf.mult; });
    (b.status || []).forEach(function (s) { var d = RPG.db.statuses[s.id]; if (d && d.stats && d.stats[key]) mult *= d.stats[key]; });
    return Math.max(0, Math.round(base * mult));
  };
  RPG.nameOf = function (b) { return b.isEnemy ? b.name : RPG.name('characters', b.id); };
  RPG.alive = function (b) { return b.hp > 0; };
  RPG.hasStatus = function (b, id) { return (b.status || []).some(function (s) { return s.id === id; }); };

  // default damage formulas; override in data/config.js with RPG.config({ damage: function (...) {} })
  RPG.damageFor = function (user, target, eff) {
    var custom = RPG.db.config.damage;
    if (custom) return custom(user, target, eff);
    var power = eff.power == null ? 1 : eff.power, dmg;
    if (eff.kind === 'fixed') dmg = eff.amount;
    else if (eff.kind === 'magic') dmg = (RPG.statOf(user, 'mag') * 2.1 - RPG.statOf(target, 'mag') * 0.6) * power;
    else dmg = (RPG.statOf(user, 'atk') * 2 - RPG.statOf(target, 'def')) * power;
    dmg = Math.max(1, dmg) * (0.88 + Math.random() * 0.24);
    var crit = eff.kind !== 'magic' && eff.kind !== 'fixed' && Math.random() < 0.04 + RPG.statOf(user, 'luck') / 300;
    if (crit) dmg *= 1.6;
    var el = eff.element, mult = 1;
    if (el && target.isEnemy) {
      if ((target.def.weak || []).indexOf(el) >= 0) mult = 1.6;
      if ((target.def.resist || []).indexOf(el) >= 0) mult = 0.5;
    }
    dmg *= mult;
    if (target.defending) dmg *= 0.5;
    return { amount: Math.max(1, Math.round(dmg)), crit: crit, weak: mult > 1, resist: mult < 1 };
  };

  RPG.hurt = function (target, n) {
    target.hp = Math.max(0, target.hp - n);
    // some statuses end when you get hit (sleep)
    target.status = (target.status || []).filter(function (s) { var d = RPG.db.statuses[s.id]; return !(d && d.wakeOnHit); });
  };
  function maxHp(b) { return RPG.statOf(b, 'maxHp'); }
  function maxMp(b) { return RPG.statOf(b, 'maxMp'); }

  var E = RPG.effects;
  E.damage = function (eff, ctx) {
    var t = ctx.target;
    if (!RPG.alive(t)) return;
    var hitChance = eff.accuracy == null ? 0.95 : eff.accuracy;
    if (eff.kind !== 'magic' && Math.random() > hitChance + (RPG.statOf(ctx.user, 'spd') - RPG.statOf(t, 'spd')) / 400) {
      ctx.pop(t, 'MISS', '#c0c0c0'); RPG.sfx('miss'); return;
    }
    var r = RPG.damageFor(ctx.user, t, eff);
    RPG.hurt(t, r.amount);
    ctx.pop(t, String(r.amount), r.crit ? '#ffd040' : t.isEnemy ? '#ffffff' : '#ff8080', r.crit ? RPG.t('battle.crit') : r.weak ? RPG.t('battle.weak') : r.resist ? RPG.t('battle.resist') : null);
    RPG.sfx(r.crit ? 'crit' : 'hit');
    if (ctx.battle) ctx.battle.shake(t);
  };
  E.drain = function (eff, ctx) {                      // damage, and the user heals part of it
    var before = ctx.target.hp;
    E.damage(eff, ctx);
    var got = Math.round((before - ctx.target.hp) * (eff.ratio || 0.5));
    if (got > 0) { ctx.user.hp = Math.min(maxHp(ctx.user), ctx.user.hp + got); ctx.pop(ctx.user, '+' + got, '#80ff9a'); }
  };
  E.heal = function (eff, ctx) {
    var t = ctx.target;
    if (!RPG.alive(t) && !eff.revive) return;
    var n = eff.amount || 0;
    if (eff.percent) n += maxHp(t) * eff.percent;
    if (eff.power) n += RPG.statOf(ctx.user, 'mag') * eff.power;
    n = Math.round(n * (0.95 + Math.random() * 0.1));
    var before = t.hp;
    t.hp = Math.min(maxHp(t), t.hp + n);
    ctx.pop(t, '+' + (t.hp - before), '#80ff9a');
    RPG.sfx('heal');
  };
  E.mp = function (eff, ctx) {
    var t = ctx.target, before = t.mp;
    t.mp = RPG.clamp(t.mp + (eff.amount || 0) + Math.round(maxMp(t) * (eff.percent || 0)), 0, maxMp(t));
    ctx.pop(t, (t.mp >= before ? '+' : '') + (t.mp - before) + ' MP', '#80c8ff');
  };
  E.revive = function (eff, ctx) {
    var t = ctx.target;
    if (RPG.alive(t)) return;
    t.hp = Math.max(1, Math.round(maxHp(t) * (eff.percent || 0.3)));
    t.status = [];
    ctx.pop(t, RPG.t('battle.revived'), '#ffe080');
    RPG.sfx('heal');
  };
  E.status = function (eff, ctx) {
    var t = ctx.target, d = RPG.get('statuses', eff.status);
    if (!RPG.alive(t)) return;
    var immune = t.isEnemy && (t.def.immune || []).indexOf(eff.status) >= 0;
    if (immune || Math.random() > (eff.chance == null ? 1 : eff.chance)) { if (eff.chance != null) ctx.pop(t, RPG.t('battle.missed'), '#c0c0c0'); return; }
    t.status = (t.status || []).filter(function (s) { return s.id !== eff.status; });
    var turns = eff.turns || (Array.isArray(d.turns) ? RPG.ri(d.turns[0], d.turns[1]) : d.turns || 3);
    t.status.push({ id: eff.status, turns: turns });
    ctx.pop(t, RPG.name('statuses', eff.status), d.color || '#e0a0ff');
  };
  E.cure = function (eff, ctx) {
    var t = ctx.target, list = eff.status === 'all' || !eff.status ? null : [].concat(eff.status);
    var had = (t.status || []).length;
    t.status = (t.status || []).filter(function (s) { return list && list.indexOf(s.id) < 0; });
    if (had !== t.status.length) ctx.pop(t, RPG.t('battle.cured'), '#a0ffe0');
  };
  E.buff = function (eff, ctx) {
    var t = ctx.target;
    if (!RPG.alive(t)) return;
    t.buffs = (t.buffs || []).filter(function (b) { return b.stat !== eff.stat; });
    t.buffs.push({ stat: eff.stat, mult: eff.mult, turns: eff.turns || 3 });
    ctx.pop(t, RPG.statName(eff.stat) + (eff.mult >= 1 ? '↑' : '↓'), eff.mult >= 1 ? '#ffd060' : '#80a0ff');
  };
  E.escape = function (eff, ctx) { if (ctx.battle) ctx.battle.forceEscape = true; };
  E.custom = function (eff, ctx) { if (eff.run) eff.run(ctx); };

  // use a skill or an item: ctx.user, targets[], source (skill/item def), battle
  RPG.applyEffects = function (source, user, targets, battle, pop) {
    targets.forEach(function (t) {
      var ctx = { user: user, target: t, battle: battle, source: source, pop: pop || function () {} };
      (source.effects || []).forEach(function (eff) {
        var fn = RPG.effects[eff.type];
        if (!fn) console.warn('RPG: unknown effect type', eff.type);
        else fn(eff, ctx);
      });
    });
  };
})();
