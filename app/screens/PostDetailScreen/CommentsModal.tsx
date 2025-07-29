import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert, Pressable } from 'react-native';
import { Modal, ModalBackdrop, ModalContent, ModalBody, ModalHeader } from '@/components/ui/modal';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import { useGetPostComments, useAddComment } from '@/api/commentApi';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/utils/useTranslation';
import { useShowToast } from '@/utils/Toast';
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

interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isVisible, onClose, postId }) => {
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { showToast } = useShowToast();
  
  const { data: commentsData, isLoading, error, refetch } = useGetPostComments(postId, page, 20);
  const addCommentMutation = useAddComment();

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    console.log('Adding comment:', { postId, content: commentText.trim(), parentId: replyingTo?.id });
    
    try {
      await addCommentMutation.mutateAsync({
        postId,
        comment: { 
          content: commentText.trim(),
          parentId: replyingTo?.id 
        }
      });
      setCommentText('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast({description: t('failedToAddComment'), action: 'error'});
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const goToUserProfile = (user: any) => {
    console.log(user);
    
    //router.push(`/user/${comment.userId}`);
  };

  const toggleReplies = (comment: Comment) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(comment.id)) {
      newExpanded.delete(comment.id);
    } else {
      newExpanded.add(comment.id);
    }
    setExpandedComments(newExpanded);
  };

  // Inline replies component
  const InlineReplies = ({ commentId, postId }: { commentId: number; postId: string }) => {
    const { data: repliesData } = useGetPostComments(postId, 1, 10, commentId.toString());
    
    if (!repliesData?.comments?.length) return null;
    
    return (
      <View className="py-2">
        {repliesData.comments.map((reply) => (
          <View key={reply.id} className="flex-row items-start space-x-3 py-2">
            <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
              {reply.avatar ? (
                <Image 
                  source={{ uri: reply.avatar }}
                  style={{ width: 32, height: 32 }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-blue-600 font-bold text-xs">
                  {reply.firstName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <View>
                  <Pressable onPress={() => goToUserProfile(reply)}>
                    <Text className="font-semibold text-gray-900 text-sm">
                      {reply.firstName} {reply.lastName}
                    </Text>
                  </Pressable>
                  <Text className="text-gray-400 text-xs">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 text-sm mt-1">{reply.content}</Text>
              <View className="flex-row items-center mt-2 space-x-4">
                <TouchableOpacity onPress={() => handleReply(reply)}>
                  <Text className="text-gray-500 text-xs">{t('reply')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const loadMoreComments = () => {
    if (commentsData?.pagination && commentsData.pagination.currentPage < commentsData.pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const renderCommentItem = useCallback(({ item }: { item: Comment }) => (
    <View className="border-b border-gray-100">
      <View className="p-4">
        <View className="flex-row items-start space-x-3">
          <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden">
            {item.avatar ? (
              <Image 
                source={{ uri: item.avatar }}
                style={{ width: 40, height: 40 }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-blue-600 font-bold">
                {item.firstName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View>
                <TouchableOpacity onPress={() => goToUserProfile(item)}>
                  <Text className="font-bold text-gray-900">
                    {item.firstName} {item.lastName}
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-400 text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 mt-2">{item.content}</Text>
            <View className="flex-row items-center mt-3 space-x-6">
              <TouchableOpacity onPress={() => handleReply(item)}>
                <Text className="text-gray-500 text-sm">{t('reply')}</Text>
              </TouchableOpacity>
              {item.repliesCount > 0 && (
                <TouchableOpacity onPress={() => toggleReplies(item)}>
                  <Text className="text-blue-500 text-sm">
                    {expandedComments.has(item.id) 
                      ? t('hideReplies') 
                      : `${t('showReplies')} (${formatNumber(item.repliesCount)})`
                    }
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      
      {/* Show inline replies if expanded */}
      {expandedComments.has(item.id) && (
        <View className="ml-12 border-l-2 border-gray-200 pl-4">
          <InlineReplies commentId={item.id} postId={postId} />
        </View>
      )}
    </View>
  ), [handleReply, toggleReplies, expandedComments, postId]);

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
      <Text className="text-gray-500 text-center mt-4">
        {t('noCommentsYet')}
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        {t('beTheFirstToComment')}
      </Text>
    </View>
  );

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="rounded-2xl bg-white w-[90%] max-w-[400px] h-[80%] mx-auto my-auto p-0 shadow-lg">
        <SafeAreaView className="flex-1">
          {/* Fixed Header */}
          <ModalHeader className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center w-full">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#3b82f6" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">
                {t('comments')}
              </Text>
              <View className="w-10" />
            </View>
          </ModalHeader>

          {/* Scrollable Comments List */}
          <View className="flex-1">
            <FlatList
              data={commentsData?.comments || []}
              renderItem={renderCommentItem}
              keyExtractor={(item) => item.id.toString()}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              getItemLayout={(data, index) => ({
                length: 120,
                offset: 120 * index,
                index,
              })}
              ListEmptyComponent={renderEmptyState}
              onEndReached={loadMoreComments}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={commentsData?.comments?.length === 0 ? { flex: 1 } : {}}
            />
          </View>

          {/* Fixed Footer */}
          <View className="p-4 border-t border-gray-200 bg-white">
            {replyingTo && (
              <View className="mb-3 p-3 bg-blue-50 rounded-lg">
                <View className="flex-row items-center justify-between">
                  <Text className="text-blue-600 text-sm">
                    {t('replyingTo')} {replyingTo.firstName} {replyingTo.lastName}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                  {replyingTo.content}
                </Text>
              </View>
            )}
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
                  placeholder={replyingTo ? t('writeReply') : t('addComment')}
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-900 max-h-20"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={handleAddComment}
                  blurOnSubmit={false}
                  textAlignVertical="top"
                  scrollEnabled={false}
                />
              </View>
              <TouchableOpacity 
                onPress={handleAddComment}
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
        </SafeAreaView>
      </ModalContent>
    </Modal>
  );
};

export default CommentsModal; 