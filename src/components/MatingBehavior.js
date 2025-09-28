/**
 * Advanced Mating Behavior System
 * 
 * Implements sophisticated mating behaviors including:
 * - Sexual selection based on traits
 * - Mating rituals and courtship displays
 * - Mate choice preferences
 * - Breeding territory establishment
 * - Parental investment strategies
 */

import { territorialBehavior } from './TerritorialBehavior'

export class MatingBehavior {
  constructor() {
    this.matingPairs = new Map() // Tracks current mating pairs
    this.courtshipAttempts = new Map() // Tracks ongoing courtship
    this.breedingTerritories = new Map() // Special territories for breeding
    this.matingCooldowns = new Map() // Prevents immediate re-mating
  }

  /**
   * Evaluate mating potential between two creatures
   */
  evaluateMatingCompatibility(suitor, potential) {
    if (!suitor.dna || !potential.dna) return 0
    if (suitor.id === potential.id) return 0
    if (suitor.diet !== potential.dna) return 0 // Different species don't mate

    let compatibility = 0.5 // Base compatibility

    // Genetic diversity preference - avoid inbreeding
    const geneticSimilarity = this.calculateGeneticSimilarity(suitor.dna, potential.dna)
    compatibility += (1 - geneticSimilarity) * 0.3 // Prefer genetic diversity

    // Size preference - moderate size differences preferred
    const sizeDifference = Math.abs(suitor.size - potential.size)
    compatibility -= sizeDifference * 0.2

    // Energy level attraction - healthy mates preferred
    const energyFactor = (potential.energy / 200) * 0.2
    compatibility += energyFactor

    // Age compatibility - avoid very young or very old mates
    const ageFactor = this.calculateAgeFactor(suitor.age, potential.age)
    compatibility += ageFactor * 0.15

    // Territorial status - territorial creatures prefer territorial mates
    if (suitor.dna.territoriality.dominantAllele === 'territorial' &&
        potential.dna.territoriality.dominantAllele === 'territorial') {
      compatibility += 0.1
    }

    // Behavioral compatibility
    const behavioralMatch = this.calculateBehavioralCompatibility(suitor.dna, potential.dna)
    compatibility += behavioralMatch * 0.1

    return Math.max(0, Math.min(1, compatibility))
  }

  /**
   * Calculate genetic similarity between two creatures
   */
  calculateGeneticSimilarity(dna1, dna2) {
    let similarities = 0
    let totalTraits = 0

    // Compare each genetic trait
    const traits = ['size', 'speed', 'energyEfficiency', 'lifespan', 'reproductionRate', 
                   'socialBehavior', 'exploration', 'risk', 'cooperation', 'territoriality']

    traits.forEach(trait => {
      if (dna1[trait] && dna2[trait]) {
        totalTraits++
        // Check allele matches
        if (dna1[trait].allele1 === dna2[trait].allele1 || 
            dna1[trait].allele1 === dna2[trait].allele2) similarities++
        if (dna1[trait].allele2 === dna2[trait].allele1 || 
            dna1[trait].allele2 === dna2[trait].allele2) similarities++
      }
    })

    return totalTraits > 0 ? similarities / (totalTraits * 2) : 0
  }

  /**
   * Calculate age compatibility factor
   */
  calculateAgeFactor(age1, age2) {
    const avgAge = (age1 + age2) / 2
    const ageDiff = Math.abs(age1 - age2)
    
    // Prefer mature but not elderly creatures
    let ageFactor = 0
    if (avgAge > 20 && avgAge < 80) ageFactor += 0.5
    if (avgAge > 30 && avgAge < 60) ageFactor += 0.3
    
    // Penalize large age gaps
    ageFactor -= (ageDiff / 50) * 0.3

    return Math.max(-0.5, Math.min(0.8, ageFactor))
  }

  /**
   * Calculate behavioral compatibility
   */
  calculateBehavioralCompatibility(dna1, dna2) {
    let compatibility = 0

    // Social creatures prefer social mates
    if (dna1.socialBehavior?.dominantAllele === 'gregarious' &&
        dna2.socialBehavior?.dominantAllele === 'gregarious') {
      compatibility += 0.3
    }

    // Complementary cooperation levels work well
    const coop1 = dna1.cooperation?.dominantAllele
    const coop2 = dna2.cooperation?.dominantAllele
    if ((coop1 === 'cooperative' && coop2 !== 'competitive') ||
        (coop2 === 'cooperative' && coop1 !== 'competitive')) {
      compatibility += 0.2
    }

    // Similar exploration tendencies
    if (dna1.exploration?.dominantAllele === dna2.exploration?.dominantAllele) {
      compatibility += 0.1
    }

    return Math.max(0, Math.min(0.6, compatibility))
  }

