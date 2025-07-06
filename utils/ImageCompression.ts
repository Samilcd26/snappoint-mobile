import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface CompressionConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: string;
  compressionRatio: number;
}

// Preset configurations for different use cases
export const COMPRESSION_PRESETS = {
  AVATAR: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.8,
    format: 'jpeg' as const,
  },
  POST_PHOTO: {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.85,
    format: 'jpeg' as const,
  },
  THUMBNAIL: {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.7,
    format: 'jpeg' as const,
  },
  HIGH_QUALITY: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9,
    format: 'jpeg' as const,
  },
} as const;

/**
 * Get file size from URI (React Native specific)
 */
async function getFileSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch {
    return 0;
  }
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  // Check if resizing is needed
  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    if (aspectRatio > 1) {
      // Landscape
      newWidth = Math.min(maxWidth, originalWidth);
      newHeight = newWidth / aspectRatio;
    } else {
      // Portrait
      newHeight = Math.min(maxHeight, originalHeight);
      newWidth = newHeight * aspectRatio;
    }
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Compress image with specified configuration
 */
export async function compressImage(
  uri: string,
  config: CompressionConfig = COMPRESSION_PRESETS.POST_PHOTO
): Promise<CompressedImageResult> {
  try {
    const {
      maxWidth = 1080,
      maxHeight = 1080,
      quality = 0.85,
      format = 'jpeg',
    } = config;

    // Get original image info
    const originalImageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    const originalSize = await getFileSize(uri);
    
    // Calculate optimal dimensions
    const { width, height } = calculateOptimalDimensions(
      originalImageInfo.width,
      originalImageInfo.height,
      maxWidth,
      maxHeight
    );

    // Prepare manipulation actions
    const actions: ImageManipulator.Action[] = [];
    
    // Add resize if dimensions changed
    if (width !== originalImageInfo.width || height !== originalImageInfo.height) {
      actions.push({
        resize: { width, height }
      });
    }

    // Determine save format
    let saveFormat: ImageManipulator.SaveFormat;
    switch (format) {
      case 'png':
        saveFormat = ImageManipulator.SaveFormat.PNG;
        break;
      case 'webp':
        saveFormat = Platform.OS === 'android' ? ImageManipulator.SaveFormat.WEBP : ImageManipulator.SaveFormat.JPEG;
        break;
      default:
        saveFormat = ImageManipulator.SaveFormat.JPEG;
    }

    // Compress the image
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: saveFormat,
      }
    );

    const compressedSize = await getFileSize(compressedImage.uri);
    const compressionRatio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;

    return {
      uri: compressedImage.uri,
      width: compressedImage.width,
      height: compressedImage.height,
      size: compressedSize,
      format: format,
      compressionRatio,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Compress avatar image with optimized settings
 */
export async function compressAvatar(uri: string): Promise<CompressedImageResult> {
  return compressImage(uri, COMPRESSION_PRESETS.AVATAR);
}

/**
 * Compress post photo with balanced quality/size settings
 */
export async function compressPostPhoto(uri: string): Promise<CompressedImageResult> {
  return compressImage(uri, COMPRESSION_PRESETS.POST_PHOTO);
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(uri: string): Promise<CompressedImageResult> {
  return compressImage(uri, COMPRESSION_PRESETS.THUMBNAIL);
}

/**
 * Smart compression that chooses optimal settings based on image characteristics
 */
export async function smartCompress(uri: string): Promise<CompressedImageResult> {
  try {
    // Get original image info
    const imageInfo = await ImageManipulator.manipulateAsync(uri, []);
    const originalSize = await getFileSize(uri);
    
    let config: CompressionConfig;
    
    // Choose compression strategy based on image size and dimensions
    if (originalSize < 500000) { // < 500KB
      config = { ...COMPRESSION_PRESETS.HIGH_QUALITY, quality: 0.95 };
    } else if (originalSize < 2000000) { // < 2MB
      config = COMPRESSION_PRESETS.POST_PHOTO;
    } else {
      // Large images need more aggressive compression
      config = {
        ...COMPRESSION_PRESETS.POST_PHOTO,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75,
      };
    }
    
    return compressImage(uri, config);
  } catch (error) {
    console.error('Smart compression failed:', error);
    // Fallback to standard compression
    return compressImage(uri, COMPRESSION_PRESETS.POST_PHOTO);
  }
}

/**
 * Batch compress multiple images
 */
export async function compressMultipleImages(
  uris: string[],
  config: CompressionConfig = COMPRESSION_PRESETS.POST_PHOTO
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];
  
  for (const uri of uris) {
    try {
      const compressed = await compressImage(uri, config);
      results.push(compressed);
    } catch (error) {
      console.error(`Failed to compress image ${uri}:`, error);
      // Skip failed images or add original as fallback
      throw error;
    }
  }
  
  return results;
}

/**
 * Get compression statistics
 */
export function getCompressionStats(results: CompressedImageResult[]): {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  averageCompressionRatio: number;
} {
  const totalCompressedSize = results.reduce((sum, result) => sum + result.size, 0);
  const totalOriginalSize = results.reduce((sum, result) => 
    sum + (result.size / (1 - result.compressionRatio)), 0
  );
  
  return {
    totalOriginalSize,
    totalCompressedSize,
    totalSavings: totalOriginalSize - totalCompressedSize,
    averageCompressionRatio: results.reduce((sum, result) => 
      sum + result.compressionRatio, 0
    ) / results.length,
  };
} 