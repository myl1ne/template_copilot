import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Genome } from '../dna/Genome.js';
import { NeuralNetwork } from '../neural/NeuralNetwork.js';

/**
 * LimbedCreature - Creature with articulated limbs and joints
 * More realistic body structure with legs, arms, and proper joints
 */

export class LimbedCreature {
    constructor(genome, position = { x: 0, y: 5, z: 0 }) {
        this.genome = genome || new Genome();
        this.age = 0;
        this.fitness = 0;
        this.energy = 100;
        this.hydration = 100;
        this.alive = true;
        this.foodCollected = 0;
        this.kills = 0;
        this.matingCooldown = 0;
        
        // Behavior states
        this.isFighting = false;
        this.fightingTarget = null;
        this.isMating = false;
        this.matingTarget = null;
        this.behaviorTimer = 0;
        
        // Social/higher-level behaviors
        this.signalColor = new THREE.Color(1, 1, 1);
        this.socialBehavior = this.genome.genes.aggression;
        this.nearestCreatureDirection = new THREE.Vector3(0, 0, 0);
        this.nearbyCreatureCount = 0;
        this.canMate = false;
        
        // Enhanced neural network with more inputs
        const inputSize = 16;
        const hiddenSize = this.genome.genes.neuralLayers[0] || 4;
        const outputSize = 5; // force x, y, z, signal intensity, action (attack/mate)
        
        // **INHERIT NEURAL WEIGHTS if available**
        if (this.genome.genes.neuralWeights) {
            this.brain = new NeuralNetwork(inputSize, hiddenSize, outputSize, this.genome.genes.neuralWeights);
        } else {
            this.brain = new NeuralNetwork(inputSize, hiddenSize, outputSize);
        }
        
        // Three.js visual components
        this.meshes = [];
        this.group = new THREE.Group();
        
        // Cannon.js physics bodies
        this.bodies = [];
        this.mainBody = null;
        this.constraints = [];
        this.limbs = []; // Store limb references
        
        // Build the creature with limbs
        this.buildCreatureWithLimbs(position);
        
        // Track performance
        this.distanceTraveled = 0;
        this.lastPosition = new THREE.Vector3(position.x, position.y, position.z);
        
        // Vision/sensing
        this.nearestFoodDirection = new THREE.Vector3(0, 0, 0);
        this.nearestWaterDirection = new THREE.Vector3(0, 0, 0);
        
        // Communication marker
        this.createSignalMarker();
        
        // Explicit behavior visuals
        this.behaviorIndicator = null;
    }

    buildCreatureWithLimbs(startPosition) {
        // Main body (torso)
        const bodySize = this.genome.genes.segments[0].size;
        const bodyColor = new THREE.Color(
            this.genome.genes.segments[0].color.r,
            this.genome.genes.segments[0].color.g,
            this.genome.genes.segments[0].color.b
        );
        
        // Apply predator/herbivore color tinting
        const aggression = this.genome.genes.aggression;
        if (aggression > 0.6) {
            bodyColor.r = Math.min(1, bodyColor.r + (aggression - 0.6) * 0.8);
            bodyColor.g *= 0.7;
            bodyColor.b *= 0.7;
        } else if (aggression < 0.3) {
            bodyColor.g = Math.min(1, bodyColor.g + (0.3 - aggression) * 0.8);
            bodyColor.r *= 0.7;
            bodyColor.b *= 0.7;
        }
        
        // Create torso
        const torsoGeometry = new THREE.BoxGeometry(bodySize.x, bodySize.y * 0.8, bodySize.z * 0.6);
        const torsoMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torsoMesh.position.set(startPosition.x, startPosition.y + 1, startPosition.z);
        
        this.meshes.push(torsoMesh);
        this.group.add(torsoMesh);
        
        // Torso physics
        const torsoShape = new CANNON.Box(new CANNON.Vec3(bodySize.x / 2, bodySize.y * 0.4, bodySize.z * 0.3));
        const torsoBody = new CANNON.Body({
            mass: this.genome.genes.segments[0].density * 2,
            shape: torsoShape,
            position: new CANNON.Vec3(startPosition.x, startPosition.y + 1, startPosition.z),
            linearDamping: 0.3,
            angularDamping: 0.3
        });
        
        this.bodies.push(torsoBody);
        this.mainBody = torsoBody;
        
        // **USE GENOME LIMB CONFIGURATION** for proper evolution
        const numLimbs = this.genome.genes.limbCount || Math.min(this.genome.genes.segments.length - 1, 4);
        
        // Create limbs (legs/arms)
        for (let i = 0; i < numLimbs; i++) {
            const limbSegment = this.genome.genes.segments[i + 1] || this.genome.genes.segments[0];
            this.createLimb(i, numLimbs, limbSegment, torsoMesh, torsoBody, bodyColor);
        }
        
        // Create head
        this.createHead(torsoMesh, torsoBody, bodyColor);
    }

