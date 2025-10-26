import { Life } from './Life.js';
import { Genetics } from './Genetics.js';
import { PlantSpecies } from './PlantSpecies.js';

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

    constructor(x, y, z, generation = 1, reproductionType = null, parentGenetics = null, parent2Genetics = null, species = null) {
        super(x, y, z, 'plant');
        
        this.stage = PlantLife.GROWTH_STAGES.SEED;
        this.biomass = 1;
        this.height = 0;
        this.generation = generation;
        
        // Species characteristics
        if (species) {
            this.species = species;
        } else if (parentGenetics && parentGenetics.species) {
            // Inherit species from parent
            this.species = parentGenetics.species;
        } else {
            // Random species for first generation
            this.species = PlantSpecies.getRandomSpecies();
        }
        
        // Root and foliage system
        this.rootDepth = 0;
        this.maxRootDepth = this.species.rootDepth;
        this.foliageSize = 0;
        this.maxFoliageSize = this.species.foliageSize;
        
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
        
        // Store species in genetics for inheritance
        this.genetics.species = this.species;
        
        // Randomly choose reproduction type if not specified
        this.reproductionType = reproductionType || 
            (Math.random() < 0.3 ? PlantLife.REPRODUCTION_TYPE.SEXUAL : PlantLife.REPRODUCTION_TYPE.PARTHENOGENESIS);
        
        // Life cycle parameters influenced by genetics AND species
        const maturityGene = this.genetics.getGene('maturityTimeGene');
        const vigorGene = this.genetics.getGene('vigorGene');
        
        this.maxAge = (100 + Math.random() * 100) * vigorGene; // Vigor affects lifespan
        this.maturityAge = (30 + Math.random() * 20) / maturityGene; // Maturity gene affects time to mature
        this.floweringAge = this.maturityAge + 20;
        
        // Resource requirements influenced by efficiency genes AND species
        const waterEff = this.genetics.getGene('waterEfficiencyGene');
        const nutrientEff = this.genetics.getGene('nutrientEfficiencyGene');
        
        this.waterNeed = (this.species.waterNeed / waterEff); // Species + genetics
        this.nutrientNeed = (this.species.nutrientNeed / nutrientEff);
        
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

        // Grow roots to access deeper nutrients
        this.growRoots(deltaTime, vivarium);

        // PHOTOSYNTHESIS - Get light intensity at plant position (foliage height)
        const foliageY = this.y + Math.floor(this.height);
        const lightIntensity = vivarium.getLightIntensity(this.x, foliageY, this.z);
        const photosynthesisEnergy = lightIntensity * this.photosynthesisRate * this.foliageSize * deltaTime * 2;

        // Resource consumption from roots (scaled by genetics and root depth)
        let waterConsumed = 0;
        let nutrientsConsumed = 0;
        
        // Extract resources from cubes where roots are present
        for (let depth = 0; depth <= Math.floor(this.rootDepth); depth++) {
            const rootCube = vivarium.getCube(this.x, this.y - depth, this.z);
            if (rootCube && rootCube.isSoil()) {
                waterConsumed += rootCube.extractWater(this.waterNeed * deltaTime * 0.5);
                nutrientsConsumed += rootCube.extractNutrients(this.nutrientNeed * deltaTime * 0.5);
            }
        }

        // Energy management: photosynthesis + resources
        const resourceRatio = Math.min(
            waterConsumed / (this.waterNeed * deltaTime),
            nutrientsConsumed / (this.nutrientNeed * deltaTime)
        );

        if (resourceRatio < 0.3) {
            // Insufficient resources - losing energy
            this.energy -= deltaTime * 1.5;
        } else {
            // Energy from photosynthesis and resources
            const totalEnergy = photosynthesisEnergy * Math.sqrt(resourceRatio);
            
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

    growRoots(deltaTime, vivarium) {
        // Roots grow down to access deeper resources
        if (this.rootDepth < this.maxRootDepth) {
            const rootGrowthRate = 0.3 * deltaTime;
            this.rootDepth = Math.min(this.maxRootDepth, this.rootDepth + rootGrowthRate);
        }
    }

    grow(deltaTime) {
        // Growth rate depends on stage, genetics, and species
        const growthGene = this.genetics.getGene('growthRateGene');
        const maxHeightGene = this.genetics.getGene('maxHeightGene');
        
        let growthRate = 0;
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                growthRate = 0.1 * growthGene * this.species.growthRate;
                break;
            case PlantLife.GROWTH_STAGES.SPROUT:
                growthRate = 0.5 * growthGene * this.species.growthRate;
                break;
            case PlantLife.GROWTH_STAGES.GROWING:
                growthRate = 1.0 * growthGene * this.species.growthRate;
                break;
            case PlantLife.GROWTH_STAGES.MATURE:
                growthRate = 0.3 * growthGene * this.species.growthRate;
                break;
            case PlantLife.GROWTH_STAGES.FLOWERING:
                growthRate = 0.1 * growthGene * this.species.growthRate;
                break;
            default:
                growthRate = 0;
        }

        this.biomass += growthRate * deltaTime * 0.1;
        
        // Height based on species max height and genetics
        const speciesMaxHeight = this.species.maxHeight;
        this.height = Math.min(speciesMaxHeight * maxHeightGene, this.biomass * 0.5);
        
        // Foliage grows with plant
        this.foliageSize = Math.min(this.maxFoliageSize, this.biomass * 0.3);
    }

    reproduce(vivarium) {
        if (this.reproductionCooldown > 0 || this.energy < 50) {
            return;
        }

        // Fertility affects seed count, species affects base count
        const fertilityGene = this.genetics.getGene('fertilityGene');
        const speciesSeedCount = this.species.seedCount;
        
        // Determine number of seeds based on reproduction type, species, and fertility
        let baseSeedCount = 0;
        if (this.reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL) {
            // Sexual reproduction - species-based seed count
            baseSeedCount = Math.floor(speciesSeedCount * 0.5 * fertilityGene);
        } else {
            // Parthenogenesis - more seeds
            baseSeedCount = Math.floor(speciesSeedCount * fertilityGene);
        }

        let successfulSeeds = 0;
        
        // For sexual reproduction, try to find a mate nearby (same species)
        let mateGenetics = null;
        if (this.reproductionType === PlantLife.REPRODUCTION_TYPE.SEXUAL) {
            mateGenetics = this.findMate(vivarium);
        }
        
        // SEED DISPERSAL - seeds spread according to species characteristics
        for (let i = 0; i < baseSeedCount; i++) {
            // Wind/animal dispersal simulation
            const dispersalDistance = this.species.seedSpread;
            const spot = this.disperseSeed(vivarium, dispersalDistance);
            
            if (spot) {
                const seedling = new PlantLife(
                    spot.x, 
                    spot.y, 
                    spot.z, 
                    this.generation + 1,
                    this.reproductionType,
                    this.genetics,
                    mateGenetics, // null for parthenogenesis
                    this.species // inherit species
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
            this.energy -= 15; // Cost of reproduction
        }
    }

    findMate(vivarium) {
        // Find nearby flowering plants for sexual reproduction (same species only)
        const searchRadius = 5;
        
        for (const lifeform of vivarium.lifeforms) {
            if (lifeform !== this && 
                lifeform.type === 'plant' && 
                lifeform.species.name === this.species.name &&
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

    disperseSeed(vivarium, maxDistance) {
        // Seed dispersal with various patterns
        const attempts = 30;

        for (let i = 0; i < attempts; i++) {
            // Random dispersal within species-specific range
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * maxDistance;
            
            const dx = Math.floor(Math.cos(angle) * distance);
            const dz = Math.floor(Math.sin(angle) * distance);
            
            const x = this.x + dx;
            const z = this.z + dz;

            // Find suitable y (topmost soil)
            for (let y = vivarium.sizeY - 1; y >= 0; y--) {
                const cube = vivarium.getCube(x, y, z);
                if (cube && cube.isSoil() && cube.isEmpty() && cube.nutrients > 10) {
                    const above = vivarium.getCube(x, y + 1, z);
                    if (above && above.isAir()) {
                        return { x, y, z };
                    }
                }
            }
        }

        return null;
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
        // Color varies by growth stage with genetic AND species variation
        switch (this.stage) {
            case PlantLife.GROWTH_STAGES.SEED:
                return 0x8B4513; // Brown
            case PlantLife.GROWTH_STAGES.SPROUT:
                return 0x90EE90; // Light green
            case PlantLife.GROWTH_STAGES.GROWING:
                // Blend species color with genetic variation
                const speciesR = this.species.color.r;
                const speciesG = this.species.color.g;
                const speciesB = this.species.color.b;
                const r = Math.floor(speciesR * 255);
                const g = Math.floor(speciesG * 255);
                const b = Math.floor(speciesB * 255);
                return (r << 16) | (g << 8) | b;
            case PlantLife.GROWTH_STAGES.MATURE:
                // Use genetic color variation influenced by species
                const geneticColor = this.genetics.getMatureColor();
                return geneticColor;
            case PlantLife.GROWTH_STAGES.FLOWERING:
                // Flowering color varies by species
                if (this.species.name === 'flower') {
                    return 0xFF1493; // Deep pink for flower species
                } else if (this.species.name === 'tree') {
                    return 0x90EE90; // Light green for trees
                }
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
