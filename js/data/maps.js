/*
 * Maps. Each map:
 *   rows (one character per tile, see the legend in config.js), legend (extra/override characters)
 *   bg, tint, backdrop (battle background)        — the map's name is the text key map.<id>.name
 *   warps:      [{ x, y, to: mapId, tx, ty, dir, if }]
 *   npcs:       [{ id, x, y, sprite, palette, dir, name, wander, solid, showIf, hideIf, script }]
 *                 name is a speaker key: npc.<name> in js/lang/*.js (or a party member id like 'josh')
 *   events:     [{ x, y, trigger: 'touch' | 'action', if, once: 'flag', script }]
 *   chests:     [{ x, y, item, count, gold, flag }]
 *   encounters: { rate, minSteps, anywhere, if, troops: [[troopId, weight], ...] }
 * Scripts are lists of commands (js/script.js) whose text is keys into js/lang/*.js, e.g. { say: 'home.mom.rest' }.
 * Conditions: 'flag', '!flag', { item }, { member }, ...   Hide an NPC from a script with { hide: 'npcId' }.
 *
 * HD-2D look (all optional, used when effects are on):
 *   ambient     0..1 darkness, lit by lights      lights: [{ x, y, r (tiles), color: 'rgba(255,200,120,A)' }]
 *   playerLight radius in tiles of a light that follows the party (caves)
 *   particles   'leaves' | 'dust' | 'fireflies' | 'motes'
 *   grade       'warm' | 'cool' | 'dusk' | 'night'      bloom 0..1      vignette 0..1
 */
