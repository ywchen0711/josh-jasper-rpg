/*
 * Maps. Each map:
 *   name, rows (one character per tile, see the legend in config.js), legend (extra/override characters)
 *   bg, tint, backdrop (battle background)
 *   warps:      [{ x, y, to: mapId, tx, ty, dir, if }]
 *   npcs:       [{ id, x, y, sprite, palette, dir, name, wander, solid, showIf, hideIf, script }]
 *   events:     [{ x, y, trigger: 'touch' | 'action', if, once: 'flag', script }]
 *   chests:     [{ x, y, item, count, gold, flag }]
 *   encounters: { rate, minSteps, anywhere, if, troops: [[troopId, weight], ...] }
 * Scripts are lists of commands (js/script.js). Conditions: 'flag', '!flag', { item }, { member }, ...
 * Hide an NPC from a script with { hide: 'npcId' }.
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
    oldman:    { H: '#e0e0e0', T: '#8a6a4a', P: '#4a4a4a', G: '#8a6a4a' }
  };

  RPG.add('maps', {
    // ======================= home =======================
    home: {
      name: '我們家', bg: '#2a1a10', backdrop: 'home',
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
      warps: [{ x: 6, y: 8, to: 'street', tx: 4, ty: 4, dir: 'down' }],
      chests: [{ x: 12, y: 6, item: 'eraser', flag: 'chest_home' }],
      npcs: [
        { id: 'mom', x: 11, y: 2, sprite: 'adult', palette: PAL.mom, name: '媽媽', dir: 'left', script: [
          { if: 'got_trophy', then: [{ say: '獎盃找到了？快拿去給校長！' }], 'else': [{ say: '累了嗎？休息一下再出門吧。' }] },
          { inn: 0, text: '吃了點心、睡了午覺，大家都恢復精神了！' }
        ] }
      ],
      events: [
        { x: 2, y: 4, trigger: 'action', script: [{ say: '電視正在播運動會的新聞：「Sage Canyon 小學的郊狼獎盃……」咦？畫面斷掉了。' }] }
      ]
    },

    // ======================= the neighborhood =======================
    street: {
      name: 'Carmel Valley 社區', bg: '#5c9c48', backdrop: 'street',
      rows: [
        'TTTTTTTTTTTTTpppTTTTTTTTTTTTTT',
        'T^^^^^^^....TpppT...^^^^^^^..T',
        'T^^^^^^^.,..bpppb.,.^^^^^^^..T',
        'THwHDHwH.....ppp....HwHDHwH,.T',
        'T...s........ppp.......s.....T',
        'Tsssssssssssssssssssssssssssss',
        'TRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
        'T-----------------------------',
        'TRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
        'Tsssssssssssssssssssssssssssss',
        'T...,....T.......!.....T...,.T',
        'T..~~~~.......,.......b......T',
        'T.~~~~~~..b..........,.......T',
        'T.~~~~~~.....T.........b.....T',
        'T..~~~~...,.......,..........T',
        'T....b.......P.........P.....T',
        'T.,..........................T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
      ],
      warps: [
        { x: 4, y: 3, to: 'home', tx: 6, ty: 7, dir: 'up' },
        { x: 13, y: 0, to: 'canyon', tx: 13, ty: 19, dir: 'up' }, { x: 14, y: 0, to: 'canyon', tx: 14, ty: 19, dir: 'up' }, { x: 15, y: 0, to: 'canyon', tx: 14, ty: 19, dir: 'up' },
        { x: 29, y: 6, to: 'school', tx: 1, ty: 8, dir: 'right' }, { x: 29, y: 7, to: 'school', tx: 1, ty: 8, dir: 'right' }, { x: 29, y: 8, to: 'school', tx: 1, ty: 8, dir: 'right' }
      ],
      events: [
        { x: 23, y: 3, trigger: 'touch', script: [{ say: '鄰居家的門鎖著。門上貼著：「去看運動會了！」' }] },
        { x: 17, y: 10, trigger: 'action', script: [{ say: '「Sage Canyon 社區公園」　↑ 峽谷步道　→ Sage Canyon 小學' }] }
      ],
      chests: [{ x: 1, y: 16, item: 'cookie', count: 2, flag: 'chest_park' }],
      npcs: [
        { id: 'mochi', x: 20, y: 13, sprite: 'mochi', name: '小狗', wander: 2, hideIf: { member: 'mochi' }, script: [
          { say: '一隻柴犬小狗在公園裡打轉。項圈上寫著「麻糬」。', name: null },
          { if: { item: 'cookie' }, then: [
            { choice: ['給牠一塊餅乾', '摸摸頭就好'], text: '麻糬盯著你的口袋，口水快滴下來了……', then: [
              [{ take: 'cookie' }, { say: '汪！汪汪！', name: '麻糬' }, { say: '麻糬好像決定要跟著你們了！', name: null },
               { say: '好耶！牠的主人一定在學校看運動會，我們帶牠一起去！', name: 'Jasper' }, { join: 'mochi' }],
              [{ say: '麻糬開心地搖尾巴，然後繼續盯著你的口袋。', name: null }]
            ] }
          ], 'else': [{ say: '麻糬聞了聞你的手，好像很餓……要是有點心就好了。', name: null }] }
        ] },
        { id: 'oldman', x: 7, y: 9, sprite: 'adult', palette: PAL.oldman, name: '散步的爺爺', wander: 3, script: [
          { say: '早安啊小朋友。最近社區常有浣熊翻垃圾桶，晚上都聽到牠們在峽谷那邊吵。' }
        ] },
        { id: 'kid1', x: 25, y: 12, sprite: 'kid', palette: PAL.kidA, name: '鄰居小孩', wander: 2, script: [
          { say: '你們看到一隻柴犬嗎？牠好像是學校工友伯伯的狗。' },
          { say: '聽說牠最喜歡巧克力餅乾。' }
        ] },
        { id: 'jogger', x: 18, y: 15, sprite: 'adult', palette: PAL.kidC, name: '慢跑的叔叔', wander: 4, script: [
          { say: '峽谷步道的草叢裡有很多小動物，累了要記得吃點東西喔！' }
        ] }
      ]
    },

    // ======================= the canyon trail =======================
    canyon: {
      name: 'Sage Canyon 峽谷步道', bg: '#a07850', backdrop: 'canyon',
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
        { x: 14, y: 20, to: 'street', tx: 14, ty: 1, dir: 'down' },
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
        { id: 'ranger', x: 5, y: 2, sprite: 'adult', palette: PAL.ranger, name: '峽谷管理員', hideIf: 'clue_fur', script: [
          { if: 'quest', then: [{ say: '洞窟裡住著一群浣熊，很危險。沒有證據的話，我不能讓小朋友進去。' }],
            'else': [{ say: '前面是浣熊洞窟，小朋友不可以進去喔。' }] }
        ] },
        { id: 'ranger2', x: 4, y: 3, sprite: 'adult', palette: PAL.ranger, name: '峽谷管理員', showIf: 'clue_fur', script: [
          { say: '浣熊毛？原來是牠們搞的鬼！洞窟裡面很深，要小心喔。' }
        ] },
        { id: 'hiker', x: 20, y: 10, sprite: 'adult', palette: PAL.kidB, name: '登山客', wander: 2, script: [
          { say: '草叢裡常常有東西跳出來。打不過的話，用「逃跑」也是一種勇氣！' }
        ] }
      ]
    },

    // ======================= Sage Canyon School =======================
    school: {
      name: 'Sage Canyon 小學', bg: '#4e4e58', backdrop: 'school',
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
        { x: 0, y: 8, to: 'street', tx: 28, ty: 7, dir: 'left' },
        { x: 11, y: 1, to: 'library', tx: 11, ty: 14, dir: 'up', 'if': 'quest' }
      ],
      events: [
        { x: 11, y: 1, trigger: 'touch', 'if': '!quest', script: [{ say: '圖書館的門鎖著。先去跟校長打招呼吧。' }] }
      ],
      npcs: [
        { id: 'principal', x: 13, y: 3, sprite: 'adult', palette: PAL.principal, name: '校長', script: [
          { if: 'got_trophy', then: [
            { say: '這、這是郊狼獎盃！你們找回來了！' },
            { take: 'trophy' },
            { say: '原來是浣熊大王把它當成寶物藏起來了啊。哈哈哈，難怪亮晶晶的東西都不見了。' },
            { say: '各位同學！運動會正式開始！GO COYOTES！' },
            { ending: true }
          ], 'else': [
            { if: 'clue_fur', then: [
              { say: '灰色的毛？這是浣熊的毛吧……峽谷的浣熊洞窟！' },
              { say: '我已經打電話給管理員了，他會讓你們過去。拜託你們了！' }
            ], 'else': [
              { if: 'quest', then: [
                { say: '獎盃不見的那天晚上，圖書館裡有奇怪的聲音……拜託你們去看看！' }
              ], 'else': [
                { say: '啊，Josh 和 Jasper！不好了，運動會的冠軍「郊狼獎盃」不見了！' },
                { say: '沒有獎盃，運動會就沒辦法開始……' },
                { say: '交給我們！我們一定會把獎盃找回來！', name: 'Josh' },
                { say: '我昨天晚上看到圖書館的燈一閃一閃的喔。', name: 'Jasper' },
                { say: '圖書館後面是 STEAM 實驗室……門我幫你們打開了。這個帶著，路上小心！' },
                { give: 'milk', count: 2 },
                { set: 'quest' }
              ] }
            ] }
          ] }
        ] },
        { id: 'nurse', x: 3, y: 2, sprite: 'adult', palette: PAL.nurse, name: '保健室阿姨', script: [
          { say: '跌倒了嗎？來，阿姨幫你們擦藥。' },
          { inn: 0, text: '擦了藥、喝了水，大家都恢復精神了！' }
        ] },
        { id: 'clerk', x: 21, y: 2, sprite: 'adult', palette: PAL.clerk, name: '福利社阿姨', script: [{ shop: 'schoolStore' }] },
        { id: 'coach', x: 15, y: 12, sprite: 'adult', palette: PAL.coach, name: 'Coach', script: [
          { say: '沒有獎盃，比賽開不了！你們要去找獎盃的話，先來器材室挑裝備！' },
          { shop: 'coachShed' }
        ] },
        { id: 'mascot', x: 26, y: 5, sprite: 'coyote', name: '郊狼吉祥物', wander: 2, script: [
          { say: '（穿著郊狼布偶裝的學長對你們比了一個讚。）' },
          { if: 'got_trophy', then: [{ say: 'GO COYOTES！！' }], 'else': [{ say: '「獎盃不見了，我連加油舞都跳不起來……」' }] }
        ] },
        { id: 'kidA', x: 6, y: 5, sprite: 'kid', palette: PAL.kidA, name: '同學 Leo', wander: 2, script: [
          { say: '我聽說 STEAM 實驗室的掃地機器人最近怪怪的，一直在吸奇怪的東西。' }
        ] },
        { id: 'kidB', x: 24, y: 7, sprite: 'kid', palette: PAL.kidB, name: '同學 Mia', wander: 2, script: [
          { say: '躲避球比賽我一定要贏！Josh 你不要手下留情喔。' }
        ] },
        { id: 'kidC', x: 9, y: 12, sprite: 'kid', palette: PAL.kidC, name: '同學 Ethan', wander: 3, script: [
          { say: '你知道嗎？用水攻擊機器人的話，它們會短路喔！' }
        ] }
      ]
    },

    // ======================= library & STEAM lab =======================
    library: {
      name: '圖書館・STEAM 實驗室', bg: '#1a2a2a', backdrop: 'library',
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
        { id: 'librarian', x: 21, y: 14, sprite: 'adult', palette: PAL.librarian, name: '圖書館阿姨', script: [
          { say: '噓——圖書館要安靜。最近書本會自己飛來飛去，好可怕……' },
          { say: '實驗室在裡面。要不要在這裡先休息一下？' },
          { inn: 0, text: '在安靜的閱讀角休息了一下，大家都恢復精神了！' }
        ] },
        { id: 'robomax', x: 11, y: 1, sprite: 'robovac', palette: { M: '#c8a040', G: '#7a5a20' }, name: '掃地機器人 MAX', hideIf: 'robomax_done', script: [
          { say: '嗶——嗶——發現……髒東西。', name: '掃地機器人 MAX' },
          { say: '它的集塵盒裡卡著一團灰色的毛！', name: 'Jasper' },
          { battle: 'robomax', win: [
            { set: 'robomax_done' },
            { say: '機器人冒著煙停了下來，集塵盒「喀」一聲打開了。', name: null },
            { give: 'fur' },
            { say: '是灰色的毛……還有一點垃圾的味道。浣熊？', name: 'Josh' },
            { say: '那天晚上一定是浣熊溜進學校，機器人追著牠吸了一口毛！快拿去給校長看！', name: 'Jasper' },
            { set: 'clue_fur' }
          ] }
        ] }
      ]
    },

    // ======================= the raccoon cave =======================
    cave: {
      name: '浣熊洞窟', bg: '#0a0806', tint: 'rgba(10,6,0,0.18)', backdrop: 'cave',
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
        { id: 'king', x: 19, y: 1, sprite: 'king', name: '浣熊大王', hideIf: 'got_trophy', script: [
          { say: '誰！誰敢闖進本大王的寶物庫！', name: '浣熊大王' },
          { say: '那個獎盃是學校的！快還來！', name: 'Josh' },
          { say: '亮晶晶的東西都是本大王的！想要的話，就打贏我吧！', name: '浣熊大王' },
          { battle: 'raccoonKing', win: [
            { say: '嗚嗚……好啦好啦，還給你們。本大王只是想要一個亮晶晶的東西……', name: '浣熊大王' },
            { say: '那……運動會結束後，我們把參加獎的獎牌送你好不好？', name: 'Jasper' },
            { say: '真、真的嗎！成交！', name: '浣熊大王' },
            { give: 'trophy' },
            { set: 'got_trophy' },
            { say: '拿回獎盃了！快回學校交給校長！', name: 'Josh' }
          ] }
        ] }
      ]
    }
  });
})();
