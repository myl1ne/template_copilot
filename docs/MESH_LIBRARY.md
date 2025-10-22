# Mesh Library System - Documentation

## Overview

The RPG Mesh Library is a comprehensive collection of 3D models built entirely from primitive shapes (spheres, boxes, cylinders, cones, etc.) using Three.js. The library is organized into three main categories and provides 38 unique models that can be used throughout the game.

## Architecture

The mesh library has been refactored into a modular system for better organization and maintainability:

### Module Structure

```
public/modules/
├── MeshLibrary.js          # Main interface and backwards compatibility
└── meshLibrary/
    ├── CreatureLibrary.js  # 13 creature/monster definitions
    ├── BuildingLibrary.js  # 10 building/structure definitions
    └── PropsLibrary.js     # 15 prop/decoration definitions
```

### Design Principles

1. **Modular Organization**: Each category (creatures, buildings, props) is in its own file
2. **Primitive-Based**: All models are constructed from basic Three.js geometries
3. **Backwards Compatibility**: Original `MeshLibrary.getMonsterMesh()` still works
4. **Extensible**: Easy to add new models without modifying existing code
5. **Type Safety**: Clear category and type naming conventions

## Content Library

### Creatures (13 models)
Built for combat encounters and wildlife:

- **goblin** - Small humanoid with club weapon
- **orc** - Large warrior with battle axe
- **spider** - Eight-legged arachnid
- **wolf** - Quadruped predator
- **bear** - Large powerful beast
- **dragon** - Boss-level flying creature with wings
- **rat** - Small vermin creature
- **snake** - Serpentine creature with segmented body
- **skeleton** - Undead warrior with sword
- **scorpion** - Desert creature with stinger and claws
- **bat** - Flying nocturnal creature
- **troll** - Massive humanoid with tree trunk weapon
- **slime** - Gelatinous transparent creature

### Buildings (10 models)
Architectural elements for world building:

- **house** - Basic dwelling with roof and door
- **tower** - Tall defensive structure with windows
- **castle_wall** - Fortification wall segment with battlements
- **windmill** - Mill with rotating blades
- **well** - Water well with bucket and roof
- **barn** - Large agricultural building
- **bridge** - Wooden bridge segment
- **market_stall** - Trading booth with awning
- **fence** - Basic fence section
- **lighthouse** - Tall lighthouse with light chamber

### Props (15 models)
Environmental objects and decorations:

- **barrel** - Wooden storage barrel with metal bands
- **crate** - Wooden box with cross braces
- **campfire** - Stone circle with fire and logs
- **torch** - Handheld or wall-mounted light source
- **signpost** - Wooden sign on post
- **table** - Four-legged wooden table
- **chair** - Simple wooden chair
- **bed** - Bed with frame and mattress
- **bookshelf** - Multi-shelf storage with books
- **lantern** - Metal frame lantern with glass
- **mushroom** - Toadstool with red cap and white spots
- **crystal** - Glowing gem/crystal formation
- **tombstone** - Stone gravemarker
- **cauldron** - Three-legged pot with bubbling liquid
- **weapon_rack** - Display rack with swords

## Usage

### Basic Usage

```javascript
import { MeshLibrary } from './modules/MeshLibrary.js';

// Get a creature mesh
const goblinMesh = MeshLibrary.getMesh('creatures', 'goblin');
scene.add(goblinMesh);

// Get a building mesh
const houseMesh = MeshLibrary.getMesh('buildings', 'house');
scene.add(houseMesh);

// Get a prop mesh
const barrelMesh = MeshLibrary.getMesh('props', 'barrel');
scene.add(barrelMesh);
```

### Backwards Compatibility

```javascript
// Old method still works for creatures
const orcMesh = MeshLibrary.getMonsterMesh('orc');
scene.add(orcMesh);

// Direct method calls
const dragonMesh = MeshLibrary.createDragonMesh();
scene.add(dragonMesh);
```

### Advanced Usage

```javascript
// Get all available content
const allContent = MeshLibrary.getAllContent();
console.log(allContent);
// {
//   creatures: ['goblin', 'orc', 'spider', ...],
//   buildings: ['house', 'tower', ...],
//   props: ['barrel', 'crate', ...]
// }

// Get content metadata
const info = MeshLibrary.getContentInfo();
console.log(info.totalCount); // 38
console.log(info.categories.creatures.count); // 13
```

### Direct Library Access

```javascript
import { CreatureLibrary } from './modules/meshLibrary/CreatureLibrary.js';
import { BuildingLibrary } from './modules/meshLibrary/BuildingLibrary.js';
import { PropsLibrary } from './modules/meshLibrary/PropsLibrary.js';

// Direct access to specific libraries
const slimeMesh = CreatureLibrary.getMesh('slime');
const lighthouseMesh = BuildingLibrary.getMesh('lighthouse');
const crystalMesh = PropsLibrary.getMesh('crystal');

// Get all types from a specific library
const allCreatures = CreatureLibrary.getAllTypes();
```

