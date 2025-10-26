# To Dust - Developer Guide

## Development Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- A modern browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot

# Install dependencies
npm install
```

### Development

```bash
# Start development server (with hot reload)
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
template_copilot/
├── src/
│   └── main.js          # Main application logic
├── index.html           # HTML entry point
├── package.json         # Project configuration
├── docs/                # Documentation
│   ├── project-overview.md
│   ├── roadmap.md
│   └── backlog.md
└── README.md           # This file
```

## Architecture

### Core Systems

1. **Rendering System** (Three.js)
   - Spherical planet geometry
   - Camera controls and navigation
   - Lighting and materials
   - Vertex coloring for material visualization

2. **Physics Simulation**
   - Gravity-based fluid flow
   - Water flow algorithm
   - Temperature simulation
   - Material interactions

3. **Interaction System**
   - Raycasting for terrain clicks
   - Material gathering/releasing
   - Camera rotation and zoom
   - UI controls

4. **Material System**
   - Vertex-based material types
   - Temperature tracking per vertex
   - Water level per vertex
   - Height map deformation

### Key Data Structures

- `vertexHeights`: Float array storing terrain height at each vertex
- `vertexMaterials`: Array storing material type at each vertex
- `vertexTemperatures`: Float array for temperature simulation
- `vertexWater`: Float array for water amount at each vertex

### Simulation Loop

1. Update physics (water flow, temperature changes)
2. Process material sources (springs, vents)
3. Update terrain geometry based on heights
4. Update vertex colors based on materials
5. Render scene

## Adding New Features

### Adding a New Material Type

1. Add material type to state selection
2. Define material properties (color, behavior)
3. Update `updateMaterialColors()` function
4. Add interaction logic in `simulateMaterials()`

### Improving Physics

The physics simulation happens in `simulateMaterials()`:
- Water flow uses neighbor comparison
- Temperature affects evaporation and solidification
- Material sources add materials each frame

## Performance Considerations

- Current implementation uses 64x64 sphere (4096 vertices)
- Each vertex is checked against neighbors for physics
- Optimization needed for higher detail planets:
  - Spatial partitioning (octree)
  - Compute shaders for parallel processing
  - Level of detail (LOD) system

## Known Limitations

1. Water flow is simplified (not full Navier-Stokes)
2. No collision detection between materials
3. Limited to single planet instance
4. Performance degrades with very high vertex counts

## Future Improvements

See [roadmap.md](docs/roadmap.md) for planned features.

## Debugging

Enable browser developer tools:
- Console logs show initialization
- WebGL warnings indicate rendering issues
- Performance profiler helps identify bottlenecks

## License

MIT License - See LICENSE file for details
