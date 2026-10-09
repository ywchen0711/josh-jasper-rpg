# 擴充指南（MODDING）

遊戲的「引擎」和「內容」是分開的。所有內容都在 `js/data/` 裡，用同一個寫法註冊：

```js
RPG.add('種類', {
  id1: { ... },
  id2: { ... }
});
```

改完之後執行 `node tools/check-data.js`，它會檢查地圖寬度、圖塊、傳送點、NPC 位置，以及所有引用（技能、道具、敵人、商店……）是否存在。

如果新增了一個資料檔，記得在 `index.html` 的「game data」區塊加上 `<script>`。

---

## 角色 `js/data/characters.js`

```js
RPG.add('characters', {
  mia: {
    name: 'Mia', title: '同學・躲避球女王', sprite: 'mia',
    bio: '自我介紹，會顯示在狀態畫面。',
    base:   { maxHp: 45, maxMp: 12, atk: 12, def: 7, mag: 6, spd: 12, luck: 8 },   // Lv1 的能力
    growth: { maxHp: 8,  maxMp: 2,  atk: 2.4, def: 1.5, mag: 1, spd: 1.6, luck: 1 }, // 每升一級增加
    learn: { 1: ['tackle'], 4: ['dodgeball'] },                                       // 幾級學會什麼技能
    equip: { weapon: 'ruler', armor: 'jacket' },                                      // 初始裝備
    level: 5                                                                          // 加入時的等級
  }
});
```

讓角色加入隊伍：在任何腳本裡寫 `{ join: 'mia' }`。
走路的圖可以用現成的小孩模板換顏色（`js/data/sprites.js`）：

```js
RPG.add('sprites', {
  mia: RPG.walker(RPG.KID, { H: '#c89040', S: '#f0c49a', K: '#202020', M: '#b04030', T: '#e05a8a', P: '#5a3a6a', B: '#3a2a1a', G: '#e05a8a' })
});
```

## 技能（魔法、招式）`js/data/skills.js`

```js
RPG.add('skills', {
  iceCream: {
    name: '冰淇淋凍凍', desc: '冰涼攻擊所有敵人，可能讓敵人睡著。',
    mp: 6,
    target: 'enemies',          // enemy / enemies / ally / allies / self / deadAlly
    anim: 'sparkle',            // js/data/visuals.js 裡的動畫
    field: false,               // true = 也能在選單裡使用（補血技能）
    effects: [
      { type: 'damage', kind: 'magic', power: 1.2, element: 'water' },
      { type: 'status', status: 'sleep', chance: 0.3 }
    ]
  }
});
```

### 效果種類（`effects`）

| type | 參數 | 說明 |
|---|---|---|
| `damage` | `power`、`kind`（`physical` / `magic` / `fixed`）、`amount`、`element`、`accuracy` | 傷害 |
| `drain` | `power`、`ratio` | 傷害並吸血 |
| `heal` | `power`（× 魔力）、`amount`、`percent` | 回復 HP |
| `mp` | `amount`、`percent` | 回復 MP |
| `revive` | `percent` | 復活倒下的隊友 |
| `status` | `status`、`chance`、`turns` | 附加異常狀態 |
| `cure` | `status`（`'all'` 或陣列） | 治療異常狀態 |
| `buff` | `stat`、`mult`、`turns` | 能力上升（mult > 1）或下降（mult < 1） |
| `escape` | — | 戰鬥中逃跑 |
| `custom` | `run(ctx)` | 自己寫：`ctx.user`、`ctx.target`、`ctx.battle`、`ctx.pop(target, 文字, 顏色)` |

新增效果種類：

```js
RPG.effects.swap = function (eff, ctx) {      // 交換使用者和目標的 HP
  var a = ctx.user.hp; ctx.user.hp = ctx.target.hp; ctx.target.hp = a;
  ctx.pop(ctx.target, '交換！', '#ffd060');
};
```

### 異常狀態

```js
RPG.add('statuses', {
  cold: { name: '感冒', short: '冷', color: '#a0e0ff', turns: [2, 4],
          perTurn: { percent: 0.05 }, tickText: ' 一直打噴嚏。',     // 每回合損失 HP
          stats: { spd: 0.7 } }                                       // 能力倍率
  // 其他可用：skipTurn: true（跳過回合）、skipText、wakeOnHit: true（被打就解除）、persist: true（戰鬥後保留）
});
```

## 道具 `js/data/items.js`

```js
RPG.add('items', {
  pizza:  { name: '披薩', type: 'consumable', price: 60, desc: '全隊回復 80 HP。', target: 'allies', effects: [{ type: 'heal', amount: 80 }] },
  racket: { name: '網球拍', type: 'weapon', price: 120, desc: '攻擊 +9', stats: { atk: 9 }, equipBy: ['josh'], element: 'wind', anim: 'ball' },
  cap:    { name: '棒球帽', type: 'accessory', price: 40, desc: '幸運 +3、速度 +2', stats: { luck: 3, spd: 2 } }
});
```

- `type`：`consumable`（消耗品）/ `weapon` / `armor` / `accessory` / `key`（劇情道具）
- 消耗品的 `target`、`effects` 和技能一樣；`battle: false` 或 `field: false` 可限制使用場合
- 裝備的 `stats` 可以有 maxHp maxMp atk def mag spd luck；`equipBy` 不寫就是大家都能穿

## 敵人與遇敵隊伍 `js/data/enemies.js`

