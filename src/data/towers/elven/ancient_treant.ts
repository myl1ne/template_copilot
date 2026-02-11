/**
 * Elven Ancient Treant Tower
 * Splash damage with root (stun) chance
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elvenColors = getRaceColors(TowerRace.Elven);

export const ancientTreant: TowerDefinition = {
  id: 'ancient_treant',
  name: 'Ancient Treant',
  race: TowerRace.Elven,
  description: 'A living tree that hurls boulders and roots enemies',
  loreText: 'Ancient guardians of the forest who have stood watch for millennia',

  baseCost: 200,
  baseDamage: 40,
  baseAttackSpeed: 0.4,
  baseRange: 200,
  damageType: DamageType.Holy,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 16,
  rangePerLevel: 12,
  attackSpeedPerLevel: 0.04,
  maxLevel: 10,

  abilities: ['entangling_roots', 'natures_wrath'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 250,

  spriteKey: 'tower_ancient_treant',

  visual: {
    shapes: [
      // Root base
      {
        type: 'polygon',
        points: [-16, 14, -18, 4, -10, -4, 10, -4, 18, 4, 16, 14],
        fill: 0x443322,
        stroke: 0x332211,
        strokeWidth: 2,
        layer: 0,
      },
      // Tree trunk
      {
        type: 'rect',
        width: 16,
        height: 32,
        centered: true,
        offset: { x: 0, y: -14 },
        fill: 0x664433,
        stroke: 0x442211,
        strokeWidth: 2,
        layer: 1,
      },
      // Left branch
      {
        type: 'line',
        x1: -4,
        y1: -20,
        x2: -16,
        y2: -30,
        stroke: 0x664433,
        strokeWidth: 4,
        layer: 2,
      },
      // Right branch
      {
        type: 'line',
        x1: 4,
        y1: -18,
        x2: 14,
        y2: -28,
        stroke: 0x664433,
        strokeWidth: 4,
        layer: 2,
      },
      // Canopy
      {
        type: 'circle',
        radius: 18,
        offset: { x: 0, y: -34 },
        fill: elvenColors.primary,
        fillAlpha: 0.8,
        stroke: elvenColors.secondary,
        strokeWidth: 2,
        layer: 3,
      },
      // Face eyes
      {
        type: 'circle',
        radius: 2,
        offset: { x: -4, y: -12 },
        fill: elvenColors.accent,
        fillAlpha: 0.8,
        layer: 4,
        pulseSpeed: 1.0,
      },
      {
        type: 'circle',
        radius: 2,
        offset: { x: 4, y: -12 },
        fill: elvenColors.accent,
        fillAlpha: 0.8,
        layer: 4,
        pulseSpeed: 1.0,
      },
      // Throw flash (when attacking)
      {
        type: 'star',
        points: 5,
        radius: 12,
        innerRadius: 6,
        offset: { x: 0, y: -34 },
        fill: elvenColors.accent,
        fillAlpha: 0.6,
        layer: 5,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: elvenColors.primary,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
