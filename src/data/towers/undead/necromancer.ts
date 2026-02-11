/**
 * Undead Necromancer Tower
 * Shadow damage with on-kill healing aura
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const undeadColors = getRaceColors(TowerRace.Undead);

export const necromancer: TowerDefinition = {
  id: 'necromancer',
  name: 'Necromancer',
  race: TowerRace.Undead,
  description: 'Dark caster that grows stronger with each kill',
  loreText: 'Masters of death magic who harvest the souls of the fallen',

  baseCost: 175,
  baseDamage: 20,
  baseAttackSpeed: 0.6,
  baseRange: 180,
  damageType: DamageType.Shadow,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 8,
  rangePerLevel: 10,
  attackSpeedPerLevel: 0.05,
  maxLevel: 10,

  abilities: ['corpse_explosion', 'soul_harvest'],
  targetPriority: TargetPriority.Weakest,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 300,

  spriteKey: 'tower_necromancer',

  visual: {
    shapes: [
      // Dark stone base
      {
        type: 'rect',
        width: 26,
        height: 24,
        centered: true,
        fill: undeadColors.dark,
        fillAlpha: 0.9,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Robed body
      {
        type: 'polygon',
        points: [-12, 8, -8, -18, 0, -24, 8, -18, 12, 8],
        fill: undeadColors.secondary,
        stroke: undeadColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Hood/head
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -22 },
        fill: undeadColors.dark,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 2,
      },
      // Glowing eyes
      {
        type: 'circle',
        radius: 3,
        offset: { x: -3, y: -23 },
        fill: undeadColors.accent,
        fillAlpha: 0.9,
        layer: 3,
        pulseSpeed: 2.0,
      },
      {
        type: 'circle',
        radius: 3,
        offset: { x: 3, y: -23 },
        fill: undeadColors.accent,
        fillAlpha: 0.9,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Soul orb (when attacking)
      {
        type: 'circle',
        radius: 7,
        offset: { x: 0, y: -32 },
        fill: undeadColors.accent,
        fillAlpha: 0.7,
        layer: 4,
        showWhenAttacking: true,
        pulseSpeed: 6.0,
      },
    ],
    rangeIndicator: {
      color: undeadColors.accent,
      alpha: 0.12,
      showAlways: false,
    },
  },
};
