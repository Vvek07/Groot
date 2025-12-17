import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const VideoCallModal = ({ recipientId, isIncoming, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [peerId, setPeerId] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer();
    peerRef.current = newPeer;

    newPeer.on('open', (id) => {
      setPeerId(id);
      console.log('My peer ID:', id);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          if (isIncoming && recipientId) { // recipientId here is actually the Caller's Socket ID or User ID needed?
            // Wait, if Incoming, we need to send OUR ID to the Caller.
            // Caller is waiting for 'call-accepted'.
            setConnectionStatus('Connecting...');
            socket.emit('answer-call', { to: recipientId, signal: id });
          } else if (!isIncoming && recipientId) {
            // We are Caller. We emit 'call-user' to request call.
            // We wait for 'call-accepted' to get Callee's ID.
            setConnectionStatus('Calling...');
            socket.emit('call-user', { userToCall: recipientId, from: user.id || user._id });
          }
        })
        .catch((err) => {
          console.error('Failed to get media:', err);
          setConnectionStatus('Error: Camera Access Denied');
        });
    });

    newPeer.on('call', (call) => {
      // We are being called (this happens when Caller gets our ID and calls us)
      // Or if we are Caller, and Callee calls us back? (No, we stick to Caller Calls)

      // If we are Callee, we receive call here.
      // Wait, if I used the flow where Caller calls Callee:
      // Callee needs to answer.
      const stream = localStreamRef.current;
      if (stream) {
        call.answer(stream);
        setConnectionStatus('Connected');
        setCallActive(true);

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        callRef.current = call;
      }
    });

    // Socket Event: Call Accepted (Only Caller receives this)
    if (!isIncoming) {
      socket.on('call-accepted', (signal) => {
        // signal is Callee's Peer ID
        setConnectionStatus('Connecting to Peer...');
        const stream = localStreamRef.current;
        if (stream && peerRef.current) {
          const call = peerRef.current.call(signal, stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setConnectionStatus('Connected');
            setCallActive(true);
          });
          callRef.current = call;
        }
      });
    }

    // Socket Event: Call Ended (Both can receive)
    socket.on('call-ended', () => {
      endCall();
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (callRef.current) {
        callRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socket.off('call-accepted');
      socket.off('call-ended');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    // Notify other user
    if (recipientId) {
      socket.emit('end-call', { to: recipientId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
      <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            Video Call
          </h2>
          <div className="text-highlight font-mono text-sm">{connectionStatus}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg ring-1 ring-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-white text-xs font-medium">You</p>
            </div>
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg ring-1 ring-gray-800">
            {callActive ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-text-secondary animate-pulse">Waiting for answer...</div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full ${callActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <p className="text-white text-xs font-medium">Remote</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 ring-1 ring-red-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {audioEnabled ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
          </button>

          <button
            onClick={endCall}
            className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all duration-300 transform hover:scale-110"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 ring-1 ring-red-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;

