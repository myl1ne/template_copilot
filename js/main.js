import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Game configuration
const CONFIG = {
    antCount: 30,
    antSpeed: 0.1,
    antSize: 0.2,
    nestPosition: { x: 0, y: 0.1, z: 0 },
    nestSize: 2,
    foodSourceCount: 5,
    pheromoneDecayRate: 0.995,
    pheromoneStrength: 1.0,
    worldSize: 50,
    groundColor: 0x8B7355,
    skyColor: 0x87CEEB,
    terrainHeight: 4,
    waterLevel: -0.5,
    terrainSegments: 100,
    // Enemy colony config
    enemyNestPosition: { x: -20, y: 0.1, z: -20 },
    enemyAntCount: 20,
    combatRange: 1.5,
    // Landscape elements
    treeCount: 8,
    rockCount: 12
};

// RPG Configuration
const RPG_CONFIG = {
    classes: {
        worker: { speed: 1.0, carryCapacity: 1, color: 0x000000, xpPerFood: 10 },
        scout: { speed: 1.5, carryCapacity: 0.5, color: 0x4A90E2, xpPerFood: 15 },
        soldier: { speed: 0.8, carryCapacity: 0.5, color: 0xFF0000, xpPerFood: 20, damage: 10 }
    },
    levelThresholds: [0, 100, 250, 500, 1000, 2000],
    maxLevel: 5,
    // AI behavior weights
    autonomy: {
        defendNestRange: 10,
        attackEnemyChance: 0.7,
        avoidEnemyChance: 0.3,
        healingRate: 0.1
    }
};

// Game state
let scene, camera, renderer, controls;
let ants = [];
let enemyAnts = [];
let foodSources = [];
let pheromones = [];
let nest, enemyNest;
let trees = [];
let rocks = [];
let isPaused = false;
let foodCollected = 0;
let enemyFoodCollected = 0;
let clock = new THREE.Clock();
let terrain, water;
let selectedAnt = null;
let raycaster, mouse;
let colonyXP = 0;
let colonyLevel = 1;

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.skyColor);
    scene.fog = new THREE.Fog(CONFIG.skyColor, 30, 70);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(20, 25, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Ground - Create terrain with height variations
    createTerrain();
    
    // Water
    createWater();
    
    // Landscape elements
    createTrees();
    createRocks();

    // Create player nest
    createNest();
    
    // Create enemy colony
    createEnemyNest();

    // Create food sources
    createFoodSources();

    // Create initial ants
    for (let i = 0; i < CONFIG.antCount; i++) {
        createAnt();
    }
    
    // Create enemy ants
    for (let i = 0; i < CONFIG.enemyAntCount; i++) {
        createEnemyAnt();
    }
    
    // Initialize raycaster and mouse for clicking
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('addWorkerBtn').addEventListener('click', () => createAnt('worker'));
    document.getElementById('addScoutBtn').addEventListener('click', () => createAnt('scout'));
    document.getElementById('addSoldierBtn').addEventListener('click', () => createAnt('soldier'));

    // Start animation
    animate();
}

// Simple noise function for terrain generation
function noise(x, z) {
    // Create multiple octaves for more interesting terrain
    const frequency1 = 0.05;
    const frequency2 = 0.1;
    const frequency3 = 0.2;
    
    // Base terrain with large hills
    const baseHeight = Math.sin(x * frequency1) * Math.cos(z * frequency1) * 1.0;
    
    // Medium-scale variation for rolling hills
    const mediumVariation = Math.sin(x * frequency2 + z * frequency2) * 0.4;
    
    // Small-scale detail
    const detail = Math.sin(x * frequency3) * Math.cos(z * frequency3) * 0.2;
    
    // Combine all layers
    let height = baseHeight + mediumVariation + detail;
    
    // Create river channels - create low areas along certain axes
    const riverX = Math.abs(Math.sin(x * 0.03)) - 0.7; // River running parallel to Z
    const riverZ = Math.abs(Math.sin(z * 0.025 + 10)) - 0.7; // River running parallel to X
    
    // Apply river channels (make them cut deep into terrain)
    const riverDepth = Math.min(riverX, riverZ);
    if (riverDepth > 0) {
        height -= riverDepth * 2.5; // Rivers cut into terrain
    }
    
    // Create plains - flatten areas where height is near zero
    if (Math.abs(height) < 0.3) {
        height *= 0.4; // Flatten near-zero areas into plains
    }
    
    return height;
}

