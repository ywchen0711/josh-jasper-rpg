/*
 * 繁體中文 — every word the player sees. Keys are shared with js/lang/en.js.
 * {name} {item} {n} ... are filled in by the game. Add lines freely; run `node tools/check-data.js` to find missing keys.
 */
RPG.addText('zh', {
  game: {
    title: 'Josh & Jasper 大冒險',
    subtitle: '～ 郊狼獎盃不見了！～',
    gameOver: '大家都累倒了……'
  },

  // ======================= interface =======================
  ui: {
    newGame: '開始新遊戲', 'continue': '繼續遊戲', settings: '設定', back: '返回',
    language: '語言 Language', effects: 'HD-2D 特效', on: '開', off: '關', unsupported: '不支援',
    pressStart: '按 Z / Enter 開始', controls: '方向鍵移動 · Z 確定 · X 取消 · C 選單',
    slot: '存檔 {n}', emptySlot: '（空）', loadWhich: '讀取哪一個存檔？', saveWhich: '存到哪一個存檔？',
    loaded: '讀取了存檔 {n}', saved: '已存檔到 {n}', loadSave: '讀取存檔', toTitle: '回到標題',
    items: '道具', skills: '技能', equip: '裝備', status: '狀態', save: '存檔', close: '關閉',
    gold: '金錢', money: '{n} 元', empty: '（沒有東西）', bagEmpty: '（背包是空的）', none: '（無）', unequip: '（卸下）',
    whoseSkills: '誰的技能？', whoEquip: '幫誰換裝備？', whoStatus: '看誰的狀態？',
    skillsOf: '{name} 的技能', equipOf: '{name} 的裝備', battleOnly: '（戰鬥中使用）',
    expLine: 'Lv {level}　經驗值 {exp}　下一級還要 {next}', listSep: '、',
    buy: '買東西', sell: '賣東西', leave: '離開', owned: '持有 {n}', bought: '買了「{item}」', nothingToSell: '（沒有能賣的東西）',
    yes: '好', no: '不用了', innRest: '休息（{price} 元）', noMoney: '錢不夠耶……', innDone: '大家都恢復精神了！',
    gotItem: '得到了「{item}」{count}！', gotGold: '得到了 {n} 元。', paidGold: '付了 {n} 元。', joined: '{name} 加入了隊伍！',
    chestEmpty: '裡面已經空了。'
  },
  stat: { maxHp: 'HP', maxMp: 'MP', atk: '攻擊', def: '防禦', mag: '魔力', spd: '速度', luck: '幸運' },
  slot: { weapon: '武器', armor: '衣服', accessory: '飾品' },

  battle: {
    appear: '{names} 出現了！', appearMany: '{names} 等出現了！',
    whatWill: '{name} 要做什麼？',
    cmdAttack: '攻擊', cmdSkill: '技能', cmdItem: '道具', cmdDefend: '防禦', cmdRun: '逃跑',
    noItems: '（沒有能用的道具）',
    attacks: '{name} 的攻擊！', defends: '{name} 擺出防禦姿勢。', noMp: '{name} 的 MP 不夠！',
    usesSkill: '{name} 使出「{skill}」！', usesItem: '{name} 使用了「{item}」！', itemGone: '道具已經用完了！',
    defeated: '{name} 被打倒了！', fainted: '{name} 倒下了！', cantMove: '{name} 動不了！', hurtTick: '{name} 受到了傷害。',
    cantRun: '這場戰鬥逃不掉！', ranAway: '成功逃跑了！', runFailed: '逃跑失敗……', slipAway: '大家趁機溜走了！',
    allDown: '大家都倒下了……', victory: '勝利！', reward: '得到 {exp} 經驗值、{gold} 元',
    found: '得到了「{item}」', levelUp: '{name} 升到了 Lv{level}！', learned: '　學會了「{skill}」',
    crit: '會心一擊！', weak: '效果超好！', resist: '不太有效…', revived: '復活！', missed: '沒中', cured: '恢復正常',
    defTag: '盾'
  },

  // ======================= people =======================
  npc: {
    mom: '媽媽', puppy: '小狗', oldman: '散步的爺爺', neighborKid: '鄰居小孩', jogger: '慢跑的叔叔',
    ranger: '峽谷管理員', hiker: '登山客', principal: '校長', nurse: '保健室阿姨', clerk: '福利社阿姨', coach: 'Coach',
    mascot: '郊狼吉祥物', leo: '同學 Leo', mia: '同學 Mia', ethan: '同學 Ethan', librarian: '圖書館阿姨',
    robomax: '掃地機器人 MAX', king: '浣熊大王'
  },
  character: {
    josh:   { name: 'Josh', title: '哥哥・運動健將', bio: '踢足球、跑步樣樣行，衝第一個保護弟弟。口頭禪是「交給我！」' },
    jasper: { name: 'Jasper', title: '弟弟・點子王', bio: '缺了一顆門牙還是笑最大聲。腦袋裡塞滿了科學實驗和奇怪的點子。' },
    mochi:  { name: '麻糬', title: '迷路的柴犬', bio: '在公園迷路的小柴犬，被一塊餅乾收買了。跑超快，最喜歡被摸頭。' }
  },

  // ======================= places =======================
  map: {
    home:    { name: '我們家' },
    street:  { name: 'Carmel Valley 社區' },
    canyon:  { name: 'Sage Canyon 峽谷步道' },
    school:  { name: 'Sage Canyon 小學' },
    library: { name: '圖書館・STEAM 實驗室' },
    cave:    { name: '浣熊洞窟' }
  },
  shop: {
    schoolStore: { name: '學校福利社', greeting: '歡迎光臨！今天運動會，餅乾特價喔～', bye: '加油喔！' },
    coachShed:   { name: '體育器材室', greeting: '要上場就要有好裝備！', bye: '記得熱身！' },
    vending:     { name: '自動販賣機', greeting: '（嗶——投幣口閃著綠光。）' }
  },

  // ======================= things =======================
  item: {
    cookie:       { name: '巧克力餅乾', desc: '回復 40 HP。媽媽烤的最好吃。' },
    juice:        { name: '能量果汁', desc: '回復 110 HP。' },
    bento:        { name: '媽媽便當', desc: '全隊回復 160 HP。' },
    milk:         { name: '草莓牛奶', desc: '回復 20 MP。' },
    bandaid:      { name: 'OK 繃', desc: '治好黏答答和想哭。' },
    sticker:      { name: '金色貼紙', desc: '老師的金色貼紙！讓倒下的隊友復活。' },
    waterBalloon: { name: '水球', desc: '丟向一個敵人（水屬性 35 傷害）。' },
    popRocks:     { name: '跳跳糖', desc: '吃了全身起勁：攻擊和速度上升。' },
    whoopee:      { name: '放屁坐墊', desc: '噗～趁大家笑翻的時候逃走。' },
    ruler:        { name: '塑膠尺', desc: '攻擊 +3' },
    stick:        { name: '好看的樹枝', desc: '每個小孩都想要的樹枝。攻擊 +6' },
    waterGun:     { name: '水槍', desc: '攻擊 +5、魔力 +4，普通攻擊變成水屬性。' },
    bat:          { name: '少棒球棒', desc: '攻擊 +12' },
    magicPencil:  { name: '魔法鉛筆', desc: '寫什麼都會成真的鉛筆？魔力 +10' },
    chewToy:      { name: '磨牙骨頭', desc: '麻糬專用。攻擊 +7' },
    jacket:       { name: '外套', desc: '防禦 +3' },
    hoodie:       { name: '帽T', desc: '防禦 +6' },
    raincoat:     { name: '小雨衣', desc: '防禦 +5、魔力 +3' },
    uniform:      { name: '運動會隊服', desc: '防禦 +10、速度 +3' },
    dogVest:      { name: '狗狗背心', desc: '麻糬專用。防禦 +6' },
    eraser:       { name: '幸運橡皮擦', desc: '幸運 +6' },
    sneakers:     { name: '閃電運動鞋', desc: '速度 +6' },
    bell:         { name: '鈴鐺項圈', desc: '麻糬專用。速度 +4、幸運 +4' },
    coyoteBadge:  { name: '郊狼徽章', desc: 'GO COYOTES！全能力 +3' },
    trophy:       { name: '郊狼獎盃', desc: 'Sage Canyon 運動會的冠軍獎盃。' },
    fur:          { name: '灰色的毛', desc: '從機器人身上找到的。好像是……浣熊的毛？' }
  },
  skill: {
    tackle:     { name: '衝撞', desc: '用肩膀撞過去。' },
    cheer:      { name: '加油打氣', desc: '全隊攻擊力上升 3 回合。' },
    soccerKick: { name: '足球射門', desc: '全力一腳射門，威力強大。' },
    dodgeball:  { name: '躲避球亂射', desc: '對所有敵人丟躲避球。' },
    braveHeart: { name: '勇氣爆發', desc: '哥哥的必殺技！超強的一擊。' },
    paperPlane: { name: '紙飛機', desc: '射出紙飛機（風屬性）。' },
    firstAid:   { name: '痛痛飛走', desc: '「痛痛飛走～」回復一位隊友的 HP。' },
    calmDown:   { name: '深呼吸', desc: '治好一位隊友的異常狀態。' },
    volcano:    { name: '小蘇打火山', desc: '科學實驗大爆發！火屬性攻擊所有敵人。' },
    lullaby:    { name: '搖籃曲', desc: '哼歌讓敵人睡著。' },
    ideaBolt:   { name: '靈光一閃', desc: '想到好點子的瞬間打下閃電（雷屬性）。' },
    groupHug:   { name: '大家抱抱', desc: '回復全隊的 HP。' },
    bigIdea:    { name: '超級大點子', desc: '腦袋全速運轉，雷電轟炸所有敵人。' },
    nibble:     { name: '咬咬', desc: '小小的牙齒咬下去。' },
    lick:       { name: '舔舔', desc: '舔一舔，傷口好像比較不痛了。' },
    bark:       { name: '汪汪吼', desc: '大聲叫，可能嚇呆所有敵人。' },
    puppyEyes:  { name: '無辜眼神', desc: '水汪汪的眼睛讓敵人攻擊力下降。' },
    zoomies:    { name: '狗狗暴衝', desc: '突然暴衝撞向所有敵人。' },
    sting:      { name: '螫' },
    screech:    { name: '尖叫' },
    snatch:     { name: '搶點心' },
    lecture:    { name: '無聊的講課' },
    paperCut:   { name: '紙割傷' },
    ring:       { name: '鈴鈴鈴！' },
    gooSplash:  { name: '黏液噴射' },
    suck:       { name: '吸吸吸' },
    overdrive:  { name: '過熱暴走' },
    kingSlam:   { name: '大王重擊' },
    trashStorm: { name: '垃圾風暴' },
    feast:      { name: '大吃一頓' }
  },
  status: {
    sleep:  { name: '睡著了', short: '睡', skip: '{name} 呼呼大睡中……' },
    scared: { name: '嚇呆了', short: '驚', skip: '{name} 嚇得動不了！' },
    sticky: { name: '黏答答', short: '黏', tick: '{name} 被黏液弄得好難受。' },
    sad:    { name: '想哭', short: '哭' },
    pumped: { name: '超有精神', short: '燃' }
  },
  enemy: {
    lizard:   { name: '圍籬蜥蜴' },
    gull:     { name: '搶食海鷗' },
    bee:      { name: '嗡嗡蜂' },
    crow:     { name: '壞脾氣烏鴉' },
    homework: { name: '會飛的作業' },
    book:     { name: '生氣的字典' },
    clock:    { name: '鬧鐘怪' },
    slime:    { name: '實驗室黏液' },
    robovac:  { name: '掃地機器人' },
    robomax:  { name: '掃地機器人 MAX', defeat: '{name} 冒煙停機了！' },
    raccoon:  { name: '浣熊小偷' },
    bat:      { name: '洞穴蝙蝠' },
    raccoonKing: { name: '浣熊大王', defeat: '{name} 抱著肚子投降了！' }
  },
  troop: {
    robomax:     { intro: '掃地機器人 MAX 啟動了！「發現……髒東西……清除！」' },
    raccoonKing: { intro: '浣熊大王抱著獎盃跳了出來！「這是本大王的寶物！」' }
  },

  // ======================= story =======================
  intro: {
    1: '（今天是 Sage Canyon 小學的運動會！）',
    2: 'Josh！Jasper！還在睡喔？今天是運動會耶！',
    3: '交給我！我已經準備好拿冠軍了！',
    4: '我也是！我的牙齒掉了，跑步會比較快！',
    5: '……那是什麼道理。路上肚子餓就吃這個吧。',
    6: '從家門出去，往東走就是學校。累了就回來找媽媽休息喔。',
    7: '（按 C 打開選單，Z 對話或調查，X 取消）'
  },
  ending: {
    1: '校長把郊狼獎盃高高舉起，全校響起歡呼：「GO COYOTES！」',
    2: '浣熊大王和小浣熊們被請去當運動會的吉祥物助理，聽說牠們跑很快。',
    3: 'Josh 拿到了賽跑第一名，Jasper 的小蘇打火山得到科展特別獎。',
    4: '麻糬咬著獎牌，在操場上跑了十圈。',
    5: '「明天還會有什麼冒險呢？」兄弟倆一邊吃便當一邊想。',
    6: '～ THE END ～　謝謝你的遊玩！'
  },
  home: {
    mom: { trophy: '獎盃找到了？快拿去給校長！', rest: '累了嗎？休息一下再出門吧。', rested: '吃了點心、睡了午覺，大家都恢復精神了！' },
    tv: '電視正在播運動會的新聞：「Sage Canyon 小學的郊狼獎盃……」咦？畫面斷掉了。'
  },
  street: {
    neighborDoor: '鄰居家的門鎖著。門上貼著：「去看運動會了！」',
    sign: '「Sage Canyon 社區公園」　↑ 峽谷步道　→ Sage Canyon 小學',
    mochi: {
      see: '一隻柴犬小狗在公園裡打轉。項圈上寫著「麻糬」。',
      stare: '麻糬盯著你的口袋，口水快滴下來了……',
      give: '給牠一塊餅乾', pet: '摸摸頭就好',
      woof: '汪！汪汪！',
      follows: '麻糬好像決定要跟著你們了！',
      jasper: '好耶！牠的主人一定在學校看運動會，我們帶牠一起去！',
      wag: '麻糬開心地搖尾巴，然後繼續盯著你的口袋。',
      hungry: '麻糬聞了聞你的手，好像很餓……要是有點心就好了。'
    },
    oldman: '早安啊小朋友。最近社區常有浣熊翻垃圾桶，晚上都聽到牠們在峽谷那邊吵。',
    kid: { 1: '你們看到一隻柴犬嗎？牠好像是學校工友伯伯的狗。', 2: '聽說牠最喜歡巧克力餅乾。' },
    jogger: '峽谷步道的草叢裡有很多小動物，累了要記得吃點東西喔！'
  },
  canyon: {
    ranger: {
      quest: '洞窟裡住著一群浣熊，很危險。沒有證據的話，我不能讓小朋友進去。',
      keepOut: '前面是浣熊洞窟，小朋友不可以進去喔。',
      fur: '浣熊毛？原來是牠們搞的鬼！洞窟裡面很深，要小心喔。'
    },
    hiker: '草叢裡常常有東西跳出來。打不過的話，用「逃跑」也是一種勇氣！'
  },
  school: {
    libraryLocked: '圖書館的門鎖著。先去跟校長打招呼吧。',
    principal: {
      trophy1: '這、這是郊狼獎盃！你們找回來了！',
      trophy2: '原來是浣熊大王把它當成寶物藏起來了啊。哈哈哈，難怪亮晶晶的東西都不見了。',
      trophy3: '各位同學！運動會正式開始！GO COYOTES！',
      fur1: '灰色的毛？這是浣熊的毛吧……峽谷的浣熊洞窟！',
      fur2: '我已經打電話給管理員了，他會讓你們過去。拜託你們了！',
      remind: '獎盃不見的那天晚上，圖書館裡有奇怪的聲音……拜託你們去看看！',
      intro1: '啊，Josh 和 Jasper！不好了，運動會的冠軍「郊狼獎盃」不見了！',
      intro2: '沒有獎盃，運動會就沒辦法開始……',
      josh: '交給我們！我們一定會把獎盃找回來！',
      jasper: '我昨天晚上看到圖書館的燈一閃一閃的喔。',
      intro3: '圖書館後面是 STEAM 實驗室……門我幫你們打開了。這個帶著，路上小心！'
    },
    nurse: { hello: '跌倒了嗎？來，阿姨幫你們擦藥。', rested: '擦了藥、喝了水，大家都恢復精神了！' },
    coach: '沒有獎盃，比賽開不了！你們要去找獎盃的話，先來器材室挑裝備！',
    mascot: { thumbs: '（穿著郊狼布偶裝的學長對你們比了一個讚。）', go: 'GO COYOTES！！', sad: '「獎盃不見了，我連加油舞都跳不起來……」' },
    leo: '我聽說 STEAM 實驗室的掃地機器人最近怪怪的，一直在吸奇怪的東西。',
    mia: '躲避球比賽我一定要贏！Josh 你不要手下留情喔。',
    ethan: '你知道嗎？用水攻擊機器人的話，它們會短路喔！'
  },
  library: {
    librarian: {
      shh: '噓——圖書館要安靜。最近書本會自己飛來飛去，好可怕……',
      rest: '實驗室在裡面。要不要在這裡先休息一下？',
      rested: '在安靜的閱讀角休息了一下，大家都恢復精神了！'
    },
    robomax: {
      beep: '嗶——嗶——發現……髒東西。',
      jasper: '它的集塵盒裡卡著一團灰色的毛！',
      stops: '機器人冒著煙停了下來，集塵盒「喀」一聲打開了。',
      josh: '是灰色的毛……還有一點垃圾的味道。浣熊？',
      jasper2: '那天晚上一定是浣熊溜進學校，機器人追著牠吸了一口毛！快拿去給校長看！'
    }
  },
  cave: {
    king: {
      who: '誰！誰敢闖進本大王的寶物庫！',
      josh: '那個獎盃是學校的！快還來！',
      shiny: '亮晶晶的東西都是本大王的！想要的話，就打贏我吧！',
      give: '嗚嗚……好啦好啦，還給你們。本大王只是想要一個亮晶晶的東西……',
      jasper: '那……運動會結束後，我們把參加獎的獎牌送你好不好？',
      deal: '真、真的嗎！成交！',
      josh2: '拿回獎盃了！快回學校交給校長！'
    }
  }
});
