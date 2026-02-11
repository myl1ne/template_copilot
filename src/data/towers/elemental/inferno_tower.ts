/**
 * Elemental Inferno Tower
 * Short range AoE fire damage aura
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elementalColors = getRaceColors(TowerRace.Elemental);

export const infernoTower: TowerDefinition = {
  id: 'inferno_tower',
  name: 'Inferno Tower',
  race: TowerRace.Elemental,
  description: 'Blazing tower that burns all nearby enemies with constant fire',
  loreText: 'A conduit to the plane of fire, scorching everything within reach',

  baseCost: 300,
  baseDamage: 5,
  baseAttackSpeed: 1.0,
  baseRange: 100,
  damageType: DamageType.Fire,

  upgradeCostMultiplier: 1.7,
  damagePerLevel: 3,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.1,
  maxLevel: 10,

  abilities: ['heat_aura', 'meltdown'],
  targetPriority: TargetPriority.Closest,
  projectileType: ProjectileType.None,
  projectileSpeed: 0,
  size: 2, // 2x2 tower (large fire structure)

  spriteKey: 'tower_inferno',

  visual: {
    shapes: [
      // Heat aura (always visible)
      {
        type: 'circle',
        radius: 22,
        offset: { x: 0, y: 0 },
        fill: elementalColors.primary,
        fillAlpha: 0.1,
        layer: 0,
        pulseSpeed: 1.5,
      },
      // Lava pool base
      {
        type: 'circle',
        radius: 16,
        offset: { x: 0, y: 4 },
        fill: elementalColors.dark,
        stroke: elementalColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Fire pillar
      {
        type: 'polygon',
        points: [-8, 6, -6, -20, 0, -28, 6, -20, 8, 6],
        fill: elementalColors.primary,
        fillAlpha: 0.9,
        stroke: elementalColors.secondary,
        strokeWidth: 1,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Inner flame
      {
        type: 'polygon',
        points: [-4, 2, -3, -14, 0, -20, 3, -14, 4, 2],
        fill: elementalColors.accent,
        fillAlpha: 0.8,
        layer: 3,
        pulseSpeed: 4.0,
      },
      // Flame burst 1 (when attacking)
      {
        type: 'circle',
        radius: 6,
        offset: { x: -10, y: -8 },
        fill: elementalColors.accent,
        fillAlpha: 0.6,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: 2.0,
      },
      // Flame burst 2 (when attacking)
      {
        type: 'circle',
        radius: 5,
        offset: { x: 8, y: -12 },
        fill: elementalColors.primary,
        fillAlpha: 0.5,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: -3.0,
      },
    ],
    rangeIndicator: {
      color: elementalColors.primary,
      alpha: 0.15,
      showAlways: false,
    },
  },
};
