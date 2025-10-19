import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// WoW-style Camera Controls
let cameraDistance = 8;
let cameraHeight = 3;
let cameraAngleH = 0; // Horizontal rotation (around character)
let cameraAngleV = 0.3; // Vertical angle (up/down)
let isRightMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Mouse controls for camera
renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Right mouse button
        isRightMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        renderer.domElement.style.cursor = 'grabbing';
    }
});

renderer.domElement.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
        isRightMouseDown = false;
        renderer.domElement.style.cursor = 'default';
    }
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (isRightMouseDown) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        cameraAngleH -= deltaX * 0.005;
        cameraAngleV = Math.max(-0.5, Math.min(1.4, cameraAngleV + deltaY * 0.005));
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

// Mouse wheel for zoom
renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    cameraDistance = Math.max(3, Math.min(20, cameraDistance + e.deltaY * 0.01));
});

// Prevent context menu
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(50, 50, 50);
sunLight.castShadow = true;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Ground - larger terrain
const groundSize = 100;
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a7d44,
    roughness: 0.8,
    metalness: 0.2
});

// Add some terrain variation
const positions = groundGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const height = Math.sin(x * 0.1) * 0.5 + Math.cos(y * 0.1) * 0.5;
    positions.setZ(i, height);
}
positions.needsUpdate = true;
groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(groundSize, 50, 0x000000, 0x000000);
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Player character
const characterGroup = new THREE.Group();
characterGroup.position.set(0, 0, 0);

// Body
const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.7,
    metalness: 0.3
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1.3;
body.castShadow = true;
characterGroup.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.8,
    metalness: 0.1
});
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 2.3;
head.castShadow = true;
characterGroup.add(head);

// Helmet
const helmetGeometry = new THREE.ConeGeometry(0.35, 0.4, 8);
const helmetMaterial = new THREE.MeshStandardMaterial({
    color: 0x757575,
    roughness: 0.4,
    metalness: 0.8
});
const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
helmet.position.y = 2.6;
helmet.castShadow = true;
characterGroup.add(helmet);

// Shield
const shieldGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
const shieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.5,
    metalness: 0.6,
    emissive: 0x22c55e,
    emissiveIntensity: 0.2
});
const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
shield.position.set(-0.7, 1.3, 0);
shield.rotation.z = Math.PI / 2;
shield.castShadow = true;
characterGroup.add(shield);

// Sword
const swordGroup = new THREE.Group();
const bladeGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.05);
const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 0.9,
    emissive: 0x60a5fa,
    emissiveIntensity: 0.3
});
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 0.6;
blade.castShadow = true;
swordGroup.add(blade);

const hiltGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
const hiltMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.4
});
const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
hilt.castShadow = true;
swordGroup.add(hilt);

swordGroup.position.set(0.7, 1.3, 0);
swordGroup.rotation.z = -Math.PI / 4;
characterGroup.add(swordGroup);

scene.add(characterGroup);

// Environment objects
const environmentObjects = [];

// NPCs array needs to be available before functions like `animate` run
// to avoid temporal-dead-zone ReferenceErrors when code iterates `npcs`.
const npcs = [];

// Models and animations storage (initialized early to avoid TDZ when
// functions like createGoblin reference loadedModels before loader code runs)
const loadedModels = {};
const loadedAnimations = {};

// Utility: pick the single largest mesh/skinnedMesh under an object and return its
// world-space bounding box and size. This avoids helpers or non-mesh nodes inflating
// the combined bounds.
function getLargestMeshBBox(root) {
    root.updateMatrixWorld(true);
    let largest = null;
    const tmpBox = new THREE.Box3();
    root.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
            const geom = child.geometry;
            if (!geom) return;
            if (!geom.boundingBox) geom.computeBoundingBox();
            tmpBox.copy(geom.boundingBox).applyMatrix4(child.matrixWorld);
            const size = new THREE.Vector3();
            tmpBox.getSize(size);
            const vol = size.x * size.y * size.z;
            if (!largest || vol > largest.vol) {
                largest = { box: tmpBox.clone(), size: size.clone(), mesh: child, vol };
            }
        }
    });
    if (largest) return { bbox: largest.box, size: largest.size, mesh: largest.mesh };
    // fallback to whole-object box
    const fallback = new THREE.Box3().setFromObject(root);
    const fsize = new THREE.Vector3();
    fallback.getSize(fsize);
    return { bbox: fallback, size: fsize, mesh: null };
}

// Find the child mesh with the largest geometry bounding box (ignores world transforms).
function getLargestGeometryMesh(root) {
    let best = null;
    root.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
            const geom = child.geometry;
            if (!geom) return;
            if (!geom.boundingBox) geom.computeBoundingBox();
            const size = new THREE.Vector3();
            geom.boundingBox.getSize(size);
            const vol = size.x * size.y * size.z;
            if (!best || vol > best.vol) {
                best = { mesh: child, geomBox: geom.boundingBox.clone(), size: size.clone(), vol };
            }
        }
    });
    return best; // may be null
}

// Helper function to create a tree
function createTree(x, z) {
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
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    
    return {
        type: 'tree',
        position: { x, y: 0, z },
        mesh: tree,
        interactable: false
    };
}

