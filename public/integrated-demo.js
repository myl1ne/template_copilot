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
camera.position.set(0, 3, 8);

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
controls.minDistance = 5;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x4ade80, 1, 15);
pointLight1.position.set(-5, 3, 3);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x60a5fa, 1, 15);
pointLight2.position.set(5, 3, -3);
scene.add(pointLight2);

// Ground
const groundGeometry = new THREE.CircleGeometry(20, 64);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const gridHelper = new THREE.GridHelper(30, 30, 0x4ade80, 0x2d3748);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Create character
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

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 150;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 4;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: 0x4ade80,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particles.position.y = 1.5;
characterGroup.add(particles);

scene.add(characterGroup);

// Enemy placeholder (goblin)
let enemyGroup = null;

function createEnemy(type = 'warrior') {
    const enemy = new THREE.Group();
    
    const size = type === 'chief' ? 1.5 : 1.0;
    const color = type === 'chief' ? 0x8b0000 : 0x556b2f;
    
    // Body
    const enemyBody = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.3 * size, 0.8 * size, 4, 8),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })
    );
    enemyBody.position.y = 0.9 * size;
    enemyBody.castShadow = true;
    enemy.add(enemyBody);
    
    // Head
    const enemyHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.25 * size, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.9 })
    );
    enemyHead.position.y = 1.6 * size;
    enemyHead.castShadow = true;
    enemy.add(enemyHead);
    
    // Weapon
    const weapon = new THREE.Mesh(
        new THREE.BoxGeometry(0.15 * size, 0.8 * size, 0.1 * size),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    weapon.position.set(0.5 * size, 1.0 * size, 0);
    weapon.rotation.z = Math.PI / 6;
    weapon.castShadow = true;
    enemy.add(weapon);
    
    enemy.position.set(0, 0, -5);
    return enemy;
}

// Quest state
let currentStep = 0;
let isAutoPlaying = false;
let character = {
    hp: 150,
    maxHp: 150,
    mana: 50,
    maxMana: 50
};

