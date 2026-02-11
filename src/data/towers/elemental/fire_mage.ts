/**
 * Elemental Fire Mage Tower
 * Fire damage specialist
 */

import { TowerDefinition } from '../../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../../types/game';
import { getRaceColors } from '../../../rendering/procedural/colorPalettes';

const elementalColors = getRaceColors(TowerRace.Elemental);

export const fireMage: TowerDefinition = {
  id: 'fire_mage',
  name: 'Fire Mage',
  race: TowerRace.Elemental,
  description: 'A mage tower dealing fire damage',
  loreText: 'Elemental fire mages channeling flames',

  baseCost: 75,
  baseDamage: 15,
  baseAttackSpeed: 0.8,
  baseRange: 180,
  damageType: DamageType.Fire,

  upgradeCostMultiplier: 1.6,
  damagePerLevel: 7,
  rangePerLevel: 12,
  attackSpeedPerLevel: 0.08,
  maxLevel: 10,

  abilities: ['ignite', 'inferno_blast'],
  targetPriority: TargetPriority.Strongest,
  projectileType: ProjectileType.Magic,
  projectileSpeed: 350,
  size: 1, // 1x1 tower

  spriteKey: 'tower_fire_mage',

  visual: {
    shapes: [
      // Stone pedestal base
      {
        type: 'polygon',
        points: [-16, 12, 16, 12, 12, -8, -12, -8],
        fill: 0x444444,
        stroke: 0x222222,
        strokeWidth: 2,
        layer: 0,
      },
      // Fire bowl (stationary)
      {
        type: 'arc',
        radius: 14,
        startAngle: 0,
        endAngle: Math.PI,
        offset: { x: 0, y: -8 },
        fill: elementalColors.dark,
        stroke: elementalColors.secondary,
        strokeWidth: 2,
        layer: 1,
      },
    ],
    // Rotating turret (fire orb that aims at target)
    turretShapes: [
      // Fire orb (pulsing, rotates to face target)
      {
        type: 'circle',
        radius: 12,
        offset: { x: 0, y: -16 },
        fill: elementalColors.primary,
        fillAlpha: 0.9,
        layer: 2,
        pulseSpeed: 3.0,
      },
      // Inner fire core
      {
        type: 'circle',
        radius: 8,
        offset: { x: 0, y: -16 },
        fill: elementalColors.accent,
        fillAlpha: 0.8,
        layer: 3,
        pulseSpeed: 4.0,
      },
      // Flame particle 1 (when attacking)
      {
        type: 'circle',
        radius: 4,
        offset: { x: -8, y: -24 },
        fill: elementalColors.accent,
        fillAlpha: 0.7,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: 2.0,
      },
      // Flame particle 2 (when attacking)
      {
        type: 'circle',
        radius: 3,
        offset: { x: 6, y: -22 },
        fill: elementalColors.secondary,
        fillAlpha: 0.7,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: -3.0,
      },
      // Flame particle 3 (when attacking)
      {
        type: 'circle',
        radius: 5,
        offset: { x: 0, y: -28 },
        fill: elementalColors.primary,
        fillAlpha: 0.6,
        layer: 4,
        showWhenAttacking: true,
        rotateSpeed: 1.5,
      },
    ],
    rangeIndicator: {
      color: elementalColors.primary,
      alpha: 0.12,
      showAlways: false,
    },
  },
};
