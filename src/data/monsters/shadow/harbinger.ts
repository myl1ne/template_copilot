/**
 * Void Harbinger - Late game elite ground unit
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const shadowColors = getMonsterColors('shadow');
const eliteColors = getMonsterColors('elite');

export const voidHarbinger: MonsterDefinition = {
  id: 'void_harbinger',
  name: 'Void Harbinger',
  description: 'An elite shadow creature infused with void energy',
  loreText: 'Heralds of the coming void, their mere presence warps reality',

  baseHealth: 300,
  baseSpeed: 60,
  baseArmor: 15,
  goldReward: 25,

  resistances: {
    [DamageType.Physical]: 0.2,
    [DamageType.Fire]: 0.2,
    [DamageType.Ice]: 0.2,
    [DamageType.Lightning]: 0.2,
    [DamageType.Shadow]: 0.2,
    [DamageType.Holy]: -0.5,
    [DamageType.Void]: 0.8,
  },

  isBoss: false,
  canFly: false,
  scale: 1.1,

  spriteKey: 'monster_harbinger',
  visualDescription: 'Dark purple humanoid with a black void core radiating energy',

  visual: {
    shapes: [
      // Void aura
      {
        type: 'circle',
        radius: 16,
        offset: { x: 0, y: 0 },
        fill: eliteColors.primary,
        fillAlpha: 0.2,
        layer: 0,
        pulseSpeed: 1.5,
      },
      // Body
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: 0 },
        fill: shadowColors.primary,
        stroke: eliteColors.secondary,
        strokeWidth: 2,
        layer: 1,
        scaleWithHealth: true,
      },
      // Void core
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: -2 },
        fill: 0x110022,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        layer: 2,
        pulseSpeed: 2.5,
      },
      // Eyes
      {
        type: 'circle',
        radius: 2,
        offset: { x: -4, y: -6 },
        fill: eliteColors.accent,
        fillAlpha: 1.0,
        layer: 3,
        pulseSpeed: 3.0,
      },
      {
        type: 'circle',
        radius: 2,
        offset: { x: 4, y: -6 },
        fill: eliteColors.accent,
        fillAlpha: 1.0,
        layer: 3,
        pulseSpeed: 3.0,
      },
      // Energy tendrils
      {
        type: 'line',
        x1: -10,
        y1: 0,
        x2: -16,
        y2: -4,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.5,
        layer: 4,
        pulseSpeed: 2.0,
      },
      {
        type: 'line',
        x1: 10,
        y1: 0,
        x2: 16,
        y2: -4,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.5,
        layer: 4,
        pulseSpeed: 2.0,
      },
    ],
    healthBar: {
      width: 34,
      height: 4,
      offsetY: -24,
      backgroundColor: 0x000000,
      foregroundColor: eliteColors.primary,
    },
  },
};
