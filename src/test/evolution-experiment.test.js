// Evolution Experiment: Biome Specialization Pressure Test
// Tests how creatures with different genetic profiles adapt to biome switching

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createGenePair,
  reproduceGenetics,
  calculateGeneticSimilarity,
  generateDNA,
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

describe('Evolution Experiment: Biome Specialization Pressure', () => {
  let testPopulation;
  
  beforeEach(() => {
    // Create diverse test population
    testPopulation = createTestPopulation();
  });

  it('should demonstrate biome-specific selection pressure', () => {
    console.log('🧬 EVOLUTION EXPERIMENT: Biome Specialization Pressure Test');
    console.log('='.repeat(70));
    
    const results = runBiomeExperiment();
    
    // Validate experiment completed
    expect(results.generations).toBeDefined();
    expect(results.generations.length).toBeGreaterThan(0);
    
    console.log('\n📊 EXPERIMENT COMPLETED SUCCESSFULLY');
    console.log('Results documented for further analysis');
  });

  function createTestPopulation() {
    const population = [];
    
    // Create different genetic archetypes
    const archetypes = [
      { name: 'Herbivore', size: 'large', speed: 'slow', energyEfficiency: 'efficient', aggression: 'passive' },
      { name: 'Carnivore', size: 'medium', speed: 'fast', energyEfficiency: 'normal', aggression: 'aggressive' },
      { name: 'Balanced', size: 'medium', speed: 'medium', energyEfficiency: 'normal', aggression: 'normal' },
      { name: 'Small-Fast', size: 'small', speed: 'fast', energyEfficiency: 'efficient', aggression: 'passive' }
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
          [GENE_TYPES.DIET_PREFERENCE]: createGenePair(GENE_TYPES.DIET_PREFERENCE, 'omnivore', 'omnivore')
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

  function runBiomeExperiment() {
    const results = {
      generations: [],
      adaptations: {},
      diversityMetrics: []
    };
    
    const biomes = [BIOME_TYPES.FOREST, BIOME_TYPES.DESERT, BIOME_TYPES.OCEAN];
    let population = [...testPopulation];
    
    console.log(`\n🌱 Initial Population: ${population.length} creatures`);
    logArchetypeDistribution(population);
    
    // Test each biome
    biomes.forEach((biome, biomeIndex) => {
      console.log(`\n🌍 Testing Biome: ${biome.toUpperCase()}`);
      console.log('-'.repeat(50));
      
      const biomeConfig = getBiomeConfig(biome);
      console.log(`Biome Config: Speed=${biomeConfig.speedModifier}, Energy=${biomeConfig.energyDrainModifier}, Food=${biomeConfig.foodMultiplier}`);
      
      // Calculate fitness in this biome
      population.forEach(creature => {
        creature.fitness = calculateBiomeFitness(creature, biome);
        creature.specialization = analyzeSpecializationPotential(creature, {}).suggestedSpecialization;
      });
      
      // Analyze specializations
      const specializations = analyzeSpecializations(population);
      console.log('\n🔬 Specializations emerged:');
      Object.entries(specializations).forEach(([spec, count]) => {
        console.log(`  ${spec}: ${count} creatures`);
      });
      
      // Calculate metrics
      const avgFitness = population.reduce((sum, c) => sum + c.fitness, 0) / population.length;
      const diversity = calculateGeneticDiversity(population);
      
      console.log(`\n📈 Metrics:`);
      console.log(`  Average Fitness: ${avgFitness.toFixed(3)}`);
      console.log(`  Genetic Diversity: ${diversity.toFixed(3)}`);
      
      // Store results
      results.generations.push({
        biome,
        avgFitness,
        diversity,
        specializations,
        topFitness: Math.max(...population.map(c => c.fitness))
      });
      
      // Show top performers
      const topPerformers = population
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, 3);
      
      console.log(`\n🏆 Top Performers in ${biome}:`);
      topPerformers.forEach((creature, index) => {
        console.log(`  ${index + 1}. ${creature.archetype} (${creature.id}): Fitness=${creature.fitness.toFixed(3)}, Spec=${creature.specialization || 'none'}`);
      });
    });
    
    // Final analysis
    console.log('\n' + '='.repeat(70));
    console.log('📊 CROSS-BIOME ANALYSIS');
    console.log('='.repeat(70));
    
    results.generations.forEach((gen, index) => {
      console.log(`${gen.biome}: Avg Fitness=${gen.avgFitness.toFixed(3)}, Diversity=${gen.diversity.toFixed(3)}, Top=${gen.topFitness.toFixed(3)}`);
    });
    
    // Identify patterns
    const bestBiomeForFitness = results.generations.reduce((best, current) => 
      current.avgFitness > best.avgFitness ? current : best
    );
    
    const bestBiomeForDiversity = results.generations.reduce((best, current) => 
      current.diversity > best.diversity ? current : best
    );
    
    console.log(`\n🎯 KEY FINDINGS:`);
    console.log(`• Best biome for fitness: ${bestBiomeForFitness.biome} (${bestBiomeForFitness.avgFitness.toFixed(3)})`);
    console.log(`• Best biome for diversity: ${bestBiomeForDiversity.biome} (${bestBiomeForDiversity.diversity.toFixed(3)})`);
    
    // Analyze specialization patterns
    const allSpecs = new Set();
    results.generations.forEach(gen => {
      Object.keys(gen.specializations).forEach(spec => allSpecs.add(spec));
    });
    
    console.log(`\n🧬 SPECIALIZATION PATTERNS:`);
    allSpecs.forEach(spec => {
      const pattern = results.generations.map(gen => gen.specializations[spec] || 0);
      console.log(`  ${spec}: [${pattern.join(', ')}] across biomes`);
    });
    
    return results;
  }

  function calculateBiomeFitness(creature, biome) {
    const biomeConfig = getBiomeConfig(biome);
    let fitness = 0.5; // Base fitness
    
    const genetics = creature.genetics;
    
    // Apply biome-specific selection pressures
    switch (biome) {
      case BIOME_TYPES.FOREST:
        // Forest rewards efficiency and balanced traits
        if (genetics[GENE_TYPES.ENERGY_EFFICIENCY].dominantAllele === 'efficient') fitness += 0.3;
        if (genetics[GENE_TYPES.SIZE].dominantAllele === 'medium') fitness += 0.2;
        break;
        
      case BIOME_TYPES.DESERT:
        // Desert heavily favors efficiency and small size
        if (genetics[GENE_TYPES.ENERGY_EFFICIENCY].dominantAllele === 'efficient') fitness += 0.4;
        if (genetics[GENE_TYPES.SIZE].dominantAllele === 'small') fitness += 0.3;
        if (genetics[GENE_TYPES.SPEED].dominantAllele === 'fast') fitness += 0.2;
        break;
        
      case BIOME_TYPES.OCEAN:
        // Ocean favors larger creatures and moderate speed
        if (genetics[GENE_TYPES.SIZE].dominantAllele === 'large') fitness += 0.3;
        if (genetics[GENE_TYPES.SPEED].dominantAllele === 'medium') fitness += 0.2;
        if (genetics[GENE_TYPES.AGGRESSION].dominantAllele === 'aggressive') fitness += 0.2; // Predator advantage
        break;
    }
    
    return Math.max(0.1, Math.min(1.0, fitness));
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