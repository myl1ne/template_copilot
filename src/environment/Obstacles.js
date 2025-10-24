import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Obstacle - Environmental challenges for creatures to navigate
 */

export class Obstacle {
    constructor(position, size, type = 'rock') {
        this.position = position;
        this.size = size;
        this.type = type;
        
        // Visual representation
        let geometry;
        let material;
        
        switch (type) {
            case 'rock':
                geometry = new THREE.DodecahedronGeometry(size, 0);
                material = new THREE.MeshStandardMaterial({
                    color: 0x666666,
                    roughness: 0.9,
                    metalness: 0.1
                });
                break;
            case 'crystal':
                geometry = new THREE.OctahedronGeometry(size, 0);
                material = new THREE.MeshStandardMaterial({
                    color: 0x4444ff,
                    emissive: 0x0000ff,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.7
                });
                break;
            case 'plant':
                geometry = new THREE.ConeGeometry(size * 0.5, size * 2, 8);
                material = new THREE.MeshStandardMaterial({
                    color: 0x228822,
                    roughness: 0.8
                });
                break;
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Physics body
        let shape;
        switch (type) {
            case 'rock':
                shape = new CANNON.Sphere(size);
                break;
            case 'crystal':
                shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
                break;
            case 'plant':
                shape = new CANNON.Cylinder(size * 0.5, size * 0.5, size * 2, 8);
                break;
        }
        
        this.body = new CANNON.Body({
            mass: 0, // Static
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        this.body.userData = { type: 'obstacle', obstacle: this };
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
 * ObstacleManager - Manages environmental obstacles
 */

export class ObstacleManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.obstacles = [];
    }

    initialize() {
        // Create clusters of obstacles
        this.createObstacleCluster({ x: 10, y: 0.5, z: 10 }, 5, 'rock');
        this.createObstacleCluster({ x: -10, y: 0.5, z: -10 }, 5, 'rock');
        this.createObstacleCluster({ x: 15, y: 0.5, z: -15 }, 3, 'crystal');
        this.createObstacleCluster({ x: -15, y: 1, z: 15 }, 4, 'plant');
    }

    createObstacleCluster(center, count, type) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.random() * 3 + 1;
            const position = {
                x: center.x + Math.cos(angle) * radius,
                y: center.y,
                z: center.z + Math.sin(angle) * radius
            };
            
            const size = Math.random() * 0.5 + 0.5;
            const obstacle = new Obstacle(position, size, type);
            
            obstacle.addToScene(this.scene);
            obstacle.addToWorld(this.world);
            this.obstacles.push(obstacle);
        }
    }

    reset() {
        this.obstacles.forEach(obstacle => {
            obstacle.removeFromScene(this.scene);
            obstacle.removeFromWorld(this.world);
            obstacle.dispose();
        });
        this.obstacles = [];
        this.initialize();
    }

    dispose() {
        this.obstacles.forEach(obstacle => {
            obstacle.removeFromScene(this.scene);
            obstacle.removeFromWorld(this.world);
            obstacle.dispose();
        });
        this.obstacles = [];
    }
}
