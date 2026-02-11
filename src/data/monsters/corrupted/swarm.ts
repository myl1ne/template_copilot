/**
 * Corrupted Swarm - Fast fragile swarm monster
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const corruptedColors = getMonsterColors('corrupted');

export const corruptedSwarm: MonsterDefinition = {
  id: 'corrupted_swarm',
  name: 'Corrupted Swarm',
  description: 'A buzzing cluster of corrupted insects',
  loreText: 'Countless tiny creatures fused by corruption into a living swarm',

  baseHealth: 40,
  baseSpeed: 130,
  baseArmor: 0,
  goldReward: 5,

  resistances: {
    [DamageType.Physical]: 0,
    [DamageType.Fire]: -0.3,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.1,
    [DamageType.Holy]: -0.3,
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,
  scale: 0.7,

  spriteKey: 'monster_swarm',
  visualDescription: 'Cluster of small corrupted insects moving as one',

  visual: {
    shapes: [
      // Swarm cluster 1
      {
        type: 'circle',
        radius: 5,
        offset: { x: -4, y: -3 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 1,
        layer: 0,
        pulseSpeed: 4.0,
      },
      // Swarm cluster 2
      {
        type: 'circle',
        radius: 5,
        offset: { x: 4, y: -3 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 1,
        layer: 0,
        pulseSpeed: 3.5,
      },
      // Swarm cluster 3
      {
        type: 'circle',
        radius: 5,
        offset: { x: 0, y: 4 },
        fill: corruptedColors.primary,
        stroke: corruptedColors.secondary,
        strokeWidth: 1,
        layer: 0,
        pulseSpeed: 4.5,
      },
      // Glow eyes
      {
        type: 'circle',
        radius: 2,
        offset: { x: -2, y: -2 },
        fill: corruptedColors.accent,
        fillAlpha: 0.8,
        layer: 1,
        pulseSpeed: 5.0,
      },
      {
        type: 'circle',
        radius: 2,
        offset: { x: 3, y: 0 },
        fill: corruptedColors.accent,
        fillAlpha: 0.8,
        layer: 1,
        pulseSpeed: 5.0,
      },
    ],
    healthBar: {
      width: 20,
      height: 3,
      offsetY: -14,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