(function () {
  'use strict';
  var PAL = {
    mom:       { H: '#5a3418', T: '#e07090', P: '#3a3a5a', G: '#e07090' },
    principal: { H: '#a0a0a8', T: '#2a64b8', P: '#2a2a3a', G: '#2a64b8' },
    nurse:     { H: '#2a1a10', T: '#f0f0f0', P: '#9ad0f0', G: '#f0f0f0' },
    clerk:     { H: '#6a3a1a', T: '#f0a040', P: '#5a4a3a', G: '#f0a040' },
    coach:     { H: '#2a2a2a', T: '#d84040', P: '#2a2a3a', G: '#d84040' },
    ranger:    { H: '#5a3a1a', T: '#7a8a3a', P: '#5a4a2a', G: '#7a8a3a' },
    librarian: { H: '#8a5a2a', T: '#9a5ac8', P: '#3a3a4a', G: '#9a5ac8' },
    kidA:      { H: '#2a1a10', T: '#4a9ad8', P: '#3a3a4a' },
    kidB:      { H: '#c89040', T: '#e05a8a', P: '#5a3a6a' },
    kidC:      { H: '#1a1a1a', T: '#f0d040', P: '#2a4a2a' },
    oldman:    { H: '#e0e0e0', T: '#8a6a4a', P: '#4a4a4a', G: '#8a6a4a' },
    guard:     { H: '#3a2a1a', T: '#f0e040', P: '#3a3a5a', G: '#f0e040' }
  };
  var WARM = 'rgba(255,196,120,A)', COOL = 'rgba(140,200,255,A)', SUN = 'rgba(255,236,190,A)';

  RPG.add('maps', {
    // ======================= home =======================
    home: {
      bg: '#2a1a10', backdrop: 'home',
      ambient: 0.22, particles: 'motes', grade: 'warm', bloom: 0.4,
      lights: [{ x: 4, y: 1, r: 4, color: SUN }, { x: 11, y: 1, r: 3.5, color: WARM }, { x: 2, y: 4, r: 2.5, color: COOL }, { x: 6, y: 7, r: 3, color: SUN }],
      rows: [
        '##############',
        '#BB==S===KKKK#',
        '#BB======K===#',
        '#====uuuu====#',
        '#=V==uuuu==Y=#',
        '#====uuuu====#',
        '#============#',
        '#S==========S#',
        '######=#######'
      ],
      warps: [{ x: 6, y: 8, to: 'street', tx: 20, ty: 10, dir: 'down' }],
      chests: [{ x: 12, y: 6, item: 'eraser', flag: 'chest_home' }],
      npcs: [
        { id: 'mom', x: 11, y: 2, sprite: 'adult', palette: PAL.mom, name: 'mom', dir: 'left', script: [
          { if: 'got_trophy', then: [{ say: 'home.mom.trophy' }], 'else': [{ say: 'home.mom.rest' }] },
          { inn: 0, text: 'home.mom.rested' }
        ] }
      ],
      events: [
        { x: 2, y: 4, trigger: 'action', script: [{ say: 'home.tv' }] }
      ]
    },

    // ======================= the neighborhood =======================
    // Laid out after the real streets around Sage Canyon School (Carmel Valley, San Diego):
    // Foxhound Way (home), Carmel Mountain Rd (the big divided road), Cherry Hill Dr, Harvest Run Dr,
    // Spur Point Ct, Hunters Glen Dr, Quaker Hill Ln, Whispering Hills Ln, Sage Canyon Park and the school.
    street: {
      bg: '#5c9c48', backdrop: 'street',
      particles: 'leaves', grade: 'warm', bloom: 0.32, vignette: 0.45,
      rows: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTpppTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T..sRRs....sRRs.."b""T"...""""b"ppp.""....T.."""T..........T',
        'T..sRRsAAA.sRRs...."".".."".""".ppp""""."""."".""..GGG.AAA.T',
        'T..sRRswHw.sRRs...bT"..""""T....ppp.."..."""b"."T..wHw.wHw.T',
        'T..sRRs....sRRs..T".""T.""TRRRRTpppb"."."""T"".."..........T',
        'T..sRRs^^^.sRRs..T""""."T."RRRR.ppp"..."....".."...GGG.^^^.T',
        'T..sRRswHw.sRRs...T...TGGG.TRR".ppp.T.b..."."."....wHw.wHw.T',
        'T..sRRs....sRRs........wHw..RR.!ppp........................T',
        'T..sRRsAAA.sRRsGGG.NNN.AAA..RR..ppp.GGG.^^^.AAA.GGG.AAA....T',
        'T..sRRswHw.sRRswHw.wDw.wDw..RR.ipppiwHw.wHw.wHw.wHw.wHw....T',
        'T..sRRssssssRRssssssssssssssRRsssssssssssssssssssssssssss..T',
        'T..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR..T',
        'T..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR..T',
        'T..sRRssssssRRsssssssssssssssssssssssssssssssssssssssssss..T',
        'T..sRR.AAA.sRRsGGG.^^^.AAA.GGG.AAA.^^^.GGG.^^^.AAA.GGG.....T',
        'T..sRR.wHw.sRRswHw.wHw.wHw.wHw.wHw.wHw.wHw.wHw.wHw.wHw.....T',
        'T..sRR.....sRRs............................................T',
        'Tb.sRR.b..bsRRs.b..b..b..b..b..b..b..b..b..b..b..b..b..b...T',
        'TsssRRssssssRRsssssssssssssssssssssssssssssssssssssssssssssT',
        'TRRRRRzRRRRRRRzRRRRRRRRRRRRRRRRRRRRRRRRRRzRRRRRRRRRRRRRRRRRT',
        'T--RRRz-----RRz--------------------------zRR---------------T',
        'T,,sRRz,,,,,RRz,,,,,,,,,,,,,,,,,,,,,,,,,,zRR,,,,,,,,,,,,,,,T',
        'T--RRRz-----RRz--------------------------zRR---------------T',
        'TRRRRRzRRRRRRRzRRRRRRRRRRRRRRRRRRRRRRRRRRzRRRRRRRRRRRRRRRRRT',
        'TsssRRssssssssssssssssssssssssssssssssssssRRsssssssssssssssT',
        'T..sRR...i..DH.p....i.T.iXXXXXXXXXXXXXXXisRRs..............T',
        'T..sRR..T......pT!.,....kxxxxxxXEXxxxxxxksRRsssssssssssssssT',
        'T..sRR....ppppppppppp...kkkkkkkkkkkkkkkkksRRRRRRRRRRRRRRRRRT',
        'T..sRR...,.....p........kkkkkkkkkkkkkkkkksRRRRRRRRRRRRRRRRRT',
        'T..sRR.....T...p.....T..kkkLLkkkkkkkJkkkksRR.ssssss."T"."".T',
        'T..sRR.T......,p....,...kkkkkkkkkkkkkkkkksRR.GGG.^^^"AAA.T.T',
        'T..sRRssssssssssssssssssssssssssssssssssssRRswHwswHw"wHw"".T',
        'T..sRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.".....".T',
        'T..sRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.."b"."..T',
        'T.....ssssssssssssssssssssssssssssssssssssssssssRR."T""..".T',
        'T.................RR.^^^.GGG......AAA.GGG.AAA..sRRs""......T',
        'T......RRRRRRRRRRRRR.wHw.wHw......wHw.wHw.wHw..sRRs""."T.""T',
        'T......RRRRRRRRRRRRR...........................sRRs"""T...bT',
        'T.b"..AAA.^^^.GGG.RR.""TT""."b"."T..T"".""".Tb"sRRs.."T.""TT',
        'T.."..wHw.wHw.wHw.RRGGG"..T.""."."."""""..T""".sRRs.T"""...T',
        'T".b..............RRwHw"."..""""."."..""".""bT"sRRs"""T"...T',
        'T."...............RR..".""""T".""""TT....."""".sRRs"...""T.T',
        'T..T.............RRRR..b""."."."".."""".."".""TsRRs."."".""T',
        'T."..............RRRR""."".""T...""T""...""".".sRRs""T"".b.T',
        'TT.".................""."""TT"bT."..."...".."""sRRsT."T"...T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
      ],
      warps: [
        { x: 20, y: 9, to: 'home', tx: 6, ty: 7, dir: 'up' },
        { x: 32, y: 0, to: 'canyon', tx: 13, ty: 19, dir: 'up' }, { x: 33, y: 0, to: 'canyon', tx: 14, ty: 19, dir: 'up' }, { x: 34, y: 0, to: 'canyon', tx: 14, ty: 19, dir: 'up' },
        { x: 32, y: 26, to: 'school', tx: 1, ty: 8, dir: 'right' }
      ],
      encounters: { rate: 0.07, troops: [['lizard', 4], ['lizards', 2], ['bees', 1]] },      // only in the tall grass of the open space
      events: [
        { x: 24, y: 9, trigger: 'touch', script: [{ say: 'street.neighborDoor' }] },
        { x: 12, y: 25, trigger: 'touch', script: [{ say: 'street.restroom' }] },
        { x: 17, y: 26, trigger: 'action', script: [{ say: 'street.parkSign' }] },
        { x: 31, y: 7, trigger: 'action', script: [{ say: 'street.trailSign' }] },
        { x: 16, y: 16, trigger: 'action', script: [{ say: 'street.signFoxhound' }] },
        { x: 2, y: 17, trigger: 'action', script: [{ say: 'street.signCarmel' }] },
        { x: 45, y: 25, trigger: 'action', script: [{ say: 'street.signHunters' }] }
      ],
      chests: [{ x: 22, y: 26, item: 'cookie', count: 2, flag: 'chest_park' }, { x: 54, y: 41, item: 'juice', flag: 'chest_hills' }],
      npcs: [
        { id: 'mochi', x: 18, y: 28, sprite: 'mochi', name: 'puppy', wander: 2, hideIf: { member: 'mochi' }, script: [
          { say: 'street.mochi.see', name: null },
          { if: { item: 'cookie' }, then: [
            { choice: ['street.mochi.give', 'street.mochi.pet'], text: 'street.mochi.stare', name: null, then: [
              [{ take: 'cookie' }, { say: 'street.mochi.woof', name: 'mochi' }, { say: 'street.mochi.follows', name: null },
               { say: 'street.mochi.jasper', name: 'jasper' }, { join: 'mochi' }],
              [{ say: 'street.mochi.wag', name: null }]
            ] }
          ], 'else': [{ say: 'street.mochi.hungry', name: null }] }
        ] },
        { id: 'oldman', x: 30, y: 13, sprite: 'adult', palette: PAL.oldman, name: 'oldman', wander: 3, script: [
          { say: 'street.oldman' }
        ] },
        { id: 'kid1', x: 26, y: 13, sprite: 'kid', palette: PAL.kidA, name: 'neighborKid', wander: 2, script: [
          { say: ['street.kid.1', 'street.kid.2'] }
        ] },
        { id: 'jogger', x: 25, y: 24, sprite: 'adult', palette: PAL.kidC, name: 'jogger', wander: 4, script: [
          { say: 'street.jogger' }
        ] },
        { id: 'guard', x: 15, y: 24, sprite: 'adult', palette: PAL.guard, name: 'guard', script: [
          { say: 'street.guard' }
        ] }
      ]
    },

    // ======================= the canyon trail =======================
    canyon: {
      bg: '#a07850', backdrop: 'canyon',
      particles: 'dust', grade: 'warm', bloom: 0.3, vignette: 0.55,
      lights: [{ x: 16, y: 17, r: 2, color: 'rgba(120,255,160,A)' }],
      rows: [
        'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        'CCCCCqCCCCCCCCCCCCCCCCCCCCCCCC',
        'CCCC_p_CCC__gg___O___ggg__CCCC',
        'CC___p_gg___r__gggg____c___gCC',
        'C__ggp__gggg______O__gggg___CC',
        'C_gggpppppppppp___ggg____gg__C',
        'C_gg_r____gg__p_c___gggg___O_C',
        'C__ggg_____gg_p___~~~~__gg___C',
        'C_ggggg__r____p__~~~~~~__ggg_C',
        'C__ggg____O___p___~~~~___gg__C',
        'C______gggg___p____________r_C',
        'C_O__gggggg___ppppppp___gggg_C',
        'C___ggggg_____p_____p__ggggg_C',
        'C__c__________p_____p___gg___C',
        'C_gggg___r____p__O__p__ggg_c_C',
        'C_gggggg______p_____p_____g__C',
        'C___gg____c___ppppppp___O____C',
        'C_O_______gg__p_M__ggg_______C',
        'C____ggg______p_______gg___r_C',
        'CCCCCCCCCCCCC_p_CCCCCCCCCCCCCC',
        'CCCCCCCCCCCCC_p_CCCCCCCCCCCCCC'
      ],
      legend: { 'q': 'caveFloor' },
      warps: [
        { x: 14, y: 20, to: 'street', tx: 33, ty: 1, dir: 'down' },
        { x: 5, y: 1, to: 'cave', tx: 11, ty: 10, dir: 'up' }
      ],
      encounters: { rate: 0.12, troops: [['lizard', 4], ['lizards', 3], ['gull', 3], ['bees', 2], ['crows', 1], ['canyonMix', 1]] },
      chests: [
        { x: 26, y: 3, item: 'juice', flag: 'chest_canyon1' },
        { x: 1, y: 10, item: 'sneakers', flag: 'chest_canyon2' },
        { x: 27, y: 15, gold: 40, flag: 'chest_canyon3' }
      ],
      events: [
        { x: 16, y: 17, trigger: 'action', script: [{ shop: 'vending' }] }
      ],
      npcs: [
        { id: 'ranger', x: 5, y: 2, sprite: 'adult', palette: PAL.ranger, name: 'ranger', hideIf: 'clue_fur', script: [
          { if: 'quest', then: [{ say: 'canyon.ranger.quest' }], 'else': [{ say: 'canyon.ranger.keepOut' }] }
        ] },
        { id: 'ranger2', x: 4, y: 3, sprite: 'adult', palette: PAL.ranger, name: 'ranger', showIf: 'clue_fur', script: [
          { say: 'canyon.ranger.fur' }
        ] },
        { id: 'hiker', x: 20, y: 10, sprite: 'adult', palette: PAL.kidB, name: 'hiker', wander: 2, script: [
          { say: 'canyon.hiker' }
        ] }
      ]
    },

    // ======================= Sage Canyon School =======================
    school: {
      bg: '#4e4e58', backdrop: 'school',
      particles: 'motes', grade: 'warm', bloom: 0.38, vignette: 0.45,
      rows: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XxxXxxXxxXXEXXxxXxxXQQQXxxXxxX',
        'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
        'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
        'kkLLkkLLkkkkkkkkkkhkhkhkkkkJkk',
        'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
        'kkLLkkLLkkkkkkkkkkkkkkkkkkkkkk',
        'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
        'ssssssssssssssssssssssssssssss',
        'TFFFFFFFFFFFFFFFFFFFFFFFFFFFFT',
        'TFFFFFFFFFFFFFFFFFFFFFFFFFFFFT',
        'TllllllllllllllllllllllllllllT',
        'TFFFFFFFFFFFFFFFFFFFFFFFFFFFFT',
        'TFFFFFFFFFFFFFFFFFFFFFFFFFFFFT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
      ],
      warps: [
        { x: 0, y: 8, to: 'street', tx: 32, ty: 27, dir: 'down' },
        { x: 11, y: 1, to: 'library', tx: 11, ty: 14, dir: 'up', 'if': 'quest' }
      ],
      events: [
        { x: 11, y: 1, trigger: 'touch', 'if': '!quest', script: [{ say: 'school.libraryLocked' }] }
      ],
      npcs: [
        { id: 'principal', x: 13, y: 3, sprite: 'adult', palette: PAL.principal, name: 'principal', script: [
          { if: 'got_trophy', then: [
            { say: 'school.principal.trophy1' },
            { take: 'trophy' },
            { say: ['school.principal.trophy2', 'school.principal.trophy3'] },
            { ending: true }
          ], 'else': [
            { if: 'clue_fur', then: [
              { say: ['school.principal.fur1', 'school.principal.fur2'] }
            ], 'else': [
              { if: 'quest', then: [
                { say: 'school.principal.remind' }
              ], 'else': [
                { say: ['school.principal.intro1', 'school.principal.intro2'] },
                { say: 'school.principal.josh', name: 'josh' },
                { say: 'school.principal.jasper', name: 'jasper' },
                { say: 'school.principal.intro3' },
                { give: 'milk', count: 2 },
                { set: 'quest' }
              ] }
            ] }
          ] }
        ] },
        { id: 'nurse', x: 3, y: 2, sprite: 'adult', palette: PAL.nurse, name: 'nurse', script: [
          { say: 'school.nurse.hello' },
          { inn: 0, text: 'school.nurse.rested' }
        ] },
        { id: 'clerk', x: 21, y: 2, sprite: 'adult', palette: PAL.clerk, name: 'clerk', script: [{ shop: 'schoolStore' }] },
        { id: 'coach', x: 15, y: 12, sprite: 'adult', palette: PAL.coach, name: 'coach', script: [
          { say: 'school.coach' },
          { shop: 'coachShed' }
        ] },
        { id: 'mascot', x: 26, y: 5, sprite: 'coyote', name: 'mascot', wander: 2, script: [
          { say: 'school.mascot.thumbs', name: null },
          { if: 'got_trophy', then: [{ say: 'school.mascot.go' }], 'else': [{ say: 'school.mascot.sad' }] }
        ] },
        { id: 'kidA', x: 6, y: 5, sprite: 'kid', palette: PAL.kidA, name: 'leo', wander: 2, script: [{ say: 'school.leo' }] },
        { id: 'kidB', x: 24, y: 7, sprite: 'kid', palette: PAL.kidB, name: 'mia', wander: 2, script: [{ say: 'school.mia' }] },
        { id: 'kidC', x: 9, y: 12, sprite: 'kid', palette: PAL.kidC, name: 'ethan', wander: 3, script: [{ say: 'school.ethan' }] }
      ]
    },

    // ======================= library & STEAM lab =======================
    library: {
      bg: '#1a2a2a', backdrop: 'library',
      ambient: 0.32, particles: 'dust', grade: 'cool', bloom: 0.5, vignette: 0.6,
      lights: [{ x: 11.5, y: 14, r: 4, color: SUN }, { x: 4, y: 9, r: 3, color: WARM }, { x: 19, y: 11, r: 3, color: WARM },
               { x: 6, y: 3, r: 3.5, color: COOL }, { x: 17, y: 3, r: 3.5, color: COOL }, { x: 21, y: 14, r: 2.5, color: WARM }],
      rows: [
        'ZZZZZZZZZZZZZZZZZZZZZZZZ',
        'ZmmmmMmmmmmmmmmmmmMmmmmZ',
        'ZmddmmmmddmmmmddmmmmddmZ',
        'ZmmmmmmmmmmmmmmmmmmmmmmZ',
        'ZmddmmmmddmmmmddmmmmddmZ',
        'ZmmmmmmmmmmmmmmmmmmmmmmZ',
        'ZZZZZZZZZZmmmmZZZZZZZZZZ',
        'ZaaaaSaaaaaaaaaaaaSaaaaZ',
        'ZaSSaSaSSSSaaSSSSaSaSSaZ',
        'ZaaaaaaaaaaaaaaaaaaaaaaZ',
        'ZaSSSSaSSaaSSSaaSSSSSaaZ',
        'ZaaaaSaaaaaaaaaaaaSaaaaZ',
        'ZaSSaSaaSSSaaSSSaaSaSSaZ',
        'ZaaaaaaaaaaaaaaaaaaaaaaZ',
        'ZaaaaaaaaaaaaaaaaaaaaaaZ',
        'ZZZZZZZZZZZaaZZZZZZZZZZZ'
      ],
      warps: [{ x: 11, y: 15, to: 'school', tx: 11, ty: 2, dir: 'down' }, { x: 12, y: 15, to: 'school', tx: 11, ty: 2, dir: 'down' }],
      encounters: { rate: 0.09, anywhere: true, 'if': '!robomax_done', troops: [['homework', 4], ['books', 3], ['clocks', 2], ['slimes', 2], ['robo', 2]] },
      chests: [
        { x: 22, y: 9, item: 'magicPencil', flag: 'chest_lib1' },
        { x: 1, y: 3, item: 'milk', count: 2, flag: 'chest_lib2' },
        { x: 22, y: 1, item: 'waterGun', flag: 'chest_lib3' }
      ],
      npcs: [
        { id: 'librarian', x: 21, y: 14, sprite: 'adult', palette: PAL.librarian, name: 'librarian', script: [
          { say: ['library.librarian.shh', 'library.librarian.rest'] },
          { inn: 0, text: 'library.librarian.rested' }
        ] },
        { id: 'robomax', x: 11, y: 1, sprite: 'robovac', palette: { M: '#c8a040', G: '#7a5a20' }, name: 'robomax', hideIf: 'robomax_done', script: [
          { say: 'library.robomax.beep' },
          { say: 'library.robomax.jasper', name: 'jasper' },
          { battle: 'robomax', win: [
            { set: 'robomax_done' },
            { say: 'library.robomax.stops', name: null },
            { give: 'fur' },
            { say: 'library.robomax.josh', name: 'josh' },
            { say: 'library.robomax.jasper2', name: 'jasper' },
            { set: 'clue_fur' }
          ] }
        ] }
      ]
    },

    // ======================= the raccoon cave =======================
    cave: {
      bg: '#0a0806', tint: 'rgba(10,6,0,0.18)', backdrop: 'cave',
      ambient: 0.62, playerLight: 4.2, particles: 'fireflies', grade: 'night', bloom: 0.6, vignette: 0.7,
      lights: [{ x: 11.5, y: 11, r: 4, color: 'rgba(255,220,170,A)' }, { x: 19, y: 1, r: 3.5, color: 'rgba(255,214,90,A)' },
               { x: 3, y: 2, r: 2.2, color: 'rgba(120,255,200,A)' }, { x: 20, y: 2, r: 2.2, color: 'rgba(120,255,200,A)' },
               { x: 2, y: 10, r: 2, color: 'rgba(160,140,255,A)' }, { x: 21, y: 10, r: 2, color: 'rgba(160,140,255,A)' }],
      rows: [
        'WWWWWWWWWWWWWWWWWWWWWWWW',
        'WWqqqqqqWWWWWWWWqqqqqqWW',
        'WqqtqqqqqWWWWWWqqqqqtqqW',
        'WqqqqqqqqqqqqqqqqqqqqqqW',
        'WWWqqWWWqqqqqqqqWWWqqWWW',
        'WqqqqqqWqqWWWWqqWqqqqqqW',
        'WqWWWWqWqqqqqqqqWqWWWWqW',
        'WqqqqWqqqqWWWWqqqqWqqqqW',
        'WWWWqWqqqqqqqqqqqqWqWWWW',
        'WqqqqqqqWWqqqqWWqqqqqqqW',
        'WqtqqqqqqqqqqqqqqqqqqtqW',
        'WWWWWWWWWWWqqWWWWWWWWWWW',
        'WWWWWWWWWWWqqWWWWWWWWWWW'
      ],
      warps: [{ x: 11, y: 12, to: 'canyon', tx: 5, ty: 3, dir: 'down' }, { x: 12, y: 12, to: 'canyon', tx: 5, ty: 3, dir: 'down' }],
      encounters: { rate: 0.1, anywhere: true, troops: [['raccoons', 3], ['bats', 3], ['caveMix', 3]] },
      chests: [
        { x: 1, y: 7, item: 'bento', flag: 'chest_cave1' },
        { x: 22, y: 7, item: 'bat', flag: 'chest_cave2' },
        { x: 2, y: 1, item: 'sticker', count: 2, flag: 'chest_cave3' }
      ],
      npcs: [
        { id: 'king', x: 19, y: 1, sprite: 'king', name: 'king', hideIf: 'got_trophy', script: [
          { say: 'cave.king.who' },
          { say: 'cave.king.josh', name: 'josh' },
          { say: 'cave.king.shiny' },
          { battle: 'raccoonKing', win: [
            { say: 'cave.king.give' },
            { say: 'cave.king.jasper', name: 'jasper' },
            { say: 'cave.king.deal' },
            { give: 'trophy' },
            { set: 'got_trophy' },
            { say: 'cave.king.josh2', name: 'josh' }
          ] }
        ] }
      ]
    }
  });
})();
