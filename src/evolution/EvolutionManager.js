import { Creature } from '../creatures/Creature.js';
import { Genome } from '../dna/Genome.js';
import { FoodManager } from '../environment/Food.js';
import { ObstacleManager } from '../environment/Obstacles.js';

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
        this.populationSize = 10;
        this.generationDuration = 30; // seconds
        this.generationTimer = 0;
        this.bestFitness = 0;
        this.bestGenome = null;
        
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
        this.generationTimer += deltaTime;
        
        // Update food
        this.foodManager.update(deltaTime);
        
        // Update all creatures with social awareness
        this.creatures.forEach(creature => {
            creature.update(deltaTime, this.foodManager, this.creatures);
            
            // Check for food collisions
            this.foodManager.checkCollisions(creature);
        });
        
        // Remove dead creatures
        this.creatures = this.creatures.filter(creature => {
            if (!creature.alive) {
                creature.removeFromScene(this.scene);
                creature.removeFromWorld(this.world);
                creature.dispose();
                return false;
            }
            return true;
        });
        
        // Track best fitness
        this.creatures.forEach(creature => {
            if (creature.fitness > this.bestFitness) {
                this.bestFitness = creature.fitness;
                this.bestGenome = creature.genome.clone();
            }
        });
        
        // Check if generation time is up or all creatures are dead
        if (this.generationTimer >= this.generationDuration || this.creatures.length === 0) {
            this.evolveNextGeneration();
        }
    }

    evolveNextGeneration() {
        console.log(`Generation ${this.generation} complete. Best fitness: ${this.bestFitness.toFixed(2)}`);
        
        // Sort creatures by fitness
        const sorted = [...this.creatures].sort((a, b) => b.fitness - a.fitness);
        
        // Clean up current generation
        this.creatures.forEach(creature => {
            creature.removeFromScene(this.scene);
            creature.removeFromWorld(this.world);
            creature.dispose();
        });
        this.creatures = [];
        
        // Select top performers for breeding
        const eliteCount = Math.max(2, Math.floor(sorted.length * 0.2));
        const elite = sorted.slice(0, eliteCount);
        
        // Create next generation
        this.generation++;
        this.generationTimer = 0;
        
        const spawnRadius = 15;
        
        for (let i = 0; i < this.populationSize; i++) {
            let genome;
            
            if (elite.length > 0) {
                if (Math.random() < 0.3 && elite.length >= 2) {
                    // Crossover
                    const parent1 = elite[Math.floor(Math.random() * elite.length)];
                    const parent2 = elite[Math.floor(Math.random() * elite.length)];
                    genome = parent1.genome.crossover(parent2.genome);
                } else {
                    // Mutation from elite
                    const parent = elite[Math.floor(Math.random() * elite.length)];
                    genome = parent.genome.mutate();
                }
            } else {
                // Random if no elite (shouldn't happen often)
                genome = new Genome();
            }
            
            const angle = (i / this.populationSize) * Math.PI * 2;
            const radius = Math.random() * spawnRadius;
            const position = {
                x: Math.cos(angle) * radius,
                y: 5 + Math.random() * 2,
                z: Math.sin(angle) * radius
            };
            
            this.spawnCreature(genome, position);
        }
    }

    reset() {
        // Clean up all creatures
        this.creatures.forEach(creature => {
            creature.removeFromScene(this.scene);
            creature.removeFromWorld(this.world);
            creature.dispose();
        });
        this.creatures = [];
        
        // Reset counters
        this.generation = 0;
        this.generationTimer = 0;
        this.bestFitness = 0;
        this.bestGenome = null;
        
        // Reset food and obstacles
        this.foodManager.reset();
        this.obstacleManager.reset();
        
        // Restart with new population
        this.spawnInitialPopulation();
    }

    getStats() {
        return {
            generation: this.generation,
            creatures: this.creatures.length,
            bestFitness: this.bestFitness.toFixed(2),
            aliveCreatures: this.creatures.filter(c => c.alive).length
        };
    }
}
