import { MAC, MACLibrary } from './MACCore.js';

/**
 * MACAnimations - Animated MAC templates
 * 
 * These templates include animation functions for dynamic effects
 */

/**
 * Animated torch with flickering flame
 */
MACLibrary.register('torch_animated',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.08, height: 1,
            material: { color: 0x4a2511 }
        }, { position: [0, 0.5, 0] })
        .add(new MAC('sphere', {
            radius: 0.15,
            material: { color: 0xff4500, emissive: 0xff6600 }
        })
        .position(0, 1.1, 0)
        .animate((mesh, delta, time) => {
            // Flicker effect
            const flicker = 0.15 + Math.sin(time * 10) * 0.05 + Math.random() * 0.03;
            mesh.scale.set(flicker, flicker, flicker);
            mesh.position.y = 1.1 + Math.sin(time * 8) * 0.02;
            // Vary emissive intensity
            mesh.material.emissiveIntensity = 0.8 + Math.sin(time * 12) * 0.2;
        }))
);

/**
 * Rotating windmill
 */
MACLibrary.register('windmill',
    new MAC('group')
        // Tower
        .add('cylinder', {
            radiusTop: 0.8, radiusBottom: 1, height: 4,
            material: { color: 0x8b7355 }
        }, { position: [0, 2, 0] })
        // Roof
        .add('cone', {
            radius: 1, height: 1,
            material: { color: 0x654321 }
        }, { position: [0, 4.5, 0] })
        // Window
        .add(MACLibrary.get('window'), {}, { position: [0, 3, 1.01], scale: [0.6, 0.6, 0.6] })
        // Blades (animated)
        .add(new MAC('group')
            .add('box', {
                width: 0.3, height: 2, depth: 0.05,
                material: { color: 0xf5f5dc }
            }, { position: [0, 0, 0] })
            .add('box', {
                width: 2, height: 0.3, depth: 0.05,
                material: { color: 0xf5f5dc }
            }, { position: [0, 0, 0] })
            .position(0, 3.5, 1.1)
            .animate((mesh, delta, time) => {
                // Rotate blades
                mesh.rotation.z = time * 0.5;
            })
        )
);

/**
 * Animated campfire with dancing flames
 */
MACLibrary.register('campfire_animated',
    new MAC('group')
        // Stone circle
        .add('torus', {
            radius: 0.6, tube: 0.12,
            material: { color: 0x696969, roughness: 0.9 }
        }, { position: [0, 0.08, 0], rotation: [Math.PI / 2, 0, 0] })
        // Logs
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [0.2, 0.3, 0], rotation: [0, 0, Math.PI / 3] })
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [-0.2, 0.3, 0], rotation: [0, 0, -Math.PI / 3] })
        // Animated flames
        .add(new MAC('cone', {
            radius: 0.25, height: 0.6,
            material: { 
                color: 0xff4500, 
                emissive: 0xff4500,
                transparent: true,
                opacity: 0.9
            }
        })
        .position(0, 0.5, 0)
        .animate((mesh, delta, time) => {
            // Dancing flame effect
            mesh.scale.y = 1 + Math.sin(time * 4) * 0.15;
            mesh.scale.x = 1 + Math.cos(time * 5) * 0.1;
            mesh.scale.z = 1 + Math.sin(time * 6) * 0.1;
            mesh.position.y = 0.5 + Math.abs(Math.sin(time * 3)) * 0.05;
            mesh.material.opacity = 0.85 + Math.sin(time * 8) * 0.1;
        }))
        .add(new MAC('cone', {
            radius: 0.18, height: 0.8,
            material: { 
                color: 0xff6600, 
                emissive: 0xff6600,
                transparent: true,
                opacity: 0.7
            }
        })
        .position(0, 0.5, 0)
        .animate((mesh, delta, time) => {
            // Inner flame with different timing
            mesh.scale.y = 1 + Math.sin(time * 5 + 1) * 0.2;
            mesh.scale.x = 1 + Math.cos(time * 6 + 1) * 0.12;
            mesh.position.y = 0.5 + Math.abs(Math.cos(time * 4)) * 0.08;
        }))
);