function getTerrainHeight(x, z) {
    if (!terrain) return 0;
    
    // Get height from terrain geometry
    const halfSize = CONFIG.worldSize / 2;
    const segmentSize = CONFIG.worldSize / CONFIG.terrainSegments;
    
    // Convert world coordinates to terrain grid coordinates
    const gridX = Math.floor((x + halfSize) / segmentSize);
    const gridZ = Math.floor((z + halfSize) / segmentSize);
    
    // Clamp to terrain bounds
    const clampedX = Math.max(0, Math.min(CONFIG.terrainSegments - 1, gridX));
    const clampedZ = Math.max(0, Math.min(CONFIG.terrainSegments - 1, gridZ));
    
    // Get vertex index
    const index = clampedZ * (CONFIG.terrainSegments + 1) + clampedX;
    
    if (terrain.geometry.attributes.position.array[index * 3 + 1] !== undefined) {
        return terrain.geometry.attributes.position.array[index * 3 + 1];
    }
    
    return 0;
}

function createTerrain() {
    const geometry = new THREE.PlaneGeometry(
        CONFIG.worldSize, 
        CONFIG.worldSize, 
        CONFIG.terrainSegments, 
        CONFIG.terrainSegments
    );
    
    // Modify vertices to create hills and valleys
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];
        
        // Create height variation using noise
        const height = noise(x, z) * CONFIG.terrainHeight;
        vertices[i + 2] = height;
    }
    
    // Rotate to horizontal and update normals
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: CONFIG.groundColor,
        flatShading: false
    });
    
    terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);
}

function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(CONFIG.worldSize, CONFIG.worldSize);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4A90E2,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = CONFIG.waterLevel;
    water.receiveShadow = true;
    scene.add(water);
}

function createTrees() {
    for (let i = 0; i < CONFIG.treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 8 + Math.random() * 15;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const terrainHeight = getTerrainHeight(x, z);
        
        // Only place trees above water
        if (terrainHeight > CONFIG.waterLevel + 0.5) {
            const tree = new THREE.Group();
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            tree.add(trunk);
            
            // Foliage
            const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 3;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            tree.add(foliage);
            
            tree.position.set(x, terrainHeight, z);
            scene.add(tree);
            trees.push(tree);
        }
    }
}

function createRocks() {
    for (let i = 0; i < CONFIG.rockCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const terrainHeight = getTerrainHeight(x, z);
        
        // Only place rocks above water
        if (terrainHeight > CONFIG.waterLevel + 0.2) {
            const size = 0.5 + Math.random() * 1.0;
            const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, terrainHeight + size * 0.5, z);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
            rocks.push(rock);
        }
    }
}

function createNest() {
    const nestHeight = getTerrainHeight(CONFIG.nestPosition.x, CONFIG.nestPosition.z);
    
    const nestGeometry = new THREE.CylinderGeometry(CONFIG.nestSize, CONFIG.nestSize, 0.5, 32);
    const nestMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    nest = new THREE.Mesh(nestGeometry, nestMaterial);
    nest.position.set(CONFIG.nestPosition.x, nestHeight + 0.25, CONFIG.nestPosition.z);
    nest.receiveShadow = true;
    nest.castShadow = true;
    scene.add(nest);

    // Nest entrance marker
    const markerGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(CONFIG.nestPosition.x, nestHeight + 1, CONFIG.nestPosition.z);
    marker.castShadow = true;
    scene.add(marker);
}

function createEnemyNest() {
    const nestHeight = getTerrainHeight(CONFIG.enemyNestPosition.x, CONFIG.enemyNestPosition.z);
    
    const nestGeometry = new THREE.CylinderGeometry(CONFIG.nestSize, CONFIG.nestSize, 0.5, 32);
    const nestMaterial = new THREE.MeshLambertMaterial({ color: 0x2C1810 });
    enemyNest = new THREE.Mesh(nestGeometry, nestMaterial);
    enemyNest.position.set(CONFIG.enemyNestPosition.x, nestHeight + 0.25, CONFIG.enemyNestPosition.z);
    enemyNest.receiveShadow = true;
    enemyNest.castShadow = true;
    scene.add(enemyNest);

    // Enemy nest marker (purple)
    const markerGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x8B008B });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(CONFIG.enemyNestPosition.x, nestHeight + 1, CONFIG.enemyNestPosition.z);
    marker.castShadow = true;
    scene.add(marker);
}

