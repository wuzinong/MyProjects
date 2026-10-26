import * as T from 'three';
import { MAP, ROUTE, ROUTE_INDEX } from '../data/game.js';

export const CENTER_SCALE = 1.6;
export const CENTER_CAMERA = [36.8, 43.2, 40];
export const WORLD_CAMERA = [70, 94, 82];
export const CLOSE_CAMERA = [10, 14, 12];

export function tilePosition(id) {
  const a = Math.PI / 4 + (ROUTE_INDEX[id] / ROUTE.length) * Math.PI * 2;
  const r = 38 + 2.8 * Math.sin(a * 3) + 1.2 * Math.cos(a * 7);
  return new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
}
export function routeCurve(index) {
  const a = tilePosition(ROUTE[index]);
  const b = tilePosition(ROUTE[(index + 1) % ROUTE.length]);
  const mid = a.clone().lerp(b, 0.5);
  const bend = mid
    .clone()
    .normalize()
    .multiplyScalar(Math.sin(index * 1.7) * 0.55);
  a.y = b.y = mid.y = 0.32;
  return new T.QuadraticBezierCurve3(a, mid.add(bend), b);
}
export function tileAngle(id) {
  const index = ROUTE_INDEX[id];
  const tangent = tilePosition(ROUTE[(index + 1) % ROUTE.length]).sub(
    tilePosition(ROUTE[(index + ROUTE.length - 1) % ROUTE.length]),
  );
  return -Math.atan2(tangent.z, tangent.x);
}
export function isRiverCrossing(index) {
  return index % 5 === 2;
}

