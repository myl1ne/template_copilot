/**
 * Human Barracks Tower
 * Close-range melee tower with fast attacks
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const humanColors = getRaceColors(TowerRace.Human);

export const barracks: TowerDefinition = {
  id: 'barracks',
  name: 'Barracks',
  race: TowerRace.Human,
  description: 'Close-range soldiers that engage enemies in melee combat',
  loreText: 'Battle-hardened soldiers trained to hold the line at any cost',

  baseCost: 150,
  baseDamage: 6,
  baseAttackSpeed: 2.0,
  baseRange: 80,
  damageType: DamageType.Physical,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 3,
  rangePerLevel: 5,
  attackSpeedPerLevel: 0.12,
  maxLevel: 10,

  abilities: ['rallying_cry', 'fortification'],
  targetPriority: TargetPriority.First,
  projectileType: ProjectileType.None,
  projectileSpeed: 0,

  spriteKey: 'tower_barracks',

  visual: {
    shapes: [
      // Fortified base
      {
        type: 'rect',
        width: 30,
        height: 28,
        centered: true,
        fill: humanColors.dark,
        fillAlpha: 0.9,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Main building
      {
        type: 'rect',
        width: 24,
        height: 20,
        centered: true,
        offset: { x: 0, y: -4 },
        fill: humanColors.primary,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Door
      {
        type: 'rect',
        width: 10,
        height: 12,
        centered: true,
        offset: { x: 0, y: 2 },
        fill: humanColors.dark,
        stroke: humanColors.secondary,
        strokeWidth: 1,
        layer: 2,
      },
      // Shield emblem
      {
        type: 'polygon',
        points: [-6, -4, 6, -4, 4, 6, 0, 8, -4, 6],
        offset: { x: 0, y: -14 },
        fill: humanColors.accent,
        fillAlpha: 0.7,
        stroke: humanColors.secondary,
        strokeWidth: 1,
        layer: 3,
      },
      // Sword flash (when attacking)
      {
        type: 'line',
        x1: -8,
        y1: 4,
        x2: 8,
        y2: -8,
        offset: { x: 0, y: -6 },
        stroke: 0xffffff,
        strokeWidth: 3,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 10.0,
      },
    ],
    rangeIndicator: {
      color: humanColors.primary,
      alpha: 0.15,
      showAlways: false,
    },
  },
};