function createFoodSources() {
    let placedCount = 0;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (placedCount < CONFIG.foodSourceCount && attempts < maxAttempts) {
        const angle = (Math.PI * 2 * placedCount) / CONFIG.foodSourceCount + (Math.random() - 0.5) * 0.5;
        const distance = 15 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const terrainHeight = getTerrainHeight(x, z);
        
        // Only place food above water level
        if (terrainHeight > CONFIG.waterLevel) {
            const foodAmount = 20 + Math.floor(Math.random() * 30);
            const size = 0.5 + foodAmount / 50;

            const foodGeometry = new THREE.SphereGeometry(size, 16, 16);
            const foodMaterial = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
            const food = new THREE.Mesh(foodGeometry, foodMaterial);
            food.position.set(x, terrainHeight + size, z);
            food.castShadow = true;
            food.receiveShadow = true;
            scene.add(food);

            foodSources.push({
                mesh: food,
                position: { x, z },
                amount: foodAmount,
                initialAmount: foodAmount
            });
            
            placedCount++;
        }
        
        attempts++;
    }
}

function createAnt(antClass = 'worker') {
    const antGroup = new THREE.Group();
    
    // Get class config
    const classConfig = RPG_CONFIG.classes[antClass];
    const antColor = classConfig.color;

    // Ant body (ellipsoid)
    const bodyGeometry = new THREE.SphereGeometry(CONFIG.antSize, 8, 8);
    bodyGeometry.scale(1.2, 0.8, 1);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: antColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    antGroup.add(body);

    // Ant head
    const headGeometry = new THREE.SphereGeometry(CONFIG.antSize * 0.6, 8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(CONFIG.antSize * 1.2, 0, 0);
    head.castShadow = true;
    antGroup.add(head);
    
    // Selection indicator (hidden by default)
    const selectionGeometry = new THREE.RingGeometry(CONFIG.antSize * 1.5, CONFIG.antSize * 1.8, 16);
    const selectionMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFF00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const selectionRing = new THREE.Mesh(selectionGeometry, selectionMaterial);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = -CONFIG.antSize * 0.8;
    selectionRing.visible = false;
    antGroup.add(selectionRing);

    // Position near nest
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDistance = CONFIG.nestSize + 0.5;
    const spawnX = CONFIG.nestPosition.x + Math.cos(spawnAngle) * spawnDistance;
    const spawnZ = CONFIG.nestPosition.z + Math.sin(spawnAngle) * spawnDistance;
    const terrainHeight = getTerrainHeight(spawnX, spawnZ);
    
    antGroup.position.set(
        spawnX,
        terrainHeight + CONFIG.antSize,
        spawnZ
    );

    scene.add(antGroup);

    const ant = {
        mesh: antGroup,
        body: body,
        selectionRing: selectionRing,
        position: antGroup.position.clone(),
        velocity: new THREE.Vector3(),
        state: 'exploring', // exploring, returning, gathering, commanded, fighting
        targetFood: null,
        commandTarget: null,
        targetEnemy: null,
        hasFood: false,
        direction: Math.random() * Math.PI * 2,
        wanderTimer: 0,
        pheromoneTimer: 0,
        // RPG stats
        class: antClass,
        level: 1,
        xp: 0,
        speed: classConfig.speed,
        carryCapacity: classConfig.carryCapacity,
        damage: classConfig.damage || 0,
        health: 100,
        maxHealth: 100,
        isEnemy: false
    };

    ants.push(ant);
    return ant;
}

function createEnemyAnt() {
    const antGroup = new THREE.Group();
    
    // Enemy ants are purple/dark colored
    const enemyColor = 0x8B008B;

    // Ant body
    const bodyGeometry = new THREE.SphereGeometry(CONFIG.antSize, 8, 8);
    bodyGeometry.scale(1.2, 0.8, 1);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: enemyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    antGroup.add(body);

    // Ant head
    const headGeometry = new THREE.SphereGeometry(CONFIG.antSize * 0.6, 8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(CONFIG.antSize * 1.2, 0, 0);
    head.castShadow = true;
    antGroup.add(head);

    // Position near enemy nest
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDistance = CONFIG.nestSize + 0.5;
    const spawnX = CONFIG.enemyNestPosition.x + Math.cos(spawnAngle) * spawnDistance;
    const spawnZ = CONFIG.enemyNestPosition.z + Math.sin(spawnAngle) * spawnDistance;
    const terrainHeight = getTerrainHeight(spawnX, spawnZ);
    
    antGroup.position.set(
        spawnX,
        terrainHeight + CONFIG.antSize,
        spawnZ
    );

    scene.add(antGroup);

    const ant = {
        mesh: antGroup,
        body: body,
        position: antGroup.position.clone(),
        velocity: new THREE.Vector3(),
        state: 'exploring',
        targetFood: null,
        targetEnemy: null,
        hasFood: false,
        direction: Math.random() * Math.PI * 2,
        wanderTimer: 0,
        pheromoneTimer: 0,
        // Enemy ant stats
        class: 'worker',
        level: 1,
        xp: 0,
        speed: 0.9,
        carryCapacity: 1.0,
        damage: 5,
        health: 80,
        maxHealth: 80,
        isEnemy: true
    };

    enemyAnts.push(ant);
    return ant;
}

function updateAnts(deltaTime) {
    ants.forEach(ant => {
        // Check for nearby enemies (autonomous behavior)
        if (ant.class === 'soldier' && Math.random() < 0.1) {
            checkForEnemies(ant);
        }
        
        if (ant.state === 'exploring') {
            exploreForFood(ant, deltaTime);
        } else if (ant.state === 'returning') {
            returnToNest(ant, deltaTime);
        } else if (ant.state === 'commanded') {
            executeCommand(ant, deltaTime);
        } else if (ant.state === 'fighting') {
            fightEnemy(ant, deltaTime);
        }

        // Update Y position to follow terrain
        const terrainHeight = getTerrainHeight(ant.position.x, ant.position.z);
        ant.position.y = terrainHeight + CONFIG.antSize;

        // Update mesh position
        ant.mesh.position.copy(ant.position);
        
        // Rotate ant to face direction of movement
        if (ant.velocity.length() > 0.001) {
            ant.mesh.rotation.y = Math.atan2(ant.velocity.x, ant.velocity.z);
        }

        // Drop pheromones if carrying food
        if (ant.hasFood) {
            ant.pheromoneTimer += deltaTime;
            if (ant.pheromoneTimer > 0.2) {
                dropPheromone(ant.position.clone(), 'food');
                ant.pheromoneTimer = 0;
            }
        }
    });
}

function exploreForFood(ant, deltaTime, isEnemy = false) {
    // Check if near food
    for (let food of foodSources) {
        if (food.amount > 0) {
            const dx = food.position.x - ant.position.x;
            const dz = food.position.z - ant.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 2) {
                // Found food!
                ant.hasFood = true;
                ant.state = 'returning';
                ant.targetFood = food;
                food.amount--;
                
                // Update food visual size
                const newSize = 0.5 + food.amount / 50;
                food.mesh.scale.set(
                    newSize / (0.5 + food.initialAmount / 50),
                    newSize / (0.5 + food.initialAmount / 50),
                    newSize / (0.5 + food.initialAmount / 50)
                );
                
                return;
            } else if (distance < 10) {
                // Move towards nearby food
                ant.direction = Math.atan2(dz, dx);
            }
        }
    }

    // Follow pheromone trails
    let strongestPheromone = null;
    let strongestStrength = 0;

    pheromones.forEach(pheromone => {
        if (pheromone.type === 'food') {
            const dx = pheromone.position.x - ant.position.x;
            const dz = pheromone.position.z - ant.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 3 && pheromone.strength > strongestStrength) {
                strongestPheromone = pheromone;
                strongestStrength = pheromone.strength;
            }
        }
    });

    if (strongestPheromone && Math.random() < 0.7) {
        const dx = strongestPheromone.position.x - ant.position.x;
        const dz = strongestPheromone.position.z - ant.position.z;
        ant.direction = Math.atan2(dz, dx);
    } else {
        // Random wandering
        ant.wanderTimer += deltaTime;
        if (ant.wanderTimer > 1) {
            ant.direction += (Math.random() - 0.5) * Math.PI / 2;
            ant.wanderTimer = 0;
        }
    }

    // Move in direction
    ant.velocity.set(
        Math.cos(ant.direction) * CONFIG.antSpeed * ant.speed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed * ant.speed
    );
    
    // Calculate potential new position
    const newX = ant.position.x + ant.velocity.x;
    const newZ = ant.position.z + ant.velocity.z;
    
    // Check if new position would be underwater
    const newTerrainHeight = getTerrainHeight(newX, newZ);
    if (newTerrainHeight > CONFIG.waterLevel) {
        // Safe to move - above water
        ant.position.add(ant.velocity);
    } else {
        // Would be underwater - change direction and don't move
        ant.direction += Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4;
        ant.wanderTimer = 0;
    }

    // Keep within world bounds
    const halfWorld = CONFIG.worldSize / 2 - 2;
    ant.position.x = Math.max(-halfWorld, Math.min(halfWorld, ant.position.x));
    ant.position.z = Math.max(-halfWorld, Math.min(halfWorld, ant.position.z));
}

