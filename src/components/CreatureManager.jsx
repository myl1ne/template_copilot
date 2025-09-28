import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import EnhancedCreature from './EnhancedCreature'
import { getBiomeConfig, calculateBiomeFood, BIOME_TYPES } from './BiomeConfig'
import { reproduceGenetics, expressCreatureTraits, createEnvironmentalFactors } from './GeneticsSystem'
import { analyzeSpecializationPotential, applySpecializationEffects } from './SpecializationEngine'
import { territorialBehavior } from './TerritorialBehavior'
import { matingBehavior } from './MatingBehavior'
import * as THREE from 'three'

export default function CreatureManager({ gameState, setGameState }) {
  const timeRef = useRef(0)

  // Check if creature can reach food source
  const canReachFood = (creature, foodPos, maxDistance = 1.5) => {
    const creaturePos = new THREE.Vector3(...creature.position)
    const foodPosition = new THREE.Vector3(...foodPos)
    return creaturePos.distanceTo(foodPosition) < maxDistance
  }

  // Check if predator can catch prey
  const canCatchPrey = (predator, prey, maxDistance = 1.2) => {
    const predatorPos = new THREE.Vector3(...predator.position)
    const preyPos = new THREE.Vector3(...prey.position)
    return predatorPos.distanceTo(preyPos) < maxDistance
  }

  // Find nearest prey for predators
  const findNearestPrey = (predator, population) => {
    const prey = population.filter(c => 
      c.id !== predator.id && 
      c.diet !== 'carnivore' && 
      c.energy > 0
    )
    
    if (prey.length === 0) return null
    
    let nearest = null
    let shortestDistance = Infinity
    
    prey.forEach(p => {
      const distance = new THREE.Vector3(...predator.position)
        .distanceTo(new THREE.Vector3(...p.position))
      if (distance < shortestDistance && distance < 8) { // Hunt within 8 units
        shortestDistance = distance
        nearest = p
      }
    })
    
    return nearest
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
    const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
    const season = gameState.environment?.season || 'normal'
    const { count: targetFoodCount, energy: baseEnergy } = calculateBiomeFood(biomeType, season)
    
    if (!gameState.foodSources || gameState.foodSources.length < targetFoodCount) {
      const newFoodSources = []
      for (let i = 0; i < targetFoodCount; i++) {
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

          // Initialize diet if missing (backward compatibility)
          if (!newCreature.diet) {
            newCreature.diet = 'herbivore'
            newCreature.aggressiveness = Math.random() * 0.3
          }

          // Analyze and apply specialization (every 10 seconds to avoid performance impact)
          if (!newCreature.lastSpecializationCheck || (newCreature.age - newCreature.lastSpecializationCheck) > 10) {
            const populationContext = {
              biome: gameState.currentBiome,
              season: gameState.environment?.season || 'normal',
              population: prev.population,
              foodSources: prev.foodSources || []
            }
            
            const specializationAnalysis = analyzeSpecializationPotential(newCreature, populationContext)
            
            if (specializationAnalysis.currentSpecialization) {
              // Apply specialization effects
              const specializedCreature = applySpecializationEffects(
                newCreature, 
                specializationAnalysis.currentSpecialization,
                populationContext
              )
              
              // Copy over the specialization modifications
              Object.assign(newCreature, specializedCreature)
            }
            
            newCreature.lastSpecializationCheck = newCreature.age
          }

          // Apply territorial behavior effects
          territorialBehavior.applyTerritorialEffects(newCreature)

          // Handle mating behaviors - only if not already in courtship/mating
          if (!newCreature.matingState && newCreature.energy > 120 && Math.random() < 0.02) {
            const potentialMates = matingBehavior.findPotentialMates(newCreature, prev.population)
            if (potentialMates.length > 0) {
              const bestMate = potentialMates[0] // Already sorted by compatibility
              matingBehavior.initiateCourtship(newCreature, bestMate)
            }
          }

          // Random movement with some direction persistence
          if (!newCreature.direction) {
            newCreature.direction = Math.random() * Math.PI * 2
            newCreature.directionChangeTime = 0
          }

          newCreature.directionChangeTime += delta

          // Different behavior for predators vs herbivores
          let targetFood = null
          let targetPrey = null
          let hasObstacle = false

          if (newCreature.diet === 'carnivore') {
            // Predator behavior - hunt for prey
            targetPrey = findNearestPrey(newCreature, prev.population)
            if (targetPrey) {
              // Move toward prey
              const dx = targetPrey.position[0] - newCreature.position[0]
              const dz = targetPrey.position[2] - newCreature.position[2]
              newCreature.direction = Math.atan2(dz, dx)
            } else if (newCreature.energy < 60) {
              // Fallback to eating food when no prey available and energy is low
              const nearbyFood = prev.foodSources?.find(food => 
                food.energy > 0 && canReachFood(newCreature, food.position, 6)
              )
              if (nearbyFood) {
                targetFood = nearbyFood
                const dx = nearbyFood.position[0] - newCreature.position[0]
                const dz = nearbyFood.position[2] - newCreature.position[2]
                newCreature.direction = Math.atan2(dz, dx)
              }
            }
          } else {
            // Herbivore behavior - look for food and avoid predators
            const nearbyPredators = prev.population.filter(c => 
              c.diet === 'carnivore' && 
              c.id !== newCreature.id &&
              new THREE.Vector3(...c.position).distanceTo(new THREE.Vector3(...newCreature.position)) < 5
            )

            if (nearbyPredators.length > 0) {
              // Flee from nearest predator
              const nearestPredator = nearbyPredators[0]
              const dx = newCreature.position[0] - nearestPredator.position[0]
              const dz = newCreature.position[2] - nearestPredator.position[2]
              newCreature.direction = Math.atan2(dz, dx) // Run away
            } else if (newCreature.energy < 80 && prev.foodSources) {
              // Look for food when no immediate danger
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
                      (Math.sin(i * 2.5) * 0.5) * 20,
                      Math.random() * 2 + 1,
                      (Math.cos(i * 2.5) * 0.5) * 20
                    ],
                    size: [2, 3, 2]
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

          // Change direction occasionally if not targeting food or prey
          if (!targetFood && !targetPrey && newCreature.directionChangeTime > 2 + Math.random() * 3) {
            newCreature.direction += (Math.random() - 0.5) * Math.PI * 0.5
            newCreature.directionChangeTime = 0
          }

          // Move creature - predators move faster when hunting, biome affects speed, specialization affects speed
          const biomeType = gameState.currentBiome || BIOME_TYPES.FOREST
          const biomeConfig = getBiomeConfig(biomeType)
          const huntingBonus = (newCreature.diet === 'carnivore' && targetPrey) ? 1.8 : 1
          const effectiveSpeed = newCreature.effectiveSpeed || newCreature.speed
          const baseSpeed = effectiveSpeed * (targetFood ? 1.5 : huntingBonus) // Move faster toward food/prey
          const moveSpeed = baseSpeed * biomeConfig.creatureSpeedMultiplier
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

          // Energy consumption based on efficiency, movement, environmental pressure, biome, and specialization
          const baseDrain = 3 * newCreature.energyEfficiency
          const movementDrain = moveSpeed * 2
          const pressureMultiplier = gameState.environment?.pressure ? (1 + gameState.environment.pressure) : 1
          const biomeMultiplier = biomeConfig.energyDrainMultiplier
          const movementCostMultiplier = newCreature.movementCostMultiplier || 1.0
          
          newCreature.energy -= (baseDrain + movementDrain * movementCostMultiplier) * delta * pressureMultiplier * biomeMultiplier

          return newCreature
        }).filter(creature => creature.energy > 0 && creature.age < creature.maxAge) // Remove dead or too old creatures

        // Handle food consumption
        let updatedFoodSources = prev.foodSources ? [...prev.foodSources] : []
        
        updatedPopulation.forEach(creature => {
          updatedFoodSources = updatedFoodSources.map(food => {
            if (food.energy > 0 && canReachFood(creature, food.position)) {
              // Calculate energy gain based on specialization
              const baseEnergyGain = creature.diet === 'carnivore' ? 20 : 40
              const specializationMultiplier = creature.foodEnergyMultiplier || 1.0
              const energyGain = Math.min(food.energy, baseEnergyGain * specializationMultiplier)
              
              creature.energy = Math.min(200, creature.energy + energyGain)
              return { ...food, energy: 0, respawnTime: 10 + Math.random() * 5 } // Food consumed, will respawn
            }
            return food
          })
        })

        // Handle predation
        const predators = updatedPopulation.filter(c => c.diet === 'carnivore')
        const prey = updatedPopulation.filter(c => c.diet !== 'carnivore')
        
        predators.forEach(predator => {
          const nearestPrey = prey.find(p => canCatchPrey(predator, p))
          if (nearestPrey) {
            // Calculate hunting success based on specialization
            const baseHuntingChance = 0.1 // 10% base chance
            const huntingMultiplier = predator.huntingSuccessMultiplier || 1.0
            const huntingChance = Math.min(0.3, baseHuntingChance * huntingMultiplier) // Cap at 30%
            
            if (Math.random() < huntingChance) {
              // Predator catches prey
              const baseEnergyGain = Math.min(nearestPrey.energy * 0.8, 100)
              const energyMultiplier = predator.foodEnergyMultiplier || 1.0
              const energyGain = baseEnergyGain * energyMultiplier
              
              predator.energy = Math.min(250, predator.energy + energyGain)
              
              // Remove prey from population (it dies)
              const preyIndex = updatedPopulation.findIndex(c => c.id === nearestPrey.id)
              if (preyIndex !== -1) {
                updatedPopulation.splice(preyIndex, 1)
              }
            }
          }
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

        // Handle reproduction with genetics
        const reproductionCandidates = updatedPopulation.filter(creature => 
          creature.energy > creature.reproductionThreshold
        )

        const newOffspring = []
        
        // Find potential mates for sexual reproduction
        reproductionCandidates.forEach(parent1 => {
          const reproductionChance = parent1.diet === 'carnivore' ? 0.008 : 0.015 // Predators reproduce less frequently
          
          if (Math.random() < reproductionChance) {
            // Find a suitable mate (same diet type and nearby)
            const potentialMates = reproductionCandidates.filter(parent2 => 
              parent2.id !== parent1.id &&
              parent2.diet === parent1.diet &&
              new THREE.Vector3(...parent1.position).distanceTo(new THREE.Vector3(...parent2.position)) < 3
            )
            
            let parent2 = null
            if (potentialMates.length > 0) {
              // Sexual reproduction - choose random mate
              parent2 = potentialMates[Math.floor(Math.random() * potentialMates.length)]
            }
            
            // Create offspring through genetics
            let offspringDNA
            let parentIds = [parent1.id]
            
            if (parent2 && parent1.dna && parent2.dna) {
              // Sexual reproduction - combine DNA from both parents
              offspringDNA = reproduceGenetics(parent1.dna, parent2.dna, 0.05) // 5% mutation rate
              parentIds.push(parent2.id)
            } else if (parent1.dna) {
              // Asexual reproduction - clone with mutations
              offspringDNA = reproduceGenetics(parent1.dna, parent1.dna, 0.1) // Higher mutation rate for asexual
            } else {
              // Fallback for creatures without DNA (backward compatibility)
              offspringDNA = null
            }
            
            // Generate environmental factors for trait expression
            const environmentalFactors = createEnvironmentalFactors(
              gameState.currentBiome,
              gameState.environment?.season || 'normal',
              gameState.environment?.pressure || 0
            )
            
            // Express traits from genetics
            let geneticTraits = {}
            if (offspringDNA) {
              geneticTraits = expressCreatureTraits(offspringDNA, environmentalFactors)
            }
            
            // Create offspring with genetic traits
            const offspring = {
              id: Date.now() + Math.random(),
              type: parent1.type,
              position: [
                parent1.position[0] + (Math.random() - 0.5) * 2,
                parent1.position[1],
                parent1.position[2] + (Math.random() - 0.5) * 2
              ],
              velocity: [0, 0, 0],
              energy: parent1.diet === 'carnivore' ? 100 : 80,
              
              // Genetic traits or fallback to mutation-based inheritance
              dna: offspringDNA,
              size: offspringDNA ? geneticTraits.size : Math.max(0.3, Math.min(1.2, parent1.size + (Math.random() - 0.5) * 0.2)),
              speed: offspringDNA ? geneticTraits.speed : Math.max(0.2, Math.min(1.5, parent1.speed + (Math.random() - 0.5) * 0.2)),
              energyEfficiency: offspringDNA ? geneticTraits.energyEfficiency : Math.max(0.5, Math.min(1.5, parent1.energyEfficiency + (Math.random() - 0.5) * 0.1)),
              maxAge: offspringDNA ? geneticTraits.lifespan : Math.max(30, Math.min(120, parent1.maxAge + (Math.random() - 0.5) * 20)),
              reproductionThreshold: offspringDNA ? geneticTraits.reproductionRate : Math.max(100, Math.min(250, parent1.reproductionThreshold + (Math.random() - 0.5) * 20)),
              diet: offspringDNA ? geneticTraits.diet : parent1.diet,
              aggressiveness: offspringDNA ? geneticTraits.aggression : Math.max(0, Math.min(1, parent1.aggressiveness + (Math.random() - 0.5) * 0.1)),
              intelligence: offspringDNA ? geneticTraits.intelligence : (parent1.intelligence || 0.5),
              
              // Lineage tracking
              age: 0,
              generation: (parent1.generation || 1) + 1,
              parentIds: parentIds,
              
              // Color inheritance with variation
              color: generateOffspringColor(parent1, parent2, geneticTraits)
            }
            
            // Parents lose energy from reproduction
            const baseCost = parent1.diet === 'carnivore' ? 70 : 50
            const reproductionCostMultiplier1 = parent1.reproductionCostMultiplier || 1.0
            const reproductionCost1 = baseCost * reproductionCostMultiplier1
            
            parent1.energy -= reproductionCost1
            if (parent2) {
              const reproductionCostMultiplier2 = parent2.reproductionCostMultiplier || 1.0
              const reproductionCost2 = baseCost * reproductionCostMultiplier2
              parent2.energy -= reproductionCost2
            }
            
            newOffspring.push(offspring)
          }
        })
        
        // Helper function to generate offspring color
        function generateOffspringColor(parent1, parent2, geneticTraits) {
          if (geneticTraits.diet) {
            // Generate color based on genetic traits
            let baseHue = 120 // Green for herbivores
            if (geneticTraits.diet === 'carnivore') {
              baseHue = 0 // Red for carnivores
            } else if (geneticTraits.diet === 'omnivore') {
              baseHue = 60 // Yellow for omnivores
            }
            
            const hueVariation = (geneticTraits.size - 0.5) * 30 + (geneticTraits.speed - 0.5) * 20
            const finalHue = (baseHue + hueVariation) % 360
            const saturation = Math.min(100, 50 + geneticTraits.energyEfficiency * 30)
            const lightness = Math.min(80, 40 + geneticTraits.intelligence * 30)
            
            return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`
          } else {
            // Fallback color mixing for non-genetic creatures
            if (parent2) {
              // Mix colors from both parents with slight variation
              return parent1.color // Simplified for now
            } else {
              return parent1.color
            }
          }
        }

        return {
          ...prev,
          population: [...updatedPopulation, ...newOffspring],
          foodSources: updatedFoodSources
        }
      })
      
      // Update territorial behaviors after population update
      territorialBehavior.updateTerritorialBehaviors(gameState.population, delta)
      
      // Update mating behaviors
      matingBehavior.updateCourtshipBehaviors(gameState.population, delta)
      matingBehavior.cleanup(gameState.population)
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
        <EnhancedCreature
          key={creature.id}
          creature={creature}
          isSelected={gameState.selectedCreature?.id === creature.id}
          onClick={() => handleCreatureClick(creature)}
        />
      ))}
    </group>
  )
}