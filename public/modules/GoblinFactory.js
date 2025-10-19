import * as THREE from 'three';

/**
 * GoblinFactory - Creates goblin enemies with masks
 */
export class GoblinFactory {
    constructor(scene, loadedModels) {
        this.scene = scene;
        this.loadedModels = loadedModels;
    }

    /**
     * Create a goblin enemy
     */
    createGoblin(x, z, updateQuestProgress) {
        const goblin = new THREE.Group();
        
        // Body (greenish)
        const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        goblin.add(body);
        
        // Head (green)
        const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x3d6e49 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.6;
        head.castShadow = true;
        goblin.add(head);
        
        // Ears (pointy)
        const earGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
        const earMat = new THREE.MeshStandardMaterial({ color: 0x3d6e49 });
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.2, 1.7, 0);
        leftEar.rotation.z = -Math.PI / 4;
        goblin.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.2, 1.7, 0);
        rightEar.rotation.z = Math.PI / 4;
        goblin.add(rightEar);
        
        // Simple weapon (club)
        const clubGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8);
        const clubMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const club = new THREE.Mesh(clubGeo, clubMat);
        club.position.set(0.4, 1, 0);
        club.rotation.z = Math.PI / 6;
        club.castShadow = true;
        goblin.add(club);
        
        goblin.position.set(x, 0, z);
        this.scene.add(goblin);
        
        const spawnPosition = { x, z };
        
        return {
            type: 'goblin',
            position: { x, y: 0, z },
            spawnPosition: spawnPosition,
            mesh: goblin,
            hp: 50,
            maxHp: 50,
            alive: true,
            respawnTime: 30, // seconds
            timeSinceDeath: 0,
            interactable: true,
            lastAttackTime: 0,
            attackCooldown: 2,
            interact: function() {
                if (!this.alive) {
                    return { message: 'The goblin is already defeated!', type: 'info' };
                }
                
                // Player attacks goblin
                const currentTime = Date.now() / 1000;
                if (currentTime - this.lastAttackTime < this.attackCooldown) {
                    return { message: 'Attack on cooldown!', type: 'warning' };
                }
                
                this.lastAttackTime = currentTime;
                const damage = Math.floor(15 + Math.random() * 10);
                this.hp -= damage;
                
                if (this.hp <= 0) {
                    this.alive = false;
                    this.hp = 0;
                    this.timeSinceDeath = 0;
                    this.mesh.visible = false;
                    
                    // Update quest progress
                    if (this.isBoss) {
                        updateQuestProgress('kill_boss', 1);
                    } else {
                        updateQuestProgress('kill_goblins', 1);
                    }
                    
                    return { 
                        message: `Goblin defeated! Dealt ${damage} damage. +50 XP`, 
                        type: 'success' 
                    };
                }
                
                return { 
                    message: `Hit goblin for ${damage} damage! (${this.hp}/${this.maxHp} HP remaining)`, 
                    type: 'warning' 
                };
            }
        };
    }

    /**
     * Create a goblin boss
     */
    createGoblinBoss(x, z, updateQuestProgress) {
        const goblin = new THREE.Group();
        
        // Larger body for boss
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        body.castShadow = true;
        goblin.add(body);
        
        // Larger head
        const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x3a6b1f });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.3;
        head.castShadow = true;
        goblin.add(head);
        
        // Boss crown
        const crownGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 6);
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = 1.6;
        goblin.add(crown);
        
        // Ears
        const earGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMat = new THREE.MeshStandardMaterial({ color: 0x3a6b1f });
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.3, 1.4, 0);
        leftEar.rotation.z = -Math.PI / 4;
        goblin.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.3, 1.4, 0);
        rightEar.rotation.z = Math.PI / 4;
        goblin.add(rightEar);
        
        // Bigger battle axe for boss
        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        
        const axeHeadGeo = new THREE.BoxGeometry(0.6, 0.4, 0.1);
        const axeHeadMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const axeHead = new THREE.Mesh(axeHeadGeo, axeHeadMat);
        axeHead.position.y = 0.7;
        
        const axe = new THREE.Group();
        axe.add(handle);
        axe.add(axeHead);
        axe.position.set(0.4, 0.6, 0);
        axe.rotation.z = Math.PI / 4;
        goblin.add(axe);
        
        goblin.position.set(x, 0, z);
        this.scene.add(goblin);
        
        const spawnPosition = { x, z };
        
        return {
            type: 'goblin boss',
            position: { x, y: 0, z },
            spawnPosition: spawnPosition,
            mesh: goblin,
            hp: 150,
            maxHp: 150,
            alive: true,
            isBoss: true,
            respawnTime: 60,
            timeSinceDeath: 0,
            interactable: true,
            lastAttackTime: 0,
            attackCooldown: 1.5,
            interact: function() {
                if (!this.alive) {
                    return { message: 'The Goblin Chief has been defeated!', type: 'info' };
                }
                
                const currentTime = Date.now() / 1000;
                if (currentTime - this.lastAttackTime < this.attackCooldown) {
                    return { message: 'Attack on cooldown!', type: 'warning' };
                }
                
                this.lastAttackTime = currentTime;
                const damage = Math.floor(15 + Math.random() * 10);
                this.hp -= damage;
                
                if (this.hp <= 0) {
                    this.alive = false;
                    this.hp = 0;
                    this.timeSinceDeath = 0;
                    this.mesh.visible = false;
                    
                    updateQuestProgress('kill_boss', 1);
                    
                    return { 
                        message: `💀 GOBLIN CHIEF DEFEATED! Dealt ${damage} damage. +200 XP`, 
                        type: 'success' 
                    };
                }
                
                return { 
                    message: `⚔️ Hit Goblin Chief for ${damage} damage! (${this.hp}/${this.maxHp} HP remaining)`, 
                    type: 'warning' 
                };
            }
        };
    }

    /**
     * Create a goblin camp with multiple goblins
     */
    createGoblinCamp(centerX, centerZ, createCampfire, updateQuestProgress) {
        const goblins = [];
        const environmentObjects = [];
        
        // Central campfire
        const campfire = createCampfire(centerX, centerZ);
        environmentObjects.push(campfire);
        
        // Goblins around the camp
        const goblinPositions = [
            { x: centerX + 2, z: centerZ },
            { x: centerX - 2, z: centerZ },
            { x: centerX, z: centerZ + 2 },
            { x: centerX, z: centerZ - 2 },
            { x: centerX + 3, z: centerZ + 3 },
        ];
        
        goblinPositions.forEach(pos => {
            const goblin = this.createGoblin(pos.x, pos.z, updateQuestProgress);
            goblins.push(goblin);
            environmentObjects.push(goblin);
        });
        
        // Add Goblin Chief (Boss) in the center
        const goblinBoss = this.createGoblinBoss(centerX, centerZ + 3, updateQuestProgress);
        goblins.push(goblinBoss);
        environmentObjects.push(goblinBoss);
        
        return { goblins, environmentObjects };
    }
}