  /**
   * Initiate courtship behavior
   */
  initiateCourtship(suitor, target) {
    const compatibility = this.evaluateMatingCompatibility(suitor, target)
    
    if (compatibility < 0.3) return false // Not interested

    const courtshipId = `${suitor.id}_${target.id}`
    
    // Check if already courting this target
    if (this.courtshipAttempts.has(courtshipId)) return false

    // Check mating cooldown
    if (this.matingCooldowns.has(suitor.id) && 
        Date.now() - this.matingCooldowns.get(suitor.id) < 30000) { // 30 second cooldown
      return false
    }

    // Start courtship ritual
    const courtship = {
      suitor: suitor.id,
      target: target.id,
      startTime: Date.now(),
      compatibility,
      phase: 'display', // display -> approach -> contact
      displayDuration: 5000 + Math.random() * 5000, // 5-10 seconds
      success: false
    }

    this.courtshipAttempts.set(courtshipId, courtship)
    
    // Set creature states
    suitor.matingState = 'courting'
    suitor.courtshipTarget = target.id
    target.matingState = 'being_courted'
    target.courtshipSuitor = suitor.id

    return true
  }

  /**
   * Update all ongoing courtship behaviors
   */
  updateCourtshipBehaviors(creatures, deltaTime) {
    const currentTime = Date.now()
    const completedCourtships = []

    this.courtshipAttempts.forEach((courtship, courtshipId) => {
      const suitor = creatures.find(c => c.id === courtship.suitor)
      const target = creatures.find(c => c.id === courtship.target)

      if (!suitor || !target) {
        // One of the creatures is gone
        completedCourtships.push(courtshipId)
        return
      }

      const elapsed = currentTime - courtship.startTime

      switch (courtship.phase) {
        case 'display':
          this.executeDisplayBehavior(suitor, target, courtship)
          if (elapsed > courtship.displayDuration) {
            courtship.phase = 'approach'
          }
          break

        case 'approach':
          const approached = this.executeApproachBehavior(suitor, target, courtship)
          if (approached) {
            courtship.phase = 'contact'
          } else if (elapsed > courtship.displayDuration + 10000) {
            // Approach failed - end courtship
            completedCourtships.push(courtshipId)
          }
          break

        case 'contact':
          const matingSuccess = this.evaluateMatingSuccess(suitor, target, courtship)
          if (matingSuccess) {
            this.establishMatingPair(suitor, target)
            courtship.success = true
          }
          completedCourtships.push(courtshipId)
          break
      }

      // Timeout after 30 seconds
      if (elapsed > 30000) {
        completedCourtships.push(courtshipId)
      }
    })

    // Clean up completed courtships
    completedCourtships.forEach(courtshipId => {
      const courtship = this.courtshipAttempts.get(courtshipId)
      if (courtship) {
        const suitor = creatures.find(c => c.id === courtship.suitor)
        const target = creatures.find(c => c.id === courtship.target)

        if (suitor) {
          suitor.matingState = null
          suitor.courtshipTarget = null
          this.matingCooldowns.set(suitor.id, currentTime)
        }
        if (target) {
          target.matingState = null
          target.courtshipSuitor = null
        }
      }
      this.courtshipAttempts.delete(courtshipId)
    })
  }

  /**
   * Execute display behavior during courtship
   */
  executeDisplayBehavior(suitor, target, courtship) {
    // Move in a circle around the target
    const time = (Date.now() - courtship.startTime) / 1000
    const radius = 2.5
    const angleSpeed = 2 // radians per second
    
    const angle = time * angleSpeed
    const displayX = target.position[0] + Math.cos(angle) * radius
    const displayZ = target.position[2] + Math.sin(angle) * radius

    // Apply movement toward display position
    const dx = displayX - suitor.position[0]
    const dz = displayZ - suitor.position[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance > 0.5) {
      const moveForce = (suitor.speed || 0.5) * 1.5
      suitor.velocity = suitor.velocity || [0, 0, 0]
      suitor.velocity[0] += (dx / distance) * moveForce * 0.1
      suitor.velocity[2] += (dz / distance) * moveForce * 0.1
    }

    // Visual display effects (would be handled by renderer)
    suitor.displayIntensity = Math.sin(time * 4) * 0.5 + 0.5 // Pulsing effect
    suitor.displayColor = courtship.compatibility // Color intensity based on compatibility
  }

  /**
   * Execute approach behavior during courtship
   */
  executeApproachBehavior(suitor, target, courtship) {
    const dx = target.position[0] - suitor.position[0]
    const dz = target.position[2] - suitor.position[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance < 1.0) {
      return true // Successfully approached
    }

    // Move toward target slowly
    const moveForce = (suitor.speed || 0.5) * 0.8
    suitor.velocity = suitor.velocity || [0, 0, 0]
    suitor.velocity[0] += (dx / distance) * moveForce * 0.1
    suitor.velocity[2] += (dz / distance) * moveForce * 0.1

    // Target might move away if not interested
    if (courtship.compatibility < 0.5) {
      const avoidForce = (target.speed || 0.5) * 0.3
      target.velocity = target.velocity || [0, 0, 0]
      target.velocity[0] -= (dx / distance) * avoidForce * 0.1
      target.velocity[2] -= (dz / distance) * avoidForce * 0.1
    }

    return false
  }

