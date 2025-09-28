import { useMemo } from 'react'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

// Simple noise function for terrain generation
function simpleNoise(x, z) {
  return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1
}

export default function SimpleTerrainSystem({ gameState }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const biomeConfig = getBiomeConfig(biomeType)
  
  // Generate simple terrain geometry
  const terrainGeometry = useMemo(() => {
    const size = 60
    const segments = 32
    const geometry = new THREE.PlaneGeometry(size, size, segments - 1, segments - 1)
    const vertices = geometry.attributes.position.array
    
    // Apply height variations
    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      const x = vertices[i]
      const z = vertices[i + 1]
      
      // Simple height based on biome
      let height = 0
      switch (biomeType) {
        case BIOME_TYPES.DESERT:
          height = simpleNoise(x, z) * 1.5
          break
        case BIOME_TYPES.OCEAN:
          height = simpleNoise(x, z) * 0.5 - 1
          break
        case BIOME_TYPES.FOREST:
        default:
          height = simpleNoise(x, z) * 2
          break
      }
      
      vertices[i + 2] = height // Z becomes height (Y in world)
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [biomeType])
  
  // Get terrain material based on biome
  const getTerrainMaterial = () => {
    switch (biomeType) {
      case BIOME_TYPES.DESERT:
        return (
          <meshStandardMaterial
            color={biomeConfig.groundColor}
            roughness={0.9}
            metalness={0.0}
          />
        )
      case BIOME_TYPES.OCEAN:
        return (
          <meshStandardMaterial
            color="#4a4a2a"
            roughness={0.8}
            metalness={0.1}
          />
        )
      case BIOME_TYPES.FOREST:
      default:
        return (
          <meshStandardMaterial
            color={biomeConfig.groundColor}
            roughness={0.8}
            metalness={0.0}
          />
        )
    }
  }
  
  return (
    <group>
      {/* Main terrain mesh */}
      <mesh 
        geometry={terrainGeometry} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        {getTerrainMaterial()}
      </mesh>
      
      {/* Simple water for ocean biome */}
      {biomeType === BIOME_TYPES.OCEAN && (
        <mesh position={[0, 0.5, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color="#006994"
            transparent
            opacity={0.6}
            roughness={0.0}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}