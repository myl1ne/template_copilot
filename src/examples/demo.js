/**
 * RPG Engine - Usage Examples
 * Demonstrates how to use the Character, Skill, and Quest data structures
 */

const { Character, Skill, Quest } = require('../models');

console.log('=== RPG Engine Examples ===\n');

// Example 1: Creating a Character
console.log('--- Creating a Character ---');
const warrior = new Character('Thorin the Brave', {
  hp: 150,
  maxHp: 150,
  mana: 50,
  maxMana: 50,
  armor: 10,
  dodge: 5,
  attackSpeed: 1.2,
  hpRegen: 2,
  manaRegen: 1,
  str: 18,
  dex: 12,
  con: 16,
  int: 8,
  wiz: 10,
  cha: 14
});

console.log(`Created character: ${warrior.name}`);
console.log(`Level: ${warrior.level}`);
console.log(`Experience: ${warrior.experience}/${warrior.experienceToNextLevel}`);
console.log(`HP: ${warrior.stats.hp}/${warrior.stats.maxHp}`);
console.log(`Mana: ${warrior.stats.mana}/${warrior.stats.maxMana}`);
console.log(`STR: ${warrior.attributes.str}, DEX: ${warrior.attributes.dex}, CON: ${warrior.attributes.con}`);
console.log();

// Example 2: Creating Skills and Spells
console.log('--- Creating Skills and Spells ---');
const powerStrike = new Skill('Power Strike', {
  description: 'A powerful melee attack that deals heavy damage',
  manaCost: 15,
  cooldown: 5,
  damage: 50,
  type: 'active',
  targetType: 'single',
  level: 1,
  maxLevel: 5,
  requirements: { str: 15 }
});

const secondWind = new Skill('Second Wind', {
  description: 'Restore HP over time',
  manaCost: 20,
  cooldown: 30,
  healing: 30,
  type: 'active',
  targetType: 'self',
  level: 1,
  maxLevel: 3,
  requirements: { con: 12 }
});

// Create some spells to be learned
const fireball = new Skill('Fireball', {
  description: 'A blazing ball of fire that damages enemies',
  manaCost: 25,
  cooldown: 8,
  damage: 60,
  type: 'active',
  targetType: 'single',
  level: 1,
  maxLevel: 5,
  requirements: { int: 10, level: 3 }
});

const iceShield = new Skill('Ice Shield', {
  description: 'Creates a protective shield of ice',
  manaCost: 30,
  cooldown: 15,
  type: 'buff',
  targetType: 'self',
  level: 1,
  maxLevel: 3,
  requirements: { int: 12, wiz: 12, level: 5 }
});

const heal = new Skill('Heal', {
  description: 'Restore health with holy magic',
  manaCost: 35,
  cooldown: 12,
  healing: 50,
  type: 'active',
  targetType: 'single',
  level: 1,
  maxLevel: 5,
  requirements: { wiz: 15, level: 4 }
});

warrior.addSkill(powerStrike);
warrior.addSkill(secondWind);

// Add available spells
warrior.addAvailableSpell(fireball);
warrior.addAvailableSpell(iceShield);
warrior.addAvailableSpell(heal);

console.log(`${warrior.name} learned: ${powerStrike.name} (${powerStrike.type})`);
console.log(`  - Mana Cost: ${powerStrike.manaCost}, Damage: ${powerStrike.damage}`);
console.log(`${warrior.name} learned: ${secondWind.name} (${secondWind.type})`);
console.log(`  - Mana Cost: ${secondWind.manaCost}, Healing: ${secondWind.healing}`);
console.log(`\nAvailable spells to learn: ${warrior.availableSpells.map(s => s.name).join(', ')}`);
console.log();

// Example 3: Combat Simulation
console.log('--- Combat Simulation ---');
console.log(`${warrior.name} HP before: ${warrior.stats.hp}`);
const damageTaken = warrior.takeDamage(35);
console.log(`${warrior.name} takes ${damageTaken} damage after armor!`);
console.log(`${warrior.name} HP after: ${warrior.stats.hp}`);

if (warrior.useMana(secondWind.manaCost)) {
  const healed = warrior.heal(secondWind.healing);
  console.log(`${warrior.name} uses ${secondWind.name} and heals ${healed} HP!`);
  console.log(`${warrior.name} HP now: ${warrior.stats.hp}`);
}
console.log();

