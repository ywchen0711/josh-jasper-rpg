/*
 * Skills (magic and techniques) and status effects.
 *
 * A skill:
 *   mp                        — cost in MP   (name + desc live in js/lang: skill.<id>.name / .desc)
 *   target                    — 'enemy' | 'enemies' | 'ally' | 'allies' | 'self' | 'deadAlly'
 *                               (from the user's point of view, so an enemy's 'enemy' is the party)
 *   effects                   — list of effects, see js/effects.js:
 *        { type: 'damage', power: 1.5, kind: 'physical' | 'magic' | 'fixed', amount, element: 'fire' | 'water' | 'thunder' | 'wind' }
 *        { type: 'heal', power (× magic), amount, percent }     { type: 'mp', amount }      { type: 'revive', percent }
 *        { type: 'status', status: 'sleep', chance: 0.5 }      { type: 'cure', status: 'all' | ['sticky'] }
 *        { type: 'buff', stat: 'atk', mult: 1.3, turns: 3 }   { type: 'drain', power, ratio }   { type: 'custom', run(ctx) {} }
 *   anim                      — an animation from visuals.js
 *   field: true               — can also be used from the menu outside battle
 *
 * Characters learn skills by level in characters.js; enemies use them through their `ai` list in enemies.js.
 */
(function () {
  'use strict';

  RPG.add('statuses', {
    sleep:  { color: '#a0b8ff', turns: [2, 3], skipTurn: true, wakeOnHit: true },
    scared: { color: '#ffe080', turns: 1, skipTurn: true },
    sticky: { color: '#80e060', turns: 4, perTurn: { percent: 0.07 } },
    sad:    { color: '#80a0ff', turns: 3, stats: { atk: 0.7 } },
    pumped: { color: '#ffb060', turns: 3, stats: { atk: 1.25, spd: 1.2 } }
  });

  RPG.add('skills', {
    // ---- Josh: sports and courage ----
    tackle:     { mp: 2, target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 1.4 }] },
    cheer:      { mp: 4, target: 'allies', anim: 'shine', effects: [{ type: 'buff', stat: 'atk', mult: 1.3, turns: 3 }] },
    soccerKick: { mp: 5, target: 'enemy', anim: 'kick', effects: [{ type: 'damage', power: 2.1 }] },
    dodgeball:  { mp: 7, target: 'enemies', anim: 'ball', effects: [{ type: 'damage', power: 1.0 }] },
    braveHeart: { mp: 12, target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 3.0 }] },

    // ---- Jasper: science and imagination ----
    paperPlane: { mp: 2, target: 'enemy', anim: 'plane', effects: [{ type: 'damage', kind: 'magic', power: 1.3, element: 'wind' }] },
    firstAid:   { mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'heal', power: 2.2, amount: 14 }] },
    calmDown:   { mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'cure', status: 'all' }] },
    volcano:    { mp: 6, target: 'enemies', anim: 'fire', effects: [{ type: 'damage', kind: 'magic', power: 1.05, element: 'fire' }] },
    lullaby:    { mp: 4, target: 'enemies', anim: 'zzz', effects: [{ type: 'status', status: 'sleep', chance: 0.55 }] },
    ideaBolt:   { mp: 5, target: 'enemy', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.9, element: 'thunder' }] },
    groupHug:   { mp: 9, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.4, amount: 10 }] },
    bigIdea:    { mp: 12, target: 'enemies', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.6, element: 'thunder' }] },

    // ---- Mochi: puppy power ----
    nibble:     { mp: 0, target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.15 }] },
    lick:       { mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.5, amount: 12 }] },
    bark:       { mp: 3, target: 'enemies', anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.45 }] },
    puppyEyes:  { mp: 4, target: 'enemy', anim: 'shine', effects: [{ type: 'buff', stat: 'atk', mult: 0.7, turns: 3 }, { type: 'status', status: 'sad', chance: 0.4 }] },
    zoomies:    { mp: 6, target: 'enemies', anim: 'hit', effects: [{ type: 'damage', power: 0.95 }] },

    // ---- Mia: dodgeball queen ----
    quickThrow: { mp: 2, target: 'enemy', anim: 'ball', effects: [{ type: 'damage', power: 1.3 }] },
    doubleThrow:{ mp: 4, target: 'enemy', anim: 'ball', effects: [{ type: 'damage', power: 0.85 }, { type: 'damage', power: 0.85 }] },
    pepRally:   { mp: 5, target: 'allies', anim: 'stars', effects: [{ type: 'buff', stat: 'spd', mult: 1.35, turns: 3 }, { type: 'buff', stat: 'atk', mult: 1.1, turns: 3 }] },
    cannonball: { mp: 7, target: 'enemy', anim: 'kick', effects: [{ type: 'damage', power: 2.5 }] },
    ballStorm:  { mp: 10, target: 'enemies', anim: 'ball', effects: [{ type: 'damage', power: 0.75 }, { type: 'damage', power: 0.75 }] },

    // ---- Ethan: gadgets ----
    zap:        { mp: 3, target: 'enemy', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.45, element: 'thunder' }] },
    fixIt:      { mp: 4, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.9, amount: 14 }, { type: 'cure', status: ['sticky'] }] },
    waterJet:   { mp: 5, target: 'enemy', anim: 'water', effects: [{ type: 'damage', kind: 'magic', power: 1.75, element: 'water' }] },
    shieldBot:  { mp: 6, target: 'allies', anim: 'shine', effects: [{ type: 'buff', stat: 'def', mult: 1.4, turns: 3 }] },
    sciFog:     { mp: 6, target: 'enemies', anim: 'bubbles', effects: [{ type: 'status', status: 'sleep', chance: 0.45 }, { type: 'buff', stat: 'spd', mult: 0.8, turns: 3 }] },
    teslaCoil:  { mp: 11, target: 'enemies', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.35, element: 'thunder' }] },

    // ---- enemies ----
    sting:      { target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 0.9 }, { type: 'status', status: 'sticky', chance: 0.35 }] },
    screech:    { target: 'enemies', anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.25 }] },
    snatch:     { target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.1 }, { type: 'custom', run: function (ctx) {
      var lost = Math.min(RPG.state.gold, RPG.ri(3, 12));
      if (lost) { RPG.state.gold -= lost; ctx.pop(ctx.target, RPG.t('ui.money', { n: '-' + lost }), '#ffd060'); }
    } }] },
    lecture:    { target: 'enemies', mp: 4, anim: 'zzz', effects: [{ type: 'status', status: 'sleep', chance: 0.4 }] },
    paperCut:   { target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 1.35 }] },
    ring:       { target: 'enemies', mp: 4, anim: 'bark', effects: [{ type: 'damage', kind: 'magic', power: 0.75 }] },
    gooSplash:  { target: 'enemy', anim: 'goo', effects: [{ type: 'damage', power: 0.8 }, { type: 'status', status: 'sticky', chance: 0.6 }] },
    suck:       { target: 'enemy', mp: 3, anim: 'water', effects: [{ type: 'drain', power: 1.1, ratio: 0.6 }] },
    overdrive:  { target: 'enemies', mp: 8, anim: 'slam', effects: [{ type: 'damage', power: 1.1 }] },
    kingSlam:   { target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 1.8 }] },
    trashStorm: { target: 'enemies', mp: 6, anim: 'fire', effects: [{ type: 'damage', power: 1.05 }, { type: 'status', status: 'sticky', chance: 0.3 }] },
    acornToss:  { target: 'enemy', anim: 'ball', effects: [{ type: 'damage', power: 1.05 }] },
    dash:       { target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 1.35 }] },
    roll:       { target: 'enemies', mp: 3, anim: 'hit', effects: [{ type: 'damage', power: 0.7 }] },
    rattle:     { target: 'enemies', mp: 3, anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.35 }] },
    scribble:   { target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 0.95 }, { type: 'status', status: 'sad', chance: 0.3 }] },
    fizz:       { target: 'enemies', mp: 4, anim: 'bubbles', effects: [{ type: 'damage', kind: 'magic', power: 0.7, element: 'water' }, { type: 'status', status: 'sticky', chance: 0.25 }] },
    spores:     { target: 'enemies', mp: 4, anim: 'bubbles', effects: [{ type: 'status', status: 'sleep', chance: 0.35 }] },
    playDead:   { target: 'self', mp: 3, anim: 'zzz', effects: [{ type: 'heal', percent: 0.3 }] },
    bucketBash: { target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 1.45 }] },
    hunker:     { target: 'self', anim: 'shine', effects: [{ type: 'buff', stat: 'def', mult: 1.5, turns: 2 }] },
    gullDive:   { target: 'enemy', mp: 4, anim: 'slam', effects: [{ type: 'damage', power: 1.6 }] },
    feast:      { target: 'self', mp: 6, anim: 'heal', effects: [{ type: 'heal', percent: 0.18 }, { type: 'buff', stat: 'atk', mult: 1.2, turns: 2 }] }
  });
})();
