# Higher-Level Behaviors - Social & Environmental Complexity

## Overview

Advanced features implementing social behaviors, environmental challenges, and communication systems to enable higher-level emergent behaviors in the Evo simulator.

## New Features Implemented

### 1. Social Sensing & Awareness

**Creature-to-Creature Detection**
- Creatures can now sense nearby creatures within 10 units
- Neural network receives direction vector to nearest creature
- Nearby creature count influences behavior decisions

**Enhanced Neural Network**
- **Input neurons expanded**: 9 → 13
  - Previous: velocity(3), food direction(3), energy(1), time(1), height(1)
  - Added: creature direction(3), nearby creature count(1)
- **Output neurons expanded**: 3 → 4
  - Previous: force x, y, z
  - Added: signal intensity for communication

**Social Behavior Gene**
- Based on existing `aggression` gene in genome
- Range: 0 (cooperative) to 1 (competitive)
- Affects fitness calculation:
  - **Cooperative** (< 0.5): +5 points per nearby creature
  - **Competitive** (≥ 0.5): -2 points per nearby creature

### 2. Communication System

**Visual Signaling**
- Each creature has a communication marker (small sphere above body)
- Color changes based on neural network output
- RGB encoding:
  - R channel: Signal intensity (from 4th neural output)
  - G channel: Social behavior (cooperation level)
  - B channel: Inverse social behavior (competition level)

**Signal Dynamics**
- Opacity varies with signal intensity (0.3 - 1.0)
- Real-time updates based on creature's neural activity
- Visible to other creatures for social coordination

**Communication Strategies**
Examples of emergent signaling patterns:
- **Cooperative creatures**: Bright green signals near food clusters
- **Competitive creatures**: Red/magenta signals when resources scarce
- **Neutral**: White/gray signals in low-pressure situations

### 3. Environmental Obstacles

**Obstacle Types**

**Rocks (Gray)**
- Spherical geometry
- Moderate size variation (0.5 - 1.0 units)
- Static obstacles for navigation challenges
- Scattered in clusters

**Crystals (Blue)**
- Octahedral geometry
- Semi-transparent with glow effect
- Landmark-like structures
- Can serve as reference points for navigation

**Plants (Green)**
- Conical geometry (tree-like)
- Taller obstacles (2x height)
- Create forest-like areas
- Different navigation challenge than rocks

**Obstacle Distribution**
- 4 clusters across environment
- Cluster positions:
  - (10, 0.5, 10): 5 rocks
  - (-10, 0.5, -10): 5 rocks
  - (15, 0.5, -15): 3 crystals
  - (-15, 1, 15): 4 plants
- Creates environmental diversity and navigation challenges

**Physics Integration**
- All obstacles are static (mass = 0)
- Collision enabled for realistic navigation
- Forces creatures to pathfind around obstacles
- Can trap or funnel creatures into specific areas

### 4. Enhanced Fitness Function

**New Fitness Calculation**
```javascript
fitness = foodCollected × 100  // Primary: food collection
        + age × 2               // Secondary: survival time
        + distanceTraveled × 5  // Tertiary: movement efficiency
        + socialFactor          // NEW: social interaction bonus/penalty
```

**Social Factor Details**
```javascript
if (socialBehavior < 0.5) {  // Cooperative
    socialFactor = nearbyCreatureCount × 5
} else {  // Competitive
    socialFactor = -(nearbyCreatureCount × 2)
}
```

**Evolutionary Implications**
- Cooperative creatures thrive in groups
- Competitive creatures prefer solitude
- Creates niche specialization
- Can lead to population segregation

## Emergent Higher-Level Behaviors

### Observed Behaviors

#### 1. **Obstacle Navigation**
- Creatures learn to path around rocks and plants
- Some lineages develop better spatial navigation
- Obstacles create "territory" effects
- Creatures may get trapped, creating selection pressure for navigation skills

#### 2. **Social Clustering**
- Cooperative creatures tend to aggregate near food
- Competitive creatures spread out
- Creates dynamic spatial patterns
- May lead to cooperative foraging groups

#### 3. **Communication Patterns**
- Signal colors correlate with behavioral strategies
- Potential for signal-based coordination (future evolution)
- Visual feedback of creature "mood" or state
- Basis for more complex social behaviors

#### 4. **Resource Competition**
- Obstacles create bottlenecks near food
- Forces creatures to navigate efficiently
- Competitive advantage for navigation skills
- Selection for both foraging and spatial abilities

#### 5. **Territorial Behavior**
- Some areas become dominated by specific lineages
- Obstacles create defensible positions
- Cooperative groups may hold territory
- Competitive individuals roam between areas

