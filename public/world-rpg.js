/**
 * World RPG - Main Game Entry Point (Refactored & Modular)
 * This file orchestrates all the modular components
 */
import * as THREE from 'three';
import { FBXCharacterLoader } from './modules/FBXCharacterLoader.js';
import { NPCFactory } from './modules/NPCFactory.js';
import { EnvironmentFactory } from './modules/EnvironmentFactory.js';
import { CameraController } from './modules/CameraController.js';
import { GoblinFactory } from './modules/GoblinFactory.js';
import { MonsterFactory } from './modules/MonsterFactory.js';
import { QuestFactory } from './modules/QuestFactory.js';
import { LootSystem } from '../src/loot/LootSystem.js';

// Import new modular components
import { WorldSetup } from './modules/WorldSetup.js';
import { PlayerState } from './modules/PlayerState.js';
import { InventorySystem, Item } from './modules/InventorySystem.js';
import { UIManager } from './modules/UIManager.js';
import { QuestManager } from './modules/QuestManager.js';
import { AnimationController } from './modules/AnimationController.js';
import { CombatSystem } from './modules/CombatSystem.js';
import { DialogueSystem } from './modules/DialogueSystem.js';
import { SkillSystem } from './modules/SkillSystem.js';
import { WorldInitializer } from './modules/WorldInitializer.js';

// ===== INITIALIZE WORLD SETUP =====
const worldSetup = new WorldSetup({ useAdvancedTerrain: true });
const { scene, camera, renderer, terrainGenerator } = worldSetup.init(document.getElementById('canvas-container'));

// ===== INITIALIZE UI MANAGER =====
const uiManager = new UIManager();
const addMessage = (text, type) => uiManager.addMessage(text, type);

// ===== INITIALIZE FACTORIES =====
// Create character loader first so it can be used for player
const characterLoader = new FBXCharacterLoader();

// ===== INITIALIZE PLAYER STATE =====
// Pass characterLoader to PlayerState so it can use the Baelin model
// Player will be created after characters are loaded in initWorld()
const playerState = new PlayerState(scene, characterLoader);
let player, characterGroup, equipmentVisuals;

// ===== INITIALIZE INVENTORY SYSTEM =====
const playerInventory = new InventorySystem(addMessage);
playerInventory.initStarterItems();

// ===== INITIALIZE QUEST SYSTEM =====
const questFactory = new QuestFactory();
const quests = questFactory.createStandardQuests();

// Systems that will be initialized after player is created
let questManager, skillSystem, combatSystem, cameraController, animationController, dialogueSystem;

// ===== INITIALIZE FACTORIES =====
const npcFactory = new NPCFactory(characterLoader);
const environmentFactory = new EnvironmentFactory(scene);
const goblinFactory = new GoblinFactory(scene, characterLoader.loadedModels);
const monsterFactory = new MonsterFactory(scene);

// ===== INITIALIZE WORLD =====
const worldInitializer = new WorldInitializer(
  scene,
  npcFactory,
  environmentFactory,
  goblinFactory,
  monsterFactory,
  characterLoader,
  addMessage,
  terrainGenerator
);

// ===== UI FUNCTIONS =====
function updateUI() {
  uiManager.updatePlayerStats(player);
}

