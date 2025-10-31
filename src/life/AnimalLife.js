import { Life } from './Life.js';
import { AnimalGenetics } from './AnimalGenetics.js';
import { PlantLife } from './PlantLife.js';

/**
 * AnimalLife - Base class for animal life with movement and interactions
 */
export class AnimalLife extends Life {
    static ANIMAL_TYPES = {
        HERBIVORE: 'herbivore',
        DECOMPOSER: 'decomposer'
    };

    constructor(x, y, z, animalType = AnimalLife.ANIMAL_TYPES.HERBIVORE, generation = 1, parent1Genetics = null, parent2Genetics = null) {
        super(x, y, z, 'animal');
        
        this.animalType = animalType;
        this.generation = generation;
        
        // Initialize genetics
        if (parent1Genetics && parent2Genetics) {
            // Sexual reproduction
            this.genetics = new AnimalGenetics(parent1Genetics.genes, parent2Genetics.genes);
        } else if (parent1Genetics) {
            // Asexual reproduction
            this.genetics = new AnimalGenetics(parent1Genetics.genes, null);
        } else {
            // First generation
            this.genetics = new AnimalGenetics();
        }
        
        // Apply genetic traits
        const speedGene = this.genetics.getGene('speedGene');
        const sizeGene = this.genetics.getGene('sizeGene');
        const hungerGene = this.genetics.getGene('hungerResistanceGene');
        const vigorGene = this.genetics.getGene('vigorGene');
        
        this.speed = 0.5 * speedGene;
        this.size = 0.4 * sizeGene;
        this.maxHunger = 100 * hungerGene;
        this.maxAge = 150 * vigorGene;
        
        this.targetX = x;
        this.targetZ = z;
        this.hunger = 50;
        
        // Movement state
        this.isMoving = false;
        this.movementCooldown = 0;
        
        // Reproduction
        this.reproductionCooldown = 0;
        this.canReproduce = false;
        
        // Appearance
        this.color = this.getAnimalColor();
    }

    update(deltaTime, vivarium) {
        super.update(deltaTime, vivarium);
        
        // Become mature and able to reproduce
        if (this.age > 30 && !this.canReproduce) {
            this.canReproduce = true;
        }
        
        // Hunger increases over time
        // Hunger increases over time (capped by maxHunger)
        this.hunger = Math.min(this.maxHunger, this.hunger + deltaTime * 2);

        // Energy decreases when hunger becomes critical. Use relative threshold so
        // animals with lower maxHunger still experience starvation.
        const hungerCriticalRatio = 0.8; // when hunger exceeds 80% of maxHunger
        const criticalThreshold = this.maxHunger * hungerCriticalRatio;
        if (this.hunger > criticalThreshold) {
            // scale energy drain by how hungry the animal is (0..1)
            const hungerRatio = Math.min(1, this.hunger / this.maxHunger);
            this.energy -= deltaTime * 1.5 * hungerRatio;
        }
        
        // Movement
        this.updateMovement(deltaTime, vivarium);
        
        // Behavior based on type
        if (this.animalType === AnimalLife.ANIMAL_TYPES.HERBIVORE) {
            this.herbivoreBehavior(deltaTime, vivarium);
        } else if (this.animalType === AnimalLife.ANIMAL_TYPES.DECOMPOSER) {
            this.decomposerBehavior(deltaTime, vivarium);
        }
        
        // Reproduction
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= deltaTime;
        }
        
        if (this.canReproduce && this.reproductionCooldown <= 0 && this.energy > 70) {
            this.tryReproduce(vivarium);
        }
        