function returnToNest(ant, deltaTime) {
    const dx = CONFIG.nestPosition.x - ant.position.x;
    const dz = CONFIG.nestPosition.z - ant.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < CONFIG.nestSize) {
        // Reached nest!
        ant.hasFood = false;
        ant.state = 'exploring';
        ant.targetFood = null;
        foodCollected++;
        
        // Gain XP for delivering food
        const xpGain = RPG_CONFIG.classes[ant.class].xpPerFood;
        gainXP(ant, xpGain);
        
        return;
    }

    // Move towards nest
    ant.direction = Math.atan2(dz, dx);
    ant.velocity.set(
        Math.cos(ant.direction) * CONFIG.antSpeed * ant.speed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed * ant.speed
    );
    
    // Calculate potential new position
    const newX = ant.position.x + ant.velocity.x;
    const newZ = ant.position.z + ant.velocity.z;
    
    // Check if new position would be underwater
    const newTerrainHeight = getTerrainHeight(newX, newZ);
    if (newTerrainHeight > CONFIG.waterLevel) {
        // Safe to move - above water
        ant.position.add(ant.velocity);
    } else {
        // Would be underwater - try to go around
        // Add perpendicular offset to avoid water
        const perpendicularAngle = ant.direction + Math.PI / 2;
        const avoidanceOffset = Math.random() < 0.5 ? 1 : -1;
        ant.direction = Math.atan2(dz, dx) + perpendicularAngle * avoidanceOffset * 0.3;
    }
}

