/**
 * NPC class for RPG Engine
 * Represents a non-player character with dialogue and functionality
 */
class NPC {
  /**
   * Create a new NPC
   * @param {string} id - Unique NPC identifier
   * @param {string} name - NPC name
   * @param {Object} options - NPC options
   */
  constructor(id, name, options = {}) {
    this.id = id;
    this.name = name;
    this.type = options.type || 'generic'; // quest_giver, merchant, guard, etc.
    this.dialogue = options.dialogue || ['Hello, traveler!'];
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.rotation = options.rotation || 0;
    
    // For merchants
    this.merchantData = options.merchantData || null;
    if (this.type === 'merchant' && !this.merchantData) {
      this.merchantData = {
        inventory: [],
        buyRate: 1.0, // Player sells for this multiplier
        sellRate: 1.5  // Player buys for this multiplier
      };
    }
    
    // For quest givers
    this.quests = options.quests || [];
    
    // Visual
    this.icon = options.icon || '👤';
    this.color = options.color || 0xFFFFFF;
  }
  
  /**
   * Get greeting dialogue
   * @returns {string} - Greeting message
   */
  getGreeting() {
    if (Array.isArray(this.dialogue) && this.dialogue.length > 0) {
      return this.dialogue[0];
    }
    return 'Hello!';
  }
  
  /**
   * Get available quests
   * @returns {Array} - Array of quest objects
   */
  getAvailableQuests() {
    return this.quests.filter(q => q.status === 'available');
  }
  
  /**
   * Add item to merchant inventory
   * @param {Object} item - Item to add
   */
  addMerchantItem(item) {
    if (this.type === 'merchant' && this.merchantData) {
      this.merchantData.inventory.push(item);
    }
  }
  
  /**
   * Buy item from player
   * @param {Object} item - Item to buy
   * @returns {number} - Gold offered
   */
  getBuyPrice(item) {
    if (this.type !== 'merchant' || !this.merchantData) return 0;
    return Math.floor(item.value * this.merchantData.buyRate);
  }
  
  /**
   * Sell item to player
   * @param {Object} item - Item to sell
   * @returns {number} - Gold required
   */
  getSellPrice(item) {
    if (this.type !== 'merchant' || !this.merchantData) return 0;
    return Math.ceil(item.value * this.merchantData.sellRate);
  }
  
  /**
   * Serialize NPC to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      dialogue: this.dialogue,
      position: this.position,
      rotation: this.rotation,
      merchantData: this.merchantData,
      quests: this.quests,
      icon: this.icon,
      color: this.color
    };
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NPC;
}
