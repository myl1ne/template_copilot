# Level Design System

The RPG Engine now includes a comprehensive level design system with heightmap-based terrain, biomes, water, and composable terrain features.

## Overview

The level design system is built on three core principles:
1. **Modularity** - Components can be used independently
2. **Composability** - Features can be combined to create complex environments
3. **Biome Awareness** - Terrain and objects adapt to their environment

## Core Components

### 1. TerrainGenerator

Generates heightmap-based terrain with multiple biomes using multi-octave noise.

```javascript
import { TerrainGenerator } from './modules/TerrainGenerator.js';

const terrainGenerator = new TerrainGenerator({
  size: 100,           // World size
  segments: 100,       // Terrain detail
  heightScale: 10,     // Maximum height variation
  waterLevel: 3,       // Height of water plane
  seed: 12345          // Random seed for reproducibility
});

const terrain = terrainGenerator.createTerrain();
scene.add(terrain);
```

**Features:**
- Multi-octave noise for natural-looking terrain
- Automatic vertex coloring based on biomes
- Height and biome query methods for object placement
- Deterministic generation with seed support

### 2. Biome System

Seven distinct biomes that affect terrain color and object placement:

| Biome | Conditions | Color | Features |
|-------|-----------|-------|----------|
| **Water** | height < waterLevel | Blue | No objects |
| **Beach** | Just above water | Sand | Palm trees, smooth rocks |
| **Grassland** | Low-medium height, medium moisture | Green | Oak/birch trees, normal rocks |
| **Forest** | Medium height, high moisture | Dark green | Dense oak/pine trees, mossy rocks |
| **Desert** | Low moisture | Golden | Sparse dead trees, sandstone rocks |
| **Mountain** | High altitude | Gray | Few pine trees, granite rocks |
| **Snow** | Highest altitude | White | Sparse pine trees, ice rocks |

```javascript
import { BiomeSystem } from './modules/BiomeSystem.js';

const biomeSystem = new BiomeSystem(terrainGenerator, environmentFactory);

// Check if position is suitable for an object
if (biomeSystem.isSuitablePosition(x, z, 'tree')) {
  // Place tree at this location
}

// Get biome-specific variant
const variant = biomeSystem.getObjectVariant('rock', 'mountain'); // Returns 'granite'

// Populate with biome-aware objects
const trees = biomeSystem.populateBiomeObjects(40, 'tree', (x, z, height, variant, biome) => {
  return environmentFactory.createTree(x, z, null, null, null, variant, height);
});
```

### 3. WaterPlane

Animated water surface with transparency and wave effects.

```javascript
import { WaterPlane } from './modules/WaterPlane.js';

const waterPlane = new WaterPlane({
  size: 100,
  waterLevel: 3
});

const water = waterPlane.create();
scene.add(water);

// In animation loop
function animate(deltaTime) {
  waterPlane.animate(deltaTime);
}
```

### 4. Composable Terrain Features

Modular terrain elements that can be combined to create complex level designs.

```javascript
import { TerrainFeatures } from './modules/TerrainFeatures.js';

const features = new TerrainFeatures(scene);

// Create a hill
features.createHill(x, z, radius, height, { color: 0x3a7d44 });

// Create a plateau
features.createPlateau(x, z, width, depth, height, { color: 0x8b7355 });

// Create a valley
features.createValley(x, z, radius, depth, { color: 0x6b8e23 });

// Create a canyon
features.createCanyon(x, z, length, width, depth, angle, { color: 0xa0522d });

// Create a cave entrance
const cave = features.createCaveEntrance(x, z, size);

// Create a bridge
features.createBridge(x, z, length, height, angle, { width: 2 });

// Create a ramp
features.createRamp(x, z, length, heightDiff, angle, { width: 3 });
```

#### Available Features

**Hills** - Rounded elevated areas
- Parameters: position (x, z), radius, height
- Use for: Gentle elevation changes, natural terrain variation

**Plateaus** - Flat elevated areas with steep sides
- Parameters: position (x, z), width, depth, height
- Use for: Defensive positions, building sites, dramatic terrain

**Valleys** - Depressions in terrain
- Parameters: position (x, z), radius, depth
- Use for: Natural pathways, river beds, protected areas

**Canyons** - Long narrow ravines
- Parameters: position (x, z), length, width, depth, angle
- Use for: Natural barriers, dramatic passages, quest locations

**Cave Entrances** - Rocky cave openings
- Parameters: position (x, z), size
- Use for: Dungeons, secret areas, shelter
- Interactable: Yes

**Bridges** - Wooden bridges over gaps
- Parameters: position (x, z), length, height, angle
- Use for: Crossing water, canyons, or valleys

**Ramps** - Sloped surfaces for height transitions
- Parameters: position (x, z), length, heightDiff, angle
- Use for: Smooth transitions between height levels

## Integration with WorldSetup

The WorldSetup module now supports advanced terrain:

```javascript
import { WorldSetup } from './modules/WorldSetup.js';

// Enable advanced terrain (default: true)
const worldSetup = new WorldSetup({ useAdvancedTerrain: true });
const { scene, camera, renderer, terrainGenerator } = worldSetup.init(container);

// Animate water in your render loop
function animate() {
  const deltaTime = clock.getDelta();
  worldSetup.animate(deltaTime);
  renderer.render(scene, camera);
}
```

