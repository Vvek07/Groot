import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

import CreateGroupModal from './CreateGroupModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const location = useLocation();
  const [chats, setChats] = useState({ privateChats: [], groupChats: [] });
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/messages/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-80 bg-dark-card border-r border-gray-800 flex flex-col">
      <div className="p-4 bg-gradient-to-r from-highlight to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user?.image?.url}
                alt={user?.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-white">{user?.username}</h2>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              title="Create Group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-800 bg-dark-bg">
        <Link
          to="/dashboard/search"
          className={`flex-1 p-3 text-center transition ${isActive('/dashboard/search') ? 'bg-highlight text-white' : 'text-text-secondary hover:bg-dark-hover'}`}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">Search</span>
        </Link>
        <Link
          to="/dashboard/notifications"
          className={`flex-1 p-3 text-center transition ${isActive('/dashboard/notifications') ? 'bg-highlight text-white' : 'text-text-secondary hover:bg-dark-hover'}`}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs">Alerts</span>
        </Link>
        <Link
          to="/dashboard/profile"
          className={`flex-1 p-3 text-center transition ${isActive('/dashboard/profile') ? 'bg-highlight text-white' : 'text-text-secondary hover:bg-dark-hover'}`}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto bg-dark-bg">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">Chats</h3>
          {chats.privateChats.map((chat) => {
            const isOnline = onlineUsers.has(chat.user._id);
            const isAIBot = chat.user.username === 'mizo' || chat.user.username === 'vivek_ai_assistant';

            return (
              <Link
                key={chat.chatId}
                to={`/dashboard/chat/${chat.chatId}`}
                className="flex items-center p-3 hover:bg-dark-hover rounded-lg mb-1 transition group"
              >
                <div className="relative">
                  <img
                    src={chat.user.image?.url}
                    alt={chat.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isAIBot && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-highlight to-pink-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 7H7v6h6V7z" />
                        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!isAIBot && isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-card"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-text-primary group-hover:text-highlight transition">
                      {chat.user.username}
                      {isAIBot && <span className="ml-2 text-xs text-highlight">AI</span>}
                    </h4>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{chat.user.bio || chat.user.email}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {chats.groupChats.length > 0 && (
          <div className="p-3 border-t border-gray-800">
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">Groups</h3>
            {chats.groupChats.map((chat) => (
              <Link
                key={chat.chatId}
                to={`/dashboard/chat/${chat.chatId}`}
                className="flex items-center p-3 hover:bg-dark-hover rounded-lg mb-1 transition group"
              >
                <img
                  src={chat.group.image?.url}
                  alt={chat.group.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3 flex-1">
                  <h4 className="font-semibold text-sm text-text-primary group-hover:text-highlight transition">{chat.group.name}</h4>
                  <p className="text-xs text-text-secondary">{chat.group.members?.length} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={fetchChats}
        />
      )}
    </div>
  );
};

export default Sidebar;
