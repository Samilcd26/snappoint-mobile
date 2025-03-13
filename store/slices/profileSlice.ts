import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Types
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  roles: string[];
  createdAt: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  media: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

interface ProfileState {
  user: User | null;
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

// Initial state
const initialState: ProfileState = {
  user: null,
  posts: [],
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId: number) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId: number) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userId}/posts`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (userData: Partial<User>) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.posts = [];
      state.error = null;
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
    
    // Fetch Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
    
    // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  },
});

// Actions
export const { clearProfile, updateLocalProfile } = profileSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.profile.user;
export const selectPosts = (state: RootState) => state.profile.posts;
export const selectIsLoading = (state: RootState) => state.profile.isLoading;
export const selectIsUpdating = (state: RootState) => state.profile.isUpdating;
export const selectError = (state: RootState) => state.profile.error;

export default profileSlice.reducer;
