/**
 * Ability Definitions Registry
 * All tower ability definitions organized by race
 */

import { AbilityDefinition, AbilityEffectType, AbilityTriggerType, StatusEffectType } from '../../types/abilities';
import { DamageType } from '../../types/game';

// ==========================================
// HUMAN ABILITIES
// ==========================================

const volleyShot: AbilityDefinition = {
  id: 'volley_shot',
  name: 'Volley Shot',
  description: '25% chance to hit 3 targets in a small area',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 8, damageType: DamageType.Physical, radius: 60, maxTargets: 3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.25 } },
  ],
};

const piercingShot: AbilityDefinition = {
  id: 'piercing_shot',
  name: 'Piercing Shot',
  description: '15% chance to deal 20 bonus physical damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 20, damageType: DamageType.Physical } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.15 } },
  ],
};

const headshot: AbilityDefinition = {
  id: 'headshot',
  name: 'Headshot',
  description: '20% chance to deal 5% of target max HP',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 0.05, damageType: DamageType.Physical, isPercentHealth: true } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.2 } },
  ],
};

const markedForDeath: AbilityDefinition = {
  id: 'marked_for_death',
  name: 'Marked for Death',
  description: 'Attacks slow targets by 30% for 2s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Slow, duration: 2, potency: 0.3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const rallyingCry: AbilityDefinition = {
  id: 'rallying_cry',
  name: 'Rallying Cry',
  description: 'Every 8s, deal damage in a small area',
  cooldown: 8,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 15, damageType: DamageType.Physical, radius: 80, maxTargets: 6 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 8 } },
  ],
};

const fortification: AbilityDefinition = {
  id: 'fortification',
  name: 'Fortification',
  description: 'Every 10s, stun nearby enemies for 1s',
  cooldown: 10,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Stun, duration: 1, potency: 1.0 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 10 } },
  ],
};

const explosivePayload: AbilityDefinition = {
  id: 'explosive_payload',
  name: 'Explosive Payload',
  description: 'Attacks deal splash damage in a wide area',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 20, damageType: DamageType.Physical, radius: 80, maxTargets: 8 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const firebomb: AbilityDefinition = {
  id: 'firebomb',
  name: 'Firebomb',
  description: 'Attacks burn enemies (10 fire dmg/0.5s) for 3s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Burn, duration: 3, potency: 1.0, tickRate: 0.5, tickDamage: 10, damageType: DamageType.Fire } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

// ==========================================
// ELEMENTAL ABILITIES
// ==========================================

const ignite: AbilityDefinition = {
  id: 'ignite',
  name: 'Ignite',
  description: '40% chance to burn target (5 fire dmg/s) for 3s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Burn, duration: 3, potency: 1.0, tickRate: 1.0, tickDamage: 5, damageType: DamageType.Fire } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.4 } },
  ],
};

const infernoBlast: AbilityDefinition = {
  id: 'inferno_blast',
  name: 'Inferno Blast',
  description: 'AoE fire burst every 6s',
  cooldown: 6,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 50, damageType: DamageType.Fire, radius: 100, maxTargets: 10 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 6 } },
  ],
};

const frostbite: AbilityDefinition = {
  id: 'frostbite',
  name: 'Frostbite',
  description: '50% chance to slow by 50% for 2s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Slow, duration: 2, potency: 0.5 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.5 } },
  ],
};

const flashFreeze: AbilityDefinition = {
  id: 'flash_freeze',
  name: 'Flash Freeze',
  description: '10% chance to freeze target for 1.5s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Freeze, duration: 1.5, potency: 1.0 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.1 } },
  ],
};

const chainLightning: AbilityDefinition = {
  id: 'chain_lightning',
  name: 'Chain Lightning',
  description: 'Lightning chains to 3 nearby targets',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 15, damageType: DamageType.Lightning, radius: 150, maxTargets: 3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const thunderstorm: AbilityDefinition = {
  id: 'thunderstorm',
  name: 'Thunderstorm',
  description: 'Lightning strikes all nearby enemies every 8s',
  cooldown: 8,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 40, damageType: DamageType.Lightning, radius: 200, maxTargets: 15 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 8 } },
  ],
};

const heatAura: AbilityDefinition = {
  id: 'heat_aura',
  name: 'Heat Aura',
  description: 'Burns nearby enemies every 2s',
  cooldown: 2,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 10, damageType: DamageType.Fire, radius: 100, maxTargets: 10 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 2 } },
  ],
};

const meltdown: AbilityDefinition = {
  id: 'meltdown',
  name: 'Meltdown',
  description: 'Massive fire explosion every 12s',
  cooldown: 12,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 100, damageType: DamageType.Fire, radius: 150, maxTargets: 20 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 12 } },
  ],
};

// ==========================================
// UNDEAD ABILITIES
// ==========================================

