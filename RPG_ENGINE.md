# RPG Engine

A flexible RPG (Role-Playing Game) engine built with JavaScript, designed to be the foundation for an MMORPG with generative AI at its core.

## Features

### Character System
Characters have comprehensive stats and attributes:

**Combat Stats:**
- HP (Health Points) and Max HP
- Mana and Max Mana
- Armor (damage reduction)
- Dodge (evasion chance)
- Attack Speed (attacks per second)
- HP Regeneration (per tick)
- Mana Regeneration (per tick)

**Attributes:**
- STR (Strength) - Physical power
- DEX (Dexterity) - Agility and accuracy
- CON (Constitution) - Health and endurance
- INT (Intelligence) - Magical power
- WIZ (Wisdom) - Mana and magical resistance
- CHA (Charisma) - Social interactions

**Progression System:**
- Experience Points (XP) - Gain XP from combat and quests
- Level System - Level up when gaining enough XP (formula: 100 * level²)
- Attribute Points - Spend points to increase attributes on level up
- Skill Points - Use points to learn new spells and abilities
- Auto-scaling - HP and Mana automatically increase with level and attributes

**Skills:**
- Each character can learn multiple skills
- Skills have levels, requirements, and effects
- Support for active, passive, buff, and debuff skills
- Learn new spells using skill points
- Unlock spells based on level and attribute requirements

### Skill System
Skills provide character abilities:
- Mana cost and cooldown mechanics
- Damage and healing effects
- Leveling system (1 to max level)
- Attribute requirements
- Multiple skill types: active, passive, buff, debuff
- Target types: single, area, self

### Quest System
Comprehensive quest management:
- Multiple quest types: main, side, daily, event
- Quest status tracking: available, in-progress, completed, failed
- Objective-based progression
- Level and attribute requirements
- Reward system (experience, gold, items, skills)
- Quest giver and location tracking

### Three.js Integration

**Features:**
- Interactive 3D character visualization
- WoW-style camera controls (right-click to rotate, mouse wheel to zoom)
- Character animations (idle, walking, running, attacking, resting)
- Populated 3D world with environment objects
- NPC interactions and dialogue with 4 unique FBX characters (Baelin, Baradun, Bodger, Greg)
- Inventory and equipment management
- Trading system with merchants
- Goblin enemies with respawn mechanics
- Modular architecture with reusable components

**Demos:**
1. **Basic Character Demo** (`/` or `/index.html`) - 3D character with animations
2. **Quest Demo** (`/quest-demo.html`) - Interactive quest progression with UI
3. **Integrated Quest Demo** (`/integrated-demo.html`) - 3D world with quest overlay
4. **World Demo** (`/world-demo.html`) - Full 3D environment with movement
5. **RPG Demo** (`/world-rpg.html`) - **NEW!** Complete RPG with NPCs, inventory, and trading

### Item System

```javascript
const { Item } = require('./src/models');

const healthPotion = new Item('health_pot', 'Health Potion', {
  icon: '🧪',
  type: 'consumable',
  value: 50,
  stats: { healing: 50 }
});
```

**Item Types:**
- Weapons (with damage stats)
- Armor (with armor and slot info)
- Consumables (with healing/mana restore effects)
- Quest items

**Rarity Levels:** common, uncommon, rare, epic, legendary

### Inventory System

```javascript
const { Inventory } = require('./src/models');

const inventory = new Inventory(20); // 20 slots
inventory.addGold(100);
inventory.addItem(healthPotion);
inventory.equipItem('iron_sword');
```

**Features:**
- 20-slot inventory
- Gold management
- Equipment slots (head, chest, legs, weapon, shield)
- Item stacking for consumables
- Equipment stat bonuses

### NPC System

```javascript
const { NPC } = require('./src/models');

const merchant = new NPC('merchant_001', 'Traveling Merchant', {
  type: 'merchant',
  position: { x: -10, z: 10 },
  dialogue: ['Welcome to my shop!']
});
```

**NPC Types:**
- Quest Givers - Provide quests and dialogue
- Merchants - Trade items with dynamic pricing
- Guards - (Future implementation)

