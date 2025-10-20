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
        // Simple noise function (deterministic based on seed)
        const noise = (x, z, scale, seed) => {
            const sx = (x / scale) + seed;
            const sz = (z / scale) + seed;
            return (
                Math.sin(sx * 0.1) * Math.cos(sz * 0.1) * 0.5 +
                Math.sin(sx * 0.3) * Math.cos(sz * 0.3) * 0.25 +
                Math.sin(sx * 0.7) * Math.cos(sz * 0.7) * 0.125
            );
        };

        // Multi-octave noise for more natural terrain
        let height = 0;
        height += noise(x, z, 50, this.seed) * 1.0;      // Large features
        height += noise(x, z, 25, this.seed + 1) * 0.5;  // Medium features
        height += noise(x, z, 10, this.seed + 2) * 0.25; // Small details
        
        // Normalize to 0-1 range, then scale and offset
        // noise function returns values roughly between -1 and 1
        const normalizedHeight = (height + 1) / 2; // Now 0 to 1
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

        // Apply heightmap
        const positions = geometry.attributes.position;
        const colors = [];
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            
            const height = this.generateHeight(x, y);
            positions.setZ(i, height);
            
            // Get biome color
            const biome = this.getBiome(height, x, y);
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
        terrain.rotation.x = -Math.PI / 2;
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
