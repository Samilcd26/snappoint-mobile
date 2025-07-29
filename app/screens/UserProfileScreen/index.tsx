import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useGetUserPosts } from '@/api/postApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker as MapMarker } from 'react-native-maps';
import { useAuthStore } from '@/stores';
import { useGetUser, useFollowUser } from '@/api/userApi';
import { useGetNotifications } from '@/api/notificationApi';
import { PostSummary } from '@/types/post.types';
import { useShowToast } from '@/utils/Toast';
import { formatNumber } from '@/utils/formatNumber';
import NotificationModal from './NotificationModal';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogBody, AlertDialogBackdrop } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Divider } from '@/components/ui/divider';

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId: string;
  }>();
  const { showToast } = useShowToast();

  // Get authenticated user and logout function from Zustand store
  const { user: currentUser, logout } = useAuthStore();
  
  // Use params.userId if available, otherwise use current user's ID
  const userId = params.userId ? Number(params.userId) : currentUser?.id;

  
  const { data: userData, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useGetUser(userId!);
  
  console.log("userId",userData);
  
  // Follow user mutation
  const followUser = useFollowUser();
  
  // Notifications for bell icon
  const { unreadCount, refetch: refetchNotifications } = useGetNotifications(1, 20, undefined, false);

  // Tab state
  const [activeTab, setActiveTab] = useState('posts');
  
  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Unfollow alert dialog state
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  
  // Map reference
  const mapRef = useRef<MapView>(null);
  
  // Screen dimensions
  const windowWidth = Dimensions.get('window').width;
  const imageSize = windowWidth / 3 - 2; // 3 images per row with small gap
  
  // Fetch posts
  const { posts, isLoading, error, refetch: refetchPosts } = useGetUserPosts(userId ? userId.toString() : "");
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data, posts and notifications
      await Promise.all([
        refetchUser(),
        refetchPosts(),
        refetchNotifications()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  

  
  const handlePostPress = (userPost: PostSummary) => {
    router.push({
      pathname: '/screens/PostDetailScreen',
      params: {
        postId: userPost.id.toString(),
      },
    });
  };

  const handleMapNavigateToPost = (post: PostSummary) => {
    if (mapRef.current && post.latitude && post.longitude) {
      mapRef.current.animateToRegion({
        latitude: post.latitude,
        longitude: post.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleFollowPress = async () => {
    if (!userId) return;
    
    // If already following, show unfollow confirmation dialog
    if (user.isFollowing) {
      setShowUnfollowDialog(true);
      return;
    }
    
    // Otherwise, send follow request
    try {
      const response = await followUser.mutateAsync(userId.toString());
      
      if (response.success) {
        showToast({
          description: response.data.message,
          action: 'success',
        });
      }
    } catch (error: any) {
      showToast({
        description: error?.error || 'Failed to follow user',
        action: 'error',
      });
    }
  };

  const handleUnfollowConfirm = async () => {
    if (!userId) return;
    
    setShowUnfollowDialog(false);
    
    try {
      const response = await followUser.mutateAsync(userId.toString());
      
      if (response.success) {
        showToast({
          description: response.data.message,
          action: 'success',
        });
      }
    } catch (error: any) {
      showToast({
        description: error?.error || 'Failed to unfollow user',
        action: 'error',
      });
    }
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

  
  const handleMessagePress = () => {
    if (!user.isFollowing && !user.isOwnProfile) {
      showToast({
        description: 'You need to follow this user to send a message',
        action: 'error',
      });
      return;
    }
    
    // TODO: Navigate to message screen
    showToast({
      description: 'Message feature coming soon',
      action: 'info',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']} // Android
            tintColor="#3b82f6" // iOS
          />
        }
      >
        {/* Header with back button and options */}
        <View className="p-4 flex-row justify-between items-center">
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</Text>
          {user.isOwnProfile ? (
            <View className="flex-row items-center">
              {/* Notification Bell */}
              <TouchableOpacity 
                className="p-2 mr-2" 
                onPress={() => setShowNotificationModal(true)}
              >
                <View className="relative">
                  <Ionicons name="notifications-outline" size={24} color="#3b82f6" />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {/* Logout */}
              <TouchableOpacity className="p-2" onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Profile Header */}
        <View className="px-4 py-2">
          <View className="flex-row items-center justify-between">
            {/* Sol taraf - Followers & Following */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center justify-around w-full">
                <Box>
                  <TouchableOpacity 
                    className="items-center"
                    onPress={() => showToast({
                      description: `${user.followersCount.toLocaleString()} Followers`,
                      action: 'info',
                    })}
                  >
                    <Text className="text-lg font-bold text-gray-900">{formatNumber(user.followersCount)}</Text>
                    <Text className="text-gray-500 text-xs">Followers</Text>
                  </TouchableOpacity>
                </Box>
                <Divider
          orientation="vertical"
          className="mx-2 h-[20px]  bg-gray-500"
        />
                <Box>
                  <TouchableOpacity 
                    className="items-center"
                    onPress={() => showToast({
                      description: `${user.followingCount.toLocaleString()} Following`,
                      action: 'info',
                    })}
                  >
                    <Text className="text-lg font-bold text-gray-900">{formatNumber(user.followingCount)}</Text>
                    <Text className="text-gray-500 text-xs">Following</Text>
                  </TouchableOpacity>
                </Box>
              </View>
            </View>
            
            {/* Orta - Profile Picture ve Username */}
            <View className="items-center mx-6">
              <Image 
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full bg-gray-200"
              />
              <View className="flex-row items-center mt-2">
                <Text className="text-base font-semibold text-gray-900">@{user.username}</Text>
                {user.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3b82f6" className="ml-1" />
                )}
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            
            {/* Sağ taraf - Points & Posts */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center justify-around w-full">
                <Box>
                  <TouchableOpacity 
                    className="items-center"
                    onPress={() => showToast({
                      description: `${user.totalPoints.toLocaleString()} Points`,
                      action: 'info',
                    })}
                  >
                    <Text className="text-lg font-bold text-blue-600">{formatNumber(user.totalPoints)}</Text>
                    <Text className="text-blue-500 text-xs">Points</Text>
                  </TouchableOpacity>
                </Box>
                <Divider
          orientation="vertical"
          className="mx-2 h-[20px]  bg-gray-500"
        />
                <Box>
                  <TouchableOpacity 
                    className="items-center"
                    onPress={() => showToast({
                      description: `${user.postsCount.toLocaleString()} Posts`,
                      action: 'info',
                    })}
                  >
                    <Text className="text-lg font-bold text-gray-900">{formatNumber(user.postsCount)}</Text>
                    <Text className="text-gray-500 text-xs">Posts</Text>
                  </TouchableOpacity>
                </Box>
              </View>
            </View>
          </View>
          
          {/* Bio and additional info */}
          <View className="mt-4">
            {user.bio && (
              <Text className="text-gray-600 text-sm mb-2">{user.bio}</Text>
            )}
            <View className="flex-row items-center flex-wrap">
              {user.emailVerified && (
                <View className="flex-row items-center mr-3 mb-1">
                  <Ionicons name="mail" size={12} color="#10b981" />
                  <Text className="text-green-600 text-xs ml-1">Email verified</Text>
                </View>
              )}
              {user.phoneVerified && (
                <View className="flex-row items-center mr-3 mb-1">
                  <Ionicons name="phone-portrait" size={12} color="#10b981" />
                  <Text className="text-green-600 text-xs ml-1">Phone verified</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Action Buttons - En altta */}
          <View className="mt-4">
            {user.isOwnProfile ? (
              <TouchableOpacity 
                className="bg-gray-100 rounded-xl py-3 px-4 items-center flex-row justify-center"
                onPress={() => router.push('/screens/EditProfileScreen')}
              >
                <Ionicons name="pencil" size={18} color="#374151" style={{ marginRight: 8 }} />
                <Text className="font-semibold text-gray-800">Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className={`flex-1 rounded-xl py-3 px-4 items-center flex-row justify-center ${
                    user.isFollowing ? 'bg-gray-100' : user.isFollowPending ? 'bg-yellow-100' : 'bg-blue-500'
                  }`}
                  onPress={handleFollowPress}
                  disabled={followUser.isPending}
                >
                  <Ionicons 
                    name={user.isFollowing ? "person-remove" : user.isFollowPending ? "hourglass" : "person-add"} 
                    size={18} 
                    color={user.isFollowing ? '#374151' : user.isFollowPending ? '#d97706' : 'white'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text className={`font-semibold ${
                    user.isFollowing ? 'text-gray-800' : user.isFollowPending ? 'text-yellow-700' : 'text-white'
                  }`}>
                    {followUser.isPending ? 'Loading...' : user.isFollowPending ? 'Requested' : user.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 rounded-xl py-3 px-4 items-center flex-row justify-center ${
                    user.isFollowing ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  onPress={handleMessagePress}
                  disabled={!user.isFollowing}
                >
                  <Ionicons 
                    name="chatbubble" 
                    size={18} 
                    color={user.isFollowing ? 'white' : '#9CA3AF'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text className={`font-semibold ${
                    user.isFollowing ? 'text-white' : 'text-gray-400'
                  }`}>
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View className="flex-row border-t border-b border-gray-200 mt-2">
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
            ) : user.isPrivate && !user.isFollowing && !user.isOwnProfile ? (
              <View className="py-10 items-center">
                <Ionicons name="lock-closed-outline" size={60} color="#3b82f6" />
                <Text className="text-gray-700 text-center mt-4 font-semibold">
                  This Account is Private
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-6">
                  Follow @{user.username} to see their posts
                </Text>
                {!user.isFollowPending && (
                  <TouchableOpacity 
                    className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
                    onPress={handleFollowPress}
                    disabled={followUser.isPending}
                  >
                    <Text className="text-white font-semibold">
                      {followUser.isPending ? 'Sending...' : 'Send Follow Request'}
                    </Text>
                  </TouchableOpacity>
                )}
                {user.isFollowPending && (
                  <View className="mt-6 bg-yellow-100 px-6 py-3 rounded-xl">
                    <Text className="text-yellow-700 font-semibold">
                      Follow Request Sent
                    </Text>
                  </View>
                )}
              </View>
            ) : posts.length === 0 ? (
              <View className="py-10 items-center">
                <Ionicons name="images-outline" size={60} color="#3b82f6" />
                <Text className="text-gray-500 text-center mt-4">
                  No posts yet
                </Text>
              
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
            {isLoading ? (
              <View className="h-80 w-full justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-500">Loading map...</Text>
              </View>
            ) : error ? (
              <View className="h-80 w-full justify-center items-center">
                <Ionicons name="alert-circle-outline" size={60} color="#3b82f6" />
                <Text className="mt-4 text-gray-700 text-center">
                  Error loading map data
                </Text>
              </View>
            ) : user.isPrivate && !user.isFollowing && !user.isOwnProfile ? (
              <View className="h-80 w-full justify-center items-center">
                <Ionicons name="lock-closed-outline" size={60} color="#3b82f6" />
                <Text className="text-gray-700 text-center mt-4 font-semibold">
                  This Account is Private
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-6">
                  Follow @{user.username} to see their location posts
                </Text>
              </View>
            ) : (
              <View className="h-80 w-full">
                <MapView
                  ref={mapRef}
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: posts.length > 0 && posts[0].latitude ? posts[0].latitude : 41.0082,
                    longitude: posts.length > 0 && posts[0].longitude ? posts[0].longitude : 28.9784,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {posts
                    .filter(post => post.latitude && post.longitude && !isNaN(post.latitude) && !isNaN(post.longitude))
                    .map((post) => (
                      <MapMarker
                        key={post.id}
                        coordinate={{
                          latitude: post.latitude,
                          longitude: post.longitude,
                        }}
                        title={post.place?.name || 'Unknown Place'}
                        description={post.caption || 'No caption'}
                        pinColor="#3b82f6"
                        onPress={() => handlePostPress(post)}
                      />
                    ))}
                </MapView>
              </View>
            )}
            
            {/* Posts List */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-4">Posts by Location</Text>
              
              {user.isPrivate && !user.isFollowing && !user.isOwnProfile ? (
                <View className="py-10 items-center">
                  <Ionicons name="lock-closed-outline" size={60} color="#3b82f6" />
                  <Text className="text-gray-700 text-center mt-4 font-semibold">
                    This Account is Private
                  </Text>
                  <Text className="text-gray-500 text-center mt-2 px-6">
                    Follow @{user.username} to see their posts
                  </Text>
                </View>
              ) : posts.length === 0 ? (
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
                    onPress={() => handleMapNavigateToPost(post)}
                  >
                    <Image 
                      source={{ uri: post.thumbnailUrl }}
                      className="w-12 h-12 rounded-lg mr-3 bg-gray-200"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {post.place.name}
                      </Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {post.caption}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="bg-blue-50 px-2 py-1 rounded-full mb-1">
                        <Text className="text-blue-600 font-semibold text-xs">
                          {post.interaction.likesCount} likes
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
                    <TouchableOpacity 
                      className="ml-2 p-2"
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePostPress(post);
                      }}
                    >
                      <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </View>
            
            {/* Bottom spacing for scroll */}
            <View className="h-20" />
          </View>
        )}
      </ScrollView>
      
      {/* Notification Modal */}
      <NotificationModal 
        isVisible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onNotificationUpdate={refetchNotifications}
      />
      
      {/* Unfollow Confirmation Dialog */}
      <AlertDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text className="text-gray-900 font-semibold text-lg">
              Unfollow {user.firstName} {user.lastName}?
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text className="text-gray-600 text-sm">
              Are you sure you want to unfollow @{user.username}? You will no longer see their posts in your feed.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="">
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowUnfollowDialog(false)}
              size="sm"
              className="mr-3"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button 
              size="sm" 
              onPress={handleUnfollowConfirm}
              className="bg-red-500"
            >
              <ButtonText>Unfollow</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
