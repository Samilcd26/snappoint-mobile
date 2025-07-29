import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { Modal, ModalBackdrop, ModalContent, ModalBody, ModalHeader } from '@/components/ui/modal';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import { useGetPostComments, useAddComment, useLikeComment } from '@/api/commentApi';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/utils/useTranslation';
import { formatNumber } from '@/utils/formatNumber';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  parentCommentId?: number;
  likeCount: number;
  isLiked: boolean;
  repliesCount: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface RepliesModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  parentComment: Comment;
}

const RepliesModal: React.FC<RepliesModalProps> = ({ isVisible, onClose, postId, parentComment }) => {
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const { data: repliesData, isLoading, error, refetch } = useGetPostComments(postId, page, 20, parentComment.id.toString());
  const addCommentMutation = useAddComment();
  const likeCommentMutation = useLikeComment();

  const handleAddReply = async () => {
    if (!commentText.trim()) return;
    
    try {
      await addCommentMutation.mutateAsync({
        postId,
        comment: { 
          content: commentText.trim(),
          parentId: parentComment.id 
        }
      });
      setCommentText('');
      refetch();
    } catch (error) {
      Alert.alert(t('error'), t('failedToAddComment'));
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      await likeCommentMutation.mutateAsync(commentId.toString());
    } catch (error) {
      Alert.alert(t('error'), t('failedToLikeComment'));
    }
  };

  const loadMoreReplies = () => {
    if (repliesData?.pagination && repliesData.pagination.currentPage < repliesData.pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const renderReplyItem = ({ item }: { item: Comment }) => (
    <View className="p-4 border-b border-gray-100 ml-4">
      <View className="flex-row items-start space-x-3">
        <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
          {item.avatar ? (
            <Image 
              source={{ uri: item.avatar }}
              style={{ width: 32, height: 32 }}
              className="w-full h-full"
            />
          ) : (
            <Text className="text-blue-600 font-bold text-xs">
              {item.firstName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center space-x-2">
            <Text className="font-bold text-gray-900 text-sm">
              {item.firstName} {item.lastName}
            </Text>
            <Text className="text-gray-500 text-xs">
              @{item.username}
            </Text>
            <Text className="text-gray-400 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text className="text-gray-700 mt-1 text-sm">{item.content}</Text>
          <View className="flex-row items-center mt-2 space-x-4">
            <TouchableOpacity 
              className="flex-row items-center space-x-1"
              onPress={() => handleLikeComment(item.id)}
              disabled={likeCommentMutation.isPending}
            >
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={14} 
                color={item.isLiked ? "#ef4444" : "#9ca3af"} 
              />
              <Text className={`text-xs ${item.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {formatNumber(item.likeCount)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
      <Text className="text-gray-500 text-center mt-4">
        {t('noRepliesYet')}
      </Text>
    </View>
  );

    return (
  <Modal isOpen={isVisible} onClose={onClose}>
    <ModalBackdrop />
    <ModalContent className="rounded-2xl bg-white w-[90%] max-w-[400px] mx-auto my-auto p-0 shadow-lg">
      <SafeAreaView>
        <ModalHeader className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center w-full">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              {t('replies')}
            </Text>
            <View className="w-10" />
          </View>
        </ModalHeader>

        <ModalBody className="p-0 max-h-[70vh]">
          {/* Parent Comment */}
          <View className="p-4 border-b border-gray-200 bg-gray-50">
            <View className="flex-row items-start space-x-3">
              <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
                {parentComment.avatar ? (
                  <Image 
                    source={{ uri: parentComment.avatar }}
                    style={{ width: 40, height: 40 }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-blue-600 font-bold">
                    {parentComment.firstName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center space-x-2">
                  <Text className="font-bold text-gray-900">
                    {parentComment.firstName} {parentComment.lastName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    @{parentComment.username}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {new Date(parentComment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-gray-700 mt-1">{parentComment.content}</Text>
              </View>
            </View>
          </View>

          {/* Replies List */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-4 text-gray-600">{t('loadingComments')}...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text className="mt-4 text-red-600 text-center">{t('failedToLoadComments')}</Text>
              <TouchableOpacity 
                onPress={() => refetch()}
                className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">{t('retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={repliesData?.comments || []}
              renderItem={renderReplyItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={repliesData?.comments?.length === 0 ? { flex: 1 } : {}}
              onEndReached={loadMoreReplies}
              onEndReachedThreshold={0.1}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              updateCellsBatchingPeriod={100}
              getItemLayout={(data, index) => ({
                length: 100,
                offset: 100 * index,
                index,
              })}
              ListFooterComponent={() => (
                repliesData?.pagination && repliesData.pagination.currentPage < repliesData.pagination.totalPages ? (
                  <View className="p-4 items-center">
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text className="text-gray-500 text-sm mt-2">{t('loadingMoreComments')}</Text>
                  </View>
                ) : null
              )}
              style={{ maxHeight: 250 }}
            />
          )}

          {/* Add Reply Input */}
          <View className="p-4 border-t border-gray-200">
            <View className="flex-row items-center space-x-2">
              <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
                {user?.profilePicture ? (
                  <Image 
                    source={{ uri: user.profilePicture }}
                    style={{ width: 40, height: 40 }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-blue-600 font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <TextInput
                  placeholder={t('writeReply')}
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-900 max-h-20"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity 
                onPress={handleAddReply}
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className={`p-2 rounded-xl ${
                  commentText.trim() && !addCommentMutation.isPending 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              >
                {addCommentMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={commentText.trim() ? "#ffffff" : "#9ca3af"} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ModalBody>
      </SafeAreaView>
    </ModalContent>
  </Modal>
);
};

export default RepliesModal; 