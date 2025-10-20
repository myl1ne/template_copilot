/**
 * Character class for RPG Engine (Browser Version)
 * Represents a character with combat stats, attributes, skills, and progression
 */
export class Character {
  /**
   * Create a new character
   * @param {string} name - Character name
   * @param {Object} options - Character options
   */
  constructor(name, options = {}) {
    this.name = name;
    
    // Combat Stats
    this.stats = {
      hp: options.hp || 100,
      maxHp: options.maxHp || options.hp || 100,
      mana: options.mana || 100,
      maxMana: options.maxMana || options.mana || 100,
      armor: options.armor || 0,
      dodge: options.dodge || 0,
      attackSpeed: options.attackSpeed || 1.0,
      hpRegen: options.hpRegen || 1,
      manaRegen: options.manaRegen || 1
    };
    
    // Attributes
    this.attributes = {
      str: options.str || 10,  // Strength
      dex: options.dex || 10,  // Dexterity
      con: options.con || 10,  // Constitution
      int: options.int || 10,  // Intelligence
      wiz: options.wiz || 10,  // Wisdom
      cha: options.cha || 10   // Charisma
    };
    
    // Progression
    this.level = options.level || 1;
    this.experience = options.experience || 0;
    this.experienceToNextLevel = this.calculateExperienceForLevel(this.level + 1);
    this.availableAttributePoints = options.availableAttributePoints || 0;
    this.availableSkillPoints = options.availableSkillPoints || 0;
    
    // Skills - array of skill objects
    this.skills = options.skills || [];
    this.availableSpells = options.availableSpells || []; // Spells available to learn
  }
  
  /**
   * Add a skill to the character
   * @param {Object} skill - Skill object
   */
  addSkill(skill) {
    this.skills.push(skill);
  }
  
