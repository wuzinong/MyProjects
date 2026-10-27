import * as T from 'three';
import { skillFor } from '../data/skills.js';
import { CARDS } from '../data/game.js';
import { skillTargets } from '../core/combat.js';
import { fighterStyle } from './fighter-style.js';

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export function combatPresentation(command, before) {
  const b = before.battle,
    u = b.units.find((x) => x.id === b.order[b.cursor]);
  const style = fighterStyle(u, before.players[u.side === 0 ? b.attacker : b.defender]);
  if (command.type === 'skill') return { ...skillFor(u, command.skill), style };
  if (command.type === 'recover')
    return { name: `${u.name} · 整息解缚`, effect: 'recover', color: '#a99adf', hits: 1, style };
  if (command.type === 'battleCard') {
    const p = before.players[u.side === 0 ? b.attacker : b.defender],
      card = CARDS[p.cards[command.index]];
    return {
      name: card.name,
      effect: {
        damage: 'storm',
        wall: 'charge',
        all: 'fire',
        heal: 'heal',
        teamheal: 'heal',
        defend: 'barrier',
        attack: 'banner',
      }[card.effect],
      color: '#efcf88',
      hits: 1,
      style,
    };
  }
  return {
    name: `${u.name} · ${style.attackName}`,
    effect: style.effect,
    color: style.color,
    hits: 1,
    style,
  };
}
export class CombatAnimation {
  constructor(v, command, before, after) {
    this.v = v;
    this.command = command;
    this.before = before;
    this.after = after;
    this.started = performance.now();
    this.duration = command.type === 'skill' ? 2000 : 1250;
    this.root = new T.Group();
    v.battleRoot.add(this.root);
    this.materials = [];
    this.tracks = [];
    this.presentation = combatPresentation(command, before);
    this.style = this.presentation.style;
    this.duration *= this.style.tempo;
    const b = before.battle;
    this.unit = b.units.find((u) => u.id === b.order[b.cursor]);
    this.actor = v.battleModels.get(this.unit.id);
    this.origin = this.actor.home.clone();
    this.actorRotation = this.actor.model.rotation.clone();
    this.rig = this.actor.model.userData.rig;
    this.melee = ['slash', 'crescent', 'axe', 'blades', 'lance', 'charge', 'dash', 'ambush'].includes(
      this.presentation.effect,
    );
    const target = b.units.find((u) => u.id === command.target);
    let targets = target ? [target] : [this.unit];
    if (command.type === 'skill') {
      const skill = skillFor(this.unit, command.skill);
      targets = ['enemy', 'ally'].includes(skill.target) ? [target] : skillTargets(b, this.unit, skill);
    } else if (command.type === 'battleCard') {
      targets = b.units.filter((u) => {
        const result = after.combatEvent.units.find((x) => x.id === u.id);
        return result.hp !== u.hp || result.shield !== u.shield;
      });
      if (!targets.length) targets = [this.unit];
    }
    this.target = targets.find((x) => x.side !== this.unit.side) || targets[0] || this.unit;
    this.destination = v.battleModels.get(this.target.id).home.clone();
    const toward = this.destination.clone().sub(this.origin);
    this.approach = this.destination.clone().add(toward.clone().normalize().multiplyScalar(-1.65));
    this.approach.y = this.origin.y;
    if (this.melee && toward.length() > 0.01) this.actor.model.rotation.y = Math.atan2(toward.x, toward.z);
    if (this.melee && command.type === 'skill') this.afterimages();
    this.signature();
    if (command.type !== 'recover') this.weaponTrail();
    targets.filter(Boolean).forEach((u, i) => this.makeEffect(u, i));
    this.reactions = after.combatEvent.reactions || [];
    if (this.reactions.length) this.duration += 700;
    this.reactions.forEach((r, i) => this.counterStrike(r, i));
    after.combatEvent.units.forEach((result) => {
      const old = b.units.find((u) => u.id === result.id),
        entry = v.battleModels.get(result.id);
      if (!old || !entry) return;
      const hp = result.hp - old.hp,
        shield = result.shield - old.shield;
      if (hp || shield) {
        const text = [
          hp ? `${hp > 0 ? '+' : ''}${hp}` : '',
          shield ? `盾${shield > 0 ? '+' : ''}${shield}` : '',
        ]
          .filter(Boolean)
          .join('  ');
        const label = v.text(text, hp < 0 ? '#ffc28e' : hp > 0 ? '#a7ffd0' : '#a6eaff', 2.3, 0.58);
        const point = entry.home.clone().add(new T.Vector3(0, 3.5, 0));
        label.position.copy(point);
        this.root.add(label);
        this.tracks.push((p) => {
          label.visible = p > (this.reactions.some((r) => r.target === result.id) ? 0.78 : 0.45);
          label.position.y = point.y + clamp((p - 0.45) / 0.55) * 1.5;
          label.material.opacity = 1 - clamp((p - 0.8) / 0.2);
        });
      }
      if (shield > 0) this.aura(entry.home, '#9ddff8', 'shield');
      if (hp > 0) this.aura(entry.home, '#9ff0c8', 'heal');
    });
  }
  signature() {
    const { style } = this;
    const root = new T.Group();
    this.root.add(root);
    root.position.copy(this.destination);
    root.position.y += 2.1;
    const sigil = this.glyph(style.motif, style.color, 0.85);
    root.add(sigil);
    for (let i = 0; i < style.marks; i++) {
      const a = (i / style.marks) * Math.PI * 2 + style.tilt;
      const blade = this.mesh(
        style.stance % 2 ? 'OctahedronGeometry' : 'TetrahedronGeometry',
        [0.14],
        this.material(style.color, 0.72),
        root,
      );
      blade.position.set(Math.cos(a) * (0.7 + style.path * 0.16), Math.sin(a) * 0.8, Math.sin(a * 2) * 0.25);
      blade.rotation.set(a, style.tilt, a);
      blade.scale.y = 1.5 + style.stance * 0.6;
    }
    this.tracks.push((p) => {
      root.visible = p > 0.4 && p < 0.78;
      root.rotation.z = style.sweep * Math.sin(p * Math.PI);
      root.scale.setScalar(Math.sin(clamp((p - 0.4) / 0.38) * Math.PI));
    });
    const banner = this.glyph(style.seal, style.color, 0.6);
    this.root.add(banner);
    banner.position.copy(this.origin).y += 2.8;
    this.tracks.push((p) => {
      banner.visible = p < 0.3;
      banner.position.y = this.origin.y + 2.8 + p;
    });
  }
  weaponTrail() {
    const tip = this.actor.model.userData.weaponTip;
    if (!tip) return;
    const count = this.v.quality === 'low' ? 6 : 10 + Math.max(0, this.style.weaponQuality) * 2;
    const positions = new Float32Array((count - 1) * 18);
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    const trail = new T.Mesh(geometry, this.material(this.style.weaponColor, 0.58));
    trail.userData.ownedGeometry = true;
    trail.frustumCulled = false;
    this.root.add(trail);
    const history = [];
    const point = new T.Vector3();
    const glints = Array.from(
      { length: this.v.quality === 'low' ? 1 : Math.max(1, this.style.weaponQuality + 2) },
      (_, i) => {
        const glint = this.mesh(
          'OctahedronGeometry',
          [0.055 + i * 0.008],
          this.material(this.style.weaponColor, 0.8),
        );
        glint.scale.y = 2 + Math.max(0, this.style.weaponQuality) * 0.3;
        return glint;
      },
    );
    this.tracks.push((p) => {
      trail.visible = p > 0.2 && p < 0.73;
      glints.forEach((glint) => {
        glint.visible = trail.visible;
      });
      if (!trail.visible) {
        history.length = 0;
        return;
      }
      this.actor.model.updateMatrixWorld(true);
      point.copy(tip.point);
      tip.parent.localToWorld(point);
      this.root.worldToLocal(point);
      glints.forEach((glint, i) => {
        glint.position
          .copy(point)
          .add(new T.Vector3(Math.cos(p * 10 + i) * i * 0.07, -i * 0.11, Math.sin(p * 10 + i) * i * 0.07));
        glint.rotation.z = p * 5 + i;
      });
      history.unshift(point.clone());
      if (history.length > count) history.pop();
      while (history.length < count) history.push(point.clone());
      const width = 0.055 + (this.style.weaponQuality + 1) * 0.025;
      for (let i = 0; i < count - 1; i++) {
        const a = history[i],
          b = history[i + 1],
          w = width * (1 - i / count);
        positions.set(
          [
            a.x,
            a.y - w,
            a.z,
            a.x,
            a.y + w,
            a.z,
            b.x,
            b.y + w,
            b.z,
            a.x,
            a.y - w,
            a.z,
            b.x,
            b.y + w,
            b.z,
            b.x,
            b.y - w,
            b.z,
          ],
          i * 18,
        );
      }
      geometry.attributes.position.needsUpdate = true;
    });
  }
  counterStrike(reaction, index) {
    const actor = this.v.battleModels.get(reaction.actor),
      target = this.v.battleModels.get(reaction.target);
    const shield = this.mesh('CircleGeometry', [0.8, 6], this.material('#91c8df', 0.7));
    shield.position.copy(actor.home).y += 1.5;
    shield.rotation.y = Math.PI / 2;
    const start = actor.home.clone().add(new T.Vector3(0, 1.5, 0)),
      end = target.home.clone().add(new T.Vector3(0, 1.5, 0)),
      arc = this.ribbon(
        [
          start,
          start
            .clone()
            .lerp(end, 0.5)
            .add(new T.Vector3(0, 0.8, 0.7)),
          end,
        ],
        '#db9163',
        0.065,
      );
    const glyph = this.glyph('反', '#e6b27d', 0.8);
    glyph.position.copy(start).y += 1;
    this.root.add(glyph);
    this.tracks.push((p) => {
      const delay = (index * 0.03) / Math.max(1, this.reactions.length - 1);
      const t = clamp((p - 0.64 - delay) / 0.19);
      shield.visible = p > 0.46 && p < 0.7;
      arc.visible = t > 0.18 && t < 0.85;
      glyph.visible = t > 0 && t < 1;
      if (t > 0 && t < 1) {
        actor.model.position.copy(actor.home).lerp(target.home, Math.sin(t * Math.PI) * 0.32);
        actor.model.userData.rig.right.rotation.x = -Math.sin(t * Math.PI) * 1.4;
      } else if (p > 0.9) {
        actor.model.position.copy(actor.home);
        actor.model.userData.rig.right.rotation.x = 0;
      }
    });
  }
  glyph(text, color, width = 1, height = width) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.font = 'bold 86px KaiTi, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 68, 108);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    const sprite = new T.Sprite(
      new T.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    );
    sprite.scale.set(width, height, 1);
    return sprite;
  }
  material(color, opacity = 0.8, wireframe = false) {
    const mat = new T.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: T.NormalBlending,
      depthWrite: false,
      toneMapped: false,
      side: T.DoubleSide,
      wireframe,
    });
    mat.userData.opacity = opacity;
    this.materials.push(mat);
    return mat;
  }
  mesh(type, args, material, parent = this.root) {
    const mesh = new T.Mesh(this.v.geo(type, args), material);
    parent.add(mesh);
    return mesh;
  }
  ring(point, color, radius = 1) {
    const mesh = this.mesh('TorusGeometry', [1, 0.035, 6, 48], this.material(color));
    mesh.position.copy(point);
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.setScalar(radius);
    return mesh;
  }
  ribbon(points, color, radius = 0.035) {
    const curve = new T.CatmullRomCurve3(points);
    const mesh = new T.Mesh(new T.TubeGeometry(curve, 32, radius, 5, false), this.material(color, 0.7));
    mesh.userData.ownedGeometry = true;
    this.root.add(mesh);
    return mesh;
  }
  afterimages() {
    const count = this.v.quality === 'low' ? 1 : 3;
    for (let i = 0; i < count; i++) {
      const ghost = this.v.warrior(this.presentation.color, [], [], 0, this.unit.troop);
      const material = this.material(this.presentation.color, 0.15 + i * 0.035);
      ghost.traverse((o) => {
        if (o.isMesh) o.material = material;
      });
      ghost.rotation.copy(this.actor.model.rotation);
      ghost.scale.copy(this.actor.model.scale);
      this.root.add(ghost);
      this.tracks.push((p) => {
        const t = smooth((p - 0.2 - i * 0.045) / 0.28);
        ghost.visible = p > 0.22 + i * 0.045 && p < 0.65;
        ghost.position.lerpVectors(this.origin, this.approach, t);
        ghost.userData.rig.right.rotation.x = Math.sin(p * 14 - i * 0.5);
      });
    }
  }
  impact(point, color, index) {
    const count = this.v.quality === 'low' ? 5 : 10 + Math.max(0, this.style.weaponQuality) * 2;
    for (let i = 0; i < count; i++) {
      const shard = this.mesh('TetrahedronGeometry', [0.09], this.material(i % 3 ? color : '#f2dfb8', 0.85));
      const angle = i * 2.399 + index + this.style.tilt;
      this.tracks.push((p) => {
        const t = clamp((p - 0.43) / 0.32);
        shard.visible = p > 0.43 && p < 0.8;
        shard.position.set(
          point.x + Math.cos(angle) * t * 2,
          point.y + Math.sin(t * Math.PI) * (1 + (i % 3) * 0.35),
          point.z + Math.sin(angle) * t * 2,
        );
        shard.scale.setScalar(1 - t);
        shard.rotation.set(t * 8, angle, t * 5);
      });
    }
  }
  aura(point, color, kind) {
    if (kind === 'shield') {
      const bubble = this.mesh('SphereGeometry', [1, 16, 10], this.material(color, 0.25, true));
      bubble.position.copy(point).y += 1.4;
      bubble.scale.set(1.2, 1.8, 1.2);
      this.tracks.push((p) => {
        bubble.visible = p > 0.25;
        bubble.rotation.y = p * 2;
      });
    } else
      for (let i = 0; i < 8; i++) {
        const spark = this.mesh('OctahedronGeometry', [0.09], this.material(color));
        this.tracks.push((p) => {
          const t = clamp((p - 0.2) / 0.8),
            a = (i * Math.PI) / 4 + t * 5;
          spark.visible = p > 0.2;
          spark.position.set(
            point.x + Math.cos(a),
            point.y + 0.3 + t * 3 + (i % 2) * 0.25,
            point.z + Math.sin(a),
          );
        });
      }
  }
  makeEffect(unit, index) {
    const v = this.v,
      point = v.battleModels
        .get(unit.id)
        .home.clone()
        .add(new T.Vector3(0, 2.1, 0));
    const { effect, color, hits } = this.presentation;
    const ground = point.clone();
    ground.y = 0.2;
    if (unit.side !== this.unit.side) this.impact(point, color, index);
    const phase = (p) => clamp((p - 0.22) / 0.55);
    const controlled =
      this.after.battle?.units
        .find((u) => u.id === unit.id)
        ?.statuses.filter((x) => ['stun', 'disarm'].includes(x.kind)) || [];
    for (const status of controlled) {
      for (let i = 0; i < 3; i++) {
        const mark = this.mesh(
          status.kind === 'stun' ? 'OctahedronGeometry' : 'BoxGeometry',
          status.kind === 'stun' ? [0.17] : [0.08, 0.85, 0.05],
          this.material(status.kind === 'stun' ? '#b9a7ef' : '#91cbdd', 0.85),
        );
        this.tracks.push((p) => {
          const angle = (i * Math.PI * 2) / 3 + p * 4;
          mark.visible = p > 0.45;
          mark.position.set(
            point.x + Math.cos(angle) * 0.75,
            point.y + (status.kind === 'stun' ? 0.7 : 0),
            point.z + Math.sin(angle) * 0.75,
          );
          mark.rotation.z = status.kind === 'stun' ? p * 5 : (Math.PI / 4) * (i % 2 ? -1 : 1);
        });
      }
    }
    if (['counter', 'recover'].includes(effect)) {
      const shape = this.mesh(
        'RingGeometry',
        [0.6, 0.78, effect === 'counter' ? 6 : 3],
        this.material(color, 0.7),
      );
      shape.position.copy(point);
      shape.rotation.y = Math.PI / 2;
      const seal = this.glyph(effect === 'counter' ? '御' : '解', color, 0.8);
      seal.position.copy(point);
      this.root.add(seal);
      this.tracks.push((p) => {
        shape.rotation.z = p * 2;
        shape.scale.setScalar(0.5 + Math.sin(p * Math.PI));
        seal.visible = p > 0.2 && p < 0.85;
      });
    } else if (['slash', 'crescent', 'axe', 'blades'].includes(effect)) {
      const count = Math.max(hits, effect === 'blades' ? 3 : effect === 'crescent' ? 2 : 1);
      for (let i = 0; i < count; i++) {
        const slash = this.mesh('TorusGeometry', [1, 0.065, 8, 40, Math.PI * 1.45], this.material(color));
        slash.position.copy(point);
        slash.scale.setScalar(1.25 + i * 0.22);
        slash.rotation.set(effect === 'axe' ? 0 : this.style.tilt, i * 0.65 + this.style.sweep, i);
        this.tracks.push((p) => {
          const t = phase(p);
          const strike = clamp((p - 0.28 - i * 0.08) / 0.32);
          slash.visible = strike > 0 && strike < 1;
          slash.rotation.z = -1.7 + t * 5 + i * 1.6;
          slash.scale.setScalar((1.5 + i * 0.2) * Math.sin(Math.PI * strike));
        });
      }
    } else if (effect === 'arrows') {
      for (let i = 0; i < Math.max(3, hits * 3); i++) {
        const arrow = new T.Group();
        this.root.add(arrow);
        const mat = this.material(color);
        this.mesh('CylinderGeometry', [0.025, 0.025, 1.1, 6], mat, arrow);
        const tip = this.mesh('ConeGeometry', [0.08, 0.22, 5], mat, arrow);
        tip.position.y = 0.65;
        this.tracks.push((p) => {
          const t = clamp((p - 0.18 - i * 0.025) / 0.4);
          arrow.visible = t > 0 && t < 1;
          const start = this.origin.clone().add(new T.Vector3(0, 2.1, (i - 1) * 0.15));
          arrow.position.lerpVectors(start, point, t);
          arrow.position.y += Math.sin(t * Math.PI) * this.style.arc;
          arrow.position.z +=
            Math.sin(t * Math.PI) *
            (this.style.path === 0
              ? (i - 1) * 0.7
              : this.style.path === 1
                ? 0
                : Math.sin(t * Math.PI * (this.style.path === 2 ? 2 : 4)) * 0.8);
          const direction = point.clone().sub(start);
          direction.y += Math.cos(t * Math.PI) * Math.PI * this.style.arc;
          arrow.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
        });
      }
    } else if (['charge', 'lance', 'dash', 'ambush'].includes(effect)) {
      if (effect === 'dash' || effect === 'ambush') {
        for (const flank of effect === 'ambush' ? [-1, 1] : [1]) {
          const path = this.ribbon(
            [
              this.origin.clone().add(new T.Vector3(0, 1, 0)),
              this.origin
                .clone()
                .lerp(point, 0.35)
                .add(new T.Vector3(0, 0.5, flank * this.style.arc)),
              this.origin
                .clone()
                .lerp(point, 0.7)
                .add(new T.Vector3(0, 0, -flank * this.style.arc * 0.4)),
              point,
            ],
            color,
            effect === 'ambush' ? 0.055 : 0.085,
          );
          this.tracks.push((p) => {
            path.visible = p > 0.28 && p < 0.66;
          });
        }
      }
      for (let i = 0; i < 18; i++) {
        const trail = this.mesh('OctahedronGeometry', [0.12], this.material(color, 0.8));
        this.tracks.push((p) => {
          const t = clamp((p - 0.18) / 0.46),
            along = clamp(t - i * 0.024);
          trail.visible = p > 0.2 && p < 0.86;
          trail.position.lerpVectors(this.origin, point, along);
          trail.position.y += 1 + Math.sin(i * 0.7 + p * 15) * 0.4;
          trail.scale.setScalar((1 - i / 22) * Math.sin(p * Math.PI));
        });
      }
      if (effect === 'lance') {
        const beam = this.ribbon(
          [
            this.origin.clone().add(new T.Vector3(0, 1.4, 0)),
            point.clone().add(new T.Vector3(0, 0.1, 0)),
            point.clone().add(new T.Vector3(this.unit.side ? -1.8 : 1.8, 0.1, 0)),
          ],
          color,
          0.1,
        );
        this.tracks.push((p) => {
          beam.visible = p > 0.35 && p < 0.64;
        });
      } else {
        for (let i = 0; i < (this.v.quality === 'low' ? 4 : 12); i++) {
          const dust = this.mesh('IcosahedronGeometry', [0.22, 0], this.material('#bcab82', 0.35));
          this.tracks.push((p) => {
            const t = clamp((p - 0.22 - i * 0.015) / 0.4);
            dust.visible = p > 0.22 && p < 0.8;
            dust.position.lerpVectors(this.origin, this.approach, i / 12);
            dust.position.z += Math.sin(i * 4) * t;
            dust.position.y = 0.15 + t * 0.5;
            dust.scale.setScalar(Math.sin(t * Math.PI) * 2);
          });
        }
      }
    } else if (effect === 'fire') {
      for (let i = 0; i < 10; i++) {
        const flame = this.mesh(
          'ConeGeometry',
          [0.32, 1.6, 5],
          this.material(i % 2 ? color : '#ffe4a0', 0.65),
        );
        const angle = i * 2.399;
        this.tracks.push((p) => {
          const t = phase(p);
          flame.visible = p > 0.25;
          flame.position.set(
            point.x + Math.cos(angle) * (0.5 + t),
            0.6 + Math.sin(t * Math.PI) * (i % 3) * 0.4,
            point.z + Math.sin(angle) * (0.5 + t),
          );
          flame.scale.set(0.8, Math.sin(t * Math.PI) * (1 + (i % 3) * 0.45), 0.8);
          flame.rotation.y = p * 8 + i;
        });
      }
    } else if (effect === 'storm') {
      for (let k = 0; k < 3; k++) {
        const positions = [];
        for (let i = 0; i < 7; i++)
          positions.push(
            point.x + Math.sin(i * 7.3 + k * 4) * (0.3 + k * 0.2),
            7 - i * 0.9,
            point.z + Math.cos(i * 3 + k) * 0.25,
          );
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
        const mat = new T.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
          blending: T.AdditiveBlending,
          depthWrite: false,
        });
        mat.userData.opacity = 1;
        this.materials.push(mat);
        const bolt = new T.Line(geo, mat);
        bolt.userData.ownedGeometry = true;
        this.root.add(bolt);
        this.tracks.push((p) => {
          bolt.visible = p > 0.3 + k * 0.07 && p < 0.65 + k * 0.07;
        });
      }
    } else if (effect === 'ice') {
      for (let i = 0; i < (this.v.quality === 'low' ? 5 : 11); i++) {
        const crystal = this.mesh(
          'OctahedronGeometry',
          [0.5],
          this.material(i % 2 ? color : '#d5f3ff', 0.75),
        );
        const angle = i * 2.399;
        this.tracks.push((p) => {
          const rise = smooth((p - 0.22 - i * 0.012) / 0.3),
            shatter = clamp((p - 0.58) / 0.28);
          crystal.visible = p > 0.2 && p < 0.88;
          crystal.position.set(
            point.x + Math.cos(angle) * (0.7 + shatter * 1.4),
            0.15 + rise * (0.8 + (i % 3) * 0.3) + Math.sin(shatter * Math.PI),
            point.z + Math.sin(angle) * (0.7 + shatter * 1.4),
          );
          crystal.scale.set(
            0.6 * (1 - shatter),
            (1.2 + (i % 3) * 0.6) * rise * (1 - shatter),
            0.6 * (1 - shatter),
          );
          crystal.rotation.z = Math.cos(angle) * (0.2 + shatter);
        });
      }
    } else if (effect === 'wind') {
      for (let k = 0; k < (this.v.quality === 'low' ? 2 : 5); k++) {
        const points = Array.from({ length: 30 }, (_, i) => {
          const t = i / 29,
            a = t * Math.PI * 4 + k * 1.25;
          return new T.Vector3(
            point.x + Math.cos(a) * (1.6 - t * 0.8),
            0.3 + t * 3.7,
            point.z + Math.sin(a) * (1.6 - t * 0.8),
          );
        });
        const ribbon = this.ribbon(points, k % 2 ? '#d7f8ec' : color, 0.035);
        this.tracks.push((p) => {
          ribbon.visible = p > 0.24 && p < 0.88;
          ribbon.position.y = Math.sin(phase(p) * Math.PI) * 0.4;
        });
      }
    } else if (effect === 'quake') {
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const points = Array.from(
          { length: 5 },
          (_, j) =>
            new T.Vector3(
              point.x + Math.cos(angle + Math.sin(j * 3) * 0.15) * j * 0.65,
              0.12,
              point.z + Math.sin(angle + Math.sin(j * 3) * 0.15) * j * 0.65,
            ),
        );
        const crack = this.ribbon(points, color, 0.045);
        const rock = this.mesh('DodecahedronGeometry', [0.3, 0], this.material('#ae9b7f'));
        this.tracks.push((p) => {
          const t = clamp((p - 0.35 - i * 0.018) / 0.4);
          crack.visible = t > 0 && p < 0.84;
          rock.visible = t > 0 && t < 1;
          rock.position.set(
            point.x + Math.cos(angle) * (0.7 + t),
            Math.sin(t * Math.PI) * (0.8 + (i % 3) * 0.5),
            point.z + Math.sin(angle) * (0.7 + t),
          );
          rock.rotation.set(t * 5, angle, t * 2);
          rock.scale.setScalar(1 - t * 0.6);
        });
      }
    } else if (['formation', 'scroll', 'talisman', 'chains'].includes(effect)) {
      const group = new T.Group();
      group.position.copy(ground);
      this.root.add(group);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const bar = this.mesh('BoxGeometry', [0.55, 0.04, 0.12], this.material(color), group);
        bar.position.set(Math.cos(a) * 1.6, 0.12, Math.sin(a) * 1.6);
        bar.rotation.y = -a;
        const rune = this.glyph(this.presentation.name[i % this.presentation.name.length], color, 0.45, 0.5);
        rune.position.set(Math.cos(a) * 1.6, 0.8, Math.sin(a) * 1.6);
        group.add(rune);
      }
      const outer = this.ring(ground, color, 1.8);
      this.tracks.push((p) => {
        group.visible = p > 0.18;
        group.rotation.y = p * 3;
        group.scale.setScalar(0.35 + Math.sin(p * Math.PI));
        outer.rotation.z = -p * 3;
      });
    } else if (['shield', 'barrier'].includes(effect)) {
      this.aura(ground, color, 'shield');
      for (let i = 0; i < 5; i++) {
        const pillar = this.mesh('BoxGeometry', [0.18, 2.5, 0.12], this.material(color, 0.5));
        pillar.position.set(point.x + Math.cos(i * 1.26) * 1.1, 1.4, point.z + Math.sin(i * 1.26) * 1.1);
        this.tracks.push((p) => {
          pillar.visible = p > 0.22;
          pillar.scale.y = Math.sin(phase(p) * Math.PI);
        });
      }
    } else if (['heal', 'tide', 'banner'].includes(effect)) {
      this.aura(ground, color, 'heal');
      const origin = this.origin.clone().add(new T.Vector3(0, 2, 0));
      const ribbon = this.ribbon(
        [
          origin,
          origin
            .clone()
            .lerp(point, 0.5)
            .add(new T.Vector3(0, 2.5, 0)),
          point,
        ],
        color,
        0.06,
      );
      this.tracks.push((p) => {
        ribbon.visible = p > 0.2 && p < 0.76;
      });
      if (effect === 'banner') {
        const banner = this.glyph('令', color, 1.3, 1.6);
        banner.position.copy(point).y += 1.8;
        this.root.add(banner);
        this.tracks.push((p) => {
          banner.position.y = 3 + Math.sin(p * Math.PI) * 0.7;
        });
      }
    } else if (['poison', 'mist'].includes(effect)) {
      for (let i = 0; i < 9; i++) {
        const cloud = this.mesh('IcosahedronGeometry', [0.6, 1], this.material(color, 0.22));
        this.tracks.push((p) => {
          const t = phase(p),
            a = i * 2.399 + p * 2;
          cloud.visible = p > 0.22;
          cloud.position.set(
            point.x + Math.cos(a) * (1 - t * 0.3),
            0.4 + t * (1 + (i % 3)),
            point.z + Math.sin(a),
          );
          cloud.scale.setScalar(0.5 + Math.sin(t * Math.PI) * 0.8);
        });
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const wave = this.ring(ground, color);
        this.tracks.push((p) => {
          const t = clamp((p - 0.23 - i * 0.06) / 0.6);
          wave.visible = p > 0.23;
          wave.scale.setScalar(0.2 + t * 3);
        });
      }
      if (effect === 'tiger') {
        const glyph = this.glyph('虎', color, 2, 2);
        glyph.position.copy(point).y += 1;
        this.root.add(glyph);
        this.tracks.push((p) => {
          glyph.material.opacity = Math.sin(p * Math.PI);
        });
      }
    }
  }
  tick(time) {
    const p = clamp((time - this.started) / this.duration);
    this.v.container.dataset.combatEffect = this.presentation.effect;
    this.v.container.dataset.fighterStyle = String(this.style.id);
    this.v.container.dataset.weaponQuality = String(this.style.weaponQuality);
    this.v.container.dataset.combatStage =
      this.reactions.length && p >= 0.69 && p < 0.8
        ? 'counter'
        : p < 0.22
          ? 'windup'
          : p < 0.45
            ? 'approach'
            : p < 0.72
              ? 'impact'
              : 'recover';
    const returnStart = this.reactions.length ? 0.5 : 0.72;
    const returnDuration = this.reactions.length ? 0.16 : 0.28;
    const travel = p < 0.45 ? smooth((p - 0.18) / 0.27) : 1 - smooth((p - returnStart) / returnDuration);
    if (this.melee) this.actor.model.position.lerpVectors(this.origin, this.approach, travel);
    if (this.melee) {
      const bend = Math.sin(travel * Math.PI);
      this.actor.model.position.z +=
        bend *
        (this.style.path === 0
          ? 0
          : this.style.path === 1
            ? this.style.sweep
            : this.style.path === 2
              ? -this.style.arc
              : Math.sin(travel * Math.PI * 2) * this.style.arc);
      this.actor.model.position.y += this.style.stance === 2 ? bend * 0.7 : 0;
    }
    const swing =
      p < 0.28
        ? -smooth(p / 0.28) * 1.4
        : Math.sin(clamp((p - 0.28) / 0.44) * Math.PI * 2 * this.presentation.hits) * 1.2;
    this.rig.right.rotation.x = swing;
    this.rig.right.rotation.z = Math.sin(p * Math.PI * 2) * this.style.sweep;
    this.rig.right.rotation.y = this.style.stance === 3 ? Math.sin(p * Math.PI) * 1.2 : 0;
    this.rig.left.rotation.x = this.melee ? -swing * 0.4 : -0.9 * Math.sin(p * Math.PI);
    this.rig.legs.forEach((leg, i) => {
      leg.rotation.x = this.melee ? Math.sin(p * 26 + i * Math.PI) * 0.32 * travel : 0;
    });
    for (const result of this.after.combatEvent.units) {
      const old = this.before.battle.units.find((x) => x.id === result.id),
        entry = this.v.battleModels.get(result.id);
      if (!entry || entry === this.actor || result.hp >= old.hp) continue;
      const impact = clamp((p - 0.43) / 0.23);
      entry.model.position.x = entry.home.x + (p > 0.43 && p < 0.72 ? Math.sin(p * 95) * 0.1 : 0);
      if (result.hp === 0) {
        if (old.gid === -2) entry.model.scale.y = 1 - impact * 0.85;
        else entry.model.rotation.z = impact * Math.PI * 0.48;
      }
    }
    if (p >= (this.reactions.length ? 0.87 : 0.5) && !this.impacted) {
      this.impacted = true;
      this.v.refreshBattleUnits(
        {
          ...this.before,
          battle: {
            ...this.before.battle,
            units: this.before.battle.units.map((u) => ({
              ...u,
              ...this.after.combatEvent.units.find((x) => x.id === u.id),
            })),
          },
        },
        false,
      );
    }
    this.tracks.forEach((update) => update(p));
    this.materials.forEach((m) => {
      m.opacity = m.userData.opacity * Math.min(1, p * 7, (1 - p) * 5);
    });
    return p === 1;
  }
  dispose() {
    this.actor.model.position.copy(this.origin);
    this.actor.model.rotation.copy(this.actorRotation);
    this.rig.right.rotation.set(0, 0, 0);
    this.rig.left.rotation.set(0, 0, 0);
    this.rig.legs.forEach((leg) => leg.rotation.set(0, 0, 0));
    this.root.traverse((o) => {
      if (o.userData.ownedGeometry) o.geometry.dispose();
    });
    this.v.clearDynamic(this.root);
    this.materials.forEach((m) => m.dispose());
    this.root.removeFromParent();
    delete this.v.container.dataset.combatStage;
    delete this.v.container.dataset.combatEffect;
    delete this.v.container.dataset.fighterStyle;
    delete this.v.container.dataset.weaponQuality;
    for (const reaction of this.reactions) {
      const actor = this.v.battleModels.get(reaction.actor);
      actor.model.position.copy(actor.home);
      actor.model.rotation.copy(actor.rotation);
      actor.model.userData.rig.right.rotation.set(0, 0, 0);
    }
  }
}
