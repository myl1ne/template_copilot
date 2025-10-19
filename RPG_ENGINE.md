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

**Skills:**
- Each character can learn multiple skills
- Skills have levels, requirements, and effects
- Support for active, passive, buff, and debuff skills

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

### Creating and Adding Skills

```javascript
const { Skill } = require('./src/models');

const powerStrike = new Skill('Power Strike', {
  description: 'A powerful melee attack',
  manaCost: 15,
  damage: 50,
  type: 'active',
  requirements: { str: 15 }
});

warrior.addSkill(powerStrike);
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

## Data Structures

### Character
- `name`: String - Character name
- `stats`: Object - Combat statistics
- `attributes`: Object - Character attributes
- `skills`: Array - Learned skills

**Methods:**
- `addSkill(skill)` - Add a skill
- `removeSkill(skillName)` - Remove a skill
- `takeDamage(amount)` - Apply damage with armor reduction
- `heal(amount)` - Restore HP
- `useMana(amount)` - Consume mana
- `restoreMana(amount)` - Restore mana
- `regenerate()` - Apply HP/Mana regeneration
- `isAlive()` - Check if character is alive
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

- 3D character rendering with Three.js
- AI-generated quests and storylines
- Multiplayer networking
- Combat system implementation
- Inventory and equipment system
- World generation and exploration
- NPC AI behaviors

## License

ISC
