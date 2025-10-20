/**
 * RaritySystem - Manages item rarities, colors, and stat modifiers
 * Provides a consistent rarity system for the loot system
 */

export const RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const RARITY_COLORS = {
  [RARITIES.COMMON]: '#9ca3af',      // Gray
  [RARITIES.UNCOMMON]: '#4ade80',    // Green
  [RARITIES.RARE]: '#3b82f6',        // Blue
  [RARITIES.EPIC]: '#a855f7',        // Purple
  [RARITIES.LEGENDARY]: '#f59e0b'    // Orange/Gold
};

export const RARITY_WEIGHTS = {
  [RARITIES.COMMON]: 60,       // 60% chance
  [RARITIES.UNCOMMON]: 25,     // 25% chance
  [RARITIES.RARE]: 10,         // 10% chance
  [RARITIES.EPIC]: 4,          // 4% chance
  [RARITIES.LEGENDARY]: 1      // 1% chance
};

export const RARITY_STAT_MULTIPLIERS = {
  [RARITIES.COMMON]: 1.0,
  [RARITIES.UNCOMMON]: 1.25,
  [RARITIES.RARE]: 1.5,
  [RARITIES.EPIC]: 2.0,
  [RARITIES.LEGENDARY]: 3.0
};

/**
 * RaritySystem class to handle rarity-related operations
 */
export class RaritySystem {
  /**
   * Get the color for a given rarity
   * @param {string} rarity - Rarity level
   * @returns {string} - Hex color code
   */
  static getColor(rarity) {
    return RARITY_COLORS[rarity] || RARITY_COLORS[RARITIES.COMMON];
  }

  /**
   * Get the stat multiplier for a given rarity
   * @param {string} rarity - Rarity level
   * @returns {number} - Stat multiplier
   */
  static getStatMultiplier(rarity) {
    return RARITY_STAT_MULTIPLIERS[rarity] || 1.0;
  }

  /**
   * Roll a random rarity based on weighted probabilities
   * @returns {string} - Random rarity
   */
  static rollRarity() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      currentWeight += weight;
      if (random < currentWeight) {
        return rarity;
      }
    }
    
    return RARITIES.COMMON;
  }

  /**
   * Apply rarity modifiers to base stats
   * @param {object} baseStats - Base stats object
   * @param {string} rarity - Rarity level
   * @returns {object} - Modified stats
   */
  static applyRarityModifiers(baseStats, rarity) {
    const multiplier = this.getStatMultiplier(rarity);
    const modifiedStats = {};
    
    for (const [stat, value] of Object.entries(baseStats)) {
      modifiedStats[stat] = Math.floor(value * multiplier);
    }
    
    return modifiedStats;
  }

  /**
   * Get display name with rarity prefix
   * @param {string} baseName - Base item name
   * @param {string} rarity - Rarity level
   * @returns {string} - Display name with rarity
   */
  static getDisplayName(baseName, rarity) {
    const prefixes = {
      [RARITIES.COMMON]: '',
      [RARITIES.UNCOMMON]: 'Fine ',
      [RARITIES.RARE]: 'Superior ',
      [RARITIES.EPIC]: 'Masterwork ',
      [RARITIES.LEGENDARY]: 'Legendary '
    };
    
    return (prefixes[rarity] || '') + baseName;
  }

  /**
   * Get rarity emoji/icon
   * @param {string} rarity - Rarity level
   * @returns {string} - Emoji representation
   */
  static getIcon(rarity) {
    const icons = {
      [RARITIES.COMMON]: '⚪',
      [RARITIES.UNCOMMON]: '🟢',
      [RARITIES.RARE]: '🔵',
      [RARITIES.EPIC]: '🟣',
      [RARITIES.LEGENDARY]: '🟠'
    };
    
    return icons[rarity] || icons[RARITIES.COMMON];
  }
}
