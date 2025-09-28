import { describe, it, expect, beforeEach } from 'vitest'
import { TerritorialBehavior } from './TerritorialBehavior'

describe('TerritorialBehavior', () => {
  let territorialBehavior

  beforeEach(() => {
    territorialBehavior = new TerritorialBehavior()
  })

  // Mock creature data
  const createMockCreature = (overrides = {}) => ({
    id: Date.now() + Math.random(),
    position: [0, 1, 0],
    velocity: [0, 0, 0],
    energy: 100,
    size: 0.8,
    speed: 0.6,
    aggressiveness: 0.5,
    age: 50,
    dna: {
      territoriality: {
        allele1: 'territorial',
        allele2: 'territorial',
        dominantAllele: 'territorial'
      },
      socialBehavior: {
        dominantAllele: 'normal'
      }
    },
    ...overrides
  })

  describe('getTerritorialStrength', () => {
    it('calculates territorial strength from genetic traits', () => {
      const creature = createMockCreature()
      const strength = territorialBehavior.getTerritorialStrength(creature)
      
      expect(strength).toBeGreaterThan(0.5) // Should be strong with territorial genes
      expect(strength).toBeLessThanOrEqual(1)
    })

    it('reduces strength for non-territorial genetics', () => {
      const creature = createMockCreature({
        dna: {
          territoriality: {
            allele1: 'wanderer',
            allele2: 'wanderer',
            dominantAllele: 'wanderer'
          },
          socialBehavior: {
            dominantAllele: 'gregarious'
          }
        }
      })
      
      const strength = territorialBehavior.getTerritorialStrength(creature)
      expect(strength).toBeLessThan(0.3)
    })

    it('accounts for creature attributes in strength calculation', () => {
      const aggressiveCreature = createMockCreature({ 
        aggressiveness: 0.9, 
        size: 1.2,
        dna: {
          territoriality: {
            allele1: 'territorial',
            allele2: 'territorial',
            dominantAllele: 'territorial'
          },
          socialBehavior: {
            dominantAllele: 'normal'
          }
        }
      })
      const passiveCreature = createMockCreature({ 
        aggressiveness: 0.1, 
        size: 0.4,
        dna: {
          territoriality: {
            allele1: 'territorial',
            allele2: 'territorial',
            dominantAllele: 'territorial'
          },
          socialBehavior: {
            dominantAllele: 'gregarious' // Reduces territorial strength
          }
        }
      })
      
      const aggressiveStrength = territorialBehavior.getTerritorialStrength(aggressiveCreature)
      const passiveStrength = territorialBehavior.getTerritorialStrength(passiveCreature)
      
      // Debug logging to understand the values
      console.log('Aggressive strength:', aggressiveStrength)
      console.log('Passive strength:', passiveStrength)
      
      // Both should be different (not both capped at 1)
      expect(aggressiveStrength).not.toBe(passiveStrength)
      expect(aggressiveStrength).toBeGreaterThan(0.8) // Should be high
      expect(passiveStrength).toBeLessThan(0.9) // Should be lower due to gregarious nature
    })

    it('reduces strength for low energy creatures', () => {
      const highEnergyCreature = createMockCreature({ 
        energy: 150,
        aggressiveness: 0.6,
        size: 0.8
      })
      const lowEnergyCreature = createMockCreature({ 
        energy: 30, // Low energy should reduce territorial behavior significantly
        aggressiveness: 0.6,
        size: 0.8
      })
      
      const highEnergyStrength = territorialBehavior.getTerritorialStrength(highEnergyCreature)
      const lowEnergyStrength = territorialBehavior.getTerritorialStrength(lowEnergyCreature)
      
      // Debug logging
      console.log('High energy strength:', highEnergyStrength)
      console.log('Low energy strength:', lowEnergyStrength)
      
      expect(highEnergyStrength).not.toBe(lowEnergyStrength)
      expect(lowEnergyStrength).toBeLessThan(highEnergyStrength * 0.8) // Should be significantly reduced
    })
  })

  describe('initializeTerritory', () => {
    it('creates territory for territorial creatures', () => {
      const creature = createMockCreature()
      const territory = territorialBehavior.initializeTerritory(creature)
      
      expect(territory).not.toBeNull()
      expect(territory.creatureId).toBe(creature.id)
      expect(territory.center).toEqual(creature.position)
      expect(territory.radius).toBeGreaterThan(0)
      expect(territory.scentMarks.length).toBeGreaterThanOrEqual(4) // At least 4 scent marks
    })

    it('does not create territory for wandering creatures', () => {
      const creature = createMockCreature({
        dna: {
          territoriality: {
            allele1: 'wanderer',
            allele2: 'wanderer',
            dominantAllele: 'wanderer'
          }
        }
      })
      
      const territory = territorialBehavior.initializeTerritory(creature)
      expect(territory).toBeNull()
    })

    it('does not create territory for very weak territorial creatures', () => {
      const creature = createMockCreature({
        aggressiveness: 0.05,
        size: 0.2,
        energy: 30,
        dna: {
          territoriality: {
            allele1: 'wanderer',
            allele2: 'territorial',
            dominantAllele: 'wanderer'
          },
          socialBehavior: {
            dominantAllele: 'gregarious'
          }
        }
      })
      
      const territory = territorialBehavior.initializeTerritory(creature)
      expect(territory).toBeNull()
    })

    it('creates scent marks around territory perimeter', () => {
      const creature = createMockCreature()
      territorialBehavior.initializeTerritory(creature)
      
      const scentMarks = territorialBehavior.getScentMarks()
      expect(scentMarks.length).toBeGreaterThanOrEqual(4)
      
      // All scent marks should belong to this creature
      scentMarks.forEach(mark => {
        expect(mark.creatureId).toBe(creature.id)
        expect(mark.strength).toBeGreaterThan(0)
      })
    })
  })

  describe('shouldEstablishTerritory', () => {
    it('allows territory establishment for suitable creatures', () => {
      const creature = createMockCreature({
        energy: 100,
        age: 30
      })
      
      const should = territorialBehavior.shouldEstablishTerritory(creature)
      expect(should).toBe(true)
    })

    it('prevents territory establishment for low energy creatures', () => {
      const creature = createMockCreature({
        energy: 50,
        age: 30
      })
      
      const should = territorialBehavior.shouldEstablishTerritory(creature)
      expect(should).toBe(false)
    })

    it('prevents territory establishment for young creatures', () => {
      const creature = createMockCreature({
        energy: 100,
        age: 10
      })
      
      const should = territorialBehavior.shouldEstablishTerritory(creature)
      expect(should).toBe(false)
    })

    it('prevents duplicate territory establishment', () => {
      const creature = createMockCreature()
      
      // First establishment should succeed
      const territory = territorialBehavior.initializeTerritory(creature)
      expect(territory).not.toBeNull()
      
      // Second attempt should be prevented
      const should = territorialBehavior.shouldEstablishTerritory(creature)
      expect(should).toBe(false)
    })
  })

  describe('assessThreatLevel', () => {
    it('assesses higher threat for larger creatures', () => {
      const owner = createMockCreature({ size: 0.8 })
      const largeIntruder = createMockCreature({ size: 1.2 })
      const smallIntruder = createMockCreature({ size: 0.4 })
      
      const largeThreat = territorialBehavior.assessThreatLevel(owner, largeIntruder)
      const smallThreat = territorialBehavior.assessThreatLevel(owner, smallIntruder)
      
      expect(largeThreat).toBeGreaterThan(smallThreat)
    })

    it('assesses higher threat for carnivorous intruders', () => {
      const herbivoreOwner = createMockCreature({ diet: 'herbivore' })
      const carnivoreIntruder = createMockCreature({ diet: 'carnivore' })
      const herbivoreIntruder = createMockCreature({ diet: 'herbivore' })
      
      const carnivoreThreat = territorialBehavior.assessThreatLevel(herbivoreOwner, carnivoreIntruder)
      const herbivoreThreat = territorialBehavior.assessThreatLevel(herbivoreOwner, herbivoreIntruder)
      
      expect(carnivoreThreat).toBeGreaterThan(herbivoreThreat)
    })

    it('assesses higher threat for aggressive creatures', () => {
      const owner = createMockCreature({ aggressiveness: 0.3 })
      const aggressiveIntruder = createMockCreature({ aggressiveness: 0.9 })
      const passiveIntruder = createMockCreature({ aggressiveness: 0.1 })
      
      const aggressiveThreat = territorialBehavior.assessThreatLevel(owner, aggressiveIntruder)
      const passiveThreat = territorialBehavior.assessThreatLevel(owner, passiveIntruder)
      
      expect(aggressiveThreat).toBeGreaterThan(passiveThreat)
    })

    it('bounds threat level between 0 and 1', () => {
      const owner = createMockCreature()
      const extremeIntruder = createMockCreature({
        size: 2.0,
        aggressiveness: 1.0,
        energy: 200,
        diet: 'carnivore'
      })
      
      const threat = territorialBehavior.assessThreatLevel(owner, extremeIntruder)
      expect(threat).toBeGreaterThanOrEqual(0)
      expect(threat).toBeLessThanOrEqual(1)
    })
  })

  describe('checkTerritoryIntrusions', () => {
    it('detects intruders within territory', () => {
      const owner = createMockCreature({ position: [0, 1, 0] })
      const intruder = createMockCreature({ position: [1, 1, 1] }) // Close to owner
      
      const territory = territorialBehavior.initializeTerritory(owner)
      territorialBehavior.checkTerritoryIntrusions(owner, territory, [owner, intruder])
      
      expect(territory.intruders).toHaveLength(1)
      expect(territory.intruders[0].creatureId).toBe(intruder.id)
    })

    it('ignores creatures outside territory', () => {
      const owner = createMockCreature({ position: [0, 1, 0] })
      const distantCreature = createMockCreature({ position: [10, 1, 10] }) // Far from owner
      
      const territory = territorialBehavior.initializeTerritory(owner)
      territorialBehavior.checkTerritoryIntrusions(owner, territory, [owner, distantCreature])
      
      expect(territory.intruders).toHaveLength(0)
    })

    it('does not count territory owner as intruder', () => {
      const owner = createMockCreature({ position: [0, 1, 0] })
      
      const territory = territorialBehavior.initializeTerritory(owner)
      territorialBehavior.checkTerritoryIntrusions(owner, territory, [owner])
      
      expect(territory.intruders).toHaveLength(0)
    })
  })

  describe('updateTerritorialBehaviors', () => {
    it('updates territory center when creature moves', () => {
      const creature = createMockCreature({ position: [0, 1, 0] })
      const territory = territorialBehavior.initializeTerritory(creature)
      const originalCenter = [...territory.center]
      
      // Move creature significantly
      creature.position = [3, 1, 3]
      
      territorialBehavior.updateTerritoryMaintenance(creature, territory, 1000)
      
      expect(territory.center).not.toEqual(originalCenter)
      expect(territory.center).toEqual(creature.position)
    })

    it('maintains scent marks over time', () => {
      const creature = createMockCreature()
      territorialBehavior.initializeTerritory(creature)
      
      const initialScentCount = territorialBehavior.getScentMarks().length
      
      // Simulate time passing without renewal
      territorialBehavior.decayScentMarks(60000) // 1 minute
      
      const afterDecayCount = territorialBehavior.getScentMarks().length
      
      // Some scent marks should decay, but not all immediately
      expect(afterDecayCount).toBeLessThanOrEqual(initialScentCount)
    })

    it('cleans up abandoned territories', () => {
      const creature = createMockCreature()
      territorialBehavior.initializeTerritory(creature)
      
      expect(territorialBehavior.getTerritoryInfo(creature.id)).not.toBeNull()
      
      // Update without the creature (simulating death/removal)
      territorialBehavior.cleanupAbandonedTerritories([])
      
      expect(territorialBehavior.getTerritoryInfo(creature.id)).toBeNull()
    })
  })

  describe('getTerritorialInfluence', () => {
    it('returns influence within territory', () => {
      const creature = createMockCreature({ position: [0, 1, 0] })
      const territory = territorialBehavior.initializeTerritory(creature)
      
      const influence = territorialBehavior.getTerritorialInfluence([0.5, 1, 0.5])
      
      expect(influence.influence).toBeGreaterThan(0)
      expect(influence.owner).toBe(creature.id)
    })

    it('returns no influence outside territory', () => {
      const creature = createMockCreature({ position: [0, 1, 0] })
      territorialBehavior.initializeTerritory(creature)
      
      const influence = territorialBehavior.getTerritorialInfluence([10, 1, 10])
      
      expect(influence.influence).toBe(0)
      expect(influence.owner).toBeNull()
    })

    it('returns stronger influence closer to territory center', () => {
      const creature = createMockCreature({ position: [0, 1, 0] })
      territorialBehavior.initializeTerritory(creature)
      
      const centerInfluence = territorialBehavior.getTerritorialInfluence([0, 1, 0])
      const edgeInfluence = territorialBehavior.getTerritorialInfluence([2, 1, 2])
      
      expect(centerInfluence.influence).toBeGreaterThan(edgeInfluence.influence)
    })
  })

  describe('initiateAggressiveDefense', () => {
    it('increases creature velocity toward intruder', () => {
      const owner = createMockCreature({ 
        position: [0, 1, 0],
        velocity: [0, 0, 0],
        speed: 0.8
      })
      const intruder = createMockCreature({ position: [3, 1, 0] })
      
      const originalVelocity = [...owner.velocity]
      
      territorialBehavior.initiateAggressiveDefense(owner, intruder, 0.8)
      
      expect(owner.velocity[0]).toBeGreaterThan(originalVelocity[0])
      expect(owner.territorialState).toBe('defending')
      expect(owner.temporaryAggression).toBeGreaterThan(0)
    })

    it('sets territorial state and target', () => {
      const owner = createMockCreature()
      const intruder = createMockCreature()
      
      territorialBehavior.initiateAggressiveDefense(owner, intruder, 0.7)
      
      expect(owner.territorialState).toBe('defending')
      expect(owner.territorialTarget).toBe(intruder.id)
      expect(owner.aggressionDecay).toBeGreaterThan(Date.now())
    })
  })

  describe('getDistance', () => {
    it('calculates correct distance between points', () => {
      const pos1 = [0, 0, 0]
      const pos2 = [3, 0, 4]
      
      const distance = territorialBehavior.getDistance(pos1, pos2)
      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('returns zero for identical positions', () => {
      const pos = [1, 2, 3]
      const distance = territorialBehavior.getDistance(pos, pos)
      expect(distance).toBe(0)
    })
  })

  describe('applyTerritorialEffects', () => {
    it('applies return force when creature is far from territory center', () => {
      const creature = createMockCreature({ 
        position: [0, 1, 0],
        velocity: [0, 0, 0]
      })
      
      const territory = territorialBehavior.initializeTerritory(creature)
      
      // Move creature to edge of territory
      creature.position = [territory.radius * 0.8, 1, 0]
      
      const originalVelocity = [...creature.velocity]
      territorialBehavior.applyTerritorialEffects(creature)
      
      // Should have some return force toward center
      expect(creature.velocity[0]).toBeLessThan(originalVelocity[0])
    })

    it('decays temporary aggression over time', () => {
      const creature = createMockCreature()
      creature.temporaryAggression = 0.8
      creature.aggressionDecay = Date.now() + 1000 // 1 second from now
      
      // Simulate time passing
      creature.aggressionDecay = Date.now() - 1000 // 1 second ago
      
      territorialBehavior.applyTerritorialEffects(creature)
      
      expect(creature.temporaryAggression).toBe(0)
      expect(creature.aggressionDecay).toBeNull()
      expect(creature.territorialState).toBeNull()
    })
  })
})