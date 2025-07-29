import { apiCall } from "@/utils/ApiCalls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessResponse } from "@/types/Response";

// Notification types
export interface Notification {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  type: string;
  from_user_id?: number;
  post_id?: number;
  comment_id?: number;
  follow_id?: number;
  is_read: boolean;
  is_visible: boolean;
  action_data?: string;
  from_user?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
    is_verified: boolean;
  };
}

export interface FollowRequest {
  follow_id: number;
  follower_id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  is_verified: boolean;
  total_points: number;
  requested_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface FollowRequestsResponse {
  success: boolean;
  data: FollowRequest[];
  count: number;
}

// Get user notifications
export const useGetNotifications = (
  page: number = 1,
  pageSize: number = 20,
  type?: string,
  unreadOnly: boolean = false
) => {
  const params: Record<string, string | number | boolean> = {
    page,
    pageSize,
  };

  if (type) params.type = type;
  if (unreadOnly) params.unreadOnly = unreadOnly;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      return apiCall.get<NotificationsResponse>('/notifications', { params });
    },
    refetchOnWindowFocus: false,
  });

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    refetch,
  };
};

// Get follow requests
export const useGetFollowRequests = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['followRequests'],
    queryFn: async () => {
      return apiCall.get<FollowRequestsResponse>('/notifications/follow-requests');
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    data: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error,
    refetch,
  };
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiCall.put<SuccessResponse<{}>>(
        `/notifications/${notificationId}/read`
      );
    },
    onSuccess: () => {
      // Invalidate notifications to refresh read status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiCall.put<SuccessResponse<{}>>('/notifications/read-all');
    },
    onSuccess: () => {
      // Invalidate notifications to refresh read status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Accept follow request
export const useAcceptFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followId: string) => {
      return apiCall.post<SuccessResponse<{}>>(
        `/notifications/follow-requests/${followId}/accept`
      );
    },
    onSuccess: () => {
      // Invalidate follow requests and notifications
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Also invalidate user profile data to refresh followers count
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Reject follow request
export const useRejectFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followId: string) => {
      return apiCall.post<SuccessResponse<{}>>(
        `/notifications/follow-requests/${followId}/reject`
      );
    },
    onSuccess: () => {
      // Invalidate follow requests and notifications
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 