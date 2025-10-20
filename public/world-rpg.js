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

let activeQuest = quests['village_rescue'];

function updateQuestProgress(objectiveId, amount = 1) {
    if (!activeQuest || !activeQuest.active || activeQuest.completed) return;
    
    const objective = activeQuest.objectives.find(obj => obj.id === objectiveId);
    if (objective && !objective.completed) {
        objective.current = Math.min(objective.current + amount, objective.target);
        if (objective.current >= objective.target) {
            objective.completed = true;
            addMessage(`✅ Quest Updated: ${objective.description}`, 'success');
        } else {
            addMessage(`Quest Progress: ${objective.description} (${objective.current}/${objective.target})`, 'info');
        }
        updateQuestUI();
        
        if (activeQuest.objectives.every(obj => obj.completed)) {
            activeQuest.completed = true;
            playerInventory.addGold(activeQuest.rewards.gold);
            addMessage(`🎉 QUEST COMPLETE! Rewards: ${activeQuest.rewards.xp} XP, ${activeQuest.rewards.gold} Gold`, 'success');
            updateQuestUI();
            
            if (activeQuest.id === 'village_rescue') {
                quests['merchant_delivery'].available = true;
                addMessage(`📜 New quest available from the Traveling Merchant!`, 'info');
            }
        }
    }
}

function activateQuest(questId) {
    const quest = quests[questId];
    if (quest && !quest.active && !quest.completed) {
        if (activeQuest) {
            activeQuest.active = false;
        }
        quest.active = true;
        activeQuest = quest;
        addMessage(`📜 New Quest: ${quest.name}`, 'success');
        updateQuestUI();
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
    
    if (activeQuest.active) {
        questPanel.innerHTML = `
            <div class="quest-header ${activeQuest.completed ? 'completed' : ''}">
                <div class="quest-title">📜 ${activeQuest.name}</div>
                <div class="quest-desc">${activeQuest.description}</div>
            </div>
            <div class="objectives">
                ${activeQuest.objectives.map(obj => `
                    <div class="objective ${obj.completed ? 'completed' : ''}">
                        ${obj.completed ? '✅' : '⭕'} ${obj.description}
                        <span class="progress">(${obj.current}/${obj.target})</span>
                    </div>
                `).join('')}
            </div>
            ${activeQuest.completed ? `
                <div class="quest-rewards">
                    🎁 Rewards: ${activeQuest.rewards.xp} XP, ${activeQuest.rewards.gold} Gold
                </div>
            ` : ''}
        `;
    }
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
            
            if (villageQuest.active && !villageQuest.completed &&
                villageQuest.objectives[0].completed && villageQuest.objectives[1].completed && 
                !villageQuest.objectives[2].completed) {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'dialogue-btn';
                completeBtn.textContent = '✓ I defeated the goblins!';
                completeBtn.onclick = () => {
                    updateQuestProgress('return_to_elder', 1);
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
                    updateQuestProgress('return_to_elder', 1);
                    document.getElementById('dialogue-text').textContent = 
                        "Outstanding! You have proven yourself a true hero. The village owes you everything!";
                    setTimeout(() => closeDialogue(), 2000);
                };
                options.appendChild(completeSkeletonBtn);
            }
        }
        
        if (npc.id === 'hermit') {
            const herbQuest = quests['herb_collection'];
            
            if (activeQuest.id === 'merchant_delivery' && !activeQuest.objectives[1].completed) {
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
            
            if (activeQuest.id === 'merchant_delivery' && activeQuest.objectives[0].completed && !activeQuest.objectives[2].completed) {
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
        }
        
        if (npc.id === 'guard') {
            const spiderQuest = quests['spider_cave'];
            
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

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && nearestInteractable) {
        const result = nearestInteractable.interact();
        if (result.npc) {
            interactWithNPC(result.npc);
        } else {
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
                addMessage('A goblin has respawned!', 'warning');
            }
        } else {
            if (goblin.mesh.visible) {
                goblin.mesh.rotation.y += delta * 0.5;
                goblin.mesh.children[0].position.y = 0.9 + Math.sin(Date.now() * 0.002) * 0.05;
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
                addMessage(`A ${monster.type} has respawned!`, 'warning');
            }
        } else {
            if (monster.mesh.visible) {
                // Add idle animation (slow rotation and bobbing)
                monster.mesh.rotation.y += delta * 0.3;
                if (monster.mesh.children.length > 0) {
                    monster.mesh.children[0].position.y += Math.sin(Date.now() * 0.002) * 0.002;
                }
            }
        }
    }
    
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