const soulSiphon: AbilityDefinition = {
  id: 'soul_siphon',
  name: 'Soul Siphon',
  description: '30% chance to deal bonus shadow damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 12, damageType: DamageType.Shadow } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.3 } },
  ],
};

const deathMark: AbilityDefinition = {
  id: 'death_mark',
  name: 'Death Mark',
  description: 'Attacks weaken targets (+30% damage taken) for 3s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Weakness, duration: 3, potency: 0.3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const corpseExplosion: AbilityDefinition = {
  id: 'corpse_explosion',
  name: 'Corpse Explosion',
  description: 'AoE shadow damage every 6s',
  cooldown: 6,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 40, damageType: DamageType.Shadow, radius: 120, maxTargets: 8 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 6 } },
  ],
};

const soulHarvest: AbilityDefinition = {
  id: 'soul_harvest',
  name: 'Soul Harvest',
  description: 'Massive shadow burst every 10s',
  cooldown: 10,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 80, damageType: DamageType.Shadow, radius: 150, maxTargets: 12 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 10 } },
  ],
};

const armorShred: AbilityDefinition = {
  id: 'armor_shred',
  name: 'Armor Shred',
  description: '30% chance to weaken target (+30% damage taken) for 3s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Weakness, duration: 3, potency: 0.3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.3 } },
  ],
};

const voidDrain: AbilityDefinition = {
  id: 'void_drain',
  name: 'Void Drain',
  description: 'Attacks deal 3% of target max HP as bonus damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 0.03, damageType: DamageType.Shadow, isPercentHealth: true } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const plagueCloud: AbilityDefinition = {
  id: 'plague_cloud',
  name: 'Plague Cloud',
  description: 'Poisons enemies (8 shadow dmg/s) in an area every 4s',
  cooldown: 4,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Poison, duration: 4, potency: 1.0, tickRate: 1.0, tickDamage: 8, damageType: DamageType.Shadow } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 4 } },
  ],
};

const pandemic: AbilityDefinition = {
  id: 'pandemic',
  name: 'Pandemic',
  description: 'Shadow burst + poison (12 dmg/0.5s) every 10s',
  cooldown: 10,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 30, damageType: DamageType.Shadow, radius: 120, maxTargets: 15 } },
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Poison, duration: 5, potency: 1.0, tickRate: 0.5, tickDamage: 12, damageType: DamageType.Shadow } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 10 } },
  ],
};

// ==========================================
// ELVEN ABILITIES
// ==========================================

const blessedArrows: AbilityDefinition = {
  id: 'blessed_arrows',
  name: 'Blessed Arrows',
  description: '30% chance to deal bonus holy damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 15, damageType: DamageType.Holy } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.3 } },
  ],
};

const purifyingLight: AbilityDefinition = {
  id: 'purifying_light',
  name: 'Purifying Light',
  description: 'Attacks deal bonus AoE holy damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 10, damageType: DamageType.Holy, radius: 60, maxTargets: 4 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const moonlightBlessing: AbilityDefinition = {
  id: 'moonlight_blessing',
  name: 'Moonlight Blessing',
  description: 'Holy burst damages nearby enemies every 5s',
  cooldown: 5,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 8, damageType: DamageType.Holy, radius: 120, maxTargets: 8 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 5 } },
  ],
};

const divineShield: AbilityDefinition = {
  id: 'divine_shield',
  name: 'Divine Radiance',
  description: 'Holy nova stuns and damages nearby enemies every 12s',
  cooldown: 12,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 30, damageType: DamageType.Holy, radius: 100, maxTargets: 8 } },
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Stun, duration: 1, potency: 1.0 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 12 } },
  ],
};

const entanglingRoots: AbilityDefinition = {
  id: 'entangling_roots',
  name: 'Entangling Roots',
  description: '20% chance to stun target for 1.5s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Stun, duration: 1.5, potency: 1.0 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.2 } },
  ],
};

const natureSWrath: AbilityDefinition = {
  id: 'natures_wrath',
  name: "Nature's Wrath",
  description: 'Massive holy splash every 8s',
  cooldown: 8,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 60, damageType: DamageType.Holy, radius: 120, maxTargets: 10 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 8 } },
  ],
};

const divineJudgment: AbilityDefinition = {
  id: 'divine_judgment',
  name: 'Divine Judgment',
  description: 'Attacks deal 4% of target max HP as holy damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 0.04, damageType: DamageType.Holy, isPercentHealth: true } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const holyNova: AbilityDefinition = {
  id: 'holy_nova',
  name: 'Holy Nova',
  description: 'Massive holy explosion every 10s',
  cooldown: 10,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 120, damageType: DamageType.Holy, radius: 200, maxTargets: 20 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 10 } },
  ],
};

