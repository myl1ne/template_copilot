/**
 * Simple Neural Network for creature control
 * Takes sensory inputs and outputs motor commands
 * Supports weight inheritance and crossover for evolution
 */

export class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize, parentWeights = null) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        if (parentWeights) {
            // Initialize from parent weights (for inheritance)
            // But be defensive: parent weights may have different dimensions (due to
            // genome/architecture changes). Copy overlapping values and pad/truncate
            // to match the requested architecture.
            const pWih = parentWeights.weightsInputHidden || [];
            const pWho = parentWeights.weightsHiddenOutput || [];
            const pBh = parentWeights.biasHidden || [];
            const pBo = parentWeights.biasOutput || [];

            // Build weightsInputHidden as inputSize x hiddenSize
            this.weightsInputHidden = [];
            for (let i = 0; i < this.inputSize; i++) {
                this.weightsInputHidden[i] = [];
                for (let j = 0; j < this.hiddenSize; j++) {
                    const v = (pWih[i] && typeof pWih[i][j] === 'number') ? pWih[i][j] : (pWih[0] && typeof pWih[0][j] === 'number' ? pWih[0][j] : 0);
                    this.weightsInputHidden[i][j] = v;
                }
            }

            // Build weightsHiddenOutput as hiddenSize x outputSize
            this.weightsHiddenOutput = [];
            for (let i = 0; i < this.hiddenSize; i++) {
                this.weightsHiddenOutput[i] = [];
                for (let j = 0; j < this.outputSize; j++) {
                    const v = (pWho[i] && typeof pWho[i][j] === 'number') ? pWho[i][j] : (pWho[0] && typeof pWho[0][j] === 'number' ? pWho[0][j] : 0);
                    this.weightsHiddenOutput[i][j] = v;
                }
            }

            // Biases
            this.biasHidden = new Array(this.hiddenSize);
            for (let i = 0; i < this.hiddenSize; i++) {
                this.biasHidden[i] = (typeof pBh[i] === 'number') ? pBh[i] : (typeof pBh[0] === 'number' ? pBh[0] : 0);
            }

