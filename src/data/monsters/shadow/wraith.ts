/**
 * Shadow Wraith - Flying shadow monster
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const shadowColors = getMonsterColors('shadow');

export const shadowWraith: MonsterDefinition = {
  id: 'shadow_wraith',
  name: 'Shadow Wraith',
  description: 'A ghostly shadow entity that floats above the battlefield',
  loreText: 'Remnants of souls consumed by the shadow realm, forever drifting',

  baseHealth: 120,
  baseSpeed: 100,
  baseArmor: 0,
  goldReward: 20,

  resistances: {
    [DamageType.Physical]: 0.3,
    [DamageType.Fire]: -0.3,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.9,
    [DamageType.Holy]: -1.0,
    [DamageType.Void]: 0.3,
  },

  isBoss: false,
  canFly: true,

  spriteKey: 'monster_wraith',
  visualDescription: 'Wispy translucent ghostly form with glowing red eyes',

  visual: {
    shapes: [
      // Ghostly body (translucent)
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 0 },
        fill: shadowColors.primary,
        fillAlpha: 0.5,
        stroke: shadowColors.secondary,
        strokeWidth: 2,
        layer: 0,
        pulseSpeed: 2.0,
        scaleWithHealth: true,
      },
      // Inner darker core
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -2 },
        fill: shadowColors.secondary,
        fillAlpha: 0.7,
        layer: 1,
      },
      // Left eye (red glow)
      {
        type: 'circle',
        radius: 3,
        offset: { x: -4, y: -4 },
        fill: shadowColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Right eye (red glow)
      {
        type: 'circle',
        radius: 3,
        offset: { x: 4, y: -4 },
        fill: shadowColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Wispy tail
      {
        type: 'line',
        x1: 0,
        y1: 10,
        x2: -6,
        y2: 18,
        stroke: shadowColors.primary,
        strokeWidth: 3,
        strokeAlpha: 0.4,
        layer: 3,
        pulseSpeed: 1.5,
      },
      {
        type: 'line',
        x1: 0,
        y1: 10,
        x2: 4,
        y2: 16,
        stroke: shadowColors.primary,
        strokeWidth: 2,
        strokeAlpha: 0.3,
        layer: 3,
        pulseSpeed: 2.0,
      },
    ],
    healthBar: {
      width: 30,
      height: 4,
      offsetY: -22,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
