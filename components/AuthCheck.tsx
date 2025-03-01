import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadUserFromStorage } from '../store/slices/authSlice';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    async function checkAuth() {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace('/');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-white">Oturum kontrol ediliyor...</Text>
      </View>
    );
  }

  return <>{children}</>;
} 