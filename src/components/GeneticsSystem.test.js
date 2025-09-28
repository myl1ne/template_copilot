import { describe, it, expect, beforeEach } from 'vitest'
import {
  GENE_TYPES,
  generateDNA,
  createGenePair,
  expressGene,
  generateTraitValue,
  expressCreatureTraits,
  reproduceGenetics,
  calculateGeneticSimilarity,
  analyzeGeneticDiversity,
  createEnvironmentalFactors
} from './GeneticsSystem'

describe('GeneticsSystem', () => {
  let testDNA

  beforeEach(() => {
    testDNA = generateDNA()
  })

  describe('DNA Generation', () => {
    it('should generate complete DNA with all gene types', () => {
      expect(testDNA).toBeDefined()
      Object.values(GENE_TYPES).forEach(geneType => {
        expect(testDNA[geneType]).toBeDefined()
        expect(testDNA[geneType].geneType).toBe(geneType)
        expect(testDNA[geneType].allele1).toBeDefined()
        expect(testDNA[geneType].allele2).toBeDefined()
      })
    })

    it('should create valid gene pairs', () => {
      const genePair = createGenePair(GENE_TYPES.SIZE, 'large', 'small')
      expect(genePair.geneType).toBe(GENE_TYPES.SIZE)
      expect(genePair.allele1).toBe('large')
      expect(genePair.allele2).toBe('small')
    })

    it('should create random gene pairs when no alleles specified', () => {
      const genePair = createGenePair(GENE_TYPES.SPEED)
      expect(genePair.geneType).toBe(GENE_TYPES.SPEED)
      expect(['fast', 'medium', 'slow']).toContain(genePair.allele1)
      expect(['fast', 'medium', 'slow']).toContain(genePair.allele2)
    })
  })

  describe('Gene Expression', () => {
    it('should express dominant alleles correctly', () => {
      const dominantGenePair = createGenePair(GENE_TYPES.SIZE, 'large', 'small')
      const expressedTrait = expressGene(dominantGenePair)
      expect(expressedTrait).toBe('large') // large is dominant over small
    })

    it('should express homozygous genes correctly', () => {
      const homozygousGenePair = createGenePair(GENE_TYPES.SPEED, 'fast', 'fast')
      const expressedTrait = expressGene(homozygousGenePair)
      expect(expressedTrait).toBe('fast')
    })

    it('should generate trait values within expected ranges', () => {
      const traitValue = generateTraitValue(GENE_TYPES.SIZE, 'large')
      expect(traitValue).toBeGreaterThanOrEqual(0.8)
      expect(traitValue).toBeLessThanOrEqual(1.2)
    })

    it('should apply environmental factors to trait expression', () => {
      const baseValue = generateTraitValue(GENE_TYPES.SIZE, 'large')
      const environmentalFactors = { [GENE_TYPES.SIZE]: 1.5 }
      const modifiedValue = generateTraitValue(GENE_TYPES.SIZE, 'large', environmentalFactors)
      
      // Modified value should be affected by environmental factor
      expect(modifiedValue).toBeGreaterThan(baseValue * 0.9) // Allow for some randomness
    })
  })

  describe('Creature Trait Expression', () => {
    it('should express all traits from DNA', () => {
      const traits = expressCreatureTraits(testDNA)
      
      Object.values(GENE_TYPES).forEach(geneType => {
        if (geneType === GENE_TYPES.DIET_PREFERENCE) {
          expect(traits.diet).toBeDefined()
          expect(traits.dietPreference).toBeDefined()
        } else {
          expect(traits[geneType]).toBeDefined()
          expect(typeof traits[geneType]).toBe('number')
        }
        
        // Should store genotype and phenotype
        expect(traits[`${geneType}Genotype`]).toBeDefined()
        expect(traits[`${geneType}Phenotype`]).toBeDefined()
      })
    })

    it('should handle diet preference correctly', () => {
      const carnivoreGenePair = createGenePair(GENE_TYPES.DIET_PREFERENCE, 'carnivore', 'herbivore')
      const testDNAWithCarnivore = { ...testDNA, [GENE_TYPES.DIET_PREFERENCE]: carnivoreGenePair }
      const traits = expressCreatureTraits(testDNAWithCarnivore)
      
      expect(['carnivore', 'herbivore']).toContain(traits.diet)
      expect(traits.diet).toBe(traits.dietPreference)
    })
  })

  describe('Genetic Reproduction', () => {
    let parent1DNA, parent2DNA

    beforeEach(() => {
      parent1DNA = generateDNA()
      parent2DNA = generateDNA()
    })

    it('should create offspring DNA from two parents', () => {
      const childDNA = reproduceGenetics(parent1DNA, parent2DNA, 0) // No mutations for testing
      
      Object.values(GENE_TYPES).forEach(geneType => {
        expect(childDNA[geneType]).toBeDefined()
        expect(childDNA[geneType].geneType).toBe(geneType)
        
        // Child should inherit alleles from parents
        const parent1Alleles = [parent1DNA[geneType].allele1, parent1DNA[geneType].allele2]
        const parent2Alleles = [parent2DNA[geneType].allele1, parent2DNA[geneType].allele2]
        
        expect(parent1Alleles).toContain(childDNA[geneType].allele1)
        expect(parent2Alleles).toContain(childDNA[geneType].allele2)
      })
    })

    it('should apply mutations when mutation rate is high', () => {
      const childDNA1 = reproduceGenetics(parent1DNA, parent2DNA, 0) // No mutations
      const childDNA2 = reproduceGenetics(parent1DNA, parent2DNA, 1) // 100% mutation rate
      
      // With 100% mutation rate, some genes should be different
      let hasMutations = false
      Object.values(GENE_TYPES).forEach(geneType => {
        if (childDNA1[geneType].allele1 !== childDNA2[geneType].allele1 ||
            childDNA1[geneType].allele2 !== childDNA2[geneType].allele2) {
          hasMutations = true
        }
      })
      
      expect(hasMutations).toBe(true)
    })
  })

  describe('Genetic Analysis', () => {
    it('should calculate genetic similarity between creatures', () => {
      const identicalDNA = JSON.parse(JSON.stringify(testDNA)) // Deep copy
      const similarity = calculateGeneticSimilarity(testDNA, identicalDNA)
      expect(similarity).toBe(1.0) // Identical DNA should have 100% similarity
    })

    it('should calculate lower similarity for different DNA', () => {
      const differentDNA = generateDNA()
      const similarity = calculateGeneticSimilarity(testDNA, differentDNA)
      expect(similarity).toBeGreaterThanOrEqual(0)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('should analyze population genetic diversity', () => {
      const population = []
      
      // Create a small population with DNA
      for (let i = 0; i < 10; i++) {
        population.push({
          id: i,
          dna: generateDNA()
        })
      }
      
      const analysis = analyzeGeneticDiversity(population)
      
      expect(analysis.populationSize).toBe(10)
      expect(analysis.alleleFrequencies).toBeDefined()
      expect(analysis.genotypeFrequencies).toBeDefined()
      expect(analysis.geneticDiversityIndex).toBeGreaterThanOrEqual(0)
      
      // Check that frequencies are properly normalized
      Object.values(analysis.alleleFrequencies).forEach(frequencies => {
        const total = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0)
        expect(Math.abs(total - 1.0)).toBeLessThan(0.001) // Allow for floating point precision
      })
    })
  })

  describe('Environmental Factors', () => {
    it('should create biome-specific environmental factors', () => {
      const forestFactors = createEnvironmentalFactors('forest')
      expect(forestFactors[GENE_TYPES.INTELLIGENCE]).toBeGreaterThan(1) // Forest rewards intelligence
      
      const desertFactors = createEnvironmentalFactors('desert')
      expect(desertFactors[GENE_TYPES.ENERGY_EFFICIENCY]).toBeGreaterThan(1) // Desert rewards efficiency
      
      const oceanFactors = createEnvironmentalFactors('ocean')
      expect(oceanFactors[GENE_TYPES.SPEED]).toBeGreaterThan(1) // Ocean rewards speed
    })

    it('should apply seasonal modifiers', () => {
      const droughtFactors = createEnvironmentalFactors('forest', 'drought')
      expect(droughtFactors[GENE_TYPES.ENERGY_EFFICIENCY]).toBeGreaterThan(1)
      
      const abundanceFactors = createEnvironmentalFactors('forest', 'abundance')
      expect(abundanceFactors[GENE_TYPES.REPRODUCTION_RATE]).toBeGreaterThan(1)
    })

    it('should apply environmental pressure effects', () => {
      const highPressureFactors = createEnvironmentalFactors('forest', 'normal', 0.5)
      expect(highPressureFactors[GENE_TYPES.INTELLIGENCE]).toBeGreaterThan(1)
      expect(highPressureFactors[GENE_TYPES.ENERGY_EFFICIENCY]).toBeGreaterThan(1)
    })
  })
})