// Helper function to create a rock
function createRock(x, z, scale = 1) {
    const rockGeo = new THREE.DodecahedronGeometry(0.8 * scale, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, 0.4 * scale, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    
    return {
        type: 'rock',
        position: { x, y: 0, z },
        mesh: rock,
        interactable: false
    };
}

// Helper function to create a chest
function createChest(x, z) {
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
    
    chest.position.set(x, 0, z);
    scene.add(chest);
    
    return {
        type: 'chest',
        position: { x, y: 0, z },
        mesh: chest,
        interactable: true,
        opened: false,
        interact: function() {
            if (!this.opened) {
                this.opened = true;
                lid.rotation.x = -Math.PI / 3;
                // Actually add gold and item to inventory
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

// Helper function to create a MAGICAL chest (something fun!)
function createMagicalChest(x, z) {
    const chest = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.BoxGeometry(0.8, 0.5, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x9333ea, // Purple/magical color
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x9333ea,
        emissiveIntensity: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    base.castShadow = true;
    chest.add(base);
    
    // Magical lid (animated)
    const lidGeo = new THREE.BoxGeometry(0.85, 0.15, 0.65);
    const lidMat = new THREE.MeshStandardMaterial({ 
        color: 0xa855f7, // Lighter purple
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0xa855f7,
        emissiveIntensity: 0.4
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 0.575, -0.3);
    lid.castShadow = true;
    chest.add(lid);
    
    // Magic lock (glowing)
    const lockGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const lockMat = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.8,
        metalness: 0.9
    });
    const lock = new THREE.Mesh(lockGeo, lockMat);
    lock.position.set(0, 0.25, 0.35);
    chest.add(lock);
    
    // Add sparkle particles around chest
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 30;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 1 + Math.random() * 0.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.random() * 2;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    chest.add(particles);
    
    chest.position.set(x, 0, z);
    scene.add(chest);
    
    // Animate particles
    let animationTime = 0;
    const animateParticles = () => {
        animationTime += 0.02;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + animationTime;
            const radius = 1 + Math.sin(animationTime * 2 + i) * 0.3;
            const height = 1 + Math.sin(animationTime * 3 + i * 2) * 0.5;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    };
    
    return {
        type: 'magical_chest',
        position: { x, y: 0, z },
        mesh: chest,
        interactable: true,
        opened: false,
        particles: particles,
        animateParticles: animateParticles,
        interact: function() {
            if (!this.opened) {
                this.opened = true;
                lid.rotation.x = -Math.PI / 3;
                lock.visible = false;
                
                // Random magical loot!
                const lootOptions = [
                    { gold: 250, item: null, message: '✨ You found 250 MAGICAL GOLD! ✨' },
                    { gold: 150, item: new Item('mana_pot', 'Greater Mana Potion', '🔮', 'consumable', 100, { mana: 100 }), message: '✨ You found 150 gold and a Greater Mana Potion! ✨' },
                    { gold: 200, item: new Item('magic_bread', 'Enchanted Bread', '🍞✨', 'consumable', 50, { healing: 100 }), message: '✨ You found 200 gold and Enchanted Bread! ✨' },
                    { gold: 300, item: null, message: '🎰 JACKPOT! You found 300 GOLD! 🎰' },
                ];
                
                const loot = lootOptions[Math.floor(Math.random() * lootOptions.length)];
                
                playerInventory.addGold(loot.gold);
                if (loot.item) {
                    playerInventory.addItem(loot.item);
                }
                updateInventoryUI();
                
                // Stop particle animation
                this.particles.visible = false;
                
                return { message: loot.message, type: 'success' };
            } else {
                return { message: 'The magical chest has been emptied.', type: 'info' };
            }
        }
    };
}

// Helper function to create a campfire
function createCampfire(x, z) {
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
    
    campfire.position.set(x, 0, z);
    scene.add(campfire);
    
    return {
        type: 'campfire',
        position: { x, y: 0, z },
        mesh: campfire,
        fire: fire,
        interactable: true,
        interact: function() {
            return { message: 'You rest by the fire and restore 50 HP', type: 'success', healing: 50 };
        }
    };
}

// Helper function to create a house
function createHouse(x, z) {
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
    scene.add(house);
    
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

// Helper function to create a goblin enemy
function createGoblin(x, z) {
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
    
    // Add mask if available
        const maskTypes = ['fox', 'wolf', 'crocodile', 'colorful', 'baelin'];
    const randomMask = maskTypes[Math.floor(Math.random() * maskTypes.length)];
    if (loadedModels['mask_' + randomMask]) {
        const mask = loadedModels['mask_' + randomMask].clone();
        mask.scale.set(0.0015, 0.0015, 0.0015); // Scale down mask
        mask.position.set(0, 1.6, 0.15); // Position on head
        mask.rotation.y = Math.PI; // Face forward
        mask.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
        goblin.add(mask);
    }
    
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
    scene.add(goblin);
    
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
                // Fade out the goblin
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

// Helper function to create a goblin boss
function createGoblinBoss(x, z) {
    const goblin = new THREE.Group();
    
    // Larger body for boss
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.8 }); // Darker green
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    goblin.add(body);
    
    // Larger head
    const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x3a6b1f }); // Darker green
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    head.castShadow = true;
    goblin.add(head);
    
    // Boss crown
    const crownGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 6);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7 }); // Gold
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
    scene.add(goblin);
    
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
        respawnTime: 60, // Boss takes longer to respawn
        timeSinceDeath: 0,
        interactable: true,
        lastAttackTime: 0,
        attackCooldown: 1.5,
        interact: function() {
            if (!this.alive) {
                return { message: 'The Goblin Chief has been defeated!', type: 'info' };
            }
            
            // Player attacks goblin boss
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
                // Fade out the goblin
                this.mesh.visible = false;
                
                // Update quest progress for boss
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

// Goblin camp location
const goblinCampCenter = { x: -20, z: -20 };
const goblins = [];

// Create goblin camp with multiple goblins
function createGoblinCamp() {
    // Central campfire
    const campfire = createCampfire(goblinCampCenter.x, goblinCampCenter.z);
    environmentObjects.push(campfire);
    
    // Goblins around the camp
    const goblinPositions = [
        { x: -18, z: -20 },
        { x: -22, z: -20 },
        { x: -20, z: -18 },
        { x: -20, z: -22 },
        { x: -17, z: -17 },
    ];
    
    goblinPositions.forEach(pos => {
        const goblin = createGoblin(pos.x, pos.z);
        goblins.push(goblin);
        environmentObjects.push(goblin);
    });
    
    // Add Goblin Chief (Boss) in the center
    const goblinBoss = createGoblinBoss(goblinCampCenter.x, goblinCampCenter.z + 3);
    goblins.push(goblinBoss);
    environmentObjects.push(goblinBoss);
    
    // Camp signs
    const sign1 = createSign(goblinCampCenter.x + 8, goblinCampCenter.z, 'Beware: Goblin Territory!');
    environmentObjects.push(sign1);
}

// Helper function to create a sign
function createSign(x, z, text) {
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
    scene.add(sign);
    
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

// Create environment
// Trees
for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    environmentObjects.push(createTree(x, z));
}

// Rocks
for (let i = 0; i < 15; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    environmentObjects.push(createRock(x, z, 0.8 + Math.random() * 0.6));
}

// Interactable objects
environmentObjects.push(createChest(5, -5));
environmentObjects.push(createChest(-7, 8));
environmentObjects.push(createCampfire(0, -10));
environmentObjects.push(createHouse(15, 0));
environmentObjects.push(createHouse(-15, 5));

// Add magical chest (something fun!) - moved away from NPCs to avoid interaction conflicts
const magicalChest = createMagicalChest(15, -5);
environmentObjects.push(magicalChest);

// Create goblin camp
createGoblinCamp();

// Player state
const player = {
    hp: 150,
    maxHp: 150,
    stamina: 100,
    maxStamina: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    velocity: { x: 0, z: 0 },
    speed: 3,
    runSpeed: 6,
    isRunning: false,
    animationState: 'idle', // idle, walking, running, attacking, resting
    animationTime: 0
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Animation functions
function setAnimation(state) {
    if (player.animationState !== state) {
        player.animationState = state;
        player.animationTime = 0;
        document.getElementById('anim-state').textContent = state.charAt(0).toUpperCase() + state.slice(1);
        showAnimationLabel(state);
    }
}

function showAnimationLabel(state) {
    const label = document.getElementById('animation-state');
    const labels = {
        idle: '💤 Idle',
        walking: '🚶 Walking',
        running: '🏃 Running',
        attacking: '⚔️ Attacking!',
        resting: '😌 Resting...'
    };
    label.textContent = labels[state] || state;
    label.classList.add('show');
    setTimeout(() => label.classList.remove('show'), 1000);
}

function updateAnimation(delta) {
    player.animationTime += delta;
    
    switch (player.animationState) {
        case 'idle':
            // Gentle bobbing
            body.position.y = 1.3 + Math.sin(player.animationTime * 2) * 0.05;
            swordGroup.rotation.z = -Math.PI / 4;
            break;
            
        case 'walking':
            // Walking bob
            body.position.y = 1.3 + Math.abs(Math.sin(player.animationTime * 8)) * 0.1;
            body.rotation.z = Math.sin(player.animationTime * 8) * 0.05;
            swordGroup.rotation.z = -Math.PI / 4 + Math.sin(player.animationTime * 8) * 0.1;
            shield.position.x = -0.7 + Math.sin(player.animationTime * 8) * 0.05;
            break;
            
        case 'running':
            // Faster bob
            body.position.y = 1.3 + Math.abs(Math.sin(player.animationTime * 12)) * 0.15;
            body.rotation.z = Math.sin(player.animationTime * 12) * 0.1;
            swordGroup.rotation.z = -Math.PI / 4 + Math.sin(player.animationTime * 12) * 0.2;
            shield.position.x = -0.7 + Math.sin(player.animationTime * 12) * 0.1;
            break;
            
        case 'attacking':
            // Sword swing
            const attackProgress = Math.min(player.animationTime / 0.5, 1);
            if (attackProgress < 0.5) {
                swordGroup.rotation.z = -Math.PI / 4 - attackProgress * 2 * Math.PI / 2;
            } else {
                swordGroup.rotation.z = -Math.PI / 4 - (1 - attackProgress) * 2 * Math.PI / 2;
            }
            body.rotation.y = Math.sin(attackProgress * Math.PI) * 0.3;
            
            if (attackProgress >= 1) {
                setAnimation('idle');
            }
            break;
            
        case 'resting':
            // Sitting/resting position
            body.position.y = 0.8;
            body.rotation.x = 0.3;
            swordGroup.position.y = 0.8;
            shield.position.y = 0.8;
            
            if (player.animationTime > 2) {
                body.rotation.x = 0;
                swordGroup.position.y = 1.3;
                shield.position.y = 1.3;
                setAnimation('idle');
                player.hp = Math.min(player.maxHp, player.hp + 30);
                addMessage('Rested and recovered 30 HP', 'success');
                updateUI();
            }
            break;
    }
}

// UI functions
function updateUI() {
    const hpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-bar').textContent = Math.round(hpPercent) + '%';
    document.getElementById('hp-text').textContent = `${Math.round(player.hp)} / ${player.maxHp}`;
    
    const staminaPercent = (player.stamina / player.maxStamina) * 100;
    document.getElementById('stamina-bar').style.width = staminaPercent + '%';
    document.getElementById('stamina-bar').textContent = Math.round(staminaPercent) + '%';
    document.getElementById('stamina-text').textContent = `${Math.round(player.stamina)} / ${player.maxStamina}`;
    
    document.getElementById('pos-text').textContent = `${Math.round(player.position.x)}, ${Math.round(player.position.z)}`;
}

function addMessage(text, type = 'info') {
    const messages = document.getElementById('messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    messages.appendChild(message);
    messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
    
    // Keep only last 10 messages
    while (messages.children.length > 10) {
        messages.removeChild(messages.firstChild);
    }
}

// Check for nearby interactable objects
function checkInteractions() {
    let nearestObject = null;
    let nearestDistance = 2.5;
    
    for (const obj of environmentObjects) {
        if (obj.interactable) {
            // Skip inactive objects (dead goblins, opened chests)
            if (obj.type === 'goblin' && !obj.alive) continue;
            if ((obj.type === 'chest' || obj.type === 'magical_chest') && obj.opened) continue;
            
            const dx = obj.position.x - player.position.x;
            const dz = obj.position.z - player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < nearestDistance) {
                nearestObject = obj;
                nearestDistance = distance;
            }
        }
    }
    
    const prompt = document.getElementById('interaction-prompt');
    if (nearestObject) {
        prompt.classList.add('show');
        document.getElementById('interaction-text').textContent = `Press E to interact with ${nearestObject.type}`;
        return nearestObject;
    } else {
        prompt.classList.remove('show');
        return null;
    }
}

// Handle interactions
let nearestInteractable = null;
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && nearestInteractable) {
        const result = nearestInteractable.interact();
        addMessage(result.message, result.type || 'info');
        
        if (result.healing) {
            player.hp = Math.min(player.maxHp, player.hp + result.healing);
            updateUI();
        }
    }
    
    if (e.key === ' ' && player.animationState !== 'attacking') {
        e.preventDefault();
        setAnimation('attacking');
    }
    
    if (e.key.toLowerCase() === 'r' && player.animationState === 'idle') {
        setAnimation('resting');
    }
});

