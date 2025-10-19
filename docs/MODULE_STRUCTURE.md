# RPG Engine Module Structure

This document describes the refactored module structure of the RPG Engine.

## Overview

The RPG Engine has been refactored to use a modular architecture for better maintainability and scalability. The main `world-rpg.js` file now imports and uses specialized modules for different game systems.

## Module Directory

All modules are located in `/public/modules/`

### FBXCharacterLoader.js

**Purpose**: Handles loading and scaling of FBX character models with automatic scale normalization.

**Key Features**:
- Loads all 4 character FBX files (Baelin, Baradun, Bodger, Greg)
- Automatically calculates and applies proper scaling to fix FBX scale issues
- Smart animation detection (idle, walk, talk, run)
- Normalizes all characters to a consistent height (2.0 units by default)

**Usage**:
```javascript
const characterLoader = new FBXCharacterLoader();
await characterLoader.loadAllCharacters();
const model = characterLoader.getModel('baelin');
const idleAnimation = characterLoader.getAnimation('baelin_idle');
```

**Scale Fix**:
The module fixes the common FBX scale issue by:
1. Calculating the bounding box of the loaded model
2. Determining the target scale needed to reach 2.0 units height
3. Applying the calculated scale plus a fine-tuning multiplier (0.01x)

### NPCFactory.js

**Purpose**: Creates and manages NPCs with FBX models or fallback primitive shapes.

**Key Features**:
- Standard NPC creation with consistent dialogue
- Automatic assignment of FBX models to NPCs
- Fallback to primitive shapes if FBX not available
- Floating indicator icons for NPCs
- Default dialogue templates for different NPC types

**Standard NPCs Created**:
1. **Village Elder** (Baelin model) - Quest giver at (10, 10)
2. **Traveling Merchant** (Baradun model) - Merchant at (-10, 10)
3. **Forest Hermit** (Bodger model) - Quest giver at (-25, -25)
4. **Town Guard** (Greg model) - Guard at (15, 15)

**Usage**:
```javascript
const npcFactory = new NPCFactory(characterLoader);
const npcs = npcFactory.createStandardNPCs();
npcs.forEach(npc => {
    const npcObj = npcFactory.createNPCMesh(npc, scene);
    environmentObjects.push(npcObj);
});
```

### EnvironmentFactory.js

**Purpose**: Creates environment objects like trees, rocks, chests, houses, and campfires.

**Key Features**:
- Reusable object creation functions
- Consistent styling across environment objects
- Built-in interaction handlers
- Parameter-driven object customization

**Objects Created**:
- **Trees**: Simple trees with trunk and leaves
- **Rocks**: Random-rotated dodecahedron rocks with variable scale
- **Chests**: Interactive chests with loot
- **Campfires**: Animated fires with healing interaction
- **Houses**: Simple buildings
- **Signs**: Text display signs

**Usage**:
```javascript
const environmentFactory = new EnvironmentFactory(scene);
const tree = environmentFactory.createTree(x, z);
const chest = environmentFactory.createChest(x, z, Item, playerInventory, updateInventoryUI);
```

### CameraController.js

**Purpose**: Manages WoW-style camera controls with mouse-based rotation and zoom.

**Key Features**:
- Right-click drag to rotate camera
- Mouse wheel to zoom in/out
- Smooth camera following of player character
- Configurable camera distance and angles

**Usage**:
```javascript
const cameraController = new CameraController(camera, renderer, characterGroup);
// In animation loop:
cameraController.update();
// Get current angle for movement:
const angle = cameraController.getHorizontalAngle();
```

### GoblinFactory.js

**Purpose**: Creates goblin enemies and goblin camps with respawn mechanics.

**Key Features**:
- Regular goblin creation
- Boss goblin creation with enhanced stats
- Goblin camp generation with multiple enemies
- Built-in combat and respawn logic
- Quest progress integration

**Usage**:
```javascript
const goblinFactory = new GoblinFactory(scene, loadedModels);
const { goblins, environmentObjects } = goblinFactory.createGoblinCamp(
    centerX, centerZ, 
    createCampfireFunction,
    updateQuestProgressFunction
);
```

## Main File Structure (world-rpg.js)

The refactored main file is organized into clear sections:

1. **Scene Setup** - Three.js scene, camera, renderer
2. **Lighting** - Ambient and directional lights
3. **Ground** - Terrain with variation
4. **Player Character** - Player mesh and state
5. **Item Class** - Item definition
6. **Inventory System** - Player inventory management
7. **Quest System** - Quest definitions and progress tracking
8. **Modules Initialization** - Creating instances of all modules
9. **UI Functions** - All UI update functions
10. **Animation Functions** - Player animation states
11. **Input Handling** - Keyboard and mouse events
12. **Interaction Checking** - Proximity-based interactions
13. **Load Assets and Initialize World** - Async initialization
14. **Animation Loop** - Main game loop

## Benefits of Refactoring

1. **Maintainability**: Each system is isolated in its own module
2. **Reusability**: Modules can be reused in other projects
3. **Testability**: Individual modules can be tested independently
4. **Scalability**: Easy to add new features without modifying core systems
5. **Code Organization**: Clear separation of concerns
6. **FBX Scale Fix**: Systematic solution to character scaling issues
7. **All Characters Loaded**: All 4 FBX characters (Baelin, Baradun, Bodger, Greg) are now loaded and used

## File Size Comparison

- **Original**: 2089 lines in a single file
- **Refactored Main File**: ~1000 lines
- **Modules**: ~750 lines total (5 modules)
- **Total**: ~1750 lines (but better organized)

## Future Enhancements

Potential future improvements:
- Add UIManager module for all UI operations
- Create QuestManager module for quest system
- Add InventoryManager module for inventory/trading
- Create AnimationManager for player animations
- Add SoundManager for audio effects
- Create SaveManager for game state persistence
