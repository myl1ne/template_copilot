# Ecosystem Sandbox Development Guide

This guide explains the development setup, project structure, and contribution guidelines for the Ecosystem Sandbox evolution simulation game.

## 🚀 Development Setup

### Prerequisites
- **Node.js 16+** and npm
- **Modern Browser** with WebGL support
- **Git** for version control
- **Code Editor** with React and JavaScript support (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git ecosystem-sandbox
cd ecosystem-sandbox

# Install dependencies
npm install

# Start development server
npm start
```

### Development Environment
The project uses:
- **React 18+** for UI components and state management
- **Three.js** for 3D rendering and WebGL
- **Create React App** or **Vite** for build tooling
- **Jest** for testing framework
- **ESLint** and **Prettier** for code formatting

## 🏗️ Project Structure

```
ecosystem-sandbox/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   ├── game/         # Game-specific components
│   │   └── simulation/   # Evolution simulation components
│   ├── systems/          # Core game systems
│   │   ├── creatures/    # Creature management
│   │   ├── evolution/    # Evolution engine
│   │   ├── environment/  # Environment simulation
│   │   └── rendering/    # Three.js rendering
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── constants/        # Game constants and config
├── docs/                 # Project documentation
└── tests/                # Test files
```

## 🎮 Game Architecture

### Core Systems Overview

#### 1. Rendering System (`src/systems/rendering/`)
- **Scene Manager**: Three.js scene setup and management
- **Camera Controller**: Player camera movement and controls
- **Mesh Factory**: Geometric primitive creature models
- **Lighting System**: Dynamic lighting for different biomes

#### 2. Creature System (`src/systems/creatures/`)
- **Creature Class**: Individual organism behavior and attributes
- **Population Manager**: Handles groups of creatures
- **Genetics Engine**: Trait inheritance and mutation
- **Behavior AI**: Movement, feeding, reproduction behaviors

#### 3. Evolution Engine (`src/systems/evolution/`)
- **Natural Selection**: Survival-based population changes
- **Mutation System**: Random trait modifications
- **Environmental Pressure**: Ecosystem challenges affecting evolution
- **Trait System**: Heritable characteristics

#### 4. Environment System (`src/systems/environment/`)
- **Biome Manager**: Different environment types
- **Resource System**: Food and territory management
- **Physics Engine**: Collision detection and movement
- **Climate System**: Temperature, weather effects

## 🔧 Development Workflow

### Feature Development
1. **Create Branch**: `git checkout -b feature/creature-movement`
2. **Implement Changes**: Follow React and Three.js best practices
3. **Write Tests**: Add unit tests for new functionality
4. **Update Documentation**: Keep docs current with changes
5. **Submit PR**: Include detailed description and testing notes

### Code Style Guidelines
- **Components**: Use functional components with hooks
- **State Management**: React Context for global state, local state for UI
- **Three.js Integration**: Custom hooks for Three.js lifecycle
- **Performance**: Minimize re-renders, use React.memo for optimization
- **Testing**: Jest for unit tests, React Testing Library for components

### Performance Considerations
- **Frame Rate**: Target 60fps with 100+ creatures
- **Memory Management**: Efficient object pooling for creatures
- **LOD System**: Level-of-detail for distant creatures
- **Batching**: Instanced rendering for similar creatures

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Test Categories
- **Component Tests**: React component rendering and interactions
- **System Tests**: Game system logic and state management
- **Integration Tests**: Three.js and React integration
- **Performance Tests**: Frame rate and memory usage validation

## 📝 Documentation Maintenance

### Automatic Updates
The project uses GitHub Copilot to automatically maintain:
- **Backlog Sync**: Issues automatically update backlog sections
- **Roadmap Updates**: Completed features move to appropriate sections
- **Version Tracking**: Release notes and version information

### Manual Updates Required
- **Game Design Changes**: Core mechanics or feature modifications
- **Architecture Decisions**: Major technical changes
- **Performance Benchmarks**: New optimization results
- **User Feedback Integration**: Community input and feature requests

## 🔄 Release Process

### Alpha Releases (v0.x.x-alpha)
- **Focus**: Core systems development
- **Testing**: Internal testing and basic functionality
- **Documentation**: Technical documentation and setup guides

### Beta Releases (v0.x.x-beta)
- **Focus**: Feature completeness and polish
- **Testing**: Community testing and feedback integration
- **Documentation**: User guides and gameplay documentation

### Production Releases (v1.x.x)
- **Focus**: Stability, performance, and user experience
- **Testing**: Comprehensive testing across browsers and devices
- **Documentation**: Complete user and developer documentation

## 🤝 Contribution Guidelines

### Getting Started
1. **Check Backlog**: Review current tasks in `docs/backlog.md`
2. **Create Issue**: Describe new features or bug reports
3. **Discuss First**: For major changes, open a discussion issue
4. **Follow Standards**: Use existing code patterns and conventions

### Pull Request Process
1. **Clear Description**: Explain what changes and why
2. **Test Coverage**: Include tests for new functionality
3. **Documentation**: Update relevant docs for feature changes
4. **Performance Impact**: Note any performance implications
5. **Screenshots**: For UI changes, include before/after images

### Code Review Criteria
- **Functionality**: Does it work as intended?
- **Performance**: Maintains target frame rate?
- **Code Quality**: Follows project conventions?
- **Testing**: Adequate test coverage?
- **Documentation**: Clear and up-to-date?

## 🚨 Common Issues and Solutions

### Three.js Integration Problems
- **Solution**: Use useEffect cleanup for Three.js objects
- **Pattern**: Custom hooks for Three.js lifecycle management
- **Debugging**: Check browser console for WebGL errors

### Performance Issues
- **Profiling**: Use browser dev tools Performance tab
- **Optimization**: Implement object pooling for creatures
- **Monitoring**: Add FPS counter during development

### State Management Complexity
- **Solution**: Use React Context for global game state
- **Pattern**: Separate UI state from game simulation state
- **Debugging**: React DevTools for state inspection

---

*This guide is maintained by the development team and GitHub Copilot automation.*