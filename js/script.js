/*
 * Event scripts: arrays of commands run one after another. Used by NPCs, map events, chests and the story.
 *
 *   [ { say: '早安！', name: 'Mom' },
 *     { if: { item: 'cookie' }, then: [ { take: 'cookie' }, { join: 'mochi' } ], else: [ { say: '...' } ] },
 *     { choice: ['好', '不要'], then: [ [...], [...] ] },
 *     { battle: 'raccoonKing', win: [...], lose: [...] } ]
 *
 * Add a command:  RPG.commands.myCommand = async function (cmd, ctx) { ... }   (return 'stop' to end the script)
 */
(function () {
  'use strict';

  // ---- frame-based waiting (resolved by the main loop) ----
  var waiters = [];
  RPG.wait = function (frames) { return new Promise(function (r) { waiters.push({ n: Math.max(1, Math.round(frames)), r: r }); }); };
  RPG.tickWaiters = function () {
    for (var i = waiters.length - 1; i >= 0; i--) if (--waiters[i].n <= 0) { var w = waiters.splice(i, 1)[0]; w.r(); }
  };

  // text can use {gold}, {lead}, {member:id} placeholders
  function fmt(s) {
    return String(s).replace(/\{gold\}/g, RPG.state.gold).replace(/\{lead\}/g, RPG.get('characters', RPG.state.party[0]).name);
  }
  RPG.fmt = fmt;

  RPG.run = async function (script, ctx) {
    ctx = ctx || {};
    if (!script) return;
    if (typeof script === 'function') return script(ctx);
    for (var i = 0; i < script.length; i++) {
      var cmd = script[i];
      if (typeof cmd === 'string') cmd = { say: cmd };
      var key = Object.keys(cmd).filter(function (k) { return RPG.commands[k]; })[0];
      if (!key) { console.warn('RPG: unknown script command', cmd); continue; }
      var r = await RPG.commands[key](cmd, ctx);
      if (r === 'stop') return 'stop';
    }
  };

  var C = RPG.commands;
  C.say = async function (c, ctx) {
    var name = c.name || (c.npc === false ? null : ctx.npc && ctx.npc.name) || null;
    var texts = Array.isArray(c.say) ? c.say : [c.say];
    for (var i = 0; i < texts.length; i++) await RPG.ui.say(fmt(texts[i]), name);
  };
  C.choice = async function (c, ctx) {
    if (c.text) await RPG.ui.say(fmt(c.text), c.name || (ctx.npc && ctx.npc.name));
    var i = await RPG.ui.choice(c.choice);
    if (i < 0) i = c.choice.length - 1;              // cancelling picks the last option ("no")
    if (c.then && c.then[i]) return RPG.run(c.then[i], ctx);
  };
  C['if'] = async function (c, ctx) { return RPG.run(RPG.check(c['if']) ? c.then : c['else'], ctx); };
  C.set = async function (c) { (Array.isArray(c.set) ? c.set : [c.set]).forEach(function (f) { RPG.setFlag(f); }); };
  C.unset = async function (c) { RPG.setFlag(c.unset, false); };
  C.give = async function (c) {
    var it = RPG.get('items', c.give), n = c.count || 1;
    RPG.addItem(c.give, n);
    RPG.sfx('item');
    if (c.quiet) return;
    await RPG.ui.say('得到了「' + it.name + '」' + (n > 1 ? ' ×' + n : '') + '！');
  };
  C.take = async function (c) { RPG.addItem(c.take, -(c.count || 1)); };
  C.gold = async function (c) {
    RPG.state.gold = Math.max(0, RPG.state.gold + c.gold);
    RPG.sfx('item');
    if (!c.quiet) await RPG.ui.say((c.gold >= 0 ? '得到了 ' : '付了 ') + Math.abs(c.gold) + ' 元。');
  };
  C.battle = async function (c, ctx) {
    var res = await RPG.battle(c.battle, { canLose: !!c.lose });
    if (res === 'win') return RPG.run(c.win, ctx);
    if (res === 'lose') { if (c.lose) return RPG.run(c.lose, ctx); return 'stop'; }
    if (res === 'escape') return RPG.run(c.escape, ctx);
  };
  C.shop = async function (c) { await RPG.openShop(c.shop); };
  C.inn = async function (c, ctx) {
    var price = c.inn || 0;
    if (price) {
      var i = await RPG.ui.choice(['休息（' + price + ' 元）', '不用了']);
      if (i !== 0) return;
      if (RPG.state.gold < price) { await RPG.ui.say('錢不夠耶……', ctx.npc && ctx.npc.name); return; }
      RPG.state.gold -= price;
    }
    await RPG.fade(30);
    RPG.healParty();
    RPG.sfx('heal');
    await RPG.ui.say(c.text || '大家都恢復精神了！');
  };
  C.join = async function (c) {
    if (RPG.state.party.indexOf(c.join) >= 0) return;
    if (!RPG.state.members[c.join]) RPG.state.members[c.join] = RPG.createMember(c.join, c.level);
    RPG.state.party.push(c.join);
    RPG.sfx('levelup');
    if (!c.quiet) await RPG.ui.say(RPG.get('characters', c.join).name + ' 加入了隊伍！');
  };
  C.leave = async function (c) { RPG.state.party = RPG.state.party.filter(function (id) { return id !== c.leave; }); };
  C.heal = async function () { RPG.healParty(); RPG.sfx('heal'); };
  C.warp = async function (c) { await RPG.warp(c.warp, c.x, c.y, c.dir); };
  C.hide = async function (c) { RPG.setFlag('hide_' + c.hide); };
  C.show = async function (c) { RPG.setFlag('hide_' + c.show, false); };
  C.wait = async function (c) { await RPG.wait(c.wait); };
  C.sfx = async function (c) { RPG.sfx(c.sfx); };
  C.toast = async function (c) { RPG.ui.toast(fmt(c.toast), c.color); };
  C.ending = async function () { await RPG.ending(); return 'stop'; };
  C.call = async function (c, ctx) { return c.call(ctx); };   // escape hatch: { call: function (ctx) { ... } }

  RPG.healParty = function () {
    RPG.party().forEach(function (m) { var s = RPG.stats(m); m.hp = s.maxHp; m.mp = s.maxMp; m.status = []; });
  };
})();
