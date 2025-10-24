# MAC (MeshAsCode) Framework

A powerful recursive framework for creating complex 3D meshes using only code. Build increasingly complex abstractions by composing simple primitives, with full code serialization for easy save/load/edit workflows.

## 🎨 Overview

MAC allows you to define 3D meshes as code that can be:
- **Stored as strings** for easy persistence
- **Recursively composed** where MACs contain other MACs
- **Visually edited** in an interactive UI
- **Saved and loaded** from JSON or JavaScript files

## 🚀 Quick Start

### Basic Example

```javascript
import { MAC } from './modules/mac/MACCore.js';

// Create a simple tree
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

// Build and add to scene
const mesh = tree.build();
scene.add(mesh);
```

### Recursive Composition

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';

// Register a reusable wheel component
MACLibrary.register('wheel',
    new MAC('cylinder', {
        radiusTop: 0.3, radiusBottom: 0.3, height: 0.1,
        material: { color: 0x333333 }
    })
    .rotation(0, 0, Math.PI / 2)
);

// Use the wheel in a larger structure
const cart = new MAC('group')
    .add('box', {
        width: 1.5, height: 0.5, depth: 1,
        material: { color: 0x8b7355 }
    })
    .position(0, 0.5, 0)
    .add(MACLibrary.get('wheel')).position(-0.5, 0.15, -0.5)
    .add(MACLibrary.get('wheel')).position(0.5, 0.15, -0.5)
    .add(MACLibrary.get('wheel')).position(-0.5, 0.15, 0.5)
    .add(MACLibrary.get('wheel')).position(0.5, 0.15, 0.5);
```

## 📁 Files Structure

```
public/modules/mac/
├── MACCore.js           # Core MAC, MACBuilder, MACLibrary classes
├── MACPersistence.js    # Save/load functionality
└── MACExamples.js       # 15+ pre-built example templates

public/
├── mac-editor.html      # Visual MAC editor interface
├── mac-editor.js        # Editor implementation
├── mac-demo.html        # Interactive demo showcase
└── mac-demo.js          # Demo implementation

docs/
└── MAC_FRAMEWORK.md     # Complete documentation

tests/
└── mac-test.js          # Test suite (15 tests)
```

## 🎯 Key Features

### 1. Code as Data
Mesh definitions are stored as code strings, making them easy to edit, version control, and share:

```javascript
const code = mac.toCode();
// Returns JavaScript code that can recreate the MAC
```

### 2. Recursive Composition
MACs can contain other MACs, enabling complex hierarchies:

```javascript
const component = new MAC('sphere', { radius: 0.5 });
const parent = new MAC('group').add(component);
const grandparent = new MAC('group').add(parent);
```

### 3. Full Persistence
Save and load MACs in multiple formats:

```javascript
import { MACPersistence } from './modules/mac/MACPersistence.js';

// Save to localStorage
MACPersistence.saveToLocalStorage('my_mesh', mac);

// Export to file
MACPersistence.exportAsCode(mac, 'my_mesh');  // .js file
MACPersistence.exportAsJSON(mac, 'my_mesh');  // .json file

// Import from file
const mac = await MACPersistence.importFromFile(file);
```

### 4. Visual Editor
Interactive UI for creating and editing MACs with:
- Real-time 3D preview
- Template library browser
- Code viewer/editor
- Transform controls
- Material customization

Access at: `http://localhost:3001/mac-editor.html`

### 5. Template Library
15+ pre-built templates including:
- `simple_tree`, `detailed_tree`
- `simple_house`, `tower`
- `knight`, `cart`
- `campfire`, `bridge`
- `barrel`, `torch`
- And more!

### 6. 9 Primitive Types
Built-in support for:
- `box` - Box/cube geometry
- `sphere` - Sphere geometry
- `cylinder` - Cylinder geometry
- `cone` - Cone geometry
- `capsule` - Capsule (pill shape)
- `torus` - Torus (donut)
- `plane` - Flat plane
- `ring` - Ring (flat donut)
- `group` - Empty container

## 🛠️ Usage

