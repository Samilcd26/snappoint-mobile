// Genel API Response Interface'leri

export interface BaseResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
}

// Success response için generic interface
export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
  message?: string;
}

// Error response için interface
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Union type - API'den gelebilecek tüm response tiplerini kapsar
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Pagination için ek interface
export interface PaginatedResponse<T = any> extends SuccessResponse<T[]> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// List response için
export interface ListResponse<T = any> extends SuccessResponse<T[]> {
  data: T[];
  count: number;
} 