/**
 * QuestManager - Quest system management
 * Handles quest activation, progress tracking, and completion
 */

export class QuestManager {
  constructor(quests, addMessageFn, updateQuestUIFn, updateMinimapFn) {
    this.quests = quests;
    this.activeQuests = [];
    this.addMessage = addMessageFn;
    this.updateQuestUI = updateQuestUIFn;
    this.updateMinimap = updateMinimapFn;
  }

  /**
   * Update quest progress
   * @param {string} objectiveId - ID of the objective
   * @param {number} amount - Amount to increment
   * @param {Object} player - Player character (for XP)
   * @param {Object} inventory - Inventory system (for rewards)
   * @param {Function} updateUIFn - Function to update UI
   * @param {Function} createLevelUpEffectFn - Function to create level up effect
   */
  updateProgress(objectiveId, amount, player, inventory, updateUIFn, createLevelUpEffectFn) {
    // Update progress for all active quests
    for (const quest of this.activeQuests) {
      if (!quest.active || quest.completed) continue;
      
      const objective = quest.objectives.find(obj => obj.id === objectiveId);
      if (objective && !objective.completed) {
        objective.current = Math.min(objective.current + amount, objective.target);
        if (objective.current >= objective.target) {
          objective.completed = true;
          this.addMessage(`✅ Quest Updated: ${objective.description}`, 'success');
        } else {
          this.addMessage(`Quest Progress: ${objective.description} (${objective.current}/${objective.target})`, 'info');
        }
        this.updateQuestUI(this.activeQuests);
        
        if (quest.objectives.every(obj => obj.completed)) {
          quest.completed = true;
          inventory.addGold(quest.rewards.gold);
          
          // Grant quest XP
          const xpResult = player.gainExperience(quest.rewards.xp);
          this.addMessage(`🎉 QUEST COMPLETE! Rewards: ${quest.rewards.xp} XP, ${quest.rewards.gold} Gold`, 'success');
          
          if (xpResult.leveledUp) {
            this.addMessage(`🎉 LEVEL UP! You are now level ${xpResult.currentLevel}!`, 'success');
            this.addMessage(`   ⬆️ +${player.availableAttributePoints} Attribute Points`, 'info');
            this.addMessage(`   🌟 +${player.availableSkillPoints} Skill Point`, 'info');
            createLevelUpEffectFn();
          }
          
          this.updateQuestUI(this.activeQuests);
          updateUIFn();
          
          // Unlock new quests
          if (quest.id === 'village_rescue') {
            this.quests['merchant_delivery'].available = true;
            this.addMessage(`📜 New quest available from the Traveling Merchant!`, 'info');
          }
        }
      }
    }
  }

  /**
   * Activate a quest
   * @param {string} questId - ID of the quest to activate
   */
  activateQuest(questId) {
    const quest = this.quests[questId];
    if (quest && !quest.active && !quest.completed) {
      quest.active = true;
      this.activeQuests.push(quest);
      this.addMessage(`📜 New Quest: ${quest.name}`, 'success');
      this.updateQuestUI(this.activeQuests);
      this.updateMinimap();
    }
  }

  /**
   * Get all active quests
   */
  getActiveQuests() {
    return this.activeQuests;
  }

  /**
   * Get all quests
   */
  getAllQuests() {
    return this.quests;
  }
}
