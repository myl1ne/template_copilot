# MAC (MeshAsCode) Framework Documentation

## Overview

MAC (MeshAsCode) is a powerful framework for creating complex 3D meshes using only code. It allows for recursive composition where MACs can contain other MACs, enabling you to build increasingly complex abstractions from simple primitives.

## Key Features

- **Code as Data**: Mesh definitions are stored as code strings, making them easy to save, load, and edit
- **Recursive Composition**: MACs can contain other MACs, allowing complex hierarchies
- **Primitive Building Blocks**: Built-in support for all Three.js primitives
- **Transformation System**: Easy positioning, rotation, and scaling
- **Material Support**: Full material customization with PBR properties
- **Persistence**: Save/load to JSON, JavaScript code, or localStorage
- **Visual Editor**: Interactive UI for creating and editing MACs

## Architecture

### Core Components

```
public/modules/mac/
├── MACCore.js           # Core MAC, MACBuilder, MACLibrary classes
├── MACPersistence.js    # Save/load functionality
└── MACExamples.js       # Pre-built example templates
```

### Class Hierarchy

- **MAC**: Represents a mesh or group of meshes defined by code
- **MACBuilder**: Builds Three.js objects from MAC definitions
- **MACLibrary**: Collection of pre-defined MAC templates
- **MACPersistence**: Handles save/load operations
- **MACAssetManager**: Manages collections of MAC assets

## Quick Start

### Basic Usage

```javascript
import { MAC } from './modules/mac/MACCore.js';

// Create a simple box
const box = new MAC('box', {
    width: 1, height: 1, depth: 1,
    material: { color: 0xff0000 }
});

// Build Three.js mesh
const mesh = box.build();
scene.add(mesh);
```

### Composition

```javascript
// Create a tree by composing primitives
const tree = new MAC('group')
    .add('cylinder', { 
        radiusTop: 0.2, 
        radiusBottom: 0.3, 
        height: 2,
        material: { color: 0x4a2511 }
    })
    .position(0, 1, 0)
    .add('cone', {
        radius: 1, 
        height: 2,
        material: { color: 0x2d5016 }
    })
    .position(0, 3, 0);

const mesh = tree.build();
scene.add(mesh);
```

### Recursive Composition

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';

// Register a reusable component
MACLibrary.register('wheel',
    new MAC('cylinder', {
        radiusTop: 0.3, radiusBottom: 0.3, height: 0.1,
        material: { color: 0x333333 }
    })
    .rotation(0, 0, Math.PI / 2)
);

// Use the component in a larger structure
const cart = new MAC('group')
    .add('box', {
        width: 1.5, height: 0.5, depth: 1,
        material: { color: 0x8b7355 }
    })
    .position(0, 0.5, 0)
    .add(MACLibrary.get('wheel'))
    .position(-0.5, 0.15, -0.5)
    .add(MACLibrary.get('wheel'))
    .position(0.5, 0.15, -0.5);
```

## Primitives

The following primitives are available:

- **group**: Empty container for organizing meshes
- **box**: Box/cube geometry
- **sphere**: Sphere geometry
- **cylinder**: Cylinder geometry
- **cone**: Cone geometry
- **capsule**: Capsule geometry (pill shape)
- **torus**: Torus (donut) geometry
- **plane**: Flat plane geometry
- **ring**: Ring (flat donut) geometry

### Primitive Parameters

Each primitive accepts specific parameters:

```javascript
// Box
new MAC('box', {
    width: 1, 
    height: 1, 
    depth: 1,
    widthSegments: 1, 
    heightSegments: 1, 
    depthSegments: 1,
    material: { color: 0xffffff }
});

// Sphere
new MAC('sphere', {
    radius: 0.5,
    widthSegments: 16,
    heightSegments: 16,
    material: { color: 0xffffff }
});

