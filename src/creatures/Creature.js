import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Genome } from '../dna/Genome.js';
import { NeuralNetwork } from '../neural/NeuralNetwork.js';

/**
 * Creature - A living entity composed of 3D primitives
 * Controlled by a neural network and defined by its genome
 */

export class Creature {
    constructor(genome, position = { x: 0, y: 5, z: 0 }) {
        this.genome = genome || new Genome();
        this.age = 0;
        this.fitness = 0;
        this.energy = 100;
        this.alive = true;
        this.foodCollected = 0;
        
        // Social/higher-level behaviors
        this.signalColor = new THREE.Color(1, 1, 1); // Communication via color
        this.socialBehavior = this.genome.genes.aggression; // 0=cooperative, 1=competitive
        this.nearestCreatureDirection = new THREE.Vector3(0, 0, 0);
        this.nearbyCreatureCount = 0;
        
        // Neural network for control (expanded inputs for social sensing)
        const inputSize = 13; // velocity(3), energy(1), food direction(3), time(1), height(1), creature direction(3), nearby count(1)
        const hiddenSize = this.genome.genes.neuralLayers[0] || 4;
        const outputSize = 4; // force x, y, z, signal intensity
        this.brain = new NeuralNetwork(inputSize, hiddenSize, outputSize);
        
        // Three.js visual components
        this.meshes = [];
        this.group = new THREE.Group();
        
        // Cannon.js physics bodies
        this.bodies = [];
        this.mainBody = null;
        this.constraints = []; // Physics constraints for joints
        
        // Build the creature from its genome
        this.buildFromGenome(position);
        
        // Track performance
        this.distanceTraveled = 0;
        this.lastPosition = new THREE.Vector3(position.x, position.y, position.z);
        
        // Vision/sensing
        this.nearestFoodDirection = new THREE.Vector3(0, 0, 0);
        
        // Communication marker (small sphere above creature)
        this.createSignalMarker();
    }

    buildFromGenome(startPosition) {
        const segments = this.genome.genes.segments;
        
        segments.forEach((segment, index) => {
            // Create mesh based on shape gene
            let geometry;
            const size = segment.size;
            
            switch (segment.shape) {
                case 0: // Box
                    geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                    break;
                case 1: // Sphere
                    geometry = new THREE.SphereGeometry(Math.max(size.x, size.y, size.z) / 2, 16, 16);
                    break;
                case 2: // Cylinder
                    geometry = new THREE.CylinderGeometry(size.x / 2, size.x / 2, size.y, 16);
                    break;
            }
            
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(segment.color.r, segment.color.g, segment.color.b),
                shininess: 30
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            // Position relative to parent or world
            if (segment.parentIndex === -1) {
                // Root segment
                mesh.position.set(startPosition.x, startPosition.y, startPosition.z);
            } else {
                // Child segment - offset from parent
                const parent = this.meshes[segment.parentIndex];
                mesh.position.copy(parent.position);
                mesh.position.x += segment.offset.x;
                mesh.position.y += segment.offset.y;
                mesh.position.z += segment.offset.z;
            }
            
            this.meshes.push(mesh);
            this.group.add(mesh);
            
            // Create physics body
            let shape;
            switch (segment.shape) {
                case 0: // Box
                    shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                    break;
                case 1: // Sphere
                    shape = new CANNON.Sphere(Math.max(size.x, size.y, size.z) / 2);
                    break;
                case 2: // Cylinder
                    shape = new CANNON.Cylinder(size.x / 2, size.x / 2, size.y, 16);
                    break;
            }
            
            const body = new CANNON.Body({
                mass: segment.density,
                shape: shape,
                position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
                linearDamping: 0.3,
                angularDamping: 0.3
            });
            
            this.bodies.push(body);
            
            // Set main body as the first segment
            if (index === 0) {
                this.mainBody = body;
            }
            
            // Create physics constraints to connect segments
            if (segment.parentIndex !== -1 && segment.parentIndex < this.bodies.length) {
                const parentBody = this.bodies[segment.parentIndex];
                const childBody = body;
                
                // Point-to-point constraint (joint)
                const constraint = new CANNON.PointToPointConstraint(
                    parentBody,
                    new CANNON.Vec3(segment.offset.x, segment.offset.y, segment.offset.z),
                    childBody,
                    new CANNON.Vec3(0, 0, 0),
                    1000 // maxForce
                );
                
                this.constraints.push(constraint);
            }
        });
    }

    createSignalMarker() {
        // Small sphere above creature for communication
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: this.signalColor,
            emissive: this.signalColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        this.signalMarker = new THREE.Mesh(geometry, material);
        this.group.add(this.signalMarker);
    }

    updateSignalMarker() {
        if (this.signalMarker && this.mainBody) {
            this.signalMarker.position.set(
                this.mainBody.position.x,
                this.mainBody.position.y + 1.5,
                this.mainBody.position.z
            );
        }
    }

