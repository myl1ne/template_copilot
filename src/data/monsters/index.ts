/**
 * Monster Definitions - Modular organization by type
 * Barrel export that aggregates all monster types
 */

import { MonsterDefinition } from '../../types/entities';

// Re-export all individual monster definitions
export * from './corrupted';
export * from './shadow';
export * from './undead';
export * from './elemental';
export * from './bosses';

// Import individual monster definitions
import { corruptedHound, twistedWarrior, corruptedSwarm, corruptedBrute } from './corrupted';
import { shadowStalker, shadowWraith, voidHarbinger } from './shadow';
import { undeadSkeleton } from './undead';
import { elementalGolem } from './elemental';
import { decayLord, infernalTitan, voidNexus } from './bosses';

// Aggregate all monster definitions keyed by ID
export const MONSTER_DEFINITIONS: Record<string, MonsterDefinition> = {
  [corruptedHound.id]: corruptedHound,
  [twistedWarrior.id]: twistedWarrior,
  [corruptedSwarm.id]: corruptedSwarm,
  [corruptedBrute.id]: corruptedBrute,
  [shadowStalker.id]: shadowStalker,
  [shadowWraith.id]: shadowWraith,
  [voidHarbinger.id]: voidHarbinger,
  [undeadSkeleton.id]: undeadSkeleton,
  [elementalGolem.id]: elementalGolem,
  [decayLord.id]: decayLord,
  [infernalTitan.id]: infernalTitan,
  [voidNexus.id]: voidNexus,
};
