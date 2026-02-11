/**
 * Human Catapult Tower
 * Slow, high-damage splash tower
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const humanColors = getRaceColors(TowerRace.Human);

export const catapult: TowerDefinition = {
  id: 'catapult',
  name: 'Catapult',
  race: TowerRace.Human,
  description: 'Slow siege weapon that launches explosive boulders',
  loreText: 'Ancient siege engines repurposed to defend the Nexus',

  baseCost: 250,
  baseDamage: 40,
  baseAttackSpeed: 0.3,
  baseRange: 200,
  damageType: DamageType.Physical,

  upgradeCostMultiplier: 1.7,
  damagePerLevel: 15,
  rangePerLevel: 12,
  attackSpeedPerLevel: 0.03,
  maxLevel: 10,

  abilities: ['explosive_payload', 'firebomb'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Arrow,
  projectileSpeed: 200,
  size: 2, // 2x2 tower (large siege weapon)

  spriteKey: 'tower_catapult',

  visual: {
    shapes: [
      // Wide stone base
      {
        type: 'rect',
        width: 32,
        height: 20,
        centered: true,
        fill: humanColors.dark,
        fillAlpha: 0.9,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Wooden frame (stationary)
      {
        type: 'polygon',
        points: [-12, 6, -10, -16, 10, -16, 12, 6],
        fill: 0x664422,
        stroke: 0x442211,
        strokeWidth: 2,
        layer: 1,
      },
    ],
    // Rotating turret (arm and basket)
    turretShapes: [
      // Arm (rotates to face target)
      {
        type: 'rect',
        width: 4,
        height: 24,
        centered: true,
        offset: { x: 0, y: -22 },
        fill: 0x885533,
        stroke: 0x442211,
        strokeWidth: 2,
        layer: 2,
      },
      // Boulder basket
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -36 },
        fill: 0x888888,
        stroke: 0x555555,
        strokeWidth: 2,
        layer: 3,
      },
      // Launch flash (when attacking)
      {
        type: 'star',
        points: 5,
        radius: 14,
        innerRadius: 7,
        offset: { x: 0, y: -36 },
        fill: humanColors.accent,
        fillAlpha: 0.8,
        layer: 4,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: humanColors.secondary,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
