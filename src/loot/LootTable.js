/**
 * LootTable - Defines loot tables for different monster types
 * Maps monsters to their possible loot drops
 */

import { RARITIES } from './RaritySystem.js';

/**
 * Base loot templates for different item types
 */
export const LOOT_TEMPLATES = {
  // Weapons
  RUSTY_SWORD: {
    id: 'rusty_sword',
    baseName: 'Rusty Sword',
    type: 'weapon',
    slot: 'weapon',
    icon: '🗡️',
    baseStats: { damage: 10, attackSpeed: 1.0 },
    value: 25
  },
  IRON_SWORD: {
    id: 'iron_sword',
    baseName: 'Iron Sword',
    type: 'weapon',
    slot: 'weapon',
    icon: '🗡️',
    baseStats: { damage: 15, attackSpeed: 1.0 },
    value: 100
  },
  STEEL_SWORD: {
    id: 'steel_sword',
    baseName: 'Steel Sword',
    type: 'weapon',
    slot: 'weapon',
    icon: '⚔️',
    baseStats: { damage: 25, attackSpeed: 1.1 },
    value: 250
  },
  BATTLE_AXE: {
    id: 'battle_axe',
    baseName: 'Battle Axe',
    type: 'weapon',
    slot: 'weapon',
    icon: '🪓',
    baseStats: { damage: 30, attackSpeed: 0.8 },
    value: 300
  },
  
  // Armor - Head
  LEATHER_CAP: {
    id: 'leather_cap',
    baseName: 'Leather Cap',
    type: 'armor',
    slot: 'head',
    icon: '🎓',
    baseStats: { armor: 3, dodge: 2 },
    value: 50
  },
  IRON_HELMET: {
    id: 'iron_helmet',
    baseName: 'Iron Helmet',
    type: 'armor',
    slot: 'head',
    icon: '⛑️',
    baseStats: { armor: 8 },
    value: 150
  },
  STEEL_HELMET: {
    id: 'steel_helmet',
    baseName: 'Steel Helmet',
    type: 'armor',
    slot: 'head',
    icon: '⛑️',
    baseStats: { armor: 15 },
    value: 300
  },
  
  // Armor - Chest
  LEATHER_ARMOR: {
    id: 'leather_armor',
    baseName: 'Leather Armor',
    type: 'armor',
    slot: 'chest',
    icon: '🦺',
    baseStats: { armor: 5, dodge: 3 },
    value: 80
  },
  CHAINMAIL: {
    id: 'chainmail',
    baseName: 'Chainmail',
    type: 'armor',
    slot: 'chest',
    icon: '🦺',
    baseStats: { armor: 12 },
    value: 200
  },
  PLATE_ARMOR: {
    id: 'plate_armor',
    baseName: 'Plate Armor',
    type: 'armor',
    slot: 'chest',
    icon: '🛡️',
    baseStats: { armor: 20 },
    value: 400
  },
  
  // Shields
  WOODEN_SHIELD: {
    id: 'wooden_shield',
    baseName: 'Wooden Shield',
    type: 'armor',
    slot: 'shield',
    icon: '🛡️',
    baseStats: { armor: 5, dodge: 5 },
    value: 50
  },
  IRON_SHIELD: {
    id: 'iron_shield',
    baseName: 'Iron Shield',
    type: 'armor',
    slot: 'shield',
    icon: '🛡️',
    baseStats: { armor: 10, dodge: 3 },
    value: 150
  },
  TOWER_SHIELD: {
    id: 'tower_shield',
    baseName: 'Tower Shield',
    type: 'armor',
    slot: 'shield',
    icon: '🛡️',
    baseStats: { armor: 18 },
    value: 350
  },
  
  // Accessories
  HEALTH_RING: {
    id: 'health_ring',
    baseName: 'Ring of Vitality',
    type: 'accessory',
    slot: 'ring1',
    icon: '💍',
    baseStats: { maxHp: 20, hpRegen: 1 },
    value: 200
  },
  MANA_RING: {
    id: 'mana_ring',
    baseName: 'Ring of Magic',
    type: 'accessory',
    slot: 'ring1',
    icon: '💍',
    baseStats: { maxMana: 20, manaRegen: 1 },
    value: 200
  },
  STRENGTH_AMULET: {
    id: 'strength_amulet',
    baseName: 'Amulet of Strength',
    type: 'accessory',
    slot: 'neck',
    icon: '📿',
    baseStats: { damage: 5, armor: 3 },
    value: 250
  }
};

