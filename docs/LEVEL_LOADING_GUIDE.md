# Level Loading System - Quick Start Guide

## Overview

The RPG Engine now supports loading custom levels from JSON files. This allows level designers to create rich, detailed worlds without modifying code.

## Key Features

✅ **JSON-based level configuration** - Define entire worlds in a single file
✅ **Mesh library integration** - Use 38+ pre-built models (creatures, buildings, props)  
✅ **Terrain features** - Hills, valleys, canyons, plateaus, bridges, caves  
✅ **Monster variety** - 9 creature types with configurable stats  
✅ **NPC placement** - Position quest givers, merchants, guards  
✅ **Zone system** - Define distinct areas with boundaries and themes  

## Quick Start

### 1. View the Example Level

The `world_rpg_v2.json` level is already integrated. To play it:

```bash
npm run dev
```

Navigate to `http://localhost:5173/world-rpg.html`

### 2. Level Structure

A level JSON file contains:

```json
{
  "name": "my_level",
  "version": "1.0",
  "description": "My awesome level",
  
  "terrain": {
    "size": 100,
    "segments": 100,
    "heightScale": 10,
    "waterLevel": 3,
    "seed": 12345
  },
  
  "npcs": [
    {
      "id": "merchant",
      "name": "Trader Tom",
      "type": "merchant",
      "position": { "x": 10, "z": 10 },
      "modelName": "peasant",
      "dialogue": "Welcome to my shop!"
    }
  ],
  
  "monsters": [
    {
      "type": "goblin",
      "position": { "x": -20, "z": -20 },
      "hp": 80,
      "damage": 15,
      "xp": 50,
      "stance": "aggressive",
      "level": 1
    }
  ],
  
  "buildings": [
    {
      "type": "house",
      "position": { "x": 15, "z": 5 },
      "rotation": 0,
      "scale": 1.0,
      "name": "Tom's House"
    }
  ],
  
  "props": [
    {
      "type": "campfire",
      "position": { "x": 0, "z": 0 },
      "rotation": 0,
      "scale": 1.0
    }
  ],
  
  "chests": [
    {
      "position": { "x": 5, "z": -5 },
      "type": "basic",
      "loot": "random"
    }
  ],
  
  "terrainFeatures": [
    {
      "type": "hill",
      "position": { "x": -15, "z": -15 },
      "radius": 8,
      "height": 4
    }
  ],
  
  "zones": [
    {
      "name": "Village",
      "bounds": { "minX": 0, "maxX": 20, "minZ": 0, "maxZ": 20 },
      "description": "Safe starting area",
      "music": "peaceful"
    }
  ]
}
```

### 3. Available Content

**Monster Types**: `goblin`, `skeleton`, `spider`, `wolf`, `bear`, `orc`, `troll`, `bat`, `dragon`

**Building Types**: `house`, `tower`, `castle_wall`, `windmill`, `well`, `barn`, `bridge`, `market_stall`, `fence`, `lighthouse`

**Prop Types**: `barrel`, `crate`, `campfire`, `torch`, `signpost`, `table`, `chair`, `bed`, `bookshelf`, `lantern`, `mushroom`, `crystal`, `tombstone`, `cauldron`, `weapon_rack`

**Terrain Features**: `hill`, `plateau`, `valley`, `canyon`, `cave_entrance`, `bridge`, `ramp`

**NPC Model Names**: `peasant`, `Soldier`, `Wizard`

### 4. Load Your Level

Option A: **Replace default level** (edit `world-rpg.js`):

```javascript
await worldInitializer.initFromLevel(
  '/levels/your_level.json',  // Change this path
  playerInventory,
  updateQuestProgressFn
);
```

Option B: **Create a new RPG page**:

1. Copy `world-rpg.html` to `my-rpg.html`
2. Copy `world-rpg.js` to `my-rpg.js`
3. Update the level path in `my-rpg.js`
4. Open `http://localhost:5173/my-rpg.html`

### 5. Use the Level Editor

Press `P` in the World RPG to toggle the level editor:
- **Terrain Mode**: Sculpt terrain height
- **Paint Mode**: Color terrain vertices
- **NPC Mode**: Place NPCs
- **Monster Mode**: Place monsters
- **Save**: Export to JSON + PNG files

## Examples

### Example 1: Simple Village

