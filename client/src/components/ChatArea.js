import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCallModal from './VideoCallModal';

const ChatArea = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, joinChat, typingUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      fetchChatInfo();
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId && socket) {
      joinChat(chatId);
    }
  }, [chatId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        if (message.chatId === chatId) {
          // Prevent double rendering of own messages (handled optimistically)
          // We check if the sender is NOT the current user
          const currentUserId = user.id || user._id;
          if (message.sender._id !== currentUserId) {
            setMessages(prev => [...prev, message]);
          }
        }
      });
    }
  }, [socket, chatId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchChatInfo = async () => {
    try {
      const isGroupChat = chatId.startsWith('group-');
      if (isGroupChat) {
        // Handle Group Chat
        const groupId = chatId.replace('group-', '');
        const response = await axios.get(`/api/groups/${groupId}`);
        setChatInfo({ type: 'group', user: response.data }); // Using 'user' key to keep render logic simple, or we can refactor render
      } else {
        // Handle Private Chat
        const [userId1, userId2] = chatId.split('-');
        const currentUserId = user.id || user._id;
        const otherUserId = userId1 === currentUserId ? userId2 : userId1;
        const response = await axios.get(`/api/users/${otherUserId}`);
        setChatInfo({ type: 'private', user: response.data });
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const isGroupChat = chatId.startsWith('group-');
      const messageData = {
        content: newMessage,
        chatType: isGroupChat ? 'group' : 'private',
        chatId
      };

      if (isGroupChat) {
        messageData.groupId = chatId.replace('group-', '');
      } else {
        const [userId1, userId2] = chatId.split('-');
        const currentUserId = user.id || user._id;
        messageData.recipientId = userId1 === currentUserId ? userId2 : userId1;
      }

      const response = await axios.post('/api/messages', messageData);
      setNewMessage('');
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket?.emit('typing-start', { userId: user.id || user._id, chatId });

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing-stop', { userId: user.id || user._id, chatId });
    }, 1000);
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-highlight to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-text-primary mb-2">Select a chat to start messaging</h3>
          <p className="text-text-secondary">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  const isAIBot = chatInfo?.user?.username === 'mizo' || chatInfo?.user?.username === 'vivek_ai_assistant';

  return (
    <div className="flex-1 flex flex-col bg-dark-bg">
      <div className="bg-dark-card border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="mr-3 md:hidden text-text-secondary hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <img
            src={chatInfo?.type === 'group'
              ? (chatInfo?.user?.image?.url || 'https://via.placeholder.com/40')
              : (chatInfo?.user?.image?.url || 'https://via.placeholder.com/40')}
            alt="Chat"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-text-primary flex items-center">
              {chatInfo?.type === 'group' ? chatInfo?.user?.name : (chatInfo?.user?.username || 'Chat')}
              {isAIBot && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-highlight to-pink-500 text-white text-xs rounded-full">
                  AI Assistant
                </span>
              )}
            </h3>
            {typingUsers.size > 0 ? (
              <p className="text-xs text-highlight animate-pulse">typing...</p>
            ) : (
              chatInfo?.type === 'group'
                ? <p className="text-xs text-text-secondary">{chatInfo?.user?.members?.length || 0} members</p>
                : <p className="text-xs text-text-secondary">{chatInfo?.user?.bio || 'Online'}</p>
            )}
          </div>
        </div>

        {!chatId.startsWith('group-') && !isAIBot && (
          <button
            onClick={() => setShowVideoCall(true)}
            className="p-3 hover:bg-dark-hover rounded-full transition group"
            title="Video Call"
          >
            <svg className="w-6 h-6 text-text-secondary group-hover:text-highlight transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const currentUserId = user.id || user._id;
          const isOwn = message.sender._id === currentUserId;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender._id !== message.sender._id);

          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            >
              {!isOwn && showAvatar && (
                <img
                  src={message.sender.image?.url}
                  alt={message.sender.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              {!isOwn && !showAvatar && <div className="w-8"></div>}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${isOwn
                  ? 'bg-gradient-to-r from-highlight to-pink-500 text-white rounded-br-none'
                  : 'bg-dark-card text-text-primary rounded-bl-none border border-gray-800'
                  }`}
              >
                {message.chatType === 'group' && !isOwn && (
                  <p className="text-xs font-semibold mb-1 text-highlight">{message.sender.username}</p>
                )}
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-text-secondary'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-dark-card border-t border-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={isAIBot ? "Ask me anything..." : "Type a message..."}
            className="flex-1 px-4 py-3 bg-dark-bg border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary placeholder-text-secondary"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white p-3 rounded-full transition transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {showVideoCall && (
        <VideoCallModal
          recipientId={chatInfo?.user?._id}
          isIncoming={false}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default ChatArea;
