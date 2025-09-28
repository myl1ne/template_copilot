// Environmental Pressure System for Ecosystem Sandbox
// Integrates biome effects with creature genetics for realistic selection pressure

import { getBiomeConfig, BIOME_TYPES } from './BiomeConfig.js';
import { GENE_TYPES, expressGene } from './GeneticsSystem.js';

// Pressure types that can affect creatures
export const PRESSURE_TYPES = {
  RESOURCE_SCARCITY: 'resourceScarcity',
  PREDATION: 'predation',
  CLIMATE_STRESS: 'climateStress',
  COMPETITION: 'competition',
  ENVIRONMENTAL_TOXICITY: 'environmentalToxicity'
};

// Calculate comprehensive fitness based on genetics, behavior, and environment
export function calculateEnvironmentalFitness(creature, biome, populationContext = {}) {
  const biomeConfig = getBiomeConfig(biome);
  const traits = extractCreatureTraits(creature.genetics);
  
  let fitness = 0.5; // Base fitness starts neutral
  
  // Apply biome-specific selection pressures
  fitness += calculateBiomeFitness(traits, biomeConfig, biome);
  
  // Apply behavioral fitness modifiers
  fitness += calculateBehavioralFitness(traits, biome, populationContext);
  
  // Apply metabolic efficiency in environment
  fitness += calculateMetabolicFitness(traits, biomeConfig);
  
  // Apply social context fitness (if population data available)
  if (populationContext.population) {
    fitness += calculateSocialFitness(traits, populationContext);
  }
  
  // Ensure fitness stays within bounds
  return Math.max(0.1, Math.min(1.0, fitness));
}

// Extract numeric trait values from genetics for calculations
function extractCreatureTraits(genetics) {
  const traits = {};
  
  Object.keys(genetics).forEach(geneType => {
    const expressedAllele = expressGene(genetics[geneType]);
    traits[geneType] = {
      allele: expressedAllele,
      // Convert to numeric values for calculations where applicable
      value: convertToNumericValue(geneType, expressedAllele)
    };
  });
  
  return traits;
}

// Convert genetic alleles to numeric values for fitness calculations
function convertToNumericValue(geneType, allele) {
  // Physical traits (0.0 to 1.0 scale)
  const physicalScale = {
    large: 0.9, medium: 0.5, small: 0.1,
    fast: 0.9, slow: 0.1,
    efficient: 0.9, normal: 0.5, inefficient: 0.1,
    long: 0.9, short: 0.1,
    high: 0.9, low: 0.1
  };
  
  // Behavioral traits (0.0 to 1.0 scale)
  const behavioralScale = {
    aggressive: 0.9, passive: 0.1,
    smart: 0.9, simple: 0.1,
    gregarious: 0.9, solitary: 0.1,
    explorer: 0.9, homebody: 0.1,
    reckless: 0.9, cautious: 0.1,
    cooperative: 0.9, competitive: 0.1,
    territorial: 0.9, wanderer: 0.1,
    monogamous: 0.9, promiscuous: 0.1
  };
  
  // Diet preferences (categorical)
  const dietScale = {
    carnivore: 0.8, omnivore: 0.5, herbivore: 0.2
  };
  
  return physicalScale[allele] || behavioralScale[allele] || dietScale[allele] || 0.5;
}

// Calculate fitness based on how well traits match biome requirements
function calculateBiomeFitness(traits, biomeConfig, biome) {
  let biomeFitness = 0;
  
  switch (biome) {
    case BIOME_TYPES.FOREST:
      // Forest rewards energy efficiency and moderate size
      biomeFitness += (traits[GENE_TYPES.ENERGY_EFFICIENCY].value - 0.5) * 0.4;
      biomeFitness += (0.6 - Math.abs(traits[GENE_TYPES.SIZE].value - 0.5)) * 0.3;
      // Intelligence helps navigate complex environment
      biomeFitness += (traits[GENE_TYPES.INTELLIGENCE].value - 0.5) * 0.2;
      break;
      
    case BIOME_TYPES.DESERT:
      // Desert heavily favors efficiency and small size
      biomeFitness += (traits[GENE_TYPES.ENERGY_EFFICIENCY].value - 0.5) * 0.5;
      biomeFitness += (0.9 - traits[GENE_TYPES.SIZE].value) * 0.4; // Smaller is better
      // Speed helps find scarce resources
      biomeFitness += (traits[GENE_TYPES.SPEED].value - 0.5) * 0.2;
      break;
      
    case BIOME_TYPES.OCEAN:
      // Ocean favors larger creatures and aggression
      biomeFitness += (traits[GENE_TYPES.SIZE].value - 0.5) * 0.3;
      biomeFitness += (traits[GENE_TYPES.AGGRESSION].value - 0.5) * 0.3;
      // Exploration helps in 3D environment
      biomeFitness += (traits[GENE_TYPES.EXPLORATION_TENDENCY]?.value - 0.5) * 0.2 || 0;
      break;
  }
  
  // Apply biome's energy drain multiplier effect
  const energyStress = (biomeConfig.energyDrainMultiplier - 1.0);
  biomeFitness -= energyStress * (1.0 - traits[GENE_TYPES.ENERGY_EFFICIENCY].value) * 0.3;
  
  return biomeFitness;
}

