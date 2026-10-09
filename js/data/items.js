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
    cookie:      { type: 'consumable', price: 12, target: 'ally', effects: [{ type: 'heal', amount: 40 }] },
    juice:       { type: 'consumable', price: 35, target: 'ally', effects: [{ type: 'heal', amount: 110 }] },
    bento:       { type: 'consumable', price: 120, target: 'allies', effects: [{ type: 'heal', amount: 160 }] },
    milk:        { type: 'consumable', price: 30, target: 'ally', effects: [{ type: 'mp', amount: 20 }] },
    bandaid:     { type: 'consumable', price: 10, target: 'ally', effects: [{ type: 'cure', status: ['sticky', 'sad'] }] },
    sticker:     { type: 'consumable', price: 90, target: 'deadAlly', effects: [{ type: 'revive', percent: 0.5 }] },
    waterBalloon:{ type: 'consumable', price: 18, target: 'enemy', field: false, anim: 'water', effects: [{ type: 'damage', kind: 'fixed', amount: 35, element: 'water' }] },
    popRocks:    { type: 'consumable', price: 40, target: 'ally', field: false, anim: 'shine', effects: [{ type: 'status', status: 'pumped' }] },
    whoopee:     { type: 'consumable', price: 25, target: 'self', field: false, anim: 'bark', effects: [{ type: 'escape' }] },

    // ---- weapons ----
    ruler:       { type: 'weapon', price: 20, stats: { atk: 3 }, equipBy: ['josh', 'jasper'] },
    stick:       { type: 'weapon', price: 45, stats: { atk: 6 }, equipBy: ['josh', 'jasper'] },
    waterGun:    { type: 'weapon', price: 90, stats: { atk: 5, mag: 4 }, element: 'water', anim: 'water', equipBy: ['josh', 'jasper'] },
    bat:         { type: 'weapon', price: 160, stats: { atk: 12 }, equipBy: ['josh'] },
    magicPencil: { type: 'weapon', price: 150, stats: { mag: 10, atk: 2 }, equipBy: ['jasper'] },
    chewToy:     { type: 'weapon', price: 70, stats: { atk: 7 }, equipBy: ['mochi'] },

    // ---- clothes ----
    jacket:      { type: 'armor', price: 25, stats: { def: 3 } },
    hoodie:      { type: 'armor', price: 70, stats: { def: 6 }, equipBy: ['josh', 'jasper'] },
    raincoat:    { type: 'armor', price: 85, stats: { def: 5, mag: 3 }, equipBy: ['josh', 'jasper'] },
    uniform:     { type: 'armor', price: 180, stats: { def: 10, spd: 3 }, equipBy: ['josh', 'jasper'] },
    dogVest:     { type: 'armor', price: 60, stats: { def: 6 }, equipBy: ['mochi'] },

    // ---- accessories ----
    eraser:      { type: 'accessory', price: 50, stats: { luck: 6 } },
    sneakers:    { type: 'accessory', price: 90, stats: { spd: 6 }, equipBy: ['josh', 'jasper'] },
    bell:        { type: 'accessory', price: 60, stats: { spd: 4, luck: 4 }, equipBy: ['mochi'] },
    coyoteBadge: { type: 'accessory', price: 0, stats: { atk: 3, def: 3, mag: 3, spd: 3, luck: 3, maxHp: 10 } },

    // ---- story ----
    trophy:      { type: 'key', price: 0 },
    fur:         { type: 'key', price: 0 }
  });
})();
