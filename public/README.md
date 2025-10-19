# RPG Engine - Three.js Character Demo

This is an interactive 3D demo showcasing the RPG Engine's character system using Three.js.

## Features

- **3D Character Visualization**: A warrior character rendered with Three.js
  - Body with capsule geometry
  - Head with sphere geometry
  - Helmet (cone shape)
  - Shield (green, left side)
  - Sword (glowing blue blade, right side)
  
- **Real-time Animations**:
  - Character rotation
  - Sword swing animation
  - Shield movement
  - Floating particle effects
  - Dynamic lighting

- **Character Stats Display**:
  - HP and Mana bars with visual indicators
  - All 6 attributes (STR, DEX, CON, INT, WIZ, CHA)
  - Combat stats (Armor, Attack Speed)

- **Interactive Controls**:
  - Mouse: Rotate camera around character
  - Space: Toggle animation on/off
  - Scroll: Zoom in/out

## Running the Demo

### Development Mode (with Vite)
```bash
npm run dev
```
Then open http://localhost:3000/ in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

## Technical Details

- **Renderer**: Three.js WebGL with shadows
- **Lighting**: Ambient, directional, and point lights
- **Materials**: PBR (Physically Based Rendering) materials
- **Effects**: Particle system with additive blending
- **Controls**: OrbitControls for camera manipulation

## Character Data

The demo visualizes the example character "Thorin the Brave":
- HP: 150/150
- Mana: 50/50
- STR: 18 | DEX: 12 | CON: 16
- INT: 8 | WIZ: 10 | CHA: 14
- Armor: 10 | Attack Speed: 1.2

This character data is created using the RPG Engine's Character class from `src/models/Character.js`.
