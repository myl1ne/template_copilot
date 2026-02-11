# Nexus Breach - Project Overview

## What is Nexus Breach?

Nexus Breach is a browser-based roguelike tower defense game where players defend the Nexus from waves of corrupted creatures. The game features 5 unique races, each with their own tower types and gameplay styles, combined with roguelike progression where players unlock new towers and buffs throughout their run.

**Key Innovation**: All game entities are rendered using procedurally generated art from geometric shape primitives—no sprite assets required. This data-driven approach makes the game highly moddable and reduces asset overhead.

## Target Audience

This project is designed for:
- **Indie Game Developers**: Looking for a clean architecture example for browser-based games
- **Tower Defense Fans**: Who enjoy strategic depth and roguelike variety
- **Web Game Enthusiasts**: Interested in high-performance 2D rendering with Pixi.js
- **TypeScript Learners**: Seeking a real-world example of strict TypeScript practices

## Key Features

- **5 Unique Races with Passive Abilities**
  - Human: Versatile physical damage dealers (+10% attack speed)
  - Elemental: Magic specialists with elemental damage (+15% spell damage)
  - Undead: Shadow and poison damage over time (+20% DoT damage)
  - Elven: Holy and nature damage with support abilities (+10% tower range)
  - Mechanical: Technology-based explosives and void damage (+10% AoE damage)

- **20 Distinct Towers with Upgrade Paths**
  - 4 towers per race, each with unique stats and abilities
  - Level 1-10 progression with stat scaling
  - Abilities unlock at levels 5 and 10
  - Strategic placement and upgrade decisions

- **Roguelike Progression System**
  - Start each run with one race-specific tower
  - Unlock new towers as rewards after waves
  - Earn persistent buffs (damage, range, attack speed, gold)
  - Make strategic choices: new towers vs. immediate resources

- **40 Unique Abilities**
  - 8 abilities per race (2 per tower)
  - Triggers: On-hit, periodic (cooldown-based)
  - Effects: Direct damage, AoE, status effects, buffs
  - Synergies between tower types

- **15 Monster Types Across 30 Waves**
  - 12 regular enemy types with unique resistances
  - 3 epic boss encounters (waves 10, 20, 30)
  - Special mechanics: Flying monsters, armor, elemental resistances
  - Progressive difficulty scaling

- **6 Status Effect System**
  - Slow: Reduces movement speed
  - Stun: Stops movement
  - Freeze: Combines slow and stun
  - Burn: Fire damage over time
  - Poison: Shadow damage over time
  - Weakness: Amplifies incoming damage

- **100% Procedurally Generated Art**
  - All entities rendered from shape primitives (circle, rect, polygon, line, arc, star)
  - Data-driven visual definitions with layering and animations
  - Dynamic colors based on race/monster type
  - Health-based visual scaling and attack animations

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd template_copilot

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production
```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

### Basic Usage
1. Start the game → Main menu appears
2. Click "START RUN" → Select one of 5 races
3. Click "START RUN" again → Game begins
4. Place towers by clicking tower cards, then clicking the grid
5. Click "Start Wave" to spawn enemies
6. After each wave, choose a reward from 3 options
7. Survive as many waves as possible

## Core Benefits

1. **Educational Value**: Clean architecture demonstrating best practices for TypeScript game development
   - Strict type safety with no `any` types
   - Clear separation of concerns (Core → Systems → Managers → Data)
   - State management with Zustand + Immer
   - Fixed timestep game loop pattern

2. **High Performance**: Optimized rendering and game logic
   - Pixi.js WebGL rendering with hardware acceleration
   - Pathfinding cache with grid version invalidation
   - Object pooling for projectiles
   - Fixed 60 FPS update loop

3. **Data-Driven Design**: Easy content creation and modding
   - All towers/monsters/abilities defined as pure TypeScript objects
   - Procedural art eliminates asset pipeline overhead
   - Add new content by creating data files
   - No game code changes needed for new entities

4. **Roguelike Replayability**: Every run feels different
   - Random tower unlock progression
   - Strategic reward choices
   - Buff stacking creates unique builds
   - Race selection affects starting strategy

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | React 18 | UI components and state management |
| Language | TypeScript 5.8 | Type-safe development |
| Game Rendering | Pixi.js 7 | Hardware-accelerated 2D graphics |
| State Management | Zustand + Immer | Immutable state updates |
| Build Tool | Vite 6 | Fast dev server and optimized builds |
| Code Quality | ESLint | Linting and code consistency |
| Audio | Howler.js 2 | Cross-browser audio (not yet implemented) |

## Project Statistics

- **Codebase**: 112 TypeScript files, ~15,000 lines of code
- **Components**: 9 React components (7 UI + 2 game)
- **Game Systems**: 6 core systems (Combat, Wave, Targeting, Ability, Upgrade, Level)
- **Entity Managers**: 3 managers (Tower, Monster, Projectile)
- **Data Files**: 57 entity definitions (towers, monsters, abilities, waves)

## Development Workflow

1. **Local Development**: Hot reload with Vite dev server
2. **Type Safety**: Strict TypeScript catches errors at compile time
3. **Debug Console**: Access game state via `window.game` and `window.runManager`
4. **Component Testing**: React components isolated from game logic
5. **Data Iteration**: Modify tower/monster stats without recompilation

## Links & Resources

- **Repository**: [GitHub URL](https://github.com/...)
- **Documentation**: [docs/](.)
  - [Architecture](architecture.md) - Technical design
  - [Roadmap](roadmap.md) - Future plans
  - [Development Guide](development.md) - Setup and debugging
  - [Content Guide](content-guide.md) - Adding towers/monsters
  - [Technical Debt](technical-debt.md) - Known issues
- **Version**: v0.1.0 (Current)
- **License**: MIT

---

*Last updated: 2026-02-09 | Version: 0.1.0*
