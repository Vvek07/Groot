import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

  // Mobile Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Handle Sidebar visibility based on Route and Screen Size
  useEffect(() => {
    const handleResizeAndRoute = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // On mobile, show sidebar only on root dashboard, hide on sub-pages (chat, etc)
        // EXCEPT if we specifically want to show it (e.g. maybe profile?) 
        // For now: Show sidebar on /dashboard, hide on /dashboard/chat/:id
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
          setIsSidebarOpen(true);
        } else {
          setIsSidebarOpen(false);
        }
      } else {
        // Desktop: Always open by default unless manually toggled (logic could be improved to persist user pref)
        setIsSidebarOpen(true);
      }
    };

    handleResizeAndRoute();
    window.addEventListener('resize', handleResizeAndRoute);
    return () => window.removeEventListener('resize', handleResizeAndRoute);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-dark-bg relative overflow-hidden">
      {/* Sidebar - Mobile: Full Screen Overlay or Slide / Desktop: Relative */}
      <div
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-80'} 
          fixed md:relative z-30 h-full transition-all duration-300 ease-in-out
          w-full md:w-auto border-r border-gray-800 bg-dark-card
        `}
      >
        <Sidebar isCollapsed={!isSidebarOpen && window.innerWidth >= 768} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative w-full">
        {/* Mobile Header for Sidebar Toggle (Only visible when sidebar is closed on mobile) */}
        {!isSidebarOpen && (
          <div className="md:hidden absolute top-4 left-4 z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-dark-card rounded-full text-white shadow-lg border border-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <div className="hidden md:flex flex-1 items-center justify-center bg-dark-bg text-text-secondary">
              Select a chat to start messaging
            </div>
          } />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:chatId" element={<ChatArea selectedChat={selectedChat} onMobileBack={() => setIsSidebarOpen(true)} />} />
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

