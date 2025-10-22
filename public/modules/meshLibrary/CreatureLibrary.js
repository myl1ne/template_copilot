import * as THREE from 'three';

/**
 * CreatureLibrary - Creature mesh definitions
 * All creatures are built from primitive shapes with detailed features
 * Now with animation support for idle, walk, attack, and attacked states
 */
export class CreatureLibrary {
    /**
     * Create animation functions for a creature
     * @param {THREE.Group} group - The creature group
     * @param {Object} parts - Named parts for animation (body, head, weapon, etc.)
     * @returns {Object} Animation functions
     */
    static createAnimations(group, parts) {
        const animations = {
            time: 0,
            currentState: 'idle',
            
            idle: (delta) => {
                animations.time += delta;
                // Gentle breathing/bobbing
                if (parts.body) {
                    parts.body.position.y = parts.body.userData.originalY + Math.sin(animations.time * 2) * 0.02;
                }
                if (parts.head) {
                    parts.head.position.y = parts.head.userData.originalY + Math.sin(animations.time * 2) * 0.03;
                }
            },
            
            walk: (delta) => {
                animations.time += delta;
                // Walking bob and sway
                if (parts.body) {
                    parts.body.position.y = parts.body.userData.originalY + Math.abs(Math.sin(animations.time * 4)) * 0.1;
                    parts.body.rotation.z = Math.sin(animations.time * 4) * 0.1;
                }
                if (parts.head) {
                    parts.head.rotation.x = Math.sin(animations.time * 4) * 0.05;
                }
                if (parts.weapon) {
                    parts.weapon.rotation.x = Math.sin(animations.time * 4) * 0.2;
                }
            },
            
            attack: (delta) => {
                animations.time += delta;
                const attackCycle = (animations.time * 3) % (Math.PI * 2);
                // Attack swing
                if (parts.weapon) {
                    if (attackCycle < Math.PI) {
                        // Wind up
                        parts.weapon.rotation.x = -attackCycle * 0.5;
                    } else {
                        // Swing down
                        parts.weapon.rotation.x = (attackCycle - Math.PI) * 0.3;
                    }
                }
                if (parts.body) {
                    parts.body.rotation.y = Math.sin(attackCycle) * 0.2;
                }
            },
            
            attacked: (delta) => {
                animations.time += delta;
                // Recoil/hit reaction
                const recoil = Math.max(0, 1 - animations.time * 2);
                if (parts.body) {
                    parts.body.position.z = parts.body.userData.originalZ - recoil * 0.2;
                    parts.body.rotation.x = recoil * 0.3;
                }
                if (parts.head) {
                    parts.head.rotation.x = -recoil * 0.2;
                }
            },
            
            update: (delta) => {
                const stateFn = animations[animations.currentState];
                if (stateFn) {
                    stateFn(delta);
                }
            },
            
            setState: (state) => {
                if (animations[state]) {
                    animations.currentState = state;
                    animations.time = 0;
                }
            }
        };
        
        // Store original positions
        Object.values(parts).forEach(part => {
            if (part && part.position) {
                part.userData.originalY = part.position.y;
                part.userData.originalZ = part.position.z || 0;
            }
        });
        
        group.userData.animations = animations;
        return animations;
    }
    
    /**
     * Create a goblin mesh with animations
     */
    static createGoblinMesh() {
        const group = new THREE.Group();
        
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
        
        // Setup animations
        this.createAnimations(group, { body, head, weapon: club });
        
        return group;
    }
    
