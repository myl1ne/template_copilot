import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * NPCFactory - Creates NPCs with FBX models or fallback primitives
 */
export class NPCFactory {
    constructor(characterLoader) {
        this.characterLoader = characterLoader;
        this.defaultDialogues = {
            default: [
                "Greetings, traveler!",
                "What brings you to these parts?",
                "Safe travels on your journey."
            ],
            quest_giver: [
                "I have a task that needs doing.",
                "Many dangers lurk in these lands.",
                "Will you help us?"
            ],
            merchant: [
                "Welcome! Take a look at my wares.",
                "I have the finest goods in the realm.",
                "Everything has a price, friend."
            ],
            hermit: [
                "Ah, a visitor... How rare.",
                "I prefer solitude to the bustle of towns.",
                "What do you need from me?"
            ]
        };
    }

    /**
     * Create an NPC character
     * @param {string} id - Unique NPC identifier
     * @param {string} name - Display name
     * @param {string} type - NPC type (quest_giver, merchant, etc.)
     * @param {object} position - {x, z} position
     * @param {string} modelName - Name of the FBX model to use
     * @param {array} customDialogue - Optional custom dialogue
     * @returns {object} NPC object
     */
    createNPC(id, name, type, position, modelName = null, customDialogue = null) {
        const dialogue = customDialogue || this.defaultDialogues[type] || this.defaultDialogues.default;
        
        return {
            id,
            name,
            type,
            position,
            modelName,
            dialogue,
            mesh: null,
            mixer: null,
            currentAnimation: 'idle'
        };
    }

    /**
     * Create NPC mesh with FBX model or fallback primitives
     * @param {object} npc - NPC object
     * @param {THREE.Scene} scene - Three.js scene to add mesh to
     * @returns {object} Environment object with mesh and interaction
     */
    createNPCMesh(npc, scene) {
        const npcGroup = new THREE.Group();
        
        // Try to use FBX model if available
        if (npc.modelName && this.characterLoader.hasCharacter(npc.modelName)) {
            // Clone the loaded model — the loader already applies the proper scale
            const charModel = SkeletonUtils.clone(this.characterLoader.getModel(npc.modelName));
            // Make characters slightly bigger than the normalized size (hardcoded factor)
            charModel.scale.multiplyScalar(1.5); // increase size by 1.5x
            // Ensure the clone faces forward
            charModel.rotation.y = Math.PI;

            // Configure meshes: enable shadows and disable frustum culling for skinned meshes
            // (skinned meshes can sometimes be incorrectly culled)
            charModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Some FBX/skinned meshes have bounding/skeleton offsets that make
                    // frustum culling remove them unexpectedly. Disable culling to be safe.
                    child.frustumCulled = false;
                }
            });
            
            // Calculate bounding box to ensure feet are on the ground
            // This fixes positioning issues where FBX models have different origins
            const bbox = new THREE.Box3().setFromObject(charModel);
            const yOffset = -bbox.min.y; // Offset to place the bottom of the model at y=0
            charModel.position.y = yOffset;
            
            npcGroup.add(charModel);

            // Setup animation mixer if animations are available
            const idleAnim = this.characterLoader.getAnimation(`${npc.modelName}_idle`);
            if (idleAnim) {
                const mixer = new THREE.AnimationMixer(charModel);
                const action = mixer.clipAction(idleAnim);
                action.play();
                npc.mixer = mixer;
            }
        } else {
            // Fallback to primitive shapes
            this.createPrimitiveNPC(npcGroup, npc.type);
        }
        
        // Add floating indicator icon
        const iconGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const iconColor = npc.type === 'merchant' ? 0xfbbf24 : 0x22c55e;
        const iconMat = new THREE.MeshStandardMaterial({ 
            color: iconColor,
            emissive: iconColor,
            emissiveIntensity: 0.5
        });
        const icon = new THREE.Mesh(iconGeo, iconMat);
        icon.position.y = 2.7;
        npcGroup.add(icon);
        
        npcGroup.position.set(npc.position.x, 0, npc.position.z);
        scene.add(npcGroup);
        
        npc.mesh = npcGroup;
        npc.icon = icon;
        
        return {
            type: 'npc',
            npc: npc,
            position: npc.position,
            mesh: npcGroup,
            interactable: true,
            interact: function() {
                return { npc: npc };
            }
        };
    }

    /**
     * Create primitive shapes for NPC (fallback when FBX not available)
     */
    createPrimitiveNPC(npcGroup, type) {
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: type === 'merchant' ? 0x9333ea : 0x3b82f6 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75;
        body.castShadow = true;
        npcGroup.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.7;
        head.castShadow = true;
        npcGroup.add(head);
        
        // Hat/indicator
        const hatGeo = new THREE.ConeGeometry(0.35, 0.5, 8);
        const hatColor = type === 'merchant' ? 0xfbbf24 : 0x4ade80;
        const hatMat = new THREE.MeshStandardMaterial({ 
            color: hatColor,
            emissive: hatColor,
            emissiveIntensity: 0.3
        });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 2.2;
        hat.castShadow = true;
        npcGroup.add(hat);
    }

    /**
     * Create a standard set of NPCs for the game world
     * @returns {array} Array of NPC objects
     */
    createStandardNPCs() {
        return [
            this.createNPC(
                'elder',
                'Village Elder',
                'quest_giver',
                { x: 10, z: 10 },
                'baelin',
                [
                    "Greetings, brave adventurer!",
                    "The goblin threat grows stronger each day.",
                    "Would you help protect our village?"
                ]
            ),
            this.createNPC(
                'merchant',
                'Traveling Merchant',
                'merchant',
                { x: -10, z: 10 },
                'baradun',
                [
                    "Welcome to my humble shop!",
                    "I have the finest wares in all the land.",
                    "Take a look at what I have to offer!"
                ]
            ),
            this.createNPC(
                'hermit',
                'Forest Hermit',
                'quest_giver',
                { x: -25, z: -25 },
                'bodger',
                [
                    "Ah, a visitor! How rare...",
                    "I live here in solitude, away from the troubles of the village.",
                    "What brings you to my humble dwelling?"
                ]
            ),
            this.createNPC(
                'guard',
                'Town Guard',
                'default',
                { x: 15, z: 15 },
                'greg',
                [
                    "Halt! State your business.",
                    "The town is safe under my watch.",
                    "Move along, citizen."
                ]
            )
        ];
    }
}