/**
 * Pulsing crystal
 */
MACLibrary.register('crystal_animated',
    new MAC('group')
        .add(new MAC('cone', {
            radius: 0.25, height: 1.5,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00aaff,
                transparent: true,
                opacity: 0.8,
                metalness: 0.3
            }
        })
        .position(0, 0.75, 0)
        .animate((mesh, delta, time) => {
            // Pulsing glow effect
            const pulse = 0.8 + Math.sin(time * 2) * 0.2;
            mesh.material.emissiveIntensity = pulse;
            mesh.position.y = 0.75 + Math.sin(time * 1.5) * 0.02;
            mesh.rotation.y = time * 0.3;
        }))
        // Base
        .add('cylinder', {
            radiusTop: 0.4, radiusBottom: 0.4, height: 0.1,
            material: { color: 0x696969, roughness: 0.9 }
        }, { position: [0, 0.05, 0] })
);

/**
 * Animated water fountain
 */
MACLibrary.register('fountain_animated',
    new MAC('group')
        // Basin
        .add('cylinder', {
            radiusTop: 1.2, radiusBottom: 1, height: 0.5,
            material: { color: 0x808080, roughness: 0.8 }
        }, { position: [0, 0.25, 0] })
        // Water
        .add('cylinder', {
            radiusTop: 1.1, radiusBottom: 0.95, height: 0.4,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.6,
                roughness: 0.1
            }
        }, { position: [0, 0.45, 0] })
        // Central pedestal
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.4, height: 1.5,
            material: { color: 0x696969, roughness: 0.8 }
        }, { position: [0, 1.25, 0] })
        // Top bowl
        .add('sphere', {
            radius: 0.4,
            material: { color: 0x808080, roughness: 0.8 }
        }, { position: [0, 2.1, 0] })
        // Animated water droplets
        .add(new MAC('sphere', {
            radius: 0.08,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.7
            }
        })
        .position(0, 2.5, 0)
        .animate((mesh, delta, time) => {
            // Bouncing water droplet
            const t = (time * 2) % 1;
            mesh.position.y = 2.5 - t * 2;
            mesh.scale.setScalar(1 - t * 0.3);
            mesh.material.opacity = 0.7 - t * 0.4;
        }))
        .add(new MAC('sphere', {
            radius: 0.06,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.7
            }
        })
        .position(0.15, 2.3, 0)
        .animate((mesh, delta, time) => {
            const t = ((time * 2) + 0.3) % 1;
            mesh.position.y = 2.3 - t * 1.8;
            mesh.position.x = 0.15 + Math.sin(t * Math.PI) * 0.2;
            mesh.material.opacity = 0.7 - t * 0.4;
        }))
);

/**
 * Swinging street lamp
 */
MACLibrary.register('street_lamp_animated',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.08, radiusBottom: 0.1, height: 3,
            material: { color: 0x2f2f2f, metalness: 0.7 }
        }, { position: [0, 1.5, 0] })
        .add(new MAC('group')
            .add('cylinder', {
                radiusTop: 0.06, radiusBottom: 0.06, height: 0.8,
                material: { color: 0x2f2f2f, metalness: 0.7 }
            }, { position: [0.4, 0, 0], rotation: [0, 0, 0] })
            .add('cylinder', {
                radiusTop: 0.2, radiusBottom: 0.25, height: 0.4,
                material: { color: 0x1a1a1a, metalness: 0.8 }
            }, { position: [0.8, -0.2, 0] })
            .add('cylinder', {
                radiusTop: 0.18, radiusBottom: 0.22, height: 0.35,
                material: { 
                    color: 0xffff99, 
                    emissive: 0xffff00,
                    transparent: true,
                    opacity: 0.6
                }
            }, { position: [0.8, -0.2, 0] })
            .add('sphere', {
                radius: 0.15,
                material: { 
                    color: 0xffff00, 
                    emissive: 0xffff00,
                    transparent: true,
                    opacity: 0.7
                }
            }, { position: [0.8, -0.2, 0] })
            .position(0, 2.9, 0)
            .animate((mesh, delta, time) => {
                // Gentle swinging
                mesh.rotation.z = Math.sin(time * 1.5) * 0.05;
            })
        )
);

