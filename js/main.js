/*
 * Main loop, scene switching, fades, warps, title / game over / ending screens.
 * A scene is { enter(arg), update(blocked), draw() } — `blocked` is true while a UI layer (dialogue, menu) is open.
 */
(function () {
  'use strict';
  var g = RPG.g;
  RPG.frame = 0;
  RPG.scene = null;
  RPG.fadeAlpha = 0;

  RPG.go = function (name, arg) { RPG.scene = RPG.scenes[name]; if (RPG.scene.enter) RPG.scene.enter(arg); };

  RPG.fadeOut = async function (frames) { frames = frames || 16; for (var i = 1; i <= frames; i++) { RPG.fadeAlpha = i / frames; await RPG.wait(1); } };
  RPG.fadeIn = async function (frames) { frames = frames || 16; for (var i = frames - 1; i >= 0; i--) { RPG.fadeAlpha = i / frames; await RPG.wait(1); } };
  RPG.fade = async function (frames) { await RPG.fadeOut(frames / 2); await RPG.fadeIn(frames / 2); };

  RPG.warp = async function (mapId, x, y, dir) {
    RPG.sfx('door');
    await RPG.fadeOut(12);
    var s = RPG.state;
    s.map = mapId; s.x = x; s.y = y; if (dir) s.dir = dir;
    RPG.go('map');
    await RPG.fadeIn(12);
  };

  // ======================= title =======================
  RPG.scenes.title = {
    enter: function () { this.t = 0; this.open = false; },
    update: function (blocked) {
      this.t++;
      if (blocked || this.open || this.t < 20) return;
      if (RPG.input.take('ok')) this.menu();
    },
    menu: async function () {
      this.open = true;
      var hasSave = [1, 2, 3].some(function (s) { return RPG.loadSlot(s); });
      var i = await RPG.ui.menu({ items: [{ label: '開始新遊戲' }, { label: '繼續遊戲', disabled: !hasSave }], y: 150, w: 120, cancel: false });
      if (i === 0) { RPG.newGame(); RPG.go('map'); await RPG.run(RPG.db.config.intro || []); }
      else if (i === 1) {
        var slot = await RPG.pickSlot('讀取哪一個存檔？', true);
        if (slot > 0 && RPG.load(slot)) { RPG.go('map'); RPG.ui.toast('讀取了存檔 ' + slot); }
      }
      this.open = false;
    },
    draw: function () {
      var c = RPG.db.config;
      if (RPG.db.backdrops.title) RPG.db.backdrops.title.draw(g, this.t);
      else { g.fillStyle = '#2a64b8'; g.fillRect(0, 0, RPG.W, RPG.H); }
      RPG.text(c.title || 'RPG', RPG.W / 2, 44, { size: 26, bold: true, align: 'center', color: '#ffd860' });
      RPG.text(c.subtitle || '', RPG.W / 2, 80, { size: 12, align: 'center', color: '#ffffff' });
      if (c.titleSprites) c.titleSprites.forEach(function (s, i) {
        RPG.drawSprite(s.sprite, RPG.W / 2 - 50 + i * 36, 104 + Math.abs(Math.sin((RPG.frame + i * 20) / 14)) * -3, { pose: 'down', frame: Math.floor(RPG.frame / 20) % 2, scale: 2, palette: s.palette });
      });
      if (!this.open && Math.floor(this.t / 30) % 2) RPG.text('按 Z / Enter 開始', RPG.W / 2, 170, { size: 11, align: 'center' });
      RPG.text('方向鍵移動 · Z 確定 · X 取消 · C 選單', RPG.W / 2, 222, { size: 9, align: 'center', color: '#c8d4ff' });
    }
  };

  RPG.pickSlot = function (title, loading) {
    var items = [1, 2, 3].map(function (s) { var sum = RPG.saveSummary(s); return { label: '存檔 ' + s + '　' + (sum || '（空）'), disabled: loading && !sum }; });
    return RPG.ui.menu({ title: title, items: items, w: 240 }).then(function (i) { return i < 0 ? -1 : i + 1; });
  };

  // ======================= game over / ending =======================
  RPG.gameOver = async function () {
    RPG.sfx('lose');
    RPG.go('gameover');
    await RPG.wait(60);
    var i = await RPG.ui.menu({ items: [{ label: '讀取存檔' }, { label: '回到標題' }], y: 150, w: 110, cancel: false });
    if (i === 0) {
      var slot = await RPG.pickSlot('讀取哪一個存檔？', true);
      if (slot > 0 && RPG.load(slot)) { RPG.go('map'); return; }
    }
    RPG.go('title');
  };
  RPG.scenes.gameover = {
    update: function () {},
    draw: function () {
      g.fillStyle = '#0a0a14'; g.fillRect(0, 0, RPG.W, RPG.H);
      RPG.text(RPG.db.config.gameOverText || '全滅了……', RPG.W / 2, 90, { size: 18, bold: true, align: 'center', color: '#ff8080' });
    }
  };
  RPG.ending = async function () {
    await RPG.fadeOut(40);
    RPG.go('ending');
    await RPG.fadeIn(40);
    var lines = RPG.db.config.ending || ['THE END'];
    for (var i = 0; i < lines.length; i++) { RPG.scenes.ending.line = i; await RPG.ui.push({ update: function () { if (RPG.input.take('ok')) this.close(); } }); }
    await RPG.fadeOut(30);
    RPG.go('title');
    await RPG.fadeIn(20);
  };
  RPG.scenes.ending = {
    line: 0,
    update: function () {},
    draw: function () {
      if (RPG.db.backdrops.ending) RPG.db.backdrops.ending.draw(g, RPG.frame);
      else { g.fillStyle = '#101830'; g.fillRect(0, 0, RPG.W, RPG.H); }
      var lines = RPG.db.config.ending || [], ln = lines[this.line] || '';
      RPG.box(20, 150, RPG.W - 40, 70);
      RPG.wrap(ln, RPG.W - 70, 12).forEach(function (s, i) { RPG.text(s, 34, 162 + i * 16, { size: 12 }); });
    }
  };

  // ======================= loop =======================
  var last = performance.now(), acc = 0;
  function tick() {
    RPG.frame++;
    RPG.tickWaiters();
    var blocked = RPG.ui.busy();
    if (blocked) RPG.ui.update();
    if (RPG.scene && RPG.scene.update) RPG.scene.update(blocked);
    if (RPG.state && RPG.scene && (RPG.scene === RPG.scenes.map || RPG.scene === RPG.scenes.battle)) RPG.state.time++;
    RPG.input.endFrame();
  }
  function render() {
    RPG.beginFrame();
    if (RPG.scene && RPG.scene.draw) RPG.scene.draw();
    RPG.ui.draw();
    if (RPG.fadeAlpha > 0) { g.fillStyle = 'rgba(0,0,0,' + RPG.fadeAlpha + ')'; g.fillRect(0, 0, RPG.W, RPG.H); }
  }
  function loop(now) {
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
    render();
    requestAnimationFrame(loop);
  }
  RPG.start = function () {
    RPG.go('title');
    requestAnimationFrame(loop);
  };
  // tests can advance time without waiting for the screen
  RPG.step = function (n) { for (var i = 0; i < (n || 1); i++) tick(); render(); };
})();
