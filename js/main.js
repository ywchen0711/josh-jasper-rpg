/*
 * Main loop, scene switching, fades, warps, title / settings / game over / ending.
 * A scene is { enter(arg), update(blocked), draw() } — `blocked` is true while a UI layer (dialogue, menu) is open.
 */
(function () {
  'use strict';
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

  // ======================= settings (language, effects) =======================
  RPG.openSettings = async function () {
    for (;;) {
      var lang = RPG.LANGS.filter(function (l) { return l.id === RPG.lang; })[0];
      var i = await RPG.ui.menu({
        title: RPG.t('ui.settings'), w: 190,
        items: [
          { label: RPG.t('ui.language'), right: lang ? lang.label : RPG.lang },
          { label: RPG.t('ui.effects'), right: RPG.fx.canFilter ? RPG.t(RPG.fx.on ? 'ui.on' : 'ui.off') : RPG.t('ui.unsupported'), disabled: !RPG.fx.canFilter },
          { label: RPG.t('ui.back') }
        ]
      });
      if (i < 0 || i === 2) return;
      if (i === 0) { var k = RPG.LANGS.indexOf(lang); RPG.setLang(RPG.LANGS[(k + 1) % RPG.LANGS.length].id); }
      if (i === 1) RPG.fx.set(!RPG.fx.on);
    }
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
      for (;;) {
        var hasSave = [1, 2, 3].some(function (s) { return RPG.loadSlot(s); });
        var i = await RPG.ui.menu({ items: [{ label: RPG.t('ui.newGame') }, { label: RPG.t('ui.continue'), disabled: !hasSave }, { label: RPG.t('ui.settings') }], y: 98, w: 130, cancel: true });
        if (i === 0) { RPG.newGame(); RPG.go('map'); this.open = false; await RPG.run(RPG.db.config.intro || []); return; }
        if (i === 1) {
          var slot = await RPG.pickSlot(RPG.t('ui.loadWhich'), true);
          if (slot > 0 && RPG.load(slot)) { RPG.go('map'); RPG.ui.toast(RPG.t('ui.loaded', { n: slot })); this.open = false; return; }
          continue;
        }
        if (i === 2) { await RPG.openSettings(); continue; }
        break;
      }
      this.open = false;
    },
    draw: function () {
      var c = RPG.db.config, g = RPG.ctx;
      if (RPG.db.backdrops.title) RPG.db.backdrops.title.draw(g, this.t);
      if (c.titleSprites) c.titleSprites.forEach(function (s, i) {
        var x = RPG.W / 2 - 52 + i * 36, y = 150 + Math.abs(Math.sin((RPG.frame + i * 20) / 14)) * -3;
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + 16, 182, 12, 3, 0, 0, Math.PI * 2); g.fill();
        RPG.drawSprite(s.sprite, x, y, { pose: 'down', frame: Math.floor(RPG.frame / 20) % 2, scale: 2, palette: s.palette });
      });
      if (RPG.fx.active()) RPG.fx.post({ bloom: 0.38, grade: 'warm', vignette: 0.5 });
      RPG.text(RPG.t('game.title'), RPG.W / 2, 40, { size: 26, bold: true, align: 'center', color: '#ffe080' });
      RPG.text(RPG.t('game.subtitle'), RPG.W / 2, 76, { size: 12, align: 'center', color: '#ffffff' });
      if (!this.open && Math.floor(this.t / 30) % 2) RPG.text(RPG.t('ui.pressStart'), RPG.W / 2, 116, { size: 11, align: 'center' });
      RPG.text(RPG.t('ui.controls'), RPG.W / 2, 222, { size: 9, align: 'center', color: '#e0e8ff' });
    }
  };

  RPG.pickSlot = function (title, loading) {
    var items = [1, 2, 3].map(function (s) { var sum = RPG.saveSummary(s); return { label: RPG.t('ui.slot', { n: s }) + '  ' + (sum || RPG.t('ui.emptySlot')), disabled: loading && !sum }; });
    return RPG.ui.menu({ title: title, items: items, w: 250 }).then(function (i) { return i < 0 ? -1 : i + 1; });
  };

  // ======================= game over / ending =======================
  RPG.gameOver = async function () {
    RPG.sfx('lose');
    RPG.go('gameover');
    await RPG.wait(60);
    var i = await RPG.ui.menu({ items: [{ label: RPG.t('ui.loadSave') }, { label: RPG.t('ui.toTitle') }], y: 150, w: 120, cancel: false });
    if (i === 0) {
      var slot = await RPG.pickSlot(RPG.t('ui.loadWhich'), true);
      if (slot > 0 && RPG.load(slot)) { RPG.go('map'); return; }
    }
    RPG.go('title');
  };
  RPG.scenes.gameover = {
    update: function () {},
    draw: function () {
      var g = RPG.ctx;
      g.fillStyle = '#0a0a14'; g.fillRect(0, 0, RPG.W, RPG.H);
      RPG.text(RPG.t('game.gameOver'), RPG.W / 2, 90, { size: 18, bold: true, align: 'center', color: '#ff8080' });
    }
  };
  RPG.ending = async function () {
    await RPG.fadeOut(40);
    RPG.go('ending');
    await RPG.fadeIn(40);
    var lines = RPG.db.config.ending || [];
    for (var i = 0; i < lines.length; i++) { RPG.scenes.ending.line = i; await RPG.ui.push({ update: function () { if (RPG.input.take('ok')) this.close(); } }); }
    await RPG.fadeOut(30);
    RPG.go('title');
    await RPG.fadeIn(20);
  };
  RPG.scenes.ending = {
    line: 0,
    update: function () {},
    draw: function () {
      var g = RPG.ctx;
      if (RPG.db.backdrops.ending) RPG.db.backdrops.ending.draw(g, RPG.frame);
      if (RPG.fx.active()) RPG.fx.post({ bloom: 0.4, grade: 'dusk', vignette: 0.5 });
      var lines = RPG.db.config.ending || [], ln = RPG.say(lines[this.line] || '');
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
    RPG.beginFrame();                                  // scenes may have drawn into other canvases
    RPG.ui.draw();
    if (RPG.fadeAlpha > 0) { RPG.g.fillStyle = 'rgba(0,0,0,' + RPG.fadeAlpha + ')'; RPG.g.fillRect(0, 0, RPG.W, RPG.H); }
  }
  function loop(now) {
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
    render();
    requestAnimationFrame(loop);
  }
  RPG.start = function () {
    RPG.syncPage();
    RPG.go('title');
    requestAnimationFrame(loop);
  };
  RPG.step = function (n) { for (var i = 0; i < (n || 1); i++) tick(); render(); };
})();
