import { useState } from 'react'
import { BIOME_TYPES, getBiomeConfig } from './BiomeConfig'
import { generateDNA, expressCreatureTraits, createEnvironmentalFactors } from './GeneticsSystem'
import LineageTracker from './LineageTracker'

export default function GameUI({ gameState, setGameState }) {
  const [creatureType, setCreatureType] = useState('sphere')
  const [showLineageTracker, setShowLineageTracker] = useState(false)
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
    // Generate DNA and environmental factors
    const dna = generateDNA()
    const environmentalFactors = createEnvironmentalFactors(
      gameState.currentBiome, 
      gameState.environment?.season || 'normal',
      gameState.environment?.pressure || 0
    )
    
    // Express traits from genetics
    const geneticTraits = expressCreatureTraits(dna, environmentalFactors)
    
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
      
      // Genetic traits
      dna: dna,
      size: geneticTraits.size,
      speed: geneticTraits.speed,
      energyEfficiency: geneticTraits.energyEfficiency,
      maxAge: geneticTraits.lifespan,
      reproductionThreshold: geneticTraits.reproductionRate,
      diet: geneticTraits.diet,
      aggressiveness: geneticTraits.aggression,
      intelligence: geneticTraits.intelligence,
      
      // Calculated from genetics
      age: 0,
      generation: 1,
      parentIds: [], // No parents for spawned creatures
      
      // Color based on genetic traits
      color: generateCreatureColor(geneticTraits)
    }

    // Helper function to generate color from genetic traits
    function generateCreatureColor(traits) {
      // Base hue depends on diet preference
      let baseHue = 120 // Green for herbivores
      if (traits.diet === 'carnivore') {
        baseHue = 0 // Red for carnivores
      } else if (traits.diet === 'omnivore') {
        baseHue = 60 // Yellow for omnivores
      }
      
      // Adjust hue based on size and speed
      const hueVariation = (traits.size - 0.5) * 30 + (traits.speed - 0.5) * 20
      const finalHue = (baseHue + hueVariation) % 360
      
      // Saturation based on energy efficiency
      const saturation = Math.min(100, 50 + traits.energyEfficiency * 30)
      
      // Lightness based on intelligence
      const lightness = Math.min(80, 40 + traits.intelligence * 30)
      
      return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`
    }

    setGameState(prev => ({
      ...prev,
      population: [...prev.population, newCreature]
    }))
  }

  const spawnPredator = () => {
    // Generate DNA with carnivore bias
    const dna = generateDNA()
    // Force carnivore diet for predators
    dna.dietPreference.allele1 = 'carnivore'
    dna.dietPreference.allele2 = 'carnivore'
    
    const environmentalFactors = createEnvironmentalFactors(
      gameState.currentBiome, 
      gameState.environment?.season || 'normal',
      gameState.environment?.pressure || 0
    )
    
    // Express traits from genetics
    const geneticTraits = expressCreatureTraits(dna, environmentalFactors)
    
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
      
      // Genetic traits (enhanced for predator role)
      dna: dna,
      size: Math.max(0.6, geneticTraits.size), // Ensure minimum predator size
      speed: Math.max(0.7, geneticTraits.speed), // Ensure minimum predator speed
      energyEfficiency: geneticTraits.energyEfficiency * 0.8, // Predators are less efficient
      maxAge: geneticTraits.lifespan + 20, // Predators live longer
      reproductionThreshold: geneticTraits.reproductionRate + 50, // Need more energy to reproduce
      diet: 'carnivore',
      aggressiveness: Math.max(0.7, geneticTraits.aggression), // High aggression
      intelligence: Math.max(0.6, geneticTraits.intelligence), // Smart hunters
      
      // Calculated from genetics
      age: 0,
      generation: 1,
      parentIds: [], // No parents for spawned creatures
      
      // Predator-specific color (reddish tones)
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

        <div className="control-group">
          <button 
            onClick={() => setShowLineageTracker(true)} 
            className="btn"
            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
            disabled={gameState.population.length === 0}
          >
            View Genetics & Lineage
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
            {gameState.selectedCreature.intelligence && (
              <div className="stat-item">
                <span>Intelligence:</span>
                <span>{(gameState.selectedCreature.intelligence * 100).toFixed(0)}%</span>
              </div>
            )}
            {gameState.selectedCreature.generation && (
              <div className="stat-item">
                <span>Generation:</span>
                <span>{gameState.selectedCreature.generation}</span>
              </div>
            )}
            {gameState.selectedCreature.parentIds && gameState.selectedCreature.parentIds.length > 0 && (
              <div className="stat-item">
                <span>Parents:</span>
                <span>{gameState.selectedCreature.parentIds.length}</span>
              </div>
            )}
            {gameState.selectedCreature.dna && (
              <div className="stat-item" style={{ color: '#8b5cf6' }}>
                <span>Has DNA:</span>
                <span>✓ Genetic</span>
              </div>
            )}
            {gameState.selectedCreature.specialization && (
              <div className="stat-item" style={{ color: '#8b5cf6' }}>
                <span>Specialization:</span>
                <span>{gameState.selectedCreature.specialization.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </div>
            )}
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

      {/* Lineage Tracker Modal */}
      <LineageTracker 
        gameState={gameState}
        isVisible={showLineageTracker}
        onClose={() => setShowLineageTracker(false)}
      />
    </div>
  )
}