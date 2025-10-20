import * as THREE from 'three';
import { FBXCharacterLoader } from './modules/FBXCharacterLoader.js';
import { NPCFactory } from './modules/NPCFactory.js';
import { EnvironmentFactory } from './modules/EnvironmentFactory.js';
import { CameraController } from './modules/CameraController.js';
import { GoblinFactory } from './modules/GoblinFactory.js';
import { MonsterFactory } from './modules/MonsterFactory.js';
import { QuestFactory } from './modules/QuestFactory.js';

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ===== LIGHTING =====
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(50, 50, 50);
sunLight.castShadow = true;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// ===== GROUND =====
const groundSize = 100;
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a7d44,
    roughness: 0.8,
    metalness: 0.2
});

// Add terrain variation
const positions = groundGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const height = Math.sin(x * 0.1) * 0.5 + Math.cos(y * 0.1) * 0.5;
    positions.setZ(i, height);
}
positions.needsUpdate = true;
groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(groundSize, 50, 0x000000, 0x000000);
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// ===== PLAYER CHARACTER =====
const characterGroup = new THREE.Group();
characterGroup.position.set(0, 0, 0);

// Body
const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7, metalness: 0.3 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1.3;
body.castShadow = true;
characterGroup.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8, metalness: 0.1 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 2.3;
head.castShadow = true;
characterGroup.add(head);

// Helmet
const helmetGeometry = new THREE.ConeGeometry(0.35, 0.4, 8);
const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.4, metalness: 0.8 });
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
const hiltMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6, metalness: 0.4 });
const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
hilt.castShadow = true;
swordGroup.add(hilt);

swordGroup.position.set(0.7, 1.3, 0);
swordGroup.rotation.z = -Math.PI / 4;
characterGroup.add(swordGroup);

scene.add(characterGroup);

// ===== PLAYER STATE =====
const player = {
    hp: 150,
    maxHp: 150,
    stamina: 100,
    maxStamina: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    velocity: { x: 0, z: 0 },
    speed: 3,
    runSpeed: 6,
    isRunning: false,
    animationState: 'idle',
    animationTime: 0
};

// ===== ITEM CLASS =====
class Item {
    constructor(id, name, icon, type, value, stats = {}) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.value = value;
        this.stats = stats;
        this.slot = stats.slot || null;
        this.quantity = 1;
    }
}

// ===== INVENTORY SYSTEM =====
const playerInventory = {
    gold: 100,
    maxSlots: 20,
    items: [],
    equipment: {
        head: null,
        chest: null,
        legs: null,
        weapon: null,
        shield: null
    },
    
    addItem(item) {
        if (this.items.length >= this.maxSlots) {
            addMessage('Inventory full!', 'warning');
            return false;
        }
        this.items.push(item);
        addMessage(`Obtained ${item.icon} ${item.name}`, 'success');
        return true;
    },
    
    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    },
    
    addGold(amount) {
        this.gold += amount;
        addMessage(`+${amount} 💰 gold`, 'success');
    },
    
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
};

// Initialize with starter items
playerInventory.addItem(new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }));
playerInventory.addItem(new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }));

// ===== QUEST SYSTEM =====
const questFactory = new QuestFactory();
const quests = questFactory.createStandardQuests();

let activeQuests = []; // Changed to array to track multiple quests

function updateQuestProgress(objectiveId, amount = 1) {
    // Update progress for all active quests
    for (const quest of activeQuests) {
        if (!quest.active || quest.completed) continue;
        
        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (objective && !objective.completed) {
            objective.current = Math.min(objective.current + amount, objective.target);
            if (objective.current >= objective.target) {
                objective.completed = true;
                addMessage(`✅ Quest Updated: ${objective.description}`, 'success');
            } else {
                addMessage(`Quest Progress: ${objective.description} (${objective.current}/${objective.target})`, 'info');
            }
            updateQuestUI();
            
            if (quest.objectives.every(obj => obj.completed)) {
                quest.completed = true;
                playerInventory.addGold(quest.rewards.gold);
                addMessage(`🎉 QUEST COMPLETE! Rewards: ${quest.rewards.xp} XP, ${quest.rewards.gold} Gold`, 'success');
                updateQuestUI();
                
                if (quest.id === 'village_rescue') {
                    quests['merchant_delivery'].available = true;
                    addMessage(`📜 New quest available from the Traveling Merchant!`, 'info');
                }
            }
        }
    }
}

function activateQuest(questId) {
    const quest = quests[questId];
    if (quest && !quest.active && !quest.completed) {
        quest.active = true;
        activeQuests.push(quest);
        addMessage(`📜 New Quest: ${quest.name}`, 'success');
        updateQuestUI();
        updateMinimap(); // Update minimap when quest is added
    }
}

// ===== MODULES INITIALIZATION =====
const characterLoader = new FBXCharacterLoader();
const npcFactory = new NPCFactory(characterLoader);
const environmentFactory = new EnvironmentFactory(scene);
const cameraController = new CameraController(camera, renderer, characterGroup);
const goblinFactory = new GoblinFactory(scene, characterLoader.loadedModels);
const monsterFactory = new MonsterFactory(scene);

const npcs = [];
const environmentObjects = [];
const goblins = [];
const monsters = [];

// ===== UI FUNCTIONS =====
function updateUI() {
    const hpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-bar').textContent = Math.round(hpPercent) + '%';
    document.getElementById('hp-text').textContent = `${Math.round(player.hp)} / ${player.maxHp}`;
    
    const staminaPercent = (player.stamina / player.maxStamina) * 100;
    document.getElementById('stamina-bar').style.width = staminaPercent + '%';
    document.getElementById('stamina-bar').textContent = Math.round(staminaPercent) + '%';
    document.getElementById('stamina-text').textContent = `${Math.round(player.stamina)} / ${player.maxStamina}`;
    
    document.getElementById('pos-text').textContent = `${Math.round(player.position.x)}, ${Math.round(player.position.z)}`;
}

