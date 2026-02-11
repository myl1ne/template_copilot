/**
 * Mechanical Missile Battery Tower
 * Void damage with splash
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const mechColors = getRaceColors(TowerRace.Mechanical);

export const missileBattery: TowerDefinition = {
  id: 'missile_battery',
  name: 'Missile Battery',
  race: TowerRace.Mechanical,
  description: 'Multi-barrel launcher that fires explosive void missiles',
  loreText: 'Automated missile platforms loaded with void-warhead ordinance',

  baseCost: 175,
  baseDamage: 25,
  baseAttackSpeed: 0.5,
  baseRange: 200,
  damageType: DamageType.Void,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 10,
  rangePerLevel: 12,
  attackSpeedPerLevel: 0.05,
  maxLevel: 10,

  abilities: ['cluster_missiles', 'emp_burst'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Bullet,
  projectileSpeed: 400,

  spriteKey: 'tower_missile_battery',

  visual: {
    shapes: [
      // Base platform
      {
        type: 'rect',
        width: 30,
        height: 22,
        centered: true,
        fill: mechColors.dark,
        fillAlpha: 0.9,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Launcher body
      {
        type: 'rect',
        width: 22,
        height: 18,
        centered: true,
        offset: { x: 0, y: -8 },
        fill: mechColors.primary,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Left barrel
      {
        type: 'rect',
        width: 4,
        height: 14,
        centered: true,
        offset: { x: -6, y: -20 },
        fill: mechColors.secondary,
        stroke: mechColors.dark,
        strokeWidth: 1,
        layer: 2,
      },
      // Right barrel
      {
        type: 'rect',
        width: 4,
        height: 14,
        centered: true,
        offset: { x: 6, y: -20 },
        fill: mechColors.secondary,
        stroke: mechColors.dark,
        strokeWidth: 1,
        layer: 2,
      },
      // Targeting light
      {
        type: 'circle',
        radius: 3,
        offset: { x: 0, y: -8 },
        fill: 0xff0000,
        fillAlpha: 0.8,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Launch flash (when attacking)
      {
        type: 'star',
        points: 4,
        radius: 10,
        innerRadius: 4,
        offset: { x: 0, y: -28 },
        fill: 0xffffff,
        fillAlpha: 0.9,
        layer: 4,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: mechColors.accent,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
