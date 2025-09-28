// Advanced Genetics System for Ecosystem Sandbox
// Implements realistic DNA-based trait inheritance with dominant/recessive genes

// Gene types and their possible alleles
export const GENE_TYPES = {
  SIZE: 'size',
  SPEED: 'speed', 
  ENERGY_EFFICIENCY: 'energyEfficiency',
  LIFESPAN: 'lifespan',
  REPRODUCTION_RATE: 'reproductionRate',
  AGGRESSION: 'aggression',
  INTELLIGENCE: 'intelligence',
  DIET_PREFERENCE: 'dietPreference'
}

// Trait categories for specialization
export const TRAIT_CATEGORIES = {
  PHYSICAL: 'physical',
  BEHAVIORAL: 'behavioral', 
  METABOLIC: 'metabolic',
  COGNITIVE: 'cognitive'
}

// Gene dominance relationships (true = dominant, false = recessive)
export const GENE_DOMINANCE = {
  [GENE_TYPES.SIZE]: {
    large: true,
    medium: false,
    small: false
  },
  [GENE_TYPES.SPEED]: {
    fast: true,
    medium: false,
    slow: false
  },
  [GENE_TYPES.ENERGY_EFFICIENCY]: {
    efficient: true,
    normal: false,
    inefficient: false
  },
  [GENE_TYPES.LIFESPAN]: {
    long: true,
    normal: false,
    short: false
  },
  [GENE_TYPES.REPRODUCTION_RATE]: {
    high: true,
    normal: false,
    low: false
  },
  [GENE_TYPES.AGGRESSION]: {
    aggressive: true,
    normal: false,
    passive: false
  },
  [GENE_TYPES.INTELLIGENCE]: {
    smart: true,
    normal: false,
    simple: false
  },
  [GENE_TYPES.DIET_PREFERENCE]: {
    carnivore: true,
    omnivore: false,
    herbivore: false
  }
}

// Gene expression ranges for numeric traits
export const GENE_EXPRESSION = {
  [GENE_TYPES.SIZE]: {
    large: { min: 0.8, max: 1.2 },
    medium: { min: 0.5, max: 0.8 },
    small: { min: 0.3, max: 0.5 }
  },
  [GENE_TYPES.SPEED]: {
    fast: { min: 0.8, max: 1.2 },
    medium: { min: 0.5, max: 0.8 },
    slow: { min: 0.2, max: 0.5 }
  },
  [GENE_TYPES.ENERGY_EFFICIENCY]: {
    efficient: { min: 1.0, max: 1.4 },
    normal: { min: 0.8, max: 1.0 },
    inefficient: { min: 0.6, max: 0.8 }
  },
  [GENE_TYPES.LIFESPAN]: {
    long: { min: 80, max: 120 },
    normal: { min: 60, max: 80 },
    short: { min: 40, max: 60 }
  },
  [GENE_TYPES.REPRODUCTION_RATE]: {
    high: { min: 120, max: 140 },
    normal: { min: 150, max: 170 },
    low: { min: 180, max: 220 }
  },
  [GENE_TYPES.AGGRESSION]: {
    aggressive: { min: 0.7, max: 1.0 },
    normal: { min: 0.3, max: 0.7 },
    passive: { min: 0.0, max: 0.3 }
  },
  [GENE_TYPES.INTELLIGENCE]: {
    smart: { min: 0.8, max: 1.0 },
    normal: { min: 0.5, max: 0.8 },
    simple: { min: 0.2, max: 0.5 }
  }
}

// Create a gene pair (diploid genetics)
export function createGenePair(geneType, allele1 = null, allele2 = null) {
  const possibleAlleles = Object.keys(GENE_DOMINANCE[geneType])
  
  return {
    geneType,
    allele1: allele1 || possibleAlleles[Math.floor(Math.random() * possibleAlleles.length)],
    allele2: allele2 || possibleAlleles[Math.floor(Math.random() * possibleAlleles.length)]
  }
}

// Generate a complete DNA sequence for a creature
export function generateDNA() {
  const dna = {}
  
  Object.values(GENE_TYPES).forEach(geneType => {
    dna[geneType] = createGenePair(geneType)
  })
  
  return dna
}