// Cylinder
new MAC('cylinder', {
    radiusTop: 0.5,
    radiusBottom: 0.5,
    height: 1,
    radialSegments: 16,
    heightSegments: 1,
    material: { color: 0xffffff }
});
```

## Transformations

### Position, Rotation, Scale

```javascript
const mac = new MAC('box')
    .position(0, 1, 0)      // Move to Y=1
    .rotation(0, Math.PI/4, 0)  // Rotate 45° around Y
    .scale(2, 1, 1);        // Scale 2x on X axis
```

### Transform Chaining

Transformations are applied in the order they are called:

```javascript
const mac = new MAC('box')
    .position(1, 0, 0)
    .rotation(0, Math.PI/2, 0)
    .position(0, 1, 0);  // This adds to the previous position
```

## Materials

Materials support PBR (Physically Based Rendering) properties:

```javascript
const mac = new MAC('sphere', {
    radius: 1,
    material: {
        color: 0xff0000,        // Base color
        emissive: 0x000000,     // Emissive color
        metalness: 0.8,         // 0-1, how metallic
        roughness: 0.2,         // 0-1, how rough
        transparent: false,     // Enable transparency
        opacity: 1,             // 0-1 opacity
        wireframe: false        // Show wireframe
    }
});
```

## Persistence

### Save to LocalStorage

```javascript
import { MACPersistence } from './modules/mac/MACPersistence.js';

const mac = new MAC('box');
MACPersistence.saveToLocalStorage('my_box', mac);

// Load later
const loadedMac = MACPersistence.loadFromLocalStorage('my_box');
```

### Export to Files

```javascript
// Export as JavaScript code
MACPersistence.exportAsCode(mac, 'my_mesh');  // Downloads my_mesh.js

// Export as JSON
MACPersistence.exportAsJSON(mac, 'my_mesh');  // Downloads my_mesh.json
```

### Import from Files

```javascript
// In UI with file input
const file = fileInput.files[0];
const mac = await MACPersistence.importFromFile(file);
```

### Code Serialization

```javascript
// Convert to code string
const code = mac.toCode();
console.log(code);
// Output:
// new MAC('box', {
//   "width": 1,
//   "height": 1,
//   "depth": 1
// })

// Load from code string
const mac = MACLibrary.fromCode(code);
```

## MAC Library

### Register Templates

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';

MACLibrary.register('my_template', 
    new MAC('group')
        .add('box', { width: 1, height: 1, depth: 1 })
        .position(0, 0.5, 0)
);

// Use template
const instance = MACLibrary.get('my_template');
scene.add(instance.build());
```

### Pre-built Templates

The system includes many pre-built templates:

- **simple_tree**: Basic tree with trunk and foliage
- **simple_house**: House with walls and roof
- **simple_character**: Basic humanoid character
- **torch**: Handheld torch with flame
- **barrel**: Storage barrel with bands
- **fence_section**: Reusable fence segment
- **cart**: Cart with wheels
- **tower**: Multi-level tower
- **detailed_tree**: Complex tree with multiple layers
- **market_stall**: Trading stall with goods
- **knight**: Armored character with shield and sword
- **campfire**: Fire pit with logs
- **bridge**: Bridge section with railings

See `MACExamples.js` for all available templates.

## MAC Editor

### Accessing the Editor

Open your browser to:
```
http://localhost:3000/mac-editor.html
```

### Editor Features

1. **Visual 3D Viewport**: Real-time preview of your MAC
2. **Template Library**: Browse and load pre-built templates
3. **Code Editor**: View and edit generated code
4. **Composition Tools**: Add primitives and compose MACs
5. **Transform Controls**: Position, rotate, and scale
6. **Material Editor**: Customize colors and PBR properties
7. **Save/Load**: Persist your work to localStorage or files

### Workflow

1. Start with a template or create new
2. Add primitives using the Compose tab
3. Adjust transforms and materials in Properties tab
4. View/edit generated code in Code tab
5. Save to localStorage or export to file

## Advanced Patterns

### Building Reusable Components

