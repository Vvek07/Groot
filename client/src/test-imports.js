// Test file to verify all imports work
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Peer from 'peerjs';

console.log('All imports successful!');
console.log('React:', React.version);
console.log('Axios:', typeof axios);
console.log('Socket.io:', typeof io);
console.log('PeerJS:', typeof Peer);

export default function TestImports() {
  return <div>All dependencies loaded successfully!</div>;
}
