import { useState } from 'react'
import { BIOME_TYPES, getBiomeConfig } from './BiomeConfig'

export default function GameUI({ gameState, setGameState }) {
  const [creatureType, setCreatureType] = useState('sphere')
  const biomeConfig = getBiomeConfig(gameState.currentBiome)

  const changeBiome = (newBiome) => {
    setGameState(prev => ({
      ...prev,
      currentBiome: newBiome,
      // Reset food sources when changing biome
      foodSources: [],
      // Reset environment state for new biome
      environment: {
        ...prev.environment,
        pressure: 0,
        season: 'normal'
      }
    }))
  }

  const toggleSimulation = () => {
    setGameState(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }))
  }

  const spawnCreature = () => {
    const newCreature = {
      id: Date.now(),
      type: creatureType,
      position: [
        (Math.random() - 0.5) * 15,
        1,
        (Math.random() - 0.5) * 15
      ],
      velocity: [0, 0, 0],
      energy: 100,
      size: 0.5 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 0.5,
      energyEfficiency: 0.8 + Math.random() * 0.4,
      age: 0,
      maxAge: 60 + Math.random() * 40,
      reproductionThreshold: 150,
      diet: 'herbivore', // Default diet type
      aggressiveness: Math.random() * 0.3, // Low for herbivores
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }

    setGameState(prev => ({
      ...prev,
      population: [...prev.population, newCreature]
    }))
  }

  const spawnPredator = () => {
    const predator = {
      id: Date.now() + Math.random(),
      type: creatureType === 'sphere' ? 'cylinder' : creatureType, // Predators tend to be cylindrical
      position: [
        (Math.random() - 0.5) * 15,
        1,
        (Math.random() - 0.5) * 15
      ],
      velocity: [0, 0, 0],
      energy: 120, // Start with higher energy
      size: 0.7 + Math.random() * 0.4, // Slightly larger
      speed: 0.8 + Math.random() * 0.4, // Faster
      energyEfficiency: 0.6 + Math.random() * 0.3, // Less efficient but stronger
      age: 0,
      maxAge: 80 + Math.random() * 40, // Live longer
      reproductionThreshold: 200, // Need more energy to reproduce
      diet: 'carnivore',
      aggressiveness: 0.7 + Math.random() * 0.3, // High aggression
      color: `hsl(${Math.random() * 60}, 80%, 45%)` // Reddish colors
    }

    setGameState(prev => ({
      ...prev,
      population: [...prev.population, predator]
    }))
  }

  const clearPopulation = () => {
    setGameState(prev => ({
      ...prev,
      population: []
    }))
  }

  return (
    <div className="game-ui">
      {/* Control Panel */}
      <div className="control-panel">
        <h3>Game Controls</h3>
        
        <div className="control-group">
          <button 
            onClick={toggleSimulation}
            className={`btn ${gameState.isRunning ? 'btn-secondary' : ''}`}
          >
            {gameState.isRunning ? 'Pause' : 'Start'} Simulation
          </button>
        </div>

        <div className="control-group">
          <label>Creature Type:</label>
          <select 
            value={creatureType} 
            onChange={(e) => setCreatureType(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #555',
              background: '#333',
              color: 'white'
            }}
          >
            <option value="sphere">Sphere</option>
            <option value="cube">Cube</option>
            <option value="cylinder">Cylinder</option>
          </select>
        </div>

        <div className="control-group">
          <label>Biome:</label>
          <select 
            value={gameState.currentBiome} 
            onChange={(e) => changeBiome(e.target.value)}
            disabled={gameState.isRunning}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #555',
              background: gameState.isRunning ? '#555' : '#333',
              color: gameState.isRunning ? '#999' : 'white',
              cursor: gameState.isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <option value={BIOME_TYPES.FOREST}>🌲 Forest</option>
            <option value={BIOME_TYPES.DESERT}>🏜️ Desert</option>
            <option value={BIOME_TYPES.OCEAN}>🌊 Ocean</option>
          </select>
          <small style={{ opacity: 0.7, fontSize: '0.7rem' }}>
            {biomeConfig.description}
          </small>
        </div>

        <div className="control-group">
          <button onClick={spawnCreature} className="btn">
            Spawn Herbivore
          </button>
        </div>

        <div className="control-group">
          <button 
            onClick={spawnPredator} 
            className="btn"
            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
          >
            Spawn Predator
          </button>
        </div>

        <div className="control-group">
          <button 
            onClick={clearPopulation} 
            className="btn btn-secondary"
            disabled={gameState.population.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="control-panel">
        <h3>Statistics</h3>
        <div className="stats-panel">
          <div className="stat-item">
            <span>Population:</span>
            <span>{gameState.population.length}</span>
          </div>
          <div className="stat-item">
            <span>Herbivores:</span>
            <span style={{ color: '#51cf66' }}>
              {gameState.population.filter(c => c.diet !== 'carnivore').length}
            </span>
          </div>
          <div className="stat-item">
            <span>Predators:</span>
            <span style={{ color: '#ff6b6b' }}>
              {gameState.population.filter(c => c.diet === 'carnivore').length}
            </span>
          </div>
          <div className="stat-item">
            <span>Food Sources:</span>
            <span>{gameState.foodSources ? gameState.foodSources.filter(f => f.energy > 0).length : 0}</span>
          </div>
          <div className="stat-item">
            <span>Current Biome:</span>
            <span style={{ 
              color: gameState.currentBiome === BIOME_TYPES.FOREST ? '#51cf66' : 
                     gameState.currentBiome === BIOME_TYPES.DESERT ? '#ffa500' : '#40e0d0'
            }}>
              {biomeConfig.name}
            </span>
          </div>
          <div className="stat-item">
            <span>Status:</span>
            <span>{gameState.isRunning ? 'Running' : 'Paused'}</span>
          </div>
          <div className="stat-item">
            <span>Environment:</span>
            <span style={{ 
              color: gameState.environment?.season === 'drought' ? '#ff6b6b' : 
                     gameState.environment?.season === 'abundance' ? '#51cf66' : '#69db7c' 
            }}>
              {gameState.environment?.season?.charAt(0).toUpperCase() + gameState.environment?.season?.slice(1) || 'Normal'}
            </span>
          </div>
          <div className="stat-item">
            <span>Avg Energy:</span>
            <span>{gameState.population.length > 0 ? 
              Math.round(gameState.population.reduce((sum, c) => sum + c.energy, 0) / gameState.population.length) : 0}
            </span>
          </div>
          <div className="stat-item">
            <span>Generation:</span>
            <span>{gameState.population.length > 0 ? 
              Math.max(...gameState.population.map(c => Math.floor((c.age || 0) / 10))) + 1 : 1}
            </span>
          </div>
        </div>
      </div>

      {/* Creature Info */}
      {gameState.selectedCreature && (
        <div className="control-panel">
          <h3>Selected Creature</h3>
          <div className="stats-panel">
            <div className="stat-item">
              <span>Type:</span>
              <span>{gameState.selectedCreature.type}</span>
            </div>
            <div className="stat-item">
              <span>Diet:</span>
              <span style={{ 
                color: gameState.selectedCreature.diet === 'carnivore' ? '#ff6b6b' : '#51cf66' 
              }}>
                {gameState.selectedCreature.diet === 'carnivore' ? 'Predator' : 'Herbivore'}
              </span>
            </div>
            <div className="stat-item">
              <span>Energy:</span>
              <span>{Math.round(gameState.selectedCreature.energy)}</span>
            </div>
            <div className="stat-item">
              <span>Age:</span>
              <span>{Math.round(gameState.selectedCreature.age || 0)}s</span>
            </div>
            <div className="stat-item">
              <span>Size:</span>
              <span>{(gameState.selectedCreature.size || 0).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span>Speed:</span>
              <span>{(gameState.selectedCreature.speed || 0).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span>Efficiency:</span>
              <span>{(gameState.selectedCreature.energyEfficiency || 0).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span>Aggression:</span>
              <span>{((gameState.selectedCreature.aggressiveness || 0) * 100).toFixed(0)}%</span>
            </div>
            {gameState.selectedCreature.energy > (gameState.selectedCreature.reproductionThreshold || 150) && (
              <div className="stat-item" style={{ color: '#4CAF50' }}>
                <span>Status:</span>
                <span>Ready to Reproduce!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="control-panel">
        <h3>Controls</h3>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          <p>• Mouse: Rotate camera</p>
          <p>• Scroll: Zoom in/out</p>
          <p>• Right-click + drag: Pan</p>
          <p>• Click creature: Select</p>
        </div>
      </div>
    </div>
  )
}