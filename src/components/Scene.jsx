import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Environment from './Environment'
import CreatureManager from './CreatureManager'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

export default function Scene({ gameState, setGameState }) {
  const controlsRef = useRef()
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const biomeConfig = getBiomeConfig(biomeType)

  // Game loop - runs every frame
  useFrame(() => {
    if (gameState.isRunning) {
      // Update game state here
      // This will be expanded as we add more systems
    }
  })

  // Biome-specific fog settings
  const getFogConfig = () => {
    switch (biomeType) {
      case BIOME_TYPES.DESERT:
        return { color: '#d4a574', near: 20, far: 80 }
      case BIOME_TYPES.OCEAN:
        return { color: '#4682b4', near: 15, far: 70 }
      case BIOME_TYPES.FOREST:
      default:
        return { color: '#2d4a2d', near: 25, far: 90 }
    }
  }

  const fogConfig = getFogConfig()

  return (
    <Suspense fallback={null}>
      {/* Atmospheric fog */}
      <fog 
        attach="fog" 
        color={fogConfig.color}
        near={fogConfig.near}
        far={fogConfig.far}
      />

      {/* Enhanced lighting system */}
      <ambientLight intensity={biomeConfig.ambientLight} color="#e6f3ff" />
      
      {/* Main directional light (sun) */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={biomeConfig.directionalLight}
        color="#fff8e1"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Additional fill lights for better illumination */}
      <pointLight 
        position={[-10, 5, -10]} 
        intensity={0.3} 
        color={biomeType === BIOME_TYPES.OCEAN ? '#4dd0e1' : '#ffcc80'} 
        distance={30}
      />
      
      <spotLight
        position={[5, 15, 5]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.4}
        castShadow
        color={biomeType === BIOME_TYPES.DESERT ? '#ffab40' : '#81c784'}
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
        enableDamping
        dampingFactor={0.05}
      />

      {/* Environment */}
      <Environment gameState={gameState} />

      {/* Creatures */}
      <CreatureManager gameState={gameState} setGameState={setGameState} />

      {/* Enhanced grid with biome-specific styling */}
      <Grid
        infiniteGrid
        size={1}
        sectionColor={biomeType === BIOME_TYPES.OCEAN ? '#2196f3' : 
                     biomeType === BIOME_TYPES.DESERT ? '#ff9800' : '#4caf50'}
        sectionThickness={0.8}
        fadeDistance={40}
        fadeStrength={0.3}
        cellColor="#666666"
        cellThickness={0.3}
      />
    </Suspense>
  )
}