## Mesh Library Visualizer

A dedicated visualization tool is available at `/mesh-visualizer.html` that provides:

- **Interactive 3D Viewer**: View and rotate any model in the library
- **Category Organization**: Browse by creatures, buildings, or props
- **Search & Filter**: Find models quickly by name or category
- **Model Information**: See mesh count and other details
- **Camera Controls**: 
  - Mouse drag to rotate
  - Mouse wheel to zoom
  - Reset camera button

### Accessing the Visualizer

1. Open your browser to `http://localhost:3000/mesh-visualizer.html`
2. Or use the main menu at `http://localhost:3000/menu.html`
3. Click on any model name in the sidebar to view it
4. Use the search box to filter models
5. Select category from dropdown to show only specific types

## Adding New Models

### Step 1: Choose the appropriate library file

- Creatures → `CreatureLibrary.js`
- Buildings → `BuildingLibrary.js`
- Props → `PropsLibrary.js`

### Step 2: Add a creation method

```javascript
/**
 * Create a new creature mesh
 */
static createMyCreatureMesh() {
    const group = new THREE.Group();
    
    // Build your model using primitives
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);
    
    return group;
}
```

### Step 3: Add to getAllTypes() method

```javascript
static getAllTypes() {
    return [
        'goblin', 'orc', 'spider', /* ... */, 'my_creature'
    ];
}
```

### Step 4: Add to getMesh() switch statement

```javascript
static getMesh(type) {
    switch(type) {
        // ... existing cases
        case 'my_creature': return this.createMyCreatureMesh();
        // ...
    }
}
```

## Best Practices

### Model Construction

1. **Use Groups**: Always wrap your model in a `THREE.Group()`
2. **Enable Shadows**: Set `castShadow = true` on meshes that should cast shadows
3. **Position Correctly**: Position models so Y=0 is at ground level
4. **Scale Appropriately**: Keep models at reasonable sizes (most creatures are 1-3 units tall)
5. **Use Standard Materials**: Prefer `MeshStandardMaterial` for realistic lighting

### Naming Conventions

1. **Use lowercase with underscores**: `castle_wall`, not `CastleWall` or `castle-wall`
2. **Be descriptive**: `weapon_rack` is better than `rack`
3. **Category prefix for ambiguity**: If a name could fit multiple categories, prefix it

### Performance

1. **Keep mesh counts reasonable**: Most models should use 5-15 meshes
2. **Optimize geometry segments**: Use lower segment counts for simple shapes
3. **Share materials when possible**: Create material once, reuse for multiple meshes
4. **Use instancing for repeated elements**: Legs, windows, etc.

## Integration Examples

### In Monster Factory

```javascript
import { MeshLibrary } from './modules/MeshLibrary.js';

createMonster(type, config) {
    const monsterGroup = new THREE.Group();
    
    // Use mesh library for the visual representation
    const meshTemplate = MeshLibrary.getMesh('creatures', type);
    monsterGroup.add(meshTemplate);
    
    // Add game logic...
}
```

### In Environment Factory

```javascript
import { BuildingLibrary } from './modules/meshLibrary/BuildingLibrary.js';

createBuilding(type, position) {
    const building = BuildingLibrary.getMesh(type);
    building.position.set(position.x, 0, position.z);
    this.scene.add(building);
}
```

### Dynamic Loading

```javascript
// Load multiple props at once
const propTypes = ['barrel', 'crate', 'campfire'];
propTypes.forEach((type, index) => {
    const prop = MeshLibrary.getMesh('props', type);
    prop.position.x = index * 2;
    scene.add(prop);
});
```

## Troubleshooting

### Model not appearing

1. Check that the category and type names are correct (case-sensitive)
2. Ensure the model is added to the scene: `scene.add(mesh)`
3. Verify camera position can see the model
4. Check that meshes have `castShadow` enabled if shadows are important

### Category error message

If you see "Unknown category" warning:
- Check spelling of category name
- Use plural forms: 'creatures', 'buildings', 'props'
- Or use singular: 'creature', 'building', 'prop'

### Model positioned incorrectly

- Models should be positioned with Y=0 at ground level
- Use `model.position.y = 0` to place on ground
- Check that internal mesh positions are relative to the group

## Future Enhancements

Potential additions to the mesh library system:

1. **Animation Support**: Add simple animations (idle, walk, attack)
2. **Material Variants**: Color variations for the same model
3. **LOD (Level of Detail)**: Multiple quality levels for performance
4. **Model Metadata**: Additional info (size, weight, rarity)
5. **Export System**: Save models to external formats
6. **Procedural Generation**: Generate variations programmatically
7. **Particle Effects**: Integrate particle systems (fire, magic, etc.)

## Credits

All models in the mesh library are procedurally generated using Three.js primitives. No external models or textures are used, making the library lightweight and easy to modify.

## Version History

- **v1.0.0** (Current) - Initial modular refactor with 38 models
  - 13 creatures
  - 10 buildings  
  - 15 props
  - Mesh library visualizer tool
