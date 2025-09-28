# Environmental Controls Tutorial

## Overview

The Environmental Interaction Tools provide powerful ecosystem manipulation capabilities, allowing players and educators to create custom scenarios, trigger events, and observe evolutionary responses in real-time. This tutorial walks you through all the features and demonstrates typical usage patterns.

## Getting Started

### Step 1: Access Environmental Controls

![Initial State](https://github.com/user-attachments/assets/e210a6f3-90b5-402e-946b-2e702c7c237b)

1. Launch the Ecosystem Sandbox
2. Look for the **"Show Environmental Controls"** button in the Game Controls panel
3. Click the button to reveal the Environmental Controls interface

### Step 2: Explore the Interface

![Environmental Controls Interface](https://github.com/user-attachments/assets/5c0defc2-d13a-477e-8191-18ee2a7f6208)

The Environmental Controls feature a **three-panel tabbed design**:

- **🌡️ Climate**: Control temperature, humidity, and seasonal variations
- **⚡ Disasters**: Trigger natural disasters with configurable intensity
- **🍃 Resources**: Manipulate food sources, obstacles, and terrain

**Important Note**: Controls are disabled when the simulation is paused and show "🔴 Inactive" status.

## Panel Overview

### Climate Controls Panel

The Climate panel provides three environmental parameters:

- **🌡️ Temperature (0-100)**: Affects creature metabolism and movement speed
  - **Cold (0-25)**: Slower metabolism, reduced reproduction
  - **Normal (25-75)**: Balanced conditions
  - **Hot (75-100)**: Higher energy drain, faster movement

- **💧 Humidity (0-100)**: Controls moisture levels and food availability
  - **Arid (0-25)**: Reduced food growth, harder reproduction
  - **Normal (25-75)**: Balanced moisture levels
  - **Humid (75-100)**: Increased food growth, better reproduction

- **🍂 Seasonal Intensity (0-100)**: Determines seasonal variation strength
  - **Stable (0-25)**: Consistent conditions year-round
  - **Normal (25-75)**: Moderate seasonal changes
  - **Extreme (75-100)**: Dramatic seasonal variations

### Disasters Panel

![Disasters Panel](https://github.com/user-attachments/assets/0af69dd2-9ee8-4084-b5e5-8011fef57d70)

The Disasters panel offers six disaster types:

1. **Drought**: Severe lack of water and food resources
2. **Flood**: Excess water causing displacement and resource loss
3. **Volcanic Eruption**: Ash and lava destroying habitat areas
4. **Meteor Impact**: Massive impact causing widespread destruction
5. **Ice Age**: Extreme cold reducing energy efficiency
6. **Heat Wave**: Extreme heat increasing energy consumption

**Configuration Options**:
- **Disaster Type**: Select from dropdown menu
- **Intensity (10-100%)**: Controls the severity of effects
- **Automatic Duration**: Based on intensity (5-10 seconds)

### Resources Panel

![Resources Panel](https://github.com/user-attachments/assets/87589f1f-860b-4b78-a18c-f05e7ff35817)

The Resources panel provides ecosystem manipulation tools:

**Resource Controls**:
- **🍃 Add Food Sources**: Spawn 10 new food sources randomly
- **🥀 Remove Food Sources**: Remove 5 existing food sources
- **💧 Add Water Body**: Create water areas (visual enhancement)
- **🪨 Add Obstacles**: Add 3 new terrain obstacles
- **🗿 Remove Obstacles**: Remove 2 existing obstacles

**Terrain Modification**:
- **⛰️ Raise Terrain**: Elevate terrain in target areas
- **🕳️ Lower Terrain**: Create depressions and valleys
- **🌊 Smooth Terrain**: Level out rough terrain areas

## Usage Tutorial

### Step 3: Start the Simulation

![Active Controls](https://github.com/user-attachments/assets/7205a278-668e-42f0-853e-9c29eacdf348)

1. Click **"Start Simulation"** to activate the ecosystem
2. Notice that Environmental Controls now show **"🟢 Active"**
3. All control buttons are now enabled and functional
4. Food sources appear automatically (25 in Forest biome)

### Step 4: Manipulate Climate

When the simulation is running, you can:

1. **Adjust Temperature**: Drag the temperature slider to see immediate effects
2. **Modify Humidity**: Change moisture levels to affect food availability
3. **Set Seasonal Intensity**: Control how much conditions vary over time

**Real-time Feedback**: Effect descriptions update automatically as you adjust parameters.

### Step 5: Trigger Environmental Events

#### Creating a Drought Scenario

1. Switch to the **⚡ Disasters** panel
2. Select **"DROUGHT"** from the disaster type dropdown
3. Set intensity to **80%** for severe effects
4. Click **"🌪️ Trigger Disaster"**

**Expected Results**:
- Food availability drops significantly
- Creatures experience higher energy drain
- Reproduction rates decrease
- Survival pressure increases

#### Resource Manipulation Example

1. Switch to the **🍃 Resources** panel
2. Click **"🍃 Add Food Sources"** to increase resources
3. Observe population response to abundant food
4. Use **"🥀 Remove Food Sources"** to create scarcity
5. Try **"🪨 Add Obstacles"** to increase environmental complexity

## Educational Scenarios

### Scenario 1: Climate Change Simulation

**Objective**: Demonstrate evolutionary adaptation to rising temperatures

**Steps**:
1. Start with normal temperature (50)
2. Spawn diverse creature population
3. Gradually increase temperature to 80-90
4. Observe which genetic traits become advantageous
5. Document changes in population diversity

### Scenario 2: Natural Disaster Recovery

**Objective**: Study ecosystem resilience after catastrophic events

**Steps**:
1. Establish stable population (50+ creatures)
2. Trigger high-intensity meteor impact (90%)
3. Observe immediate population crash
4. Monitor recovery patterns and genetic bottlenecks
5. Compare pre/post-disaster genetic diversity

### Scenario 3: Resource Competition

**Objective**: Examine competitive exclusion and niche partitioning

**Steps**:
1. Create resource-rich environment (add food sources)
2. Spawn mixed herbivore/predator population
3. Gradually reduce resources (remove food sources)
4. Add environmental obstacles to increase complexity
5. Analyze survival strategies and specialization patterns

## Advanced Usage Tips

### Combining Effects

- **Climate + Disasters**: Create realistic environmental challenges
- **Resource manipulation + Climate**: Simulate seasonal abundance/scarcity cycles
- **Multiple disasters**: Study compound environmental stressors

### Timing Strategies

- **Gradual changes**: Slowly adjust parameters to observe adaptation
- **Shock events**: Sudden changes to study rapid evolutionary responses
- **Cyclic patterns**: Alternate between different conditions

### Observation Points

- **Population size changes**: Track demographic responses
- **Genetic diversity metrics**: Monitor evolutionary bottlenecks
- **Behavioral adaptations**: Notice changes in creature movement patterns
- **Species interactions**: Observe predator-prey dynamics under stress

## Technical Notes

### Performance Considerations

- Large populations (100+ creatures) may experience slower response times
- Multiple simultaneous disasters can compound computational load
- Terrain modifications are primarily visual enhancements

### Data Integration

- Environmental effects automatically integrate with the genetics system
- Lineage tracking continues through environmental events
- Population analytics reflect environmental impacts

### Future Enhancements

The Environmental Controls system provides a foundation for:
- **Scenario saving/loading**: Preserve custom environmental setups
- **Scripted events**: Automated environmental sequences
- **Multiplayer events**: Collaborative ecosystem management
- **Data export**: Research-grade environmental impact analysis

---

*This tutorial demonstrates the core functionality of the Environmental Interaction Tools. Experiment with different combinations to discover unique evolutionary scenarios and educational opportunities.*