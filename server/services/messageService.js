const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const aiService = require('./aiService');

class MessageService {
    async createMessage({ senderId, content, chatType, recipientId, groupId }) {
        if (!content || !chatType) {
            throw new Error('Content and chatType are required');
        }

        let chatId;
        let recipient, group;

        const messageData = {
            sender: senderId,
            content,
            chatType
        };

        if (chatType === 'private') {
            if (!recipientId) throw new Error('Recipient is required for private chat');

            messageData.recipient = recipientId;
            chatId = [senderId, recipientId].sort().join('-');

            recipient = await User.findById(recipientId);
        } else if (chatType === 'group') {
            if (!groupId) throw new Error('Group is required for group chat');

            group = await Group.findById(groupId);
            if (!group || !group.members.includes(senderId)) {
                throw new Error('Not a member of this group');
            }

            messageData.group = groupId;
            chatId = `group-${groupId}`;
        }

        messageData.chatId = chatId;

        const message = new Message(messageData);
        await message.save();

        // Populate for return
        await message.populate('sender', 'username email image');
        if (chatType === 'group') {
            await message.populate('group', 'name image');
        } else {
            await message.populate('recipient', 'username email image');
        }

        return { message, chatId, recipient, group };
    }

    async processAIResponse(message, io) {
        console.log(`🤖 Checking AI Response for chatType: ${message.chatType}`);

        if (message.chatType === 'private') {
            if (!message.recipient) {
                console.log('⚠️ Message has no recipient populated.');
                return;
            }

            const recipientName = message.recipient.username?.toLowerCase();
            console.log(`🤖 Recipient: ${recipientName}`);

            // Check if recipient is the bot
            if (recipientName && ['mizo', 'vivek_ai_assistant'].includes(recipientName)) {

                setTimeout(async () => {
                    try {
                        console.log('🤖 Bot processing message:', message.content);
                        const botReply = await aiService.getBotResponse(message.content);
                        console.log('🤖 Bot reply generated:', botReply);

                        const botMessage = new Message({
                            sender: message.recipient._id, // Bot is sender
                            recipient: message.sender._id, // Original sender is recipient
                            content: botReply,
                            chatType: 'private',
                            chatId: message.chatId
                        });

                        console.log('🤖 Saving bot message...');
                        await botMessage.save();
                        console.log('🤖 Bot message saved to DB. ID:', botMessage._id);

                        await botMessage.populate('sender', 'username email image');
                        await botMessage.populate('recipient', 'username email image');

                        console.log('🤖 Emitting bot message to chat:', message.chatId);
                        io.to(message.chatId).emit('receive-message', botMessage);
                    } catch (error) {
                        console.error('❌ Bot Processing Error:', error);
                    }
                }, 1000); // Small delay for "thinking" feel
            } else {
                console.log('Recipient is not a bot:', recipientName);
            }
        }
    }

    async getMessages(chatId, limit = 50, skip = 0) {
        const messages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('sender', 'username email image')
            .populate('recipient', 'username email image')
            .populate('group', 'name image');

        return messages.reverse();
    }
}

module.exports = new MessageService();