```js
RPG.add('enemies', {
  skunk: {
    name: '臭鼬', sprite: 'skunk', scale: 3,
    stats: { maxHp: 60, maxMp: 10, atk: 18, def: 9, mag: 8, spd: 12, luck: 5 },
    exp: 20, gold: 15,
    drops: [{ item: 'juice', chance: 0.2 }],
    weak: ['water'], resist: ['wind'], immune: ['sleep'],
    ai: [
      { skill: 'attack', weight: 3 },
      { skill: 'sting', weight: 2 },
      { skill: 'feast', weight: 5, if: function (self, battle) { return self.hp < self.def.stats.maxHp / 2; } }
    ]
  }
});
RPG.add('troops', {
  skunks: { enemies: ['skunk', 'skunk'] },
  skunkBoss: { enemies: ['skunk'], canRun: false, backdrop: 'canyon', intro: '臭鼬老大擋住了去路！' }
});
```

敵人的圖（16×16，兩個影格）加在 `sprites.js`：

```js
RPG.add('sprites', { skunk: { palette: { K: '#202020', W: '#ffffff' }, frames: { idle: [frameA, frameB] } } });
```

## 地圖與劇情 `js/data/maps.js`

```js
RPG.add('maps', {
  beach: {
    name: 'Del Mar 海灘', backdrop: 'default',
    legend: { 'y': 'sand' },                 // 額外的字元 → 圖塊（共用圖例在 config.js）
    rows: [
      'TTTTTTTTTT',
      'Tyyyyyyyy~',
      'Tyy""yyyy~',
      'TTTTpTTTTT'
    ],
    warps: [{ x: 4, y: 3, to: 'street', tx: 14, ty: 16, dir: 'up' }],
    encounters: { rate: 0.1, troops: [['skunks', 1]] },      // 站在 encounter 圖塊（如 '"' 高草）上才會遇敵；anywhere: true 則到處都會
    chests: [{ x: 8, y: 1, item: 'pizza', flag: 'chest_beach' }],
    npcs: [
      { id: 'surfer', x: 3, y: 1, sprite: 'adult', name: '衝浪的哥哥', wander: 2, script: [
        { say: '浪很大喔！' },
        { if: { item: 'pizza' }, then: [{ take: 'pizza' }, { give: 'cap' }], 'else': [{ say: '肚子好餓……' }] }
      ] }
    ],
    events: [{ x: 5, y: 2, trigger: 'touch', once: 'beach_intro', script: [{ say: '海風好舒服！' }] }]
  }
});
```

### 腳本指令

| 指令 | 範例 |
|---|---|
| 說話 | `{ say: '文字', name: '名字' }`（`say` 也可以是陣列，一句一頁） |
| 選擇 | `{ choice: ['好', '不要'], text: '要嗎？', then: [[...], [...]] }` |
| 條件 | `{ if: 'flag', then: [...], else: [...] }` |
| 旗標 | `{ set: 'flag' }`、`{ unset: 'flag' }` |
| 道具 | `{ give: 'cookie', count: 2 }`、`{ take: 'cookie' }` |
| 金錢 | `{ gold: 50 }`、`{ gold: -20 }` |
| 戰鬥 | `{ battle: 'troopId', win: [...], lose: [...], escape: [...] }`（有寫 `lose` 輸了不會 Game Over） |
| 商店 | `{ shop: 'shopId' }` |
| 旅館 | `{ inn: 20, text: '睡得好香！' }`（0 = 免費） |
| 隊伍 | `{ join: 'mochi' }`、`{ leave: 'mochi' }`、`{ heal: true }` |
| 移動 | `{ warp: 'mapId', x: 3, y: 4, dir: 'up' }` |
| NPC | `{ hide: 'npcId' }`、`{ show: 'npcId' }` |
| 其他 | `{ wait: 30 }`、`{ sfx: 'item' }`、`{ toast: '提示' }`、`{ ending: true }`、`{ call: function (ctx) { ... } }` |

條件（`if`、NPC 的 `showIf` / `hideIf`、傳送點和事件的 `if`）可以是：
`'flag'`、`'!flag'`、`{ item: 'cookie', count: 2 }`、`{ gold: 100 }`、`{ member: 'mochi' }`、陣列（全部成立）、或函式。

新增腳本指令：

```js
RPG.commands.dance = async function (cmd, ctx) {
  await RPG.ui.say(cmd.dance + ' 跳起舞來了！');
};
// 用法：{ dance: 'Josh' }
```

## 圖塊、動畫、背景 `js/data/tiles.js`、`js/data/visuals.js`

```js
RPG.add('tiles', {
  lava: { solid: false, encounter: true, frames: 2, draw: function (g, frame) { g.fillStyle = frame ? '#f04020' : '#f08020'; g.fillRect(0, 0, 16, 16); } }
});
RPG.add('anims', {
  stars: { frames: 20, sfx: 'magic', draw: function (g, x, y, p) { RPG.text('★', x, y - p * 20, { size: 12, color: '#ffd060' }); } }
});
RPG.add('backdrops', {
  beach: { draw: function (g, frame) { g.fillStyle = '#7cc4f4'; g.fillRect(0, 0, RPG.W, RPG.H); g.fillStyle = '#e8d8a0'; g.fillRect(0, 130, RPG.W, 110); } }
});
```

## 商店 `js/data/config.js`

```js
RPG.add('shops', {
  beachShack: { name: '海邊小舖', keeper: '老闆', greeting: '來點冰的嗎？', items: ['juice', 'pizza', 'cap'], sellRate: 0.5 }
});
```

## 遊戲設定 `js/data/config.js`

`RPG.config({ ... })` 裡可以改：標題、開始地圖與位置、初始隊伍、初始金錢與道具、經驗值曲線 `expCurve(level)`、
開場劇情 `intro`、結局文字 `ending`，以及傷害公式 `damage(user, target, effect)`（不寫就用 `js/effects.js` 的預設公式）。
