# Ecosystem Sandbox - Project Overview

## What is Ecosystem Sandbox?

Ecosystem Sandbox is a 3D evolution simulation game where players guide geometric lifeforms through evolutionary stages in a dynamic ecosystem. Built with Three.js and React, it runs entirely in the browser and provides a Spore-like experience focused on species development and environmental adaptation.

## Target Audience

This project is designed for:
- **Simulation Game Enthusiasts** - Players who enjoy evolution and creature-building games
- **Educational Users** - Students and teachers exploring evolutionary concepts
- **Indie Game Developers** - Developers interested in Three.js and browser-based games
- **Open Source Contributors** - Developers wanting to contribute to a unique gaming project

## Key Features

- **Geometric Creature Builder**: Create species using primitive 3D shapes (spheres, cubes, cylinders, pyramids)
- **Dynamic Evolution System**: Species automatically adapt to environmental pressures over generations
- **Environmental Simulation**: Multiple biomes with different survival challenges (temperature, food scarcity, predators)
- **Spore-like Progression**: Guide your species through Cell → Creature → Tribal → Civilization stages
- **Real-time 3D Rendering**: Smooth WebGL graphics with hundreds of creatures on screen
- **Local Simulation**: No server required - everything runs in your browser

## Quick Start

### Prerequisites
- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Node.js 16+ and npm (for development)
- 8GB RAM recommended for large populations

### Installation
```bash
git clone https://github.com/myl1ne/template_copilot.git ecosystem-sandbox
cd ecosystem-sandbox
npm install
```

### Basic Usage
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start game at http://localhost:5173/
# Use mouse to control camera, spawn creatures, and watch them move around the environment
```

## Core Benefits

1. **Educational Value**: Learn evolutionary concepts through interactive gameplay
2. **Creative Expression**: Design unique species with countless customization options
3. **Technical Innovation**: Explore advanced browser-based 3D simulation techniques
4. **Open Source Learning**: Study modern React + Three.js architecture patterns

## Game Architecture

### Core Systems
- **Creature System**: Manages individual organism behavior and attributes
- **Evolution Engine**: Handles genetic mutations and population dynamics
- **Environment Manager**: Controls biome conditions and resource distribution
- **Rendering Pipeline**: Optimized Three.js rendering for performance
- **UI Framework**: React components for game interface and controls

### Data Flow
1. Player designs initial species or selects preset
2. Population spawns in selected environment
3. Creatures interact, compete for resources, reproduce
4. Evolution engine applies mutations based on survival rates
5. Player can influence evolution through environmental changes
6. Species progresses through evolutionary stages

## Links & Resources

- **Repository**: [GitHub Repository](https://github.com/myl1ne/template_copilot)
- **Documentation**: [Full Documentation](docs/)
- **Issues & Support**: [GitHub Issues](https://github.com/myl1ne/template_copilot/issues)
- **License**: [MIT License](LICENSE)
- **Demo**: [Live Demo](https://ecosystem-sandbox-demo.vercel.app) *(coming soon)*

---

*Last updated: September 28, 2024 | Version: 0.3.1-alpha*