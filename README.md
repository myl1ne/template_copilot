# Vivarium - Eternal Garden Simulation

A Three.js-based interactive 3D ecosystem simulation featuring a dynamic vivarium with plant life cycles, resource management, and natural evolution.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🌱 Features

### Cube-of-Cubes Architecture
- **3D Grid System**: 20x20x20 grid of cubes representing different materials
- **Material Types**: 
  - Soil with nutrients and organic matter
  - Water pockets for moisture distribution
  - Air spaces for plant growth

### Plant Life Cycle
- **Growth Stages**: Seed → Sprout → Growing → Mature → Flowering → Dying
- **Reproduction**: Both sexual reproduction and parthenogenesis
- **Resource Management**: Plants consume water and nutrients from soil
- **Generational Evolution**: Track multiple generations of plants

### Dynamic Ecosystem
- **Water Distribution**: Water naturally spreads through soil
- **Nutrient Cycling**: Dead plants return biomass to soil as organic matter
- **Population Dynamics**: Self-sustaining ecosystem with births and deaths
- **Visual Feedback**: Color-coded plant stages and resource levels

### Interactive Navigation
- **Orbit Controls**: Rotate, pan, and zoom the camera
- **Real-time Statistics**: Monitor plant count, biomass, and generation
- **Pause/Resume**: Space bar to pause the simulation

## 🎮 Controls

- **Left Click + Drag**: Rotate the view
- **Right Click + Drag**: Pan the view
- **Scroll Wheel**: Zoom in/out
- **Space Bar**: Pause/Resume simulation

## 🏗️ Architecture

### Core Components

- **`src/core/Cube.js`**: Individual cube with material properties (soil, water, air)
- **`src/core/Vivarium.js`**: 3D grid manager and ecosystem controller
- **`src/life/Life.js`**: Base class for all living organisms
- **`src/life/PlantLife.js`**: Plant implementation with full life cycle
- **`src/main.js`**: Three.js scene setup and main application loop

### How It Works

1. **Grid Initialization**: Creates a 20x20x20 cube grid with soil, water, and air
2. **Plant Seeding**: Places initial plants on soil surfaces
3. **Simulation Loop**:
   - Plants consume resources (water, nutrients)
   - Plants grow through life stages
   - Mature plants reproduce (sexual or parthenogenesis)
   - Dead plants return biomass to soil
   - Water naturally distributes through soil
4. **Visual Update**: Three.js renders the scene with dynamic colors based on state

## 🔬 Ecosystem Mechanics

### Resource System
- **Soil Nutrients**: Consumed by plants, regenerated from organic matter
- **Water/Moisture**: Consumed by plants, spreads through soil from water sources
- **Organic Matter**: Added when plants die, slowly converts to nutrients

### Plant Reproduction
- **Sexual Reproduction**: 1-3 seeds per cycle, more robust offspring
- **Parthenogenesis**: 2-6 seeds per cycle, faster population growth
- **Seed Dispersal**: Seeds planted in nearby suitable locations
- **Generational Tracking**: Each generation numbered for tracking evolution

## 🛠️ Technologies

- **Three.js**: 3D rendering and visualization
- **Vite**: Fast development build tool
- **JavaScript (ES6+)**: Modern modular JavaScript

## 📸 Screenshots

Initial state with 10 plants:
![Vivarium Initial](https://github.com/user-attachments/assets/719faf86-785f-415a-befa-50cf8b931bb4)

After 90 seconds - ecosystem evolved to 51 plants across 2 generations:
![Vivarium Evolved](https://github.com/user-attachments/assets/c3a3face-bab4-47eb-832d-3756e35ff033)

## 🚀 Future Enhancements

- Animal life forms
- More plant varieties
- Weather/climate system
- Day/night cycles
- Save/load ecosystem states
- Performance optimizations for larger grids

## 📄 License

MIT
