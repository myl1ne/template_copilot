/**
 * PlayerState - Player character management
 * Handles player creation, movement, and visual representation
 */
import * as THREE from 'three';
import { Character } from './Character.js';
import { GameConfig } from './GameConfig.js';

export class PlayerState {
  constructor(scene) {
    this.scene = scene;
    this.characterGroup = null;
    this.equipmentVisuals = {};
    this.player = null;
    this.velocity = { x: 0, z: 0 };
    this.animationState = 'idle';
    this.animationTime = 0;
  }

  /**
   * Create the player character and visual representation
   * @returns {Object} - { player, characterGroup, equipmentVisuals }
   */
  createPlayer() {
    // Create player character with stats
    this.player = new Character('Thorin the Brave', GameConfig.player.startingStats);

    // Add movement and animation properties
    this.player.position = { x: 0, y: 0, z: 0 };
    this.player.rotation = 0;
    this.player.velocity = { x: 0, z: 0 };
    this.player.speed = GameConfig.player.movement.speed;
    this.player.runSpeed = GameConfig.player.movement.runSpeed;
    this.player.isRunning = false;
    this.player.animationState = 'idle';
    this.player.animationTime = 0;
    this.player.stamina = GameConfig.player.movement.maxStamina;
    this.player.maxStamina = GameConfig.player.movement.maxStamina;

    // Create visual character
    this.characterGroup = new THREE.Group();
    this.characterGroup.position.set(0, 0, 0);

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
    this.characterGroup.add(body);
    this.equipmentVisuals.body = body;

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
    this.characterGroup.add(head);
    this.equipmentVisuals.head = head;

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
    this.characterGroup.add(helmet);
    this.equipmentVisuals.helmet = helmet;

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
    this.characterGroup.add(shield);
    this.equipmentVisuals.shield = shield;

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
    this.characterGroup.add(swordGroup);
    this.equipmentVisuals.sword = swordGroup;

    this.scene.add(this.characterGroup);

    return {
      player: this.player,
      characterGroup: this.characterGroup,
      equipmentVisuals: this.equipmentVisuals
    };
  }

  /**
   * Get the player character
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Get the character group (3D mesh)
   */
  getCharacterGroup() {
    return this.characterGroup;
  }

  /**
   * Get equipment visuals
   */
  getEquipmentVisuals() {
    return this.equipmentVisuals;
  }
}
