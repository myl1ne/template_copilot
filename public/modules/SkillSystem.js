/**
 * SkillSystem - Skill management and hotbar
 * Handles skill hotbar, cooldowns, and skill usage
 */
import { Skill } from './Skill.js';
import { GameConfig } from './GameConfig.js';

export class SkillSystem {
  constructor(player, addMessageFn, createSkillEffectFn, showMonsterHealthBarFn, updateUIFn) {
    this.player = player;
    this.addMessage = addMessageFn;
    this.createSkillEffect = createSkillEffectFn;
    this.showMonsterHealthBar = showMonsterHealthBarFn;
    this.updateUI = updateUIFn;
    this.hotbar = new Array(GameConfig.skills.hotbarSlots).fill(null);
    this.cooldowns = {};
  }

  /**
   * Initialize starter skills for player
   */
  initStarterSkills() {
    const powerStrike = new Skill('Power Strike', {
      description: 'A powerful melee attack',
      manaCost: 15,
      damage: 50,
      type: 'active',
      targetType: 'single',
      requirements: { str: 15 }
    });

    const secondWind = new Skill('Second Wind', {
      description: 'Restore HP over time',
      manaCost: 20,
      healing: 30,
      type: 'active',
      targetType: 'self',
      requirements: { con: 12 }
    });

    this.player.addSkill(powerStrike);
    this.player.addSkill(secondWind);

    // Add to hotbar
    this.hotbar[0] = powerStrike;
    this.hotbar[1] = secondWind;
  }

  /**
   * Initialize available spells to learn
   */
  initAvailableSpells() {
    const fireball = new Skill('Fireball', {
      description: 'A blazing ball of fire',
      manaCost: 25,
      damage: 60,
      type: 'active',
      targetType: 'single',
      requirements: { int: 10, level: 3 }
    });

    const iceShield = new Skill('Ice Shield', {
      description: 'Creates a protective shield of ice',
      manaCost: 30,
      type: 'buff',
      targetType: 'self',
      requirements: { int: 12, wiz: 12, level: 5 }
    });

    this.player.addAvailableSpell(fireball);
    this.player.addAvailableSpell(iceShield);
  }

  /**
   * Update hotbar UI
   */
  updateHotbar() {
    const hotbarSlots = document.querySelectorAll('#hotbar .hotbar-slot');
    hotbarSlots.forEach((slot, index) => {
      const skill = this.hotbar[index];
      if (skill) {
        const existingIcon = slot.querySelector('.skill-icon');
        if (!existingIcon) {
          const icon = document.createElement('div');
          icon.className = 'skill-icon';
          icon.style.fontSize = '20px';
          icon.textContent = skill.type === 'active' ? '🔥' : '🛡️';
          slot.insertBefore(icon, slot.firstChild);
        }
        // Add cooldown overlay if on cooldown
        const now = Date.now() / 1000;
        const cooldownEnd = this.cooldowns[skill.name] || 0;
        if (now < cooldownEnd) {
          slot.style.opacity = '0.5';
        } else {
          slot.style.opacity = '1';
        }
      } else {
        const existingIcon = slot.querySelector('.skill-icon');
        if (existingIcon) existingIcon.remove();
        slot.style.opacity = '1';
      }
    });
  }

