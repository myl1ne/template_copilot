import { Life } from './Life.js';

/**
 * PlantLife - Represents plant life with growth, reproduction, and death cycles
 */
export class PlantLife extends Life {
    static GROWTH_STAGES = {
        SEED: 'seed',
        SPROUT: 'sprout',
        GROWING: 'growing',
        MATURE: 'mature',
        FLOWERING: 'flowering',
        DYING: 'dying'
    };

    static REPRODUCTION_TYPE = {
        SEXUAL: 'sexual',
        PARTHENOGENESIS: 'parthenogenesis'
    };

    constructor(x, y, z, generation = 1, reproductionType = null) {
        super(x, y, z, 'plant');
        
        this.stage = PlantLife.GROWTH_STAGES.SEED;
        this.biomass = 1;
        this.height = 0;
        this.generation = generation;
        
        // Randomly choose reproduction type if not specified
        this.reproductionType = reproductionType || 
            (Math.random() < 0.3 ? PlantLife.REPRODUCTION_TYPE.SEXUAL : PlantLife.REPRODUCTION_TYPE.PARTHENOGENESIS);
        
        // Life cycle parameters
        this.maxAge = 100 + Math.random() * 100; // 100-200 time units
        this.maturityAge = 30 + Math.random() * 20; // 30-50 time units
        this.floweringAge = this.maturityAge + 20;
        
        // Resource requirements
        this.waterNeed = 0.5;
        this.nutrientNeed = 0.3;
        
        // Reproduction
        this.hasReproduced = false;
        this.reproductionCooldown = 0;
        this.seedCount = 0;
    }

    update(deltaTime, vivarium) {
        super.update(deltaTime, vivarium);

        // Get the cube the plant is growing in
        const cube = vivarium.getCube(this.x, this.y, this.z);
        if (!cube) {
            this.energy = 0;
            return;
        }

        // Update growth stage based on age
        this.updateGrowthStage();

        // Resource consumption
        const waterConsumed = cube.extractWater(this.waterNeed * deltaTime);
        const nutrientsConsumed = cube.extractNutrients(this.nutrientNeed * deltaTime);

        // Energy management
        if (waterConsumed < this.waterNeed * deltaTime * 0.5 || 
            nutrientsConsumed < this.nutrientNeed * deltaTime * 0.5) {
            // Insufficient resources
            this.energy -= deltaTime * 2;
        } else {
            // Sufficient resources - grow
            if (this.stage !== PlantLife.GROWTH_STAGES.DYING) {
                this.energy = Math.min(100, this.energy + deltaTime * 0.5);
                this.grow(deltaTime);
            }
        }

        // Natural aging
        if (this.age > this.maxAge) {
            this.stage = PlantLife.GROWTH_STAGES.DYING;
            this.energy -= deltaTime * 3;
        }

        // Reproduction
        if (this.stage === PlantLife.GROWTH_STAGES.FLOWERING && !this.hasReproduced) {
            this.reproduce(vivarium);
        }

        // Update reproduction cooldown
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= deltaTime;
        }