// ==========================================
// MECHANICAL ABILITIES
// ==========================================

const overdrive: AbilityDefinition = {
  id: 'overdrive',
  name: 'Overdrive',
  description: '25% chance to deal 14 bonus void damage',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 14, damageType: DamageType.Void } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 0.25 } },
  ],
};

const voidRounds: AbilityDefinition = {
  id: 'void_rounds',
  name: 'Void Rounds',
  description: 'Attacks slow targets by 20% for 1.5s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Slow, duration: 1.5, potency: 0.2 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const clusterMissiles: AbilityDefinition = {
  id: 'cluster_missiles',
  name: 'Cluster Missiles',
  description: 'Attacks hit up to 5 enemies in a radius',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 15, damageType: DamageType.Void, radius: 60, maxTargets: 5 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const empBurst: AbilityDefinition = {
  id: 'emp_burst',
  name: 'EMP Burst',
  description: 'Stuns nearby enemies every 8s',
  cooldown: 8,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Stun, duration: 1, potency: 1.0 } },
    { type: AbilityEffectType.Damage, config: { damage: 25, damageType: DamageType.Lightning, radius: 120, maxTargets: 10 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 8 } },
  ],
};

const arcChain: AbilityDefinition = {
  id: 'arc_chain',
  name: 'Arc Chain',
  description: 'Lightning bounces to 3 enemies',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 12, damageType: DamageType.Lightning, radius: 120, maxTargets: 3 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const overcharge: AbilityDefinition = {
  id: 'overcharge',
  name: 'Overcharge',
  description: 'Massive lightning burst every 10s',
  cooldown: 10,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 60, damageType: DamageType.Lightning, radius: 180, maxTargets: 15 } },
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Stun, duration: 0.5, potency: 1.0 } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 10 } },
  ],
};

const voidImplosion: AbilityDefinition = {
  id: 'void_implosion',
  name: 'Void Implosion',
  description: 'Attacks weaken target (+20% damage taken) for 3s',
  cooldown: 0,
  effects: [
    { type: AbilityEffectType.Status, config: { statusType: StatusEffectType.Weakness, duration: 3, potency: 0.2 } },
  ],
  triggers: [
    { type: AbilityTriggerType.OnHit, config: { chance: 1.0 } },
  ],
};

const singularity: AbilityDefinition = {
  id: 'singularity',
  name: 'Singularity',
  description: 'Massive void explosion dealing 5% max HP every 12s',
  cooldown: 12,
  effects: [
    { type: AbilityEffectType.Damage, config: { damage: 0.05, damageType: DamageType.Void, radius: 150, maxTargets: 10, isPercentHealth: true } },
  ],
  triggers: [
    { type: AbilityTriggerType.Periodic, config: { interval: 12 } },
  ],
};

// ==========================================
// REGISTRY
// ==========================================

export const ABILITY_DEFINITIONS: Record<string, AbilityDefinition> = {
  // Human
  [volleyShot.id]: volleyShot,
  [piercingShot.id]: piercingShot,
  [headshot.id]: headshot,
  [markedForDeath.id]: markedForDeath,
  [rallyingCry.id]: rallyingCry,
  [fortification.id]: fortification,
  [explosivePayload.id]: explosivePayload,
  [firebomb.id]: firebomb,
  // Elemental
  [ignite.id]: ignite,
  [infernoBlast.id]: infernoBlast,
  [frostbite.id]: frostbite,
  [flashFreeze.id]: flashFreeze,
  [chainLightning.id]: chainLightning,
  [thunderstorm.id]: thunderstorm,
  [heatAura.id]: heatAura,
  [meltdown.id]: meltdown,
  // Undead
  [soulSiphon.id]: soulSiphon,
  [deathMark.id]: deathMark,
  [corpseExplosion.id]: corpseExplosion,
  [soulHarvest.id]: soulHarvest,
  [armorShred.id]: armorShred,
  [voidDrain.id]: voidDrain,
  [plagueCloud.id]: plagueCloud,
  [pandemic.id]: pandemic,
  // Elven
  [blessedArrows.id]: blessedArrows,
  [purifyingLight.id]: purifyingLight,
  [moonlightBlessing.id]: moonlightBlessing,
  [divineShield.id]: divineShield,
  [entanglingRoots.id]: entanglingRoots,
  [natureSWrath.id]: natureSWrath,
  [divineJudgment.id]: divineJudgment,
  [holyNova.id]: holyNova,
  // Mechanical
  [overdrive.id]: overdrive,
  [voidRounds.id]: voidRounds,
  [clusterMissiles.id]: clusterMissiles,
  [empBurst.id]: empBurst,
  [arcChain.id]: arcChain,
  [overcharge.id]: overcharge,
  [voidImplosion.id]: voidImplosion,
  [singularity.id]: singularity,
};
