/**
 * Level Editor - Main entry point for level editing interface
 * Uses the world-rpg setup with added level editing capabilities
 */
import * as THREE from 'three';
import { LevelEditor } from './modules/LevelEditor.js';
import { WorldSetup } from './modules/WorldSetup.js';
import { NPCFactory } from './modules/NPCFactory.js';
import { MonsterFactory } from './modules/MonsterFactory.js';
import { FBXCharacterLoader } from './modules/FBXCharacterLoader.js';
import { CameraController } from './modules/CameraController.js';

// ===== INITIALIZE WORLD SETUP =====
const worldSetup = new WorldSetup({ useAdvancedTerrain: true });
const { scene, camera, renderer, terrainGenerator } = worldSetup.init(document.getElementById('canvas-container'));

// ===== INITIALIZE FACTORIES =====
const characterLoader = new FBXCharacterLoader();
const npcFactory = new NPCFactory(characterLoader);
const monsterFactory = new MonsterFactory(scene);

// ===== INITIALIZE CAMERA CONTROLLER =====
// Create a dummy character group for camera controller (it's not used in editor mode)
const dummyCharacterGroup = new THREE.Group();
dummyCharacterGroup.position.set(0, 0, 0);
scene.add(dummyCharacterGroup);
const cameraController = new CameraController(camera, renderer, dummyCharacterGroup);

// ===== INITIALIZE LEVEL EDITOR =====
const levelEditor = new LevelEditor(
    scene,
    terrainGenerator,
    npcFactory,
    monsterFactory,
    camera,
    renderer
);

// ===== AVAILABLE NPC TYPES =====
const availableNPCTypes = {
    quest_giver: { type: 'quest_giver', name: 'Quest Giver', modelName: 'paladin', hp: 100, damage: 10, xp: 50 },
    merchant: { type: 'merchant', name: 'Merchant', modelName: 'peasant', hp: 80, damage: 5, xp: 30 },
    guard: { type: 'guard', name: 'Guard', modelName: 'paladin', hp: 150, damage: 15, xp: 60 },
    hermit: { type: 'hermit', name: 'Hermit', modelName: 'baelin', hp: 120, damage: 8, xp: 40 },
    villager: { type: 'villager', name: 'Villager', modelName: 'peasant', hp: 60, damage: 3, xp: 20 }
};

// ===== AVAILABLE MONSTER TYPES =====
const availableMonsterTypes = {
    goblin: { type: 'goblin', hp: 40, damage: 8, xp: 25, stance: 'defensive' },
    orc: { type: 'orc', hp: 80, damage: 15, xp: 50, stance: 'aggressive' },
    spider: { type: 'spider', hp: 30, damage: 6, xp: 20, stance: 'defensive' },
    wolf: { type: 'wolf', hp: 50, damage: 12, xp: 35, stance: 'aggressive' },
    bear: { type: 'bear', hp: 120, damage: 20, xp: 75, stance: 'aggressive' },
    dragon: { type: 'dragon', hp: 500, damage: 40, xp: 500, stance: 'aggressive', isBoss: true }
};

// ===== UI ELEMENTS =====
const toggleBtn = document.getElementById('toggle-editor');
const modeButtons = document.querySelectorAll('.mode-btn');
const brushSizeInput = document.getElementById('brush-size');
const brushSizeValue = document.getElementById('brush-size-value');
const brushStrengthInput = document.getElementById('brush-strength');
const brushStrengthValue = document.getElementById('brush-strength-value');
const npcTypeSelect = document.getElementById('npc-type');
const npcModelSelect = document.getElementById('npc-model');
const npcNameInput = document.getElementById('npc-name');
const monsterTypeSelect = document.getElementById('monster-type');
const monsterStanceSelect = document.getElementById('monster-stance');
const saveLevelBtn = document.getElementById('save-level');
const loadLevelInput = document.getElementById('load-level-input');
const clearLevelBtn = document.getElementById('clear-level');
const levelNameInput = document.getElementById('level-name');
const statusMessage = document.getElementById('status-message');