/**
 * Monster-specific loot tables
 * Each entry defines what items a monster can drop and their probabilities
 */
export const MONSTER_LOOT_TABLES = {
  goblin: {
    goldRange: [5, 15],
    dropChance: 0.3, // 30% chance to drop an item
    lootPool: [
      { template: 'RUSTY_SWORD', weight: 40 },
      { template: 'LEATHER_CAP', weight: 30 },
      { template: 'WOODEN_SHIELD', weight: 20 },
      { template: 'IRON_SWORD', weight: 10 }
    ]
  },
  
  'goblin chief': {
    goldRange: [50, 100],
    dropChance: 0.8, // 80% chance to drop an item
    lootPool: [
      { template: 'IRON_SWORD', weight: 30 },
      { template: 'BATTLE_AXE', weight: 25 },
      { template: 'STEEL_HELMET', weight: 20 },
      { template: 'IRON_SHIELD', weight: 15 },
      { template: 'HEALTH_RING', weight: 10 }
    ]
  },
  
  skeleton: {
    goldRange: [8, 20],
    dropChance: 0.35, // 35% chance to drop an item
    lootPool: [
      { template: 'RUSTY_SWORD', weight: 35 },
      { template: 'IRON_SWORD', weight: 25 },
      { template: 'LEATHER_ARMOR', weight: 20 },
      { template: 'IRON_HELMET', weight: 15 },
      { template: 'MANA_RING', weight: 5 }
    ]
  },
  
  'skeleton lord': {
    goldRange: [75, 150],
    dropChance: 0.9, // 90% chance to drop an item
    lootPool: [
      { template: 'STEEL_SWORD', weight: 30 },
      { template: 'PLATE_ARMOR', weight: 25 },
      { template: 'STEEL_HELMET', weight: 20 },
      { template: 'MANA_RING', weight: 15 },
      { template: 'STRENGTH_AMULET', weight: 10 }
    ]
  },
  
  spider: {
    goldRange: [3, 10],
    dropChance: 0.25, // 25% chance to drop an item
    lootPool: [
      { template: 'LEATHER_CAP', weight: 35 },
      { template: 'LEATHER_ARMOR', weight: 30 },
      { template: 'WOODEN_SHIELD', weight: 25 },
      { template: 'HEALTH_RING', weight: 10 }
    ]
  },
  
  wolf: {
    goldRange: [10, 25],
    dropChance: 0.4, // 40% chance to drop an item
    lootPool: [
      { template: 'LEATHER_ARMOR', weight: 35 },
      { template: 'LEATHER_CAP', weight: 30 },
      { template: 'IRON_SWORD', weight: 20 },
      { template: 'HEALTH_RING', weight: 15 }
    ]
  },
  
  'dire wolf': {
    goldRange: [100, 200],
    dropChance: 0.95, // 95% chance to drop an item
    lootPool: [
      { template: 'BATTLE_AXE', weight: 30 },
      { template: 'PLATE_ARMOR', weight: 25 },
      { template: 'TOWER_SHIELD', weight: 20 },
      { template: 'STRENGTH_AMULET', weight: 15 },
      { template: 'HEALTH_RING', weight: 10 }
    ]
  }
};

/**
 * LootTable class to handle loot generation
 */
export class LootTable {
  /**
   * Get loot table for a specific monster type
   * @param {string} monsterType - Type of monster
   * @returns {object} - Loot table configuration
   */
  static getLootTable(monsterType) {
    return MONSTER_LOOT_TABLES[monsterType] || null;
  }

  /**
   * Get a loot template by key
   * @param {string} templateKey - Template key from LOOT_TEMPLATES
   * @returns {object} - Loot template
   */
  static getLootTemplate(templateKey) {
    return LOOT_TEMPLATES[templateKey] || null;
  }

  /**
   * Roll for a random item from a loot pool
   * @param {Array} lootPool - Array of {template, weight} objects
   * @returns {string|null} - Template key or null
   */
  static rollLootPool(lootPool) {
    const totalWeight = lootPool.reduce((sum, entry) => sum + entry.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const entry of lootPool) {
      currentWeight += entry.weight;
      if (random < currentWeight) {
        return entry.template;
      }
    }
    
    return null;
  }

  /**
   * Roll for gold drop
   * @param {Array} goldRange - [min, max] gold range
   * @returns {number} - Gold amount
   */
  static rollGold(goldRange) {
    const [min, max] = goldRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
