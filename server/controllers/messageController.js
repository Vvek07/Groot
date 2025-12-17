const messageService = require('../services/messageService');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatType, recipientId, groupId } = req.body;

    // Create message using service
    const { message, chatId, recipient, group } = await messageService.createMessage({
      senderId: req.userId,
      content,
      chatType,
      recipientId,
      groupId
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(chatId).emit('receive-message', message);

    // AI Response check (async)
    messageService.processAIResponse(message, io);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    if (error.message === 'Content and chatType are required' || error.message.includes('required')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit, skip } = req.query;

    const messages = await messageService.getMessages(chatId, limit, skip);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username email image')
      // Populate groups with explicit paths to ensure we get what we need
      .populate({
        path: 'groups',
        select: 'name description image members',
        populate: { path: 'members', select: 'username image' }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privateChats = user.friends.map(friend => ({
      chatId: [req.userId, friend._id.toString()].sort().join('-'),
      type: 'private',
      user: friend
    }));

    const groupChats = user.groups.map(group => ({
      chatId: `group-${group._id}`,
      type: 'group',
      group: group
    }));

    res.json({ privateChats, groupChats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

