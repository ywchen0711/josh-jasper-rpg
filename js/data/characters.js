/*
 * Playable characters.
 *   sprite / palette  — walking sprite from sprites.js (palette overrides colors)
 *   base, growth      — stats at level 1, and how much each stat grows per level
 *   learn             — { level: [skill ids] }
 *   equip             — starting equipment { weapon, armor, accessory }
 *   level             — starting level when they join (default 1)
 * Add someone: give them an entry here and a sprite, then { join: 'id' } in a script.
 */
(function () {
  'use strict';

  RPG.add('characters', {
    josh: {
      name: 'Josh', title: '哥哥・運動健將', sprite: 'josh',
      bio: '踢足球、跑步樣樣行，衝第一個保護弟弟。口頭禪是「交給我！」',
      base:   { maxHp: 52, maxMp: 10, atk: 13, def: 8, mag: 4, spd: 8, luck: 6 },
      growth: { maxHp: 9.5, maxMp: 2, atk: 2.6, def: 1.8, mag: 0.8, spd: 1.2, luck: 0.8 },
      learn: { 1: ['tackle'], 3: ['cheer'], 5: ['soccerKick'], 8: ['dodgeball'], 12: ['braveHeart'] },
      equip: { weapon: 'ruler', armor: 'jacket' }
    },
    jasper: {
      name: 'Jasper', title: '弟弟・點子王', sprite: 'jasper',
      bio: '缺了一顆門牙還是笑最大聲。腦袋裡塞滿了科學實驗和奇怪的點子。',
      base:   { maxHp: 42, maxMp: 18, atk: 8, def: 6, mag: 12, spd: 9, luck: 9 },
      growth: { maxHp: 7.5, maxMp: 4, atk: 1.6, def: 1.3, mag: 2.6, spd: 1.4, luck: 1 },
      learn: { 1: ['paperPlane', 'firstAid'], 3: ['calmDown'], 4: ['volcano'], 6: ['lullaby'], 7: ['ideaBolt'], 9: ['groupHug'], 12: ['bigIdea'] },
      equip: { weapon: 'ruler', armor: 'jacket' }
    },
    mochi: {
      name: '麻糬', title: '迷路的柴犬', sprite: 'mochi', level: 3,
      bio: '在公園迷路的小柴犬，被一塊餅乾收買了。跑超快，最喜歡被摸頭。',
      base:   { maxHp: 38, maxMp: 12, atk: 11, def: 5, mag: 6, spd: 15, luck: 12 },
      growth: { maxHp: 7, maxMp: 2.4, atk: 2.2, def: 1.2, mag: 1, spd: 1.8, luck: 1.2 },
      learn: { 1: ['nibble', 'lick'], 4: ['bark'], 6: ['puppyEyes'], 9: ['zoomies'] },
      equip: { armor: 'dogVest' }
    }
  });
})();
