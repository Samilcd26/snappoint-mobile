export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  success: boolean;
  message?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  success: boolean;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
} 