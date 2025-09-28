/**
 * Territorial Behavior System
 * 
 * Implements territorial behavior including:
 * - Territory establishment and maintenance
 * - Scent marking and boundary detection
 * - Territory defense mechanisms
 * - Resource guarding behaviors
 */

export class TerritorialBehavior {
  constructor() {
    this.territories = new Map() // creatureId -> territory data
    this.scentMarks = [] // array of scent marks in the world
    this.territoryRadius = 3.0 // base territory size
  }

  /**
   * Initialize territorial behavior for a creature
   */
  initializeTerritory(creature) {
    if (!creature.dna || creature.dna.territoriality.dominantAllele === 'wanderer') {
      return null // Non-territorial creatures don't establish territories
    }

    const territorialStrength = this.getTerritorialStrength(creature)
    if (territorialStrength < 0.3) {
      return null // Weak territorial instinct
    }

    const territory = {
      creatureId: creature.id,
      center: [...creature.position],
      radius: this.territoryRadius * territorialStrength,
      establishedAt: Date.now(),
      strength: territorialStrength,
      scentMarks: [],
      resources: [], // tracked food sources within territory
      intruders: [], // recent intruders
      defenseEnergy: creature.energy * 0.1 // energy allocated to defense
    }

    this.territories.set(creature.id, territory)
    this.establishScentMarks(territory, creature)

    return territory
  }

  /**
   * Calculate territorial strength based on genetics and traits
   */
  getTerritorialStrength(creature) {
    if (!creature.dna) return 0

    const territorialGene = creature.dna.territoriality
    let strength = 0

    // Base territorial strength from genetics
    if (territorialGene.allele1 === 'territorial') strength += 0.5
    if (territorialGene.allele2 === 'territorial') strength += 0.5
    if (territorialGene.dominantAllele === 'territorial') strength += 0.2

    // Modifiers based on other traits
    strength += (creature.aggressiveness || 0) * 0.3
    strength += (creature.size || 0.5) * 0.2 // Larger creatures are more territorial
    strength -= (creature.dna.socialBehavior?.dominantAllele === 'gregarious' ? 0.3 : 0)

    // Environmental factors
    if (creature.energy < 50) strength *= 0.7 // Low energy reduces territorial behavior
    if (creature.age && creature.age > 100) strength *= 1.2 // Older creatures are more territorial

    return Math.max(0, Math.min(1, strength))
  }

  /**
   * Establish scent marks around territory perimeter
   */
  establishScentMarks(territory, creature) {
    const numMarks = Math.floor(4 + territory.strength * 4) // 4-8 scent marks
    const angleStep = (2 * Math.PI) / numMarks

    for (let i = 0; i < numMarks; i++) {
      const angle = i * angleStep
      const markPosition = [
        territory.center[0] + Math.cos(angle) * territory.radius * 0.8,
        0.1, // Ground level
        territory.center[2] + Math.sin(angle) * territory.radius * 0.8
      ]

      const scentMark = {
        id: `${creature.id}_mark_${i}`,
        position: markPosition,
        creatureId: creature.id,
        strength: territory.strength,
        establishedAt: Date.now(),
        lastRenewed: Date.now(),
        decayRate: 0.95, // Strength multiplier per minute
        territoryId: creature.id
      }

      territory.scentMarks.push(scentMark.id)
      this.scentMarks.push(scentMark)
    }
  }

  /**
   * Update territorial behaviors for all creatures
   */
  updateTerritorialBehaviors(creatures, deltaTime) {
    // Decay scent marks over time
    this.decayScentMarks(deltaTime)

    // Update each creature's territorial behavior
    creatures.forEach(creature => {
      const territory = this.territories.get(creature.id)
      
      if (territory) {
        this.updateTerritoryMaintenance(creature, territory, deltaTime)
        this.checkTerritoryIntrusions(creature, territory, creatures)
      } else if (this.shouldEstablishTerritory(creature)) {
        this.initializeTerritory(creature)
      }

      // Check for territorial conflicts
      this.evaluateTerritorialConflicts(creature, creatures)
    })

    // Clean up abandoned territories
    this.cleanupAbandonedTerritories(creatures)
  }

  /**
   * Decay scent marks over time
   */
  decayScentMarks(deltaTime) {
    const currentTime = Date.now()
    const decayFactor = Math.pow(0.95, deltaTime / 60000) // Decay per minute

    this.scentMarks = this.scentMarks.filter(mark => {
      mark.strength *= decayFactor
      return mark.strength > 0.1 // Remove very weak scent marks
    })
  }

  /**
   * Update territory maintenance behaviors
   */
  updateTerritoryMaintenance(creature, territory, deltaTime) {
    const distanceFromCenter = this.getDistance(creature.position, territory.center)
    
    // Update territory center if creature has moved significantly
    if (distanceFromCenter > territory.radius * 0.5) {
      territory.center = [...creature.position]
    }

    // Renew scent marks if creature is patrolling territory
    if (distanceFromCenter < territory.radius) {
      this.renewNearbyScents(creature, territory)
    }

    // Track resources within territory
    territory.resources = this.findResourcesInTerritory(territory)
  }

