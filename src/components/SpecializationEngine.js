// Species Specialization Engine for Ecosystem Sandbox
// Enables creatures to develop distinct ecological roles and adaptive traits

import { GENE_TYPES } from './GeneticsSystem'

// Ecological specialization types
export const SPECIALIZATION_TYPES = {
  // Herbivore specializations
  GRAZER: 'grazer',                    // Large, slow, high energy efficiency
  BROWSER: 'browser',                  // Medium size, good intelligence, varied diet
  SEED_DISPERSER: 'seedDisperser',     // Fast, high reproduction, mobile
  
  // Carnivore specializations  
  APEX_PREDATOR: 'apexPredator',       // Large, aggressive, slow reproduction
  PACK_HUNTER: 'packHunter',           // Medium, intelligent, social
  AMBUSH_PREDATOR: 'ambushPredator',   // Patient, efficient, territorial
  SCAVENGER: 'scavenger',              // Opportunistic, hardy, adaptable
  
  // Omnivore specializations
  GENERALIST: 'generalist',            // Balanced traits, adaptable
  OPPORTUNIST: 'opportunist',          // Fast, intelligent, flexible diet
  
  // Environmental specialists
  DESERT_SPECIALIST: 'desertSpecialist', // High efficiency, heat resistant
  FOREST_SPECIALIST: 'forestSpecialist', // Camouflage, navigation skills
  AQUATIC_SPECIALIST: 'aquaticSpecialist' // Swimming adaptations
}

// Specialization requirements and thresholds
export const SPECIALIZATION_CRITERIA = {
  [SPECIALIZATION_TYPES.GRAZER]: {
    minGeneration: 3,
    requiredTraits: {
      size: { min: 0.7, weight: 0.3 },
      energyEfficiency: { min: 0.8, weight: 0.4 },
      speed: { max: 0.6, weight: 0.2 },
      aggression: { max: 0.3, weight: 0.1 }
    },
    dietRequirement: 'herbivore',
    environmentalFactor: 'abundant_vegetation'
  },
  
  [SPECIALIZATION_TYPES.BROWSER]: {
    minGeneration: 2,
    requiredTraits: {
      intelligence: { min: 0.6, weight: 0.4 },
      size: { min: 0.4, max: 0.8, weight: 0.2 },
      speed: { min: 0.5, weight: 0.2 },
      energyEfficiency: { min: 0.7, weight: 0.2 }
    },
    dietRequirement: 'herbivore',
    environmentalFactor: 'diverse_vegetation'
  },
  
  [SPECIALIZATION_TYPES.SEED_DISPERSER]: {
    minGeneration: 2,
    requiredTraits: {
      speed: { min: 0.7, weight: 0.4 },
      reproductionRate: { max: 160, weight: 0.3 }, // Lower threshold = faster reproduction
      size: { min: 0.3, max: 0.6, weight: 0.2 },
      energyEfficiency: { min: 0.6, weight: 0.1 }
    },
    dietRequirement: 'herbivore',
    environmentalFactor: 'seed_availability'
  },
  
  [SPECIALIZATION_TYPES.APEX_PREDATOR]: {
    minGeneration: 4,
    requiredTraits: {
      size: { min: 0.8, weight: 0.3 },
      aggression: { min: 0.8, weight: 0.3 },
      speed: { min: 0.6, weight: 0.2 },
      intelligence: { min: 0.6, weight: 0.2 }
    },
    dietRequirement: 'carnivore',
    environmentalFactor: 'prey_abundance'
  },
  
  [SPECIALIZATION_TYPES.PACK_HUNTER]: {
    minGeneration: 2, // Reduced from 3
    requiredTraits: {
      intelligence: { min: 0.6, weight: 0.4 }, // Reduced from 0.7
      speed: { min: 0.5, weight: 0.3 }, // Reduced from 0.6
      aggression: { min: 0.4, max: 0.8, weight: 0.2 }, // Reduced from 0.5
      size: { min: 0.4, max: 0.8, weight: 0.1 } // Reduced from 0.5
    },
    dietRequirement: 'carnivore',
    environmentalFactor: 'social_opportunities'
  },
  
  [SPECIALIZATION_TYPES.AMBUSH_PREDATOR]: {
    minGeneration: 3,
    requiredTraits: {
      energyEfficiency: { min: 0.8, weight: 0.3 },
      aggression: { min: 0.7, weight: 0.3 },
      intelligence: { min: 0.6, weight: 0.2 },
      speed: { max: 0.7, weight: 0.2 } // Ambush predators don't need high speed
    },
    dietRequirement: 'carnivore',
    environmentalFactor: 'cover_availability'
  },
  
  [SPECIALIZATION_TYPES.SCAVENGER]: {
    minGeneration: 2,
    requiredTraits: {
      energyEfficiency: { min: 0.8, weight: 0.4 },
      intelligence: { min: 0.5, weight: 0.3 },
      aggression: { min: 0.2, max: 0.6, weight: 0.2 },
      lifespan: { min: 70, weight: 0.1 }
    },
    dietRequirement: 'carnivore',
    environmentalFactor: 'carrion_availability'
  },
  
  [SPECIALIZATION_TYPES.GENERALIST]: {
    minGeneration: 2,
    requiredTraits: {
      intelligence: { min: 0.5, weight: 0.4 }, // Reduced from 0.6
      energyEfficiency: { min: 0.5, weight: 0.2 }, // Reduced from 0.6
      speed: { min: 0.4, weight: 0.2 }, // Reduced from 0.5
      size: { min: 0.3, max: 0.9, weight: 0.2 } // Expanded range
    },
    dietRequirement: 'omnivore',
    environmentalFactor: 'resource_diversity'
  },
  
  [SPECIALIZATION_TYPES.OPPORTUNIST]: {
    minGeneration: 1,
    requiredTraits: {
      intelligence: { min: 0.7, weight: 0.4 },
      speed: { min: 0.6, weight: 0.3 },
      reproductionRate: { max: 170, weight: 0.2 },
      energyEfficiency: { min: 0.5, weight: 0.1 }
    },
    dietRequirement: 'omnivore',
    environmentalFactor: 'environmental_variability'
  }
}