function dropPheromone(position, type) {
    const pheromoneGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const pheromoneColor = type === 'food' ? 0xFFD700 : 0x00FF00;
    const pheromoneMaterial = new THREE.MeshBasicMaterial({ 
        color: pheromoneColor,
        transparent: true,
        opacity: 0.5
    });
    const pheromoneMesh = new THREE.Mesh(pheromoneGeometry, pheromoneMaterial);
    pheromoneMesh.position.copy(position);
    
    // Place pheromone on terrain
    const terrainHeight = getTerrainHeight(position.x, position.z);
    pheromoneMesh.position.y = terrainHeight + 0.05;
    
    scene.add(pheromoneMesh);

    pheromones.push({
        mesh: pheromoneMesh,
        position: position,
        type: type,
        strength: CONFIG.pheromoneStrength,
        createdAt: Date.now()
    });
}

function updatePheromones() {
    pheromones = pheromones.filter(pheromone => {
        pheromone.strength *= CONFIG.pheromoneDecayRate;
        pheromone.mesh.material.opacity = pheromone.strength * 0.5;

        if (pheromone.strength < 0.1) {
            scene.remove(pheromone.mesh);
            pheromone.mesh.geometry.dispose();
            pheromone.mesh.material.dispose();
            return false;
        }
        return true;
    });
}

