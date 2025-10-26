# Evo - Evolution Simulator

An evolutionary sandbox that grows lifeforms from 3D primitives using digital DNA. Watch creatures evolve, adapt, and forage for food in a physics-based environment powered by Three.js and neural networks.

![Food Collection Evolution](https://github.com/user-attachments/assets/e2d38552-84de-4261-9ef5-ac4475d6654d)
*Creatures with vision sensors finding and collecting green food pellets to survive*

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

4. **Watch evolution happen** - creatures will spawn, find food, and evolve better foraging strategies!

## 🧬 Key Features

- **Digital DNA System** - Creatures are defined by genetic code that determines their structure
- **Food & Energy Mechanics** - 30 auto-respawning food sources; creatures must eat to survive
- **Vision Sensors** - Creatures can detect and navigate toward food sources
- **Articulated Bodies** - Body segments connected with physics constraints for realistic movement
- **3D Primitive Bodies** - Procedurally generated bodies from boxes, spheres, and cylinders
- **Neural Network Control** - Each creature has a brain that learns to control its body
- **Physics Simulation** - Realistic physics using cannon-es
- **Natural Selection** - Creatures compete for fitness, best foragers breed
- **Emergent Behavior** - Complex foraging strategies emerge from simple rules
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
   - Creatures use neural networks with 9 sensory inputs to perceive their environment
   - Vision sensors detect nearest food source direction
   - They consume energy as they move, think, and metabolize
   - Must find and collect green food pellets to survive
   - Fitness is measured by food collected, survival time, and movement efficiency

### 3. **Natural Selection**
   - Each generation lasts 30 seconds
   - Top 20% of performers (best foragers) are selected for breeding
   - New generation is created through crossover and mutation

### 4. **Evolution**
   - Successful foraging strategies are passed to offspring
   - Random mutations introduce variation in body structure and neural networks
   - Over time, creatures evolve better vision-guided navigation and food collection

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