**Merchant Features:**
- Buy items from players (50% of value)
- Sell items to players (150% of value)
- Dynamic inventory


3D visualization and rendering:
- Character rendering with 3D models
- Real-time animations (rotation, sword swings, particle effects)
- Interactive camera controls
- Dynamic lighting and shadows
- WebGL-based rendering

## Installation

```bash
npm install
```

## Demos

### Progression System Demo (New!)
See the leveling, experience, and spell learning system in action:

```bash
npm run demo:progression
```

Watch a mage character progress from level 1 to level 3, automatically:
- Gain experience from defeating enemies
- Level up with automatic HP/Mana increases
- Spend attribute points (INT, WIZ)
- Learn new spells as requirements are met
- Full character progression tracking

### Integrated 3D Quest Demo (Recommended)
Experience the full RPG engine with 3D character visualization during quest progression:

```bash
npm run dev
```

Then open http://localhost:3000/integrated-demo.html to see:
- **3D Character**: Fully rendered warrior in the game world
- **Quest Progression**: Complete "The Village Rescue" quest with 4 objectives
- **Dynamic Scenes**: Environment changes (lighting, enemies spawning)
- **Real-time Combat**: HP/Mana bars update, sword animations during attacks
- **Enemy AI**: Goblin warriors and boss appear in 3D space
- **Quest UI Overlay**: Stats, objectives, and quest log over 3D scene
- **Auto-play Mode**: Watch the entire quest unfold automatically

This demo combines Three.js 3D rendering with the quest system for a complete RPG experience.

### Interactive Quest Demo with Automated Testing
Experience a complete quest playthrough with visual testing:

```bash
# Start the dev server
npm run dev

# In another terminal, run the automated visual test
npm test
```

The quest demo features:
- Complete quest progression (travel, combat, boss fight, completion)
- Real-time HP/Mana tracking during combat
- Automated screenshot capture at key moments
- Detailed quest log with timestamps
- Auto-play mode for demonstrations

Open http://localhost:3000/quest-demo.html to interact manually, or run `npm test` for automated testing with screenshots.

See [tests/README.md](tests/README.md) for complete testing documentation.

### Interactive 3D Demo
Experience the RPG Engine in action with our Three.js powered demo:

```bash
npm run dev
```

Then open http://localhost:3000/ in your browser to see:
- 3D character visualization (warrior with shield and sword)
- Real-time character animations
- Interactive camera controls
- Live character stats display

See [public/README.md](public/README.md) for more details about the 3D demo.

### Console Demo
Run the data structures demo to see the underlying models:

```bash
npm run demo
```

## Usage

### Creating a Character

```javascript
const { Character } = require('./src/models');

const warrior = new Character('Thorin the Brave', {
  hp: 150,
  mana: 50,
  armor: 10,
  str: 18,
  dex: 12,
  con: 16,
  int: 8,
  wiz: 10,
  cha: 14
});
```

### Gaining Experience and Leveling Up

```javascript
// Gain XP from combat or quest completion
const result = warrior.gainExperience(250);

if (result.leveledUp) {
  console.log(`Level Up! Now level ${result.currentLevel}`);
  console.log(`Attribute Points: ${warrior.availableAttributePoints}`);
  console.log(`Skill Points: ${warrior.availableSkillPoints}`);
}

// Spend attribute points
warrior.spendAttributePoints('str', 2); // +2 STR
warrior.spendAttributePoints('int', 1); // +1 INT
```

### Creating and Learning Skills/Spells

```javascript
const { Skill } = require('./src/models');

// Create a spell
const fireball = new Skill('Fireball', {
  description: 'A blazing ball of fire',
  manaCost: 25,
  damage: 60,
  type: 'active',
  requirements: { int: 10, level: 3 }
});

// Add to available spells
warrior.addAvailableSpell(fireball);

// Learn the spell using skill points
if (warrior.learnSpell(fireball)) {
  console.log('Learned Fireball!');
}
```

### Creating a Quest