```javascript
// 1. Create a component
const createWindow = () => {
    return new MAC('group')
        .add('box', {
            width: 0.4, height: 0.6, depth: 0.05,
            material: { color: 0x4169e1 }
        });
};

// 2. Use it multiple times
const building = new MAC('group')
    .add('box', {
        width: 4, height: 3, depth: 4,
        material: { color: 0x808080 }
    })
    .add(createWindow()).position(-1, 1.5, 2.01)
    .add(createWindow()).position(0, 1.5, 2.01)
    .add(createWindow()).position(1, 1.5, 2.01);
```

### Procedural Generation

```javascript
// Generate a ring of pillars
const pillars = new MAC('group');

for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 5;
    const z = Math.sin(angle) * 5;
    
    pillars.add('cylinder', {
        radiusTop: 0.3, radiusBottom: 0.3, height: 3,
        material: { color: 0x808080 }
    }).position(x, 1.5, z);
}
```

### Dynamic Variations

```javascript
// Create variations of the same MAC
const createTreeVariant = (scale, color) => {
    return MACLibrary.get('simple_tree')
        .scale(scale, scale, scale)
        .transform('material_override', { color });
};

const forest = new MAC('group')
    .add(createTreeVariant(1, 0x2d5016)).position(-2, 0, 0)
    .add(createTreeVariant(1.2, 0x3d6e49)).position(0, 0, 0)
    .add(createTreeVariant(0.8, 0x4a7c59)).position(2, 0, 0);
```

## Asset Management

### Using MACAssetManager

```javascript
import { MACAssetManager } from './modules/mac/MACPersistence.js';

const manager = new MACAssetManager();

// Add assets with metadata
manager.add('tree_oak', oakTree, {
    category: 'nature',
    tags: ['tree', 'vegetation', 'outdoor']
});

manager.add('building_house', house, {
    category: 'buildings',
    tags: ['structure', 'residential']
});

// Search assets
const trees = manager.search('tree');

// Export collection
const json = manager.export();

// Save to localStorage
manager.saveToLocalStorage();
```

## Integration with Existing Systems

### Using with MeshLibrary

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';
import { MeshLibrary } from './modules/MeshLibrary.js';

// Create a MAC version of an existing mesh
const goblinMAC = new MAC('group')
    .add('capsule', {
        radius: 0.3, length: 0.8,
        material: { color: 0x4a7c59 }
    })
    .position(0, 0.9, 0);

MACLibrary.register('goblin', goblinMAC);

// Use interchangeably
const mesh1 = MeshLibrary.getMonsterMesh('goblin');  // Old system
const mesh2 = MACLibrary.get('goblin').build();       // New MAC system
```

### Level Editor Integration

```javascript
// In your level editor
import { MACLibrary } from './modules/mac/MACCore.js';

function placeAsset(type, position) {
    const mac = MACLibrary.get(type);
    if (mac) {
        const mesh = mac.build();
        mesh.position.set(...position);
        scene.add(mesh);
    }
}
```

## Best Practices

### 1. Organize with Groups

```javascript
// Bad: Flat structure
const character = new MAC('sphere')
    .add('cylinder')
    .add('capsule');

// Good: Organized hierarchy
const character = new MAC('group')
    .add(new MAC('group')  // Head
        .add('sphere', { radius: 0.25 })
    )
    .add(new MAC('group')  // Body
        .add('capsule', { radius: 0.3, length: 0.8 })
    );
```

### 2. Use Descriptive Names

```javascript
// Bad
MACLibrary.register('thing1', mac);

// Good
MACLibrary.register('oak_tree_young', mac);
```

### 3. Keep Primitives Reasonable

```javascript
// Bad: Too many segments
new MAC('sphere', { 
    widthSegments: 128, 
    heightSegments: 128 
});

// Good: Balanced quality/performance
new MAC('sphere', { 
    widthSegments: 16, 
    heightSegments: 16 
});
```

### 4. Leverage Composition

```javascript
// Bad: Duplicate code
const tree1 = new MAC('group').add('cylinder')...;
const tree2 = new MAC('group').add('cylinder')...;