// Update camera to follow player (WoW-style)
function updateCamera() {
    // Calculate camera position based on angles
    const offsetX = Math.sin(cameraAngleH) * Math.cos(cameraAngleV) * cameraDistance;
    const offsetY = Math.sin(cameraAngleV) * cameraDistance + cameraHeight;
    const offsetZ = Math.cos(cameraAngleH) * Math.cos(cameraAngleV) * cameraDistance;
    
    const idealPosition = new THREE.Vector3(
        characterGroup.position.x + offsetX,
        characterGroup.position.y + offsetY,
        characterGroup.position.z + offsetZ
    );
    
    const lookAtPosition = new THREE.Vector3(
        characterGroup.position.x,
        characterGroup.position.y + 1.5,
        characterGroup.position.z
    );
    
    // Smooth camera movement
    camera.position.lerp(idealPosition, 0.1);
    camera.lookAt(lookAtPosition);
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Movement
    if (player.animationState !== 'attacking' && player.animationState !== 'resting') {
        const forward = keys['w'] || keys['arrowup'];
        const backward = keys['s'] || keys['arrowdown'];
        const left = keys['a'] || keys['arrowleft'];
        const right = keys['d'] || keys['arrowright'];
        const running = keys['shift'];
        
        player.isRunning = running && player.stamina > 0;
        const speed = player.isRunning ? player.runSpeed : player.speed;
        
        player.velocity.x = 0;
        player.velocity.z = 0;
        
        // Calculate movement direction relative to camera
        let moveX = 0;
        let moveZ = 0;
        
        if (forward) {
            moveZ -= 1;
        }
        if (backward) {
            moveZ += 1;
        }
        if (left) {
            moveX -= 1;
        }
        if (right) {
            moveX += 1;
        }
        
        const isMoving = forward || backward || left || right;
        
        if (isMoving) {
            // Normalize diagonal movement
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (length > 0) {
                moveX /= length;
                moveZ /= length;
            }
            
            // Apply camera rotation to movement
            const moveAngle = Math.atan2(moveX, moveZ) + cameraAngleH;
            player.velocity.x = Math.sin(moveAngle) * speed * delta;
            player.velocity.z = Math.cos(moveAngle) * speed * delta;
            
            player.position.x += player.velocity.x;
            player.position.z += player.velocity.z;
            
            // Update character rotation to face movement direction
            player.rotation = moveAngle;
            characterGroup.rotation.y = player.rotation;
            
            // Update animation state
            if (player.isRunning) {
                setAnimation('running');
                player.stamina = Math.max(0, player.stamina - 10 * delta);
            } else {
                setAnimation('walking');
                player.stamina = Math.min(player.maxStamina, player.stamina + 5 * delta);
            }
        } else {
            if (player.animationState === 'walking' || player.animationState === 'running') {
                setAnimation('idle');
            }
            player.stamina = Math.min(player.maxStamina, player.stamina + 15 * delta);
        }
        
        characterGroup.position.set(player.position.x, player.position.y, player.position.z);
        updateUI();
    }
    
    // Update animation
    updateAnimation(delta);
    
    // Update NPC animations
    npcs.forEach(npc => {
        if (npc.mixer) {
            npc.mixer.update(delta);
        }
    });
    
    // Check for nearby interactable objects
    nearestInteractable = checkInteractions();
    
    // Animate campfire
    for (const obj of environmentObjects) {
        if (obj.type === 'campfire' && obj.fire) {
            obj.fire.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            obj.fire.scale.x = 1 + Math.cos(Date.now() * 0.005) * 0.2;
        }
    }
    
    // Goblin respawn logic
    for (const goblin of goblins) {
        if (!goblin.alive) {
            goblin.timeSinceDeath += delta;
            
            if (goblin.timeSinceDeath >= goblin.respawnTime) {
                // Respawn goblin
                goblin.hp = goblin.maxHp;
                goblin.alive = true;
                goblin.timeSinceDeath = 0;
                goblin.mesh.visible = true;
                goblin.position.x = goblin.spawnPosition.x;
                goblin.position.z = goblin.spawnPosition.z;
                goblin.mesh.position.set(goblin.spawnPosition.x, 0, goblin.spawnPosition.z);
                addMessage('A goblin has respawned!', 'warning');
            }
        } else {
            // Idle animation for alive goblins
            if (goblin.mesh.visible) {
                goblin.mesh.rotation.y += delta * 0.5;
                goblin.mesh.children[0].position.y = 0.9 + Math.sin(Date.now() * 0.002) * 0.05;
            }
        }
    }
    
    // Animate magical chest particles
    environmentObjects.forEach(obj => {
        if (obj.type === 'magical_chest' && obj.animateParticles && !obj.opened) {
            obj.animateParticles();
        }
    });
    
    updateCamera();
    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate();
updateUI();
addMessage('Explore the world! Use WASD to move, I for inventory', 'info');

console.log('RPG Engine - Full RPG Demo with NPCs & Inventory Loaded');

// ===== INVENTORY & EQUIPMENT SYSTEM =====

// Simple item class for the demo
class Item {
    constructor(id, name, icon, type, value, stats = {}) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type; // weapon, armor, consumable, quest
        this.value = value;
        this.stats = stats;
        this.slot = stats.slot || null;
        this.quantity = 1;
    }
}