// Example 4: Experience and Leveling
console.log('--- Gaining Experience and Leveling Up ---');
console.log(`Current Level: ${warrior.level}`);
console.log(`Current XP: ${warrior.experience}/${warrior.experienceToNextLevel}`);
console.log(`Available Attribute Points: ${warrior.availableAttributePoints}`);
console.log(`Available Skill Points: ${warrior.availableSkillPoints}`);

console.log('\nGaining 250 XP from defeating enemies...');
let result = warrior.gainExperience(250);
if (result.leveledUp) {
  console.log(`🎉 LEVEL UP! ${warrior.name} reached level ${result.currentLevel}!`);
  console.log(`   - New HP: ${warrior.stats.hp}/${warrior.stats.maxHp}`);
  console.log(`   - New Mana: ${warrior.stats.mana}/${warrior.stats.maxMana}`);
  console.log(`   - Attribute Points: ${warrior.availableAttributePoints}`);
  console.log(`   - Skill Points: ${warrior.availableSkillPoints}`);
}

console.log('\nGaining 200 more XP...');
result = warrior.gainExperience(200);
if (result.leveledUp) {
  console.log(`🎉 LEVEL UP! ${warrior.name} reached level ${result.currentLevel}!`);
  console.log(`   - Gained ${result.levelsGained} level(s)`);
  console.log(`   - New HP: ${warrior.stats.hp}/${warrior.stats.maxHp}`);
  console.log(`   - New Mana: ${warrior.stats.mana}/${warrior.stats.maxMana}`);
  console.log(`   - Attribute Points: ${warrior.availableAttributePoints}`);
  console.log(`   - Skill Points: ${warrior.availableSkillPoints}`);
}

console.log(`\nCurrent Level: ${warrior.level}`);
console.log(`Current XP: ${warrior.experience}/${warrior.experienceToNextLevel}`);
console.log();

// Example 5: Spending Attribute Points
console.log('--- Spending Attribute Points ---');
console.log(`Before - STR: ${warrior.attributes.str}, CON: ${warrior.attributes.con}`);
console.log(`Available Points: ${warrior.availableAttributePoints}`);

if (warrior.spendAttributePoints('str', 2)) {
  console.log('Spent 2 points on Strength!');
}
if (warrior.spendAttributePoints('con', 1)) {
  console.log('Spent 1 point on Constitution!');
}

console.log(`After - STR: ${warrior.attributes.str}, CON: ${warrior.attributes.con}`);
console.log(`Remaining Points: ${warrior.availableAttributePoints}`);
console.log(`HP: ${warrior.stats.hp}/${warrior.stats.maxHp} (increased due to CON)`);
console.log();

// Example 6: Learning New Spells
console.log('--- Learning New Spells ---');
console.log(`Skill Points: ${warrior.availableSkillPoints}`);
console.log(`Current Skills: ${warrior.skills.map(s => s.name).join(', ')}`);

console.log(`\nAttempting to learn ${fireball.name}...`);
if (warrior.learnSpell(fireball)) {
  console.log(`✨ Learned ${fireball.name}!`);
  console.log(`   - Mana Cost: ${fireball.manaCost}, Damage: ${fireball.damage}`);
  console.log(`   - Remaining Skill Points: ${warrior.availableSkillPoints}`);
} else {
  console.log(`❌ Cannot learn ${fireball.name} (insufficient points or requirements not met)`);
}

console.log(`\nAttempting to learn ${iceShield.name}...`);
if (warrior.learnSpell(iceShield)) {
  console.log(`✨ Learned ${iceShield.name}!`);
} else {
  console.log(`❌ Cannot learn ${iceShield.name} (requires level 5 and INT 12, WIZ 12)`);
}
console.log();

// Example 7: Creating a Quest
console.log('--- Creating a Quest ---');
const dragonSlayer = new Quest('quest_001', 'Slay the Dragon', {
  description: 'A fearsome dragon has been terrorizing the village. Defeat it and save the villagers!',
  type: 'main',
  level: 10,
  objectives: [
    {
      id: 'kill_dragon',
      description: 'Defeat the Ancient Dragon',
      target: 1
    },
    {
      id: 'return_to_village',
      description: 'Return to the village elder',
      target: 1
    }
  ],
  requirements: {
    attributes: {
      str: 15,
      con: 12
    }
  },
  experience: 1000,
  gold: 500,
  items: ['Dragon Scale Shield', 'Ancient Sword'],
  questGiver: 'Village Elder',
  location: 'Dragon\'s Peak'
});

