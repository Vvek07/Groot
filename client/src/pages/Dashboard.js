import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import SearchPage from '../components/SearchPage';
import NotificationsPage from '../components/NotificationsPage';
import ProfilePage from '../components/ProfilePage';
import IncomingCall from '../components/IncomingCall';
import VideoCallModal from '../components/VideoCallModal';

const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [selectedChat, setSelectedChat] = useState(null);
  const { socket } = useSocket();
  const [incomingCall, setIncomingCall] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callData, setCallData] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('call-user', async (data) => {
        // data has { from, name, signal... }
        // Fetch user details for 'from' if name is missing or just to be safe
        try {
          const response = await axios.get(`/api/users/${data.from}`);
          setIncomingCall({ ...data, caller: response.data });
        } catch (err) {
          console.error('Error fetching caller details:', err);
          setIncomingCall({ ...data, caller: { username: 'Unknown' } });
        }
      });

      socket.on('call-ended', () => {
        setIncomingCall(null);
        setShowVideoCall(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('call-user');
        socket.off('call-ended');
      }
    }
  }, [socket]);

  const handleAcceptCall = () => {
    setCallData({
      recipientId: incomingCall.from,
      isIncoming: true
    });
    setShowVideoCall(true);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    socket.emit('end-call', { to: incomingCall.from });
    setIncomingCall(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Routes>
          <Route path="/" element={<ChatArea selectedChat={selectedChat} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:chatId" element={<ChatArea selectedChat={selectedChat} />} />
        </Routes>
      </div>

      {incomingCall && !showVideoCall && (
        <IncomingCall
          caller={incomingCall.caller}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {showVideoCall && (
        <VideoCallModal
          recipientId={callData?.recipientId}
          isIncoming={callData?.isIncoming}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

