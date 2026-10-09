/*
 * Items.
 *   type:  'consumable' | 'weapon' | 'armor' | 'accessory' | 'key'
 *   price: shop price (selling gives half)
 *   consumables: target + effects, exactly like skills (see skills.js); battle: false / field: false to limit where they work
 *   equipment:   stats: { atk: 3, def: 1, ... } (any of maxHp maxMp atk def mag spd luck)
 *                equipBy: ['josh', 'jasper'] — who can wear it (everyone if left out)
 *                element / anim on weapons change the normal attack
 */
(function () {
  'use strict';

  RPG.add('items', {
    // ---- snacks and stuff ----
    cookie:      { name: '巧克力餅乾', type: 'consumable', price: 12, desc: '回復 40 HP。媽媽烤的最好吃。', target: 'ally', effects: [{ type: 'heal', amount: 40 }] },
    juice:       { name: '能量果汁', type: 'consumable', price: 35, desc: '回復 110 HP。', target: 'ally', effects: [{ type: 'heal', amount: 110 }] },
    bento:       { name: '媽媽便當', type: 'consumable', price: 120, desc: '全隊回復 160 HP。', target: 'allies', effects: [{ type: 'heal', amount: 160 }] },
    milk:        { name: '草莓牛奶', type: 'consumable', price: 30, desc: '回復 20 MP。', target: 'ally', effects: [{ type: 'mp', amount: 20 }] },
    bandaid:     { name: 'OK 繃', type: 'consumable', price: 10, desc: '治好黏答答和想哭。', target: 'ally', effects: [{ type: 'cure', status: ['sticky', 'sad'] }] },
    sticker:     { name: '金色貼紙', type: 'consumable', price: 90, desc: '老師的金色貼紙！讓倒下的隊友復活。', target: 'deadAlly', effects: [{ type: 'revive', percent: 0.5 }] },
    waterBalloon:{ name: '水球', type: 'consumable', price: 18, desc: '丟向一個敵人（水屬性 35 傷害）。', target: 'enemy', field: false, anim: 'water', effects: [{ type: 'damage', kind: 'fixed', amount: 35, element: 'water' }] },
    popRocks:    { name: '跳跳糖', type: 'consumable', price: 40, desc: '吃了全身起勁：攻擊和速度上升。', target: 'ally', field: false, anim: 'shine', effects: [{ type: 'status', status: 'pumped' }] },
    whoopee:     { name: '放屁坐墊', type: 'consumable', price: 25, desc: '噗～趁大家笑翻的時候逃走。', target: 'self', field: false, anim: 'bark', effects: [{ type: 'escape' }] },

    // ---- weapons ----
    ruler:       { name: '塑膠尺', type: 'weapon', price: 20, desc: '攻擊 +3', stats: { atk: 3 }, equipBy: ['josh', 'jasper'] },
    stick:       { name: '好看的樹枝', type: 'weapon', price: 45, desc: '每個小孩都想要的樹枝。攻擊 +6', stats: { atk: 6 }, equipBy: ['josh', 'jasper'] },
    waterGun:    { name: '水槍', type: 'weapon', price: 90, desc: '攻擊 +5、魔力 +4，普通攻擊變成水屬性。', stats: { atk: 5, mag: 4 }, element: 'water', anim: 'water', equipBy: ['josh', 'jasper'] },
    bat:         { name: '少棒球棒', type: 'weapon', price: 160, desc: '攻擊 +12', stats: { atk: 12 }, equipBy: ['josh'] },
    magicPencil: { name: '魔法鉛筆', type: 'weapon', price: 150, desc: '寫什麼都會成真的鉛筆？魔力 +10', stats: { mag: 10, atk: 2 }, equipBy: ['jasper'] },
    chewToy:     { name: '磨牙骨頭', type: 'weapon', price: 70, desc: '麻糬專用。攻擊 +7', stats: { atk: 7 }, equipBy: ['mochi'] },

    // ---- clothes ----
    jacket:      { name: '外套', type: 'armor', price: 25, desc: '防禦 +3', stats: { def: 3 } },
    hoodie:      { name: '帽T', type: 'armor', price: 70, desc: '防禦 +6', stats: { def: 6 }, equipBy: ['josh', 'jasper'] },
    raincoat:    { name: '小雨衣', type: 'armor', price: 85, desc: '防禦 +5、魔力 +3', stats: { def: 5, mag: 3 }, equipBy: ['josh', 'jasper'] },
    uniform:     { name: '運動會隊服', type: 'armor', price: 180, desc: '防禦 +10、速度 +3', stats: { def: 10, spd: 3 }, equipBy: ['josh', 'jasper'] },
    dogVest:     { name: '狗狗背心', type: 'armor', price: 60, desc: '麻糬專用。防禦 +6', stats: { def: 6 }, equipBy: ['mochi'] },

    // ---- accessories ----
    eraser:      { name: '幸運橡皮擦', type: 'accessory', price: 50, desc: '幸運 +6', stats: { luck: 6 } },
    sneakers:    { name: '閃電運動鞋', type: 'accessory', price: 90, desc: '速度 +6', stats: { spd: 6 }, equipBy: ['josh', 'jasper'] },
    bell:        { name: '鈴鐺項圈', type: 'accessory', price: 60, desc: '麻糬專用。速度 +4、幸運 +4', stats: { spd: 4, luck: 4 }, equipBy: ['mochi'] },
    coyoteBadge: { name: '郊狼徽章', type: 'accessory', price: 0, desc: 'GO COYOTES！全能力 +3', stats: { atk: 3, def: 3, mag: 3, spd: 3, luck: 3, maxHp: 10 } },

    // ---- story ----
    trophy:      { name: '郊狼獎盃', type: 'key', price: 0, desc: 'Sage Canyon 運動會的冠軍獎盃。' },
    fur:         { name: '灰色的毛', type: 'key', price: 0, desc: '從機器人身上找到的。好像是……浣熊的毛？' }
  });
})();
