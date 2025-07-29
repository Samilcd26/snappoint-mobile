import { UserDetail } from "@/types/User";
import { SuccessResponse } from "@/types/Response";
import { apiCall } from "@/utils/ApiCalls";
import { useQuery } from "@tanstack/react-query";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetUser = (userId: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      return apiCall.get<SuccessResponse<UserDetail>>(`/users/${userId}/profile`);
    },
    staleTime: 0, // Her zaman fresh data iste
    
    enabled: !!userId,
  });
  return { data, isLoading, error, refetch };
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      avatarTempKey?: string;
    }) => {
      return apiCall.put<SuccessResponse<UserDetail>>('/profile', profileData);
    },
    onSuccess: (data) => {
      // Invalidate user profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Follow user
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return apiCall.post<SuccessResponse<{
        following: boolean;
        status: string;
        message: string;
      }>>(`/users/${userId}/follow`);
    },
    onSuccess: (data, userId) => {
      // Remove from cache to force fresh fetch
      queryClient.removeQueries({ queryKey: ['user', parseInt(userId)] });

      // Invalidate user profile to refresh follow status
      queryClient.invalidateQueries({ queryKey: ['user', parseInt(userId)] });

      // Also invalidate any follow-related queries
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
    },
  });
};

// Get follow requests
export const useGetFollowRequests = () => {
  return useQuery({
    queryKey: ['followRequests'],
    queryFn: async () => {
      return apiCall.get<SuccessResponse<{
        followRequests: Array<{
          id: number;
          createdAt: string;
          user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
          };
        }>;
      }>>('/follow-requests');
    },
  });
};

// Accept follow request
export const useAcceptFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followId: string) => {
      return apiCall.post<SuccessResponse<{
        message: string;
        status: string;
      }>>(`/follow-requests/${followId}/accept`);
    },
    onSuccess: () => {
      // Invalidate follow requests to refresh the list
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      // Also invalidate notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Reject follow request
export const useRejectFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followId: string) => {
      return apiCall.post<SuccessResponse<{
        message: string;
      }>>(`/follow-requests/${followId}/reject`);
    },
    onSuccess: () => {
      // Invalidate follow requests to refresh the list
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      // Also invalidate notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};