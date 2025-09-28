import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Enhanced creature rendering with better materials and visual effects
export default function EnhancedCreature({ creature, onClick, isSelected }) {
  const meshRef = useRef()
  const particlesRef = useRef()
  const glowRef = useRef()
  
  // Enhanced creature geometry based on traits
  const geometry = useMemo(() => {
    const size = creature.size || 0.5
    const intelligence = creature.intelligence || 0.5
    const aggressiveness = creature.aggressiveness || 0.5
    
    if (creature.diet === 'carnivore') {
      // Predators: More angular, aggressive shapes
      return new THREE.ConeGeometry(size * 0.6, size * 1.2, 6 + Math.floor(intelligence * 4))
    } else {
      // Herbivores: Softer, rounded shapes
      return new THREE.SphereGeometry(size * 0.8, 8 + Math.floor(intelligence * 8), 6 + Math.floor(intelligence * 6))
    }
  }, [creature.size, creature.intelligence, creature.diet])

  // Enhanced materials with procedural textures
  const material = useMemo(() => {
    const baseColor = new THREE.Color(creature.color || '#4CAF50')
    const energy = creature.energy || 100
    const maxEnergy = creature.reproductionThreshold || 150
    const energyRatio = Math.min(1, energy / 100)
    
    // Create a gradient based on energy and traits
    const emissiveIntensity = energyRatio * 0.3 + (creature.intelligence || 0) * 0.2
    const metalness = creature.diet === 'carnivore' ? 0.8 : 0.2
    const roughness = creature.diet === 'carnivore' ? 0.1 : 0.6
    
    // Health-based color modulation
    const healthColor = baseColor.clone()
    if (energyRatio < 0.3) {
      healthColor.lerp(new THREE.Color('#ff6b6b'), 0.5) // Red when low energy
    } else if (energy > maxEnergy) {
      healthColor.lerp(new THREE.Color('#ffd700'), 0.3) // Golden when ready to reproduce
    }
    
    return new THREE.MeshStandardMaterial({
      color: healthColor,
      metalness: metalness,
      roughness: roughness,
      emissive: healthColor.clone().multiplyScalar(0.1),
      emissiveIntensity: emissiveIntensity,
      transparent: true,
      opacity: 0.9,
      // Add some variation based on traits
      envMapIntensity: creature.intelligence || 0.5,
    })
  }, [creature.color, creature.energy, creature.diet, creature.intelligence, creature.reproductionThreshold])

  // Particle system for creature effects
  const particleSystem = useMemo(() => {
    if (!creature.energy || creature.energy < 20) return null // No particles when low energy
    
    const particleCount = Math.floor((creature.energy / 100) * 8) + 3 // Reduced particle count
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const baseColor = new THREE.Color(creature.color || '#4CAF50')
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position particles around creature
      positions[i3] = (Math.random() - 0.5) * 1.5
      positions[i3 + 1] = Math.random() * 1.2
      positions[i3 + 2] = (Math.random() - 0.5) * 1.5
      
      // Color variations
      const particleColor = baseColor.clone()
      particleColor.lerp(new THREE.Color('#ffffff'), Math.random() * 0.2)
      colors[i3] = particleColor.r
      colors[i3 + 1] = particleColor.g
      colors[i3 + 2] = particleColor.b
      
      // Size based on creature traits
      sizes[i] = 0.03 + Math.random() * 0.07
    }
    
    return { positions, colors, sizes, count: particleCount }
  }, [creature.energy, creature.color, creature.id]) // Added creature.id to key

  // Animation and effects
  useFrame((state, deltaTime) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const creature_pos = new THREE.Vector3(...creature.position)
      
      // Smooth position interpolation
      meshRef.current.position.lerp(creature_pos, deltaTime * 5)
      
      // Subtle floating animation based on intelligence
      const floatAmount = (creature.intelligence || 0.5) * 0.1
      meshRef.current.position.y += Math.sin(time * 2 + creature.id * 0.01) * floatAmount
      
      // Rotation based on movement and aggressiveness
      if (creature.velocity) {
        const velocity = new THREE.Vector3(...creature.velocity)
        if (velocity.length() > 0.01) {
          meshRef.current.lookAt(
            meshRef.current.position.x + velocity.x,
            meshRef.current.position.y,
            meshRef.current.position.z + velocity.z
          )
        }
      }
      
      // Breathing/pulsing animation
      const breathingScale = 1 + Math.sin(time * 3 + creature.id * 0.05) * 0.05
      meshRef.current.scale.setScalar(breathingScale)
      
      // Energy-based glow effect
      if (glowRef.current) {
        const energyRatio = Math.min(1, creature.energy / 100)
        glowRef.current.material.opacity = energyRatio * 0.3
        glowRef.current.scale.setScalar(1 + energyRatio * 0.5)
      }
    }
    
    // Animate particles
    if (particlesRef.current && particleSystem) {
      const geometry = particlesRef.current.geometry
      if (geometry && geometry.attributes.position) {
        const positions = geometry.attributes.position.array
        const time = state.clock.elapsedTime
        
        // Only update if the array size matches
        if (positions.length === particleSystem.count * 3) {
          for (let i = 0; i < particleSystem.count; i++) {
            const i3 = i * 3
            
            // Orbital movement around creature
            const angle = time * 0.3 + i * 0.4
            const radius = 0.4 + Math.sin(time + i) * 0.2
            
            positions[i3] = Math.cos(angle) * radius
            positions[i3 + 1] = Math.sin(time * 1.5 + i) * 0.2 + 0.4
            positions[i3 + 2] = Math.sin(angle) * radius
          }
          
          geometry.attributes.position.needsUpdate = true
        }
      }
    }
  })

  // Selection glow effect
  const selectionGlow = isSelected ? (
    <mesh ref={glowRef} position={creature.position}>
      <sphereGeometry args={[(creature.size || 0.5) * 1.5, 16, 16]} />
      <meshBasicMaterial
        color="#4CAF50"
        transparent
        opacity={0.2}
        side={THREE.BackSide}
      />
    </mesh>
  ) : null

  return (
    <group>
      {/* Main creature mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={creature.position}
        onClick={(e) => {
          e.stopPropagation()
          onClick && onClick(creature)
        }}
        castShadow
        receiveShadow
      />
      
      {/* Particle effects */}
      {particleSystem && (
        <points ref={particlesRef} position={creature.position}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleSystem.count}
              array={particleSystem.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleSystem.count}
              array={particleSystem.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={particleSystem.count}
              array={particleSystem.sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            transparent
            opacity={0.6}
            vertexColors
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Selection glow */}
      {selectionGlow}
      
      {/* Special effects for reproduction ready */}
      {creature.energy > (creature.reproductionThreshold || 150) && (
        <mesh position={creature.position}>
          <ringGeometry args={[(creature.size || 0.5) * 1.2, (creature.size || 0.5) * 1.5, 16]} />
          <meshBasicMaterial
            color="#ffd700"
            transparent
            opacity={0.4 + Math.sin(Date.now() * 0.005) * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Diet indicator above creature */}
      <mesh position={[creature.position[0], creature.position[1] + (creature.size || 0.5) + 0.3, creature.position[2]]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        >
          <primitive
            attach="map"
            object={createDietIcon(creature.diet)}
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  )
}

// Create diet icon texture
function createDietIcon(diet) {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  
  // Clear canvas
  ctx.clearRect(0, 0, 32, 32)
  
  // Set font
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Draw icon based on diet
  if (diet === 'carnivore') {
    ctx.fillText('🦷', 16, 16)
  } else {
    ctx.fillText('🌱', 16, 16)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}