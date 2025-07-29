import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/User';
import { apiCall } from '@/utils/ApiCalls';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Configure the web browser for auth sessions
WebBrowser.maybeCompleteAuthSession();

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
  googleLogin: () => Promise<AuthResponse>;
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
      
      googleLogin: async () => {
        set({ isLoading: true });
        try {
          const discovery = {
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          };

          const redirectUri = AuthSession.makeRedirectUri({
            scheme: 'com.yertale.app', // Bu değeri app.json'da tanımlamanız gerekiyor
            path: 'auth',
          });

          const request = new AuthSession.AuthRequest({
            clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '', // Environment variable olarak tanımlanmalı
            scopes: ['openid', 'profile', 'email'],
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            state: 'random-state-string',
          });

          const result = await request.promptAsync(discovery);

          if (result.type === 'success' && result.params.code) {
            // Backend'e ID token gönder
            const response = await apiCall.post<AuthResponse>('/google-login', {
              code: result.params.code,
              redirect_uri: redirectUri,
            }, false);

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
          } else {
            set({ isLoading: false });
            throw new Error('Google authentication was cancelled or failed');
          }
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
        
        router.replace('/screens/Auth/Login/Login');
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
    // Sadece bir kere hydrate et
    hydrate();
  }, []); // Dependency array'i boş bırak
  
  return isLoggedIn;
};
