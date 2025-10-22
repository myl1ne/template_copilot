import * as THREE from 'three';

/**
 * MeshLibrary - Centralized repository for reusable mesh definitions
 * Stores "mesh as code" definitions for creatures, items, and objects
 */
export class MeshLibrary {
    /**
     * Create a goblin mesh
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
        
        // Axe
        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(0.5, 1.2, 0);
        handle.rotation.z = Math.PI / 4;
        handle.castShadow = true;
        group.add(handle);
        
        const bladeGeo = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.85, 1.8, 0);
        blade.castShadow = true;
        group.add(blade);
        
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
        
        return group;
    }
    
    /**
     * Get mesh for a monster type
     */
    static getMonsterMesh(type) {
        switch(type) {
            case 'goblin':
                return this.createGoblinMesh();
            case 'orc':
                return this.createOrcMesh();
            case 'spider':
                return this.createSpiderMesh();
            case 'wolf':
                return this.createWolfMesh();
            case 'bear':
                return this.createBearMesh();
            case 'dragon':
                return this.createDragonMesh();
            default:
                // Fallback: simple cone
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
