# Evo - Current Backlog

> This document tracks development tasks and features for the Evo evolution simulator.

## 🔥 High Priority

### Not Started
- **Performance Optimization** - Improve physics and rendering performance for larger populations
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Notes**: Need to profile and optimize hot paths, implement spatial partitioning

- **Auditory System** - Sound emission and detection for advanced communication
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Medium

---

## 📋 Medium Priority

### Not Started
- **Learning Systems** - Creatures that can learn within their lifetime
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Large
  - **Notes**: Neural plasticity, reinforcement learning

- **Enhanced Communication** - Signal-based coordination between pack members
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Medium

- **Save/Load State** - Ability to save and restore simulation state
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Medium

- **Genome Export** - Export successful creature genomes
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Small

- **Improved Neural Architectures** - LSTM or recurrent networks
  - **Status**: Not Started
  - **Target**: v0.4.0
  - **Estimated Effort**: Large

- **Multiple Biomes** - Different environments with varied selection pressures
  - **Status**: Not Started
  - **Target**: v0.5.0
  - **Estimated Effort**: Large

---

## 📝 Low Priority

### Not Started
- **Camera Follow Mode** - Camera that tracks best performing creature
  - **Status**: Not Started
  - **Type**: Enhancement
  - **Estimated Effort**: Small

- **Statistics Dashboard** - Enhanced UI with graphs and charts
  - **Status**: Not Started
  - **Type**: Enhancement
  - **Estimated Effort**: Medium

- **Creature Inspector** - UI to view individual creature details
  - **Status**: Not Started
  - **Type**: Enhancement
  - **Estimated Effort**: Medium

- **Sound Effects** - Audio feedback for evolution events
  - **Status**: Not Started
  - **Type**: Enhancement
  - **Estimated Effort**: Small

- **Multiple Environments** - Different biomes with varied challenges
  - **Status**: Not Started
  - **Type**: Feature
  - **Estimated Effort**: Large

---

## 🐛 Bug Fixes

### Known Issues
- **Physics Instability** - Creatures occasionally get "stuck" in physics simulation
  - **Status**: Not Started
  - **Severity**: Minor
  - **Notes**: Increase solver iterations or add recovery mechanism

- **Memory Leak** - Long-running simulations may accumulate memory
  - **Status**: Not Started
  - **Severity**: Important
  - **Notes**: Need to ensure proper disposal of Three.js resources

---

## ✅ Recently Completed

- **Enhanced Vision System** - Multi-directional food detection with peripheral sensors ✅
  - **Completed**: 2025-10-26
  - **Version**: v0.3.0

- **Pack Behavior** - Cooperative herbivore packs with food sharing ✅
  - **Completed**: 2025-10-26
  - **Version**: v0.3.0

- **Predator-Prey Dynamics** - Carnivores hunt herbivores for energy ✅
  - **Completed**: 2025-10-26
  - **Version**: v0.3.0

- **Environmental Events** - Dynamic challenges (abundance, scarcity, drought, migration) ✅
  - **Completed**: 2025-10-26
  - **Version**: v0.3.0

- **Diet Types & Color Coding** - Visual distinction between herbivores and carnivores ✅
  - **Completed**: 2025-10-26
  - **Version**: v0.3.0

- **Food/Energy System** - 30 auto-respawning food pellets for creature survival ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.2.0

- **Vision Sensors** - Creatures detect and navigate toward nearest food ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.2.0

- **Articulated Body Joints** - Physics constraints connect body segments ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.2.0

- **Enhanced Fitness Function** - Food collection as primary fitness driver ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.2.0

- **Core Simulation Engine** - Initial implementation with all major systems ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0

- **Digital DNA System** - Genome encoding with mutation and crossover ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0
  
- **Neural Network Brains** - Simple feedforward networks for creature control ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0

- **Physics Integration** - Cannon-es physics for realistic movement ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0

- **Evolution System** - Natural selection with fitness-based breeding ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0

- **3D Visualization** - Three.js rendering with camera controls ✅
  - **Completed**: 2025-10-24
  - **Version**: v0.1.0

---

## 📊 Backlog Summary

| Priority | Not Started | In Progress | Under Review | Completed |
|----------|-------------|-------------|--------------|-----------|
| High     | 2           | 0           | 0            | 15        |
| Medium   | 4           | 0           | 0            | 0         |
| Low      | 5           | 0           | 0            | 0         |
| Bugs     | 2           | 0           | 0            | 0         |
| **Total**| **13**      | **0**       | **0**        | **15**    |

---

## 🏷️ Issue Labels Guide

When creating new GitHub issues, use these labels for organization:

- `priority: high` - High priority items
- `priority: medium` - Medium priority items  
- `priority: low` - Low priority items
- `type: bug` - Bug fixes
- `type: feature` - New features
- `type: enhancement` - Improvements to existing features
- `type: documentation` - Documentation updates
- `milestone: v0.4.0` - Target for next release

---

*Last updated: 2025-10-26*

*This backlog tracks development priorities. Items may shift based on community feedback and technical constraints.*