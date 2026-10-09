# 擴充指南（MODDING）

遊戲分成三層，彼此獨立：

| 層 | 位置 | 內容 |
|---|---|---|
| 引擎 | `js/*.js`、`js/scenes/` | 移動、戰鬥、選單、畫面特效。通常不用改。 |
| 資料 | `js/data/` | 角色、技能、道具、敵人、地圖、劇情腳本……只有數值和**文字 key**，沒有任何文字。 |
| 文字 | `js/lang/zh.js`、`js/lang/en.js` | 玩家看到的**每一個字**（對話、名稱、說明、介面），一個語言一個檔。 |

資料都用同一個寫法註冊：

```js
RPG.add('種類', {
  id1: { ... },
  id2: { ... }
});
```

改完之後執行 `node tools/check-data.js`，它會檢查地圖寬度、圖塊、傳送點、NPC 位置、所有引用（技能、道具、敵人、商店……）是否存在，
**以及每個用到的文字 key 在每個語言裡都有翻譯**（少了哪一句會直接告訴你）。

如果新增了一個資料檔，記得在 `index.html` 的「game data」區塊加上 `<script>`。

---

## 文字與語言 `js/lang/*.js`

所有文字用「key」來找，key 是用點連起來的路徑。語言檔是巢狀物件，會自動攤平：

```js
RPG.addText('zh', {
  item:  { pizza: { name: '披薩', desc: '全隊回復 80 HP。' } },          // → item.pizza.name / item.pizza.desc
  npc:   { surfer: '衝浪的哥哥' },                                       // → npc.surfer（說話者的名字）
  beach: { surfer: { hi: '浪很大喔！', hungry: '肚子好餓……' } }          // → beach.surfer.hi（對話）
});
RPG.addText('en', {
  item:  { pizza: { name: 'Pizza', desc: 'Restores 80 HP to the whole party.' } },
  npc:   { surfer: 'Surfer Dude' },
  beach: { surfer: { hi: 'Gnarly waves today!', hungry: 'So hungry...' } }
});
```

- 文字裡可以放 `{變數}`：`'{name} 加入了隊伍！'`。劇情對話裡永遠可以用 `{gold}`（目前金錢）和 `{lead}`（隊長名字）。
- 某個語言缺了某句時，會先顯示中文，再沒有就顯示 key 本身（一看就知道漏了）。
- 遊戲裡的「設定」可以切換語言，設定會記在瀏覽器裡。

### 資料對應的文字 key

| 資料 | key |
|---|---|
| 角色 | `character.<id>.name`、`.title`、`.bio` |
| 技能 | `skill.<id>.name`、`.desc`（敵人專用技能只要 name） |
| 道具 | `item.<id>.name`、`.desc` |
| 敵人 | `enemy.<id>.name`、`.defeat`（選填，打倒時的台詞，`{name}` = 敵人名字） |
| 遇敵隊伍 | `troop.<id>.intro`（選填，戰鬥開場白） |
| 異常狀態 | `status.<id>.name`、`.short`（一個字的標記）、`.skip`、`.tick`（選填，`{name}` = 角色名字） |
| 地圖 | `map.<id>.name` |
| 商店 | `shop.<id>.name`、`.greeting`、`.bye`（後兩個選填） |
| NPC 說話者 | `npc.<名字>` |
| 介面、戰鬥訊息 | `ui.*`、`battle.*`、`stat.*`、`slot.*`、`game.*` |

### 新增一個語言（例如日文）

1. 複製 `js/lang/en.js` 成 `js/lang/ja.js`，把第一行改成 `RPG.addText('ja', { ... })`，翻譯每一句。
2. 在 `index.html` 的「text」區塊加上 `<script src="js/lang/ja.js"></script>`。
3. 在 `js/i18n.js` 的 `RPG.LANGS` 加上 `{ id: 'ja', label: '日本語' }`。
4. 執行 `node tools/check-data.js`，確認沒有漏翻的句子。

---

## 角色 `js/data/characters.js`

