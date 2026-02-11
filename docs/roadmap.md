# Nexus Breach - Roadmap

This document outlines the current status, near-term goals, and long-term vision for Nexus Breach.

## Version History

### ✅ v0.1.0 - Core Game (Current)
**Status**: Completed
**Release Date**: February 2026

#### Features Implemented
- **Core Game Loop**
  - Fixed timestep game loop (60 FPS)
  - Grid system (25×20 cells)
  - A* pathfinding with cache optimization
  - Tower placement and upgrade system

- **All 5 Races**
  - Human, Elemental, Undead, Elven, Mechanical
  - Race-specific passive abilities
  - 4 towers per race (20 total)

- **Ability System**
  - 40 unique abilities (8 per race)
  - Trigger framework (periodic, on-hit)
  - Effect system (damage, status, aura, shield)
  - Abilities unlock at tower levels 5 and 10

- **Monster System**
  - 15 monster types (12 regular + 3 bosses)
  - Resistance/weakness system (7 damage types)
  - Monster modifiers (rare variants with stat boosts)
  - Flying monster support

- **Wave System**
  - 30 predefined waves
  - Progressive difficulty scaling
  - Boss encounters every 10 waves
  - Spawn queue with timing control

- **Status Effects**
  - 6 effects: Slow, Stun, Freeze, Burn, Poison, Weakness
  - DoT (damage over time) system
  - Effect stacking and duration tracking

- **Roguelike Progression**
  - Race selection screen
  - Tower unlocks as rewards
  - Global buff system (damage, range, speed, gold)
  - Post-wave reward choices (3 options)
  - Run statistics tracking

- **UI System**
  - Main menu, race selection, game HUD
  - Tower selection panel
  - Tower info/upgrade panel
  - Reward modal
  - Pause menu and game over screen

- **Procedural Art**
  - 100% shape-based rendering
  - 6 shape primitives (circle, rect, polygon, line, arc, star)
  - Layered rendering with animations
  - Dynamic colors based on race/monster type

---

## 🚧 v0.2.0 - Generative AI Assets (In Progress)
**Target Date**: March 2026
**Focus**: Replace procedural art with AI-generated assets

### Planned Features

#### Generative AI Pipeline
- **Meshy API Integration**
  - Text-to-3D model generation for towers and monsters
  - GLB/FBX export and sprite sheet conversion
  - Build-time asset generation scripts

- **OpenAI API Integration**
  - DALL-E 3 for 2D sprite generation
  - Prompt engineering for consistent art style
  - Automated asset generation workflow

- **Hybrid Rendering System**
  - Asset loader with texture caching
  - Support for both sprite and procedural modes
  - Fallback to procedural if assets missing
  - Configuration system (dev mode, hybrid mode, sprite-only mode)

- **Asset Management**
  - Directory structure for generated assets
  - Manifest file mapping entity IDs to assets
  - Version control for generated assets
  - Regeneration workflow for updates

#### Quality of Life
- **Victory Screen**
  - Stats display for completed run
  - Replay option
  - High score tracking

- **Loading States**
  - Pixi.js initialization spinner
  - Asset loading progress bar

- **Error Boundaries**
  - React error boundaries for graceful failures
  - Error reporting and recovery

---

## 📋 v0.3.0 - Polish & Balance (Planned)
**Target Date**: April 2026
**Focus**: Game balance, audio, and UX improvements

### Planned Features

#### Audio System
- **Sound Effects**
  - Tower attack sounds (per damage type)
  - Monster hit/death sounds
  - UI click/hover sounds
  - Ability activation sounds

- **Music**
  - Main menu theme
  - In-game background music (dynamic based on wave)
  - Boss encounter music
  - Victory/defeat music

#### Game Balance
- **Tower Tuning**
  - Balance pass on all tower costs and stats
  - Ability cooldown adjustments
  - Upgrade cost scaling review

- **Wave Difficulty**
  - Monster HP/speed tuning per wave
  - Boss encounter difficulty balancing
  - Difficulty modes (Easy, Normal, Hard)

