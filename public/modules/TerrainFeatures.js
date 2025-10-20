import * as THREE from 'three';

/**
 * TerrainFeatures - Composable terrain feature generators
 * Create modular terrain elements that can be combined for level design
 */
export class TerrainFeatures {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a hill feature
     * @param {number} x - Center X position
     * @param {number} z - Center Z position
     * @param {number} radius - Hill radius
     * @param {number} height - Hill height
     * @param {Object} options - Additional options (color, segments)
     * @returns {THREE.Mesh} Hill mesh
     */
    createHill(x, z, radius = 10, height = 5, options = {}) {
        const segments = options.segments || 32;
        const color = options.color || 0x3a7d44;
        
        // Create a sphere for the hill, cut in half
        const geometry = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const hill = new THREE.Mesh(geometry, material);
        hill.position.set(x, 0, z);
        hill.scale.y = height / radius; // Adjust height
        hill.receiveShadow = true;
        hill.castShadow = true;
        
        this.scene.add(hill);
        
        return {
            type: 'hill',
            mesh: hill,
            position: { x, y: 0, z },
            radius,
            height
        };
    }

    /**
     * Create a plateau feature (flat elevated area)
     * @param {number} x - Center X position
     * @param {number} z - Center Z position
     * @param {number} width - Plateau width
     * @param {number} depth - Plateau depth
     * @param {number} height - Plateau height
     * @param {Object} options - Additional options
     * @returns {Object} Plateau structure
     */
    createPlateau(x, z, width = 15, depth = 15, height = 4, options = {}) {
        const color = options.color || 0x8b7355;
        const group = new THREE.Group();
        
        // Top surface
        const topGeo = new THREE.BoxGeometry(width, 0.5, depth);
        const topMat = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.85 
        });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = height;
        top.receiveShadow = true;
        top.castShadow = true;
        group.add(top);
        
        // Side walls (4 sides)
        const sideColor = new THREE.Color(color).multiplyScalar(0.7);
        const sideMat = new THREE.MeshStandardMaterial({ 
            color: sideColor,
            roughness: 0.9 
        });
        
        // Front and back
        const sideGeoZ = new THREE.BoxGeometry(width, height, 0.5);
        const front = new THREE.Mesh(sideGeoZ, sideMat);
        front.position.set(0, height / 2, depth / 2);
        front.castShadow = true;
        group.add(front);
        
        const back = new THREE.Mesh(sideGeoZ, sideMat);
        back.position.set(0, height / 2, -depth / 2);
        back.castShadow = true;
        group.add(back);
        
        // Left and right
        const sideGeoX = new THREE.BoxGeometry(0.5, height, depth);
        const left = new THREE.Mesh(sideGeoX, sideMat);
        left.position.set(-width / 2, height / 2, 0);
        left.castShadow = true;
        group.add(left);
        
        const right = new THREE.Mesh(sideGeoX, sideMat);
        right.position.set(width / 2, height / 2, 0);
        right.castShadow = true;
        group.add(right);
        
        group.position.set(x, 0, z);
        this.scene.add(group);
        
        return {
            type: 'plateau',
            mesh: group,
            position: { x, y: 0, z },
            width,
            depth,
            height
        };
    }

    /**
     * Create a valley (depression in terrain)
     * @param {number} x - Center X position
     * @param {number} z - Center Z position
     * @param {number} radius - Valley radius
     * @param {number} depth - Valley depth
     * @param {Object} options - Additional options
     * @returns {THREE.Mesh} Valley mesh
     */
    createValley(x, z, radius = 12, depth = 3, options = {}) {
        const segments = options.segments || 32;
        const color = options.color || 0x6b8e23;
        
        // Inverted half-sphere for valley
        const geometry = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.85,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const valley = new THREE.Mesh(geometry, material);
        valley.position.set(x, -depth, z);
        valley.scale.y = depth / radius;
        valley.receiveShadow = true;
        
        this.scene.add(valley);
        
        return {
            type: 'valley',
            mesh: valley,
            position: { x, y: -depth, z },
            radius,
            depth
        };
    }

    /**
     * Create a canyon/ravine
     * @param {number} x - Start X position
     * @param {number} z - Start Z position
     * @param {number} length - Canyon length
     * @param {number} width - Canyon width
     * @param {number} depth - Canyon depth
     * @param {number} angle - Rotation angle in radians
     * @param {Object} options - Additional options
     * @returns {Object} Canyon structure
     */
    createCanyon(x, z, length = 20, width = 4, depth = 5, angle = 0, options = {}) {
        const color = options.color || 0x8b7355;
        const group = new THREE.Group();
        
        const wallColor = new THREE.Color(color).multiplyScalar(0.6);
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: wallColor,
            roughness: 0.95 
        });
        
        // Left wall
        const leftWallGeo = new THREE.BoxGeometry(length, depth, 0.5);
        const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
        leftWall.position.set(0, depth / 2, -width / 2);
        leftWall.castShadow = true;
        group.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
        rightWall.position.set(0, depth / 2, width / 2);
        rightWall.castShadow = true;
        group.add(rightWall);
        
        // Floor
        const floorColor = new THREE.Color(color).multiplyScalar(0.4);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: floorColor,
            roughness: 0.9 
        });
        const floorGeo = new THREE.BoxGeometry(length, 0.5, width);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = 0.25;
        floor.receiveShadow = true;
        group.add(floor);
        
        group.position.set(x, 0, z);
        group.rotation.y = angle;
        this.scene.add(group);
        
        return {
            type: 'canyon',
            mesh: group,
            position: { x, y: 0, z },
            length,
            width,
            depth,
            angle
        };
    }

    /**
     * Create a cave entrance
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} size - Cave entrance size
     * @param {Object} options - Additional options
     * @returns {Object} Cave entrance structure
     */
    createCaveEntrance(x, z, size = 3, options = {}) {
        const group = new THREE.Group();
        
        // Rock formation around entrance
        const rockColor = 0x4a4a4a;
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: rockColor,
            roughness: 0.95 
        });
        
        // Create irregular rocks around entrance
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rockRadius = size * 0.3 + Math.random() * size * 0.2;
            const rockGeo = new THREE.DodecahedronGeometry(rockRadius, 0);
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(
                Math.cos(angle) * size * 0.7,
                size * 0.4,
                Math.sin(angle) * size * 0.7
            );
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            group.add(rock);
        }
        
        // Dark entrance (sphere cut in half)
        const entranceGeo = new THREE.SphereGeometry(size, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const entranceMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 1,
            emissive: 0x111111,
            emissiveIntensity: 0.2
        });
        const entrance = new THREE.Mesh(entranceGeo, entranceMat);
        entrance.position.y = 0;
        entrance.rotation.x = Math.PI;
        group.add(entrance);
        
        group.position.set(x, 0, z);
        this.scene.add(group);
        
        return {
            type: 'cave',
            mesh: group,
            position: { x, y: 0, z },
            size,
            interactable: true,
            interact: function() {
                return { message: 'You enter the dark cave...', type: 'info' };
            }
        };
    }

    /**
     * Create a bridge
     * @param {number} x - Start X position
     * @param {number} z - Start Z position
     * @param {number} length - Bridge length
     * @param {number} height - Bridge height above ground
     * @param {number} angle - Rotation angle in radians
     * @param {Object} options - Additional options
     * @returns {Object} Bridge structure
     */
    createBridge(x, z, length = 10, height = 2, angle = 0, options = {}) {
        const width = options.width || 2;
        const color = options.color || 0x8b4513;
        const group = new THREE.Group();
        
        // Bridge deck
        const deckGeo = new THREE.BoxGeometry(length, 0.3, width);
        const deckMat = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.9 
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = height;
        deck.receiveShadow = true;
        deck.castShadow = true;
        group.add(deck);
        
        // Support posts (2 on each side)
        const postGeo = new THREE.CylinderGeometry(0.2, 0.2, height, 8);
        const postMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(color).multiplyScalar(0.7),
            roughness: 0.9 
        });
        
        for (let side = -1; side <= 1; side += 2) {
            for (let i = -1; i <= 1; i += 2) {
                const post = new THREE.Mesh(postGeo, postMat);
                post.position.set(length * i * 0.4, height / 2, width * side * 0.4);
                post.castShadow = true;
                group.add(post);
            }
        }
        
        // Railings
        const railGeo = new THREE.BoxGeometry(length, 0.1, 0.1);
        const railMat = new THREE.MeshStandardMaterial({ color: color });
        
        for (let side = -1; side <= 1; side += 2) {
            const rail = new THREE.Mesh(railGeo, railMat);
            rail.position.set(0, height + 0.5, width * side * 0.5);
            rail.castShadow = true;
            group.add(rail);
        }
        
        group.position.set(x, 0, z);
        group.rotation.y = angle;
        this.scene.add(group);
        
        return {
            type: 'bridge',
            mesh: group,
            position: { x, y: 0, z },
            length,
            width,
            height,
            angle
        };
    }

    /**
     * Create a ramp (for connecting different heights)
     * @param {number} x - Start X position
     * @param {number} z - Start Z position
     * @param {number} length - Ramp length
     * @param {number} heightDiff - Height difference
     * @param {number} angle - Rotation angle in radians
     * @param {Object} options - Additional options
     * @returns {Object} Ramp structure
     */
    createRamp(x, z, length = 8, heightDiff = 3, angle = 0, options = {}) {
        const width = options.width || 3;
        const color = options.color || 0x6b8e23;
        
        const geometry = new THREE.BoxGeometry(length, 0.5, width);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.85
        });
        
        const ramp = new THREE.Mesh(geometry, material);
        ramp.position.set(x, heightDiff / 2, z);
        ramp.rotation.y = angle;
        ramp.rotation.z = Math.atan2(heightDiff, length);
        ramp.receiveShadow = true;
        ramp.castShadow = true;
        
        this.scene.add(ramp);
        
        return {
            type: 'ramp',
            mesh: ramp,
            position: { x, y: heightDiff / 2, z },
            length,
            width,
            heightDiff,
            angle
        };
    }
}
