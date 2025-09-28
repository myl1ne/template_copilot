import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'

function Obstacle({ position, size, color, type = 'rock' }) {
  const meshRef = useRef()

  // Add subtle animation to some obstacles
  useFrame((state) => {
    if (meshRef.current && (type === 'seaweed' || type === 'bush')) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
    }
  })

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

  const getMaterial = () => {
    switch (type) {
      case 'tree':
        return (
          <meshStandardMaterial 
            color="#4a5d23" 
            roughness={0.8}
            metalness={0.1}
            emissive="#0a1505"
            emissiveIntensity={0.1}
          />
        )
      case 'cactus':
        return (
          <meshStandardMaterial 
            color="#228B22" 
            roughness={0.6}
            metalness={0.0}
            normalScale={[0.5, 0.5]}
          />
        )
      case 'coral':
        return (
          <meshStandardMaterial 
            color="#FF7F50" 
            roughness={0.3}
            metalness={0.0}
            emissive="#331a0a"
            emissiveIntensity={0.2}
          />
        )
      case 'bush':
        return (
          <meshStandardMaterial 
            color="#556B2F" 
            roughness={0.9}
            metalness={0.0}
            emissive="#0a0f05"
            emissiveIntensity={0.05}
          />
        )
      case 'dune':
        return (
          <meshStandardMaterial 
            color={color || '#DAA520'} 
            roughness={0.95}
            metalness={0.0}
          />
        )
      case 'seaweed':
        return (
          <meshStandardMaterial 
            color="#2E8B57" 
            roughness={0.4}
            metalness={0.0}
            transparent
            opacity={0.8}
            emissive="#051a0f"
            emissiveIntensity={0.1}
          />
        )
      default:
        return (
          <meshStandardMaterial 
            color={color || '#8B4513'} 
            roughness={0.7}
            metalness={0.1}
          />
        )
    }
  }

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {getGeometry()}
      {getMaterial()}
    </mesh>
  )
}

function FoodSource({ food, size = 0.3, biomeType }) {
  const meshRef = useRef()
  const isAvailable = food.energy > 0

  useFrame((state) => {
    if (meshRef.current && isAvailable) {
      // Enhanced bobbing animation for available food sources
      const baseY = food.position[1]
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2 + food.id * 0.5) * 0.15
      // Pulsing glow effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + food.id) * 0.2
      meshRef.current.scale.setScalar(scale)
    } else if (meshRef.current && !isAvailable) {
      // Respawning food sources are smaller and less visible
      const respawnProgress = Math.max(0, 1 - (food.respawnTime / 10))
      meshRef.current.scale.setScalar(respawnProgress * 0.5)
    }
  })

  // Enhanced biome-specific food colors and materials
  const getFoodMaterial = () => {
    if (!isAvailable) {
      return (
        <meshStandardMaterial 
          color="#666666" 
          transparent 
          opacity={0.3}
          roughness={0.8}
        />
      )
    }
    
    switch (biomeType) {
      case BIOME_TYPES.DESERT:
        return (
          <meshStandardMaterial 
            color="#DAA520" 
            emissive="#332200"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        )
      case BIOME_TYPES.OCEAN:
        return (
          <meshStandardMaterial 
            color="#40E0D0" 
            emissive="#003333"
            emissiveIntensity={0.4}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.9}
          />
        )
      case BIOME_TYPES.FOREST:
      default:
        return (
          <meshStandardMaterial 
            color="#4CAF50" 
            emissive="#001100"
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.0}
          />
        )
    }
  }

  return (
    <mesh ref={meshRef} position={food.position} castShadow>
      <sphereGeometry args={[size, 12, 8]} />
      {getFoodMaterial()}
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

  // Enhanced ground material
  const getGroundMaterial = () => {
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
            color={biomeConfig.groundColor}
            roughness={0.1}
            metalness={0.3}
            emissive="#001122"
            emissiveIntensity={0.1}
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
      {/* Enhanced ground plane with biome-specific material */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        {getGroundMaterial()}
      </mesh>

      {/* Enhanced ocean-specific water effects */}
      {biomeType === BIOME_TYPES.OCEAN && (
        <>
          {/* Water surface */}
          <mesh position={[0, 0.2, 0]} receiveShadow>
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
          
          {/* Animated water ripples */}
          <mesh position={[0, 0.25, 0]}>
            <planeGeometry args={[60, 60, 32, 32]} />
            <meshStandardMaterial 
              color="#4dd0e1" 
              transparent 
              opacity={0.2}
              wireframe={true}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Particle effects for desert */}
      {biomeType === BIOME_TYPES.DESERT && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={new Float32Array(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 40))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#d4a574" transparent opacity={0.6} />
        </points>
      )}

      {/* Biome-specific obstacles with enhanced materials */}
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          size={obstacle.size}
          type={obstacle.type}
        />
      ))}

      {/* Enhanced dynamic food sources */}
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