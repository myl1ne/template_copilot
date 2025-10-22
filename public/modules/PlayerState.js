/**
 * PlayerState - Player character management
 * Handles player creation, movement, and visual representation
 */
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Character } from './Character.js';
import { GameConfig } from './GameConfig.js';

export class PlayerState {
  constructor(scene, characterLoader = null) {
    this.scene = scene;
    this.characterGroup = null;
    this.equipmentVisuals = {};
    this.player = null;
    this.velocity = { x: 0, z: 0 };
    this.animationState = 'idle';
    this.animationTime = 0;
    this.characterLoader = characterLoader;
    this.characterModel = null;
    this.bones = {};
    this.mixer = null;
    this.animations = {};
  }

  /**
   * Find a bone by name in the character model
   */
  findBone(model, boneName) {
    let foundBone = null;
    model.traverse((child) => {
      if (child.isBone && child.name === boneName) {
        foundBone = child;
      }
    });
    return foundBone;
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

    // Try to use Baelin FBX model if available
    if (this.characterLoader && this.characterLoader.hasCharacter('baelin')) {
      this.createFBXPlayer();
    } else {
      this.createPrimitivePlayer();
    }

    this.scene.add(this.characterGroup);

    return {
      player: this.player,
      characterGroup: this.characterGroup,
      equipmentVisuals: this.equipmentVisuals
    };
  }

  /**
   * Create player using Baelin FBX model with equipment attached to bones
   */
  createFBXPlayer() {
    // Clone the Baelin model
    const baelinModel = SkeletonUtils.clone(this.characterLoader.getModel('baelin'));
    baelinModel.scale.multiplyScalar(1.5); // Scale up slightly for player
    baelinModel.rotation.y = 0            ; // Face forward
    
    // Configure meshes
    baelinModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });
    
    this.characterGroup.add(baelinModel);
    this.characterModel = baelinModel;
    
    // Find bones for equipment attachment
    this.bones.rightHand = this.findBone(baelinModel, 'RightHand');
    this.bones.leftHand = this.findBone(baelinModel, 'LeftHand');
    this.bones.head = this.findBone(baelinModel, 'Head');
    
    // Setup animation mixer
    this.mixer = new THREE.AnimationMixer(baelinModel);
    
    // Get animations from character loader
    const idleAnim = this.characterLoader.getAnimation('baelin_idle');
    const walkAnim = this.characterLoader.getAnimation('baelin_walk');
    const runAnim = this.characterLoader.getAnimation('baelin_run');
    
    // Create animation actions
    if (idleAnim) {
      this.animations.idle = this.mixer.clipAction(idleAnim);
      this.animations.idle.play();
    }
    if (walkAnim) {
      this.animations.walking = this.mixer.clipAction(walkAnim);
    }
    if (runAnim) {
      this.animations.running = this.mixer.clipAction(runAnim);
    }
    
    // Create and attach equipment
    this.createEquipment();
    
    // Store reference to body (the model itself)
    this.equipmentVisuals.body = baelinModel;
  }

  /**
   * Create player using primitive shapes (fallback)
   */
  createPrimitivePlayer() {
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
  }

  /**
   * Create equipment and attach to bones
   */
  createEquipment() {
    // Create Helmet (attached to Head bone)
    const helmetGeometry = new THREE.ConeGeometry(0.25, 0.3, 8);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x757575, 
      roughness: 0.4, 
      metalness: 0.8 
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.set(0, 0.25, 0);
    helmet.castShadow = true;
    
    if (this.bones.head) {
      this.bones.head.add(helmet);
    } else {
      this.characterGroup.add(helmet);
    }
    this.equipmentVisuals.helmet = helmet;

    // Create Sword (attached to RightHand bone)
    const swordGroup = new THREE.Group();
    const bladeGeometry = new THREE.BoxGeometry(0.08, 1.0, 0.04);
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.3
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.5;
    blade.castShadow = true;
    swordGroup.add(blade);

    const hiltGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.08);
    const hiltMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513, 
      roughness: 0.6, 
      metalness: 0.4 
    });
    const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
    hilt.castShadow = true;
    swordGroup.add(hilt);

    // Position and rotate sword to look natural in hand
    swordGroup.rotation.x = -Math.PI / 2;
    swordGroup.rotation.z = Math.PI / 2;
    swordGroup.position.set(0, 0, 0);
    
    if (this.bones.rightHand) {
      this.bones.rightHand.add(swordGroup);
    } else {
      this.characterGroup.add(swordGroup);
    }
    this.equipmentVisuals.sword = swordGroup;

    // Create Shield (attached to LeftHand bone)
    const shieldGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.5,
      metalness: 0.6,
      emissive: 0x22c55e,
      emissiveIntensity: 0.2
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.rotation.x = Math.PI / 2;
    shield.position.set(0, 0, 0);
    shield.castShadow = true;
    
    if (this.bones.leftHand) {
      this.bones.leftHand.add(shield);
    } else {
      this.characterGroup.add(shield);
    }
    this.equipmentVisuals.shield = shield;
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

  /**
   * Get animation mixer
   */
  getMixer() {
    return this.mixer;
  }

  /**
   * Get animations
   */
  getAnimations() {
    return this.animations;
  }
}
