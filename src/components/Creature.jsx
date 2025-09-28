import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CreatureGeometry({ type, size, isLowDetail = false }) {
  // Use lower poly versions when there are many creatures for performance
  const segments = isLowDetail ? 6 : 16
  const radialSegments = isLowDetail ? 6 : 12
  
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

      // Enhanced floating animation with variation based on creature type
      const baseY = creature.position[1]
      const floatVariation = creature.type === 'sphere' ? 0.08 : 
                           creature.type === 'cube' ? 0.04 : 0.06
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 3 + creature.id * 0.1) * floatVariation

      // Rotate creature based on movement direction with smooth interpolation
      if (creature.direction) {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y, 
          creature.direction, 
          0.1
        )
      }

      // Enhanced scale based on size and energy with breathing effect
      const energyScale = Math.max(0.5, creature.energy / 100)
      const breathingEffect = 1 + Math.sin(state.clock.elapsedTime * 2 + creature.id) * 0.03
      const scale = creature.size * energyScale * breathingEffect
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  // Enhanced creature color calculation
  const getCreatureColor = () => {
    let baseColor = new THREE.Color(creature.color)
    
    // Predators get reddish tint with intensity based on aggressiveness
    if (creature.diet === 'carnivore') {
      const aggressionIntensity = (creature.aggressiveness || 0.5) * 0.4
      baseColor = baseColor.lerp(new THREE.Color('#ff4444'), 0.2 + aggressionIntensity)
    }
    
    const energyRatio = creature.energy / 100
    
    // Enhanced energy-based coloring
    if (energyRatio < 0.3) {
      // Low energy - darken and add slight red tint
      return baseColor.multiplyScalar(0.4 + energyRatio * 0.6).lerp(new THREE.Color('#660000'), 0.2)
    } else if (energyRatio > 0.8) {
      // High energy - brighten slightly
      return baseColor.multiplyScalar(1.1)
    }
    
    return baseColor
  }

  // Enhanced selection and hover effects
  const getEmissiveColor = () => {
    if (isSelected) return '#ffffff'
    if (hovered) return '#ffff88'
    if (creature.energy > 150) return '#00ff00' // High energy glow
    return '#000000'
  }

  const getEmissiveIntensity = () => {
    if (isSelected) return 0.4
    if (hovered) return 0.15
    if (creature.energy > 150) return 0.1
    return 0
  }

  // Enhanced material properties
  const getMaterialProps = () => {
    const baseProps = {
      color: getCreatureColor(),
      emissive: getEmissiveColor(),
      emissiveIntensity: getEmissiveIntensity(),
      transparent: creature.energy < 20,
      opacity: creature.energy < 20 ? 0.7 : 1
    }

    // Different material properties based on creature type
    switch (creature.type) {
      case 'cube':
        return {
          ...baseProps,
          roughness: 0.6,
          metalness: 0.2,
          clearcoat: 0.3
        }
      case 'cylinder':
        return {
          ...baseProps,
          roughness: 0.4,
          metalness: 0.4,
          clearcoat: 0.1
        }
      case 'sphere':
      default:
        return {
          ...baseProps,
          roughness: 0.3,
          metalness: 0.1,
          clearcoat: 0.5,
          clearcoatRoughness: 0.2
        }
    }
  }

  return (
    <group>
      {/* Main creature mesh */}
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
        <meshStandardMaterial {...getMaterialProps()} />
      </mesh>

      {/* Enhanced energy indicator */}
      {creature.energy < 50 && (
        <mesh position={[creature.position[0], creature.position[1] + creature.size * 0.9, creature.position[2]]}>
          <planeGeometry args={[0.8, 0.12]} />
          <meshBasicMaterial 
            color={creature.energy > 25 ? '#ffaa00' : '#ff4444'}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Selection ring effect */}
      {isSelected && (
        <mesh position={[creature.position[0], creature.position[1] - 0.1, creature.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[creature.size * 0.8, creature.size * 1.0, 16]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Aura effect for high-energy creatures */}
      {creature.energy > 120 && (
        <mesh position={[creature.position[0], creature.position[1], creature.position[2]]}>
          <sphereGeometry args={[creature.size * 0.7, 8, 6]} />
          <meshBasicMaterial 
            color={creature.diet === 'carnivore' ? '#ff6666' : '#66ff66'}
            transparent 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Diet indicator particles */}
      {creature.diet === 'carnivore' && (
        <points position={[creature.position[0], creature.position[1] + creature.size * 0.6, creature.position[2]]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={8}
              array={new Float32Array(Array.from({ length: 24 }, () => (Math.random() - 0.5) * 0.3))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.03} color="#ff4444" transparent opacity={0.8} />
        </points>
      )}
    </group>
  )
}