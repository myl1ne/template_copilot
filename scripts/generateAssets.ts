/**
 * Asset Generation Script
 * Generates AI sprites using OpenAI gpt-image-1.5
 *
 * Usage: npm run generate:assets
 *
 * Features:
 * - Incremental generation (skips already-generated assets)
 * - Rate limiting (5 requests/min)
 * - Cost tracking
 * - Resumable on interruption
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { OpenAIService } from '../src/services/OpenAIService';
import { PromptGenerator } from '../src/utils/promptGenerator';
import { TOWER_DEFINITIONS } from '../src/data/towers';
import { MONSTER_DEFINITIONS } from '../src/data/monsters';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AssetManifestEntry {
  type: 'tower' | 'monster';
  path: string;
  prompt: string;
  cost: number;
  generatedAt: string;
}

interface AssetManifest {
  version: string;
  generatedAt: string;
  totalCost: number;
  entities: Record<string, AssetManifestEntry>;
}

// Configuration
const COST_PER_IMAGE_DALLE3 = 0.04; // DALL-E 3 standard quality 1024x1024
const COST_PER_IMAGE_DALLE2 = 0.02; // DALL-E 2 edits 1024x1024
const RATE_LIMIT_DELAY_MS = 12000; // 12 seconds (5 requests/min)
const RATE_LIMIT_ERROR_DELAY_MS = 60000; // 1 minute if rate limited

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize description to avoid safety filter triggers
 */
function sanitizeDescription(description: string): string {
  return description
    .replace(/engage enemies/gi, 'defend against foes')
    .replace(/melee combat/gi, 'close quarters')
    .replace(/attack/gi, 'defend')
    .replace(/kill/gi, 'defeat')
    .replace(/destroy/gi, 'neutralize')
    .replace(/explosive/gi, 'heavy')
    .replace(/weapon/gi, 'defense structure')
    .replace(/burn/gi, 'heat')
    .replace(/poison/gi, 'toxic gas')
    .replace(/skull/gi, 'bone')
    .replace(/death/gi, 'shadow')
    .replace(/decay/gi, 'corruption')
    .replace(/fire/gi, 'flame')
    .replace(/blood/gi, 'crimson');
}

/**
 * Load existing manifest or create new one
 */
async function loadManifest(manifestPath: string): Promise<AssetManifest> {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Manifest doesn't exist, create new one
    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalCost: 0,
      entities: {},
    };
  }
}

/**
 * Save manifest to disk
 */