// Inventory system
const playerInventory = {
    gold: 100,
    maxSlots: 20,
    items: [],
    equipment: {
        head: null,
        chest: null,
        legs: null,
        weapon: null,
        shield: null
    },
    
    addItem(item) {
        if (this.items.length >= this.maxSlots) {
            addMessage('Inventory full!', 'warning');
            return false;
        }
        this.items.push(item);
        addMessage(`Obtained ${item.icon} ${item.name}`, 'success');
        return true;
    },
    
    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    },
    
    addGold(amount) {
        this.gold += amount;
        addMessage(`+${amount} 💰 gold`, 'success');
    },
    
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
};

// Quest System
const quests = {
    'village_rescue': {
        id: 'village_rescue',
        name: 'The Village Rescue',
        description: 'A goblin camp has been raiding the village. Defeat their leader and return peace to the land.',
        objectives: [
            { id: 'kill_goblins', description: 'Defeat 3 goblin warriors', current: 0, target: 3, completed: false },
            { id: 'kill_boss', description: 'Defeat the Goblin Chief', current: 0, target: 1, completed: false },
            { id: 'return_to_elder', description: 'Return to the Village Elder', current: 0, target: 1, completed: false }
        ],
        rewards: { xp: 500, gold: 100 },
        active: true,
        completed: false
    },
    'merchant_delivery': {
        id: 'merchant_delivery',
        name: 'The Merchant\'s Request',
        description: 'The Traveling Merchant needs someone to deliver a special package to a hermit living deep in the forest.',
        objectives: [
            { id: 'get_package', description: 'Receive the package from the Merchant', current: 0, target: 1, completed: false },
            { id: 'find_hermit', description: 'Find the Hermit in the forest', current: 0, target: 1, completed: false },
            { id: 'deliver_package', description: 'Deliver the package', current: 0, target: 1, completed: false }
        ],
        rewards: { xp: 300, gold: 150 },
        active: false,
        completed: false,
        available: false // Only available after first quest
    }
};

