/**
 * PlantSpecies - Defines different plant species with unique characteristics
 */
export class PlantSpecies {
    static SPECIES = {
        TREE: {
            name: 'tree',
            maxHeight: 8,
            growthRate: 0.7,
            waterNeed: 0.8,
            nutrientNeed: 0.6,
            rootDepth: 3,
            foliageSize: 2.5,
            seedCount: 2,
            seedSpread: 5,
            color: { r: 0.15, g: 0.5, b: 0.15 },
            shape: 'cone'
        },
        BUSH: {
            name: 'bush',
            maxHeight: 3,
            growthRate: 1.2,
            waterNeed: 0.5,
            nutrientNeed: 0.4,
            rootDepth: 2,
            foliageSize: 2,
            seedCount: 5,
            seedSpread: 3,
            color: { r: 0.2, g: 0.7, b: 0.2 },
            shape: 'sphere'
        },
        GRASS: {
            name: 'grass',
            maxHeight: 1,
            growthRate: 1.8,
            waterNeed: 0.3,
            nutrientNeed: 0.2,
            rootDepth: 1,
            foliageSize: 0.5,
            seedCount: 8,
            seedSpread: 2,
            color: { r: 0.3, g: 0.8, b: 0.3 },
            shape: 'cylinder'
        },
        FLOWER: {
            name: 'flower',
            maxHeight: 2,
            growthRate: 1.5,
            waterNeed: 0.6,
            nutrientNeed: 0.5,
            rootDepth: 1,
            foliageSize: 1,
            seedCount: 4,
            seedSpread: 4,
            color: { r: 0.8, g: 0.3, b: 0.5 },
            shape: 'sphere'
        },
        VINE: {
            name: 'vine',
            maxHeight: 5,
            growthRate: 1.0,
            waterNeed: 0.4,
            nutrientNeed: 0.3,
            rootDepth: 2,
            foliageSize: 1.5,
            seedCount: 3,
            seedSpread: 6,
            color: { r: 0.2, g: 0.6, b: 0.25 },
            shape: 'cylinder'
        }
    };

    static getRandomSpecies() {
        const species = Object.values(PlantSpecies.SPECIES);
        return species[Math.floor(Math.random() * species.length)];
    }

    static getSpeciesByName(name) {
        return Object.values(PlantSpecies.SPECIES).find(s => s.name === name) || PlantSpecies.SPECIES.BUSH;
    }
}
