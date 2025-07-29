import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, Dimensions, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetPostDetail, useGetUserPostsAtPlace, useLikePost } from '@/api/postApi';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import CommentsModal from './CommentsModal';
import { useShowToast } from '@/utils/Toast';
import { formatNumber } from '@/utils/formatNumber';
import { Divider } from '@/components/ui/divider';

// Type for unified post representation
interface UnifiedPost {
  id: string;
  author: string;
  authorAvatar?: string;
  caption: string;
  imageUrls: string[];
  likes: number;
  comments: number;
  timestamp: string;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  isLiked: boolean;
}

const PostDetailScreen = () => {
  const params = useLocalSearchParams<{
    postId?: string;
    userId?: string;
    placeId?: string; 
  }>();

  

  const { showToast } = useShowToast();
  
  const router = useRouter();
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
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
  } = useGetPostDetail(params.postId );

  const { 
    posts: userPostsAtPlace, 
    isLoading: isMultiplePostsLoading, 
    error: multiplePostsError 
  } = useGetUserPostsAtPlace(
    params.userId , 
    params.placeId ,
    1, // page
    30, // pageSize
  );

  const goToUserProfile = (user: any) => {
    if (user.authorId) {
      router.push(`/screens/UserProfileScreen?userId=${user.authorId}`);
    }
    else {
     showToast({
      description: 'User not found',
      action: 'error',
    });
    }
  };

  // Calculate local posts directly with useMemo to prevent infinite loops
  const localPosts = useMemo(() => {
    if (shouldFetchSinglePost && post) {
      return [{
        id: post.id.toString(),
        author: `${post.user.firstName} ${post.user.lastName}`,
        authorId: post.user.id,
        authorAvatar: post.user.avatar,
        caption: post.caption,
        imageUrls: post.mediaItems.map(item => item.mediaUrl),
        likes: post.interaction.likesCount,
        comments: post.interaction.commentsCount || 0,
        timestamp: new Date(post.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        location: {
          name: post.place.name,
          latitude: post.latitude,
          longitude: post.longitude
        },
        isLiked: post.interaction.isLiked
      }];
    } else if (shouldFetchMultiplePosts && userPostsAtPlace) {
      return userPostsAtPlace.map(postSummary => ({
        id: postSummary.id.toString(),
        author: `${postSummary.user.firstName} ${postSummary.user.lastName}`,
        authorId: postSummary.user.id,
        authorAvatar: postSummary.user.avatar,
        caption: postSummary.caption,
        imageUrls: [postSummary.thumbnailUrl],
        likes: postSummary.interaction.likesCount,
        comments: postSummary.interaction.commentsCount || 0,
        timestamp: new Date(postSummary.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        location: {
          name: postSummary.place.name,
          latitude: postSummary.latitude,
          longitude: postSummary.longitude
        },
        isLiked: postSummary.interaction.isLiked
      }));
    }
    return [];
  }, [shouldFetchSinglePost, shouldFetchMultiplePosts, post, userPostsAtPlace]);

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
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
        <Pressable onPress={() => goToUserProfile(post)}>
        <Text className="font-bold text-gray-900">{post.author}</Text>
        </Pressable>
        {post.location && (
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-500 text-sm">{post.location.name}</Text>
            <Text className="text-gray-500 text-sm">•</Text>
            <Text className="text-gray-500 text-sm">{post.timestamp}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPostImages = (post: UnifiedPost) => {
    const windowWidth = Dimensions.get('window').width;
    let lastTap = 0;

    const handleDoubleTap = () => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (now - lastTap < DOUBLE_PRESS_DELAY) {
        handleLikePost(post.id);
      }
      lastTap = now;
    };
    
    return (
      <FlatList
        data={post.imageUrls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        keyExtractor={(item: string, index: number) => `image-${post.id}-${index}`}
        renderItem={({ item, index }: { item: string; index: number }) => (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={handleDoubleTap}
            className="relative"
          >
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
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderPostActions = (post: UnifiedPost) => (
    <View className="bg-white border-t border-gray-200">
      <View className="flex-row justify-between p-6">
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => handleLikePost(post.id)}
            className="items-center"
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={post.isLiked ? "#ef4444" : "#3b82f6"} 
            />
            <Text className={`text-xs mt-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
              {formatNumber(post.likes)}
            </Text>
          </TouchableOpacity>
          
          <Divider orientation="vertical" className="h-10 bg-gray-300" />
          
          <TouchableOpacity 
            onPress={() => handleOpenComments(post.id)}
            className="items-center"
          >
            <Ionicons name="chatbubble-outline" size={28} color="#3b82f6" />
            <Text className="text-xs mt-2 text-gray-500">
              {formatNumber(post.comments)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPostContent = (post: UnifiedPost) => (
    <View>
      {/* Caption */}
      {post.caption && (
        <Text className="px-4 py-2 text-gray-900 bg-white">
          {post.caption}
        </Text>
      )}
    </View>
  );

  const renderSinglePost = () => {
    if (!localPosts.length) return null;
    const currentPost = localPosts[0];

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

    const renderPostItem = ({ item: post }: { item: UnifiedPost }) => (
      <View className="mb-6">
        {renderPostHeader(post)}
        {renderPostImages(post)}
        {renderPostActions(post)}
        {renderPostContent(post)}
        {/* Separator between posts */}
        <View className="h-2 bg-gray-100" />
      </View>
    );

    return (
      <FlatList
        data={localPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={5}
        initialNumToRender={1}
        getItemLayout={(data, index) => ({
          length: 600, // Approximate height of each post
          offset: 600 * index,
          index,
        })}
      />
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
            {/* TODO: Add options */}
            {/*
            <Ionicons name="ellipsis-horizontal" size={24} color="#3b82f6" />
            */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {shouldFetchMultiplePosts ? renderMultiplePosts() : renderSinglePost()}
      
      {/* Comments Modal */}
      <CommentsModal
        isVisible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        postId={selectedPostId}
      />
    </SafeAreaView>
  );
};

export default PostDetailScreen;