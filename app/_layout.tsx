import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReduxProvider } from '../providers/ReduxProvider';
import { AuthCheck } from '../components/AuthCheck';
import Toast from 'react-native-toast-message';
import '../global.css';

export default function RootLayout() {
  return (
    <ReduxProvider>
      <StatusBar style="light" />
      <AuthCheck>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#111827', // bg-gray-900
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#111827', // bg-gray-900
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Ana Sayfa',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Auth/Login/index"
            options={{
              title: 'Giriş Yap',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Auth/Register/index"
            options={{
              title: 'Kayıt Ol',
              headerShown: false,
            }}
          />
        </Stack>
      </AuthCheck>
      <Toast />
    </ReduxProvider>
  );
} 