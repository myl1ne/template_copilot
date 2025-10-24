import { Creature } from '../creatures/Creature.js';
import { Genome } from '../dna/Genome.js';
import { FoodManager } from '../environment/Food.js';
import { ObstacleManager } from '../environment/Obstacles.js';
import { Terrain } from '../environment/Terrain.js';

/**
 * EvolutionManager - Handles natural selection and evolution
 * Implements selection pressure and breeding
 */

export class EvolutionManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.creatures = [];
        this.generation = 0;
        this.populationSize = 20; // Increased from 15 for more diversity
        this.maxPopulation = 30; // Allow population to grow
        this.minPopulation = 10; // Minimum viable population
        this.bestFitness = 0;
        this.bestGenome = null;
        this.totalBirths = 0;
        this.totalDeaths = 0;
        this.species = new Map(); // Track species diversity
        
        // Continuous evolution (no generation timer)
        this.continuousEvolution = true;
        this.birthCooldown = 0; // Prevent too many births at once
        
        // Terrain with borders and water
        this.terrain = new Terrain(scene, world);
        
        // Food management
        this.foodManager = new FoodManager(scene, world);
        
        // Obstacle management for environmental complexity
        this.obstacleManager = new ObstacleManager(scene, world);
    }

    initialize() {
        // Create initial population in "primal soup"
        this.spawnInitialPopulation();
        
        // Initialize food sources
        this.foodManager.initialize();
        
        // Initialize environmental obstacles
        this.obstacleManager.initialize();
    }

    spawnInitialPopulation() {
        const spawnRadius = 15;
        
        for (let i = 0; i < this.populationSize; i++) {
            const angle = (i / this.populationSize) * Math.PI * 2;
            const radius = Math.random() * spawnRadius;
            const position = {
                x: Math.cos(angle) * radius,
                y: 5 + Math.random() * 2,
                z: Math.sin(angle) * radius
            };
            
            this.spawnCreature(null, position);
        }
    }

    spawnCreature(genome = null, position = null) {
        if (!position) {
            position = {
                x: (Math.random() - 0.5) * 20,
                y: 5 + Math.random() * 2,
                z: (Math.random() - 0.5) * 20
            };
        }
        
        const creature = new Creature(genome, position);
        creature.addToScene(this.scene);
        creature.addToWorld(this.world);
        this.creatures.push(creature);
        
        return creature;
    }

    update(deltaTime) {
        this.birthCooldown = Math.max(0, this.birthCooldown - deltaTime);
        
        // Update food
        this.foodManager.update(deltaTime);
        
        // Update all creatures with full environmental awareness
        this.creatures.forEach(creature => {
            creature.update(deltaTime, this.foodManager, this.creatures, this.terrain);
            
            // Check for food collisions
            this.foodManager.checkCollisions(creature);
            
            // Check for water proximity
            this.terrain.checkWaterProximity(creature);
            
            // Check bounds
            if (!this.terrain.isInBounds(creature.mainBody.position)) {
                creature.energy -= deltaTime * 2; // Penalty for being out of bounds
            }
            
            // Age-based death (NEW: creatures die of old age)
            if (creature.age > 120) { // 2 minutes max lifespan
                creature.alive = false;
            }
            
            // Handle mating
            if (creature.readyToMate && this.creatures.length < this.maxPopulation) {
                this.createOffspring(creature, creature.readyToMate);
                creature.readyToMate = null;
            }
        });
        
        // Remove dead creatures and track deaths
        const deadCount = this.creatures.filter(c => !c.alive).length;
        this.totalDeaths += deadCount;
        
        this.creatures = this.creatures.filter(creature => {
            if (!creature.alive) {
                creature.removeFromScene(this.scene);
                creature.removeFromWorld(this.world);
                creature.dispose();
                return false;
            }
            return true;
        });
        
        // Track best fitness and species
        this.updateStatistics();
        
        // Continuous evolution: spawn new creatures when population is low
        if (this.creatures.length < this.minPopulation && this.birthCooldown <= 0) {
            this.spawnReplacementCreature();
            this.birthCooldown = 2; // 2 second cooldown between spawns
        }
        
        // Random immigration for diversity (small chance)
        if (Math.random() < 0.001 && this.creatures.length < this.maxPopulation) {
            this.spawnRandomCreature();
        }
    }

    updateStatistics() {
        this.species.clear();
        
        this.creatures.forEach(creature => {
            if (creature.fitness > this.bestFitness) {
                this.bestFitness = creature.fitness;
                this.bestGenome = creature.genome.clone();
            }
            
            // Track species diversity
            const speciesId = creature.genome.genes.speciesId;
            if (!this.species.has(speciesId)) {
                this.species.set(speciesId, {
                    count: 0,
                    avgFitness: 0,
                    totalFitness: 0
                });
            }
            const species = this.species.get(speciesId);
            species.count++;
            species.totalFitness += creature.fitness;
            species.avgFitness = species.totalFitness / species.count;
        });
    }

    spawnReplacementCreature() {
        // Spawn based on fitness-weighted selection
        if (this.creatures.length === 0) {
            this.spawnRandomCreature();
            return;
        }
        
        // Select parent(s) based on fitness
        const totalFitness = this.creatures.reduce((sum, c) => sum + Math.max(0, c.fitness), 0);
        if (totalFitness === 0) {
            this.spawnRandomCreature();
            return;
        }
        
        let random = Math.random() * totalFitness;
        let parent1 = null;
        for (const creature of this.creatures) {
            random -= Math.max(0, creature.fitness);
            if (random <= 0) {
                parent1 = creature;
                break;
            }
        }
        
        if (!parent1) {
            this.spawnRandomCreature();
            return;
        }
        
        // 70% sexual reproduction, 30% asexual
        let genome;
        if (Math.random() < 0.7 && this.creatures.length >= 2) {
            // Sexual reproduction - find compatible partner
            const compatible = this.creatures.filter(c => 
                c !== parent1 && 
                Math.abs(c.genome.genes.aggression - parent1.genome.genes.aggression) < 0.4
            );
            
            if (compatible.length > 0) {
                const parent2 = compatible[Math.floor(Math.random() * compatible.length)];
                genome = parent1.genome.crossover(parent2.genome);
            } else {
                genome = parent1.genome.clone();
            }
        } else {
            // Asexual reproduction (cloning)
            genome = parent1.genome.clone();
        }
        
        genome.mutate();
        
        // Spawn in random location
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 15;
        const position = {
            x: Math.cos(angle) * radius,
            y: 10,
            z: Math.sin(angle) * radius
        };
        
        const offspring = this.spawnCreature(genome, position);
        this.totalBirths++;
    }

    spawnRandomCreature() {
        // Completely random genome for diversity
        const genome = new Genome();
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 15;
        const position = {
            x: Math.cos(angle) * radius,
            y: 10,
            z: Math.sin(angle) * radius
        };
        
        const creature = this.spawnCreature(genome, position);
        this.totalBirths++;
    }

    createOffspring(parent1, parent2) {
        // Sexual reproduction - crossover between two parents
        const childGenome = parent1.genome.crossover(parent2.genome);
        childGenome.mutate();
        
        // Spawn near parents
        const avgX = (parent1.mainBody.position.x + parent2.mainBody.position.x) / 2;
        const avgZ = (parent1.mainBody.position.z + parent2.mainBody.position.z) / 2;
        
        const position = {
            x: avgX + (Math.random() - 0.5) * 2,
            y: 5,
            z: avgZ + (Math.random() - 0.5) * 2
        };
        
        const offspring = this.spawnCreature(childGenome, position);
        this.totalBirths++;
    }

    reset() {
        // Clean up all creatures
        this.creatures.forEach(creature => {
            creature.removeFromScene(this.scene);
            creature.removeFromWorld(this.world);
            creature.dispose();
        });
        this.creatures = [];
        
        // Reset stats
        this.bestFitness = 0;
        this.bestGenome = null;
        this.totalBirths = 0;
        this.totalDeaths = 0;
        this.birthCooldown = 0;
        this.species.clear();
        
        // Reset food and obstacles
        this.foodManager.reset();
        this.obstacleManager.reset();
        
        // Restart with new population
        this.spawnInitialPopulation();
    }

    getStats() {
        return {
            creatures: this.creatures.length,
            bestFitness: this.bestFitness.toFixed(2),
            aliveCreatures: this.creatures.filter(c => c.alive).length,
            births: this.totalBirths,
            deaths: this.totalDeaths,
            species: this.species.size
        };
    }
}
