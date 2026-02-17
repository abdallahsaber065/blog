#!/usr/bin/env node
/**
 * Convert all existing images to WebP format
 * Usage: node scripts/convert-images-to-webp.js [--delete-originals]
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const IMAGE_DIRS = [
  'public/blogs',
  'public/static/images',
  'public/uploads'
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
const WEBP_QUALITY = 80; // Quality for WebP conversion (1-100)
const DELETE_ORIGINALS = process.argv.includes('--delete-originals');

/**
 * Get all image files from a directory
 */
async function getImageFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively get files from subdirectories
        const subFiles = await getImageFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Directory doesn't exist, return empty array
    }
    throw error;
  }
}

/**
 * Convert an image to WebP format
 */
async function convertToWebP(imagePath) {
  const ext = path.extname(imagePath);
  const webpPath = imagePath.replace(ext, '.webp');

  // Skip if WebP already exists
  try {
    await fs.access(webpPath);
    console.log(`⏭️  Skipping ${path.basename(imagePath)} (WebP already exists)`);
    return { skipped: true, original: imagePath, webp: webpPath };
  } catch {
    // WebP doesn't exist, proceed with conversion
  }

  try {
    const info = await sharp(imagePath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const originalStats = await fs.stat(imagePath);
    const webpStats = await fs.stat(webpPath);
    
    const originalSize = (originalStats.size / 1024).toFixed(2);
    const webpSize = (webpStats.size / 1024).toFixed(2);
    const savings = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`✅ ${path.basename(imagePath)}`);
    console.log(`   ${originalSize}KB → ${webpSize}KB (${savings}% smaller)`);

    return {
      success: true,
      original: imagePath,
      webp: webpPath,
      originalSize: originalStats.size,
      webpSize: webpStats.size,
      savings: parseFloat(savings)
    };
  } catch (error) {
    console.error(`❌ Failed to convert ${imagePath}:`, error.message);
    return {
      success: false,
      original: imagePath,
      error: error.message
    };
  }
}

/**
 * Delete original image file
 */
async function deleteOriginal(imagePath) {
  try {
    await fs.unlink(imagePath);
    console.log(`🗑️  Deleted original: ${path.basename(imagePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete ${imagePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Starting image conversion to WebP...\n');
  
  if (DELETE_ORIGINALS) {
    console.log('⚠️  WARNING: Original images will be deleted after conversion!\n');
  }

  const allResults = [];

  for (const dir of IMAGE_DIRS) {
    console.log(`\n📁 Processing directory: ${dir}`);
    console.log('─'.repeat(60));

    const imageFiles = await getImageFiles(dir);
    
    if (imageFiles.length === 0) {
      console.log('No images found in this directory.\n');
      continue;
    }

    console.log(`Found ${imageFiles.length} images to process\n`);

    for (const imagePath of imageFiles) {
      const result = await convertToWebP(imagePath);
      allResults.push(result);

      if (DELETE_ORIGINALS && result.success) {
        await deleteOriginal(imagePath);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));

  const successful = allResults.filter(r => r.success);
  const skipped = allResults.filter(r => r.skipped);
  const failed = allResults.filter(r => !r.success && !r.skipped);

  console.log(`✅ Successfully converted: ${successful.length}`);
  console.log(`⏭️  Skipped (already exists): ${skipped.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📁 Total processed: ${allResults.length}`);

  if (successful.length > 0) {
    const totalOriginalSize = successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalWebpSize = successful.reduce((sum, r) => sum + r.webpSize, 0);
    const totalSavings = ((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1);

    console.log(`\n💾 Total size: ${(totalOriginalSize / 1024).toFixed(2)}KB → ${(totalWebpSize / 1024).toFixed(2)}KB`);
    console.log(`📉 Total savings: ${totalSavings}%`);
  }

  console.log('\n✨ Conversion complete!');
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
