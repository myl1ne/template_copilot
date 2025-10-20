import * as THREE from 'three';

/**
 * EnvironmentFactory - Creates environment objects (trees, rocks, chests, etc.)
 */
export class EnvironmentFactory {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a tree
     */
    createTree(x, z, Item, playerInventory, addMessage) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Leaves
        const leavesGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3.5;
        leaves.castShadow = true;
        tree.add(leaves);
        
        // Add apples (3 apples per tree, randomly positioned on leaves)
        const apples = [];
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
            const radius = 0.8 + Math.random() * 0.4;
            const appleGeo = new THREE.SphereGeometry(0.12, 8, 8);
            const appleMat = new THREE.MeshStandardMaterial({ 
                color: 0xff0000,
                emissive: 0x330000,
                emissiveIntensity: 0.2
            });
            const apple = new THREE.Mesh(appleGeo, appleMat);
            apple.position.set(
                Math.cos(angle) * radius,
                3.2 + Math.random() * 0.6,
                Math.sin(angle) * radius
            );
            apple.castShadow = true;
            apple.visible = true;
            tree.add(apple);
            apples.push(apple);
        }
        
        tree.position.set(x, 0, z);
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
     * Create a rock
     */
    createRock(x, z, scale = 1) {
        const rockGeo = new THREE.DodecahedronGeometry(0.8 * scale, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, 0.4 * scale, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
        
        return {
            type: 'rock',
            position: { x, y: 0, z },
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
