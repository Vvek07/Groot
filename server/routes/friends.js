const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getSentRequests
} = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.post('/request', auth, sendFriendRequest);
router.post('/respond', auth, respondToFriendRequest);
router.get('/pending', auth, getPendingRequests);
router.get('/sent', auth, getSentRequests);

module.exports = router;