function updateCharacterAppearance() {
  // Update helmet appearance
  if (playerInventory.equipment.head) {
    const headItem = playerInventory.equipment.head;
    const rarityColor = headItem.rarityColor || '#757575';
    equipmentVisuals.helmet.material.color.setStyle(rarityColor);
    equipmentVisuals.helmet.material.emissive.setStyle(rarityColor);
    equipmentVisuals.helmet.material.emissiveIntensity = 0.2;
    equipmentVisuals.helmet.visible = true;
  } else {
    equipmentVisuals.helmet.visible = true;
    equipmentVisuals.helmet.material.color.set(0x757575);
    equipmentVisuals.helmet.material.emissive.set(0x000000);
    equipmentVisuals.helmet.material.emissiveIntensity = 0;
  }
  
  // Update sword appearance
  if (playerInventory.equipment.weapon) {
    const weaponItem = playerInventory.equipment.weapon;
    const rarityColor = weaponItem.rarityColor || '#c0c0c0';
    const bladeMesh = equipmentVisuals.sword.children.find(child => child.geometry.type === 'BoxGeometry');
    if (bladeMesh) {
      bladeMesh.material.color.setStyle(rarityColor);
      bladeMesh.material.emissive.set(0x60a5fa);
      bladeMesh.material.emissiveIntensity = weaponItem.rarity === 'legendary' ? 0.5 : 
                                                weaponItem.rarity === 'epic' ? 0.4 : 0.3;
    }
    equipmentVisuals.sword.visible = true;
  } else {
    equipmentVisuals.sword.visible = true;
    const bladeMesh = equipmentVisuals.sword.children.find(child => child.geometry.type === 'BoxGeometry');
    if (bladeMesh) {
      bladeMesh.material.color.set(0xc0c0c0);
      bladeMesh.material.emissive.set(0x60a5fa);
      bladeMesh.material.emissiveIntensity = 0.3;
    }
  }
  
  // Update shield appearance
  if (playerInventory.equipment.shield) {
    const shieldItem = playerInventory.equipment.shield;
    const rarityColor = shieldItem.rarityColor || '#4ade80';
    equipmentVisuals.shield.material.color.setStyle(rarityColor);
    equipmentVisuals.shield.material.emissive.setStyle(rarityColor);
    equipmentVisuals.shield.material.emissiveIntensity = shieldItem.rarity === 'legendary' ? 0.4 : 
                                                           shieldItem.rarity === 'epic' ? 0.3 : 0.2;
    equipmentVisuals.shield.visible = true;
  } else {
    equipmentVisuals.shield.visible = true;
    equipmentVisuals.shield.material.color.set(0x4ade80);
    equipmentVisuals.shield.material.emissive.set(0x22c55e);
    equipmentVisuals.shield.material.emissiveIntensity = 0.2;
  }
}

function useItem(item) {
  if (item.type === 'consumable') {
    if (item.stats.healing) {
      const healed = player.heal(item.stats.healing);
      addMessage(`Used ${item.icon} ${item.name}, restored ${healed} HP`, 'success');
      updateUI();
    }
    playerInventory.removeItem(item.id);
    updateInventoryUI();
  } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
    if (item.slot) {
      const existingItem = playerInventory.equipment[item.slot];
      if (existingItem) {
        playerInventory.addItem(existingItem);
      }
      playerInventory.equipment[item.slot] = item;
      playerInventory.removeItem(item.id);
      addMessage(`Equipped ${item.rarityIcon || ''} ${item.name}`, 'success');
      updateCharacterAppearance();
      updateInventoryUI();
    }
  }
}

function updateInventoryUI() {
  uiManager.updateInventoryUI(playerInventory, useItem, updateCharacterAppearance);
}

function openInventory() {
  document.getElementById('inventory-panel').classList.add('show');
  updateInventoryUI();
}

function closeInventory() {
  document.getElementById('inventory-panel').classList.remove('show');
}

// ===== SKILLS PANEL =====
function openSkillsPanel() {
  document.getElementById('skills-panel').classList.add('show');
  updateSkillsUI();
}

function closeSkillsPanel() {
  document.getElementById('skills-panel').classList.remove('show');
}

