import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x4ade80, 1, 10);
pointLight1.position.set(-3, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x60a5fa, 1, 10);
pointLight2.position.set(3, 2, -2);
scene.add(pointLight2);

// Ground
const groundGeometry = new THREE.CircleGeometry(15, 64);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(20, 20, 0x4ade80, 0x2d3748);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Create character (warrior representation)
const characterGroup = new THREE.Group();

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

// Shield (left hand)
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

// Sword (right hand)
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

// Particle effects around character
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 100;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 3;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: 0x4ade80,
    size: 0.05,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particles.position.y = 1.5;
characterGroup.add(particles);

scene.add(characterGroup);

// Animation state
let isAnimating = true;
let time = 0;

// Handle keyboard
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isAnimating = !isAnimating;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        time += 0.01;

        // Rotate character
        characterGroup.rotation.y += 0.005;

        // Animate sword swing
        swordGroup.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.3;

        // Animate shield
        shield.position.z = Math.sin(time * 3) * 0.1;

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += Math.sin(time + i) * 0.002;
            
            if (positions[i3 + 1] > 3) {
                positions[i3 + 1] = -1;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Rotate particles
        particles.rotation.y += 0.002;

        // Animate lights
        pointLight1.intensity = 0.8 + Math.sin(time) * 0.3;
        pointLight2.intensity = 0.8 + Math.cos(time) * 0.3;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Character data simulation
const character = {
    name: "Thorin the Brave",
    stats: {
        hp: 150,
        maxHp: 150,
        mana: 50,
        maxMana: 50,
        armor: 10,
        attackSpeed: 1.2
    },
    attributes: {
        str: 18,
        dex: 12,
        con: 16,
        int: 8,
        wiz: 10,
        cha: 14
    }
};

console.log('RPG Engine - Three.js Demo Loaded');
console.log('Character:', character);