        // Death handling
        if (this.isDead()) {
            this.onDeath(cube);
        }
    }

    updateGrowthStage() {
        if (this.age < 5) {
            this.stage = PlantLife.GROWTH_STAGES.SEED;
        } else if (this.age < 15) {
            this.stage = PlantLife.GROWTH_STAGES.SPROUT;
        } else if (this.age < this.maturityAge) {
            this.stage = PlantLife.GROWTH_STAGES.GROWING;
        } else if (this.age < this.floweringAge) {
            this.stage = PlantLife.GROWTH_STAGES.MATURE;
        } else if (this.age < this.maxAge) {
            this.stage = PlantLife.GROWTH_STAGES.FLOWERING;
        } else {
            this.stage = PlantLife.GROWTH_STAGES.DYING;
        }
    }

    grow(deltaTime) {
        // Growth rate depends on stage
        let growthRate = 0;
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                growthRate = 0.1;
                break;
            case PlantLife.GROWTH_STAGES.SPROUT:
                growthRate = 0.5;
                break;
            case PlantLife.GROWTH_STAGES.GROWING:
                growthRate = 1.0;
                break;
            case PlantLife.GROWTH_STAGES.MATURE:
                growthRate = 0.3;
                break;
            case PlantLife.GROWTH_STAGES.FLOWERING:
                growthRate = 0.1;
                break;
            default:
                growthRate = 0;
        }

        this.biomass += growthRate * deltaTime * 0.1;
        this.height = Math.min(5, this.biomass * 0.5);
    }

    reproduce(vivarium) {
        if (this.reproductionCooldown > 0 || this.energy < 50) {
            return;
        }

        // Determine number of seeds based on reproduction type
        let seedCount = 0;
        if (this.reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL) {
            // Sexual reproduction - fewer, more robust seeds
            seedCount = Math.floor(1 + Math.random() * 3); // 1-3 seeds
        } else {
            // Parthenogenesis - more seeds, but potentially less variation
            seedCount = Math.floor(2 + Math.random() * 5); // 2-6 seeds
        }

        let successfulSeeds = 0;
        for (let i = 0; i < seedCount; i++) {
            // Find nearby suitable planting spot
            const spot = this.findNearbyPlantingSpot(vivarium);
            if (spot) {
                const seedling = new PlantLife(
                    spot.x, 
                    spot.y, 
                    spot.z, 
                    this.generation + 1,
                    this.reproductionType
                );
                
                // Mark the cube as occupied
                const cube = vivarium.getCube(spot.x, spot.y, spot.z);
                if (cube) {
                    cube.setOccupant(seedling);
                    vivarium.addLifeform(seedling);
                    successfulSeeds++;
                }
            }
        }

        if (successfulSeeds > 0) {
            this.hasReproduced = true;
            this.reproductionCooldown = 20; // Can reproduce again after cooldown
            this.seedCount += successfulSeeds;
            this.energy -= 20; // Cost of reproduction
        }
    }

    findNearbyPlantingSpot(vivarium) {
        // Search in a radius around the plant
        const searchRadius = 3;
        const attempts = 20;

        for (let i = 0; i < attempts; i++) {
            const dx = Math.floor(Math.random() * searchRadius * 2) - searchRadius;
            const dz = Math.floor(Math.random() * searchRadius * 2) - searchRadius;
            
            const x = this.x + dx;
            const z = this.z + dz;

            // Find suitable y (topmost soil)
            for (let y = vivarium.sizeY - 1; y >= 0; y--) {
                const cube = vivarium.getCube(x, y, z);
                if (cube && cube.isSoil() && cube.isEmpty() && cube.nutrients > 20) {
                    const above = vivarium.getCube(x, y + 1, z);
                    if (above && above.isAir()) {
                        return { x, y, z };
                    }
                }
            }
        }

        return null;
    }

    onDeath(cube) {
        // Return biomass to soil as organic matter
        if (cube && cube.isSoil()) {
            cube.addOrganicMatter(this.biomass);
        }
        
        // Clear occupancy
        if (cube) {
            cube.removeOccupant();
        }
    }

    isDead() {
        return this.energy <= 0;
    }

    getColor() {
        // Color varies by growth stage
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                return 0x8B4513; // Brown
            case PlantLife.GROWTH_STAGES.SPROUT:
                return 0x90EE90; // Light green
            case PlantLife.GROWTH_STAGES.GROWING:
                return 0x228B22; // Forest green
            case PlantLife.GROWTH_STAGES.MATURE:
                return 0x006400; // Dark green
            case PlantLife.GROWTH_STAGES.FLOWERING:
                return 0xFF69B4; // Pink (flowers)
            case PlantLife.GROWTH_STAGES.DYING:
                return 0xA0522D; // Brown (dying)
            default:
                return 0x00FF00; // Default green
        }
    }

    getSize() {
        return Math.max(0.3, this.biomass * 0.2);
    }
}
