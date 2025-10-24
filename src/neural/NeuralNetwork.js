/**
 * Simple Neural Network for creature control
 * Takes sensory inputs and outputs motor commands
 */

export class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        // Initialize weights randomly
        this.weightsInputHidden = this.randomMatrix(inputSize, hiddenSize);
        this.weightsHiddenOutput = this.randomMatrix(hiddenSize, outputSize);
        
        this.biasHidden = this.randomArray(hiddenSize);
        this.biasOutput = this.randomArray(outputSize);
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
}
