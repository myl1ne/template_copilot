# Evo - Current Backlog

> This document tracks development tasks and features for the Evo evolution simulator.

## 🔥 High Priority

### Not Started
- **Performance Optimization** - Improve physics and rendering performance for larger populations
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Notes**: Need to profile and optimize hot paths, implement spatial partitioning

- **Fitness Function Tuning** - Balance fitness calculations for more interesting evolution
  - **Status**: Not Started
  - **Target**: v0.1.1
  - **Notes**: Current fitness may favor certain behaviors too heavily

---

## 📋 Medium Priority

### Not Started
- **Vision Sensors** - Add visual perception to creatures
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Estimated Effort**: Large
  - **Notes**: Raycasting or simplified visual field

- **Food/Energy Sources** - Add collectible energy in environment
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Estimated Effort**: Medium

- **Advanced Body Joints** - Implement articulated joints between body segments
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Estimated Effort**: Large
  - **Dependencies**: Requires cannon-es constraints

- **Save/Load State** - Ability to save and restore simulation state
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Estimated Effort**: Medium

- **Genome Export** - Export successful creature genomes
  - **Status**: Not Started
  - **Target**: v0.2.0
  - **Estimated Effort**: Small

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

- **Core Simulation Engine** - Initial implementation with all major systems ✅
  - **Completed**: 2025-10-24
  - **Components**: DNA, Neural Networks, Creatures, Evolution, Physics, Rendering

- **Digital DNA System** - Genome encoding with mutation and crossover ✅
  - **Completed**: 2025-10-24
  
- **Neural Network Brains** - Simple feedforward networks for creature control ✅
  - **Completed**: 2025-10-24

- **Physics Integration** - Cannon-es physics for realistic movement ✅
  - **Completed**: 2025-10-24

- **Evolution System** - Natural selection with fitness-based breeding ✅
  - **Completed**: 2025-10-24

- **3D Visualization** - Three.js rendering with camera controls ✅
  - **Completed**: 2025-10-24

---

## 📊 Backlog Summary

| Priority | Not Started | In Progress | Under Review | Completed |
|----------|-------------|-------------|--------------|-----------|
| High     | 2           | 0           | 0            | 6         |
| Medium   | 5           | 0           | 0            | 0         |
| Low      | 5           | 0           | 0            | 0         |
| Bugs     | 2           | 0           | 0            | 0         |
| **Total**| **14**      | **0**       | **0**        | **6**     |

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
- `milestone: v0.2.0` - Target for next release

---

*Last updated: 2025-10-24*

*This backlog tracks development priorities. Items may shift based on community feedback and technical constraints.*