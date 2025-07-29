import { User } from '@/types/User';
import { apiCall } from '@/utils/ApiCalls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useShowToast } from '@/utils/Toast';
import { router } from 'expo-router';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  success: boolean;
  token_type: string;
  user: {
    email: string;
    id: number;
    profilePicture: string;
    username: string;
  }
}

export const useLogin = () => {
  const { showToast } = useShowToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiCall.post<AuthResponse>('/login', { email, password }, false);
      return response;
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      showToast({
        description: 'Login successful',
        action: 'success',
      });
      // Refetch user info
      await queryClient.refetchQueries({ queryKey: ['userInfo'] });
      // Navigate to tabs
      router.replace('/(tabs)');
    },
  });
};

export const useVerifyEmail = () => {
  const { showToast } = useShowToast();
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await apiCall.post<{ success: boolean; message: string; user_id?: number }>('/verify-email', { email }, false);
      return response;
    },
    onError: (error: any) => {
      showToast({
        description: error?.error || 'Email verification failed',
        action: 'error',
      });
    },
  });
};

export const useRegisterEmailCheck = () => {
  const { showToast } = useShowToast();
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await apiCall.post<{ 
        success: boolean; 
        message: string; 
        available: boolean;
        error?: string;
      }>('/register/check-email', { email }, false);
      return response;
    },
    onError: (error: any) => {
      console.log(error.response.data);
      showToast({
        description: error?.error || 'Email check failed',
        action: 'error',
      });
    },
  });
};

export const useRegisterUsernameCheck = () => {
  const { showToast } = useShowToast();
  return useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const response = await apiCall.post<{ 
        success: boolean; 
        message: string; 
        available: boolean;
        error?: string;
      }>('/register/check-username', { username }, false);
      return response;
    },
    onError: (error: any) => {
      console.log(error.response.data);
      showToast({
        description: error?.error || 'Username check failed',
        action: 'error',
      });
    },
  });
};

export const useRegister = () => {
  const { showToast } = useShowToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender?: string;
      birthday?: string;
      phone?: string;
      avatar?: string;
      avatarTempKey?: string;
    }) => {
      const response = await apiCall.post<{ success: boolean; message: string; user: any }>('/register', userData, false);
      return response;
    },
    onSuccess: (data) => {
      showToast({
        description: 'Registration successful! Please login.',
        action: 'success',
      });
      router.replace('/screens/Auth/Login/Login');
    },
    onError: (error: any) => {
      showToast({
        description: error?.error || 'Registration failed',
        action: 'error',
      });
    },
  });
};

export const useGetUserInfo = () => {
  const query = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const {success, user} = await apiCall.get<{ success: boolean; user: User }>('/profile');
      
      if (!success) {
        throw new Error('Failed to fetch user info');
      }
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    },
    staleTime: 1000 * 60 * 10, // 10 dakika
    gcTime: 1000 * 60 * 30, // 30 dakika
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return query;
};

// ... diğer auth methodları buraya eklenebilir
