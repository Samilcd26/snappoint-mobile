import React, { useState } from 'react';
import { View, Text, Modal, Image, TouchableOpacity, ScrollView, Dimensions, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/types/post.types';
import { useLikePost } from '@/api/postApi';
import { SafeAreaView } from '@/components/ui/safe-area-view';

interface PostDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  post: Post | null;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isVisible, onClose, post }) => {
  const [localPost, setLocalPost] = useState<Post | null>(null);
  const likePostMutation = useLikePost();
  
  // Initialize localPost when post changes
  React.useEffect(() => {
    if (post) {
      setLocalPost(post);
    }
  }, [post]);
  if (!localPost) return null;
  
  const handleLikePost = async () => {
    if (!localPost) return;
    
    // Optimistically update the UI
    setLocalPost({
      ...localPost,
      likes: localPost.likes + 1
    });
    
    try {
      // Call the API to like the post
      await likePostMutation.mutateAsync(localPost.id);
    } catch (error) {
      // Revert on error
      setLocalPost({
        ...localPost,
        likes: localPost.likes - 1
      });
      console.error('Error liking post:', error);
    }
  };

  const windowWidth = Dimensions.get('window').width;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Post Details</Text>
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 bg-white">
          {/* Author Info */}
          <View className="flex-row items-center p-4 bg-white">
            <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
              {localPost.authorAvatar ? (
                <Image 
                  source={{ uri: localPost.authorAvatar }}
                  style={{ width: 40, height: 40 }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-blue-600 font-bold">{localPost.author.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View className="ml-3">
              <Text className="font-bold text-gray-900">{localPost.author}</Text>
              {localPost.location && (
                <Text className="text-gray-500 text-sm">{localPost.location.name}</Text>
              )}
            </View>
          </View>

          {/* Images */}
          <FlatList
            data={localPost.imageUrls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
            keyExtractor={(item: string, index: number) => `detail-image-${index}`}
            renderItem={({ item, index }: { item: string; index: number }) => (
              <View className="relative">
                <Image
                  source={{ uri: item }}
                  style={{ width: windowWidth, height: windowWidth }}
                  resizeMode="cover"
                  className="bg-gray-100"
                />
                {localPost.imageUrls.length > 1 && (
                  <View className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 shadow-sm">
                    <Text className="text-blue-600 font-semibold">{index + 1}/{localPost.imageUrls.length}</Text>
                  </View>
                )}
              </View>
            )}
          />

          {/* Actions */}
          <View className="flex-row justify-between p-4 bg-white border-t border-gray-200">
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={handleLikePost}>
                <Ionicons 
                  name={likePostMutation.isPending ? "heart" : "heart-outline"} 
                  size={28} 
                  color="#3b82f6" 
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="chatbubble-outline" size={28} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="paper-plane-outline" size={28} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={28} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Likes */}
          <Text className="px-4 py-2 font-bold text-gray-900 bg-white">
            {localPost.likes} likes
          </Text>

          {/* Caption */}
          <View className="p-4 bg-white">
            <Text className="text-gray-900">
              <Text className="font-bold">{localPost.author}</Text> {localPost.caption}
            </Text>
            <Text className="text-gray-500 text-sm mt-2">
              {localPost.timestamp}
            </Text>
          </View>

          {/* Comments Section (Placeholder) */}
          <View className="p-4 border-t border-gray-200 bg-white mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-semibold">Comments</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">View all</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-start space-x-3">
              <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
                <Text className="text-blue-600 font-bold text-xs">U</Text>
              </View>
              <View className="flex-1">
                <View className="bg-gray-50 rounded-xl p-3">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-gray-900 font-semibold">user123</Text>
                    <Text className="text-gray-400 text-xs">1 hour ago</Text>
                  </View>
                  <Text className="text-gray-700 mt-1">Great photo! The lighting is perfect 👌</Text>
                </View>
                <View className="flex-row items-center mt-2 space-x-4">
                  <TouchableOpacity>
                    <Text className="text-gray-500 text-sm">Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-gray-500 text-sm">Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          
          {/* Add Comment Input */}
          <View className="px-4 pb-6 bg-white">
            <View className="flex-row items-center space-x-2">
              <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
                <Text className="text-blue-600 font-bold text-xs">U</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <TextInput
                  placeholder="Add a comment..."
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-900"
                />
              </View>
              <TouchableOpacity className="bg-blue-50 p-2 rounded-xl">
                <Ionicons name="send" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default PostDetailModal;
