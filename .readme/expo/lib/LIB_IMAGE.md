# Image Library Documentation

## Overview

The `src/lib/image/` folder provides comprehensive image processing utilities for both client-side and server-side operations. This library handles everything from format conversion and compression to upload and download workflows.

**Key Features**:
- ✅ Client-side image editing (browser-based)
- ✅ Server-side image processing (Sharp-based)
- ✅ Base64 conversions
- ✅ Image upload/download
- ✅ Compression with quality optimization
- ✅ Metadata extraction
- ✅ Format conversion (PNG, WebP, JPEG, HEIC)

---

## Folder Structure

```
src/lib/image/
├── client/                 # Browser-side operations
│   ├── base64/            # Base64 conversions
│   ├── editing/           # Image editing (compress, convert, crop, etc.)
│   ├── metadata/          # Metadata extraction
│   ├── download.ts        # Download utilities
│   ├── heic-converter.ts  # HEIC format support
│   └── sanitize-url.ts    # URL sanitization
└── server/                # Server-side operations
    ├── upload.ts          # Image upload workflow
    ├── post-upload.ts     # Post-upload processing
    └── utils/             # Server utilities (Sharp-based)
```

---

## Client-Side (`client/`)

**Import from**: `@/lib/image/client`

### Base64 Operations

```typescript
import { 
  fileToBase64, 
  base64ToFile,
  urlToBase64,
  isBase64,
  addBase64Header 
} from '@/lib/image/client/base64';

// Convert File to Base64
const file = new File([blob], 'image.png');
const base64 = await fileToBase64(file);

// Convert Base64 to File
const file = base64ToFile(base64String);

// Convert URL to Base64
const base64 = await urlToBase64('https://example.com/image.png');

// Check if string is Base64
const isValid = isBase64(someString);

// Add data URI header
const withHeader = addBase64Header(rawBase64, 'png');
```

### Image Editing

```typescript
import {
  compressImage,
  convertImage,
  cropAlpha,
  downscaleImage,
  flipImage,
  mergeImages,
  setImageBackground,
  applyMaskToImage,
  createMask,
  applyWatermark
} from '@/lib/image/client/editing';

// Compress image with automatic quality optimization
const compressed = await compressImage(url, {
  progress: (p) => console.log(`${p}%`),
  initialQuality: 90, // Optional
  keepMimeType: true  // Optional
});

// Convert format
const webp = await convertImage(url, 'webp');
const png = await convertImage(url, 'png');

// Crop transparent areas
const cropped = await cropAlpha(url);

// Downscale to max longest side
const downscaled = await downscaleImage(url, 1024);

// Flip image (flipX: boolean, flipY: boolean)
const flippedHorizontally = await flipImage(url, true, false);
const flippedVertically = await flipImage(url, false, true);
const flippedBoth = await flipImage(url, true, true);

// Merge multiple images (stacks them on top of each other)
const merged = await mergeImages(url1, url2, url3);

// Set background color
const withBg = await setImageBackground(url, '#ffffff');

// Apply mask
const masked = await applyMaskToImage(imageUrl, maskUrl);

// Create mask from two images
const mask = await createMask(baseImageUrl, maskImageUrl, {
  x: 0,
  y: 0,
  color: '#000000',    // Optional
  inverted: false      // Optional
});

// Apply watermark
const watermarked = await applyWatermark(url, {
  watermarkUrl: '/watermark.png',
  opacity: 1,
  sizePourcent: 6,     // Size as % of image
  offsetPourcent: 3    // Offset from edge as %
});
```

**Compression Logic**:
The `compressImage` function uses intelligent compression levels based on image resolution:
- **8K+** (8192px): Target 4MB, initial quality 60%
- **4K** (4096px): Target 1.8MB, initial quality 90%
- **2K** (2048px): Target 500KB, initial quality 92%
- **HD** (1920px): Target 400KB, initial quality 95%
- **1K** (1024px): Target 200KB, initial quality 95%
- **Default**: Target 150KB, initial quality 95%

Automatically adjusts quality if target size isn't met.

### Metadata Extraction

```typescript
import {
  getFileDimensions,
  getImageDimensions,
  hasAlpha,
  isTransparent
} from '@/lib/image/client/metadata';

// Get dimensions from File
const { width, height } = await getFileDimensions(file);

// Get dimensions from URL
const { width, height } = await getImageDimensions(url);

// Check if image has alpha channel
const hasTransparency = await hasAlpha(url);

// Check if image is transparent
const transparent = await isTransparent(url);
```

### Download

```typescript
import { download, downloadImage, getExtensionFromBase64 } from '@/lib/image/client';

// Download image (works with URLs and Base64)
await download('https://example.com/image.png');
await download('data:image/png;base64,...');

// Download with format preference
await downloadImage(url, 'png'); // Convert to PNG before download
await downloadImage(url, 'original'); // Keep original format

// Get extension from Base64
const ext = getExtensionFromBase64(base64String); // 'png', 'jpeg', etc.
```

### HEIC Conversion

