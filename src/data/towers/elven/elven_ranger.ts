/**
 * Elven Ranger Tower
 * Holy damage with long range and fast arrows
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elvenColors = getRaceColors(TowerRace.Elven);

export const elvenRanger: TowerDefinition = {
  id: 'elven_ranger',
  name: 'Elven Ranger',
  race: TowerRace.Elven,
  description: 'Swift elven archer with blessed arrows and superior range',
  loreText: 'Guardians of the ancient forests, their arrows carry the light of the Sunwell',

  baseCost: 75,
  baseDamage: 9,
  baseAttackSpeed: 1.1,
  baseRange: 170,
  damageType: DamageType.Holy,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 4,
  rangePerLevel: 15,
  attackSpeedPerLevel: 0.1,
  maxLevel: 10,

  abilities: ['blessed_arrows', 'purifying_light'],
  targetPriority: TargetPriority.First,
  projectileType: ProjectileType.Arrow,
  projectileSpeed: 450,

  spriteKey: 'tower_elven_ranger',

  visual: {
    shapes: [
      // Tree trunk base
      {
        type: 'polygon',
        points: [-14, 14, 14, 14, 10, -6, -10, -6],
        fill: elvenColors.dark,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Tree body
      {
        type: 'rect',
        width: 14,
        height: 30,
        centered: true,
        offset: { x: 0, y: -10 },
        fill: elvenColors.secondary,
        stroke: elvenColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Leaf canopy
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: -28 },
        fill: elvenColors.primary,
        fillAlpha: 0.9,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 2,
      },
      // Golden glow core
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: -28 },
        fill: elvenColors.accent,
        fillAlpha: 0.7,
        layer: 3,
        pulseSpeed: 1.5,
      },
      // Arrow flash (when attacking)
      {
        type: 'star',
        points: 4,
        radius: 10,
        innerRadius: 4,
        offset: { x: 0, y: -28 },
        fill: elvenColors.accent,
        fillAlpha: 0.8,
        layer: 4,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: elvenColors.primary,
      alpha: 0.12,
      showAlways: false,
    },
  },
};