    /**
     * Create an orc mesh
     */
    static createOrcMesh() {
        const group = new THREE.Group();
        
        // Body (muscular, dark green)
        const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d4a2e });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);
        
        // Head (large)
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.35);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x2a3d2b });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2;
        head.castShadow = true;
        group.add(head);
        
        // Tusks
        const tuskGeo = new THREE.ConeGeometry(0.05, 0.3, 8);
        const tuskMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftTusk = new THREE.Mesh(tuskGeo, tuskMat);
        leftTusk.position.set(-0.15, 1.85, 0.2);
        leftTusk.rotation.x = Math.PI / 6;
        group.add(leftTusk);
        const rightTusk = new THREE.Mesh(tuskGeo, tuskMat);
        rightTusk.position.set(0.15, 1.85, 0.2);
        rightTusk.rotation.x = Math.PI / 6;
        group.add(rightTusk);
        
        // Axe - create weapon group first
        const weapon = new THREE.Group();
        weapon.position.set(0.5, 1.2, 0);
        
        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.z = Math.PI / 4;
        handle.castShadow = true;
        weapon.add(handle);
        
        const bladeGeo = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.35, 0.6, 0);
        blade.castShadow = true;
        weapon.add(blade);
        
        group.add(weapon);
        
        // Setup animations
        this.createAnimations(group, { body, head, weapon });
        
        return group;
    }
    
    /**
     * Create a spider mesh
     */
    static createSpiderMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.5, 0.4);
        head.castShadow = true;
        group.add(head);
        
        // 8 legs
        const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.5, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(Math.cos(angle) * 0.3, 0.3, Math.sin(angle) * 0.3);
            leg.rotation.z = Math.cos(angle) * 0.8;
            leg.rotation.x = Math.sin(angle) * 0.8;
            group.add(leg);
        }
        
        return group;
    }
    
    /**
     * Create a wolf mesh
     */
    static createWolfMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x505050 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.ConeGeometry(0.25, 0.4, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.9, 0.5);
        head.rotation.x = Math.PI / 2;
        head.castShadow = true;
        group.add(head);
        
        // Ears
        const earGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
        const leftEar = new THREE.Mesh(earGeo, bodyMat);
        leftEar.position.set(-0.15, 1.1, 0.6);
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, bodyMat);
        rightEar.position.set(0.15, 1.1, 0.6);
        group.add(rightEar);
        
        // Tail
        const tailGeo = new THREE.ConeGeometry(0.08, 0.5, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0.8, -0.6);
        tail.rotation.x = -Math.PI / 4;
        group.add(tail);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }
    
    /**
     * Create a bear mesh
     */
    static createBearMesh() {
        const group = new THREE.Group();
        
        // Body (large)
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 1.3, 0.7);
        head.castShadow = true;
        group.add(head);
        
        // Ears
        const earGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const leftEar = new THREE.Mesh(earGeo, bodyMat);
        leftEar.position.set(-0.3, 1.6, 0.7);
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, bodyMat);
        rightEar.position.set(0.3, 1.6, 0.7);
        group.add(rightEar);
        
        // Snout
        const snoutGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8);
        const snout = new THREE.Mesh(snoutGeo, bodyMat);
        snout.position.set(0, 1.2, 1.0);
        snout.rotation.x = Math.PI / 2;
        group.add(snout);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }
    
    /**
     * Create a dragon mesh (boss)
     */
    static createDragonMesh() {
        const group = new THREE.Group();
        
        // Body (large, serpentine)
        const bodyGeo = new THREE.CapsuleGeometry(0.6, 2.0, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, metalness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Head (dragon-like)
        const headGeo = new THREE.ConeGeometry(0.5, 0.8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 2.8, 0);
        head.rotation.x = Math.PI;
        head.castShadow = true;
        group.add(head);
        
        // Horns
        const hornGeo = new THREE.ConeGeometry(0.1, 0.6, 8);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const leftHorn = new THREE.Mesh(hornGeo, hornMat);
        leftHorn.position.set(-0.3, 3.3, 0);
        leftHorn.rotation.z = -Math.PI / 6;
        group.add(leftHorn);
        const rightHorn = new THREE.Mesh(hornGeo, hornMat);
        rightHorn.position.set(0.3, 3.3, 0);
        rightHorn.rotation.z = Math.PI / 6;
        group.add(rightHorn);
        
        // Wings
        const wingGeo = new THREE.ConeGeometry(0.8, 1.5, 3);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x4a0000, side: THREE.DoubleSide });
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.8, 2.0, 0);
        leftWing.rotation.z = -Math.PI / 3;
        leftWing.rotation.y = Math.PI / 4;
        group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.8, 2.0, 0);
        rightWing.rotation.z = Math.PI / 3;
        rightWing.rotation.y = -Math.PI / 4;
        group.add(rightWing);
        
        // Tail
        const tailGeo = new THREE.ConeGeometry(0.3, 1.5, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0.5, 0);
        tail.rotation.x = Math.PI;
        group.add(tail);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a rat mesh (small creature)
     */
    static createRatMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.25;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.3, 0.3);
        head.castShadow = true;
        group.add(head);
        
        // Ears
        const earGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.02, 8);
        const leftEar = new THREE.Mesh(earGeo, bodyMat);
        leftEar.position.set(-0.08, 0.4, 0.35);
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, bodyMat);
        rightEar.position.set(0.08, 0.4, 0.35);
        group.add(rightEar);
        
        // Tail
        const tailGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.4, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0.15, -0.35);
        tail.rotation.x = -Math.PI / 6;
        group.add(tail);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a snake mesh
     */
    static createSnakeMesh() {
        const group = new THREE.Group();
        
        // Body segments
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a5c2a });
        const segmentCount = 8;
        
        for (let i = 0; i < segmentCount; i++) {
            const size = 0.15 - (i * 0.015);
            const segmentGeo = new THREE.SphereGeometry(size, 8, 8);
            const segment = new THREE.Mesh(segmentGeo, bodyMat);
            segment.position.set(0, 0.1, -i * 0.12);
            segment.castShadow = true;
            group.add(segment);
        }
        
        // Head (slightly different)
        const headGeo = new THREE.ConeGeometry(0.18, 0.25, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x1a4d1a });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.1, 0.15);
        head.rotation.x = Math.PI / 2;
        head.castShadow = true;
        group.add(head);
        
        // Setup animations
        this.createAnimations(group, { body: group.children[0], head });
        
        return group;
    }

    /**
     * Create a skeleton mesh (undead)
     */
    static createSkeletonMesh() {
        const group = new THREE.Group();
        
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
        
        // Skull
        const skullGeo = new THREE.SphereGeometry(0.22, 8, 8);
        const skull = new THREE.Mesh(skullGeo, boneMat);
        skull.position.y = 1.6;
        skull.castShadow = true;
        group.add(skull);
        
        // Jaw
        const jawGeo = new THREE.BoxGeometry(0.2, 0.08, 0.15);
        const jaw = new THREE.Mesh(jawGeo, boneMat);
        jaw.position.y = 1.45;
        group.add(jaw);
        
        // Spine
        const spineGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
        const spine = new THREE.Mesh(spineGeo, boneMat);
        spine.position.y = 1.0;
        spine.castShadow = true;
        group.add(spine);
        
        // Ribs
        for (let i = 0; i < 4; i++) {
            const ribGeo = new THREE.TorusGeometry(0.15, 0.02, 4, 8, Math.PI);
            const rib = new THREE.Mesh(ribGeo, boneMat);
            rib.position.y = 1.3 - (i * 0.15);
            rib.rotation.x = Math.PI / 2;
            group.add(rib);
        }
        
        // Pelvis
        const pelvisGeo = new THREE.BoxGeometry(0.3, 0.15, 0.2);
        const pelvis = new THREE.Mesh(pelvisGeo, boneMat);
        pelvis.position.y = 0.5;
        group.add(pelvis);
        
        // Sword
        const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(0.3, 0.8, 0);
        group.add(handle);
        
        const bladeGeo = new THREE.BoxGeometry(0.1, 0.8, 0.02);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.3, 1.2, 0);
        group.add(blade);
        
        // Setup animations
        this.createAnimations(group, { body: spine, head: skull, weapon: blade });
        
        return group;
    }

    /**
     * Create a scorpion mesh
     */
    static createScorpionMesh() {
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.2, 0.6);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.3;
        body.castShadow = true;
        group.add(body);
        
        // Tail segments
        const tailPositions = [
            { y: 0.4, z: -0.4, rot: 0.3 },
            { y: 0.6, z: -0.5, rot: 0.5 },
            { y: 0.8, z: -0.5, rot: 0.7 },
            { y: 1.0, z: -0.4, rot: 0.9 }
        ];
        
        tailPositions.forEach((pos, i) => {
            const segGeo = new THREE.CylinderGeometry(0.08 - i * 0.01, 0.1 - i * 0.01, 0.15, 8);
            const segment = new THREE.Mesh(segGeo, bodyMat);
            segment.position.set(0, pos.y, pos.z);
            segment.rotation.x = pos.rot;
            group.add(segment);
        });
        
        // Stinger
        const stingerGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
        const stingerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const stinger = new THREE.Mesh(stingerGeo, stingerMat);
        stinger.position.set(0, 1.15, -0.35);
        stinger.rotation.x = Math.PI;
        group.add(stinger);
        
        // Claws
        [-0.25, 0.25].forEach(x => {
            const clawGeo = new THREE.CapsuleGeometry(0.06, 0.3, 4, 8);
            const claw = new THREE.Mesh(clawGeo, bodyMat);
            claw.position.set(x, 0.35, 0.4);
            claw.rotation.z = x < 0 ? -Math.PI / 3 : Math.PI / 3;
            group.add(claw);
            
            const pincer1 = new THREE.ConeGeometry(0.08, 0.15, 6);
            const p1 = new THREE.Mesh(pincer1, bodyMat);
            p1.position.set(x + (x < 0 ? -0.15 : 0.15), 0.4, 0.6);
            p1.rotation.z = x < 0 ? Math.PI / 6 : -Math.PI / 6;
            group.add(p1);
        });
        
        // 8 legs
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? -1 : 1;
            const offset = (i % 4) * 0.15;
            const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(side * 0.25, 0.15, 0.2 - offset);
            leg.rotation.z = side * Math.PI / 4;
            group.add(leg);
        }
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a bat mesh (flying creature)
     */
    static createBatMesh() {
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        
        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);
        
        // Ears
        const earGeo = new THREE.ConeGeometry(0.1, 0.25, 4);
        const leftEar = new THREE.Mesh(earGeo, bodyMat);
        leftEar.position.set(-0.12, 2.1, 0);
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, bodyMat);
        rightEar.position.set(0.12, 2.1, 0);
        group.add(rightEar);
        
        // Wings
        const wingGeo = new THREE.ConeGeometry(0.5, 0.8, 3);
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.4, 1.6, 0);
        leftWing.rotation.z = -Math.PI / 2.5;
        leftWing.rotation.y = Math.PI / 6;
        group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.4, 1.6, 0);
        rightWing.rotation.z = Math.PI / 2.5;
        rightWing.rotation.y = -Math.PI / 6;
        group.add(rightWing);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a troll mesh (large humanoid)
     */
    static createTrollMesh() {
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a6b4a });
        
        // Body (massive)
        const bodyGeo = new THREE.CapsuleGeometry(0.6, 1.5, 4, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Belly
        const bellyGeo = new THREE.SphereGeometry(0.7, 8, 8);
        const belly = new THREE.Mesh(bellyGeo, bodyMat);
        belly.position.y = 1.3;
        belly.scale.y = 0.8;
        group.add(belly);
        
        // Head (small relative to body)
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.45);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 2.6;
        head.castShadow = true;
        group.add(head);
        
        // Nose
        const noseGeo = new THREE.ConeGeometry(0.15, 0.25, 8);
        const nose = new THREE.Mesh(noseGeo, bodyMat);
        nose.position.set(0, 2.5, 0.35);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);
        
        // Tree trunk weapon
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 2.0, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(0.7, 1.5, 0);
        trunk.rotation.z = Math.PI / 4;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Setup animations
        this.createAnimations(group, { body, head, weapon: trunk });
        
        return group;
    }

    /**
     * Create a slime mesh (gelatinous creature)
     */
    static createSlimeMesh() {
        const group = new THREE.Group();
        
        // Body (semi-transparent)
        const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x4ade80,
            transparent: true,
            opacity: 0.7,
            metalness: 0.2,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.4;
        body.scale.y = 0.6;
        body.castShadow = true;
        group.add(body);
        
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 0.5, 0.3);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 0.5, 0.3);
        group.add(rightEye);
        
        // Core (visible inside)
        const coreGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const coreMat = new THREE.MeshStandardMaterial({ 
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 0.5
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0.3;
        group.add(core);
        
        // Setup animations (slime bounces and jiggles)
        this.createAnimations(group, { body, core });
        
        return group;
    }

    /**
     * Create a phoenix mesh (mythical fire bird)
     */
    static createPhoenixMesh() {
        const group = new THREE.Group();
        
        const fireMat = new THREE.MeshStandardMaterial({ 
            color: 0xff4500,
            emissive: 0xff4500,
            emissiveIntensity: 0.8
        });
        
        // Body
        const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const body = new THREE.Mesh(bodyGeo, fireMat);
        body.position.y = 1.5;
        body.scale.set(1, 1.2, 0.8);
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeo, fireMat);
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);
        
        // Beak
        const beakGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 1.85, 0.25);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);
        
        // Tail feathers (fire)
        const featherMat = new THREE.MeshStandardMaterial({ 
            color: 0xff6347,
            emissive: 0xff6347,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8
        });
        for (let i = 0; i < 5; i++) {
            const featherGeo = new THREE.ConeGeometry(0.1, 0.8 + i * 0.1, 8);
            const feather = new THREE.Mesh(featherGeo, featherMat);
            feather.position.set((i - 2) * 0.15, 1.2 - i * 0.1, -0.4 - i * 0.1);
            feather.rotation.x = -Math.PI / 4;
            group.add(feather);
        }
        
        // Wings (fire effect)
        const wingGeo = new THREE.ConeGeometry(0.6, 1.2, 3);
        const leftWing = new THREE.Mesh(wingGeo, featherMat);
        leftWing.position.set(-0.5, 1.6, 0);
        leftWing.rotation.z = -Math.PI / 2.5;
        leftWing.rotation.y = Math.PI / 6;
        group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeo, featherMat);
        rightWing.position.set(0.5, 1.6, 0);
        rightWing.rotation.z = Math.PI / 2.5;
        rightWing.rotation.y = -Math.PI / 6;
        group.add(rightWing);
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a unicorn mesh (magical horse)
     */
    static createUnicornMesh() {
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5
        });
        
        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.35, 1.0, 4, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.set(0, 1.5, 0.6);
        neck.rotation.x = Math.PI / 6;
        neck.castShadow = true;
        group.add(neck);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.25, 0.3, 0.4);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 1.85, 0.8);
        head.castShadow = true;
        group.add(head);
        
        // Horn (magical)
        const hornGeo = new THREE.ConeGeometry(0.08, 0.6, 8);
        const hornMat = new THREE.MeshStandardMaterial({ 
            color: 0xffd700,
            metalness: 0.9,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, 2.3, 0.85);
        horn.rotation.x = -Math.PI / 6;
        group.add(horn);
        
        // Mane (rainbow)
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x8b00ff];
        for (let i = 0; i < 6; i++) {
            const maneMat = new THREE.MeshStandardMaterial({ color: colors[i] });
            const maneGeo = new THREE.BoxGeometry(0.1, 0.3, 0.05);
            const mane = new THREE.Mesh(maneGeo, maneMat);
            mane.position.set(0, 1.7 + i * 0.05, 0.5 + i * 0.05);
            group.add(mane);
        }
        
        // Tail (rainbow)
        for (let i = 0; i < 6; i++) {
            const tailMat = new THREE.MeshStandardMaterial({ color: colors[5 - i] });
            const tailGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.4, 8);
            const tail = new THREE.Mesh(tailGeo, tailMat);
            tail.position.set(0, 1.0 - i * 0.05, -0.6 - i * 0.1);
            tail.rotation.x = -Math.PI / 4 - i * 0.1;
            group.add(tail);
        }
        
        // Setup animations
        this.createAnimations(group, { body, head });
        
        return group;
    }

    /**
     * Create a minotaur mesh (bull-headed warrior)
     */
    static createMinotaurMesh() {
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        
        // Body (massive)
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Chest (muscular)
        const chestGeo = new THREE.BoxGeometry(0.8, 0.8, 0.6);
        const chest = new THREE.Mesh(chestGeo, bodyMat);
        chest.position.y = 2.0;
        group.add(chest);
        
        // Bull head
        const headGeo = new THREE.BoxGeometry(0.5, 0.4, 0.6);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 2.7;
        head.castShadow = true;
        group.add(head);
        
        // Snout
        const snoutGeo = new THREE.BoxGeometry(0.3, 0.25, 0.4);
        const snout = new THREE.Mesh(snoutGeo, bodyMat);
        snout.position.set(0, 2.6, 0.5);
        group.add(snout);
        
        // Horns
        const hornGeo = new THREE.ConeGeometry(0.08, 0.5, 8);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftHorn = new THREE.Mesh(hornGeo, hornMat);
        leftHorn.position.set(-0.25, 2.95, 0.1);
        leftHorn.rotation.z = -Math.PI / 4;
        group.add(leftHorn);
        const rightHorn = new THREE.Mesh(hornGeo, hornMat);
        rightHorn.position.set(0.25, 2.95, 0.1);
        rightHorn.rotation.z = Math.PI / 4;
        group.add(rightHorn);
        
        // Axe (large)
        const weapon = new THREE.Group();
        weapon.position.set(0.6, 1.5, 0);
        
        const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.castShadow = true;
        weapon.add(handle);
        
        const bladeGeo = new THREE.BoxGeometry(0.5, 0.6, 0.08);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 0.9;
        blade.castShadow = true;
        weapon.add(blade);
        
        group.add(weapon);
        
        // Setup animations
        this.createAnimations(group, { body, head, weapon });
        
        return group;
    }

    /**
     * Create a fairy mesh (tiny magical being)
     */
    static createFairyMesh() {
        const group = new THREE.Group();
        
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        
        // Body (tiny)
        const bodyGeo = new THREE.CapsuleGeometry(0.1, 0.3, 4, 8);
        const body = new THREE.Mesh(bodyGeo, skinMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 0.75;
        head.castShadow = true;
        group.add(head);
        
        // Hair (colorful)
        const hairMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
        const hairGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.82;
        hair.scale.y = 0.6;
        group.add(hair);
        
        // Wings (butterfly-like)
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.7,
            emissive: 0x87ceeb,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Upper wings
        const upperWingGeo = new THREE.CircleGeometry(0.25, 16);
        const leftUpperWing = new THREE.Mesh(upperWingGeo, wingMat);
        leftUpperWing.position.set(-0.15, 0.6, -0.05);
        leftUpperWing.rotation.y = Math.PI / 4;
        group.add(leftUpperWing);
        const rightUpperWing = new THREE.Mesh(upperWingGeo, wingMat);
        rightUpperWing.position.set(0.15, 0.6, -0.05);
        rightUpperWing.rotation.y = -Math.PI / 4;
        group.add(rightUpperWing);
        
        // Lower wings
        const lowerWingGeo = new THREE.CircleGeometry(0.18, 16);
        const leftLowerWing = new THREE.Mesh(lowerWingGeo, wingMat);
        leftLowerWing.position.set(-0.12, 0.4, -0.08);
        leftLowerWing.rotation.y = Math.PI / 3;
        group.add(leftLowerWing);
        const rightLowerWing = new THREE.Mesh(lowerWingGeo, wingMat);
        rightLowerWing.position.set(0.12, 0.4, -0.08);
        rightLowerWing.rotation.y = -Math.PI / 3;
        group.add(rightLowerWing);
        
        // Magic wand
        const wandGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
        const wandMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const wand = new THREE.Mesh(wandGeo, wandMat);
        wand.position.set(0.15, 0.5, 0);
        wand.rotation.z = Math.PI / 4;
        group.add(wand);
        
        // Star on wand
        const starGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const starMat = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(0.25, 0.65, 0);
        group.add(star);
        
        // Setup animations
        this.createAnimations(group, { body, head, weapon: wand });
        
        return group;
    }

    /**
     * Create an elemental mesh (living energy)
     */
    static createElementalMesh() {
        const group = new THREE.Group();
        
        // Core (glowing energy)
        const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.2;
        core.castShadow = true;
        group.add(core);
        
        // Energy swirls
        const swirlMat = new THREE.MeshStandardMaterial({ 
            color: 0x00bfff,
            emissive: 0x00bfff,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const swirlGeo = new THREE.TorusGeometry(0.2 + i * 0.05, 0.05, 8, 16);
            const swirl = new THREE.Mesh(swirlGeo, swirlMat);
            swirl.position.set(
                Math.cos(angle) * 0.3,
                1.2 + Math.sin(i) * 0.3,
                Math.sin(angle) * 0.3
            );
            swirl.rotation.x = angle;
            swirl.rotation.y = i * 0.5;
            group.add(swirl);
        }
        
        // "Eyes" (bright spots)
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2
        });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 1.3, 0.25);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 1.3, 0.25);
        group.add(rightEye);
        
        // Setup animations
        this.createAnimations(group, { body: core, head: core });
        
        return group;
    }

    /**
     * Get all creature types
     */
    static getAllTypes() {
        return [
            'goblin', 'orc', 'spider', 'wolf', 'bear', 'dragon',
            'rat', 'snake', 'skeleton', 'scorpion', 'bat', 'troll', 'slime',
            'phoenix', 'unicorn', 'minotaur', 'fairy', 'elemental'
        ];
    }

    /**
     * Get mesh for a creature type
     */
    static getMesh(type) {
        switch(type) {
            case 'goblin': return this.createGoblinMesh();
            case 'orc': return this.createOrcMesh();
            case 'spider': return this.createSpiderMesh();
            case 'wolf': return this.createWolfMesh();
            case 'bear': return this.createBearMesh();
            case 'dragon': return this.createDragonMesh();
            case 'rat': return this.createRatMesh();
            case 'snake': return this.createSnakeMesh();
            case 'skeleton': return this.createSkeletonMesh();
            case 'scorpion': return this.createScorpionMesh();
            case 'bat': return this.createBatMesh();
            case 'troll': return this.createTrollMesh();
            case 'slime': return this.createSlimeMesh();
            case 'phoenix': return this.createPhoenixMesh();
            case 'unicorn': return this.createUnicornMesh();
            case 'minotaur': return this.createMinotaurMesh();
            case 'fairy': return this.createFairyMesh();
            case 'elemental': return this.createElementalMesh();
            default:
                // Fallback
                const group = new THREE.Group();
                const geo = new THREE.ConeGeometry(0.5, 1.5, 8);
                const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = 0.75;
                group.add(mesh);
                return group;
        }
    }
}
