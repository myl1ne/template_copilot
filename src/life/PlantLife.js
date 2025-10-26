import { Life } from './Life.js';
import { Genetics } from './Genetics.js';

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

    constructor(x, y, z, generation = 1, reproductionType = null, parentGenetics = null, parent2Genetics = null) {
        super(x, y, z, 'plant');
        
        this.stage = PlantLife.GROWTH_STAGES.SEED;
        this.biomass = 1;
        this.height = 0;
        this.generation = generation;
        
        // Initialize genetics
        if (reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL && parent2Genetics) {
            // Sexual reproduction - inherit from both parents
            this.genetics = new Genetics(parentGenetics?.genes, parent2Genetics.genes);
        } else if (parentGenetics) {
            // Parthenogenesis - clone parent with mutations
            this.genetics = new Genetics(parentGenetics.genes, null);
        } else {
            // First generation - random genetics
            this.genetics = new Genetics();
        }
        
        // Randomly choose reproduction type if not specified
        this.reproductionType = reproductionType || 
            (Math.random() < 0.3 ? PlantLife.REPRODUCTION_TYPE.SEXUAL : PlantLife.REPRODUCTION_TYPE.PARTHENOGENESIS);
        
        // Life cycle parameters influenced by genetics
        const maturityGene = this.genetics.getGene('maturityTimeGene');
        const vigorGene = this.genetics.getGene('vigorGene');
        
        this.maxAge = (100 + Math.random() * 100) * vigorGene; // Vigor affects lifespan
        this.maturityAge = (30 + Math.random() * 20) / maturityGene; // Maturity gene affects time to mature
        this.floweringAge = this.maturityAge + 20;
        
        // Resource requirements influenced by efficiency genes
        const waterEff = this.genetics.getGene('waterEfficiencyGene');
        const nutrientEff = this.genetics.getGene('nutrientEfficiencyGene');
        
        this.waterNeed = 0.5 / waterEff; // Better efficiency = less water needed
        this.nutrientNeed = 0.3 / nutrientEff; // Better efficiency = fewer nutrients needed
        
        // Photosynthesis capability
        this.photosynthesisRate = this.genetics.getGene('photosynthesisGene');
        
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

        // PHOTOSYNTHESIS - Get light intensity at plant position
        const lightIntensity = vivarium.getLightIntensity(this.x, this.y + Math.floor(this.height), this.z);
        const photosynthesisEnergy = lightIntensity * this.photosynthesisRate * deltaTime * 2;

        // Resource consumption (scaled by genetics)
        const waterConsumed = cube.extractWater(this.waterNeed * deltaTime);
        const nutrientsConsumed = cube.extractNutrients(this.nutrientNeed * deltaTime);

        // Energy management: photosynthesis + resources
        const resourceRatio = Math.min(
            waterConsumed / (this.waterNeed * deltaTime),
            nutrientsConsumed / (this.nutrientNeed * deltaTime)
        );

        if (resourceRatio < 0.5) {
            // Insufficient resources - losing energy
            this.energy -= deltaTime * 2;
        } else {
            // Energy from photosynthesis and resources
            const totalEnergy = photosynthesisEnergy * resourceRatio;
            
            if (this.stage !== PlantLife.GROWTH_STAGES.DYING) {
                this.energy = Math.min(100, this.energy + totalEnergy);
                this.grow(deltaTime * resourceRatio);
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
        // Growth rate depends on stage and genetics
        const growthGene = this.genetics.getGene('growthRateGene');
        const maxHeightGene = this.genetics.getGene('maxHeightGene');
        
        let growthRate = 0;
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                growthRate = 0.1 * growthGene;
                break;
            case PlantLife.GROWTH_STAGES.SPROUT:
                growthRate = 0.5 * growthGene;
                break;
            case PlantLife.GROWTH_STAGES.GROWING:
                growthRate = 1.0 * growthGene;
                break;
            case PlantLife.GROWTH_STAGES.MATURE:
                growthRate = 0.3 * growthGene;
                break;
            case PlantLife.GROWTH_STAGES.FLOWERING:
                growthRate = 0.1 * growthGene;
                break;
            default:
                growthRate = 0;
        }

        this.biomass += growthRate * deltaTime * 0.1;
        this.height = Math.min(5 * maxHeightGene, this.biomass * 0.5);
    }

    reproduce(vivarium) {
        if (this.reproductionCooldown > 0 || this.energy < 50) {
            return;
        }

        // Fertility affects seed count
        const fertilityGene = this.genetics.getGene('fertilityGene');
        
        // Determine number of seeds based on reproduction type and fertility
        let baseSeedCount = 0;
        if (this.reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL) {
            // Sexual reproduction - fewer, more robust seeds
            baseSeedCount = Math.floor((1 + Math.random() * 3) * fertilityGene); // 1-3 seeds * fertility
        } else {
            // Parthenogenesis - more seeds, but potentially less variation
            baseSeedCount = Math.floor((2 + Math.random() * 5) * fertilityGene); // 2-6 seeds * fertility
        }

        let successfulSeeds = 0;
        
        // For sexual reproduction, try to find a mate nearby
        let mateGenetics = null;
        if (this.reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL) {
            mateGenetics = this.findMate(vivarium);
        }
        
        for (let i = 0; i < baseSeedCount; i++) {
            // Find nearby suitable planting spot
            const spot = this.findNearbyPlantingSpot(vivarium);
            if (spot) {
                const seedling = new PlantLife(
                    spot.x, 
                    spot.y, 
                    spot.z, 
                    this.generation + 1,
                    this.reproductionType,
                    this.genetics,
                    mateGenetics // null for parthenogenesis
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

    findMate(vivarium) {
        // Find nearby flowering plants for sexual reproduction
        const searchRadius = 5;
        
        for (const lifeform of vivarium.lifeforms) {
            if (lifeform !== this && 
                lifeform.type === 'plant' && 
                lifeform.stage === PlantLife.GROWTH_STAGES.FLOWERING) {
                
                const dx = lifeform.x - this.x;
                const dz = lifeform.z - this.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance <= searchRadius) {
                    return lifeform.genetics;
                }
            }
        }
        
        return null; // No mate found, will reproduce asexually
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
        // Color varies by growth stage with genetic variation
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                return 0x8B4513; // Brown
            case PlantLife.GROWTH_STAGES.SPROUT:
                return 0x90EE90; // Light green
            case PlantLife.GROWTH_STAGES.GROWING:
                return 0x228B22; // Forest green
            case PlantLife.GROWTH_STAGES.MATURE:
                // Use genetic color variation for mature plants
                return this.genetics.getMatureColor();
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
