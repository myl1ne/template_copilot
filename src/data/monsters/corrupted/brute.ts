/**
 * Corrupted Brute - Slow heavy tank
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const corruptedColors = getMonsterColors('corrupted');

export const corruptedBrute: MonsterDefinition = {
  id: 'corrupted_brute',
  name: 'Corrupted Brute',
  description: 'A massive corrupted beast with thick hide',
  loreText: 'The corruption has turned this creature into a walking fortress of flesh and bone',

  baseHealth: 500,
  baseSpeed: 35,
  baseArmor: 40,
  goldReward: 30,

  resistances: {
    [DamageType.Physical]: 0.5,
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: -0.5,
    [DamageType.Shadow]: 0.2,
    [DamageType.Holy]: -0.3,
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,
  scale: 1.3,

  spriteKey: 'monster_brute',
  visualDescription: 'Massive hulking creature with thick corrupted armor plates',

  visual: {
    shapes: [
      // Massive body
      {
        type: 'rect',
        width: 28,
        height: 24,
        centered: true,
        offset: { x: 0, y: 2 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 3,
        layer: 0,
        scaleWithHealth: true,
      },
      // Armor plate
      {
        type: 'rect',
        width: 22,
        height: 16,
        centered: true,
        offset: { x: 0, y: -2 },
        fill: corruptedColors.secondary,
        fillAlpha: 0.8,
        stroke: corruptedColors.dark,
        strokeWidth: 2,
        layer: 1,
      },
      // Small head
      {
        type: 'circle',
        radius: 7,
        offset: { x: 12, y: -6 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 2,
        layer: 2,
      },
      // Glowing eye
      {
        type: 'circle',
        radius: 3,
        offset: { x: 14, y: -7 },
        fill: corruptedColors.accent,
        fillAlpha: 1.0,
        layer: 3,
        pulseSpeed: 1.5,
      },
      // Corruption veins
      {
        type: 'line',
        x1: -8,
        y1: 6,
        x2: -14,
        y2: 10,
        stroke: corruptedColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.5,
        layer: 3,
        pulseSpeed: 1.0,
      },
    ],
    healthBar: {
      width: 40,
      height: 5,
      offsetY: -22,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
