import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BIOME_TYPES } from './BiomeConfig'
import { physicsSystem } from './PhysicsSystem'

// Plant types with different characteristics
const PLANT_TYPES = {
  GRASS: {
    name: 'Grass',
    growthRate: 0.8,
    maxSize: 0.3,
    waterNeed: 0.3,
    sunNeed: 0.4,
    reproductionRate: 0.9,
    lifespan: 100,
    color: '#4CAF50'
  },
  SHRUB: {
    name: 'Shrub',
    growthRate: 0.4,
    maxSize: 1.2,
    waterNeed: 0.5,
    sunNeed: 0.6,
    reproductionRate: 0.3,
    lifespan: 300,
    color: '#388E3C'
  },
  TREE: {
    name: 'Tree',
    growthRate: 0.1,
    maxSize: 3.5,
    waterNeed: 0.7,
    sunNeed: 0.8,
    reproductionRate: 0.1,
    lifespan: 800,
    color: '#2E7D32'
  },
  FLOWER: {
    name: 'Flower',
    growthRate: 0.6,
    maxSize: 0.8,
    waterNeed: 0.6,
    sunNeed: 0.9,
    reproductionRate: 0.7,
    lifespan: 80,
    color: '#E91E63'
  },
  CACTUS: {
    name: 'Cactus',
    growthRate: 0.05,
    maxSize: 2.0,
    waterNeed: 0.1,
    sunNeed: 0.9,
    reproductionRate: 0.05,
    lifespan: 600,
    color: '#689F38'
  },
  SEAWEED: {
    name: 'Seaweed',
    growthRate: 0.7,
    maxSize: 2.5,
    waterNeed: 1.0,
    sunNeed: 0.3,
    reproductionRate: 0.6,
    lifespan: 150,
    color: '#00695C'
  }
}

// Get suitable plant types for biome
function getBiomePlantTypes(biomeType) {
  switch (biomeType) {
    case BIOME_TYPES.DESERT:
      return [PLANT_TYPES.CACTUS, PLANT_TYPES.SHRUB]
    case BIOME_TYPES.OCEAN:
      return [PLANT_TYPES.SEAWEED, PLANT_TYPES.GRASS]
    case BIOME_TYPES.FOREST:
    default:
      return [PLANT_TYPES.GRASS, PLANT_TYPES.SHRUB, PLANT_TYPES.TREE, PLANT_TYPES.FLOWER]
  }
}

// Individual plant component
function Plant({ plant, onUpdate, terrainData, biomeType }) {
  const meshRef = useRef()
  const [health, setHealth] = useState(plant.health || 100)
  
  useFrame((state, deltaTime) => {
    if (!meshRef.current || !terrainData) return
    
    const pos = plant.position
    const plantType = plant.type
    
    // Calculate environmental factors
    const terrainHeight = physicsSystem.getTerrainHeightAt(pos[0], pos[2])
    const waterAccess = calculateWaterAccess(pos, terrainData.waterSources)
    const sunAccess = calculateSunAccess(pos, plant.size, state.clock.elapsedTime)
    const soilQuality = calculateSoilQuality(pos, terrainHeight, biomeType)
    
    // Growth calculations
    const waterFactor = Math.min(1, waterAccess / plantType.waterNeed)
    const sunFactor = Math.min(1, sunAccess / plantType.sunNeed)
    const growthCondition = (waterFactor + sunFactor + soilQuality) / 3
    
    // Update plant properties
    if (growthCondition > 0.3 && plant.size < plantType.maxSize) {
      plant.size += plantType.growthRate * growthCondition * deltaTime * 0.1
      plant.size = Math.min(plant.size, plantType.maxSize)
    }
    
    // Health changes
    let healthChange = (growthCondition - 0.5) * deltaTime * 5
    if (waterAccess < plantType.waterNeed * 0.3) healthChange -= deltaTime * 10 // Drought stress
    if (sunAccess < plantType.sunNeed * 0.2) healthChange -= deltaTime * 5 // Light stress
    
    const newHealth = Math.max(0, Math.min(100, health + healthChange))
    setHealth(newHealth)
    plant.health = newHealth
    
    // Age the plant
    plant.age = (plant.age || 0) + deltaTime
    
    // Reproduction
    if (plant.age > 20 && plant.health > 70 && Math.random() < plantType.reproductionRate * deltaTime * 0.01) {
      onUpdate('reproduce', plant)
    }
    
    // Death
    if (plant.health <= 0 || plant.age > plantType.lifespan) {
      onUpdate('death', plant)
    }
    
    // Visual updates
    meshRef.current.scale.setScalar(plant.size)
    
    // Animation based on plant type
    if (plantType === PLANT_TYPES.SEAWEED || plantType === PLANT_TYPES.GRASS) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + plant.id * 0.5) * 0.1
    }
    
    // Health-based color changes
    const healthFactor = plant.health / 100
    const material = meshRef.current.material
    if (material) {
      const baseColor = new THREE.Color(plantType.color)
      const brownish = new THREE.Color('#8B4513')
      material.color = baseColor.clone().lerp(brownish, 1 - healthFactor)
      material.emissiveIntensity = healthFactor * 0.1
    }
  })
  
  const getPlantGeometry = () => {
    switch (plant.type) {
      case PLANT_TYPES.TREE:
        return <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
      case PLANT_TYPES.CACTUS:
        return <cylinderGeometry args={[0.2, 0.2, 1, 6]} />
      case PLANT_TYPES.SEAWEED:
        return <cylinderGeometry args={[0.05, 0.02, 1, 4]} />
      case PLANT_TYPES.FLOWER:
        return <sphereGeometry args={[0.3, 8, 6]} />
      case PLANT_TYPES.SHRUB:
        return <sphereGeometry args={[0.4, 8, 6]} />
      default: // GRASS
        return <coneGeometry args={[0.1, 0.5, 4]} />
    }
  }
  
  return (
    <mesh
      ref={meshRef}
      position={[plant.position[0], plant.position[1], plant.position[2]]}
      castShadow
      receiveShadow
    >
      {getPlantGeometry()}
      <meshStandardMaterial
        color={plant.type.color}
        roughness={0.8}
        metalness={0.0}
        emissive={plant.type.color}
        emissiveIntensity={0.05}
      />
    </mesh>
  )
}

