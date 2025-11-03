#!/usr/bin/env node

/**
 * Image Generation Script - Supports multiple photos per city and neighborhoods
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
  neighborhoods: {
    original: path.join(__dirname, '../public/images/neighborhoods/original'),
    square: path.join(__dirname, '../public/images/neighborhoods/square'),
    preview: path.join(__dirname, '../public/images/neighborhoods/preview'),
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

async function processDirectory(type = 'cities') {
  const config = CONFIG[type];
  const typeLabel = type === 'cities' ? 'cities' : 'neighborhoods';
  
  console.log(`\n📸 Processing ${typeLabel}...`);
  const originalDir = config.original;
  
  try {
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
          await processImage(inputPath, config.square, filename, CONFIG.sizes.square, 'webp');
          await processImage(inputPath, config.square, filename, CONFIG.sizes.square, 'jpg');
          await processImage(inputPath, config.preview, `${filename}-preview`, CONFIG.sizes.preview, 'webp');
          await processImage(inputPath, config.preview, `${filename}-preview`, CONFIG.sizes.preview, 'jpg');
        }
      } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
        const filename = path.parse(entry.name).name;
        const inputPath = path.join(originalDir, entry.name);
        console.log(`\n  📄 ${filename}`);
        await processImage(inputPath, config.square, filename, CONFIG.sizes.square, 'webp');
        await processImage(inputPath, config.square, filename, CONFIG.sizes.square, 'jpg');
        await processImage(inputPath, config.preview, `${filename}-preview`, CONFIG.sizes.preview, 'webp');
        await processImage(inputPath, config.preview, `${filename}-preview`, CONFIG.sizes.preview, 'jpg');
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`  ⚠️  Directory ${originalDir} not found, skipping...`);
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('🎨 Japan Maps - Image Generator\n');
  try {
    // Create output directories
    await fs.mkdir(CONFIG.cities.square, { recursive: true });
    await fs.mkdir(CONFIG.cities.preview, { recursive: true });
    await fs.mkdir(CONFIG.neighborhoods.square, { recursive: true });
    await fs.mkdir(CONFIG.neighborhoods.preview, { recursive: true });
    
    // Process both cities and neighborhoods
    await processDirectory('cities');
    await processDirectory('neighborhoods');
    
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
