import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPlaceById } from '@/api/placeApi';
import { UserPost, TopUser } from '@/types/Place';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';

export default function PlaceProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    placeId: string; 
    latitude?: string;
    longitude?: string;
    pointValue?: string;
    isVerified?: string;
  }>();
  
  const windowWidth = Dimensions.get('window').width;


  
  // Fetch place data
  const { data: placeDetail, isLoading, error } = useGetPlaceById(params.placeId);
  
  const handlePostPress = (post: UserPost) => {
    router.push({
      pathname: '/screens/PostDetailScreen',
      params: {
        userId: post.userId.toString(),
        placeId: params.placeId,
      }
    });
  };



  const renderPostItem = ({ item }: { item: UserPost }) => {
    const cardWidth = (windowWidth - 48 - 16) / 3; // Screen width minus padding minus gaps, divided by 3
    
    // Mock post images for demonstration (in real app, these would come from API)
    const mockPostImages = [
      'https://picsum.photos/200/300?random=1',
      'https://picsum.photos/200/300?random=2', 
      'https://picsum.photos/200/300?random=3',
      'https://picsum.photos/200/300?random=4'
    ];
    
    return (
      <TouchableOpacity 
        onPress={() => handlePostPress(item)}
        style={{ width: cardWidth }}
        className="mb-5"
      >
        <View className="relative h-40">
          {/* Third card (bottom) - Post Image 3 */}
          <View 
            style={{
              position: 'absolute',
              top: 8,
              left: 6,
              right: -2,
              height: 145,
              transform: [{ rotate: '3deg' }],
              borderRadius: 12,
              opacity: 0.7,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              overflow: 'hidden',
            }}
          >
            <Image 
              source={{ uri: mockPostImages[2] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              blurRadius={20}
            />
            <View style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)' 
            }} />
          </View>
          
          {/* Second card (middle) - Post Image 2 */}
          <View 
            style={{
              position: 'absolute',
              top: 4,
              left: 3,
              right: 1,
              height: 150,
              transform: [{ rotate: '-1.5deg' }],
              borderRadius: 12,
              opacity: 0.8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
              overflow: 'hidden',
            }}
          >
            <Image 
              source={{ uri: mockPostImages[1] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              blurRadius={15}
            />
            <View style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(0,0,0,0.3)' 
            }} />
          </View>
          
          {/* Main Card (top) - Post Image 1 */}
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 2,
              height: 155,
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
              overflow: 'hidden',
            }}
          >
            {/* Background Post Image */}
            <Image 
              source={{ uri: mockPostImages[0] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              blurRadius={12}
            />
            
            {/* Overlay for better contrast */}
            <View style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(255,255,255,0.5)' 
            }} />
            
            {/* Card Content */}
            <View className="absolute inset-0 justify-center items-center">
              {/* User Avatar in Center */}
              <Avatar size="lg" className="shadow-lg border-3 border-white mb-2">
                {item.avatar ? (
                  <AvatarImage source={{ uri: item.avatar }} />
                ) : (
                  <AvatarFallbackText>
                    {`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`}
                  </AvatarFallbackText>
                )}
              </Avatar>
              
              {/* Points Below Avatar */}
              <LinearGradient
                colors={['#a855f7', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="white" />
                  <Text className="text-white text-xs font-bold" style={{ marginLeft: 4 }}>{item.totalPoints}</Text>
                </View>
              </LinearGradient>
            </View>
            
            {/* Post Count - Top Right Only */}
            <View className="absolute top-2 right-2 bg-slate-700 rounded-full w-7 h-7 justify-center items-center shadow-lg">
              <Text className="text-white text-xs font-bold">{item.postCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopUserItem = ({ item }: { item: TopUser }) => (
    <View className="items-center mr-4">
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
    </View>
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
      <ScrollView>
        {/* Header with back button and options */}
        <View className="p-4 flex-row justify-between items-center">
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Place Profile</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Place Banner */}
        <View className="relative">
          <Image 
            source={{ uri: placeDetail.place_image }}
            className="w-full h-48 bg-gray-200"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute bottom-0 left-0 right-0 h-24"
          />
          <View className="absolute bottom-4 left-4">
            <View className="flex-row items-center">
              <Text className="text-white text-2xl font-bold">{placeDetail.name}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#3b82f6" style={{ marginLeft: 4 }} />
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm opacity-90 ml-1">
                {placeDetail.latitude.toFixed(4)}, {placeDetail.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
         
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-around p-4 bg-white border-t border-b border-gray-100">
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{placeDetail.stats.totalPosts}</Text>
            <Text className="text-gray-500 text-sm">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{placeDetail.stats.uniquePosters}</Text>
            <Text className="text-gray-500 text-sm">Unique Visitors</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-blue-600">{placeDetail.stats.totalPoints}</Text>
            <Text className="text-blue-500 text-sm">Total Points</Text>
          </View>
        </View>

        {/* Combined Visit Reward & Create Post Card */}
        <View className="p-4 bg-white mt-2 border-t border-gray-100">
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                  <Ionicons name="trophy" size={24} color="white" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-900 text-lg">Visit Reward</Text>
                  <Text className="text-gray-600 text-sm">Create a post to earn points</Text>
                </View>
              </View>
              <Text className="text-blue-600 font-bold text-2xl">+{placeDetail.point_value}</Text>
            </View>
            
            <TouchableOpacity 
              className="bg-blue-500 rounded-xl py-3 px-6 items-center"
              onPress={() => router.push({
                pathname: '/screens/CreatePost',
                params: {
                  placeId: placeDetail.id.toString(),
                  latitude: placeDetail.latitude.toString(),
                  longitude: placeDetail.longitude.toString(),
                  pointValue: placeDetail.point_value.toString(),
                }
              })}
            >
              <View className="flex-row items-center">
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Create Post & Earn Points</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Users Section */}
        <View className="mt-2 bg-white border-t border-gray-100 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Top Visitors</Text>
            <TouchableOpacity>
              <Text className="text-blue-600">View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={placeDetail.top_users}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `top-user-${item.id}`}
            renderItem={renderTopUserItem}
            contentContainerStyle={{ paddingLeft: 4 }}
          />
        </View>

        {/* Posts Section */}
        <View className="mt-2 bg-white border-t border-gray-100">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">Recent Posts by Users</Text>
              <TouchableOpacity>
                <Text className="text-blue-600">View All</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Last Post Time */}
          {placeDetail.stats.lastPostTime && (
            <View className="px-4 py-2 bg-gray-50">
              <Text className="text-gray-500 text-sm">
                Last post: {new Date(placeDetail.stats.lastPostTime).toLocaleDateString()} • {placeDetail.stats.totalPosts} total posts
              </Text>
            </View>
          )}
          
          {placeDetail.user_posts && placeDetail.user_posts.length > 0 ? (
            <View className="h-96"> {/* Fixed height container */}
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
              >
                <FlatList
                  data={placeDetail.user_posts}
                  numColumns={3}
                  keyExtractor={(item) => `user-post-${item.userId}`}
                  renderItem={renderPostItem}
                  scrollEnabled={false}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                />
              </ScrollView>
            </View>
          ) : (
            <View className="p-8 items-center">
              <Text className="text-red-500 mb-2">DEBUG: No user posts found</Text>
              <Ionicons name="images-outline" size={48} color="#d1d5db" />
              <Text className="mt-2 text-gray-500 text-center">No posts yet</Text>
              <TouchableOpacity 
                className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
                onPress={() => router.push({
                  pathname: '/screens/CreatePost',
                  params: {
                    placeId: placeDetail.id.toString(),
                    latitude: placeDetail.latitude.toString(),
                    longitude: placeDetail.longitude.toString(),
                    pointValue: placeDetail.point_value.toString(),
                  }
                })}
              >
                <Text className="text-white font-semibold">Be the first to post!</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
     
    </SafeAreaView>
  );
}