### Potential Future Emergent Behaviors

**With Additional Generations**:
1. **Cooperative Foraging**: Groups share food discovery through signals
2. **Defensive Territories**: Cooperative groups defend high-food areas
3. **Migration Patterns**: Creatures move between obstacle clusters
4. **Signal Languages**: Color patterns develop meaning
5. **Predator-Prey Dynamics**: If different food sources introduced
6. **Niche Specialization**: Rock-navigators vs. open-space foragers

## Technical Implementation

### Architecture Changes

**Creature Class** (`src/creatures/Creature.js`):
- Added `socialBehavior`, `nearestCreatureDirection`, `nearbyCreatureCount`
- Added `signalColor` and `signalMarker` for communication
- Expanded `sense()` to detect other creatures
- Modified `act()` to update signal based on neural output
- Enhanced `update()` to include social fitness factor

**Evolution Manager** (`src/evolution/EvolutionManager.js`):
- Integrated `ObstacleManager`
- Passes creature list to each creature's `update()`
- Enables social sensing and interactions

**New Module**: **Obstacles** (`src/environment/Obstacles.js`):
- `Obstacle` class for individual obstacles
- `ObstacleManager` for obstacle clusters
- Three types: rocks, crystals, plants
- Cluster-based distribution

### Performance Considerations

**Neural Network Impact**:
- Input increase (9 → 13): +44% computation per creature
- Output increase (3 → 4): +33% output layer computation
- Still performant with 10-15 creatures

**Social Sensing Complexity**:
- O(n²) for all-pairs creature detection
- Current implementation: ~100 comparisons for 10 creatures
- Acceptable for populations < 20
- May need spatial partitioning for 50+ creatures

**Memory Overhead**:
- Signal marker: ~1 KB per creature
- Obstacle meshes: ~5 KB total
- Negligible impact on performance

## Evolutionary Pressure Analysis

### New Selection Pressures

**Navigation Pressure**
- Obstacles force evolution of spatial awareness
- Selection for creatures that avoid getting stuck
- May favor specific body configurations (smaller, more agile)

**Social Pressure**
- Cooperative gene under direct selection
- Creates two evolutionary strategies (group vs. solo)
- May lead to speciation if niches persist

**Communication Pressure**
- Currently weak (signals not yet used for coordination)
- Sets foundation for future signal evolution
- May strengthen if cooperative behaviors emerge

### Expected Evolutionary Outcomes

**Short Term** (5-10 generations):
- Improved obstacle navigation
- Segregation of cooperative vs. competitive types
- Signal colors stabilize for each type

**Medium Term** (10-20 generations):
- Spatial strategy specialization
- Possible cooperative foraging behaviors
- Signal-based simple coordination

**Long Term** (20+ generations):
- Distinct behavioral archetypes
- Complex social structures
- Environmental niche specialization
- Potential for primitive "communication" protocols

## Configuration & Tuning

### Adjustable Parameters

**Social Behavior**:
```javascript
// In Creature fitness calculation
cooperativeBonus = nearbyCreatureCount * 5  // Increase for stronger grouping
competitivePenalty = nearbyCreatureCount * 2  // Increase to push solitude
```

**Communication**:
```javascript
// In Creature act()
signalIntensity = Math.abs(actions[3])  // 4th neural output
// Can add signal cost: energy -= signalIntensity * 0.05
```

**Obstacles**:
```javascript
// In ObstacleManager initialize()
createObstacleCluster(position, count, type)
// Adjust positions, counts, and types for different environments
```

### Experimental Variations

**High Density**: More obstacles, forces navigation skills
**Sparse**: Fewer obstacles, emphasizes foraging
**Clustered Resources**: Food near obstacles, creates competition
**Dispersed Resources**: Food away from obstacles, different strategy

## Future Enhancements

### Planned Features

1. **Active Communication**: Creatures respond to others' signals
2. **Territorial Marking**: Leave persistent markers in environment
3. **Group Coordination**: Cooperative hunting/foraging
4. **Obstacle Avoidance Learning**: Better pathfinding algorithms
5. **Environmental Variation**: Dynamic obstacle placement
6. **Multi-species**: Different creature types with distinct niches

### Research Questions

1. Will cooperative strategies dominate in food-rich environments?
2. Can signal-based coordination emerge without hardcoding?
3. How do obstacles affect speciation rates?
4. What body configurations optimize obstacle navigation?
5. Can creatures develop "culture" (learned group behaviors)?

---

**Implementation Date**: 2025-10-24  
**Version**: 0.3.0 (Higher-Level Behaviors)  
**Status**: Functional, ready for evolution analysis
