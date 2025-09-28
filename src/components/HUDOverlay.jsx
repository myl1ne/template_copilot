import { useState } from 'react'
import { BIOME_TYPES, getBiomeConfig } from './BiomeConfig'
import { generateDNA, expressCreatureTraits, createEnvironmentalFactors } from './GeneticsSystem'
import './HUDOverlay.css'

export default function HUDOverlay({ gameState, setGameState, onShowPanel }) {
  const [showControls, setShowControls] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const biomeConfig = getBiomeConfig(gameState.currentBiome)

  const changeBiome = (newBiome) => {
    setGameState(prev => ({
      ...prev,
      currentBiome: newBiome,
      foodSources: [],
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
    const dna = generateDNA()
    dna.dietPreference.allele1 = 'herbivore'
    dna.dietPreference.allele2 = 'herbivore'
    
    const environmentalFactors = createEnvironmentalFactors(
      gameState.currentBiome, 
      gameState.environment?.season || 'normal',
      gameState.environment?.pressure || 0
    )
    
    const geneticTraits = expressCreatureTraits(dna, environmentalFactors)
    
    function generateHerbivoreColor(traits) {
      let baseHue = 120
      const hueVariation = (traits.size - 0.5) * 30 + (traits.speed - 0.5) * 20
      const finalHue = (baseHue + hueVariation) % 360
      const saturation = Math.min(100, 50 + traits.energyEfficiency * 30)
      const lightness = Math.min(80, 40 + traits.intelligence * 30)
      return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`
    }
    
    const newCreature = {
      id: Date.now(),
      type: 'enhanced',
      position: [
        (Math.random() - 0.5) * 15,
        1,
        (Math.random() - 0.5) * 15
      ],
      velocity: [0, 0, 0],
      energy: 100,
      dna: dna,
      size: geneticTraits.size,
      speed: geneticTraits.speed,
      energyEfficiency: geneticTraits.energyEfficiency,
      maxAge: geneticTraits.lifespan,
      reproductionThreshold: geneticTraits.reproductionRate,
      diet: 'herbivore',
      aggressiveness: geneticTraits.aggression,
      intelligence: geneticTraits.intelligence,
      age: 0,
      generation: 1,
      parentIds: [],
      color: generateHerbivoreColor(geneticTraits)
    }

    setGameState(prev => ({
      ...prev,
      population: [...prev.population, newCreature]
    }))
  }

  const spawnPredator = () => {
    const dna = generateDNA()
    dna.dietPreference.allele1 = 'carnivore'
    dna.dietPreference.allele2 = 'carnivore'
    
    const environmentalFactors = createEnvironmentalFactors(
      gameState.currentBiome, 
      gameState.environment?.season || 'normal',
      gameState.environment?.pressure || 0
    )
    
    const geneticTraits = expressCreatureTraits(dna, environmentalFactors)
    
    const predator = {
      id: Date.now() + Math.random(),
      type: 'enhanced',
      position: [
        (Math.random() - 0.5) * 15,
        1,
        (Math.random() - 0.5) * 15
      ],
      velocity: [0, 0, 0],
      energy: 120,
      dna: dna,
      size: Math.max(0.6, geneticTraits.size),
      speed: Math.max(0.7, geneticTraits.speed),
      energyEfficiency: geneticTraits.energyEfficiency * 0.8,
      maxAge: geneticTraits.lifespan + 20,
      reproductionThreshold: geneticTraits.reproductionRate + 50,
      diet: 'carnivore',
      aggressiveness: Math.max(0.7, geneticTraits.aggression),
      intelligence: Math.max(0.6, geneticTraits.intelligence),
      age: 0,
      generation: 1,
      parentIds: [],
      color: `hsl(${Math.random() * 60}, 80%, 45%)`
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
    <div className="hud-overlay">
      {/* Top Left - Main Controls */}
      <div className="hud-panel top-left">
        <div className="hud-header">
          <h3>🎮 Controls</h3>
          <button 
            className="toggle-btn"
            onClick={() => setShowControls(!showControls)}
          >
            {showControls ? '−' : '+'}
          </button>
        </div>
        
        {showControls && (
          <div className="hud-content">
            <button 
              onClick={toggleSimulation}
              className={`hud-btn primary ${gameState.isRunning ? 'active' : ''}`}
            >
              {gameState.isRunning ? '⏸️ Pause' : '▶️ Start'}
            </button>
            
            <div className="control-row">
              <button onClick={spawnCreature} className="hud-btn success">
                🌱 Herbivore
              </button>
              <button onClick={spawnPredator} className="hud-btn danger">
                🦷 Predator
              </button>
            </div>
            
            <button 
              onClick={clearPopulation} 
              className="hud-btn secondary"
              disabled={gameState.population.length === 0}
            >
              🧹 Clear All
            </button>
          </div>
        )}
      </div>

      {/* Top Right - Environment Controls */}
      <div className="hud-panel top-right">
        <div className="hud-header">
          <h3>🌍 Environment</h3>
        </div>
        
        <div className="hud-content">
          <div className="biome-selector">
            <select 
              value={gameState.currentBiome} 
              onChange={(e) => changeBiome(e.target.value)}
              disabled={gameState.isRunning}
              className="hud-select"
            >
              <option value={BIOME_TYPES.FOREST}>🌲 Forest</option>
              <option value={BIOME_TYPES.DESERT}>🏜️ Desert</option>
              <option value={BIOME_TYPES.OCEAN}>🌊 Ocean</option>
            </select>
          </div>
          
          <div className="environment-tools">
            <button 
              onClick={() => onShowPanel('environmental')} 
              className="hud-btn info"
            >
              🌦️ Weather
            </button>
            <button 
              onClick={() => onShowPanel('terrain')} 
              className="hud-btn info"
            >
              🏔️ Terrain
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Left - Statistics */}
      <div className="hud-panel bottom-left">
        <div className="hud-header">
          <h3>📊 Stats</h3>
          <button 
            className="toggle-btn"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? '−' : '+'}
          </button>
        </div>
        
        {showStats && (
          <div className="hud-content">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Population</span>
                <span className="stat-value">{gameState.population.length}</span>
              </div>
              <div className="stat-item herbivore">
                <span className="stat-label">🌱 Herbivores</span>
                <span className="stat-value">
                  {gameState.population.filter(c => c.diet !== 'carnivore').length}
                </span>
              </div>
              <div className="stat-item predator">
                <span className="stat-label">🦷 Predators</span>
                <span className="stat-value">
                  {gameState.population.filter(c => c.diet === 'carnivore').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🍃 Food</span>
                <span className="stat-value">
                  {gameState.foodSources ? gameState.foodSources.filter(f => f.energy > 0).length : 0}
                </span>
              </div>
            </div>
            
            <div className="status-row">
              <span className="status-item">
                Biome: <strong>{biomeConfig.name}</strong>
              </span>
              <span className={`status-item ${gameState.isRunning ? 'running' : 'paused'}`}>
                {gameState.isRunning ? '🟢 Running' : '🔴 Paused'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right - Advanced Controls */}
      <div className="hud-panel bottom-right">
        <div className="hud-header">
          <h3>🔬 Analysis</h3>
        </div>
        
        <div className="hud-content">
          <button 
            onClick={() => onShowPanel('genetics')} 
            className="hud-btn purple"
            disabled={gameState.population.length === 0}
          >
            🧬 Genetics
          </button>
          <button 
            onClick={() => onShowPanel('analytics')} 
            className="hud-btn blue"
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Selected Creature Info - Floating */}
      {gameState.selectedCreature && (
        <div className="creature-info-panel">
          <div className="creature-header">
            <h4>🔍 Selected Creature</h4>
            <button 
              className="close-btn"
              onClick={() => setGameState(prev => ({ ...prev, selectedCreature: null }))}
            >
              ×
            </button>
          </div>
          
          <div className="creature-details">
            <div className="creature-icon" style={{ backgroundColor: gameState.selectedCreature.color }}>
              {gameState.selectedCreature.diet === 'carnivore' ? '🦷' : '🌱'}
            </div>
            
            <div className="creature-stats">
              <div className="stat-row">
                <span>Energy:</span>
                <span>{Math.round(gameState.selectedCreature.energy)}</span>
              </div>
              <div className="stat-row">
                <span>Age:</span>
                <span>{Math.round(gameState.selectedCreature.age || 0)}s</span>
              </div>
              <div className="stat-row">
                <span>Size:</span>
                <span>{(gameState.selectedCreature.size || 0).toFixed(2)}</span>
              </div>
              <div className="stat-row">
                <span>Speed:</span>
                <span>{(gameState.selectedCreature.speed || 0).toFixed(2)}</span>
              </div>
              
              {gameState.selectedCreature.energy > (gameState.selectedCreature.reproductionThreshold || 150) && (
                <div className="reproduction-ready">
                  ✨ Ready to Reproduce!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}