// Determine phenotype from genotype (which trait is expressed)
export function expressGene(genePair) {
  const { geneType, allele1, allele2 } = genePair
  const dominanceMap = GENE_DOMINANCE[geneType]
  
  // If both alleles are the same, express that trait
  if (allele1 === allele2) {
    return allele1
  }
  
  // If different, express the dominant one
  if (dominanceMap[allele1] && !dominanceMap[allele2]) {
    return allele1
  } else if (dominanceMap[allele2] && !dominanceMap[allele1]) {
    return allele2
  }
  
  // If both are dominant or both are recessive, randomly choose
  return Math.random() < 0.5 ? allele1 : allele2
}

// Generate numerical trait value from gene expression
export function generateTraitValue(geneType, expressedAllele, environmentalFactors = {}) {
  const expression = GENE_EXPRESSION[geneType]
  if (!expression || !expression[expressedAllele]) {
    return 0.5 // Default fallback
  }
  
  const { min, max } = expression[expressedAllele]
  let baseValue = min + Math.random() * (max - min)
  
  // Apply environmental influences (epigenetics)
  const environmentMultiplier = environmentalFactors[geneType] || 1.0
  baseValue *= environmentMultiplier
  
  return Math.max(0, baseValue)
}

// Create creature traits from DNA
export function expressCreatureTraits(dna, environmentalFactors = {}) {
  const traits = {}
  
  Object.entries(dna).forEach(([geneType, genePair]) => {
    const expressedAllele = expressGene(genePair)
    
    // Special handling for diet preference
    if (geneType === GENE_TYPES.DIET_PREFERENCE) {
      traits.diet = expressedAllele
      traits.dietPreference = expressedAllele
    } else {
      traits[geneType] = generateTraitValue(geneType, expressedAllele, environmentalFactors)
    }
    
    // Store the genotype for breeding purposes
    traits[`${geneType}Genotype`] = genePair
    traits[`${geneType}Phenotype`] = expressedAllele
  })
  
  return traits
}

// Sexual reproduction - combine DNA from two parents
export function reproduceGenetics(parent1DNA, parent2DNA, mutationRate = 0.05) {
  const childDNA = {}
  
  Object.values(GENE_TYPES).forEach(geneType => {
    const parent1Gene = parent1DNA[geneType]
    const parent2Gene = parent2DNA[geneType]
    
    // Random segregation - each parent contributes one allele
    const alleleFromParent1 = Math.random() < 0.5 ? parent1Gene.allele1 : parent1Gene.allele2
    const alleleFromParent2 = Math.random() < 0.5 ? parent2Gene.allele1 : parent2Gene.allele2
    
    let childAllele1 = alleleFromParent1
    let childAllele2 = alleleFromParent2
    
    // Apply mutations
    if (Math.random() < mutationRate) {
      const possibleAlleles = Object.keys(GENE_DOMINANCE[geneType])
      childAllele1 = possibleAlleles[Math.floor(Math.random() * possibleAlleles.length)]
    }
    
    if (Math.random() < mutationRate) {
      const possibleAlleles = Object.keys(GENE_DOMINANCE[geneType])
      childAllele2 = possibleAlleles[Math.floor(Math.random() * possibleAlleles.length)]
    }
    
    childDNA[geneType] = createGenePair(geneType, childAllele1, childAllele2)
  })
  
  return childDNA
}

// Calculate genetic similarity between two creatures (for breeding compatibility)
export function calculateGeneticSimilarity(dna1, dna2) {
  let similarityScore = 0
  let totalGenes = 0
  
  Object.values(GENE_TYPES).forEach(geneType => {
    const gene1 = dna1[geneType]
    const gene2 = dna2[geneType]
    
    // Count matching alleles
    let matches = 0
    if (gene1.allele1 === gene2.allele1 || gene1.allele1 === gene2.allele2) matches++
    if (gene1.allele2 === gene2.allele1 || gene1.allele2 === gene2.allele2) matches++
    
    similarityScore += matches / 2 // Normalize to 0-1 per gene
    totalGenes++
  })
  
  return similarityScore / totalGenes
}

