const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const socketIO = require('socket.io');
const aiService = require('./services/aiService');
const SocketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    credentials: true
  }
});

// Initialize Socket Handler
const socketHandler = new SocketHandler(io);
socketHandler.init();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    // Initialize AI Bot
    const aiBot = await aiService.getOrCreateBot();
    if (aiBot) {
      console.log('✓ AI Bot Ready:', aiBot.username);
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/group-requests', require('./routes/groupRequests'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/search', require('./routes/search'));

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

