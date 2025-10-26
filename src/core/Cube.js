/**
 * Cube - Represents a single cube in the vivarium grid
 * Each cube can contain different materials: soil, water, air
 */
export class Cube {
    static TYPES = {
        AIR: 'air',
        SOIL: 'soil',
        WATER: 'water'
    };

    constructor(x, y, z, type = Cube.TYPES.AIR) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        
        // Material properties
        this.nutrients = type === Cube.TYPES.SOIL ? 100 : 0;
        this.moisture = type === Cube.TYPES.WATER ? 100 : (type === Cube.TYPES.SOIL ? 50 : 0);
        this.organicMatter = type === Cube.TYPES.SOIL ? 20 : 0;
        
        // Life occupancy
        this.occupant = null; // Can be a plant or other life form
    }

    isSoil() {
        return this.type === Cube.TYPES.SOIL;
    }

    isWater() {
        return this.type === Cube.TYPES.WATER;
    }

    isAir() {
        return this.type === Cube.TYPES.AIR;
    }

    canSupportLife() {
        return this.isSoil() || this.isWater();
    }

    isEmpty() {
        return this.occupant === null;
    }

    setOccupant(occupant) {
        this.occupant = occupant;
    }

    removeOccupant() {
        this.occupant = null;
    }

    /**
     * Extract nutrients from the cube (used by plants)
     */
    extractNutrients(amount) {
        const extracted = Math.min(this.nutrients, amount);
        this.nutrients -= extracted;
        return extracted;
    }

    /**
     * Extract water from the cube (used by plants)
     */
    extractWater(amount) {
        const extracted = Math.min(this.moisture, amount);
        this.moisture -= extracted;
        return extracted;
    }

    /**
     * Add organic matter (from dead plants/decomposition)
     */
    addOrganicMatter(amount) {
        this.organicMatter += amount;
        // Organic matter slowly converts to nutrients (increased rate for sustainability)
        const converted = Math.min(this.organicMatter, 0.5);
        this.organicMatter -= converted;
        this.nutrients += converted;
    }

    /**
     * Natural processes (water distribution, nutrient replenishment)
     */
    update(neighbors) {
        // Water naturally spreads to neighboring soil
        if (this.isSoil() && this.moisture < 100) {
            for (const neighbor of neighbors) {
                if (neighbor.isWater() && Math.random() < 0.1) {
                    this.moisture = Math.min(100, this.moisture + 10);
                }
            }
        }

        // Nutrients slowly regenerate from organic matter (handled in addOrganicMatter)
        // Also add slow passive nutrient regeneration
        if (this.isSoil() && this.nutrients < 100) {
            this.nutrients = Math.min(100, this.nutrients + 0.05);
        }
    }

    getColor() {
        if (this.isAir()) {
            return null; // Don't render air
        } else if (this.isWater()) {
            return 0x1E88E5; // Blue
        } else if (this.isSoil()) {
            // Soil color varies by nutrient level
            const intensity = Math.floor(50 + (this.nutrients / 100) * 100);
            return (intensity << 16) | (intensity / 2 << 8) | 0;
        }
        return 0x888888; // Default gray
    }
}
