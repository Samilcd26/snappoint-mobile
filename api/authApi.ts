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
  const showToast = useShowToast();
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
        title: 'Success',
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
  });

  return query;
};

// ... diğer auth methodları buraya eklenebilir
