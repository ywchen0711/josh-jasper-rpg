/*
 * English — every word the player sees. Keys are shared with js/lang/zh.js.
 * {name} {item} {n} ... are filled in by the game. Run `node tools/check-data.js` to find missing keys.
 */
RPG.addText('en', {
  game: {
    title: 'Josh & Jasper',
    subtitle: '~ The Case of the Missing Coyote Cup ~',
    gameOver: 'Everyone is worn out...'
  },

  // ======================= interface =======================
  ui: {
    newGame: 'New Game', 'continue': 'Continue', settings: 'Settings', back: 'Back',
    language: 'Language 語言', effects: 'HD-2D Effects', on: 'On', off: 'Off', unsupported: 'N/A',
    pressStart: 'Press Z / Enter', controls: 'Arrows move · Z OK · X Cancel · C Menu',
    slot: 'Slot {n}', emptySlot: '(empty)', loadWhich: 'Load which file?', saveWhich: 'Save to which file?',
    loaded: 'Loaded file {n}', saved: 'Saved to file {n}', loadSave: 'Load Save', toTitle: 'Title Screen',
    items: 'Items', skills: 'Skills', equip: 'Equip', status: 'Status', save: 'Save', close: 'Close',
    gold: 'Money', money: '${n}', empty: '(nothing)', bagEmpty: '(your bag is empty)', none: '(none)', unequip: '(remove)',
    whoseSkills: 'Whose skills?', whoEquip: 'Equip who?', whoStatus: 'Whose status?',
    skillsOf: "{name}'s Skills", equipOf: "{name}'s Gear", battleOnly: ' (battle only)',
    expLine: 'Lv {level}   EXP {exp}   Next {next}', listSep: ', ',
    buy: 'Buy', sell: 'Sell', leave: 'Leave', owned: 'Owned: {n}', bought: 'Bought {item}', nothingToSell: '(nothing to sell)',
    yes: 'Yes', no: 'No thanks', innRest: 'Rest (${price})', noMoney: "Not enough money...", innDone: 'Everyone feels refreshed!',
    gotItem: 'Got {item}{count}!', gotGold: 'Got ${n}.', paidGold: 'Paid ${n}.', joined: '{name} joined the party!',
    chestEmpty: "It's empty."
  },
  stat: { maxHp: 'HP', maxMp: 'MP', atk: 'Attack', def: 'Defense', mag: 'Magic', spd: 'Speed', luck: 'Luck' },
  slot: { weapon: 'Weapon', armor: 'Clothes', accessory: 'Extra' },

  battle: {
    appear: '{names} appeared!', appearMany: '{names} and friends appeared!',
    whatWill: 'What will {name} do?',
    cmdAttack: 'Attack', cmdSkill: 'Skill', cmdItem: 'Item', cmdDefend: 'Guard', cmdRun: 'Run',
    noItems: '(no usable items)',
    attacks: '{name} attacks!', defends: '{name} is on guard.', noMp: "{name} doesn't have enough MP!",
    usesSkill: '{name} uses {skill}!', usesItem: '{name} uses {item}!', itemGone: 'All out of that item!',
    defeated: '{name} is defeated!', fainted: '{name} is down!', cantMove: "{name} can't move!", hurtTick: '{name} takes damage.',
    cantRun: "Can't run from this fight!", ranAway: 'Got away safely!', runFailed: "Couldn't get away...", slipAway: 'Everyone slips away!',
    allDown: 'Everyone is down...', victory: 'Victory!', reward: 'Got {exp} EXP and ${gold}',
    found: 'Found {item}', levelUp: '{name} reached Lv{level}!', learned: '  Learned {skill}',
    crit: 'Critical!', weak: 'Super effective!', resist: 'Not very effective...', revived: 'Revived!', missed: 'Miss', cured: 'Cured',
    defTag: 'G'
  },

  // ======================= people =======================
  npc: {
    mom: 'Mom', puppy: 'Puppy', oldman: 'Grandpa on a Walk', neighborKid: 'Neighbor Kid', jogger: 'Jogger',
    ranger: 'Canyon Ranger', hiker: 'Hiker', principal: 'Principal', nurse: 'School Nurse', clerk: 'Store Lady', coach: 'Coach',
    mascot: 'Coyote Mascot', leo: 'Leo', mia: 'Mia', ethan: 'Ethan', librarian: 'Librarian',
    robomax: 'RoboVac MAX', king: 'Raccoon King', guard: 'Crossing Guard'
  },
  character: {
    josh:   { name: 'Josh', title: 'Big Brother · Sports Star', bio: 'Great at soccer and running, always first in line to protect his little brother. Catchphrase: "Leave it to me!"' },
    jasper: { name: 'Jasper', title: 'Little Brother · Idea Machine', bio: 'Missing a front tooth and still laughs the loudest. His head is full of science experiments and wild ideas.' },
    mochi:  { name: 'Mochi', title: 'Lost Shiba Pup', bio: 'A little shiba lost in the park, won over by a single cookie. Super fast, loves head pats.' }
  },

  // ======================= places =======================
  map: {
    home:    { name: 'Our House' },
    street:  { name: 'Carmel Valley' },
    canyon:  { name: 'Sage Canyon Trail' },
    school:  { name: 'Sage Canyon Elementary' },
    library: { name: 'Library · STEAM Lab' },
    cave:    { name: 'Raccoon Cave' }
  },
  shop: {
    schoolStore: { name: 'School Store', greeting: "Welcome! Cookies are on sale for Field Day~", bye: 'Good luck out there!' },
    coachShed:   { name: 'Equipment Shed', greeting: 'You want to play, you need the right gear!', bye: "Don't forget to warm up!" },
    vending:     { name: 'Vending Machine', greeting: '(Beep... the coin slot glows green.)' }
  },

  // ======================= things =======================
  item: {
    cookie:       { name: 'Choco Cookie', desc: "Restores 40 HP. Mom's are the best." },
    juice:        { name: 'Power Juice', desc: 'Restores 110 HP.' },
    bento:        { name: "Mom's Bento", desc: 'Restores 160 HP to the whole party.' },
    milk:         { name: 'Strawberry Milk', desc: 'Restores 20 MP.' },
    bandaid:      { name: 'Band-Aid', desc: 'Cures Sticky and Teary.' },
    sticker:      { name: 'Gold Star', desc: "The teacher's gold star sticker! Revives a fallen friend." },
    waterBalloon: { name: 'Water Balloon', desc: 'Throw at one enemy (35 water damage).' },
    popRocks:     { name: 'Pop Rocks', desc: 'Fizzy energy: raises Attack and Speed.' },
    whoopee:      { name: 'Whoopee Cushion', desc: 'Pfffft~ Escape while everyone is laughing.' },
    ruler:        { name: 'Plastic Ruler', desc: 'Attack +3' },
    stick:        { name: 'Cool Stick', desc: 'The stick every kid wants. Attack +6' },
    waterGun:     { name: 'Water Blaster', desc: 'Attack +5, Magic +4. Normal attacks become water.' },
    bat:          { name: 'Little League Bat', desc: 'Attack +12' },
    magicPencil:  { name: 'Magic Pencil', desc: 'Whatever it writes comes true? Magic +10' },
    chewToy:      { name: 'Chew Bone', desc: 'Mochi only. Attack +7' },
    jacket:       { name: 'Jacket', desc: 'Defense +3' },
    hoodie:       { name: 'Hoodie', desc: 'Defense +6' },
    raincoat:     { name: 'Raincoat', desc: 'Defense +5, Magic +3' },
    uniform:      { name: 'Field Day Jersey', desc: 'Defense +10, Speed +3' },
    dogVest:      { name: 'Doggy Vest', desc: 'Mochi only. Defense +6' },
    eraser:       { name: 'Lucky Eraser', desc: 'Luck +6' },
    sneakers:     { name: 'Lightning Sneakers', desc: 'Speed +6' },
    bell:         { name: 'Bell Collar', desc: 'Mochi only. Speed +4, Luck +4' },
    coyoteBadge:  { name: 'Coyote Badge', desc: 'GO COYOTES! All stats +3' },
    trophy:       { name: 'Coyote Cup', desc: 'The championship trophy of Sage Canyon Field Day.' },
    fur:          { name: 'Gray Fur', desc: 'Found inside the robot. Looks like... raccoon fur?' }
  },
  skill: {
    tackle:     { name: 'Tackle', desc: 'Charge in shoulder first.' },
    cheer:      { name: 'Pep Talk', desc: "Raises the party's Attack for 3 turns." },
    soccerKick: { name: 'Power Kick', desc: 'A full-strength soccer shot.' },
    dodgeball:  { name: 'Dodgeball Frenzy', desc: 'Pelts every enemy with dodgeballs.' },
    braveHeart: { name: 'Brave Heart', desc: "Big brother's finishing move! One huge hit." },
    paperPlane: { name: 'Paper Plane', desc: 'Launch a paper plane (wind).' },
    firstAid:   { name: 'Kiss It Better', desc: '"All better~" Restores one ally\'s HP.' },
    calmDown:   { name: 'Deep Breath', desc: "Cures one ally's status problems." },
    volcano:    { name: 'Soda Volcano', desc: 'Science eruption! Fire damage to all enemies.' },
    lullaby:    { name: 'Lullaby', desc: 'Hum the enemies to sleep.' },
    ideaBolt:   { name: 'Bright Idea', desc: 'A good idea strikes like lightning (thunder).' },
    groupHug:   { name: 'Group Hug', desc: "Restores the whole party's HP." },
    bigIdea:    { name: 'Big Brain Storm', desc: 'Brain at full speed: thunder hits all enemies.' },
    nibble:     { name: 'Nibble', desc: 'Little teeth, big chomp.' },
    lick:       { name: 'Lick', desc: 'A lick or two. The ouchie feels better.' },
    bark:       { name: 'Big Bark', desc: 'A loud bark that may scare all enemies stiff.' },
    puppyEyes:  { name: 'Puppy Eyes', desc: "Watery eyes lower an enemy's Attack." },
    zoomies:    { name: 'Zoomies', desc: 'Sudden zoomies crash into all enemies.' },
    sting:      { name: 'Sting' },
    screech:    { name: 'Screech' },
    snatch:     { name: 'Snack Snatch' },
    lecture:    { name: 'Boring Lecture' },
    paperCut:   { name: 'Paper Cut' },
    ring:       { name: 'RING RING!' },
    gooSplash:  { name: 'Goo Splash' },
    suck:       { name: 'Suck Up' },
    overdrive:  { name: 'Overdrive' },
    kingSlam:   { name: 'Royal Slam' },
    trashStorm: { name: 'Trash Tornado' },
    feast:      { name: 'Big Feast' }
  },
  status: {
    sleep:  { name: 'Asleep', short: 'Zz', skip: '{name} is fast asleep...' },
    scared: { name: 'Scared', short: '!', skip: "{name} is too scared to move!" },
    sticky: { name: 'Sticky', short: '~', tick: '{name} is gross and gooey.' },
    sad:    { name: 'Teary', short: ';;' },
    pumped: { name: 'Pumped', short: '^' }
  },
  enemy: {
    lizard:   { name: 'Fence Lizard' },
    gull:     { name: 'Snack Gull' },
    bee:      { name: 'Buzzy Bee' },
    crow:     { name: 'Grumpy Crow' },
    homework: { name: 'Flying Homework' },
    book:     { name: 'Angry Dictionary' },
    clock:    { name: 'Alarm Clock' },
    slime:    { name: 'Lab Slime' },
    robovac:  { name: 'RoboVac' },
    robomax:  { name: 'RoboVac MAX', defeat: '{name} sputters smoke and shuts down!' },
    raccoon:  { name: 'Bandit Raccoon' },
    bat:      { name: 'Cave Bat' },
    raccoonKing: { name: 'Raccoon King', defeat: '{name} holds his tummy and gives up!' }
  },
  troop: {
    robomax:     { intro: 'RoboVac MAX powers up! "DIRT... DETECTED... CLEANING!"' },
    raccoonKing: { intro: 'The Raccoon King leaps out hugging the trophy! "This is MY treasure!"' }
  },

  // ======================= story =======================
  intro: {
    1: "(Today is Field Day at Sage Canyon Elementary!)",
    2: "Josh! Jasper! Still asleep? It's Field Day!",
    3: "Leave it to me! I'm ready to win it all!",
    4: "Me too! My tooth fell out, so I'll run faster!",
    5: "...That's not how it works. Here, take these in case you get hungry.",
    6: "Head out the door and go east to get to school. Come back and rest if you get tired.",
    7: "(Press C for the menu, Z to talk or look, X to cancel.)"
  },
  ending: {
    1: 'The principal holds the Coyote Cup up high, and the whole school cheers: "GO COYOTES!"',
    2: 'The Raccoon King and his kits became Field Day mascot helpers. Turns out they run really fast.',
    3: "Josh won first place in the race, and Jasper's soda volcano got a special science fair prize.",
    4: 'Mochi carried a medal in his mouth and ran ten laps around the field.',
    5: '"What adventure will tomorrow bring?" the brothers wondered over their bento.',
    6: '~ THE END ~   Thank you for playing!'
  },
  home: {
    mom: { trophy: 'You found the trophy? Hurry, take it to the principal!', rest: 'Tired? Take a little rest before you head out.', rested: 'A snack and a nap later, everyone feels refreshed!' },
    tv: 'The TV is showing Field Day news: "The Coyote Cup of Sage Canyon Elementary..." Huh? The picture cut out.'
  },
  street: {
    neighborDoor: 'The neighbors\' door is locked. A note says: "Gone to Field Day!"',
    parkSign: '"Sage Canyon Park"   → Sage Canyon Elementary   ↑ Home is across Carmel Mountain Rd',
    trailSign: '"Sage Canyon Trail" Stay on the trail. Watch out for rattlesnakes and... raccoons?',
    signFoxhound: 'Street sign: Foxhound Way',
    signCarmel: 'Street sign: Harvest Run Dr / Carmel Mountain Rd',
    signHunters: 'Street sign: Hunters Glen Dr',
    restroom: "The park's public restroom. ...Not right now, thanks.",
    guard: 'Use the crosswalk on Carmel Mountain Rd, and look both ways!',
    mochi: {
      see: 'A little shiba pup is running circles in the park. Its collar says "Mochi".',
      stare: "Mochi is staring at your pocket. Drool incoming...",
      give: 'Give a cookie', pet: 'Just pet him',
      woof: 'Woof! Woof woof!',
      follows: 'Looks like Mochi has decided to come with you!',
      jasper: "Yay! His owner must be at school watching Field Day. Let's bring him along!",
      wag: 'Mochi wags happily, then goes right back to staring at your pocket.',
      hungry: 'Mochi sniffs your hand. He looks hungry... if only you had a snack.'
    },
    oldman: "Morning, kids. Raccoons keep raiding the trash cans lately. You can hear them making a racket in the canyon at night.",
    kid: { 1: "Have you seen a shiba pup? I think he belongs to the school janitor.", 2: 'I heard he LOVES chocolate cookies.' },
    jogger: 'Lots of critters in the canyon brush. Remember to eat something if you get tired!'
  },
  canyon: {
    ranger: {
      quest: "A pack of raccoons lives in that cave. It's dangerous. Without proof, I can't let kids in.",
      keepOut: "That's the raccoon cave ahead. No kids allowed!",
      fur: "Raccoon fur? So THEY did it! The cave goes deep, so be careful."
    },
    hiker: 'Things jump out of the bushes a lot. If you can\'t win, running away takes courage too!'
  },
  school: {
    libraryLocked: 'The library door is locked. Go say hi to the principal first.',
    principal: {
      trophy1: "Th-that's the Coyote Cup! You found it!",
      trophy2: 'So the Raccoon King hid it as his treasure. Ha ha! No wonder shiny things kept disappearing.',
      trophy3: 'Students! Field Day officially begins! GO COYOTES!',
      fur1: "Gray fur? That's raccoon fur... the raccoon cave in the canyon!",
      fur2: "I called the ranger. He'll let you through. We're counting on you!",
      remind: 'The night the trophy vanished, there were strange noises in the library... Please go take a look!',
      intro1: "Ah, Josh and Jasper! Terrible news: the Field Day championship trophy, the Coyote Cup, is missing!",
      intro2: "Without the trophy, Field Day can't start...",
      josh: "Leave it to us! We'll bring the trophy back for sure!",
      jasper: 'Last night I saw the library lights flickering on and off.',
      intro3: "The STEAM lab is behind the library... I've unlocked the door for you. Take these, and be careful!"
    },
    nurse: { hello: "Took a tumble? Come here, let me patch you up.", rested: 'Some ointment and some water later, everyone feels refreshed!' },
    coach: "No trophy, no games! If you're going after it, grab some gear from the shed first!",
    mascot: { thumbs: '(A big kid in a coyote costume gives you a thumbs up.)', go: 'GO COYOTES!!', sad: '"Without the trophy, I can\'t even do my cheer dance..."' },
    leo: "I heard the RoboVac in the STEAM lab has been acting weird. It keeps sucking up strange stuff.",
    mia: "I'm totally winning dodgeball! Don't go easy on me, Josh.",
    ethan: 'Did you know? Hit robots with water and they short-circuit!'
  },
  library: {
    librarian: {
      shh: 'Shhh, the library is a quiet place. Lately the books have been flying around on their own... so scary...',
      rest: 'The lab is further in. Would you like to rest here first?',
      rested: 'After a rest in the quiet reading nook, everyone feels refreshed!'
    },
    robomax: {
      beep: 'BEEP... BEEP... DIRT... DETECTED.',
      jasper: "There's a clump of gray fur stuck in its dust bin!",
      stops: 'The robot stops in a puff of smoke, and its dust bin pops open with a click.',
      josh: 'Gray fur... and it smells kind of like garbage. Raccoon?',
      jasper2: 'A raccoon must have snuck into school that night, and the robot sucked up some fur chasing it! Let\'s show the principal!'
    }
  },
  cave: {
    king: {
      who: 'WHO DARES enter the royal treasure room?!',
      josh: 'That trophy belongs to the school! Give it back!',
      shiny: 'Everything shiny belongs to ME! If you want it, beat me first!',
      give: "Waaah... fine, fine, take it back. I just wanted something shiny...",
      jasper: 'Um... after Field Day, how about we give you a participation medal?',
      deal: 'R-really?! Deal!',
      josh2: "We got the trophy back! Let's take it to the principal!"
    }
  }
});