```typescript
import { convertHeicFile } from '@/lib/image/client';

// Convert HEIC file to JPEG
const heicFile = new File([blob], 'photo.heic');
const jpegFile = await convertHeicFile(heicFile);
```

### URL Sanitization

```typescript
import { sanitizeImageUrl } from '@/lib/image/client';

// Sanitize image URL (remove tracking params, adds base64 header, etc.)
const clean = sanitizeImageUrl(url);
```

---

## Server-Side (`server/`)

**Import from**: `@/lib/image/server`

### Upload Workflow

> ⚠️ **DEPRECATED**: The `uploadFile` and `uploadFiles` functions from `@/lib/image/server` are deprecated.
> **Use Convex router functions instead**: `api.router.storage.images.uploadOne` and `api.router.storage.images.uploadMany`

```typescript
"use server"
import { api, fetchActionAuth } from '@/lib/convex/server';

export async function handleUpload(base64: string) {
  const image = await fetchActionAuth(api.router.storage.images.uploadOne.authed, {
    base64, // Either URL of base64
    url, // Either URL or base64
    object: {         // Optional: for object positioning
      baseImageId: 'k123...',
      x: 100,
      y: 200
    }
  });
  
  return image; // Returns uploaded image data
}
```

**Upload Process**:
1. Compresses image automatically based on resolution
2. Generates SHA-256 hash for deduplication
3. Uploads to S3 (or configured storage)
4. Saves metadata to Convex database
5. Automatically generates thumbnail sizes (150px, 336px, 600px) in background

### Post-Upload Processing

> ℹ️ **Automatic**: Post-upload processing is now handled automatically by the Convex upload functions.
> Thumbnail generation happens in the background via `after()` hook.

**Generated Sizes** (automatic):
- **150px**: Quality 40% (thumbnails)
- **336px**: Quality 40% (small previews)
- **600px**: Quality 50% (medium previews)

Automatically skips sizes that already exist.

### Server Utilities

```typescript
import {
  compressImage,
  compressImageAuto,
  convertImage,
  imageBufferFromUrl,
  imageMetadata,
  hasImageAlpha,
  addImageBackground,
  bufferToBase64,
  removeBase64Header,
  addBase64Header
} from '@/lib/image/server/utils';

// Compress with specific options
const compressed = await compressImage(urlOrBuffer, {
  maxSideSize: 1920,
  quality: 85,
  mimeType: 'image/webp' // Optional: 'image/webp' | 'image/png'
});

// Auto-compress (intelligent based on resolution)
const auto = await compressImageAuto(urlOrBuffer, {
  format: 'webp',      // Optional: 'webp' | 'png'
  maxSizeKb: 500       // Optional: override target size
});

// Convert format
const converted = await convertImage(urlOrBuffer, 'webp');
const png = await convertImage(urlOrBuffer, 'png');
// Returns: { metadata, buffer, mimeType, hasAlpha }

// Get buffer from URL or Base64
const buffer = await imageBufferFromUrl('https://example.com/image.png');
const buffer2 = await imageBufferFromUrl('data:image/png;base64,...');

// Get metadata
const meta = await imageMetadata(buffer);
// Returns: { width, height, format, size, mimeType, ... }

// Check alpha channel
const hasAlpha = await hasImageAlpha(buffer, 100); // precision: 0-100

// Add background (for transparent images)
const withBg = await addImageBackground(urlOrBuffer, '#ffffff', {
  customAspectRatio: '16:9',  // Optional
  returnFormat: 'webp'         // Optional: 'webp' | 'png' | 'jpeg'
});

// Base64 utilities
const base64 = bufferToBase64(buffer);
const raw = removeBase64Header('data:image/png;base64,abc123');
const withHeader = addBase64Header(rawBase64, 'webp');
```

**Server Compression Logic** (uses Sharp):
Same intelligent levels as client-side:
- 8K+, 4K, 2K, HD, 1K with different quality targets
- Automatically adjusts quality to meet target file size
- Supports WebP, PNG, JPEG output formats

---

## Common Workflows

### Complete Upload Flow

```typescript
"use server"
import { api, fetchActionAuth } from '@/lib/convex/server';

export async function uploadUserImage(base64: string) {
  // Upload image (user ID is automatically retrieved from auth context)
  const image = await fetchActionAuth(api.router.storage.images.uploadOne.authed, {
    base64,
  });
  
  if (!image) throw new Error('Upload failed');
  
  // Post-upload processing happens automatically in background
  // (generates thumbnails at 150px, 336px, 600px)
  
  return image;
}

// Upload multiple images
export async function uploadMultipleImages(images: Array<{ base64: string }>) {
  const result = await fetchActionAuth(api.router.storage.images.uploadMany.authed, {
    images
  });
  
  return result;
}
```

### Client-Side Processing Before Upload

```typescript
"use client"
import { fileToBase64, compressImage } from '@/lib/image/client';

async function handleFile(file: File) {
  // 1. Convert to Base64
  const base64 = await fileToBase64(file);
  
  // 2. Compress
  const compressed = await compressImage(base64, {
    progress: (p) => setProgress(p),
  });
  
  // 3. Upload to server
  const result = await uploadAction(compressed);
  
  return result;
}
```

