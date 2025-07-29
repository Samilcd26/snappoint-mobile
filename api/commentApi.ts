import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/ApiCalls';
import { useAuthStore } from '@/stores/authStore';

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

interface CommentResponse {
  comments: Comment[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface AddCommentRequest {
  content: string;
  parentId?: number;
}

const fetchPostComments = async (postId: string, page: number = 1, pageSize: number = 20, parentId?: string): Promise<CommentResponse> => {
  const params: any = { page, pageSize };
  if (parentId) {
    params.parentId = parentId;
  }
  return apiCall.get<CommentResponse>(`/posts/${postId}/comments`, params);
};

const addComment = async (postId: string, comment: AddCommentRequest): Promise<Comment> => {
  console.log('addComment called with:', { postId, comment });
  return apiCall.post<Comment>(`/posts/${postId}/comments`, comment);
};

const likeComment = async (commentId: string): Promise<{ liked: boolean; likeCount: number }> => {
  return apiCall.post<{ liked: boolean; likeCount: number }>(`/comments/${commentId}/like`, {});
};

// Hook to fetch comments for a post
export const useGetPostComments = (postId: string, page: number = 1, pageSize: number = 20, parentId?: string) => {
  return useQuery({
    queryKey: ['postComments', postId, page, pageSize, parentId],
    queryFn: () => fetchPostComments(postId, page, pageSize, parentId),
    enabled: !!postId,
  });
};

// Hook to add a comment to a post
export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, comment }: { postId: string; comment: AddCommentRequest }) => 
      addComment(postId, comment),
    onSuccess: (data, variables) => {
      // Invalidate and refetch post comments
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
    },
  });
};

// Hook to like a comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => likeComment(commentId),
    onSuccess: (data, commentId) => {
      // Invalidate all post comments queries to refresh like counts
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
  });
}; 