/**
 * Flapping dragon wings
 */
MACLibrary.register('dragon_animated',
    new MAC('group')
        // Body
        .add('capsule', {
            radius: 0.8, length: 2,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [0, 1.5, 0], rotation: [0, 0, Math.PI / 2] })
        // Neck
        .add('capsule', {
            radius: 0.4, length: 1.5,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [1.5, 1.8, 0], rotation: [0, 0, Math.PI / 4] })
        // Head
        .add('sphere', {
            radius: 0.5,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [2.5, 2.5, 0] })
        // Glowing eyes
        .add(new MAC('sphere', {
            radius: 0.08,
            material: { color: 0xffff00, emissive: 0xffaa00 }
        })
        .position(2.6, 2.6, 0.3)
        .animate((mesh, delta, time) => {
            // Pulsing eyes
            mesh.material.emissiveIntensity = 0.8 + Math.sin(time * 8) * 0.2;
        }))
        .add(new MAC('sphere', {
            radius: 0.08,
            material: { color: 0xffff00, emissive: 0xffaa00 }
        })
        .position(2.6, 2.6, -0.3)
        .animate((mesh, delta, time) => {
            mesh.material.emissiveIntensity = 0.8 + Math.sin(time * 8) * 0.2;
        }))
        // Animated wings
        .add(new MAC('cone', {
            radius: 1.2, height: 0.1,
            material: { color: 0x8b0000, transparent: true, opacity: 0.8 }
        })
        .position(0.5, 2, 1)
        .rotation(0, 0, Math.PI / 2)
        .animate((mesh, delta, time) => {
            // Flapping motion
            mesh.rotation.x = Math.sin(time * 3) * 0.4;
        }))
        .add(new MAC('cone', {
            radius: 1.2, height: 0.1,
            material: { color: 0x8b0000, transparent: true, opacity: 0.8 }
        })
        .position(0.5, 2, -1)
        .rotation(0, 0, Math.PI / 2)
        .animate((mesh, delta, time) => {
            // Opposite phase flapping
            mesh.rotation.x = -Math.sin(time * 3) * 0.4;
        }))
        // Tail with swaying motion
        .add(new MAC('capsule', {
            radius: 0.3, length: 2,
            material: { color: 0x8b0000, metalness: 0.3 }
        })
        .position(-1.5, 1.2, 0)
        .rotation(0, 0, -Math.PI / 6)
        .animate((mesh, delta, time) => {
            // Tail sway
            mesh.rotation.y = Math.sin(time * 2) * 0.3;
        }))
);

/**
 * Walking knight animation
 */