            this.biasOutput = new Array(this.outputSize);
            for (let i = 0; i < this.outputSize; i++) {
                this.biasOutput[i] = (typeof pBo[i] === 'number') ? pBo[i] : (typeof pBo[0] === 'number' ? pBo[0] : 0);
            }
        } else {
            // Initialize weights randomly
            this.weightsInputHidden = this.randomMatrix(inputSize, hiddenSize);
            this.weightsHiddenOutput = this.randomMatrix(hiddenSize, outputSize);
            this.biasHidden = this.randomArray(hiddenSize);
            this.biasOutput = this.randomArray(outputSize);
        }
    }

    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Math.random() * 2 - 1; // Range: -1 to 1
            }
        }
        return matrix;
    }

    randomArray(size) {
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr[i] = Math.random() * 2 - 1;
        }
        return arr;
    }

    activate(x) {
        // Tanh activation function
        return Math.tanh(x);
    }

    forward(inputs) {
        // Defensive checks: ensure we have a proper inputs array of the expected length
        if (!Array.isArray(inputs)) {
            console.warn('NeuralNetwork.forward: expected inputs array, got', inputs);
            inputs = new Array(this.inputSize).fill(0);
        } else if (inputs.length < this.inputSize) {
            console.warn('NeuralNetwork.forward: inputs length', inputs.length, 'less than inputSize', this.inputSize);
            // Pad with zeros to avoid undefined access
            const padded = inputs.slice();
            while (padded.length < this.inputSize) padded.push(0);
            inputs = padded;
        }

        // Coerce all inputs to numbers (fallback to 0)
        inputs = inputs.map(v => (typeof v === 'number' && !Number.isNaN(v)) ? v : Number(v) || 0);

        // Hidden layer
        const hidden = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.biasHidden[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += inputs[j] * this.weightsInputHidden[j][i];
            }
            hidden[i] = this.activate(sum);
        }

        // Output layer
        const output = [];
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.biasOutput[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weightsHiddenOutput[j][i];
            }
            output[i] = this.activate(sum);
        }

        return output;
    }

    mutate(rate = 0.1) {
        // Mutate input-hidden weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                if (Math.random() < rate) {
                    this.weightsInputHidden[i][j] += (Math.random() * 2 - 1) * 0.5;
                    this.weightsInputHidden[i][j] = Math.max(-2, Math.min(2, this.weightsInputHidden[i][j]));
                }
            }
        }

        // Mutate hidden-output weights
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                if (Math.random() < rate) {
                    this.weightsHiddenOutput[i][j] += (Math.random() * 2 - 1) * 0.5;
                    this.weightsHiddenOutput[i][j] = Math.max(-2, Math.min(2, this.weightsHiddenOutput[i][j]));
                }
            }
        }

        // Mutate biases
        for (let i = 0; i < this.hiddenSize; i++) {
            if (Math.random() < rate) {
                this.biasHidden[i] += (Math.random() * 2 - 1) * 0.5;
                this.biasHidden[i] = Math.max(-2, Math.min(2, this.biasHidden[i]));
            }
        }

        for (let i = 0; i < this.outputSize; i++) {
            if (Math.random() < rate) {
                this.biasOutput[i] += (Math.random() * 2 - 1) * 0.5;
                this.biasOutput[i] = Math.max(-2, Math.min(2, this.biasOutput[i]));
            }
        }
    }

    clone() {
        const cloned = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        // Deep copy weights and biases
        cloned.weightsInputHidden = this.weightsInputHidden.map(row => [...row]);
        cloned.weightsHiddenOutput = this.weightsHiddenOutput.map(row => [...row]);
        cloned.biasHidden = [...this.biasHidden];
        cloned.biasOutput = [...this.biasOutput];
        
        return cloned;
    }
    
    // Get weights for inheritance
    getWeights() {
        return {
            weightsInputHidden: this.weightsInputHidden.map(row => [...row]),
            weightsHiddenOutput: this.weightsHiddenOutput.map(row => [...row]),
            biasHidden: [...this.biasHidden],
            biasOutput: [...this.biasOutput]
        };
    }
    
    // Crossover weights with another network (for sexual reproduction)
    static crossover(parent1, parent2) {
        // Ensure same architecture
        if (parent1.inputSize !== parent2.inputSize ||
            parent1.hiddenSize !== parent2.hiddenSize ||
            parent1.outputSize !== parent2.outputSize) {
            // If different architectures, just clone parent1
            return parent1.clone();
        }
        
        const child = new NeuralNetwork(parent1.inputSize, parent1.hiddenSize, parent1.outputSize);
        
        // Mix weights from both parents
        for (let i = 0; i < parent1.inputSize; i++) {
            for (let j = 0; j < parent1.hiddenSize; j++) {
                child.weightsInputHidden[i][j] = Math.random() < 0.5 ? 
                    parent1.weightsInputHidden[i][j] : parent2.weightsInputHidden[i][j];
            }
        }
        
        for (let i = 0; i < parent1.hiddenSize; i++) {
            for (let j = 0; j < parent1.outputSize; j++) {
                child.weightsHiddenOutput[i][j] = Math.random() < 0.5 ?
                    parent1.weightsHiddenOutput[i][j] : parent2.weightsHiddenOutput[i][j];
            }
        }
        
        // Mix biases
        for (let i = 0; i < parent1.hiddenSize; i++) {
            child.biasHidden[i] = Math.random() < 0.5 ? 
                parent1.biasHidden[i] : parent2.biasHidden[i];
        }
        
        for (let i = 0; i < parent1.outputSize; i++) {
            child.biasOutput[i] = Math.random() < 0.5 ?
                parent1.biasOutput[i] : parent2.biasOutput[i];
        }
        
        return child;
    }
}
