import * as THREE from 'three';

/**
 * TerrainGenerator - Generates heightmap-based terrain with biome support
 * Provides modular and composable terrain generation
 */
export class TerrainGenerator {
    constructor(options = {}) {
        this.size = options.size || 100;
        this.segments = options.segments || 100;
        this.heightScale = options.heightScale || 10;
        this.waterLevel = options.waterLevel || 0; // Default to sea level at 0
        this.seed = options.seed || Math.random() * 1000;
    }

    /**
     * Generate heightmap using multiple octaves of Perlin-like noise
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Height value
     */
    generateHeight(x, z) {
        // Enhanced noise function for dramatic terrain variation
        const noise = (x, z, scale, seed) => {
            const sx = (x / scale) + seed;
            const sz = (z / scale) + seed;
            // Use more aggressive frequency multipliers for better variation
            return (
                Math.sin(sx * 0.2) * Math.cos(sz * 0.2) * 1.2 +
                Math.sin(sx * 0.5) * Math.cos(sz * 0.5) * 0.6 +
                Math.sin(sx * 1.2) * Math.cos(sz * 1.2) * 0.3 +
                Math.sin(sx * 2.0) * Math.cos(sz * 2.0) * 0.15
            );
        };

        // Multi-octave noise for dramatic terrain with high amplitude
        let height = 0;
        height += noise(x, z, 35, this.seed) * 1.5;       // Large features (more dramatic)
        height += noise(x, z, 18, this.seed + 1) * 0.8;   // Medium features
        height += noise(x, z, 7, this.seed + 2) * 0.4;    // Small details
        height += noise(x, z, 3, this.seed + 3) * 0.2;    // Fine details
        
        // The noise function now returns values with wider range for more variation
        // Normalize to 0-1 range with better distribution
        const normalizedHeight = Math.max(0, Math.min(1, (height + 2.5) / 5));
        return normalizedHeight * this.heightScale;
    }

    /**
     * Determine biome based on height and other factors
     * @param {number} height - Height at this location
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {Object} Biome information
     */
    getBiome(height, x, z) {
        // Calculate moisture (using different noise pattern)
        const moisture = (
            Math.sin((x / 30) + this.seed * 2) * 
            Math.cos((z / 30) + this.seed * 2) + 1
        ) / 2;

        // Water (below water level)
        if (height < this.waterLevel) {
            return {
                type: 'water',
                color: new THREE.Color(0x1e90ff),
                roughness: 0.1,
                metalness: 0.3
            };
        }
        
        // Beach/Sand (just above water level)
        if (height < this.waterLevel + this.heightScale * 0.15) {
            return {
                type: 'beach',
                color: new THREE.Color(0xf4e4c1),
                roughness: 0.9,
                metalness: 0.0
            };
        }
        
        // Snow (high altitude) - top 15%
        if (height > this.waterLevel + this.heightScale * 0.75) {
            return {
                type: 'snow',
                color: new THREE.Color(0xffffff),
                roughness: 0.8,
                metalness: 0.0
            };
        }
        
        // Mountain/Rock (medium-high altitude) - 60-75%
        if (height > this.waterLevel + this.heightScale * 0.60) {
            return {
                type: 'mountain',
                color: new THREE.Color(0x696969),
                roughness: 0.95,
                metalness: 0.1
            };
        }
        
        // Forest (high moisture, medium altitude)
        if (moisture > 0.6 && height > this.waterLevel + this.heightScale * 0.15) {
            return {
                type: 'forest',
                color: new THREE.Color(0x2d5016),
                roughness: 0.85,
                metalness: 0.0
            };
        }
        
        // Desert (low moisture)
        if (moisture < 0.3) {
            return {
                type: 'desert',
                color: new THREE.Color(0xdaa520),
                roughness: 0.9,
                metalness: 0.0
            };
        }
        
        // Default grassland
        return {
            type: 'grassland',
            color: new THREE.Color(0x3a7d44),
            roughness: 0.8,
            metalness: 0.2
        };
    }

    /**
     * Create terrain mesh with heightmap and vertex coloring for biomes
     * @returns {THREE.Mesh} Terrain mesh
     */
    createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            this.size, 
            this.size, 
            this.segments, 
            this.segments
        );

        // Rotate geometry first, then apply heights
        geometry.rotateX(-Math.PI / 2);

        // Apply heightmap
        const positions = geometry.attributes.position;
        const colors = [];
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            
            const height = this.generateHeight(x, z);
            // After rotation, Y is up, so we set the Y position
            positions.setY(i, height);
            
            // Get biome color
            const biome = this.getBiome(height, x, z);
            colors.push(biome.color.r, biome.color.g, biome.color.b);
        }
        
        // Add vertex colors
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        // Create material with vertex colors
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: false
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.receiveShadow = true;
        terrain.castShadow = false;

        return terrain;
    }

    /**
     * Get height at specific world position (for object placement)
     * @param {number} x - World X coordinate
     * @param {number} z - World Z coordinate
     * @returns {number} Height at position
     */
    getHeightAt(x, z) {
        return this.generateHeight(x, z);
    }

    /**
     * Get biome at specific world position (for environment object placement)
     * @param {number} x - World X coordinate
     * @param {number} z - World Z coordinate
     * @returns {Object} Biome information
     */
    getBiomeAt(x, z) {
        const height = this.generateHeight(x, z);
        return this.getBiome(height, x, z);
    }

    /**
     * Check if position is on water
     * @param {number} x - World X coordinate
     * @param {number} z - World Z coordinate
     * @returns {boolean} True if position is water
     */
    isWater(x, z) {
        return this.generateHeight(x, z) < this.waterLevel;
    }
}
