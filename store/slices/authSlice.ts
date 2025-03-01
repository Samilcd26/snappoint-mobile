import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, refresh_token, getUserInfo } from '../../api/auth';
import { AuthState } from '../../types/user.type';
import { LoginResponse, RefreshTokenResponse } from '../../types/api.response';
import ToastService from '../../utils/toast';

// Initial state
const initialState: AuthState = {
  user: null,
  access_token: null,
  refresh_token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await login(email, password);
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refresh_token',
  async (refreshTokenValue: string, { rejectWithValue }) => {
    try {
      const response = await refresh_token(refreshTokenValue);
      
      // Update tokens in AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await getUserInfo();
      await AsyncStorage.setItem('user', JSON.stringify(userProfile));
      return userProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadFromStorage',
  async (_, { dispatch }) => {
    try {
      const access_token = await AsyncStorage.getItem('access_token');
      const refreshTokenValue = await AsyncStorage.getItem('refresh_token');
      const userString = await AsyncStorage.getItem('user');
      
      if (!access_token || !refreshTokenValue) {
        return { access_token: null, refresh_token: null, user: null };
      }
      
      const user = userString ? JSON.parse(userString) : null;
      
      // Try to refresh the token
      try {
        await dispatch(refreshUserToken(refreshTokenValue)).unwrap();
        // If refresh successful, return the updated values
        const newToken = await AsyncStorage.getItem('access_token');
        const newRefreshToken = await AsyncStorage.getItem('refresh_token');
        
        return { 
          access_token: newToken, 
          refresh_token: newRefreshToken, 
          user 
        };
      } catch (error) {
        // If refresh fails, clear storage and return null values
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        
        return { access_token: null, refresh_token: null, user: null };
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      return { access_token: null, refresh_token: null, user: null };
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        state.user = action.payload.user;
        state.error = null;
        ToastService.success('Giriş başarılı');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Login failed';
        ToastService.error(state.error);
      });

    // Refresh Token
    builder
      .addCase(refreshUserToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.access_token = null;
        state.refresh_token = null;
        state.user = null;
        state.error = action.payload as string || 'Token refresh failed';
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch user profile';
      });

    // Load User from Storage
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.access_token;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Failed to load user from storage';
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.access_token = null;
        state.refresh_token = null;
        state.user = null;
        state.error = null;
        ToastService.success('Çıkış başarılı');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Logout failed';
        ToastService.error(state.error);
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 