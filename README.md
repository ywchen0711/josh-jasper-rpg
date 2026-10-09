# Josh & Jasper 大冒險 ～郊狼獎盃不見了！～

A humorous turn-based RPG in the browser, starring two elementary-school brothers, **Josh** and **Jasper** (and **Mochi**, a lost Shiba puppy who joins for a cookie).
Field Day at Sage Canyon School can't start: the Coyote Trophy is gone. Follow the clues through the neighborhood, the canyon trail,
the school library and STEAM lab, all the way to the raccoon cave.

**Play:** https://ywchen0711.github.io/josh-jasper-rpg/

Plain HTML + JavaScript, no build step and no asset files — pixel art, tiles and sound are generated in code.
The game is **data-driven**: characters, items, skills, enemies, maps and story live in `js/data/` and are easy to extend
(see [MODDING.md](MODDING.md)).

## Controls

| Key | |
|---|---|
| Arrow keys / WASD | walk, move the cursor |
| Z / Enter / Space | talk, check, confirm |
| X / Esc | cancel, go back |
| C / Tab | menu (items, skills, equipment, status, save) |

Phones get an on-screen d-pad with A / B / Menu buttons.

## Features

- Map exploration with NPCs, chests, shops, inns, warps and random encounters in tall grass and dungeons
- Turn-based battles: attack, skills, items, defend, run; turn order by speed; weaknesses and resistances;
  sleep / scared / sticky / sad / pumped status effects; buffs and debuffs; critical hits; boss fights
- Three party members with their own skills learned by level, equipment for weapon / clothes / accessory
- Experience, levels, gold, item drops, 3 save slots (in the browser)
- Story in Traditional Chinese, with event scripts for dialogue, choices, battles, rewards and flags

## Files

```
index.html               page and touch buttons
js/core.js               data registry, party, stats, inventory, flags, save / load
js/render.js             crisp canvas, text, windows, sprite and tile caches
js/ui.js                 input, dialogue, menus, toasts, sound effects
js/script.js             event script commands
js/effects.js            what skills and items do, damage formula
js/main.js               loop, scenes, title, game over, ending
js/scenes/map.js         walking around
js/scenes/battle.js      battles
js/scenes/menu.js        field menu and shops
js/data/*.js             all the game content  ← edit these
tools/check-data.js      checks the data for mistakes: node tools/check-data.js
```

Run locally with any static server (`python -m http.server 8000`) or just open `index.html`.
