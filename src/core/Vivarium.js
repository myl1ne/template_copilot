import { Cube } from './Cube.js';

/**
 * Vivarium - The main container managing the cube-of-cubes grid
 */
export class Vivarium {
    constructor(sizeX = 20, sizeY = 20, sizeZ = 20) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        
        // 3D grid of cubes
        this.grid = [];
        this.initializeGrid();
        
        // Life forms in the vivarium
        this.lifeforms = [];
        this.time = 0;
        
        // Sunlight system
        this.sunIntensity = 1.0; // Maximum sunlight intensity
        this.sunAngle = Math.PI / 4; // Sun angle (45 degrees)
    }

    initializeGrid() {
        // Create a 3D array of cubes
        for (let x = 0; x < this.sizeX; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.sizeY; y++) {
                this.grid[x][y] = [];
                for (let z = 0; z < this.sizeZ; z++) {
                    const type = this.determineCubeType(x, y, z);
                    this.grid[x][y][z] = new Cube(x, y, z, type);
                }
            }
        }
    }

    /**
     * Determine what type of cube should be at this position
     */
    determineCubeType(x, y, z) {
        // Bottom layer: mostly soil
        if (y === 0) {
            return Cube.TYPES.SOIL;
        }
        
        // Low layers: mix of soil and water
        if (y < 3) {
            // Create some water pockets
            if (Math.random() < 0.15) {
                return Cube.TYPES.WATER;
            }
            return Cube.TYPES.SOIL;
        }
        
        // Mid-low layers: mostly soil with some water
        if (y < 5) {
            if (Math.random() < 0.05) {
                return Cube.TYPES.WATER;
            }
            return Cube.TYPES.SOIL;
        }
        
        // Higher layers: air
        return Cube.TYPES.AIR;
    }

    /**
     * Get a cube at specific coordinates
     */
    getCube(x, y, z) {
        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY || z < 0 || z >= this.sizeZ) {
            return null;
        }
        return this.grid[x][y][z];
    }

    /**
     * Get neighboring cubes (6 directions: up, down, left, right, front, back)
     */
    getNeighbors(x, y, z) {
        const neighbors = [];
        const directions = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];
        
        for (const [dx, dy, dz] of directions) {
            const neighbor = this.getCube(x + dx, y + dy, z + dz);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }

    /**
     * Find a suitable location for planting (soil cube with air above)
     */
    findPlantingSpot() {
        const maxAttempts = 100;
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.floor(Math.random() * this.sizeX);
            const z = Math.floor(Math.random() * this.sizeZ);
            
            // Find the topmost soil layer
            for (let y = this.sizeY - 1; y >= 0; y--) {
                const cube = this.getCube(x, y, z);
                if (cube && cube.isSoil() && cube.isEmpty()) {
                    const above = this.getCube(x, y + 1, z);
                    if (above && above.isAir()) {
                        return { x, y, z };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Add a life form to the vivarium
     */
    addLifeform(lifeform) {
        this.lifeforms.push(lifeform);
    }

    /**
     * Remove a life form from the vivarium
     */
    removeLifeform(lifeform) {
        const index = this.lifeforms.indexOf(lifeform);
        if (index > -1) {
            this.lifeforms.splice(index, 1);
        }
    }

    /**
     * Update all cubes and life forms
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Update all cubes
        for (let x = 0; x < this.sizeX; x++) {
            for (let y = 0; y < this.sizeY; y++) {
                for (let z = 0; z < this.sizeZ; z++) {
                    const cube = this.grid[x][y][z];
                    const neighbors = this.getNeighbors(x, y, z);
                    cube.update(neighbors);
                }
            }
        }

        // Update all life forms
        const toRemove = [];
        for (const lifeform of this.lifeforms) {
            lifeform.update(deltaTime, this);
            
            // Remove dead life forms
            if (lifeform.isDead && lifeform.isDead()) {
                // Call death handler if it exists
                if (lifeform.onDeath) {
                    lifeform.onDeath(this);
                }
                toRemove.push(lifeform);
            }
        }

        // Remove dead life forms
        for (const lifeform of toRemove) {
            this.removeLifeform(lifeform);
        }
    }

    /**
     * Get all renderable cubes (excluding air)
     */
    getRenderableCubes() {
        const cubes = [];
        for (let x = 0; x < this.sizeX; x++) {
            for (let y = 0; y < this.sizeY; y++) {
                for (let z = 0; z < this.sizeZ; z++) {
                    const cube = this.grid[x][y][z];
                    if (!cube.isAir()) {
                        cubes.push(cube);
                    }
                }
            }
        }
        return cubes;
    }

    /**
     * Calculate sunlight intensity at a given position
     * Light decreases with depth and is affected by shadowing
     */
    getLightIntensity(x, y, z) {
        // Base light intensity decreases with depth from top
        const heightFactor = y / this.sizeY;
        let lightIntensity = this.sunIntensity * Math.pow(heightFactor, 0.5);
        
        // Check for shadowing by checking if there are non-air cubes above
        let shadowFactor = 1.0;
        for (let checkY = y + 1; checkY < this.sizeY; checkY++) {
            const cubeAbove = this.getCube(x, checkY, z);
            if (cubeAbove && !cubeAbove.isAir()) {
                // Each non-air cube above reduces light
                shadowFactor *= 0.7;
            }
        }
        
        lightIntensity *= shadowFactor;
        
        return Math.max(0.1, Math.min(1.0, lightIntensity)); // Clamp between 0.1 and 1.0
    }

    /**
     * Get statistics about the vivarium
     */
    getStats() {
        let plantCount = 0;
        let animalCount = 0;
        let totalBiomass = 0;
        let maxGeneration = 1;
        let totalFitness = 0;
        let fitnessCount = 0;

        for (const lifeform of this.lifeforms) {
            if (lifeform.type === 'plant') {
                plantCount++;
                totalBiomass += lifeform.biomass || 0;
                maxGeneration = Math.max(maxGeneration, lifeform.generation || 1);
                
                // Track genetic fitness
                if (lifeform.genetics) {
                    totalFitness += lifeform.genetics.getFitness();
                    fitnessCount++;
                }
            } else if (lifeform.type === 'animal') {
                animalCount++;
            }
        }

        return {
            plantCount,
            animalCount,
            totalBiomass: Math.round(totalBiomass),
            maxGeneration,
            time: Math.round(this.time),
            avgFitness: fitnessCount > 0 ? (totalFitness / fitnessCount).toFixed(2) : 0
        };
    }
}
