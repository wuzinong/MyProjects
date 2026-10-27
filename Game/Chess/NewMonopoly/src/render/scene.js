import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MAP, ROUTE, ROUTE_INDEX, REGIONS, COLORS, GENERALS } from '../data/game.js';
import {
  tilePosition,
  tileAngle,
  routeCurve,
  makeWorld,
  CENTER_SCALE,
  WORLD_CAMERA,
  CENTER_CAMERA,
  CLOSE_CAMERA,
} from './world.js';
import { makeLandscape, animateLandscape, sceneryCity, FACILITY_POSITIONS, SCENERY } from './landscape.js';
import { readyGenerals } from '../core/engine.js';
import { CombatAnimation } from './combat-effects.js';
import { STATUS_NAMES } from '../data/skills.js';
import { fighter } from '../core/progression.js';
import { TITLES } from '../data/progression.js';

export { tilePosition } from './world.js';
export class GameScene {
  constructor(container, onSelect, onError, onFacility) {
    this.container = container;
    this.onSelect = onSelect;
    this.onError = onError;
    this.onFacility = onFacility;
    this.facilityPicks = [];
    this.region = -1;
    this.sceneryCities = new Map();
    this.sceneryKey = '';
    this.centerSignature = '';
    this.quality = 'high';
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.materials = new Map();
    this.geometries = new Map();
    this.picks = [];
    this.cityRoots = [];
    this.tokens = [];
    this.labels = [];
    this.flags = [];
    this.effects = [];
    this.transients = [];
    this.battleModels = new Map();
    this.combatAnimation = null;
    this.last = 0;
    this.state = null;
    this.signature = '';
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    container.append(this.renderer.domElement);
    this.scene = new T.Scene();
    this.scene.background = new T.Color('#111d23');
    this.scene.fog = new T.FogExp2('#111d23', 0.003);
    this.camera = new T.PerspectiveCamera(39, container.clientWidth / container.clientHeight, 0.1, 320);
    this.camera.position.set(...WORLD_CAMERA);
    this.camera.lookAt(0, 0, 0);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 240;
    this.controls.maxPolarAngle = Math.PI * 0.43;
    this.controls.minPolarAngle = 0.3;
    this.controls.enablePan = true;
    this.cameraMode = 'overview';
    this.scene.add(new T.HemisphereLight(0xffe7c3, 0x304f5f, 2.5));
    this.sun = new T.DirectionalLight(0xffdeb0, 3.2);
    this.sun.position.set(-30, 65, 40);
    this.sun.castShadow = true;
    Object.assign(this.sun.shadow.camera, {
      left: -50,
      right: 50,
      top: 50,
      bottom: -50,
      near: 0.1,
      far: 180,
    });
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun);
    const rim = new T.DirectionalLight(0x76c4db, 2);
    rim.position.set(18, 10, -12);
    this.scene.add(rim);
    this.board = new T.Group();
    this.scene.add(this.board);
    this.makeBoard();
    this.makeDice();
    this.battleRoot = new T.Group();
    this.battleRoot.visible = false;
    this.scene.add(this.battleRoot);
    this.ray = new T.Raycaster();
    this.pointer = new T.Vector2();
    let down = null;
    container.addEventListener('pointerdown', (e) => {
      down = [e.clientX, e.clientY];
    });
    container.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || !this.board.visible) return;
      const rect = container.getBoundingClientRect();
      this.pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      this.ray.setFromCamera(this.pointer, this.camera);
      const hit = this.ray.intersectObjects([
        ...this.picks,
        ...(this.facilities.visible ? this.facilityPicks : []),
      ])[0];
      if (hit) {
        if (hit.object.userData.facility) this.onFacility(hit.object.userData.facility);
        else this.onSelect(hit.object.userData.tile);
      }
    });
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.finishCombat();
      this.onError('3D图形上下文已丢失。对局状态仍保留；请导出存档后刷新页面。');
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.animate = this.animate.bind(this);
    this.frame = requestAnimationFrame(this.animate);
  }
  mat(color, emissive = false) {
    const key = color + ':' + emissive;
    if (!this.materials.has(key))
      this.materials.set(
        key,
        new T.MeshStandardMaterial({
          color,
          roughness: 0.8,
          metalness: emissive ? 0.35 : 0.15,
          emissive: emissive ? color : 0,
          emissiveIntensity: emissive ? 0.5 : 0,
        }),
      );
    return this.materials.get(key);
  }
  geo(type, args) {
    const key = type + args.join(',');
    if (!this.geometries.has(key)) this.geometries.set(key, new T[type](...args));
    return this.geometries.get(key);
  }
  box(parent, x, y, z, w, h, d, color, glow = false) {
    const m = new T.Mesh(this.geo('BoxGeometry', [w, h, d]), this.mat(color, glow));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  cone(parent, x, y, z, r, h, color, vertices = 4) {
    const m = new T.Mesh(this.geo('ConeGeometry', [r, h, vertices]), this.mat(color));
    m.position.set(x, y, z);
    m.rotation.y = Math.PI / 4;
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  cylinder(parent, x, y, z, r, h, color) {
    const m = new T.Mesh(this.geo('CylinderGeometry', [r, r, h, 10]), this.mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  text(text, color = '#eee3ca', w = 1.4, h = 0.38, width = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = 128;
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, width, 128);
    c.fillStyle = '#101416cc';
    c.beginPath();
    c.roundRect(2, 12, width - 4, 104, 15);
    c.fill();
    c.strokeStyle = color + '88';
    c.lineWidth = 3;
    c.stroke();
    c.fillStyle = color;
    c.font = 'bold 55px "Microsoft YaHei",sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, width / 2, 66, width - 22);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    const material = new T.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new T.Sprite(material);
    sprite.scale.set(w, h, 1);
    sprite.renderOrder = 5;
    return sprite;
  }
  roof(parent, x, y, z, w, d, color) {
    const mesh = this.cone(parent, x, y, z, 1, 0.4, color);
    mesh.scale.set(w * 0.71, 1, d * 0.71);
    return mesh;
  }
  hall(parent, x, z, width, height, roofColor, wallColor, rotation = 0) {
    const group = new T.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    parent.add(group);
    this.box(group, 0, height / 2 + 0.12, 0, width, height, width * 0.7, wallColor);
    this.box(group, 0, 0.1, 0, width + 0.12, 0.18, width * 0.8, '#8f8670');
    this.roof(group, 0, height + 0.32, 0, width + 0.3, width * 0.85, roofColor);
    this.box(group, 0, height * 0.4, 0.36 * width, 0.14, height * 0.6, 0.025, '#4a3027');
    for (const i of [-1, 1])
      this.box(group, i * width * 0.35, height * 0.62, 0.36 * width, 0.12, 0.14, 0.03, '#d8b77a', true);
    return group;
  }
  makeCity(id, level = 0) {
    const t = MAP[id],
      root = new T.Group(),
      region = t.group,
      color = REGIONS[region].color;
    const wall = ['#b9a178', '#a78e77', '#cdc1a1', '#9a9b91', '#b9ab8c', '#d0c3a0', '#d0cead', '#b8a585'][
      region
    ];
    const roof = ['#795d45', '#585c55', '#435f61', '#43535c', '#645b5c', '#415d55', '#355e61', '#44554a'][
      region
    ];
    const rot = ((id % 3) - 1) * 0.12;
    root.rotation.y = rot;
    this.box(root, 0, 0.07, 0, 1.73, 0.12, 1.64, '#777867');
    if (region === 0) {
      this.box(root, -0.48, 0.35, -0.1, 0.55, 0.62, 0.65, wall);
      this.box(root, 0.42, 0.45, 0.1, 0.58, 0.8, 0.65, wall);
      for (let k = 0; k < 3; k++) this.box(root, 0.2 + k * 0.2, 0.91, 0.1, 0.1, 0.18, 0.65, wall);
      this.cone(root, -0.5, 0.75, -0.1, 0.13, 0.22, '#b86e43', 6);
    } else {
      this.hall(root, id % 2 ? -0.15 : 0.15, -0.1, 0.75, 0.5 + level * 0.11, roof, wall);
      this.hall(root, -0.55, 0.4, 0.34, 0.26, roof, wall);
      if (id % 3 !== 0) this.hall(root, 0.55, 0.35, 0.38, 0.32, roof, wall, Math.PI / 2);
    }
    if (region === 1 || region === 2 || region === 3) {
      this.box(root, 0, 0.23, -0.74, 1.65, 0.34, 0.1, wall);
      this.box(root, -0.78, 0.23, 0, 0.1, 0.34, 1.55, wall);
      this.box(root, 0.78, 0.23, 0, 0.1, 0.34, 1.55, wall);
      for (const x of [-0.56, 0.56]) {
        this.box(root, x, 0.46, 0.68, 0.24, 0.8, 0.27, wall);
        this.roof(root, x, 0.93, 0.68, 0.4, 0.35, roof);
      }
      if (region === 2) this.box(root, 0, 0.65, 0.68, 1.2, 0.14, 0.15, '#684a3c');
    }
    if (region === 4) {
      this.cylinder(root, 0.53, 0.3, -0.5, 0.2, 0.48, '#b6a177');
      this.cone(root, 0.53, 0.65, -0.5, 0.29, 0.26, roof, 8);
      for (let i = 0; i < 4; i++) this.box(root, -0.6 + i * 0.14, 0.17, -0.62, 0.06, 0.13, 0.3, '#a68f52');
    }
    if (region === 5 || region === 6) {
      this.box(root, 0.65, 0.13, 0, 0.3, 0.07, 1.7, '#467d87');
      this.box(root, 0.46, 0.2, 0.35, 0.65, 0.06, 0.15, '#9b794e');
      this.box(root, 0.67, 0.22, -0.3, 0.12, 0.09, 0.5, '#775c3b');
      this.box(root, 0.67, 0.48, -0.3, 0.02, 0.55, 0.02, '#b8a374');
      this.box(root, 0.7, 0.5, -0.3, 0.035, 0.32, 0.23, '#e8d9ad');
    }
    if (region === 7) {
      this.box(root, -0.5, 0.2, -0.4, 0.65, 0.3, 0.7, '#7b8778');
      this.hall(root, -0.5, -0.4, 0.45, 0.65, roof, wall);
      for (let i = 0; i < 3; i++) {
        this.cylinder(root, 0.6, 0.55, -0.5 + i * 0.16, 0.025, 0.95, '#5f8b65');
        this.cone(root, 0.6, 0.97, -0.5 + i * 0.16, 0.15, 0.28, '#6b9d75', 5);
      }
    }
    if (id % 2 === 0) this.box(root, -0.42, 0.25, 0.64, 0.5, 0.26, 0.16, color);
    const tower = (x, z, h) => {
      this.box(root, x, h / 2 + 0.12, z, 0.25, h, 0.28, wall);
      this.roof(root, x, h + 0.32, z, 0.43, 0.4, roof);
    };
    if (id === 1) tower(-0.55, -0.55, 1.35);
    if (id === 3) for (const x of [-0.5, 0, 0.5]) this.cone(root, x, 0.4, 0.5, 0.28, 0.5, '#d0a65a', 4);
    if (id === 6) for (const x of [-0.38, 0.38]) tower(x, 0.55, 1.3);
    if (id === 8) {
      tower(-0.4, 0.55, 1.05);
      tower(0.4, 0.55, 1.05);
      this.box(root, 0, 1.15, 0.55, 0.9, 0.17, 0.3, wall);
    }
    if (id === 9)
      for (const x of [-0.62, 0.62])
        for (const z of [-0.62, 0.62]) this.box(root, x, 0.6, z, 0.25, 1.05, 0.25, wall);
    if (id === 11)
      for (let i = 0; i < 3; i++) this.hall(root, -0.5 + i * 0.5, -0.5, 0.3, 0.8 + i * 0.2, roof, wall);
    if (id === 13) {
      this.cylinder(root, -0.55, 1, -0.45, 0.2, 1.8, wall);
      this.cone(root, -0.55, 2, -0.45, 0.3, 0.35, roof, 8);
    }
    if (id === 14) {
      this.box(root, 0, 0.43, 0.62, 1.7, 0.13, 0.3, '#9a8260');
      for (const x of [-0.65, 0, 0.65]) this.box(root, x, 0.25, 0.62, 0.08, 0.4, 0.25, '#9a8260');
    }
    if (id === 16) {
      this.box(root, 0, 0.3, -0.3, 1, 0.5, 0.7, wall);
      this.hall(root, 0, -0.3, 0.65, 1.1, roof, wall);
    }
    if (id === 18)
      for (const x of [-0.48, 0.48]) {
        this.cylinder(root, x, 0.58, -0.5, 0.28, 0.9, wall);
        this.cone(root, x, 1.14, -0.5, 0.37, 0.4, roof, 8);
      }
    if (id === 19) {
      for (let i = 0; i < 5; i++) this.box(root, -0.6 + i * 0.22, 0.2, 0.55, 0.13, 0.08, 0.55, '#98a859');
      this.cylinder(root, -0.55, 0.35, -0.55, 0.2, 0.35, '#817b63');
    }
    if (id === 21) for (const x of [-0.6, 0.6]) this.hall(root, x, 0, 0.36, 1.1, roof, wall, Math.PI / 2);
    if (id === 23)
      for (let i = 0; i < 3; i++) {
        this.box(root, -0.5 + i * 0.5, 0.28, 0.55, 0.35, 0.25, 0.3, '#a88f65');
        this.roof(root, -0.5 + i * 0.5, 0.65, 0.55, 0.45, 0.4, i % 2 ? color : '#e2c58c');
      }
    if (id === 24) this.box(root, 0, 0.38, 0.68, 1.45, 0.5, 0.12, wall);
    if (id === 26) {
      tower(-0.4, -0.5, 1.35);
      tower(0.4, -0.5, 1.35);
    }
    if (id === 27)
      for (let i = 0; i < 3; i++) this.box(root, 0.58, 0.28, -0.5 + i * 0.5, 0.65, 0.1, 0.18, '#74563b');
    if (id === 29) this.hall(root, 0, -0.2, 0.6, 1.65, roof, wall);
    if (id === 31) {
      this.box(root, -0.68, 0.6, 0, 0.22, 1.05, 1.5, '#959e89');
      tower(-0.65, -0.55, 1.35);
    }
    if (id === 32) {
      this.box(root, 0, 0.17, 0.55, 1.6, 0.1, 0.5, '#4b8b92');
      this.box(root, -0.2, 0.42, 0.55, 0.25, 0.11, 0.8, '#ad9974');
    }
    if (id === 34)
      for (let i = 0; i < 4; i++) {
        this.cylinder(root, -0.6, 0.65, -0.5 + i * 0.25, 0.025, 1.2, '#5d8464');
        this.cone(root, -0.6, 1.2, -0.5 + i * 0.25, 0.2, 0.35, '#648c63', 5);
      }
    if (id === 37)
      for (let i = 0; i < 3; i++)
        this.box(root, -0.5 + i * 0.4, 0.55, 0.5, 0.28, 0.5, 0.025, ['#be8569', '#c9b376', '#7b9c88'][i]);
    if (id === 39)
      for (let i = 0; i < 5; i++)
        this.box(root, -0.6 + i * 0.22, 0.15 + i * 0.1, 0.55, 0.24, 0.1 + i * 0.2, 0.4, '#929584');
    if (id >= 40) {
      const variant = (id - 40) % 3;
      if (variant === 0) {
        for (let i = 0; i < 3; i++)
          this.box(root, -0.45, 0.15 + i * 0.14, -0.4, 0.85 - i * 0.12, 0.15, 0.8 - i * 0.1, wall);
        this.hall(root, -0.45, -0.4, 0.4, 1.15, roof, wall);
      } else if (variant === 1) {
        for (const x of [-0.58, 0.58]) tower(x, -0.5, 1.25);
        this.box(root, 0, 1.1, -0.5, 1.3, 0.13, 0.2, roof);
      } else {
        tower(0.6, -0.5, 1.55);
        for (let i = 0; i < 3; i++)
          this.cone(root, -0.6, 0.6, -0.4 + i * 0.38, 0.18, 0.7, region === 0 ? '#8f9956' : '#4a7a55', 6);
      }
    }
    if (level >= 1) this.hall(root, -0.55, -0.5, 0.42, 0.7, roof, wall);
    if (level >= 2) {
      this.hall(root, 0.55, -0.5, 0.42, 0.85, roof, wall);
      this.box(root, 0, 0.35, 0.78, 1.6, 0.4, 0.09, wall);
    }
    if (level >= 3)
      for (const x of [-0.48, 0.48]) {
        this.box(root, x, 0.48, 0.55, 0.55, 0.35, 0.38, '#9c7a51');
        this.roof(root, x, 0.85, 0.55, 0.65, 0.55, color);
      }
    if (level >= 4) {
      for (const x of [-0.75, 0.75]) tower(x, -0.72, 1.65);
      this.box(root, 0, 1.5, -0.72, 1.5, 0.25, 0.15, wall);
    }
    if (level === 5) {
      this.hall(root, 0, -0.15, 0.8, 1.8, roof, '#d1bf97');
      this.roof(root, 0, 2.18, -0.15, 1.15, 0.9, '#d4b56d');
      this.box(root, 0, 2.42, -0.15, 0.85, 0.06, 0.06, '#f4d98e', true);
    }
    return root;
  }
  makeBoard() {
    this.board.add(makeWorld(this));
    this.switchRegion(0, true);
    this.makeFacilities();
    MAP.forEach((t) => {
      const pos = tilePosition(t.id),
        tile = new T.Group();
      tile.position.copy(pos);
      tile.rotation.y = tileAngle(t.id);
      this.board.add(tile);
      const color = t.group >= 0 ? REGIONS[t.group].color : '#d4ad63';
      const base = this.box(tile, 0, 0.12, 0, 2.05, 0.32, 2.05, t.group >= 0 ? '#c4b898' : '#879184');
      base.userData.tile = t.id;
      this.picks.push(base);
      this.box(tile, 0, 0.3, 0.92, 1.95, 0.07, 0.15, color, true);
      let city;
      if (t.kind === 'city') {
        city = this.makeCity(t.id);
        tile.add(city);
      } else {
        city = new T.Group();
        tile.add(city);
        if (t.kind === 'station') {
          this.hall(city, 0, 0, 0.8, 0.55, '#6b5c47', '#c2a679');
          this.box(city, -0.5, 0.62, 0.4, 0.04, 1, 0.04, '#615146');
          this.box(city, -0.3, 0.92, 0.4, 0.4, 0.3, 0.025, '#a85946');
        } else if (t.kind === 'utility') {
          this.box(city, 0, 0.3, 0, 1.5, 0.12, 1.3, '#427f8a');
          for (let i = -1; i < 2; i++) {
            this.box(city, i * 0.4, 0.4, 0, 0.2, 0.15, 0.8, '#806649');
            this.box(city, i * 0.4, 0.8, 0, 0.02, 0.8, 0.02, '#cdbb8c');
            this.box(city, i * 0.4 + 0.1, 0.85, 0, 0.32, 0.45, 0.03, '#eee0b5');
          }
        } else if (t.kind === 'event') {
          this.hall(city, 0, 0, 0.8, 0.5, '#7d536c', '#c9b8a0');
          const orb = new T.Mesh(this.geo('OctahedronGeometry', [0.25]), this.mat('#e1b869', true));
          orb.position.y = 1.3;
          city.add(orb);
          this.effects.push(orb);
        } else if (t.kind === 'tax') {
          this.cylinder(city, 0, 0.5, 0, 0.45, 0.5, '#c7a353');
          this.cylinder(city, 0, 0.8, 0, 0.3, 0.12, '#dfc987');
        } else {
          this.box(city, 0, 0.4, 0, 1.2, 0.4, 1.2, '#aca181');
          this.hall(city, 0, 0, 0.7, 0.85, '#3b5a56', '#c4b18e');
        }
      }
      this.cityRoots[t.id] = { tile, city, level: 0 };
      const name = this.text(`${ROUTE_INDEX[t.id] + 1} · ${t.name}`, color, 2.55, 0.55);
      name.position.set(0, 1.7, 0);
      tile.add(name);
      this.labels.push(name);
      const flag = new T.Group();
      flag.position.set(-0.82, 0.3, -0.75);
      tile.add(flag);
      this.box(flag, 0, 0.55, 0, 0.035, 1.1, 0.035, '#cfbf95');
      const cloth = this.box(flag, 0.2, 0.9, 0, 0.4, 0.29, 0.025, COLORS[0]);
      flag.visible = false;
      this.flags.push({ flag, cloth });
    });
    const ringGeo = new T.RingGeometry(0.8, 1.03, 48);
    this.selection = new T.Mesh(
      ringGeo,
      new T.MeshBasicMaterial({
        color: '#f5d893',
        transparent: true,
        opacity: 0.7,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    this.selection.rotation.x = -Math.PI / 2;
    this.selection.position.y = 0.34;
    this.board.add(this.selection);
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = Math.sin(i * 4.2) * 15;
      positions[i * 3 + 1] = 1 + (i % 11) * 0.6;
      positions[i * 3 + 2] = Math.cos(i * 6.7) * 15;
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    this.fireflies = new T.Points(
      geometry,
      new T.PointsMaterial({
        size: 0.045,
        color: '#f2ce88',
        transparent: true,
        opacity: 0.65,
        blending: T.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this.fireflies);
  }
  disposeLandscape(root) {
    if (!root) return;
    root.userData.materials.forEach((m) => m.dispose());
    root.traverse((o) => {
      if (o.userData.ownedGeometry) o.geometry.dispose();
    });
    this.board.remove(root);
  }
  switchRegion(region, immediate = false, city = MAP.find((t) => t.group === region).id) {
    const key = `${region}:${city}`;
    if (this.sceneryKey === key) return;
    this.disposeLandscape(this.oldLandscape);
    this.oldLandscape = this.landscape;
    this.landscape = makeLandscape(this, region, city);
    this.landscape.scale.setScalar(CENTER_SCALE);
    this.landscape.position.y = immediate ? 0 : -0.25;
    this.landscape.userData.materials.forEach((m) => {
      m.opacity = immediate ? 1 : 0;
    });
    this.board.add(this.landscape);
    this.region = region;
    this.sceneryKey = key;
    this.regionStart = performance.now() - (immediate ? 900 : 0);
    this.container.dataset.region = REGIONS[region].name;
    this.container.dataset.sceneryCity = MAP[city].name;
    this.container.setAttribute(
      'aria-label',
      `${REGIONS[region].name} · ${SCENERY[region].title} · ${MAP[city].name}，可拖动旋转；中央设施也可通过下方按钮操作`,
    );
  }
  makeFacilities() {
    this.facilities = new T.Group();
    this.facilities.scale.setScalar(CENTER_SCALE);
    this.board.add(this.facilities);
    const facility = (name, action, x, z, w, d) => {
      const g = new T.Group();
      g.position.set(x, 0.22, z);
      this.facilities.add(g);
      const base = this.box(g, 0, 0.15, 0, w, 0.3, d, '#737d69');
      base.userData.facility = action;
      this.facilityPicks.push(base);
      for (let i = 0; i < 3; i++)
        this.box(g, 0, 0.07 + i * 0.06, d / 2 + 0.3 - i * 0.1, w * 0.6, 0.1, 0.18, '#c0b18c');
      const label = this.text(name, '#f0d49a', 2.2, 0.55);
      label.position.set(0, 2.3, 0);
      g.add(label);
      return g;
    };
    const stage = facility('将台 · 点将', 'roster', ...FACILITY_POSITIONS.roster, 3.8, 2.4);
    for (const x of [-1.65, 1.65]) {
      this.box(stage, x, 1.2, -0.7, 0.07, 2, 0.07, '#d4b779');
      this.box(stage, x + 0.22, 1.8, -0.7, 0.55, 0.7, 0.03, '#9e5145');
    }
    this.centerRoster = new T.Group();
    stage.add(this.centerRoster);
    const cards = facility('锦囊台 · 览策', 'cards', ...FACILITY_POSITIONS.cards, 2.5, 1.7);
    this.box(cards, 0, 0.6, 0, 1.7, 0.15, 0.9, '#ae9163');
    for (let i = 0; i < 3; i++) {
      const card = this.box(
        cards,
        -0.5 + i * 0.5,
        1,
        0,
        0.38,
        0.65,
        0.07,
        ['#749e95', '#c2a26b', '#9e84a6'][i],
        true,
      );
      card.rotation.z = (i - 1) * -0.18;
      this.box(cards, -0.5 + i * 0.5, 1.02, 0.05, 0.18, 0.12, 0.02, '#f1d99d', true);
    }
    const armory = facility('军械铺 · 铸装', 'recruit', ...FACILITY_POSITIONS.recruit, 2.8, 2);
    this.hall(armory, 0.5, -0.25, 1.4, 0.7, '#64766e', '#c6b491');
    this.cylinder(armory, -0.8, 0.65, 0.2, 0.35, 0.7, '#706e67');
    this.cone(armory, -0.8, 1, 0.2, 0.23, 0.55, '#f6a65d', 6);
    for (let i = 0; i < 3; i++) {
      this.box(armory, -0.6 + i * 0.35, 1.1, -0.75, 0.035, 1.4, 0.035, '#d4b57d');
      this.cone(armory, -0.6 + i * 0.35, 1.85, -0.75, 0.09, 0.3, '#d7ddc3', 4);
    }
    for (const g of [stage, cards, armory]) {
      const action = g.children.find((o) => o.userData.facility)?.userData.facility;
      g.traverse((o) => {
        if (o.isMesh && !this.facilityPicks.includes(o)) {
          o.userData.facility = action;
          this.facilityPicks.push(o);
        }
      });
    }
  }
  updateCenter(state) {
    const p = state.players[state.turn];
    const city = sceneryCity(p, this.sceneryCities.get(p.id));
    this.sceneryCities.set(p.id, city);
    this.switchRegion(p.region, this.reduced, city);
    this.facilities.visible = state.enhanced;
    const signature = `${p.id}:${p.generals.map((g) => [g.id, g.injury, g.guard, ...g.gear].join('.')).join(',')}:${p.items.map((i) => [i.id, i.slot, i.quality].join('.')).join(',')}`;
    if (signature === this.centerSignature) return;
    this.centerSignature = signature;
    this.clearDynamic(this.centerRoster);
    const ready = readyGenerals(p).slice(0, 3);
    ready.forEach((g, i) => {
      const model = this.warrior(COLORS[p.id], g.gear, p.items, g.id);
      model.position.set((i - (ready.length - 1) / 2) * 1.1, 0.3, 0.15);
      this.centerRoster.add(model);
      const label = this.text(GENERALS[g.id].name, '#d7e7cb', 0.85, 0.25);
      label.position.set(model.position.x, 1.75, 0.15);
      this.centerRoster.add(label);
    });
    const label = this.text(`${p.name} · ${readyGenerals(p).length}将待命`, '#d2c9a8', 2.6, 0.4);
    label.position.set(0, 0.35, 1.2);
    this.centerRoster.add(label);
  }
  warrior(color, gear = [], items = [], variant = 0, troop = '步') {
    const root = new T.Group();
    this.cylinder(root, 0, 0.08, 0, 0.28, 0.12, '#d6b77a');
    this.cone(root, 0, 0.43, 0, 0.28, 0.62, color, 8);
    this.box(root, 0, 0.61, 0, 0.35, 0.3, 0.22, '#777c74');
    this.cylinder(root, 0, 0.96, 0, 0.14, 0.28, '#d5b18a');
    if (!items.some((i) => i.id === gear[0])) {
      this.cone(root, 0, 1.16, 0, 0.18, 0.19, variant % 2 ? '#4c5055' : color, 6);
      this.box(root, 0, 1.23, 0, 0.04, 0.23, 0.08, '#c4a567');
    }
    const arms = [],
      legs = [];
    for (const x of [-0.23, 0.23]) {
      const arm = new T.Group();
      arm.position.set(x, 0.8, 0);
      root.add(arm);
      arms.push(arm);
      this.cylinder(arm, 0, -0.17, 0, 0.07, 0.35, color);
      const leg = new T.Group();
      leg.position.set(x * 0.55, 0.35, 0);
      root.add(leg);
      legs.push(leg);
      this.box(leg, 0, -0.17, 0.04, 0.11, 0.18, 0.21, '#403d39');
    }
    root.userData.rig = { left: arms[0], right: arms[1], legs };
    if (troop === '弓') {
      const bow = new T.Mesh(this.geo('TorusGeometry', [0.38, 0.028, 6, 24, Math.PI]), this.mat('#d5bb82'));
      bow.position.set(0.12, -0.12, 0.15);
      bow.rotation.y = Math.PI / 2;
      bow.rotation.z = -Math.PI / 2;
      arms[1].add(bow);
      this.box(arms[1], 0.12, -0.12, 0.15, 0.018, 0.75, 0.018, '#e5dbc1');
    } else if (!items.some((i) => i.id === gear[2])) {
      const spear = this.box(arms[1], 0.13, -0.06, 0.04, 0.027, 1.45, 0.027, '#a78a59');
      spear.rotation.z = -0.13;
      this.cone(arms[1], 0.23, 0.68, 0.04, 0.06, 0.2, '#d5d1bb', 4);
    }
    gear.forEach((id, slot) => {
      const item = items.find((x) => x.id === id);
      if (!item) return;
      this.fitEquipment(root, arms, legs, slot, item.quality, troop);
    });
    if (troop === '骑') {
      root.children.slice(1).forEach((o) => {
        o.position.y += 0.55;
      });
      const horse = new T.Group();
      root.add(horse);
      this.box(horse, 0, 0.53, 0, 0.43, 0.4, 0.95, variant % 2 ? '#b7ac94' : '#77756c');
      this.box(horse, 0, 0.8, 0.5, 0.25, 0.55, 0.28, '#b5a88e');
      this.box(horse, 0, 1.03, 0.66, 0.23, 0.22, 0.4, '#b5a88e');
      for (const x of [-0.18, 0.18])
        for (const z of [-0.32, 0.32]) this.box(horse, x, 0.24, z, 0.07, 0.45, 0.09, '#6c655a');
      this.box(horse, 0, 0.78, -0.15, 0.5, 0.08, 0.5, color);
    }
    return root;
  }
  fitEquipment(root, arms, legs, slot, quality, troop) {
    const steel = ['#758080', '#8b9a98', '#a1b3be', '#b3b0c2', '#ccd5ce'][quality],
      trim = quality >= 3 ? '#d4b66f' : '#9f8159',
      leather = quality >= 3 ? '#594231' : '#79553b';
    const group = new T.Group();
    group.name = `equipment-${slot}-${quality}`;
    const sphere = (parent, x, y, z, r, sx, sy, sz) => {
      const mesh = new T.Mesh(
        this.geo('SphereGeometry', [r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]),
        this.mat(steel),
      );
      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      parent.add(mesh);
      return mesh;
    };
    if (slot === 0) {
      root.add(group);
      sphere(group, 0, 1.05, 0, 0.19, 1, 1.1, 1);
      this.cylinder(group, 0, 1.07, 0, 0.195, 0.04, trim);
      for (const side of [-1, 1]) {
        this.box(group, side * 0.165, 0.98, 0.02, 0.04, 0.19, 0.18, steel);
        this.box(group, side * 0.17, 0.94, 0.12, 0.045, 0.025, 0.02, trim);
      }
      this.box(group, 0, 1.17, 0, 0.024, 0.17, 0.27, trim);
    } else if (slot === 1) {
      arms.forEach((arm) => {
        const glove = group.clone();
        arm.add(glove);
        this.cylinder(glove, 0, -0.28, 0, 0.083, 0.19, leather);
        this.box(glove, 0, -0.33, 0.07, 0.12, 0.12, 0.055, leather);
        for (let i = 0; i < 3; i++) this.cylinder(glove, 0, -0.21 - i * 0.055, 0, 0.088, 0.016, trim);
      });
    } else if (slot === 2) {
      const parent = troop === '弓' ? root : arms[1];
      parent.add(group);
      group.position.set(troop === '弓' ? -0.26 : 0.08, troop === '弓' ? 0.58 : -0.26, 0.13);
      group.rotation.z = troop === '弓' ? -2.5 : -0.22;
      this.box(group, 0, 0, 0, 0.045, 0.21, 0.045, leather);
      for (let i = 0; i < 4; i++) this.box(group, 0, -0.08 + i * 0.05, 0, 0.049, 0.01, 0.049, trim);
      const ring = new T.Mesh(this.geo('TorusGeometry', [0.062, 0.015, 6, 16]), this.mat(trim));
      ring.position.y = -0.16;
      group.add(ring);
      this.box(group, 0, 0.115, 0, 0.11, 0.027, 0.06, trim);
      this.box(group, 0, 0.47, 0, 0.075, 0.69, 0.023, steel);
      this.box(group, 0.034, 0.47, 0, 0.009, 0.69, 0.026, '#e1e7df');
      const tip = this.cone(group, 0.004, 0.865, 0, 0.055, 0.13, steel, 3);
      tip.scale.z = 0.28;
      if (quality >= 3) this.box(group, -0.017, 0.45, 0.016, 0.009, 0.35, 0.003, trim);
    } else if (slot === 3) {
      root.add(group);
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 5; col++)
          for (const side of [-1, 1]) {
            this.box(group, (col - 2) * 0.082, 0.82 - row * 0.082, side * 0.14, 0.075, 0.09, 0.035, steel);
            this.box(group, (col - 2) * 0.082, 0.84 - row * 0.082, side * 0.161, 0.035, 0.013, 0.008, trim);
          }
      this.box(group, 0, 0.53, 0, 0.46, 0.04, 0.34, leather);
      this.box(group, 0, 0.53, 0.18, 0.08, 0.065, 0.025, trim);
      arms.forEach((arm) => {
        const shoulder = new T.Group();
        shoulder.name = group.name;
        arm.add(shoulder);
        for (let i = 0; i < 3; i++) this.box(shoulder, 0, 0.03 - i * 0.065, 0.04, 0.18, 0.07, 0.19, steel);
      });
    } else {
      legs.forEach((leg) => {
        const piece = group.clone();
        leg.add(piece);
        if (slot === 4) {
          this.box(piece, 0, -0.07, 0.105, 0.13, 0.25, 0.055, steel);
          this.box(piece, 0, -0.07, 0.14, 0.019, 0.25, 0.009, trim);
          for (const y of [-0.15, 0.01]) this.box(piece, 0, y, 0.11, 0.145, 0.025, 0.065, leather);
        } else {
          this.cylinder(piece, 0, -0.18, 0.02, 0.09, 0.22, leather);
          this.box(piece, 0, -0.28, 0.075, 0.18, 0.11, 0.3, leather);
          this.box(piece, 0, -0.34, 0.075, 0.19, 0.032, 0.31, '#303735');
          this.box(piece, 0, -0.12, 0.02, 0.185, 0.028, 0.18, trim);
        }
      });
    }
  }
  makeDice() {
    const dots = [
      [],
      [[0, 0]],
      [
        [-1, -1],
        [1, 1],
      ],
      [
        [-1, -1],
        [0, 0],
        [1, 1],
      ],
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
      [
        [-1, -1],
        [1, -1],
        [0, 0],
        [-1, 1],
        [1, 1],
      ],
      [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ],
    ];
    this.diceMaterials = [1, 6, 2, 5, 3, 4].map((n) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const c = canvas.getContext('2d');
      c.fillStyle = '#f0dfbc';
      c.fillRect(0, 0, 128, 128);
      c.strokeStyle = '#bba172';
      c.lineWidth = 5;
      c.strokeRect(3, 3, 122, 122);
      c.fillStyle = n === 1 ? '#b94436' : '#263a3b';
      dots[n].forEach(([x, y]) => {
        c.beginPath();
        c.arc(64 + x * 31, 64 + y * 31, n === 1 ? 17 : 10, 0, Math.PI * 2);
        c.fill();
      });
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
      return new T.MeshStandardMaterial({ map: texture, roughness: 0.35 });
    });
    this.dice = this.diceMaterials.slice(0, 2).map((_, i) => {
      const mesh = new T.Mesh(this.geo('BoxGeometry', [1.25, 1.25, 1.25]), this.diceMaterials);
      mesh.position.set(-1 + i * 2, 1, 5);
      mesh.castShadow = true;
      this.board.add(mesh);
      mesh.visible = false;
      return mesh;
    });
    this.rollStart = 0;
    this.rollValues = [1, 1];
  }
  roll(values, skip = false) {
    this.rollValues = values;
    this.rollStart = performance.now() - (skip ? 900 : 0);
    this.dice.forEach((d) => {
      d.visible = true;
    });
  }
  clearDynamic(group) {
    group.traverse((o) => {
      if (o.isSprite) {
        o.material.map?.dispose();
        o.material.dispose();
      }
    });
    group.clear();
  }
  update(state) {
    if (this.combatAnimation) return;
    this.state = state;
    const battle = state?.battle;
    this.board.visible = !battle;
    this.battleRoot.visible = Boolean(battle);
    if (battle) {
      const signature = `${battle.city}:${battle.attacker}:${battle.defender}:${battle.units
        .map((u) => {
          const p = state.players[u.side === 0 ? battle.attacker : battle.defender],
            g = u.gid === -3 || u.gid >= 0 ? fighter(p, u.gid === -3 ? -1 : u.gid) : null;
          return `${u.id}:${u.gid}:${g?.title}:${g?.relic}:${g?.gear
            .map((id) => {
              const item = p.items.find((i) => i.id === id);
              return item ? `${item.id}.${item.quality}` : '-';
            })
            .join(',')}`;
        })
        .join(';')}`;
      if (signature !== this.signature) {
        this.signature = signature;
        this.makeBattle(state);
      }
      this.refreshBattleUnits(state);
      return;
    }
    if (this.inBattle) {
      this.inBattle = false;
      this.reset();
    }
    this.signature = '';
    if (!state) return;
    this.updateCenter(state);
    state.assets.forEach((a, id) => {
      const c = this.cityRoots[id];
      if (c.level !== a.level && MAP[id].kind === 'city') {
        c.tile.remove(c.city);
        c.city = this.makeCity(id, a.level);
        c.tile.add(c.city);
        c.level = a.level;
        this.labels[id].position.y = a.level === 5 ? 2.5 : 1.7;
      }
      const f = this.flags[id];
      f.flag.visible = a.owner >= 0;
      if (a.owner >= 0) {
        f.cloth.material = this.mat(a.mortgaged ? '#686c6a' : COLORS[a.owner]);
        f.flag.rotation.y = state.round * 0.12;
      }
    });
    while (this.tokens.length < state.players.length) {
      const p = state.players[this.tokens.length],
        model = this.warrior(COLORS[p.id], [], [], p.lord);
      model.scale.setScalar(1.1);
      model.position.copy(tilePosition(p.pos));
      this.tokens.push({ model, pos: p.pos, target: tilePosition(p.pos) });
      this.board.add(model);
    }
    this.tokens.forEach((token, id) => {
      const p = state.players[id];
      if (!p) {
        token.model.visible = false;
        return;
      }
      token.model.visible = !p.out;
      const point = (index) => {
        const v = tilePosition(index);
        v.x += ((id % 2) - 0.5) * 0.48;
        v.z += (Math.floor(id / 2) - 0.5) * 0.48;
        v.y = 0.34;
        return v;
      };
      const steps = (ROUTE_INDEX[p.pos] - ROUTE_INDEX[token.pos] + MAP.length) % MAP.length;
      if (steps > 0 && steps <= 12 && p.jail < 0 && !this.reduced)
        token.path = Array.from({ length: steps }, (_, i) => {
          const curve = routeCurve((ROUTE_INDEX[token.pos] + i) % ROUTE.length);
          return [1 / 3, 2 / 3, 1].map((t) => {
            const v = curve.getPoint(t);
            v.y = 0.34;
            v.x += ((id % 2) - 0.5) * 0.48;
            v.z += (Math.floor(id / 2) - 0.5) * 0.48;
            return v;
          });
        }).flat();
      else if (steps > 0) token.path = [];
      token.target = point(p.pos);
      if (this.reduced || token.pos === undefined) token.model.position.copy(token.target);
      token.pos = p.pos;
    });
    this.select(state.players[state.turn].pos);
    if (this.followPlayer && this.followedTile !== state.players[state.turn].pos)
      this.focusTile(state.players[state.turn].pos, true);
  }
  makeBattle(s) {
    const b = s.battle;
    this.clearDynamic(this.battleRoot);
    this.battleModels.clear();
    if (!this.inBattle) {
      this.inBattle = true;
      this.camera.position.set(12, 13, 18);
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 12;
      this.controls.maxDistance = 35;
    }
    this.box(this.battleRoot, 0, -0.4, 0, 18, 0.7, 13, '#595948');
    this.box(this.battleRoot, 0, -0.03, 0, 17.6, 0.07, 12.6, '#a18c62');
    this.box(this.battleRoot, 0, 0.02, 0, 17.3, 0.08, 12.3, '#293d40');
    for (let i = -3; i <= 3; i++) this.box(this.battleRoot, i * 2, 0.065, 0, 0.018, 0.009, 12, '#465a58');
    for (let i = -2; i <= 2; i++) this.box(this.battleRoot, 0, 0.065, i * 2, 17, 0.009, 0.018, '#465a58');
    for (const side of [0, 1])
      for (const z of [-4.8, 4.8]) {
        const x = side === 0 ? -7.4 : 7.4,
          color = COLORS[side === 0 ? b.attacker : b.defender];
        this.cylinder(this.battleRoot, x, 1.3, z, 0.055, 2.6, '#c5ad7e');
        this.box(this.battleRoot, x + 0.32, 2.1, z, 0.7, 1, 0.035, color);
        this.box(this.battleRoot, x + 0.32, 2.1, z + 0.025, 0.14, 0.5, 0.025, '#e3ce9d');
      }
    b.units.forEach((u) => {
      if (u.gid === -2) {
        const wall = new T.Group();
        wall.position.set(3, 0.05, -5.4);
        this.battleRoot.add(wall);
        this.box(wall, 0, 0.8, 0, 7, 1.6, 0.6, '#aaa080');
        for (let i = 0; i < 10; i++) this.box(wall, -3.25 + i * 0.73, 1.8, 0, 0.4, 0.4, 0.65, '#b8ab87');
        this.battleModels.set(u.id, {
          model: wall,
          home: wall.position.clone(),
          rotation: wall.rotation.clone(),
          label: null,
          signature: '',
        });
        return;
      }
      const p = s.players[u.side === 0 ? b.attacker : b.defender],
        g = u.gid === -3 || u.gid >= 0 ? fighter(p, u.gid === -3 ? -1 : u.gid) : null;
      const model = this.warrior(
        COLORS[p.id],
        g?.gear || [],
        p.items,
        u.gid === -3 ? 90 + p.lord : Math.max(0, u.gid),
        u.troop,
      );
      const side = b.units.filter((x) => x.side === u.side && x.gid !== -2);
      model.position.set(u.side === 0 ? -3.6 : 3.6, 0.15, (side.indexOf(u) - (side.length - 1) / 2) * 2.6);
      model.rotation.y = u.side === 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      model.scale.setScalar(2);
      if (g && g.title >= 0) this.rankEffect(model, g.title);
      if (u.gid === -3) {
        this.cone(model, 0, 2.15, 0, 0.25, 0.45, '#d4ad63', 6);
      }
      this.battleRoot.add(model);
      this.battleModels.set(u.id, {
        model,
        home: model.position.clone(),
        rotation: model.rotation.clone(),
        label: null,
        signature: '',
      });
    });
    const title = this.text(`${MAP[b.city].name} · 攻城战`, '#eed1a0', 5, 1);
    title.position.set(0, 0.5, 5.5);
    this.battleRoot.add(title);
  }
  rankEffect(model, id) {
    const title = TITLES[id],
      aura = new T.Group();
    const key = `rank:${title.color}`;
    if (!this.materials.has(key))
      this.materials.set(
        key,
        new T.MeshBasicMaterial({
          color: title.color,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          toneMapped: false,
        }),
      );
    const material = this.materials.get(key);
    model.add(aura);
    for (let i = 0; i <= Math.floor(id / 4); i++) {
      const ring = new T.Mesh(this.geo('TorusGeometry', [0.46 + i * 0.08, 0.012, 4, 12 + id * 3]), material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.05 + i * 0.025;
      aura.add(ring);
    }
    for (let i = 0; i < id + 3; i++) {
      const a = (i / (id + 3)) * Math.PI * 2;
      const mote = new T.Mesh(
        this.geo(id % 2 ? 'OctahedronGeometry' : 'TetrahedronGeometry', [0.045]),
        material,
      );
      mote.position.set(Math.cos(a) * 0.63, 0.13 + (i % 3) * 0.08, Math.sin(a) * 0.63);
      aura.add(mote);
    }
    const seal = this.text(title.seal, title.color, 0.42, 0.5, 128);
    seal.position.set(-0.6, 1.48, -0.25);
    model.add(seal);
    for (let i = 0; i <= Math.floor(id / 4); i++) {
      const ribbon = this.box(
        model,
        -0.6 + i * 0.18,
        1.08,
        -0.28,
        0.09,
        0.62 + i * 0.08,
        0.025,
        title.color,
        true,
      );
      ribbon.material = material;
    }
    model.userData.rankAura = aura;
  }
  refreshBattleUnits(s, pose = true) {
    for (const u of s.battle.units) {
      const entry = this.battleModels.get(u.id);
      if (!entry) continue;
      if (pose) {
        entry.model.position.copy(entry.home);
        entry.model.rotation.copy(entry.rotation);
        if (u.gid === -2) {
          entry.model.visible = u.hp > 0;
          entry.model.scale.y = 1;
        } else if (u.hp <= 0) entry.model.rotation.z = Math.PI * 0.48;
      }
      const text = `${u.name} ${u.hp}/${u.max}${u.shield ? ` 盾${u.shield}` : ''}${u.statuses.length ? ' ' + u.statuses.map((x) => STATUS_NAMES[x.kind]).join('·') : ''}`;
      if (entry.signature === text) continue;
      if (entry.label) {
        entry.label.material.map.dispose();
        entry.label.material.dispose();
        entry.label.removeFromParent();
      }
      entry.signature = text;
      entry.label = this.text(text, u.side === 0 ? '#8ad6bc' : '#e6ac8d', u.statuses.length ? 4 : 3.3, 0.65);
      entry.label.position.set(entry.home.x + (u.gid === -2 ? 2.5 : 0), u.gid === -2 ? 2.8 : 4, entry.home.z);
      this.battleRoot.add(entry.label);
    }
  }
  playCombat(command, before, after, skip, done) {
    if (skip || this.reduced || !before.battle || !after.combatEvent) return false;
    this.combatAnimation = new CombatAnimation(this, command, before, after);
    this.combatDone = done;
    return true;
  }
  finishCombat() {
    if (!this.combatAnimation) return;
    this.combatAnimation.dispose();
    this.combatAnimation = null;
    const done = this.combatDone;
    this.combatDone = null;
    done();
  }
  actionEffect(command, before, after, skip) {
    if (skip || this.reduced) return;
    let point = null,
      color = '#f1c575';
    if (before.battle && after.battle && ['attack', 'skill', 'battleCard'].includes(command.type)) {
      const unit = after.battle.units.find((u) => u.id === command.target);
      if (unit) {
        const count = after.battle.units.filter((u) => u.side === unit.side && u.gid !== -2).length;
        point = new T.Vector3(
          unit.side === 0 ? -3.6 : 3.6,
          1.5,
          unit.gid === -2 ? -3 : ((unit.id % 10) - (count - 1) / 2) * 2.6,
        );
        color = command.type === 'skill' ? '#80d9dd' : '#f1c575';
      }
    } else if (
      (command.type === 'asset' && command.action === 'build') ||
      (command.type === 'develop' && command.choice === 'build')
    ) {
      point = tilePosition(command.tile ?? before.decision.tile);
      point.y = 1;
    } else if (before.battle && !after.battle) {
      point = tilePosition(before.battle.city);
      point.y = 2;
    }
    if (!point) return;
    const count = 60,
      positions = new Float32Array(count * 3),
      velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      const angle = i * 2.399;
      velocities.push(
        new T.Vector3(
          Math.cos(angle) * (1 + (i % 4) * 0.3),
          0.8 + (i % 5) * 0.45,
          Math.sin(angle) * (1 + (i % 3) * 0.4),
        ),
      );
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    const material = new T.PointsMaterial({
      color,
      size: 0.11,
      transparent: true,
      opacity: 1,
      blending: T.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new T.Points(geometry, material);
    this.scene.add(particles);
    this.transients.push({ particles, point, velocities, started: performance.now() });
  }
  select(id) {
    this.selection.position.copy(tilePosition(id));
    this.selection.position.y = 0.34;
  }
  reset() {
    this.followPlayer = false;
    this.cameraMode = this.inBattle ? 'battle' : 'overview';
    this.container.dataset.view = this.cameraMode;
    this.camera.position.set(...(this.inBattle ? [12, 13, 18] : WORLD_CAMERA));
    if (!this.inBattle) this.camera.position.multiplyScalar(Math.max(1, 1.1 / this.camera.aspect));
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 12;
    this.controls.maxDistance = this.inBattle ? 35 : 240;
    this.controls.update();
  }
  focusTile(id, follow = false) {
    if (this.inBattle) return;
    const target = tilePosition(id);
    this.followPlayer = follow;
    this.followedTile = id;
    this.cameraMode = 'city';
    this.container.dataset.view = 'city';
    this.container.dataset.focusedTile = String(id);
    this.controls.target.copy(target);
    this.camera.position.copy(target).add(new T.Vector3(...CLOSE_CAMERA));
    this.controls.minDistance = 8;
    this.controls.maxDistance = 240;
    this.controls.update();
  }
  focusCenter() {
    if (this.inBattle) return;
    this.followPlayer = false;
    this.cameraMode = 'center';
    this.container.dataset.view = 'center';
    this.controls.target.set(0, 0, 0);
    this.camera.position.set(...CENTER_CAMERA);
    this.controls.minDistance = 12;
    this.controls.maxDistance = 240;
    this.controls.update();
  }
  settings(low, reduced) {
    this.quality = low ? 'low' : 'high';
    this.reduced = reduced;
    this.renderer.shadowMap.enabled = !low;
    this.renderer.setPixelRatio(low ? 1 : Math.min(devicePixelRatio, 1.6));
    this.fireflies.visible = !low && !reduced;
  }
  resize() {
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.cameraMode === 'overview' && !this.inBattle) this.reset();
  }
  animate(time) {
    this.frame = requestAnimationFrame(this.animate);
    if (document.hidden || time - this.last < (this.quality === 'low' ? 32 : 20)) return;
    this.last = time;
    this.controls.update();
    if (this.combatAnimation?.tick(time)) this.finishCombat();
    if (this.battleRoot.visible)
      for (const entry of this.battleModels.values()) {
        const aura = entry.model.userData.rankAura;
        if (aura) aura.rotation.y = this.reduced || this.quality === 'low' ? 0 : time * 0.00035;
      }
    if (this.landscape) {
      const t = Math.min(1, (time - this.regionStart) / 850),
        ease = t * t * (3 - 2 * t);
      this.landscape.position.y = -0.25 * (1 - ease);
      this.landscape.userData.materials.forEach((m) => {
        m.opacity = ease * m.userData.baseOpacity;
        m.depthWrite = t === 1 && m.userData.baseDepthWrite;
      });
      if (this.oldLandscape) {
        this.oldLandscape.userData.materials.forEach((m) => {
          m.opacity = (1 - ease) * m.userData.baseOpacity;
          m.depthWrite = false;
        });
        if (t === 1) {
          this.disposeLandscape(this.oldLandscape);
          this.oldLandscape = null;
        }
      }
      if (this.board.visible) animateLandscape(this.landscape, time, this.reduced);
    }
    if (!this.reduced) {
      this.fireflies.rotation.y = time * 0.000015;
      this.effects.forEach((o, i) => {
        o.rotation.y = time * 0.001;
        o.position.y = 1.3 + Math.sin(time * 0.001 + i) * 0.1;
      });
    }
    this.tokens.forEach((t) => {
      const target = t.path?.length ? t.path[0] : t.target;
      t.model.position.lerp(target, this.reduced ? 1 : 0.24);
      if (t.path?.length && t.model.position.distanceTo(target) < 0.18) t.path.shift();
      t.model.rotation.y = Math.sin(time * 0.0004) * 0.1;
    });
    if (this.rollStart) {
      const elapsed = time - this.rollStart;
      this.dice.forEach((d, i) => {
        if (elapsed < 800) {
          d.rotation.set(elapsed * 0.012 + i, elapsed * 0.009, elapsed * 0.007);
          d.position.y = 1 + Math.abs(Math.sin(elapsed * 0.015)) * 1.6;
        } else {
          const rotations = [
            [0, 0, -Math.PI / 2],
            [0, 0, 0],
            [Math.PI / 2, 0, 0],
            [-Math.PI / 2, 0, 0],
            [Math.PI, 0, 0],
            [0, 0, Math.PI / 2],
          ];
          d.rotation.set(...rotations[this.rollValues[i] - 1]);
          d.position.y = 1;
        }
        if (elapsed > 2600) d.visible = false;
      });
    }
    for (let i = this.transients.length - 1; i >= 0; i--) {
      const effect = this.transients[i],
        t = (time - effect.started) / 1000;
      if (t > 1.1) {
        this.scene.remove(effect.particles);
        effect.particles.geometry.dispose();
        effect.particles.material.dispose();
        this.transients.splice(i, 1);
        continue;
      }
      const array = effect.particles.geometry.attributes.position.array;
      effect.velocities.forEach((v, n) => {
        array[n * 3] = effect.point.x + v.x * t;
        array[n * 3 + 1] = effect.point.y + v.y * t - t * t * 2;
        array[n * 3 + 2] = effect.point.z + v.z * t;
      });
      effect.particles.geometry.attributes.position.needsUpdate = true;
      effect.particles.material.opacity = 1 - t / 1.1;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
