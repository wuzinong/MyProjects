import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { MAP } from '../src/data/game.js';
import { GameScene } from '../src/render/scene.js';
import { makeLandscape, animateLandscape, sceneryCity } from '../src/render/landscape.js';

test('city scenery changes within a region and special tiles keep the last compatible landmark', () => {
  assert.equal(sceneryCity({ pos: 6, region: 1 }, undefined), 6);
  assert.equal(sceneryCity({ pos: 8, region: 1 }, 6), 8);
  assert.equal(sceneryCity({ pos: 10, region: 1 }, 8), 8);
  assert.equal(MAP[sceneryCity({ pos: 10, region: 6 }, 8)].group, 6);
});
test('all city landscapes have finite geometry and dispose owned resources without growing shared caches', () => {
  const v = Object.create(GameScene.prototype);
  v.materials = new Map();
  v.geometries = new Map();
  v.board = new T.Group();
  const cities = MAP.filter((t) => t.group >= 0);
  let warmed = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (const city of cities) {
      const root = makeLandscape(v, city.group, city.id);
      v.board.add(root);
      const bounds = new T.Box3().setFromObject(root);
      assert.ok(Number.isFinite(bounds.max.y) && bounds.max.y > 1);
      let owned = 0,
        disposed = 0;
      root.traverse((o) => {
        if (o.userData.ownedGeometry) {
          owned++;
          o.geometry.addEventListener('dispose', () => disposed++);
        }
      });
      root.userData.materials.forEach((m) => {
        owned++;
        m.addEventListener('dispose', () => disposed++);
      });
      animateLandscape(root, 1200, false);
      animateLandscape(root, 1300, true);
      root.updateMatrixWorld(true);
      const snapshot = root.userData.animations.map((a) => a.object.matrix.clone());
      animateLandscape(root, 9999, true);
      root.updateMatrixWorld(true);
      root.userData.animations.forEach((a, i) => {
        assert.deepEqual(a.object.matrix.elements, snapshot[i].elements);
      });
      v.disposeLandscape(root);
      assert.equal(disposed, owned);
      assert.equal(v.board.children.length, 0);
    }
    if (pass === 0) warmed = v.geometries.size;
    else assert.equal(v.geometries.size, warmed);
  }
  v.materials.forEach((m) => m.dispose());
  v.geometries.forEach((g) => g.dispose());
});
