export interface PresignedURLRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  mediaType: 'photo' | 'video';
}

export interface PresignedURLResponse {
  uploadUrl: string;
  fileUrl: string;
  thumbnailUrl?: string;
  key: string;
  expiresIn: number;
}

export interface MultipleUploadRequest {
  files: PresignedURLRequest[];
}

export interface MultipleUploadResponse {
  files: PresignedURLResponse[];
}

export interface UploadCompleteRequest {
  key: string;
  mediaType: 'photo' | 'video';
  width?: number;
  height?: number;
  duration?: number;
}

export interface UploadCompleteResponse {
  key: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mediaType: 'photo' | 'video';
  uploadedBy: number;
  uploadedAt: string;
}

export interface StandardUploadResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
} 