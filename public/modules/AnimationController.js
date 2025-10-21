/**
 * AnimationController - Character animation management
 * Handles player character animations (idle, walking, running, attacking, resting)
 */

export class AnimationController {
  constructor(player, equipmentVisuals, showAnimationLabelFn, mixer = null, animations = {}) {
    this.player = player;
    this.equipmentVisuals = equipmentVisuals;
    this.showAnimationLabel = showAnimationLabelFn;
    this.currentState = 'idle';
    this.animationTime = 0;
    this.mixer = mixer;
    this.animations = animations;
    this.useFBXAnimations = mixer !== null && Object.keys(animations).length > 0;
  }

  /**
   * Set animation state
   * @param {string} state - Animation state (idle, walking, running, attacking, resting)
   */
  setState(state) {
    if (this.currentState !== state) {
      this.currentState = state;
      this.animationTime = 0;
      document.getElementById('anim-state').textContent = state.charAt(0).toUpperCase() + state.slice(1);
      this.showAnimationLabel(state);
      
      // Handle FBX animations
      if (this.useFBXAnimations) {
        this.switchFBXAnimation(state);
      }
    }
    this.player.animationState = state;
  }

  /**
   * Switch between FBX animations with crossfade
   * @param {string} state - Animation state
   */
  switchFBXAnimation(state) {
    const fadeDuration = 0.3;
    
    // Stop all current animations with fadeout
    Object.values(this.animations).forEach(action => {
      if (action && action.isRunning()) {
        action.fadeOut(fadeDuration);
      }
    });
    
    // Start the new animation with fadein
    let targetAnimation = null;
    if (state === 'idle' && this.animations.idle) {
      targetAnimation = this.animations.idle;
    } else if (state === 'walking' && this.animations.walking) {
      targetAnimation = this.animations.walking;
    } else if (state === 'running' && this.animations.running) {
      targetAnimation = this.animations.running;
    }
    
    if (targetAnimation) {
      targetAnimation.reset().fadeIn(fadeDuration).play();
    }
  }

  /**
   * Update animation based on current state
   * @param {number} delta - Time delta
   */
  update(delta) {
    this.animationTime += delta;
    
    // Update FBX animation mixer if using FBX animations
    if (this.useFBXAnimations && this.mixer) {
      this.mixer.update(delta);
    }
    
    // For primitive shapes, continue with manual animations
    if (!this.useFBXAnimations) {
      const { body, sword, shield } = this.equipmentVisuals;
      
      switch (this.currentState) {
        case 'idle':
          body.position.y = 1.3 + Math.sin(this.animationTime * 2) * 0.05;
          sword.rotation.z = -Math.PI / 4;
          break;
          
        case 'walking':
          body.position.y = 1.3 + Math.abs(Math.sin(this.animationTime * 8)) * 0.1;
          body.rotation.z = Math.sin(this.animationTime * 8) * 0.05;
          sword.rotation.z = -Math.PI / 4 + Math.sin(this.animationTime * 8) * 0.1;
          shield.position.x = -0.7 + Math.sin(this.animationTime * 8) * 0.05;
          break;
          
        case 'running':
          body.position.y = 1.3 + Math.abs(Math.sin(this.animationTime * 12)) * 0.15;
          body.rotation.z = Math.sin(this.animationTime * 12) * 0.1;
          sword.rotation.z = -Math.PI / 4 + Math.sin(this.animationTime * 12) * 0.2;
          shield.position.x = -0.7 + Math.sin(this.animationTime * 12) * 0.1;
          break;
          
        case 'attacking':
          const attackProgress = Math.min(this.animationTime / 0.5, 1);
          if (attackProgress < 0.5) {
            sword.rotation.z = -Math.PI / 4 - attackProgress * 2 * Math.PI / 2;
          } else {
            sword.rotation.z = -Math.PI / 4 - (1 - attackProgress) * 2 * Math.PI / 2;
          }
          body.rotation.y = Math.sin(attackProgress * Math.PI) * 0.3;
          
          if (attackProgress >= 1) {
            this.setState('idle');
          }
          break;
          
        case 'resting':
          body.position.y = 0.8;
          body.rotation.x = 0.3;
          sword.position.y = 0.8;
          shield.position.y = 0.8;
          
          if (this.animationTime > 2) {
            body.rotation.x = 0;
            sword.position.y = 1.3;
            shield.position.y = 1.3;
            this.setState('idle');
            // Healing is handled in the caller
          }
          break;
      }
    } else {
      // For FBX models, handle special animations that don't have FBX equivalents
      switch (this.currentState) {
        case 'attacking':
          // TODO: Add attack animation when available
          if (this.animationTime > 0.5) {
            this.setState('idle');
          }
          break;
          
        case 'resting':
          // TODO: Add rest animation when available
          if (this.animationTime > 2) {
            this.setState('idle');
            // Healing is handled in the caller
          }
          break;
      }
    }
  }

  /**
   * Get current animation state
   */
  getState() {
    return this.currentState;
  }
}
