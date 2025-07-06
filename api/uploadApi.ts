import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://192.168.1.87:8080/api";

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
import {
  PresignedURLRequest,
  PresignedURLResponse,
  MultipleUploadRequest,
  MultipleUploadResponse,
  UploadCompleteRequest,
  UploadCompleteResponse,
  StandardUploadResponse,
} from '@/types/upload.types';
import { compressAvatar, compressPostPhoto, smartCompress, CompressedImageResult } from '../utils/ImageCompression';

// Get presigned URL for single file upload
export const getPresignedURL = async (request: PresignedURLRequest): Promise<PresignedURLResponse> => {
  const response = await fetch(`${BASE_URL}/upload/presigned-url`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload URL generation failed' }));
    throw new Error(errorData.error || 'Failed to get upload URL');
  }

  const data: StandardUploadResponse<PresignedURLResponse> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to get upload URL');
  }

  return data.data!;
};

// Get presigned URLs for multiple files
export const getMultiplePresignedURLs = async (request: MultipleUploadRequest): Promise<MultipleUploadResponse> => {
  const response = await fetch(`${BASE_URL}/upload/multiple-presigned-urls`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload URLs generation failed' }));
    throw new Error(errorData.error || 'Failed to get upload URLs');
  }

  const data: StandardUploadResponse<MultipleUploadResponse> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to get upload URLs');
  }

  return data.data!;
};

// Upload file to R2 using presigned URL
export const uploadFileToR2 = async (uploadUrl: string, file: File | Blob, contentType: string): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage');
  }
};

// Upload file from React Native (using FormData)
export const uploadFileFromURI = async (uploadUrl: string, uri: string, contentType: string): Promise<void> => {
  try {
    // For R2 presigned URLs, we need to send raw binary data, not FormData
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to read file');
    }
    
    const blob = await response.blob();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload file to storage: ${uploadResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
};

// Confirm upload completion
export const confirmUpload = async (request: UploadCompleteRequest): Promise<UploadCompleteResponse> => {
  const response = await fetch(`${BASE_URL}/upload/confirm`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload confirmation failed' }));
    throw new Error(errorData.error || 'Failed to confirm upload');
  }

  const data: StandardUploadResponse<UploadCompleteResponse> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to confirm upload');
  }

  return data.data!;
};

// Delete uploaded file
export const deleteUploadedFile = async (key: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/upload/file/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'File deletion failed' }));
    throw new Error(errorData.error || 'Failed to delete file');
  }
};

// Complete upload flow with automatic compression (standard behavior)
export const uploadFileComplete = async (
  uri: string,
  fileName: string,
  mediaType: 'photo' | 'video' = 'photo',
  dimensions?: { width: number; height: number; duration?: number }
): Promise<UploadCompleteResponse> => {
  try {
    if (mediaType === 'photo') {
      console.log('🖼️ Compressing photo...');
      
      // Step 1: Compress the image (standard behavior for photos)
      const compressedResult = await smartCompress(uri);
      
      console.log(`📊 Photo compressed: ${(compressedResult.compressionRatio * 100).toFixed(1)}% size reduction`);
      console.log(`📏 Dimensions: ${compressedResult.width}x${compressedResult.height}`);
      console.log(`📦 File size: ${(compressedResult.size / 1024).toFixed(1)} KB`);
      
      // Step 2: Get presigned URL with compressed file info
      const presignedData = await getPresignedURL({
        fileName: fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.jpg'), // Force JPEG extension
        contentType: 'image/jpeg',
        fileSize: compressedResult.size,
        mediaType,
      });

      // Step 3: Upload compressed file to R2
      await uploadFileFromURI(presignedData.uploadUrl, compressedResult.uri, 'image/jpeg');

      // Step 4: Confirm upload with compressed dimensions
      const confirmData = await confirmUpload({
        key: presignedData.key,
        mediaType,
        width: compressedResult.width,
        height: compressedResult.height,
        duration: dimensions?.duration,
      });

      return confirmData;
    } else {
      // For videos, use original upload flow (no compression yet)
      console.log('📹 Uploading video (no compression)...');
      
      // Get file size for video
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileSize = blob.size;
      
      // Step 1: Get presigned URL
      const presignedData = await getPresignedURL({
        fileName,
        contentType: 'video/mp4', // Assume mp4 for videos
        fileSize,
        mediaType,
      });

      // Step 2: Upload file to R2
      await uploadFileFromURI(presignedData.uploadUrl, uri, 'video/mp4');

      // Step 3: Confirm upload
      const confirmData = await confirmUpload({
        key: presignedData.key,
        mediaType,
        width: dimensions?.width,
        height: dimensions?.height,
        duration: dimensions?.duration,
      });

      return confirmData;
    }
  } catch (error) {
    console.error('Complete upload failed:', error);
    throw error;
  }
};

