/**
 * GameConfig - Configuration constants for the RPG world
 * Contains all configuration data for environment, player, quests, skills, etc.
 */

export const GameConfig = {
  // Player configuration
  player: {
    startingStats: {
      hp: 150,
      maxHp: 150,
      mana: 50,
      maxMana: 50,
      armor: 10,
      hpRegen: 2,
      manaRegen: 1,
      str: 18,
      dex: 12,
      con: 16,
      int: 8,
      wiz: 10,
      cha: 14
    },
    movement: {
      speed: 3,
      runSpeed: 6,
      maxStamina: 100
    },
    combat: {
      attackCooldown: 0.8, // seconds
      attackRange: 3 // units
    }
  },

  // World environment configuration
  world: {
    groundSize: 100,
    groundColor: 0x3a7d44,
    skyColor: 0x87CEEB,
    fogDistance: { near: 20, far: 100 }
  },

  // Lighting configuration
  lighting: {
    ambient: {
      color: 0xffffff,
      intensity: 0.6
    },
    sun: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 50, y: 50, z: 50 },
      shadowMapSize: 2048
    }
  },

  // NPC locations
  npcLocations: {
    'Village Elder': { x: 10, z: 10 },
    'Town Guard': { x: 15, z: 15 },
    'Forest Hermit': { x: -25, z: -25 },
    'Traveling Merchant': { x: -10, z: 10 }
  },

  // Quest objective locations
  questLocations: {
    'village_rescue': [{ x: -20, z: -20 }],
    'skeleton_threat': [{ x: 30, z: 10 }],
    'spider_cave': [{ x: 25, z: -25 }],
    'wolf_pack': [{ x: -30, z: 30 }],
    'bandit_camp': [{ x: 10, z: -30 }]
  },

  // Monster spawn locations
  monsterSpawns: {
    goblinCamp: { x: -20, z: -20 },
    graveyard: { x: 30, z: 10 },
    spiderCave: { x: 25, z: -25 },
    wolfPack: { x: -30, z: 30 }
  },

  // Environment object counts
  environment: {
    trees: 20,
    rocks: 15,
    treeRadius: { min: 15, max: 25 }
  },

  // Inventory configuration
  inventory: {
    maxSlots: 20,
    startingGold: 100,
    merchantPriceMultiplier: 1.5,
    sellPriceMultiplier: 0.5
  },

  // Skill hotbar configuration
  skills: {
    hotbarSlots: 5
  },

  // UI configuration
  ui: {
    maxMessages: 10,
    minimapScale: 3, // World units per pixel
    minimapGridSize: 15
  },

  // XP rewards by monster type
  xpRewards: {
    'goblin': 50,
    'skeleton': 75,
    'spider': 60,
    'wolf': 75,
    'goblin boss': 200,
    'goblin chief': 200,
    'skeleton lord': 200,
    'dire wolf': 150
  }
};
