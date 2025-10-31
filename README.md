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
- **Sunlight System**: Light intensity decreases with depth and shadowing

### Plant Life Cycle
- **Growth Stages**: Seed → Sprout → Growing → Mature → Flowering → Dying
- **Reproduction**: Both sexual reproduction and parthenogenesis
- **Resource Management**: Plants consume water and nutrients from soil
- **Generational Evolution**: Track multiple generations of plants
- **Genetics**: 11 genes controlling development and traits

### 🧬 Genetics & Evo-Devo System
- **Genetic Traits**: Height, growth rate, maturity timing, resource efficiency, photosynthesis, fertility, vigor, color
- **Inheritance**: Sexual reproduction with genetic crossover, parthenogenesis with mutations
- **Evolution**: 10% mutation rate, natural selection, fitness tracking
- **Visible Diversity**: Mature plants show genetic color variation
- **Fitness Improvement**: Population fitness increases over generations

### ☀️ Photosynthesis & Sunlight
- **Light Calculation**: Intensity based on height and shadowing from above
- **Energy Production**: Photosynthesis converts light into energy
- **Vertical Competition**: Taller plants receive more sunlight
- **Natural Selection**: Favors photosynthesis efficiency and height genes

### Dynamic Ecosystem
- **Water Distribution**: Water naturally spreads through soil
- **Nutrient Cycling**: Dead plants return biomass to soil as organic matter
- **Population Dynamics**: Self-sustaining ecosystem with births and deaths
- **Visual Feedback**: Color-coded plant stages and genetic color variation
- **Evolution Metrics**: Track average fitness and genetic diversity

### Interactive Navigation
- **Orbit Controls**: Rotate, pan, and zoom the camera
- **Real-time Statistics**: Monitor plant count, biomass, generation, and fitness
- **Pause/Resume**: Space bar to pause the simulation

## 🎮 Controls

- **Left Click + Drag**: Rotate the view
- **Right Click + Drag**: Pan the view
- **Scroll Wheel**: Zoom in/out
- **Space Bar**: Pause/Resume simulation

## 🏗️ Architecture

### Core Components

- **`src/core/Cube.js`**: Individual cube with material properties (soil, water, air)
- **`src/core/Vivarium.js`**: 3D grid manager, ecosystem controller, and sunlight system
- **`src/life/Life.js`**: Base class for all living organisms
- **`src/life/Genetics.js`**: Genetic system with evo-devo traits and inheritance
- **`src/life/PlantLife.js`**: Plant implementation with life cycle, genetics, and photosynthesis
- **`src/main.js`**: Three.js scene setup and main application loop

### How It Works

1. **Grid Initialization**: Creates a 20x20x20 cube grid with soil, water, and air
2. **Plant Seeding**: Places initial plants on soil surfaces with random genetics
3. **Simulation Loop**:
   - Sunlight calculated based on height and shadowing
   - Plants perform photosynthesis (light → energy)
   - Plants consume resources (water, nutrients)
   - Plants grow through life stages (genetics affect growth)
   - Mature plants reproduce (sexual with crossover or parthenogenesis with mutations)
   - Genetic traits inherited with mutations (10% rate)
   - Dead plants return biomass to soil
   - Water naturally distributes through soil
   - Natural selection: fitter plants survive and reproduce more
4. **Visual Update**: Three.js renders the scene with genetic color variations

## 🔬 Ecosystem Mechanics

### Resource System
- **Soil Nutrients**: Consumed by plants, regenerated from organic matter
- **Water/Moisture**: Consumed by plants, spreads through soil from water sources
- **Organic Matter**: Added when plants die, slowly converts to nutrients
- **Sunlight**: Calculated by height, affected by shadowing from plants/cubes above

### Photosynthesis System
- **Light Intensity**: `intensity = (height/maxHeight)^0.5 * shadowFactor`
- **Energy Production**: `energy = lightIntensity * photosynthesisGene * resourceRatio`
- **Shadowing Effect**: Each non-air cube above reduces light by 30%
- **Vertical Competition**: Taller plants receive more light
- **Selection Pressure**: Favors height and photosynthesis efficiency genes

### Genetic System
- **11 Genes**: maxHeight, growthRate, maturityTime, waterEfficiency, nutrientEfficiency, photosynthesis, fertility, vigor, colorR, colorG, colorB
- **Sexual Reproduction**: Genetic crossover from both parents (70/30 blend with random selection)
- **Parthenogenesis**: Clonal reproduction with mutations
- **Mutation**: 10% chance per gene, ±10% variation
- **Fitness Score**: Weighted average of vigor, photosynthesis, water efficiency, nutrient efficiency
- **Natural Selection**: Better genes → longer life, more seeds, higher survival

### Plant Reproduction
- **Sexual Reproduction**: 1-3 seeds per cycle, requires nearby mate (radius 5)
- **Parthenogenesis**: 2-6 seeds per cycle, no mate required
- **Seed Dispersal**: Seeds planted in nearby suitable locations (radius 3)
- **Fertility**: Number of seeds scaled by fertilityGene
- **Generational Tracking**: Each generation numbered, fitness tracked

## 🛠️ Technologies

- **Three.js**: 3D rendering and visualization
- **Vite**: Fast development build tool
- **JavaScript (ES6+)**: Modern modular JavaScript

## 📸 Screenshots

**Initial State** (Gen 1, 10 plants, Fitness 0.77):
![Vivarium Initial](https://github.com/user-attachments/assets/deedde4e-4ac6-4c0b-bb35-cb95d3efa5a8)

**After Evolution** (Gen 3, 49 plants, Fitness 0.81 - improved through natural selection!):
![Vivarium Evolved](https://github.com/user-attachments/assets/cb3d2ec3-ffb3-47ac-b720-759075400850)

Notice the genetic color variation in mature plants and the improved fitness score showing evolution in action!

## 🚀 Future Enhancements

- Animal life forms (herbivores, predators)
- More plant varieties with different strategies
- Advanced genetics: recessive/dominant alleles, gene regulation
- Day/night cycles affecting photosynthesis
- Weather/climate system (rain, drought, seasons)
- Co-evolution and symbiosis
- Performance optimizations for larger grids
- Save/load ecosystem states
- Phylogenetic trees to visualize evolution

## 📄 License

MIT