// Upload multiple files with automatic compression for photos
export const uploadMultipleFilesComplete = async (
  files: Array<{
    uri: string;
    fileName: string;
    mediaType: 'photo' | 'video';
    dimensions?: { width: number; height: number; duration?: number };
  }>
): Promise<UploadCompleteResponse[]> => {
  try {
    console.log(`📁 Processing ${files.length} files...`);
    
    const processedFiles: Array<{
      uri: string;
      fileName: string;
      contentType: string;
      fileSize: number;
      mediaType: 'photo' | 'video';
      dimensions?: { width: number; height: number; duration?: number };
    }> = [];

    // Step 1: Process each file (compress photos, get size for videos)
    for (const file of files) {
      if (file.mediaType === 'photo') {
        console.log(`🖼️ Compressing photo: ${file.fileName}`);
        
        const compressedResult = await smartCompress(file.uri);
        
        console.log(`📊 ${file.fileName}: ${(compressedResult.compressionRatio * 100).toFixed(1)}% reduction`);
        
        processedFiles.push({
          uri: compressedResult.uri,
          fileName: file.fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.jpg'),
          contentType: 'image/jpeg',
          fileSize: compressedResult.size,
          mediaType: file.mediaType,
          dimensions: {
            width: compressedResult.width,
            height: compressedResult.height,
            duration: file.dimensions?.duration,
          },
        });
      } else {
        // For videos, just get file size
        console.log(`📹 Processing video: ${file.fileName}`);
        
        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        processedFiles.push({
          uri: file.uri,
          fileName: file.fileName,
          contentType: 'video/mp4',
          fileSize: blob.size,
          mediaType: file.mediaType,
          dimensions: file.dimensions,
        });
      }
    }

    // Log total compression savings for photos
    const photoFiles = processedFiles.filter(f => f.mediaType === 'photo');
    if (photoFiles.length > 0) {
      const totalCompressedSize = photoFiles.reduce((sum, file) => sum + file.fileSize, 0);
      console.log(`💾 Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // Step 2: Get multiple presigned URLs
    const presignedData = await getMultiplePresignedURLs({
      files: processedFiles.map(file => ({
        fileName: file.fileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        mediaType: file.mediaType,
      })),
    });

    // Step 3: Upload all files to R2 in parallel
    const uploadPromises = processedFiles.map((file, index) => 
      uploadFileFromURI(presignedData.files[index].uploadUrl, file.uri, file.contentType)
    );
    await Promise.all(uploadPromises);

    // Step 4: Confirm all uploads
    const confirmPromises = processedFiles.map((file, index) => 
      confirmUpload({
        key: presignedData.files[index].key,
        mediaType: file.mediaType,
        width: file.dimensions?.width,
        height: file.dimensions?.height,
        duration: file.dimensions?.duration,
      })
    );
    const confirmResults = await Promise.all(confirmPromises);

    return confirmResults;
  } catch (error) {
    console.error('Multiple upload failed:', error);
    throw error;
  }
};

// Avatar-specific upload functions for registration
export const getAvatarTempURL = async (request: {
  fileName: string;
  contentType: string;
  fileSize: number;
}): Promise<PresignedURLResponse> => {
  const response = await fetch(`${BASE_URL}/upload/avatar/temp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Avatar upload URL generation failed' }));
    throw new Error(errorData.error || 'Failed to get avatar upload URL');
  }

  const data: StandardUploadResponse<PresignedURLResponse> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to get avatar upload URL');
  }

  return data.data!;
};

export const uploadAvatarComplete = async (
  uri: string,
  fileName: string = 'avatar.jpg'
): Promise<PresignedURLResponse> => {
  try {
    console.log('🖼️ Compressing avatar image...');
    
    // Step 1: Compress the image (standard behavior)
    const compressedResult = await compressAvatar(uri);
    
    console.log(`📊 Avatar compressed: ${(compressedResult.compressionRatio * 100).toFixed(1)}% size reduction`);
    console.log(`📏 Dimensions: ${compressedResult.width}x${compressedResult.height}`);
    console.log(`📦 File size: ${(compressedResult.size / 1024).toFixed(1)} KB`);
    
    // Step 2: Get presigned URL with compressed file info
    const presignedData = await getAvatarTempURL({
      fileName: fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.jpg'), // Force JPEG extension
      contentType: 'image/jpeg',
      fileSize: compressedResult.size,
    });

    // Step 3: Upload compressed file to R2
    await uploadFileFromURI(presignedData.uploadUrl, compressedResult.uri, 'image/jpeg');

    return presignedData;
  } catch (error) {
    console.error('Avatar upload failed:', error);
    throw error;
  }
};

export const cleanupTempAvatar = async (tempKey: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/upload/avatar/temp/${encodeURIComponent(tempKey)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Avatar cleanup failed' }));
    throw new Error(errorData.error || 'Failed to cleanup temporary avatar');
  }
};

// NOTE: Image compression is now standard behavior in all upload functions above
// This saves storage costs automatically without needing separate functions 