import React, { useState } from 'react';
import { usersAPI } from '../services/api';
import { User, UserPlus, UserCheck, Loader } from 'lucide-react';

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  followersCount?: number;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  isFollowing: initialIsFollowing,
  followersCount: initialFollowersCount = 0,
  onFollowChange,
  variant = 'default',
  className = ''
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const response = await usersAPI.followUser(username);
      const newIsFollowing = response.isFollowing;
      const newFollowersCount = response.followersCount;

      setIsFollowing(newIsFollowing);
      setFollowersCount(newFollowersCount);

      if (onFollowChange) {
        onFollowChange(newIsFollowing, newFollowersCount);
      }
    } catch (error: any) {
      console.error('Follow/unfollow error:', error);
      // Show error toast or notification here
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    if (variant === 'icon-only') {
      return `${baseStyles} p-2 rounded-full ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
      }`;
    }

    if (variant === 'compact') {
      return `${baseStyles} px-3 py-1.5 text-sm rounded-lg ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
      }`;
    }

    return `${baseStyles} px-6 py-2.5 text-base rounded-xl ${
      isFollowing
        ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
    }`;
  };

  const getButtonText = () => {
    if (isLoading) return null;
    if (variant === 'icon-only') return null;
    
    if (isFollowing) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader className={variant === 'icon-only' ? 'w-4 h-4' : 'w-5 h-5'} />;
    }
    
    if (isFollowing) {
      return isHovered ? (
        <User className={variant === 'icon-only' ? 'w-4 h-4' : 'w-5 h-5'} />
      ) : (
        <UserCheck className={variant === 'icon-only' ? 'w-4 h-4' : 'w-5 h-5'} />
      );
    }
    
    return <UserPlus className={variant === 'icon-only' ? 'w-4 h-4' : 'w-5 h-5'} />;
  };

  return (
    <button
      onClick={handleFollowToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`${getButtonStyles()} ${className}`}
      title={isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow'}
    >
      {getIcon()}
      {getButtonText() && <span>{getButtonText()}</span>}
    </button>
  );
};

export default FollowButton;