async function saveManifest(
  manifestPath: string,
  manifest: AssetManifest
): Promise<void> {
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Main generation function
 */
async function main() {
  console.log('🎨 GenAI Asset Generation Script');
  console.log('================================\n');

  // Load API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    console.error('   Please set your OpenAI API key in the .env file');
    process.exit(1);
  }

  // Initialize OpenAI service
  const openai = new OpenAIService(apiKey);

  // Validate API key
  console.log('🔑 Validating API key...');
  const isValid = await openai.validateApiKey();
  if (!isValid) {
    console.error('❌ Error: Invalid OpenAI API key');
    process.exit(1);
  }
  console.log('✅ API key valid\n');

  // Setup paths
  const projectRoot = path.resolve(__dirname, '..');
  const assetsDir = path.join(projectRoot, 'public', 'assets');
  const manifestPath = path.join(__dirname, 'assetManifest.json');
  const templatesDir = path.join(projectRoot, 'templates');
  const towerTemplatePath = path.join(templatesDir, 'tower_base.png');
  const monsterTemplatePath = path.join(templatesDir, 'monster_base.png');

  // Use gpt-image-1.5 text-to-image generation
  // Note: Image editing API requires masks and doesn't work for style transfer
  const hasTemplates = false;
  console.log('🎨 Using gpt-image-1.5 text-to-image generation');
  console.log('   "Thick cardboard panel" style embedded in prompts');
  console.log('   Cost per image: $0.04 ($1.40 total for 35 entities)\n');

  // Create asset directories
  await fs.mkdir(path.join(assetsDir, 'towers'), { recursive: true });
  await fs.mkdir(path.join(assetsDir, 'monsters'), { recursive: true });

  // Load manifest
  let manifest = await loadManifest(manifestPath);
  let sessionCost = 0;
  let sessionGenerated = 0;

  console.log(`📦 Loaded manifest: ${Object.keys(manifest.entities).length} existing assets`);
  console.log(`💰 Previous total cost: $${manifest.totalCost.toFixed(2)}\n`);

  // Generate tower assets
  console.log('🏰 Generating tower assets...');
  console.log('─'.repeat(50));

  for (const [id, tower] of Object.entries(TOWER_DEFINITIONS)) {
    // Skip if already generated
    if (manifest.entities[id]) {
      console.log(`  ✅ ${tower.name} (cached)`);
      continue;
    }

    console.log(`  🎨 Generating ${tower.name}...`);

    try {
      let imageUrl: string;
      let costPerImage: number;

      if (hasTemplates) {
        // Use image-to-image with template (DALL-E 2)
        const safeDescription = sanitizeDescription(tower.description);
        const prompt = `Using this image as a style template, create a ${tower.name.toLowerCase()}. ${safeDescription}. Follow the same thick 2D cardboard panel aesthetic with layered depth, visible edges, and paper craft style. Keep the same art style, viewing angle, and material look, but depict a ${tower.name.toLowerCase()} instead.`;
        console.log(`     Edit prompt: ${prompt.substring(0, 80)}...`);

        imageUrl = await openai.editImage(towerTemplatePath, prompt);
        costPerImage = COST_PER_IMAGE_DALLE2;
        console.log(`     Image edited using template: ${imageUrl.substring(0, 50)}...`);
      } else {
        // Use text-to-image (DALL-E 3)
        const prompt = PromptGenerator.generateTowerPrompt(tower);
        console.log(`     Prompt length: ${prompt.length} characters`);

        imageUrl = await openai.generateImage(prompt);
        costPerImage = COST_PER_IMAGE_DALLE3;
        console.log(`     Image generated: ${imageUrl.substring(0, 50)}...`);
      }

      // Download and save
      const outputPath = path.join(assetsDir, 'towers', `${id}.png`);
      await openai.downloadImage(imageUrl, outputPath);

      // Update manifest
      manifest.entities[id] = {
        type: 'tower',
        path: `/assets/towers/${id}.png`,
        prompt: hasTemplates ? 'Image-to-image edit' : 'Text-to-image generation',
        cost: costPerImage,
        generatedAt: new Date().toISOString(),
      };

      sessionCost += costPerImage;
      sessionGenerated++;

      console.log(`     ✅ Saved to ${outputPath}`);
      console.log(`     Cost: $${costPerImage.toFixed(2)}\n`);

      // Save manifest after each successful generation (resumable)
      manifest.totalCost += costPerImage;
      await saveManifest(manifestPath, manifest);

      // Rate limiting: Wait 12 seconds before next request
      if (
        sessionGenerated <
        Object.keys(TOWER_DEFINITIONS).length +
          Object.keys(MONSTER_DEFINITIONS).length
      ) {
        console.log(`     ⏳ Rate limiting: waiting ${RATE_LIMIT_DELAY_MS / 1000}s...`);
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (error) {
      console.error(`     ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        console.log(`     ⏳ Rate limit hit, waiting ${RATE_LIMIT_ERROR_DELAY_MS / 1000}s...`);
        await sleep(RATE_LIMIT_ERROR_DELAY_MS);
      }
    }
  }

  // Generate monster assets
  console.log('\n👹 Generating monster assets...');
  console.log('─'.repeat(50));

  for (const [id, monster] of Object.entries(MONSTER_DEFINITIONS)) {
    // Skip if already generated
    if (manifest.entities[id]) {
      console.log(`  ✅ ${monster.name} (cached)`);
      continue;
    }

    console.log(`  🎨 Generating ${monster.name}...`);

    try {
      let imageUrl: string;
      let costPerImage: number;

      if (hasTemplates) {
        // Use image-to-image with template (DALL-E 2)
        const description = monster.visualDescription || monster.description;
        const safeDescription = sanitizeDescription(description);
        const prompt = `Using this image as a style template, create a ${monster.name.toLowerCase()}. ${safeDescription}. ${monster.isBoss ? 'Make it larger and more imposing for a boss.' : ''} Follow the same thick 2D cardboard panel aesthetic with layered depth, visible edges, and paper craft style. Keep the same art style, viewing angle, and material look, but depict a ${monster.name.toLowerCase()} instead.`;
        console.log(`     Edit prompt: ${prompt.substring(0, 80)}...`);

        imageUrl = await openai.editImage(monsterTemplatePath, prompt);
        costPerImage = COST_PER_IMAGE_DALLE2;
        console.log(`     Image edited using template: ${imageUrl.substring(0, 50)}...`);
      } else {
        // Use text-to-image (DALL-E 3)
        const prompt = PromptGenerator.generateMonsterPrompt(monster);
        console.log(`     Prompt length: ${prompt.length} characters`);

        imageUrl = await openai.generateImage(prompt);
        costPerImage = COST_PER_IMAGE_DALLE3;
        console.log(`     Image generated: ${imageUrl.substring(0, 50)}...`);
      }

      // Download and save
      const outputPath = path.join(assetsDir, 'monsters', `${id}.png`);
      await openai.downloadImage(imageUrl, outputPath);

      // Update manifest
      manifest.entities[id] = {
        type: 'monster',
        path: `/assets/monsters/${id}.png`,
        prompt: hasTemplates ? 'Image-to-image edit' : 'Text-to-image generation',
        cost: costPerImage,
        generatedAt: new Date().toISOString(),
      };

      sessionCost += costPerImage;
      sessionGenerated++;

      console.log(`     ✅ Saved to ${outputPath}`);
      console.log(`     Cost: $${costPerImage.toFixed(2)}\n`);

      // Save manifest after each successful generation (resumable)
      manifest.totalCost += costPerImage;
      await saveManifest(manifestPath, manifest);

      // Rate limiting: Wait 12 seconds before next request (if not last)
      const totalEntities =
        Object.keys(TOWER_DEFINITIONS).length +
        Object.keys(MONSTER_DEFINITIONS).length;
      const currentIndex =
        Object.keys(TOWER_DEFINITIONS).length +
        Object.keys(MONSTER_DEFINITIONS).indexOf(id) +
        1;

      if (currentIndex < totalEntities) {
        console.log(`     ⏳ Rate limiting: waiting ${RATE_LIMIT_DELAY_MS / 1000}s...`);
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (error) {
      console.error(`     ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        console.log(`     ⏳ Rate limit hit, waiting ${RATE_LIMIT_ERROR_DELAY_MS / 1000}s...`);
        await sleep(RATE_LIMIT_ERROR_DELAY_MS);
      }
    }
  }

  // Final summary
  console.log('\n✅ Generation Complete!');
  console.log('======================');
  console.log(`   Total assets: ${Object.keys(manifest.entities).length}`);
  console.log(`   Generated this session: ${sessionGenerated}`);
  console.log(`   Session cost: $${sessionCost.toFixed(2)}`);
  console.log(`   Total lifetime cost: $${manifest.totalCost.toFixed(2)}`);
  console.log(`   Manifest: ${manifestPath}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review generated sprites in public/assets/');
  console.log('   2. Set VITE_ENABLE_GENAI_ASSETS=true in .env');
  console.log('   3. Run the game: npm run dev');
  console.log('   4. Commit assets to repo: git add public/assets/ scripts/assetManifest.json\n');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
