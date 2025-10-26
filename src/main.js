import * as THREE from 'three';

// Game state
const state = {
    selectedMaterial: 'water',
    heldMaterial: { type: 'soil', amount: 500 }, // Start with some soil to build with
    timeSpeed: 1.0,
    isPaused: false,
    isGathering: false,
    isReleasing: false,
    currentIntersection: null
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000510);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 4);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffcc, 1.5);
sunLight.position.set(5, 3, 5);
sunLight.castShadow = true;
scene.add(sunLight);

// Create planet
const planetRadius = 1.5;
const planetSegments = 64;
const planetGeometry = new THREE.SphereGeometry(planetRadius, planetSegments, planetSegments);

// Custom shader material for terrain
const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.8,
    metalness: 0.2,
    flatShading: false
});

const planet = new THREE.Mesh(planetGeometry, terrainMaterial);
planet.castShadow = true;
planet.receiveShadow = true;
scene.add(planet);

// Create atmosphere/clouds layer
const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.15, 32, 32);
const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// Create cloud layer with better visibility
const cloudGeometry = new THREE.SphereGeometry(planetRadius * 1.08, 32, 32);
const cloudMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Vertex height data for terrain deformation
const positionAttribute = planetGeometry.getAttribute('position');
const vertexHeights = new Float32Array(positionAttribute.count);
const vertexMaterials = new Array(positionAttribute.count).fill('soil');
const vertexTemperatures = new Float32Array(positionAttribute.count).fill(25);
const vertexWater = new Float32Array(positionAttribute.count).fill(0);

// Initialize vertex heights
for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    const length = Math.sqrt(x * x + y * y + z * z);
    vertexHeights[i] = length;
    
    // Add some initial terrain variation
    const noise = (Math.random() - 0.5) * 0.1;
    vertexHeights[i] += noise;
}

// Material sources (water springs, lava vents)
const waterSources = [];
const lavaSources = [];

// Add a few water sources
for (let i = 0; i < 3; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    waterSources.push({
        theta,
        phi,
        rate: 2.0, // Increased for better visibility
        active: true
    });
}

// Add a lava source
for (let i = 0; i < 2; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    lavaSources.push({
        theta,
        phi,
        rate: 0.3,
        active: true
    });
}

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Camera controls
let cameraDistance = 4;
const minDistance = 2.5;
const maxDistance = 8;

// Handle mouse movement
renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 0 || event.button === 2) {
        isDragging = false;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        
        // Start gathering/releasing
        if (event.button === 0) {
            state.isGathering = true;
        } else if (event.button === 2) {
            state.isReleasing = true;
        }
    }
});

renderer.domElement.addEventListener('mousemove', (event) => {
    // Update current intersection for continuous gather/release
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planet);
    
    if (intersects.length > 0) {
        state.currentIntersection = intersects[0].point;
    } else {
        state.currentIntersection = null;
    }
    
    if (event.buttons === 1 || event.buttons === 2) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            isDragging = true;
            
            // Stop gathering/releasing when dragging
            state.isGathering = false;
            state.isReleasing = false;
            
            // Rotate planet
            planet.rotation.y += deltaX * 0.01;
            planet.rotation.x += deltaY * 0.01;
            
            // Clamp x rotation
            planet.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, planet.rotation.x));
        }
        
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
});

renderer.domElement.addEventListener('mouseup', (event) => {
    state.isGathering = false;
    state.isReleasing = false;
    isDragging = false;
});

// Prevent context menu
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

// Handle mouse wheel for zoom
renderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    cameraDistance += event.deltaY * 0.01;
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
    
    camera.position.set(0, 0, cameraDistance);
});

