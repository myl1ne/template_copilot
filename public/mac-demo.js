import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MAC, MACLibrary } from './modules/mac/MACCore.js';
import './modules/mac/MACExamples.js';

// Scene setup
let scene, camera, renderer, controls;
let currentMesh = null;
let currentIndex = 0;
const examples = [];

function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const canvas = document.getElementById('canvas');
    camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(4, 4, 4);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.9 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Rotate current mesh slowly
    if (currentMesh) {
        currentMesh.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

function loadExamples() {
    const templates = MACLibrary.getAll();
    
    // Filter interesting examples for demo
    const showcaseTemplates = [
        'simple_tree',
        'detailed_tree',
        'simple_house',
        'tower',
        'knight',
        'cart',
        'campfire',
        'market_stall',
        'barrel',
        'torch',
        'fence_section',
        'bridge'
    ];
    
    showcaseTemplates.forEach(name => {
        if (templates.includes(name)) {
            examples.push({ name, mac: MACLibrary.get(name) });
        }
    });
    
    // Update UI
    document.getElementById('templateCount').textContent = templates.length;
    
    // Show first example
    showExample(0);
}

function showExample(index) {
    if (index < 0 || index >= examples.length) return;
    
    currentIndex = index;
    const example = examples[index];
    
    // Remove old mesh
    if (currentMesh) {
        scene.remove(currentMesh);
    }
    
    // Build and add new mesh
    currentMesh = example.mac.build();
    scene.add(currentMesh);
    
    // Update UI
    document.getElementById('currentMesh').textContent = `${index + 1}/${examples.length}: ${example.name}`;
    document.getElementById('displayInfo').textContent = example.name;
    
    // Auto-adjust camera for different sized objects
    adjustCamera(example.name);
}

function adjustCamera(exampleName) {
    // Different examples need different camera positions
    const cameraSettings = {
        'tower': { pos: [8, 6, 8], target: [0, 3, 0] },
        'detailed_tree': { pos: [6, 5, 6], target: [0, 2, 0] },
        'knight': { pos: [4, 3, 4], target: [0, 1, 0] },
        'market_stall': { pos: [5, 4, 5], target: [0, 1, 0] },
        'bridge': { pos: [6, 3, 6], target: [0, 0, 0] }
    };
    
    const setting = cameraSettings[exampleName] || { pos: [4, 4, 4], target: [0, 1, 0] };
    
    camera.position.set(...setting.pos);
    controls.target.set(...setting.target);
}

// Event listeners
document.getElementById('nextBtn').addEventListener('click', () => {
    showExample((currentIndex + 1) % examples.length);
});

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('canvas');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// Keyboard navigation
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Space') {
        showExample((currentIndex + 1) % examples.length);
    } else if (e.key === 'ArrowLeft') {
        showExample((currentIndex - 1 + examples.length) % examples.length);
    }
});

// Initialize
initScene();
loadExamples();
animate();

console.log('MAC Demo initialized');
console.log(`Showcasing ${examples.length} examples`);
