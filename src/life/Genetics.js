/**
 * Genetics - Represents genetic information for plants with evo-devo principles
 * Genes influence developmental traits like growth rate, resource efficiency, etc.
 */
export class Genetics {
    constructor(parent1Genes = null, parent2Genes = null) {
        if (parent1Genes && parent2Genes) {
            // Sexual reproduction - inherit from both parents with crossover
            this.genes = this.crossover(parent1Genes, parent2Genes);
        } else if (parent1Genes) {
            // Parthenogenesis - clone parent with small mutations
            this.genes = this.clone(parent1Genes);
        } else {
            // Initial generation - random genes
            this.genes = this.generateRandomGenes();
        }
        
        // Apply random mutations
        this.mutate();
    }

    /**
     * Generate random initial genes
     */
    generateRandomGenes() {
        return {
            // Growth and development genes
            maxHeightGene: 0.5 + Math.random() * 0.5,        // 0.5-1.0: affects maximum plant height
            growthRateGene: 0.5 + Math.random() * 0.5,       // 0.5-1.0: affects how fast plant grows
            maturityTimeGene: 0.5 + Math.random() * 0.5,     // 0.5-1.0: affects time to maturity
            
            // Resource efficiency genes
            waterEfficiencyGene: 0.5 + Math.random() * 0.5,  // 0.5-1.0: better water usage
            nutrientEfficiencyGene: 0.5 + Math.random() * 0.5, // 0.5-1.0: better nutrient usage
            photosynthesisGene: 0.5 + Math.random() * 0.5,   // 0.5-1.0: photosynthesis efficiency
            
            // Reproduction genes
            fertilityGene: 0.5 + Math.random() * 0.5,        // 0.5-1.0: affects seed count
            vigorGene: 0.5 + Math.random() * 0.5,            // 0.5-1.0: overall fitness/longevity
            
            // Color genes (RGB components for variation)
            colorRGene: 0.2 + Math.random() * 0.3,           // 0.2-0.5: red component
            colorGGene: 0.6 + Math.random() * 0.4,           // 0.6-1.0: green component (dominant)
            colorBGene: 0.1 + Math.random() * 0.2            // 0.1-0.3: blue component
        };
    }

    /**
     * Clone genes from parent (asexual reproduction)
     */
    clone(parentGenes) {
        const cloned = {};
        for (const [key, value] of Object.entries(parentGenes)) {
            cloned[key] = value;
        }
        return cloned;
    }

    /**
     * Crossover genes from two parents (sexual reproduction)
     */
    crossover(parent1Genes, parent2Genes) {
        const offspring = {};
        
        for (const key of Object.keys(parent1Genes)) {
            // Random inheritance from either parent with some blending
            if (Math.random() < 0.5) {
                // Inherit from parent 1 with slight influence from parent 2
                offspring[key] = parent1Genes[key] * 0.7 + parent2Genes[key] * 0.3;
            } else {
                // Inherit from parent 2 with slight influence from parent 1
                offspring[key] = parent2Genes[key] * 0.7 + parent1Genes[key] * 0.3;
            }
        }
        
        return offspring;
    }

    /**
     * Apply random mutations to genes
     */
    mutate() {
        const mutationRate = 0.1; // 10% chance per gene
        const mutationStrength = 0.1; // ±10% change
        
        for (const [key, value] of Object.entries(this.genes)) {
            if (Math.random() < mutationRate) {
                // Apply mutation
                const change = (Math.random() - 0.5) * 2 * mutationStrength;
                this.genes[key] = Math.max(0.1, Math.min(1.0, value + change));
            }
        }
    }

    /**
     * Get a gene value
     */
    getGene(geneName) {
        return this.genes[geneName] || 0.5;
    }

    /**
     * Calculate genetic fitness score (for tracking evolution)
     */
    getFitness() {
        // Weighted average of important genes
        return (
            this.genes.vigorGene * 0.3 +
            this.genes.photosynthesisGene * 0.3 +
            this.genes.waterEfficiencyGene * 0.2 +
            this.genes.nutrientEfficiencyGene * 0.2
        );
    }

    /**
     * Get mature color based on color genes
     */
    getMatureColor() {
        const r = Math.floor(this.genes.colorRGene * 255);
        const g = Math.floor(this.genes.colorGGene * 255);
        const b = Math.floor(this.genes.colorBGene * 255);
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Calculate genetic distance from another genome (for diversity tracking)
     */
    distanceFrom(otherGenetics) {
        let totalDistance = 0;
        let count = 0;
        
        for (const key of Object.keys(this.genes)) {
            const diff = this.genes[key] - otherGenetics.genes[key];
            totalDistance += diff * diff;
            count++;
        }
        
        return Math.sqrt(totalDistance / count);
    }
}
