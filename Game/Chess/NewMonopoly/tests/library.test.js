import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP, CARDS, GENERALS, LORDS, BUILDING_NAMES } from '../src/data/game.js';
import { CITY_LORE, citySource } from '../src/data/places.js';
import { LIBRARY_ENTRIES, filterLibrary, libraryContent } from '../src/ui/library.js';

const ui = {
  esc: (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    ),
  portrait: () => '<svg aria-hidden="true"></svg>',
};
test('catalog includes every character, card, building stage and map space without duplicate keys', () => {
  assert.equal(new Set(LIBRARY_ENTRIES.map((e) => e.id)).size, LIBRARY_ENTRIES.length);
  for (const [category, names] of [
    ['people', [...LORDS, ...GENERALS].map((e) => e.name)],
    ['cards', CARDS.map((e) => e.name)],
    ['buildings', BUILDING_NAMES],
    ['places', MAP.map((e) => e.name)],
  ])
    assert.deepEqual(
      filterLibrary(category)
        .map((e) => e.name)
        .sort(),
      [...names].sort(),
    );
  assert.equal(new Set(Object.values(CITY_LORE).map((lore) => lore[0])).size, 46);
  for (const t of MAP.filter((t) => t.kind === 'city')) {
    assert.ok(CITY_LORE[t.name][0].length > 35);
    assert.ok(citySource(t.name).url.startsWith('https://zh.wikisource.org/wiki/'));
  }
  assert.throws(() => citySource('不存在'), /缺少/);
});
test('every detail renders useful read-only content without changing shared rules', () => {
  const original = JSON.stringify({ MAP, CARDS, GENERALS, LORDS });
  for (const e of LIBRARY_ENTRIES) {
    const { body } = libraryContent(e.category, '', e.id, ui);
    assert.ok(body.includes(ui.esc(e.summary)));
    assert.doesNotMatch(body, /\bundefined\b|\bNaN\b|data-cmd=|data-card=|data-general=/);
    assert.match(body, /data-library-back/);
  }
  assert.equal(JSON.stringify({ MAP, CARDS, GENERALS, LORDS }), original);
});
test('search supports names, regions, whitespace, empty results and safely escaped input', () => {
  assert.ok(filterLibrary('people', ' 陈庆之 ').some((e) => e.name === '陈庆之'));
  assert.ok(filterLibrary('places', '巴蜀').every((e) => MAP[e.index].group === 7));
  assert.equal(filterLibrary('cards', '不存在的功能卡').length, 0);
  const { body } = libraryContent('cards', '"><img src=x onerror=alert(1)>', null, ui);
  assert.match(body, /没有符合条件/);
  assert.doesNotMatch(body, /<img/);
  assert.match(body, /&quot;&gt;&lt;img/);
  assert.throws(() => filterLibrary('invalid'), /分类不存在/);
  assert.throws(() => libraryContent('cards', '', 'people-0', ui), /条目不存在/);
});
test('equipment and city details show actual quality bonuses and all building rents', () => {
  const weapon = libraryContent('equipment', '', 'equipment-26', ui).body;
  assert.match(weapon, /绝品·环首刀/);
  assert.match(weapon, /攻击<\/dt><dd>\+20/);
  assert.match(weapon, /550金/);
  const city = libraryContent('places', '', 'places-37', ui).body;
  for (const rent of MAP[37].rent) assert.ok(city.includes(`${rent}金`));
  for (const name of BUILDING_NAMES) assert.ok(city.includes(name));
  const lord = libraryContent('people', '', 'people--1', ui).body;
  assert.match(lord, /主公经营特性/);
  assert.match(lord, /Lv.45/);
});
