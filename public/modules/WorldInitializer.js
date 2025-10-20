/**
 * WorldInitializer - World population and initialization
 * Handles creation of NPCs, monsters, environment objects
 */
import { GameConfig } from './GameConfig.js';
import { Item } from './InventorySystem.js';

export class WorldInitializer {
  constructor(
    scene,
    npcFactory,
    environmentFactory,
    goblinFactory,
    monsterFactory,
    characterLoader,
    addMessageFn
  ) {
    this.scene = scene;
    this.npcFactory = npcFactory;
    this.environmentFactory = environmentFactory;
    this.goblinFactory = goblinFactory;
    this.monsterFactory = monsterFactory;
    this.characterLoader = characterLoader;
    this.addMessage = addMessageFn;
    
    this.npcs = [];
    this.environmentObjects = [];
    this.goblins = [];
    this.monsters = [];
  }

  /**
   * Load all character assets
   * @returns {Promise}
   */
  async loadAssets() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    
    this.addMessage('Loading character assets...', 'info');
    
    // Load all characters with progress tracking
    await this.characterLoader.loadAllCharacters((progress) => {
      loadingBar.style.width = progress + '%';
      loadingText.textContent = `Loading assets... ${progress}%`;
    });
    
    // Hide loading screen
    loadingText.textContent = 'Loading complete! Starting game...';
    await new Promise(r => setTimeout(r, 500));
    loadingScreen.classList.add('hidden');
    
