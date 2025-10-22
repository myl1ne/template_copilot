# World RPG v2 - Level Design Documentation

## Overview

World RPG v2 is an enhanced level design that fully utilizes the mesh library system and level loading infrastructure. This new level transforms the RPG experience with a rich, detailed world featuring multiple zones, diverse NPCs, varied monsters, and decorative elements from the mesh library.

## Level Features

### Level Metadata
- **Name**: world_rpg_v2
- **Version**: 2.0
- **Description**: Enhanced World RPG level using mesh library and advanced terrain features

### Terrain Configuration
- **Size**: 100x100 units
- **Segments**: 100x100 (high detail)
- **Height Scale**: 12 units (increased variation)
- **Water Level**: 2.5 units
- **Seed**: 42069 (reproducible terrain)

## World Zones

The level is divided into 5 distinct zones, each with unique characteristics:

### 1. Village Center (Safe Zone)
**Location**: -5 to 25 (X), -5 to 25 (Z)

**Features**:
- 5 NPCs including Elder, Guard, Merchant, Blacksmith
- 3 houses for NPCs
- Watch Tower for defense
- Village Well (community gathering point)
- Market Stall for trading
- Multiple torches for lighting
- Tables and chairs for atmosphere
- Signposts with directions

**Purpose**: Starting area, quest hub, trading, safe haven

### 2. Goblin Camp (Danger Zone)
**Location**: -25 to -15 (X), -25 to -15 (Z)

**Features**:
- 3 aggressive goblins
- Campfire
- Hill terrain feature
- Warning signpost
- Magical chest with rare loot

**Purpose**: Early-game combat zone, introductory dungeon

### 3. Skeleton Graveyard (Undead Zone)
**Location**: 25 to 35 (X), 5 to 15 (Z)

**Features**:
- 3 defensive skeletons
- Plateau terrain feature (elevated graveyard)
- 4 tombstones
- Windmill nearby
- Magical chest
- Warning signpost

**Purpose**: Mid-game challenge, undead enemy introduction

### 4. Spider Canyon (Cave Zone)
**Location**: 20 to 30 (X), -30 to -20 (Z)

**Features**:
- 2 aggressive spiders
- Canyon terrain feature (deep ravine)
- Cave entrance
- Glowing crystal formations
- Warning signpost

**Purpose**: Exploration challenge, unique terrain hazard

### 5. Wolf Territory (Wilderness Zone)
**Location**: -35 to -25 (X), 25 to 35 (Z)

**Features**:
- 2 aggressive wolves
- Dense forest area
- Coastal lighthouse in distance
- Natural wilderness setting

**Purpose**: High-level combat challenge, wilderness survival

### 6. Additional Areas

**Bear Den**: Located at (-35, -10)
- 1 defensive bear (powerful enemy)
- Forest environment

**Orc Outpost**: Located at (10-15, -30 to -32)
- 2 aggressive orcs
- Near the village barn

**Hermit's Hut**: Located at (-25, -25)
- Forest Hermit NPC
- Bookshelf, cauldron, mushrooms
- Magical atmosphere

## Content Breakdown

### NPCs (5 Total)
1. **Village Elder** (5, 5) - Quest giver, village leader
2. **Town Guard** (8, 3) - Security, guidance
3. **Traveling Merchant** (-8, 8) - Trading, buying/selling
4. **Forest Hermit** (-25, -25) - Ancient knowledge, mysterious
5. **Village Blacksmith** (12, -5) - Crafting, weapon upgrades

### Monsters (13 Total)
- **3 Goblins** (Level 1, Aggressive) - Goblin Camp area
- **3 Skeletons** (Level 2, Defensive) - Graveyard area
- **2 Spiders** (Level 2, Aggressive) - Canyon area
- **2 Wolves** (Level 3, Aggressive) - Wolf Territory
- **1 Bear** (Level 5, Defensive) - Bear Den
- **2 Orcs** (Level 4, Aggressive) - Orc Outpost

### Buildings (10 Total)
1. Elder's House (10, 8)
2. Guard's House (15, 0)
3. Merchant's House (-15, 5)
4. Watch Tower (20, 20)
5. Village Barn (18, -10)
6. Market Stall (-5, 10)
7. Old Windmill (25, 5)
8. Village Well (3, 12)
9. Stone Bridge (0, -8)
10. Coastal Lighthouse (-40, 40)

### Props (34 Total)
- **2 Campfires** - Light and warmth
- **4 Barrels** - Storage containers
- **4 Crates** - Storage and decoration
- **3 Signposts** - Wayfinding and warnings
- **4 Torches** - Village lighting
- **2 Lanterns** - Merchant area lighting
- **4 Tombstones** - Graveyard atmosphere
- **1 Weapon Rack** - Blacksmith decoration
- **1 Cauldron** - Hermit's magical brewing
- **1 Crystal** - Cave decoration (glowing)
- **3 Mushrooms** - Forest atmosphere
- **1 Table + 2 Chairs** - Village furniture
- **1 Bookshelf** - Hermit's knowledge
- **4 Fences** - Barn enclosure

### Chests (4 Total)
1. Basic Chest (5, -5) - Random loot
2. Basic Chest (-7, 8) - Random loot
3. Magical Chest (-21, -21) - Rare loot (Goblin Camp)
4. Magical Chest (30, 10) - Rare loot (Graveyard)

