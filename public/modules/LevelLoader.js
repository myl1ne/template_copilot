import * as THREE from 'three';
import { MeshLibrary } from './MeshLibrary.js';
import { TerrainFeatures } from './TerrainFeatures.js';

/**
 * LevelLoader - Loads and applies level configuration from JSON
 * Integrates with mesh library, terrain system, and all game systems
 */
export class LevelLoader {
    constructor(scene, terrainGenerator, npcFactory, monsterFactory, environmentFactory) {
        this.scene = scene;
        this.terrainGenerator = terrainGenerator;
        this.npcFactory = npcFactory;
        this.monsterFactory = monsterFactory;
        this.environmentFactory = environmentFactory;
        this.terrainFeatures = new TerrainFeatures(scene);
        
        this.loadedLevel = null;
        this.placedObjects = {
            npcs: [],
            monsters: [],
            buildings: [],
            props: [],
            chests: [],
            terrainFeatures: []
        };
    }

    /**
     * Load a level from JSON file
     * @param {string} levelPath - Path to level JSON file
     * @returns {Promise<Object>} Loaded level data
     */
    async loadLevel(levelPath) {
        try {
            const response = await fetch(levelPath);
            if (!response.ok) {
                throw new Error(`Failed to load level: ${response.statusText}`);
            }
            
            const levelData = await response.json();
            this.loadedLevel = levelData;
            
            console.log(`Level loaded: ${levelData.name} v${levelData.version}`);
            return levelData;
        } catch (error) {
            console.error('Error loading level:', error);
            throw error;
        }
    }

    /**
     * Apply terrain configuration from level data
     * Note: This should be called BEFORE terrain is generated
     * @param {Object} levelData - Level configuration
     * @returns {Object} Terrain configuration
     */
    getTerrainConfig(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.terrain) {
            return null;
        }
        