// Quest steps with 3D scene changes
const questSteps = [
    {
        name: 'Quest Accepted',
        sceneLabel: '⚔️ Quest Accepted!',
        execute: () => {
            addLog('quest', 'Quest accepted: The Village Rescue');
            updateQuestStep('Step 1: Quest Accepted', 'The Village Elder needs your help');
            showSceneLabel('⚔️ Quest Accepted!');
        }
    },
    {
        name: 'Travel to Goblin Camp',
        sceneLabel: '🏕️ Goblin Camp',
        execute: () => {
            addLog('quest', 'Traveling to the goblin camp...');
            // Darken scene, change fog
            scene.background.setHex(0x2a1a1a);
            scene.fog.color.setHex(0x2a1a1a);
            showSceneLabel('🏕️ Arriving at Goblin Camp...');
            
            setTimeout(() => {
                addLog('success', 'Arrived at the goblin camp!');
                completeObjective(0);
                updateQuestStep('Step 2: At Goblin Camp', 'Enemies ahead!');
                // Add enemy
                if (!enemyGroup) {
                    enemyGroup = createEnemy('warrior');
                    scene.add(enemyGroup);
                }
            }, 1500);
        }
    },
    {
        name: 'Fight Warrior 1',
        sceneLabel: '⚔️ Combat!',
        execute: () => {
            showSceneLabel('⚔️ Goblin Warrior #1!');
            addLog('combat', 'A goblin warrior attacks!');
            
            // Animate enemy attack
            if (enemyGroup) {
                const targetZ = enemyGroup.position.z + 1;
                animateEnemyAttack(enemyGroup, targetZ);
            }
            
            setTimeout(() => {
                character.hp -= 5;
                updateUI();
                addLog('combat', 'Goblin hits you for 15 damage! (After armor: 5)');
            }, 800);
            
            setTimeout(() => {
                // Character attacks
                swordGroup.rotation.z = -Math.PI / 2;
                setTimeout(() => { swordGroup.rotation.z = -Math.PI / 4; }, 300);
                addLog('combat', 'You strike back!');
            }, 1500);
            
            setTimeout(() => {
                if (enemyGroup) {
                    scene.remove(enemyGroup);
                    enemyGroup = null;
                }
                addLog('success', 'Goblin warrior #1 defeated! (+100 XP)');
            }, 2200);
        }
    },
    {
        name: 'Fight Warrior 2',
        sceneLabel: '⚔️ Combat!',
        execute: () => {
            enemyGroup = createEnemy('warrior');
            enemyGroup.position.set(1, 0, -5);
            scene.add(enemyGroup);
            showSceneLabel('⚔️ Goblin Warrior #2!');
            addLog('combat', 'Another goblin warrior appears!');
            
            setTimeout(() => {
                character.hp -= 10;
                updateUI();
                addLog('combat', 'Goblin hits you for 20 damage! (After armor: 10)');
            }, 800);
            
            setTimeout(() => {
                swordGroup.rotation.z = -Math.PI / 2;
                setTimeout(() => { swordGroup.rotation.z = -Math.PI / 4; }, 300);
                addLog('combat', 'Critical hit with Power Strike!');
            }, 1500);
            
            setTimeout(() => {
                if (enemyGroup) {
                    scene.remove(enemyGroup);
                    enemyGroup = null;
                }
                addLog('success', 'Goblin warrior #2 defeated! (+100 XP)');
            }, 2200);
        }
    },
    {
        name: 'Fight Warrior 3',
        sceneLabel: '⚔️ Combat!',
        execute: () => {
            enemyGroup = createEnemy('warrior');
            enemyGroup.position.set(-1, 0, -5);
            scene.add(enemyGroup);
            showSceneLabel('⚔️ Goblin Warrior #3!');
            addLog('combat', 'The last warrior charges!');
            
            setTimeout(() => {
                character.hp -= 8;
                updateUI();
                addLog('combat', 'Goblin hits you for 18 damage! (After armor: 8)');
            }, 800);
            
            setTimeout(() => {
                swordGroup.rotation.z = -Math.PI / 2;
                setTimeout(() => { swordGroup.rotation.z = -Math.PI / 4; }, 300);
                addLog('combat', 'Final blow!');
            }, 1500);
            
            setTimeout(() => {
                if (enemyGroup) {
                    scene.remove(enemyGroup);
                    enemyGroup = null;
                }
                addLog('success', 'All warriors defeated! (+100 XP)');
                completeObjective(1);
            }, 2200);
        }
    },
    {
        name: 'Heal',
        sceneLabel: '💚 Healing...',
        execute: () => {
            showSceneLabel('💚 Resting...');
            addLog('quest', 'Taking a moment to rest...');
            
            // Brighten scene slightly
            pointLight1.intensity = 1.5;
            pointLight2.intensity = 1.5;
            
            setTimeout(() => {
                character.hp += 40;
                if (character.hp > character.maxHp) character.hp = character.maxHp;
                updateUI();
                addLog('success', 'HP restored by 40 points!');
                pointLight1.intensity = 1;
                pointLight2.intensity = 1;
            }, 1000);
        }
    },
    {
        name: 'Boss Fight',
        sceneLabel: '👹 BOSS FIGHT!',
        execute: () => {
            enemyGroup = createEnemy('chief');
            scene.add(enemyGroup);
            showSceneLabel('👹 GOBLIN CHIEF!');
            addLog('combat', '👹 THE GOBLIN CHIEF APPEARS!');
            
            // Red lighting for boss
            pointLight1.color.setHex(0xff0000);
            pointLight2.color.setHex(0xff0000);
            
            setTimeout(() => {
                character.hp -= 20;
                updateUI();
                addLog('combat', 'Chief swings his axe! 30 damage! (After armor: 20)');
            }, 1000);
            
            setTimeout(() => {
                swordGroup.rotation.z = -Math.PI / 2;
                setTimeout(() => { swordGroup.rotation.z = -Math.PI / 4; }, 300);
                addLog('combat', 'You use Power Strike! 50 damage!');
            }, 2000);
            
            setTimeout(() => {
                character.hp -= 15;
                updateUI();
                addLog('combat', 'Chief counters! 25 damage! (After armor: 15)');
            }, 3000);
            
            setTimeout(() => {
                character.hp += 30;
                if (character.hp > character.maxHp) character.hp = character.maxHp;
                updateUI();
                addLog('combat', 'You use Second Wind! Healing...');
            }, 4000);
            
            setTimeout(() => {
                swordGroup.rotation.z = -Math.PI;
                setTimeout(() => { swordGroup.rotation.z = -Math.PI / 4; }, 500);
                addLog('combat', 'FINAL STRIKE!');
            }, 4800);
            
            setTimeout(() => {
                if (enemyGroup) {
                    scene.remove(enemyGroup);
                    enemyGroup = null;
                }
                addLog('success', '🎉 BOSS DEFEATED! (+500 XP, Goblin Chief\'s Axe)');
                completeObjective(2);
                pointLight1.color.setHex(0x4ade80);
                pointLight2.color.setHex(0x60a5fa);
            }, 5500);
        }
    },
    {
        name: 'Return to Village',
        sceneLabel: '🏠 Returning Home',
        execute: () => {
            showSceneLabel('🏠 Returning to Village...');
            addLog('quest', 'Returning to the village...');
            
            // Restore original scene
            scene.background.setHex(0x1a1a2e);
            scene.fog.color.setHex(0x1a1a2e);
            
            setTimeout(() => {
                addLog('success', 'You arrive back at the village!');
                addLog('quest', 'The Village Elder greets you warmly.');
                completeObjective(3);
                updateQuestStep('Step 5: Returned to Village', 'Talk to the Elder');
            }, 1500);
        }
    },
    {
        name: 'Quest Complete',
        sceneLabel: '✨ QUEST COMPLETE!',
        execute: () => {
            showSceneLabel('✨ QUEST COMPLETE! ✨');
            addLog('success', '✨ QUEST COMPLETE! ✨');
            addLog('success', 'Rewards: 500 XP, 100 Gold, Goblin Chief\'s Axe');
            addLog('success', 'The village is safe!');
            updateQuestStep('Quest Complete!', 'Well done, hero!');
            document.getElementById('start-btn').disabled = false;
            document.getElementById('auto-btn').disabled = true;
        }
    }
];

