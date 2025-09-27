import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Environment from './Environment'
import CreatureManager from './CreatureManager'

export default function Scene({ gameState, setGameState }) {
  const controlsRef = useRef()

  // Game loop - runs every frame
  useFrame((state, delta) => {
    if (gameState.isRunning) {
      // Update game state here
      // This will be expanded as we add more systems
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Environment */}
      <Environment />

      {/* Creatures */}
      <CreatureManager gameState={gameState} setGameState={setGameState} />

      {/* Grid for reference */}
      <Grid
        infiniteGrid
        size={1}
        sectionColor="#4a4a4a"
        sectionThickness={0.5}
        fadeDistance={30}
        fadeStrength={0.5}
      />
    </>
  )
}