#!/usr/bin/env node

/**
 * Image Generation Script - Supports multiple photos per city
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  cities: {
    original: path.join(__dirname, '../public/images/cities/original'),
    square: path.join(__dirname, '../public/images/cities/square'),
    preview: path.join(__dirname, '../public/images/cities/preview'),
  },
  sizes: {
    square: { width: 240, height: 240 },
    preview: { width: 840, height: 1000 },
  },
  quality: { webp: 85, jpg: 85 },
};

async function processImage(inputPath, outputDir, filename, size, format) {
  const outputPath = path.join(outputDir, `${filename}.${format}`);
  try {
    const image = sharp(inputPath);
    const resized = image.resize(size.width, size.height, {
      fit: 'cover',
      position: 'center',
    });

    if (format === 'webp') {
      await resized.webp({ quality: CONFIG.quality.webp }).toFile(outputPath);
    } else {
      await resized.jpeg({ quality: CONFIG.quality.jpg, progressive: true }).toFile(outputPath);
    }

    const stats = await fs.stat(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`    ✓ ${filename}.${format} (${sizeMB}MB)`);
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`);
  }
}

async function processDirectory() {
  console.log('\n📸 Processing cities...');
  const originalDir = CONFIG.cities.original;
  const entries = await fs.readdir(originalDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderName = entry.name;
      const folderPath = path.join(originalDir, folderName);
      const files = await fs.readdir(folderPath);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).sort();

      if (imageFiles.length === 0) continue;

      console.log(`\n  📁 ${folderName}/ (${imageFiles.length} photos)`);

      for (const file of imageFiles) {
        const filename = path.parse(file).name;
        const inputPath = path.join(folderPath, file);
        console.log(`    • ${filename}`);
        await processImage(inputPath, CONFIG.cities.square, filename, CONFIG.sizes.square, 'webp');
        await processImage(inputPath, CONFIG.cities.square, filename, CONFIG.sizes.square, 'jpg');
        await processImage(inputPath, CONFIG.cities.preview, `${filename}-preview`, CONFIG.sizes.preview, 'webp');
        await processImage(inputPath, CONFIG.cities.preview, `${filename}-preview`, CONFIG.sizes.preview, 'jpg');
      }
    } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const filename = path.parse(entry.name).name;
      const inputPath = path.join(originalDir, entry.name);
      console.log(`\n  📄 ${filename}`);
      await processImage(inputPath, CONFIG.cities.square, filename, CONFIG.sizes.square, 'webp');
      await processImage(inputPath, CONFIG.cities.square, filename, CONFIG.sizes.square, 'jpg');
      await processImage(inputPath, CONFIG.cities.preview, `${filename}-preview`, CONFIG.sizes.preview, 'webp');
      await processImage(inputPath, CONFIG.cities.preview, `${filename}-preview`, CONFIG.sizes.preview, 'jpg');
    }
  }
}

async function main() {
  console.log('🎨 Japan Maps - Image Generator\n');
  try {
    await fs.mkdir(CONFIG.cities.square, { recursive: true });
    await fs.mkdir(CONFIG.cities.preview, { recursive: true });
    await processDirectory();
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
