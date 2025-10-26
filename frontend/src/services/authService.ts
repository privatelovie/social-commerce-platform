import { apiClient, ApiResponse } from './apiClient';
import { endpoints } from '../config/api';

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  followers: number;
  following: number;
  posts: number;
  joinDate: string;
  socialStats?: {
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatar?: string;
}

class AuthService {
  private user: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load stored auth data on initialization
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedUser) {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);
        this.refreshToken = storedRefreshToken;
      }
    } catch (error) {
      console.error('Failed to load stored auth data:', error);
      this.clearStoredAuth();
    }
  }

  private storeAuth(authData: AuthResponse) {
    try {
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }

      this.token = authData.token;
      this.user = authData.user;
      this.refreshToken = authData.refreshToken;
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  private clearStoredAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.user = null;
    this.refreshToken = null;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: ApiResponse<AuthResponse> = await apiClient.post(
        endpoints.auth.login,
        credentials
      );

      if (response.success && response.data) {
        this.storeAuth(response.data);
        
        return {
          success: true,
          user: response.data.user,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: ApiResponse<AuthResponse> = await apiClient.post(
        endpoints.auth.register,
        userData
      );

      if (response.success && response.data) {
        this.storeAuth(response.data);
        
        return {
          success: true,
          user: response.data.user,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed',
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Inform backend about logout
      if (this.token) {
        await apiClient.post(endpoints.auth.logout);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      this.clearStoredAuth();
    }
  }

  async refreshAuthToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response: ApiResponse<AuthResponse> = await apiClient.post(
        endpoints.auth.refresh,
        { refreshToken: this.refreshToken }
      );

      if (response.success && response.data) {
        this.storeAuth(response.data);
        return true;
      } else {
        this.clearStoredAuth();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearStoredAuth();
      return false;
    }
  }

  // Profile management
  async getProfile(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const response: ApiResponse<User> = await apiClient.get(endpoints.auth.profile);

      if (response.success && response.data) {
        // Update stored user data
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));

        return {
          success: true,
          user: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch profile',
        };
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch profile',
      };
    }
  }

  async updateProfile(updateData: UpdateProfileData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const response: ApiResponse<User> = await apiClient.put(
        endpoints.auth.updateProfile,
        updateData
      );

      if (response.success && response.data) {
        // Update stored user data
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));

        return {
          success: true,
          user: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update profile',
        };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  // Upload profile avatar
  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const response: ApiResponse<{ avatarUrl: string }> = await apiClient.uploadFile(
        '/auth/upload-avatar',
        file
      );

      if (response.success && response.data) {
        // Update user avatar
        const updatedUser = { ...this.user!, avatar: response.data.avatarUrl };
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return {
          success: true,
          avatarUrl: response.data.avatarUrl,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to upload avatar',
        };
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  // Auto-refresh token when it's about to expire
  async ensureValidToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      // Decode JWT to check expiration (simplified)
      const tokenData = JSON.parse(atob(this.token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Refresh token if it expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        return await this.refreshAuthToken();
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return await this.refreshAuthToken();
    }
  }

  // Social stats update (called when user interactions change)
  updateSocialStats(stats: Partial<User['socialStats']>) {
    if (this.user && this.user.socialStats) {
      this.user.socialStats = { ...this.user.socialStats, ...stats };
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  // Follower count updates
  updateFollowerCount(change: number) {
    if (this.user) {
      this.user.followers = Math.max(0, this.user.followers + change);
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  updateFollowingCount(change: number) {
    if (this.user) {
      this.user.following = Math.max(0, this.user.following + change);
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        '/auth/forgot-password',
        { email }
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        '/auth/reset-password',
        { token, newPassword }
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService();

export default authService;