// Analyze population genetic diversity
export function analyzeGeneticDiversity(population) {
  const alleleFrequencies = {}
  const genotypeFrequencies = {}
  
  // Initialize frequency counters
  Object.values(GENE_TYPES).forEach(geneType => {
    alleleFrequencies[geneType] = {}
    genotypeFrequencies[geneType] = {}
    
    Object.keys(GENE_DOMINANCE[geneType]).forEach(allele => {
      alleleFrequencies[geneType][allele] = 0
    })
  })
  
  // Count alleles and genotypes
  population.forEach(creature => {
    if (creature.dna) {
      Object.values(GENE_TYPES).forEach(geneType => {
        const genePair = creature.dna[geneType]
        
        // Count alleles
        alleleFrequencies[geneType][genePair.allele1]++
        alleleFrequencies[geneType][genePair.allele2]++
        
        // Count genotypes
        const genotype = `${genePair.allele1}/${genePair.allele2}`
        genotypeFrequencies[geneType][genotype] = (genotypeFrequencies[geneType][genotype] || 0) + 1
      })
    }
  })
  
  // Normalize frequencies
  const totalAlleles = population.length * 2
  Object.values(GENE_TYPES).forEach(geneType => {
    Object.keys(alleleFrequencies[geneType]).forEach(allele => {
      alleleFrequencies[geneType][allele] /= totalAlleles
    })
    
    Object.keys(genotypeFrequencies[geneType]).forEach(genotype => {
      genotypeFrequencies[geneType][genotype] /= population.length
    })
  })
  
  return {
    alleleFrequencies,
    genotypeFrequencies,
    populationSize: population.length,
    geneticDiversityIndex: calculateShannonDiversity(alleleFrequencies)
  }
}

// Calculate Shannon diversity index for genetic diversity
function calculateShannonDiversity(alleleFrequencies) {
  let totalDiversity = 0
  let geneCount = 0
  
  Object.values(alleleFrequencies).forEach(frequencies => {
    let geneDiversity = 0
    Object.values(frequencies).forEach(frequency => {
      if (frequency > 0) {
        geneDiversity -= frequency * Math.log2(frequency)
      }
    })
    totalDiversity += geneDiversity
    geneCount++
  })
  
  return totalDiversity / geneCount
}

// Create environmental factors that affect gene expression (epigenetics)
export function createEnvironmentalFactors(biomeType, season = 'normal', pressure = 0) {
  const factors = {}
  
  // Biome-specific factors
  switch (biomeType) {
    case 'forest':
      factors[GENE_TYPES.SIZE] = 0.9 // Dense forest favors smaller creatures
      factors[GENE_TYPES.SPEED] = 0.8 // Obstacles slow movement
      factors[GENE_TYPES.INTELLIGENCE] = 1.2 // Complex environment rewards intelligence
      break
      
    case 'desert':
      factors[GENE_TYPES.ENERGY_EFFICIENCY] = 1.3 // Harsh conditions favor efficiency
      factors[GENE_TYPES.SPEED] = 1.1 // Open terrain allows speed
      factors[GENE_TYPES.SIZE] = 1.1 // Larger creatures retain heat better
      break
      
    case 'ocean':
      factors[GENE_TYPES.SPEED] = 1.2 // Fluid medium favors speed
      factors[GENE_TYPES.AGGRESSION] = 1.1 // Predators do well in water
      factors[GENE_TYPES.SIZE] = 0.95 // Medium size optimal for swimming
      break
  }
  
  // Seasonal factors
  if (season === 'drought') {
    factors[GENE_TYPES.ENERGY_EFFICIENCY] = (factors[GENE_TYPES.ENERGY_EFFICIENCY] || 1.0) * 1.2
    factors[GENE_TYPES.REPRODUCTION_RATE] = (factors[GENE_TYPES.REPRODUCTION_RATE] || 1.0) * 0.8
  } else if (season === 'abundance') {
    factors[GENE_TYPES.REPRODUCTION_RATE] = (factors[GENE_TYPES.REPRODUCTION_RATE] || 1.0) * 1.2
    factors[GENE_TYPES.SIZE] = (factors[GENE_TYPES.SIZE] || 1.0) * 1.1
  }
  
  // Environmental pressure effects
  const pressureMultiplier = 1 + pressure * 0.1
  factors[GENE_TYPES.INTELLIGENCE] = (factors[GENE_TYPES.INTELLIGENCE] || 1.0) * pressureMultiplier
  factors[GENE_TYPES.ENERGY_EFFICIENCY] = (factors[GENE_TYPES.ENERGY_EFFICIENCY] || 1.0) * pressureMultiplier
  
  return factors
}