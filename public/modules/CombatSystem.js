/**
 * CombatSystem - Combat logic and effects
 * Handles player attacks, skill usage, and combat effects
 */
import * as THREE from 'three';
import { GameConfig } from './GameConfig.js';

export class CombatSystem {
  constructor(scene, addMessageFn) {
    this.scene = scene;
    this.addMessage = addMessageFn;
    this.attackParticles = [];
    this.lastAttackTime = 0;
    this.attackCooldown = GameConfig.player.combat.attackCooldown;
    this.attackRange = GameConfig.player.combat.attackRange;
  }

  /**
   * Create attack visual effect
   * @param {Object} position - Position {x, y, z}
   * @param {number} color - Color of particles (default: 0xff6600 for damage)
   */
  createAttackEffect(position, color = 0xff6600) {
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: color,
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
      this.scene.add(particle);
      this.attackParticles.push(particle);
    }
  }

  /**
   * Create skill effect
   * @param {Object} position - Position {x, y, z}
   * @param {number} color - Color of particles
   */
  createSkillEffect(position, color) {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      
      particle.position.set(
        position.x + (Math.random() - 0.5) * 1,
        1 + Math.random() * 0.5,
        position.z + (Math.random() - 0.5) * 1
      );
      
      particle.velocity = {
        x: (Math.random() - 0.5) * 0.15,
        y: Math.random() * 0.2 + 0.15,
        z: (Math.random() - 0.5) * 0.15
      };
      
      particle.life = 1.5;
      this.scene.add(particle);
      this.attackParticles.push(particle);
    }
  }

  /**
   * Create level up visual effect
   * @param {Object} position - Position {x, y, z}
   */
  createLevelUpEffect(position) {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: 0xffd700, // Gold color
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      
      particle.position.set(
        position.x + (Math.random() - 0.5) * 2,
        0.5 + Math.random() * 2,
        position.z + (Math.random() - 0.5) * 2
      );
      
      particle.velocity = {
        x: (Math.random() - 0.5) * 0.05,
        y: Math.random() * 0.2 + 0.1,
        z: (Math.random() - 0.5) * 0.05
      };
      
      particle.life = 2.0;
      this.scene.add(particle);
      this.attackParticles.push(particle);
    }
  }

  /**
   * Update attack particles
   * @param {number} delta - Time delta
   */
  updateParticles(delta) {
    for (let i = this.attackParticles.length - 1; i >= 0; i--) {
      const particle = this.attackParticles[i];
      
      particle.life -= delta * 2;
      particle.material.opacity = particle.life;
      
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.position.z += particle.velocity.z;
      
      particle.velocity.y -= delta * 0.5; // Gravity
      
      if (particle.life <= 0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.attackParticles.splice(i, 1);
      }
    }
  }

  /**
   * Perform player attack
   * @param {Object} player - Player character
   * @param {Array} environmentObjects - All environment objects
   * @param {Function} showMonsterHealthBarFn - Function to show monster health bar
   * @param {Function} hideMonsterHealthBarFn - Function to hide monster health bar
   * @param {Function} updateUIFn - Function to update UI
   * @param {Object} inventory - Inventory system
   * @param {Object} LootSystem - Loot system
   * @returns {Object|null} - Attack result or null if no target
   */
  performAttack(player, environmentObjects, showMonsterHealthBarFn, hideMonsterHealthBarFn, updateUIFn, inventory, LootSystem, bestiarySystem = null) {
    const currentTime = Date.now() / 1000;
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      const remaining = Math.ceil(this.attackCooldown - (currentTime - this.lastAttackTime));
      this.addMessage(`Attack on cooldown (${remaining}s)`, 'warning');
      return null;
    }
    
    // Find nearest monster in range
    let nearestMonster = null;
    let nearestDist = this.attackRange;
    
    for (const obj of environmentObjects) {
      if ((obj.type === 'goblin' || obj.type === 'skeleton' || obj.type === 'spider' || 
           obj.type === 'wolf' || obj.type === 'troll' || obj.type === 'bat' ||
           obj.type === 'goblin boss' || obj.type === 'skeleton lord' || 
           obj.type === 'dire wolf' || obj.type === 'goblin chief') && obj.alive) {
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
      this.lastAttackTime = currentTime;
      
      // Track monster encounter in bestiary
      if (bestiarySystem) {
        bestiarySystem.discoverMonster(nearestMonster.type);
      }
      
      const result = nearestMonster.interact();
      this.addMessage(result.message, result.type || 'info');
      
      // Show monster health bar when hit
      if (result.monsterHit) {
        showMonsterHealthBarFn(result.monsterHit);
        this.createAttackEffect(result.monsterHit.position);
      }
      
      // Handle defeat and loot
      if (result.defeated) {
        hideMonsterHealthBarFn();
        
        // Track monster kill in bestiary
        if (bestiarySystem) {
          bestiarySystem.recordKill(nearestMonster.type);
        }
        
        // Grant XP based on monster type
        const xpReward = GameConfig.xpRewards[nearestMonster.type] || 50;
        const xpResult = player.gainExperience(xpReward);
        this.addMessage(`💰 Gained ${xpReward} XP!`, 'success');
        
        // Generate and drop loot
        const loot = LootSystem.generateLoot(nearestMonster.type);
        if (loot.gold > 0) {
          inventory.addGold(loot.gold);
        }
        if (loot.items && loot.items.length > 0) {
          for (const item of loot.items) {
            if (inventory.addItem(item)) {
              this.addMessage(`${item.rarityIcon} Looted: ${item.name}!`, 'success');
            }
          }
        }
        
        if (xpResult.leveledUp) {
          this.addMessage(`🎉 LEVEL UP! You are now level ${xpResult.currentLevel}!`, 'success');
          this.addMessage(`   ⬆️ +${player.availableAttributePoints} Attribute Points`, 'info');
          this.addMessage(`   🌟 +${player.availableSkillPoints} Skill Point`, 'info');
          this.createLevelUpEffect(player.position);
        }
        updateUIFn();
      }
      
      return result;
    } else {
      this.addMessage('No monster in range!', 'warning');
      return null;
    }
  }

  /**
   * Get last attack time
   */
  getLastAttackTime() {
    return this.lastAttackTime;
  }

  /**
   * Get attack cooldown
   */
  getAttackCooldown() {
    return this.attackCooldown;
  }
}