let activeQuest = quests['village_rescue'];

function updateQuestProgress(objectiveId, amount = 1) {
    if (!activeQuest || !activeQuest.active || activeQuest.completed) return;
    
    const objective = activeQuest.objectives.find(obj => obj.id === objectiveId);
    if (objective && !objective.completed) {
        objective.current = Math.min(objective.current + amount, objective.target);
        if (objective.current >= objective.target) {
            objective.completed = true;
            addMessage(`✅ Quest Updated: ${objective.description}`, 'success');
        } else {
            addMessage(`Quest Progress: ${objective.description} (${objective.current}/${objective.target})`, 'info');
        }
        updateQuestUI();
        
        // Check if all objectives are complete
        if (activeQuest.objectives.every(obj => obj.completed)) {
            activeQuest.completed = true;
            playerInventory.addGold(activeQuest.rewards.gold);
            addMessage(`🎉 QUEST COMPLETE! Rewards: ${activeQuest.rewards.xp} XP, ${activeQuest.rewards.gold} Gold`, 'success');
            updateQuestUI();
            
            // Unlock next quest if this was the first quest
            if (activeQuest.id === 'village_rescue') {
                quests['merchant_delivery'].available = true;
                addMessage(`📜 New quest available from the Traveling Merchant!`, 'info');
            }
        }
    }
}

function activateQuest(questId) {
    const quest = quests[questId];
    if (quest && !quest.active && !quest.completed) {
        // Deactivate current quest
        if (activeQuest) {
            activeQuest.active = false;
        }
        
        // Activate new quest
        quest.active = true;
        activeQuest = quest;
        addMessage(`📜 New Quest: ${quest.name}`, 'success');
        updateQuestUI();
    }
}

function updateQuestUI() {
    const questPanel = document.getElementById('quest-panel');
    if (!questPanel) return;
    
    if (activeQuest.active) {
        questPanel.innerHTML = `
            <div class="quest-header ${activeQuest.completed ? 'completed' : ''}">
                <div class="quest-title">📜 ${activeQuest.name}</div>
                <div class="quest-desc">${activeQuest.description}</div>
            </div>
            <div class="objectives">
                ${activeQuest.objectives.map(obj => `
                    <div class="objective ${obj.completed ? 'completed' : ''}">
                        ${obj.completed ? '✅' : '⭕'} ${obj.description}
                        <span class="progress">(${obj.current}/${obj.target})</span>
                    </div>
                `).join('')}
            </div>
            ${activeQuest.completed ? `
                <div class="quest-rewards">
                    🎁 Rewards: ${activeQuest.rewards.xp} XP, ${activeQuest.rewards.gold} Gold
                </div>
            ` : ''}
        `;
    }
}

// Sample items
const sampleItems = [
    new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }),
    new Item('mana_pot', 'Mana Potion', '🔮', 'consumable', 40, { manaRestore: 30 }),
    new Item('iron_sword', 'Iron Sword', '🗡️', 'weapon', 100, { slot: 'weapon', damage: 15 }),
    new Item('steel_helm', 'Steel Helmet', '⛑️', 'armor', 80, { slot: 'head', armor: 5 }),
    new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }),
];

// Initialize inventory with some starter items
playerInventory.addItem(new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }));
playerInventory.addItem(new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }));

// UI Functions
function openInventory() {
    document.getElementById('inventory-panel').classList.add('show');
    updateInventoryUI();
}

function closeInventory() {
    document.getElementById('inventory-panel').classList.remove('show');
}

function updateInventoryUI() {
    // Update gold (both in inventory and trading panels)
    document.getElementById('gold-amount').textContent = playerInventory.gold;
    document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
    document.getElementById('inv-count').textContent = playerInventory.items.length;
    document.getElementById('inv-max').textContent = playerInventory.maxSlots;
    
    // Update inventory grid
    const invGrid = document.getElementById('inventory-grid');
    invGrid.innerHTML = '';
    
    playerInventory.items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `
            <div class="icon">${item.icon}</div>
            <div class="name">${item.name}</div>
        `;
        slot.onclick = () => useItem(item);
        invGrid.appendChild(slot);
    });
    
    // Fill empty slots
    for (let i = playerInventory.items.length; i < playerInventory.maxSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        invGrid.appendChild(slot);
    }
    
    // Update equipment grid
    const eqGrid = document.getElementById('equipment-grid');
    eqGrid.innerHTML = '';
    
    const slots = ['head', 'chest', 'legs', 'weapon', 'shield'];
    slots.forEach(slotName => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        const item = playerInventory.equipment[slotName];
        if (item) {
            slot.innerHTML = `
                <div class="icon">${item.icon}</div>
                <div class="name">${item.name}</div>
            `;
        } else {
            slot.innerHTML = `<div class="name">${slotName}</div>`;
        }
        eqGrid.appendChild(slot);
    });
}

