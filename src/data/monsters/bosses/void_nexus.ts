/**
 * Void Nexus - Wave 30 Final Boss
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const bossColors = getMonsterColors('boss');
const eliteColors = getMonsterColors('elite');

export const voidNexus: MonsterDefinition = {
  id: 'void_nexus',
  name: 'Void Nexus',
  description: 'A massive void entity that warps reality around it',
  loreText: 'The ultimate manifestation of the void — a living portal threatening to consume all',

  baseHealth: 5000,
  baseSpeed: 30,
  baseArmor: 60,
  goldReward: 500,

  resistances: {
    [DamageType.Physical]: 0.3,
    [DamageType.Fire]: 0.3,
    [DamageType.Ice]: 0.3,
    [DamageType.Lightning]: 0.3,
    [DamageType.Shadow]: 0.3,
    [DamageType.Holy]: -0.5,
    [DamageType.Void]: 1.0,
  },

  isBoss: true,
  canFly: false,
  scale: 2.0,

  spriteKey: 'boss_void_nexus',
  visualDescription: 'Swirling void portal entity with reality-warping energy tendrils',

  visual: {
    shapes: [
      // Outer distortion field
      {
        type: 'circle',
        radius: 36,
        offset: { x: 0, y: 0 },
        fill: eliteColors.primary,
        fillAlpha: 0.1,
        layer: 0,
        pulseSpeed: 1.0,
      },
      // Void body ring
      {
        type: 'circle',
        radius: 24,
        offset: { x: 0, y: 0 },
        fill: 0x110022,
        stroke: eliteColors.secondary,
        strokeWidth: 3,
        layer: 1,
        scaleWithHealth: true,
      },
      // Inner void (pure black)
      {
        type: 'circle',
        radius: 14,
        offset: { x: 0, y: 0 },
        fill: 0x000000,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Core eye
      {
        type: 'circle',
        radius: 6,
        offset: { x: 0, y: 0 },
        fill: bossColors.accent,
        fillAlpha: 0.9,
        layer: 3,
        pulseSpeed: 3.0,
      },
      // Energy tendril 1
      {
        type: 'line',
        x1: -20,
        y1: -10,
        x2: -32,
        y2: -18,
        stroke: eliteColors.accent,
        strokeWidth: 3,
        strokeAlpha: 0.6,
        layer: 4,
        pulseSpeed: 2.5,
      },
      // Energy tendril 2
      {
        type: 'line',
        x1: 20,
        y1: -10,
        x2: 32,
        y2: -18,
        stroke: eliteColors.accent,
        strokeWidth: 3,
        strokeAlpha: 0.6,
        layer: 4,
        pulseSpeed: 2.5,
      },
      // Energy tendril 3
      {
        type: 'line',
        x1: -18,
        y1: 14,
        x2: -28,
        y2: 22,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.4,
        layer: 4,
        pulseSpeed: 2.0,
      },
      // Energy tendril 4
      {
        type: 'line',
        x1: 18,
        y1: 14,
        x2: 28,
        y2: 22,
        stroke: eliteColors.accent,
        strokeWidth: 2,
        strokeAlpha: 0.4,
        layer: 4,
        pulseSpeed: 2.0,
      },
      // Rotating energy ring
      {
        type: 'arc',
        radius: 20,
        startAngle: 0,
        endAngle: Math.PI,
        offset: { x: 0, y: 0 },
        stroke: bossColors.accent,
        strokeWidth: 2,
        layer: 5,
        rotateSpeed: 1.0,
      },
    ],
    healthBar: {
      width: 80,
      height: 8,
      offsetY: -52,
      backgroundColor: 0x000000,
      foregroundColor: bossColors.primary,
    },
  },
};
