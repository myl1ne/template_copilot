import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig'
import { physicsSystem } from './PhysicsSystem'

// Particle system for rain
function RainParticles({ intensity, isActive }) {
  const particlesRef = useRef()
  const [particles] = useState(() => {
    const count = 100 // Reduced from 200
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 60
      positions[i3 + 1] = Math.random() * 20 + 10
      positions[i3 + 2] = (Math.random() - 0.5) * 60
      
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 1] = -5 - Math.random() * 5
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5
    }
    
    return { positions, velocities, count }
  })
  
  useFrame((state, deltaTime) => {
    if (!particlesRef.current || !isActive) return
    
    const positions = particlesRef.current.geometry.attributes.position.array
    const { velocities, count } = particles
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Update position
      positions[i3] += velocities[i3] * deltaTime
      positions[i3 + 1] += velocities[i3 + 1] * deltaTime * intensity
      positions[i3 + 2] += velocities[i3 + 2] * deltaTime
      
      // Reset particle if it hits ground or goes out of bounds
      if (positions[i3 + 1] < 0 || Math.abs(positions[i3]) > 30 || Math.abs(positions[i3 + 2]) > 30) {
        positions[i3] = (Math.random() - 0.5) * 60
        positions[i3 + 1] = Math.random() * 10 + 15
        positions[i3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#87CEEB"
        transparent
        opacity={isActive ? intensity * 0.8 : 0}
        vertexColors={false}
      />
    </points>
  )
}

// Cloud system
function Clouds({ density, coverage }) {
  const cloudRefs = useRef([])
  const clouds = useMemo(() => {
    const cloudCount = Math.floor(density * 4) // Reduced from 8
    return Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 80,
        15 + Math.random() * 10,
        (Math.random() - 0.5) * 80
      ],
      size: 3 + Math.random() * 4,
      speed: Math.random() * 0.5 + 0.1,
      opacity: coverage * (0.3 + Math.random() * 0.4)
    }))
  }, [density, coverage])
  
  useFrame((state, deltaTime) => {
    cloudRefs.current.forEach((cloudRef, i) => {
      if (cloudRef && clouds[i]) {
        cloudRef.position.x += clouds[i].speed * deltaTime
        if (cloudRef.position.x > 40) {
          cloudRef.position.x = -40
        }
        
        // Subtle floating animation
        cloudRef.position.y += Math.sin(state.clock.elapsedTime * 0.5 + i) * deltaTime * 0.2
      }
    })
  })
  
  return (
    <group>
      {clouds.map((cloud, i) => (
        <mesh
          key={cloud.id}
          ref={el => cloudRefs.current[i] = el}
          position={cloud.position}
        >
          <sphereGeometry args={[cloud.size, 8, 6]} />
          <meshStandardMaterial
            color="#f5f5f5"
            transparent
            opacity={cloud.opacity}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

// River system component
function River({ path, flow }) {
  const riverRef = useRef()
  
  useFrame((state) => {
    if (riverRef.current) {
      const time = state.clock.elapsedTime
      riverRef.current.material.uniforms.time.value = time
    }
  })
  
  const riverGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const uvs = []
    const indices = []
    
    const width = 1
    const segments = path.length - 1
    
    // Create river geometry from path
    path.forEach((point, i) => {
      const [x, y, z] = point
      vertices.push(x - width/2, y, z, x + width/2, y, z)
      uvs.push(0, i / segments, 1, i / segments)
      
      if (i < segments) {
        const base = i * 2
        indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
      }
    })
    
    geometry.setIndex(indices)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.computeVertexNormals()
    
    return geometry
  }, [path])
  
  const riverMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        flow: { value: flow },
        color: { value: new THREE.Color('#1976d2') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float flow;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          uv.y += time * flow * 0.1;
          
          float wave = sin(uv.y * 10.0 + time * 2.0) * 0.1;
          uv.x += wave;
          
          float alpha = 0.7 + sin(uv.y * 5.0 + time) * 0.1;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true
    })
  }, [flow])
  
  return (
    <mesh ref={riverRef} geometry={riverGeometry} material={riverMaterial} />
  )
}

