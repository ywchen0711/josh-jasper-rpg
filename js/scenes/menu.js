/*
 * The field menu (C / Tab on the map): items, skills, equipment, status, save. And shops.
 */
(function () {
  'use strict';
  var g = RPG.g;

  function partyPanel(x, y, highlight) {
    RPG.party().forEach(function (m, i) {
      var c = RPG.get('characters', m.id), st = RPG.stats(m), yy = y + i * 46;
      RPG.box(x, yy, 220, 42, { fill: highlight === i ? 'rgba(42,80,150,0.96)' : undefined });
      RPG.drawSprite(c.sprite, x + 8, yy + 13, { pose: 'down', palette: c.palette });
      RPG.text(c.name, x + 30, yy + 6, { size: 11, bold: true });
      RPG.text('Lv ' + m.level, x + 30, yy + 22, { size: 10, color: '#c8d0e8' });
      RPG.text('HP', x + 82, yy + 6, { size: 9, color: '#a0b0d0' }); RPG.bar(x + 98, yy + 10, 80, 4, m.hp / st.maxHp, '#60e080');
      RPG.text(m.hp + '/' + st.maxHp, x + 212, yy + 5, { size: 9, align: 'right' });
      RPG.text('MP', x + 82, yy + 22, { size: 9, color: '#a0b0d0' }); RPG.bar(x + 98, yy + 26, 80, 4, st.maxMp ? m.mp / st.maxMp : 0, '#60a0ff');
      RPG.text(m.mp + '/' + st.maxMp, x + 212, yy + 21, { size: 9, align: 'right' });
      if ((m.status || []).length) RPG.text(m.status.map(function (s) { return RPG.db.statuses[s.id].short; }).join(''), x + 56, yy + 22, { size: 9, color: '#e0a0ff' });
    });
  }
  function descBox(text) { RPG.box(6, RPG.H - 34, RPG.W - 12, 28); RPG.text(text || '', 14, RPG.H - 26, { size: 10 }); }
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
        RPG.box(6, 6, 84, 22); RPG.text(title, 48, 11, { size: 10, align: 'center', color: '#ffd860' });
        partyPanel(94, 6, idx);
        RPG.cursor(86, 22 + idx * 46);
      }
    });
  }
  RPG.pickMember = pickMember;

  RPG.openMenu = async function () {
    RPG.sfx('ok');
    for (;;) {
      var i = await RPG.ui.menu({
        items: [{ label: '道具' }, { label: '技能' }, { label: '裝備' }, { label: '狀態' }, { label: '存檔' }, { label: '關閉' }],
        x: 6, y: 6, w: 84, rows: 6,
        drawExtra: function () {
          partyPanel(94, 6);
          RPG.box(6, 112, 84, 40);
          RPG.text('金錢', 14, 118, { size: 9, color: '#a0b0d0' });
          RPG.text(RPG.state.gold + ' 元', 82, 132, { size: 11, align: 'right', color: '#ffd860' });
        }
      });
      if (i < 0 || i === 5) return;
      if (i === 0) await itemMenu();
      if (i === 1) await skillMenu();
      if (i === 2) await equipMenu();
      if (i === 3) await statusMenu();
      if (i === 4) { var slot = await RPG.pickSlot('存到哪一個存檔？'); if (slot > 0) { RPG.save(slot); RPG.sfx('item'); RPG.ui.toast('已存檔到 ' + slot); } }
    }
  };

  // use an item or skill outside battle on chosen members
  async function useOnField(source, user) {
    var mode = source.target || 'ally', targets;
    if (mode === 'allies') targets = RPG.party();
    else if (mode === 'self') targets = [user];
    else {
      var m = await pickMember(source.name, function (t) { return mode === 'deadAlly' ? t.hp <= 0 : t.hp > 0; });
      if (!m) return false;
      targets = [m];
    }
    RPG.applyEffects(source, user || targets[0], targets, null, function (t, text, color) { RPG.ui.toast(RPG.nameOf(t) + '　' + text, color); });
    return true;
  }

  async function itemMenu() {
    for (;;) {
      var ids = Object.keys(RPG.state.inventory);
      var i = await RPG.ui.menu({
        title: '道具', x: 6, y: 6, w: RPG.W - 12, rows: 9, empty: '（背包是空的）',
        items: ids.map(function (id) { var it = RPG.db.items[id]; return { label: it.name, right: '×' + RPG.itemCount(id), color: it.type === 'key' ? '#ffd860' : it.type !== 'consumable' ? '#a0d8ff' : null }; }),
        drawExtra: function (k) { if (ids[k]) descBox(RPG.db.items[ids[k]].desc); }
      });
      if (i < 0) return;
      var it = RPG.db.items[ids[i]];
      if (it.type !== 'consumable' || it.field === false) { RPG.sfx('buzz'); continue; }
      if (await useOnField(it)) { RPG.addItem(it.id, -1); RPG.sfx('heal'); }
    }
  }

  async function skillMenu() {
    var m = await pickMember('誰的技能？');
    if (!m) return;
    for (;;) {
      var list = m.skills.map(function (id) { return RPG.get('skills', id); });
      var i = await RPG.ui.menu({
        title: RPG.nameOf(m) + ' 的技能', x: 6, y: 6, w: RPG.W - 12, rows: 9,
        items: list.map(function (s) { return { label: s.name, right: s.mp ? s.mp + ' MP' : '', disabled: !s.field || m.mp < (s.mp || 0) }; }),
        drawExtra: function (k) { if (list[k]) descBox(list[k].desc + (list[k].field ? '' : '（戰鬥中使用）')); }
      });
      if (i < 0) return;
      var sk = list[i];
      if (await useOnField(sk, m)) { m.mp -= sk.mp || 0; RPG.sfx('heal'); }
    }
  }

  async function equipMenu() {
    var m = await pickMember('幫誰換裝備？');
    if (!m) return;
    for (;;) {
      var s = await RPG.ui.menu({
        title: RPG.nameOf(m) + ' 的裝備', x: 6, y: 6, w: 200, rows: 3,
        items: RPG.SLOTS.map(function (slot) { var it = m.equip[slot] && RPG.db.items[m.equip[slot]]; return { label: RPG.SLOT_NAMES[slot] + '：' + (it ? it.name : '（無）') }; }),
        drawExtra: function () { statBox(m, null); }
      });
      if (s < 0) return;
      var slot = RPG.SLOTS[s];
      var ids = Object.keys(RPG.state.inventory).filter(function (id) { var it = RPG.db.items[id]; return it.type === slot && RPG.canEquip(m, id); });
      var opts = [null].concat(ids);
      var k = await RPG.ui.menu({
        title: RPG.SLOT_NAMES[slot], x: 6, y: 80, w: 200, rows: 6,
        items: opts.map(function (id) { return id ? { label: RPG.db.items[id].name, right: '×' + RPG.itemCount(id) } : { label: '（卸下）' }; }),
        drawExtra: function (j) { statBox(m, { slot: slot, item: opts[j] }); if (opts[j]) descBox(RPG.db.items[opts[j]].desc); }
      });
      if (k < 0) continue;
      RPG.equip(m, slot, opts[k]);
      RPG.sfx('item');
    }
  }
  // stats now vs. after a change
  function statBox(m, change) {
    var now = RPG.stats(m), after = now;
    if (change) {
      var copy = JSON.parse(JSON.stringify(m)); copy.equip[change.slot] = change.item; after = RPG.stats(copy);
    }
    RPG.box(210, 6, 104, 118);
    ['atk', 'def', 'mag', 'spd', 'luck', 'maxHp', 'maxMp'].forEach(function (k, i) {
      var y = 12 + i * 15, d = after[k] - now[k];
      RPG.text(RPG.STAT_NAMES[k], 218, y, { size: 10, color: '#a0b0d0' });
      RPG.text(String(after[k]), 284, y, { size: 10, align: 'right', color: d > 0 ? '#80ff9a' : d < 0 ? '#ff8080' : '#f4f0e8' });
      if (d) RPG.text((d > 0 ? '+' : '') + d, 308, y, { size: 9, align: 'right', color: d > 0 ? '#80ff9a' : '#ff8080' });
    });
  }

  async function statusMenu() {
    var m = await pickMember('看誰的狀態？');
    if (!m) return;
    var c = RPG.get('characters', m.id), st = RPG.stats(m);
    await RPG.ui.push({
      update: function () { if (RPG.input.take('ok') || RPG.input.take('cancel')) this.close(); },
      draw: function () {
        RPG.box(6, 6, RPG.W - 12, RPG.H - 12);
        RPG.drawSprite(c.sprite, 16, 16, { pose: 'down', palette: c.palette, scale: 3 });
        RPG.text(c.name, 72, 16, { size: 14, bold: true, color: '#ffd860' });
        RPG.text(c.title || '', 72, 34, { size: 10, color: '#c8d0e8' });
        RPG.text('Lv ' + m.level + '　經驗值 ' + m.exp + '　下一級還要 ' + Math.max(0, RPG.expFor(m.level + 1) - m.exp), 72, 50, { size: 10 });
        RPG.STATS.forEach(function (k, i) {
          var v = k === 'maxHp' ? m.hp + '/' + st.maxHp : k === 'maxMp' ? m.mp + '/' + st.maxMp : st[k];
          RPG.text(RPG.STAT_NAMES[k], 20, 74 + i * 16, { size: 10, color: '#a0b0d0' });
          RPG.text(String(v), 120, 74 + i * 16, { size: 10, align: 'right' });
        });
        RPG.SLOTS.forEach(function (s, i) {
          var it = m.equip[s] && RPG.db.items[m.equip[s]];
          RPG.text(RPG.SLOT_NAMES[s] + '：' + (it ? it.name : '（無）'), 140, 74 + i * 16, { size: 10 });
        });
        RPG.text('技能：' + m.skills.map(function (id) { return RPG.get('skills', id).name; }).join('、'), 140, 126, { size: 10 });
        RPG.wrap(c.bio || '', RPG.W - 50, 10).forEach(function (ln, i) { RPG.text(ln, 20, 190 + i * 14, { size: 10, color: '#c8d0e8' }); });
      }
    });
  }

  // ======================= shops =======================
  RPG.openShop = async function (id) {
    var shop = RPG.get('shops', id);
    if (shop.greeting) await RPG.ui.say(shop.greeting, shop.keeper);
    for (;;) {
      var i = await RPG.ui.menu({ items: [{ label: '買東西' }, { label: '賣東西' }, { label: '離開' }], x: 6, y: 6, w: 84, rows: 3,
                                  drawExtra: function () { goldBox(); } });
      if (i < 0 || i === 2) break;
      if (i === 0) await buy(shop);
      if (i === 1) await sell(shop);
    }
    if (shop.bye) await RPG.ui.say(shop.bye, shop.keeper);
  };
  function goldBox() { RPG.box(RPG.W - 100, 6, 94, 24); RPG.text(RPG.state.gold + ' 元', RPG.W - 14, 12, { size: 11, align: 'right', color: '#ffd860' }); }
  function whoCanUse(id) {
    var it = RPG.db.items[id];
    if (RPG.SLOTS.indexOf(it.type) < 0) return '';
    return RPG.party().map(function (m) {
      if (!RPG.canEquip(m, id)) return RPG.nameOf(m) + ' ✕';
      var now = RPG.stats(m), copy = JSON.parse(JSON.stringify(m)); copy.equip[it.type] = id;
      var after = RPG.stats(copy), keys = Object.keys(it.stats || {});
      return RPG.nameOf(m) + ' ' + keys.map(function (k) { var d = after[k] - now[k]; return RPG.STAT_NAMES[k] + (d >= 0 ? '+' : '') + d; }).join(' ');
    }).join('　');
  }
  async function buy(shop) {
    var idx = 0;
    for (;;) {
      var list = shop.items;
      var i = await RPG.ui.menu({
        title: shop.name, x: 6, y: 34, w: 200, rows: 8, index: idx,
        items: list.map(function (id) { var it = RPG.get('items', id); return { label: it.name, right: it.price + ' 元', disabled: RPG.state.gold < it.price }; }),
        drawExtra: function (k) {
          goldBox();
          var id = list[k]; if (!id) return;
          RPG.box(210, 34, 104, 30); RPG.text('持有 ' + RPG.itemCount(id), 218, 42, { size: 10 });
          descBox(RPG.db.items[id].desc + '　' + whoCanUse(id));
        }
      });
      if (i < 0) return;
      idx = i;
      var it = RPG.get('items', list[i]);
      RPG.state.gold -= it.price; RPG.addItem(it.id, 1); RPG.sfx('item');
      RPG.ui.toast('買了「' + it.name + '」');
    }
  }
  async function sell(shop) {
    for (;;) {
      var ids = Object.keys(RPG.state.inventory).filter(function (id) { var it = RPG.db.items[id]; return it.price && it.type !== 'key'; });
      var rate = shop.sellRate || 0.5;
      var i = await RPG.ui.menu({
        title: '賣東西', x: 6, y: 34, w: 200, rows: 8, empty: '（沒有能賣的東西）',
        items: ids.map(function (id) { var it = RPG.db.items[id]; return { label: it.name + ' ×' + RPG.itemCount(id), right: Math.floor(it.price * rate) + ' 元' }; }),
        drawExtra: function (k) { goldBox(); if (ids[k]) descBox(RPG.db.items[ids[k]].desc); }
      });
      if (i < 0) return;
      var it = RPG.db.items[ids[i]];
      RPG.addItem(it.id, -1); RPG.state.gold += Math.floor(it.price * rate); RPG.sfx('item');
    }
  }
})();