// Good: Reuse components
MACLibrary.register('tree_base', baseMAC);
const tree1 = MACLibrary.get('tree_base').add(...);
const tree2 = MACLibrary.get('tree_base').add(...);
```

## API Reference

### MAC Class

#### Constructor
```javascript
new MAC(type, params)
```

#### Methods
- `add(macOrType, params)` - Add child MAC
- `position(x, y, z)` - Set position
- `rotation(x, y, z)` - Set rotation
- `scale(x, y, z)` - Set scale
- `transform(type, value)` - Generic transform
- `build()` - Build Three.js mesh
- `toJSON()` - Serialize to JSON
- `toCode(indent)` - Generate code string
- `clone()` - Clone this MAC

#### Static Methods
- `MAC.fromJSON(json)` - Deserialize from JSON
- `MAC.generateId()` - Generate unique ID

### MACBuilder Class

#### Static Methods
- `MACBuilder.build(mac)` - Build Three.js object
- `MACBuilder.register(type, builderFn)` - Register custom builder
- `MACBuilder.createMaterial(params)` - Create material

### MACLibrary Class

#### Static Methods
- `MACLibrary.register(name, mac)` - Register template
- `MACLibrary.get(name)` - Get template (cloned)
- `MACLibrary.getAll()` - Get all template names
- `MACLibrary.fromCode(code)` - Create from code string

### MACPersistence Class

#### Static Methods
- `toJSON(mac)` - Convert to JSON string
- `fromJSON(jsonString)` - Parse from JSON string
- `toCode(mac, includeMACImport)` - Convert to code
- `fromCode(codeString)` - Parse from code
- `saveToLocalStorage(name, mac)` - Save to localStorage
- `loadFromLocalStorage(name)` - Load from localStorage
- `getAllSavedNames()` - Get all saved names
- `deleteFromLocalStorage(name)` - Delete from localStorage
- `exportAsJSON(mac, filename)` - Export as JSON file
- `exportAsCode(mac, filename)` - Export as JS file
- `importFromFile(file)` - Import from file

### MACAssetManager Class

#### Methods
- `add(name, mac, metadata)` - Add asset
- `get(name)` - Get asset (cloned)
- `remove(name)` - Remove asset
- `list()` - List all asset names
- `search(query)` - Search assets
- `export()` - Export to JSON string
- `import(jsonString)` - Import from JSON
- `saveToLocalStorage(key)` - Save to localStorage
- `loadFromLocalStorage(key)` - Load from localStorage
- `clear()` - Clear all assets

## Troubleshooting

### MAC doesn't appear in scene

```javascript
// Check that you're calling build()
const mac = new MAC('box');
const mesh = mac.build();  // Don't forget this!
scene.add(mesh);
```

### Code won't parse

```javascript
// Ensure you're using proper syntax
const code = `new MAC('box', {
  "width": 1
})`;  // Valid JSON in params

const mac = MACLibrary.fromCode(code);
```

### Transforms not applying

```javascript
// Transforms are stored and applied during build()
const mac = new MAC('box')
    .position(1, 0, 0);

const mesh = mac.build();  // Position applied here
```

## Future Enhancements

Potential additions to the MAC system:

1. **Animation Support**: Keyframe animations for MACs
2. **Physics Integration**: Collision shapes from MACs
3. **LOD Support**: Multiple detail levels
4. **Texture Mapping**: UV mapping and texture support
5. **Custom Geometries**: Buffer geometry support
6. **Particle Systems**: Integrated particle effects
7. **Shader Materials**: Custom shader support
8. **Version Control**: Track MAC changes over time

## Examples Gallery

See `public/modules/mac/MACExamples.js` for complete examples including:
- Simple primitives
- Recursive compositions
- Complex structures
- Reusable components
- Character models
- Environmental props
- Buildings and architecture

## Contributing

When adding new MACs to the library:

1. Follow naming conventions (lowercase with underscores)
2. Use reasonable segment counts for primitives
3. Organize complex MACs with groups
4. Add descriptive comments
5. Test in the MAC Editor
6. Document any special features

## License

Part of the template_copilot project. MIT License.
