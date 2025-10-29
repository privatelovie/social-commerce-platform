import React, { useState } from 'react';
import { SuggestedUsers } from '../components/SuggestedUsers';
import UserSearch from '../components/UserSearch';
import { Search, TrendingUp } from 'lucide-react';

const DiscoverUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suggested' | 'search'>('suggested');
  
  // Get current user from context/state
  const currentUserId = localStorage.getItem('userId'); // Replace with your auth context

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover People</h1>
          <p className="text-gray-600">Find and connect with amazing creators and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'suggested'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Suggested
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>

        {/* Content */}
        {activeTab === 'suggested' ? (
          <SuggestedUsers
            currentUserId={currentUserId || undefined}
            limit={12}
            variant="page"
            title="Recommended for you"
          />
        ) : (
          <UserSearch />
        )}
      </div>
    </div>
  );
};

export default DiscoverUsers;
