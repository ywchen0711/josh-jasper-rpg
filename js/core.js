/*
 * Josh & Jasper RPG — core.
 * Everything the game knows about (characters, items, skills, enemies, maps ...) lives in RPG.db and is
 * registered from the files in js/data with RPG.add(kind, { id: {...}, ... }). The engine only reads RPG.db.
 */
(function () {
  'use strict';

  var RPG = window.RPG = {
    db: {
      config: {}, characters: {}, items: {}, skills: {}, statuses: {}, enemies: {}, troops: {},
      maps: {}, shops: {}, sprites: {}, tiles: {}, anims: {}, backdrops: {}
    },
    effects: {},      // effect type -> function(effect, ctx)          (js/effects.js)
    commands: {},     // script command -> async function(cmd, ctx)    (js/script.js)
    scenes: {},       // scene name -> scene object                    (js/scenes/*.js)
    state: null       // the current save data
  };

  // ---- registering data ----
  RPG.add = function (kind, table) {
    if (!RPG.db[kind]) RPG.db[kind] = {};
    Object.keys(table).forEach(function (id) {
      RPG.db[kind][id] = Object.assign({ id: id }, table[id]);
    });
  };
  RPG.config = function (o) { Object.assign(RPG.db.config, o); };
  RPG.get = function (kind, id) {
    var v = RPG.db[kind] && RPG.db[kind][id];
    if (!v) throw new Error('RPG: unknown ' + kind + ' "' + id + '"');
    return v;
  };
  RPG.has = function (kind, id) { return !!(RPG.db[kind] && RPG.db[kind][id]); };

  // ---- small helpers ----
  RPG.ri = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  RPG.chance = function (p) { return Math.random() < p; };
  RPG.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  RPG.pickWeighted = function (list, weightOf) {       // list of [value, weight] or objects with .weight
    var total = 0, w = list.map(function (e) { var v = weightOf ? weightOf(e) : (Array.isArray(e) ? e[1] : e.weight || 1); total += v; return v; });
    var r = Math.random() * total;
    for (var i = 0; i < list.length; i++) { r -= w[i]; if (r < 0) return Array.isArray(list[i]) ? list[i][0] : list[i]; }
    return null;
  };
  RPG.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  RPG.STATS = ['maxHp', 'maxMp', 'atk', 'def', 'mag', 'spd', 'luck'];
  RPG.statName = function (k) { return RPG.t('stat.' + k); };
  RPG.SLOTS = ['weapon', 'armor', 'accessory'];
  RPG.slotName = function (s) { return RPG.t('slot.' + s); };

  // ======================= party members =======================
  RPG.expFor = function (level) {                       // total exp needed to reach `level`
    var f = RPG.db.config.expCurve;
    return f ? f(level) : Math.round(12 * Math.pow(level - 1, 2.1));
  };
  RPG.createMember = function (id, level) {
    var def = RPG.get('characters', id);
    var m = { id: id, level: 1, exp: 0, hp: 1, mp: 0, equip: {}, skills: [], status: [] };
    RPG.SLOTS.forEach(function (s) { m.equip[s] = (def.equip && def.equip[s]) || null; });
    level = level || def.level || 1;
    for (var lv = 1; lv <= level; lv++) learnAt(m, lv);
    m.level = level; m.exp = RPG.expFor(level);
    var st = RPG.stats(m); m.hp = st.maxHp; m.mp = st.maxMp;
    return m;
  };
  // everything up to the member's level (catches up on skills added to earlier levels in a later chapter)
  RPG.learnUpTo = function (m) { var got = []; for (var lv = 1; lv <= m.level; lv++) got = got.concat(learnAt(m, lv)); return got; };
  function learnAt(m, lv) {
    var def = RPG.get('characters', m.id), list = (def.learn && def.learn[lv]) || [], got = [];
    list.forEach(function (sk) { if (m.skills.indexOf(sk) < 0) { m.skills.push(sk); got.push(sk); } });
    return got;
  }
  RPG.baseStats = function (m) {
    var def = RPG.get('characters', m.id), s = {};
    RPG.STATS.forEach(function (k) { s[k] = Math.round((def.base[k] || 0) + (def.growth[k] || 0) * (m.level - 1)); });
    return s;
  };
  // base + equipment
  RPG.stats = function (m) {
    var s = RPG.baseStats(m);
    RPG.SLOTS.forEach(function (slot) {
      var it = m.equip[slot] && RPG.db.items[m.equip[slot]];
      if (it && it.stats) Object.keys(it.stats).forEach(function (k) { s[k] = (s[k] || 0) + it.stats[k]; });
    });
    RPG.STATS.forEach(function (k) { s[k] = Math.max(k === 'maxHp' ? 1 : 0, s[k]); });
    return s;
  };
  RPG.member = function (id) { return RPG.state.members[id]; };
  RPG.party = function () { return RPG.state.party.map(function (id) { return RPG.state.members[id]; }); };
  // up to MAX_ACTIVE members fight; the rest wait in reserve (change the order in the menu: Party)
  RPG.MAX_ACTIVE = 4;
  RPG.activeParty = function () { return RPG.party().slice(0, RPG.MAX_ACTIVE); };
  RPG.isReserve = function (m) { return RPG.state.party.indexOf(m.id) >= RPG.MAX_ACTIVE; };
  // returns a list of { level, learned: [skill ids] } for every level gained
  RPG.gainExp = function (m, n) {
    var ups = [], max = RPG.db.config.maxLevel || 50;
    m.exp += n;
    while (m.level < max && m.exp >= RPG.expFor(m.level + 1)) {
      var before = RPG.stats(m);
      m.level++;
      var after = RPG.stats(m);
      m.hp += after.maxHp - before.maxHp; m.mp += after.maxMp - before.maxMp;
      ups.push({ level: m.level, learned: RPG.learnUpTo(m) });
    }
    return ups;
  };
  RPG.canEquip = function (m, itemId) {
    var it = RPG.get('items', itemId);
    return RPG.SLOTS.indexOf(it.type) >= 0 && (!it.equipBy || it.equipBy.indexOf(m.id) >= 0);
  };
  // put an item from the bag into a slot (null = take it off); the old one goes back to the bag
  RPG.equip = function (m, slot, itemId) {
    var old = m.equip[slot];
    if (old) RPG.addItem(old, 1);
    if (itemId) RPG.addItem(itemId, -1);
    m.equip[slot] = itemId || null;
    var st = RPG.stats(m);
    m.hp = Math.min(m.hp, st.maxHp); m.mp = Math.min(m.mp, st.maxMp);
  };

  // ======================= inventory, gold, flags =======================
  RPG.itemCount = function (id) { return RPG.state.inventory[id] || 0; };
  RPG.addItem = function (id, n) {
    RPG.get('items', id);
    RPG.state.inventory[id] = Math.max(0, RPG.itemCount(id) + (n == null ? 1 : n));
    if (!RPG.state.inventory[id]) delete RPG.state.inventory[id];
  };
  RPG.flag = function (name) { return !!RPG.state.flags[name]; };
  RPG.setFlag = function (name, v) { RPG.state.flags[name] = v == null ? true : v; };

  // conditions used by scripts, NPCs and events:
  //   'flag'  '!flag'  { item: 'cookie', count: 1 }  { gold: 50 }  { member: 'mochi' }  function () {}
  RPG.check = function (cond) {
    if (cond == null) return true;
    if (typeof cond === 'function') return !!cond(RPG.state);
    if (typeof cond === 'string') return cond[0] === '!' ? !RPG.flag(cond.slice(1)) : RPG.flag(cond);
    if (Array.isArray(cond)) return cond.every(RPG.check);
    if (cond.item) return RPG.itemCount(cond.item) >= (cond.count || 1);
    if (cond.gold != null) return RPG.state.gold >= cond.gold;
    if (cond.member) return RPG.state.party.indexOf(cond.member) >= 0;
    if (cond.not) return !RPG.check(cond.not);
    return true;
  };

  // ======================= new game / save / load =======================
  RPG.newGame = function () {
    var c = RPG.db.config;
    RPG.state = {
      party: c.startParty.slice(), members: {}, inventory: Object.assign({}, c.startItems || {}),
      gold: c.startGold || 0, flags: {}, map: c.startMap, x: c.startX, y: c.startY, dir: c.startDir || 'down',
      time: 0, steps: 0, version: 1
    };
    c.startParty.forEach(function (id) { RPG.state.members[id] = RPG.createMember(id); });
    return RPG.state;
  };
  var KEY = 'jj-rpg-save-';
  RPG.save = function (slot) {
    try { localStorage.setItem(KEY + slot, JSON.stringify(RPG.state)); return true; } catch (e) { return false; }
  };
  RPG.loadSlot = function (slot) {
    try { var s = localStorage.getItem(KEY + slot); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  };
  RPG.load = function (slot) {
    var s = RPG.loadSlot(slot); if (!s) return false;
    RPG.state = s;
    Object.keys(s.members).forEach(function (id) { if (RPG.db.characters[id]) RPG.learnUpTo(s.members[id]); });
    return true;
  };
  RPG.saveSummary = function (slot) {
    var s = RPG.loadSlot(slot);
    if (!s) return null;
    var lead = s.members[s.party[0]];
    var t = Math.floor(s.time / 60);
    return RPG.name('maps', s.map) + '  Lv' + lead.level + '  ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };
})();
