import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetPostDetail, useGetUserPostsAtPlace, useLikePost } from '@/api/postApi';
import { SafeAreaView } from '@/components/ui/safe-area-view';

// Type for unified post representation
interface UnifiedPost {
  id: string;
  author: string;
  authorAvatar?: string;
  caption: string;
  imageUrls: string[];
  likes: number;
  timestamp: string;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

const PostDetailScreen = () => {
  const params = useLocalSearchParams<{
    postId?: string;
    userId?: string;
    placeId?: string; 
  }>();
  
  const router = useRouter();
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Record<string, number>>({});
  const likePostMutation = useLikePost();

  // Determine which API to use based on params - memoized to prevent infinite loops
  const shouldFetchSinglePost = useMemo(() => 
    params.postId && !params.userId && !params.placeId, 
    [params.postId, params.userId, params.placeId]
  );
  
  const shouldFetchMultiplePosts = useMemo(() => 
    params.userId && params.placeId, 
    [params.userId, params.placeId]
  );

  // API calls
  const { 
    post, 
    isLoading: isSinglePostLoading, 
    error: singlePostError 
  } = useGetPostDetail(params.postId || '');

  const { 
    posts: userPostsAtPlace, 
    isLoading: isMultiplePostsLoading, 
    error: multiplePostsError 
  } = useGetUserPostsAtPlace(params.userId || '', params.placeId || '');

  // Calculate local posts directly with useMemo to prevent infinite loops
  const localPosts = useMemo(() => {
    if (shouldFetchSinglePost && post) {
      return [{
        id: post.id.toString(),
        author: `${post.user.firstName} ${post.user.lastName}`,
        authorAvatar: post.user.avatar,
        caption: post.caption,
        imageUrls: post.mediaItems.map(item => item.mediaUrl),
        likes: post.interaction.likesCount + (likedPosts[post.id.toString()] || 0),
        timestamp: new Date(post.createdAt).toLocaleDateString(),
        location: {
          name: post.place.name,
          latitude: post.latitude,
          longitude: post.longitude
        }
      }];
    } else if (shouldFetchMultiplePosts && userPostsAtPlace) {
      return userPostsAtPlace.map(postSummary => ({
        id: postSummary.id.toString(),
        author: `${postSummary.user.firstName} ${postSummary.user.lastName}`,
        authorAvatar: postSummary.user.avatar,
        caption: postSummary.caption,
        imageUrls: [postSummary.thumbnailUrl],
        likes: postSummary.interaction.likesCount + (likedPosts[postSummary.id.toString()] || 0),
        timestamp: new Date(postSummary.createdAt).toLocaleDateString(),
        location: {
          name: postSummary.place.name,
          latitude: postSummary.latitude,
          longitude: postSummary.longitude
        }
      }));
    }
    return [];
  }, [shouldFetchSinglePost, shouldFetchMultiplePosts, post, userPostsAtPlace, likedPosts]);

  const handleLikePost = async (postId: string) => {
    // Optimistically update the likes
    setLikedPosts(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
    
    try {
      await likePostMutation.mutateAsync(postId);
    } catch (error) {
      // Revert on error
      setLikedPosts(prev => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 0) - 1)
      }));
      console.error('Error liking post:', error);
    }
  };

  const renderPostHeader = (post: UnifiedPost) => (
    <View className="flex-row items-center p-4 bg-white">
      <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
        {post.authorAvatar ? (
          <Image 
            source={{ uri: post.authorAvatar }}
            style={{ width: 40, height: 40 }}
            className="w-full h-full"
          />
        ) : (
          <Text className="text-blue-600 font-bold">{post.author.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View className="ml-3">
        <Text className="font-bold text-gray-900">{post.author}</Text>
        {post.location && (
          <Text className="text-gray-500 text-sm">{post.location.name}</Text>
        )}
      </View>
    </View>
  );

  const renderPostImages = (post: UnifiedPost) => {
    const windowWidth = Dimensions.get('window').width;
    
    return (
      <FlatList
        data={post.imageUrls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        keyExtractor={(item: string, index: number) => `image-${post.id}-${index}`}
        renderItem={({ item, index }: { item: string; index: number }) => (
          <View className="relative">
            <Image
              source={{ uri: item }}
              style={{ width: windowWidth, height: windowWidth }}
              resizeMode="cover"
              className="bg-gray-100"
            />
            {post.imageUrls.length > 1 && (
              <View className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 shadow-sm">
                <Text className="text-blue-600 font-semibold">{index + 1}/{post.imageUrls.length}</Text>
              </View>
            )}
          </View>
        )}
      />
    );
  };

  const renderPostActions = (post: UnifiedPost) => (
    <View className="flex-row justify-between p-4 bg-white border-t border-gray-200">
      <View className="flex-row space-x-4">
        <TouchableOpacity onPress={() => handleLikePost(post.id)}>
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
  );

  const renderPostContent = (post: UnifiedPost) => (
    <View>
      {/* Likes */}
      <Text className="px-4 py-2 font-bold text-gray-900 bg-white">
        {post.likes} likes
      </Text>

      {/* Caption */}
      <View className="p-4 bg-white">
        <Text className="text-gray-900">
          <Text className="font-bold">{post.author}</Text> {post.caption}
        </Text>
        <Text className="text-gray-500 text-sm mt-2">
          {post.timestamp}
        </Text>
      </View>

      {/* Comments Section */}
      <View className="p-4 border-t border-gray-200 bg-white">
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
    </View>
  );

  const renderSinglePost = () => {
    if (!localPosts.length) return null;
    const currentPost = localPosts[selectedPostIndex];

    return (
      <ScrollView className="flex-1 bg-white">
        {renderPostHeader(currentPost)}
        {renderPostImages(currentPost)}
        {renderPostActions(currentPost)}
        {renderPostContent(currentPost)}
      </ScrollView>
    );
  };

  const renderMultiplePosts = () => {
    if (!localPosts.length) return null;

    return (
      <View className="flex-1">
        {/* Post Navigation */}
        {localPosts.length > 1 && (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="text-center text-gray-600 font-semibold">
              Post {selectedPostIndex + 1} of {localPosts.length}
            </Text>
            <View className="flex-row justify-center mt-2 space-x-4">
              <TouchableOpacity 
                onPress={() => setSelectedPostIndex(Math.max(0, selectedPostIndex - 1))}
                disabled={selectedPostIndex === 0}
                className={`p-2 ${selectedPostIndex === 0 ? 'opacity-30' : ''}`}
              >
                <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedPostIndex(Math.min(localPosts.length - 1, selectedPostIndex + 1))}
                disabled={selectedPostIndex === localPosts.length - 1}
                className={`p-2 ${selectedPostIndex === localPosts.length - 1 ? 'opacity-30' : ''}`}
              >
                <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {renderSinglePost()}
      </View>
    );
  };

  const isLoading = isSinglePostLoading || isMultiplePostsLoading;
  const error = singlePostError || multiplePostsError;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading posts...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-red-600 text-center">Failed to load posts</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!localPosts.length) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Ionicons name="image-outline" size={48} color="#9ca3af" />
        <Text className="mt-4 text-gray-600 text-center">No posts found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            {shouldFetchMultiplePosts ? 'Posts at Location' : 'Post Details'}
          </Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {shouldFetchMultiplePosts ? renderMultiplePosts() : renderSinglePost()}
    </SafeAreaView>
  );
};

export default PostDetailScreen;