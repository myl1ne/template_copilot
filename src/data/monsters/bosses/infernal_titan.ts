/**
 * Infernal Titan - Wave 20 Boss
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const bossColors = getMonsterColors('boss');
const elementalColors = getMonsterColors('elemental');

export const infernalTitan: MonsterDefinition = {
  id: 'infernal_titan',
  name: 'Infernal Titan',
  description: 'A colossal fire demon wreathed in flames',
  loreText: 'Born from the deepest volcanic rift, this titan leaves scorched earth in its wake',

  baseHealth: 3000,
  baseSpeed: 40,
  baseArmor: 50,
  goldReward: 250,

  resistances: {
    [DamageType.Physical]: 0.4,
    [DamageType.Fire]: 1.0,
    [DamageType.Ice]: -0.5,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.2,
    [DamageType.Holy]: -0.3,
    [DamageType.Void]: 0.2,
  },

  isBoss: true,
  canFly: false,
  scale: 1.8,

  spriteKey: 'boss_infernal_titan',
  visualDescription: 'Massive flaming demon with obsidian armor and molten fists',

  visual: {
    shapes: [
      // Fire aura
      {
        type: 'circle',
        radius: 32,
        offset: { x: 0, y: 0 },
        fill: elementalColors.primary,
        fillAlpha: 0.15,
        layer: 0,
        pulseSpeed: 1.5,
      },
      // Massive body
      {
        type: 'polygon',
        points: [-18, 16, -22, -4, -12, -20, 12, -20, 22, -4, 18, 16],
        fill: bossColors.primary,
        stroke: bossColors.secondary,
        strokeWidth: 3,
        layer: 1,
        scaleWithHealth: true,
      },
      // Lava cracks on body
      {
        type: 'line',
        x1: -8,
        y1: 10,
        x2: -4,
        y2: -12,
        stroke: elementalColors.primary,
        strokeWidth: 3,
        strokeAlpha: 0.8,
        layer: 2,
        pulseSpeed: 2.0,
      },
      {
        type: 'line',
        x1: 6,
        y1: 8,
        x2: 8,
        y2: -10,
        stroke: elementalColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.7,
        layer: 2,
        pulseSpeed: 2.5,
      },
      // Head
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: -24 },
        fill: bossColors.secondary,
        stroke: bossColors.dark,
        strokeWidth: 2,
        layer: 3,
      },
      // Left horn
      {
        type: 'polygon',
        points: [-6, 0, -12, -14, -2, -4],
        offset: { x: 0, y: -30 },
        fill: 0x222222,
        stroke: bossColors.dark,
        strokeWidth: 1,
        layer: 4,
      },
      // Right horn
      {
        type: 'polygon',
        points: [6, 0, 12, -14, 2, -4],
        offset: { x: 0, y: -30 },
        fill: 0x222222,
        stroke: bossColors.dark,
        strokeWidth: 1,
        layer: 4,
      },
      // Glowing eyes
      {
        type: 'circle',
        radius: 4,
        offset: { x: -5, y: -26 },
        fill: elementalColors.accent,
        fillAlpha: 1.0,
        layer: 5,
        pulseSpeed: 2.0,
      },
      {
        type: 'circle',
        radius: 4,
        offset: { x: 5, y: -26 },
        fill: elementalColors.accent,
        fillAlpha: 1.0,
        layer: 5,
        pulseSpeed: 2.0,
      },
      // Fist glow (left)
      {
        type: 'circle',
        radius: 8,
        offset: { x: -22, y: 4 },
        fill: elementalColors.primary,
        fillAlpha: 0.6,
        layer: 6,
        pulseSpeed: 3.0,
      },
      // Fist glow (right)
      {
        type: 'circle',
        radius: 8,
        offset: { x: 22, y: 4 },
        fill: elementalColors.primary,
        fillAlpha: 0.6,
        layer: 6,
        pulseSpeed: 3.0,
      },
    ],
    healthBar: {
      width: 70,
      height: 7,
      offsetY: -52,
      backgroundColor: 0x000000,
      foregroundColor: bossColors.primary,
    },
  },
};
