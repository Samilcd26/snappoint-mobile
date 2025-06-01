import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useGetUserPosts } from '@/api/postApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker as MapMarker } from 'react-native-maps';
import { useAuthStore } from '@/stores';
import { useGetUser } from '@/api/userApi';
import { PostSummary } from '@/types/post.types';

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId: string;
  }>();

  // Get authenticated user and logout function from Zustand store
  const { logout } = useAuthStore();
  const { data: userData, isLoading: isUserLoading, error: userError } = useGetUser(Number(params.userId));
  

  // Tab state
  const [activeTab, setActiveTab] = useState('posts');
  
  
  // Screen dimensions
  const windowWidth = Dimensions.get('window').width;
  const imageSize = windowWidth / 3 - 2; // 3 images per row with small gap
  
  // Fetch posts
  const { posts, isLoading, error } = useGetUserPosts(params.userId);
  
  

  
  const handlePostPress = (userPost: PostSummary) => {
    router.push({
      pathname: '/screens/PostDetailScreen',
      params: {
        postId: userPost.id.toString(),
      },
    });
  };
  

  const renderPostItem = ({ item }: { item: PostSummary }) => (
    <TouchableOpacity 
      onPress={() => handlePostPress(item)}
      className="m-[1px]"
    >
      <Image 
        source={{ uri: item.thumbnailUrl }}
        style={{ width: imageSize, height: imageSize }}
        className="bg-gray-200"
      />
      <View className="absolute bottom-1 left-1 bg-black bg-opacity-50 rounded-full p-1">
        <Ionicons name="location" size={12} color="white" />
      </View>
      {item.mediaCount > 1 && (
        <View className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1">
          <Ionicons name="copy" size={12} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
  


  if (isUserLoading) {
    return <ActivityIndicator size="large" color="#3b82f6" />;
  }

  if (userError || !userData?.success) {
    return <Text>Error loading user data</Text>;
  }



  const user = userData.data!;

  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header with back button and options */}
        <View className="p-4 flex-row justify-between items-center">
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Profile</Text>
          {user.isOwnProfile ? (
            <TouchableOpacity className="p-2" onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Profile Header */}
        <View className="px-4 py-2">
          <View className="flex-row items-center">
            {/* Profile Picture */}
            <View className="mr-4">
              <Image 
                source={{ uri: user.avatar }}
                className="w-20 h-20 rounded-full bg-gray-200"
              />
            </View>
            
            {/* User Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-gray-900">{user.username}</Text>
                {user.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" className="ml-1" />
                )}
              </View>
              <Text className="text-gray-600 text-sm">{user.bio}</Text>
            </View>
          </View>
          
          {/* Action Button */}
          <View className="mt-4">
            {user.isOwnProfile ? (
              <TouchableOpacity className="bg-gray-100 rounded-xl py-2 px-4 items-center">
                <Text className="font-semibold text-gray-800">Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              null
            )}
          </View>
        </View>
        
        {/* Stats Row */}
        <View className="flex-row justify-around p-4 bg-white border-t border-b border-gray-100 mt-2">
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{posts.length}</Text>
            <Text className="text-gray-500 text-sm">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{user.postsCount}</Text>
            <Text className="text-gray-500 text-sm">Places</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-blue-600">{posts?.user?.totalPoints || user.totalPoints}</Text>
            <Text className="text-blue-500 text-sm">Points</Text>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity 
            className={`flex-1 py-3 items-center ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name={activeTab === 'posts' ? 'grid' : 'grid-outline'} 
              size={24} 
              color={activeTab === 'posts' ? '#3b82f6' : '#6b7280'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 items-center ${activeTab === 'map' ? 'border-b-2 border-blue-500' : ''}`}
            onPress={() => setActiveTab('map')}
          >
            <Ionicons 
              name={activeTab === 'map' ? 'map' : 'map-outline'} 
              size={24} 
              color={activeTab === 'map' ? '#3b82f6' : '#6b7280'} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'posts' ? (
          // Posts Tab
          <View className="bg-white">
            {isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-500">Loading posts...</Text>
              </View>
            ) : error ? (
              <View className="py-10 items-center">
                <Ionicons name="alert-circle-outline" size={60} color="#3b82f6" />
                <Text className="mt-4 text-gray-700 text-center">
                  Error loading posts. Please try again.
                </Text>
              </View>
            ) : posts.length === 0 ? (
              <View className="py-10 items-center">
                <Ionicons name="images-outline" size={60} color="#3b82f6" />
                <Text className="text-gray-500 text-center mt-4">
                  No posts yet
                </Text>
                {user.isOwnProfile && (
                  <TouchableOpacity className="mt-6 px-6 py-3 bg-blue-50 rounded-xl">
                    <Text className="text-blue-600 font-semibold">Create Your First Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                scrollEnabled={false} // Disable scrolling since we're inside ScrollView
                ListFooterComponent={<View className="h-20" />} // Add some space at the bottom
              />
            )}
          </View>
        ) : (
          // Map Tab
          <View className="bg-white">
            <View className="h-80 w-full">
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: posts.length > 0 ? posts[0].latitude : 41.0082,
                  longitude: posts.length > 0 ? posts[0].longitude : 28.9784,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                {posts.map((post) => (
                  <MapMarker
                    key={post.id}
                    coordinate={{
                      latitude: post.latitude,
                      longitude: post.longitude,
                    }}
                    title={post.placeName}
                    description={post.postCaption}
                    pinColor="#3b82f6"
                    onPress={() => handlePostPress(post)}
                  />
                ))}
              </MapView>
            </View>
            
            {/* Posts List */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-4">Posts by Location</Text>
              
              {posts.length === 0 ? (
                <View className="py-10 items-center">
                  <Ionicons name="location-outline" size={60} color="#3b82f6" />
                  <Text className="text-gray-500 text-center mt-4">
                    No posts with location data yet
                  </Text>
                  {user.isOwnProfile && (
                    <TouchableOpacity className="mt-6 px-6 py-3 bg-blue-50 rounded-xl">
                      <Text className="text-blue-600 font-semibold">Create Your First Post</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                posts.map((post) => (
                  <TouchableOpacity 
                    key={post.id}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl mb-3 border border-gray-100"
                    onPress={() => handlePostPress(post)}
                  >
                    <Image 
                      source={{ uri: post.thumbnailUrl }}
                      className="w-12 h-12 rounded-lg mr-3 bg-gray-200"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {post.placeName}
                      </Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {post.postCaption}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="bg-blue-50 px-2 py-1 rounded-full mb-1">
                        <Text className="text-blue-600 font-semibold text-xs">
                          {post.likesCount} likes
                        </Text>
                      </View>
                      {post.mediaCount > 1 && (
                        <View className="bg-gray-100 px-2 py-1 rounded-full">
                          <Text className="text-gray-600 text-xs">
                            {post.mediaCount} photos
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
      
     
    </SafeAreaView>
  );
}
