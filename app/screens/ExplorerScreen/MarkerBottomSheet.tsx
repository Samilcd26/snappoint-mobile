import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  Animated, 
  Dimensions, 
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Marker as MarkerType } from '@/types/Marker';
import { useGetPlaceById, useValidatePostLocation } from '@/api/placeApi';
import { useGetPlacePostsGrid } from '@/api/postApi';
import { PostSummary } from '@/types/post.types';
import { TopUser } from '@/types/Place';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface MarkerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  marker: MarkerType | null;
  onPostAt: () => void;
  onPostPress: (post: PostSummary) => void;
  onUserPress: (userId: string) => void;
  onShowLocation?: (latitude: number, longitude: number) => void;
}

const MarkerBottomSheet: React.FC<MarkerBottomSheetProps> = ({ 
  isVisible, 
  onClose, 
  marker, 
  onPostAt, 
  onPostPress,
  onUserPress,
  onShowLocation 
}) => {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [YERTALEs] = useState({
    min: screenHeight * 0.4, // 40% of screen - biraz daha büyük yaptım
    max: screenHeight * 0.9   // 90% of screen
  });
  const [currentYERTALE, setCurrentYERTALE] = useState(YERTALEs.min);
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostSummary[]>([]);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Fetch place data - daha fazla post çekiyoruz
  const { data: placeDetail, isLoading } = useGetPlaceById(marker?.id );
  const { 
    posts: placePosts, 
    isLoading: postsLoading, 
    pagination,
    error: postsError
  } = useGetPlacePostsGrid(marker?.id, currentPage, 12);

  // Konum doğrulama API hook'u - sadece gerekli durumlarda çalıştır
  const { 
    data: validationResult, 
    isLoading: isValidating, 
    error: validationError 
  } = useValidatePostLocation(
    marker?.id || 0,
    userLocation?.latitude || 0,
    userLocation?.longitude || 0,
    isCheckingLocation && !!userLocation && !!marker
  );

  // Kullanıcı konumunu al
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.error('Konum alırken hata:', error);
      }
    };

    if (isVisible && marker) {
      getUserLocation();
    }
  }, [isVisible, marker]);

  // Accumulate posts when new page data arrives
  useEffect(() => {
    if (placePosts && placePosts.length > 0) {
      if (currentPage === 1) {
        setAllPosts(placePosts);
      } else {
        setAllPosts(prev => [...prev, ...placePosts]);
      }
    }
  }, [placePosts, currentPage]);

  // Close modal when navigating away from the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Screen is unfocused (navigating away), close modal
        if (isVisible) {
          onClose();
        }
      };
    }, [isVisible, onClose])
  );

  useEffect(() => {
    if (isVisible) {
      // Reset posts when opening
      setCurrentPage(1);
      setAllPosts([]);
      // Animate in
      Animated.timing(translateY, {
        toValue: screenHeight - YERTALEs.min,
        duration: 400,
        useNativeDriver: true,
      }).start();
      setCurrentYERTALE(YERTALEs.min);
    } else {
      // Animate out
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleGestureEvent = (event: any) => {
    const { translationY: gestureTranslationY } = event.nativeEvent;
    const baseY = screenHeight - currentYERTALE;
    const newY = Math.max(screenHeight - YERTALEs.max, baseY + gestureTranslationY);
    
    translateY.setValue(newY);
  };

  const handleGestureEnd = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    const baseY = screenHeight - currentYERTALE;
    const currentY = Math.max(screenHeight - YERTALEs.max, baseY + translationY);
    
    let targetY;
    let newYERTALE;
    let animationConfig = { tension: 80, friction: 10 }; // Default yumuşak animasyon
    
    if (velocityY > 1200) {
      // Very fast swipe down - close
      targetY = screenHeight;
      onClose();
      return;
    } else if (velocityY < -200) {
      // Gentle swipe up - expand (daha da yumuşak threshold)
      targetY = screenHeight - YERTALEs.max;
      newYERTALE = YERTALEs.max;
      animationConfig = { tension: 60, friction: 12 }; // Yukarı çıkarken daha yumuşak
    } else if (velocityY > 200) {
      // Gentle swipe down - collapse yumuşakça
      targetY = screenHeight - YERTALEs.min;
      newYERTALE = YERTALEs.min;
      animationConfig = { tension: 70, friction: 11 }; // Aşağı inerken yumuşak
    } else {
      // Determine snap point based on position with more tolerance
      const middlePoint = screenHeight - (YERTALEs.min + YERTALEs.max) / 2;
      const closeThreshold = screenHeight - YERTALEs.min + 100; // Daha geniş kapatma alanı
      
      if (currentY > closeThreshold) {
        targetY = screenHeight;
        onClose();
        return;
      } else if (currentY < middlePoint) {
        // Orta noktanın üstündeyse max snap point'e git
        targetY = screenHeight - YERTALEs.max;
        newYERTALE = YERTALEs.max;
        animationConfig = { tension: 65, friction: 12 }; // Yumuşak genişleme
      } else {
        // Orta noktanın altındaysa min snap point'e git
        targetY = screenHeight - YERTALEs.min;
        newYERTALE = YERTALEs.min;
        animationConfig = { tension: 75, friction: 11 }; // Yumuşak küçülme
      }
    }
    
    setCurrentYERTALE(newYERTALE);
    
    Animated.spring(translateY, {
      toValue: targetY,
      tension: animationConfig.tension,
      friction: animationConfig.friction,
      useNativeDriver: true,
    }).start();
  };

  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages && !postsLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // API doğrulama sonucunu izle
  useEffect(() => {
    if (isCheckingLocation && validationResult) {
      setIsCheckingLocation(false);
      
      if (validationResult.can_post && validationResult.is_within_radius) {
        // Doğrulama başarılı - CreatePost ekranına git
        onClose(); // Bottom sheet'i kapat
        
        router.push({
          pathname: '/screens/CreatePost',
          params: {
            placeId: marker!.id.toString(),
            latitude: userLocation!.latitude.toString(),
            longitude: userLocation!.longitude.toString(),
            pointValue: marker!.point_value.toString()
          }
        });
      } else {
        // Doğrulama başarısız
        const distance = validationResult.distance_meters || 0;
        const requiredDistance = validationResult.post_radius || 20;
        
        Alert.alert(
          'Çok Uzaksınız',
          `Bu konuma post atabilmek için ${requiredDistance} metre yakınında olmanız gerekiyor.\n\nŞu anki mesafeniz: ${distance} metre`,
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'Konumu Göster', 
              style: 'default',
              onPress: () => {
                onClose();
                if (onShowLocation && marker) {
                  onShowLocation(marker.latitude, marker.longitude);
                }
              }
            }
          ]
        );
      }
    }
    
    if (isCheckingLocation && validationError) {
      setIsCheckingLocation(false);
      Alert.alert(
        'Lokasyon Hatası',
        'Konum doğrulaması yapılamadı. Lütfen tekrar deneyin.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Tekrar Dene', onPress: handleCreatePost }
        ]
      );
    }
  }, [validationResult, validationError, isCheckingLocation]);

  // Lokasyon doğrulama ve post oluşturma - API ile
  const handleCreatePost = async () => {
    if (!marker || !userLocation) {
      Alert.alert(
        'Konum İzni Gerekli',
        'Post oluşturmak için konumunuza erişim gerekiyor.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    setIsCheckingLocation(true);
  };

  const renderPostItem = ({ item }: { item: PostSummary }) => {
    const cardWidth = (screenWidth - 48 - 16) / 3;
    
    return (
      <TouchableOpacity 
        onPress={() => onPostPress(item)}
        style={{ width: cardWidth }}
        className="mb-4"
      >
        <View 
          style={{
            height: 160,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Image 
            source={{ uri: item.thumbnailUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
            }}
          />
          
          {/* Media Count & Type - Top Right */}
          <View 
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons 
              name={item.mediaType === 'video' ? 'videocam' : 'camera'} 
              size={12} 
              color="white" 
            />
            {item.mediaCount > 1 && (
              <Text className="text-white text-xs font-bold ml-1">{item.mediaCount}</Text>
            )}
          </View>
          
          {/* Bottom Content */}
          <View 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Avatar size="sm" className="border-2 border-white">
              {item.user.avatar ? (
                <AvatarImage source={{ uri: item.user.avatar }} />
              ) : (
                <AvatarFallbackText>
                  {`${item.user.firstName.charAt(0)}${item.user.lastName.charAt(0)}`}
                </AvatarFallbackText>
              )}
            </Avatar>
            
            <View 
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 16,
                paddingHorizontal: 8,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="trophy" size={14} color="#f59e0b" />
              <Text className="text-gray-900 text-xs font-bold ml-1">{item.user.totalPoints || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopUserItem = ({ item }: { item: TopUser }) => (
    <TouchableOpacity 
      className="items-center mr-4"
      onPress={() => onUserPress(item.id.toString())}
    >
      <View className="w-16 h-16 rounded-full bg-blue-50 justify-center items-center border-2 border-blue-500 overflow-hidden">
        {item.avatar ? (
          <Image 
            source={{ uri: item.avatar }} 
            style={{ width: 64, height: 64 }} 
            className="w-full h-full"
          />
        ) : (
          <Text className="text-blue-600 font-bold text-xl">
            {`${item.first_name.charAt(0)}${item.last_name.charAt(0)}`}
          </Text>
        )}
      </View>
      <Text className="text-gray-900 font-semibold mt-1">{item.username}</Text>
      <Text className="text-blue-600 text-sm">{item.total_points} pts</Text>
    </TouchableOpacity>
  );

  if (!marker) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onEnded={handleGestureEnd}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: screenHeight,
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 10,
              },
              {
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Handle and Close Button */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-1 items-center">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-2 text-gray-600">Loading place details...</Text>
              </View>
            ) : placeDetail ? (
              <View className="flex-1">
                {allPosts && allPosts.length > 0 ? (
                  <FlatList
                    data={allPosts}
                    numColumns={3}
                    keyExtractor={(item) => `post-${item.id}`}
                    renderItem={renderPostItem}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={() => (
                      <View>
                        {/* Place Header */}
                        <View className="px-4 py-2 mb-4">
                          <View className="flex-row items-center">
                            <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 mr-4">
                              {placeDetail?.place_image ? (
                                <Image 
                                  source={{ uri: placeDetail.place_image }}
                                  className="w-full h-full"
                                  resizeMode="cover"
                                />
                              ) : (
                                <View className="w-full h-full bg-blue-50 justify-center items-center">
                                  <Ionicons name="location" size={24} color="#3b82f6" />
                                </View>
                              )}
                            </View>
                            
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <Text className="text-lg font-bold text-gray-900 mr-2">
                                  {placeDetail?.name || 'Place Details'}
                                </Text>
                                {placeDetail?.name && (
                                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                                )}
                              </View>
                              <View className="flex-row items-center mt-1">
                                <View className="bg-blue-50 px-2 py-1 rounded-lg mr-2">
                                  <Text className="text-blue-600 font-bold text-sm">+{marker.point_value} pts</Text>
                                </View>
                                <Text className="text-gray-500 text-sm">
                                  {placeDetail.stats.totalPosts} posts
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Stats and Create Post sections - Same design as empty state */}
                        <View className="px-4 mb-4">
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {/* Place Stats */}
                            <View style={{ flex: 1, height: 56 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 rounded-xl border border-blue-100 justify-center">
                              <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                  <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.totalPosts || 0}</Text>
                                  <Text className="text-gray-600 text-xs">posts</Text>
                                </View>
                                <View className="flex-row items-center">
                                  <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.uniquePosters || 0}</Text>
                                  <Text className="text-gray-600 text-xs">visitors</Text>
                                </View>
                                <View className="flex-row items-center">
                                  <Text className="text-blue-600 text-base font-bold mr-1">{placeDetail?.stats.totalPoints || 0}</Text>
                                  <Text className="text-gray-600 text-xs">pts</Text>
                                </View>
                              </View>
                            </View>

                            {/* Create Post Button */}
                            <TouchableOpacity 
                              onPress={handleCreatePost} 
                              disabled={isCheckingLocation}
                            >
                              <LinearGradient
                                colors={['#ffffff', '#f8fafc', '#e2e8f0']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                  borderRadius: 12,
                                  height: 56,
                                  paddingHorizontal: 16,
                                  shadowColor: '#000000',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4,
                                  elevation: 4,
                                  minWidth: 120,
                                  justifyContent: 'center',
                                  borderWidth: 1,
                                  borderColor: '#e2e8f0',
                                }}
                              >
                                <View className="flex-row items-center">
                                  <View 
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 16,
                                      backgroundColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginRight: 10,
                                      shadowColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.3,
                                      shadowRadius: 3,
                                      elevation: 3,
                                    }}
                                  >
                                    {isCheckingLocation ? (
                                      <ActivityIndicator size={16} color="white" />
                                    ) : (
                                      <Ionicons name="camera" size={16} color="white" />
                                    )}
                                  </View>
                                  
                                  <View>
                                    <Text style={{ 
                                      color: isCheckingLocation ? '#9ca3af' : '#1f2937', 
                                      fontSize: 14, 
                                      fontWeight: 'bold' 
                                    }}>
                                      {isCheckingLocation ? 'Kontrol Ediliyor...' : 'Post'}
                                    </Text>
                                    <Text style={{ 
                                      color: isCheckingLocation ? '#9ca3af' : '#3b82f6', 
                                      fontSize: 12, 
                                      fontWeight: '600' 
                                    }}>
                                      +{placeDetail?.point_value || marker.point_value} pts
                                    </Text>
                                  </View>
                                </View>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Top Users Section */}
                        {placeDetail?.top_users && placeDetail.top_users.length > 0 && (
                          <View className="px-4 mb-4">
                            <Text className="text-lg font-bold text-gray-900 mb-3">Top Visitors</Text>
                            <FlatList
                              data={placeDetail.top_users}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              keyExtractor={(item) => `top-user-${item.id}`}
                              renderItem={renderTopUserItem}
                              contentContainerStyle={{ paddingLeft: 4 }}
                            />
                          </View>
                        )}

                        {/* Posts Section Header */}
                        <View className="px-4 mb-2">
                          <Text className="text-lg font-bold text-gray-900">Recent Posts</Text>
                          {pagination && (
                            <Text className="text-gray-400 text-xs mt-1">
                              {allPosts.length} of {pagination.totalItems} posts
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                    ListFooterComponent={() => (
                      postsLoading && currentPage > 1 ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator size="small" color="#3b82f6" />
                          <Text className="text-gray-500 text-sm mt-2">Loading more posts...</Text>
                        </View>
                      ) : pagination && currentPage >= pagination.totalPages && allPosts.length > 0 ? (
                        <View className="py-4 items-center">
                          <Text className="text-gray-400 text-sm">You've reached the end</Text>
                        </View>
                      ) : null
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                ) : postsLoading && currentPage === 1 ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="mt-2 text-gray-600">Loading posts...</Text>
                    {postsError && (
                      <Text className="mt-2 text-red-500 text-sm">Error: {postsError.message || 'Failed to load posts'}</Text>
                    )}
                  </View>
                ) : postsError && !allPosts.length ? (
                  <ScrollView className="flex-1">
                    {/* Header for error state */}
                    <View className="px-4 py-2 mb-4">
                      <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 mr-4">
                          {placeDetail?.place_image ? (
                            <Image 
                              source={{ uri: placeDetail.place_image }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-full h-full bg-blue-50 justify-center items-center">
                              <Ionicons name="location" size={24} color="#3b82f6" />
                            </View>
                          )}
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-lg font-bold text-gray-900 mr-2">
                              {placeDetail?.name || 'Place Details'}
                            </Text>
                            {placeDetail?.name && (
                              <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                            )}
                          </View>
                          <View className="flex-row items-center mt-1">
                            <View className="bg-blue-50 px-2 py-1 rounded-lg mr-2">
                              <Text className="text-blue-600 font-bold text-sm">+{marker.point_value} pts</Text>
                            </View>
                            <Text className="text-red-500 text-sm">Failed to load posts</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Stats and Create Post sections for error state */}
                    <View className="px-4 mb-6">
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {/* Place Stats */}
                        <View style={{ flex: 1, height: 56 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 rounded-xl border border-blue-100 justify-center">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                              <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.totalPosts || 0}</Text>
                              <Text className="text-gray-600 text-xs">posts</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.uniquePosters || 0}</Text>
                              <Text className="text-gray-600 text-xs">visitors</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Text className="text-blue-600 text-base font-bold mr-1">{placeDetail?.stats.totalPoints || 0}</Text>
                              <Text className="text-gray-600 text-xs">pts</Text>
                            </View>
                          </View>
                        </View>

                        {/* Create Post Button */}
                        <TouchableOpacity 
                          onPress={handleCreatePost} 
                          disabled={isCheckingLocation}
                        >
                          <LinearGradient
                            colors={['#ffffff', '#f8fafc', '#e2e8f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              borderRadius: 12,
                              height: 56,
                              paddingHorizontal: 16,
                              shadowColor: '#000000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: 4,
                              minWidth: 120,
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: '#e2e8f0',
                            }}
                          >
                            <View className="flex-row items-center">
                              <View 
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  backgroundColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginRight: 10,
                                  shadowColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 3,
                                  elevation: 3,
                                }}
                              >
                                {isCheckingLocation ? (
                                  <ActivityIndicator size={16} color="white" />
                                ) : (
                                  <Ionicons name="camera" size={16} color="white" />
                                )}
                              </View>
                              
                              <View>
                                <Text style={{ 
                                  color: isCheckingLocation ? '#9ca3af' : '#1f2937', 
                                  fontSize: 14, 
                                  fontWeight: 'bold' 
                                }}>
                                  {isCheckingLocation ? 'Kontrol Ediliyor...' : 'Post'}
                                </Text>
                                <Text style={{ 
                                  color: isCheckingLocation ? '#9ca3af' : '#3b82f6', 
                                  fontSize: 12, 
                                  fontWeight: '600' 
                                }}>
                                  +{placeDetail?.point_value || marker.point_value} pts
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Error State */}
                    <View className="px-4 py-8 items-center">
                      <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                      <Text className="mt-2 text-red-500 text-center font-semibold">Failed to load posts</Text>
                      <Text className="text-gray-400 text-sm text-center mt-1">
                        {postsError?.message || 'Please check your connection and try again'}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => {
                          setCurrentPage(1);
                          setAllPosts([]);
                        }}
                        className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
                      >
                        <Text className="text-white font-semibold">Retry</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                ) : (
                  <ScrollView className="flex-1">
                    {/* Same header content for empty state */}
                    <View className="px-4 py-2 mb-4">
                      <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 mr-4">
                          {placeDetail?.place_image ? (
                            <Image 
                              source={{ uri: placeDetail.place_image }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-full h-full bg-blue-50 justify-center items-center">
                              <Ionicons name="location" size={24} color="#3b82f6" />
                            </View>
                          )}
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-lg font-bold text-gray-900 mr-2">
                              {placeDetail?.name || 'Place Details'}
                            </Text>
                            {placeDetail?.name && (
                              <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                            )}
                          </View>
                          <View className="flex-row items-center mt-1">
                            <View className="bg-blue-50 px-2 py-1 rounded-lg mr-2">
                              <Text className="text-blue-600 font-bold text-sm">+{marker.point_value} pts</Text>
                            </View>
                            <Text className="text-gray-500 text-sm">
                              {placeDetail.stats.totalPosts} posts
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Stats and Create Post sections for empty state */}
                    <View className="px-4 mb-6">
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {/* Place Stats */}
                        <View style={{ flex: 1, height: 56 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 rounded-xl border border-blue-100 justify-center">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                              <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.totalPosts || 0}</Text>
                              <Text className="text-gray-600 text-xs">posts</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Text className="text-gray-900 text-base font-bold mr-1">{placeDetail?.stats.uniquePosters || 0}</Text>
                              <Text className="text-gray-600 text-xs">visitors</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Text className="text-blue-600 text-base font-bold mr-1">{placeDetail?.stats.totalPoints || 0}</Text>
                              <Text className="text-gray-600 text-xs">pts</Text>
                            </View>
                          </View>
                        </View>

                        {/* Create Post Button - Geliştirilmiş */}
                        <TouchableOpacity 
                          onPress={handleCreatePost} 
                          disabled={isCheckingLocation}
                        >
                          <LinearGradient
                            colors={['#ffffff', '#f8fafc', '#e2e8f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              borderRadius: 12,
                              height: 56,
                              paddingHorizontal: 16,
                              shadowColor: '#000000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: 4,
                              minWidth: 120,
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: '#e2e8f0',
                            }}
                          >
                            <View className="flex-row items-center">
                              <View 
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  backgroundColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginRight: 10,
                                  shadowColor: isCheckingLocation ? '#9ca3af' : '#3b82f6',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 3,
                                  elevation: 3,
                                }}
                              >
                                {isCheckingLocation ? (
                                  <ActivityIndicator size={16} color="white" />
                                ) : (
                                  <Ionicons name="camera" size={16} color="white" />
                                )}
                              </View>
                              
                              <View>
                                <Text style={{ 
                                  color: isCheckingLocation ? '#9ca3af' : '#1f2937', 
                                  fontSize: 14, 
                                  fontWeight: 'bold' 
                                }}>
                                  {isCheckingLocation ? 'Kontrol Ediliyor...' : 'Post'}
                                </Text>
                                <Text style={{ 
                                  color: isCheckingLocation ? '#9ca3af' : '#3b82f6', 
                                  fontSize: 12, 
                                  fontWeight: '600' 
                                }}>
                                  +{placeDetail?.point_value || marker.point_value} pts
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>

                    

                    {/* Empty Posts State */}
                    <View className="px-4 py-8 items-center">
                      <Ionicons name="images-outline" size={48} color="#d1d5db" />
                      <Text className="mt-2 text-gray-500 text-center">No posts yet</Text>
                      <Text className="text-gray-400 text-sm text-center mt-1">Be the first to post here!</Text>
                    </View>
                  </ScrollView>
                )}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="mt-2 text-gray-900 text-lg font-semibold">Error loading place details</Text>
                <Text className="mt-1 text-gray-600">Place not found</Text>
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

export default MarkerBottomSheet; 