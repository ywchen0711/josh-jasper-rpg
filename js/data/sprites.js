/*
 * Pixel art. A sprite = { palette: { char: color }, frames: { pose: [rows, rows] } }  ('.' is transparent)
 * Walkers (people, the dog) have poses down / up / side (side faces right; left is mirrored), 2 frames each.
 * Battle sprites have a pose 'idle' with 2 frames.
 *
 * To add a person: reuse RPG.walker(KID, palette) with your own colors, or draw a new template.
 * To add an enemy: add { palette, frames: { idle: [frameA, frameB] } } and point the enemy's `sprite` at it.
 */
(function () {
  'use strict';

  // builds down/up/side poses with a 2nd walking frame (legs swapped)
  RPG.walker = function (t, palette) {
    function step(rows, legs) { var r = rows.slice(); legs.forEach(function (l) { r[l[0]] = l[1]; }); return r; }
    return {
      palette: palette,
      frames: {
        down: [t.down, step(t.down, t.downStep)],
        up: [t.up, step(t.up, t.upStep || t.downStep)],
        side: [t.side, step(t.side, t.sideStep)]
      }
    };
  };

  // H hair/cap, S skin, K eyes, M mouth, T shirt, P pants, B shoes, G backpack, W white
  var KID = {
    down: [
      '................',
      '.....HHHHHH.....',
      '....HHHHHHHH....',
      '....HHHHHHHH....',
      '....HSSSSSSH....',
      '....SKSSSSKS....',
      '....SSSSSSSS....',
      '.....SSMMSS.....',
      '......SSSS......',
      '....TTTTTTTT....',
      '...STTTTTTTTS...',
      '...STTTTTTTTS...',
      '....PPPPPPPP....',
      '....PPP..PPP....',
      '....BBB..BBB....',
      '................'
    ],
    downStep: [[13, '...PPP....PPP...'], [14, '...BBB.....BB...']],
    up: [
      '................',
      '.....HHHHHH.....',
      '....HHHHHHHH....',
      '....HHHHHHHH....',
      '....HHHHHHHH....',
      '....HHHHHHHH....',
      '....SHHHHHHS....',
      '.....SSSSSS.....',
      '......SSSS......',
      '....TTGGGGTT....',
      '...STGGGGGGTS...',
      '...STGGGGGGTS...',
      '....PPPPPPPP....',
      '....PPP..PPP....',
      '....BBB..BBB....',
      '................'
    ],
    side: [
      '................',
      '.....HHHHHH.....',
      '....HHHHHHHH....',
      '....HHHHHHHH....',
      '....HHHSSSSS....',
      '....HHSSSKSS....',
      '....HSSSSSSSS...',
      '.....SSSSMS.....',
      '......SSSS......',
      '....GTTTTTT.....',
      '....GTTTTTT.....',
      '....GTSSTTT.....',
      '.....PPPPPP.....',
      '.....PP..PP.....',
      '.....BB..BBB....',
      '................'
    ],
    sideStep: [[13, '....PP....PP....'], [14, '...BBB....BB....']]
  };
  RPG.KID = KID;

  // Mochi the puppy — F fur, W white, D outline, K eyes, N nose, R collar
  var DOG = {
    down: [
      '................',
      '................',
      '...DD......DD...',
      '...DFD....DFD...',
      '...DFFFFFFFFD...',
      '..DFFFFFFFFFFD..',
      '..DFKFFFFFFKFD..',
      '..DFFFWWWWFFFD..',
      '...DFWWNNWWFD...',
      '....DWWWWWWD....',
      '....RRRRRRRR....',
      '...FFFFFFFFFF...',
      '...FFWWWWWWFF...',
      '...FF.FFFF.FF...',
      '...WW.WWWW.WW...',
      '................'
    ],
    downStep: [[13, '...FF..FF..FF...'], [14, '...WW..WW..WW...']],
    up: [
      '................',
      '................',
      '...DD......DD...',
      '...DFD....DFD...',
      '...DFFFFFFFFD...',
      '..DFFFFFFFFFFD..',
      '..DFFFFFFFFFFD..',
      '..DFFFFFFFFFFD..',
      '...DFFFFFFFFD...',
      '....DFFFFFFD....',
      '....RRRRRRRR....',
      '...FFFFFFFFFF...',
      '...FFFFFFFFFF...',
      '...FF.FFFF.FF...',
      '...WW.WWWW.WW..F',
      '...............F'
    ],
    side: [
      '................',
      '................',
      '................',
      '..........DD....',
      '.........DFFD...',
      '........DFFFFD..',
      '..F.....DFKFFWD.',
      '.FF.....DFFFWWN.',
      '.FF.....RRRWWD..',
      '.FFFFFFFFFFFF...',
      '..FFFFFFFFFFF...',
      '..FFWWWWWWWFF...',
      '..FF.FF..FF.FF..',
      '..WW.WW..WW.WW..',
      '................',
      '................'
    ],
    sideStep: [[12, '..FF..FF.FF..FF.'], [13, '..WW..WW.WW..WW.']]
  };

  var CHEST_C = ['................', '................', '..KKKKKKKKKKKK..', '.KbbbbbbbbbbbbK.', '.KbBBBBBBBBBBbK.', '.KbbbbbbbbbbbbK.',
    '.KYYYYYYYYYYYYK.', '.KbbbbbYYbbbbbK.', '.KBBBBBYYBBBBBK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '................', '................', '................'];
  var CHEST_O = ['................', '..KKKKKKKKKKKK..', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '.K............K.', '.K............K.',
    '.KYYYYYYYYYYYYK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KBBBBBBBBBBBBK.', '.KbbbbbbbbbbbbK.', '.KKKKKKKKKKKKKK.', '................', '................', '................'];

  // ---- enemies (2 frames each) ----
  function two(a, legs) { var b = a.slice(); (legs || []).forEach(function (l) { b[l[0]] = l[1]; }); return [a, b]; }
  var LIZARD = two(['................', '................', '................', '................', '................', '..........BBBB..', '.........BKBBBB.',
    'BB......BBBBBB..', '.BBBBBBBBBBBNN..', '..BBBBBNNNNBB...', '...BBBBBBBBB....', '...b..b..b..b...', '..b..b..b..b....', '................', '................', '................'],
    [[11, '..b..b..b..b....'], [12, '...b..b..b..b...']]);
  var GULL = [['................', '.GG..........GG.', '..GGG......GGG..', '...GGGG..GGGG...', '....GWWWWWWG....', '.YKWWWWWWWWWGG..',
    'YY..WWWWWWWW.G..', '......WWWW......', '......Y..Y......', '................', '................', '................', '................', '................', '................', '................'],
    ['................', '................', '................', '................', '....GWWWWWWG....', '.YKWWWWWWWWWGG..', 'YY.GWWWWWWWGG...',
    '..GGG.WWWW.GGG..', '.GG...Y..Y..GG..', '................', '................', '................', '................', '................', '................', '................']];
  var RACCOON = two(['................', '...GG......GG...', '..GgGG....GGgG..', '..GGGGGGGGGGGG..', '.GGWWGGGGGGWWGG.', '.GKKKKGGGGKKKKG.',
    '.GKWKKGGGGKKWKG.', '.GGKKGGWWGGKKGG.', '..GGGGWWWWGGGG..', '...GGGWNNWGGG...', '....GGGGGGGG..GK', '...GGGGGGGGGGGKG', '..GGGGGGGGGGG.GK',
    '..GG.GGGGGG.GG..', '..KK.GG..GG.KK..', '................'], [[13, '..GG..GGGG..GG..'], [14, '..KK..KK..KK....']]);
  var BEE = two(['................', '.....WW..WW.....', '....WWWWWWWW....', '.....WW..WW.....', '....KKKKKKK.....', '...YYKYYKYYK....',
    '..KYYKYYKYYKY...', '..KYKYYKYYKYYK..', '..KYYKYYKYYKY.S.', '...YYKYYKYYK....', '....KKKKKKK.....', '.....K...K......', '................',
    '................', '................', '................'], [[1, '................'], [2, '....WW....WW....'], [3, '...WWWW..WWWW...']]);
  var HOMEWORK = two(['................', '...WWWWWWWWW....', '...WLLLLLLLWW...', '...WWWWWWWWWWW..', '...WLLLLLLLLLW..', '...WWKWWWWKWWW..',
    '...WWWKWWKWWWW..', '...WLLLLLLLLLW..', '...WWWRRRRWWWW..', '...WWRWWWWRWWW..', '...WLLLLLLLLLW..', '...WWWWWWWWWWW..', '...WRRWWWWWWWW..',
    '...WRRWWWWWWWW..', '...WWWWWWWWWWW..', '................'], [[1, '....WWWWWWWWW...'], [2, '....WLLLLLLLWW..']]);
  var BOOK = two(['................', '................', '..RRRRRRRRRRRR..', '..RYYYYYYYYYYR..', '..RYRRRRRRRRYR..', '..RYRKWRRWKRYR..',
    '..RYRRKRRKRRYR..', '..RYRRRRRRRRYR..', '..RWWWWWWWWWWR..', '..RWTWTWTWTWWR..', '..RKKKKKKKKKKR..', '..RWTWTWTWTWWR..', '..RWWWWWWWWWWR..',
    '..RRRRRRRRRRRR..', '................', '................'], [[10, '..RWWWWWWWWWWR..']]);
  var CLOCK = two(['................', '..KK........KK..', '.KYYK......KYYK.', '..KKKKKKKKKKKK..', '..KWWWWWWWWWWK..', '.KWWWWWKWWWWWWK.',
    '.KWWKWWKWWWKWWK.', '.KWWWWWKWWWWWWK.', '.KWWWWWKKKKWWWK.', '.KWWKWWWWWWKWWK.', '.KWWWWWWWWWWWWK.', '..KWWWRRRRWWWK..', '..KKKKKKKKKKKK..',
    '...KK......KK...', '................', '................'], [[1, '.KK..........KK.'], [2, 'KYYK........KYYK']]);
  var SLIME = two(['................', '................', '................', '................', '................', '......GGGG......',
    '....GGGGGGGG....', '...GGLGGGGGGG...', '..GGLLGGGGGGGG..', '..GGGKGGGGKGGG..', '.GGGGKGGGGKGGGG.', '.GGGGGGGGGGGGGG.', 'GGGGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGG', '.GGGGGGGGGGGGGG.', '................'], [[5, '................'], [6, '.....GGGGGG.....'], [7, '...GGLGGGGGGG...']]);
  var ROBOVAC = two(['................', '................', '................', '................', '................', '......aa........',
    '.......a........', '....MMMMMMMM....', '...MMMMMMMMMM...', '..MMMLLLLLLMMM..', '..MMLRKLLRKLMM..', '..MMMLLLLLLMMM..', '..GGGGGGGGGGGG..',
    '..KKKKKKKKKKKK..', '...KK......KK...', '................'], [[14, '....KK....KK....']]);
  var BAT = two(['................', '................', 'K..............K', 'KK....K..K....KK', 'KKK...KKKK...KKK', 'KKKK.KKKKKK.KKKK',
    'KKKKKKRKKRKKKKKK', '.KKKKKKKKKKKKKK.', '..KKK.KWWK.KKK..', '...K...KK...K...', '................', '................', '................',
    '................', '................', '................'], [[2, '................'], [3, '......K..K......'], [4, '.KK...KKKK...KK.'], [5, 'KKKK.KKKKKK.KKKK']]);
  var CROW = [GULL[0].map(function (r) { return r; }), GULL[1].map(function (r) { return r; })];
  var KING = two(['....Y.Y..Y.Y....', '....YYYYYYYY....', '...GGYRYYRYGG...', '..GgGGGGGGGGgG..', '..GGGGGGGGGGGG..', '.GGWWGGGGGGWWGG.',
    '.GKKKKGGGGKKKKG.', '.GKWKKGGGGKKWKG.', '.GGKKGGWWGGKKGG.', 'PPGGGGWWWWGGGGPP', 'PPPGGGWNNWGGGPPP', 'PPPPGGGGGGGGPPPP', 'PPPGGGGGGGGGGPPP',
    'PPGGGGGGGGGGGGPP', '..GG.GGGGGG.GG..', '..KK.KK..KK.KK..'], [[0, '...Y.Y..Y.Y.....'], [14, '..GG..GGGG..GG..']]);

  RPG.add('sprites', {
    // party
    josh:   RPG.walker(KID, { H: '#2e9e44', S: '#f6c79a', K: '#202020', M: '#b04030', T: '#46c460', P: '#2a4fa8', B: '#4a2a14', G: '#2e7a3a' }),
    jasper: RPG.walker(KID, { H: '#15110e', S: '#f0c49a', K: '#202020', M: '#ffffff', T: '#3c403d', P: '#a8c4e0', B: '#1c1c1c', G: '#9aa0a8' }),
    mochi:  RPG.walker(DOG, { F: '#e8b878', W: '#fff6ea', D: '#6a4a2a', K: '#202020', N: '#202020', R: '#d83a3a' }),
    // townsfolk (palettes are swapped per NPC in maps.js with `palette: { ... }`)
    kid:    RPG.walker(KID, { H: '#6a3a1a', S: '#f0c49a', K: '#202020', M: '#b04030', T: '#d84a4a', P: '#2a3a6a', B: '#3a2a1a', G: '#7a5a3a' }),
    adult:  RPG.walker(KID, { H: '#4a2a14', S: '#f0c49a', K: '#202020', M: '#b04030', T: '#5a7ab8', P: '#3a3a4a', B: '#2a2a2a', G: '#5a7ab8' }),
    coyote: RPG.walker(KID, { H: '#b88a5a', S: '#d8b088', K: '#202020', M: '#f4ead8', T: '#2a64b8', P: '#2a64b8', B: '#3a2a1a', G: '#2a64b8' }),
    chest:  { palette: { K: '#2a1808', b: '#a0622a', B: '#7a4418', Y: '#f0c040' }, frames: { closed: [CHEST_C], open: [CHEST_O] } },
    // enemies
    lizard:  { palette: { B: '#9a7a48', K: '#000', N: '#3a6ad0', b: '#5a4020' }, frames: { idle: LIZARD } },
    gull:    { palette: { G: '#9aa4b0', W: '#ffffff', Y: '#f0b020', K: '#000' }, frames: { idle: GULL } },
    crow:    { palette: { G: '#202028', W: '#3a3a48', Y: '#f0b020', K: '#ff4040' }, frames: { idle: CROW } },
    raccoon: { palette: { G: '#7a7a82', g: '#4a4a52', W: '#e8e8e8', K: '#202024', N: '#000' }, frames: { idle: RACCOON } },
    bee:     { palette: { W: '#d8f0ff', K: '#202020', Y: '#f8c820', S: '#202020' }, frames: { idle: BEE } },
    homework:{ palette: { W: '#f8f8f0', L: '#80a8e0', K: '#202020', R: '#e03030' }, frames: { idle: HOMEWORK } },
    book:    { palette: { R: '#a02828', Y: '#f0c860', K: '#202020', W: '#f8f0e0', T: '#e8e0d0' }, frames: { idle: BOOK } },
    clock:   { palette: { K: '#202020', Y: '#e0c040', W: '#f8f8f0', R: '#e03030' }, frames: { idle: CLOCK } },
    slime:   { palette: { G: '#6ad050', L: '#c0ffb0', K: '#000' }, frames: { idle: SLIME } },
    robovac: { palette: { M: '#9aa4b0', L: '#80e0ff', R: '#ff3030', K: '#202024', G: '#5a6470', a: '#f04040' }, frames: { idle: ROBOVAC } },
    bat:     { palette: { K: '#2a2034', R: '#ff3040', W: '#ffffff' }, frames: { idle: BAT } },
    king:    { palette: { G: '#7a7a82', g: '#4a4a52', W: '#e8e8e8', K: '#202024', N: '#000', Y: '#f0c030', R: '#e03030', P: '#7a2a9a' }, frames: { idle: KING } }
  });
})();