        return {
            size: data.terrain.size || 100,
            segments: data.terrain.segments || 100,
            heightScale: data.terrain.heightScale || 10,
            waterLevel: data.terrain.waterLevel || 3,
            seed: data.terrain.seed || Math.random() * 10000
        };
    }

    /**
     * Place all buildings from level data
     * @param {Object} levelData - Level configuration
     */
    placeBuildings(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.buildings) {
            return;
        }

        data.buildings.forEach(building => {
            const mesh = MeshLibrary.getMesh('buildings', building.type);
            if (!mesh) {
                console.warn(`Building type not found: ${building.type}`);
                return;
            }

            // Position on terrain
            const x = building.position.x;
            const z = building.position.z;
            const y = this.terrainGenerator ? 
                this.terrainGenerator.getHeightAt(x, z) : 0;

            mesh.position.set(x, y, z);
            
            if (building.rotation !== undefined) {
                mesh.rotation.y = building.rotation;
            }
            
            if (building.scale !== undefined) {
                mesh.scale.setScalar(building.scale);
            }

            mesh.userData.buildingType = building.type;
            mesh.userData.name = building.name || building.type;
            
            this.scene.add(mesh);
            this.placedObjects.buildings.push({
                mesh,
                data: building
            });
            
            console.log(`Placed building: ${building.type} at (${x}, ${z})`);
        });

        console.log(`Total buildings placed: ${this.placedObjects.buildings.length}`);
    }

    /**
     * Place all props from level data
     * @param {Object} levelData - Level configuration
     */
    placeProps(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.props) {
            return;
        }

        data.props.forEach(prop => {
            const mesh = MeshLibrary.getMesh('props', prop.type);
            if (!mesh) {
                console.warn(`Prop type not found: ${prop.type}`);
                return;
            }

            // Position on terrain
            const x = prop.position.x;
            const z = prop.position.z;
            const y = this.terrainGenerator ? 
                this.terrainGenerator.getHeightAt(x, z) : 0;

            mesh.position.set(x, y, z);
            
            if (prop.rotation !== undefined) {
                mesh.rotation.y = prop.rotation;
            }
            
            if (prop.scale !== undefined) {
                mesh.scale.setScalar(prop.scale);
            }

            mesh.userData.propType = prop.type;
            mesh.userData.name = prop.name || prop.type;
            mesh.userData.text = prop.text; // For signposts
            
            this.scene.add(mesh);
            this.placedObjects.props.push({
                mesh,
                data: prop
            });
        });

        console.log(`Total props placed: ${this.placedObjects.props.length}`);
    }

    /**
     * Create terrain features from level data
     * @param {Object} levelData - Level configuration
     */
    createTerrainFeatures(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.terrainFeatures) {
            return;
        }

        data.terrainFeatures.forEach(feature => {
            let result = null; // may be a mesh or an object containing a .mesh property
            const x = feature.position.x;
            const z = feature.position.z;

            switch (feature.type) {
                case 'hill':
                    result = this.terrainFeatures.createHill(
                        x, z, 
                        feature.radius || 5,
                        feature.height || 3
                    );
                    break;
                    
                case 'plateau':
                    result = this.terrainFeatures.createPlateau(
                        x, z,
                        feature.width || 10,
                        feature.length || 10,
                        feature.height || 5
                    );
                    break;
                    
                case 'valley':
                    result = this.terrainFeatures.createValley(
                        x, z,
                        feature.radius || 5,
                        feature.depth || 2
                    );
                    break;
                    
                case 'canyon':
                    result = this.terrainFeatures.createCanyon(
                        x, z,
                        feature.length || 20,
                        feature.width || 5,
                        feature.depth || 4,
                        feature.rotation || 0
                    );
                    break;
                    
                case 'cave_entrance':
                    result = this.terrainFeatures.createCaveEntrance(
                        x, z,
                        feature.radius || 3,
                        feature.height || 2
                    );
                    break;
                    
                case 'bridge':
                    result = this.terrainFeatures.createBridge(
                        x, z,
                        feature.length || 10,
                        feature.width || 3,
                        feature.rotation || 0
                    );
                    break;
                    
                case 'ramp':
                    result = this.terrainFeatures.createRamp(
                        x, z,
                        feature.length || 5,
                        feature.height || 3,
                        feature.rotation || 0
                    );
                    break;
                    
                default:
                    console.warn(`Unknown terrain feature type: ${feature.type}`);
                    return;
            }

            // Normalize result to a mesh object and attach metadata safely.
            let meshObj = null;
            if (!result) return;

            // If the result is an object wrapper (returned by TerrainFeatures), use its .mesh
            if (result.mesh) {
                meshObj = result.mesh;
            } else if (result.isMesh || result.isGroup || (typeof THREE !== 'undefined' && result instanceof THREE.Object3D)) {
                meshObj = result;
            } else {
                console.warn('Unexpected terrain feature result for', feature.type, result);
                return;
            }

            if (meshObj) {
                meshObj.userData = meshObj.userData || {};
                meshObj.userData.featureType = feature.type;
                meshObj.userData.name = feature.name || feature.type;

                this.placedObjects.terrainFeatures.push({
                    mesh: meshObj,
                    data: feature
                });

                console.log(`Created terrain feature: ${feature.type} at (${x}, ${z})`);
            }
        });

        console.log(`Total terrain features created: ${this.placedObjects.terrainFeatures.length}`);
    }

    /**
     * Get monsters configuration from level data
     * This returns data for the MonsterFactory to create monsters
     * @param {Object} levelData - Level configuration
     * @returns {Array} Monster configurations
     */
    getMonsters(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.monsters) {
            return [];
        }
        
        return data.monsters;
    }

    /**
     * Get NPCs configuration from level data
     * @param {Object} levelData - Level configuration
     * @returns {Array} NPC configurations
     */
    getNPCs(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.npcs) {
            return [];
        }
        
        return data.npcs;
    }

    /**
     * Get chests configuration from level data
     * @param {Object} levelData - Level configuration
     * @returns {Array} Chest configurations
     */
    getChests(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.chests) {
            return [];
        }
        
        return data.chests;
    }

    /**
     * Get zones configuration from level data
     * @param {Object} levelData - Level configuration
     * @returns {Array} Zone configurations
     */
    getZones(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data || !data.zones) {
            return [];
        }
        
        return data.zones;
    }

    /**
     * Apply full level configuration
     * This is a convenience method that applies all level data
     * @param {Object} levelData - Level configuration (optional, uses loaded level if not provided)
     */
    applyLevel(levelData = null) {
        const data = levelData || this.loadedLevel;
        if (!data) {
            console.error('No level data to apply');
            return;
        }

        console.log(`Applying level: ${data.name}`);
        
        // Create terrain features first (they modify the scene geometry)
        this.createTerrainFeatures(data);
        
        // Then place buildings and props
        this.placeBuildings(data);
        this.placeProps(data);
        
        console.log(`Level '${data.name}' applied successfully`);
    }

    /**
     * Clear all placed objects from the scene
     */
    clearLevel() {
        // Remove all placed objects
        Object.values(this.placedObjects).forEach(category => {
            category.forEach(item => {
                if (item.mesh && item.mesh.parent) {
                    item.mesh.parent.remove(item.mesh);
                    // Dispose geometry and materials
                    if (item.mesh.geometry) {
                        item.mesh.geometry.dispose();
                    }
                    if (item.mesh.material) {
                        if (Array.isArray(item.mesh.material)) {
                            item.mesh.material.forEach(mat => mat.dispose());
                        } else {
                            item.mesh.material.dispose();
                        }
                    }
                }
            });
        });

        // Reset tracking
        this.placedObjects = {
            npcs: [],
            monsters: [],
            buildings: [],
            props: [],
            chests: [],
            terrainFeatures: []
        };

        console.log('Level cleared');
    }

    /**
     * Get all placed objects
     * @returns {Object} All placed objects organized by category
     */
    getPlacedObjects() {
        return this.placedObjects;
    }

    /**
     * Get level metadata
     * @returns {Object} Level name, version, description
     */
    getLevelInfo() {
        if (!this.loadedLevel) {
            return null;
        }

        return {
            name: this.loadedLevel.name,
            version: this.loadedLevel.version,
            description: this.loadedLevel.description
        };
    }
}
