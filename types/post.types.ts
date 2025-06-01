// Post related interfaces

export interface PostUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  totalPoints?: number;
}

export interface PostPlace {
  id: number;
  name: string;
  address?: string;
  pointValue?: number;
  image?: string;
}

export interface PostMediaItem {
  id: number;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  orderIndex: number;
  altText: string;
  width: number;
  height: number;
  duration: number;
  tags: string[];
}

export interface PostInteraction {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface PostSummary {
  id: number;
  caption: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  earnedPoints?: number;
  thumbnailUrl: string;
  mediaType: 'photo' | 'video';
  mediaCount: number;
  user: PostUser;
  place: PostPlace;
  interaction: PostInteraction;
}

export interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  user: PostUser;
}

export interface PostDetail {
  id: number;
  caption: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  earnedPoints: number;
  isPublic: boolean;
  allowComments: boolean;
  user: PostUser;
  place: PostPlace;
  mediaItems: PostMediaItem[];
  interaction: PostInteraction;
  recentLikes: PostUser[];
  recentComments: PostComment[];
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: any;
  pagination?: PaginationMeta;
  message?: string;
}

// Specific response types for each endpoint

export interface GetUserPostsResponse extends StandardResponse<PostSummary[]> {
  data: PostSummary[];
  pagination: PaginationMeta;
}

export interface GetPostDetailResponse extends StandardResponse<PostDetail> {
  data: PostDetail;
}

export interface GetUserPostsAtPlaceResponse extends StandardResponse<PostSummary[]> {
  data: PostSummary[];
  meta: {
    user: PostUser;
    place: PostPlace;
    summary: {
      totalPosts: number;
      totalPoints: number;
    };
  };
  pagination: PaginationMeta;
}

export interface GetPlacePostsGridResponse extends StandardResponse<PostSummary[]> {
  data: PostSummary[];
  meta: {
    place: PostPlace;
  };
  pagination: PaginationMeta;
}

// Request types for create/update operations

export interface CreatePostMediaItem {
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  tags?: string[];
}

export interface CreatePostRequest {
  postCaption?: string;
  mediaItems: CreatePostMediaItem[];
  placeId: number;
  latitude: number;
  longitude: number;
  isPublic?: boolean;
  allowComments?: boolean;
}

export interface UpdatePostMediaItem {
  mediaId?: number;
  mediaType?: 'photo' | 'video';
  mediaUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  orderIndex?: number;
  tags?: string[];
}

export interface UpdatePostRequest {
  content?: string;
  mediaItems?: UpdatePostMediaItem[];
  isPublic?: boolean;
  allowComments?: boolean;
}

export interface CreatePostResponse extends StandardResponse<PostDetail> {
  data: PostDetail;
}

export interface UpdatePostResponse extends StandardResponse<PostDetail> {
  data: PostDetail;
}

export interface DeletePostResponse extends StandardResponse {
  message: string;
} 