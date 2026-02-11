# Nexus Breach

**A roguelike tower defense game with procedurally generated art**

Nexus Breach is a browser-based tower defense game featuring 5 unique races, 20 distinct towers, and roguelike progression elements. Built with TypeScript, React, and Pixi.js, the game features 100% procedurally generated visuals using geometric shape primitives.

## Features

- **5 Unique Races**: Human, Elemental, Undead, Elven, and Mechanical, each with distinct towers and passive abilities
- **20 Towers**: 4 towers per race with unique upgrade paths (levels 1-10)
- **40 Abilities**: Towers unlock powerful abilities at levels 5 and 10
- **Roguelike Progression**: Unlock new towers, earn buffs, and make strategic choices between runs
- **15 Monster Types**: 12 regular enemies plus 3 epic boss encounters
- **30 Waves**: Progressively challenging waves with boss fights every 10 waves
- **Status Effects**: Slow, stun, freeze, burn, poison, and weakness
- **Procedural Art**: All game entities rendered using geometric shapes (no sprite assets)

## Quick Start

### Prerequisites

- Node.js 18+ and npm

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

The game will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Game Engine**: Pixi.js 7 (WebGL 2D rendering)
- **State Management**: Zustand + Immer
- **Build Tool**: Vite
- **Code Quality**: Strict TypeScript, ESLint

## Project Structure

```
src/
├── components/          # React UI components
│   ├── game/           # GameCanvas, GameHUD
│   └── ui/             # Menus, panels, modals
├── core/               # Game loop, grid, pathfinding, math
├── systems/            # Combat, wave, targeting, ability, upgrade
├── managers/           # Tower, monster, projectile managers
├── data/               # Tower/monster/ability/wave definitions
├── rendering/          # Pixi.js renderer, procedural art
├── abilities/          # Ability framework (triggers, effects)
├── roguelike/          # Run manager, reward system
├── types/              # TypeScript type definitions
└── store/              # Zustand state stores
```

## How to Play

1. **Select a Race**: Choose from 5 races, each with unique passive abilities
2. **Place Towers**: Click a tower card, then click on the grid to place
3. **Start Waves**: Click "Start Wave" to spawn enemies
4. **Upgrade Towers**: Click towers to view stats and upgrade (max level 10)
5. **Earn Rewards**: After each wave, choose from 3 rewards (new towers, buffs, gold, lives)
6. **Survive**: Prevent enemies from reaching the exit and depleting your lives

## Game Systems

### Tower Races

- **Human**: Physical damage, versatile and balanced
- **Elemental**: Magic specialists (fire, ice, lightning)
- **Undead**: Shadow and poison damage over time
- **Elven**: Holy and nature damage with support abilities
- **Mechanical**: Technology-based towers with explosives and void damage

### Damage Types

Physical, Fire, Ice, Lightning, Shadow, Holy, Void

Each monster has unique resistances and weaknesses to different damage types.

### Status Effects

- **Slow**: Reduces movement speed
- **Stun**: Stops movement completely
- **Freeze**: Combines slow and stun
- **Burn**: Fire damage over time
- **Poison**: Shadow damage over time
- **Weakness**: Amplifies incoming damage

## Development

### Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Debugging

The game exposes debug objects to the browser console:

- `window.game` - Main Game instance
- `window.runManager` - RunManager instance (race, towers, buffs)

### Adding Content

See [docs/content-guide.md](docs/content-guide.md) for detailed guides on:
- Adding new towers
- Creating monsters
- Defining abilities
- Designing waves

## Documentation

- [Project Overview](docs/project-overview.md) - Detailed project information
- [Architecture](docs/architecture.md) - Technical architecture and design patterns
- [Roadmap](docs/roadmap.md) - Current status and future plans
- [Development Guide](docs/development.md) - Setup and debugging information
- [Technical Debt](docs/technical-debt.md) - Known issues and refactoring opportunities
- [Generative AI Pipeline](docs/generative-ai-pipeline.md) - Strategy for AI-generated assets

## Version

**v0.1.0** - Initial release with core gameplay and all 5 races

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License - See LICENSE file for details

## Contributing

This project is currently in active development. Contributions, bug reports, and feature requests are welcome!

---

Built with ❤️ using React, TypeScript, and Pixi.js
