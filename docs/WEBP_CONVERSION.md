# WebP Image Conversion Guide

This project now includes comprehensive WebP image conversion capabilities for optimal performance and reduced file sizes.

## 🎯 Overview

All images in the project have been converted to WebP format, achieving an average **73.2% reduction** in file size while maintaining visual quality.

### Benefits

- ✅ **Faster load times**: Smaller file sizes mean quicker page loads
- ✅ **Bandwidth savings**: Reduced data transfer for users
- ✅ **Better SEO**: Improved performance metrics
- ✅ **Automatic conversion**: Client-side conversion before upload

## 📦 Installed Libraries

### Server-side

- **sharp** (v0.33.5): High-performance image processing for Node.js
  - Used for batch conversion of existing images
  - 4-5x faster than ImageMagick

### Client-side

- **browser-image-compression** (v2.0.2): Browser-based image compression
  - Converts images to WebP before upload
  - Uses Web Workers for non-blocking processing
  - Automatic quality optimization

## 🛠️ Available Scripts

### Convert Existing Images

```bash
# Convert all images to WebP (keeps originals)
pnpm images:convert

# Convert and delete original files
pnpm images:convert:delete
```

This script:

- Scans `public/blogs`, `public/static/images`, and `public/uploads`
- Converts `.jpg`, `.jpeg`, `.png`, `.gif` to `.webp`
- Shows file size savings for each conversion
- Skips files if `.webp` already exists

### Update Database Images

```bash
# Update all database records to use WebP images
pnpm images:update-db
```

This updates:

- User profile images → `/static/images/profile-holder.webp`
- Blog post featured images → `/blogs/*.webp`

## 💻 Client-Side Usage

### Using the Hook

```tsx
import { useImageConverter } from '@/lib/hooks/useImageConverter';

function ImageUploadComponent() {
  const { convertImage, converting, error } = useImageConverter({
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    quality: 0.85,
    convertToWebP: true,
  });

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await convertImage(file);
    if (result?.success) {
      // Use result.file for upload
      console.log(`Saved ${result.savings.toFixed(1)}%!`);
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileSelect}
      disabled={converting}
    />
  );
}
```

### Direct API Usage

```tsx
import { convertImageToWebP, formatFileSize } from '@/lib/imageConverter';

const result = await convertImageToWebP(file, {
  maxSizeMB: 2,
  quality: 0.8,
  convertToWebP: true,
});

console.log(`Original: ${formatFileSize(result.originalSize)}`);
console.log(`Compressed: ${formatFileSize(result.compressedSize)}`);
console.log(`Savings: ${result.savings.toFixed(1)}%`);
```

### Available Utilities

```tsx
import {
  convertImageToWebP,
  convertMultipleImagesToWebP,
  validateImageFile,
  formatFileSize,
  supportsWebP,
  getImagePreview,
  revokeImagePreview,
} from '@/lib/imageConverter';

// Validate before conversion
const validation = validateImageFile(file, 10 * 1024 * 1024);
if (!validation.valid) {
  console.error(validation.error);
}

// Check browser support
const hasWebPSupport = await supportsWebP();

// Create preview
const previewUrl = getImagePreview(file);
// ... use preview ...
revokeImagePreview(previewUrl); // Clean up when done
```

## 🔧 Configuration

### Conversion Options

```typescript
interface ConversionOptions {
  maxSizeMB?: number;          // Max file size (default: 2MB)
  maxWidthOrHeight?: number;   // Max dimension (default: 1920px)
  useWebWorker?: boolean;      // Use worker thread (default: true)
  quality?: number;            // Quality 0-1 (default: 0.8)
  convertToWebP?: boolean;     // Convert to WebP (default: true)
}
```

### Default Settings

- **Quality**: 80-85% (good balance of size vs quality)
- **Max Size**: 2MB after compression
- **Max Dimension**: 1920px (scales down larger images)
- **Web Worker**: Enabled (non-blocking UI)

## 📊 Conversion Results

From the initial batch conversion:

```
✅ Successfully converted: 25 images
📁 Total processed: 25 files
💾 Total size: 6635.55KB → 1776.00KB
📉 Total savings: 73.2%
```

### Notable Examples

- **logo-dark.png**: 990KB → 51KB (94.9% smaller)
- **logo.png**: 761KB → 49KB (93.6% smaller)
- **android-chrome-512x512.png**: 76KB → 6.5KB (91.4% smaller)
- **profile.jpg**: 1011KB → 276KB (72.7% smaller)

## 🎨 Integration Examples

### ImageSelector Component

The `ImageSelector` component automatically converts images to WebP:

```tsx
// In components/Admin/ImageSelector.tsx
const { convertImage } = useImageConverter({
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  quality: 0.85,
  convertToWebP: true,
});

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  const result = await convertImage(file);
  
  if (result?.success) {
    toast.success(
      `Optimized: ${formatFileSize(result.originalSize)} → 
      ${formatFileSize(result.compressedSize)} 
      (${result.savings.toFixed(1)}% smaller)`
    );
    // Upload result.file to server
  }
};
```

## 🗃️ Database Images

All seed data and existing database records now use WebP images:

### Blog Posts

- Next.js post → `/blogs/luca-bravo-XJXWbfSo2f0-unsplash.webp`
- TypeScript post → `/blogs/emile-perron-xrVDYZRGdw4-unsplash.webp`
- Docker post → `/blogs/c-d-x-PDX_a_82obo-unsplash.webp`
- UI Design post → `/blogs/kelly-sikkema--1_RZL8BGBM-unsplash.webp`
- ML post → `/blogs/carlos-muza-hpjSkU2UYSU-unsplash.webp`

### User Profiles

- All users → `/static/images/profile-holder.webp`

## 🔍 Verification

Check current database images:

```bash
node scripts/verify-image-urls.js
```

## 📝 File Structure

```
scripts/
├── convert-images-to-webp.js    # Batch conversion script
├── update-seed-images.js        # Update seed files
├── update-post-images.js        # Update DB post images
├── update-profile-images.js     # Update DB profile images
└── verify-image-urls.js         # Verify DB image URLs

lib/
├── imageConverter.ts            # Core conversion utilities
└── hooks/
    └── useImageConverter.ts     # React hook for conversion
```

## 🚀 Best Practices

1. **Always convert before upload**: Use the hook or utility functions
2. **Set appropriate quality**: 80-85% is usually optimal
3. **Validate file size**: Set `maxSizeMB` based on your needs
4. **Use Web Workers**: Keep UI responsive during conversion
5. **Clean up previews**: Call `revokeImagePreview()` to free memory
6. **Check browser support**: Use `supportsWebP()` for fallbacks

## 🐛 Troubleshooting

### Conversion fails

- Check file is a valid image format
- Ensure file size is within limits
- Verify browser supports required APIs

### Quality issues

- Increase `quality` option (0.85-0.95 for high quality)
- Reduce `maxWidthOrHeight` less aggressively
- Check source image quality

### Performance issues

- Enable `useWebWorker: true` (default)
- Reduce `maxWidthOrHeight` to process faster
- Process images in batches for multiple uploads

## 📚 Additional Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [WebP Format Info](https://developers.google.com/speed/webp)

## ✅ Migration Checklist

- [x] Install sharp and browser-image-compression
- [x] Create batch conversion script
- [x] Convert all existing images to WebP
- [x] Create client-side conversion utilities
- [x] Create React hook for easy integration
- [x] Update ImageSelector component
- [x] Update seed data with unique images
- [x] Update database records
- [x] Add npm scripts for image operations
- [x] Verify all images are WebP
- [x] Document usage and integration
