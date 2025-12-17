import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('user-online', user.id || user._id);

      newSocket.on('user-status', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          if (status === 'online') {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      newSocket.on('user-typing', ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (isTyping) {
            updated.set(userId, true);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      return () => newSocket.close();
    }
  }, [user]);

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  };

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send-message', data);
    }
  };

  const startTyping = (chatId) => {
    if (socket && user) {
      socket.emit('typing-start', { userId: user.id || user._id, chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && user) {
      socket.emit('typing-stop', { userId: user.id || user._id, chatId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingUsers,
      joinChat,
      sendMessage,
      startTyping,
      stopTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};
