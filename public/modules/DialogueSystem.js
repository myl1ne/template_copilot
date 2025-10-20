/**
 * DialogueSystem - NPC dialogue and trading management
 * Handles NPC interactions, quest dialogues, and merchant trading
 */
import { GameConfig } from './GameConfig.js';
import { Item } from './InventorySystem.js';

export class DialogueSystem {
  constructor(
    quests,
    questManager,
    addMessageFn,
    closeDialogueFn,
    closeTradingFn,
    updatePlayerItemsInTradeUIFn
  ) {
    this.quests = quests;
    this.questManager = questManager;
    this.addMessage = addMessageFn;
    this.closeDialogue = closeDialogueFn;
    this.closeTrading = closeTradingFn;
    this.updatePlayerItemsInTradeUI = updatePlayerItemsInTradeUIFn;
    this.merchantInventory = [];
  }

  /**
   * Initialize merchant inventory
   * @param {Object} LootSystem - Loot system for generating rare items
   */
  initMerchantInventory(LootSystem) {
    this.merchantInventory = [
      new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }),
      new Item('mana_pot', 'Mana Potion', '🔮', 'consumable', 40, { manaRestore: 30 }),
      new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }),
    ];
    
    // Add rare items from loot system
    const rareMerchantItems = LootSystem.generateMerchantInventory(7);
    this.merchantInventory = [...this.merchantInventory, ...rareMerchantItems];
  }

  /**
   * Open trading panel
   * @param {Object} npc - NPC to trade with
   * @param {Object} inventory - Player inventory
   * @param {Function} buyItemFn - Function to buy item
   * @param {Function} sellItemFn - Function to sell item
   */
  openTrading(npc, inventory, buyItemFn, sellItemFn) {
    const panel = document.getElementById('trading-panel');
    document.getElementById('merchant-name').textContent = npc.name;
    document.getElementById('trade-gold-amount').textContent = inventory.gold;
    
    const merchantItems = document.getElementById('merchant-items');
    merchantItems.innerHTML = '';
    
    this.merchantInventory.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'trade-item';
      const rarityColor = item.rarityColor || '#ffffff';
      const rarityIcon = item.rarityIcon || '';
      itemDiv.innerHTML = `
        <div class="item-info">
          <div class="icon">${item.icon}</div>
          <div class="details">
            <div class="name" style="color: ${rarityColor};">${rarityIcon} ${item.name}</div>
            <div class="price">💰 ${Math.ceil(item.value * GameConfig.inventory.merchantPriceMultiplier)} gold</div>
          </div>
        </div>
      `;
      itemDiv.onclick = () => buyItemFn(item);
      itemDiv.title = item.description || '';
      merchantItems.appendChild(itemDiv);
    });
    
    const playerItems = document.getElementById('player-items');
    playerItems.innerHTML = '';
    
    inventory.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'trade-item';
      const rarityColor = item.rarityColor || '#ffffff';
      const rarityIcon = item.rarityIcon || '';
      itemDiv.innerHTML = `
        <div class="item-info">
          <div class="icon">${item.icon}</div>
          <div class="details">
            <div class="name" style="color: ${rarityColor};">${rarityIcon} ${item.name}</div>
            <div class="price">💰 ${Math.floor(item.value * GameConfig.inventory.sellPriceMultiplier)} gold</div>
          </div>
        </div>
      `;
      itemDiv.onclick = () => sellItemFn(item);
      itemDiv.title = item.description || '';
      playerItems.appendChild(itemDiv);
    });
    
    panel.classList.add('show');
  }

  /**
   * Show dialogue with NPC
   * @param {Object} npc - NPC to talk to
   * @param {Array} npcs - All NPCs (for finding NPCs by ID)
   */
  showDialogue(npc, npcs) {
    const panel = document.getElementById('dialogue-panel');
    document.getElementById('npc-name').textContent = npc.name;
    document.getElementById('dialogue-text').textContent = npc.dialogue[0];
    
    const options = document.getElementById('dialogue-options');
    options.innerHTML = '';
    
    if (npc.type === 'quest_giver') {
      this._addQuestGiverDialogue(npc, options);
    }
    
    if (npc.type === 'merchant') {
      this._addMerchantDialogue(npc, options);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dialogue-btn secondary';
    closeBtn.textContent = 'Farewell';
    closeBtn.onclick = this.closeDialogue;
    options.appendChild(closeBtn);
    
    panel.classList.add('show');
  }

  /**
   * Add quest giver dialogue options
   * @private
   */
  _addQuestGiverDialogue(npc, options) {
    if (npc.id === 'elder') {
      this._addElderDialogue(options);
    } else if (npc.id === 'hermit') {
      this._addHermitDialogue(options);
    } else if (npc.id === 'guard') {
      this._addGuardDialogue(options);
    }
  }

  /**
   * Add elder dialogue options
   * @private
   */
  _addElderDialogue(options) {
    const villageQuest = this.quests['village_rescue'];
    const skeletonQuest = this.quests['skeleton_threat'];
    
    // Offer village rescue quest
    if (!villageQuest.active && !villageQuest.completed) {
      const offerQuestBtn = document.createElement('button');
      offerQuestBtn.className = 'dialogue-btn';
      offerQuestBtn.textContent = 'What troubles the village?';
      offerQuestBtn.onclick = () => {
        document.getElementById('dialogue-text').textContent = 
          "Brave adventurer! Goblins have been raiding our village. Their camp is to the south. Will you help us defeat them?";
        
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'dialogue-btn';
        acceptBtn.textContent = 'I will help!';
        acceptBtn.onclick = () => {
          this.questManager.activateQuest('village_rescue');
          document.getElementById('dialogue-text').textContent = 
            "Thank you, hero! The goblin camp is to the south, around coordinates (-20, -20). Defeat them and return to me!";
          setTimeout(() => this.closeDialogue(), 1500);
        };
        options.innerHTML = '';
        options.appendChild(acceptBtn);
        
        const declineBtn = document.createElement('button');
        declineBtn.className = 'dialogue-btn secondary';
        declineBtn.textContent = 'Not right now';
        declineBtn.onclick = this.closeDialogue;
        options.appendChild(declineBtn);
      };
      options.appendChild(offerQuestBtn);
    } else if (villageQuest.completed && !skeletonQuest.active && !skeletonQuest.completed) {
      // Offer skeleton quest after village rescue
      document.getElementById('dialogue-text').textContent = 
        "Thank you again, brave warrior! The village is forever in your debt.";
      
      const skeletonBtn = document.createElement('button');
      skeletonBtn.className = 'dialogue-btn';
      skeletonBtn.textContent = 'Any other threats?';
      skeletonBtn.onclick = () => {
        document.getElementById('dialogue-text').textContent = 
          "Now that you mention it... undead skeletons have been spotted near the old graveyard to the east. Will you help us again?";
        
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'dialogue-btn';
        acceptBtn.textContent = 'I\'ll deal with the undead!';
        acceptBtn.onclick = () => {
          this.questManager.activateQuest('skeleton_threat');
          document.getElementById('dialogue-text').textContent = 
            "May the light guide you, hero! The graveyard is to the east, around coordinates (30, 10).";
          setTimeout(() => this.closeDialogue(), 1500);
        };
        options.innerHTML = '';
        options.appendChild(acceptBtn);
        
        const declineBtn = document.createElement('button');
        declineBtn.className = 'dialogue-btn secondary';
        declineBtn.textContent = 'Not right now';
        declineBtn.onclick = this.closeDialogue;
        options.appendChild(declineBtn);
      };
      options.appendChild(skeletonBtn);
    }
  }

  /**
   * Add hermit dialogue options
   * @private
   */
  _addHermitDialogue(options) {
    const merchantDeliveryQuest = this.questManager.getActiveQuests().find(q => q.id === 'merchant_delivery');
    
    if (merchantDeliveryQuest && !merchantDeliveryQuest.objectives[1].completed) {
      const foundBtn = document.createElement('button');
      foundBtn.className = 'dialogue-btn';
      foundBtn.textContent = 'I found you! (Complete objective)';
      foundBtn.onclick = () => {
        // This will be called from world-rpg.js with proper context
        document.getElementById('dialogue-text').textContent = 
          "Excellent! You found me. Now, do you have the package?";
      };
      options.appendChild(foundBtn);
    }
  }

  /**
   * Add guard dialogue options
   * @private
   */
  _addGuardDialogue(options) {
    const spiderQuest = this.quests['spider_cave'];
    
    if (this.quests['village_rescue'].completed && !spiderQuest.active && !spiderQuest.completed) {
      const spiderBtn = document.createElement('button');
      spiderBtn.className = 'dialogue-btn';
      spiderBtn.textContent = 'Any threats I should know about?';
      spiderBtn.onclick = () => {
        document.getElementById('dialogue-text').textContent = 
          "Giant spiders have infested a cave to the northeast. Travelers are afraid to use that route. Can you clear them out?";
        
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'dialogue-btn';
        acceptBtn.textContent = 'I\'ll clear the spider den!';
        acceptBtn.onclick = () => {
          this.questManager.activateQuest('spider_cave');
          document.getElementById('dialogue-text').textContent = 
            "Thank you! The spider den is northeast, around coordinates (25, -25). Be careful!";
          setTimeout(() => this.closeDialogue(), 1500);
        };
        options.innerHTML = '';
        options.appendChild(acceptBtn);
        
        const declineBtn = document.createElement('button');
        declineBtn.className = 'dialogue-btn secondary';
        declineBtn.textContent = 'Not interested';
        declineBtn.onclick = this.closeDialogue;
        options.appendChild(declineBtn);
      };
      options.appendChild(spiderBtn);
    }
  }

  /**
   * Add merchant dialogue options
   * @private
   */
  _addMerchantDialogue(npc, options) {
    const wolfQuest = this.quests['wolf_pack'];
    
    if (this.quests['merchant_delivery'].available && !this.quests['merchant_delivery'].active && !this.quests['merchant_delivery'].completed) {
      const questBtn = document.createElement('button');
      questBtn.className = 'dialogue-btn';
      questBtn.textContent = 'Do you need any help?';
      questBtn.onclick = () => {
        document.getElementById('dialogue-text').textContent = 
          "Actually, yes! I need someone to deliver a package to the Forest Hermit who lives deep in the woods to the southwest. Will you help?";
        // Additional logic will be in world-rpg.js
      };
      options.appendChild(questBtn);
    }
  }

  /**
   * Interact with NPC
   * @param {Object} npc - NPC to interact with
   * @param {Object} inventory - Player inventory
   * @param {Function} buyItemFn - Function to buy item
   * @param {Function} sellItemFn - Function to sell item
   * @param {Array} npcs - All NPCs
   */
  interactWithNPC(npc, inventory, buyItemFn, sellItemFn, npcs) {
    if (npc.type === 'merchant') {
      this.openTrading(npc, inventory, buyItemFn, sellItemFn);
    } else if (npc.type === 'quest_giver') {
      this.showDialogue(npc, npcs);
    } else {
      this.showDialogue(npc, npcs);
    }
  }
}
