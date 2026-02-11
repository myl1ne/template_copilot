/**
 * Elven Sunbeam Spire Tower
 * Very long range, high damage single target holy tower
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elvenColors = getRaceColors(TowerRace.Elven);

export const sunbeamSpire: TowerDefinition = {
  id: 'sunbeam_spire',
  name: 'Sunbeam Spire',
  race: TowerRace.Elven,
  description: 'Tall spire that channels devastating beams of holy light',
  loreText: 'Towering spires that focus the sun itself into a weapon of purification',

  baseCost: 300,
  baseDamage: 80,
  baseAttackSpeed: 0.3,
  baseRange: 250,
  damageType: DamageType.Holy,

  upgradeCostMultiplier: 1.8,
  damagePerLevel: 30,
  rangePerLevel: 15,
  attackSpeedPerLevel: 0.03,
  maxLevel: 10,

  abilities: ['divine_judgment', 'holy_nova'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Laser,
  projectileSpeed: 0,

  spriteKey: 'tower_sunbeam_spire',

  visual: {
    shapes: [
      // Stone foundation
      {
        type: 'rect',
        width: 24,
        height: 20,
        centered: true,
        fill: elvenColors.dark,
        fillAlpha: 0.9,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Tall spire body
      {
        type: 'polygon',
        points: [-10, 8, -6, -36, 0, -44, 6, -36, 10, 8],
        fill: 0xccccaa,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Gold band
      {
        type: 'rect',
        width: 14,
        height: 4,
        centered: true,
        offset: { x: 0, y: -20 },
        fill: 0xffcc00,
        fillAlpha: 0.8,
        layer: 2,
      },
      // Crystal tip
      {
        type: 'polygon',
        points: [-4, 0, 0, -10, 4, 0],
        offset: { x: 0, y: -44 },
        fill: 0xffffcc,
        fillAlpha: 0.9,
        stroke: 0xffcc00,
        strokeWidth: 1,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Sun glow at tip
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -48 },
        fill: 0xffff88,
        fillAlpha: 0.4,
        layer: 4,
        pulseSpeed: 2.5,
      },
      // Beam flash (when attacking)
      {
        type: 'star',
        points: 8,
        radius: 16,
        innerRadius: 6,
        offset: { x: 0, y: -48 },
        fill: 0xffffff,
        fillAlpha: 0.9,
        layer: 5,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: 0xffff88,
      alpha: 0.08,
      showAlways: false,
    },
  },
};