```js
RPG.add('characters', {
  mia: {
    sprite: 'mia',
    base:   { maxHp: 45, maxMp: 12, atk: 12, def: 7, mag: 6, spd: 12, luck: 8 },   // Lv1 的能力
    growth: { maxHp: 8,  maxMp: 2,  atk: 2.4, def: 1.5, mag: 1, spd: 1.6, luck: 1 }, // 每升一級增加
    learn: { 1: ['tackle'], 4: ['dodgeball'] },                                       // 幾級學會什麼技能
    equip: { weapon: 'ruler', armor: 'jacket' },                                      // 初始裝備
    level: 5                                                                          // 加入時的等級
  }
});
// 文字： character: { mia: { name: 'Mia', title: '同學・躲避球女王', bio: '自我介紹，會顯示在狀態畫面。' } }
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
// 文字： skill: { iceCream: { name: '冰淇淋凍凍', desc: '冰涼攻擊所有敵人，可能讓敵人睡著。' } }
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

新增效果種類（要顯示文字的話一樣用 key）：

```js
RPG.effects.swap = function (eff, ctx) {      // 交換使用者和目標的 HP
  var a = ctx.user.hp; ctx.user.hp = ctx.target.hp; ctx.target.hp = a;
  ctx.pop(ctx.target, RPG.t('battle.swapped'), '#ffd060');   // 在 zh.js / en.js 的 battle 裡加上 swapped
};
```

### 異常狀態

```js
RPG.add('statuses', {
  cold: { color: '#a0e0ff', turns: [2, 4],
          perTurn: { percent: 0.05 },        // 每回合損失 HP
          stats: { spd: 0.7 } }              // 能力倍率
  // 其他可用：skipTurn: true（跳過回合）、wakeOnHit: true（被打就解除）、persist: true（戰鬥後保留）
});
// 文字： status: { cold: { name: '感冒', short: '冷', tick: '{name} 一直打噴嚏。' } }
```

## 道具 `js/data/items.js`

```js
RPG.add('items', {
  pizza:  { type: 'consumable', price: 60, target: 'allies', effects: [{ type: 'heal', amount: 80 }] },
  racket: { type: 'weapon', price: 120, stats: { atk: 9 }, equipBy: ['josh'], element: 'wind', anim: 'ball' },
  cap:    { type: 'accessory', price: 40, stats: { luck: 3, spd: 2 } }
});
```

- `type`：`consumable`（消耗品）/ `weapon` / `armor` / `accessory` / `key`（劇情道具）
- 消耗品的 `target`、`effects` 和技能一樣；`battle: false` 或 `field: false` 可限制使用場合
- 裝備的 `stats` 可以有 maxHp maxMp atk def mag spd luck；`equipBy` 不寫就是大家都能穿
- 名稱和說明寫在語言檔的 `item.<id>`

## 敵人與遇敵隊伍 `js/data/enemies.js`

```js
RPG.add('enemies', {
  skunk: {
    sprite: 'skunk', scale: 3,
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
  skunkBoss: { enemies: ['skunk'], canRun: false, backdrop: 'canyon' }
});
// 文字： enemy: { skunk: { name: '臭鼬', defeat: '{name} 臭臭地逃走了！' } },  troop: { skunkBoss: { intro: '臭鼬老大擋住了去路！' } }
```

敵人的圖（16×16，兩個影格）加在 `sprites.js`：

```js
RPG.add('sprites', { skunk: { palette: { K: '#202020', W: '#ffffff' }, frames: { idle: [frameA, frameB] } } });
```

## 地圖與劇情 `js/data/maps.js`

```js
RPG.add('maps', {
  beach: {
    backdrop: 'default',
    legend: { 'y': 'sand' },                 // 額外的字元 → 圖塊（共用圖例在 config.js）
    rows: [
      'TTTTTTTTTT',
      'Tyyyyyyyy~',
      'Tyy""yyyy~',
      'TTTTpTTTTT'
    ],
    // HD-2D 氣氛（都可省略）
    particles: 'leaves', grade: 'warm', bloom: 0.4, vignette: 0.5,
    warps: [{ x: 4, y: 3, to: 'street', tx: 14, ty: 16, dir: 'up' }],
    encounters: { rate: 0.1, troops: [['skunks', 1]] },      // 站在 encounter 圖塊（如 '"' 高草）上才會遇敵；anywhere: true 則到處都會
    chests: [{ x: 8, y: 1, item: 'pizza', flag: 'chest_beach' }],
    npcs: [
      { id: 'surfer', x: 3, y: 1, sprite: 'adult', name: 'surfer', wander: 2, script: [   // name → npc.surfer
        { say: 'beach.surfer.hi' },
        { if: { item: 'pizza' }, then: [{ take: 'pizza' }, { give: 'cap' }], 'else': [{ say: 'beach.surfer.hungry' }] }
      ] }
    ],
    events: [{ x: 5, y: 2, trigger: 'touch', once: 'beach_intro', script: [{ say: 'beach.breeze' }] }]
  }
});
// 文字： map: { beach: { name: 'Del Mar 海灘' } }，加上上面腳本用到的 beach.* 對話
```

### HD-2D 畫面設定（地圖）

開啟「特效」時，地圖會像《歧路旅人》那樣：畫在一個傾斜的立體模型上，遠處模糊（景深）、亮處泛光（bloom）、
有光源、飄落的粒子和色調。每張地圖可以設定：

| 設定 | 說明 |
|---|---|
| `ambient` | 0～1，環境的暗度（洞窟 0.6、室內 0.2～0.3、戶外 0） |
| `lights` | `[{ x, y, r, color }]` 光源；x、y、r 以格子為單位，color 寫成 `'rgba(255,200,120,A)'`（A 會被換成亮度） |
| `playerLight` | 跟著隊伍走的光（半徑幾格），適合洞窟 |
| `particles` | `'leaves'` 落葉、`'dust'` 塵埃、`'fireflies'` 螢火蟲、`'motes'` 光點 |
| `grade` | 色調：`'warm'`、`'cool'`、`'dusk'`、`'night'` |
| `bloom`、`vignette` | 泛光強度、四周暗角（0～1） |

圖塊也可以自己發光：`machine: { light: { r: 2.4, color: 'rgba(120,230,255,A)' }, ... }`。

### 腳本指令

腳本裡所有文字都是 key。

| 指令 | 範例 |
|---|---|
| 說話 | `{ say: 'beach.surfer.hi', name: 'surfer' }`（`say` 也可以是 key 陣列，一句一頁；`name` 是 `npc.*` 的名字或隊員 id 如 `'josh'`；`name: null` 是旁白；不寫就用 NPC 自己的 name） |
| 選擇 | `{ choice: ['beach.yes', 'beach.no'], text: 'beach.ask', then: [[...], [...]] }` |
| 條件 | `{ if: 'flag', then: [...], else: [...] }` |
| 旗標 | `{ set: 'flag' }`、`{ unset: 'flag' }` |
| 道具 | `{ give: 'cookie', count: 2 }`、`{ take: 'cookie' }` |
| 金錢 | `{ gold: 50 }`、`{ gold: -20 }` |
| 戰鬥 | `{ battle: 'troopId', win: [...], lose: [...], escape: [...] }`（有寫 `lose` 輸了不會 Game Over） |
| 商店 | `{ shop: 'shopId' }` |
| 旅館 | `{ inn: 20, text: 'beach.slept' }`（0 = 免費） |
| 隊伍 | `{ join: 'mochi' }`、`{ leave: 'mochi' }`、`{ heal: true }` |
| 移動 | `{ warp: 'mapId', x: 3, y: 4, dir: 'up' }` |
| NPC | `{ hide: 'npcId' }`、`{ show: 'npcId' }` |
| 其他 | `{ wait: 30 }`、`{ sfx: 'item' }`、`{ toast: 'beach.tip' }`、`{ ending: true }`、`{ call: function (ctx) { ... } }` |

條件（`if`、NPC 的 `showIf` / `hideIf`、傳送點和事件的 `if`）可以是：
`'flag'`、`'!flag'`、`{ item: 'cookie', count: 2 }`、`{ gold: 100 }`、`{ member: 'mochi' }`、陣列（全部成立）、或函式。

新增腳本指令：

```js
RPG.commands.dance = async function (cmd, ctx) {
  await RPG.ui.say(RPG.t('story.dance', { name: RPG.name('characters', cmd.dance) }));   // 語言檔：story: { dance: '{name} 跳起舞來了！' }
};
// 用法：{ dance: 'josh' }
```

## 圖塊、動畫、背景 `js/data/tiles.js`、`js/data/visuals.js`

圖塊會用 2 倍解析度畫，所以可以用 0.5 的座標畫出更細的像素（草葉、反光、木紋）。

```js
RPG.add('tiles', {
  lava: { encounter: true, frames: 2, light: { r: 2, color: 'rgba(255,120,40,A)' },
          draw: function (g, frame) { g.fillStyle = frame ? '#f04020' : '#f08020'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffe080'; g.fillRect(3, 4, 0.5, 0.5); } },
  // 會「站起來」的東西：tall = 往上多幾格，tallW = 寬度（樹冠可以比一格寬），drawTall 畫站著的部分
  pine: { solid: true, tall: 2, tallW: 24, draw: function (g) { /* 地面 */ },
          drawTall: function (g, frame, h) { g.fillStyle = '#2a6a3a'; g.beginPath(); g.moveTo(8, h - 46); g.lineTo(18, h - 8); g.lineTo(-2, h - 8); g.fill(); } }
});
RPG.add('anims', {
  stars: { frames: 20, sfx: 'magic', draw: function (g, x, y, p) { RPG.text('★', x, y - p * 20, { size: 12, color: '#ffd060' }); } }
});
RPG.add('backdrops', {
  beach: { grade: 'warm', draw: function (g, frame) { g.fillStyle = '#7cc4f4'; g.fillRect(0, 0, RPG.W, RPG.H); g.fillStyle = '#e8d8a0'; g.fillRect(0, 130, RPG.W, 110); } }
});
```

站起來的圖塊會和角色一起依照前後排序，所以角色可以走到樹後面，也會自動有影子。

## 商店 `js/data/config.js`

```js
RPG.add('shops', {
  beachShack: { keeper: 'shackOwner', items: ['juice', 'pizza', 'cap'], sellRate: 0.5 }   // keeper → npc.shackOwner
});
// 文字： shop: { beachShack: { name: '海邊小舖', greeting: '來點冰的嗎？', bye: '下次再來！' } }
```

## 遊戲設定 `js/data/config.js`

`RPG.config({ ... })` 裡可以改：開始地圖與位置、初始隊伍、初始金錢與道具、經驗值曲線 `expCurve(level)`、
開場劇情 `intro`（腳本）、結局 `ending`（key 陣列，一個 key 一頁），以及傷害公式 `damage(user, target, effect)`
（不寫就用 `js/effects.js` 的預設公式）。標題文字在語言檔的 `game.title`、`game.subtitle`。