To use legacy simple terrain:
```javascript
const worldSetup = new WorldSetup({ useAdvancedTerrain: false });
```

## Level Design Best Practices

### 1. Combining Features

Create interesting landscapes by combining multiple features:

```javascript
// Create a village on a plateau
const plateau = features.createPlateau(0, 0, 20, 20, 5);

// Add ramps for access
features.createRamp(-12, 0, 8, 5, 0);
features.createRamp(12, 0, 8, 5, Math.PI);

// Add buildings and NPCs on top of plateau (at y = 5)
```

### 2. Biome-Aware Placement

Let the biome system determine appropriate object placement:

```javascript
// Automatically places trees only in suitable biomes
biomeSystem.populateBiomeObjects(50, 'tree', (x, z, height, variant, biome) => {
  // variant will be biome-appropriate (e.g., 'pine' in mountains)
  return environmentFactory.createTree(x, z, null, null, null, variant, height);
});
```

### 3. Creating Natural Paths

Use valleys and canyons to guide player movement:

```javascript
// Create a winding path through terrain
features.createValley(0, 0, 8, 2);
features.createCanyon(10, 10, 20, 4, 3, Math.PI / 4);
```

### 4. Height Variation

Use the terrain generator to position objects correctly:

```javascript
const x = 10, z = 15;
const height = terrainGenerator.getHeightAt(x, z);
const biome = terrainGenerator.getBiomeAt(x, z);

// Place object at terrain height
object.position.set(x, height, z);
```

### 5. Performance Considerations

- Use appropriate segment counts (50-100 for most cases)
- Limit the number of complex features (canyons, caves)
- Use biome density to control object distribution
- Consider LOD for distant terrain features

## Example: Complete Level

```javascript
// Initialize systems
const worldSetup = new WorldSetup({ useAdvancedTerrain: true });
const { scene, terrainGenerator } = worldSetup.init(container);

const environmentFactory = new EnvironmentFactory(scene);
const biomeSystem = new BiomeSystem(terrainGenerator, environmentFactory);
const features = new TerrainFeatures(scene);

// Add terrain features
features.createHill(-20, -20, 10, 5);
features.createPlateau(0, 0, 15, 15, 6);
features.createCanyon(20, -15, 25, 5, 6, Math.PI / 6);
features.createCaveEntrance(-15, 20, 3);
features.createBridge(-10, -5, 12, 3, 0);

// Populate with biome-aware vegetation
biomeSystem.populateBiomeObjects(50, 'tree', (x, z, height, variant, biome) => {
  return environmentFactory.createTree(x, z, null, null, null, variant, height);
});

biomeSystem.populateBiomeObjects(30, 'rock', (x, z, height, variant, biome) => {
  return environmentFactory.createRock(x, z, 1, variant, height);
});

// Analyze biome distribution
const distribution = biomeSystem.analyzeBiomeDistribution(1000);
console.log('Biome distribution:', distribution);
```

## Demos

### Terrain Demo
View the heightmap terrain with biomes and water:
```bash
npm run dev
```
Then open: http://localhost:3000/terrain-demo.html

### Terrain Features Demo
View composable terrain features:
```bash
npm run dev
```
Then open: http://localhost:3000/terrain-features-demo.html

## API Reference

### TerrainGenerator

**Constructor Options:**
- `size` (number): World size in units (default: 100)
- `segments` (number): Terrain mesh segments (default: 100)
- `heightScale` (number): Maximum height variation (default: 10)
- `waterLevel` (number): Height of water plane (default: 0)
- `seed` (number): Random seed (default: random)

**Methods:**
- `createTerrain()`: Returns THREE.Mesh
- `getHeightAt(x, z)`: Returns height at position
- `getBiomeAt(x, z)`: Returns biome object at position
- `isWater(x, z)`: Returns boolean

### BiomeSystem

**Constructor:**
- `BiomeSystem(terrainGenerator, environmentFactory)`

**Methods:**
- `isSuitablePosition(x, z, objectType)`: Check if position is suitable
- `getObjectVariant(objectType, biomeType)`: Get biome-specific variant
- `populateBiomeObjects(count, objectType, callback)`: Place objects
- `analyzeBiomeDistribution(samples)`: Get biome statistics

### WaterPlane

**Constructor Options:**
- `size` (number): Water plane size (default: 100)
- `waterLevel` (number): Height of water (default: 2)

**Methods:**
- `create()`: Returns THREE.Mesh
- `animate(deltaTime)`: Update water animation

### TerrainFeatures

**Constructor:**
- `TerrainFeatures(scene)`

**Methods:**
- `createHill(x, z, radius, height, options)`
- `createPlateau(x, z, width, depth, height, options)`
- `createValley(x, z, radius, depth, options)`
- `createCanyon(x, z, length, width, depth, angle, options)`
- `createCaveEntrance(x, z, size, options)`
- `createBridge(x, z, length, height, angle, options)`
- `createRamp(x, z, length, heightDiff, angle, options)`

All methods return an object with `type`, `mesh`, `position`, and feature-specific properties.

## Future Enhancements

Potential additions to the level design system:
- Procedural road/path generation
- River and stream systems
- Weather and time-of-day effects
- Dynamic terrain deformation
- More biome types (swamp, tundra, volcanic)
- Terrain LOD system for large worlds
- Cliff and overhang generation
- Underground cave systems