function animateEnemyAttack(enemy, targetZ) {
    const startZ = enemy.position.z;
    const duration = 500;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        enemy.position.z = startZ + (targetZ - startZ) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

function showSceneLabel(text) {
    const label = document.getElementById('scene-label');
    label.textContent = text;
    label.classList.add('show');
    setTimeout(() => {
        label.classList.remove('show');
    }, 2000);
}

function updateUI() {
    const hpPercent = (character.hp / character.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-bar').textContent = Math.round(hpPercent) + '%';
    document.getElementById('hp-text').textContent = `${character.hp} / ${character.maxHp}`;
    
    const manaPercent = (character.mana / character.maxMana) * 100;
    document.getElementById('mana-bar').style.width = manaPercent + '%';
    document.getElementById('mana-bar').textContent = Math.round(manaPercent) + '%';
    document.getElementById('mana-text').textContent = `${character.mana} / ${character.maxMana}`;
}

function addLog(type, message) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.appendChild(entry);
    logContent.parentElement.scrollTop = logContent.parentElement.scrollHeight;
}

function completeObjective(index) {
    const obj = document.getElementById(`obj-${index + 1}`);
    if (obj) obj.classList.add('completed');
}

function updateQuestStep(title, subtitle) {
    document.getElementById('quest-step').textContent = title;
    const status = document.getElementById('quest-status');
    const p = status.querySelector('p');
    p.textContent = subtitle;
}

function startQuest() {
    if (currentStep >= questSteps.length) {
        resetQuest();
        return;
    }
    
    document.getElementById('start-btn').disabled = true;
    document.getElementById('auto-btn').disabled = false;
    
    if (currentStep < questSteps.length) {
        questSteps[currentStep].execute();
        currentStep++;
        
        if (currentStep < questSteps.length) {
            setTimeout(() => {
                document.getElementById('start-btn').disabled = false;
                document.getElementById('start-btn').textContent = '▶️ Next Step';
            }, 3000);
        }
    }
}

function autoPlay() {
    if (isAutoPlaying) return;
    
    isAutoPlaying = true;
    document.getElementById('auto-btn').disabled = true;
    document.getElementById('start-btn').disabled = true;
    addLog('quest', '⚡ AUTO-PLAY ENABLED');
    
    function playNext() {
        if (currentStep >= questSteps.length) {
            isAutoPlaying = false;
            return;
        }
        
        questSteps[currentStep].execute();
        currentStep++;
        
        if (currentStep < questSteps.length) {
            setTimeout(playNext, 4000);
        } else {
            isAutoPlaying = false;
        }
    }
    
    playNext();
}

function resetQuest() {
    currentStep = 0;
    isAutoPlaying = false;
    character.hp = character.maxHp;
    character.mana = character.maxMana;
    
    // Reset scene
    scene.background.setHex(0x1a1a2e);
    scene.fog.color.setHex(0x1a1a2e);
    pointLight1.color.setHex(0x4ade80);
    pointLight2.color.setHex(0x60a5fa);
    pointLight1.intensity = 1;
    pointLight2.intensity = 1;
    
    if (enemyGroup) {
        scene.remove(enemyGroup);
        enemyGroup = null;
    }
    
    updateUI();
    document.getElementById('log-content').innerHTML = '<div class="log-entry">Quest system ready. Click Start Quest to begin!</div>';
    document.querySelectorAll('.objective').forEach(obj => obj.classList.remove('completed'));
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-btn').textContent = '▶️ Start Quest';
    document.getElementById('auto-btn').disabled = true;
    updateQuestStep('Ready to Begin', 'Accept the quest to start your adventure');
    addLog('quest', 'Quest reset successfully!');
}

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Rotate character
    characterGroup.rotation.y += 0.003;
    
    // Animate sword
    if (!isAutoPlaying) {
        swordGroup.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.1;
    }
    
    // Animate particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i) * 0.002;
        if (positions[i3 + 1] > 3) positions[i3 + 1] = -1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.001;
    
    // Animate lights
    pointLight1.intensity = 0.8 + Math.sin(time) * 0.2;
    pointLight2.intensity = 0.8 + Math.cos(time) * 0.2;
    
    // Rotate enemy if exists
    if (enemyGroup) {
        enemyGroup.rotation.y += 0.01;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Make functions available globally
window.startQuest = startQuest;
window.autoPlay = autoPlay;
window.resetQuest = resetQuest;

// Start animation
animate();
updateUI();

console.log('RPG Engine - Integrated 3D Quest Demo Loaded');
