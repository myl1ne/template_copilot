/**
 * Monster modifier definitions
 */

import { MonsterModifier } from '../../types/entities';
import { DamageType } from '../../types/game';

export const MONSTER_MODIFIERS: Record<string, MonsterModifier> = {
  swift: {
    id: 'swift',
    name: 'Swift',
    rarity: 'rare',
    speedMultiplier: 1.5,
    goldMultiplier: 1.3,
    tint: 0x00ffff, // Cyan
    scale: 1.0,
    description: 'Moves 50% faster',
  },

  armored: {
    id: 'armored',
    name: 'Armored',
    rarity: 'rare',
    healthMultiplier: 1.3,
    resistanceChanges: {
      [DamageType.Physical]: 0.5, // 50% physical resistance
    },
    goldMultiplier: 1.5,
    tint: 0x888888, // Gray
    scale: 1.1,
    description: 'Extra armor and health',
  },

  infernal: {
    id: 'infernal',
    name: 'Infernal',
    rarity: 'epic',
    healthMultiplier: 1.2,
    resistanceChanges: {
      [DamageType.Fire]: 1.0, // Fire immune
      [DamageType.Ice]: -0.5, // Takes 50% more ice damage
    },
    goldMultiplier: 2.0,
    tint: 0xff4400, // Fiery orange
    scale: 1.05,
    grantedAbilities: ['burning_trail'], // TODO: Implement ability
    description: 'Immune to fire, weak to ice',
  },

  ethereal: {
    id: 'ethereal',
    name: 'Ethereal',
    rarity: 'legendary',
    healthMultiplier: 2.0,
    resistanceChanges: {
      [DamageType.Physical]: 0.5,
      [DamageType.Fire]: 0.5,
      [DamageType.Ice]: 0.5,
      [DamageType.Lightning]: 0.5,
      [DamageType.Shadow]: 0.5,
      [DamageType.Holy]: 0.5,
      [DamageType.Void]: 0.5,
    },
    goldMultiplier: 3.0,
    tint: 0xaa00ff, // Purple
    scale: 1.15,
    description: 'Highly resistant to all damage',
  },

  venomous: {
    id: 'venomous',
    name: 'Venomous',
    rarity: 'rare',
    healthMultiplier: 1.1,
    goldMultiplier: 1.4,
    tint: 0x00ff00, // Green
    scale: 1.0,
    grantedAbilities: ['poison_aura'], // TODO: Implement ability
    description: 'Poisons nearby towers',
  },

  cursed: {
    id: 'cursed',
    name: 'Cursed',
    rarity: 'epic',
    healthMultiplier: 1.5,
    speedMultiplier: 0.8, // Slower but tankier
    resistanceChanges: {
      [DamageType.Shadow]: 1.0, // Shadow immune
      [DamageType.Holy]: -1.0, // Takes 2x holy damage
    },
    goldMultiplier: 2.5,
    tint: 0x440044, // Dark purple
    scale: 1.2,
    description: 'Slow but very tough, immune to shadow',
  },

  glacial: {
    id: 'glacial',
    name: 'Glacial',
    rarity: 'rare',
    healthMultiplier: 1.25,
    resistanceChanges: {
      [DamageType.Ice]: 1.0, // Ice immune
      [DamageType.Fire]: -0.5, // Takes 50% more fire damage
    },
    goldMultiplier: 1.6,
    tint: 0x88ccff, // Icy blue
    scale: 1.05,
    description: 'Immune to ice, weak to fire',
  },

  electric: {
    id: 'electric',
    name: 'Electric',
    rarity: 'rare',
    healthMultiplier: 1.15,
    speedMultiplier: 1.3,
    resistanceChanges: {
      [DamageType.Lightning]: 1.0, // Lightning immune
    },
    goldMultiplier: 1.7,
    tint: 0xffff00, // Yellow
    scale: 1.0,
    description: 'Fast and immune to lightning',
  },

  regenerating: {
    id: 'regenerating',
    name: 'Regenerating',
    rarity: 'epic',
    healthMultiplier: 1.4,
    goldMultiplier: 2.2,
    tint: 0x44ff44, // Bright green
    scale: 1.1,
    grantedAbilities: ['regeneration'], // TODO: Implement ability
    description: 'Slowly regenerates health',
  },

  giant: {
    id: 'giant',
    name: 'Giant',
    rarity: 'epic',
    healthMultiplier: 2.5,
    speedMultiplier: 0.6,
    goldMultiplier: 2.8,
    tint: 0xffffff, // White
    scale: 1.5,
    description: 'Massive health but very slow',
  },
};

/**
 * Get modifiers by rarity
 */
export function getModifiersByRarity(rarity: 'rare' | 'epic' | 'legendary'): MonsterModifier[] {
  return Object.values(MONSTER_MODIFIERS).filter((mod) => mod.rarity === rarity);
}

/**
 * Get a random modifier based on rarity chances
 * Rare: 70%, Epic: 25%, Legendary: 5%
 */
export function getRandomModifier(): MonsterModifier | null {
  const roll = Math.random();

  let rarity: 'rare' | 'epic' | 'legendary';
  if (roll < 0.7) {
    rarity = 'rare';
  } else if (roll < 0.95) {
    rarity = 'epic';
  } else {
    rarity = 'legendary';
  }

  const modifiers = getModifiersByRarity(rarity);
  if (modifiers.length === 0) {
    return null;
  }

  return modifiers[Math.floor(Math.random() * modifiers.length)]!;
}

/**
 * Check if a monster should be rare (5% chance)
 */
export function shouldApplyModifier(): boolean {
  return Math.random() < 0.05; // 5% chance
}
