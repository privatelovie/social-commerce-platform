import React from 'react';
import { Link } from 'react-router-dom';
import { FollowButton } from './FollowButton';
import { CheckCircle, Users } from 'lucide-react';

interface UserCardProps {
  user: {
    _id?: string;
    id?: string;
    username: string;
    displayName: string;
    profile?: {
      avatar?: string;
      bio?: string;
    };
    isVerified?: boolean;
    isCreator?: boolean;
    socialStats?: {
      followersCount?: number;
    };
    followersCount?: number;
    isFollowing?: boolean;
  };
  currentUserId?: string;
  onFollowChange?: (username: string, isFollowing: boolean, followersCount: number) => void;
  showBio?: boolean;
  variant?: 'card' | 'list' | 'compact';
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  onFollowChange,
  showBio = true,
  variant = 'card'
}) => {
  const userId = user._id || user.id;
  const isOwnProfile = currentUserId === userId;
  const followersCount = user.socialStats?.followersCount || user.followersCount || 0;

  const handleFollowChange = (isFollowing: boolean, newFollowersCount: number) => {
    if (onFollowChange) {
      onFollowChange(user.username, isFollowing, newFollowersCount);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (variant === 'list') {
    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 truncate">{user.displayName}</h3>
              {user.isVerified && (
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">@{user.username}</p>
            {followersCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Users className="w-3 h-3" />
                <span>{formatFollowers(followersCount)} followers</span>
              </div>
            )}
          </div>
        </Link>
        {!isOwnProfile && (
          <FollowButton
            username={user.username}
            isFollowing={user.isFollowing || false}
            followersCount={followersCount}
            onFollowChange={handleFollowChange}
            variant="compact"
          />
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-2">
        <Link to={`/profile/${user.username}`} className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm text-gray-900 truncate">{user.displayName}</span>
              {user.isVerified && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </Link>
        {!isOwnProfile && (
          <FollowButton
            username={user.username}
            isFollowing={user.isFollowing || false}
            followersCount={followersCount}
            onFollowChange={handleFollowChange}
            variant="icon-only"
          />
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <Link to={`/profile/${user.username}`} className="block">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.displayName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100"
              />
              {user.isCreator && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Creator
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h3 className="font-bold text-lg text-gray-900">{user.displayName}</h3>
                {user.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>

            {showBio && user.profile?.bio && (
              <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                {user.profile.bio}
              </p>
            )}

            {followersCount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatFollowers(followersCount)} followers
                </span>
              </div>
            )}
          </div>
        </Link>

        {!isOwnProfile && (
          <div className="mt-5">
            <FollowButton
              username={user.username}
              isFollowing={user.isFollowing || false}
              followersCount={followersCount}
              onFollowChange={handleFollowChange}
              variant="default"
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
