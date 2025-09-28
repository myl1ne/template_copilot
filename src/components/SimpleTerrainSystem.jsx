import { useMemo } from 'react'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

// Enhanced noise function for more natural terrain
function noise(x, z, seed = 0) {
  const random1 = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453
  const random2 = Math.sin(x * 93.9898 + z * 47.233 + seed * 2) * 23421.631
  return (random1 - Math.floor(random1)) * 0.5 + (random2 - Math.floor(random2)) * 0.3
}

// Multi-octave noise for natural terrain
function terrainNoise(x, z, scale, amplitude, octaves, seed = 0) {
  let height = 0
  let freq = scale
  let amp = amplitude
  
  for (let i = 0; i < octaves; i++) {
    height += noise(x * freq, z * freq, seed + i) * amp
    freq *= 2
    amp *= 0.5
  }
  
  return height
}

// Generate river path
function generateRiver(terrainData, size) {
  const riverPath = []
  const riverWidth = 2
  
  // Create a meandering river from one side to the other
  for (let i = 0; i < size; i++) {
    const t = i / size
    const meanderX = Math.sin(t * Math.PI * 3) * 8 + Math.cos(t * Math.PI * 2) * 4
    const riverX = Math.floor(size / 2 + meanderX)
    const riverZ = i
    
    // Carve out river path
    for (let dx = -riverWidth; dx <= riverWidth; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const x = riverX + dx
        const z = riverZ + dz
        if (x >= 0 && x < size && z >= 0 && z < size) {
          const distance = Math.sqrt(dx * dx + dz * dz)
          const depth = Math.max(0, riverWidth - distance) * 0.3
          terrainData[x][z] = Math.min(terrainData[x][z], -depth - 0.5)
          riverPath.push([x - size/2, terrainData[x][z], z - size/2])
        }
      }
    }
  }
  
  return riverPath
}

// Generate ponds
function generatePonds(terrainData, size, count = 3) {
  const ponds = []
  
  for (let p = 0; p < count; p++) {
    const pondX = Math.floor(Math.random() * (size - 10) + 5)
    const pondZ = Math.floor(Math.random() * (size - 10) + 5)
    const pondRadius = 2 + Math.random() * 3
    
    const pond = {
      position: [pondX - size/2, 0, pondZ - size/2],
      radius: pondRadius,
      depth: 0.8 + Math.random() * 0.4
    }
    
    // Carve out pond
    for (let x = Math.floor(pondX - pondRadius); x <= Math.ceil(pondX + pondRadius); x++) {
      for (let z = Math.floor(pondZ - pondRadius); z <= Math.ceil(pondZ + pondRadius); z++) {
        if (x >= 0 && x < size && z >= 0 && z < size) {
          const distance = Math.sqrt((x - pondX) ** 2 + (z - pondZ) ** 2)
          if (distance <= pondRadius) {
            const depthFactor = 1 - (distance / pondRadius)
            terrainData[x][z] = Math.min(terrainData[x][z], -pond.depth * depthFactor)
          }
        }
      }
    }
    
    ponds.push(pond)
  }
  
  return ponds
}

// Water surface component
function WaterSurface({ position, size, type = 'pond' }) {
  const material = type === 'river' ? 
    <meshStandardMaterial
      color="#1976d2"
      transparent
      opacity={0.7}
      roughness={0.1}
      metalness={0.8}
      side={THREE.DoubleSide}
    /> :
    <meshStandardMaterial
      color="#42a5f5"
      transparent
      opacity={0.6}
      roughness={0.1}
      metalness={0.8}
      side={THREE.DoubleSide}
    />
  
  return (
    <mesh position={[position[0], position[1] + 0.1, position[2]]}>
      <circleGeometry args={[size, 16]} />
      {material}
    </mesh>
  )
}

export default function SimpleTerrainSystem({ gameState }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const biomeConfig = getBiomeConfig(biomeType)
  
  // Generate enhanced terrain with features
  const terrainData = useMemo(() => {
    const size = 60
    const segments = 32
    const mapSize = segments
    
    // Initialize height map
    const heightMap = []
    for (let i = 0; i < mapSize; i++) {
      heightMap[i] = []
      for (let j = 0; j < mapSize; j++) {
        const x = (i - mapSize/2) * (size / mapSize)
        const z = (j - mapSize/2) * (size / mapSize)
        
        // Generate base terrain with smoother, more gentle slopes for better creature visibility
        let height = 0
        switch (biomeType) {
          case BIOME_TYPES.DESERT:
            // Much gentler desert terrain - subtle dunes
            height = terrainNoise(x, z, 0.01, 1.5, 2, 42) + terrainNoise(x, z, 0.03, 0.5, 1, 100)
            break
          case BIOME_TYPES.OCEAN:
            // Very smooth ocean floor
            height = terrainNoise(x, z, 0.008, 0.5, 1, 200) - 0.5
            break
          case BIOME_TYPES.FOREST:
          default:
            // Gentle rolling hills instead of sharp terrain
            height = terrainNoise(x, z, 0.015, 2, 2, 0) + terrainNoise(x, z, 0.04, 0.8, 1, 50)
            break
        }
        
        heightMap[i][j] = height
      }
    }
    
    // Generate features based on biome
    let ponds = []
    let riverPath = []
    
    if (biomeType === BIOME_TYPES.FOREST) {
      // Add ponds and river to forest
      ponds = generatePonds(heightMap, mapSize, 2)
      riverPath = generateRiver(heightMap, mapSize)
    } else if (biomeType === BIOME_TYPES.DESERT) {
      // Add small oasis
      ponds = generatePonds(heightMap, mapSize, 1)
    } else if (biomeType === BIOME_TYPES.OCEAN) {
      // Add underwater features
      ponds = generatePonds(heightMap, mapSize, 3)
    }
    
    // Create Three.js geometry
    const geometry = new THREE.PlaneGeometry(size, size, segments - 1, segments - 1)
    const vertices = geometry.attributes.position.array
    
    // Apply height map to vertices
    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      const row = Math.floor(j / segments)
      const col = j % segments
      if (heightMap[row] && heightMap[row][col] !== undefined) {
        vertices[i + 2] = heightMap[row][col] // Z becomes height (Y in world)
      }
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    return {
      geometry,
      heightMap,
      ponds,
      riverPath,
      mapSize,
      worldSize: size
    }
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
        geometry={terrainData.geometry} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        {getTerrainMaterial()}
      </mesh>
      
      {/* Ponds */}
      {terrainData.ponds.map((pond, index) => (
        <WaterSurface
          key={`pond-${index}`}
          position={[pond.position[0], pond.position[1], pond.position[2]]}
          size={pond.radius}
          type="pond"
        />
      ))}
      
      {/* River (for forest biome) */}
      {biomeType === BIOME_TYPES.FOREST && terrainData.riverPath.length > 0 && (
        <mesh position={[0, 0.1, 0]}>
          <planeGeometry args={[60, 2]} />
          <meshStandardMaterial
            color="#1976d2"
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Ocean water overlay */}
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