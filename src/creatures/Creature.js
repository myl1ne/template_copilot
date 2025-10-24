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
        
        // Neural network for control (inputs: sensors, outputs: motor commands)
        const inputSize = 6; // velocity, orientation, sensors
        const hiddenSize = this.genome.genes.neuralLayers[0] || 4;
        const outputSize = 3; // force x, y, z
        this.brain = new NeuralNetwork(inputSize, hiddenSize, outputSize);
        
        // Three.js visual components
        this.meshes = [];
        this.group = new THREE.Group();
        
        // Cannon.js physics bodies
        this.bodies = [];
        this.mainBody = null;
        
        // Build the creature from its genome
        this.buildFromGenome(position);
        
        // Track performance
        this.distanceTraveled = 0;
        this.lastPosition = new THREE.Vector3(position.x, position.y, position.z);
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
        });
    }

    sense() {
        // Gather sensory inputs
        const velocity = this.mainBody.velocity;
        const position = this.mainBody.position;
        
        return [
            velocity.x / 10,  // Normalized velocity
            velocity.y / 10,
            velocity.z / 10,
            Math.sin(this.age / 10),  // Time-based input
            position.y / 10,  // Height
            this.energy / 100  // Energy level
        ];
    }

    think() {
        // Use neural network to decide actions
        const inputs = this.sense();
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
        
        // Energy cost for actions
        const actionMagnitude = Math.sqrt(actions[0] ** 2 + actions[1] ** 2 + actions[2] ** 2);
        this.energy -= actionMagnitude * 0.01;
    }

    update(deltaTime) {
        if (!this.alive) return;
        
        this.age += deltaTime;
        
        // Energy decay over time
        this.energy -= deltaTime * 0.1;
        
        if (this.energy <= 0) {
            this.alive = false;
            return;
        }
        
        // Think and act
        const actions = this.think();
        this.act(actions);
        
        // Update visual meshes to match physics bodies
        this.meshes.forEach((mesh, index) => {
            const body = this.bodies[index];
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });
        
        // Calculate fitness based on distance traveled
        const currentPosition = new THREE.Vector3().copy(this.mainBody.position);
        const distance = currentPosition.distanceTo(this.lastPosition);
        this.distanceTraveled += distance;
        this.lastPosition.copy(currentPosition);
        
        // Fitness = distance traveled + time alive - energy used
        this.fitness = this.distanceTraveled * 10 + this.age * 0.5;
        
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
    }

    removeFromWorld(world) {
        this.bodies.forEach(body => {
            world.removeBody(body);
        });
    }

    dispose() {
        this.meshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
    }
}
