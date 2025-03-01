import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

const RegisterScreen = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [gender, setGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Date picker handlers
  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRegister();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const handleRegister = () => {
    console.log('Register with:', {
      email,
      firstName,
      lastName,
      username,
      birthDate,
      gender,
    });
    // Burada kayıt işlemini gerçekleştirebilirsiniz
  };

  // Validate current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return email.includes('@') && email.includes('.');
      case 2:
        return firstName.trim() !== '' && lastName.trim() !== '' && username.trim() !== '';
      case 3:
        return birthDate && gender !== '';
      default:
        return false;
    }
  };

  // Format date for display
  const formatDate = (date: any) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="flex-grow">
          <View className="flex-1 px-8 pb-10 pt-12">
            {/* Logo ve Başlık */}
            <View className="mb-8 items-center">
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-teal-600">
                <Ionicons name="person-add" size={36} color="white" />
              </View>
              <Text className="text-3xl font-bold text-white">Kayıt Ol</Text>
              <Text className="mt-3 text-center text-gray-400">
                {currentStep === 1 && 'Email adresinizi girin'}
                {currentStep === 2 && 'Kişisel bilgilerinizi girin'}
                {currentStep === 3 && 'Son adım! Biraz daha bilgi'}
              </Text>
            </View>

            {/* İlerleme Göstergesi */}
            <View className="mb-8 flex-row justify-between">
              {[...Array(totalSteps)].map((_, index) => (
                <View key={index} className="flex-1 items-center">
                  <View
                    className={`z-10 h-8 w-8 items-center justify-center rounded-full ${
                      index + 1 === currentStep
                        ? 'bg-teal-600'
                        : index + 1 < currentStep
                          ? 'bg-teal-800'
                          : 'bg-gray-800'
                    }`}>
                    {index + 1 < currentStep ? (
                      <Ionicons name="checkmark" size={18} color="white" />
                    ) : (
                      <Text className="font-bold text-white">{index + 1}</Text>
                    )}
                  </View>
                  {index < totalSteps - 1 && (
                    <View
                      className={`h-1 w-full ${
                        index + 1 < currentStep ? 'bg-teal-800' : 'bg-gray-800'
                      } absolute left-1/2 top-4 z-0`}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Adım 1: Email */}
            {currentStep === 1 && (
              <View className="mb-10 space-y-6">
                <View className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Email</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Email adresinizi girin"
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Adım 2: Ad, Soyad, Kullanıcı Adı */}
            {currentStep === 2 && (
              <View className="mb-10 gap-3 space-y-6">
                <View className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Ad</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Adınızı girin"
                      placeholderTextColor="#6B7280"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>

                <View className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Soyad</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Soyadınızı girin"
                      placeholderTextColor="#6B7280"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>

                <View className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Kullanıcı Adı</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="at-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Kullanıcı adınızı girin"
                      placeholderTextColor="#6B7280"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Adım 3: Doğum Tarihi ve Cinsiyet */}
            {currentStep === 3 && (
              <View className="mb-10 space-y-6">
                {/* Doğum Tarihi */}
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Doğum Tarihi</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                    <Text className="ml-3 flex-1 text-base text-white">
                      {formatDate(birthDate)}
                    </Text>
                  </View>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1920, 0, 1)}
                  />
                )}

                {/* Cinsiyet */}
                <View className="mt-3 rounded-xl border border-gray-800 bg-gray-900 px-5 py-3">
                  <Text className="mb-2 text-xs text-gray-400">Cinsiyet</Text>
                  <View className="mt-2 flex-row justify-between">
                    <TouchableOpacity
                      onPress={() => setGender('male')}
                      className={`items-center rounded-lg px-3 py-2 ${gender === 'male' ? 'bg-teal-700' : 'bg-gray-800'}`}>
                      <Ionicons
                        name="male-outline"
                        size={18}
                        color={gender === 'male' ? 'white' : '#9CA3AF'}
                      />
                      <Text
                        className={`text-xs ${gender === 'male' ? 'text-white' : 'text-gray-400'}`}>
                        Erkek
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setGender('female')}
                      className={`items-center rounded-lg px-3 py-2 ${gender === 'female' ? 'bg-teal-700' : 'bg-gray-800'}`}>
                      <Ionicons
                        name="female-outline"
                        size={18}
                        color={gender === 'female' ? 'white' : '#9CA3AF'}
                      />
                      <Text
                        className={`text-xs ${gender === 'female' ? 'text-white' : 'text-gray-400'}`}>
                        Kadın
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setGender('other')}
                      className={`items-center rounded-lg px-3 py-2 ${gender === 'other' ? 'bg-teal-700' : 'bg-gray-800'}`}>
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color={gender === 'other' ? 'white' : '#9CA3AF'}
                      />
                      <Text
                        className={`text-xs ${gender === 'other' ? 'text-white' : 'text-gray-400'}`}>
                        Diğer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Navigasyon Butonları */}
            <View className="mb-10 flex-row gap-3 space-x-4">
              {currentStep > 1 && (
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-gray-800 py-4"
                  onPress={goToPreviousStep}>
                  <Text className="text-lg font-bold text-white">Geri</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className={`flex-1 items-center rounded-xl py-4 ${
                  isCurrentStepValid() ? 'bg-teal-600' : 'bg-gray-700'
                }`}
                onPress={goToNextStep}
                disabled={!isCurrentStepValid()}>
                <Text className="text-lg font-bold text-white">
                  {currentStep < totalSteps ? 'Devam' : 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Giriş Yap Yönlendirmesi */}
            <View className="flex-row justify-center pt-2">
              <Text className="text-gray-400">Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="font-medium text-teal-400">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
