import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

// Noise function for terrain generation
function noise(x, z, seed = 0) {
  const random1 = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453
  const random2 = Math.sin(x * 93.9898 + z * 47.233 + seed * 2) * 23421.631
  return (random1 - Math.floor(random1)) * 0.5 + (random2 - Math.floor(random2)) * 0.3
}

// Generate height map for terrain
function generateHeightMap(size, biomeType, seed = 0) {
  const heights = []
  
  // Simpler terrain generation to avoid performance issues
  let scale, amplitude
  switch (biomeType) {
    case BIOME_TYPES.DESERT:
      scale = 0.2
      amplitude = 2
      break
    case BIOME_TYPES.OCEAN:
      scale = 0.1
      amplitude = 0.5
      break
    case BIOME_TYPES.FOREST:
    default:
      scale = 0.15
      amplitude = 3
      break
  }
  
  for (let i = 0; i < size; i++) {
    heights[i] = []
    for (let j = 0; j < size; j++) {
      // Simplified single octave noise
      let height = noise(i * scale, j * scale, seed) * amplitude
      
      // Clamp height values
      heights[i][j] = Math.max(-1, Math.min(4, height))
    }
  }
  
  return heights
}

// Create physics collision mesh from height map
function createTerrainGeometry(heightMap, size, segments) {
  const geometry = new THREE.PlaneGeometry(size, size, segments - 1, segments - 1)
  const vertices = geometry.attributes.position.array
  
  // Apply height map to vertices
  for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
    const row = Math.floor(j / segments)
    const col = j % segments
    if (heightMap[row] && heightMap[row][col] !== undefined) {
      vertices[i + 2] = heightMap[row][col] // Z coordinate becomes height (Y in 3D)
    }
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

// Generate water sources based on terrain
function generateWaterSources(heightMap, biomeType, terrainSize) {
  const waterSources = []
  const size = heightMap.length
  const scale = terrainSize / size
  
  // Find low-lying areas for water placement
  for (let i = 2; i < size - 2; i += 4) {
    for (let j = 2; j < size - 2; j += 4) {
      const height = heightMap[i][j]
      const neighbors = [
        heightMap[i-1][j], heightMap[i+1][j],
        heightMap[i][j-1], heightMap[i][j+1]
      ]
      const avgNeighborHeight = neighbors.reduce((a, b) => a + b, 0) / 4
      
      // Place water in depressions
      if (height < avgNeighborHeight - 0.5 && height < 1) {
        const worldX = (i - size/2) * scale
        const worldZ = (j - size/2) * scale
        
        waterSources.push({
          id: `water-${i}-${j}`,
          position: [worldX, height + 0.1, worldZ],
          size: Math.random() * 2 + 1,
          flow: Math.random() * 0.5 + 0.1,
          type: height < -0.5 ? 'lake' : 'spring'
        })
      }
    }
  }
  
  return waterSources
}

function WaterSource({ source }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animate water surface
      meshRef.current.rotation.z += 0.005
      const time = state.clock.elapsedTime
      meshRef.current.material.opacity = 0.6 + Math.sin(time * 2) * 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} position={source.position}>
      <circleGeometry args={[source.size, 16]} />
      <meshStandardMaterial
        color={source.type === 'lake' ? '#1976d2' : '#42a5f5'}
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.8}
        emissive="#001122"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

export default function TerrainSystem({ gameState, onTerrainData }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const biomeConfig = getBiomeConfig(biomeType)
  
  // Generate terrain data
  const terrainData = useMemo(() => {
    const segments = 32 // Reduced from 64 for better performance
    const terrainSize = 60
    const seed = biomeType.charCodeAt(0) * 100
    
    // Generate height map
    const heightMap = generateHeightMap(segments, biomeType, seed)
    
    // Create geometry
    const geometry = createTerrainGeometry(heightMap, terrainSize, segments)
    
    // Generate water sources
    const waterSources = generateWaterSources(heightMap, biomeType, terrainSize)
    
    const data = {
      geometry,
      heightMap,
      waterSources,
      terrainSize,
      biomeType
    }
    
    // Pass terrain data to parent for physics calculations
    if (onTerrainData) {
      onTerrainData(data)
    }
    
    return data
  }, [biomeType, onTerrainData])
  
  // Get terrain material based on biome
  const getTerrainMaterial = () => {
    switch (biomeType) {
      case BIOME_TYPES.DESERT:
        return (
          <meshStandardMaterial
            color={biomeConfig.groundColor}
            roughness={0.9}
            metalness={0.0}
            emissive="#1a1100"
            emissiveIntensity={0.05}
          />
        )
      case BIOME_TYPES.OCEAN:
        return (
          <meshStandardMaterial
            color="#4a4a2a"
            roughness={0.8}
            metalness={0.1}
            emissive="#0a0a05"
            emissiveIntensity={0.05}
          />
        )
      case BIOME_TYPES.FOREST:
      default:
        return (
          <meshStandardMaterial
            color={biomeConfig.groundColor}
            roughness={0.8}
            metalness={0.0}
            emissive="#050a05"
            emissiveIntensity={0.05}
          />
        )
    }
  }
  
  return (
    <group>
      {/* Main terrain mesh */}
      <mesh 
        geometry={terrainData.geometry} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        {getTerrainMaterial()}
      </mesh>
      
      {/* Water sources */}
      {terrainData.waterSources.map(source => (
        <WaterSource key={source.id} source={source} />
      ))}
      
      {/* Ocean-specific water overlay */}
      {biomeType === BIOME_TYPES.OCEAN && (
        <mesh position={[0, 1, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color="#006994"
            transparent
            opacity={0.4}
            roughness={0.0}
            metalness={0.8}
            side={THREE.DoubleSide}
            emissive="#001133"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
    </group>
  )
}