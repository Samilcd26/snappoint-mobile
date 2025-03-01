import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import '../global.css';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace('/Auth/Login');
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 p-4">
        <Text className="text-xl font-bold text-white mb-4">Oturum açılmamış</Text>
        <TouchableOpacity
          className="bg-blue-600 py-3 px-6 rounded-lg"
          onPress={() => router.replace('/Auth/Login')}
        >
          <Text className="text-white font-semibold">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <View className="bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-2xl font-bold text-white mb-2">Hoş Geldiniz, {user?.name}</Text>
          <Text className="text-gray-300 mb-4">Email: {user?.email}</Text>
          <Text className="text-gray-300 mb-4">Rol: {user?.role}</Text>
          
          <TouchableOpacity
            className="bg-red-600 py-3 px-6 rounded-lg self-start mt-4"
            onPress={handleLogout}
          >
            <Text className="text-white font-semibold">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