function updateStats() {
    document.getElementById('antCount').textContent = ants.length;
    document.getElementById('foodCollected').textContent = foodCollected;
    document.getElementById('enemyCount').textContent = enemyAnts.length;
    document.getElementById('enemyFood').textContent = enemyFoodCollected;
    document.getElementById('pheromoneCount').textContent = pheromones.length;
    document.getElementById('colonyLevel').textContent = colonyLevel;
    document.getElementById('colonyXP').textContent = Math.floor(colonyXP);
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function resetSimulation() {
    // Remove all ants
    ants.forEach(ant => {
        scene.remove(ant.mesh);
    });
    ants = [];
    
    // Remove all enemy ants
    enemyAnts.forEach(ant => {
        scene.remove(ant.mesh);
    });
    enemyAnts = [];
    
    // Deselect any selected ant
    selectedAnt = null;
    updateAntInfoPanel(null);

    // Remove all pheromones
    pheromones.forEach(pheromone => {
        scene.remove(pheromone.mesh);
        pheromone.mesh.geometry.dispose();
        pheromone.mesh.material.dispose();
    });
    pheromones = [];

    // Reset food sources
    foodSources.forEach(food => {
        food.amount = food.initialAmount;
        food.mesh.scale.set(1, 1, 1);
    });

    // Reset stats
    foodCollected = 0;
    enemyFoodCollected = 0;
    colonyXP = 0;
    colonyLevel = 1;

    // Create new ants (mix of classes)
    for (let i = 0; i < CONFIG.antCount; i++) {
        const rand = Math.random();
        if (rand < 0.7) {
            createAnt('worker');
        } else if (rand < 0.9) {
            createAnt('scout');
        } else {
            createAnt('soldier');
        }
    }
    
    // Create enemy ants
    for (let i = 0; i < CONFIG.enemyAntCount; i++) {
        createEnemyAnt();
    }

    isPaused = false;
    document.getElementById('pauseBtn').textContent = 'Pause';
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    if (!isPaused) {
        updateAnts(deltaTime);
        updateEnemyAnts(deltaTime);
        updatePheromones();
        updateStats();
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse interaction functions
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Prevent click if dragging camera
    if (controls.enabled && !controls._isDragging) {
        raycaster.setFromCamera(mouse, camera);
        
        // Check if clicking on an ant
        const antMeshes = ants.map(ant => ant.mesh);
        const intersects = raycaster.intersectObjects(antMeshes, true);
        
        if (intersects.length > 0) {
            // Find which ant was clicked
            const clickedMesh = intersects[0].object.parent;
            const clickedAnt = ants.find(ant => ant.mesh === clickedMesh);
            
            if (clickedAnt) {
                selectAnt(clickedAnt);
            }
        } else {
            // Click on terrain - command selected ant to move there
            if (selectedAnt) {
                const terrainIntersects = raycaster.intersectObject(terrain);
                if (terrainIntersects.length > 0) {
                    const targetPosition = terrainIntersects[0].point;
                    commandAntToPosition(selectedAnt, targetPosition);
                }
            } else {
                deselectAnt();
            }
        }
    }
}

function selectAnt(ant) {
    // Deselect previous ant
    if (selectedAnt) {
        selectedAnt.selectionRing.visible = false;
    }
    
    // Select new ant
    selectedAnt = ant;
    ant.selectionRing.visible = true;
    
    // Update UI
    updateAntInfoPanel(ant);
}

function deselectAnt() {
    if (selectedAnt) {
        selectedAnt.selectionRing.visible = false;
        selectedAnt = null;
        updateAntInfoPanel(null);
    }
}

function commandAntToPosition(ant, position) {
    ant.state = 'commanded';
    ant.commandTarget = {
        x: position.x,
        z: position.z
    };
}

function executeCommand(ant, deltaTime) {
    if (!ant.commandTarget) {
        ant.state = 'exploring';
        return;
    }
    
    const dx = ant.commandTarget.x - ant.position.x;
    const dz = ant.commandTarget.z - ant.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 0.5) {
        // Reached command target
        ant.commandTarget = null;
        ant.state = 'exploring';
        return;
    }
    
    // Move towards command target
    ant.direction = Math.atan2(dz, dx);
    ant.velocity.set(
        Math.cos(ant.direction) * CONFIG.antSpeed * ant.speed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed * ant.speed
    );
    
    // Check water avoidance
    const newX = ant.position.x + ant.velocity.x;
    const newZ = ant.position.z + ant.velocity.z;
    const newTerrainHeight = getTerrainHeight(newX, newZ);
    
    if (newTerrainHeight > CONFIG.waterLevel) {
        ant.position.add(ant.velocity);
    } else {
        // Try to go around water
        ant.direction += Math.PI / 4;
    }
}

// Enemy AI and Combat Functions
function updateEnemyAnts(deltaTime) {
    enemyAnts.forEach(ant => {
        // Check for nearby player ants
        if (Math.random() < 0.1) {
            checkForPlayerAnts(ant);
        }
        
        if (ant.state === 'exploring') {
            exploreForFood(ant, deltaTime, true);
        } else if (ant.state === 'returning') {
            returnToEnemyNest(ant, deltaTime);
        } else if (ant.state === 'fighting') {
            fightEnemy(ant, deltaTime);
        }

        // Update Y position to follow terrain
        const terrainHeight = getTerrainHeight(ant.position.x, ant.position.z);
        ant.position.y = terrainHeight + CONFIG.antSize;

        // Update mesh position
        ant.mesh.position.copy(ant.position);
        
        // Rotate ant to face direction of movement
        if (ant.velocity.length() > 0.001) {
            ant.mesh.rotation.y = Math.atan2(ant.velocity.x, ant.velocity.z);
        }
    });
}

function checkForEnemies(ant) {
    let closestEnemy = null;
    let closestDist = Infinity;
    
    enemyAnts.forEach(enemy => {
        const dx = enemy.position.x - ant.position.x;
        const dz = enemy.position.z - ant.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < closestDist && dist < RPG_CONFIG.autonomy.defendNestRange) {
            closestDist = dist;
            closestEnemy = enemy;
        }
    });
    
    if (closestEnemy && Math.random() < RPG_CONFIG.autonomy.attackEnemyChance) {
        ant.state = 'fighting';
        ant.targetEnemy = closestEnemy;
    }
}

