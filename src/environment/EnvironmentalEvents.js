import * as THREE from 'three';

/**
 * EnvironmentalEvents - Dynamic events that challenge the ecosystem
 * Inspired by From Dust - natural forces that creatures must adapt to
 */

export class EnvironmentalEventManager {
    constructor(scene, foodManager) {
        this.scene = scene;
        this.foodManager = foodManager;
        this.events = [];
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventInterval = 30; // Event every 30 seconds
        this.eventDuration = 10; // Events last 10 seconds
        this.eventChance = 0.7; // 70% chance of event triggering
    }
    
    update(deltaTime) {
        this.eventTimer += deltaTime;
        
        // Check if active event should end
        if (this.activeEvent && this.eventTimer >= this.eventDuration) {
            this.endEvent();
        }
        
        // Check if new event should start
        if (!this.activeEvent && this.eventTimer >= this.eventInterval) {
            this.eventTimer = 0;
            
            if (Math.random() < this.eventChance) {
                this.startRandomEvent();
            }
        }
        
        // Update active event
        if (this.activeEvent) {
            this.activeEvent.update(deltaTime);
        }
    }
    
    startRandomEvent() {
        const eventTypes = [
            'abundance',  // Food multiplies
            'scarcity',   // Food disappears
            'drought',    // Water becomes scarce
            'migration'   // Food moves to new location
        ];
        
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        console.log(`🌍 ENVIRONMENTAL EVENT: ${eventType.toUpperCase()}`);
        
        switch (eventType) {
            case 'abundance':
                this.activeEvent = new AbundanceEvent(this.scene, this.foodManager);
                break;
            case 'scarcity':
                this.activeEvent = new ScarcityEvent(this.scene, this.foodManager);
                break;
            case 'drought':
                this.activeEvent = new DroughtEvent(this.scene);
                break;
            case 'migration':
                this.activeEvent = new MigrationEvent(this.scene, this.foodManager);
                break;
        }
        
        if (this.activeEvent) {
            this.activeEvent.start();
        }
    }
    
    endEvent() {
        if (this.activeEvent) {
            console.log(`🌍 Environmental event ended: ${this.activeEvent.type}`);
            this.activeEvent.end();
            this.activeEvent = null;
        }
    }
    
    getCurrentEvent() {
        return this.activeEvent ? this.activeEvent.type : null;
    }
}

/**
 * Base Event Class
 */
class EnvironmentalEvent {
    constructor(scene, type) {
        this.scene = scene;
        this.type = type;
        this.indicator = null;
    }
    
    start() {
        // Create visual indicator
        this.createIndicator();
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    end() {
        // Remove visual indicator
        if (this.indicator) {
            this.scene.remove(this.indicator);
            this.indicator = null;
        }
    }
    
    createIndicator() {
        // Create a glowing orb in the sky to indicate event
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: this.getEventColor(),
            transparent: true,
            opacity: 0.6
        });
        this.indicator = new THREE.Mesh(geometry, material);
        this.indicator.position.set(0, 30, 0);
        this.scene.add(this.indicator);
    }
    
    getEventColor() {
        return 0xffffff; // Default white
    }
}

/**
 * Abundance Event - Food multiplies temporarily
 */
class AbundanceEvent extends EnvironmentalEvent {
    constructor(scene, foodManager) {
        super(scene, 'abundance');
        this.foodManager = foodManager;
        this.extraFood = [];
    }
    
    start() {
        super.start();
        // Spawn 20 extra temporary food sources
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 20;
            const food = {
                position: {
                    x: Math.cos(angle) * radius,
                    y: 0.5,
                    z: Math.sin(angle) * radius
                },
                mesh: null
            };
            
            // Create visual
            const geometry = new THREE.SphereGeometry(0.4, 8, 8);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffff00, // Yellow for abundance
                emissive: 0xffff00,
                emissiveIntensity: 0.7
            });
            food.mesh = new THREE.Mesh(geometry, material);
            food.mesh.position.set(food.position.x, food.position.y, food.position.z);
            this.scene.add(food.mesh);
            
            this.extraFood.push(food);
        }
    }
    
    update(deltaTime) {
        // Animate extra food
        this.extraFood.forEach(food => {
            const time = Date.now() * 0.001;
            food.mesh.position.y = food.position.y + Math.sin(time * 3) * 0.2;
            food.mesh.rotation.y += deltaTime * 2;
        });
    }
    
    end() {
        super.end();
        // Remove extra food
        this.extraFood.forEach(food => {
            this.scene.remove(food.mesh);
        });
        this.extraFood = [];
    }
    
    getEventColor() {
        return 0xffff00; // Yellow
    }
}

/**
 * Scarcity Event - Food becomes temporarily unavailable
 */
class ScarcityEvent extends EnvironmentalEvent {
    constructor(scene, foodManager) {
        super(scene, 'scarcity');
        this.foodManager = foodManager;
        this.hiddenFood = [];
    }
    
    start() {
        super.start();
        // Hide 50% of food
        const foods = this.foodManager.foods;
        const toHide = Math.floor(foods.length * 0.5);
        
        for (let i = 0; i < toHide && i < foods.length; i++) {
            if (!foods[i].consumed && foods[i].mesh.visible) {
                foods[i].mesh.visible = false;
                this.hiddenFood.push(foods[i]);
            }
        }
    }
    
    end() {
        super.end();
        // Restore hidden food
        this.hiddenFood.forEach(food => {
            food.mesh.visible = true;
        });
        this.hiddenFood = [];
    }
    
    getEventColor() {
        return 0xff6600; // Orange
    }
}

/**
 * Drought Event - Visual effect only (water still functions)
 */
class DroughtEvent extends EnvironmentalEvent {
    constructor(scene) {
        super(scene, 'drought');
    }
    
    getEventColor() {
        return 0xff0000; // Red
    }
}

/**
 * Migration Event - Food relocates to new area
 */
class MigrationEvent extends EnvironmentalEvent {
    constructor(scene, foodManager) {
        super(scene, 'migration');
        this.foodManager = foodManager;
        this.migrationTarget = { x: 0, z: 0 };
    }
    
    start() {
        super.start();
        // Choose random migration target
        const angle = Math.random() * Math.PI * 2;
        const radius = 15;
        this.migrationTarget = {
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius
        };
    }
    
    update(deltaTime) {
        // Slowly move food toward migration target
        const speed = 2; // units per second
        
        this.foodManager.foods.forEach(food => {
            if (!food.consumed) {
                const dx = this.migrationTarget.x - food.position.x;
                const dz = this.migrationTarget.z - food.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance > 1) {
                    const moveX = (dx / distance) * speed * deltaTime;
                    const moveZ = (dz / distance) * speed * deltaTime;
                    
                    food.position.x += moveX;
                    food.position.z += moveZ;
                    food.mesh.position.x = food.position.x;
                    food.mesh.position.z = food.position.z;
                    food.body.position.x = food.position.x;
                    food.body.position.z = food.position.z;
                }
            }
        });
    }
    
    getEventColor() {
        return 0x00ffff; // Cyan
    }
}
