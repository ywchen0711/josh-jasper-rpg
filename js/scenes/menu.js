/*
 * The field menu (C / Tab on the map): items, skills, equipment, status, settings, save. And shops.
 */
(function () {
  'use strict';

  // the height of one member's row, so up to 6 fit on the screen
  function rowH() { var n = RPG.state.party.length; return n > 5 ? 38 : n > 4 ? 45 : 46; }
  function partyPanel(x, y, highlight, marked) {
    var rh = rowH();
    RPG.party().forEach(function (m, i) {
      var c = RPG.get('characters', m.id), st = RPG.stats(m), yy = y + i * rh, reserve = RPG.isReserve(m);
      RPG.box(x, yy, 220, rh - 4, { fill: marked === i ? 'rgba(170,80,130,0.96)' : highlight === i ? 'rgba(80,96,190,0.96)' : reserve ? 'rgba(48,46,80,0.93)' : undefined, sparkle: false });
      var my = yy + (rh - 4) / 2 - 8;
      RPG.drawSprite(c.sprite, x + 8, my, { pose: 'down', palette: c.palette, frame: highlight === i ? Math.floor(RPG.frame / 14) % 2 : 0 });
      RPG.text(RPG.name('characters', m.id), x + 30, my - 1, { size: 11, bold: true, color: reserve ? '#c8c4dc' : undefined });
      RPG.text('Lv ' + m.level + (reserve ? '  ' + RPG.t('ui.reserve') : ''), x + 30, my + 13, { size: 9, color: reserve ? '#a8a0c8' : '#c8d0e8' });
      RPG.text('HP', x + 96, my - 1, { size: 9, color: '#a0b0d0' }); RPG.bar(x + 112, my + 3, 66, 4, m.hp / st.maxHp, '#60e080');
      RPG.text(m.hp + '/' + st.maxHp, x + 212, my - 2, { size: 9, align: 'right' });
      RPG.text('MP', x + 96, my + 13, { size: 9, color: '#a0b0d0' }); RPG.bar(x + 112, my + 17, 66, 4, st.maxMp ? m.mp / st.maxMp : 0, '#60a0ff');
      RPG.text(m.mp + '/' + st.maxMp, x + 212, my + 12, { size: 9, align: 'right' });
      if ((m.status || []).length) RPG.text(m.status.map(function (s) { return RPG.textOf('statuses', s.id, 'short'); }).join(''), x + 70, my + 13, { size: 9, color: '#e0a0ff' });
    });
  }
  function descBox(text) {
    var lines = RPG.wrap(text || '', RPG.W - 30, 10).slice(0, 2), h = lines.length > 1 ? 40 : 28;
    RPG.box(6, RPG.H - h - 6, RPG.W - 12, h);
    lines.forEach(function (ln, i) { RPG.text(ln, 14, RPG.H - h + 2 + i * 14, { size: 10 }); });
  }
  function money(n) { return RPG.t('ui.money', { n: n }); }
  function pickMember(title, filter) {
    var party = RPG.party(), idx = 0;
    return RPG.ui.push({
      update: function () {
        if (RPG.input.take('down', true)) { idx = (idx + 1) % party.length; RPG.sfx('cursor'); }
        if (RPG.input.take('up', true)) { idx = (idx + party.length - 1) % party.length; RPG.sfx('cursor'); }
        if (RPG.input.take('ok')) { if (filter && !filter(party[idx])) RPG.sfx('buzz'); else { RPG.sfx('ok'); this.close(party[idx]); } }
        if (RPG.input.take('cancel')) { RPG.sfx('back'); this.close(null); }
      },
      draw: function () {
        RPG.box(6, 6, 84, 34);
        RPG.wrap(title, 72, 10).slice(0, 2).forEach(function (ln, i) { RPG.text(ln, 48, 11 + i * 12, { size: 10, align: 'center', color: '#ffd860' }); });
        partyPanel(94, 6, idx);
        RPG.cursor(84, 6 + idx * rowH() + rowH() / 2 - 6);
      }
    });
  }
  RPG.pickMember = pickMember;

  var MENU = ['items', 'skills', 'equip', 'status', 'formation', 'settings', 'save', 'close'];

  // change the party order: pick one member, then the one to swap with. The first MAX_ACTIVE fight.
  async function formationMenu() {
    var idx = 0, marked = -1;
    await RPG.ui.push({
      update: function () {
        var n = RPG.state.party.length;
        if (RPG.input.take('down', true)) { idx = (idx + 1) % n; RPG.sfx('cursor'); }
        if (RPG.input.take('up', true)) { idx = (idx + n - 1) % n; RPG.sfx('cursor'); }
        if (RPG.input.take('ok')) {
          if (marked < 0) { marked = idx; RPG.sfx('ok'); }
          else {
            var p = RPG.state.party, t = p[marked]; p[marked] = p[idx]; p[idx] = t; marked = -1; RPG.sfx('item');
          }
        }
        if (RPG.input.take('cancel')) { if (marked >= 0) { marked = -1; RPG.sfx('back'); } else { RPG.sfx('back'); this.close(); } }
      },
      draw: function () {
        RPG.box(6, 6, 84, 74);
        RPG.wrap(RPG.t(marked < 0 ? 'ui.formationPick' : 'ui.formationSwap'), 70, 9).slice(0, 5).forEach(function (ln, k) { RPG.text(ln, 48, 12 + k * 12, { size: 9, align: 'center', color: '#ffd860' }); });
        RPG.box(6, 84, 84, 40);
        RPG.wrap(RPG.t('ui.formationHint', { n: RPG.MAX_ACTIVE }), 72, 8).slice(0, 3).forEach(function (ln, k) { RPG.text(ln, 48, 90 + k * 10, { size: 8, align: 'center', color: '#c8d0e8' }); });
        partyPanel(94, 6, idx, marked);
        RPG.cursor(84, 6 + idx * rowH() + rowH() / 2 - 6);
      }
    });
  }

  RPG.openMenu = async function () {
    RPG.sfx('ok');
    for (;;) {
      var i = await RPG.ui.menu({
        items: MENU.map(function (k) { return { label: RPG.t('ui.' + k) }; }),
        x: 6, y: 6, w: 84, rows: MENU.length,
        drawExtra: function () {
          partyPanel(94, 6);
          RPG.box(6, 146, 84, 40);
          RPG.text(RPG.t('ui.gold'), 14, 152, { size: 9, color: '#a0b0d0' });
          RPG.text(money(RPG.state.gold), 82, 166, { size: 11, align: 'right', color: '#ffd860' });
          if (RPG.state.chapter) { RPG.box(6, 190, 84, 40); RPG.wrap(RPG.t('chapter.' + RPG.state.chapter + '.short'), 70, 9).slice(0, 2).forEach(function (ln, k) { RPG.text(ln, 48, 197 + k * 12, { size: 9, align: 'center', color: '#ffe0f0' }); }); }
        }
      });
      var cmd = MENU[i];
      if (i < 0 || cmd === 'close') return;
      if (cmd === 'items') await itemMenu();
      if (cmd === 'skills') await skillMenu();
      if (cmd === 'equip') await equipMenu();
      if (cmd === 'status') await statusMenu();
      if (cmd === 'formation') await formationMenu();
      if (cmd === 'settings') await RPG.openSettings();
      if (cmd === 'save') { var slot = await RPG.pickSlot(RPG.t('ui.saveWhich')); if (slot > 0) { RPG.save(slot); RPG.sfx('item'); RPG.ui.toast(RPG.t('ui.saved', { n: slot })); } }
    }
  };

  // use an item or skill outside battle on chosen members
  async function useOnField(kind, source, user) {
    var mode = source.target || 'ally', targets;
    if (mode === 'allies') targets = RPG.party();
    else if (mode === 'self') targets = [user];
    else {
      var m = await pickMember(RPG.name(kind, source.id), function (t) { return mode === 'deadAlly' ? t.hp <= 0 : t.hp > 0; });
      if (!m) return false;
      targets = [m];
    }
    RPG.applyEffects(source, user || targets[0], targets, null, function (t, text, color) { RPG.ui.toast(RPG.nameOf(t) + '  ' + text, color); });
    return true;
  }

  async function itemMenu() {
    for (;;) {
      var ids = Object.keys(RPG.state.inventory);
      var i = await RPG.ui.menu({
        title: RPG.t('ui.items'), x: 6, y: 6, w: RPG.W - 12, rows: 9, empty: RPG.t('ui.bagEmpty'),
        items: ids.map(function (id) { var it = RPG.db.items[id]; return { label: RPG.name('items', id), right: '×' + RPG.itemCount(id), color: it.type === 'key' ? '#ffd860' : it.type !== 'consumable' ? '#a0d8ff' : null }; }),
        drawExtra: function (k) { if (ids[k]) descBox(RPG.desc('items', ids[k])); }
      });
      if (i < 0) return;
      var it = RPG.db.items[ids[i]];
      if (it.type !== 'consumable' || it.field === false) { RPG.sfx('buzz'); continue; }
      if (await useOnField('items', it)) { RPG.addItem(it.id, -1); RPG.sfx('heal'); }
    }
  }

  async function skillMenu() {
    var m = await pickMember(RPG.t('ui.whoseSkills'));
    if (!m) return;
    for (;;) {
      var list = m.skills.map(function (id) { return RPG.get('skills', id); });
      var i = await RPG.ui.menu({
        title: RPG.t('ui.skillsOf', { name: RPG.nameOf(m) }), x: 6, y: 6, w: RPG.W - 12, rows: 9,
        items: list.map(function (s) { return { label: RPG.name('skills', s.id), right: s.mp ? s.mp + ' MP' : '', disabled: !s.field || m.mp < (s.mp || 0) }; }),
        drawExtra: function (k) { if (list[k]) descBox(RPG.desc('skills', list[k].id) + (list[k].field ? '' : RPG.t('ui.battleOnly'))); }
      });
      if (i < 0) return;
      var sk = list[i];
      if (await useOnField('skills', sk, m)) { m.mp -= sk.mp || 0; RPG.sfx('heal'); }
    }
  }

  async function equipMenu() {
    var m = await pickMember(RPG.t('ui.whoEquip'));
    if (!m) return;
    for (;;) {
      var s = await RPG.ui.menu({
        title: RPG.t('ui.equipOf', { name: RPG.nameOf(m) }), x: 6, y: 6, w: 200, rows: 3,
        items: RPG.SLOTS.map(function (slot) { var it = m.equip[slot]; return { label: RPG.slotName(slot) + ': ' + (it ? RPG.name('items', it) : RPG.t('ui.none')) }; }),
        drawExtra: function () { statBox(m, null); }
      });
      if (s < 0) return;
      var slot = RPG.SLOTS[s];
      var ids = Object.keys(RPG.state.inventory).filter(function (id) { var it = RPG.db.items[id]; return it.type === slot && RPG.canEquip(m, id); });
      var opts = [null].concat(ids);
      var k = await RPG.ui.menu({
        title: RPG.slotName(slot), x: 6, y: 80, w: 200, rows: 6,
        items: opts.map(function (id) { return id ? { label: RPG.name('items', id), right: '×' + RPG.itemCount(id) } : { label: RPG.t('ui.unequip') }; }),
        drawExtra: function (j) { statBox(m, { slot: slot, item: opts[j] }); if (opts[j]) descBox(RPG.desc('items', opts[j])); }
      });
      if (k < 0) continue;
      RPG.equip(m, slot, opts[k]);
      RPG.sfx('item');
    }
  }
  function statBox(m, change) {
    var now = RPG.stats(m), after = now;
    if (change) { var copy = JSON.parse(JSON.stringify(m)); copy.equip[change.slot] = change.item; after = RPG.stats(copy); }
    RPG.box(210, 6, 104, 118);
    ['atk', 'def', 'mag', 'spd', 'luck', 'maxHp', 'maxMp'].forEach(function (k, i) {
      var y = 12 + i * 15, d = after[k] - now[k];
      RPG.text(RPG.statName(k), 218, y, { size: 10, color: '#a0b0d0' });
      RPG.text(String(after[k]), 284, y, { size: 10, align: 'right', color: d > 0 ? '#80ff9a' : d < 0 ? '#ff8080' : '#f4f0e8' });
      if (d) RPG.text((d > 0 ? '+' : '') + d, 308, y, { size: 9, align: 'right', color: d > 0 ? '#80ff9a' : '#ff8080' });
    });
  }

  async function statusMenu() {
    var m = await pickMember(RPG.t('ui.whoStatus'));
    if (!m) return;
    var c = RPG.get('characters', m.id), st = RPG.stats(m);
    await RPG.ui.push({
      update: function () { if (RPG.input.take('ok') || RPG.input.take('cancel')) this.close(); },
      draw: function () {
        RPG.box(6, 6, RPG.W - 12, RPG.H - 12);
        RPG.drawSprite(c.sprite, 16, 14, { pose: 'down', palette: c.palette, scale: 3 });
        RPG.text(RPG.nameOf(m), 72, 16, { size: 14, bold: true, color: '#ffd860' });
        RPG.text(RPG.textOf('characters', m.id, 'title'), 72, 34, { size: 10, color: '#c8d0e8' });
        RPG.text(RPG.t('ui.expLine', { level: m.level, exp: m.exp, next: Math.max(0, RPG.expFor(m.level + 1) - m.exp) }), 72, 50, { size: 10 });
        RPG.STATS.forEach(function (k, i) {
          var v = k === 'maxHp' ? m.hp + '/' + st.maxHp : k === 'maxMp' ? m.mp + '/' + st.maxMp : st[k];
          RPG.text(RPG.statName(k), 20, 74 + i * 16, { size: 10, color: '#a0b0d0' });
          RPG.text(String(v), 120, 74 + i * 16, { size: 10, align: 'right' });
        });
        RPG.SLOTS.forEach(function (s, i) {
          var it = m.equip[s];
          RPG.text(RPG.slotName(s) + ': ' + (it ? RPG.name('items', it) : RPG.t('ui.none')), 140, 74 + i * 16, { size: 10 });
        });
        var skills = RPG.t('ui.skills') + ': ' + m.skills.map(function (id) { return RPG.name('skills', id); }).join(RPG.t('ui.listSep'));
        RPG.wrap(skills, RPG.W - 160, 10).slice(0, 4).forEach(function (ln, i) { RPG.text(ln, 140, 126 + i * 14, { size: 10 }); });
        RPG.wrap(RPG.textOf('characters', m.id, 'bio'), RPG.W - 50, 10).forEach(function (ln, i) { RPG.text(ln, 20, 190 + i * 14, { size: 10, color: '#c8d0e8' }); });
      }
    });
  }

  // ======================= shops =======================
  RPG.openShop = async function (id) {
    var shop = RPG.get('shops', id), keeper = shop.keeper ? RPG.speaker(shop.keeper) : null;
    if (RPG.hasText('shop.' + id + '.greeting')) await RPG.ui.say(RPG.t('shop.' + id + '.greeting'), keeper);
    for (;;) {
      var i = await RPG.ui.menu({ items: [{ label: RPG.t('ui.buy') }, { label: RPG.t('ui.sell') }, { label: RPG.t('ui.leave') }], x: 6, y: 6, w: 84, rows: 3,
                                  drawExtra: function () { goldBox(); } });
      if (i < 0 || i === 2) break;
      if (i === 0) await buy(shop);
      if (i === 1) await sell(shop);
    }
    if (RPG.hasText('shop.' + id + '.bye')) await RPG.ui.say(RPG.t('shop.' + id + '.bye'), keeper);
  };
  function goldBox() { RPG.box(RPG.W - 100, 6, 94, 24); RPG.text(money(RPG.state.gold), RPG.W - 14, 12, { size: 11, align: 'right', color: '#ffd860' }); }
  function whoCanUse(id) {
    var it = RPG.db.items[id];
    if (RPG.SLOTS.indexOf(it.type) < 0) return '';
    return RPG.party().map(function (m) {
      if (!RPG.canEquip(m, id)) return RPG.nameOf(m) + ' ✕';
      var now = RPG.stats(m), copy = JSON.parse(JSON.stringify(m)); copy.equip[it.type] = id;
      var after = RPG.stats(copy), keys = Object.keys(it.stats || {});
      return RPG.nameOf(m) + ' ' + keys.map(function (k) { var d = after[k] - now[k]; return RPG.statName(k) + (d >= 0 ? '+' : '') + d; }).join(' ');
    }).join('  ');
  }
  async function buy(shop) {
    var idx = 0;
    for (;;) {
      var list = shop.items;
      var i = await RPG.ui.menu({
        title: RPG.name('shops', shop.id), x: 6, y: 34, w: 200, rows: 7, index: idx,
        items: list.map(function (id) { var it = RPG.get('items', id); return { label: RPG.name('items', id), right: money(it.price), disabled: RPG.state.gold < it.price }; }),
        drawExtra: function (k) {
          goldBox();
          var id = list[k]; if (!id) return;
          RPG.box(210, 34, 104, 30); RPG.text(RPG.t('ui.owned', { n: RPG.itemCount(id) }), 218, 42, { size: 10 });
          descBox(RPG.desc('items', id) + '  ' + whoCanUse(id));
        }
      });
      if (i < 0) return;
      idx = i;
      var it = RPG.get('items', list[i]);
      RPG.state.gold -= it.price; RPG.addItem(it.id, 1); RPG.sfx('item');
      RPG.ui.toast(RPG.t('ui.bought', { item: RPG.name('items', it.id) }));
    }
  }
  async function sell(shop) {
    for (;;) {
      var ids = Object.keys(RPG.state.inventory).filter(function (id) { var it = RPG.db.items[id]; return it.price && it.type !== 'key'; });
      var rate = shop.sellRate || 0.5;
      var i = await RPG.ui.menu({
        title: RPG.t('ui.sell'), x: 6, y: 34, w: 200, rows: 7, empty: RPG.t('ui.nothingToSell'),
        items: ids.map(function (id) { var it = RPG.db.items[id]; return { label: RPG.name('items', id) + ' ×' + RPG.itemCount(id), right: money(Math.floor(it.price * rate)) }; }),
        drawExtra: function (k) { goldBox(); if (ids[k]) descBox(RPG.desc('items', ids[k])); }
      });
      if (i < 0) return;
      var it = RPG.db.items[ids[i]];
      RPG.addItem(it.id, -1); RPG.state.gold += Math.floor(it.price * rate); RPG.sfx('item');
    }
  }
})();
