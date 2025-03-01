import { LoginResponse } from '../types/api.response';
import { UserProfile } from '../types/user.type';
import { apiCall } from '../utils/ApiCalls';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return await apiCall.post<LoginResponse>(
    '/login',
    {
      email,
      password,
    },
    false
  );
};

export const refresh_token = async (refresh_token: string): Promise<LoginResponse> => {
  return await apiCall.post<LoginResponse>(
    '/refresh-token',
    { refresh_token },
  );
};

export const getUserInfo = async (): Promise<UserProfile> => {
  return await apiCall.post('/user-info');
};