        // Natural aging
        if (this.age > this.maxAge) {
            this.energy -= deltaTime * 2;
        }
    }

    updateMovement(deltaTime, vivarium) {
        if (this.movementCooldown > 0) {
            this.movementCooldown -= deltaTime;
            return;
        }

        // Check if reached target
        const dx = this.targetX - this.x;
        const dz = this.targetZ - this.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 0.5) {
            // Reached target, pick new one
            this.pickNewTarget(vivarium);
            this.movementCooldown = 2;
            return;
        }
        
        // Move towards target
        // continuous movement (no rounding) so small speeds work smoothly
        const moveSpeed = this.speed * deltaTime;
        // protect against divide by zero
        const nx = distance > 0 ? dx / distance : 0;
        const nz = distance > 0 ? dz / distance : 0;

        const moveX = nx * moveSpeed;
        const moveZ = nz * moveSpeed;

        const tentativeX = this.x + moveX;
        const tentativeZ = this.z + moveZ;

        // Find ground level at the rounded tile we'll occupy
        const tileX = Math.floor(tentativeX);
        const tileZ = Math.floor(tentativeZ);
        const newY = this.findGroundLevel(vivarium, tileX, tileZ);

        if (newY !== null) {
            // commit continuous position, keep y aligned to ground
            const clampedX = Math.max(0, Math.min(vivarium.sizeX - 1, tentativeX));
            const clampedZ = Math.max(0, Math.min(vivarium.sizeZ - 1, tentativeZ));

            // energy cost for movement (proportional to distance and size)
            const actualDx = clampedX - this.x;
            const actualDz = clampedZ - this.z;
            const movedDist = Math.sqrt(actualDx * actualDx + actualDz * actualDz);
            const movementEnergyCost = movedDist * (0.5 + this.size * 0.5);
            this.energy = Math.max(0, this.energy - movementEnergyCost);

            this.x = clampedX;
            this.z = clampedZ;
            this.y = newY;
        } else {
            // Can't move there, pick new target
            this.pickNewTarget(vivarium);
        }
    }

    findGroundLevel(vivarium, x, z) {
        // Find the topmost solid cube
        for (let y = vivarium.sizeY - 1; y >= 0; y--) {
            const cube = vivarium.getCube(x, y, z);
            if (cube && (cube.isSoil() || cube.isWater())) {
                return y + 1; // Stand on top of solid cube
            }
        }
        return null;
    }

    pickNewTarget(vivarium) {
        // Random wandering
        const range = 5;
        this.targetX = Math.max(0, Math.min(vivarium.sizeX - 1, 
            this.x + Math.floor((Math.random() - 0.5) * range * 2)));
        this.targetZ = Math.max(0, Math.min(vivarium.sizeZ - 1, 
            this.z + Math.floor((Math.random() - 0.5) * range * 2)));
    }

    herbivoreBehavior(deltaTime, vivarium) {
        // Look for plants to eat when hungry
        if (this.hunger > 60) {
            const nearbyPlant = this.findNearbyPlant(vivarium);
            if (nearbyPlant) {
                // If plant is not within immediate eating distance, move towards it
                const dx = nearbyPlant.x - this.x;
                const dz = nearbyPlant.z - this.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance > 1.0) {
                    // set plant as target to approach
                    this.targetX = nearbyPlant.x;
                    this.targetZ = nearbyPlant.z;
                } else {
                    // close enough to eat
                    this.eatPlant(nearbyPlant, vivarium);
                }
            }
        }
        
        // Dig in soil (aerating it, increasing nutrient availability)
        if (Math.random() < 0.05) {
            this.digSoil(vivarium);
        }
    }

    decomposerBehavior(deltaTime, vivarium) {
        // Decomposers accelerate organic matter breakdown
        const cube = vivarium.getCube(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
        if (cube && cube.isSoil() && cube.organicMatter > 0) {
            // Accelerate decomposition
            const decomposed = Math.min(cube.organicMatter, 2 * deltaTime);
            cube.organicMatter -= decomposed;
            cube.nutrients += decomposed * 1.5; // More efficient conversion
            
            // Gain energy from decomposing
            this.energy = Math.min(100, this.energy + decomposed * 0.5);
            this.hunger = Math.max(0, this.hunger - decomposed * 2);
        }
    }

    findNearbyPlant(vivarium) {
        const searchRadius = 4; // slightly larger so animals can find plants a bit further away
        let closest = null;
        let closestDist = Infinity;

        for (const lifeform of vivarium.lifeforms) {
            if (lifeform.type === 'plant' && lifeform.stage !== PlantLife.GROWTH_STAGES.DYING && lifeform.biomass > 0) {
                const dx = lifeform.x - this.x;
                const dz = lifeform.z - this.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance <= searchRadius && distance < closestDist) {
                    closest = lifeform;
                    closestDist = distance;
                }
            }
        }

        return closest;
    }

    eatPlant(plant, vivarium) {
        // Eat plant biomass
        if (!plant || plant.isDead && plant.isDead()) return;

        const efficiencyGene = this.genetics.getGene('efficiencyGene');
        // Eat a fraction of biomass scaled by efficiency
        const baseAmount = Math.min(plant.biomass * 0.4, 6);
        const amountEaten = Math.max(0.1, baseAmount * efficiencyGene);

        plant.biomass = Math.max(0, plant.biomass - amountEaten);
        plant.energy = Math.max(0, (plant.energy || 0) - amountEaten * 6);

        // Gain energy and reduce hunger (efficiency affects this)
        this.energy = Math.min(100, this.energy + amountEaten * 5 * efficiencyGene);
        this.hunger = Math.max(0, this.hunger - amountEaten * 12);

        // If plant is exhausted, trigger its death immediately so the cube is freed
        if (plant.biomass <= 0 || plant.energy <= 0) {
            try {
                if (plant.onDeath) {
                    plant.onDeath(vivarium);
                }
            } catch (e) {
                // ignore
            }
            // ensure it's removed from vivarium list
            vivarium.removeLifeform(plant);
        }

        // Small chance to spread plant seeds (animal dispersal)
        if (Math.random() < 0.08 && plant.species) {
            this.spreadSeed(plant, vivarium);
        }
    }

    tryReproduce(vivarium) {
        // Try to find a mate for sexual reproduction
        const mate = this.findMate(vivarium);
        
        if (mate) {
            // Sexual reproduction
            this.reproduce(vivarium, mate.genetics);
            // Ensure the mate also pays energy cost and gets a cooldown
            const mateEnergyCost = 15;
            mate.energy = Math.max(0, mate.energy - mateEnergyCost);
            mate.reproductionCooldown = Math.max(mate.reproductionCooldown, 60);
        } else if (Math.random() < 0.08) {
            // Asexual reproduction (30% chance if no mate)
            this.reproduce(vivarium, null);
        }
    }

    findMate(vivarium) {
        const searchRadius = 5;
        
        for (const lifeform of vivarium.lifeforms) {
            if (lifeform !== this && 
                lifeform.type === 'animal' && 
                lifeform.animalType === this.animalType &&
                lifeform.canReproduce &&
                lifeform.energy > 70) {
                
                const dx = lifeform.x - this.x;
                const dz = lifeform.z - this.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance <= searchRadius) {
                    return lifeform;
                }
            }
        }
        
        return null;
    }

    reproduce(vivarium, mateGenetics) {
        // Spawn 1-2 offspring
        const fertilityGene = this.genetics.getGene('fertilityGene');
        const offspringCount = Math.floor(Math.random() * 2 * fertilityGene) + 1;
        
        for (let i = 0; i < offspringCount; i++) {
            // Find nearby spot
            const spot = this.findNearbySpot(vivarium);
            if (spot) {
                const offspring = new AnimalLife(
                    spot.x,
                    spot.y,
                    spot.z,
                    this.animalType,
                    this.generation + 1,
                    this.genetics,
                    mateGenetics
                );
                
                vivarium.addLifeform(offspring);
            }
        }
        
        // Reproduction costs energy (scale with number of offspring) and impose longer cooldown
        const perOffspringCost = 18; // cost per child
        const totalCost = Math.min(60, perOffspringCost * offspringCount);
        this.energy = Math.max(0, this.energy - totalCost);
        this.reproductionCooldown = Math.max(this.reproductionCooldown, 120); // longer cooldown
    }

    findNearbySpot(vivarium) {
        const attempts = 15;
        const range = 3;
        
        for (let i = 0; i < attempts; i++) {
            const dx = Math.floor((Math.random() - 0.5) * range * 2);
            const dz = Math.floor((Math.random() - 0.5) * range * 2);
            
            const x = Math.max(0, Math.min(vivarium.sizeX - 1, this.x + dx));
            const z = Math.max(0, Math.min(vivarium.sizeZ - 1, this.z + dz));
            
            const y = this.findGroundLevel(vivarium, x, z);
            if (y !== null) {
                return { x, y, z };
            }
        }
        
        return null;
    }

    spreadSeed(plant, vivarium) {
        // Animals can disperse seeds over longer distances
        const spot = this.findDistantPlantingSpot(vivarium, 8);
        if (spot) {
            const PlantLife = plant.constructor;
            const seedling = new PlantLife(
                spot.x,
                spot.y,
                spot.z,
                plant.generation + 1,
                plant.reproductionType,
                plant.genetics,
                null,
                plant.species
            );
            
            const cube = vivarium.getCube(spot.x, spot.y, spot.z);
            if (cube) {
                cube.setOccupant(seedling);
                vivarium.addLifeform(seedling);
            }
        }
    }

    findDistantPlantingSpot(vivarium, maxDistance) {
        const attempts = 20;
        
        for (let i = 0; i < attempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * maxDistance;
            
            const x = Math.floor(this.x + Math.cos(angle) * distance);
            const z = Math.floor(this.z + Math.sin(angle) * distance);
            
            for (let y = vivarium.sizeY - 1; y >= 0; y--) {
                const cube = vivarium.getCube(x, y, z);
                if (cube && cube.isSoil() && cube.isEmpty()) {
                    const above = vivarium.getCube(x, y + 1, z);
                    if (above && above.isAir()) {
                        return { x, y, z };
                    }
                }
            }
        }
        
        return null;
    }

    digSoil(vivarium) {
        // Digging aerates soil and mixes organic matter
        const cube = vivarium.getCube(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
        if (cube && cube.isSoil()) {
            // Slight increase in nutrient availability
            cube.nutrients = Math.min(100, cube.nutrients + 0.5);
            
            // Mix organic matter (helps decomposition)
            if (cube.organicMatter > 1) {
                const converted = Math.min(cube.organicMatter, 0.3);
                cube.organicMatter -= converted;
                cube.nutrients += converted * 0.8;
            }
        }
    }

    getAnimalColor() {
        switch (this.animalType) {
            case AnimalLife.ANIMAL_TYPES.HERBIVORE:
                return 0x8B4513; // Brown
            case AnimalLife.ANIMAL_TYPES.DECOMPOSER:
                return 0x654321; // Dark brown
            default:
                return 0x808080; // Gray
        }
    }

    isDead() {
        return this.energy <= 0;
    }

    onDeath(vivarium) {
        // Animals return some organic matter to soil when they die
        const cube = vivarium.getCube(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
        if (cube && cube.isSoil()) {
            cube.addOrganicMatter(3); // Animal carcass adds nutrients
        }
    }
}
