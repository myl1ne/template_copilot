import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

function Obstacle({ position, size, color, type = 'rock' }) {
  // Different obstacle shapes based on type
  const getGeometry = () => {
    switch (type) {
      case 'tree':
        return <cylinderGeometry args={[size[0] * 0.3, size[0] * 0.5, size[1], 8]} />
      case 'cactus':
        return <cylinderGeometry args={[size[0] * 0.4, size[0] * 0.4, size[1], 6]} />
      case 'coral':
        return <sphereGeometry args={[size[0] * 0.7, 6, 4]} />
      case 'bush':
        return <sphereGeometry args={[size[0] * 0.8, 8, 6]} />
      case 'dune':
        return <sphereGeometry args={[size[0], 4, 6]} />
      case 'seaweed':
        return <cylinderGeometry args={[size[0] * 0.2, size[0] * 0.1, size[1], 4]} />
      default: // rock
        return <boxGeometry args={size} />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'tree':
        return '#4a5d23'
      case 'cactus':
        return '#228B22'
      case 'coral':
        return '#FF7F50'
      case 'bush':
        return '#556B2F'
      case 'dune':
        return color || '#DAA520'
      case 'seaweed':
        return '#2E8B57'
      default:
        return color || '#8B4513'
    }
  }

  return (
    <mesh position={position} castShadow receiveShadow>
      {getGeometry()}
      <meshLambertMaterial color={getColor()} />
    </mesh>
  )
}

function FoodSource({ food, size = 0.3, biomeType }) {
  const meshRef = useRef()
  const isAvailable = food.energy > 0

  useFrame((state) => {
    if (meshRef.current && isAvailable) {
      // Gentle bobbing animation for available food sources
      const baseY = food.position[1]
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2) * 0.1
      // Slight glow effect
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1)
    } else if (meshRef.current && !isAvailable) {
      // Respawning food sources are smaller and less visible
      const respawnProgress = Math.max(0, 1 - (food.respawnTime / 10))
      meshRef.current.scale.setScalar(respawnProgress * 0.5)
    }
  })

  // Biome-specific food colors
  const getFoodColor = () => {
    if (!isAvailable) return '#666666'
    
    switch (biomeType) {
      case BIOME_TYPES.DESERT:
        return '#DAA520' // Golden for desert fruits
      case BIOME_TYPES.OCEAN:
        return '#40E0D0' // Turquoise for plankton
      case BIOME_TYPES.FOREST:
      default:
        return '#4CAF50' // Green for forest berries
    }
  }

  const emissive = isAvailable ? '#002200' : '#000000'
  const emissiveIntensity = isAvailable ? 0.2 : 0

  return (
    <mesh ref={meshRef} position={food.position} castShadow>
      <sphereGeometry args={[size, 8, 6]} />
      <meshLambertMaterial 
        color={getFoodColor()} 
        emissive={emissive} 
        emissiveIntensity={emissiveIntensity}
        transparent={!isAvailable}
        opacity={isAvailable ? 1 : 0.3}
      />
    </mesh>
  )
}

export default function Environment({ gameState }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const biomeConfig = getBiomeConfig(biomeType)

  // Generate biome-specific obstacles
  const obstacles = useMemo(() => {
    const obstacleList = []
    const { obstacleCount, obstacleTypes } = biomeConfig
    
    for (let i = 0; i < obstacleCount; i++) {
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      
      // Seeded random for consistent obstacle placement per biome
      const seed = i + biomeType.charCodeAt(0) * 100
      const random1 = (Math.sin(seed * 0.1) + 1) / 2
      const random2 = (Math.sin(seed * 0.2) + 1) / 2
      const random3 = (Math.sin(seed * 0.3) + 1) / 2
      
      obstacleList.push({
        id: `${biomeType}-${i}`,
        type: obstacleType,
        position: [
          (random1 - 0.5) * 20,
          obstacleType === 'dune' ? 0.5 : (random2 * 2 + 1),
          (random3 - 0.5) * 20
        ],
        size: [
          0.5 + random1 * 2,
          obstacleType === 'tree' ? 2 + random2 * 3 : (0.5 + random2 * 3),
          0.5 + random3 * 2
        ]
      })
    }
    return obstacleList
  }, [biomeType, biomeConfig])

  return (
    <group>
      {/* Ground plane with biome-specific color */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color={biomeConfig.groundColor} />
      </mesh>

      {/* Ocean-specific water effects */}
      {biomeType === BIOME_TYPES.OCEAN && (
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial 
            color="#006994" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Biome-specific obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          size={obstacle.size}
          type={obstacle.type}
        />
      ))}

      {/* Dynamic food sources */}
      {gameState.foodSources && gameState.foodSources.map(food => (
        <FoodSource
          key={food.id}
          food={food}
          biomeType={biomeType}
        />
      ))}

      {/* Boundary walls (invisible collision boxes) */}
      <mesh position={[25, 5, 0]} visible={false}>
        <boxGeometry args={[1, 10, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[-25, 5, 0]} visible={false}>
        <boxGeometry args={[1, 10, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[0, 5, 25]} visible={false}>
        <boxGeometry args={[50, 10, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[0, 5, -25]} visible={false}>
        <boxGeometry args={[50, 10, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}