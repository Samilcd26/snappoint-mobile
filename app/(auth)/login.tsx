import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email.trim()) {
      setEmailError('Email alanı zorunludur');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir email adresi giriniz');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Şifre alanı zorunludur');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await dispatch(loginUser({ email, password }));
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // Implement forgot password functionality
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-8 pt-10 pb-10">
            {/* Logo ve Başlık */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-teal-600 rounded-full items-center justify-center mb-6">
                <Ionicons name="lock-closed" size={44} color="white" />
              </View>
              <Text className="text-3xl font-bold text-white">Hoş Geldiniz</Text>
              <Text className="text-gray-400 text-center mt-3">
                Hesabınıza giriş yaparak devam edin
              </Text>
            </View>

            {/* Error message */}
            {error && (
              <View className="bg-red-900/30 p-3 rounded-lg mb-4 border border-red-700">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            )}

            {/* Giriş Formu */}
            <View className="space-y-6 mb-10 gap-3">
              {/* Email Input */}
              <View className="bg-gray-800 rounded-xl px-5 py-3 border border-gray-700">
                <Text className="text-xs text-gray-400 mb-2">Email</Text>
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Email adresinizi girin"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? <Text className="text-red-500 text-xs mt-1">{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View className="bg-gray-800 rounded-xl px-5 py-3 border border-gray-700">
                <Text className="text-xs text-gray-400 mb-1">Şifre</Text>
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Şifrenizi girin"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text className="text-red-500 text-xs mt-1">{passwordError}</Text> : null}
              </View>

              {/* Şifremi Unuttum */}
              <TouchableOpacity 
                className="self-end py-2" 
                onPress={handleForgotPassword}
              >
                <Text className="text-teal-400 font-medium">Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>

            {/* Giriş Butonu */}
            <TouchableOpacity 
              className={`bg-teal-600 py-4 rounded-xl items-center mb-10 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Sosyal Medya Girişleri */}
            <View className="mb-10">
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-0.5 bg-gray-800" />
                <Text className="mx-4 text-gray-400">veya</Text>
                <View className="flex-1 h-0.5 bg-gray-800" />
              </View>

              <View className="flex-row justify-center space-x-6 gap-3">
                <TouchableOpacity className="w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
                  <Ionicons name="logo-google" size={26} color="#EA4335" />
                </TouchableOpacity>
                <TouchableOpacity className="w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
                  <Ionicons name="logo-apple" size={26} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity className="w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
                  <Ionicons name="logo-facebook" size={26} color="#1877F2" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Kayıt Ol */}
            <View className="flex-row justify-center pt-2">
              <Text className="text-gray-400">Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text className="text-teal-400 font-medium">Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 