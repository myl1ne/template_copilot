# Vivarium - Project Overview

## What is Vivarium?

Vivarium is an interactive 3D ecosystem simulation that creates a self-sustaining eternal garden using Three.js. It models a terrarium as a "cube of cubes" where each cube represents different materials (soil, water, air) and simulates plant life cycles with dynamic resource management.

## Target Audience

This project is designed for:
- Developers interested in ecosystem simulations and artificial life
- Students learning about system dynamics and emergent behavior
- Artists and designers exploring procedural and generative systems
- Anyone fascinated by watching digital life evolve

## Key Features

- **Cube-Based World**: 20x20x20 grid of cubes representing soil, water, and air with realistic properties
- **Plant Life Cycles**: Complete lifecycle from seed to death, including growth stages (seed, sprout, growing, mature, flowering, dying)
- **Genetics & Evo-Devo**: 11 genes controlling plant traits (height, growth, photosynthesis, efficiency, color) with inheritance and mutations
- **Photosynthesis & Sunlight**: Light-based energy production with height advantage and shadowing effects
- **Dual Reproduction**: Both sexual reproduction (genetic crossover) and parthenogenesis (clonal with mutations)
- **Natural Selection**: Population fitness improves over generations through survival of the fittest
- **Resource Management**: Dynamic water distribution and nutrient cycling with organic matter decomposition
- **Self-Sustaining Ecosystem**: Population naturally balances based on available resources and environmental pressures
- **Interactive 3D View**: Full orbit controls to explore and observe the vivarium from any angle
- **Genetic Diversity**: Visible color variation in mature plants based on genetic makeup

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with WebGL support

### Installation
```bash
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot
npm install
```

### Basic Usage
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Core Benefits

1. **Educational Value**: Demonstrates ecosystem dynamics, evolution, genetic inheritance, and emergent behavior in an accessible visual format
2. **Interactive Learning**: Real-time observation of population dynamics, natural selection, generational evolution, and survival strategies
3. **Evo-Devo Simulation**: Shows how developmental genes (growth, maturity, size) interact with environmental pressures (light, resources) to drive evolution
4. **Extensible Architecture**: Clean, modular codebase ready for adding new life forms, behaviors, and environmental factors

## Links & Resources

- **Repository**: https://github.com/myl1ne/template_copilot
- **Live Demo**: Run `npm run dev` to see it in action
- **Documentation**: [README.md](../README.md)
- **License**: MIT

---

*Last updated: 2025-10-26 | Version: 1.0.0*