import * as THREE from 'three';

/**
 * MonsterFactory - Creates various monster types with consistent patterns
 * Provides factorized monster creation for easier content expansion
 */
export class MonsterFactory {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a generic monster with customizable properties
     * @param {string} type - Monster type identifier
     * @param {object} config - Monster configuration
     * @returns {object} Monster object with mesh and interaction
     */
    createMonster(type, config) {
        const {
            position,
            hp,
            damage,
            xp,
            respawnTime = 30,
            attackCooldown = 2,
            createMeshFn,
            isBoss = false,
            updateQuestProgress,
            stance = 'defensive' // 'flee', 'defensive', 'aggressive'
        } = config;

        const monsterGroup = new THREE.Group();
        
        // Create the monster mesh using the provided function
        createMeshFn(monsterGroup);
        
        monsterGroup.position.set(position.x, 0, position.z);
        this.scene.add(monsterGroup);
        
        const spawnPosition = { x: position.x, z: position.z };
        
        return {
            type: type,
            position: { x: position.x, y: 0, z: position.z },
            spawnPosition: spawnPosition,
            mesh: monsterGroup,
            hp: hp,
            maxHp: hp,
            alive: true,
            isBoss: isBoss,
            respawnTime: respawnTime,
            timeSinceDeath: 0,
            interactable: true,
            lastAttackTime: 0,
            attackCooldown: attackCooldown,
            damage: damage,
            xp: xp,
            stance: stance, // 'flee', 'defensive', 'aggressive'
            aggroRange: 5, // Distance at which aggressive monsters attack
            fleeDistance: 8, // Distance to flee when scared
            isRetreating: false,
            targetPlayer: null,
            interact: function() {
                if (!this.alive) {
                    return { message: `The ${type} is already defeated!`, type: 'info' };
                }
                
                // Player attacks monster
                const currentTime = Date.now() / 1000;
                if (currentTime - this.lastAttackTime < this.attackCooldown) {
                    return { message: 'Attack on cooldown!', type: 'warning' };
                }
                
                this.lastAttackTime = currentTime;
                const playerDamage = Math.floor(damage + Math.random() * 10);
                this.hp -= playerDamage;
                
                // Store reference to this monster for counter-attack
                this.wasAttacked = true;
                
                if (this.hp <= 0) {
                    this.alive = false;
                    this.hp = 0;
                    this.timeSinceDeath = 0;
                    this.mesh.visible = false;
                    
                    // Update quest progress
                    if (updateQuestProgress) {
                        if (this.isBoss) {
                            updateQuestProgress('kill_boss', 1);
                        } else {
                            updateQuestProgress(`kill_${type}`, 1);
                        }
                    }
                    
                    return { 
                        message: `${isBoss ? '💀 BOSS' : ''} ${type.toUpperCase()} DEFEATED! Dealt ${playerDamage} damage. +${xp} XP`, 
                        type: 'success',
                        defeated: true
                    };
                }
                
                return { 
                    message: `⚔️ Hit ${type} for ${playerDamage} damage! (${this.hp}/${this.maxHp} HP remaining)`, 
                    type: 'warning',
                    monsterHit: this
                };
            }
        };
    }