function addMessage(text, type = 'info') {
    const messages = document.getElementById('messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    messages.appendChild(message);
    messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
    
    while (messages.children.length > 10) {
        messages.removeChild(messages.firstChild);
    }
}

function updateQuestUI() {
    const questPanel = document.getElementById('quest-panel');
    if (!questPanel) return;
    
    if (activeQuests.length > 0) {
        questPanel.innerHTML = activeQuests.map(quest => `
            <div class="quest-header ${quest.completed ? 'completed' : ''}" style="margin-bottom: 15px;">
                <div class="quest-title">📜 ${quest.name}</div>
                <div class="quest-desc">${quest.description}</div>
            </div>
            <div class="objectives">
                ${quest.objectives.map(obj => `
                    <div class="objective ${obj.completed ? 'completed' : ''}">
                        ${obj.completed ? '✅' : '⭕'} ${obj.description}
                        <span class="progress">(${obj.current}/${obj.target})</span>
                    </div>
                `).join('')}
            </div>
            ${quest.completed ? `
                <div class="quest-rewards">
                    🎁 Rewards: ${quest.rewards.xp} XP, ${quest.rewards.gold} Gold
                </div>
            ` : ''}
            <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        `).join('');
    } else {
        questPanel.innerHTML = `
            <div class="quest-header">
                <div class="quest-title">📜 No Active Quests</div>
                <div class="quest-desc">Visit NPCs to find quests!</div>
            </div>
        `;
    }
}

// Update minimap
function updateMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 3; // World units per pixel
    const worldSize = width * scale / 2; // Half size since centered
    
    // Clear canvas
    ctx.fillStyle = 'rgba(20, 30, 20, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Function to convert world coords to minimap coords
    const worldToMap = (x, z) => {
        return {
            x: (x / scale) + width / 2,
            y: (z / scale) + height / 2
        };
    };
    
    // Draw quest objectives
    for (const quest of activeQuests) {
        if (quest.completed) continue;
        
        // Draw quest markers based on quest type
        if (quest.id === 'village_rescue' || quest.id === 'skeleton_threat' || 
            quest.id === 'spider_cave' || quest.id === 'wolf_pack' || quest.id === 'bandit_camp') {
            // Draw monster locations
            const locations = {
                'village_rescue': [{ x: -20, z: -20 }],
                'skeleton_threat': [{ x: 30, z: 10 }],
                'spider_cave': [{ x: 25, z: -25 }],
                'wolf_pack': [{ x: -30, z: 30 }],
                'bandit_camp': [{ x: 10, z: -30 }] // Example location
            };
            
            const locs = locations[quest.id];
            if (locs) {
                locs.forEach(loc => {
                    const pos = worldToMap(loc.x, loc.z);
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
            }
        }
        
        // Draw NPC locations for delivery/return quests
        if (quest.returnTo) {
            const npcLocations = {
                'Village Elder': { x: 10, z: 10 },
                'Town Guard': { x: 15, z: 15 },
                'Forest Hermit': { x: -25, z: -25 },
                'Traveling Merchant': { x: -10, z: 10 }
            };
            
            const npcLoc = npcLocations[quest.returnTo];
            if (npcLoc) {
                const pos = worldToMap(npcLoc.x, npcLoc.z);
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Draw player position
    const playerPos = worldToMap(player.position.x, player.position.z);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw player direction indicator
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerPos.x, playerPos.y);
    ctx.lineTo(
        playerPos.x + Math.sin(player.rotation) * 8,
        playerPos.y + Math.cos(player.rotation) * 8
    );
    ctx.stroke();
}

function updateInventoryUI() {
    document.getElementById('gold-amount').textContent = playerInventory.gold;
    document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
    document.getElementById('inv-count').textContent = playerInventory.items.length;
    document.getElementById('inv-max').textContent = playerInventory.maxSlots;
    
    const invGrid = document.getElementById('inventory-grid');
    invGrid.innerHTML = '';
    
    playerInventory.items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `
            <div class="icon">${item.icon}</div>
            <div class="name">${item.name}</div>
        `;
        slot.onclick = () => useItem(item);
        invGrid.appendChild(slot);
    });
    
    for (let i = playerInventory.items.length; i < playerInventory.maxSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        invGrid.appendChild(slot);
    }
    
    const eqGrid = document.getElementById('equipment-grid');
    eqGrid.innerHTML = '';
    
    const slots = ['head', 'chest', 'legs', 'weapon', 'shield'];
    slots.forEach(slotName => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        const item = playerInventory.equipment[slotName];
        if (item) {
            slot.innerHTML = `
                <div class="icon">${item.icon}</div>
                <div class="name">${item.name}</div>
            `;
        } else {
            slot.innerHTML = `<div class="name">${slotName}</div>`;
        }
        eqGrid.appendChild(slot);
    });
}

function useItem(item) {
    if (item.type === 'consumable') {
        if (item.stats.healing) {
            player.hp = Math.min(player.maxHp, player.hp + item.stats.healing);
            addMessage(`Used ${item.icon} ${item.name}, restored ${item.stats.healing} HP`, 'success');
            updateUI();
        }
        playerInventory.removeItem(item.id);
        updateInventoryUI();
    } else if (item.type === 'weapon' || item.type === 'armor') {
        if (item.slot) {
            const existingItem = playerInventory.equipment[item.slot];
            if (existingItem) {
                playerInventory.addItem(existingItem);
            }
            playerInventory.equipment[item.slot] = item;
            playerInventory.removeItem(item.id);
            addMessage(`Equipped ${item.icon} ${item.name}`, 'success');
            updateInventoryUI();
        }
    }
}

function openInventory() {
    document.getElementById('inventory-panel').classList.add('show');
    updateInventoryUI();
}

function closeInventory() {
    document.getElementById('inventory-panel').classList.remove('show');
}

// Merchant inventory
const merchantInventory = [
    new Item('health_pot', 'Health Potion', '🧪', 'consumable', 50, { healing: 50 }),
    new Item('mana_pot', 'Mana Potion', '🔮', 'consumable', 40, { manaRestore: 30 }),
    new Item('iron_sword', 'Iron Sword', '🗡️', 'weapon', 100, { slot: 'weapon', damage: 15 }),
    new Item('steel_helm', 'Steel Helmet', '⛑️', 'armor', 80, { slot: 'head', armor: 5 }),
    new Item('bread', 'Bread', '🍞', 'consumable', 5, { healing: 10 }),
];

function openTrading(npc) {
    const panel = document.getElementById('trading-panel');
    document.getElementById('merchant-name').textContent = npc.name;
    document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
    
    const merchantItems = document.getElementById('merchant-items');
    merchantItems.innerHTML = '';
    
    merchantInventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="icon">${item.icon}</div>
                <div class="details">
                    <div class="name">${item.name}</div>
                    <div class="price">💰 ${Math.ceil(item.value * 1.5)} gold</div>
                </div>
            </div>
        `;
        itemDiv.onclick = () => buyItem(item);
        merchantItems.appendChild(itemDiv);
    });
    
    const playerItems = document.getElementById('player-items');
    playerItems.innerHTML = '';
    
    playerInventory.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="icon">${item.icon}</div>
                <div class="details">
                    <div class="name">${item.name}</div>
                    <div class="price">💰 ${Math.floor(item.value * 0.5)} gold</div>
                </div>
            </div>
        `;
        itemDiv.onclick = () => sellItem(item);
        playerItems.appendChild(itemDiv);
    });
    
    panel.classList.add('show');
}

function closeTrading() {
    document.getElementById('trading-panel').classList.remove('show');
}

function buyItem(item) {
    const price = Math.ceil(item.value * 1.5);
    if (playerInventory.removeGold(price)) {
        const newItem = new Item(item.id, item.name, item.icon, item.type, item.value, item.stats);
        if (playerInventory.addItem(newItem)) {
            document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
            addMessage(`Bought ${item.icon} ${item.name} for ${price} gold`, 'success');
        } else {
            playerInventory.addGold(price);
        }
    } else {
        addMessage('Not enough gold!', 'warning');
    }
}

function sellItem(item) {
    const price = Math.floor(item.value * 0.5);
    if (playerInventory.removeItem(item.id)) {
        playerInventory.addGold(price);
        document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
        addMessage(`Sold ${item.icon} ${item.name} for ${price} gold`, 'success');
        const npc = npcs.find(n => n.type === 'merchant');
        if (npc) openTrading(npc);
    }
}

