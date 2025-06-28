import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPlaceById } from '@/api/placeApi';
import { useGetPlacePostsGrid } from '@/api/postApi';
import { PostSummary } from '@/types/post.types';
import { UserPost, TopUser } from '@/types/Place';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import ProfileImageModal from '../../components/ProfileImageModal';

export default function PlaceProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    placeId: string; 
    latitude?: string;
    longitude?: string;
    pointValue?: string;
    isVerified?: string;
  }>();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostSummary[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const windowWidth = Dimensions.get('window').width;


  // Fetch place data
  const { data: placeDetail, isLoading, error } = useGetPlaceById(params.placeId);
  const { 
    posts: placePosts, 
    isLoading: placePostsLoading, 
    error: placePostsError,
    pagination 
  } = useGetPlacePostsGrid(params.placeId, currentPage, 12); // 12 posts per page for grid layout

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
  
  const handlePostPress = (post: PostSummary) => {
    router.push({
      pathname: '/screens/PostDetailScreen',
      params: {
        userId: post.user.id.toString(),
        placeId: params.placeId,
        postId: post.id.toString(),
      }
    });
  };

  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages && !placePostsLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleUserPress = (userId: string) => {
    router.push(`/screens/UserProfileScreen?userId=${userId}`);
  };

  console.log({placeDetail});
  

  const renderPostItem = ({ item }: { item: PostSummary }) => {
    const cardWidth = (windowWidth - 48 - 16) / 3; // Screen width minus padding minus gaps, divided by 3
    
    return (
      <TouchableOpacity 
        onPress={() => handlePostPress(item)}
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
          {/* Background Post Image */}
          <Image 
            source={{ uri: item.thumbnailUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
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
            {/* User Avatar */}
            <Avatar size="sm" className="border-2 border-white">
              {item.user.avatar ? (
                <AvatarImage source={{ uri: item.user.avatar }} />
              ) : (
                <AvatarFallbackText>
                  {`${item.user.firstName.charAt(0)}${item.user.lastName.charAt(0)}`}
                </AvatarFallbackText>
              )}
            </Avatar>
            
            {/* User Points */}
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
      onPress={() => handleUserPress(item.id.toString())}
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading place details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !placeDetail) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-2 text-gray-900 text-lg font-semibold">Error loading place details</Text>
        <Text className="mt-1 text-gray-600">{error?.message || 'Place not found'}</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button and place info */}
      <View className="p-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <TouchableOpacity className="p-2" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        
        {/* Place Name and Verification in Header */}
        <View className="flex-1 flex-row items-center justify-center mx-4">
          <Text className="text-lg font-bold text-gray-900 mr-2" numberOfLines={1}>
            {placeDetail?.name || 'Place Profile'}
          </Text>
          {placeDetail?.name && (
            <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
          )}
        </View>
        
        <TouchableOpacity className="p-2">
          {/* TODO: Add options */}
          {/*
          <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
          */}
        </TouchableOpacity>
      </View>

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
              {/* Place Stats Banner */}
              <View className="p-4 bg-white mt-2 border-t border-gray-100">
                <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                  <View className="flex-row items-center">
                    {/* Bigger Place Image - Touchable */}
                    <TouchableOpacity 
                      className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 mr-4"
                      onPress={() => setImageModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: placeDetail?.place_image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    
                    {/* Stats */}
                    <View className="flex-1 flex-row justify-between">
                      <View className="items-center">
                        <Text className="text-gray-900 text-lg font-bold">{placeDetail?.stats.totalPosts}</Text>
                        <Text className="text-gray-600 text-xs font-medium">Posts</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-gray-900 text-lg font-bold">{placeDetail?.stats.uniquePosters}</Text>
                        <Text className="text-gray-600 text-xs font-medium">Visitors</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-blue-600 text-lg font-bold">{placeDetail?.stats.totalPoints}</Text>
                        <Text className="text-gray-600 text-xs font-medium">Points</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Top Users Section */}
              <View className="bg-white border-t border-gray-100 p-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">Top Visitors</Text>
               
                </View>
                
                <FlatList
                  data={placeDetail?.top_users || []}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `top-user-${item.id}`}
                  renderItem={renderTopUserItem}
                  contentContainerStyle={{ paddingLeft: 4 }}
                />
              </View>

              {/* Combined Visit Reward & Create Post Card */}
              <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/screens/CreatePost',
                    params: {
                      placeId: placeDetail?.id.toString(),
                      latitude: placeDetail?.latitude.toString(),
                      longitude: placeDetail?.longitude.toString(),
                      pointValue: placeDetail?.point_value.toString(),
                    }
                  })}
                >
                  <LinearGradient
                    colors={['#4f46e5', '#7c3aed', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: '#4f46e5',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Left - Floating Camera Icon */}
                      <View 
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 16,
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        <Ionicons name="camera" size={28} color="white" />
                      </View>
                      
                      {/* Right - Create Post Info */}
                      <View className="flex-1">
                        <Text className="text-white text-xl font-bold">Create Post</Text>
                        <Text className="text-white/80 text-sm mt-1">
                          Share your moment & earn points
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <View 
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: 'rgba(255,255,255,0.3)',
                            }}
                          >
                            <Text className="text-white font-bold text-sm">+{placeDetail?.point_value} Points</Text>
                          </View>
                        </View>
                      </View>
                      
                      {/* Arrow Icon */}
                      <View 
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        <Ionicons name="arrow-forward" size={16} color="white" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Posts Section Header */}
              <View className="mt-2 bg-white border-t border-gray-100">
                <View className="p-4 border-b border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-gray-900">Recent Posts by Users</Text>
                   
                  </View>
                </View>
                

                
                {/* Posts Grid Header Padding */}
                <View className="pt-4 px-4">
                  <Text className="text-gray-400 text-xs text-center mb-2">
                    {pagination ? `${allPosts.length} of ${pagination.totalItems} posts` : ''}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            placePostsLoading && currentPage > 1 ? (
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
      ) : placePostsLoading && currentPage === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading posts...</Text>
        </View>
      ) : (
        <ScrollView>
          {/* Place Stats Banner */}
          <View className="p-4 bg-white mt-2 border-t border-gray-100">
            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
              <View className="flex-row items-center">
                {/* Bigger Place Image - Touchable */}
                <TouchableOpacity 
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 mr-4"
                  onPress={() => setImageModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: placeDetail?.place_image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                
                {/* Stats */}
                <View className="flex-1 flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-gray-900 text-lg font-bold">{placeDetail?.stats.totalPosts}</Text>
                    <Text className="text-gray-600 text-xs font-medium">Posts</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-900 text-lg font-bold">{placeDetail?.stats.uniquePosters}</Text>
                    <Text className="text-gray-600 text-xs font-medium">Visitors</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-blue-600 text-lg font-bold">{placeDetail?.stats.totalPoints}</Text>
                    <Text className="text-gray-600 text-xs font-medium">Points</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Top Users Section */}
          <View className="bg-white border-t border-gray-100 p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Top Visitors</Text>
         
            </View>
            
            <FlatList
              data={placeDetail?.top_users || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `top-user-${item.id}`}
              renderItem={renderTopUserItem}
              contentContainerStyle={{ paddingLeft: 4 }}
            />
          </View>

          {/* Combined Visit Reward & Create Post Card */}
          <View className="p-4 bg-white border-t border-gray-100">
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/screens/CreatePost',
                params: {
                  placeId: placeDetail?.id.toString(),
                  latitude: placeDetail?.latitude.toString(),
                  longitude: placeDetail?.longitude.toString(),
                  pointValue: placeDetail?.point_value.toString(),
                }
              })}
            >
              <LinearGradient
                colors={['#4f46e5', '#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: '#4f46e5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center">
                  {/* Left - Floating Camera Icon */}
                  <View 
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Ionicons name="camera" size={28} color="white" />
                  </View>
                  
                  {/* Right - Create Post Info */}
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold">Create Post</Text>
                    <Text className="text-white/80 text-sm mt-1">
                      Share your moment & earn points
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View 
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        <Text className="text-white font-bold text-sm">+{placeDetail?.point_value} Points</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Arrow Icon */}
                  <View 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Empty Posts State */}
          <View className="p-8 items-center">
            <Ionicons name="images-outline" size={48} color="#d1d5db" />
            <Text className="mt-2 text-gray-500 text-center">No posts yet</Text>
            <TouchableOpacity 
              className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
              onPress={() => router.push({
                pathname: '/screens/CreatePost',
                params: {
                  placeId: placeDetail?.id.toString(),
                  latitude: placeDetail?.latitude.toString(),
                  longitude: placeDetail?.longitude.toString(),
                  pointValue: placeDetail?.point_value.toString(),
                }
              })}
            >
              <Text className="text-white font-semibold">Be the first to post!</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Profile Image Modal */}
      <ProfileImageModal
        isVisible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        imageUri={placeDetail?.place_image}
        placeName={placeDetail?.name}
        pointValue={placeDetail?.point_value}
      />
    </SafeAreaView>
  );
}
