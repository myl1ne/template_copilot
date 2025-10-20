/**
 * RPG Engine - Progression System Demo
 * Demonstrates the experience, leveling, and spell learning system
 */

const { Character, Skill } = require('../models');

console.log('=== RPG Progression System Demo ===\n');

// Create a new character
console.log('Creating a new adventurer...\n');
const mage = new Character('Elara the Wise', {
  hp: 80,
  maxHp: 80,
  mana: 120,
  maxMana: 120,
  armor: 5,
  str: 10,
  dex: 12,
  con: 12,
  int: 16,
  wiz: 16,
  cha: 14
});

console.log(`⚔️  ${mage.name} - Level ${mage.level} Mage`);
console.log(`📊 HP: ${mage.stats.hp}/${mage.stats.maxHp} | Mana: ${mage.stats.mana}/${mage.stats.maxMana}`);
console.log(`🎯 XP: ${mage.experience}/${mage.experienceToNextLevel}`);
console.log(`💎 Attributes: INT ${mage.attributes.int}, WIZ ${mage.attributes.wiz}, STR ${mage.attributes.str}`);
console.log();

// Create a spell library
const spellLibrary = [
  new Skill('Magic Missile', {
    description: 'Basic magical attack',
    manaCost: 15,
    damage: 30,
    type: 'active',
    targetType: 'single',
    requirements: { int: 10 }
  }),
  new Skill('Arcane Shield', {
    description: 'Magical protection',
    manaCost: 20,
    type: 'buff',
    targetType: 'self',
    requirements: { wiz: 12, level: 2 }
  }),
  new Skill('Lightning Bolt', {
    description: 'Powerful lightning attack',
    manaCost: 35,
    damage: 70,
    type: 'active',
    targetType: 'single',
    requirements: { int: 14, level: 3 }
  }),
  new Skill('Teleport', {
    description: 'Instant short-range teleportation',
    manaCost: 40,
    type: 'active',
    targetType: 'self',
    requirements: { int: 16, wiz: 14, level: 5 }
  }),
  new Skill('Meteor Storm', {
    description: 'Devastating area attack',
    manaCost: 60,
    damage: 120,
    type: 'active',
    targetType: 'area',
    requirements: { int: 18, wiz: 16, level: 7 }
  })
];

// Add all spells to available spells
console.log('📚 Spell Library:');
spellLibrary.forEach((spell, index) => {
  mage.addAvailableSpell(spell);
  const reqText = Object.entries(spell.requirements)
    .map(([key, val]) => `${key.toUpperCase()} ${val}`)
    .join(', ');
  console.log(`   ${index + 1}. ${spell.name} (${spell.type}) - Requires: ${reqText}`);
});
console.log();

// Start learning the first spell
console.log('🎓 Learning first spell...');
if (mage.learnSpell(spellLibrary[0])) {
  console.log(`   ✨ Learned ${spellLibrary[0].name}!`);
  console.log(`   💫 Skill Points: ${mage.availableSkillPoints}`);
}
console.log();

// Simulate combat and gaining XP
console.log('⚔️  Combat Encounters:');
const encounters = [
  { enemy: 'Goblin Scout', xp: 50 },
  { enemy: 'Wolf', xp: 75 },
  { enemy: 'Bandit', xp: 100 },
  { enemy: 'Orc Warrior', xp: 150 },
  { enemy: 'Dark Wizard', xp: 200 },
  { enemy: 'Troll', xp: 250 },
  { enemy: 'Dragon Whelp', xp: 300 },
  { enemy: 'Elite Guard', xp: 350 }
];

encounters.forEach((encounter, index) => {
  console.log(`\n--- Encounter ${index + 1}: ${encounter.enemy} ---`);
  const result = mage.gainExperience(encounter.xp);
  console.log(`💰 Gained ${encounter.xp} XP from defeating ${encounter.enemy}`);
  console.log(`📊 XP: ${result.currentExperience}/${result.experienceToNextLevel}`);
  
  if (result.leveledUp) {
    console.log(`\n🎉 *** LEVEL UP! *** ${mage.name} reached Level ${result.currentLevel}!`);
    console.log(`   ❤️  HP: ${mage.stats.hp}/${mage.stats.maxHp}`);
    console.log(`   💙 Mana: ${mage.stats.mana}/${mage.stats.maxMana}`);
    console.log(`   ⬆️  Attribute Points: ${mage.availableAttributePoints}`);
    console.log(`   🌟 Skill Points: ${mage.availableSkillPoints}`);
    
    // Auto-spend attribute points on INT and WIZ
    if (mage.availableAttributePoints >= 2) {
      mage.spendAttributePoints('int', 2);
      mage.spendAttributePoints('wiz', 1);
      console.log(`   📈 Spent points: +2 INT, +1 WIZ`);
      console.log(`   💎 New Attributes: INT ${mage.attributes.int}, WIZ ${mage.attributes.wiz}`);
    }
    
    // Try to learn the next available spell
    const nextSpell = spellLibrary.find(spell => 
      !mage.skills.some(s => s.name === spell.name) && 
      spell.meetsRequirements(mage)
    );
    
    if (nextSpell && mage.availableSkillPoints > 0) {
      if (mage.learnSpell(nextSpell)) {
        console.log(`   ✨ Learned new spell: ${nextSpell.name}!`);
        if (nextSpell.damage) {
          console.log(`      💥 Damage: ${nextSpell.damage} | Mana: ${nextSpell.manaCost}`);
        } else {
          console.log(`      🛡️  Type: ${nextSpell.type} | Mana: ${nextSpell.manaCost}`);
        }
      }
    }
  }
});

// Final character summary
console.log('\n' + '='.repeat(60));
console.log('📊 Final Character Summary');
console.log('='.repeat(60));
console.log(`\n⚔️  ${mage.name} - Level ${mage.level} Archmage`);
console.log(`\n❤️  HP: ${mage.stats.hp}/${mage.stats.maxHp}`);
console.log(`💙 Mana: ${mage.stats.mana}/${mage.stats.maxMana}`);
console.log(`🎯 XP: ${mage.experience}/${mage.experienceToNextLevel}`);
console.log(`\n💎 Attributes:`);
console.log(`   STR: ${mage.attributes.str} | DEX: ${mage.attributes.dex} | CON: ${mage.attributes.con}`);
console.log(`   INT: ${mage.attributes.int} | WIZ: ${mage.attributes.wiz} | CHA: ${mage.attributes.cha}`);
console.log(`\n📖 Learned Spells (${mage.skills.length}):`);
mage.skills.forEach((spell, index) => {
  const damageText = spell.damage ? ` - Damage: ${spell.damage}` : '';
  console.log(`   ${index + 1}. ${spell.name} (${spell.type})${damageText}`);
  console.log(`      Mana: ${spell.manaCost} | Level: ${spell.level}/${spell.maxLevel}`);
});
console.log(`\n⭐ Remaining Points:`);
console.log(`   Attribute Points: ${mage.availableAttributePoints}`);
console.log(`   Skill Points: ${mage.availableSkillPoints}`);
console.log('\n' + '='.repeat(60));
console.log('\n=== Progression Demo Complete ===');