export function makeWorld(v) {
  const root = new T.Group();
  const batches = new Map(),
    dummy = new T.Object3D();
  const groundColors = [
    '#9b884d',
    '#8d7356',
    '#6e8068',
    '#627a67',
    '#7d864e',
    '#47785b',
    '#538b73',
    '#416d50',
  ];
  const regionAt = (index) => {
    for (let n = 0; n < ROUTE.length; n++) {
      const t = MAP[ROUTE[(index + n) % ROUTE.length]];
      if (t.group >= 0) return t.group;
    }
    return 0;
  };
  const add = (shape, args, color, x, y, z, sx = 1, sy = sx, sz = sx, angle = 0) => {
    const geo = v.geo(shape, args),
      key = `${geo.uuid}:${color}`;
    if (!batches.has(key)) batches.set(key, { geo, color, matrices: [] });
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, angle, 0);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    batches.get(key).matrices.push(dummy.matrix.clone());
  };
  const boulder = (x, z, s, region, high = false) => {
    add(
      'IcosahedronGeometry',
      [1, 0],
      region === 0 ? '#aa8c5a' : region === 1 ? '#92725a' : '#596858',
      x,
      s * (high ? 0.9 : 0.35),
      z,
      s * 1.4,
      high ? s * 1.9 : s * 0.7,
      s * 1.2,
      x * 0.2,
    );
    if (high) add('IcosahedronGeometry', [1, 0], '#708b5c', x, s * 2.5, z, s * 0.6, s * 0.2, s * 0.5);
  };
  const tree = (x, z, s, region) => {
    add('CylinderGeometry', [0.075, 0.11, 1, 5], '#655340', x, s * 0.65, z, s, s * 1.3, s);
    if (region === 0) {
      for (let k = 0; k < 4; k++)
        add('BoxGeometry', [1, 1, 1], '#767f47', x, s * 1.45, z, s * 1.3, 0.08, s * 0.18, (k * Math.PI) / 4);
    } else if (region === 7 || region === 3) {
      for (let k = 0; k < 3; k++)
        add(
          'ConeGeometry',
          [1, 1, 7],
          k % 2 ? '#456d4c' : '#305d43',
          x,
          s * (1.1 + k * 0.35),
          z,
          s * (0.68 - k * 0.13),
          s * 0.85,
          s * (0.68 - k * 0.13),
        );
    } else {
      for (let k = 0; k < 3; k++)
        add(
          'IcosahedronGeometry',
          [1, 1],
          k === 1 ? '#6e8d51' : '#416c44',
          x + Math.sin(k * 2.1) * s * 0.25,
          s * (1.3 + k * 0.13),
          z + Math.cos(k * 2.1) * s * 0.23,
          s * 0.62,
          s * 0.55,
          s * 0.6,
          k,
        );
    }
  };
  const ribbon = (points, width, color, y) => {
    const curve = new T.CatmullRomCurve3(points);
    const vertices = [],
      indices = [];
    for (let i = 0; i <= 24; i++) {
      const p = curve.getPoint(i / 24),
        t = curve.getTangent(i / 24);
      const n = new T.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
      vertices.push(p.x + n.x, y, p.z + n.z, p.x - n.x, y, p.z - n.z);
      if (i < 24) {
        const j = i * 2;
        indices.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, v.mat(color));
    mesh.receiveShadow = true;
    root.add(mesh);
  };

  // A continuous, irregular island replaces the square rim and its gold dividers.
  const positions = [],
    colors = [],
    indices = [],
    radial = 48,
    segments = 192;
  for (let j = 0; j <= radial; j++)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2,
        r = (j / radial) * (50 + Math.sin(angle * 5) * 1.4);
      const x = Math.cos(angle) * r,
        z = Math.sin(angle) * r;
      const routeIndex = Math.floor((((((angle - Math.PI / 4) / (Math.PI * 2)) % 1) + 1) % 1) * ROUTE.length);
      const region = regionAt(routeIndex);
      const center = Math.max(Math.abs(x), Math.abs(z)) < 15.3;
      const y =
        j === radial
          ? -0.85
          : center
            ? -0.1
            : 0.035 + Math.max(0, Math.sin(x * 0.21) * Math.cos(z * 0.19)) * 0.08;
      positions.push(x, y, z);
      const col = new T.Color(center ? '#596d50' : groundColors[region]);
      col.multiplyScalar(0.9 + 0.14 * Math.sin(x * 0.19 + z * 0.13));
      colors.push(col.r, col.g, col.b);
      if (j < radial && i < segments) {
        const a = j * (segments + 1) + i,
          b = a + segments + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  const terrain = new T.BufferGeometry();
  terrain.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  terrain.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  terrain.setIndex(indices);
  terrain.computeVertexNormals();
  const land = new T.Mesh(
    terrain,
    new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: T.DoubleSide }),
  );
  land.receiveShadow = true;
  root.add(land);

  ROUTE.forEach((id, index) => {
    const region = regionAt(index),
      curve = routeCurve(index),
      mid = curve.getPoint(0.5);
    const radial = mid.clone().setY(0).normalize(),
      tangent = curve.getTangent(0.5);
    const angle = -Math.atan2(tangent.z, tangent.x);
    const crossing = isRiverCrossing(index);
    if (crossing) {
      const points = Array.from({ length: 9 }, (_, i) => {
        const p = mid.clone().addScaledVector(radial, (i - 4) * 2.1);
        p.addScaledVector(tangent, Math.sin(i * 1.7) * 0.45);
        p.setY(0).clampLength(0, 46);
        return p;
      });
      ribbon(points, 1.45, '#608b78', 0.13);
      ribbon(points, 1.05, '#3c8e9a', 0.15);
      for (const p of [points[0], points.at(-1)]) {
        add('IcosahedronGeometry', [1, 0], '#608b78', p.x, 0.1, p.z, 2.1, 0.08, 1.55, angle);
        add('IcosahedronGeometry', [1, 0], '#3c8e9a', p.x, 0.17, p.z, 1.8, 0.035, 1.25, angle);
      }
      for (let j = 0; j < 4; j++) {
        const p = mid.clone().addScaledVector(radial, (j - 1.5) * 2.5);
        add('BoxGeometry', [1, 1, 1], '#92c5ba', p.x, 0.17, p.z, 0.07, 0.02, 0.7, angle);
      }
    }
    const road = [];
    for (let j = 0; j <= 12; j++) {
      const p = curve.getPoint(j / 12);
      road.push(p);
    }
    ribbon(road, 0.64, crossing ? '#ab9164' : '#c1ae7c', 0.25);
    if (crossing) {
      for (let k = 0; k < 9; k++) {
        const p = curve.getPoint(0.25 + k / 16);
        add('BoxGeometry', [1, 1, 1], '#9f8459', p.x, 0.31, p.z, 0.25, 0.13, 0.84, angle);
        for (const side of [-1, 1]) {
          const q = p.clone().addScaledVector(radial, 0.43 * side);
          add('BoxGeometry', [1, 1, 1], '#705c40', q.x, 0.57, q.z, 0.055, 0.55, 0.055);
          add('BoxGeometry', [1, 1, 1], '#ad9366', q.x, 0.82, q.z, 0.3, 0.055, 0.055, angle);
        }
      }
    }
    // Arrows indicate travel direction; the green gaps never count as extra tiles.
    const marker = curve.getPoint(0.18);
    add(
      'ConeGeometry',
      [0.13, 0.35, 3],
      '#d9c58e',
      marker.x,
      0.38,
      marker.z,
      1,
      0.15,
      1,
      angle + Math.PI / 2,
    );
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const p = mid.clone().addScaledVector(radial, side * (2.1 + k * 0.85));
        p.addScaledVector(tangent, Math.sin(index + k) * 0.6);
        if (crossing) p.addScaledVector(tangent, 1.8);
        tree(p.x, p.z, 0.7 + (k % 2) * 0.3, region);
      }
      if (index % 3 === 0) {
        const p = mid.clone().addScaledVector(radial, side * 5.7);
        boulder(p.x, p.z, 1.1 + (index % 4) * 0.2, region, true);
      }
      for (let k = 0; k < 12; k++) {
        const p = mid.clone().addScaledVector(radial, side * (1 + k * 0.13));
        p.addScaledVector(tangent, Math.sin(k * 2.4 + index) * 0.65);
        if (crossing) p.addScaledVector(tangent, 1.3);
        add('ConeGeometry', [0.1, 0.3, 3], '#718645', p.x, 0.22, p.z, 1, 1, 1, k);
        if (region !== 0 && k % 3 === 0)
          add(
            'IcosahedronGeometry',
            [1, 0],
            k % 2 ? '#dec37a' : '#e1d9af',
            p.x,
            0.37,
            p.z,
            0.075,
            0.05,
            0.075,
          );
      }
    }
    // Inner groves and farms connect the travel belt to the central regional theatre.
    for (let k = 0; k < 5; k++) {
      const p = mid.clone().addScaledVector(radial, -9 - k * 0.9);
      if (Math.max(Math.abs(p.x), Math.abs(p.z)) < 16.5) continue;
      p.addScaledVector(tangent, Math.sin(index * 3.7 + k) * 2);
      if (region === 4 && index % 2 === 0) {
        add('BoxGeometry', [1, 1, 1], '#b3a05c', p.x, 0.16, p.z, 1.7, 0.1, 0.28, angle);
      } else if (k % 2 || region === 7) tree(p.x, p.z, 0.9, region);
      else boulder(p.x, p.z, 0.55, region);
    }
  });
  for (const { geo, color, matrices } of batches.values()) {
    const mesh = new T.InstancedMesh(geo, v.mat(color), matrices.length);
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }
  root.userData.natureBatches = batches.size;
  return root;
}
