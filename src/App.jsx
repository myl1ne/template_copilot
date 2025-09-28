import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import HUDOverlay from './components/HUDOverlay'
import LineageTracker from './components/LineageTracker'
import EnvironmentalControls from './components/EnvironmentalControls'
import PopulationAnalytics from './components/PopulationAnalytics'
import TerrainEditor from './components/TerrainEditor'
import { BIOME_TYPES, getBiomeConfig } from './components/BiomeConfig'
import environmentalEventsManager from './components/EnvironmentalEventsManager'
import './App.css'

function App() {
  const [gameState, setGameState] = useState({
    isRunning: false,
    population: [],
    speed: 1,
    selectedCreature: null,
    currentBiome: BIOME_TYPES.FOREST,
    foodSources: [],
    environment: {
      pressure: 0,
      season: 'normal'
    }
  })

  // Panel visibility states
  const [activePanel, setActivePanel] = useState(null)

  const biomeConfig = getBiomeConfig(gameState.currentBiome)

  const showPanel = (panelType) => {
    setActivePanel(panelType)
  }

  const closePanel = () => {
    setActivePanel(null)
  }

  // Environmental Controls handlers
  const handleClimateChange = (newClimateSettings) => {
    environmentalEventsManager.updateClimate(newClimateSettings)
    
    const effects = environmentalEventsManager.getEnvironmentalEffects()
    setGameState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        climateSettings: newClimateSettings,
        effects: effects
      }
    }))
  }

  const handleDisasterTrigger = (disasterConfig) => {
    const disasterId = environmentalEventsManager.triggerDisaster(disasterConfig)
    
    setGameState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        activeDisasters: [...(prev.environment?.activeDisasters || []), disasterId]
      }
    }))
  }

  const handleResourceManipulation = (action) => {
    environmentalEventsManager.manipulateResources(action)
    
    setGameState(prev => {
      let newState = { ...prev }
      
      switch (action.action) {
        case 'add_food':
          const newFoodSources = []
          for (let i = 0; i < action.amount; i++) {
            newFoodSources.push({
              id: `env_food_${Date.now()}_${i}`,
              position: [
                (Math.random() - 0.5) * 20,
                0.5,
                (Math.random() - 0.5) * 20
              ],
              energy: 50 + Math.random() * 30,
              maxEnergy: 80
            })
          }
          newState.foodSources = [...(prev.foodSources || []), ...newFoodSources]
          break
          
        case 'remove_food':
          if (prev.foodSources && prev.foodSources.length > 0) {
            const toRemove = Math.min(action.amount, prev.foodSources.length)
            newState.foodSources = prev.foodSources.slice(toRemove)
          }
          break
          
        case 'add_water':
          newState.environment = {
            ...prev.environment,
            waterBodies: [...(prev.environment?.waterBodies || []), action.area]
          }
          break
          
        default:
          console.log(`Environmental action: ${action.action}`, action)
      }
      
      return newState
    })
  }

  return (
    <div className="app">
      <header className="game-header">
        <h1>Ecosystem Sandbox</h1>
        <p>A 3D Evolution Simulation Game</p>
      </header>
      
      <main className="game-container">
        <div className="scene-container">
          <Canvas
            camera={{ position: [10, 10, 10], fov: 75 }}
            style={{ background: biomeConfig.skyColor }}
          >
            <Scene gameState={gameState} setGameState={setGameState} />
          </Canvas>
          
          {/* HUD Overlay System */}
          <HUDOverlay 
            gameState={gameState} 
            setGameState={setGameState}
            onShowPanel={showPanel}
          />
        </div>
      </main>

      {/* Modal Panels */}
      <LineageTracker 
        gameState={gameState}
        isVisible={activePanel === 'genetics'}
        onClose={closePanel}
      />

      <EnvironmentalControls
        isVisible={activePanel === 'environmental'}
        onClose={closePanel}
        onClimateChange={handleClimateChange}
        onDisasterTrigger={handleDisasterTrigger}
        onResourceManipulation={handleResourceManipulation}
        currentBiome={gameState.currentBiome}
        isSimulationRunning={gameState.isRunning}
      />

      <PopulationAnalytics 
        gameState={gameState}
        isVisible={activePanel === 'analytics'}
        onClose={closePanel}
      />

      <TerrainEditor
        gameState={gameState}
        setGameState={setGameState}
        isVisible={activePanel === 'terrain'}
        onClose={closePanel}
      />
    </div>
  )
}

export default App