    createLimb(index, totalLimbs, limbSegment, torsoMesh, torsoBody, baseColor) {
        // Determine limb position around torso
        const angle = (index / totalLimbs) * Math.PI * 2;
        const radius = limbSegment.size.x * 0.5;
        
        // Limb is divided into 2 segments (upper and lower)
        const limbLengthMultiplier = this.genome.genes.limbLength || 1.0;
        const upperLimbLength = limbSegment.size.y * 0.5 * limbLengthMultiplier;
        const lowerLimbLength = limbSegment.size.y * 0.5 * limbLengthMultiplier;
        const limbWidth = limbSegment.size.x * 0.3;
        
        // Upper limb segment
        const upperGeometry = new THREE.CylinderGeometry(limbWidth, limbWidth, upperLimbLength, 8);
        const upperMaterial = new THREE.MeshPhongMaterial({ color: baseColor });
        const upperMesh = new THREE.Mesh(upperGeometry, upperMaterial);
        
        const attachX = Math.cos(angle) * radius;
        const attachZ = Math.sin(angle) * radius;
        
        upperMesh.position.set(
            torsoMesh.position.x + attachX,
            torsoMesh.position.y - upperLimbLength / 2,
            torsoMesh.position.z + attachZ
        );
        
        this.meshes.push(upperMesh);
        this.group.add(upperMesh);
        
        // Upper limb physics
        const upperShape = new CANNON.Cylinder(limbWidth, limbWidth, upperLimbLength, 8);
        const upperBody = new CANNON.Body({
            mass: limbSegment.density * 0.3,
            shape: upperShape,
            position: new CANNON.Vec3(upperMesh.position.x, upperMesh.position.y, upperMesh.position.z),
            linearDamping: 0.4,
            angularDamping: 0.4
        });
        
        this.bodies.push(upperBody);
        
        // Hinge joint connecting upper limb to torso
        const hingeConstraint = new CANNON.HingeConstraint(
            torsoBody,
            upperBody,
            {
                pivotA: new CANNON.Vec3(attachX, -limbSegment.size.y * 0.2, attachZ),
                axisA: new CANNON.Vec3(0, 0, 1),
                pivotB: new CANNON.Vec3(0, upperLimbLength / 2, 0),
                axisB: new CANNON.Vec3(0, 0, 1),
                maxForce: 1000 // Limit force to prevent explosions
            }
        );
        
        // Enable motor for neural control
        hingeConstraint.enableMotor();
        hingeConstraint.setMotorSpeed(0);
        hingeConstraint.setMotorMaxForce(50);
        
        this.constraints.push(hingeConstraint);
        
        // Lower limb segment
        const lowerGeometry = new THREE.CylinderGeometry(limbWidth * 0.8, limbWidth * 0.6, lowerLimbLength, 8);
        const lowerMaterial = new THREE.MeshPhongMaterial({ color: baseColor.clone().multiplyScalar(0.9) });
        const lowerMesh = new THREE.Mesh(lowerGeometry, lowerMaterial);
        
        lowerMesh.position.set(
            upperMesh.position.x,
            upperMesh.position.y - upperLimbLength / 2 - lowerLimbLength / 2,
            upperMesh.position.z
        );
        
        this.meshes.push(lowerMesh);
        this.group.add(lowerMesh);
        
        // Lower limb physics
        const lowerShape = new CANNON.Cylinder(limbWidth * 0.8, limbWidth * 0.6, lowerLimbLength, 8);
        const lowerBody = new CANNON.Body({
            mass: limbSegment.density * 0.2,
            shape: lowerShape,
            position: new CANNON.Vec3(lowerMesh.position.x, lowerMesh.position.y, lowerMesh.position.z),
            linearDamping: 0.5,
            angularDamping: 0.5
        });
        
        this.bodies.push(lowerBody);
        
        // Hinge joint connecting lower to upper limb
        const lowerHinge = new CANNON.HingeConstraint(
            upperBody,
            lowerBody,
            {
                pivotA: new CANNON.Vec3(0, -upperLimbLength / 2, 0),
                axisA: new CANNON.Vec3(1, 0, 0),
                pivotB: new CANNON.Vec3(0, lowerLimbLength / 2, 0),
                axisB: new CANNON.Vec3(1, 0, 0),
                maxForce: 1000 // Limit force to prevent explosions
            }
        );
        
        // Enable motor for neural control
        lowerHinge.enableMotor();
        lowerHinge.setMotorSpeed(0);
        lowerHinge.setMotorMaxForce(30);
        
        this.constraints.push(lowerHinge);
        
        // Store limb info
        this.limbs.push({
            index,
            upper: { mesh: upperMesh, body: upperBody },
            lower: { mesh: lowerMesh, body: lowerBody },
            hinges: [hingeConstraint, lowerHinge]
        });
    }

