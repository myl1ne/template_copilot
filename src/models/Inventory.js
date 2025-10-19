/**
 * Inventory class for RPG Engine
 * Manages character inventory and equipped items
 */
class Inventory {
  /**
   * Create a new inventory
   * @param {number} maxSlots - Maximum inventory slots
   */
  constructor(maxSlots = 20) {
    this.maxSlots = maxSlots;
    this.items = []; // Array of items
    this.gold = 0;
    
    // Equipment slots
    this.equipment = {
      head: null,
      chest: null,
      legs: null,
      feet: null,
      hands: null,
      weapon: null,
      offhand: null,
      ring1: null,
      ring2: null,
      neck: null
    };
  }
  
  /**
   * Add an item to inventory
   * @param {Object} item - Item to add
   * @returns {boolean} - Success status
   */
  addItem(item) {
    // Check if stackable and already exists
    if (item.stackable) {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
        return true;
      }
    }
    
    // Check if inventory is full
    if (this.items.length >= this.maxSlots) {
      return false;
    }
    
    this.items.push(item);
    return true;
  }
  
  /**
   * Remove an item from inventory
   * @param {string} itemId - Item ID to remove
   * @param {number} quantity - Quantity to remove
   * @returns {boolean} - Success status
   */
  removeItem(itemId, quantity = 1) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) return false;
    
    const item = this.items[index];
    if (item.stackable && item.quantity > quantity) {
      item.quantity -= quantity;
      return true;
    } else {
      this.items.splice(index, 1);
      return true;
    }
  }
  
  /**
   * Get an item by ID
   * @param {string} itemId - Item ID
   * @returns {Object|null} - Item or null
   */
  getItem(itemId) {
    return this.items.find(i => i.id === itemId) || null;
  }
  
  /**
   * Equip an item
   * @param {string} itemId - Item ID to equip
   * @returns {Object|null} - Previously equipped item or null
   */
  equipItem(itemId) {
    const item = this.getItem(itemId);
    if (!item || !item.slot) return null;
    
    const slot = item.slot;
    const previousItem = this.equipment[slot];
    
    // Unequip previous item
    if (previousItem) {
      this.addItem(previousItem);
    }
    
    // Equip new item
    this.equipment[slot] = item;
    this.removeItem(itemId, 1);
    
    return previousItem;
  }
  
  /**
   * Unequip an item
   * @param {string} slot - Equipment slot
   * @returns {boolean} - Success status
   */
  unequipItem(slot) {
    const item = this.equipment[slot];
    if (!item) return false;
    
    if (!this.addItem(item)) {
      return false; // Inventory full
    }
    
    this.equipment[slot] = null;
    return true;
  }
  
  /**
   * Get total stats from all equipped items
   * @returns {Object} - Combined stats
   */
  getEquipmentStats() {
    const stats = {};
    
    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (item && item.stats) {
        for (const stat in item.stats) {
          stats[stat] = (stats[stat] || 0) + item.stats[stat];
        }
      }
    }
    
    return stats;
  }
  
  /**
   * Add gold
   * @param {number} amount - Amount to add
   */
  addGold(amount) {
    this.gold += amount;
  }
  
  /**
   * Remove gold
   * @param {number} amount - Amount to remove
   * @returns {boolean} - Success status
   */
  removeGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }
  
  /**
   * Get inventory weight/count
   * @returns {Object} - Current and max slots
   */
  getInventoryInfo() {
    return {
      current: this.items.length,
      max: this.maxSlots,
      gold: this.gold
    };
  }
  
  /**
   * Serialize inventory to JSON
   */
  toJSON() {
    return {
      maxSlots: this.maxSlots,
      gold: this.gold,
      items: this.items.map(i => i.toJSON ? i.toJSON() : i),
      equipment: Object.fromEntries(
        Object.entries(this.equipment).map(([slot, item]) => [
          slot,
          item ? (item.toJSON ? item.toJSON() : item) : null
        ])
      )
    };
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Inventory;
}
