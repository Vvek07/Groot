const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getChats } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', auth, sendMessage);
router.get('/chats', auth, getChats);
router.get('/:chatId', auth, getMessages);

module.exports = router;
