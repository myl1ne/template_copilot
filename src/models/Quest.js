/**
 * Quest class for RPG Engine
 * Represents a quest that can be assigned to characters
 */
class Quest {
  /**
   * Create a new quest
   * @param {string} id - Unique quest identifier
   * @param {string} title - Quest title
   * @param {Object} options - Quest options
   */
  constructor(id, title, options = {}) {
    this.id = id;
    this.title = title;
    this.description = options.description || '';
    this.type = options.type || 'main'; // main, side, daily, event
    this.status = 'available'; // available, in-progress, completed, failed
    this.level = options.level || 1;
    
    // Quest objectives
    this.objectives = options.objectives || [];
    
    // Quest requirements
    this.requirements = options.requirements || {};
    
    // Quest rewards
    this.rewards = {
      experience: options.experience || 0,
      gold: options.gold || 0,
      items: options.items || [],
      skills: options.skills || []
    };
    
    // Quest giver and location
    this.questGiver = options.questGiver || null;
    this.location = options.location || null;
    
    // Progress tracking
    this.progress = {};
    this.startTime = null;
    this.completionTime = null;
  }
  
  /**
   * Check if character meets quest requirements
   * @param {Object} character - Character to check
   * @returns {boolean} - True if requirements are met
   */
  canAccept(character) {
    // Check level requirement
    if (this.level && character.level < this.level) {
      return false;
    }
    
    // Check attribute requirements
    if (this.requirements.attributes) {
      for (const [attr, value] of Object.entries(this.requirements.attributes)) {
        if (character.attributes[attr] < value) {
          return false;
        }
      }
    }
    
    // Check prerequisite quests
    if (this.requirements.prerequisiteQuests) {
      // This would need to check against character's completed quests
      // Implementation depends on how quest history is tracked
    }
    
    return true;
  }
  
  /**
   * Start the quest
   */
  start() {
    if (this.status === 'available') {
      this.status = 'in-progress';
      this.startTime = new Date();
      
      // Initialize progress for each objective
      this.objectives.forEach(objective => {
        this.progress[objective.id] = {
          current: 0,
          target: objective.target,
          completed: false
        };
      });
    }
  }
  
  /**
   * Update objective progress
   * @param {string} objectiveId - Objective identifier
   * @param {number} amount - Amount to increment progress
   * @returns {boolean} - True if objective is now complete
   */
  updateProgress(objectiveId, amount = 1) {
    if (this.progress[objectiveId]) {
      this.progress[objectiveId].current += amount;
      
      if (this.progress[objectiveId].current >= this.progress[objectiveId].target) {
        this.progress[objectiveId].completed = true;
        
        // Check if all objectives are complete
        this.checkCompletion();
        
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if all objectives are complete
   * @returns {boolean} - True if quest is complete
   */
  checkCompletion() {
    const allComplete = this.objectives.every(
      objective => this.progress[objective.id]?.completed
    );
    
    if (allComplete && this.status === 'in-progress') {
      this.complete();
      return true;
    }
    
    return false;
  }
  
  /**
   * Complete the quest
   */
  complete() {
    this.status = 'completed';
    this.completionTime = new Date();
  }
  
  /**
   * Fail the quest
   */
  fail() {
    this.status = 'failed';
  }
  
  /**
   * Get quest progress percentage
   * @returns {number} - Progress percentage (0-100)
   */
  getProgressPercentage() {
    if (this.objectives.length === 0) return 0;
    
    const completedObjectives = this.objectives.filter(
      objective => this.progress[objective.id]?.completed
    ).length;
    
    return (completedObjectives / this.objectives.length) * 100;
  }
  
  /**
   * Get quest info as a plain object
   * @returns {Object} - Quest data
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      level: this.level,
      objectives: [...this.objectives],
      requirements: { ...this.requirements },
      rewards: { ...this.rewards },
      questGiver: this.questGiver,
      location: this.location,
      progress: { ...this.progress },
      startTime: this.startTime,
      completionTime: this.completionTime
    };
  }
}

module.exports = Quest;
