/**
 * Elemental Frost Shard Tower
 * Ice damage with slowing effect
 */

import { TowerDefinition } from '../../../types/entities';
import { DamageType, TargetPriority, ProjectileType, TowerRace } from '../../../types/game';

export const frostShard: TowerDefinition = {
  id: 'frost_shard',
  name: 'Frost Shard',
  race: TowerRace.Elemental,
  description: 'Ice crystal that slows enemies with freezing projectiles',
  loreText: 'Shards of eternal ice that drain the warmth from all who pass',

  baseCost: 120,
  baseDamage: 12,
  baseAttackSpeed: 0.7,
  baseRange: 160,
  damageType: DamageType.Ice,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 5,
  rangePerLevel: 10,
  attackSpeedPerLevel: 0.06,
  maxLevel: 10,

  abilities: ['frostbite', 'flash_freeze'],
  targetPriority: TargetPriority.First,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 300,

  spriteKey: 'tower_frost_shard',

  visual: {
    shapes: [
      // Ice base
      {
        type: 'polygon',
        points: [-14, 12, 14, 12, 10, -4, -10, -4],
        fill: 0x1a3355,
        stroke: 0x0a1a33,
        strokeWidth: 2,
        layer: 0,
      },
      // Main crystal
      {
        type: 'polygon',
        points: [-8, 8, -10, -18, 0, -30, 10, -18, 8, 8],
        fill: 0x00ccff,
        fillAlpha: 0.7,
        stroke: 0x0088cc,
        strokeWidth: 2,
        layer: 1,
      },
      // Inner glow
      {
        type: 'polygon',
        points: [-4, 2, -5, -12, 0, -22, 5, -12, 4, 2],
        fill: 0x88eeff,
        fillAlpha: 0.5,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Frost particles (when attacking)
      {
        type: 'circle',
        radius: 4,
        offset: { x: -8, y: -20 },
        fill: 0xccffff,
        fillAlpha: 0.6,
        layer: 3,
        showWhenAttacking: true,
        rotateSpeed: 3.0,
      },
      {
        type: 'circle',
        radius: 3,
        offset: { x: 6, y: -24 },
        fill: 0xccffff,
        fillAlpha: 0.5,
        layer: 3,
        showWhenAttacking: true,
        rotateSpeed: -2.5,
      },
    ],
    rangeIndicator: {
      color: 0x00ccff,
      alpha: 0.12,
      showAlways: false,
    },
  },
};
