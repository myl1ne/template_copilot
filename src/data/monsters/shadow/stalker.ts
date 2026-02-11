/**
 * Shadow Stalker - Flying shadow creature
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const shadowColors = getMonsterColors('shadow');

export const shadowStalker: MonsterDefinition = {
  id: 'shadow_stalker',
  name: 'Shadow Stalker',
  description: 'A creature made of living shadows that flies through the air',
  loreText: 'Humanoid figure of living shadows with glowing red eyes',

  baseHealth: 80,
  baseSpeed: 120, // Fast
  baseArmor: 0,
  goldReward: 15,

  resistances: {
    [DamageType.Physical]: 0.5, // Very resistant to physical
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.8, // Almost immune to shadow
    [DamageType.Holy]: -1.0, // Takes double holy damage
    [DamageType.Void]: 0,
  },

  isBoss: false,
  canFly: true, // FLIES! Ignores tower maze

  spriteKey: 'monster_shadow_stalker',
  visualDescription: 'Semi-transparent humanoid made of swirling shadows with glowing red eyes',

  visual: {
    shapes: [
      // Shadowy body (semi-transparent)
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 0 },
        fill: shadowColors.primary,
        fillAlpha: 0.5,
        stroke: shadowColors.secondary,
        strokeWidth: 1,
        strokeAlpha: 0.7,
        layer: 0,
        pulseSpeed: 2.5,
        scaleWithHealth: true,
      },
      // Shadow wisp 1
      {
        type: 'circle',
        radius: 6,
        offset: { x: -10, y: -8 },
        fill: shadowColors.secondary,
        fillAlpha: 0.4,
        layer: 1,
        rotateSpeed: 1.5,
      },
      // Shadow wisp 2
      {
        type: 'circle',
        radius: 5,
        offset: { x: 8, y: -6 },
        fill: shadowColors.secondary,
        fillAlpha: 0.4,
        layer: 1,
        rotateSpeed: -2.0,
      },
      // Shadow wisp 3
      {
        type: 'circle',
        radius: 7,
        offset: { x: 0, y: 10 },
        fill: shadowColors.secondary,
        fillAlpha: 0.3,
        layer: 1,
        rotateSpeed: 1.0,
      },
      // Left glowing red eye
      {
        type: 'circle',
        radius: 3,
        offset: { x: -4, y: -2 },
        fill: shadowColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Right glowing red eye
      {
        type: 'circle',
        radius: 3,
        offset: { x: 4, y: -2 },
        fill: shadowColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 3.0,
      },
    ],
    healthBar: {
      width: 32,
      height: 4,
      offsetY: -22,
      backgroundColor: 0x000000,
      foregroundColor: 'gradient',
    },
  },
};
