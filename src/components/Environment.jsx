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

function FoodSource({ position, size = 0.3, color = '#4CAF50' }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation for food sources
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[size, 8, 6]} />
      <meshLambertMaterial color={color} emissive="#004d00" emissiveIntensity={0.1} />
    </mesh>
  )
}

export default function Environment() {
  // Generate random obstacles
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

  // Generate random food sources
  const foodSources = []
  for (let i = 0; i < 15; i++) {
    foodSources.push({
      id: i,
      position: [
        (Math.random() - 0.5) * 25,
        0.3,
        (Math.random() - 0.5) * 25
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

      {/* Food sources */}
      {foodSources.map(food => (
        <FoodSource
          key={food.id}
          position={food.position}
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