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
console.log(`HP: ${warrior.stats.hp}/${warrior.stats.maxHp}`);
console.log(`Mana: ${warrior.stats.mana}/${warrior.stats.maxMana}`);
console.log(`STR: ${warrior.attributes.str}, DEX: ${warrior.attributes.dex}, CON: ${warrior.attributes.con}`);
console.log();

// Example 2: Creating Skills
console.log('--- Creating and Adding Skills ---');
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

warrior.addSkill(powerStrike);
warrior.addSkill(secondWind);

console.log(`${warrior.name} learned: ${powerStrike.name} (${powerStrike.type})`);
console.log(`  - Mana Cost: ${powerStrike.manaCost}, Damage: ${powerStrike.damage}`);
console.log(`${warrior.name} learned: ${secondWind.name} (${secondWind.type})`);
console.log(`  - Mana Cost: ${secondWind.manaCost}, Healing: ${secondWind.healing}`);
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

// Example 4: Creating a Quest
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

// Example 5: Quest Progress
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
console.log();

// Example 6: Regeneration
console.log('--- Regeneration ---');
console.log(`${warrior.name} HP before regen: ${warrior.stats.hp}`);
console.log(`${warrior.name} Mana before regen: ${warrior.stats.mana}`);
warrior.regenerate();
console.log(`${warrior.name} HP after regen: ${warrior.stats.hp}`);
console.log(`${warrior.name} Mana after regen: ${warrior.stats.mana}`);
console.log();

// Example 7: Serialization
console.log('--- Serialization (toJSON) ---');
console.log('Character data:');
console.log(JSON.stringify(warrior.toJSON(), null, 2));
console.log();

console.log('=== Examples Complete ===');