### Terrain Features (6 Total)
1. **Hill** (-15, -15) - Radius 8, Height 4 (Goblin area elevation)
2. **Hill** (20, 15) - Radius 10, Height 5 (Near Watch Tower)
3. **Plateau** (30, 10) - 12x12, Height 3 (Skeleton Graveyard)
4. **Valley** (0, -8) - Radius 6, Depth 2 (Bridge crossing)
5. **Canyon** (25, -25) - Length 15, Width 4, Depth 4 (Spider Canyon)
6. **Cave Entrance** (24, -24) - Radius 3, Height 2.5 (Spider Cave)

## Implementation Details

### Level Loading System

The level uses the new `LevelLoader` class which integrates with:
- `MeshLibrary` - For buildings and props
- `TerrainFeatures` - For terrain modifications
- `MonsterFactory` - For creature spawning
- `NPCFactory` - For NPC creation
- `EnvironmentFactory` - For biome-aware placement

### Monster Enhancements

Three new monster types were added to support the level:
1. **Bear** - Large, defensive creature with high HP (200)
2. **Orc** - Strong, aggressive humanoid with tusks and club (150 HP)
3. **Dragon** - Legendary boss creature with wings and fire (500 HP)

### Biome Integration

The level still uses the biome system for:
- Trees (20 biome-aware placements)
- Rocks (15 biome-aware placements)
- Automatic variant selection based on terrain

### Progression Design

**Level 1 Zone**: Village Center (safe, tutorials, trading)
↓
**Level 2 Zone**: Goblin Camp (first combat challenge)
↓
**Level 3 Zone**: Skeleton Graveyard (undead enemies, harder combat)
↓
**Level 4 Zone**: Spider Canyon (environmental hazards + combat)
↓
**Level 5 Zone**: Wolf Territory + Bear Den (endgame challenges)

## Usage

### Loading the Level

The level is automatically loaded in `world-rpg.js`:

```javascript
await worldInitializer.initFromLevel(
  '/levels/world_rpg_v2.json',
  playerInventory,
  updateQuestProgressFn
);
```

### Switching to Legacy Level

To use the original level design:

```javascript
await worldInitializer.initWorld(
  playerInventory,
  updateQuestProgressFn
);
```

### Creating Custom Levels

1. Copy `world_rpg_v2.json` as a template
2. Modify the JSON structure:
   - Change NPC positions and dialogue
   - Add/remove monsters and adjust stats
   - Place buildings and props from mesh library
   - Configure terrain features
3. Save to `/public/levels/your_level.json`
4. Load with `worldInitializer.initFromLevel('/levels/your_level.json', ...)`

## Level Design Principles

### 1. Spatial Separation
- Different zones are geographically separated
- Natural barriers (hills, canyons) create boundaries
- Safe zones away from danger zones

### 2. Progressive Difficulty
- Starting area is safe and well-lit
- Difficulty increases with distance from village
- Boss-level creatures in remote areas

### 3. Visual Storytelling
- Signposts guide players
- Environmental details tell stories (tombstones, crystals, mushrooms)
- Building placement suggests community structure

### 4. Exploration Rewards
- Magical chests in dangerous areas
- Rare loot for adventurous players
- Hidden areas with unique atmosphere (Hermit's Hut)

### 5. Functional Design
- NPCs near relevant buildings (Blacksmith near weapons, Merchant near market)
- Lighting placed for visibility and atmosphere
- Terrain features create interesting combat spaces

## Comparison: v1 vs v2

| Feature | v1 (Legacy) | v2 (New) |
|---------|-------------|----------|
| NPCs | 4 (procedural) | 5 (configured) |
| Monsters | ~15 (camps) | 13 (placed) |
| Buildings | 3 basic | 10 diverse |
| Props | 0 | 34 detailed |
| Terrain Features | 0 | 6 sculpted |
| Zones | Implicit | 5 defined |
| Mesh Library | No | Full usage |
| Level File | No | JSON config |

## Technical Benefits

### 1. Maintainability
- Level data separate from code
- Easy to modify without recompiling
- JSON format is human-readable

### 2. Reusability
- LevelLoader can load any valid level file
- Mesh library provides consistent visuals
- TerrainFeatures can be combined

### 3. Scalability
- Easy to add new zones
- Monster stats easily tweaked
- Building/prop placement rapid

### 4. Collaboration
- Level designers don't need coding knowledge
- Artists can visualize from JSON
- QA can test different configurations

## Future Enhancements

### Potential Additions
1. **Weather System** - Rain, snow based on biome/zone
2. **Day/Night Cycle** - Different enemies at night
3. **Quest Markers** - Auto-placed from quest data
4. **Spawn Groups** - Monster packs with leaders
5. **Interactable Props** - Doors, levers, switches
6. **Level Transitions** - Portals to other level files
7. **Music Zones** - Auto-play music per zone
8. **Procedural Variants** - Generate similar levels with randomization

### Level Editor Integration
The Level Editor (press 'P' in-game) can:
- Save current world state to JSON
- Export heightmap and colormap PNGs
- Load saved levels for editing

## Credits

Level design inspired by classic RPG world layouts with:
- Central hub (village) design
- Spoke-based zones radiating outward
- Environmental storytelling through prop placement
- Progressive difficulty scaling

Built using the mesh library's 38 available models across creatures, buildings, and props.
