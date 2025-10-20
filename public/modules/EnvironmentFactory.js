import * as THREE from 'three';

/**
 * EnvironmentFactory - Creates environment objects (trees, rocks, chests, etc.)
 */
export class EnvironmentFactory {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a tree with biome-specific variants
     */
    createTree(x, z, Item, playerInventory, addMessage, variant = 'oak', yOffset = 0) {
        const tree = new THREE.Group();
        
        // Biome-specific tree properties
        let trunkColor, leavesColor, leavesShape, trunkHeight, leavesSize;
        
        switch (variant) {
            case 'pine':
                trunkColor = 0x3d2817;
                leavesColor = 0x1a4d2e;
                leavesShape = 'cone';
                trunkHeight = 4;
                leavesSize = 1.2;
                break;
            case 'birch':
                trunkColor = 0xf5f5dc;
                leavesColor = 0x90ee90;
                leavesShape = 'sphere';
                trunkHeight = 3.5;
                leavesSize = 1.3;
                break;
            case 'palm':
                trunkColor = 0x8b7355;
                leavesColor = 0x228b22;
                leavesShape = 'palm';
                trunkHeight = 4;
                leavesSize = 2;
                break;
            case 'dead':
                trunkColor = 0x3d3d3d;
                leavesColor = 0x6b4423;
                leavesShape = 'dead';
                trunkHeight = 2.5;
                leavesSize = 0.8;
                break;
            default: // oak
                trunkColor = 0x4a2511;
                leavesColor = 0x228b22;
                leavesShape = 'sphere';
                trunkHeight = 3;
                leavesSize = 1.5;
        }
        
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: trunkColor });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Leaves - different shapes based on variant
        let leaves;
        if (leavesShape === 'cone') {
            const leavesGeo = new THREE.ConeGeometry(leavesSize, trunkHeight * 0.8, 8);
            const leavesMat = new THREE.MeshStandardMaterial({ color: leavesColor });
            leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = trunkHeight * 0.9;
        } else if (leavesShape === 'palm') {
            // Palm fronds (simplified)
            const leavesGeo = new THREE.CylinderGeometry(0, leavesSize, 0.5, 6);
            const leavesMat = new THREE.MeshStandardMaterial({ color: leavesColor });
            leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = trunkHeight + 0.5;
        } else if (leavesShape === 'dead') {
            // Dead tree - just some sparse branches
            const leavesGeo = new THREE.SphereGeometry(leavesSize, 6, 6);
            const leavesMat = new THREE.MeshStandardMaterial({ 
                color: leavesColor, 
                transparent: true, 
                opacity: 0.6 
            });
            leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = trunkHeight + 0.3;
        } else {
            const leavesGeo = new THREE.SphereGeometry(leavesSize, 8, 8);
            const leavesMat = new THREE.MeshStandardMaterial({ color: leavesColor });
            leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = trunkHeight + leavesSize * 0.5;
        }
        
        leaves.castShadow = true;
        tree.add(leaves);
        
        // Add apples (3 apples per tree) positioned on the outer surface of the leaves
        const apples = [];
        const leavesRadius = 1.5; // matches leavesGeo
        const appleRadius = 0.2;
        const surfaceOffset = -0.1; // tiny gap so apples sit outside foliage
        for (let i = 0; i < 3; i++) {
            // Random spherical direction biased to appear on upper hemisphere
            const theta = Math.random() * Math.PI * 2; // azimuth
            const phi = Math.random() * Math.PI * 0.8; // polar, limit to upper area (0..0.8PI)
            const dir = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
            ).normalize();

            const appleGeo = new THREE.SphereGeometry(appleRadius, 16, 16);
            const appleMat = new THREE.MeshStandardMaterial({ 
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.4,
                roughness: 0.6,
                metalness: 0.1
            });
            const apple = new THREE.Mesh(appleGeo, appleMat);

            // Position apple at leaves center + direction * (leafRadius + appleRadius + offset)
            const distanceFromCenter = leavesRadius + appleRadius + surfaceOffset;
            apple.position.copy(leaves.position).addScaledVector(dir, distanceFromCenter);

            apple.castShadow = true;
            apple.receiveShadow = true;
            apple.visible = true;
            tree.add(apple);
            apples.push(apple);
        }
        
        tree.position.set(x, yOffset, z);
        this.scene.add(tree);
        
        return {
            type: 'tree',
            position: { x, y: 0, z },
            mesh: tree,
            apples: apples,
            applesAvailable: 3,
            nextAppleRespawn: null,
            interactable: true,
            interact: function() {
                if (this.applesAvailable > 0) {
                    // Find first visible apple
                    for (let i = 0; i < this.apples.length; i++) {
                        if (this.apples[i].visible) {
                            this.apples[i].visible = false;
                            this.applesAvailable--;
                            
                            // Add apple to inventory
                            if (Item && playerInventory) {
                                const appleItem = new Item('apple', 'Apple', '🍎', 'consumable', 10, { healing: 15 });
                                playerInventory.addItem(appleItem);
                            }
                            
                            // Schedule respawn (30 seconds)
                            const appleIndex = i;
                            setTimeout(() => {
                                this.apples[appleIndex].visible = true;
                                this.applesAvailable++;
                                if (addMessage) {
                                    addMessage('An apple has grown back on the tree', 'info');
                                }
                            }, 30000);
                            
                            return { message: 'You harvested an apple! 🍎', type: 'success' };
                        }
                    }
                } else {
                    return { message: 'No apples available. Wait for them to grow back.', type: 'info' };
                }
            }
        };
    }

    /**
     * Create a rock with biome-specific variants
     */
    createRock(x, z, scale = 1, variant = 'normal', yOffset = 0) {
        // Biome-specific rock properties
        let rockColor, roughness;
        
        switch (variant) {
            case 'sandstone':
                rockColor = 0xdaa520;
                roughness = 0.85;
                break;
            case 'granite':
                rockColor = 0x4a4a4a;
                roughness = 0.95;
                break;
            case 'ice':
                rockColor = 0xb0e0e6;
                roughness = 0.1;
                break;
            case 'mossy':
                rockColor = 0x556b2f;
                roughness = 0.9;
                break;
            case 'smooth':
                rockColor = 0xa9a9a9;
                roughness = 0.7;
                break;
            default: // normal
                rockColor = 0x808080;
                roughness = 0.9;
        }
        
        const rockGeo = new THREE.DodecahedronGeometry(0.8 * scale, 0);
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: rockColor, 
            roughness: roughness,
            metalness: variant === 'ice' ? 0.3 : 0.0
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, yOffset + 0.4 * scale, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
        
        return {
            type: 'rock',
            variant: variant,
            position: { x, y: yOffset, z },
            mesh: rock,
            interactable: false
        };
    }

    /**
     * Create a chest
     */
    createChest(x, z, Item, playerInventory, updateInventoryUI) {
        const chest = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.BoxGeometry(1, 0.6, 0.7);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.3;
        base.castShadow = true;
        chest.add(base);
        
        // Lid
        const lidGeo = new THREE.BoxGeometry(1.1, 0.2, 0.75);
        const lidMat = new THREE.MeshStandardMaterial({ color: 0xA0522D });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.7;
        lid.castShadow = true;
        chest.add(lid);
        
        // Lock
        const lockGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const lockMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8 });
        const lock = new THREE.Mesh(lockGeo, lockMat);
        lock.position.set(0, 0.3, 0.36);
        lock.castShadow = true;
        chest.add(lock);
        
        chest.position.set(x, 0.2, z);
        this.scene.add(chest);
        
        return {
            type: 'chest',
            position: { x, y: 0.2, z },
            mesh: chest,
            interactable: true,
            opened: false,
            interact: function() {
                if (!this.opened) {
                    this.opened = true;
                    lid.rotation.x = -Math.PI / 3;
                    playerInventory.addGold(100);
                    playerInventory.addItem(new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }));
                    updateInventoryUI();
                    return { message: 'You found 100 gold and a Health Potion!', type: 'success' };
                } else {
                    return { message: 'The chest is empty.', type: 'info' };
                }
            }
        };
    }

    /**
     * Create a campfire
     */
    createCampfire(x, z) {
        const campfire = new THREE.Group();
        
        // Logs arranged in a circle
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
            const logMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
            const log = new THREE.Mesh(logGeo, logMat);
            log.position.set(Math.cos(angle) * 0.3, 0.15, Math.sin(angle) * 0.3);
            log.rotation.z = Math.PI / 2;
            log.rotation.y = angle;
            log.castShadow = true;
            campfire.add(log);
        }
        
        // Fire (glowing sphere)
        const fireGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const fireMat = new THREE.MeshStandardMaterial({
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        fire.position.y = 0.4;
        campfire.add(fire);
        
        // Light
        const fireLight = new THREE.PointLight(0xFF4500, 2, 5);
        fireLight.position.y = 0.4;
        campfire.add(fireLight);
        
        campfire.position.set(x, 0.2, z);
        this.scene.add(campfire);
        
        return {
            type: 'campfire',
            position: { x, y: 0.2, z },
            mesh: campfire,
            fire: fire,
            interactable: true,
            interact: function() {
                return { message: 'You rest by the fire and restore 50 HP', type: 'success', healing: 50 };
            }
        };
    }

    /**
     * Create a house
     */
    createHouse(x, z) {
        const house = new THREE.Group();
        
        // Walls
        const wallsGeo = new THREE.BoxGeometry(4, 3, 4);
        const wallsMat = new THREE.MeshStandardMaterial({ color: 0xD2B48C });
        const walls = new THREE.Mesh(wallsGeo, wallsMat);
        walls.position.y = 1.5;
        walls.castShadow = true;
        walls.receiveShadow = true;
        house.add(walls);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(3.5, 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        house.add(roof);
        
        // Door
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.75, 2.05);
        door.castShadow = true;
        house.add(door);
        
        house.position.set(x, 0, z);
        this.scene.add(house);
        
        return {
            type: 'house',
            position: { x, y: 0, z },
            mesh: house,
            interactable: true,
            interact: function() {
                return { message: 'You enter the cozy house', type: 'info' };
            }
        };
    }

    /**
     * Create a sign
     */
    createSign(x, z, text) {
        const sign = new THREE.Group();
        
        // Post
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.y = 0.75;
        post.castShadow = true;
        sign.add(post);
        
        // Sign board
        const boardGeo = new THREE.BoxGeometry(1.2, 0.6, 0.1);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = 1.5;
        board.castShadow = true;
        sign.add(board);
        
        sign.position.set(x, 0, z);
        this.scene.add(sign);
        
        return {
            type: 'sign',
            position: { x, y: 0, z },
            mesh: sign,
            text: text,
            interactable: true,
            interact: function() {
                return { message: `Sign: "${this.text}"`, type: 'info' };
            }
        };
    }
}
