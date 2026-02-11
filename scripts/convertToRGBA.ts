/**
 * Convert RGB PNG templates to RGBA format
 * Required for OpenAI DALL-E 2 image editing API
 */

import sharp from 'sharp';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertToRGBA(inputPath: string) {
  const tempPath = inputPath.replace('.png', '_temp.png');

  // Convert to RGBA and save to temp file
  await sharp(inputPath)
    .ensureAlpha() // Add alpha channel
    .png()
    .toFile(tempPath);

  // Import fs dynamically
  const fs = await import('fs/promises');

  // Replace original with converted
  await fs.unlink(inputPath);
  await fs.rename(tempPath, inputPath);
}

async function main() {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const towerPath = path.join(templatesDir, 'tower_base.png');
  const monsterPath = path.join(templatesDir, 'monster_base.png');

  console.log('🔄 Converting templates to RGBA format...\n');

  console.log('  Converting tower_base.png...');
  await convertToRGBA(towerPath);
  console.log('  ✅ tower_base.png converted');

  console.log('  Converting monster_base.png...');
  await convertToRGBA(monsterPath);
  console.log('  ✅ monster_base.png converted');

  console.log('\n✅ All templates converted to RGBA format!');
}

main().catch(console.error);