MACLibrary.register('knight_animated',
    new MAC('group')
        // Legs with walking motion
        .add(new MAC('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a, metalness: 0.6 }
        })
        .position(-0.15, 0.4, 0)
        .animate((mesh, delta, time) => {
            // Walking motion - left leg
            mesh.rotation.x = Math.sin(time * 4) * 0.3;
        }))
        .add(new MAC('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a, metalness: 0.6 }
        })
        .position(0.15, 0.4, 0)
        .animate((mesh, delta, time) => {
            // Walking motion - right leg (opposite phase)
            mesh.rotation.x = -Math.sin(time * 4) * 0.3;
        }))
        // Body
        .add('capsule', {
            radius: 0.35, length: 0.8,
            material: { color: 0x708090, metalness: 0.9, roughness: 0.2 }
        }, { position: [0, 1.2, 0] })
        // Head
        .add('sphere', {
            radius: 0.25,
            material: { color: 0x708090, metalness: 0.95, roughness: 0.1 }
        }, { position: [0, 1.8, 0] })
        // Sword with swinging motion
        .add(new MAC('cylinder', {
            radiusTop: 0.04, radiusBottom: 0.04, height: 1.2,
            material: { color: 0xc0c0c0, metalness: 1, roughness: 0.1 }
        })
        .position(0.7, 1.2, 0)
        .rotation(0, 0, Math.PI / 3)
        .animate((mesh, delta, time) => {
            // Sword swing
            mesh.rotation.z = Math.PI / 3 + Math.sin(time * 4) * 0.2;
        }))
        // Shield
        .add('cylinder', {
            radiusTop: 0.35, radiusBottom: 0.35, height: 0.08,
            material: { color: 0x4169e1, metalness: 0.8 }
        }, { position: [-0.6, 1.2, 0], rotation: [0, 0, Math.PI / 2] })
);

/**
 * Spell-casting wizard
 */
MACLibrary.register('wizard_casting',
    new MAC('group')
        // Body
        .add('cone', {
            radius: 0.5, height: 1.5,
            material: { color: 0x4b0082 }
        }, { position: [0, 0.75, 0] })
        .add('capsule', {
            radius: 0.3, length: 0.8,
            material: { color: 0x4b0082 }
        }, { position: [0, 1.8, 0] })
        // Head
        .add('sphere', {
            radius: 0.22,
            material: { color: 0xffe0bd }
        }, { position: [0, 2.4, 0] })
        // Hat
        .add('cone', {
            radius: 0.35, height: 0.8,
            material: { color: 0x4b0082 }
        }, { position: [0, 2.9, 0] })
        // Staff
        .add('cylinder', {
            radiusTop: 0.04, radiusBottom: 0.04, height: 2.5,
            material: { color: 0x8b4513 }
        }, { position: [-0.5, 1.5, 0] })
        // Animated crystal on staff
        .add(new MAC('sphere', {
            radius: 0.15,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00ffff, 
                transparent: true, 
                opacity: 0.8 
            }
        })
        .position(-0.5, 2.8, 0)
        .animate((mesh, delta, time) => {
            // Pulsing and rotating crystal
            mesh.rotation.y = time * 2;
            const pulse = 0.8 + Math.sin(time * 4) * 0.2;
            mesh.scale.setScalar(pulse);
            mesh.material.emissiveIntensity = 1 + Math.sin(time * 6) * 0.3;
        }))
        // Orbiting magic particles
        .add(new MAC('sphere', {
            radius: 0.05,
            material: { color: 0xff00ff, emissive: 0xff00ff }
        })
        .position(-0.5, 2.8, 0)
        .animate((mesh, delta, time) => {
            // Orbit around crystal
            const angle = time * 3;
            mesh.position.x = -0.5 + Math.cos(angle) * 0.3;
            mesh.position.y = 2.8 + Math.sin(time * 2) * 0.2;
            mesh.position.z = Math.sin(angle) * 0.3;
        }))
        .add(new MAC('sphere', {
            radius: 0.05,
            material: { color: 0x00ffff, emissive: 0x00ffff }
        })
        .position(-0.5, 2.8, 0)
        .animate((mesh, delta, time) => {
            // Orbit in opposite direction
            const angle = -time * 3 + Math.PI;
            mesh.position.x = -0.5 + Math.cos(angle) * 0.3;
            mesh.position.y = 2.8 + Math.cos(time * 2) * 0.2;
            mesh.position.z = Math.sin(angle) * 0.3;
        }))
);

console.log('MAC Animations loaded. Animated templates:', [
    'torch_animated', 'windmill', 'campfire_animated', 'crystal_animated',
    'fountain_animated', 'street_lamp_animated', 'dragon_animated',
    'knight_animated', 'wizard_casting'
].length);
