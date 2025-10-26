import { Life } from './Life.js';

/**
 * AnimalLife - Base class for animal life with movement and interactions
 */
export class AnimalLife extends Life {
    static ANIMAL_TYPES = {
        HERBIVORE: 'herbivore',
        DECOMPOSER: 'decomposer'
    };

    constructor(x, y, z, animalType = AnimalLife.ANIMAL_TYPES.HERBIVORE) {
        super(x, y, z, 'animal');
        
        this.animalType = animalType;
        this.speed = 0.5;
        this.targetX = x;
        this.targetZ = z;
        this.hunger = 50;
        this.maxHunger = 100;
        
        // Movement state
        this.isMoving = false;
        this.movementCooldown = 0;
        
        // Size and appearance
        this.size = 0.4;
        this.color = this.getAnimalColor();
    }

    update(deltaTime, vivarium) {
        super.update(deltaTime, vivarium);
        
        // Hunger increases over time
        this.hunger = Math.min(this.maxHunger, this.hunger + deltaTime * 2);
        
        // Energy decreases with hunger
        if (this.hunger > 80) {
            this.energy -= deltaTime * 1.5;
        }
        
        // Movement
        this.updateMovement(deltaTime, vivarium);
        
        // Behavior based on type
        if (this.animalType === AnimalLife.ANIMAL_TYPES.HERBIVORE) {
            this.herbivoreBehavior(deltaTime, vivarium);
        } else if (this.animalType === AnimalLife.ANIMAL_TYPES.DECOMPOSER) {
            this.decomposerBehavior(deltaTime, vivarium);
        }
        
        // Natural aging
        if (this.age > 150) {
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
        const moveSpeed = this.speed * deltaTime;
        const moveX = (dx / distance) * moveSpeed;
        const moveZ = (dz / distance) * moveSpeed;
        
        const newX = Math.round(this.x + moveX);
        const newZ = Math.round(this.z + moveZ);
        
        // Find ground level at new position
        const newY = this.findGroundLevel(vivarium, newX, newZ);
        
        if (newY !== null) {
            this.x = newX;
            this.z = newZ;
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
                this.eatPlant(nearbyPlant, vivarium);
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
        const searchRadius = 2;
        
        for (const lifeform of vivarium.lifeforms) {
            if (lifeform.type === 'plant') {
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

    eatPlant(plant, vivarium) {
        // Eat plant biomass
        const amountEaten = Math.min(plant.biomass * 0.3, 5);
        plant.biomass -= amountEaten;
        plant.energy -= amountEaten * 5;
        
        // Gain energy and reduce hunger
        this.energy = Math.min(100, this.energy + amountEaten * 2);
        this.hunger = Math.max(0, this.hunger - amountEaten * 10);
        
        // Small chance to spread plant seeds (animal dispersal)
        if (Math.random() < 0.1 && plant.species) {
            this.spreadSeed(plant, vivarium);
        }
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