function showDialogue(npc) {
    const panel = document.getElementById('dialogue-panel');
    document.getElementById('npc-name').textContent = npc.name;
    document.getElementById('dialogue-text').textContent = npc.dialogue[0];
    
    const options = document.getElementById('dialogue-options');
    options.innerHTML = '';
    
    if (npc.type === 'quest_giver') {
        if (npc.id === 'elder') {
            const villageQuest = quests['village_rescue'];
            const skeletonQuest = quests['skeleton_threat'];
            
            // Offer village rescue quest if not yet accepted
            if (!villageQuest.active && !villageQuest.completed) {
                const offerQuestBtn = document.createElement('button');
                offerQuestBtn.className = 'dialogue-btn';
                offerQuestBtn.textContent = 'What troubles the village?';
                offerQuestBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Brave adventurer! Goblins have been raiding our village. Their camp is to the south. Will you help us defeat them?";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I will help!';
                    acceptBtn.onclick = () => {
                        activateQuest('village_rescue');
                        document.getElementById('dialogue-text').textContent = 
                            "Thank you, hero! The goblin camp is to the south, around coordinates (-20, -20). Defeat them and return to me!";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Not right now';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(offerQuestBtn);
            } else if (villageQuest.active && !villageQuest.completed &&
                villageQuest.objectives[0].completed && villageQuest.objectives[1].completed && 
                !villageQuest.objectives[2].completed) {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'dialogue-btn';
                completeBtn.textContent = '✓ I defeated the goblins!';
                completeBtn.onclick = () => {
                    updateQuestProgress('return_to_village_elder', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Excellent work, brave warrior! The village is safe once again. Please accept this reward for your heroic deeds!";
                    setTimeout(() => closeDialogue(), 2000);
                };
                options.appendChild(completeBtn);
            } else if (villageQuest.active && !villageQuest.completed) {
                const questBtn = document.createElement('button');
                questBtn.className = 'dialogue-btn';
                questBtn.textContent = 'Tell me more about the goblins';
                questBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "The goblins have set up camp to the south. Defeat them and return to me for a reward!";
                };
                options.appendChild(questBtn);
            } else if (villageQuest.completed) {
                document.getElementById('dialogue-text').textContent = 
                    "Thank you again, brave warrior! The village is forever in your debt.";
                
                // Offer skeleton quest after village rescue is complete
                if (!skeletonQuest.active && !skeletonQuest.completed) {
                    const skeletonBtn = document.createElement('button');
                    skeletonBtn.className = 'dialogue-btn';
                    skeletonBtn.textContent = 'Any other threats?';
                    skeletonBtn.onclick = () => {
                        document.getElementById('dialogue-text').textContent = 
                            "Now that you mention it... undead skeletons have been spotted near the old graveyard to the east. Will you help us again?";
                        
                        const acceptBtn = document.createElement('button');
                        acceptBtn.className = 'dialogue-btn';
                        acceptBtn.textContent = 'I\'ll deal with the undead!';
                        acceptBtn.onclick = () => {
                            activateQuest('skeleton_threat');
                            document.getElementById('dialogue-text').textContent = 
                                "May the light guide you, hero! The graveyard is to the east, around coordinates (30, 10).";
                            setTimeout(() => closeDialogue(), 1500);
                        };
                        options.innerHTML = '';
                        options.appendChild(acceptBtn);
                        
                        const declineBtn = document.createElement('button');
                        declineBtn.className = 'dialogue-btn secondary';
                        declineBtn.textContent = 'Not right now';
                        declineBtn.onclick = closeDialogue;
                        options.appendChild(declineBtn);
                    };
                    options.appendChild(skeletonBtn);
                }
            }
            
            // Allow completing skeleton quest
            if (skeletonQuest.active && !skeletonQuest.completed &&
                skeletonQuest.objectives.every(obj => obj.id.startsWith('kill_') ? obj.completed : true)) {
                const completeSkeletonBtn = document.createElement('button');
                completeSkeletonBtn.className = 'dialogue-btn';
                completeSkeletonBtn.textContent = '✓ The undead are vanquished!';
                completeSkeletonBtn.onclick = () => {
                    updateQuestProgress('return_to_village_elder', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Outstanding! You have proven yourself a true hero. The village owes you everything!";
                    setTimeout(() => closeDialogue(), 2000);
                };
                options.appendChild(completeSkeletonBtn);
            }
        }
        
        if (npc.id === 'hermit') {
            const herbQuest = quests['herb_collection'];
            const ruinsQuest = quests['ancient_ruins'];
            const slimeQuest = quests['slime_parts'];
            
            const merchantDeliveryQuest = activeQuests.find(q => q.id === 'merchant_delivery');
            
            if (merchantDeliveryQuest && !merchantDeliveryQuest.objectives[1].completed) {
                const foundBtn = document.createElement('button');
                foundBtn.className = 'dialogue-btn';
                foundBtn.textContent = 'I found you! (Complete objective)';
                foundBtn.onclick = () => {
                    updateQuestProgress('find_hermit', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Excellent! You found me. Now, do you have the package?";
                };
                options.appendChild(foundBtn);
            }
            
            if (merchantDeliveryQuest && merchantDeliveryQuest.objectives[0].completed && !merchantDeliveryQuest.objectives[2].completed) {
                const deliverBtn = document.createElement('button');
                deliverBtn.className = 'dialogue-btn';
                deliverBtn.textContent = 'Deliver the package';
                deliverBtn.onclick = () => {
                    updateQuestProgress('deliver_package', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Thank you, brave soul! This package contains rare herbs I cannot find in these woods. You've done me a great service!";
                };
                options.appendChild(deliverBtn);
            }
            
            // Offer herb collection quest
            if (quests['merchant_delivery'].completed && !herbQuest.active && !herbQuest.completed) {
                const herbBtn = document.createElement('button');
                herbBtn.className = 'dialogue-btn';
                herbBtn.textContent = 'Can I help you with anything?';
                herbBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Actually, yes! I need certain rare herbs for my potions. Would you gather them for me?";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll gather the herbs!';
                    acceptBtn.onclick = () => {
                        activateQuest('herb_collection');
                        document.getElementById('dialogue-text').textContent = 
                            "Wonderful! I need 3 Moonpetals and 2 Shadow Roots. They grow throughout the forest.";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Maybe later';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(herbBtn);
            }
            
            // Offer ancient ruins quest
            if (quests['village_rescue'].completed && !ruinsQuest.active && !ruinsQuest.completed) {
                const ruinsBtn = document.createElement('button');
                ruinsBtn.className = 'dialogue-btn';
                ruinsBtn.textContent = 'Know any mysteries?';
                ruinsBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Indeed! Ancient ruins lie hidden in these lands. If you discover them, report back to me. I collect knowledge of such places.";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll explore the ruins!';
                    acceptBtn.onclick = () => {
                        activateQuest('ancient_ruins');
                        document.getElementById('dialogue-text').textContent = 
                            "Fascinating! Look to the north, east, and west. The ruins await discovery.";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Not interested';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(ruinsBtn);
            }
            
            // Offer slime quest
            if (herbQuest.completed && !slimeQuest.active && !slimeQuest.completed) {
                const slimeBtn = document.createElement('button');
                slimeBtn.className = 'dialogue-btn';
                slimeBtn.textContent = 'Need more ingredients?';
                slimeBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Ah yes! Slime cores are essential for my potions. Could you gather some for me?";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll collect slime cores!';
                    acceptBtn.onclick = () => {
                        activateQuest('slime_parts');
                        document.getElementById('dialogue-text').textContent = 
                            "Excellent! I need 5 cores. Slimes can be found in damp areas.";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Maybe later';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(slimeBtn);
            }
        }
        
        if (npc.id === 'guard') {
            const spiderQuest = quests['spider_cave'];
            const banditQuest = quests['bandit_camp'];
            const lostRingQuest = quests['lost_ring'];
            
            // Offer spider quest
            if (quests['village_rescue'].completed && !spiderQuest.active && !spiderQuest.completed) {
                const spiderBtn = document.createElement('button');
                spiderBtn.className = 'dialogue-btn';
                spiderBtn.textContent = 'Any threats I should know about?';
                spiderBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Giant spiders have infested a cave to the northeast. Travelers are afraid to use that route. Can you clear them out?";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll clear the spider den!';
                    acceptBtn.onclick = () => {
                        activateQuest('spider_cave');
                        document.getElementById('dialogue-text').textContent = 
                            "Thank you! The spider den is northeast, around coordinates (25, -25). Be careful!";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Not interested';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(spiderBtn);
            }
            
            // Offer bandit quest after spider quest
            if (spiderQuest.completed && !banditQuest.active && !banditQuest.completed) {
                const banditBtn = document.createElement('button');
                banditBtn.className = 'dialogue-btn';
                banditBtn.textContent = 'What else needs protecting?';
                banditBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "Bandits have set up camp on the main trade route. They're robbing travelers. Can you deal with them?";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll clear out the bandits!';
                    acceptBtn.onclick = () => {
                        activateQuest('bandit_camp');
                        document.getElementById('dialogue-text').textContent = 
                            "Good! The bandits are camped near the old crossroads. Clear them out!";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Maybe later';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(banditBtn);
            }
            
            // Offer lost ring quest
            if (quests['village_rescue'].completed && !lostRingQuest.active && !lostRingQuest.completed) {
                const ringBtn = document.createElement('button');
                ringBtn.className = 'dialogue-btn';
                ringBtn.textContent = 'Anyone need help?';
                ringBtn.onclick = () => {
                    document.getElementById('dialogue-text').textContent = 
                        "A villager lost their family ring in the forest. If you find it, return it to them. They'll be grateful.";
                    
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'dialogue-btn';
                    acceptBtn.textContent = 'I\'ll look for the ring!';
                    acceptBtn.onclick = () => {
                        activateQuest('lost_ring');
                        document.getElementById('dialogue-text').textContent = 
                            "Check near the old oak trees. The ring is gold with an emerald stone.";
                        setTimeout(() => closeDialogue(), 1500);
                    };
                    options.innerHTML = '';
                    options.appendChild(acceptBtn);
                    
                    const declineBtn = document.createElement('button');
                    declineBtn.className = 'dialogue-btn secondary';
                    declineBtn.textContent = 'Not now';
                    declineBtn.onclick = closeDialogue;
                    options.appendChild(declineBtn);
                };
                options.appendChild(ringBtn);
            }
            
            // Allow completing spider quest
            if (spiderQuest.active && !spiderQuest.completed &&
                spiderQuest.objectives.every(obj => obj.id.startsWith('kill_') ? obj.completed : true)) {
                const completeSpiderBtn = document.createElement('button');
                completeSpiderBtn.className = 'dialogue-btn';
                completeSpiderBtn.textContent = '✓ The spiders are gone!';
                completeSpiderBtn.onclick = () => {
                    updateQuestProgress('return_to_town_guard', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Excellent work! The route is safe again. Here is your reward.";
                    setTimeout(() => closeDialogue(), 2000);
                };
                options.appendChild(completeSpiderBtn);
            }
            
            // Allow completing bandit quest
            if (banditQuest.active && !banditQuest.completed &&
                banditQuest.objectives.every(obj => obj.id.startsWith('kill_') ? obj.completed : true)) {
                const completeBanditBtn = document.createElement('button');
                completeBanditBtn.className = 'dialogue-btn';
                completeBanditBtn.textContent = '✓ The bandits are defeated!';
                completeBanditBtn.onclick = () => {
                    updateQuestProgress('return_to_town_guard', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Outstanding! The roads are safe once more. Here is your reward.";
                    setTimeout(() => closeDialogue(), 2000);
                };
                options.appendChild(completeBanditBtn);
            }
        }
    }
    
    if (npc.type === 'merchant') {
        const wolfQuest = quests['wolf_pack'];
        
        if (quests['merchant_delivery'].available && !quests['merchant_delivery'].active && !quests['merchant_delivery'].completed) {
            const questBtn2 = document.createElement('button');
            questBtn2.className = 'dialogue-btn';
            questBtn2.textContent = 'Do you need any help?';
            questBtn2.onclick = () => {
                document.getElementById('dialogue-text').textContent = 
                    "Actually, yes! I need someone to deliver a package to the Forest Hermit who lives deep in the woods to the southwest. Will you help?";
                
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'dialogue-btn';
                acceptBtn.textContent = 'I\'ll deliver your package!';
                acceptBtn.onclick = () => {
                    activateQuest('merchant_delivery');
                    updateQuestProgress('get_package', 1);
                    playerInventory.addItem(new Item('package', 'Sealed Package', '📦', 'quest', 0, {}));
                    document.getElementById('dialogue-text').textContent = 
                        "Wonderful! The hermit lives far to the southwest, near coordinates (-25, -25). Be careful out there!";
                    setTimeout(() => closeDialogue(), 1500);
                };
                options.innerHTML = '';
                options.appendChild(acceptBtn);
                options.appendChild(closeBtn);
            };
            options.appendChild(questBtn2);
        }
        
        // Offer wolf pack quest
        if (quests['skeleton_threat'].completed && !wolfQuest.active && !wolfQuest.completed) {
            const wolfBtn = document.createElement('button');
            wolfBtn.className = 'dialogue-btn';
            wolfBtn.textContent = 'Having trouble on the roads?';
            wolfBtn.onclick = () => {
                document.getElementById('dialogue-text').textContent = 
                    "Yes! A pack of dire wolves has been terrorizing merchants. Their alpha is incredibly dangerous. Can you hunt them down?";
                
                const acceptWolfBtn = document.createElement('button');
                acceptWolfBtn.className = 'dialogue-btn';
                acceptWolfBtn.textContent = 'I\'ll hunt the wolf pack!';
                acceptWolfBtn.onclick = () => {
                    activateQuest('wolf_pack');
                    document.getElementById('dialogue-text').textContent = 
                        "You're brave! The wolves roam northwest, around coordinates (-30, 30). May fortune favor you!";
                    setTimeout(() => closeDialogue(), 1500);
                };
                options.innerHTML = '';
                options.appendChild(acceptWolfBtn);
                
                const declineWolfBtn = document.createElement('button');
                declineWolfBtn.className = 'dialogue-btn secondary';
                declineWolfBtn.textContent = 'Too dangerous for me';
                declineWolfBtn.onclick = closeDialogue;
                options.appendChild(declineWolfBtn);
            };
            options.appendChild(wolfBtn);
        }
        
        // Allow completing wolf quest
        if (wolfQuest.active && !wolfQuest.completed &&
            wolfQuest.objectives.every(obj => obj.id.startsWith('kill_') ? obj.completed : true)) {
            const completeWolfBtn = document.createElement('button');
            completeWolfBtn.className = 'dialogue-btn';
            completeWolfBtn.textContent = '✓ The wolves are dealt with!';
            completeWolfBtn.onclick = () => {
                updateQuestProgress('return_to_traveling_merchant', 1);
                document.getElementById('dialogue-text').textContent = 
                    "Incredible! The roads are safe again thanks to you. Here is your well-earned reward!";
                setTimeout(() => closeDialogue(), 2000);
            };
            options.appendChild(completeWolfBtn);
        }
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dialogue-btn secondary';
    closeBtn.textContent = 'Farewell';
    closeBtn.onclick = closeDialogue;
    options.appendChild(closeBtn);
    
    panel.classList.add('show');
}

function closeDialogue() {
    document.getElementById('dialogue-panel').classList.remove('show');
}

function interactWithNPC(npc) {
    if (npc.type === 'merchant') {
        openTrading(npc);
    } else if (npc.type === 'quest_giver') {
        showDialogue(npc);
    } else {
        showDialogue(npc);
    }
}

// ===== ANIMATION FUNCTIONS =====
function setAnimation(state) {
    if (player.animationState !== state) {
        player.animationState = state;
        player.animationTime = 0;
        document.getElementById('anim-state').textContent = state.charAt(0).toUpperCase() + state.slice(1);
        showAnimationLabel(state);
    }
}

function showAnimationLabel(state) {
    const label = document.getElementById('animation-state');
    const labels = {
        idle: '💤 Idle',
        walking: '🚶 Walking',
        running: '🏃 Running',
        attacking: '⚔️ Attacking!',
        resting: '😌 Resting...'
    };
    label.textContent = labels[state] || state;
    label.classList.add('show');
    setTimeout(() => label.classList.remove('show'), 1000);
}

function updateAnimation(delta) {
    player.animationTime += delta;
    
    switch (player.animationState) {
        case 'idle':
            body.position.y = 1.3 + Math.sin(player.animationTime * 2) * 0.05;
            swordGroup.rotation.z = -Math.PI / 4;
            break;
            
        case 'walking':
            body.position.y = 1.3 + Math.abs(Math.sin(player.animationTime * 8)) * 0.1;
            body.rotation.z = Math.sin(player.animationTime * 8) * 0.05;
            swordGroup.rotation.z = -Math.PI / 4 + Math.sin(player.animationTime * 8) * 0.1;
            shield.position.x = -0.7 + Math.sin(player.animationTime * 8) * 0.05;
            break;
            
        case 'running':
            body.position.y = 1.3 + Math.abs(Math.sin(player.animationTime * 12)) * 0.15;
            body.rotation.z = Math.sin(player.animationTime * 12) * 0.1;
            swordGroup.rotation.z = -Math.PI / 4 + Math.sin(player.animationTime * 12) * 0.2;
            shield.position.x = -0.7 + Math.sin(player.animationTime * 12) * 0.1;
            break;
            
        case 'attacking':
            const attackProgress = Math.min(player.animationTime / 0.5, 1);
            if (attackProgress < 0.5) {
                swordGroup.rotation.z = -Math.PI / 4 - attackProgress * 2 * Math.PI / 2;
            } else {
                swordGroup.rotation.z = -Math.PI / 4 - (1 - attackProgress) * 2 * Math.PI / 2;
            }
            body.rotation.y = Math.sin(attackProgress * Math.PI) * 0.3;
            
            if (attackProgress >= 1) {
                setAnimation('idle');
            }
            break;
            
        case 'resting':
            body.position.y = 0.8;
            body.rotation.x = 0.3;
            swordGroup.position.y = 0.8;
            shield.position.y = 0.8;
            
            if (player.animationTime > 2) {
                body.rotation.x = 0;
                swordGroup.position.y = 1.3;
                shield.position.y = 1.3;
                setAnimation('idle');
                player.hp = Math.min(player.maxHp, player.hp + 30);
                addMessage('Rested and recovered 30 HP', 'success');
                updateUI();
            }
            break;
    }
}

// ===== INPUT HANDLING =====
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Track player attack cooldown
let playerLastAttackTime = 0;
const playerAttackCooldown = 0.8; // seconds
const playerAttackRange = 3; // units

// Update attack cooldown UI
function updateAttackCooldownUI() {
    const currentTime = Date.now() / 1000;
    const timeSinceAttack = currentTime - playerLastAttackTime;
    const cooldownRemaining = Math.max(0, playerAttackCooldown - timeSinceAttack);
    const cooldownPercent = cooldownRemaining / playerAttackCooldown;
    
    const circle = document.getElementById('cooldown-circle');
    const circumference = 163.36; // 2 * PI * 26
    const offset = circumference * cooldownPercent;
    
    if (circle) {
        circle.style.strokeDashoffset = offset;
    }
    
    // Change icon color based on cooldown
    const attackIcon = document.getElementById('attack-cooldown');
    if (attackIcon) {
        if (cooldownRemaining > 0) {
            attackIcon.style.borderColor = '#ef4444';
            attackIcon.style.opacity = '0.6';
        } else {
            attackIcon.style.borderColor = '#4ade80';
            attackIcon.style.opacity = '1';
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && nearestInteractable) {
        const result = nearestInteractable.interact();
        if (result.npc) {
            interactWithNPC(result.npc);
        } else if (result.type === 'chest' || result.type === 'magical_chest') {
            // Non-combat interactions
            addMessage(result.message, result.type || 'info');
            if (result.healing) {
                player.hp = Math.min(player.maxHp, player.hp + result.healing);
                updateUI();
            }
        }
    }
    
    if (e.key === ' ' && player.animationState !== 'attacking') {
        e.preventDefault();
        setAnimation('attacking');
        
        // Attack nearest monster in range
        const currentTime = Date.now() / 1000;
        if (currentTime - playerLastAttackTime >= playerAttackCooldown) {
            let nearestMonster = null;
            let nearestDist = playerAttackRange;
            
            // Check all monsters
            for (const obj of environmentObjects) {
                if ((obj.type === 'goblin' || obj.type === 'skeleton' || obj.type === 'spider' || 
                     obj.type === 'wolf' || obj.type === 'goblin boss' || obj.type === 'skeleton lord' || 
                     obj.type === 'dire wolf') && obj.alive) {
                    const dx = obj.position.x - player.position.x;
                    const dz = obj.position.z - player.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < nearestDist) {
                        nearestMonster = obj;
                        nearestDist = dist;
                    }
                }
            }
            
            if (nearestMonster) {
                playerLastAttackTime = currentTime;
                const result = nearestMonster.interact();
                addMessage(result.message, result.type || 'info');
                
                // Show monster health bar when hit
                if (result.monsterHit) {
                    showMonsterHealthBar(result.monsterHit);
                    createAttackEffect(result.monsterHit.position);
                }
                // Hide health bar when defeated
                if (result.defeated) {
                    hideMonsterHealthBar();
                }
            } else {
                addMessage('No monster in range!', 'warning');
            }
        }
    }
    
    if (e.key.toLowerCase() === 'r' && player.animationState === 'idle') {
        setAnimation('resting');
    }
    
    if (e.key.toLowerCase() === 'i') {
        const invPanel = document.getElementById('inventory-panel');
        if (invPanel.classList.contains('show')) {
            closeInventory();
        } else {
            openInventory();
        }
    }
    
    if (e.key === 'Escape') {
        closeInventory();
        closeTrading();
        closeDialogue();
    }
});

// ===== INTERACTION CHECKING =====
let nearestInteractable = null;
let currentMonsterTarget = null;

function showMonsterHealthBar(monster) {
    currentMonsterTarget = monster;
    const healthBar = document.getElementById('monster-health-bar');
    const nameElement = document.getElementById('monster-name');
    const hpBar = document.getElementById('monster-hp-bar');
    const hpText = document.getElementById('monster-hp-text');
    
    healthBar.classList.add('show');
    nameElement.textContent = monster.type.toUpperCase() + (monster.isBoss ? ' (BOSS)' : '');
    
    const hpPercent = (monster.hp / monster.maxHp) * 100;
    hpBar.style.width = hpPercent + '%';
    hpText.textContent = `${Math.round(monster.hp)} / ${monster.maxHp}`;
}

function hideMonsterHealthBar() {
    const healthBar = document.getElementById('monster-health-bar');
    healthBar.classList.remove('show');
    currentMonsterTarget = null;
}

function updateMonsterHealthBar() {
    if (currentMonsterTarget && currentMonsterTarget.alive) {
        const hpBar = document.getElementById('monster-hp-bar');
        const hpText = document.getElementById('monster-hp-text');
        const hpPercent = (currentMonsterTarget.hp / currentMonsterTarget.maxHp) * 100;
        hpBar.style.width = hpPercent + '%';
        hpText.textContent = `${Math.round(currentMonsterTarget.hp)} / ${currentMonsterTarget.maxHp}`;
    } else if (currentMonsterTarget && !currentMonsterTarget.alive) {
        hideMonsterHealthBar();
    }
}

// Create attack visual effect
function createAttackEffect(position) {
    const particleCount = 10;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ 
            color: 0xff6600,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        
        particle.position.set(
            position.x + (Math.random() - 0.5) * 0.5,
            0.5 + Math.random(),
            position.z + (Math.random() - 0.5) * 0.5
        );
        
        particle.velocity = {
            x: (Math.random() - 0.5) * 0.1,
            y: Math.random() * 0.15 + 0.1,
            z: (Math.random() - 0.5) * 0.1
        };
        
        particle.life = 1.0;
        scene.add(particle);
        particles.push(particle);
    }
    
    // Store particles for animation
    if (!window.attackParticles) {
        window.attackParticles = [];
    }
    window.attackParticles.push(...particles);
}

// Create or update monster state halo
function updateMonsterHalo(monster) {
    if (!monster.alive || !monster.mesh) return;
    
    // Remove old halo if exists
    if (monster.halo) {
        monster.mesh.remove(monster.halo);
        monster.halo.geometry.dispose();
        monster.halo.material.dispose();
        monster.halo = null;
    }
    
    // Determine halo color based on state
    let haloColor = 0xffffff; // Default white
    let haloIntensity = 0.3;
    
    const dx = player.position.x - monster.position.x;
    const dz = player.position.z - monster.position.z;
    const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
    
    if (monster.stance === 'flee') {
        if (monster.wasAttacked && monster.isRetreating) {
            haloColor = 0xffff00; // Yellow when fleeing
            haloIntensity = 0.5;
        } else {
            haloColor = 0x00ff00; // Green when idle
            haloIntensity = 0.2;
        }
    } else if (monster.stance === 'defensive') {
        if (monster.wasAttacked) {
            haloColor = 0xffa500; // Orange when defensive and attacked
            haloIntensity = 0.5;
        } else {
            haloColor = 0x00ff00; // Green when idle
            haloIntensity = 0.2;
        }
    } else if (monster.stance === 'aggressive') {
        if (distanceToPlayer < monster.aggroRange) {
            haloColor = 0xff0000; // Red when aggressive
            haloIntensity = 0.6;
        } else {
            haloColor = 0xffa500; // Orange when idle but aggressive type
            haloIntensity = 0.3;
        }
    }
    
    // Create halo ring
    const haloGeo = new THREE.RingGeometry(0.6, 0.8, 32);
    const haloMat = new THREE.MeshBasicMaterial({ 
        color: haloColor,
        transparent: true,
        opacity: haloIntensity,
        side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    
    monster.mesh.add(halo);
    monster.halo = halo;
}

// Update attack particles
function updateAttackParticles(delta) {
    if (!window.attackParticles) return;
    
    for (let i = window.attackParticles.length - 1; i >= 0; i--) {
        const particle = window.attackParticles[i];
        
        particle.life -= delta * 2;
        particle.material.opacity = particle.life;
        
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.position.z += particle.velocity.z;
        
        particle.velocity.y -= delta * 0.5; // Gravity
        
        if (particle.life <= 0) {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
            window.attackParticles.splice(i, 1);
        }
    }
}

// Monster AI: Update monster behavior based on stance
function updateMonsterAI(monster, delta, playerPos) {
    if (!monster.alive) return;
    
    const dx = playerPos.x - monster.position.x;
    const dz = playerPos.z - monster.position.z;
    const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
    
    // Initialize wandering state if not exists
    if (!monster.wanderTarget) {
        monster.wanderTarget = { x: monster.spawnPosition.x, z: monster.spawnPosition.z };
        monster.wanderTimer = 0;
        monster.wanderDelay = 2 + Math.random() * 3; // Random delay between 2-5 seconds
    }
    
    // Reset attack flag after some time
    if (monster.wasAttacked) {
        if (!monster.attackedTime) {
            monster.attackedTime = Date.now();
        }
        if (Date.now() - monster.attackedTime > 5000) { // Reset after 5 seconds
            monster.wasAttacked = false;
            monster.isRetreating = false;
            monster.attackedTime = null;
        }
    }
    
    let isEngaged = false;
    
    // Handle different stances
    if (monster.stance === 'flee') {
        // Flee when attacked
        if (monster.wasAttacked && distanceToPlayer < monster.fleeDistance) {
            monster.isRetreating = true;
            const fleeX = monster.position.x - dx * 0.02;
            const fleeZ = monster.position.z - dz * 0.02;
            monster.position.x = fleeX;
            monster.position.z = fleeZ;
            monster.mesh.position.set(fleeX, 0, fleeZ);
            isEngaged = true;
        }
    } else if (monster.stance === 'defensive') {
        // Fight back when attacked
        if (monster.wasAttacked && distanceToPlayer < 3) {
            monsterAttackPlayer(monster);
            isEngaged = true;
        }
    } else if (monster.stance === 'aggressive') {
        // Attack when player is too close
        if (distanceToPlayer < monster.aggroRange) {
            // Move towards player
            const moveSpeed = 0.8 * delta;
            const moveX = monster.position.x + (dx / distanceToPlayer) * moveSpeed;
            const moveZ = monster.position.z + (dz / distanceToPlayer) * moveSpeed;
            monster.position.x = moveX;
            monster.position.z = moveZ;
            monster.mesh.position.set(moveX, 0, moveZ);
            
            // Face the player
            const angle = Math.atan2(dx, dz);
            monster.mesh.rotation.y = angle;
            
            // Attack if close enough
            if (distanceToPlayer < 2) {
                monsterAttackPlayer(monster);
            }
            isEngaged = true;
        }
    }
    
    // Idle wandering behavior when not engaged
    if (!isEngaged && !monster.wasAttacked && !monster.isRetreating) {
        monster.wanderTimer += delta;
        
        if (monster.wanderTimer >= monster.wanderDelay) {
            // Choose new random point near spawn
            const wanderRadius = 2; // Wander within 2 units of spawn
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * wanderRadius;
            monster.wanderTarget = {
                x: monster.spawnPosition.x + Math.cos(angle) * distance,
                z: monster.spawnPosition.z + Math.sin(angle) * distance
            };
            monster.wanderTimer = 0;
            monster.wanderDelay = 2 + Math.random() * 3;
        }
        
        // Move towards wander target
        const wanderDx = monster.wanderTarget.x - monster.position.x;
        const wanderDz = monster.wanderTarget.z - monster.position.z;
        const wanderDist = Math.sqrt(wanderDx * wanderDx + wanderDz * wanderDz);
        
        if (wanderDist > 0.1) {
            const wanderSpeed = 0.3 * delta; // Slower than combat movement
            const moveX = monster.position.x + (wanderDx / wanderDist) * wanderSpeed;
            const moveZ = monster.position.z + (wanderDz / wanderDist) * wanderSpeed;
            monster.position.x = moveX;
            monster.position.z = moveZ;
            monster.mesh.position.set(moveX, 0, moveZ);
            
            // Face the direction of movement
            const wanderAngle = Math.atan2(wanderDx, wanderDz);
            monster.mesh.rotation.y = wanderAngle;
        }
    }
    
    // Update visual halo
    updateMonsterHalo(monster);
}

// Monster attacks player
function monsterAttackPlayer(monster) {
    const currentTime = Date.now() / 1000;
    if (currentTime - monster.lastAttackTime < monster.attackCooldown) {
        return;
    }
    
    monster.lastAttackTime = currentTime;
    const monsterDamage = Math.floor(monster.damage * 0.5 + Math.random() * monster.damage * 0.5);
    player.hp = Math.max(0, player.hp - monsterDamage);
    
    addMessage(`💥 ${monster.type.toUpperCase()} attacks you for ${monsterDamage} damage!`, 'warning');
    updateUI();
    
    // Create attack effect on player
    createAttackEffect(player.position);
    
    // Check if player died
    if (player.hp <= 0) {
        addMessage('💀 You have been defeated!', 'warning');
        // Respawn player
        setTimeout(() => {
            player.hp = player.maxHp;
            player.position.x = 0;
            player.position.z = 0;
            characterGroup.position.set(0, 0, 0);
            addMessage('You have respawned at the starting location.', 'info');
            updateUI();
        }, 3000);
    }
}

function checkInteractions() {
    let nearestObject = null;
    let nearestDistance = 2.5;
    
    for (const obj of environmentObjects) {
        if (obj.interactable) {
            if (obj.type === 'goblin' && !obj.alive) continue;
            if ((obj.type === 'chest' || obj.type === 'magical_chest') && obj.opened) continue;
            
            const dx = obj.position.x - player.position.x;
            const dz = obj.position.z - player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < nearestDistance) {
                nearestObject = obj;
                nearestDistance = distance;
            }
        }
    }
    
    const prompt = document.getElementById('interaction-prompt');
    if (nearestObject) {
        prompt.classList.add('show');
        let displayName = nearestObject.type;
        if (nearestObject.npc) {
            displayName = nearestObject.npc.name;
        }
        document.getElementById('interaction-text').textContent = `Press E to interact with ${displayName}`;
        return nearestObject;
    } else {
        prompt.classList.remove('show');
        return null;
    }
}

// ===== LOAD ASSETS AND INITIALIZE WORLD =====
(async function initWorld() {
    addMessage('Loading character assets...', 'info');
    
    // Load all characters
    await characterLoader.loadAllCharacters();
    
    addMessage('✓ Assets loaded!', 'success');
    
    // Create NPCs with FBX models
    const standardNPCs = npcFactory.createStandardNPCs();
    standardNPCs.forEach(npc => {
        npcs.push(npc);
        const npcObj = npcFactory.createNPCMesh(npc, scene);
        environmentObjects.push(npcObj);

        // For specific NPCs that were found buried, lift them slightly by half their size.
        if (npc.id === 'elder' || npc.id === 'guard') {
            try {
                const meshGroup = npc.mesh;
                // Estimate height from first child bounding box (if available)
                let lift = 0.5; // fallback lift
                if (meshGroup && meshGroup.children && meshGroup.children.length > 0) {
                    const firstChild = meshGroup.children.find(c => c.isMesh || c.isGroup) || meshGroup.children[0];
                    const bbox = new THREE.Box3().setFromObject(firstChild);
                    const size = bbox.getSize(new THREE.Vector3());
                    const h = size.y || 1.0;
                    lift = h * 0.25; // raise by half of measured height
                }
                meshGroup.position.y += lift;
            } catch (err) {
                console.warn('Failed to lift NPC', npc.id, err);
            }
        }
    });
    
    // Create environment objects
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 15 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        environmentObjects.push(environmentFactory.createTree(x, z));
    }
    
    for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        environmentObjects.push(environmentFactory.createRock(x, z, 0.8 + Math.random() * 0.6));
    }
    
    environmentObjects.push(environmentFactory.createChest(5, -5, Item, playerInventory, updateInventoryUI));
    environmentObjects.push(environmentFactory.createChest(-7, 8, Item, playerInventory, updateInventoryUI));
    environmentObjects.push(environmentFactory.createCampfire(0, -10));
    environmentObjects.push(environmentFactory.createHouse(15, 0));
    environmentObjects.push(environmentFactory.createHouse(-15, 5));
    
    // Create goblin camp
    const goblinCampCenter = { x: -20, z: -20 };
    const { goblins: campGoblins, environmentObjects: campObjects } = goblinFactory.createGoblinCamp(
        goblinCampCenter.x,
        goblinCampCenter.z,
        (x, z) => environmentFactory.createCampfire(x, z),
        updateQuestProgress
    );
    goblins.push(...campGoblins);
    environmentObjects.push(...campObjects);
    
    // Add camp sign
    environmentObjects.push(environmentFactory.createSign(goblinCampCenter.x + 8, goblinCampCenter.z, 'Beware: Goblin Territory!'));
    
    // Create skeleton graveyard (east)
    const graveyardCenter = { x: 30, z: 10 };
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = graveyardCenter.x + Math.cos(angle) * 3;
        const z = graveyardCenter.z + Math.sin(angle) * 3;
        const skeleton = monsterFactory.createSkeleton(x, z, updateQuestProgress);
        monsters.push(skeleton);
        environmentObjects.push(skeleton);
    }
    // Add skeleton boss
    const skeletonBoss = monsterFactory.createBoss('skeleton', graveyardCenter.x, graveyardCenter.z + 4, updateQuestProgress);
    monsters.push(skeletonBoss);
    environmentObjects.push(skeletonBoss);
    environmentObjects.push(environmentFactory.createSign(graveyardCenter.x + 6, graveyardCenter.z, 'Ancient Graveyard'));
    
    // Create spider cave area (northeast)
    const spiderCaveCenter = { x: 25, z: -25 };
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const x = spiderCaveCenter.x + Math.cos(angle) * 4;
        const z = spiderCaveCenter.z + Math.sin(angle) * 4;
        const spider = monsterFactory.createSpider(x, z, updateQuestProgress);
        monsters.push(spider);
        environmentObjects.push(spider);
    }
    environmentObjects.push(environmentFactory.createSign(spiderCaveCenter.x + 7, spiderCaveCenter.z, 'Spider Den - Danger!'));
    
    // Create wolf pack area (northwest)
    const wolfPackCenter = { x: -30, z: 30 };
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const x = wolfPackCenter.x + Math.cos(angle) * 3.5;
        const z = wolfPackCenter.z + Math.sin(angle) * 3.5;
        const wolf = monsterFactory.createWolf(x, z, updateQuestProgress);
        monsters.push(wolf);
        environmentObjects.push(wolf);
    }
    // Add dire wolf boss
    const direWolf = monsterFactory.createBoss('wolf', wolfPackCenter.x, wolfPackCenter.z, updateQuestProgress);
    monsters.push(direWolf);
    environmentObjects.push(direWolf);
    environmentObjects.push(environmentFactory.createSign(wolfPackCenter.x + 6, wolfPackCenter.z, 'Wolf Territory'));
    
    // Initialize UI
    updateInventoryUI();
    updateQuestUI();
    updateUI();
    addMessage('Explore the world! Use WASD to move, I for inventory', 'info');
})();

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Movement
    if (player.animationState !== 'attacking' && player.animationState !== 'resting') {
        const forward = keys['w'] || keys['arrowup'];
        const backward = keys['s'] || keys['arrowdown'];
        const left = keys['a'] || keys['arrowleft'];
        const right = keys['d'] || keys['arrowright'];
        const running = keys['shift'];
        
        player.isRunning = running && player.stamina > 0;
        const speed = player.isRunning ? player.runSpeed : player.speed;
        
        player.velocity.x = 0;
        player.velocity.z = 0;
        
        let moveX = 0;
        let moveZ = 0;
        
        if (forward) moveZ -= 1;
        if (backward) moveZ += 1;
        if (left) moveX -= 1;
        if (right) moveX += 1;
        
        const isMoving = forward || backward || left || right;
        
        if (isMoving) {
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (length > 0) {
                moveX /= length;
                moveZ /= length;
            }
            
            const moveAngle = Math.atan2(moveX, moveZ) + cameraController.getHorizontalAngle();
            player.velocity.x = Math.sin(moveAngle) * speed * delta;
            player.velocity.z = Math.cos(moveAngle) * speed * delta;
            
            player.position.x += player.velocity.x;
            player.position.z += player.velocity.z;
            
            player.rotation = moveAngle;
            characterGroup.rotation.y = player.rotation;
            
            if (player.isRunning) {
                setAnimation('running');
                player.stamina = Math.max(0, player.stamina - 10 * delta);
            } else {
                setAnimation('walking');
                player.stamina = Math.min(player.maxStamina, player.stamina + 5 * delta);
            }
        } else {
            if (player.animationState === 'walking' || player.animationState === 'running') {
                setAnimation('idle');
            }
            player.stamina = Math.min(player.maxStamina, player.stamina + 15 * delta);
        }
        
        characterGroup.position.set(player.position.x, player.position.y, player.position.z);
        updateUI();
    }
    
    // Update animation
    updateAnimation(delta);
    
    // Update NPC animations
    npcs.forEach(npc => {
        if (npc.mixer) {
            npc.mixer.update(delta);
        }
        // Floating icon animation
        if (npc.icon) {
            npc.icon.position.y = 2.7 + Math.sin(Date.now() * 0.002) * 0.2;
        }
    });
    
    // Check for nearby interactable objects
    nearestInteractable = checkInteractions();
    
    // Animate campfire
    for (const obj of environmentObjects) {
        if (obj.type === 'campfire' && obj.fire) {
            obj.fire.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            obj.fire.scale.x = 1 + Math.cos(Date.now() * 0.005) * 0.2;
        }
    }
    
    // Goblin respawn logic
    for (const goblin of goblins) {
        if (!goblin.alive) {
            goblin.timeSinceDeath += delta;
            
            if (goblin.timeSinceDeath >= goblin.respawnTime) {
                goblin.hp = goblin.maxHp;
                goblin.alive = true;
                goblin.timeSinceDeath = 0;
                goblin.mesh.visible = true;
                goblin.position.x = goblin.spawnPosition.x;
                goblin.position.z = goblin.spawnPosition.z;
                goblin.mesh.position.set(goblin.spawnPosition.x, 0, goblin.spawnPosition.z);
                goblin.wasAttacked = false;
                goblin.isRetreating = false;
                addMessage('A goblin has respawned!', 'warning');
            }
        } else {
            if (goblin.mesh.visible) {
                // Add idle animation when not attacking/retreating
                if (!goblin.wasAttacked && !goblin.isRetreating) {
                    goblin.mesh.rotation.y += delta * 0.5;
                }
                goblin.mesh.children[0].position.y = 0.9 + Math.sin(Date.now() * 0.002) * 0.05;
                
                // Update goblin AI
                updateMonsterAI(goblin, delta, player.position);
            }
        }
    }
    
    // Monster respawn logic (for skeletons, spiders, wolves)
    for (const monster of monsters) {
        if (!monster.alive) {
            monster.timeSinceDeath += delta;
            
            if (monster.timeSinceDeath >= monster.respawnTime) {
                monster.hp = monster.maxHp;
                monster.alive = true;
                monster.timeSinceDeath = 0;
                monster.mesh.visible = true;
                monster.position.x = monster.spawnPosition.x;
                monster.position.z = monster.spawnPosition.z;
                monster.mesh.position.set(monster.spawnPosition.x, 0, monster.spawnPosition.z);
                monster.wasAttacked = false;
                monster.isRetreating = false;
                addMessage(`A ${monster.type} has respawned!`, 'warning');
            }
        } else {
            if (monster.mesh.visible) {
                // Add idle animation (slow rotation and bobbing)
                if (!monster.wasAttacked && !monster.isRetreating) {
                    monster.mesh.rotation.y += delta * 0.3;
                }
                if (monster.mesh.children.length > 0) {
                    monster.mesh.children[0].position.y += Math.sin(Date.now() * 0.002) * 0.002;
                }
                
                // Update monster AI
                updateMonsterAI(monster, delta, player.position);
            }
        }
    }
    
    // Update attack particles
    updateAttackParticles(delta);
    
    // Update monster health bar
    updateMonsterHealthBar();
    
    // Update attack cooldown UI
    updateAttackCooldownUI();
    
    // Update minimap
    updateMinimap();
    
    cameraController.update();
    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate();

console.log('RPG Engine - Refactored version with modular components loaded');