  /**
   * Remove a skill from the character
   * @param {string} skillName - Name of the skill to remove
   * @returns {boolean} - True if skill was removed, false otherwise
   */
  removeSkill(skillName) {
    const index = this.skills.findIndex(s => s.name === skillName);
    if (index !== -1) {
      this.skills.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Get a skill by name
   * @param {string} skillName - Name of the skill
   * @returns {Object|null} - Skill object or null if not found
   */
  getSkill(skillName) {
    return this.skills.find(s => s.name === skillName) || null;
  }
  
  /**
   * Take damage
   * @param {number} damage - Amount of damage to take
   * @returns {number} - Actual damage taken after armor
   */
  takeDamage(damage) {
    const actualDamage = Math.max(0, damage - this.stats.armor);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);
    return actualDamage;
  }
  
  /**
   * Heal the character
   * @param {number} amount - Amount to heal
   * @returns {number} - Actual amount healed
   */
  heal(amount) {
    const oldHp = this.stats.hp;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    return this.stats.hp - oldHp;
  }
  
  /**
   * Restore mana
   * @param {number} amount - Amount of mana to restore
   * @returns {number} - Actual amount restored
   */
  restoreMana(amount) {
    const oldMana = this.stats.mana;
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
    return this.stats.mana - oldMana;
  }
  
  /**
   * Use mana
   * @param {number} amount - Amount of mana to use
   * @returns {boolean} - True if mana was available and used, false otherwise
   */
  useMana(amount) {
    if (this.stats.mana >= amount) {
      this.stats.mana -= amount;
      return true;
    }
    return false;
  }
  
  /**
   * Check if character is alive
   * @returns {boolean} - True if alive, false otherwise
   */
  isAlive() {
    return this.stats.hp > 0;
  }
  
  /**
   * Regenerate HP and Mana
   */
  regenerate() {
    this.heal(this.stats.hpRegen);
    this.restoreMana(this.stats.manaRegen);
  }
  
  /**
   * Calculate experience required for a given level
   * @param {number} level - Target level
   * @returns {number} - Experience required
   */
  calculateExperienceForLevel(level) {
    // XP formula: 100 * level^2 (exponential growth)
    return Math.floor(100 * Math.pow(level, 2));
  }
  
  /**
   * Gain experience points
   * @param {number} amount - Amount of XP to gain
   * @returns {Object} - Result with leveledUp flag and new level
   */
  gainExperience(amount) {
    this.experience += amount;
    let leveledUp = false;
    let levelsGained = 0;
    
    // Check for level ups (can level up multiple times)
    while (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
      leveledUp = true;
      levelsGained++;
    }
    
    return {
      leveledUp,
      levelsGained,
      currentLevel: this.level,
      currentExperience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel
    };
  }
  
  /**
   * Level up the character
   * @returns {Object} - New level and attribute bonuses
   */
  levelUp() {
    this.level++;
    this.experienceToNextLevel = this.calculateExperienceForLevel(this.level + 1);
    
    // Grant attribute points and skill points
    this.availableAttributePoints += 3;
    this.availableSkillPoints += 1;
    
    // Automatic stat increases on level up
    const hpIncrease = Math.floor(5 + (this.attributes.con * 0.5));
    const manaIncrease = Math.floor(3 + (this.attributes.wiz * 0.5));
    
    this.stats.maxHp += hpIncrease;
    this.stats.maxMana += manaIncrease;
    
    // Heal to full on level up
    this.stats.hp = this.stats.maxHp;
    this.stats.mana = this.stats.maxMana;
    
    return {
      newLevel: this.level,
      hpIncrease,
      manaIncrease,
      attributePoints: this.availableAttributePoints,
      skillPoints: this.availableSkillPoints
    };
  }
  
  /**
   * Spend attribute points to increase an attribute
   * @param {string} attributeName - Name of attribute (str, dex, con, int, wiz, cha)
   * @param {number} points - Number of points to spend (default 1)
   * @returns {boolean} - True if successful, false if not enough points
   */
  spendAttributePoints(attributeName, points = 1) {
    if (this.availableAttributePoints < points) {
      return false;
    }
    
    if (!this.attributes.hasOwnProperty(attributeName)) {
      return false;
    }
    
    this.attributes[attributeName] += points;
    this.availableAttributePoints -= points;
    
    // Update derived stats based on attributes
    this.updateDerivedStats();
    
    return true;
  }
  
  /**
   * Update derived stats based on attributes
   */
  updateDerivedStats() {
    // Constitution affects max HP
    const baseHp = 100;
    const hpBonus = Math.floor((this.attributes.con - 10) * 5);
    const newMaxHp = baseHp + hpBonus + ((this.level - 1) * Math.floor(5 + (this.attributes.con * 0.5)));
    const hpPercentage = this.stats.hp / this.stats.maxHp;
    this.stats.maxHp = newMaxHp;
    this.stats.hp = Math.floor(this.stats.maxHp * hpPercentage);
    
    // Wisdom affects max Mana
    const baseMana = 100;
    const manaBonus = Math.floor((this.attributes.wiz - 10) * 5);
    const newMaxMana = baseMana + manaBonus + ((this.level - 1) * Math.floor(3 + (this.attributes.wiz * 0.5)));
    const manaPercentage = this.stats.mana / this.stats.maxMana;
    this.stats.maxMana = newMaxMana;
    this.stats.mana = Math.floor(this.stats.maxMana * manaPercentage);
    
    // Dexterity affects dodge
    this.stats.dodge = Math.floor((this.attributes.dex - 10) * 0.5);
    
    // Strength affects armor (indirectly through toughness)
    this.stats.armor = Math.floor((this.attributes.str - 10) * 0.3);
  }
  
  /**
   * Learn a new spell/skill using skill points
   * @param {Object} spell - Spell/skill object to learn
   * @returns {boolean} - True if learned, false if not enough points or already known
   */
  learnSpell(spell) {
    // Check if already known
    if (this.skills.some(s => s.name === spell.name)) {
      return false;
    }
    
    // Check if available
    const isAvailable = this.availableSpells.some(s => s.name === spell.name);
    if (!isAvailable) {
      return false;
    }
    
    // Check skill points
    if (this.availableSkillPoints < 1) {
      return false;
    }
    
    // Check requirements
    if (!spell.meetsRequirements(this)) {
      return false;
    }
    
    // Learn the spell
    this.skills.push(spell);
    this.availableSkillPoints--;
    
    return true;
  }
  
  /**
   * Add a spell to the available spells list
   * @param {Object} spell - Spell to make available
   */
  addAvailableSpell(spell) {
    if (!this.availableSpells.some(s => s.name === spell.name)) {
      this.availableSpells.push(spell);
    }
  }
  
  /**
   * Get character info as a plain object
   * @returns {Object} - Character data
   */
  toJSON() {
    return {
      name: this.name,
      level: this.level,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      availableAttributePoints: this.availableAttributePoints,
      availableSkillPoints: this.availableSkillPoints,
      stats: { ...this.stats },
      attributes: { ...this.attributes },
      skills: [...this.skills],
      availableSpells: [...this.availableSpells]
    };
  }
}