function checkForPlayerAnts(ant) {
    let closestPlayer = null;
    let closestDist = Infinity;
    
    ants.forEach(player => {
        const dx = player.position.x - ant.position.x;
        const dz = player.position.z - ant.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < closestDist && dist < 8) {
            closestDist = dist;
            closestPlayer = player;
        }
    });
    
    if (closestPlayer && Math.random() < 0.5) {
        ant.state = 'fighting';
        ant.targetEnemy = closestPlayer;
    }
}

function fightEnemy(ant, deltaTime) {
    if (!ant.targetEnemy || ant.targetEnemy.health <= 0) {
        ant.state = 'exploring';
        ant.targetEnemy = null;
        return;
    }
    
    const dx = ant.targetEnemy.position.x - ant.position.x;
    const dz = ant.targetEnemy.position.z - ant.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < CONFIG.combatRange) {
        // In combat range - attack!
        if (Math.random() < 0.1) {  // Attack chance per frame
            ant.targetEnemy.health -= ant.damage;
            
            // Visual feedback - flash red
            ant.targetEnemy.body.material.emissive.setHex(0xFF0000);
            setTimeout(() => {
                if (ant.targetEnemy.body) {
                    ant.targetEnemy.body.material.emissive.setHex(0x000000);
                }
            }, 100);
            
            // Check if enemy defeated
            if (ant.targetEnemy.health <= 0) {
                handleAntDeath(ant.targetEnemy);
                ant.state = 'exploring';
                ant.targetEnemy = null;
                // Gain XP for defeating enemy
                if (!ant.isEnemy) {
                    gainXP(ant, 50);
                }
            }
        }
    } else {
        // Move towards enemy
        ant.direction = Math.atan2(dz, dx);
        ant.velocity.set(
            Math.cos(ant.direction) * CONFIG.antSpeed * ant.speed,
            0,
            Math.sin(ant.direction) * CONFIG.antSpeed * ant.speed
        );
        
        const newX = ant.position.x + ant.velocity.x;
        const newZ = ant.position.z + ant.velocity.z;
        const newTerrainHeight = getTerrainHeight(newX, newZ);
        
        if (newTerrainHeight > CONFIG.waterLevel) {
            ant.position.add(ant.velocity);
        } else {
            ant.state = 'exploring';
            ant.targetEnemy = null;
        }
    }
}

