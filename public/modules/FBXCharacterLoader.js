import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

/**
 * FBXCharacterLoader - Handles loading and scaling of FBX character models
 * Fixes scale issues by normalizing all characters to a consistent height
 */
export class FBXCharacterLoader {
    constructor() {
        this.fbxLoader = new FBXLoader();
        this.loadedModels = {};
        this.loadedAnimations = {};
    }

    /**
     * Find animation by keyword search
     */
    findAnimationByKeyword(animations, keywords) {
        for (const keyword of keywords) {
            const found = animations.find(anim => 
                anim.name.toLowerCase().includes(keyword.toLowerCase())
            );
            if (found) return found;
        }
        return null;
    }

    /**
     * Load a character FBX file with automatic scaling
     * @param {string} characterName - Name identifier for the character
     * @param {string} filePath - Path to the FBX file
     * @param {number} targetHeight - Target height in world units (default: 2.0)
     * @returns {Promise<boolean>} - Success status
     */
    async loadCharacter(characterName, filePath, targetHeight = 2.0) {
        try {
            const model = await new Promise((resolve, reject) => {
                this.fbxLoader.load(filePath, resolve, undefined, reject);
            });
            
            // Yield to event loop for UI updates
            await new Promise(r => setTimeout(r, 0));

            // Calculate bounding box to determine proper scale
            const bbox = new THREE.Box3().setFromObject(model);
            const size = bbox.getSize(new THREE.Vector3());
            const height = size.y;
            
            // Calculate scale to reach target height
            // FBX models are in centimeters, so we need to scale them down
            const scale = targetHeight / height;
            model.scale.set(scale, scale, scale);
            
            // Store the model
            this.loadedModels[characterName] = model;
            
            // Smart animation detection
            if (model.animations && model.animations.length > 0) {
                const idleAnim = this.findAnimationByKeyword(model.animations, ['idle', 'stand']);
                const walkAnim = this.findAnimationByKeyword(model.animations, ['walk', 'walking']);
                const talkAnim = this.findAnimationByKeyword(model.animations, ['talk', 'talking', 'speak']);
                const runAnim = this.findAnimationByKeyword(model.animations, ['run', 'running']);
                
                if (idleAnim) this.loadedAnimations[`${characterName}_idle`] = idleAnim;
                if (walkAnim) this.loadedAnimations[`${characterName}_walk`] = walkAnim;
                if (talkAnim) this.loadedAnimations[`${characterName}_talk`] = talkAnim;
                if (runAnim) this.loadedAnimations[`${characterName}_run`] = runAnim;
                
                // Fallback: use first animation as idle if no idle found
                if (!idleAnim && model.animations.length > 0) {
                    this.loadedAnimations[`${characterName}_idle`] = model.animations[0];
                }
            }

            console.log(`✓ ${characterName} loaded (height: ${height.toFixed(2)} → ${targetHeight} units, scale: ${scale.toFixed(3)})`);
            return true;
        } catch (error) {
            console.error(`Error loading ${characterName}:`, error);
            return false;
        }
    }

    /**
     * Load all character models
     * @returns {Promise<void>}
     */
    async loadAllCharacters() {
        const characters = [
            { name: 'baelin', path: '/assets/characters/Baelin.fbx' },
            { name: 'baradun', path: '/assets/characters/Baradun.fbx' },
            { name: 'bodger', path: '/assets/characters/Bodger.fbx' },
            { name: 'greg', path: '/assets/characters/Greg.fbx' }
        ];

        await Promise.all(
            characters.map(char => this.loadCharacter(char.name, char.path))
        );
    }

    /**
     * Get a loaded model
     */
    getModel(characterName) {
        return this.loadedModels[characterName];
    }

    /**
     * Get a loaded animation
     */
    getAnimation(animationName) {
        return this.loadedAnimations[animationName];
    }

    /**
     * Check if a character is loaded
     */
    hasCharacter(characterName) {
        return !!this.loadedModels[characterName];
    }
}
