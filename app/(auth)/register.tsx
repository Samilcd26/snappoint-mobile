import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form validation states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    // Name validation
    if (!name.trim()) {
      setNameError('Ad Soyad alanı zorunludur');
      isValid = false;
    } else {
      setNameError('');
    }
    
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
    
    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      setIsLoading(true);
      // Implement registration logic here
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(auth)/login');
      }, 2000);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-8 pt-10 pb-10">
            {/* Başlık */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-teal-600 rounded-full items-center justify-center mb-6">
                <Ionicons name="person-add" size={44} color="white" />
              </View>
              <Text className="text-3xl font-bold text-white">Hesap Oluştur</Text>
              <Text className="text-gray-400 text-center mt-3">
                Yeni bir hesap oluşturarak başlayın
              </Text>
            </View>

            {/* Kayıt Formu */}
            <View className="space-y-4 mb-8">
              {/* Ad Soyad Input */}
              <View className="bg-gray-800 rounded-xl px-5 py-3 border border-gray-700">
                <Text className="text-xs text-gray-400 mb-2">Ad Soyad</Text>
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Adınızı ve soyadınızı girin"
                    placeholderTextColor="#6B7280"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setNameError('');
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {nameError ? <Text className="text-red-500 text-xs mt-1">{nameError}</Text> : null}
              </View>

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

              {/* Confirm Password Input */}
              <View className="bg-gray-800 rounded-xl px-5 py-3 border border-gray-700">
                <Text className="text-xs text-gray-400 mb-1">Şifre Tekrar</Text>
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Şifrenizi tekrar girin"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                  />
                </View>
                {confirmPasswordError ? <Text className="text-red-500 text-xs mt-1">{confirmPasswordError}</Text> : null}
              </View>
            </View>

            {/* Kayıt Butonu */}
            <TouchableOpacity 
              className={`bg-teal-600 py-4 rounded-xl items-center mb-8 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* Giriş Yap */}
            <View className="flex-row justify-center pt-2">
              <Text className="text-gray-400">Zaten bir hesabınız var mı? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className="text-teal-400 font-medium">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 