// Gather material from terrain (modified for continuous operation)
function gatherMaterial(point) {
    const radius = 0.3;
    const amount = 0.5; // Reduced for continuous gather
    
    // Find nearby vertices
    for (let i = 0; i < positionAttribute.count; i++) {
        const vx = positionAttribute.getX(i);
        const vy = positionAttribute.getY(i);
        const vz = positionAttribute.getZ(i);
        
        const dist = Math.sqrt(
            (vx - point.x) ** 2 +
            (vy - point.y) ** 2 +
            (vz - point.z) ** 2
        );
        
        if (dist < radius) {
            const influence = 1 - (dist / radius);
            const reduction = amount * influence * 0.01;
            
            // Check if water is present
            if (vertexWater[i] > 0) {
                const waterGathered = Math.min(vertexWater[i], reduction * 100);
                vertexWater[i] -= waterGathered;
                if (state.heldMaterial.type !== 'water') {
                    state.heldMaterial = { type: 'water', amount: 0 };
                }
                state.heldMaterial.amount += waterGathered;
            } else {
                // Gather terrain
                vertexHeights[i] = Math.max(planetRadius * 0.5, vertexHeights[i] - reduction);
                if (state.heldMaterial.type !== state.selectedMaterial) {
                    state.heldMaterial = { type: state.selectedMaterial, amount: 0 };
                }
                state.heldMaterial.amount += reduction * 100;
            }
        }
    }
    
    needsUpdate = true;
    updateTerrainGeometry();
    updateMaterialColors();
    updateUI();
}

// Release material onto terrain (modified for continuous operation)
function releaseMaterial(point) {
    // Allow placing selected material type, auto-switching if needed
    if (state.heldMaterial.type !== state.selectedMaterial) {
        // Switch to placing the selected material, give some free material if needed
        if (state.heldMaterial.amount < 10) {
            state.heldMaterial = { type: state.selectedMaterial, amount: 500 };
        } else {
            state.heldMaterial.type = state.selectedMaterial;
        }
    }
    
    if (state.heldMaterial.amount <= 0) {
        // Give more material to place
        state.heldMaterial.amount = 500;
    }
    
    const radius = 0.3;
    const amount = Math.min(state.heldMaterial.amount, 0.5); // Reduced for continuous release
    
    // Find nearby vertices
    for (let i = 0; i < positionAttribute.count; i++) {
        const vx = positionAttribute.getX(i);
        const vy = positionAttribute.getY(i);
        const vz = positionAttribute.getZ(i);
        
        const dist = Math.sqrt(
            (vx - point.x) ** 2 +
            (vy - point.y) ** 2 +
            (vz - point.z) ** 2
        );
        
        if (dist < radius) {
            const influence = 1 - (dist / radius);
            const addition = amount * influence * 0.01;
            
            if (state.heldMaterial.type === 'water') {
                vertexWater[i] += addition * 100;
                vertexMaterials[i] = 'water';
            } else if (state.heldMaterial.type === 'lava') {
                vertexHeights[i] += addition;
                vertexMaterials[i] = 'lava';
                vertexTemperatures[i] = 1200;
            } else {
                vertexHeights[i] += addition;
                vertexMaterials[i] = 'soil';
            }
            
            state.heldMaterial.amount -= addition * 100;
        }
    }
    
    needsUpdate = true;
    updateTerrainGeometry();
    updateMaterialColors();
    updateUI();
}

// Update terrain geometry
function updateTerrainGeometry() {
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        // Normalize and scale by height
        const length = Math.sqrt(x * x + y * y + z * z);
        const scale = vertexHeights[i] / length;
        
        positionAttribute.setXYZ(i, x * scale, y * scale, z * scale);
    }
    
    positionAttribute.needsUpdate = true;
    planetGeometry.computeVertexNormals();
}

