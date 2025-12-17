import React, { useState } from 'react';
import axios from 'axios';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], groups: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/search?query=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post('/api/friends/request', { toUserId: userId });
      alert('Friend request sent!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const sendGroupRequest = async (groupId) => {
    try {
      await axios.post('/api/group-requests/request', { groupId });
      alert('Group join request sent!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="flex-1 p-6 bg-dark-bg overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6 bg-gradient-to-r from-highlight to-pink-500 bg-clip-text text-transparent">
          Discover People & Groups
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users or groups..."
              className="flex-1 px-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary placeholder-text-secondary"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white px-6 py-3 rounded-lg transition disabled:opacity-50 transform hover:scale-105"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {results.users.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </h2>
            <div className="space-y-3">
              {results.users.map((user) => (
                <div key={user._id} className="glass-effect p-4 rounded-lg flex items-center justify-between hover:border-highlight/30 transition">
                  <div className="flex items-center">
                    <img
                      src={user.image?.url}
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-text-primary">{user.username}</h3>
                      <p className="text-sm text-text-secondary">{user.email}</p>
                      {user.bio && <p className="text-sm text-text-secondary mt-1">{user.bio}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(user._id)}
                    className="bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white px-4 py-2 rounded-lg transition transform hover:scale-105"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.groups.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groups
            </h2>
            <div className="space-y-3">
              {results.groups.map((group) => (
                <div key={group._id} className="glass-effect p-4 rounded-lg flex items-center justify-between hover:border-highlight/30 transition">
                  <div className="flex items-center">
                    <img
                      src={group.image?.url}
                      alt={group.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-text-primary">{group.name}</h3>
                      <p className="text-sm text-text-secondary">Created by {group.creator?.username}</p>
                      <p className="text-sm text-text-secondary mt-1">{group.description}</p>
                      <p className="text-xs text-highlight mt-1">{group.members?.length} members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendGroupRequest(group._id)}
                    className="bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white px-4 py-2 rounded-lg transition transform hover:scale-105"
                  >
                    Join Group
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.users.length === 0 && results.groups.length === 0 && query && (
          <div className="text-center text-text-secondary mt-8">
            <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
