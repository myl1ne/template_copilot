import { useState } from 'react'

export default function GameUI({ gameState, setGameState }) {
  const [creatureType, setCreatureType] = useState('sphere')

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
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }

    setGameState(prev => ({
      ...prev,
      population: [...prev.population, newCreature]
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
          <button onClick={spawnCreature} className="btn">
            Spawn Creature
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
            <span>Food Sources:</span>
            <span>{gameState.foodSources ? gameState.foodSources.filter(f => f.energy > 0).length : 0}</span>
          </div>
          <div className="stat-item">
            <span>Status:</span>
            <span>{gameState.isRunning ? 'Running' : 'Paused'}</span>
          </div>
          <div className="stat-item">
            <span>Avg Energy:</span>
            <span>{gameState.population.length > 0 ? 
              Math.round(gameState.population.reduce((sum, c) => sum + c.energy, 0) / gameState.population.length) : 0}
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