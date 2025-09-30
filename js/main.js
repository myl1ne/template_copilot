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
    terrainHeight: 5,
    waterLevel: 0.5,
    terrainSegments: 100
};

// Game state
let scene, camera, renderer, controls;
let ants = [];
let foodSources = [];
let pheromones = [];
let nest;
let isPaused = false;
let foodCollected = 0;
let clock = new THREE.Clock();
let terrain, water;

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

    // Create nest
    createNest();

    // Create food sources
    createFoodSources();

    // Create initial ants
    for (let i = 0; i < CONFIG.antCount; i++) {
        createAnt();
    }

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('addAntsBtn').addEventListener('click', () => {
        for (let i = 0; i < 10; i++) {
            createAnt();
        }
    });

    // Start animation
    animate();
}

// Simple noise function for terrain generation
function noise(x, z) {
    // Simple pseudo-random noise based on position
    const sin = Math.sin(x * 0.1 + z * 0.1) * 0.5;
    const cos = Math.cos(x * 0.15 - z * 0.1) * 0.3;
    const sin2 = Math.sin(x * 0.2 + z * 0.15) * 0.2;
    return sin + cos + sin2;
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

function createFoodSources() {
    for (let i = 0; i < CONFIG.foodSourceCount; i++) {
        const angle = (Math.PI * 2 * i) / CONFIG.foodSourceCount;
        const distance = 15 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const foodAmount = 20 + Math.floor(Math.random() * 30);
        const size = 0.5 + foodAmount / 50;
        
        const terrainHeight = getTerrainHeight(x, z);

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
    }
}

function createAnt() {
    const antGroup = new THREE.Group();

    // Ant body (ellipsoid)
    const bodyGeometry = new THREE.SphereGeometry(CONFIG.antSize, 8, 8);
    bodyGeometry.scale(1.2, 0.8, 1);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    antGroup.add(body);

    // Ant head
    const headGeometry = new THREE.SphereGeometry(CONFIG.antSize * 0.6, 8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(CONFIG.antSize * 1.2, 0, 0);
    head.castShadow = true;
    antGroup.add(head);

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
        position: antGroup.position.clone(),
        velocity: new THREE.Vector3(),
        state: 'exploring', // exploring, returning, gathering
        targetFood: null,
        hasFood: false,
        direction: Math.random() * Math.PI * 2,
        wanderTimer: 0,
        pheromoneTimer: 0
    };

    ants.push(ant);
    return ant;
}

function updateAnts(deltaTime) {
    ants.forEach(ant => {
        if (ant.state === 'exploring') {
            exploreForFood(ant, deltaTime);
        } else if (ant.state === 'returning') {
            returnToNest(ant, deltaTime);
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

function exploreForFood(ant, deltaTime) {
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
        Math.cos(ant.direction) * CONFIG.antSpeed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed
    );
    ant.position.add(ant.velocity);

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
        return;
    }

    // Move towards nest
    ant.direction = Math.atan2(dz, dx);
    ant.velocity.set(
        Math.cos(ant.direction) * CONFIG.antSpeed,
        0,
        Math.sin(ant.direction) * CONFIG.antSpeed
    );
    ant.position.add(ant.velocity);
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
    document.getElementById('pheromoneCount').textContent = pheromones.length;
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

    // Create new ants
    for (let i = 0; i < CONFIG.antCount; i++) {
        createAnt();
    }

    isPaused = false;
    document.getElementById('pauseBtn').textContent = 'Pause';
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    if (!isPaused) {
        updateAnts(deltaTime);
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

// Start the simulation
init();
