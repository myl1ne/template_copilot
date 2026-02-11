/**
 * Mechanical Tesla Coil Tower
 * Lightning damage with chain lightning
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const mechColors = getRaceColors(TowerRace.Mechanical);

export const teslaCoil: TowerDefinition = {
  id: 'tesla_coil',
  name: 'Tesla Coil',
  race: TowerRace.Mechanical,
  description: 'Electrical tower that zaps nearby enemies with chaining lightning',
  loreText: 'High-voltage coils that unleash devastating electrical arcs',

  baseCost: 225,
  baseDamage: 18,
  baseAttackSpeed: 0.8,
  baseRange: 160,
  damageType: DamageType.Lightning,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 8,
  rangePerLevel: 10,
  attackSpeedPerLevel: 0.08,
  maxLevel: 10,

  abilities: ['arc_chain', 'overcharge'],
  targetPriority: TargetPriority.Closest,
  projectileType: ProjectileType.Laser,
  projectileSpeed: 0,

  spriteKey: 'tower_tesla_coil',

  visual: {
    shapes: [
      // Metal base
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 4 },
        fill: mechColors.dark,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Coil body
      {
        type: 'rect',
        width: 10,
        height: 28,
        centered: true,
        offset: { x: 0, y: -10 },
        fill: mechColors.primary,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Coil ring 1
      {
        type: 'rect',
        width: 18,
        height: 3,
        centered: true,
        offset: { x: 0, y: -6 },
        fill: 0xcc8800,
        layer: 2,
      },
      // Coil ring 2
      {
        type: 'rect',
        width: 16,
        height: 3,
        centered: true,
        offset: { x: 0, y: -14 },
        fill: 0xcc8800,
        layer: 2,
      },
      // Electrode ball
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -28 },
        fill: mechColors.accent,
        fillAlpha: 0.8,
        stroke: 0xffff00,
        strokeWidth: 1,
        layer: 3,
        pulseSpeed: 5.0,
      },
      // Lightning arc (when attacking)
      {
        type: 'line',
        x1: -8,
        y1: -26,
        x2: -16,
        y2: -20,
        stroke: 0xffff00,
        strokeWidth: 3,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 15.0,
      },
      {
        type: 'line',
        x1: 8,
        y1: -26,
        x2: 16,
        y2: -20,
        stroke: 0xffff00,
        strokeWidth: 3,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 15.0,
      },
    ],
    rangeIndicator: {
      color: 0xffff00,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
