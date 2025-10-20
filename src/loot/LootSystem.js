/**
 * LootSystem - Main loot generation system
 * Handles generating loot drops from monsters with rarity modifiers
 */

import { RaritySystem, RARITIES } from './RaritySystem.js';
import { LootTable, LOOT_TEMPLATES } from './LootTable.js';

/**
 * LootSystem class
 */
export class LootSystem {
  /**
   * Generate loot from a defeated monster
   * @param {string} monsterType - Type of monster that was defeated
   * @returns {object} - Loot result with gold and items
   */
  static generateLoot(monsterType) {
    const lootTable = LootTable.getLootTable(monsterType);
    
    if (!lootTable) {
      return { gold: 0, items: [] };
    }

    // Roll for gold
    const gold = LootTable.rollGold(lootTable.goldRange);
    
    // Roll for item drop
    const items = [];
    const dropRoll = Math.random();
    
    if (dropRoll < lootTable.dropChance) {
      // Get a random item from the loot pool
      const templateKey = LootTable.rollLootPool(lootTable.lootPool);
      
      if (templateKey) {
        const template = LootTable.getLootTemplate(templateKey);
        
        if (template) {
          // Roll for rarity
          const rarity = RaritySystem.rollRarity();
          
          // Create the item with rarity modifiers
          const item = this.createLootItem(template, rarity);
          items.push(item);
        }
      }
    }

    return { gold, items };
  }

  /**
   * Create a loot item from a template with rarity modifiers
   * @param {object} template - Item template
   * @param {string} rarity - Rarity level
   * @returns {object} - Complete item object
   */
  static createLootItem(template, rarity) {
    // Apply rarity modifiers to base stats
    const modifiedStats = RaritySystem.applyRarityModifiers(template.baseStats, rarity);
    
    // Get display name with rarity prefix
    const displayName = RaritySystem.getDisplayName(template.baseName, rarity);
    
    // Calculate value with rarity modifier
    const rarityMultiplier = RaritySystem.getStatMultiplier(rarity);
    const value = Math.floor(template.value * rarityMultiplier);
    
    // Create unique ID with rarity
    const uniqueId = `${template.id}_${rarity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: uniqueId,
      baseId: template.id,
      name: displayName,
      type: template.type,
      slot: template.slot,
      icon: template.icon,
      rarity: rarity,
      rarityColor: RaritySystem.getColor(rarity),
      rarityIcon: RaritySystem.getIcon(rarity),
      stats: modifiedStats,
      value: value,
      stackable: false,
      quantity: 1,
      description: this.generateDescription(template, rarity, modifiedStats)
    };
  }

  /**
   * Generate a description for an item
   * @param {object} template - Item template
   * @param {string} rarity - Rarity level
   * @param {object} stats - Item stats
   * @returns {string} - Item description
   */
  static generateDescription(template, rarity, stats) {
    const descriptions = {
      [RARITIES.COMMON]: 'A common item found throughout the land.',
      [RARITIES.UNCOMMON]: 'An uncommon item of decent quality.',
      [RARITIES.RARE]: 'A rare item crafted with skill.',
      [RARITIES.EPIC]: 'An epic item of masterwork quality.',
      [RARITIES.LEGENDARY]: 'A legendary item of immense power!'
    };

    let desc = descriptions[rarity] || descriptions[RARITIES.COMMON];
    
    // Add stat descriptions
    const statDescs = [];
    if (stats.damage) statDescs.push(`+${stats.damage} Damage`);
    if (stats.armor) statDescs.push(`+${stats.armor} Armor`);
    if (stats.dodge) statDescs.push(`+${stats.dodge} Dodge`);
    if (stats.maxHp) statDescs.push(`+${stats.maxHp} Max HP`);
    if (stats.maxMana) statDescs.push(`+${stats.maxMana} Max Mana`);
    if (stats.hpRegen) statDescs.push(`+${stats.hpRegen} HP Regen`);
    if (stats.manaRegen) statDescs.push(`+${stats.manaRegen} Mana Regen`);
    if (stats.attackSpeed) statDescs.push(`${stats.attackSpeed}x Attack Speed`);
    
    if (statDescs.length > 0) {
      desc += '\n' + statDescs.join(', ');
    }
    
    return desc;
  }

  /**
   * Generate merchant inventory with some rare items
   * @param {number} itemCount - Number of items to generate
   * @returns {Array} - Array of items
   */
  static generateMerchantInventory(itemCount = 10) {
    const inventory = [];
    const templateKeys = Object.keys(LOOT_TEMPLATES);
    
    // Ensure at least 2 rare items
    const rareCount = Math.min(2, itemCount);
    
    for (let i = 0; i < itemCount; i++) {
      const randomTemplateKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
      const template = LOOT_TEMPLATES[randomTemplateKey];
      
      // Force rare items for first few items
      let rarity;
      if (i < rareCount) {
        // Guarantee at least uncommon or better
        const rareRarities = [RARITIES.UNCOMMON, RARITIES.RARE, RARITIES.EPIC, RARITIES.LEGENDARY];
        rarity = rareRarities[Math.floor(Math.random() * rareRarities.length)];
      } else {
        rarity = RaritySystem.rollRarity();
      }
      
      const item = this.createLootItem(template, rarity);
      inventory.push(item);
    }
    
    return inventory;
  }
}

// Export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LootSystem, RaritySystem, LootTable, LOOT_TEMPLATES, RARITIES };
}