### Format Conversion Pipeline

```typescript
// Client-side
import { convertImage, compressImage } from '@/lib/image/client/editing';

// Convert JPEG to WebP with compression
const webp = await convertImage(jpegUrl, 'webp');
const compressed = await compressImage(webp);
```

### Download with Conversion

```typescript
import { downloadImage } from '@/lib/image/client';

// Download as PNG (converts if needed)
await downloadImage(imageUrl, 'png');

// Download original format
await downloadImage(imageUrl, 'original');
```

### Image Editing Chain

```typescript
import { 
  cropAlpha, 
  setBackground, 
  compressImage,
  convertImage 
} from '@/lib/image/client/editing';

// 1. Crop transparent areas
const cropped = await cropAlpha(originalUrl);

// 2. Add white background
const withBg = await setImageBackground(cropped, '#ffffff');

// 3. Convert to WebP
const webp = await convertImage(withBg, 'webp');

// 4. Final compression
const final = await compressImage(webp);
```

---

## Import Patterns

### Client Components

```typescript
"use client"
import { 
  fileToBase64,
  compressImage,
  downloadImage 
} from '@/lib/image/client';

// Or specific imports
import { compressImage } from '@/lib/image/client/editing';
import { fileToBase64 } from '@/lib/image/client/base64';
```

### Server Actions

```typescript
"use server"
// ⚠️ uploadFile and uploadFiles are deprecated - use Convex functions
import { api, fetchActionAuth } from '@/lib/convex/server';
import { compressImageAuto } from '@/lib/image/server/utils';
```

---

## Key Differences: Client vs Server

| Feature             | Client                                | Server                      |
| ------------------- | ------------------------------------- | --------------------------- |
| **Library**         | Canvas API, browser-image-compression | Sharp (Node.js)             |
| **Performance**     | Limited by browser                    | High performance            |
| **File Size Limit** | ~50MB recommended                     | No practical limit          |
| **Formats**         | PNG, JPEG, WebP                       | PNG, JPEG, WebP, HEIC, AVIF |
| **Best For**        | User interactions, previews           | Bulk processing, uploads    |
| **Environment**     | Browser only                          | Server only                 |

---

## Best Practices

### ✅ DO:

1. **Use client-side for previews**
   ```typescript
   // Compress before showing preview
   const preview = await compressImage(base64);
   setPreviewUrl(preview);
   ```

2. **Use convex for final processing**
   ```typescript
   // Upload image (Convex handles final compression)
   // Must be less than 5MB (3MB * 1.33 For base64)
   const image = await fetchActionAuth(api.router.storage.images.uploadOne.authed, { base64 });
   ```

1. **Leverage auto-compression**
   ```typescript
   // Let the library choose optimal settings
   const compressed = await compressImageAuto(url);
   ```

2. **Check dimensions before processing**
   ```typescript
   const { width, height } = await getFileDimensions(file);
   if (width > 8192) {
     // Handle ultra-high-res images differently
     // For compression it's already handled automatically
   }
   ```

3. **Use appropriate formats**
   ```typescript
   // WebP MOST OF THE TIME, HIGHER PERFORMANCE
   // Only use PNG once downloading the images
   const webp = await convertImage(url, 'webp');
   ```

### ❌ DON'T:

1. **Don't send huge images to Convex**
   ```typescript   
   // ❌ Can't send more than 4mb to the server ! Make sure to compress it client side first.
   const image = await fetchActionAuth(api.router.storage.images.uploadOne.authed, { base64: 50MBBase64 });

   // Convex then automatically compress it again to make sure it fits the good size !
   // ✅ Let compressImageAuto from the uploadOne handle the rest.
   const image = await fetchActionAuth(api.router.storage.images.uploadOne.authed, { base64 });
    
   ```

2. **Don't hardcode quality**
   ```typescript
   // ❌ One size fits all
   await compressImage(url, { initialQuality: 80 });
   
   // ✅ Let auto-compression decide
   await compressImage(url); // Adapts to resolution
   ```

---

### Retrieve

```typescript
import { api, fetchQuery } from '@/lib/convex/server';
import { compressImage } from '@/lib/image/server/utils';

// Get image from Convex
const image = await fetchQuery(api.router.storage.images.getOne.anon, {
  id: imageId
});

// ....
```

---

## Summary

The image library provides:

- ✅ **Dual environment support** - Client and server operations
- ✅ **Intelligent compression** - Auto-adjusts based on resolution
- ✅ **Format flexibility** - PNG, JPEG, WebP, HEIC support
- ✅ **Complete workflows** - Upload, process, download
- ✅ **Metadata utilities** - Dimensions, transparency detection
- ✅ **Editing capabilities** - Crop, flip, merge, watermark
- ✅ **Convex integration** - Direct database and storage support

**Remember**:
1. Client operations for previews and user interactions
2. Server operations for final processing and storage
3. Use auto-compression for optimal quality/size balance
4. Always compress before uploading
5. Server-side uses Sharp (faster, more formats)
6. Client-side uses Canvas API (limited but convenient)