function useItem(item) {
    if (item.type === 'consumable') {
        if (item.stats.healing) {
            player.hp = Math.min(player.maxHp, player.hp + item.stats.healing);
            addMessage(`Used ${item.icon} ${item.name}, restored ${item.stats.healing} HP`, 'success');
            updateUI();
        }
        playerInventory.removeItem(item.id);
        updateInventoryUI();
    } else if (item.type === 'weapon' || item.type === 'armor') {
        // Equip the item
        if (item.slot) {
            // Unequip existing item in the slot
            const existingItem = playerInventory.equipment[item.slot];
            if (existingItem) {
                playerInventory.addItem(existingItem);
            }
            
            // Equip new item
            playerInventory.equipment[item.slot] = item;
            playerInventory.removeItem(item.id);
            addMessage(`Equipped ${item.icon} ${item.name}`, 'success');
            updateInventoryUI();
        }
    }
}

// ===== NPC SYSTEM =====

// Simple NPC class
class NPCCharacter {
    constructor(id, name, type, position, dialogue) {
        this.id = id;
        this.name = name;
        this.type = type; // quest_giver, merchant
        this.position = position;
        this.dialogue = dialogue;
        this.mesh = null;
    }
}

// Create NPCs (array `npcs` was initialized earlier)

// Quest Giver NPC
const questGiver = new NPCCharacter(
    'elder',
    'Village Elder',
    'quest_giver',
    { x: 10, z: 10 },
    [
        "Greetings, brave adventurer!",
        "The goblin threat grows stronger each day.",
        "Would you help protect our village?"
    ]
);

// Merchant NPC
const merchant = new NPCCharacter(
    'merchant',
    'Traveling Merchant',
    'merchant',
    { x: -10, z: 10 },
    [
        "Welcome to my humble shop!",
        "I have the finest wares in all the land.",
        "Take a look at what I have to offer!"
    ]
);

// Hermit NPC (for second quest)
const hermit = new NPCCharacter(
    'hermit',
    'Forest Hermit',
    'quest_giver',
    { x: -25, z: -25 },
    [
        "Ah, a visitor! How rare...",
        "I live here in solitude, away from the troubles of the village.",
        "What brings you to my humble dwelling?"
    ]
);

npcs.push(questGiver, merchant, hermit);

// Merchant inventory
const merchantInventory = [
    new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }),
    new Item('mana_pot', 'Mana Potion', '🔮', 'consumable', 40, { manaRestore: 30 }),
    new Item('iron_sword', 'Iron Sword', '🗡️', 'weapon', 100, { slot: 'weapon', damage: 15 }),
    new Item('steel_helm', 'Steel Helmet', '⛑️', 'armor', 80, { slot: 'head', armor: 5 }),
    new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }),
];

// FBX Loader for character assets
const fbxLoader = new FBXLoader();

// Utility function to find animation by keyword search
function findAnimationByKeyword(animations, keywords) {
    for (const keyword of keywords) {
        const found = animations.find(anim => 
            anim.name.toLowerCase().includes(keyword.toLowerCase())
        );
        if (found) return found;
    }
    return null;
}

// Load Baelin character and animations
async function loadBaelinCharacter() {
    // Single-file FBX for Baelin (uploaded as Baelin.fbx)
    const filePath = '/assets/characters/Baelin.fbx';
    try {
        const model = await new Promise((resolve, reject) => {
            fbxLoader.load(filePath, resolve, undefined, reject);
        });
        // yield to the event loop so the UI can update while parsing heavy FBX
        await new Promise(r => setTimeout(r, 0));

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const height = size.y;
        
        // Target height of 2 units for NPCs
        const targetHeight = 2.0;
        const scale = targetHeight / height;
        model.scale.set(scale, scale, scale);
        
        loadedModels['baelin'] = model;
        
        // Smart animation detection by keyword
        if (model.animations && model.animations.length > 0) {
            const idleAnim = findAnimationByKeyword(model.animations, ['idle', 'stand']);
            const walkAnim = findAnimationByKeyword(model.animations, ['walk', 'walking']);
            const talkAnim = findAnimationByKeyword(model.animations, ['talk', 'talking', 'speak']);
            const runAnim = findAnimationByKeyword(model.animations, ['run', 'running']);
            
            if (idleAnim) loadedAnimations['baelin_idle'] = idleAnim;
            if (walkAnim) loadedAnimations['baelin_walk'] = walkAnim;
            if (talkAnim) loadedAnimations['baelin_talk'] = talkAnim;
            if (runAnim) loadedAnimations['baelin_run'] = runAnim;
            
            // Fallback: if no idle found, use first animation
            if (!idleAnim && model.animations.length > 0) {
                loadedAnimations['baelin_idle'] = model.animations[0];
            }
        }

        console.log('✓ Baelin character loaded (height:', height.toFixed(2), '→', targetHeight, 'units, scale:', scale.toFixed(3) + ')');
        return true;
    } catch (error) {
        console.error('Error loading Baelin character:', error);
        return false;
    }
}

// Load Baradun character (merchant)
async function loadBaradunCharacter() {
    const filePath = '/assets/characters/Baradun.fbx';
    try {
        const model = await new Promise((resolve, reject) => {
            fbxLoader.load(filePath, resolve, undefined, reject);
        });
        await new Promise(r => setTimeout(r, 0));
        
        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const height = size.y;
        
        // Target height of 2 units for NPCs
        const targetHeight = 2.0;
        const scale = targetHeight / height;
        model.scale.set(scale, scale, scale);
        
        loadedModels['baradun'] = model;
        
        // Smart animation detection by keyword
        if (model.animations && model.animations.length > 0) {
            const idleAnim = findAnimationByKeyword(model.animations, ['idle', 'stand']);
            const walkAnim = findAnimationByKeyword(model.animations, ['walk', 'walking']);
            const talkAnim = findAnimationByKeyword(model.animations, ['talk', 'talking', 'speak']);
            const runAnim = findAnimationByKeyword(model.animations, ['run', 'running']);
            
            if (idleAnim) loadedAnimations['baradun_idle'] = idleAnim;
            if (walkAnim) loadedAnimations['baradun_walk'] = walkAnim;
            if (talkAnim) loadedAnimations['baradun_talk'] = talkAnim;
            if (runAnim) loadedAnimations['baradun_run'] = runAnim;
            
            // Fallback: if no idle found, use first animation
            if (!idleAnim && model.animations.length > 0) {
                loadedAnimations['baradun_idle'] = model.animations[0];
            }
        }

        console.log('✓ Baradun loaded (height:', height.toFixed(2), '→', targetHeight, 'units, scale:', scale.toFixed(3) + ')');
        return true;
    } catch (err) {
        console.error('Error loading Baradun:', err);
        return false;
    }
}