// Specialization benefits and modifications
export const SPECIALIZATION_BENEFITS = {
  [SPECIALIZATION_TYPES.GRAZER]: {
    energyFromFood: 1.4,
    movementCost: 0.8,
    reproductionBonus: 1.2,
    predationResistance: 0.9,
    description: 'Efficient herbivore specialized for consuming abundant vegetation'
  },
  
  [SPECIALIZATION_TYPES.BROWSER]: {
    foodDetectionRange: 1.5,
    energyFromFood: 1.2,
    adaptabilityBonus: 1.3,
    territorySize: 1.2,
    description: 'Intelligent herbivore capable of utilizing diverse plant resources'
  },
  
  [SPECIALIZATION_TYPES.SEED_DISPERSER]: {
    movementSpeed: 1.3,
    reproductionRate: 1.4,
    energyFromFood: 1.1,
    dispersalRange: 1.5,
    description: 'Fast-moving herbivore that spreads seeds throughout the ecosystem'
  },
  
  [SPECIALIZATION_TYPES.APEX_PREDATOR]: {
    huntingSuccess: 1.5,
    energyFromPrey: 1.3,
    territorySize: 2.0,
    intimidationFactor: 1.5,
    reproductionCost: 1.3,
    description: 'Dominant predator at the top of the food chain'
  },
  
  [SPECIALIZATION_TYPES.PACK_HUNTER]: {
    cooperativeHunting: 1.4,
    huntingSuccess: 1.3,
    socialBonding: 1.5,
    informationSharing: 1.4,
    description: 'Intelligent social predator that hunts in coordinated groups'
  },
  
  [SPECIALIZATION_TYPES.AMBUSH_PREDATOR]: {
    energyEfficiency: 1.3,
    huntingSuccess: 1.4,
    camouflage: 1.3,
    patientHunting: 1.5,
    description: 'Patient predator that waits for optimal hunting opportunities'
  },
  
  [SPECIALIZATION_TYPES.SCAVENGER]: {
    carrionDetection: 1.5,
    diseaseResistance: 1.4,
    energyEfficiency: 1.2,
    competitionAvoidance: 1.3,
    description: 'Resourceful carnivore that feeds on carrion and scraps'
  },
  
  [SPECIALIZATION_TYPES.GENERALIST]: {
    adaptabilityBonus: 1.4,
    dietFlexibility: 1.5,
    environmentalResilience: 1.3,
    learningSpeed: 1.2,
    description: 'Highly adaptable omnivore capable of thriving in various conditions'
  },
  
  [SPECIALIZATION_TYPES.OPPORTUNIST]: {
    resourceDetection: 1.4,
    adaptabilityBonus: 1.3,
    reproductionRate: 1.3,
    rapidResponse: 1.4,
    description: 'Quick-thinking omnivore that exploits changing opportunities'
  }
}

