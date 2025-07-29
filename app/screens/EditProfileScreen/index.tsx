import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image , Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { useGetUser,  useUpdateUserProfile } from '@/api/userApi';
import { useAuthStore } from '@/stores';
import * as ImagePicker from 'expo-image-picker';
import { LoaderOne } from '@/components/ui/LoaderOne';
import { uploadAvatarComplete } from '@/api/uploadApi';
import { useShowToast } from '@/utils/Toast';
import { useTranslation } from '@/utils/useTranslation';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useShowToast();
  const { user: currentUser } = useAuthStore();
  
  const { data: userData, isLoading, error } = useGetUser(currentUser?.id!);
  const updateUserProfileMutation = useUpdateUserProfile();
  

  
  // Kullanıcı giriş yapmamışsa hata göster
  if (!currentUser?.id) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-red-600 mb-4">{t('editProfile.pleaseLogin')}</Text>
        <Button variant="outline" onPress={() => router.back()} className="mt-4">
          <ButtonText>{t('editProfile.goBack')}</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    email: '',
    phone: '',
    avatar: '',
    avatarTempKey: '',
  });
  
  const [avatarUri, setAvatarUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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
        avatarTempKey: '',
      });
      setAvatarUri(user.avatar || '');
    }
  }, [userData]);
  
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        description: t('editProfile.galleryPermissionRequired'),
        action: 'error',
      });
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        description: t('editProfile.cameraPermissionRequired'),
        action: 'error',
      });
      return false;
    }
    return true;
  };

  const handleImagePicker = () => {
    Alert.alert(
      t('editProfile.selectProfilePhoto'),
      t('editProfile.selectPhotoDescription'),
      [
        {
          text: t('editProfile.camera'),
          onPress: handleCamera,
        },
        {
          text: t('editProfile.gallery'),
          onPress: handleGallery,
        },
        {
          text: t('editProfile.cancel'),
          style: "cancel",
        },
      ]
    );
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      await uploadImage(asset);
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      await uploadImage(asset);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);
      
      const fileName = `avatar_${Date.now()}.jpg`;
      
      console.log('📤 Avatar yükleniyor...');
      
      const uploadResult = await uploadAvatarComplete(
        asset.uri,
        fileName
      );

      console.log('✅ Avatar yüklendi', uploadResult);
      console.log('🔑 Avatar key:', uploadResult.key);
      console.log('🔗 Avatar fileUrl:', uploadResult.fileUrl);
      console.log('📋 Upload result full object:', JSON.stringify(uploadResult, null, 2));

      // Geçici avatar URL'ini göster
      setAvatarUri(uploadResult.fileUrl);
      // Sadece avatarTempKey gönder, avatar alanını boş bırak (backend'te kalıcı URL oluşturulacak)
      const newFormData = { 
        ...formData, 
        avatar: '', // Geçici URL'i gönderme
        avatarTempKey: uploadResult.key // Geçici key'i gönder
      };
      console.log('📝 FormData güncelleniyor:', newFormData);
      setFormData(newFormData);
      
      showToast({
        description: t('editProfile.profilePhotoUploadSuccess'),
        action: 'success',
      });
    } catch (error: any) {
      console.error('❌ Avatar yükleme hatası:', error);
      showToast({
        description: error.message || t('editProfile.profilePhotoUploadError'),
        action: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      console.log('Profil güncelleniyor:', formData);
      
      // Tüm string alanları trimle
      const trimmedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar,
        avatarTempKey: formData.avatarTempKey,
      };
      
      // Validation kontrolü
      if (trimmedData.username && trimmedData.username.length < 3) {
        showToast({
          description: t('editProfile.usernameMinLength'),
          action: 'error',
        });
        return;
      }
      
      if (trimmedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
        showToast({
          description: t('editProfile.emailInvalid'),
          action: 'error',
        });
        return;
      }
      
      if (trimmedData.phone && !/^[\d\s\-\+\(\)]+$/.test(trimmedData.phone)) {
        showToast({
          description: t('editProfile.phoneInvalid'),
          action: 'error',
        });
        return;
      }
      
      // Sadece boş olmayan alanları gönder
      const updateData = Object.fromEntries(
        Object.entries(trimmedData).filter(([_, value]) => value && value !== '')
      );
      
      console.log('📤 Gönderilecek veriler:', updateData);
      console.log('📋 FormData tam hali:', trimmedData);
      
      // Gerçek API çağrısı
      const response = await updateUserProfileMutation.mutateAsync(updateData);
      
      console.log('Profil güncellendi:', response);
      
      // API response'unu kontrol et - success false ise hata göster
      if (response && (response as any).success === false) {
        // API'den hata mesajı geldi
        const errorMessage = (response as any).error || t('editProfile.profileUpdateError');
        showToast({
          description: errorMessage,
          action: 'error',
        });
        return;
      }
      
      // Başarılı güncelleme
      showToast({
        description: t('editProfile.profileUpdateSuccess'),
        action: 'success',
      });
      
      router.back();
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      
      // Hata response'unu kontrol et
      let errorMessage = t('editProfile.profileUpdateError');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.success === false) {
          errorMessage = errorData.error || errorData.message || t('editProfile.profileUpdateError');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        description: errorMessage,
        action: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <LoaderOne 
        title={t('editProfile.loadingProfile')} 
        subtitle={t('editProfile.pleaseWait')}
        showGradient={true}
      />
    );
  }

  if (error || !userData?.data) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-red-600 mb-4">
          {error ? t('editProfile.profileLoadError') : t('editProfile.profileNotFound')}
        </Text>
        <Button variant="outline" onPress={() => router.back()} className="mt-4">
          <ButtonText>{t('editProfile.goBack')}</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }
  
  const user = userData.data;
  
  // Additional safety check
  if (!user) {
    return (
      <LoaderOne 
        title={t('editProfile.loadingProfile')} 
        subtitle={t('editProfile.pleaseWait')}
        showGradient={true}
      />
    );
  }
  
  // Check if this is user's own profile
  if (!user.isOwnProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-700 mb-4">{t('editProfile.cannotEditProfile')}</Text>
        <Button variant="outline" onPress={() => router.back()} className="mt-4">
          <ButtonText>{t('editProfile.goBack')}</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }
  
  return (
    <>
      <SafeAreaView className="flex-1 bg-white pt-10">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">{t('editProfile.title')}</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSubmitting || isUploading}
          >
            <Text className="text-blue-600 font-semibold">
              {isSubmitting ? t('editProfile.saving') : t('editProfile.save')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView className="flex-1">
          <VStack space="lg" className="p-4">
            {/* Profile Picture Section */}
            <View className="items-center py-6">
              <TouchableOpacity onPress={handleImagePicker} disabled={isUploading}>
                <View className="relative">
                  <Image 
                    source={{ uri: avatarUri || user?.avatar || '' }}
                    className="w-24 h-24 rounded-full bg-gray-200"
                  />
                  <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
              <Pressable onPress={handleImagePicker} disabled={isUploading}>
                <Text className="text-blue-600 font-medium mt-2">
                  {isUploading ? t('editProfile.uploading') : t('editProfile.changePhoto')}
                </Text>
              </Pressable>
            </View>
            
            {/* Form Fields */}
            <VStack space="md">
              {/* First Name */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.firstName')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.firstNamePlaceholder')}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
              
              {/* Last Name */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.lastName')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.lastNamePlaceholder')}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
              
              {/* Username */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.username')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.usernamePlaceholder')}
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    autoCapitalize="none"
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
              
              {/* Bio */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.bio')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.bioPlaceholder')}
                    value={formData.bio}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
              
              {/* Email */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.email')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.emailPlaceholder')}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
              
              {/* Phone */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">{t('editProfile.phone')}</Text>
                <Input variant="outline" className="bg-gray-50 border-gray-200">
                  <InputField
                    placeholder={t('editProfile.phonePlaceholder')}
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </View>
            </VStack>
        

            {/* Bottom spacing */}
            <View className="h-8" />
          </VStack>
        </ScrollView>
      </SafeAreaView>
      
      {/* Loading Overlay */}
      {isSubmitting && (
        <LoaderOne 
          title={t('editProfile.loadingProfile')} 
          subtitle={t('editProfile.pleaseWait')}
          showGradient={true}
        />
      )}
    </>
  );
} 