function updateSkillsUI() {
  // Update attribute points available
  document.getElementById('attr-points-available').textContent = player.availableAttributePoints;
  document.getElementById('spell-points-available').textContent = player.availableSkillPoints;
  document.getElementById('learned-count').textContent = player.skills.length;
  
  // Populate attributes list
  const attributesList = document.getElementById('attributes-list');
  attributesList.innerHTML = '';
  
  const attributes = [
    { key: 'str', name: 'Strength (STR)', desc: 'Physical power & armor' },
    { key: 'dex', name: 'Dexterity (DEX)', desc: 'Agility & dodge' },
    { key: 'con', name: 'Constitution (CON)', desc: 'Health & endurance' },
    { key: 'int', name: 'Intelligence (INT)', desc: 'Magical power' },
    { key: 'wiz', name: 'Wisdom (WIZ)', desc: 'Mana & magic resistance' },
    { key: 'cha', name: 'Charisma (CHA)', desc: 'Social interactions' }
  ];
  
  attributes.forEach(attr => {
    const attrDiv = document.createElement('div');
    attrDiv.className = 'attribute-row';
    attrDiv.innerHTML = `
      <span class="attribute-name">${attr.name}</span>
      <span style="color: #94a3b8; font-size: 12px; flex: 1;">${attr.desc}</span>
      <span class="attribute-value">${player.attributes[attr.key]}</span>
      <button class="attr-btn" onclick="spendAttributePoint('${attr.key}')" 
        ${player.availableAttributePoints <= 0 ? 'disabled' : ''}>+</button>
    `;
    attributesList.appendChild(attrDiv);
  });
  
  // Populate learned skills
  const learnedSkillsList = document.getElementById('learned-skills-list');
  learnedSkillsList.innerHTML = '';
  
  if (player.skills.length === 0) {
    learnedSkillsList.innerHTML = '<p style="color: #94a3b8; text-align: center;">No skills learned yet</p>';
  } else {
    const skillHotbar = skillSystem.getHotbar();
    player.skills.forEach((skill, index) => {
      const skillDiv = document.createElement('div');
      skillDiv.className = 'skill-item learned';
      
      let statsHTML = '';
      if (skill.damage) statsHTML += `<span class="skill-stat">💥 Damage: ${skill.damage}</span>`;
      if (skill.healing) statsHTML += `<span class="skill-stat">❤️ Healing: ${skill.healing}</span>`;
      if (skill.manaCost) statsHTML += `<span class="skill-stat">💙 Mana: ${skill.manaCost}</span>`;
      
      const hotbarSlot = skillHotbar.indexOf(skill) >= 0 ? skillHotbar.indexOf(skill) + 1 : '';
      
      skillDiv.innerHTML = `
        <div class="skill-header">
          <span class="skill-name">${skill.name}</span>
          ${hotbarSlot ? `<span style="color: #fbbf24; font-size: 12px;">Hotbar: ${hotbarSlot}</span>` : ''}
        </div>
        <div class="skill-desc">${skill.description}</div>
        <div class="skill-stats">${statsHTML}</div>
        <div style="font-size: 11px; color: #60a5fa;">Type: ${skill.type} | Target: ${skill.targetType}</div>
      `;
      learnedSkillsList.appendChild(skillDiv);
    });
  }
  
  // Populate available spells
  const availableSpellsList = document.getElementById('available-spells-list');
  availableSpellsList.innerHTML = '';
  
  if (player.availableSpells.length === 0) {
    availableSpellsList.innerHTML = '<p style="color: #94a3b8; text-align: center;">No new spells available</p>';
  } else {
    player.availableSpells.forEach(spell => {
      const alreadyLearned = player.skills.some(s => s.name === spell.name);
      if (alreadyLearned) return;
      
      const meetsReqs = spell.meetsRequirements(player);
      const canAfford = player.availableSkillPoints >= 1;
      const canLearn = meetsReqs && canAfford;
      
      const spellDiv = document.createElement('div');
      spellDiv.className = `skill-item ${canLearn ? '' : 'locked'}`;
      
      let statsHTML = '';
      if (spell.damage) statsHTML += `<span class="skill-stat">💥 Damage: ${spell.damage}</span>`;
      if (spell.healing) statsHTML += `<span class="skill-stat">❤️ Healing: ${spell.healing}</span>`;
      if (spell.manaCost) statsHTML += `<span class="skill-stat">💙 Mana: ${spell.manaCost}</span>`;
      
      let reqsHTML = '';
      const reqs = [];
      for (const [key, value] of Object.entries(spell.requirements)) {
        if (key === 'level') {
          const met = player.level >= value;
          reqs.push(`Level ${value}${met ? ' ✓' : ' ✗'}`);
        } else if (player.attributes[key] !== undefined) {
          const met = player.attributes[key] >= value;
          reqs.push(`${key.toUpperCase()} ${value}${met ? ' ✓' : ' ✗'}`);
        }
      }
      reqsHTML = reqs.join(', ');
      
      spellDiv.innerHTML = `
        <div class="skill-header">
          <span class="skill-name">${spell.name}</span>
          <span class="skill-cost">1 Skill Point</span>
        </div>
        <div class="skill-desc">${spell.description}</div>
        <div class="skill-stats">${statsHTML}</div>
        <div class="skill-requirements ${meetsReqs ? 'met' : ''}">
          Requirements: ${reqsHTML}
        </div>
        <button class="learn-btn" onclick="learnSpellFromUI('${spell.name}')" 
          ${canLearn ? '' : 'disabled'}>
          ${canLearn ? '📖 Learn Spell' : (meetsReqs ? '⚠️ No Skill Points' : '🔒 Requirements Not Met')}
        </button>
      `;
      availableSpellsList.appendChild(spellDiv);
    });
  }
}

