const express = require('express');
const router = express.Router();
const {
  sendGroupRequest,
  respondToGroupRequest,
  getGroupRequests,
  getMyGroupRequests
} = require('../controllers/groupRequestController');
const auth = require('../middleware/auth');

router.post('/request', auth, sendGroupRequest);
router.post('/respond', auth, respondToGroupRequest);
router.get('/group/:groupId', auth, getGroupRequests);
router.get('/my-requests', auth, getMyGroupRequests);

module.exports = router;
