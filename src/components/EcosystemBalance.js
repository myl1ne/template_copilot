// Ecosystem Balance System - Addresses population collapse issues
import { getBiomeConfig } from './BiomeConfig'

class EcosystemBalanceManager {
  constructor() {
    this.foodRegenerationRate = 0.5
    this.maxFoodSources = 15
    this.carryingCapacity = 20
    this.predatorPreyRatio = 0.3 // Ideal ratio of predators to prey
    this.minHerbivorePopulation = 3
    this.balanceCheckInterval = 5000 // Check every 5 seconds
    this.lastBalanceCheck = 0
  }

  // Main ecosystem balance function
  balanceEcosystem(gameState, setGameState, deltaTime) {
    const now = Date.now()
    
    // Only check balance periodically to avoid performance issues
    if (now - this.lastBalanceCheck < this.balanceCheckInterval) {
      return
    }
    
    this.lastBalanceCheck = now
    
    if (!gameState.isRunning || !gameState.population) {
      return
    }

    const population = gameState.population
    const herbivores = population.filter(c => c.diet !== 'carnivore')
    const predators = population.filter(c => c.diet === 'carnivore')
    const foodSources = gameState.foodSources || []
    
    let needsUpdate = false
    let newGameState = { ...gameState }

    // 1. Food Source Management
    const foodUpdate = this.manageFoodSources(foodSources, herbivores.length, gameState.currentBiome)
    if (foodUpdate.changed) {
      newGameState.foodSources = foodUpdate.foodSources
      needsUpdate = true
    }

    // 2. Population Pressure Management
    const populationUpdate = this.managePopulationPressure(population, herbivores, predators)
    if (populationUpdate.changed) {
      newGameState = { ...newGameState, ...populationUpdate.updates }
      needsUpdate = true
    }

    // 3. Predator-Prey Balance
    const balanceUpdate = this.balancePredatorPrey(herbivores, predators, newGameState)
    if (balanceUpdate.changed) {
      newGameState = { ...newGameState, ...balanceUpdate.updates }
      needsUpdate = true
    }

    // 4. Environmental Support
    const environmentUpdate = this.adjustEnvironmentalSupport(population.length, gameState.currentBiome)
    if (environmentUpdate.changed) {
      newGameState.environment = {
        ...newGameState.environment,
        ...environmentUpdate.updates
      }
      needsUpdate = true
    }

    if (needsUpdate) {
      setGameState(newGameState)
    }
  }

  // Intelligent food source management
  manageFoodSources(currentFoodSources, herbivoreCount, biome) {
    const biomeConfig = getBiomeConfig(biome)
    const activeFoodSources = currentFoodSources.filter(f => f.energy > 0)
    
    // Calculate ideal food count based on herbivore population
    const idealFoodCount = Math.max(5, Math.min(this.maxFoodSources, herbivoreCount * 2 + 3))
    const foodDeficit = idealFoodCount - activeFoodSources.length
    
    let changed = false
    let newFoodSources = [...currentFoodSources]

    // Add food sources if needed
    if (foodDeficit > 0) {
      for (let i = 0; i < foodDeficit; i++) {
        const newFood = this.createFoodSource(biomeConfig)
        newFoodSources.push(newFood)
        changed = true
      }
    }

    // Regenerate depleted food sources
    newFoodSources = newFoodSources.map(food => {
      if (food.energy <= 0 && Math.random() < this.foodRegenerationRate * 0.1) {
        return {
          ...food,
          energy: food.maxEnergy * (0.5 + Math.random() * 0.5),
          position: [
            (Math.random() - 0.5) * 25,
            0.5,
            (Math.random() - 0.5) * 25
          ]
        }
      }
      return food
    })

    // Slowly regenerate existing food
    newFoodSources = newFoodSources.map(food => {
      if (food.energy > 0 && food.energy < food.maxEnergy) {
        const newEnergy = Math.min(food.maxEnergy, food.energy + this.foodRegenerationRate)
        if (newEnergy !== food.energy) {
          changed = true
          return { ...food, energy: newEnergy }
        }
      }
      return food
    })

    return { changed, foodSources: newFoodSources }
  }

