import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { UserCard } from './UserCard';
import { Loader, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface SuggestedUsersProps {
  currentUserId?: string;
  limit?: number;
  variant?: 'sidebar' | 'page';
  title?: string;
}

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  currentUserId,
  limit = 5,
  variant = 'sidebar',
  title = 'Suggested for you'
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [limit]);

  const fetchSuggestions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Try to get personalized suggestions first
      try {
        const response = await usersAPI.getTrendingCreators(limit);
        setUsers(response.creators || response.users || []);
      } catch (err) {
        // Fallback to search or other method
        console.error('Error fetching suggestions:', err);
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching user suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSuggestions(true);
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

  if (loading && users.length === 0) {
    return (
      <div className={variant === 'sidebar' ? 'bg-white rounded-xl shadow-md p-6' : 'py-8'}>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || users.length === 0) {
    return null; // Don't show anything if there's an error or no suggestions
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {users.slice(0, limit).map(user => (
            <UserCard
              key={user._id || user.id}
              user={user}
              currentUserId={currentUserId}
              onFollowChange={handleFollowChange}
              variant="compact"
              showBio={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // Page variant
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => (
          <UserCard
            key={user._id || user.id}
            user={user}
            currentUserId={currentUserId}
            onFollowChange={handleFollowChange}
            variant="card"
            showBio={true}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
