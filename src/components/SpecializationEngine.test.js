import { describe, it, expect, beforeEach } from 'vitest'
import {
  SPECIALIZATION_TYPES,
  analyzeSpecializationPotential,
  applySpecializationEffects,
  analyzePopulationSpecialization,
  getSpecializationDescription,
  canDevelopSpecialization
} from './SpecializationEngine'

describe('SpecializationEngine', () => {
  let testCreatures

  beforeEach(() => {
    testCreatures = {
      earlyGeneration: {
        id: 1,
        generation: 1,
        diet: 'herbivore',
        size: 0.5,
        speed: 0.5,
        energyEfficiency: 0.8,
        intelligence: 0.5,
        aggressiveness: 0.2,
        maxAge: 60,
        reproductionThreshold: 150
      },
      
      grazingSpecialist: {
        id: 2,
        generation: 4,
        diet: 'herbivore',
        size: 0.9,           // Large
        speed: 0.4,          // Slow
        energyEfficiency: 1.0, // Highly efficient
        intelligence: 0.5,
        aggressiveness: 0.1, // Very peaceful
        maxAge: 80,
        reproductionThreshold: 140
      },
      
      apexPredator: {
        id: 3,
        generation: 5,
        diet: 'carnivore',
        size: 1.0,           // Large
        speed: 0.8,          // Fast
        energyEfficiency: 0.7,
        intelligence: 0.8,   // Smart
        aggressiveness: 0.9, // Very aggressive
        maxAge: 100,
        reproductionThreshold: 200
      },
      
      packHunter: {
        id: 4,
        generation: 3,
        diet: 'carnivore',
        size: 0.6,           // Medium
        speed: 0.7,          // Fast
        energyEfficiency: 0.6,
        intelligence: 0.9,   // Very smart
        aggressiveness: 0.6, // Moderate aggression
        maxAge: 75,
        reproductionThreshold: 170
      },
      
      generalist: {
        id: 5,
        generation: 3,
        diet: 'omnivore',
        size: 0.6,           // Medium
        speed: 0.6,          // Moderate speed
        energyEfficiency: 0.8,
        intelligence: 0.8,   // Smart
        aggressiveness: 0.4,
        maxAge: 70,
        reproductionThreshold: 160
      }
    }
  })

  describe('Specialization Analysis', () => {
    it('should not specialize creatures from early generations', () => {
      const analysis = analyzeSpecializationPotential(testCreatures.earlyGeneration)
      expect(analysis.currentSpecialization).toBeNull()
      expect(analysis.potentialSpecializations.length).toBe(0)
    })

    it('should identify grazing specialization', () => {
      const populationContext = {
        biome: 'forest',
        season: 'abundance',
        population: [testCreatures.grazingSpecialist],
        foodSources: new Array(20).fill({ energy: 50 })
      }
      
      const analysis = analyzeSpecializationPotential(testCreatures.grazingSpecialist, populationContext)
      
      expect(analysis.currentSpecialization).toBe(SPECIALIZATION_TYPES.GRAZER)
      expect(analysis.specializationStrength).toBeGreaterThan(0.8)
    })

    it('should identify apex predator specialization', () => {
      const populationContext = {
        biome: 'forest',
        season: 'normal',
        population: [testCreatures.apexPredator, ...Array(10).fill(testCreatures.grazingSpecialist)],
        foodSources: []
      }
      
      const analysis = analyzeSpecializationPotential(testCreatures.apexPredator, populationContext)
      
      expect(analysis.currentSpecialization).toBe(SPECIALIZATION_TYPES.APEX_PREDATOR)
      expect(analysis.specializationStrength).toBeGreaterThan(0.7)
    })

    it('should identify pack hunter specialization', () => {
      const populationContext = {
        biome: 'forest',
        season: 'normal',
        population: Array(5).fill({ ...testCreatures.packHunter, diet: 'carnivore' }),
        foodSources: []
      }
      
      const analysis = analyzeSpecializationPotential(testCreatures.packHunter, populationContext)
      
      expect(analysis.currentSpecialization).toBe(SPECIALIZATION_TYPES.PACK_HUNTER)
      expect(analysis.specializationStrength).toBeGreaterThan(0.7)
    })

    it('should identify generalist specialization', () => {
      const populationContext = {
        biome: 'forest',
        season: 'normal',
        population: [testCreatures.generalist],
        foodSources: new Array(15).fill({ energy: 50 })
      }
      
      const analysis = analyzeSpecializationPotential(testCreatures.generalist, populationContext)
      
      expect(analysis.currentSpecialization).toBe(SPECIALIZATION_TYPES.GENERALIST)
      expect(analysis.specializationStrength).toBeGreaterThan(0.6)
    })

    it('should respect diet requirements', () => {
      // Try to analyze a herbivore for carnivore specializations
      const analysis = analyzeSpecializationPotential(testCreatures.grazingSpecialist)
      
      const carnivorePotentials = analysis.potentialSpecializations.filter(spec => 
        [SPECIALIZATION_TYPES.APEX_PREDATOR, SPECIALIZATION_TYPES.PACK_HUNTER].includes(spec.type)
      )
      
      expect(carnivorePotentials.length).toBe(0)
    })
  })

  describe('Specialization Effects', () => {
    it('should apply grazer benefits correctly', () => {
      const modifiedCreature = applySpecializationEffects(
        testCreatures.grazingSpecialist, 
        SPECIALIZATION_TYPES.GRAZER
      )
      
      expect(modifiedCreature.specialization).toBe(SPECIALIZATION_TYPES.GRAZER)
      expect(modifiedCreature.foodEnergyMultiplier).toBe(1.4)
      expect(modifiedCreature.movementCostMultiplier).toBe(0.8)
      expect(modifiedCreature.specializationBenefits).toBeDefined()
    })

    it('should apply apex predator benefits correctly', () => {
      const modifiedCreature = applySpecializationEffects(
        testCreatures.apexPredator, 
        SPECIALIZATION_TYPES.APEX_PREDATOR
      )
      
      expect(modifiedCreature.specialization).toBe(SPECIALIZATION_TYPES.APEX_PREDATOR)
      expect(modifiedCreature.huntingSuccessMultiplier).toBe(1.5)
      expect(modifiedCreature.reproductionCostMultiplier).toBe(1.3)
    })

    it('should apply pack hunter benefits correctly', () => {
      const modifiedCreature = applySpecializationEffects(
        testCreatures.packHunter, 
        SPECIALIZATION_TYPES.PACK_HUNTER
      )
      
      expect(modifiedCreature.specialization).toBe(SPECIALIZATION_TYPES.PACK_HUNTER)
      expect(modifiedCreature.huntingSuccessMultiplier).toBe(1.3)
    })

    it('should not modify creature without specialization', () => {
      const originalCreature = testCreatures.earlyGeneration
      const modifiedCreature = applySpecializationEffects(originalCreature, null)
      
      expect(modifiedCreature).toEqual(originalCreature)
      expect(modifiedCreature.specialization).toBeUndefined()
    })
  })

  describe('Population Analysis', () => {
    it('should analyze population specialization distribution', () => {
      const population = [
        { ...testCreatures.grazingSpecialist, id: 1 },
        { ...testCreatures.grazingSpecialist, id: 2 },
        { ...testCreatures.apexPredator, id: 3 },
        { ...testCreatures.packHunter, id: 4 },
        { ...testCreatures.generalist, id: 5 },
        { ...testCreatures.earlyGeneration, id: 6 } // Unspecialized
      ]
      
      const gameContext = {
        biome: 'forest',
        season: 'normal',
        population: population,
        foodSources: new Array(20).fill({ energy: 50 })
      }
      
      const analysis = analyzePopulationSpecialization(population, gameContext)
      
      expect(analysis.totalPopulation).toBe(6)
      expect(analysis.stats.totalSpecialized).toBeGreaterThan(0)
      expect(analysis.stats.totalUnspecialized).toBeGreaterThan(0)
      expect(analysis.stats.diversityIndex).toBeGreaterThan(0)
      expect(analysis.counts).toBeDefined()
      
      // Should have counts for different specializations
      const nonZeroCounts = Object.values(analysis.counts).filter(count => count > 0)
      expect(nonZeroCounts.length).toBeGreaterThan(1)
    })

    it('should calculate diversity index correctly', () => {
      // Create population with equal distribution
      const population = [
        { ...testCreatures.grazingSpecialist, id: 1 },
        { ...testCreatures.apexPredator, id: 2 }
      ]
      
      const gameContext = {
        biome: 'forest',
        season: 'normal',
        population: population,
        foodSources: new Array(20).fill({ energy: 50 })
      }
      
      const analysis = analyzePopulationSpecialization(population, gameContext)
      
      // Equal distribution should have higher diversity than skewed distribution
      expect(analysis.stats.diversityIndex).toBeGreaterThan(0)
    })

    it('should identify dominant specialization', () => {
      const population = [
        { ...testCreatures.grazingSpecialist, id: 1 },
        { ...testCreatures.grazingSpecialist, id: 2 },
        { ...testCreatures.grazingSpecialist, id: 3 },
        { ...testCreatures.apexPredator, id: 4 }
      ]
      
      const gameContext = {
        biome: 'forest',
        season: 'normal',
        population: population,
        foodSources: new Array(20).fill({ energy: 50 })
      }
      
      const analysis = analyzePopulationSpecialization(population, gameContext)
      
      expect(analysis.stats.dominantSpecialization).toBe(SPECIALIZATION_TYPES.GRAZER)
    })
  })

  describe('Environmental Factors', () => {
    it('should boost forest specialists in forest biome', () => {
      const populationContext = {
        biome: 'forest',
        season: 'abundance',
        population: [testCreatures.grazingSpecialist],
        foodSources: new Array(25).fill({ energy: 50 })
      }
      
      const forestAnalysis = analyzeSpecializationPotential(testCreatures.grazingSpecialist, populationContext)
      
      const desertContext = { ...populationContext, biome: 'desert' }
      const desertAnalysis = analyzeSpecializationPotential(testCreatures.grazingSpecialist, desertContext)
      
      // Forest should provide better conditions for grazers
      expect(forestAnalysis.specializationStrength).toBeGreaterThan(desertAnalysis.specializationStrength)
    })

    it('should consider prey abundance for predators', () => {
      const abundantPreyContext = {
        biome: 'forest',
        season: 'normal',
        population: [testCreatures.apexPredator, ...Array(20).fill(testCreatures.grazingSpecialist)],
        foodSources: []
      }
      
      const scarcePreyContext = {
        biome: 'forest',
        season: 'normal',
        population: [testCreatures.apexPredator, testCreatures.grazingSpecialist],
        foodSources: []
      }
      
      const abundantAnalysis = analyzeSpecializationPotential(testCreatures.apexPredator, abundantPreyContext)
      const scarceAnalysis = analyzeSpecializationPotential(testCreatures.apexPredator, scarcePreyContext)
      
      // Abundant prey should favor predator specialization
      expect(abundantAnalysis.specializationStrength).toBeGreaterThan(scarceAnalysis.specializationStrength)
    })
  })

  describe('Utility Functions', () => {
    it('should provide specialization descriptions', () => {
      const description = getSpecializationDescription(SPECIALIZATION_TYPES.GRAZER)
      expect(description).toBeDefined()
      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(0)
    })

    it('should check specialization development potential', () => {
      const canDevelop = canDevelopSpecialization(
        testCreatures.grazingSpecialist, 
        SPECIALIZATION_TYPES.GRAZER,
        {
          biome: 'forest',
          season: 'abundance',
          population: [testCreatures.grazingSpecialist],
          foodSources: new Array(20).fill({ energy: 50 })
        }
      )
      
      expect(canDevelop).toBe(true)
    })

    it('should reject inappropriate specialization development', () => {
      const canDevelop = canDevelopSpecialization(
        testCreatures.grazingSpecialist,
        SPECIALIZATION_TYPES.APEX_PREDATOR // Herbivore can't be apex predator
      )
      
      expect(canDevelop).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle creatures without generation', () => {
      const creatureWithoutGeneration = { ...testCreatures.grazingSpecialist }
      delete creatureWithoutGeneration.generation
      
      const analysis = analyzeSpecializationPotential(creatureWithoutGeneration)
      expect(analysis.currentSpecialization).toBeNull()
    })

    it('should handle empty population context', () => {
      const analysis = analyzeSpecializationPotential(testCreatures.grazingSpecialist, {})
      expect(analysis).toBeDefined()
      expect(analysis.potentialSpecializations).toBeDefined()
    })

    it('should handle unknown specialization type', () => {
      const description = getSpecializationDescription('unknown_type')
      expect(description).toBe('Unknown specialization')
    })
  })
})