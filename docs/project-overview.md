# Evo - Project Overview

An evolutionary sandbox that demonstrates artificial life through digital DNA, neural networks, and natural selection.

## What is Evo?

Evo is a browser-based evolution simulator that grows complex lifeforms from simple 3D primitives. Each creature is defined by a digital genome that determines its structure, appearance, and behavior. Creatures use neural networks to control their bodies in a physics-based environment, competing for fitness through natural selection.

## Target Audience

This project is designed for:
- **Artificial Life Enthusiasts** - People interested in emergence and evolutionary algorithms
- **Educators** - Teaching concepts of evolution, neural networks, and emergence
- **Game Developers** - Exploring procedural generation and AI-driven entities
- **Researchers** - Studying evolutionary computation and genetic algorithms
- **Curious Minds** - Anyone fascinated by how complexity emerges from simple rules

## Key Features

- **Digital DNA System**: Creatures are encoded as genetic blueprints defining structure, color, mass, and behavioral traits
- **3D Procedural Bodies**: Bodies are generated from primitive shapes (boxes, spheres, cylinders) arranged according to genetic instructions
- **Enhanced Neural Network Brains**: Each creature has a neural network with 22 sensory inputs including multi-directional vision
- **Physics Simulation**: Realistic physics using cannon-es creates natural movement constraints and interactions
- **Natural Selection**: Fitness-based selection ensures successful traits propagate to future generations
- **Genetic Operations**: Mutation and crossover create variation while preserving successful adaptations
- **Real-time Visualization**: Watch evolution happen in 3D with Three.js rendering
- **Predator-Prey Ecosystem**: Herbivores (green) eat plants, carnivores (red) hunt other creatures
- **Pack Behavior**: Cooperative herbivores form packs and share food
- **Environmental Events**: Dynamic challenges like food scarcity, abundance, drought, and migration
- **Multi-Directional Vision**: Creatures detect food in center, left, and right peripheral vision

## Quick Start

### Prerequisites
- Node.js 14+ and npm
- Modern web browser with WebGL support
- No additional software required

### Installation
```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git evo
cd evo

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Basic Usage
1. Open http://localhost:5173 in your browser
2. Watch the initial "primal soup" generation spawn
3. Observe herbivores (green) foraging for food and forming packs
4. See carnivores (red) hunting other creatures
5. Experience dynamic environmental events that challenge the ecosystem
6. Click on creatures to inspect their stats and DNA
7. Use controls to reset, spawn creatures, or pause simulation

## Core Benefits

1. **Educational Value**: Demonstrates fundamental concepts of evolution, genetics, and neural networks in an intuitive, visual way
2. **Emergent Complexity**: Shows how complex behaviors and structures can emerge from simple rules and random variation
3. **Interactive Experience**: Real-time 3D visualization makes abstract concepts tangible and engaging
4. **Extensible Architecture**: Modular design allows easy experimentation with different genetic encodings, fitness functions, and neural architectures
5. **No Backend Required**: Runs entirely in the browser with no server needed

## Technical Architecture

### Core Systems

1. **Genome System** (`src/dna/Genome.js`)
   - Encodes creature structure as genetic information
   - Supports mutation and crossover operations
   - Defines behavioral traits (aggression, speed, efficiency)

2. **Neural Network** (`src/neural/NeuralNetwork.js`)
   - Feedforward network with one hidden layer
   - Processes 22 sensory inputs (velocity, energy, hydration, multi-directional vision, social awareness)
   - Outputs motor commands (force vectors) and behavioral signals

3. **Creature Entity** (`src/creatures/LimbedCreature.js`)
   - Builds articulated 3D body with limbs from genome blueprint
   - Integrates physics bodies with visual meshes
   - Manages life cycle, fitness tracking, pack behavior, and predation
   - Implements diet types (herbivore vs carnivore)

4. **Evolution Manager** (`src/evolution/EvolutionManager.js`)
   - Handles continuous population management
   - Implements fitness-based selection
   - Orchestrates breeding, mutation, and neural weight inheritance
   - Manages environmental events

5. **Environmental Systems**
   - **Food Manager**: Auto-respawning food pellets
   - **Terrain**: Water points and boundaries
   - **Environmental Events**: Dynamic challenges (abundance, scarcity, drought, migration)

## Concepts Demonstrated

- **Emergence**: Complex movement patterns, pack behaviors, and hunting strategies emerge from simple neural networks
- **Selection Pressure**: Fitness-based selection drives adaptation to environmental challenges
- **Predator-Prey Dynamics**: Balance between herbivore and carnivore populations
- **Cooperation**: Herbivores self-organize into packs and share resources
- **Niche Specialization**: Creatures evolve different strategies based on diet type
- **Environmental Adaptation**: Creatures must adapt to dynamic events like food scarcity and migration
- **Composability**: Bodies are composed of modular primitive shapes with articulated joints

---

*Last updated: 2025-10-26 | Version: 0.3.0*