// Calculate fitness based on behavioral traits and social context
function calculateBehavioralFitness(traits, biome, populationContext) {
  let behavioralFitness = 0;
  
  // Social behavior effects
  if (traits[GENE_TYPES.SOCIAL_BEHAVIOR]) {
    const socialValue = traits[GENE_TYPES.SOCIAL_BEHAVIOR].value;
    const populationDensity = populationContext.density || 0.5;
    
    // Gregarious creatures do better in high density, solitary in low density
    if (socialValue > 0.7) { // Gregarious
      behavioralFitness += (populationDensity - 0.5) * 0.3;
    } else if (socialValue < 0.3) { // Solitary
      behavioralFitness += (0.5 - populationDensity) * 0.3;
    }
  }
  
  // Exploration vs territory behavior
  if (traits[GENE_TYPES.EXPLORATION_TENDENCY] && traits[GENE_TYPES.TERRITORIALITY]) {
    const exploration = traits[GENE_TYPES.EXPLORATION_TENDENCY].value;
    const territorial = traits[GENE_TYPES.TERRITORIALITY].value;
    
    // Resource abundance affects optimal strategy
    const resourceAbundance = populationContext.resourceAbundance || 0.5;
    
    if (resourceAbundance < 0.3) {
      // Low resources favor exploration
      behavioralFitness += (exploration - 0.5) * 0.2;
    } else if (resourceAbundance > 0.7) {
      // High resources favor territorial behavior
      behavioralFitness += (territorial - 0.5) * 0.2;
    }
  }
  
  // Risk tolerance affects survival in different conditions
  if (traits[GENE_TYPES.RISK_TOLERANCE]) {
    const riskTolerance = traits[GENE_TYPES.RISK_TOLERANCE].value;
    const environmentalRisk = getEnvironmentalRisk(biome);
    
    // High risk environments punish reckless behavior
    if (environmentalRisk > 0.6 && riskTolerance > 0.7) {
      behavioralFitness -= 0.2;
    }
    // Low risk environments reward moderate risk-taking
    else if (environmentalRisk < 0.4 && riskTolerance > 0.4 && riskTolerance < 0.8) {
      behavioralFitness += 0.1;
    }
  }
  
  return behavioralFitness;
}

// Calculate metabolic fitness based on energy requirements
function calculateMetabolicFitness(traits, biomeConfig) {
  let metabolicFitness = 0;
  
  const efficiency = traits[GENE_TYPES.ENERGY_EFFICIENCY].value;
  const size = traits[GENE_TYPES.SIZE].value;
  
  // Larger creatures need more energy - efficiency becomes more important
  const sizeEnergyPenalty = size * 0.3;
  const efficiencyBonus = efficiency * 0.4;
  
  metabolicFitness = efficiencyBonus - sizeEnergyPenalty;
  
  // Biome energy drain affects metabolic fitness
  const biomeDrain = biomeConfig.energyDrainMultiplier;
  metabolicFitness -= (biomeDrain - 1.0) * (1.0 - efficiency) * 0.2;
  
  return metabolicFitness;
}

// Calculate social fitness based on population composition
function calculateSocialFitness(traits, populationContext) {
  let socialFitness = 0;
  
  if (!populationContext.population) return socialFitness;
  
  const population = populationContext.population;
  const cooperation = traits[GENE_TYPES.COOPERATION_LEVEL]?.value || 0.5;
  const aggression = traits[GENE_TYPES.AGGRESSION].value;
  
  // Count cooperative vs competitive neighbors
  let cooperativeNeighbors = 0;
  let competitiveNeighbors = 0;
  
  population.forEach(other => {
    if (other.genetics) {
      const otherTraits = extractCreatureTraits(other.genetics);
      const otherCooperation = otherTraits[GENE_TYPES.COOPERATION_LEVEL]?.value || 0.5;
      
      if (otherCooperation > 0.6) cooperativeNeighbors++;
      else if (otherCooperation < 0.4) competitiveNeighbors++;
    }
  });
  
  const totalNeighbors = cooperativeNeighbors + competitiveNeighbors;
  if (totalNeighbors > 0) {
    const cooperativeRatio = cooperativeNeighbors / totalNeighbors;
    
    // Cooperative creatures do better with other cooperators
    if (cooperation > 0.6) {
      socialFitness += cooperativeRatio * 0.2;
    }
    // Competitive creatures do better with fewer competitors
    else if (cooperation < 0.4) {
      socialFitness += (1.0 - cooperativeRatio) * 0.2;
    }
  }
  
  return socialFitness;
}