function spendAttributePoint(attributeName) {
  if (player.spendAttributePoints(attributeName, 1)) {
    addMessage(`+1 ${attributeName.toUpperCase()}!`, 'success');
    updateSkillsUI();
    updateUI();
  }
}

function learnSpellFromUI(spellName) {
  const spell = player.availableSpells.find(s => s.name === spellName);
  if (spell && skillSystem.learnSpell(spell)) {
    updateSkillsUI();
    updateUI();
  }
}

// ===== TRADING FUNCTIONS =====
function updatePlayerItemsInTradeUI() {
  const playerItems = document.getElementById('player-items');
  playerItems.innerHTML = '';
  
  playerInventory.items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'trade-item';
    const rarityColor = item.rarityColor || '#ffffff';
    const rarityIcon = item.rarityIcon || '';
    itemDiv.innerHTML = `
      <div class="item-info">
        <div class="icon">${item.icon}</div>
        <div class="details">
          <div class="name" style="color: ${rarityColor};">${rarityIcon} ${item.name}</div>
          <div class="price">💰 ${Math.floor(item.value * 0.5)} gold</div>
        </div>
      </div>
    `;
    itemDiv.onclick = () => sellItem(item);
    itemDiv.title = item.description || '';
    playerItems.appendChild(itemDiv);
  });
}

