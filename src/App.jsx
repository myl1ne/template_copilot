import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import GameUI from './components/GameUI'
import './App.css'

function App() {
  const [gameState, setGameState] = useState({
    isRunning: false,
    population: [],
    speed: 1,
    selectedCreature: null
  })

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
            style={{ background: '#87CEEB' }}
          >
            <Scene gameState={gameState} setGameState={setGameState} />
          </Canvas>
        </div>
        
        <GameUI gameState={gameState} setGameState={setGameState} />
      </main>
    </div>
  )
}

export default App
