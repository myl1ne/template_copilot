/**
 * Mechanical Auto Turret Tower
 * Fast-firing void damage dealer
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const mechColors = getRaceColors(TowerRace.Mechanical);

export const autoTurret: TowerDefinition = {
  id: 'auto_turret',
  name: 'Auto Turret',
  race: TowerRace.Mechanical,
  description: 'Rapid-fire automated turret with void-infused rounds',
  loreText: 'Precision-engineered turrets powered by harvested void energy',

  baseCost: 75,
  baseDamage: 7,
  baseAttackSpeed: 1.5,
  baseRange: 130,
  damageType: DamageType.Void,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 3,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.15,
  maxLevel: 10,

  abilities: ['overdrive', 'void_rounds'],
  targetPriority: TargetPriority.Closest,
  projectileType: ProjectileType.Bullet,
  projectileSpeed: 500,

  spriteKey: 'tower_auto_turret',

  visual: {
    shapes: [
      // Hexagonal base plate
      {
        type: 'polygon',
        points: [-14, 8, -14, -8, 0, -16, 14, -8, 14, 8, 0, 16],
        fill: mechColors.dark,
        fillAlpha: 0.9,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Main turret body
      {
        type: 'rect',
        width: 20,
        height: 20,
        centered: true,
        offset: { x: 0, y: -6 },
        fill: mechColors.primary,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Barrel
      {
        type: 'rect',
        width: 6,
        height: 18,
        centered: true,
        offset: { x: 0, y: -20 },
        fill: mechColors.secondary,
        stroke: mechColors.dark,
        strokeWidth: 1,
        layer: 2,
        rotateSpeed: 0.5,
      },
      // Sensor light
      {
        type: 'circle',
        radius: 4,
        offset: { x: 0, y: -6 },
        fill: mechColors.accent,
        fillAlpha: 0.8,
        layer: 3,
        pulseSpeed: 3.0,
      },
      // Muzzle flash (when attacking)
      {
        type: 'star',
        points: 6,
        radius: 8,
        innerRadius: 3,
        offset: { x: 0, y: -30 },
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
