/*
 * Skills (magic and techniques) and status effects.
 *
 * A skill:
 *   name, desc, mp            — cost in MP
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
    sleep:  { name: '睡著了', short: '睡', color: '#a0b8ff', turns: [2, 3], skipTurn: true, wakeOnHit: true, skipText: ' 呼呼大睡中……' },
    scared: { name: '嚇呆了', short: '驚', color: '#ffe080', turns: 1, skipTurn: true, skipText: ' 嚇得動不了！' },
    sticky: { name: '黏答答', short: '黏', color: '#80e060', turns: 4, perTurn: { percent: 0.07 }, tickText: ' 被黏液弄得好難受。' },
    sad:    { name: '想哭', short: '哭', color: '#80a0ff', turns: 3, stats: { atk: 0.7 } },
    pumped: { name: '超有精神', short: '燃', color: '#ffb060', turns: 3, stats: { atk: 1.25, spd: 1.2 } }
  });

  RPG.add('skills', {
    // ---- Josh: sports and courage ----
    tackle:     { name: '衝撞', desc: '用肩膀撞過去。', mp: 2, target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 1.4 }] },
    cheer:      { name: '加油打氣', desc: '全隊攻擊力上升 3 回合。', mp: 4, target: 'allies', anim: 'shine', effects: [{ type: 'buff', stat: 'atk', mult: 1.3, turns: 3 }] },
    soccerKick: { name: '足球射門', desc: '全力一腳射門，威力強大。', mp: 5, target: 'enemy', anim: 'kick', effects: [{ type: 'damage', power: 2.1 }] },
    dodgeball:  { name: '躲避球亂射', desc: '對所有敵人丟躲避球。', mp: 7, target: 'enemies', anim: 'ball', effects: [{ type: 'damage', power: 1.0 }] },
    braveHeart: { name: '勇氣爆發', desc: '哥哥的必殺技！超強的一擊。', mp: 12, target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 3.0 }] },

    // ---- Jasper: science and imagination ----
    paperPlane: { name: '紙飛機', desc: '射出紙飛機（風屬性）。', mp: 2, target: 'enemy', anim: 'plane', effects: [{ type: 'damage', kind: 'magic', power: 1.3, element: 'wind' }] },
    firstAid:   { name: '痛痛飛走', desc: '「痛痛飛走～」回復一位隊友的 HP。', mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'heal', power: 2.2, amount: 14 }] },
    calmDown:   { name: '深呼吸', desc: '治好一位隊友的異常狀態。', mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'cure', status: 'all' }] },
    volcano:    { name: '小蘇打火山', desc: '科學實驗大爆發！火屬性攻擊所有敵人。', mp: 6, target: 'enemies', anim: 'fire', effects: [{ type: 'damage', kind: 'magic', power: 1.05, element: 'fire' }] },
    lullaby:    { name: '搖籃曲', desc: '哼歌讓敵人睡著。', mp: 4, target: 'enemies', anim: 'zzz', effects: [{ type: 'status', status: 'sleep', chance: 0.55 }] },
    ideaBolt:   { name: '靈光一閃', desc: '想到好點子的瞬間打下閃電（雷屬性）。', mp: 5, target: 'enemy', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.9, element: 'thunder' }] },
    groupHug:   { name: '大家抱抱', desc: '回復全隊的 HP。', mp: 9, target: 'allies', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.4, amount: 10 }] },
    bigIdea:    { name: '超級大點子', desc: '腦袋全速運轉，雷電轟炸所有敵人。', mp: 12, target: 'enemies', anim: 'bolt', effects: [{ type: 'damage', kind: 'magic', power: 1.6, element: 'thunder' }] },

    // ---- Mochi: puppy power ----
    nibble:     { name: '咬咬', desc: '小小的牙齒咬下去。', mp: 0, target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.15 }] },
    lick:       { name: '舔舔', desc: '舔一舔，傷口好像比較不痛了。', mp: 3, target: 'ally', anim: 'heal', field: true, effects: [{ type: 'heal', power: 1.5, amount: 12 }] },
    bark:       { name: '汪汪吼', desc: '大聲叫，可能嚇呆所有敵人。', mp: 3, target: 'enemies', anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.45 }] },
    puppyEyes:  { name: '無辜眼神', desc: '水汪汪的眼睛讓敵人攻擊力下降。', mp: 4, target: 'enemy', anim: 'shine', effects: [{ type: 'buff', stat: 'atk', mult: 0.7, turns: 3 }, { type: 'status', status: 'sad', chance: 0.4 }] },
    zoomies:    { name: '狗狗暴衝', desc: '突然暴衝撞向所有敵人。', mp: 6, target: 'enemies', anim: 'hit', effects: [{ type: 'damage', power: 0.95 }] },

    // ---- enemies ----
    sting:      { name: '螫', target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 0.9 }, { type: 'status', status: 'sticky', chance: 0.35 }] },
    screech:    { name: '尖叫', target: 'enemies', anim: 'bark', effects: [{ type: 'status', status: 'scared', chance: 0.25 }] },
    snatch:     { name: '搶點心', target: 'enemy', anim: 'claw', effects: [{ type: 'damage', power: 1.1 }, { type: 'custom', run: function (ctx) {
      var lost = Math.min(RPG.state.gold, RPG.ri(3, 12));
      if (lost) { RPG.state.gold -= lost; ctx.pop(ctx.target, '-' + lost + ' 元', '#ffd060'); }
    } }] },
    lecture:    { name: '無聊的講課', target: 'enemies', mp: 4, anim: 'zzz', effects: [{ type: 'status', status: 'sleep', chance: 0.4 }] },
    paperCut:   { name: '紙割傷', target: 'enemy', anim: 'hit', effects: [{ type: 'damage', power: 1.35 }] },
    ring:       { name: '鈴鈴鈴！', target: 'enemies', mp: 4, anim: 'bark', effects: [{ type: 'damage', kind: 'magic', power: 0.75 }] },
    gooSplash:  { name: '黏液噴射', target: 'enemy', anim: 'goo', effects: [{ type: 'damage', power: 0.8 }, { type: 'status', status: 'sticky', chance: 0.6 }] },
    suck:       { name: '吸吸吸', target: 'enemy', mp: 3, anim: 'water', effects: [{ type: 'drain', power: 1.1, ratio: 0.6 }] },
    overdrive:  { name: '過熱暴走', target: 'enemies', mp: 8, anim: 'slam', effects: [{ type: 'damage', power: 1.1 }] },
    kingSlam:   { name: '大王重擊', target: 'enemy', anim: 'slam', effects: [{ type: 'damage', power: 1.8 }] },
    trashStorm: { name: '垃圾風暴', target: 'enemies', mp: 6, anim: 'fire', effects: [{ type: 'damage', power: 1.05 }, { type: 'status', status: 'sticky', chance: 0.3 }] },
    feast:      { name: '大吃一頓', target: 'self', mp: 6, anim: 'heal', effects: [{ type: 'heal', percent: 0.18 }, { type: 'buff', stat: 'atk', mult: 1.2, turns: 2 }] }
  });
})();
