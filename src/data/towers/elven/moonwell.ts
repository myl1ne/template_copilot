/**
 * Elven Moonwell Tower
 * Support tower with attack speed aura for nearby towers
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elvenColors = getRaceColors(TowerRace.Elven);

export const moonwell: TowerDefinition = {
  id: 'moonwell',
  name: 'Moonwell',
  race: TowerRace.Elven,
  description: 'Sacred pool that empowers nearby towers with moonlight',
  loreText: 'Blessed wells that channel the power of the moon to strengthen allies',

  baseCost: 150,
  baseDamage: 5,
  baseAttackSpeed: 0.5,
  baseRange: 100,
  damageType: DamageType.Holy,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 2,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.05,
  maxLevel: 10,

  abilities: ['moonlight_blessing', 'divine_shield'],
  targetPriority: TargetPriority.Closest,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 300,

  spriteKey: 'tower_moonwell',

  visual: {
    shapes: [
      // Support aura (subtle)
      {
        type: 'circle',
        radius: 20,
        offset: { x: 0, y: 0 },
        fill: elvenColors.accent,
        fillAlpha: 0.08,
        layer: 0,
        pulseSpeed: 1.0,
      },
      // Stone ring
      {
        type: 'circle',
        radius: 16,
        offset: { x: 0, y: 2 },
        fill: elvenColors.dark,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Water surface
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: 2 },
        fill: 0x4488cc,
        fillAlpha: 0.6,
        stroke: elvenColors.accent,
        strokeWidth: 1,
        layer: 2,
        pulseSpeed: 1.5,
      },
      // Moonlight reflection
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: 0 },
        fill: 0xffffcc,
        fillAlpha: 0.5,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Healing sparkle (when attacking)
      {
        type: 'star',
        points: 4,
        radius: 8,
        innerRadius: 3,
        offset: { x: 0, y: -4 },
        fill: elvenColors.accent,
        fillAlpha: 0.7,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: 2.0,
      },
    ],
    rangeIndicator: {
      color: elvenColors.accent,
      alpha: 0.15,
      showAlways: false,
    },
  },
};
