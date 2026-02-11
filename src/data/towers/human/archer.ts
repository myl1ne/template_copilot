/**
 * Human Archer Towers
 * Basic ranged physical damage dealers
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const humanColors = getRaceColors(TowerRace.Human);

export const basicArcher: TowerDefinition = {
  id: 'basic_archer',
  name: 'Basic Archer',
  race: TowerRace.Human,
  description: 'A simple archer tower with physical damage',
  loreText: 'Basic human archers defending the Nexus',

  baseCost: 75,
  baseDamage: 10,
  baseAttackSpeed: 1.0, // 1 attack per second
  baseRange: 150,
  damageType: DamageType.Physical,

  upgradeCostMultiplier: 1.5,
  damagePerLevel: 5,
  rangePerLevel: 10,
  attackSpeedPerLevel: 0.1,
  maxLevel: 10,

  abilities: ['volley_shot', 'piercing_shot'],
  targetPriority: TargetPriority.First,
  projectileType: ProjectileType.Arrow,
  projectileSpeed: 400,
  size: 1, // 1x1 tower

  spriteKey: 'tower_archer',

  visual: {
    shapes: [
      // Platform base
      {
        type: 'rect',
        width: 28,
        height: 28,
        centered: true,
        fill: humanColors.dark,
        fillAlpha: 0.8,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Tower body
      {
        type: 'rect',
        width: 20,
        height: 30,
        centered: true,
        offset: { x: 0, y: -5 },
        fill: humanColors.primary,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
      // Battlements (top left)
      {
        type: 'rect',
        width: 6,
        height: 8,
        centered: true,
        offset: { x: -8, y: -22 },
        fill: humanColors.secondary,
        layer: 2,
      },
      // Battlements (top right)
      {
        type: 'rect',
        width: 6,
        height: 8,
        centered: true,
        offset: { x: 8, y: -22 },
        fill: humanColors.secondary,
        layer: 2,
      },
      // Window
      {
        type: 'rect',
        width: 8,
        height: 8,
        centered: true,
        offset: { x: 0, y: -8 },
        fill: humanColors.accent,
        fillAlpha: 0.6,
        layer: 2,
      },
    ],
    // Rotating turret (bow that aims at enemies)
    turretShapes: [
      // Bow (rotates to face target)
      {
        type: 'arc',
        radius: 12,
        startAngle: -Math.PI / 3,
        endAngle: Math.PI / 3,
        offset: { x: 0, y: -15 },
        stroke: humanColors.accent,
        strokeWidth: 3,
        layer: 3,
        showWhenAttacking: true,
        pulseSpeed: 8.0,
      },
    ],
    rangeIndicator: {
      color: humanColors.primary,
      alpha: 0.15,
      showAlways: false,
    },
  },
};

export const sniper: TowerDefinition = {
  id: 'sniper',
  name: 'Sniper',
  race: TowerRace.Human,
  description: 'Long range instant-hit sniper',
  loreText: 'Elite marksmen with deadly precision',

  baseCost: 200,
  baseDamage: 50,
  baseAttackSpeed: 0.5, // Slow but powerful
  baseRange: 300,
  damageType: DamageType.Physical,

  upgradeCostMultiplier: 1.7,
  damagePerLevel: 20,
  rangePerLevel: 20,
  attackSpeedPerLevel: 0.05,
  maxLevel: 10,

  abilities: ['headshot', 'marked_for_death'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.None, // Instant hit
  projectileSpeed: 0,
  size: 1, // 1x1 tower

  spriteKey: 'tower_sniper',

  visual: {
    shapes: [
      // Wide base
      {
        type: 'rect',
        width: 32,
        height: 24,
        centered: true,
        fill: humanColors.dark,
        fillAlpha: 0.9,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 0,
      },
      // Tall tower body
      {
        type: 'rect',
        width: 18,
        height: 45,
        centered: true,
        offset: { x: 0, y: -10 },
        fill: humanColors.primary,
        stroke: humanColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
    ],
    // Rotating turret (scope and barrel)
    turretShapes: [
      // Narrow top section (barrel)
      {
        type: 'rect',
        width: 14,
        height: 15,
        centered: true,
        offset: { x: 0, y: -35 },
        fill: humanColors.secondary,
        stroke: humanColors.dark,
        strokeWidth: 1,
        layer: 2,
      },
      // Scope (glowing)
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -42 },
        fill: humanColors.accent,
        fillAlpha: 0.8,
        stroke: 0xffffff,
        strokeWidth: 1,
        layer: 3,
        pulseSpeed: 2.0,
      },
      // Crosshair in scope
      {
        type: 'line',
        x1: -4,
        y1: 0,
        x2: 4,
        y2: 0,
        offset: { x: 0, y: -42 },
        stroke: 0xffffff,
        strokeWidth: 1,
        layer: 4,
      },
      {
        type: 'line',
        x1: 0,
        y1: -4,
        x2: 0,
        y2: 4,
        offset: { x: 0, y: -42 },
        stroke: 0xffffff,
        strokeWidth: 1,
        layer: 4,
      },
      // Flash when attacking
      {
        type: 'star',
        points: 5,
        radius: 12,
        innerRadius: 6,
        offset: { x: 0, y: -42 },
        fill: 0xffffff,
        fillAlpha: 0.9,
        layer: 5,
        showWhenAttacking: true,
      },
    ],
    rangeIndicator: {
      color: humanColors.accent,
      alpha: 0.1,
      showAlways: false,
    },
  },
};