  // Create a new food source with biome-appropriate properties
  createFoodSource(biomeConfig) {
    return {
      id: `food_${Date.now()}_${Math.random()}`,
      position: [
        (Math.random() - 0.5) * 25,
        0.5,
        (Math.random() - 0.5) * 25
      ],
      energy: 40 + Math.random() * 40,
      maxEnergy: 80,
      type: biomeConfig.foodType || 'plant',
      growthRate: biomeConfig.growthRate || 1.0
    }
  }

  // Manage population pressure and carrying capacity
  managePopulationPressure(population, herbivores, predators) {
    let changed = false
    let updates = {}

    // Check if population exceeds carrying capacity
    if (population.length > this.carryingCapacity) {
      // Increase environmental pressure
      updates.environment = {
        pressure: Math.min(1.0, (population.length / this.carryingCapacity) - 1),
        season: population.length > this.carryingCapacity * 1.5 ? 'drought' : 'normal'
      }
      changed = true
    } else if (population.length < this.carryingCapacity * 0.5) {
      // Decrease environmental pressure, create abundance
      updates.environment = {
        pressure: 0,
        season: 'abundance'
      }
      changed = true
    }

    return { changed, updates }
  }

  // Balance predator-prey populations
  balancePredatorPrey(herbivores, predators, gameState) {
    let changed = false
    let updates = {}

    const totalPopulation = herbivores.length + predators.length
    const currentPredatorRatio = totalPopulation > 0 ? predators.length / totalPopulation : 0

    // If too many predators, reduce their reproduction success
    if (currentPredatorRatio > this.predatorPreyRatio && predators.length > 1) {
      // Increase energy costs for predators
      const updatedPopulation = gameState.population.map(creature => {
        if (creature.diet === 'carnivore' && creature.energy > 0) {
          return {
            ...creature,
            energy: Math.max(0, creature.energy - 0.5), // Gradual energy drain
            reproductionThreshold: creature.reproductionThreshold * 1.2 // Harder to reproduce
          }
        }
        return creature
      })
      updates.population = updatedPopulation
      changed = true
    }

    // If too few herbivores, boost their survival
    if (herbivores.length < this.minHerbivorePopulation) {
      const updatedPopulation = gameState.population.map(creature => {
        if (creature.diet !== 'carnivore') {
          return {
            ...creature,
            energy: Math.min(150, creature.energy + 1), // Gradual energy boost
            energyEfficiency: (creature.energyEfficiency || 0.5) * 1.1 // More efficient
          }
        }
        return creature
      })
      updates.population = updatedPopulation
      changed = true
    }

    // Emergency population boost if ecosystem is collapsing
    if (totalPopulation < 3) {
      updates.needsEmergencySpawn = {
        herbivores: Math.max(2, this.minHerbivorePopulation - herbivores.length),
        predators: herbivores.length > 5 ? 1 : 0
      }
      changed = true
    }

    return { changed, updates }
  }

  // Adjust environmental support based on population
  adjustEnvironmentalSupport(populationSize, biome) {
    let changed = false
    let updates = {}

    const biomeConfig = getBiomeConfig(biome)
    
    // Adjust resource availability based on population density
    if (populationSize > this.carryingCapacity * 0.8) {
      // High population - reduce resource quality
      updates.resourceQuality = Math.max(0.3, 1.0 - (populationSize - this.carryingCapacity) * 0.1)
      updates.competition = Math.min(1.0, populationSize / this.carryingCapacity)
      changed = true
    } else if (populationSize < this.carryingCapacity * 0.3) {
      // Low population - abundant resources
      updates.resourceQuality = 1.2
      updates.competition = 0.1
      changed = true
    }

    return { changed, updates }
  }