    this.addMessage('✓ Assets loaded!', 'success');
  }

  /**
   * Create all NPCs
   */
  createNPCs() {
    const standardNPCs = this.npcFactory.createStandardNPCs();
    standardNPCs.forEach(npc => {
      this.npcs.push(npc);
      const npcObj = this.npcFactory.createNPCMesh(npc, this.scene);
      this.environmentObjects.push(npcObj);

      // For specific NPCs that were found buried, lift them slightly
      if (npc.id === 'elder' || npc.id === 'guard') {
        try {
          const meshGroup = npc.mesh;
          let lift = 0.5; // fallback lift
          if (meshGroup && meshGroup.children && meshGroup.children.length > 0) {
            const firstChild = meshGroup.children.find(c => c.isMesh || c.isGroup) || meshGroup.children[0];
            const THREE = await import('three');
            const bbox = new THREE.Box3().setFromObject(firstChild);
            const size = bbox.getSize(new THREE.Vector3());
            const h = size.y || 1.0;
            lift = h * 0.25;
          }
          meshGroup.position.y += lift;
        } catch (err) {
          console.warn('Failed to lift NPC', npc.id, err);
        }
      }
    });
  }

  /**
   * Create environment objects (trees, rocks, chests, buildings, etc.)
   * @param {Object} inventory - Inventory system
   */
  createEnvironmentObjects(inventory) {
    // Trees
    for (let i = 0; i < GameConfig.environment.trees; i++) {
      const angle = (i / GameConfig.environment.trees) * Math.PI * 2;
      const radius = GameConfig.environment.treeRadius.min + 
                     Math.random() * (GameConfig.environment.treeRadius.max - GameConfig.environment.treeRadius.min);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.environmentObjects.push(
        this.environmentFactory.createTree(x, z, Item, inventory, this.addMessage)
      );
    }
    
    // Rocks
    for (let i = 0; i < GameConfig.environment.rocks; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      this.environmentObjects.push(
        this.environmentFactory.createRock(x, z, 0.8 + Math.random() * 0.6)
      );
    }
    
    // Chests
    this.environmentObjects.push(
      this.environmentFactory.createChest(5, -5, Item, inventory, () => {})
    );
    this.environmentObjects.push(
      this.environmentFactory.createChest(-7, 8, Item, inventory, () => {})
    );
    
    // Campfires and buildings
    this.environmentObjects.push(this.environmentFactory.createCampfire(0, -10));
    this.environmentObjects.push(this.environmentFactory.createHouse(15, 0));
    this.environmentObjects.push(this.environmentFactory.createHouse(-15, 5));
  }

  /**
   * Create goblin camp
   * @param {Function} updateQuestProgressFn - Function to update quest progress
   */
  createGoblinCamp(updateQuestProgressFn) {
    const goblinCampCenter = GameConfig.monsterSpawns.goblinCamp;
    const { goblins: campGoblins, environmentObjects: campObjects } = 
      this.goblinFactory.createGoblinCamp(
        goblinCampCenter.x,
        goblinCampCenter.z,
        (x, z) => this.environmentFactory.createCampfire(x, z),
        updateQuestProgressFn
      );
    this.goblins.push(...campGoblins);
    this.environmentObjects.push(...campObjects);
    
    // Add camp sign
    this.environmentObjects.push(
      this.environmentFactory.createSign(
        goblinCampCenter.x + 8,
        goblinCampCenter.z,
        'Beware: Goblin Territory!'
      )
    );
  }

  /**
   * Create skeleton graveyard
   * @param {Function} updateQuestProgressFn - Function to update quest progress
   */
  createSkeletonGraveyard(updateQuestProgressFn) {
    const graveyardCenter = GameConfig.monsterSpawns.graveyard;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = graveyardCenter.x + Math.cos(angle) * 3;
      const z = graveyardCenter.z + Math.sin(angle) * 3;
      const skeleton = this.monsterFactory.createSkeleton(x, z, updateQuestProgressFn);
      this.monsters.push(skeleton);
      this.environmentObjects.push(skeleton);
    }
    // Add skeleton boss
    const skeletonBoss = this.monsterFactory.createBoss(
      'skeleton',
      graveyardCenter.x,
      graveyardCenter.z + 4,
      updateQuestProgressFn
    );
    this.monsters.push(skeletonBoss);
    this.environmentObjects.push(skeletonBoss);
    this.environmentObjects.push(
      this.environmentFactory.createSign(
        graveyardCenter.x + 6,
        graveyardCenter.z,
        'Ancient Graveyard'
      )
    );
  }

  /**
   * Create spider cave area
   * @param {Function} updateQuestProgressFn - Function to update quest progress
   */
  createSpiderCave(updateQuestProgressFn) {
    const spiderCaveCenter = GameConfig.monsterSpawns.spiderCave;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = spiderCaveCenter.x + Math.cos(angle) * 4;
      const z = spiderCaveCenter.z + Math.sin(angle) * 4;
      const spider = this.monsterFactory.createSpider(x, z, updateQuestProgressFn);
      this.monsters.push(spider);
      this.environmentObjects.push(spider);
    }
    this.environmentObjects.push(
      this.environmentFactory.createSign(
        spiderCaveCenter.x + 7,
        spiderCaveCenter.z,
        'Spider Den - Danger!'
      )
    );
  }

  /**
   * Create wolf pack area
   * @param {Function} updateQuestProgressFn - Function to update quest progress
   */
  createWolfPack(updateQuestProgressFn) {
    const wolfPackCenter = GameConfig.monsterSpawns.wolfPack;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const x = wolfPackCenter.x + Math.cos(angle) * 3.5;
      const z = wolfPackCenter.z + Math.sin(angle) * 3.5;
      const wolf = this.monsterFactory.createWolf(x, z, updateQuestProgressFn);
      this.monsters.push(wolf);
      this.environmentObjects.push(wolf);
    }
    // Add dire wolf boss
    const direWolf = this.monsterFactory.createBoss(
      'wolf',
      wolfPackCenter.x,
      wolfPackCenter.z,
      updateQuestProgressFn
    );
    this.monsters.push(direWolf);
    this.environmentObjects.push(direWolf);
    this.environmentObjects.push(
      this.environmentFactory.createSign(
        wolfPackCenter.x + 6,
        wolfPackCenter.z,
        'Wolf Territory'
      )
    );
  }

  /**
   * Initialize the complete world
   * @param {Object} inventory - Inventory system
   * @param {Function} updateQuestProgressFn - Function to update quest progress
   */
  async initWorld(inventory, updateQuestProgressFn) {
    await this.loadAssets();
    this.createNPCs();
    this.createEnvironmentObjects(inventory);
    this.createGoblinCamp(updateQuestProgressFn);
    this.createSkeletonGraveyard(updateQuestProgressFn);
    this.createSpiderCave(updateQuestProgressFn);
    this.createWolfPack(updateQuestProgressFn);
  }

  /**
   * Get all created objects
   */
  getCreatedObjects() {
    return {
      npcs: this.npcs,
      environmentObjects: this.environmentObjects,
      goblins: this.goblins,
      monsters: this.monsters
    };
  }
}
