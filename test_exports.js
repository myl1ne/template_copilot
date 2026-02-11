// Quick test to verify exports work
import { TOWER_DEFINITIONS } from './src/data/towers/index.ts';
import { MONSTER_DEFINITIONS } from './src/data/monsters/index.ts';

console.log('Tower IDs:', Object.keys(TOWER_DEFINITIONS));
console.log('Monster IDs:', Object.keys(MONSTER_DEFINITIONS));
console.log('Tower count:', Object.keys(TOWER_DEFINITIONS).length);
console.log('Monster count:', Object.keys(MONSTER_DEFINITIONS).length);