  /**
   * Check for intruders in territory
   */
  checkTerritoryIntrusions(owner, territory, allCreatures) {
    territory.intruders = []

    allCreatures.forEach(intruder => {
      if (intruder.id === owner.id) return

      const distance = this.getDistance(intruder.position, territory.center)
      if (distance < territory.radius) {
        const intrusion = {
          creatureId: intruder.id,
          distance,
          detectedAt: Date.now(),
          threatLevel: this.assessThreatLevel(owner, intruder)
        }

        territory.intruders.push(intrusion)
        this.triggerTerritorialResponse(owner, intruder, territory, intrusion)
      }
    })
  }

  /**
   * Assess threat level of an intruder
   */
  assessThreatLevel(owner, intruder) {
    let threatLevel = 0.5 // Base threat

    // Size comparison
    if (intruder.size > owner.size) threatLevel += 0.3
    if (intruder.size < owner.size) threatLevel -= 0.2

    // Diet comparison - carnivores are more threatening
    if (intruder.diet === 'carnivore' && owner.diet !== 'carnivore') threatLevel += 0.4
    if (owner.diet === 'carnivore' && intruder.diet !== 'carnivore') threatLevel -= 0.2

    // Energy levels
    if (intruder.energy > owner.energy) threatLevel += 0.2

    // Aggressiveness
    threatLevel += (intruder.aggressiveness || 0) * 0.3

    return Math.max(0, Math.min(1, threatLevel))
  }

  /**
   * Trigger territorial response based on intrusion
   */
  triggerTerritorialResponse(owner, intruder, territory, intrusion) {
    const responseIntensity = territory.strength * intrusion.threatLevel

    if (responseIntensity > 0.6) {
      // Aggressive defense - charge toward intruder
      this.initiateAggressiveDefense(owner, intruder, responseIntensity)
    } else if (responseIntensity > 0.3) {
      // Warning behavior - approach and posture
      this.initiateWarningBehavior(owner, intruder, responseIntensity)
    } else {
      // Passive monitoring - track but don't engage
      this.initiatePassiveMonitoring(owner, intruder)
    }

    // Energy cost for territorial defense
    owner.energy -= responseIntensity * 2
  }