    createHead(torsoMesh, torsoBody, baseColor) {
        // Simple spherical head
        const headRadius = this.genome.genes.segments[0].size.x * 0.4;
        const headGeometry = new THREE.SphereGeometry(headRadius, 12, 12);
        const headMaterial = new THREE.MeshPhongMaterial({ color: baseColor });
        const headMesh = new THREE.Mesh(headGeometry, headMaterial);
        
        headMesh.position.set(
            torsoMesh.position.x,
            torsoMesh.position.y + this.genome.genes.segments[0].size.y * 0.5 + headRadius,
            torsoMesh.position.z
        );
        
        this.meshes.push(headMesh);
        this.group.add(headMesh);
        
        // Head physics
        const headShape = new CANNON.Sphere(headRadius);
        const headBody = new CANNON.Body({
            mass: this.genome.genes.segments[0].density * 0.5,
            shape: headShape,
            position: new CANNON.Vec3(headMesh.position.x, headMesh.position.y, headMesh.position.z),
            linearDamping: 0.3,
            angularDamping: 0.3
        });
        
        this.bodies.push(headBody);
        
        // Neck constraint (with limited force to prevent physics explosions)
        const neckConstraint = new CANNON.PointToPointConstraint(
            torsoBody,
            new CANNON.Vec3(0, this.genome.genes.segments[0].size.y * 0.4, 0),
            headBody,
            new CANNON.Vec3(0, -headRadius, 0),
            500 // Reduced force to prevent instability
        );
        
        this.constraints.push(neckConstraint);
    }

