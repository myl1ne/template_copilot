/**
 * Tower Definitions - Modular organization by race
 * Barrel export that aggregates all tower types
 */

import { TowerDefinition } from '../../types/entities';

// Re-export all individual tower definitions
export * from './human';
export * from './elemental';
export * from './undead';
export * from './elven';
export * from './mechanical';

// Import individual tower definitions
import { basicArcher, sniper, barracks, catapult } from './human';
import { fireMage, frostShard, stormPillar, infernoTower } from './elemental';
import { shadowArcher, necromancer, soulObelisk, plagueSpreader } from './undead';
import { elvenRanger, moonwell, ancientTreant, sunbeamSpire } from './elven';
import { autoTurret, missileBattery, teslaCoil, voidCannon } from './mechanical';

// Aggregate all tower definitions keyed by ID
export const TOWER_DEFINITIONS: Record<string, TowerDefinition> = {
  // Human
  [basicArcher.id]: basicArcher,
  [sniper.id]: sniper,
  [barracks.id]: barracks,
  [catapult.id]: catapult,
  // Elemental
  [fireMage.id]: fireMage,
  [frostShard.id]: frostShard,
  [stormPillar.id]: stormPillar,
  [infernoTower.id]: infernoTower,
  // Undead
  [shadowArcher.id]: shadowArcher,
  [necromancer.id]: necromancer,
  [soulObelisk.id]: soulObelisk,
  [plagueSpreader.id]: plagueSpreader,
  // Elven
  [elvenRanger.id]: elvenRanger,
  [moonwell.id]: moonwell,
  [ancientTreant.id]: ancientTreant,
  [sunbeamSpire.id]: sunbeamSpire,
  // Mechanical
  [autoTurret.id]: autoTurret,
  [missileBattery.id]: missileBattery,
  [teslaCoil.id]: teslaCoil,
  [voidCannon.id]: voidCannon,
};
