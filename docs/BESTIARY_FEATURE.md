# Monster Bestiary Feature

## Overview
The Bestiary is a comprehensive monster encyclopedia that tracks all creatures encountered in the RPG world. It provides detailed information about monster stats, lore, habitats, weaknesses, and drop tables.

## How to Access
Press the **'B'** key to toggle the Bestiary panel.

## Features

### Main Bestiary Panel
- **Completion Tracking**: Shows discovered monsters out of total (e.g., "5 / 9")
- **Completion Percentage**: Visual indicator of bestiary completion
- **Total Kills**: Cumulative count of all monsters defeated
- **Monster List**: Grid view of all monsters with visual distinction between discovered and undiscovered

### Monster Discovery
- **Automatic Tracking**: Monsters are automatically discovered when:
  - You encounter them in combat
  - You attack them for the first time
- **Discovery Notification**: A message appears: "📖 New bestiary entry: [Monster Name]!"

### Monster Cards
Each discovered monster shows:
- Monster icon (emoji representation)
- Monster name with difficulty color coding
- Stats: HP, Damage, XP
- Stance type (Flee, Defensive, Aggressive)
- Difficulty rating (Easy, Medium, Hard, Boss)
- Personal records: Encounters and Kills
- "📖 Details" button for full information

Undiscovered monsters show as:
- ❓ icon
- "Unknown Monster" text
- "Not yet discovered" subtitle

### Monster Details Panel
Click the "📖 Details" button to view comprehensive information:

1. **Statistics**
   - Health Points (HP)
   - Damage output
   - Experience reward
   - Combat stance

2. **Lore**
   - Background story and description
   - Behavioral traits
   - Cultural/historical context

3. **Habitat**
   - Where the monster can be found
   - Environmental preferences

4. **Weakness**
   - Combat vulnerabilities
   - Effective strategies

5. **Drops**
   - Item name
   - Drop chance percentage
   - Item icon

6. **Your Record**
   - Total encounters
   - Total kills

## Monster Database

### Regular Monsters (6)
1. **Goblin** 👹
   - HP: 50 | DMG: 15 | XP: 50
   - Stance: Defensive
   - Difficulty: Easy

2. **Skeleton** 💀
   - HP: 60 | DMG: 18 | XP: 65
   - Stance: Aggressive
   - Difficulty: Medium

3. **Giant Spider** 🕷️
   - HP: 40 | DMG: 12 | XP: 45
   - Stance: Flee
   - Difficulty: Easy

4. **Wolf** 🐺
   - HP: 70 | DMG: 20 | XP: 75
   - Stance: Aggressive
   - Difficulty: Medium

5. **Troll** 👺 *(NEW)*
   - HP: 100 | DMG: 28 | XP: 95
   - Stance: Defensive
   - Difficulty: Hard
   - Special: Regeneration abilities

6. **Dire Bat** 🦇 *(NEW)*
   - HP: 30 | DMG: 10 | XP: 35
   - Stance: Aggressive
   - Difficulty: Easy
   - Special: Swarm behavior

### Boss Monsters (3)
1. **Goblin Chief** 👑
   - HP: 150 | DMG: 25 | XP: 200
   - Stance: Aggressive
   - Difficulty: Boss

2. **Skeleton Lord** ☠️
   - HP: 180 | DMG: 30 | XP: 250
   - Stance: Aggressive
   - Difficulty: Boss

3. **Dire Wolf** 🐺
   - HP: 200 | DMG: 35 | XP: 300
   - Stance: Aggressive
   - Difficulty: Boss

## Tips for Completion
1. **Explore all areas**: Monsters are found in specific locations:
   - Goblin Camp: Northwest area
   - Graveyard: Northeast area
   - Spider Cave: Southeast area
   - Wolf Pack: Southwest area
   - Troll Swamp: East-South area
   - Bat Cave: Northwest-North area

2. **Check signs**: Look for warning signs that indicate monster territories

3. **Use the minimap**: Quest markers can help locate monster areas

4. **Level up first**: Some monsters are stronger - level up before tackling harder areas

5. **Boss encounters**: Boss monsters are usually found near the center of their territories

## Technical Implementation
- **Module**: `BestiarySystem.js`
- **UI Components**: Integrated into `UIManager.js`
- **Data Storage**: Client-side tracking (resets on page reload)
- **Integration**: Automatic tracking via `CombatSystem.js`

## Future Enhancements
- Persistent storage (localStorage/database)
- Monster weaknesses highlighting
- Recommended equipment for each monster
- Achievement system for bestiary completion
- 3D model previews in details panel
- Advanced filtering and sorting options
