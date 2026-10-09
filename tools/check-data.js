// Checks the game data for mistakes: run  node tools/check-data.js
// Map rows of different widths, unknown tile characters, warps or NPCs on walls, and references to
// skills / items / enemies / troops / shops / characters that don't exist.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
global.window = {};
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../js/core.js'), 'utf8'));
const RPG = global.RPG = window.RPG;
['sprites', 'tiles', 'visuals', 'skills', 'items', 'characters', 'enemies', 'config', 'maps'].forEach((f) => {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../js/data/' + f + '.js'), 'utf8'), { filename: f + '.js' });
});
const db = RPG.db, problems = [];
const bad = (msg) => problems.push(msg);
const need = (kind, id, where) => { if (id != null && !db[kind][id]) bad(`${where}: unknown ${kind} "${id}"`); };

// scripts: walk every command and check what it points at
function checkScript(script, where) {
  if (!script || typeof script === 'function') return;
  script.forEach((c, i) => {
    if (typeof c === 'string') return;
    const w = `${where}[${i}]`;
    if (c.give) need('items', c.give, w);
    if (c.take) need('items', c.take, w);
    if (c.battle) need('troops', c.battle, w);
    if (c.shop) need('shops', c.shop, w);
    if (c.join) need('characters', c.join, w);
    if (c.warp) need('maps', c.warp, w);
    if (c['if'] && c['if'].item) need('items', c['if'].item, w);
    ['then', 'else', 'win', 'lose', 'escape'].forEach((k) => {
      if (!c[k]) return;
      if (k === 'then' && c.choice) c.then.forEach((s, j) => checkScript(s, `${w}.then[${j}]`));
      else checkScript(c[k], `${w}.${k}`);
    });
  });
}
const walkable = (map, legend, x, y) => {
  const row = map.rows[y];
  if (!row || x < 0 || x >= row.length) return false;
  const t = db.tiles[legend[row[x]]];
  return t && !t.solid;
};

// maps
Object.values(db.maps).forEach((m) => {
  const legend = Object.assign({}, db.config.legend, m.legend || {});
  const w = m.rows[0].length;
  m.rows.forEach((r, y) => {
    if (r.length !== w) bad(`map ${m.id} row ${y}: width ${r.length}, expected ${w}`);
    [...r].forEach((ch, x) => { if (!legend[ch]) bad(`map ${m.id} (${x},${y}): no tile for "${ch}"`); else if (!db.tiles[legend[ch]]) bad(`map ${m.id}: legend "${ch}" -> unknown tile ${legend[ch]}`); });
  });
  (m.warps || []).forEach((wp) => {
    need('maps', wp.to, `map ${m.id} warp`);
    if (!walkable(m, legend, wp.x, wp.y)) bad(`map ${m.id} warp at (${wp.x},${wp.y}) is not walkable`);
    const t = db.maps[wp.to];
    if (t && !walkable(t, Object.assign({}, db.config.legend, t.legend || {}), wp.tx, wp.ty)) bad(`map ${m.id} warp -> ${wp.to} (${wp.tx},${wp.ty}) lands on a wall`);
  });
  (m.npcs || []).forEach((n) => {
    need('sprites', n.sprite, `map ${m.id} npc ${n.id}`);
    if (!walkable(m, legend, n.x, n.y)) bad(`map ${m.id} npc ${n.id} at (${n.x},${n.y}) stands on a wall`);
    checkScript(n.script, `map ${m.id} npc ${n.id}`);
  });
  (m.events || []).forEach((e, i) => checkScript(e.script, `map ${m.id} event ${i}`));
  (m.chests || []).forEach((c) => {
    need('items', c.item, `map ${m.id} chest`);
    if (!walkable(m, legend, c.x, c.y)) bad(`map ${m.id} chest at (${c.x},${c.y}) sits on a wall`);
    if (!c.flag) bad(`map ${m.id} chest at (${c.x},${c.y}) has no flag`);
  });
  if (m.encounters) m.encounters.troops.forEach((t) => need('troops', t[0], `map ${m.id} encounters`));
});
// everything else
Object.values(db.characters).forEach((c) => {
  need('sprites', c.sprite, `character ${c.id}`);
  Object.values(c.learn || {}).forEach((l) => l.forEach((s) => need('skills', s, `character ${c.id} learn`)));
  Object.values(c.equip || {}).forEach((it) => need('items', it, `character ${c.id} equip`));
});
Object.values(db.skills).forEach((s) => (s.effects || []).forEach((e) => { if (e.status) [].concat(e.status).forEach((st) => st !== 'all' && need('statuses', st, `skill ${s.id}`)); if (s.anim) need('anims', s.anim, `skill ${s.id}`); }));
Object.values(db.items).forEach((it) => (it.effects || []).forEach((e) => { if (e.status) [].concat(e.status).forEach((st) => st !== 'all' && need('statuses', st, `item ${it.id}`)); }));
Object.values(db.enemies).forEach((e) => {
  need('sprites', e.sprite, `enemy ${e.id}`);
  (e.ai || []).forEach((a) => a.skill !== 'attack' && need('skills', a.skill, `enemy ${e.id} ai`));
  (e.drops || []).forEach((d) => need('items', d.item, `enemy ${e.id} drops`));
});
Object.values(db.troops).forEach((t) => { t.enemies.forEach((e) => need('enemies', e, `troop ${t.id}`)); if (t.backdrop) need('backdrops', t.backdrop, `troop ${t.id}`); });
Object.values(db.shops).forEach((s) => s.items.forEach((i) => need('items', i, `shop ${s.id}`)));
db.config.startParty.forEach((c) => need('characters', c, 'config.startParty'));
need('maps', db.config.startMap, 'config.startMap');
checkScript(db.config.intro, 'config.intro');

const count = (k) => Object.keys(db[k]).length;
console.log(`maps ${count('maps')} · characters ${count('characters')} · skills ${count('skills')} · items ${count('items')} · enemies ${count('enemies')} · troops ${count('troops')} · shops ${count('shops')}`);
if (problems.length) { console.log(problems.length + ' problem(s):\n' + problems.join('\n')); process.exit(1); }
console.log('data OK');