  // Emergency spawn function for ecosystem recovery
  spawnEmergencyCreatures(gameState, setGameState, spawnCounts) {
    if (!spawnCounts || (!spawnCounts.herbivores && !spawnCounts.predators)) {
      return
    }

    const newCreatures = []

    // Spawn herbivores
    for (let i = 0; i < (spawnCounts.herbivores || 0); i++) {
      const herbivore = this.createEmergencyCreature('herbivore', gameState.currentBiome)
      newCreatures.push(herbivore)
    }

    // Spawn predators
    for (let i = 0; i < (spawnCounts.predators || 0); i++) {
      const predator = this.createEmergencyCreature('carnivore', gameState.currentBiome)
      newCreatures.push(predator)
    }

    if (newCreatures.length > 0) {
      setGameState(prev => ({
        ...prev,
        population: [...prev.population, ...newCreatures],
        environment: {
          ...prev.environment,
          needsEmergencySpawn: undefined
        }
      }))
    }
  }

  // Create emergency creature with balanced stats
  createEmergencyCreature(diet, biome) {
    const isHerbivore = diet !== 'carnivore'
    
    return {
      id: `emergency_${Date.now()}_${Math.random()}`,
      type: 'enhanced',
      position: [
        (Math.random() - 0.5) * 20,
        1,
        (Math.random() - 0.5) * 20
      ],
      velocity: [0, 0, 0],
      energy: isHerbivore ? 80 : 100,
      size: isHerbivore ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.3,
      speed: isHerbivore ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.4,
      energyEfficiency: isHerbivore ? 0.6 + Math.random() * 0.3 : 0.4 + Math.random() * 0.3,
      maxAge: isHerbivore ? 50 + Math.random() * 30 : 60 + Math.random() * 40,
      reproductionThreshold: isHerbivore ? 120 : 160,
      diet: diet,
      aggressiveness: isHerbivore ? Math.random() * 0.3 : 0.5 + Math.random() * 0.4,
      intelligence: 0.3 + Math.random() * 0.4,
      age: 0,
      generation: 1,
      parentIds: [],
      color: isHerbivore ? 
        `hsl(${100 + Math.random() * 40}, 60%, 50%)` : 
        `hsl(${Math.random() * 60}, 70%, 45%)`,
      isEmergencySpawned: true
    }
  }

  // Get ecosystem health metrics
  getEcosystemHealth(gameState) {
    if (!gameState.population) {
      return { health: 0, status: 'empty', recommendations: ['Spawn some creatures to begin'] }
    }

    const population = gameState.population
    const herbivores = population.filter(c => c.diet !== 'carnivore')
    const predators = population.filter(c => c.diet === 'carnivore')
    const foodSources = (gameState.foodSources || []).filter(f => f.energy > 0)
    
    let health = 1.0
    let status = 'healthy'
    let recommendations = []

    // Population diversity
    if (population.length < 3) {
      health *= 0.2
      status = 'critical'
      recommendations.push('Population too small - risk of extinction')
    }

    // Predator-prey balance
    const predatorRatio = population.length > 0 ? predators.length / population.length : 0
    if (predatorRatio > 0.5) {
      health *= 0.4
      status = 'unbalanced'
      recommendations.push('Too many predators - prey population at risk')
    } else if (predatorRatio < 0.1 && population.length > 5) {
      health *= 0.7
      recommendations.push('Consider adding predators for natural selection')
    }

    // Food availability
    const foodPerHerbivore = herbivores.length > 0 ? foodSources.length / herbivores.length : 10
    if (foodPerHerbivore < 1) {
      health *= 0.6
      status = 'stressed'
      recommendations.push('Insufficient food sources for herbivore population')
    }

    // Population density
    if (population.length > this.carryingCapacity) {
      health *= 0.7
      status = 'overcrowded'
      recommendations.push('Population exceeds carrying capacity')
    }

    return {
      health: Math.max(0, Math.min(1, health)),
      status,
      recommendations,
      metrics: {
        totalPopulation: population.length,
        herbivores: herbivores.length,
        predators: predators.length,
        foodSources: foodSources.length,
        predatorRatio,
        foodPerHerbivore
      }
    }
  }
}

// Singleton instance
export const ecosystemBalance = new EcosystemBalanceManager()
export default ecosystemBalance