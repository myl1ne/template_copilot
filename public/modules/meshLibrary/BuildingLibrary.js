import * as THREE from 'three';

/**
 * BuildingLibrary - Building and structure mesh definitions
 * Houses, towers, castles, and other architectural elements
 */
export class BuildingLibrary {
    /**
     * Create a simple house
     */
    static createHouseMesh() {
        const group = new THREE.Group();
        
        // Walls
        const wallGeo = new THREE.BoxGeometry(3, 2.5, 3);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.y = 1.25;
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(2.3, 1.5, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // Door
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.75, 1.51);
        group.add(door);
        
        // Windows
        const windowGeo = new THREE.BoxGeometry(0.6, 0.6, 0.1);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
        const leftWindow = new THREE.Mesh(windowGeo, windowMat);
        leftWindow.position.set(-1, 1.5, 1.51);
        group.add(leftWindow);
        const rightWindow = new THREE.Mesh(windowGeo, windowMat);
        rightWindow.position.set(1, 1.5, 1.51);
        group.add(rightWindow);
        
        return group;
    }

    /**
     * Create a tower
     */
    static createTowerMesh() {
        const group = new THREE.Group();
        
        // Main tower body
        const towerGeo = new THREE.CylinderGeometry(1.5, 1.8, 8, 16);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 4;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);
        
        // Top
        const topGeo = new THREE.ConeGeometry(2, 2, 16);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 9;
        top.castShadow = true;
        group.add(top);
        
