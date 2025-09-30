# 🐜 Ant Colony Simulator

An interactive 3D ant colony simulator built with three.js. Watch intelligent ant behavior as they explore, find food, and create pheromone trails to optimize colony efficiency!

## 🚀 Quick Start

### Prerequisites
- A modern web browser with WebGL support
- Node.js (v14 or higher) for running the local server

### Installation
```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot

# Install dependencies
npm install
```

### Running the Simulator
```bash
# Start the local web server
npm start
```

The simulator will automatically open in your browser at `http://localhost:8080`.

## 🎮 Features

- **Realistic Ant Behavior**: Ants explore randomly, find food, and return to the nest
- **Pheromone Trails**: Ants leave golden pheromone trails when carrying food, helping other ants find food sources more efficiently
- **Dynamic Food Sources**: 5 food sources scattered around the colony that deplete as ants collect from them
- **Interactive 3D Camera**: Use mouse controls to rotate, pan, and zoom around the colony
- **Real-time Statistics**: Track ant count, food collected, and active pheromone trails
- **Interactive Controls**:
  - Pause/Resume simulation
  - Reset to initial state
  - Add more ants dynamically

## 🎯 How It Works

The simulator implements emergent behavior based on real ant colony optimization:

1. **Exploration**: Ants start from the nest and wander randomly
2. **Food Detection**: When an ant gets close to food, it picks up a piece
3. **Return Home**: Ants carrying food navigate directly back to the nest while leaving pheromone trails
4. **Trail Following**: Other ants detect and follow pheromone trails to find food sources
5. **Pheromone Decay**: Trails gradually fade over time, preventing outdated paths

This creates an emergent intelligence where the colony becomes more efficient at gathering food over time!

## 🕹️ Controls

- **Left Mouse Button**: Rotate camera around the colony
- **Right Mouse Button**: Pan camera position
- **Mouse Wheel**: Zoom in/out
- **Pause Button**: Pause/resume the simulation
- **Reset Button**: Reset the simulation to initial state
- **Add 10 Ants**: Dynamically add more ants to the colony

## 📸 Screenshots

![Ant Colony Simulator](https://github.com/user-attachments/assets/5e345fce-be49-4e48-98c4-baac0e1888e4)
*The 3D environment with ants exploring for food*

![Pheromone Trails](https://github.com/user-attachments/assets/0d1c5c2f-f7e6-41a8-a898-a61eb2521088)
*Ants creating golden pheromone trails from food sources to the nest*

## 🛠️ Technical Details

### Built With
- **three.js** (v0.157.0) - 3D graphics library
- **OrbitControls** - Camera control system
- **ES6 Modules** - Modern JavaScript architecture

### Project Structure
```
template_copilot/
├── index.html          # Main HTML page
├── js/
│   └── main.js         # Simulation logic and three.js setup
├── docs/               # Documentation
├── package.json        # Project dependencies
└── README.md          # This file
```

### Key Algorithms
- **Random Walk**: Ants use a random walk pattern when exploring
- **Pheromone Following**: Probabilistic trail following based on pheromone strength
- **Gradient Descent**: Ants move directly toward nest when carrying food
- **Exponential Decay**: Pheromones fade over time using exponential decay

## 🎨 Future Enhancements

See [roadmap.md](docs/roadmap.md) for planned features including:
- Multiple ant types (workers, scouts, soldiers)
- Obstacles and terrain features
- Predators and threats
- Day/night cycle
- Colony statistics and analytics

## 📚 Documentation

- **[Project Overview](docs/project-overview.md)** - Detailed project information
- **[Roadmap](docs/roadmap.md)** - Current status and future plans
- **[Backlog](docs/backlog.md)** - Task tracking

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License.
