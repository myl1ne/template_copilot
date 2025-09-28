// Physics system for terrain collision and creature movement
import * as THREE from 'three'

export class PhysicsSystem {
  constructor() {
    this.terrainData = null
    this.gravity = -9.81
    this.raycaster = new THREE.Raycaster()
    this.tempVector = new THREE.Vector3()
  }
  
  // Set terrain data for collision detection
  setTerrainData(terrainData) {
    this.terrainData = terrainData
  }
  
  // Get terrain height at world position
  getTerrainHeightAt(worldX, worldZ) {
    if (!this.terrainData || !this.terrainData.heightMap) return 0
    
    const { heightMap, terrainSize } = this.terrainData
    const size = heightMap.length
    const scale = size / terrainSize
    
    // Convert world coordinates to height map coordinates
    const mapX = Math.floor((worldX + terrainSize/2) * scale)
    const mapZ = Math.floor((worldZ + terrainSize/2) * scale)
    
    // Bounds check
    if (mapX < 0 || mapX >= size || mapZ < 0 || mapZ >= size) {
      return 0
    }
    
    // Bilinear interpolation for smooth height transitions
    const x1 = Math.floor(mapX)
    const z1 = Math.floor(mapZ)
    const x2 = Math.min(x1 + 1, size - 1)
    const z2 = Math.min(z1 + 1, size - 1)
    
    const fx = mapX - x1
    const fz = mapZ - z1
    
    const h11 = heightMap[x1][z1]
    const h12 = heightMap[x1][z2]
    const h21 = heightMap[x2][z1]
    const h22 = heightMap[x2][z2]
    
    // Interpolate
    const h1 = h11 * (1 - fx) + h21 * fx
    const h2 = h12 * (1 - fx) + h22 * fx
    const height = h1 * (1 - fz) + h2 * fz
    
    return height
  }
  
  // Get terrain normal at world position (for slope calculations)
  getTerrainNormalAt(worldX, worldZ) {
    if (!this.terrainData) return new THREE.Vector3(0, 1, 0)
    
    const offset = 0.1
    const hL = this.getTerrainHeightAt(worldX - offset, worldZ)
    const hR = this.getTerrainHeightAt(worldX + offset, worldZ)
    const hD = this.getTerrainHeightAt(worldX, worldZ - offset)
    const hU = this.getTerrainHeightAt(worldX, worldZ + offset)
    
    const normal = new THREE.Vector3(
      hL - hR,
      2.0 * offset,
      hD - hU
    ).normalize()
    
    return normal
  }
  
  // Apply physics to creature movement
  applyPhysics(creature, deltaTime) {
    if (!creature.position || !creature.velocity) return
    
    const pos = creature.position
    const vel = creature.velocity
    
    // Get terrain height at creature position
    const terrainHeight = this.getTerrainHeightAt(pos[0], pos[2])
    const targetY = terrainHeight + (creature.size || 0.5)
    
    // Apply gravity if creature is above ground
    if (pos[1] > targetY) {
      vel[1] += this.gravity * deltaTime
    }
    
    // Ground collision
    if (pos[1] <= targetY) {
      pos[1] = targetY
      vel[1] = Math.max(0, vel[1]) // Stop downward velocity
      creature.onGround = true
    } else {
      creature.onGround = false
    }
    
    // Get terrain normal for slope effects
    const normal = this.getTerrainNormalAt(pos[0], pos[2])
    const slopeAngle = Math.acos(normal.y)
    
    // Modify movement based on slope
    if (creature.onGround && slopeAngle > 0.1) {
      const slopeFactor = Math.cos(slopeAngle)
      creature.speedMultiplier = slopeFactor * 0.5 + 0.5 // Slow down on slopes
      
      // Add sliding effect on steep slopes
      if (slopeAngle > Math.PI / 4) {
        const slideDirection = new THREE.Vector3(normal.x, 0, normal.z).normalize()
        vel[0] += slideDirection.x * deltaTime * 2
        vel[2] += slideDirection.z * deltaTime * 2
      }
    }
    
    // Water physics
    const waterSources = this.terrainData?.waterSources || []
    creature.inWater = false
    
    for (const water of waterSources) {
      const distance = Math.sqrt(
        Math.pow(pos[0] - water.position[0], 2) + 
        Math.pow(pos[2] - water.position[2], 2)
      )
      
      if (distance < water.size) {
        creature.inWater = true
        // Apply buoyancy
        if (pos[1] < water.position[1] + 0.5) {
          vel[1] += Math.abs(this.gravity) * deltaTime * 0.8 // Buoyancy force
          creature.speedMultiplier = 0.3 // Slow movement in water
        }
        break
      }
    }
    
    // Apply air resistance
    vel[0] *= 0.98
    vel[2] *= 0.98
    if (!creature.onGround) {
      vel[1] *= 0.99
    }
    
    // Update position
    pos[0] += vel[0] * deltaTime
    pos[1] += vel[1] * deltaTime
    pos[2] += vel[2] * deltaTime
    
    // Boundary constraints
    const boundary = 28
    if (pos[0] > boundary) { pos[0] = boundary; vel[0] = 0 }
    if (pos[0] < -boundary) { pos[0] = -boundary; vel[0] = 0 }
    if (pos[2] > boundary) { pos[2] = boundary; vel[2] = 0 }
    if (pos[2] < -boundary) { pos[2] = -boundary; vel[2] = 0 }
  }
  
  // Check if position is valid (not inside obstacles, etc.)
  isValidPosition(worldX, worldZ) {
    // Check terrain bounds
    if (Math.abs(worldX) > 28 || Math.abs(worldZ) > 28) {
      return false
    }
    
    // Check if position is too steep
    const normal = this.getTerrainNormalAt(worldX, worldZ)
    const slopeAngle = Math.acos(normal.y)
    if (slopeAngle > Math.PI / 3) { // 60 degrees
      return false
    }
    
    return true
  }
  
  // Get safe spawn position
  getSafeSpawnPosition() {
    const maxAttempts = 50
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const x = (Math.random() - 0.5) * 40 // Random position in terrain
      const z = (Math.random() - 0.5) * 40
      
      if (this.isValidPosition(x, z)) {
        const y = this.getTerrainHeightAt(x, z) + 1
        return [x, y, z]
      }
      
      attempts++
    }
    
    // Fallback to center
    const y = this.getTerrainHeightAt(0, 0) + 1
    return [0, y, 0]
  }
}

// Export singleton instance
export const physicsSystem = new PhysicsSystem()