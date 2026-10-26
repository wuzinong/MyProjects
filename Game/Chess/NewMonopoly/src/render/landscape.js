import * as T from 'three';
import { MAP } from '../data/game.js';

export const FACILITY_POSITIONS = { roster: [-4.8, 5.6], cards: [0, 6.3], recruit: [4.8, 5.6] };
export const SCENERY = [
  {
    title: '流沙烽燧',
    earth: '#ba8035',
    high: '#efd08a',
    roof: '#783d27',
    wall: '#bc713d',
    leaf: '#496851',
    water: '#318e98',
  },
  {
    title: '赤岩雄关',
    earth: '#88452e',
    high: '#c48659',
    roof: '#3d4544',
    wall: '#bc7851',
    leaf: '#435744',
    water: '#4f8d8a',
  },
  {
    title: '帝京重阙',
    earth: '#566466',
    high: '#a6aaa1',
    roof: '#183c42',
    wall: '#b5a588',
    leaf: '#456a54',
    water: '#438c95',
  },
  {
    title: '寒垒连营',
    earth: '#3c555c',
    high: '#889a9b',
    roof: '#22394e',
    wall: '#7c8b91',
    leaf: '#3d6660',
    water: '#225e80',
  },
  {
    title: '金穗阡陌',
    earth: '#777339',
    high: '#d8bb55',
    roof: '#5e5137',
    wall: '#c1aa75',
    leaf: '#657334',
    water: '#568b77',
  },
  {
    title: '江峡长桥',
    earth: '#315e48',
    high: '#73965a',
    roof: '#284c46',
    wall: '#adbb91',
    leaf: '#275d45',
    water: '#217e91',
  },
  {
    title: '碧浦千帆',
    earth: '#376e66',
    high: '#89ad8a',
    roof: '#284d59',
    wall: '#d1d4bb',
    leaf: '#3f8b65',
    water: '#1d889f',
  },
  {
    title: '云峡飞瀑',
    earth: '#244c3c',
    high: '#65866a',
    roof: '#3e5144',
    wall: '#a5a17c',
    leaf: '#31774d',
    water: '#359caa',
  },
];

export function sceneryCity(player, previous) {
  if (MAP[player.pos].group === player.region) return player.pos;
  if (MAP[previous]?.group === player.region) return previous;
  return MAP.find((t) => t.group === player.region).id;
}

