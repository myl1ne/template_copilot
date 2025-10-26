import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { MAC, MACLibrary, MACBuilder } from './modules/mac/MACCore.js';
import { MACPersistence } from './modules/mac/MACPersistence.js';
import './modules/mac/MACExamples.js'; // Load example templates
import './modules/mac/MACAnimations.js'; // Load animated templates

// Scene setup
let scene, camera, renderer, controls, transformControls;
let currentMAC = null;
let currentMesh = null;
let gridHelper = null;
let selectedNode = null;  // Currently selected node in hierarchy
let selectedMesh = null;  // Currently selected 3D mesh in viewport
let gizmoMode = 'translate';  // translate, rotate, or scale
let raycaster, mouse;
let outlinePass = null;  // For highlighting selected objects

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
    ground.name = 'ground'; // Name it so we can ignore it in raycasting
    scene.add(ground);

    // TransformControls for 3D manipulation
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate'); // Start with translate mode
    transformControls.setSize(0.8);
    scene.add(transformControls);
    
    // When transformControls is used, disable orbit controls
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
    });
    
    // Listen for transform changes to update MAC
    transformControls.addEventListener('objectChange', () => {
        if (selectedMesh && transformControls.object) {
            updateMACFromMesh();
        }
    });
    
    // Raycaster for object selection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Click event for selecting objects
    canvas.addEventListener('click', onCanvasClick, false);
    canvas.addEventListener('dblclick', onCanvasDoubleClick, false);

    // Start with a simple box
    currentMAC = new MAC('box', {
        width: 1, height: 1, depth: 1,
        material: { color: 0x4a9eff }
    });
    updateDisplay();
}

let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    const delta = clock.getDelta();
    
    // Run animation if current mesh supports it
    if (currentMesh && currentMesh.userData.animate) {
        currentMesh.userData.animate(delta);
    }
    
    renderer.render(scene, camera);
}

// Canvas click handler for object selection
function onCanvasClick(event) {
    // Calculate mouse position in normalized device coordinates
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Get all intersectable objects (exclude ground and grid)
    const intersectableObjects = [];
    if (currentMesh) {
        currentMesh.traverse((child) => {
            if (child.isMesh && child.name !== 'ground') {
                intersectableObjects.push(child);
            }
        });
    }
    
    const intersects = raycaster.intersectObjects(intersectableObjects, false);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        selectMeshObject(clickedObject);
    } else {
        // Click on empty space - deselect
        deselectMeshObject();
    }
}

// Double-click to focus on selected object
function onCanvasDoubleClick(event) {
    if (selectedMesh) {
        // Calculate center of selected mesh
        const box = new THREE.Box3().setFromObject(selectedMesh);
        const center = box.getCenter(new THREE.Vector3());
        
        // Smoothly move camera to focus on object
        controls.target.copy(center);
        controls.update();
    }
}

// Select a mesh object from the 3D scene
function selectMeshObject(mesh) {
    // Deselect previous
    if (selectedMesh && selectedMesh.material) {
        // Restore original emissive
        if (selectedMesh.userData.originalEmissive !== undefined) {
            selectedMesh.material.emissive.copy(selectedMesh.userData.originalEmissive);
            selectedMesh.material.emissiveIntensity = selectedMesh.userData.originalEmissiveIntensity || 0;
        }
    }
    
    selectedMesh = mesh;
    
    // Highlight selected mesh
    if (mesh.material) {
        // Store original emissive
        mesh.userData.originalEmissive = mesh.material.emissive.clone();
        mesh.userData.originalEmissiveIntensity = mesh.material.emissiveIntensity;
        
        // Set highlight
        mesh.material.emissive.setHex(0x4a9eff);
        mesh.material.emissiveIntensity = 0.3;
    }
    
    // Attach transform controls
    transformControls.attach(mesh);
    
    // Update UI
    updateSelectionUI();
}

// Deselect mesh object
function deselectMeshObject() {
    if (selectedMesh && selectedMesh.material) {
        // Restore original emissive
        if (selectedMesh.userData.originalEmissive !== undefined) {
            selectedMesh.material.emissive.copy(selectedMesh.userData.originalEmissive);
            selectedMesh.material.emissiveIntensity = selectedMesh.userData.originalEmissiveIntensity || 0;
        }
    }
    
    selectedMesh = null;
    transformControls.detach();
    updateSelectionUI();
}

// Update MAC data from mesh transforms after manipulation
function updateMACFromMesh() {
    if (!selectedMesh || !currentMAC) return;
    
    // This is a simplified version - in a full implementation,
    // you'd need to traverse the MAC tree and find the corresponding node
    // For now, we'll just show the updated position in the UI
    updateSelectionUI();
}

// Update UI to show selected object info
function updateSelectionUI() {
    const selectionInfo = document.getElementById('3DSelectionInfo');
    if (!selectionInfo) return;
    
    if (selectedMesh) {
        const pos = selectedMesh.position;
        const rot = selectedMesh.rotation;
        const scl = selectedMesh.scale;
        
        selectionInfo.innerHTML = `
            <strong>Selected in 3D:</strong><br/>
            Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})<br/>
            Rotation: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})<br/>
            Scale: (${scl.x.toFixed(2)}, ${scl.y.toFixed(2)}, ${scl.z.toFixed(2)})
        `;
        selectionInfo.style.display = 'block';
    } else {
        selectionInfo.style.display = 'none';
    }
}

