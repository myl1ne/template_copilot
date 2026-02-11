/**
 * Undead Shadow Archer Tower
 * Shadow damage specialist that targets the weakest enemies
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const undeadColors = getRaceColors(TowerRace.Undead);

export const shadowArcher: TowerDefinition = {
  id: 'shadow_archer',
  name: 'Shadow Archer',
  race: TowerRace.Undead,
  description: 'Spectral archer that drains the essence of the dying',
  loreText: 'Risen from fallen marksmen, these spectral archers sense weakness in their prey',

  baseCost: 75,
  baseDamage: 8,
  baseAttackSpeed: 1.2,
  baseRange: 140,
  damageType: DamageType.Shadow,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 4,
  rangePerLevel: 8,
  attackSpeedPerLevel: 0.08,
  maxLevel: 10,

  abilities: ['soul_siphon', 'death_mark'],
  targetPriority: TargetPriority.Weakest,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 350,

  spriteKey: 'tower_shadow_archer',

  visual: {
    shapes: [
      // Cracked stone base
      {
        type: 'rect',
        width: 26,
        height: 26,
        centered: true,
        fill: undeadColors.dark,
        fillAlpha: 0.9,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Tower body - bone pillar
      {
        type: 'rect',
        width: 16,
        height: 32,
        centered: true,
        offset: { x: 0, y: -6 },
        fill: undeadColors.secondary,
        stroke: undeadColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Skull head
      {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: -24 },
        fill: undeadColors.primary,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 2,
      },
      // Glowing eye
      {
        type: 'circle',
        radius: 4,
        offset: { x: 0, y: -26 },
        fill: undeadColors.accent,
        fillAlpha: 0.9,
        layer: 3,
        pulseSpeed: 2.5,
      },
      // Spectral bow (when attacking)
      {
        type: 'arc',
        radius: 14,
        startAngle: -Math.PI / 3,
        endAngle: Math.PI / 3,
        offset: { x: 0, y: -20 },
        stroke: undeadColors.accent,
        strokeWidth: 2,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 6.0,
      },
    ],
    rangeIndicator: {
      color: undeadColors.primary,
      alpha: 0.12,
      showAlways: false,
    },
  },
};
