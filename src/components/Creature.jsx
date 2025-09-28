import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CreatureGeometry({ type, size, isLowDetail = false }) {
  // Use lower poly versions when there are many creatures for performance
  const segments = isLowDetail ? 6 : 12
  const radialSegments = isLowDetail ? 6 : 8
  
  switch (type) {
    case 'cube':
      return <boxGeometry args={[size, size, size]} />
    case 'cylinder':
      return <cylinderGeometry args={[size * 0.5, size * 0.5, size, radialSegments]} />
    case 'sphere':
    default:
      return <sphereGeometry args={[size * 0.5, segments, radialSegments]} />
  }
}

export default function Creature({ creature, isSelected, onClick, populationSize = 1 }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Use low detail when population is large for performance
  const isLowDetail = populationSize > 30

  useFrame((state) => {
    if (meshRef.current) {
      // Update position
      meshRef.current.position.set(
        creature.position[0],
        creature.position[1],
        creature.position[2]
      )

      // Add subtle floating animation
      const baseY = creature.position[1]
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 3 + creature.id * 0.1) * 0.05

      // Rotate creature based on movement direction
      if (creature.direction) {
        meshRef.current.rotation.y = creature.direction
      }

      // Scale based on size and energy
      const energyScale = Math.max(0.5, creature.energy / 100)
      const scale = creature.size * energyScale
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  // Calculate creature color based on energy, base color, and diet
  const getCreatureColor = () => {
    let baseColor = new THREE.Color(creature.color)
    
    // Predators get reddish tint
    if (creature.diet === 'carnivore') {
      baseColor = baseColor.lerp(new THREE.Color('#ff4444'), 0.3)
    }
    
    const energyRatio = creature.energy / 100
    
    // Darken when low energy
    if (energyRatio < 0.3) {
      return baseColor.multiplyScalar(0.5 + energyRatio * 0.5)
    }
    
    return baseColor
  }

  // Selection highlight color
  const getEmissiveColor = () => {
    if (isSelected) return '#ffffff'
    if (hovered) return '#ffff88'
    return '#000000'
  }

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      castShadow
      receiveShadow
    >
      <CreatureGeometry type={creature.type} size={creature.size} isLowDetail={isLowDetail} />
      <meshPhongMaterial
        color={getCreatureColor()}
        emissive={getEmissiveColor()}
        emissiveIntensity={isSelected ? 0.3 : (hovered ? 0.1 : 0)}
        shininess={30}
        transparent={creature.energy < 20}
        opacity={creature.energy < 20 ? 0.7 : 1}
      />
      
      {/* Energy indicator */}
      {creature.energy < 50 && (
        <mesh position={[0, creature.size * 0.8, 0]}>
          <planeGeometry args={[0.6, 0.1]} />
          <meshBasicMaterial 
            color={creature.energy > 25 ? '#ffaa00' : '#ff4444'}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </mesh>
  )
}