import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { UserCard } from './UserCard';
import { Loader, Users, UserPlus, AlertCircle, X } from 'lucide-react';

interface FollowersListProps {
  username: string;
  type: 'followers' | 'following';
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FollowersList: React.FC<FollowersListProps> = ({
  username,
  type,
  currentUserId,
  isOpen,
  onClose
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers(1);
    }
  }, [isOpen, username, type]);

  const fetchUsers = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = type === 'followers'
        ? await usersAPI.getFollowers(username, pageNum)
        : await usersAPI.getFollowing(username, pageNum);

      const newUsers = response[type].map((item: any) => ({
        ...item.user,
        isFollowing: item.user.isFollowing || false
      }));

      if (pageNum === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }

      setHasMore(response.hasMore || false);
      setPage(pageNum);
    } catch (err: any) {
      console.error(`Error fetching ${type}:`, err);
      setError(err.response?.data?.error || `Failed to load ${type}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1);
    }
  };

  const handleFollowChange = (username: string, isFollowing: boolean, followersCount: number) => {
    setUsers(prev =>
      prev.map(user =>
        user.username === username
          ? { ...user, isFollowing, socialStats: { ...user.socialStats, followersCount } }
          : user
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {type === 'followers' ? (
              <Users className="w-6 h-6 text-gray-700" />
            ) : (
              <UserPlus className="w-6 h-6 text-gray-700" />
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-500">Loading {type}...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-gray-700 font-medium mb-2">Oops! Something went wrong</p>
              <p className="text-gray-500 text-sm text-center mb-4">{error}</p>
              <button
                onClick={() => fetchUsers(1)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              {type === 'followers' ? (
                <Users className="w-16 h-16 text-gray-300 mb-4" />
              ) : (
                <UserPlus className="w-16 h-16 text-gray-300 mb-4" />
              )}
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No {type} yet
              </h3>
              <p className="text-gray-500 text-sm">
                {type === 'followers'
                  ? 'When people follow this user, they will appear here'
                  : 'When this user follows people, they will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map(user => (
                <UserCard
                  key={user._id || user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onFollowChange={handleFollowChange}
                  variant="list"
                  showBio={false}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="p-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;
