/**
 * Skill class for RPG Engine
 * Represents a skill that a character can learn and use
 */
class Skill {
  /**
   * Create a new skill
   * @param {string} name - Skill name
   * @param {Object} options - Skill options
   */
  constructor(name, options = {}) {
    this.name = name;
    this.description = options.description || '';
    this.manaCost = options.manaCost || 0;
    this.cooldown = options.cooldown || 0;
    this.damage = options.damage || 0;
    this.healing = options.healing || 0;
    this.type = options.type || 'active'; // active, passive, buff, debuff
    this.targetType = options.targetType || 'single'; // single, area, self
    this.level = options.level || 1;
    this.maxLevel = options.maxLevel || 10;
    this.requirements = options.requirements || {}; // e.g., { str: 10, level: 5 }
  }
  
  /**
   * Level up the skill
   * @returns {boolean} - True if leveled up, false if max level reached
   */
  levelUp() {
    if (this.level < this.maxLevel) {
      this.level++;
      return true;
    }
    return false;
  }
  
  /**
   * Check if a character meets the requirements for this skill
   * @param {Object} character - Character to check requirements against
   * @returns {boolean} - True if requirements are met, false otherwise
   */
  meetsRequirements(character) {
    for (const [key, value] of Object.entries(this.requirements)) {
      if (character.attributes[key] !== undefined) {
        if (character.attributes[key] < value) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * Get skill info as a plain object
   * @returns {Object} - Skill data
   */
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      manaCost: this.manaCost,
      cooldown: this.cooldown,
      damage: this.damage,
      healing: this.healing,
      type: this.type,
      targetType: this.targetType,
      level: this.level,
      maxLevel: this.maxLevel,
      requirements: { ...this.requirements }
    };
  }
}

module.exports = Skill;