// Change transform mode (translate, rotate, scale)
function setTransformMode(mode) {
    gizmoMode = mode;
    transformControls.setMode(mode);
    
    // Update button states
    document.querySelectorAll('.gizmo-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(mode + 'ModeBtn')?.classList.add('active');
}

function updateDisplay() {
    // Detach transform controls if attached
    if (transformControls.object) {
        transformControls.detach();
    }
    
    // Remove old mesh
    if (currentMesh) {
        scene.remove(currentMesh);
    }
    
    // Deselect
    selectedMesh = null;
    updateSelectionUI();

    // Build and add new mesh (try animated version if available)
    if (currentMAC) {
        // Check if MAC has animations
        const hasAnimation = currentMAC.animationFn || 
                           currentMAC.children.some(c => c.animationFn);
        
        if (hasAnimation) {
            currentMesh = currentMAC.buildAnimated();
        } else {
            currentMesh = currentMAC.build();
        }
        
        // Make all meshes selectable and add better materials
        currentMesh.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Ensure material can be highlighted
                if (child.material) {
                    // Make sure material has emissive property
                    if (!child.material.emissive) {
                        child.material.emissive = new THREE.Color(0x000000);
                    }
                    if (child.material.emissiveIntensity === undefined) {
                        child.material.emissiveIntensity = 0;
                    }
                }
            }
        });
        
        scene.add(currentMesh);
        
        // Update info panel
        document.getElementById('childCount').textContent = currentMAC.children.length;
        document.getElementById('transformCount').textContent = currentMAC.transforms.length;
        
        // Update code display
        const code = currentMAC.toCode();
        document.getElementById('codeDisplay').textContent = code;
        
        // Update hierarchy tree
        updateHierarchyTree();
    }
}

function updateHierarchyTree() {
    const treeContainer = document.getElementById('hierarchyTree');
    if (!treeContainer) return;
    
    treeContainer.innerHTML = '';
    
    if (!currentMAC) {
        treeContainer.innerHTML = '<div style="padding: 10px; color: #808080;">No MAC loaded</div>';
        return;
    }
    
    // Build the tree
    const rootNode = buildTreeNode(currentMAC, 'root', 0);
    treeContainer.appendChild(rootNode);
}

function buildTreeNode(mac, path, depth) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.dataset.path = path;
    
    // Icon based on type
    const icon = mac.type === 'group' ? '📁' : '📦';
    
    // Node content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tree-node-content';
    contentDiv.innerHTML = `
        <span class="tree-node-icon">${icon}</span>
        <span class="tree-node-label">${mac.type}</span>
        <span class="tree-node-type">${mac.children.length} children, ${mac.transforms.length} transforms</span>
    `;
    
    // Node actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'tree-node-actions';
    
    const selectBtn = document.createElement('button');
    selectBtn.className = 'tree-node-btn';
    selectBtn.textContent = 'Select';
    selectBtn.onclick = (e) => {
        e.stopPropagation();
        selectNodeByPath(path);
    };
    
    actionsDiv.appendChild(selectBtn);
    
    nodeDiv.appendChild(contentDiv);
    nodeDiv.appendChild(actionsDiv);
    
    // Click to select
    nodeDiv.onclick = (e) => {
        if (e.target === nodeDiv || e.target.closest('.tree-node-content')) {
            selectNodeByPath(path);
        }
    };
    
    // Add children
    if (mac.children && mac.children.length > 0) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-children';
        
        mac.children.forEach((child, index) => {
            const childPath = `${path}.children[${index}]`;
            const childNode = buildTreeNode(child, childPath, depth + 1);
            childrenDiv.appendChild(childNode);
        });
        
        nodeDiv.appendChild(childrenDiv);
    }
    
    return nodeDiv;
}

function selectNodeByPath(path) {
    // Remove previous selection
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('selected');
    });
    
    // Add selection to clicked node
    const nodeElement = document.querySelector(`[data-path="${path}"]`);
    if (nodeElement) {
        nodeElement.classList.add('selected');
    }
    
    // Get the actual MAC node
    selectedNode = getNodeByPath(currentMAC, path);
    
    // Update UI
    updateSelectedNodeInfo();
}

function getNodeByPath(mac, path) {
    if (path === 'root') {
        return mac;
    }
    
    // Parse path like "root.children[0].children[1]"
    const parts = path.split('.').slice(1); // Remove 'root'
    let current = mac;
    
    for (const part of parts) {
        if (part.startsWith('children[')) {
            const index = parseInt(part.match(/\d+/)[0]);
            current = current.children[index];
        }
    }
    
    return current;
}