export default function WaterCycleSystem({ gameState, terrainData, onWaterUpdate }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  
  // Water cycle state
  const [weatherState, setWeatherState] = useState({
    humidity: 0.5,
    temperature: 20,
    pressure: 1013,
    windSpeed: 5,
    cloudCoverage: 0.3,
    precipitation: 0,
    season: 'spring'
  })
  
  const [waterSources, setWaterSources] = useState([])
  const [rivers, setRivers] = useState([])
  
  // Initialize water system when terrain data is available
  useEffect(() => {
    if (!terrainData) return
    
    // Set up initial water sources from terrain
    setWaterSources(terrainData.waterSources || [])
    
    // Generate rivers connecting water sources
    const riverPaths = generateRivers(terrainData)
    setRivers(riverPaths)
    
    if (onWaterUpdate) {
      onWaterUpdate({
        sources: terrainData.waterSources || [],
        rivers: riverPaths
      })
    }
  }, [terrainData, onWaterUpdate])
  
  // Water cycle simulation
  useFrame((state, deltaTime) => {
    const time = state.clock.elapsedTime
    
    // Simulate weather patterns
    setWeatherState(prevState => {
      const newState = { ...prevState }
      
      // Seasonal cycle (very slow)
      const seasonCycle = Math.sin(time * 0.001) // Very slow seasonal change
      newState.temperature = 15 + seasonCycle * 10 + Math.sin(time * 0.1) * 3
      
      // Humidity changes with temperature and biome
      const biomeHumidity = biomeType === BIOME_TYPES.OCEAN ? 0.8 : 
                           biomeType === BIOME_TYPES.DESERT ? 0.2 : 0.5
      newState.humidity = biomeHumidity + Math.sin(time * 0.05) * 0.2
      
      // Cloud formation based on humidity and temperature
      const cloudFormation = Math.max(0, (newState.humidity - 0.4) * 2)
      newState.cloudCoverage = Math.min(1, cloudFormation + Math.sin(time * 0.02) * 0.3)
      
      // Precipitation occurs when cloud coverage is high
      if (newState.cloudCoverage > 0.6 && Math.random() < 0.01) {
        newState.precipitation = Math.min(1, newState.cloudCoverage - 0.5)
      } else {
        newState.precipitation *= 0.95 // Gradual decrease
      }
      
      // Wind affects everything
      newState.windSpeed = 3 + Math.sin(time * 0.03) * 4
      
      return newState
    })
    
    // Update water sources based on precipitation and evaporation
    setWaterSources(prevSources => {
      return prevSources.map(source => {
        let newSize = source.size
        let newFlow = source.flow
        
        // Precipitation increases water
        newSize += weatherState.precipitation * deltaTime * 0.1
        newFlow = Math.min(1, source.flow + weatherState.precipitation * deltaTime * 0.05)
        
        // Evaporation decreases water
        const evaporationRate = (weatherState.temperature - 10) * 0.001
        newSize = Math.max(0.1, newSize - evaporationRate * deltaTime)
        newFlow = Math.max(0.1, newFlow - evaporationRate * deltaTime * 0.5)
        
        return {
          ...source,
          size: newSize,
          flow: newFlow
        }
      })
    })
  })
  
  return (
    <group>
      {/* Clouds */}
      <Clouds 
        density={weatherState.cloudCoverage} 
        coverage={weatherState.cloudCoverage}
      />
      
      {/* Rain particles */}
      <RainParticles 
        intensity={weatherState.precipitation}
        isActive={weatherState.precipitation > 0.1}
      />
      
      {/* Rivers */}
      {rivers.map((river, i) => (
        <River
          key={`river-${i}`}
          path={river.path}
          flow={river.flow}
        />
      ))}
      
      {/* Enhanced water sources with dynamic sizing */}
      {waterSources.map(source => (
        <mesh key={source.id} position={source.position}>
          <circleGeometry args={[source.size, 16]} />
          <meshStandardMaterial
            color={source.type === 'lake' ? '#1976d2' : '#42a5f5'}
            transparent
            opacity={0.6 + source.flow * 0.2}
            roughness={0.1}
            metalness={0.8}
            emissive="#001122"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Fog effects in humid conditions */}
      {weatherState.humidity > 0.7 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={new Float32Array(Array.from({ length: 150 }, () => (Math.random() - 0.5) * 60))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={2}
            color="#f0f8ff"
            transparent
            opacity={weatherState.humidity - 0.6}
          />
        </points>
      )}
    </group>
  )
}

// Generate river paths connecting water sources
function generateRivers(terrainData) {
  if (!terrainData.waterSources || terrainData.waterSources.length < 2) return []
  
  const rivers = []
  const sources = terrainData.waterSources
  
  // Create rivers between nearby water sources
  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const source1 = sources[i]
      const source2 = sources[j]
      
      const distance = Math.sqrt(
        Math.pow(source1.position[0] - source2.position[0], 2) +
        Math.pow(source1.position[2] - source2.position[2], 2)
      )
      
      // Only create rivers between nearby sources
      if (distance < 15) {
        const riverPath = generateRiverPath(source1.position, source2.position)
        if (riverPath.length > 0) {
          rivers.push({
            path: riverPath,
            flow: (source1.flow + source2.flow) / 2
          })
        }
      }
    }
  }
  
  return rivers
}

// Generate curved river path between two points
function generateRiverPath(start, end) {
  const path = []
  const segments = 10
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    
    // Linear interpolation with some randomness for natural curves
    const x = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * 2
    const z = start[2] + (end[2] - start[2]) * t + (Math.random() - 0.5) * 2
    const y = physicsSystem.getTerrainHeightAt(x, z) + 0.1
    
    path.push([x, y, z])
  }
  
  return path
}