  /**
   * Evaluate final mating success
   */
  evaluateMatingSuccess(suitor, target, courtship) {
    let successChance = courtship.compatibility

    // Energy requirements
    if (suitor.energy < 100 || target.energy < 100) {
      successChance *= 0.5
    }

    // Territorial factors
    const suitorTerritory = territorialBehavior.getTerritoryInfo(suitor.id)
    if (suitorTerritory) {
      const distanceFromCenter = territorialBehavior.getDistance(target.position, suitorTerritory.center)
      if (distanceFromCenter < suitorTerritory.radius) {
        successChance *= 1.2 // Bonus for mating in territory
      }
    }

    // Environmental factors
    if (target.matingState === 'being_courted') {
      successChance *= 1.1 // Target is receptive
    }

    // Random factor
    return Math.random() < successChance
  }

  /**
   * Establish a mating pair
   */
  establishMatingPair(creature1, creature2) {
    const pairId = `${Math.min(creature1.id, creature2.id)}_${Math.max(creature1.id, creature2.id)}`
    
    const pair = {
      creature1: creature1.id,
      creature2: creature2.id,
      establishedAt: Date.now(),
      breedingTerritory: null,
      offspring: [],
      pairBond: 0.8 + Math.random() * 0.2 // Strength of pair bond
    }

    this.matingPairs.set(pairId, pair)

    // Update creature states
    creature1.matingState = 'paired'
    creature1.mateId = creature2.id
    creature2.matingState = 'paired'
    creature2.mateId = creature1.id

    // Attempt to establish breeding territory
    this.establishBreedingTerritory(creature1, creature2, pair)

    return pair
  }

  /**
   * Establish breeding territory for a mating pair
   */
  establishBreedingTerritory(creature1, creature2, pair) {
    // Choose location between the two creatures
    const centerX = (creature1.position[0] + creature2.position[0]) / 2
    const centerZ = (creature1.position[2] + creature2.position[2]) / 2

    const breedingTerritory = {
      center: [centerX, 0, centerZ],
      radius: 2.5,
      owners: [creature1.id, creature2.id],
      establishedAt: Date.now(),
      breedingBonus: 1.5 // Bonus to reproduction success
    }

    this.breedingTerritories.set(pair.creature1 + '_' + pair.creature2, breedingTerritory)
    pair.breedingTerritory = breedingTerritory

    return breedingTerritory
  }

  /**
   * Find potential mates for a creature
   */
  findPotentialMates(creature, population) {
    if (!creature.dna) return []
    if (creature.matingState === 'paired' || creature.matingState === 'courting') return []
    if (creature.energy < 120) return [] // Need sufficient energy

    return population.filter(potential => {
      if (potential.id === creature.id) return false
      if (potential.matingState === 'paired') return false
      if (potential.diet !== creature.diet) return false
      if (potential.energy < 100) return false

      // Distance check
      const distance = Math.sqrt(
        Math.pow(creature.position[0] - potential.position[0], 2) +
        Math.pow(creature.position[2] - potential.position[2], 2)
      )
      if (distance > 8) return false // Must be reasonably close

      // Compatibility check
      const compatibility = this.evaluateMatingCompatibility(creature, potential)
      return compatibility > 0.4
    }).sort((a, b) => {
      // Sort by compatibility
      const compatA = this.evaluateMatingCompatibility(creature, a)
      const compatB = this.evaluateMatingCompatibility(creature, b)
      return compatB - compatA
    })
  }

  /**
   * Get mating behavior info for a creature
   */
  getMatingInfo(creatureId) {
    // Check if in a pair
    for (const [pairId, pair] of this.matingPairs) {
      if (pair.creature1 === creatureId || pair.creature2 === creatureId) {
        return { type: 'paired', pair }
      }
    }

    // Check if courting
    for (const [courtshipId, courtship] of this.courtshipAttempts) {
      if (courtship.suitor === creatureId) {
        return { type: 'courting', courtship }
      }
      if (courtship.target === creatureId) {
        return { type: 'being_courted', courtship }
      }
    }

    return { type: 'single' }
  }

  /**
   * Clean up broken pairs and expired courtships
   */
  cleanup(creatures) {
    const existingIds = new Set(creatures.map(c => c.id))

    // Clean up mating pairs
    const expiredPairs = []
    this.matingPairs.forEach((pair, pairId) => {
      if (!existingIds.has(pair.creature1) || !existingIds.has(pair.creature2)) {
        expiredPairs.push(pairId)
      }
    })

    expiredPairs.forEach(pairId => {
      this.matingPairs.delete(pairId)
      this.breedingTerritories.delete(pairId)
    })

    // Clean up courtship attempts
    const expiredCourtships = []
    this.courtshipAttempts.forEach((courtship, courtshipId) => {
      if (!existingIds.has(courtship.suitor) || !existingIds.has(courtship.target)) {
        expiredCourtships.push(courtshipId)
      }
    })

    expiredCourtships.forEach(courtshipId => {
      this.courtshipAttempts.delete(courtshipId)
    })
  }
}

// Singleton instance
export const matingBehavior = new MatingBehavior()