        // Windows (spiral)
        const windowGeo = new THREE.BoxGeometry(0.4, 0.6, 0.2);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.3 });
        
        for (let i = 0; i < 4; i++) {
            const window = new THREE.Mesh(windowGeo, windowMat);
            const angle = (i / 4) * Math.PI * 2;
            const y = 2 + i * 1.5;
            window.position.set(Math.cos(angle) * 1.6, y, Math.sin(angle) * 1.6);
            window.rotation.y = -angle;
            group.add(window);
        }
        
        // Door
        const doorGeo = new THREE.BoxGeometry(1, 2, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1, 1.85);
        group.add(door);
        
        return group;
    }

    /**
     * Create a castle wall section
     */
    static createCastleWallMesh() {
        const group = new THREE.Group();
        
        // Wall
        const wallGeo = new THREE.BoxGeometry(5, 3, 1);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = 1.5;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);
        
        // Battlements
        for (let i = -2; i <= 2; i++) {
            if (i % 1 === 0) {
                const battGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
                const batt = new THREE.Mesh(battGeo, wallMat);
                batt.position.set(i * 1.2, 3.4, 0);
                batt.castShadow = true;
                group.add(batt);
            }
        }
        
        return group;
    }

    /**
     * Create a windmill
     */
    static createWindmillMesh() {
        const group = new THREE.Group();
        
        // Base (tapered)
        const baseGeo = new THREE.CylinderGeometry(1, 1.5, 5, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 2.5;
        base.castShadow = true;
        group.add(base);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(1.2, 1, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5.5;
        roof.castShadow = true;
        group.add(roof);
        
        // Blades (X shape)
        const bladeGroup = new THREE.Group();
        bladeGroup.position.set(0, 4, 1.2);
        
        // Blade 1
        const bladeGeo = new THREE.BoxGeometry(0.3, 2.5, 0.1);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.rotation.z = (i * Math.PI / 2) + Math.PI / 4;
            blade.castShadow = true;
            bladeGroup.add(blade);
        }
        group.add(bladeGroup);
        
        // Door
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.75, 1.51);
        group.add(door);
        
        return group;
    }

    /**
     * Create a well
     */
    static createWellMesh() {
        const group = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.5, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.75;
        base.castShadow = true;
        group.add(base);
        
        // Posts
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const post1 = new THREE.Mesh(postGeo, postMat);
        post1.position.set(-0.7, 2, 0);
        post1.castShadow = true;
        group.add(post1);
        const post2 = new THREE.Mesh(postGeo, postMat);
        post2.position.set(0.7, 2, 0);
        post2.castShadow = true;
        group.add(post2);
        
        // Crossbeam
        const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8);
        const beam = new THREE.Mesh(beamGeo, postMat);
        beam.position.y = 3;
        beam.rotation.z = Math.PI / 2;
        group.add(beam);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(1, 1, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // Bucket
        const bucketGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 8);
        const bucketMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
        const bucket = new THREE.Mesh(bucketGeo, bucketMat);
        bucket.position.set(0, 2.5, 0);
        group.add(bucket);
        
        return group;
    }

    /**
     * Create a barn
     */
    static createBarnMesh() {
        const group = new THREE.Group();
        
        // Main structure
        const bodyGeo = new THREE.BoxGeometry(4, 3, 5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Roof (gabled)
        const roofGeo = new THREE.BoxGeometry(4.5, 2, 5.5);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof1 = new THREE.Mesh(roofGeo, roofMat);
        roof1.position.set(0, 3.8, 0);
        roof1.rotation.z = Math.PI / 6;
        roof1.castShadow = true;
        group.add(roof1);
        
        const roof2 = new THREE.Mesh(roofGeo, roofMat);
        roof2.position.set(0, 3.8, 0);
        roof2.rotation.z = -Math.PI / 6;
        roof2.castShadow = true;
        group.add(roof2);
        
        // Large doors
        const doorGeo = new THREE.BoxGeometry(2, 2.5, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.25, 2.6);
        group.add(door);
        
        return group;
    }

    /**
     * Create a bridge segment
     */
    static createBridgeMesh() {
        const group = new THREE.Group();
        
        // Planks
        const plankGeo = new THREE.BoxGeometry(3, 0.2, 0.5);
        const plankMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        for (let i = 0; i < 6; i++) {
            const plank = new THREE.Mesh(plankGeo, plankMat);
            plank.position.set(0, 0.5, -1.5 + i * 0.6);
            plank.castShadow = true;
            plank.receiveShadow = true;
            group.add(plank);
        }
        
        // Support beams
        const beamGeo = new THREE.BoxGeometry(0.3, 1, 3);
        const beam1 = new THREE.Mesh(beamGeo, plankMat);
        beam1.position.set(-1.2, 0, 0);
        beam1.castShadow = true;
        group.add(beam1);
        const beam2 = new THREE.Mesh(beamGeo, plankMat);
        beam2.position.set(1.2, 0, 0);
        beam2.castShadow = true;
        group.add(beam2);
        
        // Rope railings
        const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 3, 8);
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        
        [-1.2, 1.2].forEach(x => {
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            rope.position.set(x, 1, 0);
            rope.rotation.x = Math.PI / 2;
            group.add(rope);
        });
        
        return group;
    }

    /**
     * Create a market stall
     */
    static createMarketStallMesh() {
        const group = new THREE.Group();
        
        // Counter
        const counterGeo = new THREE.BoxGeometry(2.5, 1, 1);
        const counterMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const counter = new THREE.Mesh(counterGeo, counterMat);
        counter.position.y = 0.5;
        counter.castShadow = true;
        group.add(counter);
        
        // Posts
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        [-1.2, 1.2].forEach(x => {
            [-0.4, 0.4].forEach(z => {
                const post = new THREE.Mesh(postGeo, postMat);
                post.position.set(x, 2.25, z);
                post.castShadow = true;
                group.add(post);
            });
        });
        
        // Awning
        const awningGeo = new THREE.BoxGeometry(2.8, 0.1, 1.2);
        const awningMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
        const awning = new THREE.Mesh(awningGeo, awningMat);
        awning.position.set(0, 3.5, 0);
        awning.rotation.x = -Math.PI / 8;
        group.add(awning);
        
        // Crates
        const crateGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        
        [-0.8, 0, 0.8].forEach((x, i) => {
            const crate = new THREE.Mesh(crateGeo, crateMat);
            crate.position.set(x, 1.2 + (i % 2) * 0.2, 0);
            crate.castShadow = true;
            group.add(crate);
        });
        
        return group;
    }

    /**
     * Create a fence section
     */
    static createFenceMesh() {
        const group = new THREE.Group();
        
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        
        // Posts
        [-1, 1].forEach(x => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(x, 0.75, 0);
            post.castShadow = true;
            group.add(post);
        });
        
        // Rails
        [0.5, 1].forEach(y => {
            const rail = new THREE.Mesh(railGeo, postMat);
            rail.position.set(0, y, 0);
            rail.rotation.z = Math.PI / 2;
            group.add(rail);
        });
        
        return group;
    }

    /**
     * Create a lighthouse
     */
    static createLighthouseMesh() {
        const group = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 8, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 4;
        base.castShadow = true;
        group.add(base);
        
        // Red stripe
        const stripeGeo = new THREE.CylinderGeometry(1.21, 1.21, 2, 16);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 5;
        group.add(stripe);
        
        // Top chamber
        const chamberGeo = new THREE.CylinderGeometry(1, 1, 1.5, 16);
        const chamberMat = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const chamber = new THREE.Mesh(chamberGeo, chamberMat);
        chamber.position.y = 9;
        group.add(chamber);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(1.2, 1.5, 16);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 10.5;
        roof.castShadow = true;
        group.add(roof);
        
        return group;
    }

    /**
     * Get all building types
     */
    static getAllTypes() {
        return [
            'house', 'tower', 'castle_wall', 'windmill', 'well',
            'barn', 'bridge', 'market_stall', 'fence', 'lighthouse'
        ];
    }

    /**
     * Get mesh for a building type
     */
    static getMesh(type) {
        switch(type) {
            case 'house': return this.createHouseMesh();
            case 'tower': return this.createTowerMesh();
            case 'castle_wall': return this.createCastleWallMesh();
            case 'windmill': return this.createWindmillMesh();
            case 'well': return this.createWellMesh();
            case 'barn': return this.createBarnMesh();
            case 'bridge': return this.createBridgeMesh();
            case 'market_stall': return this.createMarketStallMesh();
            case 'fence': return this.createFenceMesh();
            case 'lighthouse': return this.createLighthouseMesh();
            default:
                // Fallback: simple cube
                const group = new THREE.Group();
                const geo = new THREE.BoxGeometry(2, 2, 2);
                const mat = new THREE.MeshStandardMaterial({ color: 0x808080 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = 1;
                mesh.castShadow = true;
                group.add(mesh);
                return group;
        }
    }
}
