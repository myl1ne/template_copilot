# GitHub Copilot Instructions for Ecosystem Sandbox

This document provides instructions for GitHub Copilot to automatically maintain the documentation and project management for the Ecosystem Sandbox game project.

## Project Context

**Ecosystem Sandbox** is a 3D evolution simulation game built with Three.js and React. Players guide geometric lifeforms through evolutionary stages in a dynamic ecosystem, similar to the classic game Spore but focused on browser-based gameplay with primitive geometric creatures.

## Documentation Maintenance Rules

### 1. Project Overview (`docs/project-overview.md`)
- **Update frequency**: When major features are added or game mechanics change
- **Key sections to maintain**:
  - Keep feature list current with implemented functionality
  - Update technology requirements as dependencies change
  - Maintain accurate installation and setup instructions
  - Update links when repository structure changes

### 2. Roadmap (`docs/roadmap.md`)
- **Update frequency**: After each release and monthly reviews
- **Maintenance tasks**:
  - Move completed items from "Planned Features" to "Recently Completed"
  - Update version numbers and target dates based on actual progress
  - Add new long-term goals as the project evolves
  - Reflect current development focus and priorities
  - Update external dependencies and technical constraints

### 3. Backlog (`docs/backlog.md`)
- **Update frequency**: Weekly or when GitHub issues change
- **Synchronization rules**:
  - High priority: Issues labeled `priority: high`
  - Medium priority: Issues labeled `priority: medium`
  - Low priority: Issues labeled `priority: low`
  - Bug fixes: Issues labeled `type: bug`
- **Maintain summary table** with accurate counts
- **Archive completed items** older than 30 days to "Recently Completed"

### 4. README.md
- **Update frequency**: When core project information changes
- **Keep current**:
  - Technology stack versions
  - Installation instructions
  - Quick start guide
  - Current version number and status

## Issue Management Integration

### Label-based Automation
Automatically sync these GitHub issue labels with backlog sections:

#### Priority Labels
- `priority: high` → High Priority section
- `priority: medium` → Medium Priority section  
- `priority: low` → Low Priority section

#### Type Labels
- `type: bug` → Bug Fixes section
- `type: feature` → Appropriate priority section
- `type: enhancement` → Medium or Low priority
- `type: documentation` → Low priority

#### Project-Specific Labels
- `component: 3d-rendering` → Three.js related tasks
- `component: evolution` → Evolution system features
- `component: ui` → React interface tasks
- `component: physics` → Movement and physics
- `stage: alpha` → Current development phase
- `stage: beta` → Future development phase

### Status Tracking
Track issue progress through GitHub issue states:
- **Open** → "Not Started" or "In Progress"
- **In Progress** → Issues with active PRs or assignees
- **Under Review** → Issues with open PRs awaiting review
- **Closed** → "Recently Completed" section

## Game Development Context

### Core Game Systems
When updating documentation, consider these key systems:
1. **3D Rendering Pipeline** (Three.js, WebGL)
2. **Creature System** (Geometric primitives, attributes, behaviors)
3. **Evolution Engine** (Genetics, mutations, selection pressure)
4. **Environment Simulation** (Biomes, resources, physics)
5. **User Interface** (React components, game controls)

### Development Phases
The project follows these phases - update documentation accordingly:
- **Alpha**: Core systems, basic 3D rendering, simple creatures
- **Beta**: Evolution mechanics, multiple biomes, advanced UI
- **Release**: Full game experience, optimization, polish

### Performance Considerations
When documenting features, always consider:
- **WebGL Performance**: Frame rate impact of new features
- **Memory Usage**: Browser memory constraints with large populations
- **Mobile Compatibility**: Touch controls and responsive design

## Automation Guidelines

### When NOT to Auto-update
- Don't modify game design decisions without explicit developer input
- Don't change version numbers or release dates arbitrarily
- Don't remove or modify external dependency information
- Don't alter the core game concept or target audience

### Quality Checks
Before updating documentation:
- Ensure all internal links remain functional
- Verify GitHub issue references are valid
- Maintain consistent formatting and style
- Check that technical specifications are accurate

### Communication Style
- Use engaging, game-focused language
- Emphasize the creative and educational aspects
- Maintain excitement about evolutionary simulation
- Technical accuracy while remaining accessible

---

*These instructions ensure consistent, accurate, and engaging documentation for the Ecosystem Sandbox project while leveraging GitHub Copilot's automation capabilities.*