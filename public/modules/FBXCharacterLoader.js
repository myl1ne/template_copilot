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
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise<boolean>} - Success status
     */
    async loadCharacter(characterName, filePath, targetHeight = 2.0, onProgress = null) {
        try {
            const model = await new Promise((resolve, reject) => {
                this.fbxLoader.load(filePath, resolve, onProgress, reject);
            });
            
            // Yield to event loop for UI updates
            await new Promise(r => setTimeout(r, 0));

            // Calculate bounding box to determine proper scale
            const bbox = new THREE.Box3().setFromObject(model);
            const size = bbox.getSize(new THREE.Vector3());
            const height = size.y;
            
            // Calculate scale to reach target height.
            // Using targetHeight / measuredHeight works for both meters and centimeters
            // because measuredHeight is expressed in the same units as the raw geometry.
            // (Previously a blanket *100 made many models far too large.)
            const finalScale = height > 0 ? (targetHeight / height) : 1.0;
            model.scale.set(finalScale, finalScale, finalScale);
            
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

            console.log(`✓ ${characterName} loaded (measured height: ${height.toFixed(2)}, target: ${targetHeight} units, applied scale: ${finalScale.toFixed(6)})`);
            return true;
        } catch (error) {
            console.error(`Error loading ${characterName}:`, error);
            return false;
        }
    }

    /**
     * Load all character models
     * @param {Function} onProgressUpdate - Callback for overall progress (0-100)
     * @returns {Promise<void>}
     */
    async loadAllCharacters(onProgressUpdate = null) {
        const characters = [
            { name: 'baelin', path: '/assets/characters/Baelin.fbx' },
            { name: 'baradun', path: '/assets/characters/Baradun.fbx' },
            { name: 'bodger', path: '/assets/characters/Bodger.fbx' },
            { name: 'greg', path: '/assets/characters/Greg.fbx' }
        ];

        let loadedCount = 0;
        const totalCount = characters.length;
        
        const updateProgress = () => {
            loadedCount++;
            const progress = Math.round((loadedCount / totalCount) * 100);
            if (onProgressUpdate) {
                onProgressUpdate(progress);
            }
        };

        await Promise.all(
            characters.map(async char => {
                await this.loadCharacter(char.name, char.path, 2.0);
                updateProgress();
            })
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