// Get environmental risk level for a biome
function getEnvironmentalRisk(biome) {
  switch (biome) {
    case BIOME_TYPES.DESERT: return 0.8; // High risk
    case BIOME_TYPES.OCEAN: return 0.6;  // Medium-high risk
    case BIOME_TYPES.FOREST: return 0.4; // Medium risk
    default: return 0.5;
  }
}

// Apply selection pressure over time (for multi-generational evolution)
export function applySelectionPressure(population, biome, pressureIntensity = 1.0) {
  const populationContext = {
    population,
    density: Math.min(population.length / 50, 1.0), // Normalize to 0-1
    resourceAbundance: calculateResourceAbundance(population, biome)
  };
  
  // Calculate relative fitness for each creature
  const fitnessScores = population.map(creature => ({
    creature,
    fitness: calculateEnvironmentalFitness(creature, biome, populationContext)
  }));
  
  // Sort by fitness (highest first)
  fitnessScores.sort((a, b) => b.fitness - a.fitness);
  
  // Apply selection pressure - remove least fit individuals
  const survivalRate = Math.max(0.5, 1.0 - (pressureIntensity * 0.3));
  const survivorCount = Math.floor(population.length * survivalRate);
  
  return {
    survivors: fitnessScores.slice(0, survivorCount).map(item => ({
      ...item.creature,
      fitness: item.fitness
    })),
    eliminated: fitnessScores.slice(survivorCount).map(item => item.creature),
    averageFitness: fitnessScores.reduce((sum, item) => sum + item.fitness, 0) / fitnessScores.length
  };
}

// Calculate resource abundance based on population and biome
function calculateResourceAbundance(population, biome) {
  const biomeConfig = getBiomeConfig(biome);
  const baseFood = (biomeConfig.foodCount.min + biomeConfig.foodCount.max) / 2;
  const populationPressure = population.length / 30; // Normalize around 30 creatures
  
  return Math.max(0.1, Math.min(1.0, (baseFood / 20) / populationPressure));
}

// Create environmental pressure events (disasters, resource changes, etc.)
export const PRESSURE_EVENTS = {
  DROUGHT: {
    name: 'Drought',
    duration: 5, // seconds
    effects: {
      resourceMultiplier: 0.3,
      energyDrainMultiplier: 1.5,
      fitnessModifier: (traits) => {
        // Favor efficient and small creatures
        return (traits[GENE_TYPES.ENERGY_EFFICIENCY].value - 0.5) * 0.4 +
               (0.8 - traits[GENE_TYPES.SIZE].value) * 0.3;
      }
    }
  },
  
  ABUNDANCE: {
    name: 'Resource Abundance', 
    duration: 8,
    effects: {
      resourceMultiplier: 2.0,
      energyDrainMultiplier: 0.8,
      fitnessModifier: (traits) => {
        // Favor larger, more social creatures
        return (traits[GENE_TYPES.SIZE].value - 0.5) * 0.3 +
               (traits[GENE_TYPES.SOCIAL_BEHAVIOR]?.value - 0.5) * 0.2 || 0;
      }
    }
  },
  
  PREDATOR_PRESSURE: {
    name: 'Increased Predation',
    duration: 6,
    effects: {
      resourceMultiplier: 1.0,
      energyDrainMultiplier: 1.2,
      fitnessModifier: (traits) => {
        // Favor fast, cautious, and social creatures
        return (traits[GENE_TYPES.SPEED].value - 0.5) * 0.3 +
               (0.8 - traits[GENE_TYPES.RISK_TOLERANCE]?.value) * 0.2 +
               (traits[GENE_TYPES.SOCIAL_BEHAVIOR]?.value - 0.5) * 0.2 || 0;
      }
    }
  }
};

export default {
  calculateEnvironmentalFitness,
  applySelectionPressure,
  PRESSURE_TYPES,
  PRESSURE_EVENTS
};