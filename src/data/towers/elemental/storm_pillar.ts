/**
 * Elemental Storm Pillar Tower
 * Lightning damage with chain lightning potential
 */

import { TowerDefinition } from '../../../types/entities';
import { DamageType, TargetPriority, ProjectileType, TowerRace } from '../../../types/game';

export const stormPillar: TowerDefinition = {
  id: 'storm_pillar',
  name: 'Storm Pillar',
  race: TowerRace.Elemental,
  description: 'Crackling pillar of lightning energy that chains to nearby enemies',
  loreText: 'Harnessing the fury of storms, these pillars arc devastating lightning',

  baseCost: 200,
  baseDamage: 30,
  baseAttackSpeed: 0.6,
  baseRange: 200,
  damageType: DamageType.Lightning,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 12,
  rangePerLevel: 12,
  attackSpeedPerLevel: 0.05,
  maxLevel: 10,

  abilities: ['chain_lightning', 'thunderstorm'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Laser,
  projectileSpeed: 0,

  spriteKey: 'tower_storm_pillar',

  visual: {
    shapes: [
      // Stone base
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 4 },
        fill: 0x444444,
        stroke: 0x222222,
        strokeWidth: 2,
        layer: 0,
      },
      // Pillar body
      {
        type: 'rect',
        width: 12,
        height: 36,
        centered: true,
        offset: { x: 0, y: -14 },
        fill: 0x555566,
        stroke: 0x333344,
        strokeWidth: 2,
        layer: 1,
      },
      // Lightning orb at top
      {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: -34 },
        fill: 0xffff00,
        fillAlpha: 0.8,
        stroke: 0xcccc00,
        strokeWidth: 2,
        layer: 2,
        pulseSpeed: 4.0,
      },
      // Inner spark
      {
        type: 'star',
        points: 6,
        radius: 6,
        innerRadius: 2,
        offset: { x: 0, y: -34 },
        fill: 0xffffff,
        fillAlpha: 0.9,
        layer: 3,
        rotateSpeed: 5.0,
      },
      // Lightning bolt (when attacking)
      {
        type: 'line',
        x1: -6,
        y1: -28,
        x2: 6,
        y2: -40,
        stroke: 0xffffff,
        strokeWidth: 3,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 12.0,
      },
    ],
    rangeIndicator: {
      color: 0xffff00,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
