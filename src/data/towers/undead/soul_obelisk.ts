/**
 * Undead Soul Drain Obelisk Tower
 * Shadow damage with armor shred on hit
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const undeadColors = getRaceColors(TowerRace.Undead);

export const soulObelisk: TowerDefinition = {
  id: 'soul_obelisk',
  name: 'Soul Drain Obelisk',
  race: TowerRace.Undead,
  description: 'Dark obelisk that weakens enemies on hit',
  loreText: 'Ancient monoliths that siphon the very essence from living creatures',

  baseCost: 225,
  baseDamage: 35,
  baseAttackSpeed: 0.5,
  baseRange: 150,
  damageType: DamageType.Shadow,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 14,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.04,
  maxLevel: 10,

  abilities: ['armor_shred', 'void_drain'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.None,
  projectileSpeed: 0,

  spriteKey: 'tower_soul_obelisk',

  visual: {
    shapes: [
      // Dark energy pool
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 4 },
        fill: undeadColors.dark,
        fillAlpha: 0.5,
        stroke: undeadColors.accent,
        strokeWidth: 1,
        layer: 0,
        pulseSpeed: 1.5,
      },
      // Obelisk body
      {
        type: 'polygon',
        points: [-10, 10, -6, -30, 6, -30, 10, 10],
        fill: undeadColors.secondary,
        stroke: undeadColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Rune glow 1
      {
        type: 'rect',
        width: 6,
        height: 4,
        centered: true,
        offset: { x: 0, y: -8 },
        fill: undeadColors.accent,
        fillAlpha: 0.6,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Rune glow 2
      {
        type: 'rect',
        width: 6,
        height: 4,
        centered: true,
        offset: { x: 0, y: -18 },
        fill: undeadColors.accent,
        fillAlpha: 0.6,
        layer: 2,
        pulseSpeed: 2.5,
      },
      // Soul drain beam (when attacking)
      {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: -30 },
        fill: undeadColors.accent,
        fillAlpha: 0.5,
        layer: 3,
        showWhenAttacking: true,
        pulseSpeed: 8.0,
      },
    ],
    rangeIndicator: {
      color: undeadColors.accent,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
