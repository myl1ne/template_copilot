/**
 * Decay Lord - Wave 10 Boss
 */

import { MonsterDefinition } from '../../../types/entities';
import { DamageType } from '../../../types/game';
import { getMonsterColors } from '../../../rendering/procedural/colorPalettes';

const bossColors = getMonsterColors('boss');
const undeadColors = getMonsterColors('undead');

export const decayLord: MonsterDefinition = {
  id: 'decay_lord',
  name: 'Decay Lord',
  description: 'Massive undead knight on a skeletal horse',
  loreText: 'An ancient undead knight corrupted by the Nexus, riding an undead steed',

  baseHealth: 1000,
  baseSpeed: 60,
  baseArmor: 30,
  goldReward: 100,

  resistances: {
    [DamageType.Physical]: 0.3,
    [DamageType.Fire]: 0.2,
    [DamageType.Ice]: 0.5, // Very resistant to ice
    [DamageType.Lightning]: 0,
    [DamageType.Shadow]: 0.6,
    [DamageType.Holy]: -0.8, // Very weak to holy
    [DamageType.Void]: 0.3,
  },

  isBoss: true,
  canFly: false,

  spriteKey: 'boss_decay_lord',
  visualDescription: 'Massive undead knight in corrupted armor riding a skeletal horse with glowing green eyes',
  scale: 1.5, // Bigger than regular monsters

  visual: {
    shapes: [
      // Horse body
      {
        type: 'circle',
        radius: 20,
        offset: { x: 0, y: 8 },
        fill: 0x333333,
        stroke: 0x222222,
        strokeWidth: 2,
        layer: 0,
      },
      // Horse head
      {
        type: 'rect',
        width: 14,
        height: 18,
        centered: true,
        offset: { x: 18, y: 2 },
        fill: 0x444444,
        stroke: 0x222222,
        strokeWidth: 2,
        layer: 1,
        rotation: Math.PI / 8,
      },
      // Horse glowing green eyes
      {
        type: 'circle',
        radius: 3,
        offset: { x: 22, y: 0 },
        fill: undeadColors.accent,
        fillAlpha: 1.0,
        layer: 2,
        pulseSpeed: 2.0,
      },
      // Knight torso (massive armor)
      {
        type: 'rect',
        width: 24,
        height: 30,
        centered: true,
        offset: { x: 0, y: -12 },
        fill: bossColors.primary,
        stroke: bossColors.secondary,
        strokeWidth: 3,
        layer: 3,
        scaleWithHealth: true,
      },
      // Knight head/helmet
      {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: -28 },
        fill: bossColors.secondary,
        stroke: bossColors.dark,
        strokeWidth: 2,
        layer: 4,
      },
      // Helmet horns (left)
      {
        type: 'polygon',
        points: [-6, 0, -10, -8, -4, -2],
        offset: { x: 0, y: -32 },
        fill: bossColors.dark,
        stroke: bossColors.secondary,
        strokeWidth: 1,
        layer: 5,
      },
      // Helmet horns (right)
      {
        type: 'polygon',
        points: [6, 0, 10, -8, 4, -2],
        offset: { x: 0, y: -32 },
        fill: bossColors.dark,
        stroke: bossColors.secondary,
        strokeWidth: 1,
        layer: 5,
      },
      // Shoulder armor (left)
      {
        type: 'circle',
        radius: 8,
        offset: { x: -16, y: -18 },
        fill: bossColors.secondary,
        stroke: bossColors.dark,
        strokeWidth: 2,
        layer: 4,
      },
      // Shoulder armor (right)
      {
        type: 'circle',
        radius: 8,
        offset: { x: 16, y: -18 },
        fill: bossColors.secondary,
        stroke: bossColors.dark,
        strokeWidth: 2,
        layer: 4,
      },
      // Sword
      {
        type: 'rect',
        width: 6,
        height: 32,
        centered: true,
        offset: { x: 22, y: -8 },
        fill: 0xaaaaaa,
        stroke: 0x666666,
        strokeWidth: 2,
        layer: 6,
        rotation: Math.PI / 6,
      },
      // Sword glow (when attacking)
      {
        type: 'rect',
        width: 8,
        height: 34,
        centered: true,
        offset: { x: 22, y: -8 },
        fill: bossColors.accent,
        fillAlpha: 0.6,
        layer: 7,
        rotation: Math.PI / 6,
        showWhenAttacking: true,
        pulseSpeed: 5.0,
      },
      // Corruption aura (pulsing)
      {
        type: 'circle',
        radius: 30,
        offset: { x: 0, y: 0 },
        fill: bossColors.accent,
        fillAlpha: 0.15,
        layer: 8,
        pulseSpeed: 1.5,
      },
    ],
    healthBar: {
      width: 60,
      height: 6,
      offsetY: -48,
      backgroundColor: 0x000000,
      foregroundColor: bossColors.primary,
    },
  },
};
