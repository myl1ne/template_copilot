import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Food - Energy sources in the environment that creatures can consume
 */

export class Food {
    constructor(position, energyValue = 20) {
        this.position = position;
        this.energyValue = energyValue;
        this.consumed = false;
        this.respawnTime = 10; // seconds until respawn
        this.respawnTimer = 0;
        
        // Visual representation
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;
        
        // Physics body for collision detection
        const shape = new CANNON.Sphere(0.3);
        this.body = new CANNON.Body({
            mass: 0, // Static
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            collisionResponse: false // Doesn't physically interact
        });
        this.body.userData = { type: 'food', food: this };
    }

    consume() {
        if (!this.consumed) {
            this.consumed = true;
            this.mesh.visible = false;
            this.body.collisionResponse = false;
            return this.energyValue;
        }
        return 0;
    }

    update(deltaTime) {
        if (this.consumed) {
            this.respawnTimer += deltaTime;
            if (this.respawnTimer >= this.respawnTime) {
                this.respawn();
            }
        }
        
        // Gentle floating animation
        if (!this.consumed) {
            const time = Date.now() * 0.001;
            this.mesh.position.y = this.position.y + Math.sin(time * 2) * 0.1;
            this.mesh.rotation.y += deltaTime;
        }
    }

    respawn() {
        this.consumed = false;
        this.respawnTimer = 0;
        this.mesh.visible = true;
        this.body.collisionResponse = false;
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

    removeFromScene(scene) {
        scene.remove(this.mesh);
    }

    addToWorld(world) {
        world.addBody(this.body);
    }

    removeFromWorld(world) {
        world.removeBody(this.body);
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

/**
 * FoodManager - Manages food sources in the environment
 */

export class FoodManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.foods = [];
        this.foodCount = 30;
        this.spawnRadius = 20;
    }

    initialize() {
        // Spawn initial food
        for (let i = 0; i < this.foodCount; i++) {
            this.spawnFood();
        }
    }

    spawnFood(position = null) {
        if (!position) {
            // Random position within spawn radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.spawnRadius;
            position = {
                x: Math.cos(angle) * radius,
                y: 0.5,
                z: Math.sin(angle) * radius
            };
        }
        
        const food = new Food(position);
        food.addToScene(this.scene);
        food.addToWorld(this.world);
        this.foods.push(food);
        
        return food;
    }

    update(deltaTime) {
        this.foods.forEach(food => {
            food.update(deltaTime);
        });
    }

    checkCollisions(creature) {
        // Check if creature is near any food
        const creaturePos = creature.mainBody.position;
        const collectionRadius = 1.5; // Distance at which food can be collected
        
        this.foods.forEach(food => {
            if (!food.consumed) {
                const dx = creaturePos.x - food.position.x;
                const dy = creaturePos.y - food.position.y;
                const dz = creaturePos.z - food.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < collectionRadius) {
                    const energy = food.consume();
                    if (energy > 0) {
                        creature.energy = Math.min(100, creature.energy + energy);
                        creature.foodCollected++;
                        
                        // **PACK FOOD SHARING** - Herbivores share with pack
                        if (creature.shareFoodWithPack) {
                            creature.shareFoodWithPack(energy);
                        }
                        
                        // Trigger eating visual indicator
                        if (creature.onEat) {
                            creature.onEat();
                        }
                    }
                }
            }
        });
    }

    getNearestFoodPosition(position) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.foods.forEach(food => {
            if (!food.consumed) {
                const dx = position.x - food.position.x;
                const dy = position.y - food.position.y;
                const dz = position.z - food.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = food.position;
                }
            }
        });
        
        return nearest;
    }
    
    getAllFoodPositions() {
        // Return all available (non-consumed) food positions for enhanced vision
        return this.foods
            .filter(food => !food.consumed)
            .map(food => food.position);
    }

    reset() {
        this.foods.forEach(food => {
            food.removeFromScene(this.scene);
            food.removeFromWorld(this.world);
            food.dispose();
        });
        this.foods = [];
        this.initialize();
    }

    dispose() {
        this.foods.forEach(food => {
            food.removeFromScene(this.scene);
            food.removeFromWorld(this.world);
            food.dispose();
        });
        this.foods = [];
    }
}