    /**
     * Create a goblin enemy
     */
    createGoblin(x, z, updateQuestProgress) {
        return this.createMonster('goblin', {
            position: { x, z },
            hp: 50,
            damage: 15,
            xp: 50,
            respawnTime: 30,
            attackCooldown: 2,
            stance: 'defensive', // Goblins fight back when attacked
            updateQuestProgress,
            createMeshFn: (group) => {
                // Body (greenish)
                const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
                const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59 });
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                body.position.y = 0.9;
                body.castShadow = true;
                group.add(body);
                
                // Head (green)
                const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
                const headMat = new THREE.MeshStandardMaterial({ color: 0x3d6e49 });
                const head = new THREE.Mesh(headGeo, headMat);
                head.position.y = 1.6;
                head.castShadow = true;
                group.add(head);
                
                // Ears (pointy)
                const earGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
                const earMat = new THREE.MeshStandardMaterial({ color: 0x3d6e49 });
                const leftEar = new THREE.Mesh(earGeo, earMat);
                leftEar.position.set(-0.2, 1.7, 0);
                leftEar.rotation.z = -Math.PI / 4;
                group.add(leftEar);
                const rightEar = new THREE.Mesh(earGeo, earMat);
                rightEar.position.set(0.2, 1.7, 0);
                rightEar.rotation.z = Math.PI / 4;
                group.add(rightEar);
                
                // Simple weapon (club)
                const clubGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8);
                const clubMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
                const club = new THREE.Mesh(clubGeo, clubMat);
                club.position.set(0.4, 1, 0);
                club.rotation.z = Math.PI / 6;
                club.castShadow = true;
                group.add(club);
            }
        });
    }

    /**
     * Create a skeleton enemy
     */
    createSkeleton(x, z, updateQuestProgress) {
        return this.createMonster('skeleton', {
            position: { x, z },
            hp: 60,
            damage: 18,
            xp: 65,
            respawnTime: 35,
            attackCooldown: 1.8,
            stance: 'aggressive', // Skeletons attack when player is too close
            updateQuestProgress,
            createMeshFn: (group) => {
                // Bones color
                const boneColor = 0xf5f5dc;
                
                // Ribcage/body
                const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8);
                const bodyMat = new THREE.MeshStandardMaterial({ color: boneColor });
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                body.position.y = 0.8;
                body.castShadow = true;
                group.add(body);
                
                // Skull
                const skullGeo = new THREE.SphereGeometry(0.28, 16, 16);
                const skullMat = new THREE.MeshStandardMaterial({ color: boneColor });
                const skull = new THREE.Mesh(skullGeo, skullMat);
                skull.position.y = 1.6;
                skull.scale.set(1, 1.1, 1);
                skull.castShadow = true;
                group.add(skull);
                
                // Eye sockets (glowing)
                const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
                const eyeMat = new THREE.MeshStandardMaterial({ 
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 0.8
                });
                const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
                leftEye.position.set(-0.12, 1.65, 0.2);
                group.add(leftEye);
                const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
                rightEye.position.set(0.12, 1.65, 0.2);
                group.add(rightEye);
                
                // Rusty sword
                const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
                const handle = new THREE.Mesh(handleGeo, handleMat);
                
                const bladeGeo = new THREE.BoxGeometry(0.08, 0.5, 0.15);
                const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, metalness: 0.6 });
                const blade = new THREE.Mesh(bladeGeo, bladeMat);
                blade.position.y = 0.5;
                
                const sword = new THREE.Group();
                sword.add(handle);
                sword.add(blade);
                sword.position.set(0.35, 1, 0);
                sword.rotation.z = Math.PI / 4;
                sword.castShadow = true;
                group.add(sword);
            }
        });
    }

    /**
     * Create a spider enemy
     */
    createSpider(x, z, updateQuestProgress) {
        return this.createMonster('spider', {
            position: { x, z },
            hp: 40,
            damage: 12,
            xp: 45,
            respawnTime: 25,
            attackCooldown: 1.5,
            stance: 'flee', // Spiders flee when attacked
            updateQuestProgress,
            createMeshFn: (group) => {
                // Body (dark gray/black)
                const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
                const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                body.position.y = 0.4;
                body.scale.set(1, 0.7, 1.2);
                body.castShadow = true;
                group.add(body);
                
                // Head
                const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
                const headMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });
                const head = new THREE.Mesh(headGeo, headMat);
                head.position.set(0, 0.4, 0.35);
                head.castShadow = true;
                group.add(head);
                
                // Eyes (red glowing)
                const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
                const eyeMat = new THREE.MeshStandardMaterial({ 
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 0.6
                });
                for (let i = 0; i < 4; i++) {
                    const eye = new THREE.Mesh(eyeGeo, eyeMat);
                    const xPos = i < 2 ? -0.08 : 0.08;
                    const yPos = 0.45 + (i % 2) * 0.08;
                    eye.position.set(xPos, yPos, 0.5);
                    group.add(eye);
                }
                
                // Legs (8 legs)
                const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.5, 8);
                const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
                for (let i = 0; i < 8; i++) {
                    const leg = new THREE.Mesh(legGeo, legMat);
                    const angle = (i / 8) * Math.PI * 2;
                    const side = i < 4 ? 1 : -1;
                    leg.position.set(
                        Math.cos(angle) * 0.25,
                        0.15,
                        Math.sin(angle) * 0.3
                    );
                    leg.rotation.z = side * Math.PI / 3;
                    leg.castShadow = true;
                    group.add(leg);
                }
            }
        });
    }

    /**
     * Create a wolf enemy
     */
    createWolf(x, z, updateQuestProgress) {
        return this.createMonster('wolf', {
            position: { x, z },
            hp: 70,
            damage: 20,
            xp: 75,
            respawnTime: 40,
            attackCooldown: 1.6,
            stance: 'aggressive', // Wolves are aggressive
            updateQuestProgress,
            createMeshFn: (group) => {
                // Body (gray fur)
                const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8);
                const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a5568 });
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                body.position.y = 0.5;
                body.rotation.z = Math.PI / 2;
                body.castShadow = true;
                group.add(body);
                
                // Head
                const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
                const headMat = new THREE.MeshStandardMaterial({ color: 0x3a4556 });
                const head = new THREE.Mesh(headGeo, headMat);
                head.position.set(0, 0.6, 0.5);
                head.castShadow = true;
                group.add(head);
                
                // Snout
                const snoutGeo = new THREE.BoxGeometry(0.2, 0.15, 0.25);
                const snoutMat = new THREE.MeshStandardMaterial({ color: 0x2d3748 });
                const snout = new THREE.Mesh(snoutGeo, snoutMat);
                snout.position.set(0, 0.55, 0.75);
                group.add(snout);
                
                // Ears
                const earGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
                const earMat = new THREE.MeshStandardMaterial({ color: 0x3a4556 });
                const leftEar = new THREE.Mesh(earGeo, earMat);
                leftEar.position.set(-0.15, 0.75, 0.4);
                group.add(leftEar);
                const rightEar = new THREE.Mesh(earGeo, earMat);
                rightEar.position.set(0.15, 0.75, 0.4);
                group.add(rightEar);
                
                // Eyes (yellow glowing)
                const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
                const eyeMat = new THREE.MeshStandardMaterial({ 
                    color: 0xffff00,
                    emissive: 0xffff00,
                    emissiveIntensity: 0.5
                });
                const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
                leftEye.position.set(-0.1, 0.65, 0.65);
                group.add(leftEye);
                const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
                rightEye.position.set(0.1, 0.65, 0.65);
                group.add(rightEye);
                
                // Legs
                const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.5, 8);
                const legMat = new THREE.MeshStandardMaterial({ color: 0x3a4556 });
                const legPositions = [
                    { x: -0.2, z: 0.3 },
                    { x: 0.2, z: 0.3 },
                    { x: -0.2, z: -0.3 },
                    { x: 0.2, z: -0.3 }
                ];
                legPositions.forEach(pos => {
                    const leg = new THREE.Mesh(legGeo, legMat);
                    leg.position.set(pos.x, 0.25, pos.z);
                    leg.castShadow = true;
                    group.add(leg);
                });
                
                // Tail
                const tailGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8);
                const tailMat = new THREE.MeshStandardMaterial({ color: 0x4a5568 });
                const tail = new THREE.Mesh(tailGeo, tailMat);
                tail.position.set(0, 0.6, -0.6);
                tail.rotation.x = Math.PI / 3;
                group.add(tail);
            }
        });
    }

    /**
     * Create a boss version of a monster
     */
    createBoss(monsterType, x, z, updateQuestProgress) {
        let config;
        
        switch (monsterType) {
            case 'goblin':
                config = {
                    position: { x, z },
                    hp: 150,
                    damage: 25,
                    xp: 200,
                    respawnTime: 60,
                    attackCooldown: 1.5,
                    isBoss: true,
                    stance: 'aggressive', // Bosses are always aggressive
                    updateQuestProgress,
                    createMeshFn: (group) => {
                        // Larger body for boss
                        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 8);
                        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.8 });
                        const body = new THREE.Mesh(bodyGeo, bodyMat);
                        body.position.y = 0.6;
                        body.castShadow = true;
                        group.add(body);
                        
                        // Larger head
                        const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
                        const headMat = new THREE.MeshStandardMaterial({ color: 0x3a6b1f });
                        const head = new THREE.Mesh(headGeo, headMat);
                        head.position.y = 1.3;
                        head.castShadow = true;
                        group.add(head);
                        
                        // Boss crown
                        const crownGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 6);
                        const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7 });
                        const crown = new THREE.Mesh(crownGeo, crownMat);
                        crown.position.y = 1.6;
                        group.add(crown);
                        
                        // Ears
                        const earGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
                        const earMat = new THREE.MeshStandardMaterial({ color: 0x3a6b1f });
                        const leftEar = new THREE.Mesh(earGeo, earMat);
                        leftEar.position.set(-0.3, 1.4, 0);
                        leftEar.rotation.z = -Math.PI / 4;
                        group.add(leftEar);
                        
                        const rightEar = new THREE.Mesh(earGeo, earMat);
                        rightEar.position.set(0.3, 1.4, 0);
                        rightEar.rotation.z = Math.PI / 4;
                        group.add(rightEar);
                        
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
                        group.add(axe);
                    }
                };
                return this.createMonster('goblin chief', config);
            
            case 'skeleton':
                config = {
                    position: { x, z },
                    hp: 180,
                    damage: 30,
                    xp: 250,
                    respawnTime: 60,
                    attackCooldown: 1.4,
                    isBoss: true,
                    stance: 'aggressive',
                    updateQuestProgress,
                    createMeshFn: (group) => {
                        // Larger bones
                        const boneColor = 0xf5f5dc;
                        
                        // Larger ribcage
                        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8);
                        const bodyMat = new THREE.MeshStandardMaterial({ color: boneColor });
                        const body = new THREE.Mesh(bodyGeo, bodyMat);
                        body.position.y = 1.0;
                        body.castShadow = true;
                        group.add(body);
                        
                        // Larger skull
                        const skullGeo = new THREE.SphereGeometry(0.4, 16, 16);
                        const skullMat = new THREE.MeshStandardMaterial({ color: boneColor });
                        const skull = new THREE.Mesh(skullGeo, skullMat);
                        skull.position.y = 2.0;
                        skull.scale.set(1, 1.1, 1);
                        skull.castShadow = true;
                        group.add(skull);
                        
                        // Crown
                        const crownGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.25, 6);
                        const crownMat = new THREE.MeshStandardMaterial({ color: 0x4B0082, metalness: 0.8 });
                        const crown = new THREE.Mesh(crownGeo, crownMat);
                        crown.position.y = 2.4;
                        group.add(crown);
                        
                        // Glowing purple eyes
                        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
                        const eyeMat = new THREE.MeshStandardMaterial({ 
                            color: 0x8b00ff,
                            emissive: 0x8b00ff,
                            emissiveIntensity: 1.0
                        });
                        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
                        leftEye.position.set(-0.15, 2.05, 0.3);
                        group.add(leftEye);
                        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
                        rightEye.position.set(0.15, 2.05, 0.3);
                        group.add(rightEye);
                        
                        // Large enchanted sword
                        const handleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8);
                        const handleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
                        const handle = new THREE.Mesh(handleGeo, handleMat);
                        
                        const bladeGeo = new THREE.BoxGeometry(0.12, 0.8, 0.2);
                        const bladeMat = new THREE.MeshStandardMaterial({ 
                            color: 0x4b0082,
                            emissive: 0x4b0082,
                            emissiveIntensity: 0.3,
                            metalness: 0.9
                        });
                        const blade = new THREE.Mesh(bladeGeo, bladeMat);
                        blade.position.y = 0.7;
                        
                        const sword = new THREE.Group();
                        sword.add(handle);
                        sword.add(blade);
                        sword.position.set(0.45, 1.2, 0);
                        sword.rotation.z = Math.PI / 4;
                        sword.castShadow = true;
                        group.add(sword);
                    }
                };
                return this.createMonster('skeleton lord', config);
            
            case 'wolf':
                config = {
                    position: { x, z },
                    hp: 200,
                    damage: 35,
                    xp: 300,
                    respawnTime: 60,
                    attackCooldown: 1.3,
                    isBoss: true,
                    stance: 'aggressive',
                    updateQuestProgress,
                    createMeshFn: (group) => {
                        // Larger body
                        const bodyGeo = new THREE.CapsuleGeometry(0.35, 1.2, 4, 8);
                        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
                        const body = new THREE.Mesh(bodyGeo, bodyMat);
                        body.position.y = 0.7;
                        body.rotation.z = Math.PI / 2;
                        body.castShadow = true;
                        group.add(body);
                        
                        // Larger head
                        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.5);
                        const headMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });
                        const head = new THREE.Mesh(headGeo, headMat);
                        head.position.set(0, 0.8, 0.7);
                        head.castShadow = true;
                        group.add(head);
                        
                        // Snout with fangs
                        const snoutGeo = new THREE.BoxGeometry(0.25, 0.2, 0.3);
                        const snoutMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
                        const snout = new THREE.Mesh(snoutGeo, snoutMat);
                        snout.position.set(0, 0.75, 1.0);
                        group.add(snout);
                        
                        // Glowing red eyes
                        const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
                        const eyeMat = new THREE.MeshStandardMaterial({ 
                            color: 0xff0000,
                            emissive: 0xff0000,
                            emissiveIntensity: 0.9
                        });
                        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
                        leftEye.position.set(-0.12, 0.85, 0.85);
                        group.add(leftEye);
                        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
                        rightEye.position.set(0.12, 0.85, 0.85);
                        group.add(rightEye);
                        
                        // Larger ears
                        const earGeo = new THREE.ConeGeometry(0.15, 0.3, 4);
                        const earMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });
                        const leftEar = new THREE.Mesh(earGeo, earMat);
                        leftEar.position.set(-0.2, 1.05, 0.6);
                        group.add(leftEar);
                        const rightEar = new THREE.Mesh(earGeo, earMat);
                        rightEar.position.set(0.2, 1.05, 0.6);
                        group.add(rightEar);
                        
                        // Stronger legs
                        const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.7, 8);
                        const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
                        const legPositions = [
                            { x: -0.25, z: 0.4 },
                            { x: 0.25, z: 0.4 },
                            { x: -0.25, z: -0.4 },
                            { x: 0.25, z: -0.4 }
                        ];
                        legPositions.forEach(pos => {
                            const leg = new THREE.Mesh(legGeo, legMat);
                            leg.position.set(pos.x, 0.35, pos.z);
                            leg.castShadow = true;
                            group.add(leg);
                        });
                        
                        // Spiked collar
                        const collarGeo = new THREE.TorusGeometry(0.25, 0.05, 8, 16);
                        const collarMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, metalness: 0.6 });
                        const collar = new THREE.Mesh(collarGeo, collarMat);
                        collar.position.set(0, 0.7, 0.5);
                        collar.rotation.x = Math.PI / 2;
                        group.add(collar);
                    }
                };
                return this.createMonster('dire wolf', config);
            
            default:
                return null;
        }
    }
}
