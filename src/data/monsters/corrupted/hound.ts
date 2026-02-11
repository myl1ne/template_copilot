/**
 * Corrupted Hound - Basic ground monster
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const corruptedColors = getMonsterColors('corrupted');

export const corruptedHound: MonsterDefinition = {
  id: 'corrupted_hound',
  name: 'Corrupted Hound',
  description: 'A mutated wolf creature',
  loreText: 'Once a loyal companion, now twisted by the Nexus corruption',

  baseHealth: 100,
  baseSpeed: 80, // units per second
  baseArmor: 0,
  goldReward: 10,

  resistances: {
    [DamageType.Physical]: 0,
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.2, // 20% shadow resistance
    [DamageType.Holy]: -0.5, // Takes 50% more holy damage
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,

  spriteKey: 'monster_hound',
  visualDescription: 'Mutated wolf with patches of exposed flesh and glowing purple eyes',

  visual: {
    shapes: [
      // Body (elongated oval)
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: 0 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 2,
        layer: 0,
        scaleWithHealth: true,
      },
      // Head
      {
        type: 'circle',
        radius: 8,
        offset: { x: 12, y: -2 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 1,
        layer: 1,
        rotation: 'dynamic',
      },
      // Left eye (glowing purple)
      {
        type: 'circle',
        radius: 2,
        offset: { x: 14, y: -4 },
        fill: corruptedColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Right eye (glowing purple)
      {
        type: 'circle',
        radius: 2,
        offset: { x: 14, y: 0 },
        fill: corruptedColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Corruption tendril 1
      {
        type: 'line',
        x1: -10,
        y1: 2,
        x2: -14,
        y2: 6,
        stroke: corruptedColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.6,
        layer: 3,
        pulseSpeed: 1.5,
      },
      // Corruption tendril 2
      {
        type: 'line',
        x1: -8,
        y1: -4,
        x2: -12,
        y2: -8,
        stroke: corruptedColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.6,
        layer: 3,
        pulseSpeed: 1.8,
      },
    ],
    healthBar: {
      width: 30,
      height: 4,
      offsetY: -20,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
