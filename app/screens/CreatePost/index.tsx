import React, { useState, useRef, useEffect } from 'react';
import { View,  TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform, FlatList, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useShowToast } from '@/utils/Toast';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Marker } from '@/types/Marker';
import { useCreatePost } from '@/api/postApi';
import { Switch } from "@/components/ui/switch"
import { Text } from '@/components/ui/text';
import { CreatePostRequest } from '@/types/post.types';
import { uploadMultipleFilesComplete } from '@/api/uploadApi';
import { useTranslation } from '@/utils/useTranslation';

export default function CreatePostScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  // Get location params from URL if available
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    placeId: string;
    pointValue: string;
  }>();

  
  
  const [postRequest, setPostRequest] = useState<CreatePostRequest>({
    postCaption: '',
    mediaItems: [],
    placeId: parseInt(params.placeId) || 0,
    latitude: parseFloat(params.latitude) || 0,
    longitude: parseFloat(params.longitude) || 0,
    isPublic: true,
    allowComments: true,
  });
  
  const [location, setLocation] = useState<Marker | null>(null);
  
  const MAX_IMAGES = 10;
  
  // Set location from params if available
  useEffect(() => {
    if (params.latitude && params.longitude && params.placeId) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      const pointValue = params.pointValue ? parseInt(params.pointValue) : 50;
      
      // Only update if we have valid coordinates and they're different from current location
      if (!isNaN(lat) && !isNaN(lng) && 
          (location?.latitude !== lat || location?.longitude !== lng)) {
        const marker: Marker = {
          id: parseInt(params.placeId),
          latitude: lat,
          longitude: lng,
          point_value: pointValue,
          is_verified: false,
          distance: 0,
          post_radius: 100,
          coverage_area: 100,
          radius_type: 'small',
          radius_description: 'Within posting range'
        };
        setLocation(marker);
        setPostRequest(prev => ({
          ...prev,
          placeId: parseInt(params.placeId),
          latitude: lat,
          longitude: lng
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.latitude, params.longitude, params.placeId, params.pointValue]);
  
  const captionInputRef = useRef<TextInput>(null);
  const maxCaptionLength = 150;

  // Request permissions for camera and media library
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        showToast({
          description: t('createPost.permissionsDescription'),
          action: 'warning'
        });
        return false;
      }
      return true;
    }
    return true;
  };

  // Take a photo with camera
  const takePhoto = async () => {
    if (imageUris.length >= MAX_IMAGES) {
      showToast({
        description: t('createPost.maximumImagesDescription'),
        action: 'warning'
      });
      return;
    }
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5], // 4:5 oranı
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = [...imageUris, result.assets[0].uri];
        setImageUris(newImageUris);
        updateMediaItems(newImageUris);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast({
        description: t('createPost.failedToTakePhoto'),
        action: 'error'
      });
    }
  };

  // Update media items when images change
  const updateMediaItems = (uris: string[]) => {
    const mediaItems = uris.map(uri => ({
      mediaType: 'photo' as const,
      mediaUrl: uri,
      width: 864, // 4:5 oranı (864x1080)
      height: 1080, // 4:5 oranı
      duration: 0,
      altText: '',
      tags: []
    }));
    
    setPostRequest(prev => ({
      ...prev,
      mediaItems
    }));
  };

  // Pick multiple images from gallery
  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - imageUris.length,
        allowsEditing: true,
        aspect: [4, 5], // 4:5 oranı
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        
        if (imageUris.length + newUris.length > MAX_IMAGES) {
          showToast({
            description: t('createPost.tooManyImagesDescription'),
            action: 'warning'
          });
          
          // Only add up to the maximum allowed
          const allowedNewUris = newUris.slice(0, MAX_IMAGES - imageUris.length);
          const updatedUris = [...imageUris, ...allowedNewUris];
          setImageUris(updatedUris);
          updateMediaItems(updatedUris);
        } else {
          const updatedUris = [...imageUris, ...newUris];
          setImageUris(updatedUris);
          updateMediaItems(updatedUris);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      showToast({
        description: t('createPost.failedToSelectImages'),
        action: 'error'
      });
    }
  };
  
  // Remove an image
  const removeImage = (index: number) => {
    const newImageUris = [...imageUris];
    newImageUris.splice(index, 1);
    setImageUris(newImageUris);
    updateMediaItems(newImageUris);
  };

  // Handle caption input
  const handleCaptionChange = (text: string) => {
    if (text.length <= maxCaptionLength) {
      setPostRequest(prev => ({
        ...prev,
        postCaption: text
      }));
    }
  };

 

  const createPostMutation = useCreatePost();

  // Submit the post
  const handleSubmitPost = async () => {
   
    if (imageUris.length === 0) {
      showToast({
        description: t('createPost.imageRequiredDescription'),
        action: 'warning'
      });
      return;
    }

    if (!location) {
      showToast({
        description: t('createPost.locationRequiredDescription'),
        action: 'warning'
      });
      return;
    }

    // Validate required fields
    if (!postRequest.placeId || postRequest.placeId === 0) {
      showToast({
        description: t('createPost.invalidLocationDescription'),
        action: 'error'
      });
      return;
    }

    if (!postRequest.latitude || !postRequest.longitude) {
      showToast({
        description: t('createPost.invalidCoordinatesDescription'),
        action: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload all images to Cloudflare R2
      showToast({
        description: t('createPost.uploadingDescription'),
        action: 'info',
        duration:900
      });

      const uploadPromises = imageUris.map(async (uri, index) => {
        return uploadMultipleFilesComplete([{
          uri,
          fileName: `image_${Date.now()}_${index}.jpg`,
          mediaType: 'photo',
          dimensions: { width: 864, height: 1080 } // 4:5 oranı
        }]);
      });

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedFiles = uploadResults.flat();

      console.log('📤 Uploaded files:', uploadedFiles);

      // Validate uploaded files
      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('No files were uploaded successfully');
      }

      // Check if all uploaded files have valid URLs
      const invalidFiles = uploadedFiles.filter(file => !file.fileUrl || file.fileUrl.trim() === '');
      if (invalidFiles.length > 0) {
        throw new Error('Some files failed to upload properly');
      }

      // Update post request with uploaded file URLs
      const updatedPostRequest = {
        ...postRequest,
        postCaption: postRequest.postCaption || '',
        mediaItems: uploadedFiles.map((file, index) => ({
          mediaType: 'photo' as const,
          mediaUrl: file.fileUrl,
          width: 864,
          height: 1080, // 4:5 oranı
          duration: 0,
          altText: '',
          tags: []
        }))
      };

      console.log('📤 Sending post request:', JSON.stringify(updatedPostRequest, null, 2));

      // Validate final request structure
      if (!updatedPostRequest.mediaItems || updatedPostRequest.mediaItems.length === 0) {
        throw new Error('No valid media items to post');
      }

      // Create the post using our mutation
      const newPost = await createPostMutation.mutateAsync(updatedPostRequest);
      
      showToast({
        description: t('createPost.successDescription'),
        action: 'success'
      });
      
      // Navigate back or to the home screen
      router.back();
    } catch (error: any) {
      console.error('❌ Error creating post:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to upload images or create post. Please try again.';
      
      if (error.response?.status === 400) {
        const backendError = error.response?.data?.error;
        if (backendError) {
          errorMessage = `Validation error: ${backendError}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        description: errorMessage,
        action: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">{t('createPost.title')}</Text>
            <TouchableOpacity 
              onPress={handleSubmitPost} 
              disabled={imageUris.length === 0 || isLoading}
              className={`p-3 rounded-lg ${(imageUris.length === 0 || isLoading) ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-blue-600 font-semibold ml-2">{t('createPost.share')}</Text>
                  <Ionicons name="send" size={20} color="#3b82f6" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Preview Area */}
        {imageUris.length > 0 ? (
          <View className="w-full">
            <FlatList
              data={imageUris}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `image-${index}`}
              snapToInterval={Dimensions.get('window').width}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={({ item, index }) => {
                const screenWidth = Dimensions.get('window').width;
                const imageWidth = screenWidth - 32; // 16px padding on each side
                const imageHeight = (imageWidth * 5) / 4; // 4:5 ratio
                
                return (
                  <View className="relative" style={{ width: screenWidth, paddingHorizontal: 16 }}>
                    <Image 
                      source={{ uri: item }} 
                      style={{ width: imageWidth, height: imageHeight }}
                      resizeMode="cover" 
                      className="bg-gray-100 rounded-lg"
                    />
                    <TouchableOpacity 
                      onPress={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                    >
                      <Ionicons name="close" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <View className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 shadow-sm">
                      <Text className="text-blue-600 font-semibold">{index + 1}/{imageUris.length}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        ) : (
          <View className="items-center justify-center p-8 bg-gray-50 mx-4 my-4 rounded-lg" style={{ minHeight: 300 }}>
            <Ionicons name="images-outline" size={80} color="#3b82f6" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              {t('createPost.selectImages')} {MAX_IMAGES} {t('createPost.imagesForPost')}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              4:5 aspect ratio
            </Text>
          </View>
        )}

        {/* Image Selection Buttons */}
        <View className="p-4 bg-white">
          <View className="flex-row justify-center space-x-4 gap-4">
            <TouchableOpacity 
              onPress={takePhoto}
              disabled={imageUris.length >= MAX_IMAGES}
              className={`p-4 rounded-xl ${imageUris.length >= MAX_IMAGES ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              <Ionicons name="camera" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={pickImages}
              disabled={imageUris.length >= MAX_IMAGES}
              className={`p-4 rounded-xl ${imageUris.length >= MAX_IMAGES ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              <Ionicons name="images" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <Text className="text-center text-gray-500 mt-2">
            {imageUris.length}/{MAX_IMAGES} {t('createPost.imagesSelected')}
          </Text>
        </View>

        {/* Caption Input */}
        <View className="p-4 bg-white">
          <Text className="text-gray-700 font-medium mb-2">
            {t('createPost.caption')}
          </Text>
          <TextInput
            ref={captionInputRef}
            className="bg-gray-50 text-gray-900 p-3 rounded-lg min-h-[100px] border border-gray-200"
            placeholder={t('createPost.captionPlaceholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            value={postRequest.postCaption}
            onChangeText={handleCaptionChange}
            maxLength={maxCaptionLength}
          />
          <Text className="text-gray-400 text-right mt-1">
            {(postRequest.postCaption || '').length}/{maxCaptionLength}
          </Text>
        </View>

     
      
      </ScrollView>
    </SafeAreaView>
  );
}
