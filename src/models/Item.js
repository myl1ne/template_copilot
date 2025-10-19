/**
 * Item class for RPG Engine
 * Represents an item that can be in inventory or equipped
 */
class Item {
  /**
   * Create a new item
   * @param {string} id - Unique item identifier
   * @param {string} name - Item name
   * @param {Object} options - Item options
   */
  constructor(id, name, options = {}) {
    this.id = id;
    this.name = name;
    this.description = options.description || '';
    this.type = options.type || 'consumable'; // consumable, weapon, armor, quest
    this.slot = options.slot || null; // head, chest, legs, weapon, shield, etc.
    this.rarity = options.rarity || 'common'; // common, uncommon, rare, epic, legendary
    this.value = options.value || 0; // Gold value
    this.stackable = options.stackable || false;
    this.maxStack = options.maxStack || 1;
    this.quantity = options.quantity || 1;
    
    // Stats that item provides when equipped
    this.stats = options.stats || {};
    
    // For consumables
    this.consumable = options.consumable || false;
    this.onUse = options.onUse || null;
    
    // Icon/visual
    this.icon = options.icon || '📦';
  }
  
  /**
   * Use the item (for consumables)
   * @param {Object} target - Target to apply effect to
   */
  use(target) {
    if (this.consumable && this.onUse) {
      this.onUse(target);
      if (!this.stackable) {
        this.quantity = 0;
      } else {
        this.quantity = Math.max(0, this.quantity - 1);
      }
      return true;
    }
    return false;
  }
  
  /**
   * Get item color based on rarity
   */
  getRarityColor() {
    const colors = {
      common: '#FFFFFF',
      uncommon: '#1EFF00',
      rare: '#0070DD',
      epic: '#A335EE',
      legendary: '#FF8000'
    };
    return colors[this.rarity] || colors.common;
  }
  
  /**
   * Serialize item to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      slot: this.slot,
      rarity: this.rarity,
      value: this.value,
      stackable: this.stackable,
      quantity: this.quantity,
      stats: this.stats,
      consumable: this.consumable,
      icon: this.icon
    };
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Item;
}
