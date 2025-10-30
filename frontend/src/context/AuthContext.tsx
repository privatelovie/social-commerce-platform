import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User as AuthUser, LoginCredentials, RegisterData as AuthRegisterData } from '../services/authService';
import { socketConfig } from '../config/api';
import { messagingService } from '../services/messagingService';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

// Define Socket type inline to avoid import issues
type SocketType = any;

// Use the User type from authService but extend it with additional frontend-specific fields
export interface User extends AuthUser {
  // Additional frontend-specific fields
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
  salesCount?: number;
  totalEarnings?: number;
  location?: string;
  website?: string;
  isCreator?: boolean;
  creatorLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  dateOfBirth?: string;
  occupation?: string;
  education?: string;
  coverPhoto?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: React.ReactNode;
  }>;
  interests?: string[];
  isPrivate?: boolean;
  showEmail?: boolean;
  showLocation?: boolean;
  allowMessages?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  socket: SocketType | null;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<SocketType | null>(null);

  // Initialize Socket.IO connection
  const initializeSocket = (userId: string) => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(socketConfig.url, {
      ...socketConfig.options,
      auth: {
        userId,
        token: authService.getToken(),
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);
    
    // Initialize messaging service with socket
    messagingService.initializeSocket(newSocket);
  };

  // Map backend user to frontend user format
  const mapUserData = (authUser: AuthUser): User => {
    return {
      ...authUser,
      // Map field differences
      followerCount: (authUser as any).followers || 0,
      followingCount: (authUser as any).following || 0,
      postCount: (authUser as any).posts || 0,
      // Add default values for optional fields
      salesCount: 0,
      totalEarnings: 0,
      location: '',
      website: '',
      isCreator: false,
      creatorLevel: 'bronze',
      dateOfBirth: '',
      occupation: '',
      education: '',
      coverPhoto: '',
      socialLinks: [],
      interests: [],
      isPrivate: false,
      showEmail: false,
      showLocation: true,
      allowMessages: true,
      emailNotifications: true,
      pushNotifications: true,
      theme: 'light',
      language: 'en',
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check for demo mode
      const demoUser = localStorage.getItem('user');
      const demoToken = localStorage.getItem('token');
      
      if (demoToken === 'demo-token' && demoUser) {
        // Demo mode - use stored demo user
        try {
          const parsedUser = JSON.parse(demoUser);
          setUser(mapUserData(parsedUser));
        } catch (error) {
          console.error('Failed to parse demo user:', error);
        }
        setLoading(false);
        return;
      }
      
      if (authService.isAuthenticated()) {
        try {
          // Get fresh user data from backend
          const response = await authService.getProfile();
          
          if (response.success && response.user) {
            const mappedUser = mapUserData(response.user);
            setUser(mappedUser);
            
            // Initialize Socket.IO connection
            initializeSocket(response.user.id);
          } else {
            // Invalid token, clear auth
            await authService.logout();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          await authService.logout();
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login({ email, password });
      
      if (response.success && response.user) {
        const mappedUser = mapUserData(response.user);
        setUser(mappedUser);
        
        // Initialize Socket.IO connection
        initializeSocket(response.user.id);
        
        return true;
      } else {
        setError(response.error || 'Login failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.googleLogin(token);
      
      if (response.success && response.user) {
        const mappedUser = mapUserData(response.user);
        setUser(mappedUser);
        
        // Initialize Socket.IO connection
        initializeSocket(response.user.id);
        
        return true;
      } else {
        setError(response.error || 'Google login failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        const mappedUser = mapUserData(response.user);
        setUser(mappedUser);
        
        // Initialize Socket.IO connection
        initializeSocket(response.user.id);
        
        return true;
      } else {
        setError(response.error || 'Registration failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return false;

      // Extract fields that should be sent to backend
      const backendUpdates = {
        displayName: updates.displayName,
        bio: updates.bio,
        avatar: updates.avatar,
      };

      const response = await authService.updateProfile(backendUpdates);
      
      if (response.success && response.user) {
        // Merge backend user data with frontend-specific fields
        const updatedUser = {
          ...mapUserData(response.user),
          ...updates, // Include any frontend-specific updates
        };
        
        setUser(updatedUser);
        return true;
      } else {
        setError(response.error || 'Profile update failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Profile update failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    loading,
    error,
    socket
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};