function buyItem(item) {
  const price = Math.ceil(item.value * 1.5);
  if (playerInventory.removeGold(price)) {
    const newItem = new Item(item.id, item.name, item.icon, item.type, item.value, item.stats);
    if (playerInventory.addItem(newItem)) {
      document.getElementById('trade-gold-amount').textContent = playerInventory.gold;
      addMessage(`Bought ${item.rarityIcon || ''} ${item.name} for ${price} gold`, 'success');
      updatePlayerItemsInTradeUI();
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
    // Refresh trading UI
    const npc = worldInitializer.getCreatedObjects().npcs.find(n => n.type === 'merchant');
    if (npc) dialogueSystem.openTrading(npc, playerInventory, buyItem, sellItem);
  }
}

function closeTrading() {
  document.getElementById('trading-panel').classList.remove('show');
}

function closeDialogue() {
  document.getElementById('dialogue-panel').classList.remove('show');
}

// Expose functions to global scope for inline HTML handlers
if (typeof window !== 'undefined') {
  window.openSkillsPanel = openSkillsPanel;
  window.closeSkillsPanel = closeSkillsPanel;
  window.spendAttributePoint = spendAttributePoint;
  window.learnSpellFromUI = learnSpellFromUI;
  window.openInventory = openInventory;
  window.closeInventory = closeInventory;
  window.closeTrading = closeTrading;
}

// ===== INTERACTION CHECKING =====
let nearestInteractable = null;
let currentMonsterTarget = null;

function checkInteractions() {
  let nearestObject = null;
  let nearestDistance = 2.5;
  
  const { environmentObjects } = worldInitializer.getCreatedObjects();
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
  
  if (nearestObject) {
    let displayName = nearestObject.type;
    if (nearestObject.npc) {
      displayName = nearestObject.npc.name;
    }
    uiManager.updateInteractionPrompt(true, displayName);
    return nearestObject;
  } else {
    uiManager.updateInteractionPrompt(false);
    return null;
  }
}

function interactWithNPC(npc) {
  dialogueSystem.interactWithNPC(
    npc,
    playerInventory,
    buyItem,
    sellItem,
    worldInitializer.getCreatedObjects().npcs
  );
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
    } else if (result.type === 'chest' || result.type === 'magical_chest') {
      addMessage(result.message, result.type || 'info');
      if (result.healing) {
        player.heal(result.healing);
        updateUI();
      }
    }
  }
  
  if (e.key === ' ' && animationController.getState() !== 'attacking') {
    e.preventDefault();
    animationController.setState('attacking');
    
    // Perform attack
    const { environmentObjects } = worldInitializer.getCreatedObjects();
    const result = combatSystem.performAttack(
      player,
      environmentObjects,
      (monster) => {
        uiManager.showMonsterHealthBar(monster);
        currentMonsterTarget = monster;
      },
      () => {
        uiManager.hideMonsterHealthBar();
        currentMonsterTarget = null;
      },
      updateUI,
      playerInventory,
      LootSystem
    );
  }

  // Cheat: press 'L' to level up instantly
  if (e.key.toLowerCase() === 'l') {
    const result = player.levelUp();
    addMessage(`Cheat: Leveled up to ${player.level}! (+${result.attributePoints} AP, +${result.skillPoints} SP)`, 'success');
    updateUI();
    updateSkillsUI();
    combatSystem.createLevelUpEffect(player.position);
  }
  
  if (e.key.toLowerCase() === 'r' && animationController.getState() === 'idle') {
    animationController.setState('resting');
  }
  
  if (e.key.toLowerCase() === 'i') {
    const invPanel = document.getElementById('inventory-panel');
    if (invPanel.classList.contains('show')) {
      closeInventory();
    } else {
      openInventory();
    }
  }
  
  if (e.key.toLowerCase() === 'k') {
    const skillsPanel = document.getElementById('skills-panel');
    if (skillsPanel.classList.contains('show')) {
      closeSkillsPanel();
    } else {
      openSkillsPanel();
    }
  }
  
  // Number keys for skill hotbar
  if (e.key >= '1' && e.key <= '5') {
    const slotIndex = parseInt(e.key) - 1;
    const { environmentObjects } = worldInitializer.getCreatedObjects();
    skillSystem.useSkillFromHotbar(
      slotIndex,
      environmentObjects,
      () => {
        uiManager.hideMonsterHealthBar();
        currentMonsterTarget = null;
      },
      playerInventory,
      LootSystem,
      () => combatSystem.createLevelUpEffect(player.position)
    );
  }
  
  if (e.key === 'Escape') {
    closeInventory();
    closeTrading();
    closeDialogue();
    closeSkillsPanel();
  }
});

// ===== MONSTER AI HELPER FUNCTIONS =====
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
  let haloColor = 0xffffff;
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

