class SocketHandler {
    constructor(io) {
        this.io = io;
        this.onlineUsers = new Map();
        this.typingUsers = new Map();
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            this.handleUserOnline(socket);
            this.handleJoinChat(socket);
            this.handleTyping(socket);
            this.handleWebRTC(socket);
            this.handleDisconnect(socket);
        });
    }

    handleUserOnline(socket) {
        socket.on('user-online', (userId) => {
            this.onlineUsers.set(userId, socket.id);
            this.io.emit('user-status', { userId, status: 'online' });
        });
    }

    handleJoinChat(socket) {
        socket.on('join-chat', (chatId) => {
            socket.join(chatId);
        });
    }

    handleTyping(socket) {
        socket.on('typing-start', (data) => {
            this.typingUsers.set(data.userId, data.chatId);
            socket.to(data.chatId).emit('user-typing', { userId: data.userId, isTyping: true });
        });

        socket.on('typing-stop', (data) => {
            this.typingUsers.delete(data.userId);
            socket.to(data.chatId).emit('user-typing', { userId: data.userId, isTyping: false });
        });
    }

    handleWebRTC(socket) {
        // Call User
        socket.on('call-user', (data) => {
            const { userToCall, signalData, from, name } = data;
            // We need to find the socket ID of the user to call
            // The client 'userToCall' might be a UserID, not SocketID. 
            // We should use our onlineUsers map to find the socket ID.

            const socketId = this.onlineUsers.get(userToCall);
            if (socketId) {
                this.io.to(socketId).emit('call-user', {
                    signal: signalData,
                    from,
                    name
                });
            }
        });

        // Answer Call
        socket.on('answer-call', (data) => {
            // data.to is the UserID of the Caller
            const socketId = this.onlineUsers.get(data.to);
            if (socketId) {
                this.io.to(socketId).emit('call-accepted', data.signal);
            }
        });

        // End Call
        socket.on('end-call', (data) => {
            const socketId = this.onlineUsers.get(data.to);
            if (socketId) {
                this.io.to(socketId).emit('call-ended');
            }
        });
    }

    handleDisconnect(socket) {
        socket.on('disconnect', () => {
            let disconnectedUserId = null;
            for (let [userId, socketId] of this.onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    this.onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                this.io.emit('user-status', { userId: disconnectedUserId, status: 'offline' });
            }
            console.log('User disconnected:', socket.id);
        });
    }
}

module.exports = SocketHandler;
