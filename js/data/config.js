/*
 * Game settings, the opening scene, the ending, shops, and the default map legend.
 */
(function () {
  'use strict';

  RPG.config({
    title: 'Josh & Jasper 大冒險',
    subtitle: '～ 郊狼獎盃不見了！～',
    titleSprites: [{ sprite: 'josh' }, { sprite: 'coyote' }, { sprite: 'jasper' }],
    startParty: ['josh', 'jasper'],
    startMap: 'home', startX: 4, startY: 5, startDir: 'down',
    startGold: 30,
    startItems: { cookie: 2 },
    maxLevel: 30,
    expCurve: function (level) { return Math.round(8 * Math.pow(level - 1, 1.9)); },
    gameOverText: '大家都累倒了……',

    // played once when a new game starts
    intro: [
      { say: '（今天是 Sage Canyon 小學的運動會！）' },
      { say: 'Josh！Jasper！還在睡喔？今天是運動會耶！', name: '媽媽' },
      { say: '交給我！我已經準備好拿冠軍了！', name: 'Josh' },
      { say: '我也是！我的牙齒掉了，跑步會比較快！', name: 'Jasper' },
      { say: '……那是什麼道理。路上肚子餓就吃這個吧。', name: '媽媽' },
      { give: 'cookie', count: 3 },
      { say: '從家門出去，往東走就是學校。累了就回來找媽媽休息喔。', name: '媽媽' },
      { say: '（按 C 打開選單，Z 對話或調查，X 取消）' }
    ],

    ending: [
      '校長把郊狼獎盃高高舉起，全校響起歡呼：「GO COYOTES！」',
      '浣熊大王和小浣熊們被請去當運動會的吉祥物助理，聽說牠們跑很快。',
      'Josh 拿到了賽跑第一名，Jasper 的小蘇打火山得到科展特別獎。',
      '麻糬咬著獎牌，在操場上跑了十圈。',
      '「明天還會有什麼冒險呢？」兄弟倆一邊吃便當一邊想。',
      '～ THE END ～　謝謝你的遊玩！'
    ],

    // default characters for map rows; a map can add or override entries with its own `legend`
    legend: {
      '.': 'grass', ',': 'flowers', '"': 'tallgrass', 'p': 'path', 'R': 'road', '-': 'roadLine', 's': 'sidewalk', '~': 'water',
      'T': 'tree', 'O': 'oak', 'P': 'palm', 'b': 'bush', 'f': 'fence', '^': 'roof', 'H': 'houseWall', 'w': 'window', 'D': 'door', '!': 'sign',
      '_': 'sand', 'r': 'rock', 'C': 'cliff', 'c': 'cactus', 'g': 'sage',
      '=': 'floorWood', 'u': 'rug', '#': 'wallIn', 'K': 'counter', 'Y': 'table', 'B': 'bed', 'S': 'shelf', 'V': 'tv',
      'k': 'blacktop', 'h': 'hopscotch', 'X': 'schoolWall', 'x': 'schoolWin', 'E': 'schoolDoor', 'L': 'lunchTable', 'Q': 'snackBar',
      'F': 'field', 'l': 'fieldLine', 'J': 'flagpole',
      'a': 'carpet', 'Z': 'libWall', 'm': 'labFloor', 'd': 'labDesk', 'M': 'machine',
      'q': 'caveFloor', 'W': 'caveWall', 't': 'trash', ' ': 'dark'
    }
  });

  // shops: { name, keeper, greeting, bye, items: [ids], sellRate }
  RPG.add('shops', {
    schoolStore: { name: '學校福利社', keeper: '福利社阿姨', greeting: '歡迎光臨！今天運動會，餅乾特價喔～', bye: '加油喔！',
                   items: ['cookie', 'juice', 'milk', 'bandaid', 'waterBalloon', 'popRocks', 'whoopee', 'stick', 'hoodie', 'eraser', 'chewToy', 'dogVest'] },
    coachShed:   { name: '體育器材室', keeper: 'Coach', greeting: '要上場就要有好裝備！', bye: '記得熱身！',
                   items: ['bat', 'sneakers', 'uniform', 'raincoat', 'magicPencil', 'bell', 'sticker', 'bento'] },
    vending:     { name: '自動販賣機', keeper: null, greeting: '（嗶——投幣口閃著綠光。）', bye: null,
                   items: ['cookie', 'juice', 'milk', 'bandaid', 'waterBalloon'] }
  });
})();