// Load mask FBX models
async function loadMasks() {
    const basePath = '/assets/items/';
    const masks = [
        //'Fox_Mask_Delight_1013090808_texture_fbx/Fox_Mask_Delight_1013090808_texture_fbx/Fox_Mask_Delight_1013090808_texture.fbx',
        //'Wolf_Mask_1013091527_texture_fbx/Wolf_Mask_1013091527_texture_fbx/Wolf_Mask_1013091527_texture.fbx',
        //'Crocodile_Mask_1013091746_texture_fbx/Crocodile_Mask_1013091746_texture_fbx/Crocodile_Mask_1013091746_texture.fbx',
        //'Colorful_Bird_Mask_1013090920_texture_fbx/Colorful_Bird_Mask_1013090920_texture_fbx/Colorful_Bird_Mask_1013090920_texture.fbx'
    ];
    
    try {
        for (let i = 0; i < masks.length; i++) {
            const mask = await new Promise((resolve, reject) => {
                fbxLoader.load(basePath + masks[i], resolve, undefined, reject);
            });
            const maskName = masks[i].split('/')[0].split('_')[0].toLowerCase();
            loadedModels['mask_' + maskName] = mask;
        }
        console.log('✓ Masks loaded');
        return true;
    } catch (error) {
        console.error('Error loading masks:', error);
        return false;
    }
}

// Create NPC meshes
function createNPCMesh(npc) {
    const npcGroup = new THREE.Group();
    
    // Use Baelin FBX model for quest giver (Village Elder)
    if (npc.id === 'elder' && loadedModels['baelin']) {
        // Clone the Baelin FBX and add it to the NPC group without modifying its authored transform.
        const charModel = loadedModels['baelin'].clone();
        charModel.rotation.y = Math.PI; // Face forward
        charModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        npcGroup.add(charModel);

        // Setup animation mixer for Baelin if animations are available
        if (loadedAnimations['baelin_idle']) {
            const mixer = new THREE.AnimationMixer(charModel);
            const action = mixer.clipAction(loadedAnimations['baelin_idle']);
            action.play();
            npc.mixer = mixer;
            npc.currentAnimation = 'idle';
        }
    } else {
        // Fallback to primitive shapes for other NPCs
        // Use Baradun FBX model for merchant if available
        if (npc.type === 'merchant' && loadedModels['baradun']) {
            const bModel = loadedModels['baradun'].clone();
            // We assume the Baradun prototype was normalized during load
            bModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            bModel.rotation.y = Math.PI;
            npcGroup.add(bModel);
            if (loadedAnimations['baradun_idle']) {
                const mixer = new THREE.AnimationMixer(bModel);
                const action = mixer.clipAction(loadedAnimations['baradun_idle']);
                action.play();
                npc.mixer = mixer;
                npc.currentAnimation = 'idle';
            }
            npc.mesh = npcGroup;
            return {
                type: 'npc',
                npc: npc,
                position: npc.position,
                mesh: npcGroup,
                interactable: true,
                interact: function() { interactWithNPC(npc); }
            };
        }
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: npc.type === 'merchant' ? 0x9333ea : 0x3b82f6 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75;
        body.castShadow = true;
        npcGroup.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.7;
        head.castShadow = true;
        npcGroup.add(head);
        
        // Hat/indicator
        const hatGeo = new THREE.ConeGeometry(0.35, 0.5, 8);
        const hatMat = new THREE.MeshStandardMaterial({ 
            color: npc.type === 'merchant' ? 0xfbbf24 : 0x4ade80,
            emissive: npc.type === 'merchant' ? 0xfbbf24 : 0x4ade80,
            emissiveIntensity: 0.3
        });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 2.2;
        hat.castShadow = true;
        npcGroup.add(hat);
    }
    
    // Add floating icon (always present)
    const iconGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const iconMat = new THREE.MeshStandardMaterial({ 
        color: npc.type === 'merchant' ? 0xfbbf24 : 0x22c55e,
        emissive: npc.type === 'merchant' ? 0xfbbf24 : 0x22c55e,
        emissiveIntensity: 0.5
    });
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.y = 2.7;
    npcGroup.add(icon);
    
    npcGroup.position.set(npc.position.x, 0, npc.position.z);
    scene.add(npcGroup);
    
    npc.mesh = npcGroup;
    npc.icon = icon;
    
    return {
        type: 'npc',
        npc: npc,
        position: npc.position,
        mesh: npcGroup,
        interactable: true,
        interact: function() {
            interactWithNPC(npc);
        }
    };
}

// Load FBX assets and then add NPCs to the world
(async function initAssets() {
    // Show loading message
    addMessage('Loading character assets...', 'info');
    
    // Load assets (Baradun and Baelin); masks are disabled
    await Promise.all([
        loadBaradunCharacter(),
        loadBaelinCharacter()
    ]);
    
    addMessage('✓ Assets loaded!', 'success');
    
    // Now create NPCs with loaded models
    npcs.forEach(npc => {
        const npcObj = createNPCMesh(npc);
        environmentObjects.push(npcObj);
    });

    // diagnostics removed
})();

// NPC Interaction
function interactWithNPC(npc) {
    if (npc.type === 'merchant') {
        openTrading(npc);
    } else if (npc.type === 'quest_giver') {
        showDialogue(npc);
    }
}

