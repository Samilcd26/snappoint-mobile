import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://192.168.1.36:8080/api";

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
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: contentType,
    name: 'upload.' + contentType.split('/')[1],
  } as any);

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage');
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

// Complete upload flow: get URL, upload file, confirm
export const uploadFileComplete = async (
  uri: string,
  fileName: string,
  contentType: string,
  mediaType: 'photo' | 'video',
  fileSize: number,
  dimensions?: { width: number; height: number; duration?: number }
): Promise<UploadCompleteResponse> => {
  try {
    // Step 1: Get presigned URL
    const presignedData = await getPresignedURL({
      fileName,
      contentType,
      fileSize,
      mediaType,
    });

    // Step 2: Upload file to R2
    await uploadFileFromURI(presignedData.uploadUrl, uri, contentType);

    // Step 3: Confirm upload
    const confirmData = await confirmUpload({
      key: presignedData.key,
      mediaType,
      width: dimensions?.width,
      height: dimensions?.height,
      duration: dimensions?.duration,
    });

    return confirmData;
  } catch (error) {
    console.error('Complete upload failed:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleFilesComplete = async (
  files: Array<{
    uri: string;
    fileName: string;
    contentType: string;
    mediaType: 'photo' | 'video';
    fileSize: number;
    dimensions?: { width: number; height: number; duration?: number };
  }>
): Promise<UploadCompleteResponse[]> => {
  try {
    // Step 1: Get multiple presigned URLs
    const presignedData = await getMultiplePresignedURLs({
      files: files.map(file => ({
        fileName: file.fileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        mediaType: file.mediaType,
      })),
    });

    // Step 2: Upload all files to R2 in parallel
    const uploadPromises = files.map((file, index) => 
      uploadFileFromURI(presignedData.files[index].uploadUrl, file.uri, file.contentType)
    );
    await Promise.all(uploadPromises);

    // Step 3: Confirm all uploads
    const confirmPromises = files.map((file, index) => 
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