  /**
   * Use skill from hotbar
   * @param {number} slotIndex - Hotbar slot index (0-4)
   * @param {Array} environmentObjects - All environment objects (for targeting)
   * @param {Function} hideMonsterHealthBarFn - Function to hide monster health bar
   * @param {Object} inventory - Inventory system
   * @param {Object} LootSystem - Loot system
   * @param {Function} createLevelUpEffectFn - Function to create level up effect
   */
  useSkillFromHotbar(slotIndex, environmentObjects, hideMonsterHealthBarFn, inventory, LootSystem, createLevelUpEffectFn) {
    const skill = this.hotbar[slotIndex];
    if (!skill) {
      this.addMessage('No skill in that slot!', 'warning');
      return;
    }
    
    // Check cooldown
    const now = Date.now() / 1000;
    const cooldownEnd = this.cooldowns[skill.name] || 0;
    if (now < cooldownEnd) {
      const remaining = Math.ceil(cooldownEnd - now);
      this.addMessage(`${skill.name} on cooldown (${remaining}s)`, 'warning');
      return;
    }
    
    // Check mana
    if (!this.player.useMana(skill.manaCost)) {
      this.addMessage(`Not enough mana for ${skill.name}!`, 'warning');
      return;
    }
    
    // Use the skill
    if (skill.healing && skill.targetType === 'self') {
      const healed = this.player.heal(skill.healing);
      this.addMessage(`${skill.name}: Healed ${healed} HP!`, 'success');
      this.createSkillEffect(this.player.position, 0x22c55e); // Green for healing
    } else if (skill.damage) {
      // Find nearest monster to damage
      let nearestMonster = null;
      let nearestDist = 5; // Skill range
      
      for (const obj of environmentObjects) {
        if ((obj.type === 'goblin' || obj.type === 'skeleton' || obj.type === 'spider' || 
             obj.type === 'wolf' || obj.type === 'goblin boss' || obj.type === 'skeleton lord' || 
             obj.type === 'dire wolf') && obj.alive) {
          const dx = obj.position.x - this.player.position.x;
          const dz = obj.position.z - this.player.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < nearestDist) {
            nearestMonster = obj;
            nearestDist = dist;
          }
        }
      }
      
      if (nearestMonster) {
        // Deal damage to monster
        nearestMonster.hp -= skill.damage;
        this.addMessage(`${skill.name}: ${skill.damage} damage to ${nearestMonster.type}!`, 'success');
        this.createSkillEffect(nearestMonster.position, 0xff6600); // Orange for damage
        this.showMonsterHealthBar(nearestMonster);
        
        if (nearestMonster.hp <= 0) {
          nearestMonster.alive = false;
          hideMonsterHealthBarFn();
          
          // Grant XP
          const xpReward = GameConfig.xpRewards[nearestMonster.type] || 50;
          const xpResult = this.player.gainExperience(xpReward);
          this.addMessage(`💰 Gained ${xpReward} XP!`, 'success');
          
          // Generate and drop loot
          const loot = LootSystem.generateLoot(nearestMonster.type);
          if (loot.gold > 0) {
            inventory.addGold(loot.gold);
          }
          if (loot.items && loot.items.length > 0) {
            for (const item of loot.items) {
              if (inventory.addItem(item)) {
                this.addMessage(`${item.rarityIcon} Looted: ${item.name}!`, 'success');
              }
            }
          }
          
          if (xpResult.leveledUp) {
            this.addMessage(`🎉 LEVEL UP! You are now level ${xpResult.currentLevel}!`, 'success');
            createLevelUpEffectFn();
          }
          this.updateUI();
        }
      } else {
        this.addMessage(`${skill.name}: No target in range!`, 'warning');
      }
    } else if (skill.type === 'buff') {
      this.addMessage(`${skill.name} activated!`, 'success');
      this.createSkillEffect(this.player.position, 0x60a5fa); // Blue for buffs
    }
    
    // Set cooldown
    this.cooldowns[skill.name] = now + skill.cooldown;
    this.updateHotbar();
    this.updateUI();
  }

  /**
   * Learn a spell from available spells
   * @param {Skill} spell - Spell to learn
   * @returns {boolean} - True if learned successfully
   */
  learnSpell(spell) {
    if (this.player.learnSpell(spell)) {
      this.addMessage(`✨ Learned ${spell.name}!`, 'success');
      // Add to hotbar if there's space
      for (let i = 0; i < GameConfig.skills.hotbarSlots; i++) {
        if (!this.hotbar[i]) {
          this.hotbar[i] = this.player.skills[this.player.skills.length - 1];
          this.updateHotbar();
          break;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Get hotbar
   */
  getHotbar() {
    return this.hotbar;
  }

  /**
   * Get cooldowns
   */
  getCooldowns() {
    return this.cooldowns;
  }
}
