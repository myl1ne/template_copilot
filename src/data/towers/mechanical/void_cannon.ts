/**
 * Mechanical Void Cannon Tower
 * Massive single target void damage
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const mechColors = getRaceColors(TowerRace.Mechanical);

export const voidCannon: TowerDefinition = {
  id: 'void_cannon',
  name: 'Void Cannon',
  race: TowerRace.Mechanical,
  description: 'Devastating cannon that fires concentrated void energy',
  loreText: 'The pinnacle of void-tech weaponry, capable of erasing matter itself',

  baseCost: 350,
  baseDamage: 120,
  baseAttackSpeed: 0.2,
  baseRange: 180,
  damageType: DamageType.Void,

  upgradeCostMultiplier: 1.8,
  damagePerLevel: 45,
  rangePerLevel: 10,
  attackSpeedPerLevel: 0.02,
  maxLevel: 10,

  abilities: ['void_implosion', 'singularity'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.None,
  projectileSpeed: 0,

  spriteKey: 'tower_void_cannon',

  visual: {
    shapes: [
      // Heavy base
      {
        type: 'rect',
        width: 34,
        height: 24,
        centered: true,
        fill: mechColors.dark,
        fillAlpha: 0.95,
        stroke: mechColors.secondary,
        strokeWidth: 3,
        layer: 0,
      },
      // Cannon housing
      {
        type: 'rect',
        width: 24,
        height: 20,
        centered: true,
        offset: { x: 0, y: -8 },
        fill: mechColors.primary,
        stroke: mechColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Barrel
      {
        type: 'rect',
        width: 10,
        height: 26,
        centered: true,
        offset: { x: 0, y: -24 },
        fill: mechColors.secondary,
        stroke: mechColors.dark,
        strokeWidth: 2,
        layer: 2,
      },
      // Void energy core
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: -8 },
        fill: 0x220044,
        stroke: 0x6600cc,
        strokeWidth: 2,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Muzzle void glow
      {
        type: 'circle',
        radius: 7,
        offset: { x: 0, y: -38 },
        fill: 0x6600cc,
        fillAlpha: 0.5,
        layer: 4,
        pulseSpeed: 3.0,
      },
      // Void blast (when attacking)
      {
        type: 'star',
        points: 6,
        radius: 16,
        innerRadius: 6,
        offset: { x: 0, y: -38 },
        fill: 0x8800ff,
        fillAlpha: 0.9,
        layer: 5,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: 0x6600cc,
      alpha: 0.08,
      showAlways: false,
    },
  },
};
