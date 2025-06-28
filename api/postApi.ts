import { apiCall } from "@/utils/ApiCalls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetUserPostsResponse,
  GetPostDetailResponse,
  GetUserPostsAtPlaceResponse,
  GetPlacePostsGridResponse,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  DeletePostResponse,
  PostSummary,
  PostDetail,
  StandardResponse
} from "@/types/post.types";

// Get user posts
export const useGetUserPosts = (userId: string, page = 1, pageSize = 30) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userPosts', userId, page, pageSize],
    queryFn: async () => {
      const response = await apiCall.get<GetUserPostsResponse>(
        `/users/${userId}/posts?page=${page}&pageSize=${pageSize}`
      );
      return response;
    },
    enabled: !!userId,
  });
  return { 
    posts: data?.data || [],
    pagination: data?.pagination,
    isLoading, 
    error,
    success: data?.success
  };
};

// Get post detail by ID
export const useGetPostDetail = (postId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await apiCall.get<GetPostDetailResponse>(`/posts/${postId}`);
      return response;
    },
    enabled: !!postId,
  });
  return { 
    post: data?.data,
    isLoading, 
    error,
    success: data?.success
  };
};

// Get user posts at specific place
export const useGetUserPostsAtPlace = (
  userId: string, 
  placeId: string, 
  page = 1, 
  pageSize = 30
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userPostsAtPlace', userId, placeId, page, pageSize],
    queryFn: async () => {
      const response = await apiCall.get<GetUserPostsAtPlaceResponse>(
        `/users/${userId}/places/${placeId}/posts?page=${page}&pageSize=${pageSize}`
      );
      return response;
    },
    enabled: !!userId && !!placeId,
  });
  return { 
    posts: data?.data || [],
    user: data?.meta?.user,
    place: data?.meta?.place,
    summary: data?.meta?.summary,
    pagination: data?.pagination,
    isLoading, 
    error,
    success: data?.success
  };
};

// Get place posts grid
export const useGetPlacePostsGrid = (placeId: number | undefined, page = 1, pageSize = 30) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['placePostsGrid', placeId, page, pageSize],
    queryFn: async () => {
      const response = await apiCall.get<GetPlacePostsGridResponse>(
        `/places/${placeId}/posts/grid?page=${page}&pageSize=${pageSize}`
      );
      return response;
    },
    enabled: !!placeId,
  });
  return { 
    posts: data?.data || [],
    place: data?.meta?.place,
    pagination: data?.pagination,
    isLoading, 
    error,
    success: data?.success
  };
};

// Create a new post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPost: CreatePostRequest) => {
      const response = await apiCall.post<CreatePostResponse>('/posts', newPost);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPostsAtPlace'] });
      queryClient.invalidateQueries({ queryKey: ['placePostsGrid'] });
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      
      return response.data; // Return the created post
    },
  });
};

// Update a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, updateData }: { postId: string; updateData: UpdatePostRequest }) => {
      const response = await apiCall.put<UpdatePostResponse>(`/posts/${postId}`, updateData);
      return response;
    },
    onSuccess: (response, { postId }) => {
      // Update specific post in cache
      queryClient.setQueryData(['post', postId], response);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPostsAtPlace'] });
      queryClient.invalidateQueries({ queryKey: ['placePostsGrid'] });
      
      return response.data; // Return the updated post
    },
  });
};

// Delete a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiCall.delete<DeletePostResponse>(`/posts/${postId}`);
      return response;
    },
    onSuccess: (response, postId) => {
      // Remove post from cache
      queryClient.removeQueries({ queryKey: ['post', postId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPostsAtPlace'] });
      queryClient.invalidateQueries({ queryKey: ['placePostsGrid'] });
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      
      return response; // Return the delete response with message
    },
  });
};

// Like a post (if you have this endpoint)
export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiCall.post<StandardResponse<void>>(`/posts/${postId}/like`);
      return response;
    },
    onSuccess: (_, postId) => {
      // Update the post in the cache
      queryClient.setQueryData(['post', postId], (oldData: GetPostDetailResponse | undefined) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            interaction: {
              ...oldData.data.interaction,
              likesCount: oldData.data.interaction.likesCount + 1,
              isLiked: true
            }
          }
        };
      });
      
      // Invalidate lists to refresh like counts
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPostsAtPlace'] });
      queryClient.invalidateQueries({ queryKey: ['placePostsGrid'] });
    },
  });
};

// Unlike a post (if you have this endpoint)
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiCall.delete<StandardResponse<void>>(`/posts/${postId}/like`);
      return response;
    },
    onSuccess: (_, postId) => {
      // Update the post in the cache
      queryClient.setQueryData(['post', postId], (oldData: GetPostDetailResponse | undefined) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            interaction: {
              ...oldData.data.interaction,
              likesCount: Math.max(0, oldData.data.interaction.likesCount - 1),
              isLiked: false
            }
          }
        };
      });
      
      // Invalidate lists to refresh like counts
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPostsAtPlace'] });
      queryClient.invalidateQueries({ queryKey: ['placePostsGrid'] });
    },
  });
};

// Hook for pagination helper
export const usePostPagination = (totalPages: number, currentPage: number) => {
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  return {
    hasNextPage,
    hasPreviousPage,
    nextPage: hasNextPage ? currentPage + 1 : null,
    previousPage: hasPreviousPage ? currentPage - 1 : null,
  };
}; 