export function makeLandscape(v, region, city = MAP.find((t) => t.group === region).id) {
  const actualCity = city;
  if (city >= 40) {
    const regionalCities = MAP.slice(0, 40).filter((t) => t.group === region);
    city = regionalCities[((actualCity - 40) % 3) % regionalCities.length].id;
  }
  const root = new T.Group(),
    palette = SCENERY[region],
    animations = [];
  root.userData.animations = animations;
  root.userData.city = actualCity;
  const mound = (x, z, cx, cz, sx, sz, h) => h * Math.exp(-(((x - cx) / sx) ** 2) - ((z - cz) / sz) ** 2);
  const elevation = (x, z) => {
    if (z > 3.8) return 0.27;
    const edge = Math.min(1, Math.max(0, (9.5 - Math.abs(x)) * 1.1), Math.max(0, (9.5 - Math.abs(z)) * 1.1));
    let height = 0.22;
    if (region === 0)
      height +=
        Math.max(0, Math.sin(x * 0.55 + z * 0.43) + 0.65) * Math.max(0, 1 - Math.abs(z + 4.4) / 5) * 2;
    if (region === 1) height += mound(x, z, -6, -4, 2.4, 4, 3.7) + mound(x, z, 6, -5, 2.5, 3, 4.2);
    if (region === 3) height += 0.1 * Math.sin(x * 0.7) * Math.cos(z * 0.6);
    if (region === 4) height += 0.13 * Math.sin(x * 0.6) * Math.cos(z * 0.8);
    if (region === 5) {
      const river = Math.sin(z * 0.37) * 1.8;
      height =
        Math.abs(x - river) < 2.1
          ? -0.16
          : 0.3 + mound(x, z, -6, -5, 2.3, 3.5, 2.7) + mound(x, z, 7, -6, 2, 3, 2.1);
    }
    if (region === 6)
      height =
        -0.2 + mound(x, z, -6, -5, 2.4, 2.4, 1.9) + mound(x, z, 6, -5, 2.4, 2.6, city === 34 ? 3.5 : 1.8);
    if (region === 7) {
      height = -0.13 + mound(x, z, -5.8, -4.7, 2.5, 3.2, 5.8) + mound(x, z, 5.5, -5.7, 2.6, 3.4, 6.2);
    }
    return 0.12 + (height - 0.12) * edge;
  };
  const ownMesh = (geometry, material, parent = root) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.userData.ownedGeometry = true;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const patch = (x, z, w, d, color, y = 0.26, parent = root) => v.box(parent, x, y, z, w, 0.09, d, color);
  const hall = (x, z, w = 2, h = 1, y = elevation(x, z), roof = palette.roof) => {
    const g = v.hall(root, x, z, w, h, roof, palette.wall);
    g.position.y = y;
    for (const dx of [-0.34, 0.34])
      v.box(g, dx * w, h * 0.5, w * 0.38, 0.1, h, 0.1, region === 2 ? '#873f30' : '#705437');
    return g;
  };
  const rock = (x, z, sx, sy, sz, color = palette.earth, y = 0) => {
    const m = new T.Mesh(v.geo('IcosahedronGeometry', [1, 0]), v.mat(color));
    m.scale.set(sx, sy, sz);
    m.position.set(x, y + sy * 0.45, z);
    m.rotation.y = x * 0.6;
    root.add(m);
    m.castShadow = true;
    return m;
  };
  const tree = (x, z, scale = 1, bamboo = false) => {
    const y = elevation(x, z);
    if (bamboo) {
      for (let j = 0; j < 3; j++) {
        const bx = x + (j - 1) * 0.17,
          bz = z + (j % 2) * 0.18;
        v.cylinder(root, bx, y + scale, bz, 0.035, scale * 2, '#4e9061');
        for (let k = 0; k < 3; k++) {
          const leaf = v.box(
            root,
            bx + (k % 2 ? 0.2 : -0.2),
            y + scale * (1 + k * 0.35),
            bz,
            0.65,
            0.07,
            0.15,
            palette.leaf,
          );
          leaf.rotation.z = k % 2 ? 0.4 : -0.4;
          leaf.rotation.y = j;
        }
      }
    } else {
      v.cylinder(root, x, y + 0.6 * scale, z, 0.09, 1.2 * scale, '#705a3b');
      for (let j = 0; j < 3; j++)
        rock(
          x + (j - 1) * 0.3 * scale,
          z + (j % 2) * 0.2,
          0.58 * scale,
          0.6 * scale,
          0.5 * scale,
          j === 1 ? palette.high : palette.leaf,
          y + 0.65 * scale,
        );
    }
  };
  const water = (x, z, w, d, y = 0.18) => patch(x, z, w, d, palette.water, y);
  const ribbon = (points, width, color, y = 0.25) => {
    const curve = new T.CatmullRomCurve3(points.map(([x, z]) => new T.Vector3(x, y, z)));
    const positions = [],
      indices = [];
    for (let i = 0; i <= 48; i++) {
      const p = curve.getPoint(i / 48),
        t = curve.getTangent(i / 48),
        side = new T.Vector3(-t.z, 0, t.x).multiplyScalar(width / 2);
      positions.push(p.x + side.x, p.y, p.z + side.z, p.x - side.x, p.y, p.z - side.z);
      if (i < 48) {
        const n = i * 2;
        indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    ownMesh(geo, v.mat(color));
  };
  const tower = (x, z, height = 3, y = elevation(x, z), earth = false) => {
    v.box(root, x, y + height * 0.5, z, 1.25, height, 1.3, palette.wall);
    for (const dy of [0.35, 0.7])
      v.box(root, x, y + height * dy, z, 1.36, 0.16, 1.4, earth ? palette.earth : palette.roof);
    if (earth)
      for (let i = 0; i < 3; i++)
        v.box(root, x - 0.48 + i * 0.48, y + height + 0.18, z, 0.22, 0.36, 1.36, palette.wall);
    else v.roof(root, x, y + height + 0.2, z, 1.8, 1.65, palette.roof);
    v.box(root, x, y + height * 0.7, z + 0.66, 0.24, 0.4, 0.025, '#253334');
  };
  const bridge = (x, z, length = 7, y = 0.65) => {
    for (let i = 0; i < 18; i++) {
      const xx = x - length / 2 + (length * i) / 17,
        yy = y + Math.sin((i / 17) * Math.PI) * 0.75;
      v.box(root, xx, yy, z, length / 17 + 0.03, 0.12, 1.05, '#a88c58');
      for (const side of [-1, 1]) {
        v.box(root, xx, yy + 0.38, z + side * 0.52, 0.06, 0.65, 0.06, '#705c3e');
        v.box(root, xx, yy + 0.62, z + side * 0.52, length / 17 + 0.04, 0.07, 0.07, '#b59a6b');
      }
      if (i % 5 === 0) v.box(root, xx, yy * 0.5, z, 0.18, yy, 1, '#766443');
    }
  };
  const sailboat = (x, z, scale = 1) => {
    const g = new T.Group();
    g.position.set(x, 0.28, z);
    g.scale.setScalar(scale);
    root.add(g);
    const hull = new T.Shape();
    hull.moveTo(0, -1.65);
    hull.lineTo(0.55, -0.85);
    hull.lineTo(0.55, 0.85);
    hull.lineTo(0, 1.65);
    hull.lineTo(-0.55, 0.85);
    hull.lineTo(-0.55, -0.85);
    hull.closePath();
    const geo = new T.ExtrudeGeometry(hull, { depth: 0.3, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    const body = ownMesh(geo, v.mat('#61462c'), g);
    body.position.y = 0.4;
    v.box(g, 0, 0.47, 0, 0.8, 0.1, 1.8, '#b59561');
    for (const zz of [-0.6, 0.65]) {
      v.cylinder(g, 0, 1.7, zz, 0.035, 2.8, '#b29565');
      const cloth = new T.PlaneGeometry(1.25, 2.05, 6, 5),
        pos = cloth.attributes.position;
      for (let i = 0; i < pos.count; i++)
        pos.setZ(i, Math.sin(((pos.getX(i) + 0.625) * Math.PI) / 1.25) * 0.32);
      cloth.computeVertexNormals();
      const sail = ownMesh(cloth, v.mat('#e5d29f').clone(), g);
      sail.material.side = T.DoubleSide;
      sail.userData.ownedMaterial = true;
      sail.position.set(0.54, 1.8, zz);
      sail.rotation.y = 0.4;
      animations.push({ kind: 'sail', object: sail, base: 0.4, phase: x + zz });
    }
    animations.push({ kind: 'boat', object: g, base: 0.28, phase: x + z });
    return g;
  };
  const field = (x, z, w = 3, d = 2.3, y = 0.3) => {
    patch(x, z, w, d, '#806b32', y);
    for (let i = 0; i < 8; i++)
      v.box(
        root,
        x - w * 0.44 + i * w * 0.125,
        y + 0.13,
        z,
        w * 0.055,
        0.22,
        d * 0.91,
        i % 3 ? '#cbaa38' : '#e0c25a',
      );
  };
  const tent = (x, z, color = '#b5533c', size = 1, y = elevation(x, z)) => {
    const roof = v.cone(root, x, y + size * 0.6, z, size, size * 0.9, color, 4);
    roof.scale.z = 1.45;
    v.box(root, x, y + size * 0.2, z, size * 1.1, size * 0.4, size * 1.5, '#b6a17b');
    v.box(root, x, y + size * 0.2, z + size * 0.76, size * 0.36, size * 0.4, 0.03, '#574430');
  };
  const camel = (x, z, angle = 0) => {
    const g = new T.Group();
    g.position.set(x, elevation(x, z), z);
    g.rotation.y = angle;
    root.add(g);
    v.box(g, 0, 0.55, 0, 0.4, 0.4, 0.85, '#997040');
    v.cone(g, 0, 0.87, -0.1, 0.25, 0.45, '#b58d51', 6);
    v.box(g, 0, 0.95, 0.45, 0.16, 0.7, 0.18, '#b58d51');
    v.box(g, 0, 1.25, 0.57, 0.2, 0.2, 0.4, '#b58d51');
    for (const xx of [-0.16, 0.16])
      for (const zz of [-0.27, 0.27]) v.box(g, xx, 0.22, zz, 0.07, 0.45, 0.07, '#78552f');
    v.box(g, 0, 0.74, -0.05, 0.65, 0.18, 0.4, '#873d2e');
  };

  // Geometry, not a palette swap, establishes each region's land/water silhouette.
  const terrain = new T.PlaneGeometry(19, 19, 48, 40);
  terrain.rotateX(-Math.PI / 2);
  const tp = terrain.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setY(i, elevation(tp.getX(i), tp.getZ(i)));
  terrain.computeVertexNormals();
  const faces = terrain.toNonIndexed();
  terrain.dispose();
  const colors = [],
    low = new T.Color(palette.earth),
    high = new T.Color(palette.high);
  for (let i = 0; i < faces.attributes.position.count; i += 3) {
    const y =
      (faces.attributes.position.getY(i) +
        faces.attributes.position.getY(i + 1) +
        faces.attributes.position.getY(i + 2)) /
      3;
    const color = low.clone().lerp(high, Math.min(0.85, Math.max(0.05, y / 5 + 0.13)));
    const edge = Math.max(
      Math.abs(faces.attributes.position.getX(i)),
      Math.abs(faces.attributes.position.getZ(i)),
    );
    color.lerp(new T.Color('#596d50'), Math.max(0, Math.min(1, (edge - 8.2) / 1.3)));
    for (let k = 0; k < 3; k++) colors.push(color.r, color.g, color.b);
  }
  faces.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  const terrainMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
  const terrainMesh = ownMesh(faces, terrainMat);
  terrainMesh.userData.ownedMaterial = true;
  if (region >= 5) water(0, 0, 18, 18);

  if (region === 0) {
    ribbon(
      [
        [-8, 2],
        [-5, 0.8],
        [-1, 1.4],
        [3, -1],
        [6, -2],
      ],
      1.1,
      '#e2b65d',
      0.36,
    );
    for (let i = 0; i < 6; i++) camel(-5 + i * 1.25, 1.5 - i * 0.25, Math.PI * 0.45);
    for (let i = 0; i < 4; i++) rock(-7 + i * 4.5, -7, 1.5, 1.2, 1.1, '#9e6131', 0.4);
    if (city === 1) {
      patch(1, -4, 3.8, 3.8, '#815032', 1.1);
      tower(1, -4, 4.5, 1.15, true);
      for (let i = 0; i < 6; i++) v.box(root, -1.5 + i * 0.85, 1.35, -5.8, 0.75, 2.2, 0.6, palette.wall);
      tent(-5, -2, '#9a3f2d', 1.1);
    } else {
      patch(0, -3.7, 9, 5, '#c69649', 0.4);
      for (const [x, z, c] of [
        [-3, -4, '#87332a'],
        [0, -5, '#e0b866'],
        [3, -3.8, '#6b4f37'],
        [-1.5, -1.5, '#bb6240'],
      ])
        tent(x, z, c, 1.4, 0.5);
      water(6, -1.2, 2.8, 2, 0.38);
      tree(7, -0.2, 1.2);
      tree(5.5, -2, 1);
    }
  } else if (region === 1) {
    for (const x of [-6.5, 6.5]) rock(x, -5, 2.1, 3.5, 2.5, '#a56242', 1);
    ribbon(
      [
        [0, 3],
        [0, 0],
        [1, -3],
        [0, -8],
      ],
      1.6,
      '#d6ad78',
      0.36,
    );
    const y = 0.7;
    patch(0, -3, 9.5, 6, '#9f6948', y);
    if (city === 6) {
      hall(0, -4.4, 4, 2, y + 0.1);
      for (const x of [-3.4, 3.4]) {
        hall(x, -3, 1.5, 1, y + 0.1);
        tower(x, -0.8, 3, y + 0.1);
      }
      v.box(root, 0, 1, -1, 7, 0.22, 1, '#ceb18b');
    } else if (city === 8) {
      for (const x of [-2, 2]) tower(x, -3, 4.3, y, true);
      v.box(root, 0, 4.1, -3, 4.5, 0.7, 1.8, palette.wall);
      v.roof(root, 0, 4.8, -3, 5, 2.4, palette.roof);
      for (let i = 0; i < 7; i++) patch(0, 1 - i * 0.45, 2.2, 0.5, '#b69a75', 0.35 + i * 0.08);
    } else {
      for (const x of [-3.7, 3.7]) for (const z of [-5.5, -0.7]) tower(x, z, 2.5, y, true);
      for (const x of [-3.7, 3.7]) v.box(root, x, 1.8, -3, 0.5, 2.1, 5, palette.wall);
      v.box(root, 0, 1.8, -5.5, 7.5, 2.1, 0.5, palette.wall);
      hall(0, -3, 3, 1.4, y + 0.1);
    }
  } else if (region === 2) {
    for (let i = 0; i < 3; i++) patch(0, -3.5, 12 - i * 1.8, 7 - i * 0.9, '#a9a99b', 0.35 + i * 0.25);
    if (city === 11) {
      hall(0, -5, 4.8, 2.4, 1.05);
      for (const x of [-4.5, 4.5]) hall(x, -4, 2, 1.4, 0.85);
      for (const x of [-2.8, 2.8]) tower(x, -0.6, 3.8, 0.45);
      for (let i = 0; i < 8; i++) patch(0, 2.6 - i * 0.4, 2.6, 0.4, '#c5c1ad', 0.3 + i * 0.09);
    } else if (city === 13) {
      for (const x of [-5, 5]) rock(x, -4, 2.4, 3.8, 3, palette.earth);
      tower(0, -4, 5.1, 0.95);
      hall(-3, 0, 1.8, 0.9);
    } else {
      water(0, -2, 3.4, 12, 0.98);
      bridge(0, -2, 11, 1.1);
      for (const x of [-5.8, 5.8]) tower(x, -3.4, 2.8, 0.85);
      hall(0, -6, 3.5, 1.1, 1);
    }
    for (const x of [-6.8, 6.8]) {
      for (const z of [-5, -2, 1]) {
        v.cylinder(root, x, 1.2, z, 0.15, 2, '#b5aa8b');
        v.box(root, x, 2.25, z, 0.5, 0.25, 0.5, '#263e42');
      }
      tree(x, 2.7, 0.9);
    }
    patch(0, 2.7, 11, 0.9, '#9c9e94');
  } else if (region === 3) {
    water(-2, -3.4, 12, 9, 0.28);
    patch(-2, -3.4, 9.8, 6.8, '#5c6d70', 0.41);
    for (const x of [-6.6, 2.6]) {
      v.box(root, x, 1.35, -3.4, 0.6, 1.8, 6.7, palette.wall);
      for (const z of [-6.4, -0.4]) tower(x, z, 3, 0.45);
    }
    v.box(root, -2, 1.35, -6.5, 9.6, 1.8, 0.6, palette.wall);
    for (let i = 0; i < 18; i++) v.box(root, -6.5 + i * 0.53, 2.45, -6.5, 0.25, 0.4, 0.65, palette.wall);
    if (city === 16) {
      hall(-2, -3.8, 3, 2, 0.5);
      hall(-2, -3.8, 1.8, 3.2, 0.5);
    }
    if (city === 18)
      for (const x of [-3.8, -0.3]) {
        v.cylinder(root, x, 1.8, -3.3, 1.2, 2.7, '#a18d64');
        v.cone(root, x, 3.5, -3.3, 1.5, 0.8, palette.roof, 8);
      }
    if (city === 19) {
      field(-3.8, -3.7, 3, 3, 0.5);
      field(-0.2, -3.7, 3, 3, 0.5);
      hall(-2, -5.5, 1.5, 0.8, 0.5);
    }
    for (let i = 0; i < 6; i++)
      tent(5 + (i % 2) * 2, -5.6 + Math.floor(i / 2) * 2.3, i % 2 ? '#788d97' : '#c4ad81', 0.8, 0.28);
    for (const z of [-5, -2, 1]) {
      v.cylinder(root, 8.3, 1.4, z, 0.04, 2.5, '#ac9676');
      v.box(root, 8.05, 2.2, z, 0.55, 0.65, 0.025, '#7f3741');
    }
    bridge(-2, 1, 4, 0.37);
  } else if (region === 4) {
    for (const [x, z, w, d] of [
      [-6, -5, 4, 3.2],
      [-6, -0.5, 4, 3.2],
      [5.6, -5.8, 5, 2],
      [6, 0, 4.5, 3.3],
      [-1, -7, 4, 1.5],
      [0.5, 2.5, 5, 1.3],
    ])
      field(x, z, w, d);
    ribbon(
      [
        [-9, -2],
        [-6, -2.8],
        [-2, -1.2],
        [2, -2],
        [8, -2.7],
      ],
      0.65,
      '#c3b17b',
    );
    if (city === 21) {
      hall(0, -3.5, 3, 1.5, 0.3);
      for (const x of [-2, 2]) {
        hall(x, -3.3, 1.2, 1, 0.3);
        v.box(root, x, 0.85, -1.8, 1.6, 0.12, 1.1, '#94734e');
      }
    } else if (city === 23) {
      for (let i = 0; i < 6; i++)
        tent(
          -2 + (i % 3) * 2,
          -4.6 + Math.floor(i / 3) * 2.4,
          ['#a84934', '#ded09b', '#4b786e'][i % 3],
          0.85,
          0.3,
        );
    } else {
      for (const [x, z] of [
        [-2, -4],
        [0.6, -5],
        [2, -3],
        [-2, -1],
      ])
        hall(x, z, 1.5, 0.8, 0.3);
      v.cylinder(root, 0.2, 0.5, -2, 0.55, 0.5, '#b8b293');
      v.cylinder(root, 0.2, 0.77, -2, 0.4, 0.03, '#223638');
      v.box(root, 0.2, 1.8, -2, 1.5, 0.1, 0.1, '#6f583b');
      for (const x of [-0.5, 0.9]) v.box(root, x, 1.2, -2, 0.08, 1.5, 0.08, '#6f583b');
    }
    for (const [x, z] of [
      [-8, 1],
      [7.5, 2.5],
      [-4, 2.8],
      [-3.3, -6.5],
    ])
      tree(x, z, 1.2);
    for (const x of [3, 4]) {
      v.cylinder(root, x, 0.8, -0.5, 0.4, 1, '#c4a754');
      v.cone(root, x, 1.45, -0.5, 0.55, 0.4, '#948146', 8);
    }
  } else if (region === 5) {
    for (let i = 0; i < 14; i++) tree(i % 2 ? -6.8 : 6.8, -7 + (i >> 1) * 1.4, 0.9 + (i % 3) * 0.17);
    if (city === 26) {
      patch(-4.8, -3, 4, 5, '#839478', 0.9);
      tower(-5.7, -2.1, 3.8, 1);
      tower(-3.8, -2.1, 3.8, 1);
      v.box(root, -4.8, 3.1, -2.1, 2, 0.45, 1.2, palette.wall);
      hall(-4.8, -4.3, 2.4, 1.4, 1);
      bridge(0, 0.6, 8, 0.65);
    } else if (city === 27) {
      for (const z of [-5, -2, 1]) {
        patch(-3, z, 3.6, 0.75, '#ad9365', 0.48);
        sailboat(-0.6, z, 0.75);
        hall(-5, z, 1.6, 0.9, Math.max(0.4, elevation(-5, z)));
      }
    } else {
      for (let i = 0; i < 3; i++) {
        patch(4.8, -3.8, 4.3 - i * 0.6, 4.3 - i * 0.6, '#7f8c71', 0.6 + i * 0.5);
        hall(4.8, -3.8, 2.7 - i * 0.45, 1.2 + i * 0.85, 1.2);
      }
      bridge(0, -0.3, 7, 0.7);
      sailboat(0, -5, 0.8);
    }
    sailboat(1.4, 2.2, 0.6);
  } else if (region === 6) {
    for (let i = 0; i < 9; i++) tree(-7 + (i % 3) * 0.7, -6 + Math.floor(i / 3), 0.9);
    for (let i = 0; i < 9; i++) tree(5.4 + (i % 3) * 0.8, -6 + Math.floor(i / 3) * 0.7, 1.1, true);
    patch(-1, -2.3, 1.3, 8, '#967746', 0.45);
    patch(2, -0.3, 7, 1, '#967746', 0.45);
    if (city === 31) {
      sailboat(-3.6, -3.2, 1.65);
      sailboat(3, -4.8, 1.1);
      for (let i = 0; i < 6; i++) v.box(root, -7.8 + i * 0.65, 1.4, -6.4, 0.7, 2, 0.65, palette.wall);
      tower(-6.3, -6.4, 2.4, 0.5);
    } else if (city === 32) {
      for (const x of [-4.5, 3.5])
        for (const z of [-4.4, -1.8, 0.7]) {
          patch(x, z, 2.4, 1.9, '#9ea88e', 0.5);
          hall(x, z, 1.8, 1, 0.55);
        }
      bridge(-0.5, -2, 7, 0.75);
      sailboat(-0.3, 1, 0.85);
    } else {
      for (let i = 0; i < 12; i++) tree(4.4 + (i % 4) * 0.6, -5 + Math.floor(i / 4) * 0.7, 1.5, true);
      hall(5.4, -4, 2, 1.1, elevation(5.4, -4) + 0.15);
      sailboat(-3, -3.5, 1.35);
      for (let i = 0; i < 7; i++) patch(4.3, 1 - i * 0.65, 1, 0.5, '#aaa887', 0.5 + i * 0.28);
    }
    for (const x of [-1.65, -0.35])
      for (const z of [-5.8, -3, -0.5, 1.4]) v.cylinder(root, x, 0.7, z, 0.07, 1.15, '#ad9470');
  } else {
    for (const [x, z, sy] of [
      [-6.4, -5.5, 4.4],
      [-4.8, -7, 4.8],
      [5.8, -6.3, 5.2],
      [7, -3.6, 3.6],
    ]) {
      rock(x, z, 1.7, sy, 1.8, '#305d4c', 1);
      rock(x + 0.2, z, 1.5, 0.35, 1.5, '#638560', sy + 1);
    }
    // The waterfall is attached to the rear cliff, with its own moving streaks.
    v.box(root, 2.4, 2.7, -6.4, 1.2, 5, 0.1, '#69bcc0');
    for (let i = 0; i < 9; i++) {
      const streak = v.box(root, 1.92 + (i % 3) * 0.42, 1 + (i % 4), -6.31, 0.07, 0.75, 0.035, '#c3ece0');
      animations.push({ kind: 'fall', object: streak, base: 1, phase: i * 0.73 });
    }
    for (let i = 0; i < 7; i++)
      rock(2.4 + Math.sin(i * 2.4) * 0.75, -6 + Math.cos(i * 2.4) * 0.3, 0.35, 0.16, 0.3, '#a4d8cd', 0.22);
    bridge(0, -2.2, 8, 2.3);
    for (let i = 0; i < 16; i++) {
      const x = -5.6 + (i % 4) * 0.5,
        z = 2.2 - Math.floor(i / 4) * 1.7;
      tree(x, z, 0.95, true);
    }
    if (city === 37) {
      for (let i = 0; i < 4; i++) {
        patch(-5, -3.7 + i * 1.2, 3.5, 1.1, '#68804c', 1.9 - i * 0.4);
        field(-5, -3.7 + i * 1.2, 3, 1, 2 - i * 0.4);
      }
      hall(5, -2.8, 2.3, 1.2, elevation(5, -2.8) + 0.2);
      for (let i = 0; i < 5; i++)
        v.box(root, 4 + i * 0.45, 2.1, -0.7, 0.3, 1, 0.025, ['#b44f52', '#c9a655', '#6d9faf'][i % 3]);
    } else {
      for (let i = 0; i < 3; i++) hall(-6 + i * 0.9, -4.3 - i, 1.6, 1.3, 1.6 + i * 0.9);
      for (let i = 0; i < 15; i++)
        patch(-3.6 - i * 0.13, 0.6 - i * 0.4, 1.25, 0.42, '#a3a086', 0.35 + i * 0.21);
      tower(5.8, -4.5, 2, elevation(5.8, -4.5));
    }
  }

  if (region === 5 || region === 6 || region === 7) {
    for (let i = 0; i < 18; i++) {
      const x = Math.sin(i * 4.17) * 7.7,
        z = -7 + (i % 9) * 1.1;
      if (elevation(x, z) > 0.18) continue;
      const ripple = v.box(root, x, 0.235, z, 0.65 + (i % 3) * 0.3, 0.012, 0.035, '#65bec2');
      animations.push({ kind: 'ripple', object: ripple, base: x, phase: i });
    }
  }
  if (actualCity >= 40) {
    const variant = (actualCity - 40) % 3;
    const x = variant === 1 ? 3.8 : -3.2,
      z = 3.15;
    patch(x, z, 2.5, 1.35, palette.wall, 0.35);
    if (variant === 0) {
      for (let i = 0; i < 3; i++) patch(x, z, 2.2 - i * 0.35, 1.2 - i * 0.15, palette.wall, 0.45 + i * 0.22);
      hall(x, z, 1.3, 1, 0.95);
    } else if (variant === 1) {
      for (const dx of [-0.75, 0.75]) tower(x + dx, z, 2, 0.45);
      v.box(root, x, 1.8, z, 1.6, 0.15, 0.5, palette.roof);
    } else {
      hall(x, z, 1.8, 0.9, 0.4);
      for (let i = 0; i < 4; i++)
        v.cylinder(root, x - 1.1 + i * 0.7, 0.85, z - 0.55, 0.035, 1.2, palette.leaf);
    }
  }
  const materials = new Map(),
    owned = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.ownedMaterial) owned.add(o.material);
    else {
      if (!materials.has(o.material)) materials.set(o.material, o.material.clone());
      o.material = materials.get(o.material);
    }
  });
  root.userData.materials = [...materials.values(), ...owned];
  root.userData.materials.forEach((m) => {
    m.userData.baseOpacity = m.opacity;
    m.userData.baseDepthWrite = m.depthWrite;
    m.transparent = true;
  });
  return root;
}

export function animateLandscape(root, time, reduced) {
  for (const a of root.userData.animations) {
    const t = reduced ? 0 : time * 0.001;
    if (a.kind === 'boat') {
      a.object.position.y = a.base + Math.sin(t * 1.3 + a.phase) * 0.045;
      a.object.rotation.z = Math.sin(t * 0.8 + a.phase) * 0.025;
    }
    if (a.kind === 'sail') a.object.rotation.y = a.base + Math.sin(t * 1.7 + a.phase) * 0.08;
    if (a.kind === 'fall') a.object.position.y = 0.5 + (4.5 - ((t * 2 + a.phase) % 4.5));
    if (a.kind === 'ripple') a.object.position.x = a.base + Math.sin(t * 0.6 + a.phase) * 0.14;
  }
}
