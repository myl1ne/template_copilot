/**
 * Elemental Golem - Fire immune, weak to Ice
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const elementalColors = getMonsterColors('elemental');

export const elementalGolem: MonsterDefinition = {
  id: 'elemental_golem',
  name: 'Elemental Golem',
  description: 'A massive golem of molten rock and fire',
  loreText: 'Forged in the heart of volcanic rifts, these golems are living furnaces',

  baseHealth: 400,
  baseSpeed: 40,
  baseArmor: 25,
  goldReward: 35,

  resistances: {
    [DamageType.Physical]: 0.3,
    [DamageType.Fire]: 1.0,
    [DamageType.Ice]: -0.5,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0,
    [DamageType.Holy]: 0,
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,
  scale: 1.2,

  spriteKey: 'monster_golem',
  visualDescription: 'Rocky body with cracks of molten orange lava glowing from within',

  visual: {
    shapes: [
      // Rocky body
      {
        type: 'polygon',
        points: [-14, 10, -16, -4, -8, -14, 8, -14, 16, -4, 14, 10],
        fill: elementalColors.secondary,
        stroke: elementalColors.dark,
        strokeWidth: 3,
        layer: 0,
        scaleWithHealth: true,
      },
      // Lava crack 1
      {
        type: 'line',
        x1: -6,
        y1: 8,
        x2: -2,
        y2: -8,
        stroke: elementalColors.primary,
        strokeWidth: 3,
        strokeAlpha: 0.8,
        layer: 1,
        pulseSpeed: 1.5,
      },
      // Lava crack 2
      {
        type: 'line',
        x1: 4,
        y1: 6,
        x2: 6,
        y2: -6,
        stroke: elementalColors.primary,
        strokeWidth: 2,
        strokeAlpha: 0.7,
        layer: 1,
        pulseSpeed: 2.0,
      },
      // Glowing core
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: -2 },
        fill: elementalColors.accent,
        fillAlpha: 0.7,
        layer: 2,
        pulseSpeed: 2.5,
      },
      // Eyes
      {
        type: 'circle',
        radius: 3,
        offset: { x: -5, y: -8 },
        fill: elementalColors.accent,
        fillAlpha: 1.0,
        layer: 3,
        pulseSpeed: 1.0,
      },
      {
        type: 'circle',
        radius: 3,
        offset: { x: 5, y: -8 },
        fill: elementalColors.accent,
        fillAlpha: 1.0,
        layer: 3,
        pulseSpeed: 1.0,
      },
    ],
    healthBar: {
      width: 36,
      height: 5,
      offsetY: -24,
      backgroundColor: 0x000000,
      foregroundColor: elementalColors.primary,
    },
  },
};
