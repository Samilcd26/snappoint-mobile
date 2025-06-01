export interface Place {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    categories: string[];
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    base_score: number;
    place_type: string;
    place_image: string;
    opening_time: string;
    closing_time: string;
    is_verified: boolean;
    features: string[];
}

export interface PlaceStats {
    totalPosts: number;
    totalPoints: number;
    uniquePosters: number;
    lastPostTime: string;
}

export interface PlaceDetailResponse {
    id: number;
    latitude: number;
    longitude: number;
    name: string;
    place_image: string;
    point_value: number;
    stats: PlaceStats;
    top_users: TopUser[];
    user_posts: UserPost[];
}

export interface UserPost {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    postCount: number;
    totalPoints: number;
    lastPostAt: string;
}

export interface PostMedia {
    id: number;
    media_type: string;
    media_url: string;
    post_id: number;
    thumbnail_url: string;
}

export interface PostUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    total_points: number;
    avatar: string;
}

export interface TopUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    total_points: number;
    post_count: number;
    avatar: string;
}