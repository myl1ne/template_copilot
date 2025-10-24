/**
 * Genome - Digital DNA system for creature generation
 * Defines the genetic code that determines creature structure and behavior
 */

export class Genome {
    constructor(genes = null) {
        if (genes) {
            this.genes = genes;
        } else {
            this.genes = this.randomize();
        }
    }

    randomize() {
        const numSegments = Math.floor(Math.random() * 3) + 2; // 2-4 body segments
        const segments = [];

        for (let i = 0; i < numSegments; i++) {
            segments.push({
                // Shape type: 0=box, 1=sphere, 2=cylinder
                shape: Math.floor(Math.random() * 3),
                // Size parameters
                size: {
                    x: Math.random() * 0.5 + 0.3,
                    y: Math.random() * 0.5 + 0.3,
                    z: Math.random() * 0.5 + 0.3
                },
                // Connection point to parent (-1 for root)
                parentIndex: i === 0 ? -1 : Math.floor(Math.random() * i),
                // Connection offset
                offset: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                    z: (Math.random() - 0.5) * 0.5
                },
                // Color genes
                color: {
                    r: Math.random(),
                    g: Math.random(),
                    b: Math.random()
                },
                // Has sensors?
                hasSensor: Math.random() > 0.7,
                // Mass density
                density: Math.random() * 0.5 + 0.5
            });
        }

        return {
            segments,
            // Neural network architecture
            neuralLayers: [
                Math.floor(Math.random() * 3) + 2, // Hidden layer size
            ],
            // Mutation rate
            mutationRate: 0.1,
            // Behavioral traits
            aggression: Math.random(),
            speed: Math.random(),
            efficiency: Math.random()
        };
    }

    mutate() {
        const mutatedGenes = JSON.parse(JSON.stringify(this.genes));
        const mutationRate = this.genes.mutationRate;

        // Mutate segment properties
        mutatedGenes.segments.forEach(segment => {
            if (Math.random() < mutationRate) {
                segment.size.x *= (Math.random() * 0.4 + 0.8); // ±20%
                segment.size.y *= (Math.random() * 0.4 + 0.8);
                segment.size.z *= (Math.random() * 0.4 + 0.8);
            }
            if (Math.random() < mutationRate) {
                segment.color.r = Math.max(0, Math.min(1, segment.color.r + (Math.random() - 0.5) * 0.2));
                segment.color.g = Math.max(0, Math.min(1, segment.color.g + (Math.random() - 0.5) * 0.2));
                segment.color.b = Math.max(0, Math.min(1, segment.color.b + (Math.random() - 0.5) * 0.2));
            }
            if (Math.random() < mutationRate) {
                segment.density *= (Math.random() * 0.4 + 0.8);
            }
        });

        // Mutate behavioral traits
        if (Math.random() < mutationRate) {
            mutatedGenes.aggression = Math.max(0, Math.min(1, mutatedGenes.aggression + (Math.random() - 0.5) * 0.2));
        }
        if (Math.random() < mutationRate) {
            mutatedGenes.speed = Math.max(0, Math.min(1, mutatedGenes.speed + (Math.random() - 0.5) * 0.2));
        }

        // Small chance to add/remove segment
        if (Math.random() < mutationRate * 0.5 && mutatedGenes.segments.length < 6) {
            mutatedGenes.segments.push({
                shape: Math.floor(Math.random() * 3),
                size: { x: 0.5, y: 0.5, z: 0.5 },
                parentIndex: Math.floor(Math.random() * mutatedGenes.segments.length),
                offset: { x: 0, y: 0, z: 0 },
                color: { r: Math.random(), g: Math.random(), b: Math.random() },
                hasSensor: Math.random() > 0.7,
                density: 1.0
            });
        }

        return new Genome(mutatedGenes);
    }

    crossover(otherGenome) {
        const childGenes = JSON.parse(JSON.stringify(this.genes));
        const otherGenes = otherGenome.genes;

        // Mix segments from both parents
        const numSegments = Math.min(childGenes.segments.length, otherGenes.segments.length);
        for (let i = 0; i < numSegments; i++) {
            if (Math.random() > 0.5) {
                childGenes.segments[i] = JSON.parse(JSON.stringify(otherGenes.segments[i]));
            }
        }

        // Mix behavioral traits
        childGenes.aggression = (childGenes.aggression + otherGenes.aggression) / 2;
        childGenes.speed = (childGenes.speed + otherGenes.speed) / 2;
        childGenes.efficiency = (childGenes.efficiency + otherGenes.efficiency) / 2;

        return new Genome(childGenes);
    }

    clone() {
        return new Genome(JSON.parse(JSON.stringify(this.genes)));
    }
}
