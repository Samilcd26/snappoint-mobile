import {  Post, PostResponse } from '@/types/Post.type';
import { apiCall } from '@/utils/ApiCalls';
import { UserProfile } from '@/types/user.type';





export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  return await apiCall.put('/users/profile', profileData);
};

// Location
export const updateLocation = async (latitude: number, longitude: number): Promise<{ success: boolean }> => {
  return await apiCall.post('/users/location', {
    latitude,
    longitude,
  });
};

// Leaderboard
export const getLeaderboard = async (): Promise<UserProfile[]> => {
  return await apiCall.get('/users/leaderboard');
};

// User UserProfile & Social Features
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
    return await apiCall.get(`/users/profile/${userId}`);
};

export const getUserPosts = async (userId: string,page:number,limit:number): Promise<PostResponse> => {
  return await apiCall.get(`/users/profile/${userId}/posts?page=${page}&limit=${limit}`);
};






export const toggleFollowUser = async (userId: string): Promise<{ isFollowing: boolean }> => {
  return await apiCall.post(`/users/profile/${userId}/follow`);
};

// Photo Management
export const deletePhoto = async (photoId: string): Promise<{ success: boolean }> => {
  return await apiCall.delete(`/users/photos/${photoId}`);
};

export const updatePhotoCaption = async (photoId: string, caption: string): Promise<Post> => {
  return await apiCall.put(`/users/photos/${photoId}/caption`, {
    caption,
  });
};

