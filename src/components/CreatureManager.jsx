import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Creature from './Creature'
import * as THREE from 'three'

export default function CreatureManager({ gameState, setGameState }) {
  const timeRef = useRef(0)

  // Check if creature can reach food source
  const canReachFood = (creature, foodPos, maxDistance = 1.5) => {
    const creaturePos = new THREE.Vector3(...creature.position)
    const foodPosition = new THREE.Vector3(...foodPos)
    return creaturePos.distanceTo(foodPosition) < maxDistance
  }

  // Simple obstacle avoidance - check if path to target is blocked
  const hasObstacleInPath = (fromPos, toPos, obstacles) => {
    if (!obstacles || obstacles.length === 0) return false
    
    const direction = new THREE.Vector3(toPos[0] - fromPos[0], 0, toPos[2] - fromPos[2]).normalize()
    const distance = new THREE.Vector3(...fromPos).distanceTo(new THREE.Vector3(...toPos))
    
    // Check for obstacles along the path
    for (let i = 1; i < distance; i += 0.5) {
      const checkPoint = new THREE.Vector3(
        fromPos[0] + direction.x * i,
        fromPos[1],
        fromPos[2] + direction.z * i
      )
      
      for (const obstacle of obstacles) {
        const obstacleCenter = new THREE.Vector3(...obstacle.position)
        const obstacleRadius = Math.max(...obstacle.size) * 0.5
        if (checkPoint.distanceTo(obstacleCenter) < obstacleRadius + 0.5) {
          return true
        }
      }
    }
    return false
  }

  // Find alternative path around obstacles using simple steering
  const getAvoidanceDirection = (creature, obstacles) => {
    const creaturePos = new THREE.Vector3(...creature.position)
    let avoidanceForce = new THREE.Vector3(0, 0, 0)
    
    obstacles.forEach(obstacle => {
      const obstaclePos = new THREE.Vector3(...obstacle.position)
      const distance = creaturePos.distanceTo(obstaclePos)
      const obstacleRadius = Math.max(...obstacle.size) * 0.5
      const detectionRadius = obstacleRadius + 2 // Detection zone around obstacle
      
      if (distance < detectionRadius) {
        // Calculate repulsion force
        const repulsion = creaturePos.clone().sub(obstaclePos).normalize()
        const strength = 1 - (distance / detectionRadius) // Stronger when closer
        avoidanceForce.add(repulsion.multiplyScalar(strength))
      }
    })
    
    if (avoidanceForce.length() > 0) {
      return Math.atan2(avoidanceForce.z, avoidanceForce.x)
    }
    return null
  }

  // Environmental pressure system
  const applyEnvironmentalPressure = (gameState, setGameState, delta) => {
    // Initialize environmental state if not present
    if (!gameState.environment) {
      setGameState(prev => ({
        ...prev,
        environment: {
          pressure: 0, // 0 = normal, 1 = high pressure
          lastPressureChange: 0,
          droughtCycle: 0,
          season: 'normal' // normal, drought, abundance
        }
      }))
      return
    }

    const env = gameState.environment
    env.lastPressureChange += delta
    env.droughtCycle += delta

    // Seasonal pressure cycles (every 30-60 seconds)
    if (env.lastPressureChange > 30 + Math.random() * 30) {
      const newSeason = Math.random() < 0.3 ? 'drought' : (Math.random() < 0.1 ? 'abundance' : 'normal')
      
      setGameState(prev => ({
        ...prev,
        environment: {
          ...prev.environment,
          season: newSeason,
          pressure: newSeason === 'drought' ? 0.8 : (newSeason === 'abundance' ? -0.3 : 0),
          lastPressureChange: 0
        }
      }))
    }

    // Apply pressure effects to food sources
    if (gameState.foodSources && env.season === 'drought') {
      // Reduce food respawn rate and energy during drought
      setGameState(prev => ({
        ...prev,
        foodSources: prev.foodSources.map(food => ({
          ...food,
          energy: food.energy > 0 ? food.energy : 0,
          respawnTime: food.respawnTime > 0 ? food.respawnTime * 1.5 : food.respawnTime // Slower respawn
        }))
      }))
    } else if (gameState.foodSources && env.season === 'abundance') {
      // Increase food energy and faster respawn during abundance
      setGameState(prev => ({
        ...prev,
        foodSources: prev.foodSources.map(food => ({
          ...food,
          energy: food.energy > 0 ? Math.min(80, food.energy + 5) : food.energy,
          respawnTime: food.respawnTime > 0 ? food.respawnTime * 0.7 : food.respawnTime // Faster respawn
        }))
      }))
    }
  }

  // Generate food sources if needed
  const ensureFoodSources = () => {
    const targetFoodCount = gameState.environment?.season === 'drought' ? 8 : (gameState.environment?.season === 'abundance' ? 20 : 15)
    
    if (!gameState.foodSources || gameState.foodSources.length < targetFoodCount) {
      const newFoodSources = []
      for (let i = 0; i < targetFoodCount; i++) {
        const baseEnergy = gameState.environment?.season === 'drought' ? 30 : (gameState.environment?.season === 'abundance' ? 70 : 50)
        newFoodSources.push({
          id: i,
          position: [
            (Math.random() - 0.5) * 25,
            0.3,
            (Math.random() - 0.5) * 25
          ],
          energy: baseEnergy,
          respawnTime: 0
        })
      }
      
      setGameState(prev => ({
        ...prev,
        foodSources: newFoodSources
      }))
    }
  }

  useFrame((state, delta) => {
    if (!gameState.isRunning) return

    timeRef.current += delta
    
    // Apply environmental pressure system
    applyEnvironmentalPressure(gameState, setGameState, delta)
    
    ensureFoodSources()

    // Update creatures every frame
    if (gameState.population.length > 0) {
      setGameState(prev => {
        const updatedPopulation = prev.population.map(creature => {
          const newCreature = { ...creature }
          
          // Initialize creature attributes if missing
          if (!newCreature.speed) newCreature.speed = 0.5 + Math.random() * 0.5
          if (!newCreature.energyEfficiency) newCreature.energyEfficiency = 0.8 + Math.random() * 0.4
          if (!newCreature.reproductionThreshold) newCreature.reproductionThreshold = 150
          if (!newCreature.age) newCreature.age = 0
          if (!newCreature.maxAge) newCreature.maxAge = 60 + Math.random() * 40

          // Age the creature
          newCreature.age += delta

          // Random movement with some direction persistence
          if (!newCreature.direction) {
            newCreature.direction = Math.random() * Math.PI * 2
            newCreature.directionChangeTime = 0
          }

          newCreature.directionChangeTime += delta

          // Look for nearby food when energy is low
          let targetFood = null
          let hasObstacle = false
          if (newCreature.energy < 80 && prev.foodSources) {
            const nearbyFood = prev.foodSources.find(food => 
              food.energy > 0 && canReachFood(newCreature, food.position, 8)
            )
            if (nearbyFood) {
              targetFood = nearbyFood
              // Check if path to food is blocked
              hasObstacle = hasObstacleInPath(newCreature.position, nearbyFood.position, [
                // Static obstacles from environment
                ...Array.from({length: 8}, (_, i) => ({
                  position: [
                    (Math.random() - 0.5) * 20,
                    Math.random() * 2 + 1,
                    (Math.random() - 0.5) * 20
                  ],
                  size: [2, 3, 2] // Approximate obstacle size
                }))
              ])
              
              if (!hasObstacle) {
                // Direct path to food
                const dx = nearbyFood.position[0] - newCreature.position[0]
                const dz = nearbyFood.position[2] - newCreature.position[2]
                newCreature.direction = Math.atan2(dz, dx)
              }
            }
          }

          // Apply obstacle avoidance if needed
          if (hasObstacle || (!targetFood && Math.random() < 0.1)) {
            const avoidanceDirection = getAvoidanceDirection(newCreature, [
              // Generate static obstacles (same seed for consistency)
              ...Array.from({length: 8}, (_, i) => ({
                position: [
                  (Math.sin(i * 2.5) * 0.5) * 20,
                  Math.random() * 2 + 1,
                  (Math.cos(i * 2.5) * 0.5) * 20
                ],
                size: [2, 3, 2]
              }))
            ])
            
            if (avoidanceDirection !== null) {
              newCreature.direction = avoidanceDirection
            }
          }

          // Change direction occasionally if not targeting food
          if (!targetFood && newCreature.directionChangeTime > 2 + Math.random() * 3) {
            newCreature.direction += (Math.random() - 0.5) * Math.PI * 0.5
            newCreature.directionChangeTime = 0
          }

          // Move creature
          const moveSpeed = newCreature.speed * (targetFood ? 1.5 : 1) // Move faster toward food
          const moveX = Math.cos(newCreature.direction) * moveSpeed * delta
          const moveZ = Math.sin(newCreature.direction) * moveSpeed * delta

          newCreature.position[0] += moveX
          newCreature.position[2] += moveZ

          // Keep creatures within bounds
          const bounds = 20
          if (Math.abs(newCreature.position[0]) > bounds) {
            newCreature.direction = Math.PI - newCreature.direction
            newCreature.position[0] = Math.sign(newCreature.position[0]) * bounds
          }
          if (Math.abs(newCreature.position[2]) > bounds) {
            newCreature.direction = -newCreature.direction
            newCreature.position[2] = Math.sign(newCreature.position[2]) * bounds
          }

          // Energy consumption based on efficiency, movement, and environmental pressure
          const baseDrain = 3 * newCreature.energyEfficiency
          const movementDrain = moveSpeed * 2
          const pressureMultiplier = gameState.environment?.pressure ? (1 + gameState.environment.pressure) : 1
          newCreature.energy -= (baseDrain + movementDrain) * delta * pressureMultiplier

          return newCreature
        }).filter(creature => creature.energy > 0 && creature.age < creature.maxAge) // Remove dead or too old creatures

        // Handle food consumption
        let updatedFoodSources = prev.foodSources ? [...prev.foodSources] : []
        
        updatedPopulation.forEach(creature => {
          updatedFoodSources = updatedFoodSources.map(food => {
            if (food.energy > 0 && canReachFood(creature, food.position)) {
              // Creature eats the food
              const energyGain = Math.min(food.energy, 40)
              creature.energy = Math.min(200, creature.energy + energyGain)
              return { ...food, energy: 0, respawnTime: 10 + Math.random() * 5 } // Food consumed, will respawn
            }
            return food
          })
        })

        // Respawn consumed food over time
        updatedFoodSources = updatedFoodSources.map(food => {
          if (food.energy === 0) {
            const newFood = { ...food, respawnTime: food.respawnTime - delta }
            if (newFood.respawnTime <= 0) {
              newFood.energy = 50
              newFood.respawnTime = 0
            }
            return newFood
          }
          return food
        })

        // Handle reproduction
        const reproductionCandidates = updatedPopulation.filter(creature => 
          creature.energy > creature.reproductionThreshold
        )

        const newOffspring = []
        reproductionCandidates.forEach(parent => {
          if (Math.random() < 0.02) { // 2% chance per frame when energy is high enough
            // Create offspring with mutations
            const offspring = {
              id: Date.now() + Math.random(),
              type: parent.type,
              position: [
                parent.position[0] + (Math.random() - 0.5) * 2,
                parent.position[1],
                parent.position[2] + (Math.random() - 0.5) * 2
              ],
              velocity: [0, 0, 0],
              energy: 80, // Start with good energy
              size: Math.max(0.3, Math.min(1.2, parent.size + (Math.random() - 0.5) * 0.2)), // Mutate size
              speed: Math.max(0.2, Math.min(1.5, parent.speed + (Math.random() - 0.5) * 0.2)), // Mutate speed
              energyEfficiency: Math.max(0.5, Math.min(1.5, parent.energyEfficiency + (Math.random() - 0.5) * 0.1)), // Mutate efficiency
              color: parent.color, // Keep parent color for now
              age: 0,
              maxAge: Math.max(30, Math.min(120, parent.maxAge + (Math.random() - 0.5) * 20)),
              reproductionThreshold: Math.max(100, Math.min(200, parent.reproductionThreshold + (Math.random() - 0.5) * 20))
            }
            
            // Parent loses energy from reproduction
            parent.energy -= 60
            newOffspring.push(offspring)
          }
        })

        return {
          ...prev,
          population: [...updatedPopulation, ...newOffspring],
          foodSources: updatedFoodSources
        }
      })
    }
  })

  const handleCreatureClick = (creature) => {
    setGameState(prev => ({
      ...prev,
      selectedCreature: creature
    }))
  }

  return (
    <group>
      {gameState.population.map(creature => (
        <Creature
          key={creature.id}
          creature={creature}
          isSelected={gameState.selectedCreature?.id === creature.id}
          onClick={() => handleCreatureClick(creature)}
          populationSize={gameState.population.length}
        />
      ))}
    </group>
  )
}