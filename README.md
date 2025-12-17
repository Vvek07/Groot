# Groot1 - Advanced MERN Chat Application

This project is a real-time WhatsApp clone featuring video calling, AI assistance, and social groups.

## Project Structure

The project is divided into two main folders:

- **client/**: React frontend application.
- **server/**: Node.js/Express backend API and Socket.io server.

## Getting Started

### 1. Setup Backend (Server)

Navigate to the `server` directory and install dependencies (if not already installed).

```bash
cd server
npm install
```

Create a `.env` file in `server/` with the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 2. Setup Frontend (Client)

Navigate to the `client` directory:

```bash
cd ../client
npm install
npm start
```

The application will launch in your browser.

## Features

- **Real-time Messaging**: Instant text messaging using Socket.io.
- **Video Calling**: High-quality video calls with automated signaling (WebRTC).
- **AI Assistant**: Chat with "Mizo", an AI bot powered by DeepSeek/OpenRouter.
- **Group Chats**: Create and manage group conversations.
- **Social Discovery**: Global search to find and add friends.
