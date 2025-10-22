import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshLibrary } from './modules/MeshLibrary.js';

// Global state
let scene, camera, renderer, controls;
let currentMesh = null;
let autoRotate = false;
let allContent = {};
let collapsedCategories = new Set();

/**
 * Initialize Three.js scene
 */
function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5);

    // Renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x60a5fa, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x4ade80, 0x334155);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Start animation loop
    animate();
}

/**
 * Window resize handler
 */
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    // Auto-rotate current mesh
    if (currentMesh && autoRotate) {
        currentMesh.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

/**
 * Load and display all content from mesh library
 */
function loadContent() {
    allContent = MeshLibrary.getAllContent();
    const info = MeshLibrary.getContentInfo();
    
    // Update stats
    document.getElementById('total-count').textContent = info.totalCount;
    document.getElementById('creatures-count').textContent = info.categories.creatures.count;
    document.getElementById('buildings-count').textContent = info.categories.buildings.count;
    document.getElementById('props-count').textContent = info.categories.props.count;
    
    // Populate sidebar
    populateCategory('creatures', allContent.creatures);
    populateCategory('buildings', allContent.buildings);
    populateCategory('props', allContent.props);
}

/**
 * Populate a category in the sidebar
 */
function populateCategory(category, items) {
    const listElement = document.getElementById(`${category}-list`);
    const countElement = document.getElementById(`${category}-cat-count`);
    
    countElement.textContent = items.length;
    
    items.forEach(item => {
        const button = document.createElement('button');
        button.className = 'item-button';
        button.textContent = formatName(item);
        button.onclick = () => loadMesh(category, item);
        button.dataset.category = category;
        button.dataset.item = item;
        listElement.appendChild(button);
    });
}

/**
 * Format item name for display
 */
function formatName(name) {
    return name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Load and display a specific mesh
 */
function loadMesh(category, type) {
    // Remove current mesh
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh = null;
    }
    
    // Load new mesh
    try {
        currentMesh = MeshLibrary.getMesh(category, type);
        scene.add(currentMesh);
        
        // Update info panel
        document.getElementById('selected-name').textContent = formatName(type);
        document.getElementById('selected-category').textContent = formatName(category);
        document.getElementById('selected-type').textContent = type;
        
        // Count meshes
        let meshCount = 0;
        currentMesh.traverse(obj => {
            if (obj.isMesh) meshCount++;
        });
        document.getElementById('selected-meshes').textContent = meshCount;
        
        // Update active state
        document.querySelectorAll('.item-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.item-button[data-category="${category}"][data-item="${type}"]`).classList.add('active');
        
        // Reset camera to view the model
        resetCamera();
    } catch (error) {
        console.error('Error loading mesh:', error);
        alert(`Failed to load ${category}/${type}: ${error.message}`);
    }
}

/**
 * Reset camera to default position
 */
function resetCamera() {
    if (currentMesh) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Position camera to view the entire object
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2.5;
        
        camera.position.set(distance, distance * 0.7, distance);
        controls.target.copy(center);
        controls.update();
    } else {
        camera.position.set(5, 5, 5);
        controls.target.set(0, 0, 0);
        controls.update();
    }
}

/**
 * Toggle category visibility
 */
function toggleCategory(category) {
    const list = document.getElementById(`${category}-list`);
    if (collapsedCategories.has(category)) {
        collapsedCategories.delete(category);
        list.style.display = 'flex';
    } else {
        collapsedCategories.add(category);
        list.style.display = 'none';
    }
}

/**
 * Search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter-category');
    
    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = filterSelect.value;
        
        document.querySelectorAll('.item-button').forEach(button => {
            const itemName = button.textContent.toLowerCase();
            const itemCategory = button.dataset.category;
            
            const matchesSearch = itemName.includes(searchTerm);
            const matchesCategory = category === 'all' || itemCategory === category;
            
            button.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
        });
    }
    
    searchInput.addEventListener('input', filterItems);
    filterSelect.addEventListener('change', filterItems);
}

/**
 * Initialize the application
 */
function init() {
    initScene();
    loadContent();
    setupSearch();
    
    // Make resetCamera available globally
    window.resetCamera = resetCamera;
    window.toggleCategory = toggleCategory;
    window.autoRotate = false;
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
