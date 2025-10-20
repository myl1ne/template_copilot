/**
 * UIManager - UI update and management
 * Handles all UI updates for player stats, inventory, quests, minimap, etc.
 */
import { GameConfig } from './GameConfig.js';

export class UIManager {
  constructor() {
    this.maxMessages = GameConfig.ui.maxMessages;
  }

  /**
   * Update player stats UI (HP, mana, stamina, level, XP)
   * @param {Object} player - Player character
   */
  updatePlayerStats(player) {
    const hpPercent = (player.stats.hp / player.stats.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-bar').textContent = Math.round(hpPercent) + '%';
    document.getElementById('hp-text').textContent = `${Math.round(player.stats.hp)} / ${player.stats.maxHp}`;
    
    const manaPercent = (player.stats.mana / player.stats.maxMana) * 100;
    document.getElementById('mana-bar').style.width = manaPercent + '%';
    document.getElementById('mana-bar').textContent = Math.round(manaPercent) + '%';
    document.getElementById('mana-text').textContent = `${Math.round(player.stats.mana)} / ${player.stats.maxMana}`;
    
    const staminaPercent = (player.stamina / player.maxStamina) * 100;
    document.getElementById('stamina-bar').style.width = staminaPercent + '%';
    document.getElementById('stamina-bar').textContent = Math.round(staminaPercent) + '%';
    document.getElementById('stamina-text').textContent = `${Math.round(player.stamina)} / ${player.maxStamina}`;
    
    document.getElementById('level-text').textContent = player.level;
    document.getElementById('xp-text').textContent = `${player.experience} / ${player.experienceToNextLevel}`;
    document.getElementById('attr-points-text').textContent = player.availableAttributePoints;
    document.getElementById('skill-points-text').textContent = player.availableSkillPoints;
    
    document.getElementById('pos-text').textContent = `${Math.round(player.position.x)}, ${Math.round(player.position.z)}`;
  }

  /**
   * Add a message to the message log
   * @param {string} text - Message text
   * @param {string} type - Message type (info, success, warning, error)
   */
  addMessage(text, type = 'info') {
    const messages = document.getElementById('messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    messages.appendChild(message);
    messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
    
    while (messages.children.length > this.maxMessages) {
      messages.removeChild(messages.firstChild);
    }
  }

  /**
   * Update quest panel UI
   * @param {Array} activeQuests - Array of active quests
   */
  updateQuestUI(activeQuests) {
    const questPanel = document.getElementById('quest-panel');
    if (!questPanel) return;
    
    if (activeQuests.length > 0) {
      questPanel.innerHTML = activeQuests.map(quest => `
        <div class="quest-header ${quest.completed ? 'completed' : ''}" style="margin-bottom: 15px;">
          <div class="quest-title">📜 ${quest.name}</div>
          <div class="quest-desc">${quest.description}</div>
        </div>
        <div class="objectives">
          ${quest.objectives.map(obj => `
            <div class="objective ${obj.completed ? 'completed' : ''}">
              ${obj.completed ? '✅' : '⭕'} ${obj.description}
              <span class="progress">(${obj.current}/${obj.target})</span>
            </div>
          `).join('')}
        </div>
        ${quest.completed ? `
          <div class="quest-rewards">
            🎁 Rewards: ${quest.rewards.xp} XP, ${quest.rewards.gold} Gold
          </div>
        ` : ''}
        <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
      `).join('');
    } else {
      questPanel.innerHTML = `
        <div class="quest-header">
          <div class="quest-title">📜 No Active Quests</div>
          <div class="quest-desc">Visit NPCs to find quests!</div>
        </div>
      `;
    }
  }

  /**
   * Update minimap
   * @param {Object} player - Player character
   * @param {Array} activeQuests - Array of active quests
   */
  updateMinimap(player, activeQuests) {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = GameConfig.ui.minimapScale;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(20, 30, 20, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = GameConfig.ui.minimapGridSize;
    for (let i = 0; i <= width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Function to convert world coords to minimap coords
    const worldToMap = (x, z) => {
      return {
        x: (x / scale) + width / 2,
        y: (z / scale) + height / 2
      };
    };
    
    // Draw quest objectives
    for (const quest of activeQuests) {
      if (quest.completed) continue;
      
      // Draw quest markers based on quest type
      const locations = GameConfig.questLocations[quest.id];
      if (locations) {
        locations.forEach(loc => {
          const pos = worldToMap(loc.x, loc.z);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
      
      // Draw NPC locations for delivery/return quests
      if (quest.returnTo) {
        const npcLoc = GameConfig.npcLocations[quest.returnTo];
        if (npcLoc) {
          const pos = worldToMap(npcLoc.x, npcLoc.z);
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Draw player position
    const playerPos = worldToMap(player.position.x, player.position.z);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw player direction indicator
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerPos.x, playerPos.y);
    ctx.lineTo(
      playerPos.x + Math.sin(player.rotation) * 8,
      playerPos.y + Math.cos(player.rotation) * 8
    );
    ctx.stroke();
  }

  /**
   * Update inventory UI
   * @param {Object} inventory - Inventory system
   * @param {Function} useItemFn - Function to call when item is used
   * @param {Function} updateCharacterAppearanceFn - Function to update character appearance
   */
  updateInventoryUI(inventory, useItemFn, updateCharacterAppearanceFn) {
    document.getElementById('gold-amount').textContent = inventory.gold;
    document.getElementById('trade-gold-amount').textContent = inventory.gold;
    document.getElementById('inv-count').textContent = inventory.items.length;
    document.getElementById('inv-max').textContent = inventory.maxSlots;
    
    const invGrid = document.getElementById('inventory-grid');
    invGrid.innerHTML = '';
    
    inventory.items.forEach((item) => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      const rarityColor = item.rarityColor || '#ffffff';
      const rarityIcon = item.rarityIcon || '';
      slot.innerHTML = `
        <div class="icon">${item.icon}</div>
        <div class="name" style="color: ${rarityColor};">${rarityIcon} ${item.name}</div>
      `;
      slot.onclick = () => useItemFn(item);
      slot.title = item.description || '';
      invGrid.appendChild(slot);
    });
    
    for (let i = inventory.items.length; i < inventory.maxSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      invGrid.appendChild(slot);
    }
    
    const eqGrid = document.getElementById('equipment-grid');
    eqGrid.innerHTML = '';
    
    const slots = ['head', 'chest', 'legs', 'weapon', 'shield'];
    slots.forEach(slotName => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      const item = inventory.equipment[slotName];
      if (item) {
        const rarityColor = item.rarityColor || '#ffffff';
        const rarityIcon = item.rarityIcon || '';
        slot.innerHTML = `
          <div class="icon">${item.icon}</div>
          <div class="name" style="color: ${rarityColor};">${rarityIcon} ${item.name}</div>
        `;
        slot.title = item.description || '';
        slot.onclick = () => {
          // Unequip item
          inventory.addItem(item);
          inventory.equipment[slotName] = null;
          updateCharacterAppearanceFn();
          this.updateInventoryUI(inventory, useItemFn, updateCharacterAppearanceFn);
          this.addMessage(`Unequipped ${item.name}`, 'info');
        };
      } else {
        slot.innerHTML = `<div class="name">${slotName}</div>`;
      }
      eqGrid.appendChild(slot);
    });
  }

  /**
   * Show/hide interaction prompt
   * @param {boolean} show - Whether to show the prompt
   * @param {string} objectName - Name of the object to interact with
   */
  updateInteractionPrompt(show, objectName = '') {
    const prompt = document.getElementById('interaction-prompt');
    if (show) {
      prompt.classList.add('show');
      document.getElementById('interaction-text').textContent = `Press E to interact with ${objectName}`;
    } else {
      prompt.classList.remove('show');
    }
  }

  /**
   * Show monster health bar
   * @param {Object} monster - Monster object
   */
  showMonsterHealthBar(monster) {
    const healthBar = document.getElementById('monster-health-bar');
    const nameElement = document.getElementById('monster-name');
    const hpBar = document.getElementById('monster-hp-bar');
    const hpText = document.getElementById('monster-hp-text');
    
    healthBar.classList.add('show');
    nameElement.textContent = monster.type.toUpperCase() + (monster.isBoss ? ' (BOSS)' : '');
    
    const hpPercent = (monster.hp / monster.maxHp) * 100;
    hpBar.style.width = hpPercent + '%';
    hpText.textContent = `${Math.round(monster.hp)} / ${monster.maxHp}`;
  }

  /**
   * Hide monster health bar
   */
  hideMonsterHealthBar() {
    const healthBar = document.getElementById('monster-health-bar');
    healthBar.classList.remove('show');
  }

  /**
   * Update monster health bar
   * @param {Object} monster - Monster object
   */
  updateMonsterHealthBar(monster) {
    if (monster && monster.alive) {
      const hpBar = document.getElementById('monster-hp-bar');
      const hpText = document.getElementById('monster-hp-text');
      const hpPercent = (monster.hp / monster.maxHp) * 100;
      hpBar.style.width = hpPercent + '%';
      hpText.textContent = `${Math.round(monster.hp)} / ${monster.maxHp}`;
    } else if (monster && !monster.alive) {
      this.hideMonsterHealthBar();
    }
  }

  /**
   * Update animation state label
   * @param {string} state - Animation state
   */
  showAnimationLabel(state) {
    const label = document.getElementById('animation-state');
    const labels = {
      idle: '💤 Idle',
      walking: '🚶 Walking',
      running: '🏃 Running',
      attacking: '⚔️ Attacking!',
      resting: '😌 Resting...'
    };
    label.textContent = labels[state] || state;
    label.classList.add('show');
    setTimeout(() => label.classList.remove('show'), 1000);
  }

  /**
   * Update attack cooldown UI
   * @param {number} lastAttackTime - Last attack timestamp
   * @param {number} attackCooldown - Attack cooldown duration
   */
  updateAttackCooldownUI(lastAttackTime, attackCooldown) {
    const currentTime = Date.now() / 1000;
    const timeSinceAttack = currentTime - lastAttackTime;
    const cooldownRemaining = Math.max(0, attackCooldown - timeSinceAttack);
    const cooldownPercent = cooldownRemaining / attackCooldown;
    
    const circle = document.getElementById('cooldown-circle');
    const circumference = 163.36; // 2 * PI * 26
    const offset = circumference * cooldownPercent;
    
    if (circle) {
      circle.style.strokeDashoffset = offset;
    }
    
    // Change icon color based on cooldown
    const attackIcon = document.getElementById('attack-cooldown');
    if (attackIcon) {
      if (cooldownRemaining > 0) {
        attackIcon.style.borderColor = '#ef4444';
        attackIcon.style.opacity = '0.6';
      } else {
        attackIcon.style.borderColor = '#4ade80';
        attackIcon.style.opacity = '1';
      }
    }
  }
}