function updateSelectedNodeInfo() {
    const infoSpan = document.getElementById('selectedNodeInfo');
    if (!infoSpan) return;
    
    if (!selectedNode) {
        infoSpan.textContent = 'None';
        return;
    }
    
    infoSpan.textContent = `${selectedNode.type} (${selectedNode.children.length} children)`;
    
    // Update transform inputs with current values
    if (selectedNode.transforms && selectedNode.transforms.length > 0) {
        const lastTransform = selectedNode.transforms[selectedNode.transforms.length - 1];
        if (lastTransform.type === gizmoMode) {
            document.getElementById('transformX').value = lastTransform.value[0] || 0;
            document.getElementById('transformY').value = lastTransform.value[1] || 0;
            document.getElementById('transformZ').value = lastTransform.value[2] || 0;
        }
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

// Transform mode buttons for 3D viewport
document.getElementById('translateModeBtn')?.addEventListener('click', () => {
    setTransformMode('translate');
});

document.getElementById('rotateModeBtn')?.addEventListener('click', () => {
    setTransformMode('rotate');
});

document.getElementById('scaleModeBtn')?.addEventListener('click', () => {
    setTransformMode('scale');
});

// Keyboard shortcuts for transform modes
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    switch(event.key.toLowerCase()) {
        case 'w':
            setTransformMode('translate');
            break;
        case 'e':
            setTransformMode('rotate');
            break;
        case 'r':
            setTransformMode('scale');
            break;
        case 'escape':
        case 'delete':
        case 'backspace':
            if (event.key === 'delete' || event.key === 'backspace') {
                event.preventDefault();
                deselectMeshObject();
            }
            break;
    }
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

// Hierarchy tab event listeners
document.getElementById('gizmoTranslate')?.addEventListener('click', () => {
    gizmoMode = 'translate';
    document.querySelectorAll('.gizmo-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('gizmoTranslate').classList.add('active');
    updateTransformInputLabels();
});

document.getElementById('gizmoRotate')?.addEventListener('click', () => {
    gizmoMode = 'rotate';
    document.querySelectorAll('.gizmo-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('gizmoRotate').classList.add('active');
    updateTransformInputLabels();
});

document.getElementById('gizmoScale')?.addEventListener('click', () => {
    gizmoMode = 'scale';
    document.querySelectorAll('.gizmo-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('gizmoScale').classList.add('active');
    updateTransformInputLabels();
});

document.getElementById('applyGizmoTransform')?.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node from the hierarchy tree');
        return;
    }
    
    const x = parseFloat(document.getElementById('transformX').value) || 0;
    const y = parseFloat(document.getElementById('transformY').value) || 0;
    const z = parseFloat(document.getElementById('transformZ').value) || 0;
    
    // Apply transform based on mode
    switch(gizmoMode) {
        case 'translate':
            selectedNode.position(x, y, z);
            break;
        case 'rotate':
            selectedNode.rotation(x, y, z);
            break;
        case 'scale':
            selectedNode.scale(x, y, z);
            break;
    }
    
    updateDisplay();
});

document.getElementById('deleteNodeBtn')?.addEventListener('click', () => {
    if (!selectedNode || selectedNode === currentMAC) {
        alert('Cannot delete root node or no node selected');
        return;
    }
    
    if (confirm('Delete selected node?')) {
        // Find and remove from parent
        removeNodeFromMAC(currentMAC, selectedNode);
        selectedNode = null;
        updateDisplay();
    }
});

document.getElementById('duplicateNodeBtn')?.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node to duplicate');
        return;
    }
    
    const clonedNode = selectedNode.clone();
    
    // If it's the root, replace current MAC
    if (selectedNode === currentMAC) {
        currentMAC = clonedNode;
    } else {
        // Add to parent (for now, add to root)
        currentMAC.children.push(clonedNode);
    }
    
    updateDisplay();
});

function updateTransformInputLabels() {
    const labels = document.querySelectorAll('.transform-input label');
    if (gizmoMode === 'scale') {
        labels[0].textContent = 'Scale X';
        labels[1].textContent = 'Scale Y';
        labels[2].textContent = 'Scale Z';
        // Set default scale values
        document.getElementById('transformX').value = 1;
        document.getElementById('transformY').value = 1;
        document.getElementById('transformZ').value = 1;
    } else if (gizmoMode === 'rotate') {
        labels[0].textContent = 'Rot X';
        labels[1].textContent = 'Rot Y';
        labels[2].textContent = 'Rot Z';
        document.getElementById('transformX').value = 0;
        document.getElementById('transformY').value = 0;
        document.getElementById('transformZ').value = 0;
    } else {
        labels[0].textContent = 'X';
        labels[1].textContent = 'Y';
        labels[2].textContent = 'Z';
        document.getElementById('transformX').value = 0;
        document.getElementById('transformY').value = 0;
        document.getElementById('transformZ').value = 0;
    }
}

function removeNodeFromMAC(mac, nodeToRemove) {
    // Remove from children
    const index = mac.children.indexOf(nodeToRemove);
    if (index > -1) {
        mac.children.splice(index, 1);
        return true;
    }
    
    // Recursively search in children
    for (const child of mac.children) {
        if (removeNodeFromMAC(child, nodeToRemove)) {
            return true;
        }
    }
    
    return false;
}

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
