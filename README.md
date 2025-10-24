# Evo - Evolution Simulator

An evolutionary sandbox that grows lifeforms from 3D primitives using digital DNA. Watch creatures evolve, adapt, and compete in a physics-based environment powered by Three.js and neural networks.

![Evo Simulator](https://github.com/user-attachments/assets/8160d4ed-d48a-4d7e-83e3-4f1191632b5b)

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the simulation**
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Watch evolution happen** - creatures will spawn, evolve, and compete for fitness!

## 🧬 Key Features

- **Digital DNA System** - Creatures are defined by genetic code that determines their structure
- **3D Primitive Bodies** - Procedurally generated bodies from boxes, spheres, and cylinders
- **Neural Network Control** - Each creature has a brain that learns to control its body
- **Physics Simulation** - Realistic physics using cannon-es
- **Natural Selection** - Creatures compete for fitness, best performers breed
- **Emergent Behavior** - Complex behaviors emerge from simple rules
- **Real-time Evolution** - Watch generations evolve before your eyes

## 📚 Documentation

- **[Project Overview](docs/project-overview.md)** - Detailed project information
- **[Status & Roadmap](docs/roadmap.md)** - Current status and future plans
- **[Current Backlog](docs/backlog.md)** - Development tasks and progress

## 🎮 How It Works

### 1. **Genesis (Primal Soup)**
   - Simulation starts with random creatures spawned in a "primal soup"
   - Each creature has unique DNA defining its structure and traits

### 2. **Life Cycle**
   - Creatures use neural networks to sense and control their bodies
   - They consume energy as they move and think
   - Fitness is measured by distance traveled and survival time

### 3. **Natural Selection**
   - Each generation lasts 30 seconds
   - Top 20% of performers are selected for breeding
   - New generation is created through crossover and mutation

### 4. **Evolution**
   - Successful traits are passed to offspring
   - Random mutations introduce variation
   - Over time, creatures adapt to move more efficiently

## 🎨 Inspired By

- **Spore** - Creature evolution and procedural generation
- **From Dust** - Emergence and natural systems
- **Creatures** - Neural networks and artificial life

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and rendering
- **cannon-es** - Physics simulation
- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No framework, pure ES6 modules

## 🔧 Controls

- **Mouse** - Rotate camera (drag), zoom (scroll)
- **Reset Button** - Start new simulation from scratch
- **Spawn Button** - Add a random creature to current generation
- **Pause Button** - Pause/resume simulation

## 📝 Project Structure

```
src/
├── dna/
│   └── Genome.js          # Digital DNA system
├── neural/
│   └── NeuralNetwork.js   # Brain for creatures
├── creatures/
│   └── Creature.js        # Creature entity
├── evolution/
│   └── EvolutionManager.js # Evolution and selection
└── main.js                # Main application
```

## 📄 License

MIT License - Feel free to use and modify!

**Version**: 0.1.0  
**Last Updated**: 2025-10-24
