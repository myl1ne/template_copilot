# Bloop - Ecosystem Simulation Game

A fluid ecosystem simulation game built with Three.js featuring voxel-based terrain, physics, and element interactions.

## 🎮 Features

- **Voxel-Based World**: 3D grid system where each cube can contain different elements
- **Element Types**: Air, Water, Soil, Granite, Sand, and Lava
- **Physics Simulation**: Realistic gravity, liquid flow, and element interactions
- **Temperature & Pressure**: Elements change state based on environmental conditions
- **Dynamic Processes**:
  - Erosion: Water gradually turns granite into sand
  - Solidification: Cooling lava forms granite
  - Liquid flow: Water and lava flow naturally
  - Powder physics: Sand falls and slides
- **Multiple Demo Levels**:
  - Valley with River
  - Mountain Range
  - Lake Basin
  - Volcanic Island
  - Canyon System
- **Time Control**: Adjustable simulation speed from 0x (paused) to 10x speed

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎯 How to Play

1. **Select a Level**: Choose from the dropdown menu to load different terrain scenarios
2. **Control Simulation Speed**: Use the slider to adjust from paused (0x) to fast-forward (10x)
3. **Rotate Camera**: Click and drag to rotate the view around the terrain
4. **Zoom**: Use mouse wheel to zoom in and out
5. **Watch the Simulation**: Observe how elements interact naturally over time

## 🧩 Game Mechanics

### Element Properties

Each element has unique properties:

- **Density**: Determines how elements stack (heavier sinks, lighter floats)
- **Flow Rate**: How quickly liquids and powders move
- **Temperature**: Affects state changes (solid → liquid → gas)
- **Erosion**: Granite slowly erodes to sand when in contact with water
- **Cooling**: Hot lava cools over time and solidifies into granite

### Physics System

- **Gravity**: All elements with mass fall downward
- **Liquid Flow**: Water and lava flow sideways and downward naturally
- **Powder Mechanics**: Sand falls straight down or slides diagonally
- **State Changes**: Elements transform based on temperature (e.g., lava → granite)

### Sources

Each level has water or lava sources that continuously generate elements, creating dynamic ecosystems.

## 🏗️ Project Structure

```
bloop-ecosystem-game/
├── src/
│   ├── main.js          # Main game loop and initialization
│   ├── elements.js      # Element types and properties
│   ├── voxelWorld.js    # World grid and physics simulation
│   ├── renderer.js      # Three.js rendering
│   └── levelGenerator.js # Level creation and terrain generation
├── index.html           # Game HTML and UI
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (ES6 modules)
- **3D Rendering**: Three.js with instanced meshes for performance
- **Build Tool**: Vite for fast development and optimized builds
- **Physics**: Custom voxel-based cellular automata simulation

## 🎨 Future Enhancements

Potential additions for the ecosystem:

- Plants and vegetation that grow in soil
- Animals that interact with the environment
- Weather systems (rain, evaporation)
- Player interaction (place/remove elements)
- More complex erosion patterns
- Biome generation
- Save/load world states

## 📝 License

MIT

## 🎮 Have Fun!

Experiment with different simulation speeds and watch how the ecosystem evolves over time. Each level presents unique dynamics and emergent behaviors!