function updateMonsterAI(monster, delta, playerPos) {
  if (!monster.alive) return;
  
  const dx = playerPos.x - monster.position.x;
  const dz = playerPos.z - monster.position.z;
  const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
  
  // Initialize wandering state if not exists
  if (!monster.wanderTarget) {
    monster.wanderTarget = { x: monster.spawnPosition.x, z: monster.spawnPosition.z };
    monster.wanderTimer = 0;
    monster.wanderDelay = 2 + Math.random() * 3;
  }
  
  // Reset attack flag after some time
  if (monster.wasAttacked) {
    if (!monster.attackedTime) {
      monster.attackedTime = Date.now();
    }
    if (Date.now() - monster.attackedTime > 5000) {
      monster.wasAttacked = false;
      monster.isRetreating = false;
      monster.attackedTime = null;
    }
  }
  
  let isEngaged = false;
  
  // Handle different stances
  if (monster.stance === 'flee') {
    if (monster.wasAttacked && distanceToPlayer < monster.fleeDistance) {
      monster.isRetreating = true;
      const fleeX = monster.position.x - dx * 0.02;
      const fleeZ = monster.position.z - dz * 0.02;
      monster.position.x = fleeX;
      monster.position.z = fleeZ;
      const fleeY = terrainGenerator ? terrainGenerator.getHeightAt(fleeX, fleeZ) : 0;
      monster.mesh.position.set(fleeX, fleeY, fleeZ);
      isEngaged = true;
    }
  } else if (monster.stance === 'defensive') {
    if (monster.wasAttacked && distanceToPlayer < 3) {
      monsterAttackPlayer(monster);
      isEngaged = true;
    }
  } else if (monster.stance === 'aggressive') {
    if (distanceToPlayer < monster.aggroRange) {
      const moveSpeed = 0.8 * delta;
      const moveX = monster.position.x + (dx / distanceToPlayer) * moveSpeed;
      const moveZ = monster.position.z + (dz / distanceToPlayer) * moveSpeed;
      monster.position.x = moveX;
      monster.position.z = moveZ;
      const moveY = terrainGenerator ? terrainGenerator.getHeightAt(moveX, moveZ) : 0;
      monster.mesh.position.set(moveX, moveY, moveZ);
      
      const angle = Math.atan2(dx, dz);
      monster.mesh.rotation.y = angle;
      
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
      const wanderRadius = 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * wanderRadius;
      monster.wanderTarget = {
        x: monster.spawnPosition.x + Math.cos(angle) * distance,
        z: monster.spawnPosition.z + Math.sin(angle) * distance
      };
      monster.wanderTimer = 0;
      monster.wanderDelay = 2 + Math.random() * 3;
    }
    
    const wanderDx = monster.wanderTarget.x - monster.position.x;
    const wanderDz = monster.wanderTarget.z - monster.position.z;
    const wanderDist = Math.sqrt(wanderDx * wanderDx + wanderDz * wanderDz);
    
    if (wanderDist > 0.1) {
      const wanderSpeed = 0.3 * delta;
      const moveX = monster.position.x + (wanderDx / wanderDist) * wanderSpeed;
      const moveZ = monster.position.z + (wanderDz / wanderDist) * wanderSpeed;
      monster.position.x = moveX;
      monster.position.z = moveZ;
      const moveY = terrainGenerator ? terrainGenerator.getHeightAt(moveX, moveZ) : 0;
      monster.mesh.position.set(moveX, moveY, moveZ);
      
      const wanderAngle = Math.atan2(wanderDx, wanderDz);
      monster.mesh.rotation.y = wanderAngle;
    }
  }
  
  updateMonsterHalo(monster);
}

function monsterAttackPlayer(monster) {
  const currentTime = Date.now() / 1000;
  if (currentTime - monster.lastAttackTime < monster.attackCooldown) {
    return;
  }
  
  monster.lastAttackTime = currentTime;
  const monsterDamage = Math.floor(monster.damage * 0.5 + Math.random() * monster.damage * 0.5);
  const actualDamage = player.takeDamage(monsterDamage);
  
  addMessage(`💥 ${monster.type.toUpperCase()} attacks you for ${actualDamage} damage (${monsterDamage} reduced by armor)!`, 'warning');
  updateUI();
  
  combatSystem.createAttackEffect(player.position);
  
  // Check if player died
  if (!player.isAlive()) {
    addMessage('💀 You have been defeated!', 'warning');
    setTimeout(() => {
      player.stats.hp = player.stats.maxHp;
      player.position.x = 0;
      player.position.z = 0;
      player.position.y = terrainGenerator ? terrainGenerator.getHeightAt(0, 0) : 0;
      characterGroup.position.set(player.position.x, player.position.y, player.position.z);
      addMessage('You have respawned at the starting location.', 'info');
      updateUI();
    }, 3000);
  }
}