// Analyze creature for potential specializations
export function analyzeSpecializationPotential(creature, populationContext = {}) {
  if (!creature.generation || creature.generation < 1) {
    return { potentialSpecializations: [], currentSpecialization: null }
  }
  
  const potentialSpecializations = []
  
  // Check each specialization type
  Object.entries(SPECIALIZATION_CRITERIA).forEach(([specializationType, criteria]) => {
    const score = calculateSpecializationScore(creature, criteria, populationContext)
    
    if (score.meets_requirements) {
      potentialSpecializations.push({
        type: specializationType,
        score: score.total_score,
        confidence: score.confidence,
        missing_requirements: score.missing_requirements
      })
    }
  })
  
  // Sort by score
  potentialSpecializations.sort((a, b) => b.score - a.score)
  
  // Determine current specialization (highest scoring that meets all requirements)
  const currentSpecialization = potentialSpecializations.length > 0 && potentialSpecializations[0].confidence > 0.6 // Reduced from 0.8
    ? potentialSpecializations[0].type
    : null
  
  return {
    potentialSpecializations,
    currentSpecialization,
    specializationStrength: currentSpecialization ? potentialSpecializations[0].score : 0
  }
}

// Calculate how well a creature fits a specialization
function calculateSpecializationScore(creature, criteria, populationContext) {
  // Check generation requirement
  if (creature.generation < criteria.minGeneration) {
    return { meets_requirements: false, total_score: 0, confidence: 0, missing_requirements: ['generation'] }
  }
  
  // Check diet requirement
  if (criteria.dietRequirement && creature.diet !== criteria.dietRequirement) {
    return { meets_requirements: false, total_score: 0, confidence: 0, missing_requirements: ['diet'] }
  }
  
  let totalScore = 0
  let maxPossibleScore = 0
  const missingRequirements = []
  
  // Evaluate required traits
  Object.entries(criteria.requiredTraits).forEach(([traitName, requirements]) => {
    const traitValue = getCreatureTraitValue(creature, traitName)
    const weight = requirements.weight || 1
    
    maxPossibleScore += weight
    
    let traitScore = 0
    let meetsRequirement = true
    
    // Check minimum requirement
    if (requirements.min !== undefined && traitValue < requirements.min) {
      meetsRequirement = false
      missingRequirements.push(`${traitName}_min`)
    }
    
    // Check maximum requirement
    if (requirements.max !== undefined && traitValue > requirements.max) {
      meetsRequirement = false
      missingRequirements.push(`${traitName}_max`)
    }
    
    if (meetsRequirement) {
      // Calculate score based on how well the trait fits
      if (requirements.min !== undefined && requirements.max !== undefined) {
        // Optimal range - score based on how close to center
        const center = (requirements.min + requirements.max) / 2
        const range = requirements.max - requirements.min
        const distance = Math.abs(traitValue - center)
        traitScore = Math.max(0, (1 - distance / (range / 2))) * weight
      } else if (requirements.min !== undefined) {
        // Minimum only - score based on how much above minimum
        const excess = Math.min(1, (traitValue - requirements.min) / (1 - requirements.min))
        traitScore = excess * weight
      } else if (requirements.max !== undefined) {
        // Maximum only - score based on how much below maximum
        const margin = Math.min(1, (requirements.max - traitValue) / requirements.max)
        traitScore = margin * weight
      }
    }
    
    totalScore += traitScore
  })
  
  // Apply environmental factors if available
  const environmentalBonus = calculateEnvironmentalBonus(criteria.environmentalFactor, populationContext)
  totalScore *= environmentalBonus
  
  const normalizedScore = totalScore / maxPossibleScore
  const confidence = missingRequirements.length === 0 ? normalizedScore : 0
  
  return {
    meets_requirements: missingRequirements.length === 0,
    total_score: normalizedScore,
    confidence: confidence,
    missing_requirements: missingRequirements
  }
}

// Get trait value from creature
function getCreatureTraitValue(creature, traitName) {
  switch (traitName) {
    case 'size':
      return creature.size || 0.5
    case 'speed':
      return creature.speed || 0.5
    case 'energyEfficiency':
      return creature.energyEfficiency || 0.8
    case 'intelligence':
      return creature.intelligence || 0.5
    case 'aggression':
      return creature.aggressiveness || 0.3
    case 'lifespan':
      return creature.maxAge || 60
    case 'reproductionRate':
      return creature.reproductionThreshold || 150
    default:
      return 0.5
  }
}

