export interface User {
  id: number;
  email: string;
  username: string;
  profilePicture: string;
} 


export interface UserDetail {
  id: number;
  email: string;
  username: string;
  avatar: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  gender: string;
  birthday: string;
  totalPoints: number;
  accountStatus: string;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowPending: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

