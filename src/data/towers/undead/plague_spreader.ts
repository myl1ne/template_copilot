/**
 * Undead Plague Spreader Tower
 * Shadow damage with poison DoT
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const undeadColors = getRaceColors(TowerRace.Undead);

export const plagueSpreader: TowerDefinition = {
  id: 'plague_spreader',
  name: 'Plague Spreader',
  race: TowerRace.Undead,
  description: 'Toxic tower that poisons enemies with lingering damage',
  loreText: 'Cauldrons of pestilence that spread disease across the battlefield',

  baseCost: 275,
  baseDamage: 15,
  baseAttackSpeed: 0.4,
  baseRange: 120,
  damageType: DamageType.Shadow,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 6,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.04,
  maxLevel: 10,

  abilities: ['plague_cloud', 'pandemic'],
  targetPriority: TargetPriority.First,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 250,

  spriteKey: 'tower_plague_spreader',

  visual: {
    shapes: [
      // Toxic pool
      {
        type: 'circle',
        radius: 16,
        offset: { x: 0, y: 6 },
        fill: 0x224400,
        fillAlpha: 0.4,
        stroke: 0x44ff00,
        strokeWidth: 1,
        layer: 0,
        pulseSpeed: 1.0,
      },
      // Cauldron body
      {
        type: 'arc',
        radius: 14,
        startAngle: 0,
        endAngle: Math.PI,
        offset: { x: 0, y: -2 },
        fill: undeadColors.secondary,
        stroke: undeadColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Bubbling liquid
      {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: -6 },
        fill: 0x44ff00,
        fillAlpha: 0.5,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Bubble 1
      {
        type: 'circle',
        radius: 3,
        offset: { x: -4, y: -10 },
        fill: 0x88ff44,
        fillAlpha: 0.6,
        layer: 3,
        pulseSpeed: 5.0,
      },
      // Bubble 2
      {
        type: 'circle',
        radius: 2,
        offset: { x: 4, y: -12 },
        fill: 0x88ff44,
        fillAlpha: 0.5,
        layer: 3,
        pulseSpeed: 4.0,
      },
      // Poison cloud (when attacking)
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: -16 },
        fill: 0x44ff00,
        fillAlpha: 0.3,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 6.0,
      },
    ],
    rangeIndicator: {
      color: 0x44ff00,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
