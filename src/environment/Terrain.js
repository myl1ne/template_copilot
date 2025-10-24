import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Terrain - Complex heightmap-based terrain with borders and water
 */

export class Terrain {
    constructor(scene, world, size = 60) {
        this.scene = scene;
        this.world = world;
        this.size = size;
        this.segments = 60;
        this.waterLevel = 0.5;
        
        this.createTerrain();
        this.createWaterPoints();
        this.createBorders();
    }

    createTerrain() {
        // Generate heightmap using Perlin-like noise
        const geometry = new THREE.PlaneGeometry(
            this.size, 
            this.size, 
            this.segments, 
            this.segments
        );
        
        // Modify vertices to create hills and valleys
        const vertices = geometry.attributes.position.array;
        this.heightData = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];
            
            // Multi-octave noise for terrain variation
            let height = 0;
            height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
            height += Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.5;
            height += Math.sin(x * 0.05 + 10) * Math.cos(z * 0.05 + 10) * 3;
            height += (Math.random() - 0.5) * 0.3; // Random variation
            
            // Store height data for physics
            this.heightData.push({ x, z, height });
            vertices[i + 2] = height;
        }
        
        geometry.computeVertexNormals();
        geometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
        
        // Vertex colors based on height
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 2];
            let color;
            
            if (height < this.waterLevel - 0.5) {
                color = new THREE.Color(0x8B7355); // Sandy brown (beach)
            } else if (height < 1) {
                color = new THREE.Color(0x6B8E23); // Olive green (grass)
            } else if (height < 2) {
                color = new THREE.Color(0x228B22); // Forest green
            } else {
                color = new THREE.Color(0x8B8B8B); // Gray (rocky)
            }
            
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.9,
            metalness: 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Create heightfield physics body from terrain data
        const matrix = [];
        const sizeX = this.segments + 1;
        const sizeY = this.segments + 1;
        
        // Convert height data to 2D matrix for Heightfield
        for (let i = 0; i < sizeY; i++) {
            matrix.push([]);
            for (let j = 0; j < sizeX; j++) {
                const index = i * sizeX + j;
                if (index < this.heightData.length) {
                    matrix[i].push(this.heightData[index].height);
                } else {
                    matrix[i].push(0);
                }
            }
        }
        
        const heightfieldShape = new CANNON.Heightfield(matrix, {
            elementSize: this.size / this.segments
        });
        
        this.groundBody = new CANNON.Body({
            mass: 0,
            shape: heightfieldShape
        });
        
        // Position and rotate the heightfield to match visual terrain
        this.groundBody.position.set(
            -this.size / 2,
            0,
            this.size / 2
        );
        this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(this.groundBody);
    }

    createWaterPoints() {
        this.waterPoints = [];
        const waterCount = 5;
        
        for (let i = 0; i < waterCount; i++) {
            const angle = (i / waterCount) * Math.PI * 2;
            const radius = (this.size / 2) * 0.6;
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
            
            // Water pool geometry
            const poolGeometry = new THREE.CylinderGeometry(3, 3, 0.3, 16);
            const poolMaterial = new THREE.MeshStandardMaterial({
                color: 0x4169E1,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.3
            });
            
            const pool = new THREE.Mesh(poolGeometry, poolMaterial);
            pool.position.set(x, this.waterLevel, z);
            pool.receiveShadow = true;
            this.scene.add(pool);
            
            // Physics body for water
            const waterShape = new CANNON.Cylinder(3, 3, 0.3, 16);
            const waterBody = new CANNON.Body({
                mass: 0,
                shape: waterShape,
                position: new CANNON.Vec3(x, this.waterLevel, z)
            });
            waterBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            waterBody.userData = { type: 'water', waterPoint: this };
            this.world.addBody(waterBody);
            
            this.waterPoints.push({
                position: { x, y: this.waterLevel, z },
                mesh: pool,
                body: waterBody,
                hydrationProvided: 20
            });
        }
    }

    createBorders() {
        this.borders = [];
        const borderHeight = 5;
        const borderThickness = 1;
        const halfSize = this.size / 2;
        
        // Four walls
        const walls = [
            { x: 0, z: halfSize, width: this.size, depth: borderThickness },
            { x: 0, z: -halfSize, width: this.size, depth: borderThickness },
            { x: halfSize, z: 0, width: borderThickness, depth: this.size },
            { x: -halfSize, z: 0, width: borderThickness, depth: this.size }
        ];
        
        walls.forEach(wall => {
            // Visual wall
            const geometry = new THREE.BoxGeometry(wall.width, borderHeight, wall.depth);
            const material = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(wall.x, borderHeight / 2, wall.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            
            // Physics wall
            const shape = new CANNON.Box(new CANNON.Vec3(
                wall.width / 2,
                borderHeight / 2,
                wall.depth / 2
            ));
            const body = new CANNON.Body({
                mass: 0,
                shape: shape,
                position: new CANNON.Vec3(wall.x, borderHeight / 2, wall.z)
            });
            body.userData = { type: 'border' };
            this.world.addBody(body);
            
            this.borders.push({ mesh, body });
        });
    }

    getHeightAt(x, z) {
        // Simple approximation - could be improved with proper heightmap lookup
        let height = 0;
        height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
        height += Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.5;
        height += Math.sin(x * 0.05 + 10) * Math.cos(z * 0.05 + 10) * 3;
        return Math.max(0, height);
    }

    getNearestWaterPoint(position) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.waterPoints.forEach(water => {
            const dx = position.x - water.position.x;
            const dy = position.y - water.position.y;
            const dz = position.z - water.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = water;
            }
        });
        
        return nearest;
    }

    checkWaterProximity(creature) {
        const nearest = this.getNearestWaterPoint(creature.mainBody.position);
        if (nearest) {
            const dx = creature.mainBody.position.x - nearest.position.x;
            const dy = creature.mainBody.position.y - nearest.position.y;
            const dz = creature.mainBody.position.z - nearest.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < 4) { // Within water reach
                creature.hydration = Math.min(100, creature.hydration + nearest.hydrationProvided * 0.016);
                return true;
            }
        }
        return false;
    }

    isInBounds(position) {
        const halfSize = this.size / 2 - 2;
        return Math.abs(position.x) < halfSize && Math.abs(position.z) < halfSize;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        
        this.waterPoints.forEach(water => {
            this.scene.remove(water.mesh);
            water.mesh.geometry.dispose();
            water.mesh.material.dispose();
            this.world.removeBody(water.body);
        });
        
        this.borders.forEach(border => {
            this.scene.remove(border.mesh);
            border.mesh.geometry.dispose();
            border.mesh.material.dispose();
            this.world.removeBody(border.body);
        });
        
        this.world.removeBody(this.groundBody);
    }
}
