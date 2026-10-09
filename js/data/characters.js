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
      sprite: 'josh',
      base:   { maxHp: 52, maxMp: 10, atk: 13, def: 8, mag: 4, spd: 8, luck: 6 },
      growth: { maxHp: 9.5, maxMp: 2, atk: 2.6, def: 1.8, mag: 0.8, spd: 1.2, luck: 0.8 },
      learn: { 1: ['tackle'], 3: ['cheer'], 5: ['soccerKick'], 8: ['dodgeball'], 12: ['braveHeart'] },
      equip: { weapon: 'ruler', armor: 'jacket' }
    },
    jasper: {
      sprite: 'jasper',
      base:   { maxHp: 42, maxMp: 18, atk: 8, def: 6, mag: 12, spd: 9, luck: 9 },
      growth: { maxHp: 7.5, maxMp: 4, atk: 1.6, def: 1.3, mag: 2.6, spd: 1.4, luck: 1 },
      learn: { 1: ['paperPlane', 'firstAid'], 3: ['calmDown'], 4: ['volcano'], 6: ['lullaby'], 7: ['ideaBolt'], 9: ['groupHug'], 12: ['bigIdea'] },
      equip: { weapon: 'ruler', armor: 'jacket' }
    },
    mochi: {
      sprite: 'mochi', level: 3,
      base:   { maxHp: 38, maxMp: 12, atk: 11, def: 5, mag: 6, spd: 15, luck: 12 },
      growth: { maxHp: 7, maxMp: 2.4, atk: 2.2, def: 1.2, mag: 1, spd: 1.8, luck: 1.2 },
      learn: { 1: ['nibble', 'lick'], 4: ['bark'], 6: ['puppyEyes'], 9: ['zoomies'] },
      equip: { armor: 'dogVest' }
    },
    mia: {
      sprite: 'mia', level: 4,
      base:   { maxHp: 46, maxMp: 12, atk: 12, def: 6, mag: 5, spd: 13, luck: 8 },
      growth: { maxHp: 8.2, maxMp: 2.2, atk: 2.5, def: 1.4, mag: 0.9, spd: 1.9, luck: 1 },
      learn: { 1: ['quickThrow'], 4: ['doubleThrow'], 6: ['pepRally'], 9: ['cannonball'], 12: ['ballStorm'] },
      equip: { weapon: 'dodgeball', armor: 'jacket' }
    },
    ethan: {
      sprite: 'ethan', level: 6,
      base:   { maxHp: 40, maxMp: 20, atk: 7, def: 7, mag: 13, spd: 7, luck: 7 },
      growth: { maxHp: 7.2, maxMp: 4.2, atk: 1.3, def: 1.6, mag: 2.7, spd: 1.1, luck: 0.9 },
      learn: { 1: ['zap', 'fixIt'], 6: ['waterJet'], 7: ['shieldBot'], 9: ['sciFog'], 12: ['teslaCoil'] },
      equip: { weapon: 'screwdriver', armor: 'labCoat' }
    }
  });
})();
