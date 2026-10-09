/*
 * Enemies and troops (the groups you fight).
 *
 * An enemy:
 *   name, sprite, palette, scale (default 3)
 *   stats   { maxHp, maxMp, atk, def, mag, spd, luck }
 *   exp, gold, drops: [{ item, chance }]
 *   weak / resist: ['fire', 'water', 'thunder', 'wind']     immune: ['sleep', ...]
 *   ai: [{ skill: 'attack' | skillId, weight, if: function (self, battle) { return true; } }]
 *   attackAnim, defeatText
 *
 * A troop: { enemies: [ids], backdrop, canRun, intro }
 * Random encounters pick troops from a map's `encounters` (maps.js); bosses are fought from scripts with { battle: 'id' }.
 */
(function () {
  'use strict';
  function hpBelow(f) { return function (self) { return self.hp < self.def.stats.maxHp * f; }; }

  RPG.add('enemies', {
    // ---- canyon ----
    lizard:  { name: '圍籬蜥蜴', sprite: 'lizard', stats: { maxHp: 20, atk: 9, def: 4, mag: 2, spd: 9, luck: 3 }, exp: 5, gold: 4,
               drops: [{ item: 'cookie', chance: 0.15 }], ai: [{ skill: 'attack', weight: 1 }] },
    gull:    { name: '搶食海鷗', sprite: 'gull', stats: { maxHp: 24, atk: 10, def: 4, mag: 3, spd: 13, luck: 5 }, exp: 6, gold: 6, weak: ['wind'],
               drops: [{ item: 'cookie', chance: 0.12 }], ai: [{ skill: 'attack', weight: 4 }, { skill: 'screech', weight: 1 }] },
    bee:     { name: '嗡嗡蜂', sprite: 'bee', scale: 2.5, stats: { maxHp: 16, atk: 9, def: 3, mag: 2, spd: 15, luck: 4 }, exp: 6, gold: 3, weak: ['fire', 'wind'],
               drops: [{ item: 'bandaid', chance: 0.15 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'sting', weight: 2 }] },
    crow:    { name: '壞脾氣烏鴉', sprite: 'crow', stats: { maxHp: 30, atk: 13, def: 6, mag: 4, spd: 14, luck: 6 }, exp: 9, gold: 8, weak: ['wind'],
               drops: [{ item: 'eraser', chance: 0.05 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'screech', weight: 1 }] },
    // ---- library & lab ----
    homework:{ name: '會飛的作業', sprite: 'homework', stats: { maxHp: 32, maxMp: 12, atk: 11, def: 6, mag: 11, spd: 10, luck: 4 }, exp: 11, gold: 7, weak: ['fire'],
               drops: [{ item: 'milk', chance: 0.12 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'lecture', weight: 2 }] },
    book:    { name: '生氣的字典', sprite: 'book', stats: { maxHp: 44, atk: 15, def: 9, mag: 6, spd: 7, luck: 4 }, exp: 14, gold: 11, weak: ['fire'],
               drops: [{ item: 'juice', chance: 0.1 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'paperCut', weight: 2 }] },
    clock:   { name: '鬧鐘怪', sprite: 'clock', stats: { maxHp: 38, maxMp: 16, atk: 12, def: 11, mag: 13, spd: 9, luck: 4 }, exp: 14, gold: 12, weak: ['water'], immune: ['sleep'],
               ai: [{ skill: 'attack', weight: 2 }, { skill: 'ring', weight: 2 }] },
    slime:   { name: '實驗室黏液', sprite: 'slime', stats: { maxHp: 40, atk: 13, def: 6, mag: 8, spd: 6, luck: 3 }, exp: 13, gold: 9, weak: ['thunder'], resist: ['water'],
               drops: [{ item: 'bandaid', chance: 0.2 }], ai: [{ skill: 'attack', weight: 2 }, { skill: 'gooSplash', weight: 2 }] },
    robovac: { name: '掃地機器人', sprite: 'robovac', stats: { maxHp: 48, maxMp: 12, atk: 15, def: 13, mag: 5, spd: 8, luck: 3 }, exp: 16, gold: 15, weak: ['water', 'thunder'],
               ai: [{ skill: 'attack', weight: 3 }, { skill: 'suck', weight: 1 }] },
    robomax: { name: '掃地機器人 MAX', sprite: 'robovac', scale: 5, palette: { M: '#c8a040', G: '#7a5a20' }, defeatText: ' 冒煙停機了！',
               stats: { maxHp: 300, maxMp: 60, atk: 21, def: 14, mag: 14, spd: 11, luck: 5 }, exp: 140, gold: 120, weak: ['water'], immune: ['sleep', 'scared'],
               drops: [{ item: 'raincoat', chance: 1 }],
               ai: [{ skill: 'attack', weight: 3 }, { skill: 'suck', weight: 2 }, { skill: 'overdrive', weight: 2, if: hpBelow(0.6) }] },
    // ---- the cave ----
    raccoon: { name: '浣熊小偷', sprite: 'raccoon', stats: { maxHp: 54, atk: 18, def: 10, mag: 6, spd: 16, luck: 10 }, exp: 18, gold: 18,
               drops: [{ item: 'cookie', chance: 0.3 }, { item: 'juice', chance: 0.1 }], ai: [{ skill: 'attack', weight: 3 }, { skill: 'snatch', weight: 2 }] },
    bat:     { name: '洞穴蝙蝠', sprite: 'bat', stats: { maxHp: 36, atk: 16, def: 7, mag: 6, spd: 19, luck: 6 }, exp: 14, gold: 10, weak: ['wind', 'thunder'],
               ai: [{ skill: 'attack', weight: 3 }, { skill: 'screech', weight: 1 }] },
    raccoonKing: { name: '浣熊大王', sprite: 'king', scale: 5, defeatText: ' 抱著肚子投降了！', immune: ['sleep', 'scared'],
               stats: { maxHp: 560, maxMp: 80, atk: 27, def: 17, mag: 16, spd: 17, luck: 8 }, exp: 320, gold: 300,
               drops: [{ item: 'coyoteBadge', chance: 1 }],
               ai: [{ skill: 'attack', weight: 3 }, { skill: 'kingSlam', weight: 2 }, { skill: 'trashStorm', weight: 2 },
                    { skill: 'feast', weight: 4, if: hpBelow(0.45) }] }
  });

  RPG.add('troops', {
    lizard:     { enemies: ['lizard'] },
    lizards:    { enemies: ['lizard', 'lizard'] },
    gull:       { enemies: ['gull', 'lizard'] },
    bees:       { enemies: ['bee', 'bee', 'bee'] },
    crows:      { enemies: ['crow', 'crow'] },
    canyonMix:  { enemies: ['crow', 'bee', 'lizard'] },
    homework:   { enemies: ['homework', 'homework'] },
    books:      { enemies: ['book', 'homework'] },
    clocks:     { enemies: ['clock', 'homework'] },
    slimes:     { enemies: ['slime', 'slime'] },
    robo:       { enemies: ['robovac', 'slime'] },
    robomax:    { enemies: ['robomax'], canRun: false, backdrop: 'lab', intro: '掃地機器人 MAX 啟動了！「發現……髒東西……清除！」' },
    raccoons:   { enemies: ['raccoon', 'raccoon'] },
    bats:       { enemies: ['bat', 'bat', 'bat'] },
    caveMix:    { enemies: ['raccoon', 'bat'] },
    raccoonKing:{ enemies: ['raccoonKing'], canRun: false, backdrop: 'cave', intro: '浣熊大王抱著獎盃跳了出來！「這是本大王的寶物！」' }
  });
})();