- **Reward System**
  - Rebalance reward weights
  - Add more reward types (temporary buffs, one-time abilities)
  - Rarity tiers for rewards

#### User Experience
- **Settings Menu**
  - Volume controls (SFX, music)
  - Graphics quality settings
  - Keybinding customization
  - Tutorial toggle

- **Accessibility**
  - ARIA labels for screen readers
  - Keyboard navigation
  - Colorblind-friendly modes
  - Configurable UI scaling

- **Performance Optimization**
  - Object pooling for projectiles and effects
  - Entity culling (off-screen entities)
  - LOD (level of detail) for distant entities

---

## 🔮 v0.4.0+ - Long-Term Vision (Future)
**Target Date**: TBD
**Focus**: Meta-progression, multiplayer, and community features

### Ideas Under Consideration

#### Meta-Progression
- **Persistent Unlocks**
  - Unlock towers permanently across runs
  - Unlock new races
  - Unlock difficulty modifiers

- **Achievement System**
  - 50+ achievements for various milestones
  - Steam integration (if published)

- **Daily Challenges**
  - Fixed seed runs with leaderboards
  - Special modifiers and rewards

#### Content Expansion
- **New Races**
  - Demonic race (chaos damage)
  - Celestial race (divine damage)
  - Hybrid race (combining multiple elements)

- **More Waves**
  - Extend to 50 waves
  - Endless mode with procedural generation
  - Special challenge waves

- **New Tower Types**
  - Support towers (buff allies, debuff enemies)
  - Trap towers (triggered effects)
  - Resource generators (gold/mana production)

#### Multiplayer (Experimental)
- **Co-op Mode**
  - 2-player cooperative defense
  - Shared resources or separate economies
  - Synchronized wave spawning

- **Competitive Mode**
  - Race to survive longer
  - Send monsters to opponent
  - Leaderboards and rankings

#### Community Features
- **Level Editor**
  - Create custom grid layouts
  - Place spawn/exit points
  - Terrain editor

- **Mod Support**
  - Plugin system for custom towers/monsters
  - Community workshop
  - Mod manager UI

- **Replay System**
  - Record and replay runs
  - Share replays with community
  - Spectator mode

#### Platform Expansion
- **Mobile Support**
  - Touch controls
  - UI scaling for small screens
  - Performance optimization for mobile GPUs

- **Desktop App**
  - Electron wrapper
  - Offline support
  - Native integrations

- **Steam Release**
  - Steam achievements
  - Trading cards
  - Cloud save support

---

## Technical Roadmap

### Code Quality
- [ ] Unit tests for core systems (pathfinding, combat, wave generation)
- [ ] Integration tests for game flow
- [ ] Visual regression tests for procedural art
- [ ] Performance profiling and optimization
- [ ] CI/CD pipeline (GitHub Actions)

### Architecture
- [ ] Remove window globals (migrate to React Context)
- [ ] Delete or integrate unused uiStore
- [ ] Migrate to CSS modules for styling
- [ ] Event system refactor (callbacks → EventEmitter)
- [ ] Split AbilitySystem into smaller modules

### Documentation
- [x] Project overview
- [x] Architecture guide
- [x] Development guide
- [x] Content creation guide
- [x] Technical debt documentation
- [ ] API documentation (if generative AI integrated)
- [ ] Tutorial system in-game

---

## Community & Feedback

We're actively seeking feedback on:
- Game balance and difficulty curve
- UI/UX pain points
- Performance issues on different hardware
- Feature requests and ideas

Please open issues on GitHub or join our community Discord (TBD).

---

## Release Schedule

| Version | Focus | Target Date | Status |
|---------|-------|-------------|--------|
| v0.1.0 | Core Game | Feb 2026 | ✅ Released |
| v0.2.0 | Generative AI | Mar 2026 | 🚧 In Progress |
| v0.3.0 | Polish & Balance | Apr 2026 | 📋 Planned |
| v0.4.0 | Meta-Progression | TBD | 🔮 Future |
| v1.0.0 | Full Release | TBD | 🔮 Future |

---

*Last updated: 2026-02-09*
