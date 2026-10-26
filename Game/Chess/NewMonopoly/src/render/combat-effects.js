import * as T from 'three';
import { skillFor } from '../data/skills.js';
import { CARDS } from '../data/game.js';
import { skillTargets } from '../core/combat.js';

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export function combatPresentation(command, before) {
  const b = before.battle,
    u = b.units.find((x) => x.id === b.order[b.cursor]);
  if (command.type === 'skill') return skillFor(u);
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
    };
  }
  return {
    name: u.troop === '弓' ? '引弓破敌' : u.troop === '骑' ? '铁骑冲锋' : '挥刃进击',
    effect: u.troop === '弓' ? 'arrows' : u.troop === '骑' ? 'charge' : 'slash',
    color: '#f0cc8c',
    hits: 1,
  };
}
export class CombatAnimation {
  constructor(v, command, before, after) {
    this.v = v;
    this.command = command;
    this.before = before;
    this.after = after;
    this.started = performance.now();
    this.duration = command.type === 'skill' ? 1750 : 1250;
    this.root = new T.Group();
    v.battleRoot.add(this.root);
    this.materials = [];
    this.tracks = [];
    this.presentation = combatPresentation(command, before);
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
      const skill = skillFor(this.unit);
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
    targets.filter(Boolean).forEach((u, i) => this.makeEffect(u, i));
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
          label.visible = p > 0.45;
          label.position.y = point.y + clamp((p - 0.45) / 0.55) * 1.5;
          label.material.opacity = 1 - clamp((p - 0.8) / 0.2);
        });
      }
      if (shield > 0) this.aura(entry.home, '#9ddff8', 'shield');
      if (hp > 0) this.aura(entry.home, '#9ff0c8', 'heal');
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
        .add(new T.Vector3(0, 1.5, 0));
    const { effect, color, hits } = this.presentation;
    const ground = point.clone();
    ground.y = 0.2;
    const ring = this.ring(ground, color);
    this.tracks.push((p) => {
      const t = clamp((p - 0.18) / 0.7);
      ring.visible = p > 0.18;
      ring.scale.setScalar(0.3 + t * 2.3);
      ring.rotation.z = p * (index + 1) * 2;
    });
    const phase = (p) => clamp((p - 0.22) / 0.55);
    if (['slash', 'crescent', 'axe', 'blades'].includes(effect)) {
      const count = effect === 'blades' ? 2 : effect === 'crescent' ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const slash = this.mesh('TorusGeometry', [1, 0.065, 8, 40, Math.PI * 1.45], this.material(color));
        slash.position.copy(point);
        slash.scale.setScalar(1.25 + i * 0.22);
        slash.rotation.set(effect === 'axe' ? 0 : Math.PI * 0.35, i * 0.65, i);
        this.tracks.push((p) => {
          const t = phase(p);
          slash.visible = p > 0.32 && p < 0.85;
          slash.rotation.z = -1.7 + t * 5 + i * 1.6;
          slash.scale.setScalar((1.1 + i * 0.2) * Math.sin(Math.PI * t));
        });
      }
    } else if (effect === 'arrows') {
      for (let i = 0; i < Math.max(2, hits + 1); i++) {
        const arrow = new T.Group();
        this.root.add(arrow);
        const mat = this.material(color);
        this.mesh('CylinderGeometry', [0.025, 0.025, 1.1, 6], mat, arrow);
        const tip = this.mesh('ConeGeometry', [0.08, 0.22, 5], mat, arrow);
        tip.position.y = 0.65;
        this.tracks.push((p) => {
          const t = clamp((p - 0.2 - i * 0.055) / 0.4);
          arrow.visible = t > 0 && t < 1;
          const start = this.origin.clone().add(new T.Vector3(0, 2.1, (i - 1) * 0.15));
          arrow.position.lerpVectors(start, point, t);
          arrow.position.y += Math.sin(t * Math.PI) * 2.5;
          const direction = point.clone().sub(start);
          direction.y += Math.cos(t * Math.PI) * Math.PI * 2.5;
          arrow.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
        });
      }
    } else if (['charge', 'lance', 'dash', 'ambush'].includes(effect)) {
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
          bolt.visible = p > 0.3 && p < 0.8 && (Math.floor(p * 30) + k) % 3 !== 0;
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
    this.v.container.dataset.combatStage =
      p < 0.22 ? 'windup' : p < 0.45 ? 'approach' : p < 0.72 ? 'impact' : 'recover';
    const travel = p < 0.45 ? smooth((p - 0.18) / 0.27) : 1 - smooth((p - 0.72) / 0.28);
    if (this.melee) this.actor.model.position.lerpVectors(this.origin, this.approach, travel);
    const swing =
      p < 0.28
        ? -smooth(p / 0.28) * 1.4
        : Math.sin(clamp((p - 0.28) / 0.44) * Math.PI * 2 * this.presentation.hits) * 1.2;
    this.rig.right.rotation.x = swing;
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
    if (p >= 0.5 && !this.impacted) {
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
  }
}
