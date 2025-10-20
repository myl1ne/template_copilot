/**
 * BiomeSystem - Manages biome-specific features and environment object placement
 */
export class BiomeSystem {
    constructor(terrainGenerator, environmentFactory) {
        this.terrainGenerator = terrainGenerator;
        this.environmentFactory = environmentFactory;
        
        // Define what objects can spawn in each biome
        this.biomeRules = {
            grassland: {
                trees: { density: 0.3, types: ['oak', 'birch'] },
                rocks: { density: 0.2, types: ['normal'] },
                features: ['campfire', 'sign']
            },
            forest: {
                trees: { density: 0.7, types: ['oak', 'pine'] },
                rocks: { density: 0.1, types: ['mossy'] },
                features: ['mushroom', 'bush']
            },
            desert: {
                trees: { density: 0.05, types: ['dead'] },
                rocks: { density: 0.4, types: ['sandstone'] },
                features: ['cactus', 'bones']
            },
            mountain: {
                trees: { density: 0.1, types: ['pine'] },
                rocks: { density: 0.6, types: ['granite'] },
                features: ['cave']
            },
            snow: {
                trees: { density: 0.15, types: ['pine'] },
                rocks: { density: 0.3, types: ['ice'] },
                features: ['snowman']
            },
            beach: {
                trees: { density: 0.1, types: ['palm'] },
                rocks: { density: 0.3, types: ['smooth'] },
                features: ['shells', 'driftwood']
            },
            water: {
                trees: { density: 0, types: [] },
                rocks: { density: 0, types: [] },
                features: ['lily']
            }
        };
    }

    /**
     * Check if a position is suitable for placing an object
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {string} objectType - Type of object to place
     * @returns {boolean} True if position is suitable
     */
    isSuitablePosition(x, z, objectType) {
        const biome = this.terrainGenerator.getBiomeAt(x, z);
        const rules = this.biomeRules[biome.type];
        
        if (!rules) return false;

        // Don't place objects in water (except water-specific features)
        if (biome.type === 'water' && objectType !== 'lily') {
            return false;
        }

        // Check if object type is allowed in this biome
        if (objectType === 'tree') {
            return rules.trees.density > 0 && Math.random() < rules.trees.density;
        } else if (objectType === 'rock') {
            return rules.rocks.density > 0 && Math.random() < rules.rocks.density;
        }

        return rules.features.includes(objectType);
    }

    /**
     * Get the variant/type for an object in this biome
     * @param {string} objectType - Type of object
     * @param {string} biomeType - Type of biome
     * @returns {string} Specific variant for this biome
     */
    getObjectVariant(objectType, biomeType) {
        const rules = this.biomeRules[biomeType];
        if (!rules) return 'default';

        if (objectType === 'tree' && rules.trees.types.length > 0) {
            return rules.trees.types[Math.floor(Math.random() * rules.trees.types.length)];
        } else if (objectType === 'rock' && rules.rocks.types.length > 0) {
            return rules.rocks.types[Math.floor(Math.random() * rules.rocks.types.length)];
        }

        return 'default';
    }

    /**
     * Populate terrain with biome-appropriate objects
     * @param {number} count - Number of objects to attempt to place
     * @param {string} objectType - Type of object ('tree', 'rock', etc.)
     * @param {Function} createCallback - Callback to create the object
     * @returns {Array} Array of created objects
     */
    populateBiomeObjects(count, objectType, createCallback) {
        const objects = [];
        const halfSize = this.terrainGenerator.size / 2;
        
        for (let i = 0; i < count; i++) {
            // Random position
            const x = (Math.random() - 0.5) * this.terrainGenerator.size;
            const z = (Math.random() - 0.5) * this.terrainGenerator.size;
            
            // Check if suitable for this biome
            if (this.isSuitablePosition(x, z, objectType)) {
                const biome = this.terrainGenerator.getBiomeAt(x, z);
                const variant = this.getObjectVariant(objectType, biome.type);
                const height = this.terrainGenerator.getHeightAt(x, z);
                
                // Only place on land (above water level)
                if (height >= this.terrainGenerator.waterLevel) {
                    const obj = createCallback(x, z, height, variant, biome.type);
                    if (obj) {
                        objects.push(obj);
                    }
                }
            }
        }
        
        return objects;
    }

    /**
     * Get biome statistics for a given area
     * @param {number} samples - Number of sample points to check
     * @returns {Object} Biome distribution statistics
     */
    analyzeBiomeDistribution(samples = 1000) {
        const distribution = {};
        const halfSize = this.terrainGenerator.size / 2;
        
        for (let i = 0; i < samples; i++) {
            const x = (Math.random() - 0.5) * this.terrainGenerator.size;
            const z = (Math.random() - 0.5) * this.terrainGenerator.size;
            
            const biome = this.terrainGenerator.getBiomeAt(x, z);
            distribution[biome.type] = (distribution[biome.type] || 0) + 1;
        }
        
        // Convert to percentages
        for (const biomeType in distribution) {
            distribution[biomeType] = (distribution[biomeType] / samples * 100).toFixed(1) + '%';
        }
        
        return distribution;
    }
}