### Creating MACs

```javascript
// Simple primitive
const box = new MAC('box', {
    width: 1, height: 1, depth: 1,
    material: { color: 0xff0000 }
});

// With transforms
const positioned = new MAC('sphere', { radius: 0.5 })
    .position(0, 1, 0)
    .rotation(0, Math.PI/4, 0)
    .scale(2, 1, 1);

// Composition
const complex = new MAC('group')
    .add('box', { width: 1, height: 1, depth: 1 })
    .position(0, 0.5, 0)
    .add('sphere', { radius: 0.3 })
    .position(0, 1.5, 0);
```

### Using Templates

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';

// Load a template
const tree = MACLibrary.get('simple_tree');
const mesh = tree.build();
scene.add(mesh);

// Register your own template
MACLibrary.register('my_template', myMAC);
```

### Material Customization

```javascript
const mac = new MAC('sphere', {
    radius: 1,
    material: {
        color: 0xff0000,        // Red color
        emissive: 0x330000,     // Slight red glow
        metalness: 0.8,         // Very metallic
        roughness: 0.2,         // Quite smooth
        transparent: false,
        opacity: 1,
        wireframe: false
    }
});
```

## 📖 Documentation

Complete documentation available at: `docs/MAC_FRAMEWORK.md`

Topics covered:
- API Reference
- Advanced Patterns
- Best Practices
- Asset Management
- Integration Guide
- Troubleshooting

## 🧪 Testing

Run the test suite:

```bash
node tests/mac-test.js
```

All 15 tests validate:
- MAC creation and composition
- Transformations
- Serialization/deserialization
- Template library
- Persistence
- Material handling

## 🎮 Interactive Tools

### MAC Editor
Full-featured visual editor with:
- 3D viewport with OrbitControls
- Template library sidebar
- Properties panel (transforms, materials)
- Code viewer/editor
- Composition tools
- Save/Load functionality

**URL:** `http://localhost:3001/mac-editor.html`

### MAC Demo
Interactive showcase demonstrating:
- 12 example templates
- Keyboard navigation (Arrow keys, Space)
- Auto-rotating 3D preview
- Code examples
- Feature highlights

**URL:** `http://localhost:3001/mac-demo.html`

## 💡 Use Cases

1. **Procedural Generation** - Create variations programmatically
2. **Asset Libraries** - Build reusable component collections
3. **Level Design** - Compose complex scenes from simple parts
4. **Rapid Prototyping** - Quickly iterate on 3D designs
5. **Educational** - Learn 3D modeling through code
6. **Version Control** - Track mesh changes as code diffs

## 🔧 Integration

### With Existing MeshLibrary

```javascript
import { MACLibrary } from './modules/mac/MACCore.js';

// Create MAC versions of existing meshes
const goblinMAC = new MAC('group')
    .add('capsule', {
        radius: 0.3, length: 0.8,
        material: { color: 0x4a7c59 }
    });

MACLibrary.register('goblin', goblinMAC);
```

### With Level Editor

```javascript
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

## 🎨 Example Templates

The framework includes pre-built templates demonstrating various techniques:

**Basic Examples:**
- `torch` - Simple torch with flame
- `barrel` - Storage barrel with bands

**Recursive Composition:**
- `fence_section` - Uses fence_post MAC
- `cart` - Uses wheel MAC
- `market_stall` - Uses barrel MAC

**Complex Structures:**
- `tower` - Multi-level building
- `detailed_tree` - Tree with multiple foliage layers
- `knight` - Character with armor, shield, and sword
- `bridge` - Bridge with railings and supports

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Open the demo:**
   - Navigate to `http://localhost:3001/mac-demo.html`
   - Try the editor at `http://localhost:3001/mac-editor.html`

4. **Import in your code:**
   ```javascript
   import { MAC, MACLibrary } from './modules/mac/MACCore.js';
   ```

## 📄 License

Part of the template_copilot project. MIT License.

## 🙏 Credits

Built with Three.js for 3D rendering and designed to integrate seamlessly with existing mesh libraries and level editors.
