/*
 * Game settings, the opening scene, the ending, shops, and the default map legend.
 * The title, every line of the intro/ending and shop texts are keys into js/lang/*.js.
 */
(function () {
  'use strict';

  RPG.config({
    titleSprites: [{ sprite: 'josh' }, { sprite: 'coyote' }, { sprite: 'jasper' }],
    startParty: ['josh', 'jasper'],
    startMap: 'home', startX: 4, startY: 5, startDir: 'down',
    startGold: 30,
    startItems: { cookie: 2 },
    maxLevel: 30,
    expCurve: function (level) { return Math.round(8 * Math.pow(level - 1, 1.9)); },

    // played once when a new game starts
    intro: [
      { say: 'intro.1' },
      { say: 'intro.2', name: 'mom' },
      { say: 'intro.3', name: 'josh' },
      { say: 'intro.4', name: 'jasper' },
      { say: 'intro.5', name: 'mom' },
      { give: 'cookie', count: 3 },
      { say: 'intro.6', name: 'mom' },
      { say: 'intro.7' }
    ],

    // ending pages (text keys)
    ending: ['ending.1', 'ending.2', 'ending.3', 'ending.4', 'ending.5', 'ending.6'],

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

  // shops: { keeper (speaker key), items: [ids], sellRate }
  //   texts: shop.<id>.name, shop.<id>.greeting, shop.<id>.bye (greeting / bye are optional)
  RPG.add('shops', {
    schoolStore: { keeper: 'clerk',
                   items: ['cookie', 'juice', 'milk', 'bandaid', 'waterBalloon', 'popRocks', 'whoopee', 'stick', 'hoodie', 'eraser', 'chewToy', 'dogVest'] },
    coachShed:   { keeper: 'coach',
                   items: ['bat', 'sneakers', 'uniform', 'raincoat', 'magicPencil', 'bell', 'sticker', 'bento'] },
    vending:     { keeper: null,
                   items: ['cookie', 'juice', 'milk', 'bandaid', 'waterBalloon'] }
  });
})();
