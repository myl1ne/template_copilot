import { CreatureLibrary } from './meshLibrary/CreatureLibrary.js';
import { BuildingLibrary } from './meshLibrary/BuildingLibrary.js';
import { PropsLibrary } from './meshLibrary/PropsLibrary.js';

/**
 * MeshLibrary - Unified interface to all mesh libraries
 * Provides backwards compatibility and centralized access to all content
 * 
 * REFACTORED: Now uses modular sub-libraries for better organization:
 * - CreatureLibrary: Creatures and monsters
 * - BuildingLibrary: Buildings and structures
 * - PropsLibrary: Props, decorations, and items
 */
export class MeshLibrary {
    /**
     * Get mesh for a monster/creature type (backwards compatibility)
     */
    static getMonsterMesh(type) {
        return CreatureLibrary.getMesh(type);
    }

    /**
     * Get mesh for any category
     * @param {string} category - 'creature', 'building', or 'prop'
     * @param {string} type - Specific type within that category
     */
    static getMesh(category, type) {
        const cat = category.toLowerCase();
        switch(cat) {
            case 'creature':
            case 'creatures':
            case 'monster':
                return CreatureLibrary.getMesh(type);
            case 'building':
            case 'buildings':
            case 'structure':
                return BuildingLibrary.getMesh(type);
            case 'prop':
            case 'props':
            case 'item':
            case 'decoration':
                return PropsLibrary.getMesh(type);
            default:
                console.warn(`Unknown category: ${category}`);
                return CreatureLibrary.getMesh(type);
        }
    }

    /**
     * Get all available types across all categories
     */
    static getAllContent() {
        return {
            creatures: CreatureLibrary.getAllTypes(),
            buildings: BuildingLibrary.getAllTypes(),
            props: PropsLibrary.getAllTypes()
        };
    }

    /**
     * Get metadata about available content
     */
    static getContentInfo() {
        const creatures = CreatureLibrary.getAllTypes();
        const buildings = BuildingLibrary.getAllTypes();
        const props = PropsLibrary.getAllTypes();
        
        return {
            totalCount: creatures.length + buildings.length + props.length,
            categories: {
                creatures: {
                    count: creatures.length,
                    types: creatures
                },
                buildings: {
                    count: buildings.length,
                    types: buildings
                },
                props: {
                    count: props.length,
                    types: props
                }
            }
        };
    }

    // Backwards compatibility methods
    static createGoblinMesh() { return CreatureLibrary.createGoblinMesh(); }
    static createOrcMesh() { return CreatureLibrary.createOrcMesh(); }
    static createSpiderMesh() { return CreatureLibrary.createSpiderMesh(); }
    static createWolfMesh() { return CreatureLibrary.createWolfMesh(); }
    static createBearMesh() { return CreatureLibrary.createBearMesh(); }
    static createDragonMesh() { return CreatureLibrary.createDragonMesh(); }
}
