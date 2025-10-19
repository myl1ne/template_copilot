/**
 * Character class for RPG Engine
 * Represents a character with combat stats, attributes, and skills
 */
class Character {
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
    
    // Skills - array of skill objects
    this.skills = options.skills || [];
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
   * Get character info as a plain object
   * @returns {Object} - Character data
   */
  toJSON() {
    return {
      name: this.name,
      stats: { ...this.stats },
      attributes: { ...this.attributes },
      skills: [...this.skills]
    };
  }
}

module.exports = Character;
