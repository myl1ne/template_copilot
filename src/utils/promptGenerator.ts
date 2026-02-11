/**
 * Prompt Generator for DALL-E 3
 * Converts entity definitions to AI image generation prompts
 */

import { TowerDefinition, MonsterDefinition } from '../types/entities';
import { TowerRace, DamageType } from '../types/game';

/**
 * Generate DALL-E 3 prompt for a tower
 */
export class PromptGenerator {
  static generateTowerPrompt(tower: TowerDefinition): string {
    const raceStyle = this.getRaceArtStyle(tower.race);
    const damageStyle = this.getDamageTypeStyle(tower.damageType);

    const prompt = `
      A fantasy tower defense game sprite of a ${tower.name.toLowerCase()}.
      ${tower.description}
      ${tower.loreText}
      Art style: ${raceStyle}
      Visual theme: ${damageStyle}
      Thick 2D cardboard panel style with layered depth and visible edges.
      Multiple stacked cardboard cutout layers creating a 3D illusion.
      Paper craft aesthetic with bold shapes and cut edges.
      Top-down isometric view, 45-degree angle.
      High contrast, clean edges, game-ready sprite.
      Transparent background.
      No text or UI elements.
      Professional game art quality.
      Single tower structure, centered in frame.
    `
      .trim()
      .replace(/\s+/g, ' ');

    return prompt;
  }

  /**
   * Generate DALL-E 3 prompt for a monster
   */
  static generateMonsterPrompt(monster: MonsterDefinition): string {
    const baseDescription = monster.visualDescription || monster.description;
    const typeStyle = this.getMonsterTypeStyle(monster.id);

    const prompt = `
      A fantasy tower defense game sprite of a ${monster.name.toLowerCase()}.
      ${baseDescription}
      Art style: ${typeStyle}
      Thick 2D cardboard panel style with layered depth and visible edges.
      Multiple stacked cardboard cutout layers creating a 3D illusion.
      Paper craft aesthetic with bold shapes and cut edges.
      Top-down isometric view, 45-degree angle.
      ${monster.canFly ? 'Flying creature with visible wings or hovering effect.' : 'Ground-based creature.'}
      ${monster.isBoss ? 'Epic boss monster, larger and more imposing, dramatic pose.' : 'Regular enemy unit.'}
      High contrast, clean edges, game-ready sprite.
      Transparent background.
      No text or UI elements.
      Professional game art quality.
      Single creature, centered in frame.
    `
      .trim()
      .replace(/\s+/g, ' ');

    return prompt;
  }

  /**
   * Get art style description based on tower race
   */
  private static getRaceArtStyle(race: TowerRace): string {
    const styles: Record<TowerRace, string> = {
      [TowerRace.Human]:
        'Medieval stone and wood construction, banners and flags, realistic architecture',
      [TowerRace.Elemental]:
        'Glowing magical crystals, floating geometric shapes, vibrant energy effects',
      [TowerRace.Undead]:
        'Dark gothic architecture, bones and skulls, shadow magic, eerie green glow',
      [TowerRace.Elven]:
        'Natural living wood, vines and leaves, holy light, elegant organic shapes',
      [TowerRace.Mechanical]:
        'Sci-fi metal and circuits, glowing tech panels, futuristic angular design',
    };

    return styles[race] || 'Fantasy tower structure';
  }

  /**
   * Get visual theme based on damage type
   */
  private static getDamageTypeStyle(damageType: DamageType): string {
    const styles: Record<DamageType, string> = {
      [DamageType.Physical]: 'Sharp physical projectiles, realistic materials',
      [DamageType.Fire]:
        'Flames and embers, orange-red glow, heat distortion',
      [DamageType.Ice]: 'Ice crystals and frost, cyan-blue glow, frozen effects',
      [DamageType.Lightning]:
        'Electric arcs and sparks, yellow-white glow, energy crackling',
      [DamageType.Shadow]:
        'Dark purple mist, ethereal shadows, void tendrils',
      [DamageType.Holy]: 'Bright golden light, holy radiance, divine glow',
      [DamageType.Void]:
        'Black and purple void energy, reality distortion, cosmic darkness',
    };

    return styles[damageType] || 'Magical energy effects';
  }

  /**
   * Get art style based on monster type (from ID prefix)
   */
  private static getMonsterTypeStyle(monsterId: string): string {
    if (monsterId.startsWith('corrupted_')) {
      return 'Corrupted purple and black theme, twisted mutations, exposed flesh, glowing purple details';
    }
    if (monsterId.startsWith('shadow_')) {
      return 'Dark ethereal shadow theme, purple-black wisps, ghostly translucent form';
    }
    if (monsterId.startsWith('undead_')) {
      return 'Undead skeletal theme, bones and decay, green necrotic glow';
    }
    if (monsterId.startsWith('elemental_')) {
      return 'Elemental earth and fire theme, rocky surface with magma cracks, orange glow';
    }
    if (monsterId.includes('decay_lord')) {
      return 'Epic undead knight boss, corrupted armor, riding skeletal horse, green glowing eyes';
    }
    if (monsterId.includes('infernal_titan')) {
      return 'Massive fire demon boss, molten skin, horns and flames, orange-red intense glow';
    }
    if (monsterId.includes('void_nexus')) {
      return 'Reality-bending void entity boss, black hole core, purple void tendrils, cosmic horror';
    }

    return 'Fantasy monster, detailed creature design';
  }

  /**
   * Validate prompt length (DALL-E 3 has a 4000 character limit)
   */
  static validatePrompt(prompt: string): boolean {
    return prompt.length > 0 && prompt.length <= 4000;
  }

  /**
   * Truncate prompt if too long while preserving key information
   */
  static truncatePrompt(prompt: string, maxLength: number = 4000): string {
    if (prompt.length <= maxLength) {
      return prompt;
    }

    // Keep the first part (entity description) and last part (style requirements)
    const firstPart = prompt.substring(0, maxLength / 2);
    const lastPart = prompt.substring(prompt.length - maxLength / 2);

    return `${firstPart}...${lastPart}`;
  }
}