  /**
   * Initiate aggressive territorial defense
   */
  initiateAggressiveDefense(owner, intruder, intensity) {
    // Calculate direction toward intruder
    const direction = [
      intruder.position[0] - owner.position[0],
      0,
      intruder.position[2] - owner.position[2]
    ]
    
    const distance = Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2])
    if (distance > 0) {
      direction[0] /= distance
      direction[2] /= distance
    }

    // Boost toward intruder with increased aggression
    const chargeForce = intensity * (owner.speed || 0.5) * 2
    owner.velocity[0] += direction[0] * chargeForce
    owner.velocity[2] += direction[2] * chargeForce

    // Temporary aggression boost
    owner.temporaryAggression = (owner.temporaryAggression || 0) + intensity * 0.5
    owner.aggressionDecay = Date.now() + 5000 // 5 second boost

    // Mark as defending territory
    owner.territorialState = 'defending'
    owner.territorialTarget = intruder.id
  }

  /**
   * Initiate warning territorial behavior
   */
  initiateWarningBehavior(owner, intruder, intensity) {
    // Position between intruder and territory center
    const toIntruder = [
      intruder.position[0] - owner.position[0],
      0,
      intruder.position[2] - owner.position[2]
    ]
    
    const distance = Math.sqrt(toIntruder[0] * toIntruder[0] + toIntruder[2] * toIntruder[2])
    if (distance > 2) { // Only approach if not too close
      toIntruder[0] /= distance
      toIntruder[2] /= distance

      const approachForce = intensity * (owner.speed || 0.5)
      owner.velocity[0] += toIntruder[0] * approachForce
      owner.velocity[2] += toIntruder[2] * approachForce
    }

    owner.territorialState = 'warning'
    owner.territorialTarget = intruder.id
  }

  /**
   * Initiate passive monitoring behavior
   */
  initiatePassiveMonitoring(owner, intruder) {
    owner.territorialState = 'monitoring'
    owner.territorialTarget = intruder.id
  }

  /**
   * Check if creature should establish territory
   */
  shouldEstablishTerritory(creature) {
    if (this.territories.has(creature.id)) return false
    if (!creature.dna) return false
    
    const territorialStrength = this.getTerritorialStrength(creature)
    
    // Require sufficient energy and territorial genes
    return creature.energy > 80 && 
           territorialStrength > 0.4 && 
           creature.age > 20
  }

  /**
   * Renew scent marks near creature
   */
  renewNearbyScents(creature, territory) {
    const renewalRadius = 2.0
    const currentTime = Date.now()

    this.scentMarks.forEach(mark => {
      if (mark.creatureId === creature.id) {
        const distance = this.getDistance(creature.position, mark.position)
        if (distance < renewalRadius) {
          mark.strength = Math.min(1.0, mark.strength + 0.1)
          mark.lastRenewed = currentTime
        }
      }
    })
  }

  /**
   * Find resources within territory
   */
  findResourcesInTerritory(territory) {
    // This would integrate with food source system
    // For now, return empty array - will be implemented when integrating
    return []
  }

  /**
   * Evaluate territorial conflicts between creatures
   */
  evaluateTerritorialConflicts(creature, allCreatures) {
    const territory = this.territories.get(creature.id)
    if (!territory) return

    // Check for overlapping territories
    this.territories.forEach((otherTerritory, otherCreatureId) => {
      if (otherCreatureId === creature.id) return

      const distance = this.getDistance(territory.center, otherTerritory.center)
      const overlapDistance = territory.radius + otherTerritory.radius - distance

      if (overlapDistance > 0) {
        // Territories overlap - resolve conflict
        this.resolveTerritorialConflict(creature, territory, otherCreatureId, otherTerritory, overlapDistance)
      }
    })
  }

  /**
   * Resolve territorial conflict between two creatures
   */
  resolveTerritorialConflict(creature1, territory1, creature2Id, territory2, overlapDistance) {
    const creature2 = this.findCreatureById(creature2Id)
    if (!creature2) return

    const strength1 = territory1.strength
    const strength2 = territory2.strength

    if (strength1 > strength2 * 1.2) {
      // Creature1 wins - push creature2's territory away
      this.pushTerritory(territory2, territory1.center, overlapDistance * 0.6)
    } else if (strength2 > strength1 * 1.2) {
      // Creature2 wins - push creature1's territory away
      this.pushTerritory(territory1, territory2.center, overlapDistance * 0.6)
    } else {
      // Equal strength - both territories shrink slightly
      territory1.radius *= 0.95
      territory2.radius *= 0.95
    }
  }

  /**
   * Push territory away from a point
   */
  pushTerritory(territory, fromPoint, pushDistance) {
    const direction = [
      territory.center[0] - fromPoint[0],
      0,
      territory.center[2] - fromPoint[2]
    ]
    
    const distance = Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2])
    if (distance > 0) {
      direction[0] /= distance
      direction[2] /= distance

      territory.center[0] += direction[0] * pushDistance
      territory.center[2] += direction[2] * pushDistance
    }
  }

  /**
   * Clean up territories for creatures that no longer exist
   */
  cleanupAbandonedTerritories(creatures) {
    const existingCreatureIds = new Set(creatures.map(c => c.id))
    const territoryIds = Array.from(this.territories.keys())

    territoryIds.forEach(creatureId => {
      if (!existingCreatureIds.has(creatureId)) {
        // Remove territory and associated scent marks
        this.territories.delete(creatureId)
        this.scentMarks = this.scentMarks.filter(mark => mark.creatureId !== creatureId)
      }
    })
  }

  /**
   * Find creature by ID (helper method)
   */
  findCreatureById(creatureId) {
    // This would be implemented by the calling system
    // For now, return null - will be properly integrated
    return null
  }

  /**
   * Calculate distance between two 3D points
   */
  getDistance(pos1, pos2) {
    const dx = pos1[0] - pos2[0]
    const dz = pos1[2] - pos2[2]
    return Math.sqrt(dx * dx + dz * dz)
  }

  /**
   * Get territory information for a creature
   */
  getTerritoryInfo(creatureId) {
    return this.territories.get(creatureId) || null
  }

  /**
   * Get all scent marks (for visualization)
   */
  getScentMarks() {
    return this.scentMarks
  }

  /**
   * Get territorial influence at a position
   */
  getTerritorialInfluence(position) {
    let maxInfluence = 0
    let territoryOwner = null

    this.territories.forEach((territory, creatureId) => {
      const distance = this.getDistance(position, territory.center)
      if (distance < territory.radius) {
        const influence = (1 - distance / territory.radius) * territory.strength
        if (influence > maxInfluence) {
          maxInfluence = influence
          territoryOwner = creatureId
        }
      }
    })

    return { influence: maxInfluence, owner: territoryOwner }
  }

  /**
   * Apply territorial effects to creature behavior
   */
  applyTerritorialEffects(creature) {
    // Decay temporary aggression
    if (creature.aggressionDecay && Date.now() > creature.aggressionDecay) {
      creature.temporaryAggression = 0
      creature.aggressionDecay = null
      creature.territorialState = null
      creature.territorialTarget = null
    }

    // Apply territorial influence on movement
    const territory = this.territories.get(creature.id)
    if (territory) {
      const distanceFromCenter = this.getDistance(creature.position, territory.center)
      
      // Tendency to stay near territory center
      if (distanceFromCenter > territory.radius * 0.7) {
        const returnDirection = [
          territory.center[0] - creature.position[0],
          0,
          territory.center[2] - creature.position[2]
        ]
        
        const distance = Math.sqrt(returnDirection[0] * returnDirection[0] + returnDirection[2] * returnDirection[2])
        if (distance > 0) {
          returnDirection[0] /= distance
          returnDirection[2] /= distance

          const returnForce = territory.strength * 0.1
          creature.velocity[0] += returnDirection[0] * returnForce
          creature.velocity[2] += returnDirection[2] * returnForce
        }
      }
    }
  }
}

// Singleton instance
export const territorialBehavior = new TerritorialBehavior()