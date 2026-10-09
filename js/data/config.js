/*
 * Game settings, the opening scene, the ending, shops, and the default map legend.
 * The title, every line of the intro/ending and shop texts are keys into js/lang/*.js.
 */
(function () {
  'use strict';

  RPG.config({
    titleSprites: [{ sprite: 'mia' }, { sprite: 'josh' }, { sprite: 'coyote' }, { sprite: 'jasper' }, { sprite: 'ethan' }, { sprite: 'mochi' }],
    startParty: ['josh', 'jasper'],
    startMap: 'home', startX: 4, startY: 5, startDir: 'down',
    startGold: 30,
    startItems: { cookie: 2 },
    maxLevel: 30,
    expCurve: function (level) { return Math.round(8 * Math.pow(level - 1, 1.9)); },

    // played once when a new game starts
    intro: [
      { chapter: 1 },
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
    ending: ['ending.1', 'ending.2', 'ending.3', 'ending.7', 'ending.4', 'ending.8'],
    // the card after the ending: "Chapter 1 complete" and a peek at what's next
    endingCard: { top: 'chapter.1.end', big: 'chapter.1.name', sub: 'chapter.2.teaser' },

    // default characters for map rows; a map can add or override entries with its own `legend`
    legend: {
      '.': 'grass', ',': 'flowers', '"': 'tallgrass', 'p': 'path', 'R': 'road', '-': 'roadLine', 's': 'sidewalk', '~': 'water',
      'T': 'tree', 'O': 'oak', 'P': 'palm', 'b': 'bush', 'f': 'fence', '^': 'roof', 'H': 'houseWall', 'w': 'window', 'D': 'door', '!': 'sign',
      '_': 'sand', 'r': 'rock', 'C': 'cliff', 'c': 'cactus', 'g': 'sage',
      '=': 'floorWood', 'u': 'rug', '#': 'wallIn', 'K': 'counter', 'Y': 'table', 'B': 'bed', 'S': 'shelf', 'V': 'tv',
      'k': 'blacktop', 'h': 'hopscotch', 'X': 'schoolWall', 'x': 'schoolWin', 'E': 'schoolDoor', 'L': 'lunchTable', 'Q': 'snackBar',
      'F': 'field', 'l': 'fieldLine', 'J': 'flagpole',
      'a': 'carpet', 'Z': 'libWall', 'm': 'labFloor', 'd': 'labDesk', 'M': 'machine',
      'q': 'caveFloor', 'W': 'caveWall', 't': 'trash', ' ': 'dark',
      'z': 'crosswalk', 'i': 'lamp', 'A': 'roofSlate', 'G': 'roofBrown', 'N': 'roofNavy'
    }
  });

  // shops: { keeper (speaker key), items: [ids], sellRate }
  //   texts: shop.<id>.name, shop.<id>.greeting, shop.<id>.bye (greeting / bye are optional)
  RPG.add('shops', {
    schoolStore: { keeper: 'clerk',
                   items: ['cookie', 'fries', 'juice', 'milk', 'energyBar', 'bandaid', 'rainbowCandy', 'waterBalloon', 'popRocks', 'stinkBomb', 'superGlue', 'whoopee',
                           'stick', 'hoodie', 'eraser', 'comfySocks', 'chewToy', 'dogVest', 'bandana'] },
    coachShed:   { keeper: 'coach',
                   items: ['bat', 'dodgeball', 'proBall', 'screwdriver', 'zapper', 'magicPencil', 'kneePads', 'uniform', 'raincoat', 'labCoat',
                           'sneakers', 'headband', 'goggles', 'bell', 'sticker', 'bento'] },
    vending:     { keeper: null,
                   items: ['cookie', 'fries', 'juice', 'milk', 'energyBar', 'bandaid', 'waterBalloon'] },
    iceCreamTruck: { keeper: 'iceCream',
                   items: ['iceCream', 'bobaTea', 'rainbowCandy', 'energyBar', 'sunHat', 'friendBracelet', 'sticker'] }
  });
})();
