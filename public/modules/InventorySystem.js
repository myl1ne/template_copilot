/**
 * InventorySystem - Inventory and equipment management
 * Handles player inventory, equipment, items, and gold
 */
import { GameConfig } from './GameConfig.js';

/**
 * Item class for inventory items
 */
export class Item {
  constructor(id, name, icon, type, value, stats = {}) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.value = value;
    this.stats = stats;
    this.slot = stats.slot || null;
    this.quantity = 1;
  }
}

/**
 * Inventory system for managing player items and equipment
 */
export class InventorySystem {
  constructor(addMessageFn) {
    this.addMessage = addMessageFn;
    this.gold = GameConfig.inventory.startingGold;
    this.maxSlots = GameConfig.inventory.maxSlots;
    this.items = [];
    this.equipment = {
      head: null,
      chest: null,
      legs: null,
      weapon: null,
      shield: null
    };
  }

  /**
   * Add an item to the inventory
   * @param {Item} item - Item to add
   * @returns {boolean} - True if added successfully
   */
  addItem(item) {
    if (this.items.length >= this.maxSlots) {
      this.addMessage('Inventory full!', 'warning');
      return false;
    }
    this.items.push(item);
    this.addMessage(`Obtained ${item.icon} ${item.name}`, 'success');
    return true;
  }

  /**
   * Remove an item from the inventory
   * @param {string} itemId - ID of item to remove
   * @returns {boolean} - True if removed successfully
   */
  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Add gold to the inventory
   * @param {number} amount - Amount of gold to add
   */
  addGold(amount) {
    this.gold += amount;
    this.addMessage(`+${amount} 💰 gold`, 'success');
  }

  /**
   * Remove gold from the inventory
   * @param {number} amount - Amount of gold to remove
   * @returns {boolean} - True if removed successfully
   */
  removeGold(amount) {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  /**
   * Initialize inventory with starter items
   */
  initStarterItems() {
    this.addItem(new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }));
    this.addItem(new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }));
  }

  /**
   * Get all items in inventory
   */
  getItems() {
    return this.items;
  }

  /**
   * Get equipped items
   */
  getEquipment() {
    return this.equipment;
  }

  /**
   * Get gold amount
   */
  getGold() {
    return this.gold;
  }
}
