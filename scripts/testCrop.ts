import fs from 'fs';
import path from 'path';
import { cropImageFromBuffer } from '../expo/lib/image/server/utils/image.crop';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Please provide an image URL. Example:");
    console.error("npx tsx scripts/testCrop.ts \"https://example.com/image.png\"");
    process.exit(1);
  }

  console.log(`Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`Processing image...`);
  const result = await cropImageFromBuffer(buffer);

  const outputPath = path.join(__dirname, 'test-crop-result.webp');
  fs.writeFileSync(outputPath, result.buffer);

  console.log(`\n--- Results ---`);
  console.log(`Cropped ? ${result.cropped}`);
  console.log(`Original dims: ${result.original.width}x${result.original.height}`);
  console.log(`Crop position: left=${result.position.left}, top=${result.position.top}, width=${result.position.width}, height=${result.position.height}`);
  console.log(`\nSaved output to: ${outputPath}`);
}

main().catch(console.error);
