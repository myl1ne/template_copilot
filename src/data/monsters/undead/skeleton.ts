/**
 * Undead Skeleton - Medium all-rounder, weak to Holy
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const undeadColors = getMonsterColors('undead');

export const undeadSkeleton: MonsterDefinition = {
  id: 'undead_skeleton',
  name: 'Undead Skeleton',
  description: 'A reanimated skeleton warrior',
  loreText: 'Risen from ancient battlefields, these skeletal soldiers march endlessly',

  baseHealth: 150,
  baseSpeed: 70,
  baseArmor: 10,
  goldReward: 12,

  resistances: {
    [DamageType.Physical]: 0.2,
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.3,
    [DamageType.Holy]: -0.8,
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,

  spriteKey: 'monster_skeleton',
  visualDescription: 'Bone-colored skeleton with green glowing eyes carrying a rusty shield',

  visual: {
    shapes: [
      // Body (bone-colored)
      {
        type: 'rect',
        width: 14,
        height: 20,
        centered: true,
        offset: { x: 0, y: 2 },
        fill: undeadColors.primary,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 0,
        scaleWithHealth: true,
      },
      // Skull head
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -12 },
        fill: undeadColors.primary,
        stroke: undeadColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Left eye (green glow)
      {
        type: 'circle',
        radius: 2,
        offset: { x: -3, y: -14 },
        fill: undeadColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Right eye (green glow)
      {
        type: 'circle',
        radius: 2,
        offset: { x: 3, y: -14 },
        fill: undeadColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Shield
      {
        type: 'rect',
        width: 8,
        height: 14,
        centered: true,
        offset: { x: -10, y: 0 },
        fill: undeadColors.secondary,
        stroke: undeadColors.dark,
        strokeWidth: 1,
        layer: 3,
      },
    ],
    healthBar: {
      width: 28,
      height: 4,
      offsetY: -24,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
