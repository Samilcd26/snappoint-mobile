import React, { useState, useRef, useEffect } from 'react';
import { View,  TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useShowToast } from '@/utils/Toast';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Marker } from '@/types/Marker';
import { useCreatePost } from '@/api/postApi';
import { Switch } from "@/components/ui/switch"
import { Text } from '@/components/ui/text';
import { PostRequest } from '@/types/post.types';

export default function CreatePostScreen() {
  const router = useRouter();
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>(["https://picsum.photos/1080/1350","https://picsum.photos/1080/1350","https://picsum.photos/1080/1350"]);
  // Get location params from URL if available
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    placeId: string;
    pointValue: string;
  }>();

  
  
  const [postRequest, setPostRequest] = useState<PostRequest>({
    postCaption: '',
    mediaItems: [
        {
          mediaType: 'photo',
          mediaUrl: 'https://picsum.photos/1080/1350',
          width: 1080,
          height: 1350,
          duration: 0,
          altText: '',
          tags: []
        },
        {
          mediaType: 'photo',
          mediaUrl: 'https://picsum.photos/1080/1350',
          width: 1080,
          height: 1350,
          duration: 0,
          altText: '',
          tags: []
        },
        {
          mediaType: 'photo',
          mediaUrl: 'https://picsum.photos/1080/1350',
          width: 1080,
          height: 1350,
          duration: 0,
          altText: '',
          tags: []
        },
    ],
    placeId: parseInt(params.placeId),
    latitude: parseFloat(params.latitude),
    longitude: parseFloat(params.longitude),
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
          pointValue: pointValue,
          isVerified: false
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
          title: 'Permissions required',
          description: 'Camera and media library permissions are needed to upload images',
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
        title: 'Maximum Images',
        description: `You can only upload up to ${MAX_IMAGES} images`,
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
        aspect: [4, 3],
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
        title: 'Error',
        description: 'Failed to take photo',
        action: 'error'
      });
    }
  };

  // Update media items when images change
  const updateMediaItems = (uris: string[]) => {
    const mediaItems = uris.map(uri => ({
      mediaType: 'photo',
      mediaUrl: uri,
      width: 0,
      height: 0,
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        
        if (imageUris.length + newUris.length > MAX_IMAGES) {
          showToast({
            title: 'Too Many Images',
            description: `You can only upload up to ${MAX_IMAGES} images. Only the first ${MAX_IMAGES - imageUris.length} will be added.`,
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
        title: 'Error',
        description: 'Failed to select images',
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
        title: 'Image Required',
        description: 'Please select at least one image for your post',
        action: 'warning'
      });
      return;
    }

    if (!location) {
      showToast({
        title: 'Location Required',
        description: 'Please select a location for your post',
        action: 'warning'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the post using our mutation
      const newPost = await createPostMutation.mutateAsync(postRequest);
      
      showToast({
        title: 'Success',
        description: `Your post with ${imageUris.length} image${imageUris.length > 1 ? 's' : ''} has been created successfully!`,
        action: 'success'
      });
      
      // Navigate back or to the home screen
      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      showToast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        action: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Create Post</Text>
            <TouchableOpacity 
              onPress={handleSubmitPost} 
              disabled={imageUris.length === 0 || isLoading}
              className={`p-3 rounded-lg ${(imageUris.length === 0 || isLoading) ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-blue-600 font-semibold ml-2">Share</Text>
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
              showsHorizontalScrollIndicator={true}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={({ item, index }) => (
                <View className="relative">
                  <Image 
                    source={{ uri: item }} 
                    style={{ width: 400, height: 400 }}
                    resizeMode="cover" 
                    className="bg-gray-100"
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
              )}
            />
          </View>
        ) : (
          <View className="items-center justify-center p-8 bg-gray-50">
            <Ionicons name="images-outline" size={80} color="#3b82f6" />
            <Text className="text-gray-500 text-center mt-4">
              Select up to {MAX_IMAGES} images for your post
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
            {imageUris.length}/{MAX_IMAGES} images selected
          </Text>
        </View>

        {/* Caption Input */}
        <View className="p-4 bg-white">
          <Text className="text-gray-700 font-medium mb-2">
            Caption
          </Text>
          <TextInput
            ref={captionInputRef}
            className="bg-gray-50 text-gray-900 p-3 rounded-lg min-h-[100px] border border-gray-200"
            placeholder="Add a caption to your post..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={postRequest.postCaption}
            onChangeText={handleCaptionChange}
            maxLength={maxCaptionLength}
          />
          <Text className="text-gray-400 text-right mt-1">
            {postRequest.postCaption.length}/{maxCaptionLength}
          </Text>
        </View>

        <View className="p-4 bg-white">
          <Text className='text-gray-700 font-medium mb-2'>Allow comments</Text>
      <Switch
        defaultValue={true}
        value={postRequest.allowComments}
        onValueChange={() => setPostRequest(prev => ({ ...prev, allowComments: !prev.allowComments }))}
      />
          
        </View>

      
      </ScrollView>
    </SafeAreaView>
  );
}
