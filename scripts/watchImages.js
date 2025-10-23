#!/usr/bin/env node

/**
 * Development Image Watcher
 * 
 * Watches the original image directories and automatically processes
 * new images when they're added.
 * 
 * Usage:
 *   node scripts/watchImages.js
 */

import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATCH_DIRS = [
  path.join(__dirname, '../public/images/cities/original'),
  path.join(__dirname, '../public/images/neighborhoods/original'),
];

console.log('👁️  Image Watcher Started');
console.log('Watching directories:');
WATCH_DIRS.forEach((dir) => console.log(`  - ${dir}`));
console.log('\nDrop new images into these folders to auto-process...\n');

// Debounce timer
let processTimer = null;

// Watch for new/changed files
const watcher = chokidar.watch(WATCH_DIRS, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', (filePath) => {
    const filename = path.basename(filePath);
    console.log(`✨ New image detected: ${filename}`);
    scheduleProcess();
  })
  .on('change', (filePath) => {
    const filename = path.basename(filePath);
    console.log(`📝 Image updated: ${filename}`);
    scheduleProcess();
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

/**
 * Schedule image processing (debounced)
 */
function scheduleProcess() {
  if (processTimer) {
    clearTimeout(processTimer);
  }

  processTimer = setTimeout(async () => {
    console.log('\n🎨 Processing images...');
    try {
      const { stdout, stderr } = await execAsync('node scripts/generateImages.js');
      console.log(stdout);
      if (stderr) console.error(stderr);
      console.log('✅ Processing complete!\n');
    } catch (error) {
      console.error('❌ Error processing images:', error.message);
    }
  }, 1000); // Wait 1 second after last change
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping watcher...');
  watcher.close();
  process.exit(0);
});

