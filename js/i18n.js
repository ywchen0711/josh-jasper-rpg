/*
 * Text and languages. Every word the player sees lives in js/lang/<language>.js — the engine and the data
 * only use keys:
 *   RPG.t('battle.attacks', { name: 'Josh' })          → "Josh 的攻擊！" / "Josh attacks!"
 *   RPG.name('items', 'cookie'), RPG.desc('skills', 'tackle')
 *   in scripts:  { say: 'home.mom.hello', name: 'mom' }
 * Add a language: copy js/lang/en.js to js/lang/xx.js, translate, add it to index.html and to RPG.LANGS.
 */
(function () {
  'use strict';
  var texts = {};
  RPG.LANGS = [{ id: 'zh', label: '中文' }, { id: 'en', label: 'English' }];
  RPG.FALLBACK = 'zh';

  var saved = null;
  try { saved = localStorage.getItem('jjrpg.lang'); } catch (e) { /* private mode */ }
  var fromLobby = (typeof location !== 'undefined' && (location.search.match(/[?&]lang=(zh|en)(?![a-z])/) || [])[1]);   // the lobby opens games with ?lang=zh|en
  if (fromLobby) { saved = fromLobby; try { localStorage.setItem('jjrpg.lang', saved); } catch (e) { /* private mode */ } }
  RPG.lang = saved || (typeof navigator !== 'undefined' && navigator.language && !/^zh/i.test(navigator.language) ? 'en' : 'zh');

  // nested objects are flattened to dotted keys: { ui: { yes: 'Yes' } } -> 'ui.yes'
  RPG.addText = function (lang, table, prefix) {
    texts[lang] = texts[lang] || {};
    (function walk(obj, pre) {
      Object.keys(obj).forEach(function (k) {
        var v = obj[k], key = pre ? pre + '.' + k : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
        else texts[lang][key] = v;
      });
    })(table, prefix || '');
  };
  RPG.hasText = function (key, lang) { return (texts[lang || RPG.lang] || {})[key] != null || (texts[RPG.FALLBACK] || {})[key] != null; };
  RPG.t = function (key, vars) {
    if (key == null) return '';
    var v = (texts[RPG.lang] || {})[key];
    if (v == null) v = (texts[RPG.FALLBACK] || {})[key];
    if (v == null) return String(key);                 // missing text shows its key (tools/check-data.js finds these)
    if (Array.isArray(v)) v = v.join('\n');
    return String(v).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  };
  RPG.textKeys = function (lang) { return Object.keys(texts[lang] || {}); };
  RPG.setLang = function (id) {
    RPG.lang = id;
    try { localStorage.setItem('jjrpg.lang', id); } catch (e) { /* ignore */ }
    RPG.syncPage();
  };
  // the browser tab title and <html lang> follow the game language
  RPG.syncPage = function () {
    if (typeof document === 'undefined' || !document.documentElement) return;
    document.documentElement.lang = RPG.lang === 'zh' ? 'zh-Hant' : RPG.lang;
    if (RPG.hasText('game.title')) document.title = RPG.t('game.title');
  };

  // names and descriptions of things in the database: '<kind>.<id>.name'
  var KIND = { items: 'item', skills: 'skill', enemies: 'enemy', characters: 'character', statuses: 'status', maps: 'map', shops: 'shop', troops: 'troop' };
  RPG.name = function (kind, id) { return RPG.t((KIND[kind] || kind) + '.' + id + '.name'); };
  RPG.desc = function (kind, id) { return RPG.t((KIND[kind] || kind) + '.' + id + '.desc'); };
  RPG.textOf = function (kind, id, field) { return RPG.t((KIND[kind] || kind) + '.' + id + '.' + field); };
  // who is talking: an NPC name key, a party member, or nothing
  RPG.speaker = function (n) {
    if (!n) return null;
    if (RPG.hasText('npc.' + n)) return RPG.t('npc.' + n);
    if (RPG.db.characters[n]) return RPG.name('characters', n);
    return RPG.t(n);
  };
})();
