/**
 * Generate Template Images
 * Creates base tower and monster templates for consistent art style
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import { OpenAIService } from '../src/services/OpenAIService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🎨 Generating Template Images');
  console.log('=============================\n');

  // Load API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  const openai = new OpenAIService(apiKey);
  const projectRoot = path.resolve(__dirname, '..');
  const templatesDir = path.join(projectRoot, 'templates');

  // Ensure templates directory exists
  await fs.mkdir(templatesDir, { recursive: true });

  // Tower template prompt
  const towerPrompt = `
    A fantasy tower defense game sprite in thick 2D cardboard panel style.
    Generic medieval stone tower, neutral design.
    Thick layered cardboard aesthetic with visible depth and edges.
    Multiple stacked 2D panels creating a 3D illusion.
    Top-down isometric view, 45-degree angle.
    Simple bold shapes, clean cut edges.
    Warm stone gray colors with darker edge shading.
    Paper craft / cardboard cutout style.
    High contrast, game-ready sprite.
    Centered in frame, transparent background.
    No text, no UI elements.
    Professional game art quality.
  `.trim().replace(/\s+/g, ' ');

  // Monster template prompt
  const monsterPrompt = `
    A fantasy tower defense game sprite in thick 2D cardboard panel style.
    Generic fantasy creature, neutral threatening pose.
    Thick layered cardboard aesthetic with visible depth and edges.
    Multiple stacked 2D panels creating a 3D illusion.
    Top-down isometric view, 45-degree angle.
    Simple bold shapes, clean cut edges.
    Dark purple and gray colors with darker edge shading.
    Paper craft / cardboard cutout style.
    High contrast, game-ready sprite.
    Centered in frame, transparent background.
    No text, no UI elements.
    Professional game art quality.
  `.trim().replace(/\s+/g, ' ');

  try {
    // Generate tower template
    console.log('🏰 Generating tower template...');
    console.log(`   Prompt: ${towerPrompt.substring(0, 100)}...`);

    const towerImageUrl = await openai.generateImage(towerPrompt);
    const towerPath = path.join(templatesDir, 'tower_base.png');
    await openai.downloadImage(towerImageUrl, towerPath);

    console.log(`   ✅ Saved to ${towerPath}`);
    console.log(`   Cost: $0.04\n`);

    // Wait 12 seconds for rate limiting
    console.log('   ⏳ Rate limiting: waiting 12s...\n');
    await sleep(12000);

    // Generate monster template
    console.log('👹 Generating monster template...');
    console.log(`   Prompt: ${monsterPrompt.substring(0, 100)}...`);

    const monsterImageUrl = await openai.generateImage(monsterPrompt);
    const monsterPath = path.join(templatesDir, 'monster_base.png');
    await openai.downloadImage(monsterImageUrl, monsterPath);

    console.log(`   ✅ Saved to ${monsterPath}`);
    console.log(`   Cost: $0.04\n`);

    console.log('✅ Templates Generated!');
    console.log('======================');
    console.log(`   Total cost: $0.08`);
    console.log(`   Templates: ${templatesDir}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Review templates in templates/ directory');
    console.log('   2. If satisfied, run: npm run generate:assets');
    console.log('   3. The script will use these templates for consistent style\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
