import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/User';
import { apiCall } from '@/utils/ApiCalls';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  success: boolean;
  token_type: string;
  user: User;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  getUser: () => User | null;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiCall.post<AuthResponse>('/login', { email, password }, false);
          
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoggedIn: true,
            isLoading: false
          });
          
          await AsyncStorage.setItem('access_token', response.access_token);
          await AsyncStorage.setItem('refresh_token', response.refresh_token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false
        });
        
        router.replace('/login');
      },
      
      setUser: (user) => set({ user, isLoggedIn: true }),
      
      getUser: () => get().user,
      
      hydrate: async () => {
        try {
          const [userJson, accessToken, refreshToken] = await Promise.all([
            AsyncStorage.getItem('user'),
            AsyncStorage.getItem('access_token'),
            AsyncStorage.getItem('refresh_token')
          ]);
          
          if (userJson && accessToken && refreshToken) {
            const user = JSON.parse(userJson);
            set({
              user,
              accessToken,
              refreshToken,
              isLoggedIn: true
            });
          }
        } catch (error) {
          console.error('Error hydrating auth state:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
);

// Hook to check authentication status
export const useAuthCheck = () => {
  const { isLoggedIn, hydrate } = useAuthStore();
  
  useEffect(() => {
    if (!isLoggedIn) {
      hydrate();
    }
  }, [isLoggedIn, hydrate]);
  
  return isLoggedIn;
};
