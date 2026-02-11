/**
 * Twisted Warrior - Armored ground monster
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const corruptedColors = getMonsterColors('corrupted');

export const twistedWarrior: MonsterDefinition = {
  id: 'twisted_warrior',
  name: 'Twisted Warrior',
  description: 'A corrupted soldier in rusted armor',
  loreText: 'Former human soldier, body warped and armor fused to flesh',

  baseHealth: 200,
  baseSpeed: 50,
  baseArmor: 20, // Good physical resistance
  goldReward: 20,

  resistances: {
    [DamageType.Physical]: 0.3, // 30% physical resistance
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: -0.2, // Weak to lightning
    [DamageType.Shadow]: 0,
    [DamageType.Holy]: -0.3, // Weak to holy
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: false,

  spriteKey: 'monster_warrior',
  visualDescription: 'Warped humanoid with twisted limbs and rusted armor fused to corrupted flesh',

  visual: {
    shapes: [
      // Body (torso)
      {
        type: 'rect',
        width: 16,
        height: 24,
        centered: true,
        offset: { x: 0, y: 0 },
        fill: 0x555555, // Rusted armor
        stroke: 0x333333,
        strokeWidth: 2,
        layer: 0,
        scaleWithHealth: true,
      },
      // Head
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: -16 },
        fill: corruptedColors.primary,
        stroke: 0x444444,
        strokeWidth: 1,
        layer: 1,
      },
      // Helmet crest
      {
        type: 'polygon',
        points: [-4, 0, 0, -6, 4, 0],
        offset: { x: 0, y: -20 },
        fill: 0x666666,
        stroke: 0x333333,
        strokeWidth: 1,
        layer: 2,
      },
      // Left shoulder armor plate
      {
        type: 'rect',
        width: 8,
        height: 10,
        centered: true,
        offset: { x: -10, y: -8 },
        fill: 0x666666,
        stroke: 0x444444,
        strokeWidth: 1,
        layer: 1,
      },
      // Right shoulder armor plate
      {
        type: 'rect',
        width: 8,
        height: 10,
        centered: true,
        offset: { x: 10, y: -8 },
        fill: 0x666666,
        stroke: 0x444444,
        strokeWidth: 1,
        layer: 1,
      },
      // Weapon (sword)
      {
        type: 'rect',
        width: 4,
        height: 20,
        centered: true,
        offset: { x: 14, y: 0 },
        fill: 0x888888,
        stroke: 0x444444,
        strokeWidth: 1,
        layer: 2,
        rotation: Math.PI / 4,
      },
      // Glowing corruption on armor
      {
        type: 'circle',
        radius: 3,
        offset: { x: 0, y: -2 },
        fill: corruptedColors.accent,
        fillAlpha: 0.8,
        layer: 3,
        pulseSpeed: 1.5,
      },
    ],
    healthBar: {
      width: 35,
      height: 4,
      offsetY: -26,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