```json
{
  "name": "peaceful_village",
  "npcs": [
    {"id": "elder", "name": "Elder Bob", "type": "elder", 
     "position": {"x": 0, "z": 0}, "modelName": "peasant"}
  ],
  "buildings": [
    {"type": "house", "position": {"x": 5, "z": 5}},
    {"type": "well", "position": {"x": -5, "z": -5}}
  ],
  "props": [
    {"type": "campfire", "position": {"x": 0, "z": -10}}
  ]
}
```

### Example 2: Goblin Raid

```json
{
  "name": "goblin_invasion",
  "monsters": [
    {"type": "goblin", "position": {"x": -10, "z": -10}, "hp": 60, "stance": "aggressive"},
    {"type": "goblin", "position": {"x": -12, "z": -8}, "hp": 60, "stance": "aggressive"},
    {"type": "goblin", "position": {"x": -8, "z": -12}, "hp": 80, "stance": "aggressive", "level": 2}
  ],
  "terrainFeatures": [
    {"type": "hill", "position": {"x": -10, "z": -10}, "radius": 10, "height": 3}
  ],
  "props": [
    {"type": "campfire", "position": {"x": -10, "z": -10}}
  ]
}
```

### Example 3: Dungeon Entrance

```json
{
  "name": "dungeon_gates",
  "terrainFeatures": [
    {"type": "cave_entrance", "position": {"x": 0, "z": 0}, "radius": 4, "height": 3},
    {"type": "canyon", "position": {"x": 0, "z": -10}, "length": 20, "width": 5, "depth": 5}
  ],
  "monsters": [
    {"type": "skeleton", "position": {"x": 2, "z": 2}, "hp": 100, "stance": "defensive"},
    {"type": "skeleton", "position": {"x": -2, "z": 2}, "hp": 100, "stance": "defensive"}
  ],
  "props": [
    {"type": "torch", "position": {"x": 3, "z": 1}},
    {"type": "torch", "position": {"x": -3, "z": 1}},
    {"type": "crystal", "position": {"x": 0, "z": 5}, "scale": 1.5}
  ],
  "chests": [
    {"position": {"x": 0, "z": 8}, "type": "magical", "loot": "rare"}
  ]
}
```

## Tips for Level Designers

### 1. **Start Small**
Begin with a few NPCs, buildings, and monsters. Test frequently.

### 2. **Use Zones for Organization**
Define zones to mentally organize your level into areas.

### 3. **Balance Difficulty**
- Level 1: 50-80 HP, 10-15 damage
- Level 2: 90-120 HP, 18-25 damage
- Level 3: 100-150 HP, 22-30 damage
- Level 4+: 150-250 HP, 28-40 damage
- Bosses: 300-500 HP, 50-70 damage

### 4. **Lighting Matters**
Place torches and lanterns in villages and near important locations.

### 5. **Natural Barriers**
Use terrain features (hills, canyons) to guide player movement.

### 6. **Visual Storytelling**
Props tell stories:
- Tombstones = graveyard
- Barrels + crates = storage area
- Bookshelf + cauldron = mage tower
- Weapon rack = armory

### 7. **Test Your Level**
Play through your level to verify:
- NPCs are reachable
- Monsters are not too dense
- Chests are findable
- Terrain is navigable

## API Reference

See full documentation:
- `docs/WORLD_RPG_V2_LEVEL_DESIGN.md` - Complete level design guide
- `docs/MESH_LIBRARY.md` - All available models and usage
- `docs/LEVEL_DESIGN.md` - Terrain features and biome system

## Troubleshooting

**Level doesn't load**: Check browser console for JSON parsing errors

**Missing models**: Ensure type names match exactly (case-sensitive)

**Monsters buried**: Terrain generator positions them automatically, try adjusting Y in code

**NPCs not visible**: Check model name is correct (`peasant`, `Soldier`, `Wizard`)

## Contributing

To add new content:
1. **New Buildings**: Add to `BuildingLibrary.js`
2. **New Props**: Add to `PropsLibrary.js`
3. **New Creatures**: Add to `CreatureLibrary.js` + `MonsterFactory.js`
4. **New Terrain**: Add to `TerrainFeatures.js`

Then rebuild: `npm run build`

---

**Created with ❤️ using Three.js and the RPG Engine Mesh Library**