function handleAntDeath(ant) {
    scene.remove(ant.mesh);
    
    if (ant.isEnemy) {
        const index = enemyAnts.indexOf(ant);
        if (index > -1) {
            enemyAnts.splice(index, 1);
        }
    } else {
        const index = ants.indexOf(ant);
        if (index > -1) {
            ants.splice(index, 1);
        }
        if (selectedAnt === ant) {
            deselectAnt();
        }
    }
}

function returnToEnemyNest(ant, deltaTime) {
    const dx = CONFIG.enemyNestPosition.x - ant.position.x;
    const dz = CONFIG.enemyNestPosition.z - ant.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < CONFIG.nestSize) {
        // Reached nest!
        ant.hasFood = false;
        ant.state = 'exploring';
        ant.targetFood = null;
        enemyFoodCollected++;
        return;
    }

    // Move towards nest
    ant.direction = Math.atan2(dz, dx);
    ant.velocity.set(
        Math.cos(ant.direction) * CONFIG.antSpeed * ant.speed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed * ant.speed
    );
    
    const newX = ant.position.x + ant.velocity.x;
    const newZ = ant.position.z + ant.velocity.z;
    const newTerrainHeight = getTerrainHeight(newX, newZ);
    
    if (newTerrainHeight > CONFIG.waterLevel) {
        ant.position.add(ant.velocity);
    } else {
        const perpendicularAngle = ant.direction + Math.PI / 2;
        const avoidanceOffset = Math.random() < 0.5 ? 1 : -1;
        ant.direction = Math.atan2(dz, dx) + perpendicularAngle * avoidanceOffset * 0.3;
    }
}

function gainXP(ant, amount) {
    ant.xp += amount;
    
    // Check for level up
    if (ant.level < RPG_CONFIG.maxLevel) {
        const nextLevelThreshold = RPG_CONFIG.levelThresholds[ant.level];
        if (ant.xp >= nextLevelThreshold) {
            levelUpAnt(ant);
        }
    }
    
    // Also add to colony XP
    colonyXP += amount;
    updateColonyLevel();
}

function levelUpAnt(ant) {
    ant.level++;
    
    // Increase stats
    ant.speed *= 1.1;
    ant.carryCapacity *= 1.1;
    if (ant.damage) {
        ant.damage *= 1.2;
    }
    
    // Visual feedback - make ant slightly larger
    ant.mesh.scale.set(
        1 + (ant.level - 1) * 0.05,
        1 + (ant.level - 1) * 0.05,
        1 + (ant.level - 1) * 0.05
    );
    
    // Update UI if this ant is selected
    if (selectedAnt === ant) {
        updateAntInfoPanel(ant);
    }
}

function updateColonyLevel() {
    const oldLevel = colonyLevel;
    for (let i = RPG_CONFIG.levelThresholds.length - 1; i >= 0; i--) {
        if (colonyXP >= RPG_CONFIG.levelThresholds[i]) {
            colonyLevel = i + 1;
            break;
        }
    }
    
    if (colonyLevel > oldLevel) {
        // Colony leveled up!
        console.log(`Colony leveled up to ${colonyLevel}!`);
    }
}

function updateAntInfoPanel(ant) {
    const panel = document.getElementById('antInfo');
    if (!panel) return;
    
    if (!ant) {
        panel.style.display = 'none';
        return;
    }
    
    panel.style.display = 'block';
    panel.innerHTML = `
        <h3>Selected Ant</h3>
        <p><strong>Class:</strong> ${ant.class.charAt(0).toUpperCase() + ant.class.slice(1)}</p>
        <p><strong>Level:</strong> ${ant.level}</p>
        <p><strong>XP:</strong> ${Math.floor(ant.xp)} / ${RPG_CONFIG.levelThresholds[ant.level] || 'MAX'}</p>
        <p><strong>Speed:</strong> ${ant.speed.toFixed(2)}x</p>
        <p><strong>Carry:</strong> ${ant.carryCapacity.toFixed(2)}x</p>
        ${ant.damage ? `<p><strong>Damage:</strong> ${Math.floor(ant.damage)}</p>` : ''}
        <p><strong>State:</strong> ${ant.state}</p>
    `;
}

// Start the simulation
init();
