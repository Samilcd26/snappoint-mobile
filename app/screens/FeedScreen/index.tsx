import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import PostDetailModal from '@/app/components/PostDetailModal';
import { Post } from '@/types/post.types';
import { useGetPosts, useLikePost } from '@/api/postApi';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';


export default function FeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: posts, isLoading, error } = useGetPosts();
  const likePostMutation = useLikePost();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const imageSize = windowWidth / 3 - 2; // 3 images per row with small gap

  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  }, [queryClient]);

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const navigateToCreatePost = () => {
    router.push('/screens/CreatePost');
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      onPress={() => handlePostPress(item)}
      className="m-[1px]"
    >
      <Image 
        source={{ uri: item.imageUrls[0] }} // Use the first image from the array
        style={{ width: imageSize, height: imageSize }}
        className="bg-gray-200"
      />
      {item.location && (
        <View className="absolute bottom-1 left-1 bg-black bg-opacity-50 rounded-full p-1">
          <Ionicons name="location" size={12} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">SnapPoint</Text>
          <TouchableOpacity 
            onPress={navigateToCreatePost}
            className="bg-blue-50 p-3 rounded-xl"
          >
            <Ionicons name="add" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Grid */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-500">Loading posts...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-4 bg-white">
          <Ionicons name="alert-circle-outline" size={60} color="#3b82f6" />
          <Text className="mt-4 text-gray-700 text-center">
            Error loading posts. Please try again.
          </Text>
          <TouchableOpacity 
            onPress={onRefresh}
            className="mt-6 px-6 py-3 bg-blue-50 rounded-xl"
          >
            <Text className="text-blue-600 font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-10 bg-white">
              <Ionicons name="images-outline" size={60} color="#3b82f6" />
              <Text className="text-gray-500 text-center mt-4 text-lg">
                No posts yet
              </Text>
              <TouchableOpacity 
                onPress={navigateToCreatePost}
                className="mt-6 px-6 py-3 bg-blue-50 rounded-xl"
              >
                <Text className="text-blue-600 font-semibold">Create Your First Post</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ 
            flexGrow: 1, 
            ...((!posts || posts.length === 0) && { justifyContent: 'center' }) 
          }}
        />
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </SafeAreaView>
  );
}