    sense(foodManager = null, otherCreatures = []) {
        // Gather sensory inputs
        const velocity = this.mainBody.velocity;
        const position = this.mainBody.position;
        
        // Vision: detect nearest food
        let foodDirX = 0, foodDirY = 0, foodDirZ = 0;
        if (foodManager) {
            const nearestFood = foodManager.getNearestFoodPosition(position);
            if (nearestFood) {
                const dx = nearestFood.x - position.x;
                const dy = nearestFood.y - position.y;
                const dz = nearestFood.z - position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0) {
                    // Normalized direction to nearest food
                    foodDirX = dx / distance;
                    foodDirY = dy / distance;
                    foodDirZ = dz / distance;
                }
                
                this.nearestFoodDirection.set(dx, dy, dz);
            }
        }
        
        // Social sensing: detect nearest creature
        let creatureDirX = 0, creatureDirY = 0, creatureDirZ = 0;
        let nearbyCount = 0;
        let minDistance = Infinity;
        
        otherCreatures.forEach(other => {
            if (other !== this && other.alive) {
                const dx = other.mainBody.position.x - position.x;
                const dy = other.mainBody.position.y - position.y;
                const dz = other.mainBody.position.z - position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                // Count nearby creatures (within 10 units)
                if (distance < 10) {
                    nearbyCount++;
                }
                
                // Track nearest creature
                if (distance < minDistance && distance > 0) {
                    minDistance = distance;
                    creatureDirX = dx / distance;
                    creatureDirY = dy / distance;
                    creatureDirZ = dz / distance;
                }
            }
        });
        
        this.nearbyCreatureCount = nearbyCount;
        this.nearestCreatureDirection.set(creatureDirX, creatureDirY, creatureDirZ);
        
        return [
            velocity.x / 10,  // Normalized velocity
            velocity.y / 10,
            velocity.z / 10,
            foodDirX,  // Direction to nearest food
            foodDirY,
            foodDirZ,
            creatureDirX,  // Direction to nearest creature
            creatureDirY,
            creatureDirZ,
            nearbyCount / 10,  // Normalized nearby creature count
            Math.sin(this.age / 10),  // Time-based input
            position.y / 10,  // Height
            this.energy / 100  // Energy level
        ];
    }

    think(foodManager = null, otherCreatures = []) {
        // Use neural network to decide actions
        const inputs = this.sense(foodManager, otherCreatures);
        const outputs = this.brain.forward(inputs);
        return outputs;
    }

    act(actions) {
        // Apply forces based on neural network outputs
        const force = new CANNON.Vec3(
            actions[0] * 10 * this.genome.genes.speed,
            actions[1] * 10 * this.genome.genes.speed,
            actions[2] * 10 * this.genome.genes.speed
        );
        
        this.mainBody.applyForce(force);
        
        // Update signal color based on 4th output (communication)
        if (actions.length >= 4) {
            const signalIntensity = Math.abs(actions[3]);
            this.signalColor.setRGB(
                signalIntensity,
                this.socialBehavior,
                1 - this.socialBehavior
            );
            if (this.signalMarker) {
                this.signalMarker.material.color.copy(this.signalColor);
                this.signalMarker.material.emissive.copy(this.signalColor);
                this.signalMarker.material.opacity = signalIntensity * 0.7 + 0.3;
            }
        }
        
        // Energy cost for actions
        const actionMagnitude = Math.sqrt(actions[0] ** 2 + actions[1] ** 2 + actions[2] ** 2);
        this.energy -= actionMagnitude * 0.01;
    }

    update(deltaTime, foodManager = null, otherCreatures = []) {
        if (!this.alive) return;
        
        this.age += deltaTime;
        
        // Energy decay over time (metabolism)
        this.energy -= deltaTime * 0.5;
        
        if (this.energy <= 0) {
            this.alive = false;
            return;
        }
        
        // Think and act with social awareness
        const actions = this.think(foodManager, otherCreatures);
        this.act(actions);
        
        // Update visual meshes to match physics bodies
        this.meshes.forEach((mesh, index) => {
            const body = this.bodies[index];
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });
        
        // Update signal marker position
        this.updateSignalMarker();
        
        // Calculate fitness based on distance traveled
        const currentPosition = new THREE.Vector3().copy(this.mainBody.position);
        const distance = currentPosition.distanceTo(this.lastPosition);
        this.distanceTraveled += distance;
        this.lastPosition.copy(currentPosition);
        
        // Enhanced fitness with social bonus
        // Cooperative creatures get bonus for being near others, competitive ones penalized
        const socialFactor = this.socialBehavior < 0.5 ? 
            (this.nearbyCreatureCount * 5) :  // Cooperative bonus
            -(this.nearbyCreatureCount * 2);  // Competitive penalty
        
        // Fitness = food collected (primary) + survival time + movement + social factor
        this.fitness = this.foodCollected * 100 + this.age * 2 + this.distanceTraveled * 5 + socialFactor;
        
        // Die if fallen too far
        if (this.mainBody.position.y < -20) {
            this.alive = false;
        }
    }

    addToScene(scene) {
        scene.add(this.group);
    }

    removeFromScene(scene) {
        scene.remove(this.group);
    }

    addToWorld(world) {
        this.bodies.forEach(body => {
            world.addBody(body);
        });
        
        // Add constraints to world
        this.constraints.forEach(constraint => {
            world.addConstraint(constraint);
        });
    }

    removeFromWorld(world) {
        this.bodies.forEach(body => {
            world.removeBody(body);
        });
        
        // Remove constraints from world
        this.constraints.forEach(constraint => {
            world.removeConstraint(constraint);
        });
    }

    dispose() {
        this.meshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
    }
}