    createSignalMarker() {
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

    createBehaviorIndicator(type) {
        // Remove old indicator
        if (this.behaviorIndicator) {
            this.group.remove(this.behaviorIndicator);
        }
        
        // Create visual indicator for behaviors
        let geometry, material;
        
        if (type === 'fighting') {
            // Red ring for fighting
            geometry = new THREE.TorusGeometry(1.2, 0.1, 8, 16);
            material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.6
            });
        } else if (type === 'mating') {
            // Pink ring for mating
            geometry = new THREE.TorusGeometry(1.2, 0.15, 8, 16);
            material = new THREE.MeshPhongMaterial({
                color: 0xff69b4,
                emissive: 0xff69b4,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.7
            });
        } else if (type === 'eating') {
            // Green ring for eating
            geometry = new THREE.TorusGeometry(1.2, 0.12, 8, 16);
            material = new THREE.MeshPhongMaterial({
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 0.9,
                transparent: true,
                opacity: 0.7
            });
        } else if (type === 'drinking') {
            // Cyan ring for drinking
            geometry = new THREE.TorusGeometry(1.2, 0.12, 8, 16);
            material = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.9,
                transparent: true,
                opacity: 0.7
            });
        } else {
            return; // Unknown type
        }
        
        this.behaviorIndicator = new THREE.Mesh(geometry, material);
        this.behaviorIndicator.rotation.x = Math.PI / 2;
        this.group.add(this.behaviorIndicator);
    }

    updateSignalMarker() {
        if (this.signalMarker && this.mainBody) {
            this.signalMarker.position.set(
                this.mainBody.position.x,
                this.mainBody.position.y + 2,
                this.mainBody.position.z
            );
        }
    }

    updateBehaviorIndicator() {
        if (this.behaviorIndicator && this.mainBody) {
            this.behaviorIndicator.position.set(
                this.mainBody.position.x,
                this.mainBody.position.y + 0.2,
                this.mainBody.position.z
            );
            // Rotate for animation
            this.behaviorIndicator.rotation.z += 0.05;
        }
    }

    sense(foodManager = null, otherCreatures = [], terrain = null) {
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
                    foodDirX = dx / distance;
                    foodDirY = dy / distance;
                    foodDirZ = dz / distance;
                }
                
                this.nearestFoodDirection.set(dx, dy, dz);
            }
        }
        
        // Vision: detect nearest water
        let waterDirX = 0, waterDirY = 0, waterDirZ = 0;
        if (terrain) {
            const nearestWater = terrain.getNearestWaterPoint(position);
            if (nearestWater) {
                const dx = nearestWater.position.x - position.x;
                const dy = nearestWater.position.y - position.y;
                const dz = nearestWater.position.z - position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0) {
                    waterDirX = dx / distance;
                    waterDirY = dy / distance;
                    waterDirZ = dz / distance;
                }
                
                this.nearestWaterDirection.set(dx, dy, dz);
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
                
                if (distance < 10) {
                    nearbyCount++;
                    if (distance < minDistance) {
                        minDistance = distance;
                        const norm = distance > 0 ? distance : 1;
                        creatureDirX = dx / norm;
                        creatureDirY = dy / norm;
                        creatureDirZ = dz / norm;
                    }
                }
            }
        });
        
        this.nearbyCreatureCount = nearbyCount;
        this.nearestCreatureDirection.set(creatureDirX, creatureDirY, creatureDirZ);
        
        // Check mating readiness
        this.canMate = this.age > 5 && this.energy > 60 && this.hydration > 60 && this.matingCooldown <= 0;
        
        // Return sensor inputs
        return [
            velocity.x / 10,
            velocity.y / 10,
            velocity.z / 10,
            this.energy / 100,
            this.hydration / 100,
            foodDirX,
            foodDirY,
            foodDirZ,
            waterDirX,
            waterDirY,
            waterDirZ,
            creatureDirX,
            creatureDirY,
            creatureDirZ,
            nearbyCount / 10,
            this.canMate ? 1 : 0
        ];
    }

    think() {
        const inputs = this.sense(...arguments);
        const outputs = this.brain.forward(inputs);
        return outputs;
    }

    act(outputs) {
        if (!this.alive || !this.mainBody) return;
        
        // Extract neural outputs
        const forceX = (outputs[0] - 0.5) * this.genome.genes.speed * 50;
        const forceY = (outputs[1] - 0.5) * this.genome.genes.speed * 20;
        const forceZ = (outputs[2] - 0.5) * this.genome.genes.speed * 50;
        const signalIntensity = outputs[3];
        const action = outputs[4]; // >0.5 = attack, <0.5 = mate
        
        // Apply force to main body
        this.mainBody.applyForce(
            new CANNON.Vec3(forceX, forceY, forceZ),
            this.mainBody.position
        );
        
        // **NEURAL CONTROL OF JOINTS**: Use neural network outputs to control limb movement
        // We have 5 outputs, use outputs beyond force/signal for limb control
        const gaitStyle = this.genome.genes.gaitStyle || 0.5; // 0-1 varies gait pattern
        
        this.limbs.forEach((limb, i) => {
            // Each limb controlled by a mix of time-based gait and neural signals
            const phase = (i / this.limbs.length) * Math.PI * 2;
            
            // Base gait pattern (walking) - affected by gaitStyle gene
            const timeGait = Math.sin(this.age * (2 + gaitStyle * 2) + phase);
            
            // Neural modulation: scale gait by movement outputs
            const movementMagnitude = Math.sqrt(forceX * forceX + forceZ * forceZ);
            const gaitSpeed = Math.max(0.1, Math.min(5, movementMagnitude * 2 * this.genome.genes.speed));
            
            // Upper joint motor (shoulder/hip) - controlled by neural force direction
            const upperMotorSpeed = timeGait * gaitSpeed;
            if (limb.hinges[0]) {
                limb.hinges[0].setMotorSpeed(upperMotorSpeed);
            }
            
            // Lower joint motor (elbow/knee) - phase-shifted for realistic gait
            const lowerMotorSpeed = Math.sin(this.age * (2 + gaitStyle * 2) + phase + Math.PI / 2) * gaitSpeed * 0.7;
            if (limb.hinges[1]) {
                limb.hinges[1].setMotorSpeed(lowerMotorSpeed);
            }
        });
        
        // Update communication signal
        this.signalColor.setRGB(
            signalIntensity,
            this.genome.genes.aggression < 0.5 ? 0.5 : 0.2,
            this.genome.genes.aggression > 0.5 ? 0.5 : 0.2
        );
        
        if (this.signalMarker) {
            this.signalMarker.material.color.copy(this.signalColor);
            this.signalMarker.material.emissive.copy(this.signalColor);
        }
        
        return { forceX, forceY, forceZ, action };
    }

    attemptInteraction(otherCreatures) {
        if (!this.alive) return null;
        
        // Find nearest creature
        let nearestCreature = null;
        let minDistance = Infinity;
        
        otherCreatures.forEach(other => {
            if (other !== this && other.alive) {
                const dx = other.mainBody.position.x - this.mainBody.position.x;
                const dy = other.mainBody.position.y - this.mainBody.position.y;
                const dz = other.mainBody.position.z - this.mainBody.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCreature = other;
                }
            }
        });
        
        if (!nearestCreature || minDistance > 3) {
            // Clear behavior states if no nearby creature
            if (this.isFighting || this.isMating) {
                this.isFighting = false;
                this.isMating = false;
                if (this.behaviorIndicator) {
                    this.group.remove(this.behaviorIndicator);
                    this.behaviorIndicator = null;
                }
            }
            return null;
        }
        
        // Decide action based on aggression
        const isAggressive = this.genome.genes.aggression > 0.6;
        const isCooperative = this.genome.genes.aggression < 0.3;
        
        if (isAggressive && !this.isFighting) {
            // Attack!
            this.attack(nearestCreature);
            return { type: 'attack', target: nearestCreature };
        } else if (isCooperative && this.canMate && nearestCreature.canMate && !this.isMating) {
            // Attempt mating
            // Check if compatible (similar aggression levels)
            const aggressionDiff = Math.abs(this.genome.genes.aggression - nearestCreature.genome.genes.aggression);
            if (aggressionDiff < 0.3) {
                this.mate(nearestCreature);
                return { type: 'mate', target: nearestCreature };
            }
        }
        
        return null;
    }

    attack(target) {
        if (!this.alive || !target.alive) return false;
        
        const intensity = Math.random();
        const damage = intensity * this.genome.genes.aggression * 10;
        
        // Visual feedback - 500ms
        this.isFighting = true;
        this.fightingTarget = target;
        this.behaviorTimer = 0.5; // 500ms
        this.createBehaviorIndicator('fighting');
        
        // Apply damage
        target.energy -= damage;
        this.energy -= damage * 0.5; // Attacker loses some energy
        
        // If target dies, gain energy
        if (target.energy <= 0 && target.alive) {
            target.alive = false;
            this.energy = Math.min(100, this.energy + 20);
            this.kills++;
            this.fitness += 50; // Reward for successful kill
            console.log(`⚔️ Creature #${this.id || '?'} killed Creature #${target.id || '?'} at age ${this.age.toFixed(1)}s`);
        }
        
        return true;
    }

    mate(partner) {
        if (!this.canMate || !partner.canMate) return null;
        
        // Visual feedback - 500ms
        this.isMating = true;
        this.matingTarget = partner;
        this.behaviorTimer = 0.5; // 500ms
        this.createBehaviorIndicator('mating');
        
        partner.isMating = true;
        partner.matingTarget = this;
        partner.behaviorTimer = 0.5; // 500ms
        partner.createBehaviorIndicator('mating');
        
        // Energy cost
        this.energy -= 20;
        partner.energy -= 20;
        
        // Cooldown
        this.matingCooldown = 10;
        partner.matingCooldown = 10;
        
        // Return signal to create offspring
        return {
            parent1: this,
            parent2: partner
        };
    }
    
    // Called when eating food
    onEat() {
        this.createBehaviorIndicator('eating');
        this.behaviorTimer = 0.5; // 500ms
    }
    
    // Called when drinking water
    onDrink() {
        this.createBehaviorIndicator('drinking');
        this.behaviorTimer = 0.5; // 500ms
    }

    update(deltaTime, foodManager = null, terrain = null, otherCreatures = []) {
        if (!this.alive) return;
        
        this.age += deltaTime;
        
        // Behavior timer countdown
        if (this.behaviorTimer > 0) {
            this.behaviorTimer -= deltaTime;
            if (this.behaviorTimer <= 0) {
                this.isFighting = false;
                this.isMating = false;
                if (this.behaviorIndicator) {
                    this.group.remove(this.behaviorIndicator);
                    this.behaviorIndicator = null;
                }
            }
        }
        
        // Mating cooldown
        if (this.matingCooldown > 0) {
            this.matingCooldown -= deltaTime;
        }
        
        // Energy and hydration decay (with STARVATION system)
        this.energy -= 0.7 * deltaTime;
        this.hydration -= 0.5 * deltaTime;
        
        // **MOVEMENT ENERGY COST** - moving uses more energy
        const velocity = this.mainBody.velocity;
        const movementMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        this.energy -= movementMagnitude * 0.15 * deltaTime; // Significant energy cost for movement
        
        // **DEATH CONDITIONS** - creatures MUST eat and drink
        // Death from starvation or dehydration
        if (this.energy <= 0) {
            console.log(`🪦 Creature #${this.id || '?'} died from starvation at age ${this.age.toFixed(1)}s (fitness: ${this.fitness.toFixed(1)})`);
            this.alive = false;
            return;
        }
        if (this.hydration <= 0) {
            console.log(`🪦 Creature #${this.id || '?'} died from dehydration at age ${this.age.toFixed(1)}s (fitness: ${this.fitness.toFixed(1)})`);
            this.alive = false;
            return;
        }
        // Death from old age
        if (this.age > 120) {
            console.log(`🪦 Creature #${this.id || '?'} died from old age at ${this.age.toFixed(1)}s (fitness: ${this.fitness.toFixed(1)})`);
            this.alive = false;
            return;
        }
        
        // Think and act
        const sensorInputs = this.sense(foodManager, otherCreatures, terrain);
        const outputs = this.brain.forward(sensorInputs);
        this.act(outputs);
        
        // Check for food collection
        if (foodManager) {
            foodManager.checkCollisions(this);
        }
        
        // Check for water replenishment
        if (terrain) {
            terrain.checkWaterProximity(this);
        }
        
        // Track distance traveled
        const currentPos = new THREE.Vector3(
            this.mainBody.position.x,
            this.mainBody.position.y,
            this.mainBody.position.z
        );
        this.distanceTraveled += currentPos.distanceTo(this.lastPosition);
        this.lastPosition.copy(currentPos);
        
        // Update fitness
        this.fitness += deltaTime * 2; // Time alive
        this.fitness += this.distanceTraveled * 0.05; // Movement
        
        // Social fitness modifier
        if (this.genome.genes.aggression < 0.5) {
            // Cooperative: benefit from nearby creatures
            this.fitness += this.nearbyCreatureCount * 5 * deltaTime;
        } else {
            // Competitive: penalty for crowding
            this.fitness -= this.nearbyCreatureCount * 2 * deltaTime;
        }
        
        // Hydration fitness bonus
        this.fitness += (this.hydration / 100) * deltaTime;
        
        // Sync visual meshes with physics bodies
        this.syncMeshes();
        
        // Update markers
        this.updateSignalMarker();
        this.updateBehaviorIndicator();
    }

    syncMeshes() {
        this.meshes.forEach((mesh, index) => {
            const body = this.bodies[index];
            if (body) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });
    }

    addToScene(scene) {
        scene.add(this.group);
    }

    addToWorld(world) {
        this.bodies.forEach(body => world.addBody(body));
        this.constraints.forEach(constraint => world.addConstraint(constraint));
    }

    removeFromScene(scene) {
        scene.remove(this.group);
    }

    removeFromWorld(world) {
        this.bodies.forEach(body => world.removeBody(body));
        this.constraints.forEach(constraint => world.removeConstraint(constraint));
    }

    dispose() {
        this.meshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
    }
}