```javascript
const { Quest } = require('./src/models');

const quest = new Quest('quest_001', 'Slay the Dragon', {
  description: 'Defeat the ancient dragon',
  type: 'main',
  level: 10,
  objectives: [
    {
      id: 'kill_dragon',
      description: 'Defeat the Ancient Dragon',
      target: 1
    }
  ],
  experience: 1000,
  gold: 500
});

quest.start();
quest.updateProgress('kill_dragon', 1);
```

## Running Examples

Run the demo to see all features in action:

```bash
npm run demo
```

## Module Architecture

The RPG Engine uses a modular architecture for better maintainability and scalability. See [docs/MODULE_STRUCTURE.md](docs/MODULE_STRUCTURE.md) for detailed documentation.

**Core Modules:**
- `FBXCharacterLoader.js` - Handles loading all 4 FBX characters with automatic scale normalization
- `NPCFactory.js` - Creates NPCs with FBX models and manages NPC interactions
- `EnvironmentFactory.js` - Creates environment objects (trees, rocks, chests, etc.)
- `CameraController.js` - Manages WoW-style camera controls
- `GoblinFactory.js` - Creates goblin enemies and camps with combat logic

**Benefits:**
- Fixed FBX scale issues systematically
- All 4 characters (Baelin, Baradun, Bodger, Greg) loaded and used as NPCs
- Cleaner, more maintainable code structure
- Reusable components
- Easy to extend and test

## Data Structures

### Character
- `name`: String - Character name
- `level`: Number - Current level
- `experience`: Number - Current experience points
- `experienceToNextLevel`: Number - XP needed for next level
- `availableAttributePoints`: Number - Unspent attribute points
- `availableSkillPoints`: Number - Unspent skill points
- `stats`: Object - Combat statistics
- `attributes`: Object - Character attributes
- `skills`: Array - Learned skills
- `availableSpells`: Array - Spells available to learn

**Methods:**
- `addSkill(skill)` - Add a skill
- `removeSkill(skillName)` - Remove a skill
- `takeDamage(amount)` - Apply damage with armor reduction
- `heal(amount)` - Restore HP
- `useMana(amount)` - Consume mana
- `restoreMana(amount)` - Restore mana
- `regenerate()` - Apply HP/Mana regeneration
- `isAlive()` - Check if character is alive
- `gainExperience(amount)` - Gain XP and potentially level up
- `levelUp()` - Level up the character
- `spendAttributePoints(attribute, points)` - Spend attribute points
- `updateDerivedStats()` - Update stats based on attributes
- `learnSpell(spell)` - Learn a new spell using skill points
- `addAvailableSpell(spell)` - Add a spell to available spells
- `toJSON()` - Serialize to JSON

### Skill
- `name`: String - Skill name
- `description`: String - Skill description
- `manaCost`: Number - Mana required
- `damage`: Number - Damage dealt
- `healing`: Number - HP restored
- `type`: String - Skill type (active/passive/buff/debuff)
- `requirements`: Object - Attribute requirements

**Methods:**
- `levelUp()` - Increase skill level
- `meetsRequirements(character)` - Check if character can use skill
- `toJSON()` - Serialize to JSON

### Quest
- `id`: String - Unique identifier
- `title`: String - Quest title
- `description`: String - Quest description
- `objectives`: Array - Quest objectives
- `rewards`: Object - Quest rewards
- `status`: String - Quest status

**Methods:**
- `canAccept(character)` - Check if character meets requirements
- `start()` - Begin the quest
- `updateProgress(objectiveId, amount)` - Update objective progress
- `complete()` - Mark quest as completed
- `fail()` - Mark quest as failed
- `getProgressPercentage()` - Get completion percentage
- `toJSON()` - Serialize to JSON

## Future Plans

This is the foundation for a Three.js-based MMORPG with generative AI features. Future additions will include:

- ~~3D character rendering with Three.js~~ ✅ Complete
- ~~Inventory and equipment system~~ ✅ Complete
- ~~NPC AI behaviors~~ ✅ Complete (basic)
- ~~Character progression and leveling~~ ✅ Complete
- AI-generated quests and storylines
- Multiplayer networking
- Advanced combat system implementation
- World generation and exploration
- More NPC types and behaviors
- Crafting system
- Procedural content generation

## License

ISC