// Calculate water access for a plant
function calculateWaterAccess(position, waterSources) {
  let maxAccess = 0
  
  for (const water of waterSources) {
    const distance = Math.sqrt(
      Math.pow(position[0] - water.position[0], 2) +
      Math.pow(position[2] - water.position[2], 2)
    )
    
    // Water access decreases with distance
    const access = Math.max(0, (water.size * 3 - distance) / (water.size * 3))
    maxAccess = Math.max(maxAccess, access * water.flow)
  }
  
  return Math.min(1, maxAccess)
}

// Calculate sun access (simple implementation)
function calculateSunAccess(position, plantSize, time) {
  // Simulate day/night cycle and seasonal variations
  const dayFactor = (Math.sin(time * 0.1) + 1) / 2 // Day/night
  const seasonFactor = (Math.sin(time * 0.01) + 1) / 2 * 0.3 + 0.7 // Seasonal variation
  
  // Height gives advantage for sun access
  const heightBonus = Math.min(0.3, plantSize * 0.1)
  
  return (dayFactor * seasonFactor + heightBonus) * 0.8 + 0.2
}

// Calculate soil quality based on terrain
function calculateSoilQuality(position, terrainHeight, biomeType) {
  // Different soil quality per biome
  let baseSoilQuality
  switch (biomeType) {
    case BIOME_TYPES.FOREST:
      baseSoilQuality = 0.8
      break
    case BIOME_TYPES.DESERT:
      baseSoilQuality = 0.3
      break
    case BIOME_TYPES.OCEAN:
      baseSoilQuality = 0.6
      break
    default:
      baseSoilQuality = 0.5
  }
  
  // Lower areas tend to have better soil
  const heightFactor = Math.max(0.3, 1 - terrainHeight * 0.1)
  
  return baseSoilQuality * heightFactor
}

export default function PlantSystem({ gameState, terrainData, onPlantsUpdate }) {
  const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
  const [plants, setPlants] = useState([])
  
  // Initialize plants when terrain data changes
  useEffect(() => {
    if (!terrainData) return
    
    const suitablePlantTypes = getBiomePlantTypes(biomeType)
    const initialPlants = []
    const plantCount = biomeType === BIOME_TYPES.DESERT ? 10 : 25 // Reduced count
    
    for (let i = 0; i < plantCount; i++) {
      const position = physicsSystem.getSafeSpawnPosition()
      const plantType = suitablePlantTypes[Math.floor(Math.random() * suitablePlantTypes.length)]
      
      initialPlants.push({
        id: `plant-${i}`,
        type: plantType,
        position: position,
        size: Math.random() * 0.5 + 0.1,
        health: 50 + Math.random() * 50,
        age: Math.random() * 20
      })
    }
    
    setPlants(initialPlants)
    if (onPlantsUpdate) onPlantsUpdate(initialPlants)
  }, [terrainData, biomeType, onPlantsUpdate])
  
  // Handle plant updates (reproduction, death)
  const handlePlantUpdate = (action, plant) => {
    setPlants(currentPlants => {
      let newPlants = [...currentPlants]
      
      if (action === 'reproduce') {
        // Create offspring near parent
        const offsetX = (Math.random() - 0.5) * 4
        const offsetZ = (Math.random() - 0.5) * 4
        const newPos = [
          plant.position[0] + offsetX,
          plant.position[1],
          plant.position[2] + offsetZ
        ]
        
        if (physicsSystem.isValidPosition(newPos[0], newPos[2])) {
          const offspring = {
            id: `plant-${Date.now()}-${Math.random()}`,
            type: plant.type,
            position: newPos,
            size: 0.1,
            health: 80,
            age: 0
          }
          newPlants.push(offspring)
        }
      } else if (action === 'death') {
        newPlants = newPlants.filter(p => p.id !== plant.id)
      }
      
      if (onPlantsUpdate) onPlantsUpdate(newPlants)
      return newPlants
    })
  }
  
  return (
    <group>
      {plants.map(plant => (
        <Plant
          key={plant.id}
          plant={plant}
          onUpdate={handlePlantUpdate}
          terrainData={terrainData}
          biomeType={biomeType}
        />
      ))}
    </group>
  )
}