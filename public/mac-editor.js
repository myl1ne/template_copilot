import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MAC, MACLibrary, MACBuilder } from './modules/mac/MACCore.js';
import { MACPersistence } from './modules/mac/MACPersistence.js';
import './modules/mac/MACExamples.js'; // Load example templates

// Scene setup
let scene, camera, renderer, controls;
let currentMAC = null;
let currentMesh = null;
let gridHelper = null;

function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5);

    // Renderer
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Grid
    gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Start with a simple box
    currentMAC = new MAC('box', {
        width: 1, height: 1, depth: 1,
        material: { color: 0x4a9eff }
    });
    updateDisplay();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function updateDisplay() {
    // Remove old mesh
    if (currentMesh) {
        scene.remove(currentMesh);
    }

    // Build and add new mesh
    if (currentMAC) {
        currentMesh = currentMAC.build();
        scene.add(currentMesh);
        
        // Update info panel
        document.getElementById('childCount').textContent = currentMAC.children.length;
        document.getElementById('transformCount').textContent = currentMAC.transforms.length;
        
        // Update code display
        const code = currentMAC.toCode();
        document.getElementById('codeDisplay').textContent = code;
    }
}

function loadTemplateList() {
    const templates = MACLibrary.getAll();
    const list = document.getElementById('templateList');
    const select = document.getElementById('templateSelect');
    
    list.innerHTML = '';
    select.innerHTML = '<option value="">Select template...</option>';
    
    templates.forEach(name => {
        // Add to sidebar
        const li = document.createElement('li');
        li.className = 'template-item';
        li.textContent = name;
        li.addEventListener('click', () => loadTemplate(name));
        list.appendChild(li);
        
        // Add to select
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function loadSavedList() {
    const saved = MACPersistence.getAllSavedNames();
    const list = document.getElementById('savedList');
    
    list.innerHTML = '';
    
    if (saved.length === 0) {
        list.innerHTML = '<li style="padding: 10px; color: #808080;">No saved assets</li>';
        return;
    }
    
    saved.forEach(name => {
        const li = document.createElement('li');
        li.className = 'template-item';
        li.textContent = name;
        li.addEventListener('click', () => loadSaved(name));
        list.appendChild(li);
    });
}

function loadTemplate(name) {
    const mac = MACLibrary.get(name);
    if (mac) {
        currentMAC = mac;
        updateDisplay();
        document.getElementById('macName').value = name;
    }
}

function loadSaved(name) {
    const mac = MACPersistence.loadFromLocalStorage(name);
    if (mac) {
        currentMAC = mac;
        updateDisplay();
        document.getElementById('macName').value = name;
    }
}

// Event listeners
document.getElementById('newBtn').addEventListener('click', () => {
    currentMAC = new MAC('group');
    updateDisplay();
    document.getElementById('macName').value = '';
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const name = document.getElementById('macName').value || 'untitled';
    if (currentMAC) {
        MACPersistence.saveToLocalStorage(name, currentMAC);
        loadSavedList();
        alert(`Saved as "${name}"`);
    }
});

document.getElementById('loadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.js';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const mac = await MACPersistence.importFromFile(file);
                currentMAC = mac;
                updateDisplay();
                alert('Loaded successfully!');
            } catch (error) {
                alert('Error loading file: ' + error.message);
            }
        }
    };
    input.click();
});

document.getElementById('exportBtn').addEventListener('click', () => {
    if (!currentMAC) return;
    const name = document.getElementById('macName').value || 'untitled';
    
    const choice = confirm('Export as JavaScript code? (Cancel for JSON)');
    if (choice) {
        MACPersistence.exportAsCode(currentMAC, name);
    } else {
        MACPersistence.exportAsJSON(currentMAC, name);
    }
});

document.getElementById('resetCameraBtn').addEventListener('click', () => {
    camera.position.set(5, 5, 5);
    controls.target.set(0, 0, 0);
});

document.getElementById('toggleGridBtn').addEventListener('click', () => {
    gridHelper.visible = !gridHelper.visible;
});

document.getElementById('applyTransformBtn').addEventListener('click', () => {
    if (!currentMAC) return;
    
    const pos = document.getElementById('position').value.split(',').map(v => parseFloat(v.trim()));
    const rot = document.getElementById('rotation').value.split(',').map(v => parseFloat(v.trim()));
    const scl = document.getElementById('scale').value.split(',').map(v => parseFloat(v.trim()));
    
    if (pos.length === 3 && !pos.some(isNaN)) {
        currentMAC.position(...pos);
    }
    if (rot.length === 3 && !rot.some(isNaN)) {
        currentMAC.rotation(...rot);
    }
    if (scl.length === 3 && !scl.some(isNaN)) {
        currentMAC.scale(...scl);
    }
    
    updateDisplay();
});

document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
});

document.getElementById('editCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeDisplay').textContent;
    document.getElementById('codeEditor').value = code;
    document.getElementById('codeEditSection').style.display = 'block';
});

document.getElementById('cancelCodeBtn').addEventListener('click', () => {
    document.getElementById('codeEditSection').style.display = 'none';
});

document.getElementById('applyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeEditor').value;
    const mac = MACPersistence.fromCode(code);
    if (mac) {
        currentMAC = mac;
        updateDisplay();
        document.getElementById('codeEditSection').style.display = 'none';
        alert('Code applied successfully!');
    } else {
        alert('Error parsing code. Please check syntax.');
    }
});

document.getElementById('exportCodeFileBtn').addEventListener('click', () => {
    if (!currentMAC) return;
    const name = document.getElementById('macName').value || 'untitled';
    MACPersistence.exportAsCode(currentMAC, name);
});

document.getElementById('exportJsonBtn').addEventListener('click', () => {
    if (!currentMAC) return;
    const name = document.getElementById('macName').value || 'untitled';
    MACPersistence.exportAsJSON(currentMAC, name);
});

// Primitive buttons
document.querySelectorAll('.primitive-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.primitive;
        if (!currentMAC) {
            currentMAC = new MAC('group');
        }
        
        // Add primitive with default params
        const params = { material: { color: Math.random() * 0xffffff } };
        currentMAC.add(type, params);
        updateDisplay();
    });
});

document.getElementById('addTemplateBtn').addEventListener('click', () => {
    const templateName = document.getElementById('templateSelect').value;
    if (!templateName) return;
    
    const template = MACLibrary.get(templateName);
    if (template && currentMAC) {
        currentMAC.add(template);
        updateDisplay();
    }
});

document.getElementById('cloneBtn').addEventListener('click', () => {
    if (currentMAC) {
        currentMAC = currentMAC.clone();
        updateDisplay();
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear all and start fresh?')) {
        currentMAC = new MAC('group');
        updateDisplay();
    }
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('canvas');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// Initialize
initScene();
animate();
loadTemplateList();
loadSavedList();
console.log('MAC Editor initialized');
console.log('Available templates:', MACLibrary.getAll().length);
