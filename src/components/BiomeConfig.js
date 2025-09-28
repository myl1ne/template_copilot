// Biome configuration system for Ecosystem Sandbox
export const BIOME_TYPES = {
  FOREST: 'forest',
  DESERT: 'desert',
  OCEAN: 'ocean'
}

export const BIOME_CONFIG = {
  [BIOME_TYPES.FOREST]: {
    name: 'Forest',
    description: 'Abundant resources with complex terrain',
    groundColor: '#2d5016',
    skyColor: '#87CEEB',
    foodCount: { min: 18, max: 25, drought: 12, abundance: 30 },
    foodEnergy: { base: 60, drought: 35, abundance: 80 },
    energyDrainMultiplier: 0.9, // Easier survival
    obstacleCount: 12,
    obstacleTypes: ['tree', 'rock', 'bush'],
    creatureSpeedMultiplier: 0.8, // Slower movement through dense forest
    reproductionBonus: 1.2, // Easier reproduction
    predatorAdvantage: 1.1, // Predators do well with cover
    ambientLight: 0.3,
    directionalLight: 0.8
  },
  
  [BIOME_TYPES.DESERT]: {
    name: 'Desert',
    description: 'Harsh environment with limited resources',
    groundColor: '#DAA520',
    skyColor: '#FFA500',
    foodCount: { min: 6, max: 10, drought: 3, abundance: 15 },
    foodEnergy: { base: 40, drought: 25, abundance: 55 },
    energyDrainMultiplier: 1.4, // Harsh survival conditions
    obstacleCount: 6,
    obstacleTypes: ['cactus', 'rock', 'dune'],
    creatureSpeedMultiplier: 1.2, // Faster movement across open terrain
    reproductionBonus: 0.7, // Harder reproduction
    predatorAdvantage: 0.8, // Predators struggle with less prey
    ambientLight: 0.5,
    directionalLight: 1.2
  },
  
  [BIOME_TYPES.OCEAN]: {
    name: 'Ocean',
    description: 'Fluid environment with unique challenges',
    groundColor: '#006994',
    skyColor: '#87CEEB',
    foodCount: { min: 15, max: 20, drought: 10, abundance: 25 },
    foodEnergy: { base: 50, drought: 30, abundance: 70 }, 
    energyDrainMultiplier: 1.1, // Slightly harder due to water resistance
    obstacleCount: 8,
    obstacleTypes: ['coral', 'rock', 'seaweed'],
    creatureSpeedMultiplier: 0.9, // Water resistance
    reproductionBonus: 1.0, // Neutral reproduction
    predatorAdvantage: 1.3, // Predators excel in 3D environment
    ambientLight: 0.4,
    directionalLight: 0.9
  }
}

export const getRandomBiome = () => {
  const biomes = Object.values(BIOME_TYPES)
  return biomes[Math.floor(Math.random() * biomes.length)]
}

export const getBiomeConfig = (biomeType) => {
  return BIOME_CONFIG[biomeType] || BIOME_CONFIG[BIOME_TYPES.FOREST]
}

export const calculateBiomeFood = (biomeType, season = 'normal') => {
  const config = getBiomeConfig(biomeType)
  const { foodCount, foodEnergy } = config
  
  let count, energy
  
  switch (season) {
    case 'drought':
      count = foodCount.drought
      energy = foodEnergy.drought
      break
    case 'abundance':
      count = foodCount.abundance
      energy = foodEnergy.abundance
      break
    default:
      count = Math.floor(Math.random() * (foodCount.max - foodCount.min + 1)) + foodCount.min
      energy = foodEnergy.base
  }
  
  return { count, energy }
}