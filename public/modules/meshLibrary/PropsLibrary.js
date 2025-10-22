import * as THREE from 'three';

/**
 * PropsLibrary - Props, decorations, and interactive objects
 * Furniture, items, vegetation, and environmental details
 */
export class PropsLibrary {
    /**
     * Create a barrel
     */
    static createBarrelMesh() {
        const group = new THREE.Group();
        
        const barrelGeo = new THREE.CylinderGeometry(0.4, 0.35, 0.8, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.y = 0.4;
        barrel.castShadow = true;
        group.add(barrel);
        
        // Metal bands
        const bandGeo = new THREE.TorusGeometry(0.4, 0.03, 8, 16);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.8 });
        
        [0.2, 0.6].forEach(y => {
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.position.y = y;
            band.rotation.x = Math.PI / 2;
            group.add(band);
        });
        
        return group;
    }

    /**
     * Create a crate/box
     */
    static createCrateMesh() {
        const group = new THREE.Group();
        
        const crateGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.position.y = 0.4;
        crate.castShadow = true;
        group.add(crate);
        
        // Cross braces
        const braceGeo = new THREE.BoxGeometry(0.82, 0.06, 0.06);
        const braceMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        const brace1 = new THREE.Mesh(braceGeo, braceMat);
        brace1.position.set(0, 0.4, 0.41);
        group.add(brace1);
        
        const brace2 = new THREE.Mesh(braceGeo, braceMat);
        brace2.position.set(0, 0.4, 0.41);
        brace2.rotation.y = Math.PI / 2;
        group.add(brace2);
        
        return group;
    }

    /**
     * Create a campfire
     */
    static createCampfireMesh() {
        const group = new THREE.Group();
        
        // Stone ring
        const stoneGeo = new THREE.BoxGeometry(0.2, 0.15, 0.3);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(Math.cos(angle) * 0.5, 0.075, Math.sin(angle) * 0.5);
            stone.rotation.y = angle;
            stone.castShadow = true;
            group.add(stone);
        }
        
        // Logs
        const logGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        for (let i = 0; i < 3; i++) {
            const log = new THREE.Mesh(logGeo, logMat);
            log.position.y = 0.2;
            log.rotation.z = Math.PI / 2;
            log.rotation.y = (i / 3) * Math.PI * 2;
            log.castShadow = true;
            group.add(log);
        }
        
        // Fire (emissive pyramid)
        const fireGeo = new THREE.ConeGeometry(0.25, 0.6, 4);
        const fireMat = new THREE.MeshStandardMaterial({ 
            color: 0xff6b00,
            emissive: 0xff6b00,
            emissiveIntensity: 1
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        fire.position.y = 0.5;
        fire.rotation.y = Math.PI / 4;
        group.add(fire);
        
        return group;
    }

    /**
     * Create a torch (wall or ground)
     */
    static createTorchMesh() {
        const group = new THREE.Group();
        
        // Stick
        const stickGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.y = 0.5;
        stick.castShadow = true;
        group.add(stick);
        
        // Flame
        const flameGeo = new THREE.ConeGeometry(0.15, 0.4, 6);
        const flameMat = new THREE.MeshStandardMaterial({ 
            color: 0xffa500,
            emissive: 0xffa500,
            emissiveIntensity: 1
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 1.15;
        group.add(flame);
        
        return group;
    }

    /**
     * Create a signpost
     */
    static createSignpostMesh() {
        const group = new THREE.Group();
        
        // Post
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.y = 1;
        post.castShadow = true;
        group.add(post);
        
        // Sign
        const signGeo = new THREE.BoxGeometry(1.2, 0.4, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.y = 1.7;
        sign.castShadow = true;
        group.add(sign);
        
        return group;
    }

    /**
     * Create a table
     */
    static createTableMesh() {
        const group = new THREE.Group();
        
        // Tabletop
        const topGeo = new THREE.BoxGeometry(2, 0.1, 1);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 0.8;
        top.castShadow = true;
        group.add(top);
        
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        [[-0.8, -0.4], [-0.8, 0.4], [0.8, -0.4], [0.8, 0.4]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x, 0.4, z);
            leg.castShadow = true;
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create a chair
     */
    static createChairMesh() {
        const group = new THREE.Group();
        
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        
        // Seat
        const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
        const seat = new THREE.Mesh(seatGeo, woodMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        group.add(seat);
        
        // Back
        const backGeo = new THREE.BoxGeometry(0.5, 0.6, 0.08);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.set(0, 0.8, -0.21);
        back.castShadow = true;
        group.add(back);
        
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        [[-0.2, -0.2], [-0.2, 0.2], [0.2, -0.2], [0.2, 0.2]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, woodMat);
            leg.position.set(x, 0.25, z);
            leg.castShadow = true;
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create a bed
     */
    static createBedMesh() {
        const group = new THREE.Group();
        
        // Frame
        const frameGeo = new THREE.BoxGeometry(2, 0.3, 1);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 0.3;
        frame.castShadow = true;
        group.add(frame);
        
        // Mattress
        const mattressGeo = new THREE.BoxGeometry(1.9, 0.2, 0.9);
        const mattressMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const mattress = new THREE.Mesh(mattressGeo, mattressMat);
        mattress.position.y = 0.55;
        group.add(mattress);
        
        // Pillow
        const pillowGeo = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        const pillow = new THREE.Mesh(pillowGeo, mattressMat);
        pillow.position.set(0, 0.7, -0.3);
        group.add(pillow);
        
        return group;
    }

    /**
     * Create a bookshelf
     */
    static createBookshelfMesh() {
        const group = new THREE.Group();
        
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        
        // Frame
        const frameGeo = new THREE.BoxGeometry(1.5, 2, 0.4);
        const frame = new THREE.Mesh(frameGeo, woodMat);
        frame.position.y = 1;
        frame.castShadow = true;
        group.add(frame);
        
        // Shelves
        const shelfGeo = new THREE.BoxGeometry(1.4, 0.05, 0.38);
        [0.5, 1.0, 1.5].forEach(y => {
            const shelf = new THREE.Mesh(shelfGeo, woodMat);
            shelf.position.y = y;
            group.add(shelf);
        });
        
        // Books
        const bookMat1 = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
        const bookMat2 = new THREE.MeshStandardMaterial({ color: 0x00008b });
        const bookMat3 = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const bookGeo = new THREE.BoxGeometry(0.08, 0.3, 0.2);
        
        [0.7, 1.2, 1.7].forEach((y, shelfIdx) => {
            for (let i = 0; i < 8; i++) {
                const book = new THREE.Mesh(bookGeo, [bookMat1, bookMat2, bookMat3][i % 3]);
                book.position.set(-0.6 + i * 0.15, y, 0);
                book.rotation.y = (Math.random() - 0.5) * 0.2;
                group.add(book);
            }
        });
        
        return group;
    }

    /**
     * Create a lantern
     */
    static createLanternMesh() {
        const group = new THREE.Group();
        
        // Frame
        const frameGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 6);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.8 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 0.5;
        frame.castShadow = true;
        group.add(frame);
        
        // Glass (emissive)
        const glassGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.35, 6);
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.y = 0.5;
        group.add(glass);
        
        // Top handle
        const handleGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
        const handle = new THREE.Mesh(handleGeo, frameMat);
        handle.position.y = 0.75;
        handle.rotation.x = Math.PI;
        group.add(handle);
        
        return group;
    }

    /**
     * Create a mushroom
     */
    static createMushroomMesh() {
        const group = new THREE.Group();
        
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.3, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.15;
        stem.castShadow = true;
        group.add(stem);
        
        // Cap
        const capGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.35;
        cap.scale.y = 0.6;
        cap.castShadow = true;
        group.add(cap);
        
        // Spots
        const spotGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        
        for (let i = 0; i < 5; i++) {
            const spot = new THREE.Mesh(spotGeo, spotMat);
            const angle = (i / 5) * Math.PI * 2;
            spot.position.set(Math.cos(angle) * 0.12, 0.38, Math.sin(angle) * 0.12);
            group.add(spot);
        }
        
        return group;
    }

    /**
     * Create a crystal/gem
     */
    static createCrystalMesh() {
        const group = new THREE.Group();
        
        const crystalGeo = new THREE.ConeGeometry(0.15, 0.6, 6);
        const crystalMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
            metalness: 0.8,
            roughness: 0.2
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = 0.3;
        crystal.castShadow = true;
        group.add(crystal);
        
        // Base
        const baseGeo = new THREE.ConeGeometry(0.15, 0.1, 6);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.05;
        base.rotation.x = Math.PI;
        group.add(base);
        
        return group;
    }

    /**
     * Create a tombstone
     */
    static createTombstoneMesh() {
        const group = new THREE.Group();
        
        // Stone
        const stoneGeo = new THREE.BoxGeometry(0.6, 1, 0.1);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a });
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        stone.position.y = 0.5;
        stone.castShadow = true;
        group.add(stone);
        
        // Rounded top
        const topGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16, 1, false, 0, Math.PI);
        const top = new THREE.Mesh(topGeo, stoneMat);
        top.position.y = 1.0;
        top.rotation.x = Math.PI / 2;
        top.rotation.z = Math.PI / 2;
        group.add(top);
        
        return group;
    }

    /**
     * Create a cauldron
     */
    static createCauldronMesh() {
        const group = new THREE.Group();
        
        // Pot
        const potGeo = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8 });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.4;
        pot.castShadow = true;
        group.add(pot);
        
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.4, 8);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(legGeo, potMat);
            leg.position.set(Math.cos(angle) * 0.3, 0.2, Math.sin(angle) * 0.3);
            leg.castShadow = true;
            group.add(leg);
        }
        
        // Bubbling liquid
        const liquidGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
        const liquidMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.7
        });
        const liquid = new THREE.Mesh(liquidGeo, liquidMat);
        liquid.position.y = 0.6;
        group.add(liquid);
        
        return group;
    }

    /**
     * Create a weapon rack
     */
    static createWeaponRackMesh() {
        const group = new THREE.Group();
        
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        
        // Frame
        const frameGeo = new THREE.BoxGeometry(1.5, 1.5, 0.2);
        const frame = new THREE.Mesh(frameGeo, woodMat);
        frame.position.y = 0.75;
        frame.castShadow = true;
        group.add(frame);
        
        // Swords
        const swordMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        for (let i = 0; i < 3; i++) {
            // Blade
            const bladeGeo = new THREE.BoxGeometry(0.08, 0.8, 0.02);
            const blade = new THREE.Mesh(bladeGeo, swordMat);
            blade.position.set(-0.5 + i * 0.5, 0.9, 0.12);
            group.add(blade);
            
            // Handle
            const handleGeo = new THREE.BoxGeometry(0.06, 0.2, 0.02);
            const handle = new THREE.Mesh(handleGeo, handleMat);
            handle.position.set(-0.5 + i * 0.5, 0.4, 0.12);
            group.add(handle);
        }
        
        return group;
    }

    /**
     * Create a treasure chest
     */
    static createTreasureChestMesh() {
        const group = new THREE.Group();
        
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
        
        // Base
        const baseGeo = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const base = new THREE.Mesh(baseGeo, woodMat);
        base.position.y = 0.25;
        base.castShadow = true;
        group.add(base);
        
        // Lid
        const lidGeo = new THREE.BoxGeometry(0.85, 0.4, 0.65);
        const lid = new THREE.Mesh(lidGeo, woodMat);
        lid.position.set(0, 0.6, 0);
        lid.rotation.x = -Math.PI / 6;
        lid.castShadow = true;
        group.add(lid);
        
        // Gold bands
        for (let i = 0; i < 3; i++) {
            const bandGeo = new THREE.BoxGeometry(0.9, 0.05, 0.7);
            const band = new THREE.Mesh(bandGeo, goldMat);
            band.position.y = 0.1 + i * 0.2;
            group.add(band);
        }
        
        // Lock
        const lockGeo = new THREE.BoxGeometry(0.15, 0.2, 0.1);
        const lock = new THREE.Mesh(lockGeo, goldMat);
        lock.position.set(0, 0.3, 0.36);
        group.add(lock);
        
        return group;
    }

    /**
     * Create a potion bottle
     */
    static createPotionMesh() {
        const group = new THREE.Group();
        
        // Bottle
        const bottleGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 16);
        const bottleMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
        });
        const bottle = new THREE.Mesh(bottleGeo, bottleMat);
        bottle.position.y = 0.25;
        bottle.castShadow = true;
        group.add(bottle);
        
        // Cork
        const corkGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8);
        const corkMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const cork = new THREE.Mesh(corkGeo, corkMat);
        cork.position.y = 0.55;
        group.add(cork);
        
        // Liquid (glowing)
        const liquidGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.4, 16);
        const liquidMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const liquid = new THREE.Mesh(liquidGeo, liquidMat);
        liquid.position.y = 0.2;
        group.add(liquid);
        
        return group;
    }

    /**
     * Create a magic staff
     */
    static createStaffMesh() {
        const group = new THREE.Group();
        
        // Staff shaft
        const shaftGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.5, 8);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = 0.75;
        shaft.castShadow = true;
        group.add(shaft);
        
        // Crystal orb on top
        const orbGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMat = new THREE.MeshStandardMaterial({ 
            color: 0x9370db,
            emissive: 0x9370db,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.y = 1.6;
        group.add(orb);
        
        // Crystal spikes around orb
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const spikeGeo = new THREE.ConeGeometry(0.03, 0.2, 6);
            const spike = new THREE.Mesh(spikeGeo, orbMat);
            spike.position.set(
                Math.cos(angle) * 0.15,
                1.6,
                Math.sin(angle) * 0.15
            );
            spike.rotation.z = Math.cos(angle) * Math.PI / 2;
            spike.rotation.x = Math.sin(angle) * Math.PI / 2;
            group.add(spike);
        }
        
        return group;
    }

    /**
     * Create a shield
     */
    static createShieldMesh() {
        const group = new THREE.Group();
        
        // Shield face
        const shieldGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16, 1, false, 0, Math.PI * 2);
        const shieldMat = new THREE.MeshStandardMaterial({ color: 0x4169e1, metalness: 0.8 });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.y = 0.6;
        shield.rotation.x = Math.PI / 2;
        shield.castShadow = true;
        group.add(shield);
        
        // Boss (center decoration)
        const bossGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const bossMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
        const boss = new THREE.Mesh(bossGeo, bossMat);
        boss.position.set(0, 0.6, 0.1);
        group.add(boss);
        
        // Rim
        const rimGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 16);
        const rim = new THREE.Mesh(rimGeo, bossMat);
        rim.position.y = 0.6;
        rim.rotation.x = Math.PI / 2;
        group.add(rim);
        
        return group;
    }

    /**
     * Create a flag/banner
     */
    static createFlagMesh() {
        const group = new THREE.Group();
        
        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 1;
        pole.castShadow = true;
        group.add(pole);
        
        // Banner (red)
        const bannerGeo = new THREE.BoxGeometry(0.8, 1, 0.02);
        const bannerMat = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(0.4, 1.5, 0);
        group.add(banner);
        
        // Emblem (gold)
        const emblemGeo = new THREE.BoxGeometry(0.3, 0.3, 0.03);
        const emblemMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const emblem = new THREE.Mesh(emblemGeo, emblemMat);
        emblem.position.set(0.4, 1.5, 0.02);
        group.add(emblem);
        
        return group;
    }

    /**
     * Create a fountain
     */
    static createFountainMesh() {
        const group = new THREE.Group();
        
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
        
        // Base
        const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.y = 0.15;
        base.castShadow = true;
        group.add(base);
        
        // Bowl
        const bowlGeo = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bowl = new THREE.Mesh(bowlGeo, stoneMat);
        bowl.position.y = 0.3;
        bowl.castShadow = true;
        group.add(bowl);
        
        // Central pillar
        const pillarGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const pillar = new THREE.Mesh(pillarGeo, stoneMat);
        pillar.position.y = 0.7;
        group.add(pillar);
        
        // Water (blue, transparent)
        const waterGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16);
        const waterMat = new THREE.MeshStandardMaterial({ 
            color: 0x4169e1,
            transparent: true,
            opacity: 0.6
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = 0.45;
        group.add(water);
        
        // Water spray (top)
        const sprayGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const spray = new THREE.Mesh(sprayGeo, waterMat);
        spray.position.y = 1.15;
        group.add(spray);
        
        return group;
    }

    /**
     * Create a magical portal
     */
    static createPortalMesh() {
        const group = new THREE.Group();
        
        // Portal frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.8 });
        
        // Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8);
        const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
        leftPillar.position.set(-0.8, 1.25, 0);
        leftPillar.castShadow = true;
        group.add(leftPillar);
        const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
        rightPillar.position.set(0.8, 1.25, 0);
        rightPillar.castShadow = true;
        group.add(rightPillar);
        
        // Top arch
        const archGeo = new THREE.TorusGeometry(0.8, 0.15, 8, 16, Math.PI);
        const arch = new THREE.Mesh(archGeo, frameMat);
        arch.position.y = 2.5;
        arch.rotation.z = Math.PI;
        group.add(arch);
        
        // Portal energy (swirling colors)
        const portalGeo = new THREE.PlaneGeometry(1.4, 2.3);
        const portalMat = new THREE.MeshStandardMaterial({ 
            color: 0x9370db,
            emissive: 0x9370db,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeo, portalMat);
        portal.position.y = 1.25;
        group.add(portal);
        
        // Energy particles
        for (let i = 0; i < 10; i++) {
            const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const particleMat = new THREE.MeshStandardMaterial({ 
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1
            });
            const particle = new THREE.Mesh(particleGeo, particleMat);
            particle.position.set(
                (Math.random() - 0.5) * 1.2,
                Math.random() * 2,
                (Math.random() - 0.5) * 0.2
            );
            group.add(particle);
        }
        
        return group;
    }

    /**
     * Create a spellbook
     */
    static createSpellbookMesh() {
        const group = new THREE.Group();
        
        // Book
        const bookGeo = new THREE.BoxGeometry(0.5, 0.08, 0.6);
        const bookMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.y = 0.04;
        book.rotation.y = Math.PI / 6;
        book.castShadow = true;
        group.add(book);
        
        // Cover decoration (gold)
        const decorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.5);
        const decorMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const decor = new THREE.Mesh(decorGeo, decorMat);
        decor.position.set(0, 0.09, 0);
        decor.rotation.y = Math.PI / 6;
        group.add(decor);
        
        // Magical glow
        const glowGeo = new THREE.BoxGeometry(0.45, 0.12, 0.55);
        const glowMat = new THREE.MeshStandardMaterial({ 
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(0, 0.1, 0);
        glow.rotation.y = Math.PI / 6;
        group.add(glow);
        
        return group;
    }

    /**
     * Get all prop types
     */
    static getAllTypes() {
        return [
            'barrel', 'crate', 'campfire', 'torch', 'signpost',
            'table', 'chair', 'bed', 'bookshelf', 'lantern',
            'mushroom', 'crystal', 'tombstone', 'cauldron', 'weapon_rack',
            'treasure_chest', 'potion', 'staff', 'shield', 'flag',
            'fountain', 'portal', 'spellbook'
        ];
    }

    /**
     * Get mesh for a prop type
     */
    static getMesh(type) {
        switch(type) {
            case 'barrel': return this.createBarrelMesh();
            case 'crate': return this.createCrateMesh();
            case 'campfire': return this.createCampfireMesh();
            case 'torch': return this.createTorchMesh();
            case 'signpost': return this.createSignpostMesh();
            case 'table': return this.createTableMesh();
            case 'chair': return this.createChairMesh();
            case 'bed': return this.createBedMesh();
            case 'bookshelf': return this.createBookshelfMesh();
            case 'lantern': return this.createLanternMesh();
            case 'mushroom': return this.createMushroomMesh();
            case 'crystal': return this.createCrystalMesh();
            case 'tombstone': return this.createTombstoneMesh();
            case 'cauldron': return this.createCauldronMesh();
            case 'weapon_rack': return this.createWeaponRackMesh();
            case 'treasure_chest': return this.createTreasureChestMesh();
            case 'potion': return this.createPotionMesh();
            case 'staff': return this.createStaffMesh();
            case 'shield': return this.createShieldMesh();
            case 'flag': return this.createFlagMesh();
            case 'fountain': return this.createFountainMesh();
            case 'portal': return this.createPortalMesh();
            case 'spellbook': return this.createSpellbookMesh();
            default:
                // Fallback: simple sphere
                const group = new THREE.Group();
                const geo = new THREE.SphereGeometry(0.3, 8, 8);
                const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = 0.3;
                mesh.castShadow = true;
                group.add(mesh);
                return group;
        }
    }
}