function showDialogue(npc) {
    const panel = document.getElementById('dialogue-panel');
    document.getElementById('npc-name').textContent = npc.name;
    document.getElementById('dialogue-text').textContent = npc.dialogue[0];
    
    const options = document.getElementById('dialogue-options');
    options.innerHTML = '';
    
    if (npc.type === 'quest_giver') {
        // Village Elder - First Quest
        if (npc.id === 'elder') {
            const villageQuest = quests['village_rescue'];
            
            // Only show turn-in button if quest is active, objectives complete, but quest not completed yet
            if (villageQuest.active && !villageQuest.completed &&
                villageQuest.objectives[0].completed && villageQuest.objectives[1].completed && 
                !villageQuest.objectives[2].completed) {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'dialogue-btn';
                completeBtn.textContent = '✓ I defeated the goblins!';
                completeBtn.onclick = () => {
                    updateQuestProgress('return_to_elder', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Excellent work, brave warrior! The village is safe once again. Please accept this reward for your heroic deeds!";
                    // Close dialogue after a delay to show completion message
                    setTimeout(() => {
                        closeDialogue();
                    }, 2000);
                };
                options.appendChild(completeBtn);
            } 
            // Show quest info button only if quest is active and not all objectives are done
            else if (villageQuest.active && !villageQuest.completed) {
                const questBtn = document.createElement('button');
                questBtn.className = 'dialogue-btn';
                questBtn.textContent = 'Tell me more about the goblins';
                questBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "The goblins have set up camp to the south. Defeat them and return to me for a reward!";
                };
                options.appendChild(questBtn);
            }
            // After quest is complete, show different dialogue
            else if (villageQuest.completed) {
                document.getElementById('dialogue-text').textContent = 
                    "Thank you again, brave warrior! The village is forever in your debt.";
            }
        }
        
        // Forest Hermit - Delivery quest target
        if (npc.id === 'hermit') {
            if (activeQuest.id === 'merchant_delivery' && !activeQuest.objectives[1].completed) {
                const foundBtn = document.createElement('button');
                foundBtn.className = 'dialogue-btn';
                foundBtn.textContent = 'I found you! (Complete objective)';
                foundBtn.onclick = () => {
                    updateQuestProgress('find_hermit', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Excellent! You found me. Now, do you have the package?";
                };
                options.appendChild(foundBtn);
            }
            
            if (activeQuest.id === 'merchant_delivery' && activeQuest.objectives[0].completed && !activeQuest.objectives[2].completed) {
                const deliverBtn = document.createElement('button');
                deliverBtn.className = 'dialogue-btn';
                deliverBtn.textContent = 'Deliver the package';
                deliverBtn.onclick = () => {
                    updateQuestProgress('deliver_package', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Thank you, brave soul! This package contains rare herbs I cannot find in these woods. You've done me a great service!";
                };
                options.appendChild(deliverBtn);
            }
        }
    }
    
    // Merchant - Second quest giver
    if (npc.type === 'merchant' && quests['merchant_delivery'].available && !quests['merchant_delivery'].active && !quests['merchant_delivery'].completed) {
        const questBtn2 = document.createElement('button');
        questBtn2.className = 'dialogue-btn';
        questBtn2.textContent = 'Do you need any help?';
        questBtn2.onclick = () => {
            document.getElementById('dialogue-text').textContent = 
                "Actually, yes! I need someone to deliver a package to the Forest Hermit who lives deep in the woods to the southwest. Will you help?";
            
            // Add accept quest button
            const acceptBtn = document.createElement('button');
            acceptBtn.className = 'dialogue-btn';
            acceptBtn.textContent = 'I\'ll deliver your package!';
            acceptBtn.onclick = () => {
                activateQuest('merchant_delivery');
                updateQuestProgress('get_package', 1);
                playerInventory.addItem(new Item('package', 'Sealed Package', '📦', 'quest', 0, {}));
                document.getElementById('dialogue-text').textContent = 
                    "Wonderful! The hermit lives far to the southwest, near coordinates (-25, -25). Be careful out there!";
            };
            options.innerHTML = '';
            options.appendChild(acceptBtn);
            options.appendChild(closeBtn);
        };
        options.appendChild(questBtn2);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dialogue-btn secondary';
    closeBtn.textContent = 'Farewell';
    closeBtn.onclick = closeDialogue;
    options.appendChild(closeBtn);
    
    panel.classList.add('show');
}

function closeDialogue() {
    document.getElementById('dialogue-panel').classList.remove('show');
}

// Trading UI
function openTrading(npc) {
    const panel = document.getElementById('trading-panel');
    document.getElementById('merchant-name').textContent = npc.name;
    document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
    
    // Populate merchant items
    const merchantItems = document.getElementById('merchant-items');
    merchantItems.innerHTML = '';
    
    merchantInventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="icon">${item.icon}</div>
                <div class="details">
                    <div class="name">${item.name}</div>
                    <div class="price">💰 ${Math.ceil(item.value * 1.5)} gold</div>
                </div>
            </div>
        `;
        itemDiv.onclick = () => buyItem(item);
        merchantItems.appendChild(itemDiv);
    });
    
    // Populate player items
    const playerItems = document.getElementById('player-items');
    playerItems.innerHTML = '';
    
    playerInventory.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="icon">${item.icon}</div>
                <div class="details">
                    <div class="name">${item.name}</div>
                    <div class="price">💰 ${Math.floor(item.value * 0.5)} gold</div>
                </div>
            </div>
        `;
        itemDiv.onclick = () => sellItem(item);
        playerItems.appendChild(itemDiv);
    });
    
    panel.classList.add('show');
}

function closeTrading() {
    document.getElementById('trading-panel').classList.remove('show');
}

function buyItem(item) {
    const price = Math.ceil(item.value * 1.5);
    if (playerInventory.removeGold(price)) {
        const newItem = new Item(item.id, item.name, item.icon, item.type, item.value, item.stats);
        if (playerInventory.addItem(newItem)) {
            document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
            addMessage(`Bought ${item.icon} ${item.name} for ${price} gold`, 'success');
        } else {
            playerInventory.addGold(price); // Refund if inventory full
        }
    } else {
        addMessage('Not enough gold!', 'warning');
    }
}

function sellItem(item) {
    const price = Math.floor(item.value * 0.5);
    if (playerInventory.removeItem(item.id)) {
        playerInventory.addGold(price);
        document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
        addMessage(`Sold ${item.icon} ${item.name} for ${price} gold`, 'success');
        openTrading(merchant); // Refresh trading UI
    }
}

// Additional keyboard controls
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'i') {
        const invPanel = document.getElementById('inventory-panel');
        if (invPanel.classList.contains('show')) {
            closeInventory();
        } else {
            openInventory();
        }
    }
    
    if (e.key === 'Escape') {
        closeInventory();
        closeTrading();
        closeDialogue();
    }
});

// Animate NPC icons (make them float)
setInterval(() => {
    npcs.forEach(npc => {
        if (npc.icon) {
            npc.icon.position.y = 2.7 + Math.sin(Date.now() * 0.002) * 0.2;
        }
    });
}, 50);

// Initialize UI on page load
updateInventoryUI();
updateQuestUI();
