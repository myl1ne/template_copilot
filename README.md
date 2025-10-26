# To Dust - Spherical Terrain Manipulation

A Three.js-based implementation of terrain manipulation mechanics inspired by the game "From Dust", featuring dynamic material interaction on a spherical planet.

![To Dust Demo](https://github.com/user-attachments/assets/45ebdc08-0f1c-45c6-bea8-60217644894c)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Then open your browser to `http://localhost:5173`

## 🎮 Controls

- **Left Click**: Gather material from terrain
- **Right Click**: Release material onto terrain
- **Mouse Drag**: Rotate the planet
- **Mouse Wheel**: Zoom in/out
- **Material Selection**: Choose between Water, Soil, or Lava
- **Time Control**: Pause or accelerate simulation (0x to 5x speed)

## ✨ Features

### Core Mechanics
- **Spherical Planet**: Fully 3D planet with realistic camera navigation
- **Dynamic Terrain**: Real-time terrain deformation based on user actions
- **Three Materials**: Water (fluid), Soil (terrain base), and Lava (hot fluid)
- **Material Gathering**: Click to gather materials from the planet surface
- **Material Placement**: Right-click to place gathered materials

### Physics & Simulation
- **Gravity-Based Flow**: Water and lava flow downhill naturally
- **Temperature System**: Materials have temperature that affects behavior
- **Evaporation**: Water evaporates when temperature is too high
- **Solidification**: Lava cools and solidifies into rock over time
- **Material Sources**: Active water springs and lava vents

### User Interface
- **Material Selection**: Easy switching between material types
- **Time Control**: Pause, slow down, or speed up time
- **Visual Feedback**: Real-time display of held materials and temperature
- **Color Coding**: Visual indicators for different materials and states

## 🎯 Inspired by From Dust

This project recreates the core terrain manipulation mechanics from the acclaimed game "From Dust":
- Planetary-scale environment
- Fluid-like material behavior
- Emergent environmental systems
- Temperature and pressure interactions
- Natural material cycles

## 📚 Documentation

- **[Project Overview](docs/project-overview.md)** - Detailed project information
- **[Status & Roadmap](docs/roadmap.md)** - Current status and future plans
- **[Current Backlog](docs/backlog.md)** - Development task tracking

## 🛠️ Technical Details

- **Engine**: Three.js for 3D rendering
- **Build Tool**: Vite for fast development and optimized builds
- **Language**: JavaScript (ES6+)
- **Architecture**: Real-time vertex manipulation with physics simulation

## 🎨 Screenshots

### Initial View
![Initial planet view](https://github.com/user-attachments/assets/45ebdc08-0f1c-45c6-bea8-60217644894c)

### After Interaction
![After gathering material](https://github.com/user-attachments/assets/cbec952e-0fa7-433c-a960-f0d4d071b25a)

## 🤝 Contributing

This is an educational project demonstrating terrain manipulation mechanics. Feel free to fork and experiment!

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 0.1.0  
**Last Updated**: 2025-10-26  
**Status**: Alpha - Core mechanics functional
