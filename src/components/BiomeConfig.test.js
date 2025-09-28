import { describe, it, expect } from 'vitest'
import { 
  BIOME_TYPES, 
  getBiomeConfig, 
  calculateBiomeFood, 
  getRandomBiome 
} from './BiomeConfig'

describe('BiomeConfig', () => {
  it('should return correct biome configuration for each biome type', () => {
    const forestConfig = getBiomeConfig(BIOME_TYPES.FOREST)
    expect(forestConfig.name).toBe('Forest')
    expect(forestConfig.energyDrainMultiplier).toBe(0.9)
    expect(forestConfig.groundColor).toBe('#2d5016')

    const desertConfig = getBiomeConfig(BIOME_TYPES.DESERT)
    expect(desertConfig.name).toBe('Desert')
    expect(desertConfig.energyDrainMultiplier).toBe(1.4)
    expect(desertConfig.groundColor).toBe('#DAA520')

    const oceanConfig = getBiomeConfig(BIOME_TYPES.OCEAN)
    expect(oceanConfig.name).toBe('Ocean')
    expect(oceanConfig.energyDrainMultiplier).toBe(1.1)
    expect(oceanConfig.groundColor).toBe('#006994')
  })

  it('should return forest config for invalid biome type', () => {
    const config = getBiomeConfig('invalid')
    expect(config.name).toBe('Forest')
  })

  it('should calculate correct food values for different seasons', () => {
    const { count: normalCount, energy: normalEnergy } = calculateBiomeFood(BIOME_TYPES.FOREST, 'normal')
    expect(normalCount).toBeGreaterThanOrEqual(18)
    expect(normalCount).toBeLessThanOrEqual(25)
    expect(normalEnergy).toBe(60)

    const { count: droughtCount, energy: droughtEnergy } = calculateBiomeFood(BIOME_TYPES.DESERT, 'drought')
    expect(droughtCount).toBe(3)
    expect(droughtEnergy).toBe(25)

    const { count: abundanceCount, energy: abundanceEnergy } = calculateBiomeFood(BIOME_TYPES.OCEAN, 'abundance')
    expect(abundanceCount).toBe(25)
    expect(abundanceEnergy).toBe(70)
  })

  it('should return valid random biome', () => {
    const randomBiome = getRandomBiome()
    expect(Object.values(BIOME_TYPES)).toContain(randomBiome)
  })

  it('should have different obstacle counts for different biomes', () => {
    const forestConfig = getBiomeConfig(BIOME_TYPES.FOREST)
    const desertConfig = getBiomeConfig(BIOME_TYPES.DESERT)
    const oceanConfig = getBiomeConfig(BIOME_TYPES.OCEAN)

    expect(forestConfig.obstacleCount).toBe(12)
    expect(desertConfig.obstacleCount).toBe(6)
    expect(oceanConfig.obstacleCount).toBe(8)
  })

  it('should have appropriate speed multipliers for each biome', () => {
    const forestConfig = getBiomeConfig(BIOME_TYPES.FOREST)
    const desertConfig = getBiomeConfig(BIOME_TYPES.DESERT)
    const oceanConfig = getBiomeConfig(BIOME_TYPES.OCEAN)

    expect(forestConfig.creatureSpeedMultiplier).toBe(0.8) // Slower in dense forest
    expect(desertConfig.creatureSpeedMultiplier).toBe(1.2) // Faster in open desert
    expect(oceanConfig.creatureSpeedMultiplier).toBe(0.9) // Slower due to water resistance
  })
})