import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsPage = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [friendRes, groupRes] = await Promise.all([
        axios.get('/api/friends/pending'),
        axios.get('/api/group-requests/my-requests')
      ]);
      setFriendRequests(friendRes.data);
      setGroupRequests(groupRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToFriendRequest = async (requestId, action) => {
    try {
      await axios.post('/api/friends/respond', { requestId, action });
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      alert(`Friend request ${action}!`);
    } catch (error) {
      alert('Failed to respond to request');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-text-secondary">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-dark-bg overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6 bg-gradient-to-r from-highlight to-pink-500 bg-clip-text text-transparent">
          Notifications
        </h1>

        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Friend Requests
            </h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request._id} className="glass-effect p-4 rounded-lg flex items-center justify-between hover:border-highlight/30 transition">
                  <div className="flex items-center">
                    <img
                      src={request.from.image?.url}
                      alt={request.from.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-text-primary">{request.from.username}</h3>
                      <p className="text-sm text-text-secondary">{request.from.email}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToFriendRequest(request._id, 'accepted')}
                      className="bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white px-4 py-2 rounded-lg transition transform hover:scale-105"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToFriendRequest(request._id, 'rejected')}
                      className="bg-red-900/50 hover:bg-red-900 text-white px-4 py-2 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              My Group Requests
            </h2>
            <div className="space-y-3">
              {groupRequests.map((request) => (
                <div key={request._id} className="glass-effect p-4 rounded-lg flex items-center justify-between hover:border-highlight/30 transition">
                  <div className="flex items-center">
                    <img
                      src={request.group.image?.url}
                      alt={request.group.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-text-primary">{request.group.name}</h3>
                      <p className="text-sm text-text-secondary">{request.group.description}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={`font-semibold ${request.status === 'pending' ? 'text-yellow-400' : request.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                          {request.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {friendRequests.length === 0 && groupRequests.length === 0 && (
          <div className="text-center text-text-secondary mt-8">
            <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