console.log(`Quest: ${dragonSlayer.title}`);
console.log(`Description: ${dragonSlayer.description}`);
console.log(`Type: ${dragonSlayer.type}, Level: ${dragonSlayer.level}`);
console.log(`Quest Giver: ${dragonSlayer.questGiver}`);
console.log(`Location: ${dragonSlayer.location}`);
console.log();

// Example 8: Quest Progress
console.log('--- Quest Progress ---');
dragonSlayer.start();
console.log(`Quest Status: ${dragonSlayer.status}`);

dragonSlayer.updateProgress('kill_dragon', 1);
console.log(`Objective "kill_dragon" completed!`);
console.log(`Quest Progress: ${dragonSlayer.getProgressPercentage()}%`);

dragonSlayer.updateProgress('return_to_village', 1);
console.log(`Objective "return_to_village" completed!`);
console.log(`Quest Status: ${dragonSlayer.status}`);
console.log(`Quest Progress: ${dragonSlayer.getProgressPercentage()}%`);

// Award quest XP
console.log(`\nAwarding ${dragonSlayer.rewards.experience} XP from quest...`);
result = warrior.gainExperience(dragonSlayer.rewards.experience);
if (result.leveledUp) {
  console.log(`🎉 LEVEL UP! ${warrior.name} reached level ${result.currentLevel}!`);
  console.log(`   - Gained ${result.levelsGained} level(s)`);
  console.log(`   - Attribute Points: ${warrior.availableAttributePoints}`);
  console.log(`   - Skill Points: ${warrior.availableSkillPoints}`);
}

// Spend points on INT to meet Fireball requirements
console.log(`\nSpending 2 attribute points on Intelligence for Fireball...`);
if (warrior.spendAttributePoints('int', 2)) {
  console.log(`INT increased to ${warrior.attributes.int}`);
}

// Try learning Fireball again now that we meet requirements
console.log(`\nAttempting to learn ${fireball.name} (requires level 3, INT 10)...`);
console.log(`Current: Level ${warrior.level}, INT ${warrior.attributes.int}, Skill Points: ${warrior.availableSkillPoints}`);
if (warrior.learnSpell(fireball)) {
  console.log(`✨ Learned ${fireball.name}!`);
  console.log(`   - Mana Cost: ${fireball.manaCost}, Damage: ${fireball.damage}`);
  console.log(`   - Remaining Skill Points: ${warrior.availableSkillPoints}`);
} else {
  console.log(`❌ Cannot learn ${fireball.name}`);
}
console.log();

// Example 9: Regeneration
console.log('--- Regeneration ---');
console.log(`${warrior.name} HP before regen: ${warrior.stats.hp}`);
console.log(`${warrior.name} Mana before regen: ${warrior.stats.mana}`);
warrior.regenerate();
console.log(`${warrior.name} HP after regen: ${warrior.stats.hp}`);
console.log(`${warrior.name} Mana after regen: ${warrior.stats.mana}`);
console.log();

// Example 10: Final Character State
console.log('--- Final Character State ---');
console.log(`${warrior.name} - Level ${warrior.level}`);
console.log(`XP: ${warrior.experience}/${warrior.experienceToNextLevel}`);
console.log(`HP: ${warrior.stats.hp}/${warrior.stats.maxHp}`);
console.log(`Mana: ${warrior.stats.mana}/${warrior.stats.maxMana}`);
console.log(`Attributes: STR ${warrior.attributes.str}, DEX ${warrior.attributes.dex}, CON ${warrior.attributes.con}, INT ${warrior.attributes.int}, WIZ ${warrior.attributes.wiz}, CHA ${warrior.attributes.cha}`);
console.log(`Skills Known: ${warrior.skills.map(s => s.name).join(', ')}`);
console.log(`Available Points: ${warrior.availableAttributePoints} attribute, ${warrior.availableSkillPoints} skill`);
console.log();

console.log('=== Examples Complete ===');
