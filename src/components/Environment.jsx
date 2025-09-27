import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Obstacle({ position, size, color = '#8B4513' }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

function FoodSource({ food, size = 0.3 }) {
  const meshRef = useRef()
  const isAvailable = food.energy > 0

  useFrame((state) => {
    if (meshRef.current && isAvailable) {
      // Gentle bobbing animation for available food sources
      meshRef.current.position.y = food.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
      // Slight glow effect
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1)
    } else if (meshRef.current && !isAvailable) {
      // Respawning food sources are smaller and less visible
      const respawnProgress = Math.max(0, 1 - (food.respawnTime / 10))
      meshRef.current.scale.setScalar(respawnProgress * 0.5)
    }
  })

  const color = isAvailable ? '#4CAF50' : '#666666'
  const emissive = isAvailable ? '#004d00' : '#000000'
  const emissiveIntensity = isAvailable ? 0.2 : 0

  return (
    <mesh ref={meshRef} position={food.position} castShadow>
      <sphereGeometry args={[size, 8, 6]} />
      <meshLambertMaterial 
        color={color} 
        emissive={emissive} 
        emissiveIntensity={emissiveIntensity}
        transparent={!isAvailable}
        opacity={isAvailable ? 1 : 0.3}
      />
    </mesh>
  )
}

export default function Environment({ gameState }) {
  // Generate static obstacles
  const obstacles = []
  for (let i = 0; i < 8; i++) {
    obstacles.push({
      id: i,
      position: [
        (Math.random() - 0.5) * 20,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 20
      ],
      size: [
        0.5 + Math.random() * 2,
        0.5 + Math.random() * 3,
        0.5 + Math.random() * 2
      ]
    })
  }

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#3a5f3a" />
      </mesh>

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          size={obstacle.size}
        />
      ))}

      {/* Dynamic food sources */}
      {gameState.foodSources && gameState.foodSources.map(food => (
        <FoodSource
          key={food.id}
          food={food}
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