// Simulate material behavior
function simulateMaterials(deltaTime) {
    if (state.isPaused) return;
    
    const dt = deltaTime * state.timeSpeed;
    
    // Water flow simulation (improved for better pooling)
    const waterFlow = new Float32Array(positionAttribute.count).fill(0);
    
    for (let i = 0; i < positionAttribute.count; i++) {
        if (vertexWater[i] <= 0.1) continue;
        
        const ix = positionAttribute.getX(i);
        const iy = positionAttribute.getY(i);
        const iz = positionAttribute.getZ(i);
        const iHeight = vertexHeights[i];
        
        // Find neighboring vertices
        for (let j = 0; j < positionAttribute.count; j++) {
            if (i === j) continue;
            
            const jx = positionAttribute.getX(j);
            const jy = positionAttribute.getY(j);
            const jz = positionAttribute.getZ(j);
            const jHeight = vertexHeights[j];
            
            const dist = Math.sqrt(
                (ix - jx) ** 2 +
                (iy - jy) ** 2 +
                (iz - jz) ** 2
            );
            
            // Only consider nearby vertices
            if (dist < 0.2) {
                // Improved height calculation including water depth
                const iWaterHeight = iHeight + vertexWater[i] * 0.002;
                const jWaterHeight = jHeight + vertexWater[j] * 0.002;
                const heightDiff = iWaterHeight - jWaterHeight;
                
                if (heightDiff > 0.001) {
                    // Increased flow rate for more visible water movement
                    const flowRate = Math.min(vertexWater[i] * 0.5 * dt, heightDiff * 15);
                    waterFlow[i] -= flowRate;
                    waterFlow[j] += flowRate;
                }
            }
        }
        
        // Evaporation
        if (vertexTemperatures[i] > 80) {
            const evapRate = (vertexTemperatures[i] - 80) * 0.001 * dt;
            vertexWater[i] = Math.max(0, vertexWater[i] - evapRate);
        }
    }
    
    // Apply water flow
    for (let i = 0; i < positionAttribute.count; i++) {
        vertexWater[i] = Math.max(0, vertexWater[i] + waterFlow[i]);
    }
    
    // Lava cooling
    for (let i = 0; i < positionAttribute.count; i++) {
        if (vertexMaterials[i] === 'lava') {
            vertexTemperatures[i] = Math.max(25, vertexTemperatures[i] - 10 * dt);
            
            // Solidify when cool enough
            if (vertexTemperatures[i] < 600) {
                vertexMaterials[i] = 'rock';
            }
        } else {
            // Gradual temperature normalization
            vertexTemperatures[i] += (25 - vertexTemperatures[i]) * 0.1 * dt;
        }
    }
    
    // Material sources
    waterSources.forEach(source => {
        if (!source.active) return;
        
        const x = Math.sin(source.phi) * Math.cos(source.theta) * planetRadius;
        const y = Math.cos(source.phi) * planetRadius;
        const z = Math.sin(source.phi) * Math.sin(source.theta) * planetRadius;
        
        // Find closest vertex
        let closestDist = Infinity;
        let closestIdx = -1;
        
        for (let i = 0; i < positionAttribute.count; i++) {
            const vx = positionAttribute.getX(i);
            const vy = positionAttribute.getY(i);
            const vz = positionAttribute.getZ(i);
            
            const dist = Math.sqrt((vx - x) ** 2 + (vy - y) ** 2 + (vz - z) ** 2);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        
        if (closestIdx >= 0) {
            vertexWater[closestIdx] += source.rate * dt;
        }
    });
    
    lavaSources.forEach(source => {
        if (!source.active) return;
        
        const x = Math.sin(source.phi) * Math.cos(source.theta) * planetRadius;
        const y = Math.cos(source.phi) * planetRadius;
        const z = Math.sin(source.phi) * Math.sin(source.theta) * planetRadius;
        
        // Find closest vertex
        let closestDist = Infinity;
        let closestIdx = -1;
        
        for (let i = 0; i < positionAttribute.count; i++) {
            const vx = positionAttribute.getX(i);
            const vy = positionAttribute.getY(i);
            const vz = positionAttribute.getZ(i);
            
            const dist = Math.sqrt((vx - x) ** 2 + (vy - y) ** 2 + (vz - z) ** 2);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        
        if (closestIdx >= 0) {
            vertexHeights[closestIdx] += source.rate * 0.01 * dt;
            vertexMaterials[closestIdx] = 'lava';
            vertexTemperatures[closestIdx] = 1200;
        }
    });
}

// Update material colors based on type and temperature
function updateMaterialColors() {
    const colors = new Float32Array(positionAttribute.count * 3);
    
    for (let i = 0; i < positionAttribute.count; i++) {
        let r = 0.545, g = 0.451, b = 0.333; // Default soil color
        
        // Improved water rendering with better visibility
        if (vertexWater[i] > 1) {
            // Water - more vibrant blue with depth indication
            const depth = Math.min(vertexWater[i] / 50, 1.0);
            r = 0.05 + (1 - depth) * 0.15;
            g = 0.4 + depth * 0.3;
            b = 0.7 + depth * 0.25;
            
            // Add slight green tint for shallow water
            if (vertexWater[i] < 10) {
                g += 0.1;
            }
        } else if (vertexWater[i] > 0.1) {
            // Wet soil - darker, more saturated
            r = 0.35;
            g = 0.30;
            b = 0.25;
        } else if (vertexMaterials[i] === 'lava') {
            // Lava - color based on temperature
            const temp = vertexTemperatures[i];
            r = 1.0;
            g = Math.max(0, (temp - 600) / 600);
            b = Math.max(0, (temp - 900) / 300) * 0.2;
        } else if (vertexMaterials[i] === 'rock') {
            // Cooled lava - dark volcanic rock
            r = 0.15;
            g = 0.15;
            b = 0.15;
        }
        
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }
    
    planetGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainMaterial.vertexColors = true;
}

// UI Controls
document.getElementById('water-btn').addEventListener('click', () => {
    state.selectedMaterial = 'water';
    updateButtonStates();
});

document.getElementById('soil-btn').addEventListener('click', () => {
    state.selectedMaterial = 'soil';
    updateButtonStates();
});

document.getElementById('lava-btn').addEventListener('click', () => {
    state.selectedMaterial = 'lava';
    updateButtonStates();
});

document.getElementById('time-slider').addEventListener('input', (e) => {
    const speeds = [0, 0.5, 1, 2, 5];
    state.timeSpeed = speeds[e.target.value];
    state.isPaused = state.timeSpeed === 0;
    document.getElementById('time-speed').textContent = state.isPaused ? 'Paused' : `${state.timeSpeed}x`;
});

function updateButtonStates() {
    document.getElementById('water-btn').classList.toggle('active', state.selectedMaterial === 'water');
    document.getElementById('soil-btn').classList.toggle('active', state.selectedMaterial === 'soil');
    document.getElementById('lava-btn').classList.toggle('active', state.selectedMaterial === 'lava');
}

function updateUI() {
    document.getElementById('material-amount').textContent = Math.round(state.heldMaterial.amount);
    
    // Calculate average temperature near camera view
    let avgTemp = 25;
    for (let i = 0; i < Math.min(100, positionAttribute.count); i++) {
        avgTemp += vertexTemperatures[i];
    }
    avgTemp /= Math.min(100, positionAttribute.count);
    document.getElementById('temp-display').textContent = `${Math.round(avgTemp)}°C`;
}

// Animation loop
let lastTime = 0;
let needsUpdate = true;

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;
    
    // Rotate clouds slowly for atmosphere effect
    clouds.rotation.y += 0.0002;
    atmosphere.rotation.y -= 0.0001;
    
    // Handle continuous gather/release
    if (state.currentIntersection) {
        if (state.isGathering && !isDragging) {
            gatherMaterial(state.currentIntersection);
            updateUI();
        } else if (state.isReleasing && !isDragging) {
            releaseMaterial(state.currentIntersection);
            updateUI();
        }
    }
    
    // Simulate materials only when not paused
    if (!state.isPaused && deltaTime < 0.1) { // Avoid huge jumps
        simulateMaterials(deltaTime);
        needsUpdate = true;
    }
    
    // Update geometry and colors only when changes occur
    if (needsUpdate) {
        updateTerrainGeometry();
        updateMaterialColors();
        needsUpdate = state.timeSpeed > 0 || state.isGathering || state.isReleasing; // Keep updating if simulation is running or user is interacting
    }
    
    // Render
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
updateButtonStates();
updateUI();
updateMaterialColors();
animate(0);

console.log('To Dust - Terrain manipulation game initialized!');
