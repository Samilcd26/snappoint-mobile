import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, ModalBackdrop, ModalContent, ModalBody, ModalHeader } from '@/components/ui/modal';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  useGetNotifications, 
  useGetFollowRequests, 
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useAcceptFollowRequest,
  useRejectFollowRequest,
  Notification,
  FollowRequest
} from '@/api/notificationApi';
import { useShowToast } from '@/utils/Toast';
import { useTranslation } from '@/utils/useTranslation';

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onNotificationUpdate?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isVisible, onClose, onNotificationUpdate }) => {
  const router = useRouter();
  const { showToast } = useShowToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

  // API hooks
  const { 
    data: notifications, 
    unreadCount, 
    isLoading: notificationsLoading, 
    refetch: refetchNotifications 
  } = useGetNotifications(1, 50);
  
  const { 
    data: followRequests, 
    count: requestsCount, 
    isLoading: requestsLoading, 
    refetch: refetchRequests 
  } = useGetFollowRequests();

  // Refresh notifications when modal becomes visible
  React.useEffect(() => {
    if (isVisible) {
      // Force fresh data when modal opens
      refetchNotifications();
      refetchRequests();
    }
  }, [isVisible, refetchNotifications, refetchRequests]);

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const acceptRequest = useAcceptFollowRequest();
  const rejectRequest = useRejectFollowRequest();

  const isLoading = notificationsLoading || requestsLoading;

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      try {
        await markAsRead.mutateAsync(notification.id.toString());
        // Notify parent to update notification count
        onNotificationUpdate?.();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Close modal first
    onClose();

    // Navigate based on notification type
    switch (notification.type) {
      case 'post_liked':
      case 'comment_added':
        if (notification.post_id) {
          router.push({
            pathname: '/screens/PostDetailScreen',
            params: { postId: notification.post_id.toString() }
          });
        }
        break;
      case 'follow_accepted':
        if (notification.from_user_id) {
          router.push({
            pathname: '/screens/UserProfileScreen',
            params: { userId: notification.from_user_id.toString() }
          });
        }
        break;
      default:
        // For other notifications, just mark as read
        break;
    }
  };

  const handleAcceptRequest = async (followId: number) => {
    try {
      await acceptRequest.mutateAsync(followId.toString());
      showToast({
        description: 'Follow request accepted',
        action: 'success',
      });
    } catch (error: any) {
      showToast({
        description: error?.error || 'Failed to accept request',
        action: 'error',
      });
    }
  };

  const handleRejectRequest = async (followId: number) => {
    try {
      await rejectRequest.mutateAsync(followId.toString());
      showToast({
        description: 'Follow request rejected',
        action: 'success',
      });
    } catch (error: any) {
      showToast({
        description: error?.error || 'Failed to reject request',
        action: 'error',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      // Notify parent to update notification count
      onNotificationUpdate?.();
      showToast({
        description: 'All notifications marked as read',
        action: 'success',
      });
    } catch (error: any) {
      showToast({
        description: error?.error || 'Failed to mark all as read',
        action: 'error',
      });
    }
  };

  const onRefresh = () => {
    refetchNotifications();
    refetchRequests();
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'post_liked':
        return 'New Like';
      case 'comment_added':
        return 'New Comment';
      case 'follow_request':
        return 'Follow Request';
      case 'follow_accepted':
        return 'Follow Accepted';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (type: string, username?: string) => {
    const user = username ? `@${username}` : 'Someone';
    
    switch (type) {
      case 'post_liked':
        return `${user} liked your post`;
      case 'comment_added':
        return `${user} commented on your post`;
      case 'follow_request':
        return `${user} wants to follow you`;
      case 'follow_accepted':
        return `${user} accepted your follow request`;
      default:
        return 'You have a new notification';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      className={`p-4 border-b border-gray-100 ${!item.is_read ? 'bg-blue-50' : 'bg-white'}`}
      onPress={() => handleNotificationPress(item)}
    >
      <View className="flex-row items-start">
        {/* User Avatar */}
        {item.from_user && (
          <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center overflow-hidden mr-3">
            {item.from_user.avatar ? (
              <Image 
                source={{ uri: item.from_user.avatar }}
                style={{ width: 40, height: 40 }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-blue-600 font-bold">
                {item.from_user.first_name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        )}
        
        {/* Notification Content */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{getNotificationTitle(item.type)}</Text>
          <Text className="text-gray-600 text-sm mt-1">{getNotificationMessage(item.type, item.from_user?.username)}</Text>
          {item.from_user && (
            <Text className="text-gray-400 text-xs mt-1">
              from @{item.from_user.username}
            </Text>
          )}
          <Text className="text-gray-400 text-xs mt-1">
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Unread indicator */}
        {!item.is_read && (
          <View className="w-3 h-3 bg-blue-500 rounded-full ml-2 mt-1" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFollowRequestItem = ({ item }: { item: FollowRequest }) => (
    <View className="p-4 border-b border-gray-100 bg-white">
      <View className="flex-row items-center">
        {/* User Avatar */}
        <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center overflow-hidden mr-3">
          {item.avatar ? (
            <Image 
              source={{ uri: item.avatar }}
              style={{ width: 48, height: 48 }}
              className="w-full h-full"
            />
          ) : (
            <Text className="text-blue-600 font-bold">
              {item.first_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        {/* User Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-gray-900">
              {item.first_name} {item.last_name}
            </Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" className="ml-1" />
            )}
          </View>
          <Text className="text-gray-600 text-sm">@{item.username}</Text>
          <Text className="text-blue-600 text-xs mt-1">{item.total_points} points</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            className="bg-red-100 px-3 py-2 rounded-lg"
            onPress={() => handleRejectRequest(item.follow_id)}
            disabled={rejectRequest.isPending}
          >
            <Text className="text-red-600 font-semibold text-sm">
              {rejectRequest.isPending ? '...' : 'Reject'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-blue-500 px-3 py-2 rounded-lg"
            onPress={() => handleAcceptRequest(item.follow_id)}
            disabled={acceptRequest.isPending}
          >
            <Text className="text-white font-semibold text-sm">
              {acceptRequest.isPending ? '...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons 
        name={activeTab === 'all' ? "notifications-outline" : "person-add-outline"} 
        size={48} 
        color="#9ca3af" 
      />
      <Text className="text-gray-500 text-center mt-4">
        {activeTab === 'all' ? 'No notifications yet' : 'No follow requests'}
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
                Notifications
              </Text>
              <TouchableOpacity 
                className="p-2" 
                onPress={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending || unreadCount === 0}
              >
                <Text className={`font-semibold text-sm ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Mark All
                </Text>
              </TouchableOpacity>
            </View>
          </ModalHeader>

          {/* Tab Navigation */}
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity 
              className={`flex-1 py-3 items-center ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('all')}
            >
              <View className="flex-row items-center">
                <Text className={`font-semibold ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-500'}`}>
                  All
                </Text>
                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`flex-1 py-3 items-center ${activeTab === 'requests' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('requests')}
            >
              <View className="flex-row items-center">
                <Text className={`font-semibold ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Requests
                </Text>
                {requestsCount > 0 && (
                  <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">
                      {requestsCount > 9 ? '9+' : requestsCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <View className="flex-1">
            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-500">Loading notifications...</Text>
              </View>
            ) : activeTab === 'all' ? (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => `notification-${item.id}`}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmptyState}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
                contentContainerStyle={notifications.length === 0 ? { flex: 1 } : {}}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <FlatList
                data={followRequests}
                renderItem={renderFollowRequestItem}
                keyExtractor={(item) => `request-${item.follow_id}`}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmptyState}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
                contentContainerStyle={followRequests.length === 0 ? { flex: 1 } : {}}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </SafeAreaView>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal; 