/**
 * AnimalGenetics - Genetics system for animals
 */
export class AnimalGenetics {
    constructor(parent1Genes = null, parent2Genes = null) {
        // Initialize genes
        if (parent1Genes && parent2Genes) {
            // Sexual reproduction - blend genes from both parents
            this.genes = this.crossover(parent1Genes, parent2Genes);
        } else if (parent1Genes) {
            // Asexual reproduction - clone with mutations
            this.genes = { ...parent1Genes };
            this.mutate();
        } else {
            // First generation - random genes
            this.genes = this.generateRandomGenes();
        }
    }

    generateRandomGenes() {
        return {
            speedGene: 0.3 + Math.random() * 0.7,      // Movement speed (0.3-1.0)
            sizeGene: 0.6 + Math.random() * 0.8,        // Animal size (0.6-1.4)
            hungerResistanceGene: 0.5 + Math.random() * 1.0,  // How long without food (0.5-1.5)
            efficiencyGene: 0.7 + Math.random() * 0.6,  // Food energy efficiency (0.7-1.3)
            vigorGene: 0.8 + Math.random() * 0.4,       // Overall health/lifespan (0.8-1.2)
            fertilityGene: 0.7 + Math.random() * 0.6,   // Reproduction rate (0.7-1.3)
        };
    }

    crossover(parent1, parent2) {
        const child = {};
        for (const gene in parent1) {
            // Blend genes with 70/30 ratio, randomly swapped
            if (Math.random() < 0.5) {
                child[gene] = parent1[gene] * 0.7 + parent2[gene] * 0.3;
            } else {
                child[gene] = parent2[gene] * 0.7 + parent1[gene] * 0.3;
            }
        }
        return child;
    }

    mutate() {
        // 10% chance to mutate each gene
        for (const gene in this.genes) {
            if (Math.random() < 0.1) {
                // Mutate by ±10%
                const mutation = 0.9 + Math.random() * 0.2;
                this.genes[gene] *= mutation;
                // Clamp to reasonable values
                this.genes[gene] = Math.max(0.1, Math.min(2.0, this.genes[gene]));
            }
        }
    }

    getGene(geneName) {
        return this.genes[geneName] || 1.0;
    }

    getFitness() {
        // Weighted fitness score
        return (
            this.genes.speedGene * 0.2 +
            this.genes.efficiencyGene * 0.3 +
            this.genes.hungerResistanceGene * 0.2 +
            this.genes.vigorGene * 0.3
        );
    }
}
