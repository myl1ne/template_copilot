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
- **Neural Network Brains**: Each creature has a simple neural network that processes sensory inputs and generates motor outputs
- **Physics Simulation**: Realistic physics using cannon-es creates natural movement constraints and interactions
- **Natural Selection**: Fitness-based selection ensures successful traits propagate to future generations
- **Genetic Operations**: Mutation and crossover create variation while preserving successful adaptations
- **Real-time Visualization**: Watch evolution happen in 3D with Three.js rendering

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
3. Observe creatures attempting to move using their neural networks
4. See fitness scores increase as evolution optimizes movement
5. Use controls to reset, spawn creatures, or pause simulation

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
   - Simple feedforward network with one hidden layer
   - Processes sensory inputs (velocity, position, energy)
   - Outputs motor commands (force vectors)

3. **Creature Entity** (`src/creatures/Creature.js`)
   - Builds 3D body from genome blueprint
   - Integrates physics bodies with visual meshes
   - Manages life cycle and fitness tracking

4. **Evolution Manager** (`src/evolution/EvolutionManager.js`)
   - Handles population management
   - Implements fitness-based selection
   - Orchestrates breeding and mutation

## Concepts Demonstrated

- **Emergence**: Complex movement patterns emerge from simple neural networks
- **Selection Pressure**: Fitness-based selection drives adaptation
- **Organization**: Creatures self-organize into body structures from genome data
- **Composability**: Bodies are composed of modular primitive shapes

## Links & Resources

- **Repository**: https://github.com/myl1ne/template_copilot
- **Issues & Support**: https://github.com/myl1ne/template_copilot/issues
- **License**: MIT

---

*Last updated: 2025-10-24 | Version: 0.1.0*