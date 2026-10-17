# Josh & Jasper 大冒險 ～郊狼獎盃不見了！～

A humorous turn-based RPG in the browser, starring two elementary-school brothers, **Josh** and **Jasper** (and **Mochi**, a lost Shiba puppy who joins for a cookie).
Field Day at Sage Canyon School can't start: the Coyote Trophy is gone. Follow the clues through the neighborhood, the canyon trail,
the school library and STEAM lab, all the way to the raccoon cave.

**Chapter 2 – Field Trip Frenzy!** A week later the class takes the bus to Torrey Pines, with Dad as the parent chaperone
(and his dad jokes). A sunscreen robot goes haywire on the bus, Mochi turns up in Josh's backpack, a hermit crab moves into
the lunch cooler, and an octopus professor grabs the class camera. Then the fog rolls in, Mochi goes missing, and the boys and Dad
search the foggy bluffs for the "ghost of Flat Rock"... all the way down to a glowing sea cave.

**Play:** https://ywchen0711.github.io/josh-jasper-rpg/

Plain HTML + JavaScript, no build step and no asset files — pixel art, tiles and sound are generated in code.
The game is **data-driven**: characters, items, skills, enemies, maps and story live in `js/data/` and are easy to extend
(see [MODDING.md](MODDING.md)). **Every line of text** lives in one file per language (`js/lang/zh.js`, `js/lang/en.js`),
so dialogue can be rewritten or a new language added without touching the game.

## Controls

| Key | |
|---|---|
| Arrow keys / WASD | walk, move the cursor |
| Z / Enter / Space | talk, check, confirm |
| X / Esc | cancel, go back |
| C / Tab | menu (items, skills, equipment, status, settings, save) |

Phones get an on-screen d-pad with A / B / Menu buttons.

## Features

- Map exploration with NPCs, chests, shops, inns, warps and random encounters in tall grass and dungeons
- Turn-based battles: attack, skills, items, defend, run; turn order by speed; weaknesses and resistances;
  sleep / scared / sticky / sad / pumped status effects; buffs and debuffs; critical hits; boss fights
- **Chapter 1** complete: five companions (Josh, Jasper, Mochi, Mia the dodgeball queen, Ethan the little inventor),
  4 bosses plus an optional one, 23 kinds of monsters, about 50 items, and a chapter card + teaser at the end
- **Chapter 2** complete, continuing straight from the Chapter 1 ending: 6 new maps (the school bus, Torrey Pines beach,
  the beach in the fog, the tide pools, the foggy bluffs, the Flat Rock sea cave), Dad as a guest party member,
  5 bosses plus an optional Sandcastle King after the ending, 13 new monsters, about 30 new items, 18 new skills
  (the kids learn new moves at Lv 13–22, and saves pick them up automatically), a tide pool worksheet, fog, and
  a sunset ending. After it you can keep playing: Ms. Rivera at school drives you back to the beach
- Up to 4 fight; reserves get half EXP and the order can be changed in the menu (Party)
- Cute hi-res chibi pixel art painted in code (`js/pixel.js`): big heads, sparkly eyes, blush, shaded monsters
- Experience, levels, gold, item drops, 3 save slots (in the browser)
- Traditional Chinese and English, switchable any time in Settings (remembered by the browser)
- HD-2D look inspired by *Octopath Traveler*: the map is a tilted diorama with depth of field, bloom, light sources,
  drifting leaves / dust / fireflies, color grading, soft shadows, and trees you can walk behind
  (can be turned off in Settings)
- Event scripts for dialogue, choices, battles, rewards and flags

## Files

```
index.html               page and touch buttons
js/core.js               data registry, party, stats, inventory, flags, save / load
js/i18n.js               text keys and languages: RPG.t('ui.items'), RPG.name('items', 'cookie')
js/render.js             crisp canvas, text, windows, sprite and tile caches
js/pixel.js              pixel painter: chibi people, Mochi, monsters (32x32 detail)
js/fx.js                 HD-2D effects: diorama tilt, depth of field, bloom, lights, particles, grading
js/ui.js                 input, dialogue, menus, toasts, sound effects
js/script.js             event script commands
js/effects.js            what skills and items do, damage formula
js/main.js               loop, scenes, title, game over, ending
js/scenes/map.js         walking around
js/scenes/battle.js      battles
js/scenes/menu.js        field menu and shops
js/data/*.js             all the game content  ← edit these
js/data/chapter2.js      everything for Chapter 2 in one file (art, tiles, enemies, items, maps, story)
js/lang/*.js             all the text, one file per language  ← and these
js/lang/*.ch2.js         the Chapter 2 text (zh.ch2.js, en.ch2.js)
tools/check-data.js      checks the data and that every text key exists in every language: node tools/check-data.js
```

Run locally with any static server (`python -m http.server 8000`) or just open `index.html`.