// ===== LOAD ASSETS AND INITIALIZE WORLD =====
(async function initWorld() {
  // Load all character models first (required for player and NPCs)
  addMessage('Loading character models...', 'info');
  await characterLoader.loadAllCharacters((progress) => {
    console.log(`Loading characters: ${progress}%`);
  });
  addMessage('Character models loaded!', 'success');
  
  // Now create the player with the loaded Baelin model
  const playerResult = playerState.createPlayer();
  player = playerResult.player;
  characterGroup = playerResult.characterGroup;
  equipmentVisuals = playerResult.equipmentVisuals;
  
  // ===== INITIALIZE SYSTEMS THAT DEPEND ON PLAYER =====
  questManager = new QuestManager(
    quests,
    addMessage,
    (activeQuests) => uiManager.updateQuestUI(activeQuests),
    () => uiManager.updateMinimap(player, questManager.getActiveQuests())
  );

  combatSystem = new CombatSystem(scene, addMessage);

  skillSystem = new SkillSystem(
    player,
    addMessage,
    (position, color) => combatSystem.createSkillEffect(position, color),
    (monster) => uiManager.showMonsterHealthBar(monster),
    () => uiManager.updatePlayerStats(player)
  );
  skillSystem.initStarterSkills();
  skillSystem.initAvailableSpells();

  // Update hotbar UI after initialization
  setTimeout(() => skillSystem.updateHotbar(), 100);

  cameraController = new CameraController(camera, renderer, characterGroup);

  dialogueSystem = new DialogueSystem(
    quests,
    questManager,
    addMessage,
    closeDialogue,
    closeTrading,
    updatePlayerItemsInTradeUI
  );

  animationController = new AnimationController(
    player,
    equipmentVisuals,
    (state) => uiManager.showAnimationLabel(state)
  );

  // Initialize merchant inventory after loot system is available
  dialogueSystem.initMerchantInventory(LootSystem);
  
  await worldInitializer.initWorld(
    playerInventory,
    (objectiveId, amount) => {
      questManager.updateProgress(
        objectiveId,
        amount,
        player,
        playerInventory,
        updateUI,
        () => combatSystem.createLevelUpEffect(player.position)
      );
    }
  );
  
  // Set player's initial Y position on terrain
  if (terrainGenerator) {
    player.position.y = terrainGenerator.getHeightAt(player.position.x, player.position.z);
    characterGroup.position.y = player.position.y;
  }
  
  // Initialize UI
  updateInventoryUI();
  uiManager.updateQuestUI(questManager.getActiveQuests());
  updateUI();
  addMessage('Explore the world! Use WASD to move, I for inventory', 'info');
})();

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  // Don't process game logic until everything is initialized
  if (!player || !animationController || !cameraController) {
    renderer.render(scene, camera);
    return;
  }
  
  // Movement
  if (animationController.getState() !== 'attacking' && animationController.getState() !== 'resting') {
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
      
      // Update player Y position to match terrain height
      if (terrainGenerator) {
        player.position.y = terrainGenerator.getHeightAt(player.position.x, player.position.z);
      }
      
      player.rotation = moveAngle;
      characterGroup.rotation.y = player.rotation;
      
      if (player.isRunning) {
        animationController.setState('running');
        player.stamina = Math.max(0, player.stamina - 10 * delta);
      } else {
        animationController.setState('walking');
        player.stamina = Math.min(player.maxStamina, player.stamina + 5 * delta);
      }
    } else {
      if (animationController.getState() === 'walking' || animationController.getState() === 'running') {
        animationController.setState('idle');
      }
      player.stamina = Math.min(player.maxStamina, player.stamina + 15 * delta);
      
      // Update player Y position even when not moving to stay on terrain
      if (terrainGenerator) {
        player.position.y = terrainGenerator.getHeightAt(player.position.x, player.position.z);
      }
    }
    
    characterGroup.position.set(player.position.x, player.position.y, player.position.z);
    updateUI();
  }
  
  // Update animation
  animationController.update(delta);
  
  // Handle resting healing
  if (animationController.getState() === 'resting' && animationController.animationTime > 2) {
    const healed = player.heal(30);
    addMessage(`Rested and recovered ${healed} HP`, 'success');
    updateUI();
  }
  
  // Update NPCs
  const { npcs } = worldInitializer.getCreatedObjects();
  npcs.forEach(npc => {
    if (npc.mixer) {
      npc.mixer.update(delta);
    }
    if (npc.icon) {
      npc.icon.position.y = 2.7 + Math.sin(Date.now() * 0.002) * 0.2;
    }
  });
  
  // Check for nearby interactable objects
  nearestInteractable = checkInteractions();
  
  // Animate campfires
  const { environmentObjects } = worldInitializer.getCreatedObjects();
  for (const obj of environmentObjects) {
    if (obj.type === 'campfire' && obj.fire) {
      obj.fire.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      obj.fire.scale.x = 1 + Math.cos(Date.now() * 0.005) * 0.2;
    }
  }
  
  // Goblin respawn and AI
  const { goblins, monsters } = worldInitializer.getCreatedObjects();
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
        const goblinY = terrainGenerator ? terrainGenerator.getHeightAt(goblin.spawnPosition.x, goblin.spawnPosition.z) : 0;
        goblin.mesh.position.set(goblin.spawnPosition.x, goblinY, goblin.spawnPosition.z);
        goblin.wasAttacked = false;
        goblin.isRetreating = false;
        addMessage('A goblin has respawned!', 'warning');
      }
    } else {
      if (goblin.mesh.visible) {
        if (!goblin.wasAttacked && !goblin.isRetreating) {
          goblin.mesh.rotation.y += delta * 0.5;
        }
        goblin.mesh.children[0].position.y = 0.9 + Math.sin(Date.now() * 0.002) * 0.05;
        updateMonsterAI(goblin, delta, player.position);
      }
    }
  }
  
  // Monster respawn and AI
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
        const monsterY = terrainGenerator ? terrainGenerator.getHeightAt(monster.spawnPosition.x, monster.spawnPosition.z) : 0;
        monster.mesh.position.set(monster.spawnPosition.x, monsterY, monster.spawnPosition.z);
        monster.wasAttacked = false;
        monster.isRetreating = false;
        addMessage(`A ${monster.type} has respawned!`, 'warning');
      }
    } else {
      if (monster.mesh.visible) {
        if (!monster.wasAttacked && !monster.isRetreating) {
          monster.mesh.rotation.y += delta * 0.3;
        }
        if (monster.mesh.children.length > 0) {
          monster.mesh.children[0].position.y += Math.sin(Date.now() * 0.002) * 0.002;
        }
        updateMonsterAI(monster, delta, player.position);
      }
    }
  }
  
  // Update combat particles
  combatSystem.updateParticles(delta);
  
  // Update monster health bar
  if (currentMonsterTarget) {
    uiManager.updateMonsterHealthBar(currentMonsterTarget);
  }
  
  // Update attack cooldown UI
  uiManager.updateAttackCooldownUI(
    combatSystem.getLastAttackTime(),
    combatSystem.getAttackCooldown()
  );
  
  // Update skill hotbar
  skillSystem.updateHotbar();
  
  // Update minimap
  uiManager.updateMinimap(player, questManager.getActiveQuests());
  
  // Animate water if using advanced terrain
  worldSetup.animate(delta);
  
  cameraController.update();
  renderer.render(scene, camera);
}

// Start
animate();

console.log('RPG Engine - Fully refactored with modular components loaded');
