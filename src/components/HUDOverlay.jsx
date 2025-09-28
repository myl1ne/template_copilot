import { useState } from 'react'
import { BIOME_TYPES, getBiomeConfig } from './BiomeConfig'
import { generateDNA, expressCreatureTraits, createEnvironmentalFactors } from './GeneticsSystem'
import './HUDOverlay.css'

export default function HUDOverlay({ gameState, setGameState, onShowPanel }) {
  const [showControls, setShowControls] = useState(true)
  const [showStats, setShowStats] = useState(false) // Hidden by default
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
      {/* Minimal Top Bar - Essential Controls Only */}
      <div className="hud-panel top-center">
        <div className="hud-content-minimal">
          <button 
            onClick={toggleSimulation}
            className={`hud-btn-minimal primary ${gameState.isRunning ? 'active' : ''}`}
          >
            {gameState.isRunning ? '⏸️' : '▶️'}
          </button>
          
          <div className="spawn-controls">
            <button onClick={spawnCreature} className="hud-btn-minimal success">
              🌱
            </button>
            <button onClick={spawnPredator} className="hud-btn-minimal danger">
              🦷
            </button>
          </div>
          
          <select 
            value={gameState.currentBiome} 
            onChange={(e) => changeBiome(e.target.value)}
            disabled={gameState.isRunning}
            className="biome-select-minimal"
          >
            <option value={BIOME_TYPES.FOREST}>🌲</option>
            <option value={BIOME_TYPES.DESERT}>🏜️</option>
            <option value={BIOME_TYPES.OCEAN}>🌊</option>
          </select>
        </div>
      </div>

      {/* Minimal Stats Corner - Only Population */}
      <div className="hud-panel top-right-minimal">
        <div className="stats-minimal">
          <span className="pop-count">{gameState.population.length}</span>
          <button 
            className="stats-toggle"
            onClick={() => setShowStats(!showStats)}
          >
            📊
          </button>
        </div>
      </div>

      {/* Expandable Stats Panel - Hidden by default */}
      {showStats && (
        <div className="hud-panel top-right">
          <div className="hud-header">
            <h3>📊 Stats</h3>
            <button 
              className="toggle-btn"
              onClick={() => setShowStats(false)}
            >
              ×
            </button>
          </div>
          
          <div className="hud-content">
            <div className="stat-grid-compact">
              <div className="stat-item">
                <span className="stat-value">{gameState.population.filter(c => c.diet !== 'carnivore').length}</span>
                <span className="stat-label">🌱</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{gameState.population.filter(c => c.diet === 'carnivore').length}</span>
                <span className="stat-label">🦷</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{gameState.foodSources ? gameState.foodSources.filter(f => f.energy > 0).length : 0}</span>
                <span className="stat-label">🍃</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tools - Minimal */}
      <div className="hud-panel bottom-center-minimal">
        <div className="tool-buttons">
          <button 
            onClick={() => onShowPanel('analytics')} 
            className="tool-btn"
            title="Analytics"
          >
            📈
          </button>
          <button 
            onClick={() => onShowPanel('genetics')} 
            className="tool-btn"
            disabled={gameState.population.length === 0}
            title="Genetics"
          >
            🧬
          </button>
          <button 
            onClick={() => onShowPanel('terrain')} 
            className="tool-btn"
            title="Terrain Editor"
          >
            🏔️
          </button>
        </div>
      </div>

      {/* Selected Creature Info - Only when selected */}
      {gameState.selectedCreature && (
        <div className="creature-info-minimal">
          <div className="creature-icon-minimal" style={{ backgroundColor: gameState.selectedCreature.color }}>
            {gameState.selectedCreature.diet === 'carnivore' ? '🦷' : '🌱'}
          </div>
          <div className="creature-stats-minimal">
            <span>E: {Math.round(gameState.selectedCreature.energy)}</span>
            <span>A: {Math.round(gameState.selectedCreature.age || 0)}s</span>
          </div>
          <button 
            className="close-creature"
            onClick={() => setGameState(prev => ({ ...prev, selectedCreature: null }))}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}