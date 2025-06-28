import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetUser } from '@/api/userApi';
import { useAuthStore } from '@/stores';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId: string;
  }>();
  
  const { user: authUser } = useAuthStore();
  const { data: userData, isLoading } = useGetUser(Number(params.userId));
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    email: '',
    phone: '',
    avatar: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  React.useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [userData]);
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        avatar: result.assets[0].uri
      }));
    }
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // TODO: API call to update user profile
      console.log('Updating profile with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Başarılı', 'Profiliniz güncellendi!', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !userData?.data) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }
  
  const user = userData.data;
  
  // Check if this is user's own profile
  if (!user.isOwnProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Bu profili düzenleyemezsiniz.</Text>
        <Button variant="outline" onPress={() => router.back()} className="mt-4">
          <ButtonText>Geri Dön</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Profili Düzenle</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text className="text-blue-600 font-semibold">
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-4">
          {/* Profile Picture Section */}
          <View className="items-center py-6">
            <TouchableOpacity onPress={pickImage}>
              <View className="relative">
                <Image 
                  source={{ uri: formData.avatar || user.avatar }}
                  className="w-24 h-24 rounded-full bg-gray-200"
                />
                <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </View>
            </TouchableOpacity>
            <Text className="text-blue-600 font-medium mt-2">Fotoğrafı Değiştir</Text>
          </View>
          
          {/* Form Fields */}
          <VStack space="md">
            {/* First Name */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Ad</Text>
              <Input variant="outline">
                <InputField
                  placeholder="Adınız"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                />
              </Input>
            </View>
            
            {/* Last Name */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Soyad</Text>
              <Input variant="outline">
                <InputField
                  placeholder="Soyadınız"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                />
              </Input>
            </View>
            
            {/* Username */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Kullanıcı Adı</Text>
              <Input variant="outline">
                <InputField
                  placeholder="Kullanıcı adınız"
                  value={formData.username}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                  autoCapitalize="none"
                />
              </Input>
            </View>
            
            {/* Bio */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Biyografi</Text>
              <Input variant="outline">
                <InputField
                  placeholder="Kendinizi tanıtın..."
                  value={formData.bio}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </Input>
            </View>
            
            {/* Email */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">E-posta</Text>
              <Input variant="outline">
                <InputField
                  placeholder="E-posta adresiniz"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            </View>
            
            {/* Phone */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Telefon</Text>
              <Input variant="outline">
                <InputField
                  placeholder="Telefon numaranız"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </Input>
            </View>
          </VStack>
          
          {/* Account Information */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</Text>
            <VStack space="sm">
              <HStack className="justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-700">E-posta Doğrulama</Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={user.emailVerified ? "checkmark-circle" : "close-circle"} 
                    size={18} 
                    color={user.emailVerified ? "#22c55e" : "#ef4444"} 
                  />
                  <Text className={`ml-1 ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
                  </Text>
                </View>
              </HStack>
              
              <HStack className="justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-700">Telefon Doğrulama</Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={user.phoneVerified ? "checkmark-circle" : "close-circle"} 
                    size={18} 
                    color={user.phoneVerified ? "#22c55e" : "#ef4444"} 
                  />
                  <Text className={`ml-1 ${user.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.phoneVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
                  </Text>
                </View>
              </HStack>
              
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-700">Toplam Puan</Text>
                <Text className="text-blue-600 font-semibold">{user.totalPoints}</Text>
              </HStack>
            </VStack>
          </View>
          
          {/* Save Button */}
          <Button 
            action="primary" 
            variant="solid" 
            size="lg" 
            onPress={handleSave}
            disabled={isSubmitting}
            className="mt-6"
          >
            <ButtonText>
              {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </ButtonText>
          </Button>
          
          {/* Bottom spacing */}
          <View className="h-8" />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
} 