// Control sections
const terrainControls = document.getElementById('terrain-controls');
const npcControls = document.getElementById('npc-controls');
const monsterControls = document.getElementById('monster-controls');
const questControls = document.getElementById('quest-controls');

// ===== EVENT LISTENERS =====

// Toggle editor on/off
toggleBtn.addEventListener('click', () => {
    const enabled = levelEditor.toggle();
    toggleBtn.classList.toggle('active', enabled);
    toggleBtn.textContent = enabled ? '🛑 Disable Editor' : '🛠️ Enable Editor';
    showStatus(enabled ? 'Level Editor Enabled' : 'Level Editor Disabled');
});

// Mode selection
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set editor mode
        const mode = btn.dataset.mode;
        levelEditor.setMode(mode);
        
        // Show/hide appropriate controls
        terrainControls.style.display = mode === 'terrain' ? 'block' : 'none';
        npcControls.style.display = mode === 'npc' ? 'block' : 'none';
        monsterControls.style.display = mode === 'monster' ? 'block' : 'none';
        questControls.style.display = mode === 'quest' ? 'block' : 'none';
        
        showStatus(`Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    });
});

// Brush size
brushSizeInput.addEventListener('input', (e) => {
    const size = parseFloat(e.target.value);
    levelEditor.setBrushSize(size);
    brushSizeValue.textContent = size.toFixed(1);
});

// Brush strength
brushStrengthInput.addEventListener('input', (e) => {
    const strength = parseFloat(e.target.value);
    levelEditor.setBrushStrength(strength);
    brushStrengthValue.textContent = strength.toFixed(1);
});

// Paint mode checkbox
const paintModeCheckbox = document.getElementById('paint-mode');
paintModeCheckbox.addEventListener('change', (e) => {
    levelEditor.setPaintMode(e.target.checked);
    showStatus(e.target.checked ? 'Paint Mode Enabled' : 'Height Mode Enabled');
});

// Terrain color picker
const terrainColorInput = document.getElementById('terrain-color');
terrainColorInput.addEventListener('input', (e) => {
    levelEditor.setPaintColor(e.target.value);
});

// NPC type selection
npcTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type && availableNPCTypes[type]) {
        const npcType = availableNPCTypes[type];
        npcType.modelName = npcModelSelect.value || 'peasant';
        npcType.name = npcNameInput.value || npcType.name;
        levelEditor.setSelectedNPC(npcType);
    }
});

// NPC model selection
npcModelSelect.addEventListener('change', (e) => {
    const type = npcTypeSelect.value;
    if (type && availableNPCTypes[type]) {
        const npcType = availableNPCTypes[type];
        npcType.modelName = e.target.value || 'peasant';
        npcType.name = npcNameInput.value || npcType.name;
        levelEditor.setSelectedNPC(npcType);
    }
});

// NPC name input
npcNameInput.addEventListener('input', (e) => {
    const type = npcTypeSelect.value;
    if (type && availableNPCTypes[type]) {
        const npcType = availableNPCTypes[type];
        npcType.modelName = npcModelSelect.value || 'peasant';
        npcType.name = e.target.value || npcType.name;
        levelEditor.setSelectedNPC(npcType);
    }
});

// Monster type selection
monsterTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type && availableMonsterTypes[type]) {
        const monsterType = { ...availableMonsterTypes[type] };
        monsterType.stance = monsterStanceSelect.value;
        levelEditor.setSelectedMonster(monsterType);
    }
});

// Monster stance selection
monsterStanceSelect.addEventListener('change', (e) => {
    const type = monsterTypeSelect.value;
    if (type && availableMonsterTypes[type]) {
        const monsterType = { ...availableMonsterTypes[type] };
        monsterType.stance = e.target.value;
        levelEditor.setSelectedMonster(monsterType);
    }
});

// Save level
saveLevelBtn.addEventListener('click', () => {
    const name = levelNameInput.value || 'custom_level';
    levelEditor.saveLevel(name);
    showStatus(`Level saved: ${name}.json`);
    updateLevelInfo();
});

// Load level
loadLevelInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target.result;
                const success = levelEditor.loadLevel(json);
                if (success) {
                    showStatus(`Level loaded: ${file.name}`);
                    updateLevelInfo();
                } else {
                    showStatus('Failed to load level!', true);
                }
            } catch (error) {
                console.error('Load error:', error);
                showStatus('Failed to load level!', true);
            }
        };
        reader.readAsText(file);
    }
});

// Clear level
clearLevelBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the level? This cannot be undone.')) {
        levelEditor.clearLevel();
        showStatus('Level cleared');
        updateLevelInfo();
    }
});

// Keyboard shortcut to toggle editor
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        // Only toggle if not typing in an input
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            toggleBtn.click();
        }
    }
});

// ===== HELPER FUNCTIONS =====

function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.borderColor = isError ? '#ef4444' : '#4ade80';
    statusMessage.classList.add('show');
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

function updateLevelInfo() {
    const levelData = levelEditor.getLevelData();
    document.getElementById('npc-count').textContent = levelData.npcs.length;
    document.getElementById('monster-count').textContent = levelData.monsters.length;
    document.getElementById('quest-count').textContent = levelData.quests.length;
}

// ===== KEYBOARD CONTROLS FOR CAMERA MOVEMENT =====
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ===== ANIMATION LOOP =====
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);
    
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Camera movement with WASD keys
    const moveSpeed = 10; // Units per second
    const forward = keys['w'] || keys['arrowup'];
    const backward = keys['s'] || keys['arrowdown'];
    const left = keys['a'] || keys['arrowleft'];
    const right = keys['d'] || keys['arrowright'];
    const up = keys[' ']; // Space key - Move camera up
    const down = keys['shift']; // Shift key - Move camera down (when not clicking)
    
    // Only allow vertical movement if mouse is not down (to avoid conflict with terrain lowering)
    const allowVertical = !levelEditor || !levelEditor.enabled || !document.querySelector('canvas:hover');
    
    if (forward || backward || left || right || (up && allowVertical) || (down && allowVertical && !keys['click'])) {
        const cameraAngle = cameraController.getHorizontalAngle();
        let moveX = 0;
        let moveZ = 0;
        let moveY = 0;
        
        if (forward) {
            moveX -= Math.sin(cameraAngle);
            moveZ -= Math.cos(cameraAngle);
        }
        if (backward) {
            moveX += Math.sin(cameraAngle);
            moveZ += Math.cos(cameraAngle);
        }
        if (left) {
            moveX -= Math.cos(cameraAngle);
            moveZ += Math.sin(cameraAngle);
        }
        if (right) {
            moveX += Math.cos(cameraAngle);
            moveZ -= Math.sin(cameraAngle);
        }
        if (up && allowVertical) {
            moveY += 1;
        }
        if (down && allowVertical) {
            moveY -= 1;
        }
        
        // Normalize horizontal movement vector
        const lengthXZ = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (lengthXZ > 0) {
            moveX /= lengthXZ;
            moveZ /= lengthXZ;
        }
        
        // Move the dummy character group (camera follows it)
        dummyCharacterGroup.position.x += moveX * moveSpeed * deltaTime;
        dummyCharacterGroup.position.z += moveZ * moveSpeed * deltaTime;
        dummyCharacterGroup.position.y += moveY * moveSpeed * deltaTime;
    }
    
    // Update camera controller
    cameraController.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// ===== INITIALIZATION =====
async function init() {
    console.log('Initializing Level Editor...');
    
    // Load character assets
    await characterLoader.loadAllCharacters((progress) => {
        console.log(`Loading assets... ${progress}%`);
    });
    
    console.log('Level Editor ready!');
    showStatus('Level Editor Ready! Press E or click the button to start editing.');
    updateLevelInfo();
    
    // Start animation loop
    animate(0);
}

// Start initialization
init();