// Calculate environmental bonus based on current conditions
function calculateEnvironmentalBonus(environmentalFactor, populationContext) {
  // Base bonus of 1.0 (no change)
  let bonus = 1.0
  
  const { biome, season, population = [], foodSources = [] } = populationContext
  
  switch (environmentalFactor) {
    case 'abundant_vegetation':
      bonus = biome === 'forest' ? 1.2 : biome === 'desert' ? 0.8 : 1.0
      if (season === 'abundance') bonus *= 1.3
      if (season === 'drought') bonus *= 0.7
      break
      
    case 'diverse_vegetation':
      bonus = biome === 'forest' ? 1.3 : 1.0
      break
      
    case 'seed_availability':
      bonus = foodSources.length > 15 ? 1.2 : foodSources.length < 8 ? 0.8 : 1.0
      break
      
    case 'prey_abundance':
      const herbivores = population.filter(c => c.diet !== 'carnivore').length
      const carnivores = population.filter(c => c.diet === 'carnivore').length
      bonus = carnivores > 0 ? Math.min(1.5, herbivores / carnivores / 2) : 1.0
      break
      
    case 'social_opportunities':
      const similarCreatures = population.filter(c => c.diet === 'carnivore').length
      bonus = similarCreatures > 3 ? 1.3 : similarCreatures < 2 ? 0.8 : 1.0
      break
      
    case 'cover_availability':
      bonus = biome === 'forest' ? 1.3 : biome === 'ocean' ? 1.1 : 0.9
      break
      
    case 'carrion_availability':
      // More carrion available when there are more deaths (older population)
      const averageAge = population.length > 0 
        ? population.reduce((sum, c) => sum + (c.age || 0), 0) / population.length 
        : 0
      bonus = averageAge > 30 ? 1.2 : 1.0
      break
      
    case 'resource_diversity':
      bonus = biome === 'forest' ? 1.2 : biome === 'ocean' ? 1.1 : 1.0
      break
      
    case 'environmental_variability':
      bonus = season !== 'normal' ? 1.3 : 1.0
      break
  }
  
  return Math.max(0.5, Math.min(1.5, bonus))
}

// Apply specialization benefits to creature behavior
export function applySpecializationEffects(creature, specialization, gameContext = {}) {
  if (!specialization || !SPECIALIZATION_BENEFITS[specialization]) {
    return creature
  }
  
  const benefits = SPECIALIZATION_BENEFITS[specialization]
  const modifiedCreature = { ...creature }
  
  // Apply movement speed modifications
  if (benefits.movementSpeed) {
    modifiedCreature.effectiveSpeed = (creature.speed || 0.5) * benefits.movementSpeed
  }
  
  // Apply energy efficiency modifications
  if (benefits.energyFromFood) {
    modifiedCreature.foodEnergyMultiplier = benefits.energyFromFood
  }
  
  if (benefits.movementCost) {
    modifiedCreature.movementCostMultiplier = benefits.movementCost
  }
  
  // Apply hunting success modifications
  if (benefits.huntingSuccess) {
    modifiedCreature.huntingSuccessMultiplier = benefits.huntingSuccess
  }
  
  // Apply reproduction modifications
  if (benefits.reproductionRate) {
    modifiedCreature.reproductionMultiplier = benefits.reproductionRate
  }
  
  if (benefits.reproductionCost) {
    modifiedCreature.reproductionCostMultiplier = benefits.reproductionCost
  }
  
  // Store specialization info
  modifiedCreature.specialization = specialization
  modifiedCreature.specializationBenefits = benefits
  
  return modifiedCreature
}

// Get population-wide specialization statistics
export function analyzePopulationSpecialization(population, gameContext = {}) {
  const specializationCounts = {}
  const specializationStats = {
    totalSpecialized: 0,
    totalUnspecialized: 0,
    diversityIndex: 0,
    dominantSpecialization: null
  }
  
  // Initialize counts
  Object.values(SPECIALIZATION_TYPES).forEach(type => {
    specializationCounts[type] = 0
  })
  
  // Analyze each creature
  population.forEach(creature => {
    const analysis = analyzeSpecializationPotential(creature, gameContext)
    
    if (analysis.currentSpecialization) {
      specializationCounts[analysis.currentSpecialization]++
      specializationStats.totalSpecialized++
    } else {
      specializationStats.totalUnspecialized++
    }
  })
  
  // Calculate diversity index (Shannon diversity)
  const totalCreatures = population.length
  if (totalCreatures > 0) {
    let diversity = 0
    Object.values(specializationCounts).forEach(count => {
      if (count > 0) {
        const proportion = count / totalCreatures
        diversity -= proportion * Math.log2(proportion)
      }
    })
    specializationStats.diversityIndex = diversity
  }
  
  // Find dominant specialization
  const maxCount = Math.max(...Object.values(specializationCounts))
  if (maxCount > 0) {
    specializationStats.dominantSpecialization = Object.entries(specializationCounts)
      .find(([type, count]) => count === maxCount)[0]
  }
  
  return {
    counts: specializationCounts,
    stats: specializationStats,
    totalPopulation: totalCreatures
  }
}

// Generate specialization description for UI
export function getSpecializationDescription(specializationType) {
  const benefits = SPECIALIZATION_BENEFITS[specializationType]
  return benefits ? benefits.description : 'Unknown specialization'
}

// Check if creature can develop a specific specialization
export function canDevelopSpecialization(creature, specializationType, populationContext = {}) {
  const criteria = SPECIALIZATION_CRITERIA[specializationType]
  if (!criteria) return false
  
  const score = calculateSpecializationScore(creature, criteria, populationContext)
  return score.meets_requirements && score.confidence > 0.7
}