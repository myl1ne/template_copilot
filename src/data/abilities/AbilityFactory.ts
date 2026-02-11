/**
 * AbilityFactory - Creates runtime Ability instances from data definitions
 */

import { Ability } from '../../abilities/Ability';
import { DamageEffect } from '../../abilities/effects/DamageEffect';
import { StatusEffect } from '../../abilities/effects/StatusEffect';
import { ShieldEffect } from '../../abilities/effects/ShieldEffect';
import { AuraEffect } from '../../abilities/effects/AuraEffect';
import { OnHitTrigger } from '../../abilities/triggers/OnHitTrigger';
import { PeriodicTrigger } from '../../abilities/triggers/PeriodicTrigger';
import {
  AbilityDefinition,
  AbilityEffectType,
  AbilityTriggerType,
} from '../../types/abilities';
import { ABILITY_DEFINITIONS } from './index';

/**
 * Create a runtime Ability instance from an AbilityDefinition
 */
export function createAbility(definition: AbilityDefinition): Ability {
  const ability = new Ability(definition);

  // Add effects
  for (const effectConfig of definition.effects) {
    switch (effectConfig.type) {
      case AbilityEffectType.Damage:
        ability.addEffect(new DamageEffect(effectConfig.config));
        break;
      case AbilityEffectType.Status:
        ability.addEffect(new StatusEffect(effectConfig.config));
        break;
      case AbilityEffectType.Shield:
        ability.addEffect(new ShieldEffect(effectConfig.config));
        break;
      case AbilityEffectType.Aura:
        ability.addEffect(new AuraEffect(effectConfig.config));
        break;
    }
  }

  // Add triggers
  if (definition.triggers) {
    for (const triggerConfig of definition.triggers) {
      switch (triggerConfig.type) {
        case AbilityTriggerType.OnHit:
          ability.addTrigger(new OnHitTrigger(triggerConfig.config));
          break;
        case AbilityTriggerType.Periodic:
          ability.addTrigger(new PeriodicTrigger(triggerConfig.config));
          break;
      }
    }
  }

  return ability;
}

/**
 * Create an Ability instance by ID lookup
 */
export function createAbilityById(abilityId: string): Ability | null {
  const definition = ABILITY_DEFINITIONS[abilityId];
  if (!definition) {
    console.warn(`⚠️ Ability definition not found: ${abilityId}`);
    return null;
  }
  return createAbility(definition);
}
