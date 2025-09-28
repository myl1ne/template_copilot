// Enhanced Evolution Experiment: Biome Specialization Pressure Test with Behavioral Genetics
// Tests how creatures with different genetic profiles adapt to biome switching
// Now includes behavioral genetics and improved environmental pressure

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createGenePair,
  reproduceGenetics,
  calculateGeneticSimilarity,
  generateDNA,
  expressGene,
  GENE_TYPES 
} from '../components/GeneticsSystem.js';
import { 
  analyzeSpecializationPotential,
  SPECIALIZATION_TYPES 
} from '../components/SpecializationEngine.js';
import { 
  BIOME_TYPES, 
  getBiomeConfig 
} from '../components/BiomeConfig.js';
import {
  calculateEnvironmentalFitness,
  applySelectionPressure,
  PRESSURE_TYPES
} from '../components/EnvironmentalPressure.js';

describe('Enhanced Evolution Experiment: Behavioral & Environmental Pressure', () => {
  let testPopulation;
  
  beforeEach(() => {
    // Create diverse test population with behavioral genetics
    testPopulation = createEnhancedTestPopulation();
  });

  it('should demonstrate enhanced environmental and behavioral selection pressure', () => {
    console.log('🧬 ENHANCED EVOLUTION EXPERIMENT: Behavioral & Environmental Pressure Test');
    console.log('='.repeat(80));
    
    const results = runEnhancedBiomeExperiment();
    
    // Validate experiment completed with meaningful results
    expect(results.generations).toBeDefined();
    expect(results.generations.length).toBeGreaterThan(0);
    expect(results.behavioralEvolution).toBeDefined();
    
    // Validate that fitness actually varies (showing pressure system works)
    const fitnessValues = results.generations.map(g => g.avgFitness);
    const fitnessVariation = Math.max(...fitnessValues) - Math.min(...fitnessValues);
    expect(fitnessVariation).toBeGreaterThan(0.1); // Should show environmental pressure
    
    console.log('\n📊 ENHANCED EXPERIMENT COMPLETED SUCCESSFULLY');
    console.log('Results show improved environmental pressure integration');
  });

  function createEnhancedTestPopulation() {
    const population = [];
    
    // Create different genetic archetypes including behavioral traits
    const archetypes = [
      { 
        name: 'Social-Herbivore', 
        size: 'large', speed: 'slow', energyEfficiency: 'efficient', aggression: 'passive',
        socialBehavior: 'gregarious', explorationTendency: 'homebody', riskTolerance: 'cautious',
        cooperationLevel: 'cooperative', territoriality: 'wanderer'
      },
      { 
        name: 'Territorial-Carnivore', 
        size: 'medium', speed: 'fast', energyEfficiency: 'normal', aggression: 'aggressive',
        socialBehavior: 'solitary', explorationTendency: 'explorer', riskTolerance: 'reckless',
        cooperationLevel: 'competitive', territoriality: 'territorial'
      },
      { 
        name: 'Balanced-Generalist', 
        size: 'medium', speed: 'medium', energyEfficiency: 'normal', aggression: 'normal',
        socialBehavior: 'normal', explorationTendency: 'normal', riskTolerance: 'normal',
        cooperationLevel: 'normal', territoriality: 'normal'
      },
      { 
        name: 'Explorer-Cooperator', 
        size: 'small', speed: 'fast', energyEfficiency: 'efficient', aggression: 'passive',
        socialBehavior: 'gregarious', explorationTendency: 'explorer', riskTolerance: 'normal',
        cooperationLevel: 'cooperative', territoriality: 'wanderer'
      }
    ];
    
    archetypes.forEach((archetype, index) => {
      for (let i = 0; i < 5; i++) { // 5 of each archetype
        const genetics = {
          [GENE_TYPES.SIZE]: createGenePair(GENE_TYPES.SIZE, archetype.size, archetype.size),
          [GENE_TYPES.SPEED]: createGenePair(GENE_TYPES.SPEED, archetype.speed, archetype.speed),
          [GENE_TYPES.ENERGY_EFFICIENCY]: createGenePair(GENE_TYPES.ENERGY_EFFICIENCY, archetype.energyEfficiency, archetype.energyEfficiency),
          [GENE_TYPES.AGGRESSION]: createGenePair(GENE_TYPES.AGGRESSION, archetype.aggression, archetype.aggression),
          [GENE_TYPES.INTELLIGENCE]: createGenePair(GENE_TYPES.INTELLIGENCE, 'normal', 'normal'),
          [GENE_TYPES.LIFESPAN]: createGenePair(GENE_TYPES.LIFESPAN, 'normal', 'normal'),
          [GENE_TYPES.REPRODUCTION_RATE]: createGenePair(GENE_TYPES.REPRODUCTION_RATE, 'normal', 'normal'),
          [GENE_TYPES.DIET_PREFERENCE]: createGenePair(GENE_TYPES.DIET_PREFERENCE, 'omnivore', 'omnivore'),
          // NEW: Behavioral genetics
          [GENE_TYPES.SOCIAL_BEHAVIOR]: createGenePair(GENE_TYPES.SOCIAL_BEHAVIOR, archetype.socialBehavior, archetype.socialBehavior),
          [GENE_TYPES.EXPLORATION_TENDENCY]: createGenePair(GENE_TYPES.EXPLORATION_TENDENCY, archetype.explorationTendency, archetype.explorationTendency),
          [GENE_TYPES.RISK_TOLERANCE]: createGenePair(GENE_TYPES.RISK_TOLERANCE, archetype.riskTolerance, archetype.riskTolerance),
          [GENE_TYPES.COOPERATION_LEVEL]: createGenePair(GENE_TYPES.COOPERATION_LEVEL, archetype.cooperationLevel, archetype.cooperationLevel),
          [GENE_TYPES.TERRITORIALITY]: createGenePair(GENE_TYPES.TERRITORIALITY, archetype.territoriality, archetype.territoriality),
          [GENE_TYPES.MATING_STRATEGY]: createGenePair(GENE_TYPES.MATING_STRATEGY, 'normal', 'normal')
        };
        
        population.push({
          id: `${archetype.name.toLowerCase()}_${i}`,
          genetics,
          generation: 0,
          archetype: archetype.name,
          fitness: 0
        });
      }
    });
    
    return population;
  }

  function runEnhancedBiomeExperiment() {
    const results = {
      generations: [],
      adaptations: {},
      diversityMetrics: [],
      behavioralEvolution: {}
    };
    
    const biomes = [BIOME_TYPES.FOREST, BIOME_TYPES.DESERT, BIOME_TYPES.OCEAN];
    let population = [...testPopulation];
    
    console.log(`\n🌱 Initial Population: ${population.length} creatures`);
    console.log('🧬 Now including behavioral genetics!');
    logArchetypeDistribution(population);
    logBehavioralDistribution(population);
    
    // Test each biome with enhanced pressure system
    biomes.forEach((biome, biomeIndex) => {
      console.log(`\n🌍 Testing Biome: ${biome.toUpperCase()} with Enhanced Pressure System`);
      console.log('-'.repeat(60));
      
      const biomeConfig = getBiomeConfig(biome);
      console.log(`Biome Effects: Energy×${biomeConfig.energyDrainMultiplier}, Speed×${biomeConfig.creatureSpeedMultiplier}, Repro×${biomeConfig.reproductionBonus}`);
      
      // Calculate fitness using NEW environmental pressure system
      const populationContext = {
        population,
        density: Math.min(population.length / 50, 1.0),
        resourceAbundance: 0.6 // Moderate resources for baseline test
      };
      
      population.forEach(creature => {
        // Use new environmental fitness calculation
        creature.fitness = calculateEnvironmentalFitness(creature, biome, populationContext);
        creature.specialization = analyzeSpecializationPotential(creature, {}).suggestedSpecialization;
      });
      
      // Analyze specializations and behaviors
      const specializations = analyzeSpecializations(population);
      const behavioralPatterns = analyzeBehavioralPatterns(population);
      
      console.log('\n🔬 Specializations emerged:');
      Object.entries(specializations).forEach(([spec, count]) => {
        console.log(`  ${spec}: ${count} creatures`);
      });
      
      console.log('\n🎭 Behavioral Patterns:');
      Object.entries(behavioralPatterns).forEach(([behavior, stats]) => {
        console.log(`  ${behavior}: avg=${stats.average.toFixed(2)}, range=${stats.min.toFixed(2)}-${stats.max.toFixed(2)}`);
      });
      
      // Calculate enhanced metrics
      const avgFitness = population.reduce((sum, c) => sum + c.fitness, 0) / population.length;
      const diversity = calculateGeneticDiversity(population);
      const behavioralDiversity = calculateBehavioralDiversity(population);
      
      console.log(`\n📈 Enhanced Metrics:`);
      console.log(`  Average Fitness: ${avgFitness.toFixed(3)} (Enhanced calculation)`);
      console.log(`  Genetic Diversity: ${diversity.toFixed(3)}`);
      console.log(`  Behavioral Diversity: ${behavioralDiversity.toFixed(3)} (NEW)`);
      
      // Store results
      results.generations.push({
        biome,
        avgFitness,
        diversity,
        behavioralDiversity,
        specializations,
        behavioralPatterns,
        topFitness: Math.max(...population.map(c => c.fitness)),
        fitnessRange: {
          min: Math.min(...population.map(c => c.fitness)),
          max: Math.max(...population.map(c => c.fitness))
        }
      });
      
      // Show top performers with behavioral traits
      const topPerformers = population
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, 3);
      
      console.log(`\n🏆 Top Performers in ${biome}:`);
      topPerformers.forEach((creature, index) => {
        const behaviorProfile = getBehaviorProfile(creature);
        console.log(`  ${index + 1}. ${creature.archetype} (${creature.id}):`);
        console.log(`     Fitness=${creature.fitness.toFixed(3)}, Spec=${creature.specialization || 'none'}`);
        console.log(`     Behaviors: ${behaviorProfile}`);
      });
      
      // Apply selection pressure for next test (simulate evolution)
      if (biomeIndex < biomes.length - 1) {
        const selectionResult = applySelectionPressure(population, biome, 0.3);
        console.log(`\n⚡ Selection Pressure Applied: ${selectionResult.eliminated.length} creatures eliminated`);
        console.log(`   Survivors: ${selectionResult.survivors.length}, Avg Fitness: ${selectionResult.averageFitness.toFixed(3)}`);
        population = selectionResult.survivors;
      }
    });
    
    // Enhanced final analysis
    console.log('\n' + '='.repeat(80));
    console.log('📊 ENHANCED CROSS-BIOME ANALYSIS');
    console.log('='.repeat(80));
    
    results.generations.forEach((gen, index) => {
      console.log(`${gen.biome}: Fitness=${gen.avgFitness.toFixed(3)} (${gen.fitnessRange.min.toFixed(2)}-${gen.fitnessRange.max.toFixed(2)}), BehavDiv=${gen.behavioralDiversity.toFixed(3)}`);
    });
    
    // Analyze fitness improvements
    const fitnessImprovement = results.generations.map(gen => gen.avgFitness);
    const maxImprovement = Math.max(...fitnessImprovement) - Math.min(...fitnessImprovement);
    
    console.log(`\n🎯 ENHANCED KEY FINDINGS:`);
    console.log(`• Fitness variation range: ${maxImprovement.toFixed(3)} (shows environmental pressure effect)`);
    console.log(`• Behavioral diversity maintained: ${results.generations.map(g => g.behavioralDiversity.toFixed(2)).join(' → ')}`);
    
    // Find most successful behavioral combinations
    const bestBiome = results.generations.reduce((best, current) => 
      current.avgFitness > best.avgFitness ? current : best
    );
    
    console.log(`\n🧠 OPTIMAL BEHAVIORAL ADAPTATIONS:`);
    console.log(`• Best performing biome: ${bestBiome.biome} (fitness: ${bestBiome.avgFitness.toFixed(3)})`);
    Object.entries(bestBiome.behavioralPatterns).forEach(([behavior, stats]) => {
      console.log(`  ${behavior}: ${stats.average.toFixed(2)} effectiveness`);
    });
    
    return results;
  }

  // Helper functions for behavioral analysis
  function logBehavioralDistribution(population) {
    const behaviorTraits = [
      GENE_TYPES.SOCIAL_BEHAVIOR,
      GENE_TYPES.EXPLORATION_TENDENCY, 
      GENE_TYPES.RISK_TOLERANCE,
      GENE_TYPES.COOPERATION_LEVEL,
      GENE_TYPES.TERRITORIALITY
    ];
    
    console.log('Behavioral Distribution:');
    behaviorTraits.forEach(trait => {
      const distribution = population.reduce((acc, creature) => {
        if (creature.genetics[trait]) {
          const allele = expressGene(creature.genetics[trait]);
          acc[allele] = (acc[allele] || 0) + 1;
        }
        return acc;
      }, {});
      
      const distStr = Object.entries(distribution)
        .map(([allele, count]) => `${allele}(${count})`)
        .join(', ');
      console.log(`  ${trait}: ${distStr}`);
    });
  }
  
  function analyzeBehavioralPatterns(population) {
    const patterns = {};
    const behaviorTraits = [
      GENE_TYPES.SOCIAL_BEHAVIOR,
      GENE_TYPES.EXPLORATION_TENDENCY,
      GENE_TYPES.RISK_TOLERANCE,
      GENE_TYPES.COOPERATION_LEVEL,
      GENE_TYPES.TERRITORIALITY
    ];
    
    behaviorTraits.forEach(trait => {
      const values = population
        .filter(creature => creature.genetics[trait])
        .map(creature => {
          const allele = expressGene(creature.genetics[trait]);
          return convertAlleleToValue(allele);
        });
      
      if (values.length > 0) {
        patterns[trait] = {
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });
    
    return patterns;
  }
  
  function calculateBehavioralDiversity(population) {
    const behaviorTraits = [GENE_TYPES.SOCIAL_BEHAVIOR, GENE_TYPES.EXPLORATION_TENDENCY, GENE_TYPES.RISK_TOLERANCE];
    let totalDiversity = 0;
    
    behaviorTraits.forEach(trait => {
      const alleles = population
        .filter(creature => creature.genetics[trait])
        .map(creature => expressGene(creature.genetics[trait]));
      
      const uniqueAlleles = new Set(alleles);
      const diversity = uniqueAlleles.size / 3; // Normalize by max possible alleles
      totalDiversity += diversity;
    });
    
    return totalDiversity / behaviorTraits.length;
  }
  
  function getBehaviorProfile(creature) {
    const behaviors = [];
    
    if (creature.genetics[GENE_TYPES.SOCIAL_BEHAVIOR]) {
      const social = expressGene(creature.genetics[GENE_TYPES.SOCIAL_BEHAVIOR]);
      behaviors.push(`${social.substring(0, 4)}`);
    }
    
    if (creature.genetics[GENE_TYPES.EXPLORATION_TENDENCY]) {
      const explore = expressGene(creature.genetics[GENE_TYPES.EXPLORATION_TENDENCY]);
      behaviors.push(`${explore.substring(0, 4)}`);
    }
    
    if (creature.genetics[GENE_TYPES.RISK_TOLERANCE]) {
      const risk = expressGene(creature.genetics[GENE_TYPES.RISK_TOLERANCE]);
      behaviors.push(`${risk.substring(0, 4)}`);
    }
    
    return behaviors.join('|');
  }
  
  function convertAlleleToValue(allele) {
    const mapping = {
      // Size, speed, etc.
      large: 0.9, medium: 0.5, small: 0.1,
      fast: 0.9, slow: 0.1,
      efficient: 0.9, normal: 0.5, inefficient: 0.1,
      // Behavioral
      gregarious: 0.9, solitary: 0.1,
      explorer: 0.9, homebody: 0.1,
      reckless: 0.9, cautious: 0.1,
      cooperative: 0.9, competitive: 0.1,
      territorial: 0.9, wanderer: 0.1,
      aggressive: 0.9, passive: 0.1
    };
    
    return mapping[allele] || 0.5;
  }

  function analyzeSpecializations(population) {
    return population.reduce((acc, creature) => {
      const spec = creature.specialization || 'unspecialized';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {});
  }

  function calculateGeneticDiversity(population) {
    if (population.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < population.length - 1; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const similarity = calculateGeneticSimilarity(population[i].genetics, population[j].genetics);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? 1 - (totalSimilarity / comparisons) : 0;
  }

  function logArchetypeDistribution(population) {
    const distribution = population.reduce((acc, creature) => {
      acc[creature.archetype] = (acc[creature.archetype] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Distribution:', Object.entries(distribution).map(([type, count]) => `${type}(${count})`).join(', '));
  }
});