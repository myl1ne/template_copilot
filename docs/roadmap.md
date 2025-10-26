# To Dust - Status & Long Term Roadmap

## Current Status

### 🎯 Current Version
- **Version**: 0.1.0
- **Release Date**: 2025-10-26
- **Status**: Alpha - Core mechanics functional

### ✅ What's Working Now
- Spherical planet rendering with Three.js
- Camera navigation (zoom, rotation)
- Terrain deformation (gather/release materials)
- Three material types: Water, Soil, Lava
- Gravity-based fluid dynamics for water
- Temperature system with lava cooling and water evaporation
- Time control (pause, 0.5x, 1x, 2x, 5x speed)
- Material sources (water springs, lava vents)
- Real-time visual feedback with vertex coloring

### 🔧 Current Focus
- Core mechanics are implemented and functional
- Basic physics simulation working
- Interactive UI with material selection and time controls

---

## Long Term Roadmap

### 🚀 Next Release (v0.2.0) - Q1 2026
**Theme**: Enhanced Physics and Visuals

**Planned Features**:
- [ ] Improved water flow algorithm with better pressure simulation
- [ ] Enhanced lava behavior with viscosity modeling
- [ ] Particle effects for material transitions (steam, smoke)
- [ ] Better terrain erosion mechanics
- [ ] Sound effects for material interactions
- [ ] Save/load terrain states

**Technical Improvements**:
- [ ] Optimize vertex calculations for better performance
- [ ] Implement spatial indexing for faster neighbor lookups
- [ ] Add level of detail (LOD) system for larger planets

### 🔮 Future Releases (6-12 months)

#### v0.3.0 - Enhanced Gameplay
- Multiple biomes with different material behaviors
- Vegetation system that grows based on water availability
- Advanced material sources (geysers, volcanoes)
- Mission objectives and challenges

#### v0.4.0 - Multiplayer and Sharing
- Collaborative planet editing
- Share saved planets with others
- Planet gallery and community features

### 🎯 Long Term Vision (1+ years)
- **Full Ecosystem Simulation**: Complex food chains, weather patterns, and geological cycles
- **VR Support**: Immersive planet manipulation in virtual reality
- **Procedural Generation**: Random planet generation with realistic geological features

---

## Recently Completed

### ✅ v0.1.0 - 2025-10-26
- ✅ Initial Three.js project setup
- ✅ Spherical planet with dynamic terrain
- ✅ Material manipulation system (water, soil, lava)
- ✅ Basic physics simulation
- ✅ Temperature and pressure mechanics
- ✅ Time control system
- ✅ Material sources implementation

---

## Considerations & Dependencies

### External Dependencies
- Three.js: Core 3D rendering engine
- Vite: Build tool and development server

### Resource Constraints
- Performance optimization needed for larger planets
- Complex fluid dynamics calculations can be computationally expensive

### Community Feedback Integration
- Open to feature requests via GitHub issues
- Community can contribute improvements and new material types

---

*Last updated: 2025-10-26 | Next review: 2025-11-26*

*This roadmap is subject to change based on priorities, resources, and community feedback.*